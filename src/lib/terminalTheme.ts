const FALLBACK_VARS: Record<string, string> = {
  background: '220 8% 92%',
  foreground: '220 10% 18%',
  card: '220 8% 96%',
  'card-foreground': '220 10% 18%',
  primary: '220 55% 50%',
  'accent-foreground': '220 55% 42%',
  'muted-foreground': '220 8% 32%',
  'terminal-green': '145 40% 36%',
  'terminal-amber': '30 75% 44%',
  'terminal-red': '0 60% 45%',
  'terminal-cyan': '200 35% 42%',
};

type HslColor = {
  h: number;
  s: number;
  l: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseHsl(value: string | undefined, fallback: string): HslColor {
  const source = (value || fallback).trim();
  const parts = source.split(/\s+/);

  return {
    h: parseFloat(parts[0]) || 0,
    s: parseFloat(parts[1]) || 0,
    l: parseFloat(parts[2]) || 0,
  };
}

function hslToRgb(color: HslColor): [number, number, number] {
  const s = color.s / 100;
  const l = color.l / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + color.h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };

  return [f(0), f(8), f(4)];
}

function hslToHex(color: HslColor): string {
  const [r, g, b] = hslToRgb(color);
  const toHex = (channel: number) => Math.round(channel * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function relativeLuminance(color: HslColor): number {
  const [r, g, b] = hslToRgb(color).map(channel => (
    channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
  ));

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: HslColor, b: HslColor): number {
  const lighter = Math.max(relativeLuminance(a), relativeLuminance(b));
  const darker = Math.min(relativeLuminance(a), relativeLuminance(b));
  return (lighter + 0.05) / (darker + 0.05);
}

function ensureContrast(color: HslColor, background: HslColor, minRatio: number): HslColor {
  if (contrastRatio(color, background) >= minRatio) {
    return color;
  }

  const direction = background.l >= 50 ? -1 : 1;
  let adjusted = { ...color };

  for (let step = 0; step < 100; step += 1) {
    adjusted = {
      ...adjusted,
      l: clamp(adjusted.l + direction, 0, 100),
    };

    if (contrastRatio(adjusted, background) >= minRatio || adjusted.l === 0 || adjusted.l === 100) {
      return adjusted;
    }
  }

  return adjusted;
}

function hexToRgbString(hex: string): string {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized;

  return `${parseInt(full.slice(0, 2), 16)}, ${parseInt(full.slice(2, 4), 16)}, ${parseInt(full.slice(4, 6), 16)}`;
}

function readVar(styles: CSSStyleDeclaration, name: string): string {
  return styles.getPropertyValue(name).trim() || FALLBACK_VARS[name.replace('--', '')] || '';
}

export function buildTerminalThemeFromVars(vars: Record<string, string>): Record<string, string> {
  const background = parseHsl(vars.card ?? vars.background, FALLBACK_VARS.card);
  const foreground = ensureContrast(
    parseHsl(vars['card-foreground'] ?? vars.foreground, FALLBACK_VARS['card-foreground']),
    background,
    4.5,
  );
  const primary = ensureContrast(parseHsl(vars.primary, FALLBACK_VARS.primary), background, 4.5);
  const accentForeground = ensureContrast(
    parseHsl(vars['accent-foreground'], FALLBACK_VARS['accent-foreground']),
    background,
    4.5,
  );
  const muted = ensureContrast(
    parseHsl(vars['muted-foreground'], FALLBACK_VARS['muted-foreground']),
    background,
    3,
  );
  const green = ensureContrast(parseHsl(vars['terminal-green'], FALLBACK_VARS['terminal-green']), background, 4.5);
  const amber = ensureContrast(parseHsl(vars['terminal-amber'], FALLBACK_VARS['terminal-amber']), background, 4.5);
  const red = ensureContrast(parseHsl(vars['terminal-red'], FALLBACK_VARS['terminal-red']), background, 4.5);
  const cyan = ensureContrast(parseHsl(vars['terminal-cyan'], FALLBACK_VARS['terminal-cyan']), background, 4.5);

  const backgroundHex = hslToHex(background);
  const foregroundHex = hslToHex(foreground);
  const primaryHex = hslToHex(primary);
  const accentHex = hslToHex(accentForeground);
  const mutedHex = hslToHex(muted);
  const greenHex = hslToHex(green);
  const amberHex = hslToHex(amber);
  const redHex = hslToHex(red);
  const cyanHex = hslToHex(cyan);

  return {
    background: backgroundHex,
    foreground: foregroundHex,
    cursor: primaryHex,
    cursorAccent: backgroundHex,
    selectionBackground: `rgba(${hexToRgbString(primaryHex)}, 0.22)`,
    black: backgroundHex,
    red: redHex,
    green: greenHex,
    yellow: amberHex,
    blue: primaryHex,
    magenta: accentHex,
    cyan: cyanHex,
    white: foregroundHex,
    brightBlack: mutedHex,
    brightRed: redHex,
    brightGreen: greenHex,
    brightYellow: amberHex,
    brightBlue: primaryHex,
    brightMagenta: accentHex,
    brightCyan: cyanHex,
    brightWhite: foregroundHex,
  };
}

export function buildTerminalThemeFromDocument(): Record<string, string> {
  const styles = getComputedStyle(document.documentElement);

  return buildTerminalThemeFromVars({
    background: readVar(styles, '--background'),
    foreground: readVar(styles, '--foreground'),
    card: readVar(styles, '--card'),
    'card-foreground': readVar(styles, '--card-foreground'),
    primary: readVar(styles, '--primary'),
    'accent-foreground': readVar(styles, '--accent-foreground'),
    'muted-foreground': readVar(styles, '--muted-foreground'),
    'terminal-green': readVar(styles, '--terminal-green'),
    'terminal-amber': readVar(styles, '--terminal-amber'),
    'terminal-red': readVar(styles, '--terminal-red'),
    'terminal-cyan': readVar(styles, '--terminal-cyan'),
  });
}