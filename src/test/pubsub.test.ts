import { describe, it, expect, beforeEach } from 'vitest';
import { pubsub } from '../lib/otp/pubsub';

describe('PubSub', () => {
  beforeEach(() => pubsub.clear());

  it('delivers messages to direct subscribers', () => {
    const got: number[] = [];
    pubsub.subscribe<number>('topic', (m) => got.push(m));
    pubsub.broadcast('topic', 1);
    pubsub.broadcast('topic', 2);
    expect(got).toEqual([1, 2]);
  });

  it('supports wildcard "ns:*" subscribers', () => {
    const got: any[] = [];
    pubsub.subscribe('bead:*', (m) => got.push(m));
    pubsub.broadcast('bead:created', { id: 'a' });
    pubsub.broadcast('bead:updated', { id: 'b' });
    pubsub.broadcast('other:event', { id: 'c' });
    expect(got).toEqual([{ id: 'a' }, { id: 'b' }]);
  });

  it('unsubscribe stops delivery and cleans up empty topics', () => {
    const unsub = pubsub.subscribe('t', () => {});
    expect(pubsub.getTopics()).toContain('t');
    unsub();
    expect(pubsub.getTopics()).not.toContain('t');
  });

  it('isolates errors in one subscriber from others', () => {
    const got: string[] = [];
    pubsub.subscribe('t', () => { throw new Error('boom'); });
    pubsub.subscribe('t', (m: string) => got.push(m));
    expect(() => pubsub.broadcast('t', 'ok')).not.toThrow();
    expect(got).toEqual(['ok']);
  });
});
