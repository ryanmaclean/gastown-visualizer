// Theme registry — shadcn/ui CSS variable convention
// Each theme provides light + dark HSL values for all semantic tokens.

export interface ThemeVars {
  background: string;
  foreground: string;
  card: string;
  'card-foreground': string;
  popover: string;
  'popover-foreground': string;
  primary: string;
  'primary-foreground': string;
  secondary: string;
  'secondary-foreground': string;
  muted: string;
  'muted-foreground': string;
  accent: string;
  'accent-foreground': string;
  destructive: string;
  'destructive-foreground': string;
  border: string;
  input: string;
  ring: string;
  'terminal-green': string;
  'terminal-amber': string;
  'terminal-red': string;
  'terminal-cyan': string;
}

export interface Theme {
  id: string;
  name: string;
  light: ThemeVars;
  dark: ThemeVars;
}

const coplandPlatinum: Theme = {
  id: 'copland',
  name: 'Copland Platinum',
  light: {
    background: '220 8% 92%',
    foreground: '220 10% 18%',
    card: '220 8% 96%',
    'card-foreground': '220 10% 18%',
    popover: '220 8% 96%',
    'popover-foreground': '220 10% 18%',
    primary: '220 55% 50%',
    'primary-foreground': '0 0% 100%',
    secondary: '220 6% 88%',
    'secondary-foreground': '220 10% 30%',
    muted: '220 6% 90%',
    'muted-foreground': '220 8% 32%',
    accent: '220 30% 90%',
    'accent-foreground': '220 55% 42%',
    destructive: '0 60% 50%',
    'destructive-foreground': '0 0% 100%',
    border: '220 8% 78%',
    input: '220 8% 82%',
    ring: '220 55% 50%',
    'terminal-green': '145 40% 36%',
    'terminal-amber': '30 75% 44%',
    'terminal-red': '0 60% 45%',
    'terminal-cyan': '200 35% 42%',
  },
  dark: {
    background: '220 10% 10%',
    foreground: '220 6% 80%',
    card: '220 10% 14%',
    'card-foreground': '220 6% 80%',
    popover: '220 10% 14%',
    'popover-foreground': '220 6% 80%',
    primary: '220 55% 58%',
    'primary-foreground': '220 10% 6%',
    secondary: '220 10% 18%',
    'secondary-foreground': '220 6% 62%',
    muted: '220 10% 15%',
    'muted-foreground': '220 6% 45%',
    accent: '220 30% 22%',
    'accent-foreground': '220 55% 68%',
    destructive: '0 60% 52%',
    'destructive-foreground': '220 6% 95%',
    border: '220 10% 22%',
    input: '220 10% 22%',
    ring: '220 55% 58%',
    'terminal-green': '145 40% 48%',
    'terminal-amber': '30 75% 52%',
    'terminal-red': '0 60% 52%',
    'terminal-cyan': '200 35% 50%',
  },
};

