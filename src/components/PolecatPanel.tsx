// PolecatPanel — agent list with status indicators

import React from 'react';
import { useEtsTable } from '../hooks/useEts';
import { PolecatState } from '../actors/types';
import { Cpu } from 'lucide-react';

const statusStyles: Record<string, string> = {
  idle: 'text-muted-foreground',
  working: 'text-primary animate-pulse-glow',
  stalled: 'text-destructive',
  queued: 'text-terminal-amber',
};

const statusDot: Record<string, string> = {
  idle: 'bg-muted-foreground',
  working: 'bg-primary',
  stalled: 'bg-destructive',
  queued: 'bg-terminal-amber',
};

export function PolecatPanel() {
  const polecats = useEtsTable<PolecatState>('polecats');

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <Cpu className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground tracking-wide">POLECATS</span>
        <span className="text-xs text-muted-foreground font-mono">×{polecats.length}</span>
      </div>

      {/* Agent list */}
      <div className="space-y-1.5">
        {polecats.map(([pid, p]) => (
          <div
            key={pid}
            className="flex items-center gap-2 px-2 py-1.5 rounded bg-secondary/30 border border-border/50"
          >
            <span className="text-base">{p.avatar}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">{p.name}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot[p.status] || statusDot.idle}`} />
                <span className={`text-xs font-mono ${statusStyles[p.status] || ''}`}>
                  {p.status.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {p.currentBeadId ? `→ ${p.currentBeadId}` : `${p.totalBeadsProcessed} done`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
