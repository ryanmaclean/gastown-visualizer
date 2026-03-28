// RigSelector — switch between project containers

import React from 'react';
import { useEtsTable } from '../hooks/useEts';
import { useGasTown } from '../context/GasTownContext';
import { RigState } from '../actors/types';
import { Box } from 'lucide-react';

export function RigSelector() {
  const rigs = useEtsTable<RigState>('rigs');
  const { activeRigId, setActiveRigId } = useGasTown();

  return (
    <div className="flex items-center gap-1">
      <Box className="w-4 h-4 text-muted-foreground" />
      {rigs.map(([id, rig]) => (
        <button
          key={id}
          onClick={() => setActiveRigId(id)}
          className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
            activeRigId === id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          {rig.name}
        </button>
      ))}
    </div>
  );
}
