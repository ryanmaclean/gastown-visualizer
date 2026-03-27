// BeadCard — Retro bitmap aesthetic with bracket frames, stipple textures

import React, { useState, useEffect } from 'react';
import { Bead, PolecatState } from '../actors/types';
import { useEtsLookup } from '../hooks/useEts';
import { useGasTown } from '../context/GasTownContext';
import {
  ChevronDown, ChevronRight,
  MessageSquare, Clock, Cpu, Play, AlertTriangle, Zap
} from 'lucide-react';

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
  if (bead.escalated) tags.push({ label: 'urgent', variant: 'urgent' });
  if (bead.convoyId) tags.push({ label: 'convoy', variant: 'important' });
  const title = bead.title.toLowerCase();
  if (title.includes('ui') || title.includes('design') || title.includes('refactor')) {
    tags.push({ label: 'design', variant: 'design' });
  }
  if (title.includes('auth') || title.includes('api') || title.includes('cache') || title.includes('query') || title.includes('websocket')) {
    tags.push({ label: 'dev', variant: 'dev' });
  }
  return tags;
}

const tagStyles: Record<string, string> = {
  urgent: 'border-[hsl(var(--tag-urgent))] text-[hsl(var(--tag-urgent))] bg-[hsl(var(--tag-urgent)/0.06)]',
  important: 'border-[hsl(var(--tag-important))] text-[hsl(var(--tag-important))] bg-[hsl(var(--tag-important)/0.06)]',
  design: 'border-[hsl(var(--tag-design))] text-[hsl(var(--tag-design))] bg-[hsl(var(--tag-design)/0.06)]',
  dev: 'border-muted-foreground text-muted-foreground bg-muted',
};

export function OrderTicket({ bead, column }: { bead: Bead; column: string }) {
  const [expanded, setExpanded] = useState(false);
  const polecat = useEtsLookup<PolecatState>('polecats', bead.assignedTo);
  const { assignBeadToPolecat } = useGasTown();
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
    <div className="bracket-frame border border-border bg-card hover:border-primary/30 transition-all duration-150 overflow-hidden animate-card-in group">
      <div className="p-3 space-y-2.5">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, i) => (
              <span
                key={i}
                className={`inline-flex items-center text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 border ${tagStyles[tag.variant] || 'border-border text-muted-foreground'}`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}

        {/* Title & description */}
        <div>
          <h4 className="text-xs font-bold text-foreground leading-snug">{bead.title}</h4>
          {bead.description && (
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
              {bead.description}
            </p>
          )}
        </div>

        {/* Progress */}
        {progress > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-wider">
              <span className="text-muted-foreground">progress</span>
              <span className="font-bold text-foreground tabular-nums">{Math.round(progress)}%</span>
            </div>
            <div className="h-1 bg-muted overflow-hidden">
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
              {expanded ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
              <MessageSquare className="w-2.5 h-2.5" />
              output
            </button>
            {expanded && (
              <pre className="mt-1.5 p-2 bg-muted border border-border text-[10px] text-foreground/70 max-h-24 overflow-y-auto whitespace-pre-wrap break-words font-mono">
                {bead.tokenStream}
                {bead.status === 'in_progress' && <span className="animate-blink">▌</span>}
              </pre>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            {polecat ? (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 border border-border bg-background flex items-center justify-center text-[8px] font-bold text-foreground">
                  {polecat.name.charAt(0)}
                </div>
                <span className="text-[10px] text-muted-foreground">{polecat.name}</span>
                {bead.status === 'in_progress' && (
                  <span className="w-1 h-1 bg-primary animate-pulse-glow" />
                )}
              </div>
            ) : (
              <div className="w-5 h-5 border border-dashed border-border" />
            )}

            {bead.tokensGenerated > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground tabular-nums">
                <Cpu className="w-2.5 h-2.5" /> {bead.tokensGenerated}
              </span>
            )}
          </div>

          <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground tabular-nums">
            <Clock className="w-2.5 h-2.5" />
            {timer}
          </span>
        </div>
      </div>

      {/* Assign action */}
      {bead.status === 'backlog' && (
        <button
          onClick={() => assignBeadToPolecat(bead.id)}
          className="w-full py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-accent transition-colors flex items-center justify-center gap-1 border-t border-border"
        >
          <Play className="w-3 h-3" /> assign agent
        </button>
      )}
    </div>
  );
}
