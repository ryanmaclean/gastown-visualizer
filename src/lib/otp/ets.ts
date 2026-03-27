// ETS — Erlang Term Storage in-browser
// Reactive Map-based storage with change subscriptions for React

export type EtsChangeCallback<V> = (table: string, key: string, value: V | undefined, op: 'insert' | 'delete') => void;

class EtsTable<V = any> {
  private data: Map<string, V> = new Map();
  private subscribers: Set<EtsChangeCallback<V>> = new Set();

  constructor(public readonly name: string) {}

  insert(key: string, value: V): void {
    this.data.set(key, value);
    this.notify(key, value, 'insert');
  }

  lookup(key: string): V | undefined {
    return this.data.get(key);
  }

  delete(key: string): boolean {
    const existed = this.data.delete(key);
    if (existed) this.notify(key, undefined, 'delete');
    return existed;
  }

  match(pattern: Partial<V> | ((value: V) => boolean)): [string, V][] {
    const results: [string, V][] = [];
    for (const [k, v] of this.data) {
      if (typeof pattern === 'function') {
        if (pattern(v)) results.push([k, v]);
      } else {
        let matches = true;
        for (const pk of Object.keys(pattern)) {
          if ((v as any)[pk] !== (pattern as any)[pk]) { matches = false; break; }
        }
        if (matches) results.push([k, v]);
      }
    }
    return results;
  }

  select(fn: (key: string, value: V) => boolean): [string, V][] {
    const results: [string, V][] = [];
    for (const [k, v] of this.data) {
      if (fn(k, v)) results.push([k, v]);
    }
    return results;
  }

  tab2list(): [string, V][] {
    return Array.from(this.data.entries());
  }

  size(): number {
    return this.data.size;
  }

  subscribe(callback: EtsChangeCallback<V>): () => void {
    this.subscribers.add(callback);
    return () => { this.subscribers.delete(callback); };
  }

  private notify(key: string, value: V | undefined, op: 'insert' | 'delete'): void {
    this.subscribers.forEach(cb => {
      try { cb(this.name, key, value, op); } catch (e) { console.error(`[ETS:${this.name}] subscriber error:`, e); }
    });
  }

  clear(): void {
    const keys = Array.from(this.data.keys());
    this.data.clear();
    keys.forEach(k => this.notify(k, undefined, 'delete'));
  }
}

// Global ETS Registry
class EtsRegistry {
  private tables: Map<string, EtsTable> = new Map();

  new<V = any>(name: string): EtsTable<V> {
    if (this.tables.has(name)) {
      return this.tables.get(name) as EtsTable<V>;
    }
    const table = new EtsTable<V>(name);
    this.tables.set(name, table);
    return table;
  }

  get<V = any>(name: string): EtsTable<V> | undefined {
    return this.tables.get(name) as EtsTable<V> | undefined;
  }

  delete(name: string): void {
    const table = this.tables.get(name);
    if (table) {
      table.clear();
      this.tables.delete(name);
    }
  }

  list(): string[] {
    return Array.from(this.tables.keys());
  }

  clear(): void {
    this.tables.forEach(t => t.clear());
    this.tables.clear();
  }
}

export const ets = new EtsRegistry();
export { EtsTable };
