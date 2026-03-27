// RigActor — project container managing beads and convoys

import { Actor } from '../lib/otp/actor';
import { Message } from '../lib/otp/types';
import { pubsub } from '../lib/otp/pubsub';
import { ets } from '../lib/otp/ets';
import { Bead, RigState, generateBeadId } from './types';

type RigMsg =
  | { type: 'create_bead'; title: string; description: string }
  | { type: 'create_convoy'; beadIds: string[]; name: string }
  | { type: 'remove_bead'; beadId: string };

export class RigActor extends Actor<RigState, RigMsg> {
  private rigId: string;

  constructor(name: string, rigId?: string) {
    super(name);
    this.rigId = rigId || `rig_${name.toLowerCase().replace(/\s/g, '_')}`;
  }

  protected init(): RigState {
    const state: RigState = {
      id: this.rigId,
      name: this.name,
      beadIds: [],
      convoys: [],
    };

    // Register in ETS
    const rigsTable = ets.new<RigState>('rigs');
    rigsTable.insert(this.rigId, state);

    return state;
  }

  protected async handleCast(msg: Message<RigMsg>): Promise<RigState> {
    switch (msg.type) {
      case 'create_bead':
        return this.createBead((msg.payload as any).title, (msg.payload as any).description);
      case 'create_convoy':
        return this.createConvoy((msg.payload as any).beadIds, (msg.payload as any).name);
      case 'remove_bead':
        return this.removeBead((msg.payload as any).beadId);
      default:
        return this.state;
    }
  }

  protected handleCall(msg: Message<RigMsg>): { reply: any; newState: RigState } {
    if (msg.type === 'create_bead') {
      const newState = this.createBead((msg.payload as any).title, (msg.payload as any).description);
      const lastBeadId = newState.beadIds[newState.beadIds.length - 1];
      return { reply: lastBeadId, newState };
    }
    return { reply: undefined, newState: this.state };
  }

  private createBead(title: string, description: string): RigState {
    const beadId = generateBeadId();
    const beadsTable = ets.new<Bead>('beads');

    const bead: Bead = {
      id: beadId,
      title,
      description,
      status: 'backlog',
      assignedTo: null,
      rigId: this.rigId,
      convoyId: null,
      tokenStream: '',
      tokensGenerated: 0,
      tokensPerSec: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      escalated: false,
    };

    beadsTable.insert(beadId, bead);

    const newState = {
      ...this.state,
      beadIds: [...this.state.beadIds, beadId],
    };

    // Update rig in ETS
    const rigsTable = ets.get<RigState>('rigs');
    if (rigsTable) rigsTable.insert(this.rigId, newState);

    pubsub.broadcast('bead:created', { beadId, rigId: this.rigId });

    return newState;
  }

  private createConvoy(beadIds: string[], name: string): RigState {
    const beadsTable = ets.get<Bead>('beads');
    if (beadsTable) {
      beadIds.forEach(id => {
        const bead = beadsTable.lookup(id);
        if (bead) {
          beadsTable.insert(id, { ...bead, convoyId: name, updatedAt: Date.now() });
        }
      });
    }

    const newState = {
      ...this.state,
      convoys: [...this.state.convoys, name],
    };

    const rigsTable = ets.get<RigState>('rigs');
    if (rigsTable) rigsTable.insert(this.rigId, newState);

    return newState;
  }

  private removeBead(beadId: string): RigState {
    const beadsTable = ets.get<Bead>('beads');
    if (beadsTable) beadsTable.delete(beadId);

    const newState = {
      ...this.state,
      beadIds: this.state.beadIds.filter(id => id !== beadId),
    };

    const rigsTable = ets.get<RigState>('rigs');
    if (rigsTable) rigsTable.insert(this.rigId, newState);

    return newState;
  }
}
