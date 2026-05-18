// UI scale switcher — persists to localStorage, applies via --ui-scale on <html>
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export const SCALES = [
  { value: 1, label: '1×' },
  { value: 1.25, label: '1.25×' },
  { value: 1.5, label: '1.5×' },
  { value: 1.75, label: '1.75×' },
  { value: 2, label: '2×' },
] as const;

const STORAGE_KEY = 'gastown:ui-scale';

export function applyStoredScale() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const n = raw ? parseFloat(raw) : 2;
  document.documentElement.style.setProperty('--ui-scale', String(Number.isFinite(n) ? n : 2));
}

export function useScale() {
  const [scale, setScale] = useState<number>(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const n = raw ? parseFloat(raw) : 2;
    return Number.isFinite(n) ? n : 2;
  });

  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  useEffect(() => {
    document.documentElement.style.setProperty('--ui-scale', String(scale));
    localStorage.setItem(STORAGE_KEY, String(scale));
  }, [scale]);

  const cycleUp = useCallback(() => {
    const idx = SCALES.findIndex(s => s.value === scaleRef.current);
    const next = SCALES[Math.min(idx + 1, SCALES.length - 1)];
    if (next) setScale(next.value);
  }, []);

  const cycleDown = useCallback(() => {
    const idx = SCALES.findIndex(s => s.value === scaleRef.current);
    const prev = SCALES[Math.max(idx - 1, 0)];
    if (prev) setScale(prev.value);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        cycleUp();
      } else if (e.key === '-') {
        e.preventDefault();
        cycleDown();
      } else if (e.key === '0') {
        e.preventDefault();
        setScale(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cycleUp, cycleDown]);

  return { scale, setScale, cycleUp, cycleDown };
}

export function ScaleSwitcher() {
  const { scale, setScale } = useScale();

  return (
    <div className="copland-inset bg-card flex items-center gap-px p-0.5" title="UI scale (Alt +/-/0)">
      {SCALES.map(s => (
        <button
          key={s.value}
          onClick={() => setScale(s.value)}
          className={`px-1.5 py-0.5 text-[10px] font-mono transition-colors ${
            scale === s.value
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-secondary'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
