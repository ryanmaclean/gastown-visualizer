// Index page — Planify-style project board layout

import React from 'react';
import { GasTownProvider, useGasTown } from '../context/GasTownContext';
import { KDSBoard } from '../components/KDSBoard';
import { KDSHeader } from '../components/KDSHeader';
import { KDSSidebar } from '../components/KDSSidebar';
import { TerminalPanel } from '../components/TerminalPanel';
import { Loader2 } from 'lucide-react';

function GasTownApp() {
  const { isReady } = useGasTown();

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
          <p className="text-sm font-semibold text-foreground">Starting up...</p>
          <p className="text-xs text-muted-foreground">Initializing actor supervisor tree</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <KDSSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <KDSHeader />

        <div className="flex-1 p-4 overflow-hidden">
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
