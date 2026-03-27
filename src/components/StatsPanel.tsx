// StatsPanel — model stats, scheduler metrics, system health

import React from 'react';
import { useEngineStats, useScheduler } from '../hooks/useScheduler';
import { useEtsTable } from '../hooks/useEts';
import { Bead } from '../actors/types';
import { Activity } from 'lucide-react';

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
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Activity className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground tracking-wide">STATS</span>
      </div>

      <div className="space-y-0.5">
        {statRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-2 py-0.5 text-xs font-mono">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="text-foreground">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Bead distribution bar */}
      <div className="px-2 space-y-1">
        <span className="text-xs font-mono text-muted-foreground">Distribution</span>
        <div className="flex h-2 rounded-full overflow-hidden bg-secondary">
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
