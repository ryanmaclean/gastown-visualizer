// LineageActor — emits OpenLineage RunEvents in response to bead transitions.
// Headless: writes into ETS tables `lineage_events` and `lineage_runs`.

import { Actor } from '../lib/otp/actor';
import { Message } from '../lib/otp/types';
import { ets } from '../lib/otp/ets';
import { pubsub } from '../lib/otp/pubsub';
import {
  RunEvent,
  RunEventType,
  buildRunEvent,
  facet,
  newRunId,
  mergeFacets,
  maybeEmit,
  Facet,
} from '../lib/lineage/openlineage';
import { Bead, BeadStatus, PolecatState } from './types';

const MAX_EVENTS = 500;
const RUNNING_TOKEN_INTERVAL = 25; // emit RUNNING every N tokens

interface RunRecord {
  runId: string;
  jobName: string;
  beadId: string;
  startedAt: number;
  lastEventAt: number;
  attempt: number;
  status: 'open' | 'closed';
  lastStatus: BeadStatus;
  lastEmittedTokenCount: number;
  facets: Record<string, Facet>;
}

interface StoredEvent {
  key: string;
  beadId: string;
  runId: string;
  seq: number;
  event: RunEvent;
}

let _seq = 0;

export class LineageActor extends Actor<{}, never> {
  private unsubscribers: Array<() => void> = [];
  private lastBeadSnapshot = new Map<string, Bead>();
  // attempt count is keyed by beadId across runs
  private attemptByBead = new Map<string, number>();

  constructor() {
    super('lineage');
  }

  protected init(): {} {
    ets.new<StoredEvent>('lineage_events');
    ets.new<RunRecord>('lineage_runs');

    // Watch the beads table directly to detect every transition + token progress.
    const beads = ets.get<Bead>('beads');
    if (beads) {
      // Seed snapshot from any beads already present.
      beads.tab2list().forEach(([k, v]) => this.lastBeadSnapshot.set(k, v));
      const unsub = beads.subscribe((_t, key, value, op) => {
        if (op === 'delete' || !value) {
          this.lastBeadSnapshot.delete(key);
          return;
        }
        this.onBeadChange(value);
        this.lastBeadSnapshot.set(key, value);
      });
      this.unsubscribers.push(unsub);
    }

    // refinery:merge gives us pass/fail nuance for the review facet.
    this.unsubscribers.push(
      pubsub.subscribe('refinery:merge', (data: { beadId: string; passed: boolean }) => {
        this.annotateReview(data.beadId, data.passed);
      }),
    );

    return {};
  }

  protected async handleCast(_msg: Message<never>): Promise<{}> {
    return this.state;
  }

  // ─────────────────────────────────────────────

  private onBeadChange(next: Bead): void {
    const prev = this.lastBeadSnapshot.get(next.id);
    const prevStatus = prev?.status;
    const nextStatus = next.status;

    // 1) Status transitions
    if (prevStatus !== nextStatus) {
      this.handleTransition(prev, next);
    }

    // 2) Token streaming RUNNING events while in_progress
    if (nextStatus === 'in_progress' && prev && prev.status === 'in_progress') {
      const run = this.getOpenRun(next.id);
      if (run) {
        const delta = next.tokensGenerated - run.lastEmittedTokenCount;
        if (delta >= RUNNING_TOKEN_INTERVAL) {
          run.lastEmittedTokenCount = next.tokensGenerated;
          this.emit('RUNNING', run, next, {
            gastown_inference: facet({
              tokensGenerated: next.tokensGenerated,
              tokensPerSec: Number(next.tokensPerSec.toFixed(2)),
              priority: next.escalated ? 'escalated' : 'normal',
            }),
          });
        }
      }
    }
  }

  private handleTransition(prev: Bead | undefined, next: Bead): void {
    const from = prev?.status;
    const to = next.status;
    const dwellMs = prev ? Date.now() - prev.updatedAt : 0;
    const transitionFacet = facet({ from: from || 'new', to, dwellMs });

    // backlog → in_progress: open a new run
    if (to === 'in_progress' && from !== 'in_progress') {
      const attempt = (this.attemptByBead.get(next.id) || 0) + 1;
      this.attemptByBead.set(next.id, attempt);
      const run = this.openRun(next, attempt);
      const polecat = next.assignedTo
        ? ets.get<PolecatState>('polecats')?.lookup(next.assignedTo)
        : undefined;
      this.emit('START', run, next, {
        gastown_bead: facet({
          id: next.id,
          title: next.title,
          rigId: next.rigId,
          convoyId: next.convoyId,
          escalated: next.escalated,
        }),
        gastown_polecat: polecat
          ? facet({ pid: polecat.pid, name: polecat.name, avatar: polecat.avatar })
          : facet({ pid: next.assignedTo }),
        gastown_lane_transition: transitionFacet,
        gastown_attempt: facet({ attempt }),
      });
      return;
    }

    // in_progress → refinery (handoff to review)
    if (from === 'in_progress' && to === 'refinery') {
      const run = this.getOpenRun(next.id);
      if (run) {
        this.emit('OTHER', run, next, {
          gastown_lane_transition: transitionFacet,
          gastown_inference: facet({
            tokensGenerated: next.tokensGenerated,
            tokensPerSec: Number(next.tokensPerSec.toFixed(2)),
          }),
        });
      }
      return;
    }

    // refinery → merged (run COMPLETE)
    if (from === 'refinery' && to === 'merged') {
      const run = this.getOpenRun(next.id);
      if (run) {
        this.emit('COMPLETE', run, next, { gastown_lane_transition: transitionFacet });
        this.closeRun(run);
      }
      return;
    }

    // refinery → backlog (review rejected; run FAIL)
    if (from === 'refinery' && to === 'backlog') {
      const run = this.getOpenRun(next.id);
      if (run) {
        this.emit('FAIL', run, next, {
          gastown_lane_transition: transitionFacet,
          gastown_review: facet({ passed: false }),
          errorMessage: facet({ message: 'Refinery rejected — sent back to backlog' }),
        });
        this.closeRun(run);
      }
      return;
    }

    // in_progress → stalled (FAIL, keep run open until aborted/retried)
    if (from === 'in_progress' && to === 'stalled') {
      const run = this.getOpenRun(next.id);
      if (run) {
        this.emit('FAIL', run, next, {
          gastown_lane_transition: transitionFacet,
          errorMessage: facet({ message: 'Polecat stalled' }),
        });
        this.closeRun(run);
      }
      return;
    }

    // in_progress → backlog (abort)
    if (from === 'in_progress' && to === 'backlog') {
      const run = this.getOpenRun(next.id);
      if (run) {
        this.emit('ABORT', run, next, { gastown_lane_transition: transitionFacet });
        this.closeRun(run);
      }
      return;
    }
  }

