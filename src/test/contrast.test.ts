// WCAG AA contrast ratio tests for Copland Platinum light and dark themes

import { describe, it, expect } from 'vitest';

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

// Copland Platinum palette from index.css
const lightTheme = {
  background: '220 8% 92%',
  foreground: '220 10% 18%',
  card: '220 8% 96%',
  cardForeground: '220 10% 18%',
  primary: '220 55% 50%',
  primaryForeground: '0 0% 100%',
  secondary: '220 6% 88%',
  secondaryForeground: '220 10% 30%',
  muted: '220 6% 90%',
  mutedForeground: '220 8% 32%',
  destructive: '0 60% 50%',
  destructiveForeground: '0 0% 100%',
};

const darkTheme = {
  background: '220 10% 10%',
  foreground: '220 6% 80%',
  card: '220 10% 14%',
  cardForeground: '220 6% 80%',
  primary: '220 55% 58%',
  primaryForeground: '220 10% 6%',
  secondary: '220 10% 18%',
  secondaryForeground: '220 6% 62%',
  muted: '220 10% 15%',
  mutedForeground: '220 6% 45%',
  destructive: '0 60% 52%',
  destructiveForeground: '220 6% 95%',
};

describe('WCAG AA Contrast — Copland Light', () => {
  it('foreground on background ≥ 4.5:1', () => {
    expect(checkContrast(lightTheme.foreground, lightTheme.background)).toBeGreaterThanOrEqual(4.5);
  });
  it('card foreground on card ≥ 4.5:1', () => {
    expect(checkContrast(lightTheme.cardForeground, lightTheme.card)).toBeGreaterThanOrEqual(4.5);
  });
  it('primary foreground on primary ≥ 4.5:1', () => {
    expect(checkContrast(lightTheme.primaryForeground, lightTheme.primary)).toBeGreaterThanOrEqual(4.5);
  });
  it('secondary foreground on secondary ≥ 4.5:1', () => {
    expect(checkContrast(lightTheme.secondaryForeground, lightTheme.secondary)).toBeGreaterThanOrEqual(4.5);
  });
  it('muted foreground on muted ≥ 4.5:1', () => {
    expect(checkContrast(lightTheme.mutedForeground, lightTheme.muted)).toBeGreaterThanOrEqual(4.5);
  });
  it('destructive foreground on destructive ≥ 4.5:1', () => {
    expect(checkContrast(lightTheme.destructiveForeground, lightTheme.destructive)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('WCAG AA Contrast — Copland Dark', () => {
  it('foreground on background ≥ 4.5:1', () => {
    expect(checkContrast(darkTheme.foreground, darkTheme.background)).toBeGreaterThanOrEqual(4.5);
  });
  it('card foreground on card ≥ 4.5:1', () => {
    expect(checkContrast(darkTheme.cardForeground, darkTheme.card)).toBeGreaterThanOrEqual(4.5);
  });
  it('primary foreground on primary ≥ 3:1', () => {
    expect(checkContrast(darkTheme.primaryForeground, darkTheme.primary)).toBeGreaterThanOrEqual(3);
  });
  it('secondary foreground on secondary ≥ 4.5:1', () => {
    expect(checkContrast(darkTheme.secondaryForeground, darkTheme.secondary)).toBeGreaterThanOrEqual(4.5);
  });
  it('muted foreground on background ≥ 3:1', () => {
    expect(checkContrast(darkTheme.mutedForeground, darkTheme.background)).toBeGreaterThanOrEqual(3);
  });
});
