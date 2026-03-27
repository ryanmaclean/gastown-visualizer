// OrderTicket — KDS-style order ticket with timer, items, and bump bar

import React, { useState, useEffect } from 'react';
import { Bead, PolecatState } from '../actors/types';
import { useEtsLookup } from '../hooks/useEts';
import { useGasTown } from '../context/GasTownContext';
import { ChevronDown, ChevronRight, Ticket, Flame, Wrench, CircleCheckBig, AlertTriangle, Zap, Siren } from 'lucide-react';

function useElapsedTime(startTime: number): string {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function getTimerColor(startTime: number): string {
  const elapsed = (Date.now() - startTime) / 1000;
  if (elapsed < 30) return 'bg-kds-done/20 text-kds-done';
  if (elapsed < 120) return 'bg-kds-grill/20 text-kds-grill';
  return 'bg-kds-alert/20 text-kds-alert animate-pulse-glow';
}

const statusIcons: Record<string, React.ReactNode> = {
  backlog: <Ticket className="w-3.5 h-3.5" />,
  in_progress: <Flame className="w-3.5 h-3.5" />,
  refinery: <Wrench className="w-3.5 h-3.5" />,
  merged: <CircleCheckBig className="w-3.5 h-3.5" />,
  stalled: <AlertTriangle className="w-3.5 h-3.5" />,
};

export function OrderTicket({ bead, stationColor }: { bead: Bead; stationColor: string }) {
  const [expanded, setExpanded] = useState(false);
  const polecat = useEtsLookup<PolecatState>('polecats', bead.assignedTo);
  const { assignBeadToPolecat } = useGasTown();
  const timer = useElapsedTime(bead.createdAt);
  const timerColor = getTimerColor(bead.createdAt);

  return (
    <div className={`kds-ticket ${stationColor} animate-ticket-in`}>
      {/* Ticket header */}
      <div className="kds-ticket-header bg-secondary/80">
        <div className="flex items-center gap-1.5">
          {statusIcons[bead.status]}
          <span className="font-mono text-foreground">{bead.id}</span>
        </div>
        <span className={`kds-timer ${timerColor}`}>{timer}</span>
      </div>

      {/* Ticket body */}
      <div className="kds-ticket-body space-y-2">
        {/* Order item */}
        <p className="text-sm font-semibold text-foreground leading-snug">{bead.title}</p>

        {/* Cook / polecat assignment */}
        {polecat && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-sm">{polecat.avatar}</span>
            <span className="text-muted-foreground">Cook:</span>
            <span className="text-foreground font-medium">{polecat.name}</span>
            {bead.status === 'in_progress' && (
              <span className="ml-auto text-kds-grill font-mono text-[10px] animate-pulse-glow">COOKING</span>
            )}
          </div>
        )}

        {/* Convoy / combo order */}
        {bead.convoyId && (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-kds-prep/15 text-kds-prep font-mono">
            <Zap className="w-3 h-3" /> Combo: {bead.convoyId}
          </span>
        )}

        {/* Escalation */}
        {bead.escalated && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-kds-alert/10 border border-kds-alert/30">
            <Siren className="w-3.5 h-3.5 text-kds-alert" />
            <span className="text-xs font-bold text-kds-alert tracking-wide">ESCALATED — NEEDS ATTENTION</span>
          </div>
        )}

        {/* Metrics */}
        {bead.tokensGenerated > 0 && (
          <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-kds-done" />
              {bead.tokensGenerated} tokens
            </span>
            <span>{bead.tokensPerSec.toFixed(1)} t/s</span>
          </div>
        )}

        {/* Token stream expandable */}
        {bead.tokenStream && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              output
            </button>
            {expanded && (
              <pre className="mt-1 p-2 bg-background rounded text-[11px] text-foreground/70 max-h-28 overflow-y-auto whitespace-pre-wrap break-words font-mono">
                {bead.tokenStream}
                {bead.status === 'in_progress' && <span className="animate-blink">▌</span>}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Bump bar */}
      {bead.status === 'backlog' && (
        <button
          onClick={() => assignBeadToPolecat(bead.id)}
          className="kds-bump bg-kds-grill/90 text-primary-foreground hover:bg-kds-grill flex items-center justify-center gap-2"
        >
          <Flame className="w-3.5 h-3.5" /> Fire Order
        </button>
      )}

      {bead.status === 'merged' && (
        <div className="kds-bump bg-kds-done/20 text-kds-done text-center cursor-default flex items-center justify-center gap-2">
          <CircleCheckBig className="w-3.5 h-3.5" /> SERVED
        </div>
      )}
    </div>
  );
}
