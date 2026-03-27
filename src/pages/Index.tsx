// Index page — Gas Town Kanban demo layout

import React from 'react';
import { GasTownProvider, useGasTown } from '../context/GasTownContext';
import { KanbanBoard } from '../components/KanbanBoard';
import { MayorPanel } from '../components/MayorPanel';
import { PolecatPanel } from '../components/PolecatPanel';
import { ModelSelector } from '../components/ModelSelector';
import { StatsPanel } from '../components/StatsPanel';
import { RigSelector } from '../components/RigSelector';
import { CreateBeadForm } from '../components/CreateBeadForm';
import { Terminal, Play } from 'lucide-react';
import { TerminalPanel } from '../components/TerminalPanel';

function GasTownApp() {
  const { isReady, autoAssignBacklog } = useGasTown();

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <Terminal className="w-8 h-8 text-primary mx-auto animate-pulse-glow" />
          <p className="text-sm font-mono text-foreground terminal-glow">Booting Gas Town...</p>
          <p className="text-xs font-mono text-muted-foreground">Initializing supervisor tree</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left sidebar */}
      <aside className="w-64 border-r border-border flex flex-col overflow-y-auto bg-card/50">
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-4 h-4 text-primary" />
            <h1 className="text-sm font-bold tracking-wide text-foreground">GAS TOWN</h1>
            <span className="text-xs text-muted-foreground font-mono">v0.1</span>
          </div>
          <ModelSelector />
        </div>

        <div className="flex-1 p-3 space-y-5 overflow-y-auto">
          <MayorPanel />
          <div className="border-t border-border pt-4">
            <PolecatPanel />
          </div>
          <div className="border-t border-border pt-4">
            <StatsPanel />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/30">
          <div className="flex items-center gap-4">
            <RigSelector />
            <CreateBeadForm />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={autoAssignBacklog}
              className="flex items-center gap-1 px-3 py-1 rounded bg-primary text-primary-foreground text-xs font-mono hover:bg-primary/90 transition-colors"
            >
              <Play className="w-3 h-3" /> Auto-Assign All
            </button>
          </div>
        </header>

        {/* Kanban */}
        <div className="flex-1 p-4 overflow-hidden">
          <KanbanBoard />
        </div>

        {/* Terminal */}
        <TerminalPanel />
      </main>

      {/* Scanline overlay */}
      <div className="fixed inset-0 scanline pointer-events-none z-50" />
    </div>
  );
}

export default function Index() {
  return (
    <GasTownProvider>
      <GasTownApp />
    </GasTownProvider>
  );
}
