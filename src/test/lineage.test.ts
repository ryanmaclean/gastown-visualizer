// Lineage actor — emits OpenLineage events as beads transition.

import { describe, it, expect, beforeEach } from 'vitest';
import { LineageActor, StoredEvent, RunRecord } from '../actors/lineage';
import { ets } from '../lib/otp/ets';
import { pubsub } from '../lib/otp/pubsub';
import type { Bead } from '../actors/types';

const tick = () => new Promise(r => setTimeout(r, 10));

function seedBead(overrides: Partial<Bead> = {}): Bead {
  return {
    id: 'gt-00001',
    title: 'Test bead',
    description: 'desc',
    status: 'backlog',
    assignedTo: null,
    rigId: 'rig_alpha',
    convoyId: null,
    tokenStream: '',
    tokensGenerated: 0,
    tokensPerSec: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    escalated: false,
    ...overrides,
  };
}

function eventsFor(beadId: string): StoredEvent[] {
  return ets.get<StoredEvent>('lineage_events')!
    .tab2list()
    .map(([, v]) => v)
    .filter(e => e.beadId === beadId)
    .sort((a, b) => a.seq - b.seq);
}

describe('LineageActor', () => {
  beforeEach(() => { ets.clear(); pubsub.clear(); });

  it('emits START on backlog → in_progress', async () => {
    ets.new<Bead>('beads');
    ets.new('polecats');
    const actor = new LineageActor();
    await actor.start();

    const beads = ets.get<Bead>('beads')!;
    const bead = seedBead();
    beads.insert(bead.id, bead);
    await tick();

    beads.insert(bead.id, { ...bead, status: 'in_progress', assignedTo: 'pid_1', updatedAt: Date.now() });
    await tick();

    const evs = eventsFor(bead.id);
    expect(evs).toHaveLength(1);
    expect(evs[0].event.eventType).toBe('START');
    expect(evs[0].event.run.facets?.gastown_attempt?.attempt).toBe(1);
  });

  it('emits START → OTHER → COMPLETE for full success path', async () => {
    ets.new<Bead>('beads');
    ets.new('polecats');
    const actor = new LineageActor();
    await actor.start();

    const beads = ets.get<Bead>('beads')!;
    const b0 = seedBead();
    beads.insert(b0.id, b0);
    await tick();

    beads.insert(b0.id, { ...b0, status: 'in_progress', assignedTo: 'pid_1', updatedAt: Date.now() });
    await tick();

    const b1 = { ...beads.lookup(b0.id)!, status: 'refinery' as const, tokensGenerated: 42, tokensPerSec: 10, updatedAt: Date.now() };
    beads.insert(b0.id, b1);
    await tick();

    const b2 = { ...beads.lookup(b0.id)!, status: 'merged' as const, updatedAt: Date.now() };
    beads.insert(b0.id, b2);
    await tick();

    const evs = eventsFor(b0.id);
    const types = evs.map(e => e.event.eventType);
    expect(types).toEqual(['START', 'OTHER', 'COMPLETE']);

    // timestamps monotonic
    const times = evs.map(e => new Date(e.event.eventTime).getTime());
    for (let i = 1; i < times.length; i++) expect(times[i]).toBeGreaterThanOrEqual(times[i - 1]);

    // run closed
    const runs = ets.get<RunRecord>('lineage_runs')!.tab2list().map(([, v]) => v);
    expect(runs).toHaveLength(1);
    expect(runs[0].status).toBe('closed');
  });

  it('refinery rejection emits FAIL and a new START with incremented attempt', async () => {
    ets.new<Bead>('beads');
    ets.new('polecats');
    const actor = new LineageActor();
    await actor.start();

    const beads = ets.get<Bead>('beads')!;
    const b = seedBead();
    beads.insert(b.id, b);
    await tick();

    // Attempt 1: backlog → in_progress → refinery → backlog (reject)
    beads.insert(b.id, { ...b, status: 'in_progress', assignedTo: 'pid_1', updatedAt: Date.now() });
    await tick();
    beads.insert(b.id, { ...beads.lookup(b.id)!, status: 'refinery', updatedAt: Date.now() });
    await tick();
    beads.insert(b.id, { ...beads.lookup(b.id)!, status: 'backlog', assignedTo: null, updatedAt: Date.now() });
    await tick();

    // Attempt 2: backlog → in_progress
    beads.insert(b.id, { ...beads.lookup(b.id)!, status: 'in_progress', assignedTo: 'pid_2', updatedAt: Date.now() });
    await tick();

    const evs = eventsFor(b.id);
    const types = evs.map(e => e.event.eventType);
    expect(types).toEqual(['START', 'OTHER', 'FAIL', 'START']);

    const lastStart = evs[3];
    expect(lastStart.event.run.facets?.gastown_attempt?.attempt).toBe(2);

    // Two distinct runs
    const runIds = new Set(evs.map(e => e.runId));
    expect(runIds.size).toBe(2);
  });
});
