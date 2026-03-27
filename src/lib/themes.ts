// Theme registry — each theme provides shadcn/ui CSS variable overrides
// Users can drop in any theme from ui.shadcn.com/themes, tweakcn.com, etc.

export interface Theme {
  id: string;
  name: string;
  label: string;
  cssVars: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

export const themes: Theme[] = [
  {
    id: 'copland',
    name: 'Copland Platinum',
    label: 'Retro OS',
    cssVars: {
      light: {
        '--background': '220 8% 92%',
        '--foreground': '220 10% 18%',
        '--card': '220 8% 96%',
        '--card-foreground': '220 10% 18%',
        '--popover': '220 8% 96%',
        '--popover-foreground': '220 10% 18%',
        '--primary': '220 55% 50%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '220 6% 88%',
        '--secondary-foreground': '220 10% 30%',
        '--muted': '220 6% 90%',
        '--muted-foreground': '220 8% 32%',
        '--accent': '220 30% 90%',
        '--accent-foreground': '220 55% 42%',
        '--destructive': '0 60% 50%',
        '--destructive-foreground': '0 0% 100%',
        '--border': '220 8% 78%',
        '--input': '220 8% 82%',
        '--ring': '220 55% 50%',
      },
      dark: {
        '--background': '220 10% 10%',
        '--foreground': '220 6% 80%',
        '--card': '220 10% 14%',
        '--card-foreground': '220 6% 80%',
        '--popover': '220 10% 14%',
        '--popover-foreground': '220 6% 80%',
        '--primary': '220 55% 58%',
        '--primary-foreground': '220 10% 6%',
        '--secondary': '220 10% 18%',
        '--secondary-foreground': '220 6% 62%',
        '--muted': '220 10% 15%',
        '--muted-foreground': '220 6% 45%',
        '--accent': '220 30% 22%',
        '--accent-foreground': '220 55% 68%',
        '--destructive': '0 60% 52%',
        '--destructive-foreground': '220 6% 95%',
        '--border': '220 10% 22%',
        '--input': '220 10% 22%',
        '--ring': '220 55% 58%',
      },
    },
  },
  {
    id: 'shadcn',
    name: 'shadcn Default',
    label: 'Zinc',
    cssVars: {
      light: {
        '--background': '0 0% 100%',
        '--foreground': '240 10% 3.9%',
        '--card': '0 0% 100%',
        '--card-foreground': '240 10% 3.9%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '240 10% 3.9%',
        '--primary': '240 5.9% 10%',
        '--primary-foreground': '0 0% 98%',
        '--secondary': '240 4.8% 95.9%',
        '--secondary-foreground': '240 5.9% 10%',
        '--muted': '240 4.8% 95.9%',
        '--muted-foreground': '240 3.8% 46.1%',
        '--accent': '240 4.8% 95.9%',
        '--accent-foreground': '240 5.9% 10%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '0 0% 98%',
        '--border': '240 5.9% 90%',
        '--input': '240 5.9% 90%',
        '--ring': '240 5.9% 10%',
      },
      dark: {
        '--background': '240 10% 3.9%',
        '--foreground': '0 0% 98%',
        '--card': '240 10% 3.9%',
        '--card-foreground': '0 0% 98%',
        '--popover': '240 10% 3.9%',
        '--popover-foreground': '0 0% 98%',
        '--primary': '0 0% 98%',
        '--primary-foreground': '240 5.9% 10%',
        '--secondary': '240 3.7% 15.9%',
        '--secondary-foreground': '0 0% 98%',
        '--muted': '240 3.7% 15.9%',
        '--muted-foreground': '240 5% 64.9%',
        '--accent': '240 3.7% 15.9%',
        '--accent-foreground': '0 0% 98%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '0 0% 98%',
        '--border': '240 3.7% 15.9%',
        '--input': '240 3.7% 15.9%',
        '--ring': '240 4.9% 83.9%',
      },
    },
  },
  {
    id: 'rose-pine',
    name: 'Rosé Pine',
    label: 'Muted',
    cssVars: {
      light: {
        '--background': '32 57% 95%',
        '--foreground': '248 19% 40%',
        '--card': '35 100% 98%',
        '--card-foreground': '248 19% 40%',
        '--popover': '35 100% 98%',
        '--popover-foreground': '248 19% 40%',
        '--primary': '267 57% 58%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '32 30% 90%',
        '--secondary-foreground': '248 19% 40%',
        '--muted': '32 30% 92%',
        '--muted-foreground': '248 12% 52%',
        '--accent': '280 40% 90%',
        '--accent-foreground': '267 57% 48%',
        '--destructive': '343 76% 59%',
        '--destructive-foreground': '0 0% 100%',
        '--border': '32 20% 82%',
        '--input': '32 20% 85%',
        '--ring': '267 57% 58%',
      },
      dark: {
        '--background': '249 22% 12%',
        '--foreground': '245 7% 81%',
        '--card': '248 25% 15%',
        '--card-foreground': '245 7% 81%',
        '--popover': '248 25% 15%',
        '--popover-foreground': '245 7% 81%',
        '--primary': '267 57% 62%',
        '--primary-foreground': '249 22% 10%',
        '--secondary': '248 20% 20%',
        '--secondary-foreground': '245 7% 70%',
        '--muted': '248 20% 18%',
        '--muted-foreground': '245 7% 55%',
        '--accent': '267 30% 25%',
        '--accent-foreground': '267 57% 72%',
        '--destructive': '343 76% 55%',
        '--destructive-foreground': '245 7% 95%',
        '--border': '248 15% 22%',
        '--input': '248 15% 22%',
        '--ring': '267 57% 62%',
      },
    },
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin Mocha',
    label: 'Warm',
    cssVars: {
      light: {
        '--background': '220 23% 95%',
        '--foreground': '234 16% 35%',
        '--card': '220 23% 98%',
        '--card-foreground': '234 16% 35%',
        '--popover': '220 23% 98%',
        '--popover-foreground': '234 16% 35%',
        '--primary': '266 85% 58%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '220 15% 90%',
        '--secondary-foreground': '234 16% 35%',
        '--muted': '220 15% 92%',
        '--muted-foreground': '234 10% 48%',
        '--accent': '266 40% 90%',
        '--accent-foreground': '266 85% 48%',
        '--destructive': '347 87% 44%',
        '--destructive-foreground': '0 0% 100%',
        '--border': '220 12% 82%',
        '--input': '220 12% 85%',
        '--ring': '266 85% 58%',
      },
      dark: {
        '--background': '240 21% 15%',
        '--foreground': '226 64% 88%',
        '--card': '240 21% 18%',
        '--card-foreground': '226 64% 88%',
        '--popover': '240 21% 18%',
        '--popover-foreground': '226 64% 88%',
        '--primary': '267 84% 81%',
        '--primary-foreground': '240 21% 12%',
        '--secondary': '240 18% 22%',
        '--secondary-foreground': '226 64% 78%',
        '--muted': '240 18% 20%',
        '--muted-foreground': '228 24% 55%',
        '--accent': '267 40% 28%',
        '--accent-foreground': '267 84% 81%',
        '--destructive': '343 81% 75%',
        '--destructive-foreground': '240 21% 12%',
        '--border': '240 15% 25%',
        '--input': '240 15% 25%',
        '--ring': '267 84% 81%',
      },
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    label: 'Cool',
    cssVars: {
      light: {
        '--background': '219 28% 95%',
        '--foreground': '220 16% 22%',
        '--card': '219 28% 98%',
        '--card-foreground': '220 16% 22%',
        '--popover': '219 28% 98%',
        '--popover-foreground': '220 16% 22%',
        '--primary': '213 32% 52%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '219 20% 90%',
        '--secondary-foreground': '220 16% 28%',
        '--muted': '219 20% 92%',
        '--muted-foreground': '220 10% 42%',
        '--accent': '213 20% 88%',
        '--accent-foreground': '213 32% 42%',
        '--destructive': '354 42% 56%',
        '--destructive-foreground': '0 0% 100%',
        '--border': '219 15% 82%',
        '--input': '219 15% 85%',
        '--ring': '213 32% 52%',
      },
      dark: {
        '--background': '220 16% 16%',
        '--foreground': '219 28% 88%',
        '--card': '220 16% 20%',
        '--card-foreground': '219 28% 88%',
        '--popover': '220 16% 20%',
        '--popover-foreground': '219 28% 88%',
        '--primary': '213 32% 52%',
        '--primary-foreground': '219 28% 95%',
        '--secondary': '220 16% 24%',
        '--secondary-foreground': '219 28% 78%',
        '--muted': '220 16% 22%',
        '--muted-foreground': '219 15% 52%',
        '--accent': '213 20% 28%',
        '--accent-foreground': '213 32% 68%',
        '--destructive': '354 42% 56%',
        '--destructive-foreground': '219 28% 95%',
        '--border': '220 16% 26%',
        '--input': '220 16% 26%',
        '--ring': '213 32% 52%',
      },
    },
  },
];

// Core CSS variable keys that every theme must provide
export const THEME_CSS_VARS = [
  '--background', '--foreground',
  '--card', '--card-foreground',
  '--popover', '--popover-foreground',
  '--primary', '--primary-foreground',
  '--secondary', '--secondary-foreground',
  '--muted', '--muted-foreground',
  '--accent', '--accent-foreground',
  '--destructive', '--destructive-foreground',
  '--border', '--input', '--ring',
] as const;

export function getThemeById(id: string): Theme {
  return themes.find(t => t.id === id) ?? themes[0];
}

export function applyTheme(theme: Theme, mode: 'light' | 'dark') {
  const vars = mode === 'dark' ? theme.cssVars.dark : theme.cssVars.light;
  const root = document.documentElement;

  // Apply CSS variables
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }

  // Toggle dark class
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export type ThemePreference = {
  themeId: string;
  mode: 'light' | 'dark';
};

const STORAGE_KEY = 'gastown-theme';

export function loadThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { themeId: 'copland', mode: 'dark' };
}

export function saveThemePreference(pref: ThemePreference) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pref));
}
