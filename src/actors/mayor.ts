// MayorActor — oversees Gas Town, handles escalations, reassigns beads

import { Actor } from '../lib/otp/actor';
import { Message } from '../lib/otp/types';
import { pubsub } from '../lib/otp/pubsub';
import { ets } from '../lib/otp/ets';
import { EscalationEvent, generateEscalationId, Bead, PolecatState } from './types';

interface MayorState {
  escalationQueue: EscalationEvent[];
  directivesLog: string[];
  scanInterval: ReturnType<typeof setInterval> | null;
}

type MayorMsg =
  | { type: 'escalation'; beadId: string; polecatPid: string }
  | { type: 'directive'; text: string }
  | { type: 'scan' };

export class MayorActor extends Actor<MayorState, MayorMsg> {
  private unsubscribers: Array<() => void> = [];

  constructor() {
    super('mayor');
  }

  protected init(): MayorState {
    // Subscribe to escalation events
    this.unsubscribers.push(
      pubsub.subscribe('escalation', (data: { type: string; beadId: string; polecatPid: string }) => {
        this.cast('escalation', { type: 'escalation', beadId: data.beadId, polecatPid: data.polecatPid } as any);
      })
    );

    // Periodic scan for stalled beads
    const scanInterval = setInterval(() => {
      this.cast('scan', { type: 'scan' } as any);
    }, 10000);

    this.addDirective('Mayor online. Monitoring all rigs.');

    return {
      escalationQueue: [],
      directivesLog: ['Mayor online. Monitoring all rigs.'],
      scanInterval,
    };
  }

  protected async handleCast(msg: Message<MayorMsg>): Promise<MayorState> {
    switch (msg.type) {
      case 'escalation':
        return this.handleEscalation(msg.payload as any);
      case 'scan':
        return this.scanForStalled();
      case 'directive':
        return this.addDirectiveToState((msg.payload as any).text);
      default:
        return this.state;
    }
  }

  private handleEscalation(data: { beadId: string; polecatPid: string }): MayorState {
    const beadsTable = ets.get<Bead>('beads');
    const polecatsTable = ets.get<PolecatState>('polecats');

    if (!beadsTable || !polecatsTable) return this.state;

    const bead = beadsTable.lookup(data.beadId);
    if (!bead) return this.state;

    // Find least-loaded idle polecat
    const polecats = polecatsTable.tab2list();
    const idlePolecat = polecats
      .filter(([, p]) => p.status === 'idle' && p.pid !== data.polecatPid)
      .sort(([, a], [, b]) => a.totalBeadsProcessed - b.totalBeadsProcessed)[0];

    const escalation: EscalationEvent = {
      id: generateEscalationId(),
      type: 'stall',
      beadId: data.beadId,
      fromPolecatPid: data.polecatPid,
      toPolecatPid: idlePolecat ? idlePolecat[1].pid : null,
      timestamp: Date.now(),
      resolved: !!idlePolecat,
    };

    // Update bead
    beadsTable.insert(data.beadId, {
      ...bead,
      escalated: true,
      assignedTo: idlePolecat ? idlePolecat[1].pid : bead.assignedTo,
      updatedAt: Date.now(),
    });

    const directive = idlePolecat
      ? `Reassigned bead ${data.beadId} from ${data.polecatPid} to ${idlePolecat[1].name}`
      : `Escalation for bead ${data.beadId} — no idle polecats available`;

    this.addDirective(directive);

    if (idlePolecat) {
      pubsub.broadcast('mayor:reassign', {
        beadId: data.beadId,
        toPid: idlePolecat[1].pid,
      });
    }

    // Store escalation in ETS
    const escalationsTable = ets.new<EscalationEvent>('escalations');
    escalationsTable.insert(escalation.id, escalation);

    return {
      ...this.state,
      escalationQueue: [...this.state.escalationQueue, escalation],
      directivesLog: [...this.state.directivesLog, directive],
    };
  }

  private scanForStalled(): MayorState {
    const beadsTable = ets.get<Bead>('beads');
    if (!beadsTable) return this.state;

    const stalledBeads = beadsTable.match((b: Bead) => b.status === 'stalled');
    for (const [, bead] of stalledBeads) {
      if (!bead.escalated) {
        this.handleEscalation({ beadId: bead.id, polecatPid: bead.assignedTo || '' });
      }
    }

    return this.state;
  }

  private addDirectiveToState(text: string): MayorState {
    this.addDirective(text);
    return {
      ...this.state,
      directivesLog: [...this.state.directivesLog, text],
    };
  }

  private addDirective(text: string): void {
    pubsub.broadcast('mayor:directive', { text, timestamp: Date.now() });
  }

  protected terminate(): void {
    if (this.state?.scanInterval) clearInterval(this.state.scanInterval);
    this.unsubscribers.forEach(fn => fn());
  }
}
