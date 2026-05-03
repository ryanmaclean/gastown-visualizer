// GasTownContext — provides the actor system and model loading to React tree

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Supervisor } from '../lib/otp/supervisor';
import { ets } from '../lib/otp/ets';
import { pubsub } from '../lib/otp/pubsub';
import { MayorActor } from '../actors/mayor';
import { PolecatActor, resetPolecatIndex } from '../actors/polecat';
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
  abortBead: (beadId: string) => void;
  loadModel: (modelId: ModelId) => Promise<void>;
  autoAssignBacklog: () => void;
}

const GasTownContext = createContext<GasTownContextValue | null>(null);

export function GasTownProvider({ children }: { children: React.ReactNode }) {
  const rigActorsRef = useRef<Map<string, RigActor>>(new Map());
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [activeRigId, setActiveRigIdState] = useState<string>(() => {
    try { return localStorage.getItem('gastown:activeRigId') || 'rig_alpha'; }
    catch { return 'rig_alpha'; }
  });
  const setActiveRigId = useCallback((id: string) => {
    setActiveRigIdState(id);
    try { localStorage.setItem('gastown:activeRigId', id); } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    let localSupervisor: Supervisor | null = null;

    const boot = async () => {
      // Initialize ETS tables
      ets.new<Bead>('beads');
      ets.new('polecats');
      ets.new<RigState>('rigs');
      ets.new('scheduler');
      ets.new('escalations');
      ets.new('stats');

      const sup = new Supervisor('gastown');
      localSupervisor = sup;
      resetPolecatIndex();
      await sup.start();
      if (cancelled) { await sup.stop(); return; }

      await sup.startChild({ name: 'mayor', factory: () => new MayorActor() });

      for (let i = 0; i < 4; i++) {
        await sup.startChild({ name: `polecat_${i}`, factory: () => new PolecatActor() });
      }

      const rigNames = ['Alpha', 'Beta', 'Gamma'];
      rigActorsRef.current.clear();
      for (const name of rigNames) {
        const rig = new RigActor(name);
        rigActorsRef.current.set(`rig_${name.toLowerCase()}`, rig);
        await sup.startChild({ name: `rig_${name.toLowerCase()}`, factory: () => rig });
      }

      await sup.startChild({ name: 'refinery', factory: () => new RefineryActor() });

      if (cancelled) { await sup.stop(); return; }
      setSupervisor(sup);
      setIsReady(true);

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
      cancelled = true;
      localSupervisor?.stop();
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
    const sup = supervisor;
    if (!sup) return;

    const children = sup.whichChildren().filter(c => c.name.startsWith('polecat_'));
    for (const child of children) {
      const actor = sup.getChild(child.name);
      if (!actor) continue;
      const polecatsTable = ets.get('polecats');
      const state: any = polecatsTable?.lookup(child.pid);
      if (state?.status === 'idle') {
        actor.cast('assign_bead', { type: 'assign_bead', beadId } as any);
        return;
      }
    }
  }, [supervisor]);

  const abortBead = useCallback((beadId: string) => {
    const sup = supervisor;
    if (!sup) return;
    const beadsTable = ets.get<Bead>('beads');
    const bead = beadsTable?.lookup(beadId);
    if (!bead?.assignedTo) return;
    const children = sup.whichChildren().filter(c => c.name.startsWith('polecat_'));
    const child = children.find(c => c.pid === bead.assignedTo);
    if (!child) return;
    const actor = sup.getChild(child.name);
    actor?.cast('abort_bead', { type: 'abort_bead' } as any);
    if (beadsTable) {
      beadsTable.insert(beadId, { ...bead, status: 'backlog', assignedTo: null, updatedAt: Date.now() });
      pubsub.broadcast('bead:updated', { beadId, status: 'backlog' });
    }
  }, [supervisor]);

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
      supervisor,
      isReady,
      activeRigId,
      setActiveRigId,
      createBead,
      assignBeadToPolecat,
      abortBead,
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
