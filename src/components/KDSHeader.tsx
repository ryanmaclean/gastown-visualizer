// BoardHeader — Planify-style top bar with search, filter, avatars

import React from 'react';
import { useGasTown } from '../context/GasTownContext';
import { RigSelector } from './RigSelector';
import { CreateBeadForm } from './CreateBeadForm';
import { ThemeToggle } from './ThemeToggle';
import { Search, SlidersHorizontal, Bell, Share2, Zap } from 'lucide-react';
import { useEtsTable } from '../hooks/useEts';
import { PolecatState } from '../actors/types';

export function KDSHeader() {
  const { autoAssignBacklog } = useGasTown();
  const polecats = useEtsTable<PolecatState>('polecats');

  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-card">
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border w-64">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search beads..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
          />
        </div>

        {/* Filter */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
          Filter
        </button>

        {/* Rig selector */}
        <RigSelector />
      </div>

      <div className="flex items-center gap-3">
        {/* Avatar stack */}
        <div className="flex -space-x-2">
          {polecats.slice(0, 4).map(([, p]) => (
            <div
              key={p.pid}
              className="w-8 h-8 rounded-full bg-accent border-2 border-card flex items-center justify-center text-xs font-semibold text-accent-foreground"
              title={p.name}
            >
              {p.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {polecats.length > 4 && (
            <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium text-muted-foreground">
              +{polecats.length - 4}
            </div>
          )}
        </div>

        <Bell className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
        <ThemeToggle />

        <CreateBeadForm />

        <button
          onClick={autoAssignBacklog}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Zap className="w-4 h-4" /> Fire All
        </button>

        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>
    </header>
  );
}
