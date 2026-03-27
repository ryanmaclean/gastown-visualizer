// Index page — Gas Town KDS (Kitchen Display System) layout

import React from 'react';
import { GasTownProvider, useGasTown } from '../context/GasTownContext';
import { KDSBoard } from '../components/KDSBoard';
import { KDSHeader } from '../components/KDSHeader';
import { KDSSidebar } from '../components/KDSSidebar';
import { TerminalPanel } from '../components/TerminalPanel';
import { Flame } from 'lucide-react';

function GasTownApp() {
  const { isReady } = useGasTown();

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <Flame className="w-10 h-10 text-kds-grill mx-auto animate-pulse-glow" />
          <p className="text-sm font-bold text-foreground">Firing up the kitchen...</p>
          <p className="text-xs text-muted-foreground font-mono">Initializing actor supervisor tree</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <KDSSidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <KDSHeader />

        {/* KDS Board */}
        <div className="flex-1 p-3 overflow-hidden">
          <KDSBoard />
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
