// ProjectSidebar — Copland OS aesthetic with pixel icons

import React from 'react';
import { ModelSelector } from './ModelSelector';
import { PolecatPanel } from './PolecatPanel';
import { MayorPanel } from './MayorPanel';
import { StatsPanel } from './StatsPanel';
import { PixelFolder, PixelGear, PixelChip, PixelShield, PixelChart, WindowCloseBox, WindowZoomBox } from './CoplandIcons';

const boards = [
  { id: 'rig_alpha', label: 'Alpha Rig', letter: 'A' },
  { id: 'rig_beta', label: 'Beta Rig', letter: 'B' },
  { id: 'rig_gamma', label: 'Gamma Rig', letter: 'G' },
];

const views = [
  { label: 'Board View', active: true },
  { label: 'List View', active: false },
  { label: 'Timeline', active: false },
];

export function KDSSidebar() {
  return (
    <aside className="w-56 border-r border-border flex flex-col bg-background copland-raised">
      {/* Brand — title bar */}
      <div className="px-3 py-2.5 border-b border-border copland-title-stripes">
        <div className="flex items-center gap-2">
          <WindowCloseBox size={11} />
          <div className="flex items-center gap-1.5 flex-1">
            <PixelChip size={14} />
            <div>
              <h1 className="text-[10px] font-bold text-foreground leading-none tracking-widest uppercase">Gas Town</h1>
              <span className="text-[9px] text-muted-foreground">actor orchestration</span>
            </div>
          </div>
          <WindowZoomBox size={11} />
        </div>
      </div>

      {/* Rigs */}
      <div className="px-2 py-2 border-b border-border">
        <span className="px-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Rigs</span>
        <div className="mt-1.5 copland-inset bg-card p-0.5">
          {boards.map(b => (
            <button
              key={b.id}
              className="w-full flex items-center gap-2 px-2 py-1 text-[11px] text-foreground hover:bg-primary hover:text-primary-foreground transition-colors group"
            >
              <PixelFolder size={12} />
              <span className="flex-1 text-left truncate">{b.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Board Views */}
      <div className="px-2 py-2 border-b border-border">
        <span className="px-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Views</span>
        <div className="mt-1.5 space-y-px">
          {views.map(v => (
            <button
              key={v.label}
              className={`w-full flex items-center gap-2 px-2 py-1 text-[11px] transition-colors ${
                v.active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-primary hover:text-primary-foreground'
              }`}
            >
              <span className="w-3 h-3 border border-current flex items-center justify-center text-[7px]">
                {v.active ? '▣' : '▢'}
              </span>
              <span>{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Crew & Engine */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {/* Engine */}
        <div className="copland-inset bg-card p-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <PixelChip size={12} />
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Engine</span>
          </div>
          <ModelSelector />
        </div>

        {/* Agents */}
        <div className="copland-inset bg-card p-2">
          <PolecatPanel />
        </div>

        {/* Mayor */}
        <div className="copland-inset bg-card p-2">
          <MayorPanel />
        </div>

        {/* Stats */}
        <div className="copland-inset bg-card p-2">
          <StatsPanel />
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border copland-title-stripes">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <PixelGear size={12} />
          <span>Settings</span>
        </div>
      </div>
    </aside>
  );
}
