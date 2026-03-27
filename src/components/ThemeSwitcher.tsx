import React, { useState, useEffect } from 'react';
import { Sun, Moon, Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  themes,
  getThemeById,
  applyTheme,
  loadThemePreference,
  saveThemePreference,
  type ThemePreference,
} from '../lib/themes';

export function ThemeSwitcher() {
  const [pref, setPref] = useState<ThemePreference>(loadThemePreference);

  useEffect(() => {
    const theme = getThemeById(pref.themeId);
    applyTheme(theme, pref.mode);
    saveThemePreference(pref);
  }, [pref]);

  const currentTheme = getThemeById(pref.themeId);

  const toggleMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPref(p => ({ ...p, mode: p.mode === 'dark' ? 'light' : 'dark' }));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-sm border border-border hover:bg-secondary transition-colors text-[11px]"
          aria-label="Theme switcher"
        >
          <Palette className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-foreground hidden sm:inline">{currentTheme.label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map(t => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setPref(p => ({ ...p, themeId: t.id }))}
            className={t.id === pref.themeId ? 'bg-accent' : ''}
          >
            <span className="flex-1">{t.name}</span>
            {t.id === pref.themeId && (
              <span className="text-primary text-xs">●</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleMode}>
          {pref.mode === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 mr-2" />
              Light mode
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 mr-2" />
              Dark mode
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