const shadcnDefault: Theme = {
  id: 'shadcn',
  name: 'shadcn Default',
  light: {
    background: '0 0% 100%',
    foreground: '240 10% 3.9%',
    card: '0 0% 100%',
    'card-foreground': '240 10% 3.9%',
    popover: '0 0% 100%',
    'popover-foreground': '240 10% 3.9%',
    primary: '240 5.9% 10%',
    'primary-foreground': '0 0% 98%',
    secondary: '240 4.8% 95.9%',
    'secondary-foreground': '240 5.9% 10%',
    muted: '240 4.8% 95.9%',
    'muted-foreground': '240 3.8% 46.1%',
    accent: '240 4.8% 95.9%',
    'accent-foreground': '240 5.9% 10%',
    destructive: '0 84.2% 60.2%',
    'destructive-foreground': '0 0% 98%',
    border: '240 5.9% 90%',
    input: '240 5.9% 90%',
    ring: '240 5.9% 10%',
    'terminal-green': '142 71% 35%',
    'terminal-amber': '38 92% 50%',
    'terminal-red': '0 84% 60%',
    'terminal-cyan': '199 89% 42%',
  },
  dark: {
    background: '240 10% 3.9%',
    foreground: '0 0% 98%',
    card: '240 10% 3.9%',
    'card-foreground': '0 0% 98%',
    popover: '240 10% 3.9%',
    'popover-foreground': '0 0% 98%',
    primary: '0 0% 98%',
    'primary-foreground': '240 5.9% 10%',
    secondary: '240 3.7% 15.9%',
    'secondary-foreground': '0 0% 98%',
    muted: '240 3.7% 15.9%',
    'muted-foreground': '240 5% 64.9%',
    accent: '240 3.7% 15.9%',
    'accent-foreground': '0 0% 98%',
    destructive: '0 62.8% 30.6%',
    'destructive-foreground': '0 0% 98%',
    border: '240 3.7% 15.9%',
    input: '240 3.7% 15.9%',
    ring: '240 4.9% 83.9%',
    'terminal-green': '142 71% 45%',
    'terminal-amber': '38 92% 56%',
    'terminal-red': '0 84% 60%',
    'terminal-cyan': '199 89% 48%',
  },
};

const rosePine: Theme = {
  id: 'rose-pine',
  name: 'Rosé Pine',
  light: {
    background: '32 57% 95%',
    foreground: '248 12% 36%',
    card: '32 57% 97%',
    'card-foreground': '248 12% 36%',
    popover: '32 57% 97%',
    'popover-foreground': '248 12% 36%',
    primary: '280 36% 54%',
    'primary-foreground': '32 57% 97%',
    secondary: '32 20% 90%',
    'secondary-foreground': '248 12% 36%',
    muted: '32 20% 92%',
    'muted-foreground': '248 10% 48%',
    accent: '32 30% 88%',
    'accent-foreground': '280 36% 44%',
    destructive: '343 35% 55%',
    'destructive-foreground': '32 57% 97%',
    border: '32 15% 82%',
    input: '32 15% 85%',
    ring: '280 36% 54%',
    'terminal-green': '197 48% 42%',
    'terminal-amber': '35 88% 50%',
    'terminal-red': '343 35% 55%',
    'terminal-cyan': '189 43% 40%',
  },
  dark: {
    background: '249 22% 12%',
    foreground: '245 7% 81%',
    card: '249 22% 15%',
    'card-foreground': '245 7% 81%',
    popover: '249 22% 15%',
    'popover-foreground': '245 7% 81%',
    primary: '280 36% 62%',
    'primary-foreground': '249 22% 10%',
    secondary: '249 15% 20%',
    'secondary-foreground': '245 7% 70%',
    muted: '249 15% 18%',
    'muted-foreground': '245 7% 50%',
    accent: '249 20% 22%',
    'accent-foreground': '280 36% 70%',
    destructive: '343 35% 55%',
    'destructive-foreground': '245 7% 90%',
    border: '249 15% 22%',
    input: '249 15% 22%',
    ring: '280 36% 62%',
    'terminal-green': '197 48% 52%',
    'terminal-amber': '35 88% 58%',
    'terminal-red': '343 35% 60%',
    'terminal-cyan': '189 43% 50%',
  },
};

