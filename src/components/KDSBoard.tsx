// KDSBoard — Kitchen Display System style board with station lanes

import React from 'react';
import { useEtsTable } from '../hooks/useEts';
import { useGasTown } from '../context/GasTownContext';
import { Bead, BeadStatus } from '../actors/types';
import { OrderTicket } from './OrderTicket';
import { ClipboardList, Flame, Wrench, CircleCheckBig } from 'lucide-react';

interface Station {
  key: BeadStatus | 'stalled';
  label: string;
  sublabel: string;
  headerColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

const stations: Station[] = [
  {
    key: 'backlog',
    label: 'ORDER QUEUE',
    sublabel: 'Awaiting prep',
    headerColor: 'bg-secondary text-secondary-foreground',
    borderColor: 'border-secondary',
    icon: <ClipboardList className="w-4 h-4" />,
  },
  {
    key: 'in_progress',
    label: 'ON THE GRILL',
    sublabel: 'Inference active',
    headerColor: 'bg-kds-grill text-primary-foreground',
    borderColor: 'border-kds-grill',
    icon: <Flame className="w-4 h-4" />,
  },
  {
    key: 'refinery',
    label: 'ASSEMBLY',
    sublabel: 'Quality check',
    headerColor: 'bg-kds-assembly text-white',
    borderColor: 'border-kds-assembly',
    icon: <Wrench className="w-4 h-4" />,
  },
  {
    key: 'merged',
    label: 'SERVED',
    sublabel: 'Complete',
    headerColor: 'bg-kds-done text-primary-foreground',
    borderColor: 'border-kds-done',
    icon: <CircleCheckBig className="w-4 h-4" />,
  },
];

export function KDSBoard() {
  const allBeads = useEtsTable<Bead>('beads');
  const { activeRigId } = useGasTown();

  const rigBeads = allBeads.filter(([, b]) => b.rigId === activeRigId);

  const beadsByStation = (stationKey: string): Bead[] => {
    if (stationKey === 'in_progress') {
      return rigBeads
        .filter(([, b]) => b.status === 'in_progress' || b.status === 'stalled')
        .map(([, b]) => b)
        .sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return rigBeads
      .filter(([, b]) => b.status === stationKey)
      .map(([, b]) => b)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  };

  return (
    <div className="grid grid-cols-4 gap-3 h-full">
      {stations.map((station) => {
        const beads = beadsByStation(station.key);
        return (
          <div key={station.key} className="flex flex-col min-h-0 rounded-lg overflow-hidden bg-muted/30">
            {/* Station header */}
            <div className={`kds-station-header ${station.headerColor} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                {station.icon}
                <div>
                  <div className="text-xs font-bold tracking-widest">{station.label}</div>
                  <div className="text-[10px] opacity-70 font-normal tracking-normal">{station.sublabel}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tabular-nums">{beads.length}</span>
                {station.key === 'in_progress' && beads.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse-glow" />
                )}
              </div>
            </div>

            {/* Tickets */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {beads.map((bead) => (
                <OrderTicket key={bead.id} bead={bead} stationColor={station.borderColor} />
              ))}
              {beads.length === 0 && (
                <div className="flex items-center justify-center h-24 text-xs text-muted-foreground/40 font-mono">
                  No orders
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