  private annotateReview(beadId: string, passed: boolean): void {
    const run = this.getOpenRun(beadId) || this.getLatestRun(beadId);
    if (!run) return;
    run.facets = mergeFacets(run.facets, { gastown_review: facet({ passed }) });
    this.persistRun(run);
  }

  // ── run lifecycle ──

  private openRun(bead: Bead, attempt: number): RunRecord {
    const runId = newRunId();
    const record: RunRecord = {
      runId,
      jobName: `${bead.rigId}.${bead.id}`,
      beadId: bead.id,
      startedAt: Date.now(),
      lastEventAt: Date.now(),
      attempt,
      status: 'open',
      lastStatus: bead.status,
      lastEmittedTokenCount: 0,
      facets: {},
    };
    this.persistRun(record);
    return record;
  }

  private closeRun(run: RunRecord): void {
    run.status = 'closed';
    this.persistRun(run);
  }

  private getOpenRun(beadId: string): RunRecord | undefined {
    const table = ets.get<RunRecord>('lineage_runs');
    if (!table) return;
    const matches = table.match((r) => r.beadId === beadId && r.status === 'open');
    if (matches.length === 0) return;
    // most recent open
    matches.sort((a, b) => b[1].startedAt - a[1].startedAt);
    return matches[0][1];
  }

  private getLatestRun(beadId: string): RunRecord | undefined {
    const table = ets.get<RunRecord>('lineage_runs');
    if (!table) return;
    const matches = table.match((r) => r.beadId === beadId);
    if (matches.length === 0) return;
    matches.sort((a, b) => b[1].startedAt - a[1].startedAt);
    return matches[0][1];
  }

  private persistRun(run: RunRecord): void {
    const table = ets.get<RunRecord>('lineage_runs');
    if (table) table.insert(run.runId, run);
  }

  // ── emit ──

  private emit(
    eventType: RunEventType,
    run: RunRecord,
    bead: Bead,
    extraFacets: Record<string, Facet>,
  ): void {
    run.facets = mergeFacets(run.facets, extraFacets);
    run.lastEventAt = Date.now();
    run.lastStatus = bead.status;
    this.persistRun(run);

    const event = buildRunEvent({
      eventType,
      runId: run.runId,
      jobName: run.jobName,
      runFacets: run.facets,
      jobFacets: {
        documentation: facet({ description: bead.description || bead.title }),
      },
      inputs: [
        {
          namespace: 'gastown',
          name: `prompt:${bead.id}`,
          facets: {
            sourceCode: facet({ language: 'text', sourceCode: bead.description }),
          },
        },
      ],
      outputs: bead.tokenStream
        ? [
            {
              namespace: 'gastown',
              name: `tokens:${bead.id}`,
              facets: {
                schema: facet({ fields: [{ name: 'tokens', type: 'string' }] }),
                stats: facet({
                  tokensGenerated: bead.tokensGenerated,
                  tokensPerSec: Number(bead.tokensPerSec.toFixed(2)),
                }),
              },
            },
          ]
        : undefined,
    });

    const seq = ++_seq;
    const key = `${run.runId}:${String(seq).padStart(6, '0')}`;
    const stored: StoredEvent = { key, beadId: bead.id, runId: run.runId, seq, event };

    const eventsTable = ets.get<StoredEvent>('lineage_events');
    if (eventsTable) {
      eventsTable.insert(key, stored);
      // bounded ring — prune oldest
      const size = eventsTable.size();
      if (size > MAX_EVENTS) {
        const all = eventsTable.tab2list();
        all.sort((a, b) => a[1].seq - b[1].seq);
        const toDrop = size - MAX_EVENTS;
        for (let i = 0; i < toDrop; i++) eventsTable.delete(all[i][0]);
      }
    }

    void maybeEmit(event);
  }

  protected terminate(): void {
    this.unsubscribers.forEach((fn) => fn());
    this.unsubscribers = [];
  }
}

export type { StoredEvent, RunRecord };
