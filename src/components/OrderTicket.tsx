// BeadCard — Copland OS window-style card with pixel icons

import React, { useState, useEffect } from 'react';
import { Bead, PolecatState } from '../actors/types';
import { useEtsLookup } from '../hooks/useEts';
import { useGasTown } from '../context/GasTownContext';
import { AgentIcon } from './CoplandIcons';

function useElapsedTime(startTime: number): string {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function getBeadTags(bead: Bead): { label: string; variant: string }[] {
  const tags: { label: string; variant: string }[] = [];
  if (bead.escalated) tags.push({ label: 'URGENT', variant: 'urgent' });
  if (bead.convoyId) tags.push({ label: 'CONVOY', variant: 'important' });
  const title = bead.title.toLowerCase();
  if (title.includes('ui') || title.includes('design') || title.includes('refactor')) {
    tags.push({ label: 'UI', variant: 'design' });
  }
  if (title.includes('auth') || title.includes('api') || title.includes('cache') || title.includes('query') || title.includes('websocket')) {
    tags.push({ label: 'DEV', variant: 'dev' });
  }
  return tags;
}

const tagStyles: Record<string, string> = {
  urgent: 'bg-[hsl(var(--tag-urgent))] text-primary-foreground',
  important: 'bg-[hsl(var(--tag-important))] text-primary-foreground',
  design: 'bg-[hsl(var(--tag-design))] text-primary-foreground',
  dev: 'bg-muted text-muted-foreground copland-raised',
};

export function OrderTicket({ bead, column }: { bead: Bead; column: string }) {
  const [expanded, setExpanded] = useState(false);
  const polecat = useEtsLookup<PolecatState>('polecats', bead.assignedTo);
  const { assignBeadToPolecat, escalateBead } = useGasTown();
  const timer = useElapsedTime(bead.createdAt);
  const tags = getBeadTags(bead);

  const progress = bead.status === 'merged' ? 100
    : bead.status === 'refinery' ? 75
    : bead.status === 'in_progress' ? Math.min(60, Math.max(10, (bead.tokensGenerated / 50) * 60))
    : 0;

  const progressColor = bead.status === 'merged' ? 'bg-[hsl(var(--status-done))]'
    : bead.status === 'refinery' ? 'bg-[hsl(var(--status-review))]'
    : bead.status === 'in_progress' ? 'bg-[hsl(var(--status-progress))]'
    : 'bg-muted-foreground';

  return (
    <div className="copland-raised bg-card overflow-hidden animate-card-in group">
      {/* Card content */}
      <div className="p-3 space-y-2">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, i) => (
              <span
                key={i}
                className={`inline-flex items-center text-[10px] font-bold tracking-widest px-1.5 py-0.5 ${tagStyles[tag.variant] || 'bg-muted text-muted-foreground'}`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <div>
          <h4 className="text-xs font-bold text-foreground leading-snug">{bead.title}</h4>
          {bead.description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
              {bead.description}
            </p>
          )}
        </div>

        {/* Progress */}
        {progress > 0 && (
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
              <span className="text-muted-foreground">progress</span>
              <span className="font-bold text-foreground tabular-nums">{Math.round(progress)}%</span>
            </div>
            <div className="copland-inset h-2.5 bg-card overflow-hidden p-px">
              <div
                className={`h-full ${progressColor} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Token stream */}
        {bead.tokenStream && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? '▾' : '▸'} output
            </button>
            {expanded && (
              <pre className="mt-1 p-1.5 copland-inset bg-card text-[10px] text-foreground/70 max-h-24 overflow-y-auto whitespace-pre-wrap break-words font-mono">
                {bead.tokenStream}
                {bead.status === 'in_progress' && <span className="animate-blink">▌</span>}
              </pre>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {polecat ? (
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 copland-raised bg-background flex items-center justify-center p-0.5">
                  <AgentIcon name={polecat.name} size={16} />
                </div>
                <span className="text-[10px] text-muted-foreground">{polecat.name}</span>
                {bead.status === 'in_progress' && (
                  <span className="w-1.5 h-1.5 bg-primary animate-pulse-glow" />
                )}
              </div>
            ) : (
              <div className="w-6 h-6 copland-inset bg-card" />
            )}
          </div>

          <span className="text-[10px] text-muted-foreground tabular-nums font-mono">
            ⏱{timer}
          </span>
        </div>
      </div>

      {/* Assign action — raised button */}
      {bead.status === 'backlog' && (
        <button
          onClick={() => assignBeadToPolecat(bead.id)}
          className="w-full py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-1 border-t border-border copland-title-stripes"
        >
          ▷ Assign Agent
        </button>
      )}

      {/* Escalate action — surfaces when bead has stalled and not yet escalated */}
      {bead.status === 'stalled' && !bead.escalated && (
        <button
          onClick={() => escalateBead(bead.id)}
          className="w-full py-1.5 text-[10px] font-bold uppercase tracking-wider text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center justify-center gap-1 border-t border-border copland-title-stripes"
        >
          ⚠ Escalate to Mayor
        </button>
      )}
    </div>
  );
}
