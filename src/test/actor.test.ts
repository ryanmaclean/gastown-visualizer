import { describe, it, expect } from 'vitest';
import { Actor } from '../lib/otp/actor';
import { Message } from '../lib/otp/types';

class Counter extends Actor<{ n: number }, { type: string }> {
  protected init() { return { n: 0 }; }
  protected async handleCast(msg: Message<{ type: string }>) {
    if (msg.type === 'inc') return { n: this.state.n + 1 };
    if (msg.type === 'crash') throw new Error('boom');
    return this.state;
  }
  protected handleCall(msg: Message<{ type: string }>) {
    if (msg.type === 'get') return { reply: this.state.n, newState: this.state };
    return { reply: undefined, newState: this.state };
  }
}

const tick = () => new Promise(r => setTimeout(r, 0));

describe('Actor', () => {
  it('processes casts FIFO and tracks state', async () => {
    const a = new Counter('c');
    await a.start();
    a.cast('inc', { type: 'inc' });
    a.cast('inc', { type: 'inc' });
    a.cast('inc', { type: 'inc' });
    await tick();
    expect(a.getState().n).toBe(3);
  });

  it('call returns a reply', async () => {
    const a = new Counter('c');
    await a.start();
    a.cast('inc', { type: 'inc' });
    const n = await a.call('get', { type: 'get' });
    expect(n).toBe(1);
  });

  it('moves to crashed state when handleCast throws', async () => {
    const a = new Counter('c');
    await a.start();
    a.cast('crash', { type: 'crash' });
    await tick();
    expect(a.status).toBe('crashed');
  });

  it('rejects messages after stop', async () => {
    const a = new Counter('c');
    await a.start();
    await a.stop();
    a.cast('inc', { type: 'inc' });
    await tick();
    expect(a.getState().n).toBe(0);
  });
});
