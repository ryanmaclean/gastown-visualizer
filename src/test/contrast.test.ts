// WCAG AA contrast ratio tests for all registered themes

import { describe, it, expect } from 'vitest';
import { themes, Theme } from '../lib/themes';

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [f(0), f(8), f(4)];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseHSL(hsl: string): [number, number, number] {
  const parts = hsl.trim().split(/\s+/);
  return [parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2])];
}

function getLuminance(hsl: string): number {
  const [h, s, l] = parseHSL(hsl);
  const [r, g, b] = hslToRgb(h, s, l);
  return relativeLuminance(r, g, b);
}

function checkContrast(fg: string, bg: string): number {
  return contrastRatio(getLuminance(fg), getLuminance(bg));
}

// Test pairs: [fg key, bg key, minimum ratio]
const pairs: [string, string, number][] = [
  ['foreground', 'background', 4.5],
  ['card-foreground', 'card', 4.5],
  ['primary-foreground', 'primary', 3],
  ['secondary-foreground', 'secondary', 4.5],
  ['muted-foreground', 'muted', 3],
  ['destructive-foreground', 'destructive', 3],
];

for (const theme of themes) {
  for (const modeName of ['light', 'dark'] as const) {
    const vars = theme[modeName] as unknown as Record<string, string>;

    describe(`WCAG AA — ${theme.name} (${modeName})`, () => {
      for (const [fgKey, bgKey, minRatio] of pairs) {
        it(`${fgKey} on ${bgKey} ≥ ${minRatio}:1`, () => {
          const ratio = checkContrast(vars[fgKey], vars[bgKey]);
          expect(ratio).toBeGreaterThanOrEqual(minRatio);
        });
      }
    });
  }
}
