// PolecatActor — worker agent that processes beads via WebLLM scheduler

import { Actor } from '../lib/otp/actor';
import { Message } from '../lib/otp/types';
import { pubsub } from '../lib/otp/pubsub';
import { ets } from '../lib/otp/ets';
import { scheduler } from '../lib/webllm/scheduler';
import { Bead, PolecatState } from './types';

const POLECAT_NAMES = ['Rusty', 'Patches', 'Bandit', 'Whiskers', 'Shadow', 'Dusty', 'Copper', 'Grit'];
const POLECAT_AVATARS = ['🦝', '🦊', '🐺', '🦡', '🐻', '🦫', '🦨', '🐾'];

// Module-level counter — reset on HMR / fresh boot via resetPolecatIndex().
let polecatIndex = 0;
export function resetPolecatIndex() { polecatIndex = 0; }

type PolecatMsg =
  | { type: 'assign_bead'; beadId: string }
  | { type: 'abort_bead' }
  | { type: 'inference_token'; token: string }
  | { type: 'inference_complete'; output: string }
  | { type: 'inference_error'; error: string };

export class PolecatActor extends Actor<PolecatState, PolecatMsg> {
  private unsubscribers: Array<() => void> = [];
  private currentRequestId: string | null = null;

  constructor(name?: string) {
    const idx = polecatIndex++;
    super(name || POLECAT_NAMES[idx % POLECAT_NAMES.length]);
  }

  protected init(): PolecatState {
    const idx = polecatIndex - 1;
    const state: PolecatState = {
      pid: this.pid,
      name: this.name,
      avatar: POLECAT_AVATARS[idx % POLECAT_AVATARS.length],
      status: 'idle',
      currentBeadId: null,
      totalBeadsProcessed: 0,
      totalTokensGenerated: 0,
    };

    // Register in ETS
    const polecatsTable = ets.new<PolecatState>('polecats');
    polecatsTable.insert(this.pid, state);

    // Listen for reassignment from Mayor
    this.unsubscribers.push(
      pubsub.subscribe('mayor:reassign', (data: { beadId: string; toPid: string }) => {
        if (data.toPid === this.pid) {
          this.cast('assign_bead', { type: 'assign_bead', beadId: data.beadId } as any);
        }
      })
    );

    // Release ownership when refinery sends a bead back
    this.unsubscribers.push(
      pubsub.subscribe('bead:released', (data: { beadId: string; polecatPid: string }) => {
        if (data.polecatPid === this.pid && this.state.currentBeadId === data.beadId) {
          this.cast('abort_bead', { type: 'abort_bead' } as any);
        }
      })
    );

    // Scheduler stall timer fired — mark self + bead as stalled.
    this.unsubscribers.push(
      pubsub.subscribe('bead:stalled', (data: { beadId: string; polecatPid: string }) => {
        if (data.polecatPid === this.pid && this.state.currentBeadId === data.beadId) {
          this.cast('inference_error', { type: 'inference_error', error: 'stall_timeout' } as any);
        }
      })
    );

    pubsub.broadcast('polecat:status', { pid: this.pid, name: this.name, status: 'idle' });

    return state;
  }

  protected async handleCast(msg: Message<PolecatMsg>): Promise<PolecatState> {
    switch (msg.type) {
      case 'assign_bead':
        return this.startBead((msg.payload as any).beadId);
      case 'abort_bead':
        return this.abortCurrentBead();
      case 'inference_complete':
        return this.completeInference((msg.payload as any).output);
      case 'inference_error':
        return this.handleInferenceError((msg.payload as any).error);
      default:
        return this.state;
    }
  }

