

## Theme System: Use shadcn/ui's Built-in CSS Variable Convention

The app already uses shadcn/ui's CSS variable pattern (`--background`, `--foreground`, `--primary`, etc.) which is the most widely adopted theming standard in the React/Tailwind ecosystem. The idea: make themes swappable by applying a CSS class to `<html>`, with each theme defined as a set of CSS variable overrides.

### What "everyone can use already" means

**shadcn/ui Themes** — thousands of pre-built themes exist at [ui.shadcn.com/themes](https://ui.shadcn.com/themes) and community sites like [tweakcn.com](https://tweakcn.com), [ui.jln.dev](https://ui.jln.dev), and [gradient.page/tools/shadcn-ui-theme-generator](https://gradient.page/tools/shadcn-ui-theme-generator). Any theme from these sources is just a block of CSS variables that drops right in.

### Plan

**1. Create a theme registry** (`src/lib/themes.ts`)
- Define a `Theme` type: `{ id, name, label, cssVars: { light: Record<string,string>, dark: Record<string,string> } }`
- Ship 4-5 built-in themes:
  - **Copland Platinum** (current) — the retro OS look
  - **shadcn Default** — the standard zinc/slate palette everyone knows
  - **Rosé Pine** — popular muted palette
  - **Catppuccin Mocha** — warm dark community favorite
  - **Nord** — cool blue-gray
- Each theme is just the CSS variable values copied from the respective community generators

**2. Theme switcher component** (`src/components/ThemeSwitcher.tsx`)
- Replace the current light/dark `ThemeToggle` with a dropdown that shows theme name + light/dark toggle
- On selection, inject the theme's CSS variables onto `document.documentElement.style`
- Persist choice to `localStorage` as `{ theme: 'copland', mode: 'dark' }`

**3. Update `ThemeToggle.tsx`**
- Becomes a sub-control inside the switcher (or stays as a standalone light/dark toggle that works within whatever theme is active)

**4. Update `index.css`**
- Keep Copland Platinum as the `:root` default
- Remove hardcoded `.dark` block — instead, dark values get applied dynamically from the theme registry
- Keep all the Copland-specific decorative CSS (`.copland-raised`, `.copland-inset`, `.stipple`, scrollbar styles) — these are decorative and theme-independent

**5. Update contrast tests** (`src/test/contrast.test.ts`)
- Parameterize: loop over all registered themes and verify WCAG AA for each theme's light and dark palettes

### Technical notes
- No new dependencies — just CSS variables and a small React context
- The `theme` class approach means users can paste any shadcn theme CSS block from the web and it works
- Font choices (DM Mono, Space Mono) stay fixed — they're part of the app identity, not the color theme

