// GasTownContext — provides the actor system to React tree

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Supervisor } from '../lib/otp/supervisor';
import { ets } from '../lib/otp/ets';
import { pubsub } from '../lib/otp/pubsub';
import { MayorActor } from '../actors/mayor';
import { PolecatActor } from '../actors/polecat';
import { RigActor } from '../actors/rig';
import { RefineryActor } from '../actors/refinery';
import { webllmEngine, AVAILABLE_MODELS, type ModelId } from '../lib/webllm/engine';
import type { Bead, RigState } from '../actors/types';

interface GasTownContextValue {
  supervisor: Supervisor | null;
  isReady: boolean;
  activeRigId: string;
  setActiveRigId: (id: string) => void;
  createBead: (title: string, description: string) => void;
  assignBeadToPolecat: (beadId: string) => void;
  loadModel: (modelId: ModelId) => Promise<void>;
  autoAssignBacklog: () => void;
}

const GasTownContext = createContext<GasTownContextValue | null>(null);

export function GasTownProvider({ children }: { children: React.ReactNode }) {
  const supervisorRef = useRef<Supervisor | null>(null);
  const rigActorsRef = useRef<Map<string, RigActor>>(new Map());
  const [isReady, setIsReady] = useState(false);
  const [activeRigId, setActiveRigId] = useState('rig_alpha');

  useEffect(() => {
    const boot = async () => {
      // Initialize ETS tables
      ets.new<Bead>('beads');
      ets.new('polecats');
      ets.new<RigState>('rigs');
      ets.new('scheduler');
      ets.new('escalations');
      ets.new('stats');

      const supervisor = new Supervisor('gastown');
      await supervisor.start();

      // Start Mayor
      await supervisor.startChild({ name: 'mayor', factory: () => new MayorActor() });

      // Start Polecats (4 by default)
      for (let i = 0; i < 4; i++) {
        await supervisor.startChild({
          name: `polecat_${i}`,
          factory: () => new PolecatActor(),
        });
      }

      // Start Rigs
      const rigNames = ['Alpha', 'Beta', 'Gamma'];
      for (const name of rigNames) {
        const rig = new RigActor(name);
        rigActorsRef.current.set(`rig_${name.toLowerCase()}`, rig);
        await supervisor.startChild({
          name: `rig_${name.toLowerCase()}`,
          factory: () => rig,
        });
      }

      // Start Refinery
      await supervisor.startChild({ name: 'refinery', factory: () => new RefineryActor() });

      supervisorRef.current = supervisor;
      setIsReady(true);

      // Seed some demo beads
      const alphaRig = rigActorsRef.current.get('rig_alpha');
      if (alphaRig) {
        const demoBeads = [
          { title: 'Implement auth middleware', description: 'Add JWT validation to API routes with proper error handling' },
          { title: 'Fix race condition in cache', description: 'ETS table concurrent access causing stale reads under load' },
          { title: 'Add WebSocket heartbeat', description: 'Implement ping/pong frames to detect dead connections' },
          { title: 'Refactor GenServer callbacks', description: 'Extract common patterns into shared behavior module' },
          { title: 'Optimize Ecto queries', description: 'Add preloads and indexes for the dashboard aggregation queries' },
        ];
        for (const b of demoBeads) {
          alphaRig.cast('create_bead', { type: 'create_bead', ...b } as any);
        }
      }
    };

    boot();

    return () => {
      supervisorRef.current?.stop();
      ets.clear();
      pubsub.clear();
    };
  }, []);

  const createBead = useCallback((title: string, description: string) => {
    const rig = rigActorsRef.current.get(activeRigId);
    if (rig) {
      rig.cast('create_bead', { type: 'create_bead', title, description } as any);
    }
  }, [activeRigId]);

  const assignBeadToPolecat = useCallback((beadId: string) => {
    // Find idle polecat
    const polecatsTable = ets.get('polecats');
    if (!polecatsTable) return;

    const polecats = polecatsTable.tab2list();
    const idle = polecats.find(([, p]: [string, any]) => p.status === 'idle');
    if (idle) {
      const polecat = supervisorRef.current?.whichChildren().find(c => c.pid === idle[0]);
      if (polecat) {
        const actor = supervisorRef.current?.getChild(polecat.name);
        if (actor) {
          actor.cast('assign_bead', { type: 'assign_bead', beadId } as any);
        }
      }
    }
  }, []);

  const autoAssignBacklog = useCallback(() => {
    const beadsTable = ets.get<Bead>('beads');
    if (!beadsTable) return;

    const backlogBeads = beadsTable.match((b: Bead) => b.status === 'backlog' && !b.assignedTo);
    for (const [, bead] of backlogBeads) {
      assignBeadToPolecat(bead.id);
    }
  }, [assignBeadToPolecat]);

  const loadModel = useCallback(async (modelId: ModelId) => {
    await webllmEngine.loadModel(modelId);
  }, []);

  return (
    <GasTownContext.Provider value={{
      supervisor: supervisorRef.current,
      isReady,
      activeRigId,
      setActiveRigId,
      createBead,
      assignBeadToPolecat,
      loadModel,
      autoAssignBacklog,
    }}>
      {children}
    </GasTownContext.Provider>
  );
}

export function useGasTown() {
  const ctx = useContext(GasTownContext);
  if (!ctx) throw new Error('useGasTown must be used within GasTownProvider');
  return ctx;
}
