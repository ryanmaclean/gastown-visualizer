// ProjectSidebar — Planify-style sidebar with projects, board views, crew

import React from 'react';
import { ModelSelector } from './ModelSelector';
import { PolecatPanel } from './PolecatPanel';
import { MayorPanel } from './MayorPanel';
import { StatsPanel } from './StatsPanel';
import {
  LayoutGrid, Columns3, List, CalendarDays,
  Star, Settings, Users, Cpu
} from 'lucide-react';

const boards = [
  { id: 'rig_alpha', label: 'Alpha Rig', color: 'bg-primary' },
  { id: 'rig_beta', label: 'Beta Rig', color: 'bg-status-progress' },
  { id: 'rig_gamma', label: 'Gamma Rig', color: 'bg-status-review' },
];

const views = [
  { icon: Columns3, label: 'Board View', active: true },
  { icon: List, label: 'List View', active: false },
  { icon: CalendarDays, label: 'Timeline', active: false },
];

export function KDSSidebar() {
  return (
    <aside className="w-64 border-r border-border flex flex-col bg-sidebar-background">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Cpu className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-none">Gas Town</h1>
            <span className="text-[11px] text-muted-foreground">Multi-Agent System</span>
          </div>
        </div>
      </div>

      {/* Rigs / Projects */}
      <div className="px-3 py-3 border-b border-border">
        <span className="px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Your Rigs</span>
        <div className="mt-2 space-y-0.5">
          {boards.map(b => (
            <button
              key={b.id}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-foreground hover:bg-accent transition-colors group"
            >
              <span className={`w-5 h-5 rounded-md ${b.color} flex items-center justify-center text-[10px] font-bold text-primary-foreground`}>
                {b.label.charAt(0)}
              </span>
              <span className="flex-1 text-left truncate">{b.label}</span>
              <span className="opacity-0 group-hover:opacity-100 text-muted-foreground">⋮</span>
            </button>
          ))}
        </div>
      </div>

      {/* Board Views */}
      <div className="px-3 py-3 border-b border-border">
        <span className="px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Board Views</span>
        <div className="mt-2 space-y-0.5">
          {views.map(v => (
            <button
              key={v.label}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${
                v.active
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <v.icon className="w-4 h-4" />
              <span>{v.label}</span>
              {v.active && <span className="ml-auto text-xs text-muted-foreground">›</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Crew & Engine */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Engine */}
        <div>
          <div className="flex items-center gap-2 px-2 mb-2">
            <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Engine</span>
          </div>
          <ModelSelector />
        </div>

        {/* Crew */}
        <div>
          <div className="flex items-center gap-2 px-2 mb-2">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Agents</span>
          </div>
          <PolecatPanel />
        </div>

        {/* Mayor */}
        <div className="border-t border-border pt-3">
          <MayorPanel />
        </div>

        {/* Stats */}
        <div className="border-t border-border pt-3">
          <StatsPanel />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Settings</span>
        </div>
      </div>
    </aside>
  );
}
