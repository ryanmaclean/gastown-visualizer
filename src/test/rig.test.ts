import { describe, it, expect, beforeEach } from 'vitest';
import { RigActor } from '../actors/rig';
import { ets } from '../lib/otp/ets';
import { pubsub } from '../lib/otp/pubsub';
import type { Bead, RigState } from '../actors/types';

const tick = () => new Promise(r => setTimeout(r, 5));

describe('RigActor', () => {
  beforeEach(() => { ets.clear(); pubsub.clear(); });

  it('creates a backlog bead and registers it in ETS', async () => {
    const rig = new RigActor('Alpha');
    await rig.start();

    rig.cast('create_bead', { type: 'create_bead', title: 'T', description: 'D' } as any);
    await tick();

    const beads = ets.get<Bead>('beads')!;
    expect(beads.size()).toBe(1);
    const [, bead] = beads.tab2list()[0];
    expect(bead.status).toBe('backlog');
    expect(bead.title).toBe('T');
    expect(bead.assignedTo).toBeNull();

    const rigsTable = ets.get<RigState>('rigs')!;
    const r = rigsTable.lookup('rig_alpha')!;
    expect(r.beadIds.length).toBe(1);
  });

  it('remove_bead deletes from ETS and rig state', async () => {
    const rig = new RigActor('Alpha');
    await rig.start();
    rig.cast('create_bead', { type: 'create_bead', title: 'T', description: 'D' } as any);
    await tick();
    const beads = ets.get<Bead>('beads')!;
    const [id] = beads.tab2list()[0];

    rig.cast('remove_bead', { type: 'remove_bead', beadId: id } as any);
    await tick();
    expect(beads.size()).toBe(0);
    expect(ets.get<RigState>('rigs')!.lookup('rig_alpha')!.beadIds).toHaveLength(0);
  });

  it('broadcasts bead:created on PubSub', async () => {
    const rig = new RigActor('Alpha');
    await rig.start();
    const events: any[] = [];
    pubsub.subscribe('bead:created', (e) => events.push(e));
    rig.cast('create_bead', { type: 'create_bead', title: 'T', description: 'D' } as any);
    await tick();
    expect(events).toHaveLength(1);
    expect(events[0].rigId).toBe('rig_alpha');
  });
});
