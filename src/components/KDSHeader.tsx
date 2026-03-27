// BoardHeader — Copland OS aesthetic

import React from 'react';
import { useGasTown } from '../context/GasTownContext';
import { RigSelector } from './RigSelector';
import { CreateBeadForm } from './CreateBeadForm';
import { ThemeToggle } from './ThemeToggle';
import { useEtsTable } from '../hooks/useEts';
import { PolecatState } from '../actors/types';
import { AgentIcon } from './CoplandIcons';

export function KDSHeader() {
  const { autoAssignBacklog } = useGasTown();
  const polecats = useEtsTable<PolecatState>('polecats');

  return (
    <header className="flex items-center justify-between px-3 py-1.5 border-b border-border copland-title-stripes">
      <div className="flex items-center gap-2">
        {/* Search — inset field */}
        <div className="copland-inset flex items-center gap-1.5 px-2 py-1 bg-card w-48">
          <span className="text-[10px] text-muted-foreground">🔍</span>
          <input
            type="text"
            placeholder="search..."
            className="bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground outline-none flex-1 font-mono"
          />
        </div>

        {/* Filter — raised button */}
        <button className="copland-raised bg-background px-2 py-1 text-[10px] text-foreground hover:bg-secondary transition-colors flex items-center gap-1">
          ≡ filter
        </button>

        <RigSelector />
      </div>

      <div className="flex items-center gap-2">
        {/* Agent avatars */}
        <div className="flex gap-0.5">
          {polecats.slice(0, 4).map(([, p]) => (
            <div
              key={p.pid}
              className="w-6 h-6 copland-raised bg-background flex items-center justify-center"
              title={p.name}
            >
              <AgentIcon name={p.name} size={14} />
            </div>
          ))}
        </div>

        <ThemeToggle />
        <CreateBeadForm />

        <button
          onClick={autoAssignBacklog}
          className="copland-raised bg-primary text-primary-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-1"
        >
          ⚡ Fire All
        </button>
      </div>
    </header>
  );
}
