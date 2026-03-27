// useEtsTable — subscribes to ETS table changes, returns reactive state

import { useState, useEffect, useCallback } from 'react';
import { ets } from '../lib/otp/ets';

export function useEtsTable<V = any>(tableName: string): [string, V][] {
  const [data, setData] = useState<[string, V][]>([]);

  useEffect(() => {
    const table = ets.get<V>(tableName);
    if (!table) {
      // Table might not exist yet, poll briefly
      const interval = setInterval(() => {
        const t = ets.get<V>(tableName);
        if (t) {
          setData(t.tab2list());
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }

    setData(table.tab2list());

    const unsub = table.subscribe(() => {
      setData(table.tab2list());
    });

    return unsub;
  }, [tableName]);

  return data;
}

export function useEtsLookup<V = any>(tableName: string, key: string | null): V | undefined {
  const [value, setValue] = useState<V | undefined>(undefined);

  useEffect(() => {
    if (!key) { setValue(undefined); return; }

    const table = ets.get<V>(tableName);
    if (table) {
      setValue(table.lookup(key));
      const unsub = table.subscribe((_t, k) => {
        if (k === key) setValue(table.lookup(key));
      });
      return unsub;
    }
  }, [tableName, key]);

  return value;
}
