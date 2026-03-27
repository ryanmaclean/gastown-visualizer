// ProjectBoard — Planify-style Kanban columns

import React from 'react';
import { useEtsTable } from '../hooks/useEts';
import { useGasTown } from '../context/GasTownContext';
import { Bead, BeadStatus } from '../actors/types';
import { OrderTicket } from './OrderTicket';
import { Plus, MoreHorizontal } from 'lucide-react';

interface Column {
  key: BeadStatus | 'stalled';
  label: string;
  dotColor: string;
}

const columns: Column[] = [
  { key: 'backlog',     label: 'To Do',        dotColor: 'bg-muted-foreground' },
  { key: 'in_progress', label: 'Progress',     dotColor: 'bg-[hsl(var(--status-progress))]' },
  { key: 'refinery',    label: 'Under Review',  dotColor: 'bg-[hsl(var(--status-review))]' },
  { key: 'merged',      label: 'Completed',    dotColor: 'bg-[hsl(var(--status-done))]' },
];

export function KDSBoard() {
  const allBeads = useEtsTable<Bead>('beads');
  const { activeRigId } = useGasTown();

  const rigBeads = allBeads.filter(([, b]) => b.rigId === activeRigId);

  const beadsByColumn = (colKey: string): Bead[] => {
    if (colKey === 'in_progress') {
      return rigBeads
        .filter(([, b]) => b.status === 'in_progress' || b.status === 'stalled')
        .map(([, b]) => b)
        .sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return rigBeads
      .filter(([, b]) => b.status === colKey)
      .map(([, b]) => b)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  };

  return (
    <div className="grid grid-cols-4 gap-4 h-full">
      {columns.map((col) => {
        const beads = beadsByColumn(col.key);
        return (
          <div key={col.key} className="flex flex-col min-h-0">
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-border bg-card text-sm font-semibold text-foreground">
                  {col.label}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">{beads.length}</span>
              </div>
              <MoreHorizontal className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
            </div>

            {/* Add new button */}
            <button className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
              <Plus className="w-4 h-4" /> Add new
            </button>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {beads.map((bead) => (
                <OrderTicket key={bead.id} bead={bead} column={col.key} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
