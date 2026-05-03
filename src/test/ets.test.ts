import { describe, it, expect, beforeEach } from 'vitest';
import { ets } from '../lib/otp/ets';

describe('ETS', () => {
  beforeEach(() => ets.clear());

  it('creates and reuses tables idempotently', () => {
    const a = ets.new<{ v: number }>('t');
    const b = ets.new<{ v: number }>('t');
    expect(a).toBe(b);
  });

  it('insert / lookup / delete', () => {
    const t = ets.new<{ v: number }>('t');
    t.insert('k', { v: 1 });
    expect(t.lookup('k')).toEqual({ v: 1 });
    expect(t.delete('k')).toBe(true);
    expect(t.lookup('k')).toBeUndefined();
    expect(t.delete('k')).toBe(false);
  });

  it('match supports predicate and partial pattern', () => {
    const t = ets.new<{ status: string; n: number }>('t');
    t.insert('a', { status: 'idle', n: 1 });
    t.insert('b', { status: 'busy', n: 2 });
    t.insert('c', { status: 'idle', n: 3 });
    expect(t.match({ status: 'idle' }).map(([k]) => k).sort()).toEqual(['a', 'c']);
    expect(t.match((v) => v.n > 1).length).toBe(2);
  });

  it('subscribers receive insert and delete events', () => {
    const t = ets.new<number>('t');
    const events: string[] = [];
    const unsub = t.subscribe((_n, k, _v, op) => events.push(`${op}:${k}`));
    t.insert('x', 1);
    t.delete('x');
    unsub();
    t.insert('y', 2); // no event after unsubscribe
    expect(events).toEqual(['insert:x', 'delete:x']);
  });

  it('clear notifies for each existing key', () => {
    const t = ets.new<number>('t');
    t.insert('a', 1); t.insert('b', 2);
    let deletes = 0;
    t.subscribe((_n, _k, _v, op) => { if (op === 'delete') deletes++; });
    t.clear();
    expect(deletes).toBe(2);
    expect(t.size()).toBe(0);
  });
});
