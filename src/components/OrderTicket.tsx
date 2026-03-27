// BeadCard — Planify-style rich card with tags, progress, avatars

import React, { useState, useEffect } from 'react';
import { Bead, PolecatState } from '../actors/types';
import { useEtsLookup } from '../hooks/useEts';
import { useGasTown } from '../context/GasTownContext';
import {
  ChevronDown, ChevronRight, Flame,
  AlertTriangle, Zap, MessageSquare, Clock, Cpu, Play
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

// Tag configurations
function getBeadTags(bead: Bead): { label: string; variant: string }[] {
  const tags: { label: string; variant: string }[] = [];

  if (bead.escalated) tags.push({ label: '🔴 Urgent', variant: 'urgent' });
  if (bead.convoyId) tags.push({ label: '⚡ Convoy', variant: 'important' });

  // Infer type tags from title keywords
  const title = bead.title.toLowerCase();
  if (title.includes('ui') || title.includes('design') || title.includes('refactor')) {
    tags.push({ label: '🎨 UI Design', variant: 'design' });
  }
  if (title.includes('auth') || title.includes('api') || title.includes('cache') || title.includes('query') || title.includes('websocket')) {
    tags.push({ label: '💻 Dev', variant: 'dev' });
  }

  return tags;
}

const tagStyles: Record<string, string> = {
  urgent: 'bg-[hsl(var(--tag-urgent)/0.12)] text-[hsl(var(--tag-urgent))]',
  important: 'bg-[hsl(var(--tag-important)/0.12)] text-[hsl(var(--tag-important))]',
  design: 'bg-[hsl(var(--tag-design)/0.12)] text-[hsl(var(--tag-design))]',
  dev: 'bg-[hsl(var(--tag-dev)/0.12)] text-[hsl(var(--tag-dev))]',
};

export function OrderTicket({ bead, column }: { bead: Bead; column: string }) {
  const [expanded, setExpanded] = useState(false);
  const polecat = useEtsLookup<PolecatState>('polecats', bead.assignedTo);
  const { assignBeadToPolecat } = useGasTown();
  const timer = useElapsedTime(bead.createdAt);
  const tags = getBeadTags(bead);

  // Progress
  const progress = bead.status === 'merged' ? 100
    : bead.status === 'refinery' ? 75
    : bead.status === 'in_progress' ? Math.min(60, Math.max(10, (bead.tokensGenerated / 50) * 60))
    : 0;

  const progressColor = bead.status === 'merged' ? 'bg-[hsl(var(--status-done))]'
    : bead.status === 'refinery' ? 'bg-[hsl(var(--status-review))]'
    : bead.status === 'in_progress' ? 'bg-[hsl(var(--status-progress))]'
    : 'bg-muted-foreground';

  return (
    <div className="rounded-xl bg-card border border-border hover:shadow-md transition-all duration-200 overflow-hidden animate-card-in group">
      <div className="p-4 space-y-3">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span
                key={i}
                className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md ${tagStyles[tag.variant] || 'bg-muted text-muted-foreground'}`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}

        {/* Title & description */}
        <div>
          <h4 className="text-sm font-semibold text-foreground leading-snug">{bead.title}</h4>
          {bead.description && (
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2 italic">
              {bead.description}
            </p>
          )}
        </div>

        {/* Progress bar */}
        {progress > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">On Progress</span>
              <span className="font-mono font-medium text-foreground">
                {bead.tokensGenerated > 0 ? `${bead.tokensGenerated}` : ''}/{bead.status === 'merged' ? bead.tokensGenerated : '50'}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${progressColor} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Token stream expandable */}
        {bead.tokenStream && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <MessageSquare className="w-3 h-3" />
              output
            </button>
            {expanded && (
              <pre className="mt-2 p-2.5 bg-muted rounded-lg text-[11px] text-foreground/80 max-h-28 overflow-y-auto whitespace-pre-wrap break-words font-mono border border-border">
                {bead.tokenStream}
                {bead.status === 'in_progress' && <span className="animate-blink">▌</span>}
              </pre>
            )}
          </div>
        )}

        {/* Footer: avatars, metrics, timer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {/* Polecat avatars */}
            {polecat ? (
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-accent border border-border flex items-center justify-center text-[10px] font-semibold text-accent-foreground">
                  {polecat.name.charAt(0).toUpperCase()}
                </div>
                {bead.status === 'in_progress' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--status-progress))] animate-pulse-glow" />
                )}
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-muted border border-dashed border-border" />
            )}

            {/* Metrics */}
            {bead.tokensGenerated > 0 && (
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Cpu className="w-3 h-3" /> {bead.tokensGenerated}
                </span>
                {bead.tokensPerSec > 0 && (
                  <span>{bead.tokensPerSec.toFixed(1)} t/s</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
            <Clock className="w-3 h-3" />
            {timer}
          </div>
        </div>
      </div>

      {/* Assign action for backlog */}
      {bead.status === 'backlog' && (
        <button
          onClick={() => assignBeadToPolecat(bead.id)}
          className="w-full py-2 text-xs font-semibold text-primary hover:bg-accent transition-colors flex items-center justify-center gap-1.5 border-t border-border"
        >
          <Play className="w-3.5 h-3.5" /> Assign Agent
        </button>
      )}
    </div>
  );
}
