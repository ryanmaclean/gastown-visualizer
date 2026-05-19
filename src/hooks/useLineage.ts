// useBeadLineage — subscribe to lineage events for a single bead.

import { useMemo } from 'react';
import { useEtsTable } from './useEts';
import type { StoredEvent, RunRecord } from '../actors/lineage';

export function useBeadLineage(beadId: string | null | undefined): {
  events: StoredEvent[];
  runs: RunRecord[];
  currentRun: RunRecord | undefined;
} {
  const allEvents = useEtsTable<StoredEvent>('lineage_events');
  const allRuns = useEtsTable<RunRecord>('lineage_runs');

  return useMemo(() => {
    if (!beadId) return { events: [], runs: [], currentRun: undefined };
    const events = allEvents
      .filter(([, e]) => e.beadId === beadId)
      .map(([, e]) => e)
      .sort((a, b) => a.seq - b.seq);
    const runs = allRuns
      .filter(([, r]) => r.beadId === beadId)
      .map(([, r]) => r)
      .sort((a, b) => b.startedAt - a.startedAt);
    const currentRun = runs.find((r) => r.status === 'open') || runs[0];
    return { events, runs, currentRun };
  }, [allEvents, allRuns, beadId]);
}
