// PolecatPanel — Copland-style agent list with pixel-art icons

import React from 'react';
import { useEtsTable } from '../hooks/useEts';
import { PolecatState } from '../actors/types';
import { AgentIcon } from './CoplandIcons';

const statusStyles: Record<string, string> = {
  idle: 'text-muted-foreground',
  working: 'text-primary animate-pulse-glow',
  stalled: 'text-destructive',
  queued: 'text-terminal-amber',
};

export function PolecatPanel() {
  const polecats = useEtsTable<PolecatState>('polecats');

  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Agents</span>
        <span className="text-[10px] text-muted-foreground font-mono">×{polecats.length}</span>
      </div>

      {/* Agent list */}
      <div className="space-y-0.5">
        {polecats.map(([pid, p]) => (
          <div
            key={pid}
            className="flex items-center gap-2 px-1.5 py-1 hover:bg-primary hover:text-primary-foreground transition-colors group"
          >
            <div className="w-6 h-6 copland-raised bg-background flex items-center justify-center p-0.5">
              <AgentIcon name={p.name} size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold group-hover:text-inherit text-foreground">{p.name}</span>
                <span className={`text-[10px] font-mono ${statusStyles[p.status] || ''} group-hover:text-inherit`}>
                  {p.status.toUpperCase()}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground group-hover:text-inherit/70 font-mono">
                {p.currentBeadId ? `→ ${p.currentBeadId}` : `${p.totalBeadsProcessed} done`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
