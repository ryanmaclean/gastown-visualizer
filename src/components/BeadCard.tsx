// BeadCard — displays a bead with status, assignment, token stream

import React, { useState } from 'react';
import { Bead, PolecatState } from '../actors/types';
import { useEtsLookup } from '../hooks/useEts';
import { useGasTown } from '../context/GasTownContext';
import { ChevronDown, ChevronRight, Zap, AlertTriangle, GitMerge, Clock, X } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  backlog: { label: 'BACKLOG', color: 'text-muted-foreground', icon: <Clock className="w-3 h-3" /> },
  in_progress: { label: 'ACTIVE', color: 'text-primary', icon: <Zap className="w-3 h-3" /> },
  refinery: { label: 'REVIEW', color: 'text-terminal-amber', icon: <GitMerge className="w-3 h-3" /> },
  merged: { label: 'MERGED', color: 'text-terminal-cyan', icon: <GitMerge className="w-3 h-3" /> },
  stalled: { label: 'STALLED', color: 'text-destructive', icon: <AlertTriangle className="w-3 h-3" /> },
};

export function BeadCard({ bead }: { bead: Bead }) {
  const [expanded, setExpanded] = useState(false);
  const polecat = useEtsLookup<PolecatState>('polecats', bead.assignedTo);
  const { assignBeadToPolecat } = useGasTown();
  const config = statusConfig[bead.status] || statusConfig.backlog;

  return (
    <div className="bg-card border border-border rounded-md p-3 space-y-2 hover:border-primary/40 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-muted-foreground">{bead.id}</span>
        <span className={`flex items-center gap-1 text-xs font-mono ${config.color}`}>
          {config.icon}
          {config.label}
          {bead.status === 'in_progress' && <span className="animate-pulse-glow">●</span>}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-foreground leading-tight">{bead.title}</p>

      {/* Polecat assignment */}
      {polecat && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{polecat.avatar}</span>
          <span>{polecat.name}</span>
        </div>
      )}

      {/* Convoy tag */}
      {bead.convoyId && (
        <span className="inline-block text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-mono">
          ⚡ {bead.convoyId}
        </span>
      )}

      {/* Escalation badge */}
      {bead.escalated && (
        <span className="inline-block text-xs px-1.5 py-0.5 rounded bg-destructive/20 text-destructive font-mono">
          ⚠ ESCALATED
        </span>
      )}

      {/* Metrics row */}
      {bead.tokensGenerated > 0 && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
          <span>{bead.tokensGenerated} tok</span>
          <span>{bead.tokensPerSec.toFixed(1)} t/s</span>
        </div>
      )}

      {/* Expandable token stream */}
      {bead.tokenStream && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            output
          </button>
          {expanded && (
            <pre className="mt-1 p-2 bg-background rounded text-xs text-foreground/80 max-h-32 overflow-y-auto whitespace-pre-wrap break-words font-mono">
              {bead.tokenStream}
              {bead.status === 'in_progress' && <span className="animate-blink">▌</span>}
            </pre>
          )}
        </div>
      )}

      {/* Assign button for backlog */}
      {bead.status === 'backlog' && (
        <button
          onClick={() => assignBeadToPolecat(bead.id)}
          className="w-full text-xs py-1 rounded border border-border hover:border-primary hover:text-primary transition-colors text-muted-foreground"
        >
          ▶ Assign Polecat
        </button>
      )}
    </div>
  );
}
