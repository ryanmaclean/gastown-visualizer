// ProjectSidebar — Retro bitmap aesthetic

import React from 'react';
import { ModelSelector } from './ModelSelector';
import { PolecatPanel } from './PolecatPanel';
import { MayorPanel } from './MayorPanel';
import { StatsPanel } from './StatsPanel';
import {
  LayoutGrid, Columns3, List, CalendarDays,
  Settings, Users, Cpu, CircleDot
} from 'lucide-react';

const boards = [
  { id: 'rig_alpha', label: 'Alpha Rig', letter: 'A' },
  { id: 'rig_beta', label: 'Beta Rig', letter: 'B' },
  { id: 'rig_gamma', label: 'Gamma Rig', letter: 'G' },
];

const views = [
  { icon: Columns3, label: 'Board View', active: true },
  { icon: List, label: 'List View', active: false },
  { icon: CalendarDays, label: 'Timeline', active: false },
];

export function KDSSidebar() {
  return (
    <aside className="w-56 border-r border-border flex flex-col bg-sidebar-background">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 border border-border bg-primary/10 flex items-center justify-center">
            <CircleDot className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-foreground leading-none tracking-tight">GAS TOWN</h1>
            <span className="text-[10px] text-muted-foreground">actor orchestration</span>
          </div>
        </div>
      </div>

      {/* Rigs */}
      <div className="px-3 py-3 border-b border-border">
        <span className="px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rigs</span>
        <div className="mt-2 space-y-px">
          {boards.map(b => (
            <button
              key={b.id}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 text-xs text-foreground hover:bg-accent transition-colors group"
            >
              <span className="w-5 h-5 border border-primary/40 bg-primary/8 flex items-center justify-center text-[9px] font-bold text-primary">
                {b.letter}
              </span>
              <span className="flex-1 text-left truncate">{b.label}</span>
              <span className="opacity-0 group-hover:opacity-100 text-muted-foreground text-[10px]">›</span>
            </button>
          ))}
        </div>
      </div>

      {/* Board Views */}
      <div className="px-3 py-3 border-b border-border">
        <span className="px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Views</span>
        <div className="mt-2 space-y-px">
          {views.map(v => (
            <button
              key={v.label}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 text-xs transition-colors ${
                v.active
                  ? 'bg-accent text-accent-foreground border-l-2 border-primary'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <v.icon className="w-3.5 h-3.5" />
              <span>{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Crew & Engine */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-1.5">
            <Cpu className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Engine</span>
          </div>
          <ModelSelector />
        </div>

        <div className="border-t border-border pt-3">
          <div className="flex items-center gap-1.5 px-1 mb-1.5">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Agents</span>
          </div>
          <PolecatPanel />
        </div>

        <div className="border-t border-border pt-3">
          <MayorPanel />
        </div>

        <div className="border-t border-border pt-3">
          <StatsPanel />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Settings className="w-3 h-3" />
          <span>Settings</span>
        </div>
      </div>
    </aside>
  );
}
