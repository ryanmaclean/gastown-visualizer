// BoardHeader — Retro bitmap aesthetic

import React from 'react';
import { useGasTown } from '../context/GasTownContext';
import { RigSelector } from './RigSelector';
import { CreateBeadForm } from './CreateBeadForm';
import { ThemeToggle } from './ThemeToggle';
import { Search, SlidersHorizontal, Zap } from 'lucide-react';
import { useEtsTable } from '../hooks/useEts';
import { PolecatState } from '../actors/types';

export function KDSHeader() {
  const { autoAssignBacklog } = useGasTown();
  const polecats = useEtsTable<PolecatState>('polecats');

  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 px-2.5 py-1 border border-border bg-background w-52">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="search..."
            className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none flex-1 font-mono"
          />
        </div>

        {/* Filter */}
        <button className="flex items-center gap-1.5 px-2.5 py-1 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          filter
        </button>

        <RigSelector />
      </div>

      <div className="flex items-center gap-2.5">
        {/* Agent indicators */}
        <div className="flex gap-1">
          {polecats.slice(0, 4).map(([, p]) => (
            <div
              key={p.pid}
              className="w-6 h-6 border border-border bg-background flex items-center justify-center text-[9px] font-bold text-muted-foreground"
              title={p.name}
            >
              {p.name.charAt(0)}
            </div>
          ))}
        </div>

        <ThemeToggle />
        <CreateBeadForm />

        <button
          onClick={autoAssignBacklog}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-primary bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" /> fire all
        </button>
      </div>
    </header>
  );
}
