// ProjectBoard — Copland OS Kanban with raised/inset window chrome

import React from 'react';
import { useEtsTable } from '../hooks/useEts';
import { useGasTown } from '../context/GasTownContext';
import { Bead, BeadStatus } from '../actors/types';
import { OrderTicket } from './OrderTicket';

interface Column {
  key: BeadStatus | 'stalled';
  label: string;
  icon: string;
}

const columns: Column[] = [
  { key: 'backlog',     label: 'To Do',        icon: '📋' },
  { key: 'in_progress', label: 'In Progress',   icon: '⚙️' },
  { key: 'refinery',    label: 'Under Review',  icon: '🔍' },
  { key: 'merged',      label: 'Completed',     icon: '✓' },
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
    <div className="grid grid-cols-4 gap-3 h-full p-1">
      {columns.map((col) => {
        const beads = beadsByColumn(col.key);
        return (
          <div key={col.key} className="flex flex-col min-h-0 copland-raised bg-background">
            {/* Column title bar */}
            <div className="flex items-center gap-1.5 px-2 py-1 copland-title-stripes border-b border-border">
              <span className="text-[10px]">{col.icon}</span>
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wider flex-1">
                {col.label}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground tabular-nums">{beads.length}</span>
            </div>

            {/* Add new — raised button */}
            <div className="px-2 pt-2 pb-1">
              <button className="w-full copland-raised bg-background px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-1">
                + add new
              </button>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
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
