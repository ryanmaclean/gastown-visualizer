// MayorPanel — Copland OS style with pixel shield

import React from 'react';
import { usePubSub } from '../hooks/usePubSub';
import { useEtsTable } from '../hooks/useEts';
import { EscalationEvent } from '../actors/types';
import { PixelShield } from './CoplandIcons';

export function MayorPanel() {
  const directives = usePubSub<{ text: string; timestamp: number }>('mayor:directive', 20);
  const escalations = useEtsTable<EscalationEvent>('escalations');

  const unresolvedCount = escalations.filter(([, e]) => !e.resolved).length;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <PixelShield size={14} />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mayor</span>
        {unresolvedCount > 0 && (
          <span className="text-[10px] text-destructive font-mono font-bold">
            ⚠{unresolvedCount}
          </span>
        )}
      </div>

      {/* Directives log */}
      <div className="space-y-0.5">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Directives</span>
        <div className="copland-inset bg-card max-h-32 overflow-y-auto p-1">
          {directives.length === 0 && (
            <p className="text-[10px] text-muted-foreground/50 font-mono">Waiting...</p>
          )}
          {directives.slice().reverse().map((d, i) => (
            <div key={i} className="text-[10px] font-mono px-1 py-0.5 text-foreground/80 hover:bg-primary hover:text-primary-foreground">
              <span className="text-muted-foreground">
                {new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              {' '}{d.text}
            </div>
          ))}
        </div>
      </div>

      {/* Escalation queue */}
      {escalations.length > 0 && (
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Escalations</span>
          <div className="copland-inset bg-card max-h-24 overflow-y-auto p-1">
            {escalations.slice().reverse().map(([id, e]) => (
              <div
                key={id}
                className={`text-[10px] font-mono px-1 py-0.5 ${
                  e.resolved ? 'text-muted-foreground' : 'text-destructive'
                }`}
              >
                {e.beadId} → {e.resolved ? '✓ resolved' : '⚠ pending'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
