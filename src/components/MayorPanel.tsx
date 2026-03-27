// MayorPanel — escalation queue, directives log

import React from 'react';
import { usePubSub } from '../hooks/usePubSub';
import { useEtsTable } from '../hooks/useEts';
import { EscalationEvent } from '../actors/types';
import { Shield, AlertTriangle } from 'lucide-react';

export function MayorPanel() {
  const directives = usePubSub<{ text: string; timestamp: number }>('mayor:directive', 20);
  const escalations = useEtsTable<EscalationEvent>('escalations');

  const unresolvedCount = escalations.filter(([, e]) => !e.resolved).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <Shield className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground tracking-wide">MAYOR</span>
        {unresolvedCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-destructive font-mono">
            <AlertTriangle className="w-3 h-3" />
            {unresolvedCount}
          </span>
        )}
      </div>

      {/* Directives log */}
      <div className="space-y-1">
        <span className="text-xs font-mono text-muted-foreground px-1">DIRECTIVES</span>
        <div className="max-h-48 overflow-y-auto space-y-0.5">
          {directives.length === 0 && (
            <p className="text-xs text-muted-foreground/50 px-1 font-mono">Waiting...</p>
          )}
          {directives.slice().reverse().map((d, i) => (
            <div key={i} className="text-xs font-mono px-2 py-1 rounded bg-secondary/50 text-foreground/80">
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
        <div className="space-y-1">
          <span className="text-xs font-mono text-muted-foreground px-1">ESCALATIONS</span>
          <div className="max-h-32 overflow-y-auto space-y-0.5">
            {escalations.slice().reverse().map(([id, e]) => (
              <div
                key={id}
                className={`text-xs font-mono px-2 py-1 rounded ${
                  e.resolved ? 'bg-secondary/30 text-muted-foreground' : 'bg-destructive/10 text-destructive'
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