const catppuccin: Theme = {
  id: 'catppuccin',
  name: 'Catppuccin Mocha',
  light: {
    background: '220 23% 95%',
    foreground: '234 16% 35%',
    card: '220 23% 98%',
    'card-foreground': '234 16% 35%',
    popover: '220 23% 98%',
    'popover-foreground': '234 16% 35%',
    primary: '266 85% 58%',
    'primary-foreground': '0 0% 100%',
    secondary: '220 15% 90%',
    'secondary-foreground': '234 16% 35%',
    muted: '220 15% 92%',
    'muted-foreground': '234 10% 48%',
    accent: '220 20% 88%',
    'accent-foreground': '266 60% 48%',
    destructive: '347 87% 44%',
    'destructive-foreground': '0 0% 100%',
    border: '220 12% 82%',
    input: '220 12% 85%',
    ring: '266 85% 58%',
    'terminal-green': '115 54% 42%',
    'terminal-amber': '23 92% 50%',
    'terminal-red': '347 87% 44%',
    'terminal-cyan': '183 74% 38%',
  },
  dark: {
    background: '240 21% 15%',
    foreground: '226 64% 88%',
    card: '240 21% 18%',
    'card-foreground': '226 64% 88%',
    popover: '240 21% 18%',
    'popover-foreground': '226 64% 88%',
    primary: '267 84% 81%',
    'primary-foreground': '240 21% 12%',
    secondary: '240 17% 22%',
    'secondary-foreground': '226 64% 78%',
    muted: '240 17% 20%',
    'muted-foreground': '226 30% 55%',
    accent: '240 20% 25%',
    'accent-foreground': '267 84% 81%',
    destructive: '347 87% 44%',
    'destructive-foreground': '226 64% 93%',
    border: '240 17% 24%',
    input: '240 17% 24%',
    ring: '267 84% 81%',
    'terminal-green': '115 54% 52%',
    'terminal-amber': '23 92% 56%',
    'terminal-red': '347 87% 52%',
    'terminal-cyan': '183 74% 48%',
  },
};

const nord: Theme = {
  id: 'nord',
  name: 'Nord',
  light: {
    background: '219 28% 94%',
    foreground: '220 16% 22%',
    card: '219 28% 97%',
    'card-foreground': '220 16% 22%',
    popover: '219 28% 97%',
    'popover-foreground': '220 16% 22%',
    primary: '213 32% 52%',
    'primary-foreground': '0 0% 100%',
    secondary: '219 18% 88%',
    'secondary-foreground': '220 16% 28%',
    muted: '219 18% 90%',
    'muted-foreground': '220 12% 42%',
    accent: '219 22% 86%',
    'accent-foreground': '213 32% 42%',
    destructive: '354 42% 56%',
    'destructive-foreground': '0 0% 100%',
    border: '219 15% 78%',
    input: '219 15% 82%',
    ring: '213 32% 52%',
    'terminal-green': '92 28% 38%',
    'terminal-amber': '40 71% 48%',
    'terminal-red': '354 42% 56%',
    'terminal-cyan': '193 43% 48%',
  },
  dark: {
    background: '220 16% 22%',
    foreground: '219 28% 88%',
    card: '220 16% 26%',
    'card-foreground': '219 28% 88%',
    popover: '220 16% 26%',
    'popover-foreground': '219 28% 88%',
    primary: '213 32% 62%',
    'primary-foreground': '220 16% 12%',
    secondary: '220 16% 30%',
    'secondary-foreground': '219 28% 76%',
    muted: '220 16% 28%',
    'muted-foreground': '219 15% 58%',
    accent: '220 18% 32%',
    'accent-foreground': '213 32% 72%',
    destructive: '354 42% 56%',
    'destructive-foreground': '219 28% 95%',
    border: '220 16% 30%',
    input: '220 16% 30%',
    ring: '213 32% 62%',
  },
};

export const themes: Theme[] = [
  coplandPlatinum,
  shadcnDefault,
  rosePine,
  catppuccin,
  nord,
];

export function getThemeById(id: string): Theme | undefined {
  return themes.find(t => t.id === id);
}

export function applyTheme(theme: Theme, mode: 'light' | 'dark') {
  const vars = mode === 'dark' ? theme.dark : theme.light;
  const root = document.documentElement;

  // Apply color vars
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(`--${key}`, value);
  }

  // Toggle dark class
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Persist
  localStorage.setItem('theme-id', theme.id);
  localStorage.setItem('theme-mode', mode);
}

export function loadSavedTheme(): { theme: Theme; mode: 'light' | 'dark' } {
  const savedId = localStorage.getItem('theme-id') || 'copland';
  const savedMode = (localStorage.getItem('theme-mode') || 'dark') as 'light' | 'dark';
  const theme = getThemeById(savedId) || coplandPlatinum;
  return { theme, mode: savedMode };
}
