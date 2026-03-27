// KDSHeader — top bar with restaurant branding, line selector, new order, fire all

import React from 'react';
import { useGasTown } from '../context/GasTownContext';
import { RigSelector } from './RigSelector';
import { CreateBeadForm } from './CreateBeadForm';
import { Flame, Zap } from 'lucide-react';

export function KDSHeader() {
  const { autoAssignBacklog } = useGasTown();

  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/60">
      <div className="flex items-center gap-5">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-kds-grill" />
          <div>
            <h1 className="text-sm font-bold tracking-wide text-foreground leading-none">GAS TOWN KITCHEN</h1>
            <span className="text-[10px] text-muted-foreground font-mono">Multi-Agent Order System v0.1</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-border" />

        {/* Line selector (rigs) */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Line</span>
          <RigSelector />
        </div>

        {/* New order */}
        <CreateBeadForm />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={autoAssignBacklog}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-kds-grill text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-kds-grill/90 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" /> Fire All Orders
        </button>
      </div>
    </header>
  );
}
