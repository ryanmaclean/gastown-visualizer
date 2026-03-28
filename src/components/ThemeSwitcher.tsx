import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';
import { themes, applyTheme, loadSavedTheme, Theme } from '../lib/themes';

export function ThemeSwitcher() {
  const [current, setCurrent] = useState<{ theme: Theme; mode: 'light' | 'dark' }>(() => loadSavedTheme());
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Apply on mount
  useEffect(() => {
    applyTheme(current.theme, current.mode);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectTheme = (theme: Theme) => {
    applyTheme(theme, current.mode);
    setCurrent({ theme, mode: current.mode });
    setOpen(false);
  };

  const toggleMode = () => {
    const newMode = current.mode === 'dark' ? 'light' : 'dark';
    applyTheme(current.theme, newMode);
    setCurrent({ theme: current.theme, mode: newMode });
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-0.5">
        {/* Theme picker */}
        <button
          onClick={() => setOpen(!open)}
          className="copland-raised bg-background px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors"
          title="Switch theme"
        >
          {current.theme.name}
        </button>

        {/* Light/Dark toggle */}
        <button
          onClick={toggleMode}
          className="p-2 copland-raised bg-background hover:bg-secondary transition-colors"
          aria-label={current.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {current.mode === 'dark' ? (
            <Sun className="w-4 h-4 text-foreground" />
          ) : (
            <Moon className="w-4 h-4 text-foreground" />
          )}
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 copland-raised bg-card border border-border min-w-[160px]">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTheme(t)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors ${
                t.id === current.theme.id ? 'bg-accent text-accent-foreground font-bold' : 'text-foreground'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
