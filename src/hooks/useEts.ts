// useEtsTable — subscribes to ETS table changes, returns reactive state

import { useState, useEffect } from 'react';
import { ets } from '../lib/otp/ets';

export function useEtsTable<V = any>(tableName: string): [string, V][] {
  const [data, setData] = useState<[string, V][]>([]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;

    const subscribe = () => {
      const table = ets.get<V>(tableName);
      if (!table) return false;

      setData(table.tab2list());
      unsub = table.subscribe(() => {
        setData(table.tab2list());
      });
      return true;
    };

    if (!subscribe()) {
      // Table might not exist yet — poll until it does, then subscribe
      interval = setInterval(() => {
        if (subscribe() && interval) {
          clearInterval(interval);
          interval = undefined;
        }
      }, 200);
    }

    return () => {
      unsub?.();
      if (interval) clearInterval(interval);
    };
  }, [tableName]);

  return data;
}

export function useEtsLookup<V = any>(tableName: string, key: string | null): V | undefined {
  const [value, setValue] = useState<V | undefined>(undefined);

  useEffect(() => {
    if (!key) { setValue(undefined); return; }

    let unsub: (() => void) | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;

    const subscribe = () => {
      const table = ets.get<V>(tableName);
      if (!table) return false;

      setValue(table.lookup(key));
      unsub = table.subscribe((_t, k) => {
        if (k === key) setValue(table.lookup(key));
      });
      return true;
    };

    if (!subscribe()) {
      interval = setInterval(() => {
        if (subscribe() && interval) {
          clearInterval(interval);
          interval = undefined;
        }
      }, 200);
    }

    return () => {
      unsub?.();
      if (interval) clearInterval(interval);
    };
  }, [tableName, key]);

  return value;
}
