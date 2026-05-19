// BeadCardBack — scrollable OpenLineage event log shown on the flipped card face.

import React, { useState } from 'react';
import { RotateCcw, Copy, Check } from 'lucide-react';
import { useBeadLineage } from '../hooks/useLineage';
import type { StoredEvent } from '../actors/lineage';

const eventColor: Record<string, string> = {
  START: 'text-primary',
  RUNNING: 'text-muted-foreground',
  COMPLETE: 'text-terminal-cyan',
  FAIL: 'text-destructive',
  ABORT: 'text-destructive',
  OTHER: 'text-terminal-amber',
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
}

function formatDelta(ms: number): string {
  if (ms < 1000) return `+${ms}ms`;
  return `+${(ms / 1000).toFixed(2)}s`;
}

function eventSummary(e: StoredEvent): string {
  const f = e.event.run.facets || {};
  const lt = f.gastown_lane_transition;
  const inf = f.gastown_inference;
  const pc = f.gastown_polecat;
  if (e.event.eventType === 'START' && pc) return `polecat=${pc.name || pc.pid}`;
  if (e.event.eventType === 'RUNNING' && inf) return `tokens=${inf.tokensGenerated} ${inf.tokensPerSec}t/s`;
  if (lt) return `${lt.from} → ${lt.to}`;
  return '';
}

export function BeadCardBack({ beadId, onFlip }: { beadId: string; onFlip: () => void }) {
  const { events, currentRun, runs } = useBeadLineage(beadId);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const payload = events.map((e) => e.event);
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="bg-card border border-border rounded-md p-2 space-y-2 h-full flex flex-col">
      {/* Header strip */}
      <div className="flex items-center justify-between gap-2 border-b border-border pb-1.5">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            lineage · attempt {currentRun?.attempt ?? runs.length ?? 0}
          </span>
          <span className="text-[10px] font-mono text-foreground truncate" title={currentRun?.runId}>
            {currentRun?.runId ? currentRun.runId.slice(0, 8) : '—'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            disabled={events.length === 0}
            title="Copy lineage JSON"
            className="p-1 rounded border border-border hover:border-primary hover:text-primary text-muted-foreground disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted-foreground transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
          <button
            onClick={onFlip}
            title="Back to card"
            className="flex items-center gap-1 px-1.5 py-1 rounded border border-border hover:border-primary hover:text-primary text-muted-foreground transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="text-[10px] font-mono">back</span>
          </button>
        </div>
      </div>

      {/* Log */}
      <div className="flex-1 overflow-y-auto text-[10px] font-mono space-y-0.5 min-h-[120px]">
        {events.length === 0 && (
          <div className="text-muted-foreground/60 italic">no lineage events yet</div>
        )}
        {events.map((e, i) => {
          const prev = events[i - 1];
          const delta = prev ? new Date(e.event.eventTime).getTime() - new Date(prev.event.eventTime).getTime() : 0;
          const color = eventColor[e.event.eventType] || 'text-foreground';
          const isOpen = expandedKey === e.key;
          return (
            <div key={e.key} className="border-l-2 border-border hover:border-primary/40 pl-1.5">
              <button
                onClick={() => setExpandedKey(isOpen ? null : e.key)}
                className="w-full text-left flex items-baseline gap-1.5 hover:bg-muted/30 px-0.5"
              >
                <span className="text-muted-foreground tabular-nums">{formatTime(e.event.eventTime)}</span>
                <span className={`font-bold ${color}`}>{e.event.eventType.padEnd(8)}</span>
                <span className="text-foreground/80 truncate flex-1">{eventSummary(e)}</span>
                <span className="text-muted-foreground tabular-nums">{prev ? formatDelta(delta) : ''}</span>
              </button>
              {isOpen && (
                <pre className="mt-0.5 p-1 bg-background/60 border border-border rounded text-[9px] text-foreground/70 max-h-32 overflow-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(e.event, null, 2)}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