  private startBead(beadId: string): PolecatState {
    const beadsTable = ets.get<Bead>('beads');
    if (!beadsTable) return this.state;

    const bead = beadsTable.lookup(beadId);
    if (!bead) return this.state;

    // Update bead status
    beadsTable.insert(beadId, {
      ...bead,
      status: 'in_progress',
      assignedTo: this.pid,
      updatedAt: Date.now(),
    });

    const newState: PolecatState = {
      ...this.state,
      status: 'working',
      currentBeadId: beadId,
    };
    this.updateEts(newState);

    pubsub.broadcast('polecat:status', { pid: this.pid, name: this.name, status: 'working', beadId });

    // Submit to scheduler
    const startTime = performance.now();
    this.currentRequestId = scheduler.enqueue({
      beadId,
      polecatPid: this.pid,
      prompt: `You are a software engineer polecat named ${this.name}. Complete this task:\n\nTask: ${bead.title}\nDescription: ${bead.description}\n\nProvide a concise implementation plan and key code changes.`,
      priority: bead.escalated ? 'escalated' : 'normal',
      onToken: (token: string) => {
        // Update bead token stream in ETS
        const currentBead = beadsTable.lookup(beadId);
        if (currentBead) {
          const elapsed = (performance.now() - startTime) / 1000;
          const tokensGen = currentBead.tokensGenerated + 1;
          beadsTable.insert(beadId, {
            ...currentBead,
            tokenStream: currentBead.tokenStream + token,
            tokensGenerated: tokensGen,
            tokensPerSec: elapsed > 0 ? tokensGen / elapsed : 0,
            updatedAt: Date.now(),
          });
        }
      },
      onComplete: (output: string) => {
        this.cast('inference_complete', { type: 'inference_complete', output } as any);
      },
      onError: (error: Error) => {
        this.cast('inference_error', { type: 'inference_error', error: error.message } as any);
      },
    });

    return newState;
  }

  private completeInference(output: string): PolecatState {
    const beadsTable = ets.get<Bead>('beads');
    if (beadsTable && this.state.currentBeadId) {
      const bead = beadsTable.lookup(this.state.currentBeadId);
      if (bead) {
        beadsTable.insert(this.state.currentBeadId, {
          ...bead,
          status: 'refinery',
          tokenStream: output || bead.tokenStream,
          updatedAt: Date.now(),
        });
        pubsub.broadcast('bead:updated', { beadId: this.state.currentBeadId, status: 'refinery' });
      }
    }

    const newState: PolecatState = {
      ...this.state,
      status: 'idle',
      currentBeadId: null,
      totalBeadsProcessed: this.state.totalBeadsProcessed + 1,
    };
    this.updateEts(newState);
    pubsub.broadcast('polecat:status', { pid: this.pid, name: this.name, status: 'idle' });

    return newState;
  }

  private handleInferenceError(error: string): PolecatState {
    const beadsTable = ets.get<Bead>('beads');
    if (beadsTable && this.state.currentBeadId) {
      const bead = beadsTable.lookup(this.state.currentBeadId);
      if (bead) {
        beadsTable.insert(this.state.currentBeadId, {
          ...bead,
          status: 'stalled',
          updatedAt: Date.now(),
        });
      }
    }

    pubsub.broadcast('polecat:status', { pid: this.pid, name: this.name, status: 'stalled' });

    const newState: PolecatState = {
      ...this.state,
      status: 'stalled',
    };
    this.updateEts(newState);

    return newState;
  }

  private abortCurrentBead(): PolecatState {
    if (this.currentRequestId) {
      scheduler.cancelRequest(this.currentRequestId);
      this.currentRequestId = null;
    }

    const newState: PolecatState = {
      ...this.state,
      status: 'idle',
      currentBeadId: null,
    };
    this.updateEts(newState);
    return newState;
  }

  private updateEts(state: PolecatState): void {
    const table = ets.get<PolecatState>('polecats');
    if (table) table.insert(this.pid, state);
  }

  protected terminate(): void {
    this.unsubscribers.forEach(fn => fn());
    if (this.currentRequestId) {
      scheduler.cancelRequest(this.currentRequestId);
    }
  }
}
