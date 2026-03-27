// ProjectBoard — Retro bitmap Kanban columns with bracket decorations

import React from 'react';
import { useEtsTable } from '../hooks/useEts';
import { useGasTown } from '../context/GasTownContext';
import { Bead, BeadStatus } from '../actors/types';
import { OrderTicket } from './OrderTicket';
import { Plus, MoreHorizontal } from 'lucide-react';

interface Column {
  key: BeadStatus | 'stalled';
  label: string;
}

const columns: Column[] = [
  { key: 'backlog',     label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'refinery',    label: 'Under Review' },
  { key: 'merged',      label: 'Completed' },
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
    <div className="grid grid-cols-4 gap-5 h-full">
      {columns.map((col) => {
        const beads = beadsByColumn(col.key);
        return (
          <div key={col.key} className="flex flex-col min-h-0">
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-0.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 px-2.5 py-1 border border-border bg-card text-xs font-bold text-foreground tracking-wide uppercase">
                  {col.label}
                </span>
                <span className="text-xs font-bold text-muted-foreground tabular-nums">{beads.length}</span>
              </div>
              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-foreground" />
            </div>

            {/* Add new */}
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 mb-2 border border-dashed border-border text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
              <Plus className="w-3 h-3" /> add new
            </button>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
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
