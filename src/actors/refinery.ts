// RefineryActor — review gate, simulates code review pass/fail

import { Actor } from '../lib/otp/actor';
import { Message } from '../lib/otp/types';
import { pubsub } from '../lib/otp/pubsub';
import { ets } from '../lib/otp/ets';
import { Bead } from './types';

interface RefineryState {
  totalReviewed: number;
  totalPassed: number;
  totalFailed: number;
  reviewLog: Array<{ beadId: string; passed: boolean; timestamp: number }>;
}

type RefineryMsg =
  | { type: 'review_bead'; beadId: string };

export class RefineryActor extends Actor<RefineryState, RefineryMsg> {
  private unsubscribers: Array<() => void> = [];

  constructor() {
    super('refinery');
  }

  protected init(): RefineryState {
    // Listen for beads entering refinery
    this.unsubscribers.push(
      pubsub.subscribe('bead:updated', (data: { beadId: string; status: string }) => {
        if (data.status === 'refinery') {
          // Delay review to simulate processing
          setTimeout(() => {
            this.cast('review_bead', { type: 'review_bead', beadId: data.beadId } as any);
          }, 2000 + Math.random() * 3000);
        }
      })
    );

    return {
      totalReviewed: 0,
      totalPassed: 0,
      totalFailed: 0,
      reviewLog: [],
    };
  }

  protected async handleCast(msg: Message<RefineryMsg>): Promise<RefineryState> {
    if (msg.type === 'review_bead') {
      return this.reviewBead((msg.payload as any).beadId);
    }
    return this.state;
  }

  private reviewBead(beadId: string): RefineryState {
    const beadsTable = ets.get<Bead>('beads');
    if (!beadsTable) return this.state;

    const bead = beadsTable.lookup(beadId);
    if (!bead || bead.status !== 'refinery') return this.state;

    // 75% pass rate
    const passed = Math.random() > 0.25;

    if (passed) {
      beadsTable.insert(beadId, {
        ...bead,
        status: 'merged',
        updatedAt: Date.now(),
      });
      pubsub.broadcast('refinery:merge', { beadId, passed: true });
      pubsub.broadcast('bead:updated', { beadId, status: 'merged' });
    } else {
      // Send back for rework
      beadsTable.insert(beadId, {
        ...bead,
        status: 'backlog',
        assignedTo: null,
        tokenStream: '',
        tokensGenerated: 0,
        updatedAt: Date.now(),
      });
      pubsub.broadcast('refinery:merge', { beadId, passed: false });
      pubsub.broadcast('bead:updated', { beadId, status: 'backlog' });
      pubsub.broadcast('mayor:directive', { text: `Bead ${beadId} failed review — sent back to backlog`, timestamp: Date.now() });
    }

    const entry = { beadId, passed, timestamp: Date.now() };

    return {
      totalReviewed: this.state.totalReviewed + 1,
      totalPassed: this.state.totalPassed + (passed ? 1 : 0),
      totalFailed: this.state.totalFailed + (passed ? 0 : 1),
      reviewLog: [...this.state.reviewLog.slice(-49), entry],
    };
  }

  protected terminate(): void {
    this.unsubscribers.forEach(fn => fn());
  }
}
