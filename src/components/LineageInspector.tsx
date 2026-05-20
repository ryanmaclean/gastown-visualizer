// LineageInspector — recent OpenLineage batch attempts, sizes, timing, and errors.

import React, { useEffect, useState } from 'react';
import {
  getLineageInspector,
  subscribeLineageInspector,
  type LineageBatchAttempt,
} from '../lib/lineage/openlineage';

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 1000) return `${diff}ms`;
  if (diff < 60_000) return `${(diff / 1000).toFixed(1)}s`;
  return `${Math.floor(diff / 60_000)}m`;
}

function statusGlyph(rec: LineageBatchAttempt): { glyph: string; cls: string } {
  if (rec.ok === null) return { glyph: '◌', cls: 'text-terminal-amber animate-pulse' };
  if (rec.ok) return { glyph: '✓', cls: 'text-terminal-cyan' };
  return { glyph: '✗', cls: 'text-destructive' };
}

export function LineageInspector() {
  const [records, setRecords] = useState<LineageBatchAttempt[]>(() => getLineageInspector());

  useEffect(() => subscribeLineageInspector(setRecords), []);

  const totalEvents = records.reduce((acc, r) => acc + r.size, 0);
  const failed = records.filter((r) => r.ok === false).length;
  const inFlight = records.filter((r) => r.ok === null).length;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Lineage
        </span>
        <span className="text-[10px] text-muted-foreground font-mono ml-auto">
          {records.length} batches · {totalEvents} ev
          {failed > 0 && <span className="text-destructive"> · {failed} fail</span>}
          {inFlight > 0 && <span className="text-terminal-amber"> · {inFlight} pending</span>}
        </span>
      </div>

      <div className="copland-inset bg-card max-h-44 overflow-y-auto p-1">
        {records.length === 0 && (
          <p className="text-[10px] text-muted-foreground/50 font-mono px-1 py-0.5">
            no batches forwarded yet
          </p>
        )}
        {records.map((r) => {
          const s = statusGlyph(r);
          return (
            <div
              key={r.id}
              className="text-[10px] font-mono px-1 py-0.5 border-b border-border/30 last:border-b-0 hover:bg-primary hover:text-primary-foreground"
            >
              <div className="flex items-center gap-1.5">
                <span className={s.cls}>{s.glyph}</span>
                <span className="tabular-nums text-muted-foreground">{timeAgo(r.startedAt)}</span>
                <span className="text-foreground">{r.size}ev</span>
                <span className="text-muted-foreground truncate flex-1">
                  {r.eventTypes.join(',')}
                </span>
                {r.attempt > 1 && (
                  <span className="text-terminal-amber">×{r.attempt}</span>
                )}
                {r.durationMs !== null && (
                  <span className="text-muted-foreground tabular-nums">
                    {r.durationMs}ms
                  </span>
                )}
              </div>
              {r.error && (
                <div className="text-[9px] text-destructive truncate pl-3.5" title={r.error}>
                  {r.error}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
