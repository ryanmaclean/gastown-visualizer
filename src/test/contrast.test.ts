// WCAG AA contrast ratio tests for both light and dark themes
// Tests that key foreground/background pairs meet 4.5:1 for normal text, 3:1 for large text

import { describe, it, expect } from 'vitest';

// Parse HSL string "H S% L%" → relative luminance
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

function checkContrast(fg: string, bg: string, minRatio: number = 4.5): number {
  const fgL = getLuminance(fg);
  const bgL = getLuminance(bg);
  return contrastRatio(fgL, bgL);
}

// Theme definitions matching index.css
const lightTheme = {
  background: '0 0% 98%',
  foreground: '220 15% 15%',
  card: '0 0% 100%',
  cardForeground: '220 15% 15%',
  primary: '142 60% 38%',
  primaryForeground: '0 0% 100%',
  secondary: '220 14% 92%',
  secondaryForeground: '220 12% 40%',
  muted: '220 14% 94%',
  mutedForeground: '220 10% 42%',
  destructive: '0 72% 48%',
  destructiveForeground: '0 0% 100%',
  kdsGrill: '30 85% 46%',
  kdsDone: '142 60% 38%',
  kdsAssembly: '280 55% 48%',
  kdsAlert: '0 72% 48%',
  kdsPrep: '199 80% 42%',
};

const darkTheme = {
  background: '220 15% 8%',
  foreground: '210 20% 90%',
  card: '220 15% 12%',
  cardForeground: '210 20% 90%',
  primary: '142 70% 52%',
  primaryForeground: '220 20% 4%',
  secondary: '220 12% 16%',
  secondaryForeground: '210 15% 75%',
  muted: '220 12% 14%',
  mutedForeground: '210 10% 50%',
  destructive: '0 72% 51%',
  destructiveForeground: '210 40% 98%',
  kdsGrill: '38 90% 55%',
  kdsDone: '142 70% 52%',
  kdsAssembly: '280 65% 55%',
  kdsAlert: '0 72% 51%',
  kdsPrep: '199 89% 48%',
};

describe('WCAG AA Contrast — Light Theme', () => {
  it('foreground on background ≥ 4.5:1', () => {
    const ratio = checkContrast(lightTheme.foreground, lightTheme.background);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('card foreground on card ≥ 4.5:1', () => {
    const ratio = checkContrast(lightTheme.cardForeground, lightTheme.card);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('primary foreground on primary ≥ 4.5:1', () => {
    const ratio = checkContrast(lightTheme.primaryForeground, lightTheme.primary);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('secondary foreground on secondary ≥ 4.5:1', () => {
    const ratio = checkContrast(lightTheme.secondaryForeground, lightTheme.secondary);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('muted foreground on muted ≥ 4.5:1', () => {
    const ratio = checkContrast(lightTheme.mutedForeground, lightTheme.muted);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('destructive foreground on destructive ≥ 4.5:1', () => {
    const ratio = checkContrast(lightTheme.destructiveForeground, lightTheme.destructive);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  // Large text (3:1) for KDS station colors on white
  it('kds-grill on white ≥ 3:1 (large text)', () => {
    const ratio = checkContrast(lightTheme.kdsGrill, lightTheme.card);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  it('kds-done on white ≥ 3:1 (large text)', () => {
    const ratio = checkContrast(lightTheme.kdsDone, lightTheme.card);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  it('kds-assembly on white ≥ 3:1 (large text)', () => {
    const ratio = checkContrast(lightTheme.kdsAssembly, lightTheme.card);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  it('kds-alert on white ≥ 3:1 (large text)', () => {
    const ratio = checkContrast(lightTheme.kdsAlert, lightTheme.card);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });
});

describe('WCAG AA Contrast — Dark Theme', () => {
  it('foreground on background ≥ 4.5:1', () => {
    const ratio = checkContrast(darkTheme.foreground, darkTheme.background);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('card foreground on card ≥ 4.5:1', () => {
    const ratio = checkContrast(darkTheme.cardForeground, darkTheme.card);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('primary foreground on primary ≥ 3:1 (large text)', () => {
    const ratio = checkContrast(darkTheme.primaryForeground, darkTheme.primary);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  it('secondary foreground on secondary ≥ 4.5:1', () => {
    const ratio = checkContrast(darkTheme.secondaryForeground, darkTheme.secondary);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('muted foreground on background ≥ 3:1', () => {
    const ratio = checkContrast(darkTheme.mutedForeground, darkTheme.background);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  it('kds-grill on card ≥ 3:1 (large text)', () => {
    const ratio = checkContrast(darkTheme.kdsGrill, darkTheme.card);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  it('kds-done on card ≥ 3:1 (large text)', () => {
    const ratio = checkContrast(darkTheme.kdsDone, darkTheme.card);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });
});
