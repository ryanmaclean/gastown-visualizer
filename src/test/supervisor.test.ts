import { describe, it, expect, beforeEach } from 'vitest';
import { Supervisor } from '../lib/otp/supervisor';
import { Actor } from '../lib/otp/actor';
import { Message } from '../lib/otp/types';
import { pubsub } from '../lib/otp/pubsub';

class Crasher extends Actor<{ n: number }, { type: string }> {
  protected init() { return { n: 0 }; }
  protected async handleCast(msg: Message<{ type: string }>) {
    if (msg.type === 'die') throw new Error('die');
    return this.state;
  }
}

const tick = (ms = 5) => new Promise(r => setTimeout(r, ms));

describe('Supervisor', () => {
  beforeEach(() => pubsub.clear());

  it('starts and tracks children', async () => {
    const sup = new Supervisor('s');
    await sup.start();
    await sup.startChild({ name: 'a', factory: () => new Crasher('a') });
    expect(sup.whichChildren().map(c => c.name)).toEqual(['a']);
    expect(sup.getChild('a')).toBeDefined();
    await sup.stop();
  });

  it('restarts a crashed child (one_for_one)', async () => {
    const sup = new Supervisor('s');
    await sup.start();
    const original = await sup.startChild({ name: 'a', factory: () => new Crasher('a') });
    original.cast('die', { type: 'die' });
    await tick(20);
    const after = sup.getChild('a');
    expect(after).toBeDefined();
    expect(after).not.toBe(original);
    expect(after!.status).toBe('running');
    await sup.stop();
  });

  it('terminateChild stops and removes the actor', async () => {
    const sup = new Supervisor('s');
    await sup.start();
    await sup.startChild({ name: 'a', factory: () => new Crasher('a') });
    await sup.terminateChild('a');
    expect(sup.getChild('a')).toBeUndefined();
    await sup.stop();
  });
});
