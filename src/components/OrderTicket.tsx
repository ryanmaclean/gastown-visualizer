// OrderTicket — Visual KDS card with tags, progress, avatars

import React, { useState, useEffect } from 'react';
import { Bead, PolecatState } from '../actors/types';
import { useEtsLookup } from '../hooks/useEts';
import { useGasTown } from '../context/GasTownContext';
import {
  ChevronDown, ChevronRight, Flame, Wrench, CircleCheckBig,
  AlertTriangle, Zap, Siren, MessageSquare, Clock, Cpu
} from 'lucide-react';

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

function getTimerUrgency(startTime: number): 'ok' | 'warn' | 'critical' {
  const elapsed = (Date.now() - startTime) / 1000;
  if (elapsed < 30) return 'ok';
  if (elapsed < 120) return 'warn';
  return 'critical';
}

const statusTagConfig: Record<string, { label: string; className: string }> = {
  backlog: { label: 'Queued', className: 'bg-secondary text-secondary-foreground' },
  in_progress: { label: 'Cooking', className: 'bg-kds-grill/20 text-kds-grill' },
  refinery: { label: 'Assembly', className: 'bg-kds-assembly/20 text-kds-assembly' },
  merged: { label: 'Served', className: 'bg-kds-done/20 text-kds-done' },
  stalled: { label: 'Stalled', className: 'bg-kds-alert/20 text-kds-alert' },
};

export function OrderTicket({ bead, stationColor }: { bead: Bead; stationColor: string }) {
  const [expanded, setExpanded] = useState(false);
  const polecat = useEtsLookup<PolecatState>('polecats', bead.assignedTo);
  const { assignBeadToPolecat } = useGasTown();
  const timer = useElapsedTime(bead.createdAt);
  const urgency = getTimerUrgency(bead.createdAt);
  const tag = statusTagConfig[bead.status] || statusTagConfig.backlog;

  // Progress percentage (simulate based on status)
  const progress = bead.status === 'merged' ? 100
    : bead.status === 'refinery' ? 75
    : bead.status === 'in_progress' ? Math.min(60, Math.max(10, (bead.tokensGenerated / 50) * 60))
    : 0;

  const progressColor = bead.status === 'merged' ? 'bg-kds-done'
    : bead.status === 'refinery' ? 'bg-kds-assembly'
    : bead.status === 'in_progress' ? 'bg-kds-grill'
    : 'bg-muted-foreground';

  const timerClasses = urgency === 'critical'
    ? 'text-kds-alert animate-pulse-glow'
    : urgency === 'warn'
    ? 'text-kds-grill'
    : 'text-muted-foreground';

  return (
    <div className="group rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200 overflow-hidden animate-ticket-in hover:shadow-lg hover:shadow-primary/5">
      {/* Card body */}
      <div className="p-3.5 space-y-3">
        {/* Top row: tag + timer */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${tag.className}`}>
            {tag.label}
          </span>
          <div className={`flex items-center gap-1 text-[11px] font-mono tabular-nums ${timerClasses}`}>
            <Clock className="w-3 h-3" />
            {timer}
          </div>
        </div>

        {/* Title */}
        <div>
          <h4 className="text-sm font-bold text-foreground leading-snug">{bead.title}</h4>
          {bead.description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{bead.description}</p>
          )}
        </div>

        {/* Progress bar */}
        {progress > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Progress</span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full ${progressColor} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5">
          {bead.convoyId && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-kds-prep/15 text-kds-prep font-medium">
              <Zap className="w-2.5 h-2.5" /> {bead.convoyId}
            </span>
          )}
          {bead.tokensGenerated > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono">
              <Cpu className="w-2.5 h-2.5" /> {bead.tokensGenerated} tok
            </span>
          )}
          {bead.tokensPerSec > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono">
              {bead.tokensPerSec.toFixed(1)} t/s
            </span>
          )}
        </div>

        {/* Escalation alert */}
        {bead.escalated && (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-kds-alert/10 border border-kds-alert/20">
            <Siren className="w-3.5 h-3.5 text-kds-alert flex-shrink-0" />
            <span className="text-[11px] font-bold text-kds-alert tracking-wide">ESCALATED</span>
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
              <MessageSquare className="w-3 h-3" />
              output
            </button>
            {expanded && (
              <pre className="mt-1.5 p-2.5 bg-background rounded-lg text-[11px] text-foreground/70 max-h-28 overflow-y-auto whitespace-pre-wrap break-words font-mono border border-border">
                {bead.tokenStream}
                {bead.status === 'in_progress' && <span className="animate-blink">▌</span>}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Footer: avatar + actions */}
      <div className="px-3.5 py-2.5 border-t border-border flex items-center justify-between">
        {/* Polecat avatar */}
        {polecat ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
              {polecat.avatar}
            </div>
            <span className="text-xs text-muted-foreground">{polecat.name}</span>
            {bead.status === 'in_progress' && (
              <span className="w-1.5 h-1.5 rounded-full bg-kds-grill animate-pulse-glow" />
            )}
          </div>
        ) : (
          <div className="text-[11px] text-muted-foreground/50">Unassigned</div>
        )}

        {/* ID badge */}
        <span className="text-[10px] font-mono text-muted-foreground/50">{bead.id}</span>
      </div>

      {/* Action buttons */}
      {bead.status === 'backlog' && (
        <button
          onClick={() => assignBeadToPolecat(bead.id)}
          className="w-full py-2.5 text-xs font-bold uppercase tracking-wider bg-kds-grill/90 text-primary-foreground hover:bg-kds-grill transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Flame className="w-3.5 h-3.5" /> Fire Order
        </button>
      )}

      {bead.status === 'merged' && (
        <div className="w-full py-2 text-xs font-bold uppercase tracking-wider bg-kds-done/15 text-kds-done text-center flex items-center justify-center gap-2">
          <CircleCheckBig className="w-3.5 h-3.5" /> Served
        </div>
      )}
    </div>
  );
}
