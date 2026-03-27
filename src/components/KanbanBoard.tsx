// KanbanBoard — 4-column board reading from ETS :beads, filtered by active rig

import React from 'react';
import { useEtsTable } from '../hooks/useEts';
import { useGasTown } from '../context/GasTownContext';
import { Bead, BeadStatus } from '../actors/types';
import { BeadCard } from './BeadCard';

const columns: { key: BeadStatus; label: string; accent: string }[] = [
  { key: 'backlog', label: 'BACKLOG', accent: 'border-muted-foreground/30' },
  { key: 'in_progress', label: 'IN PROGRESS', accent: 'border-primary/50' },
  { key: 'refinery', label: 'REFINERY', accent: 'border-terminal-amber/50' },
  { key: 'merged', label: 'MERGED', accent: 'border-terminal-cyan/50' },
];

export function KanbanBoard() {
  const allBeads = useEtsTable<Bead>('beads');
  const { activeRigId } = useGasTown();

  // Filter beads by active rig
  const rigBeads = allBeads.filter(([, b]) => b.rigId === activeRigId);

  const beadsByStatus = (status: BeadStatus): Bead[] => {
    return rigBeads
      .filter(([, b]) => b.status === status)
      .map(([, b]) => b)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  };

  // Also show stalled in the "in_progress" column
  const inProgressBeads = [...beadsByStatus('in_progress'), ...beadsByStatus('stalled')];

  return (
    <div className="grid grid-cols-4 gap-3 h-full">
      {columns.map((col) => {
        const beads = col.key === 'in_progress' ? inProgressBeads : beadsByStatus(col.key);
        return (
          <div key={col.key} className="flex flex-col min-h-0">
            {/* Column header */}
            <div className={`flex items-center justify-between px-3 py-2 border-b-2 ${col.accent} mb-3`}>
              <span className="text-xs font-mono font-semibold tracking-wider text-foreground">
                {col.label}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {beads.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {beads.map((bead) => (
                <BeadCard key={bead.id} bead={bead} />
              ))}
              {beads.length === 0 && (
                <div className="text-xs text-muted-foreground/50 text-center py-8 font-mono">
                  — empty —
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
