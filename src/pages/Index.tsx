// Index page — Retro bitmap aesthetic layout

import React from 'react';
import { GasTownProvider, useGasTown } from '../context/GasTownContext';
import { KDSBoard } from '../components/KDSBoard';
import { KDSHeader } from '../components/KDSHeader';
import { KDSSidebar } from '../components/KDSSidebar';
import { TerminalPanel } from '../components/TerminalPanel';
import { CircleDot } from 'lucide-react';

function GasTownApp() {
  const { isReady } = useGasTown();

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background stipple">
        <div className="text-center space-y-3 bracket-frame border border-border bg-card p-8">
          <CircleDot className="w-6 h-6 text-primary mx-auto animate-pulse-glow" />
          <p className="text-xs font-bold text-foreground uppercase tracking-widest">Initializing...</p>
          <p className="text-[10px] text-muted-foreground">booting actor supervisor tree</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <KDSSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <KDSHeader />

        <div className="flex-1 p-4 overflow-hidden stipple">
          <KDSBoard />
        </div>

        <TerminalPanel />
      </main>
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
