// KDSSidebar — crew status, model selector, stats in KDS style

import React from 'react';
import { ModelSelector } from './ModelSelector';
import { MayorPanel } from './MayorPanel';
import { PolecatPanel } from './PolecatPanel';
import { StatsPanel } from './StatsPanel';

export function KDSSidebar() {
  return (
    <aside className="w-60 border-r border-border flex flex-col overflow-y-auto bg-card/30">
      {/* Model / Engine */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Engine</span>
        </div>
        <ModelSelector />
      </div>

      <div className="flex-1 p-3 space-y-4 overflow-y-auto">
        {/* Crew = Polecats */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Kitchen Crew</span>
          </div>
          <PolecatPanel />
        </div>

        {/* Manager = Mayor */}
        <div className="border-t border-border pt-3">
          <MayorPanel />
        </div>

        {/* Stats */}
        <div className="border-t border-border pt-3">
          <StatsPanel />
        </div>
      </div>
    </aside>
  );
}
