// StatsPanel — Copland OS style with pixel chart

import React from 'react';
import { useEngineStats, useScheduler } from '../hooks/useScheduler';
import { useEtsTable } from '../hooks/useEts';
import { Bead } from '../actors/types';
import { PixelChart } from './CoplandIcons';

export function StatsPanel() {
  const engineStats = useEngineStats();
  const schedulerState = useScheduler();
  const allBeads = useEtsTable<Bead>('beads');

  const beadsByStatus = {
    backlog: allBeads.filter(([, b]) => b.status === 'backlog').length,
    in_progress: allBeads.filter(([, b]) => b.status === 'in_progress').length,
    refinery: allBeads.filter(([, b]) => b.status === 'refinery').length,
    merged: allBeads.filter(([, b]) => b.status === 'merged').length,
    stalled: allBeads.filter(([, b]) => b.status === 'stalled').length,
  };

  const totalBeads = allBeads.length;
  const mergeRate = totalBeads > 0 ? ((beadsByStatus.merged / totalBeads) * 100).toFixed(0) : '0';
  const escalationRate = totalBeads > 0
    ? ((allBeads.filter(([, b]) => b.escalated).length / totalBeads) * 100).toFixed(0)
    : '0';

  const statRows = [
    { label: 'Model', value: engineStats.isLoaded ? engineStats.modelId.split('-').slice(0, 2).join(' ') : 'none' },
    { label: 'Load Time', value: engineStats.loadTimeMs > 0 ? `${(engineStats.loadTimeMs / 1000).toFixed(1)}s` : '—' },
    { label: 'Avg tok/s', value: engineStats.avgTokensPerSec > 0 ? engineStats.avgTokensPerSec.toFixed(1) : '—' },
    { label: 'Total Tokens', value: engineStats.totalTokens.toLocaleString() },
    { label: 'Queue Depth', value: schedulerState.queueDepth.toString() },
    { label: 'Processed', value: schedulerState.totalProcessed.toString() },
    { label: 'Avg Wait', value: schedulerState.avgWaitTimeMs > 0 ? `${(schedulerState.avgWaitTimeMs / 1000).toFixed(1)}s` : '—' },
    { label: 'Merge Rate', value: `${mergeRate}%` },
    { label: 'Escalations', value: `${escalationRate}%` },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <PixelChart size={14} />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stats</span>
      </div>

      <div className="copland-inset bg-card p-1">
        {statRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-1 py-0.5 text-[10px] font-mono hover:bg-primary hover:text-primary-foreground">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="text-foreground">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Bead distribution bar */}
      <div className="px-1 space-y-0.5">
        <span className="text-[10px] font-mono text-muted-foreground uppercase">Distribution</span>
        <div className="copland-inset flex h-3 overflow-hidden bg-card p-px">
          {beadsByStatus.backlog > 0 && (
            <div className="bg-muted-foreground/50" style={{ width: `${(beadsByStatus.backlog / totalBeads) * 100}%` }} />
          )}
          {beadsByStatus.in_progress > 0 && (
            <div className="bg-primary" style={{ width: `${(beadsByStatus.in_progress / totalBeads) * 100}%` }} />
          )}
          {beadsByStatus.refinery > 0 && (
            <div className="bg-accent" style={{ width: `${(beadsByStatus.refinery / totalBeads) * 100}%` }} />
          )}
          {beadsByStatus.merged > 0 && (
            <div className="bg-terminal-cyan" style={{ width: `${(beadsByStatus.merged / totalBeads) * 100}%` }} />
          )}
          {beadsByStatus.stalled > 0 && (
            <div className="bg-destructive" style={{ width: `${(beadsByStatus.stalled / totalBeads) * 100}%` }} />
          )}
        </div>
      </div>
    </div>
  );
}
