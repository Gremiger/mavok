# Two New Themes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two new themes (Pergamino, a light parchment theme; Furia de Sangre, a dark ember-crimson theme) and fix the decorative background texture so it's tinted by each theme's own accent color instead of always being Piedra Viva's hardcoded copper.

**Architecture:** Extend the CSS custom-property token system with 2 new `[data-theme]` blocks, convert the body's hardcoded crack-pattern literals to `color-mix(in srgb, var(--accent) X%, transparent)`, widen `AppSettings.theme` to a 4-value union, replace `useTheme()`'s binary `toggleTheme()` with a direct `setTheme()` setter (mirroring the `setEncyclopediaLanguage` pattern already in the same hook), and replace `SettingsTab`'s single cycling row with 4 directly-tappable rows.

**Tech Stack:** TypeScript, Next.js 15 (static export), CSS custom properties + `color-mix()` — no test framework; verification is `npx tsc --noEmit && npm run build && npm run lint` plus manual browser checks per CLAUDE.md.

## Global Constraints

- `npm run lint` must report 0 errors.
- `output: 'export'` — no server-only APIs.
- No migration needed for the `AppSettings.theme` widening — `AppSettings` isn't versioned like `Character`; `loadSettings()` already merges stored settings over hardcoded defaults, so old stored settings blobs are backward-compatible automatically.
- Palette hex values are locked from the approved design (Section 1 of the spec) — use them exactly as given, don't adjust.
- No changes to `.stone-card`, `.cord-line`/`.cord-knot`, `.crack-divider`, typography, or layout — only color tokens and the one Pergamino vignette layer.

---

### Task 1: Add palette tokens and fix the background texture

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: `[data-theme="pergamino"]` and `[data-theme="furia-de-sangre"]` CSS variable blocks, consumed by Task 3's manual verification. No TypeScript interfaces involved.

- [ ] **Step 1: Add the two new theme token blocks**

In `src/app/globals.css`, right after the existing `[data-theme="dark-fantasy"]` block, add:

```css
[data-theme="pergamino"] {
  --bg: #d9c9a3;
  --card: #f0e6cc;
  --accent: #9c2b2b;
  --cord: #5c3a1f;
  --fg: #2e2417;
  --muted: #8a7554;
  --border-color: #c4b28e;
}

[data-theme="furia-de-sangre"] {
  --bg: #160b0b;
  --card: #241010;
  --accent: #c23b2b;
  --cord: #6e1414;
  --fg: #e8d8ce;
  --muted: #6b4444;
  --border-color: #3a1414;
}
```

- [ ] **Step 2: Make the crack-pattern texture theme-aware**

Replace the entire `body` rule:

```css
body {
  -webkit-font-smoothing: antialiased;
  background:
    /* crack 1 — long diagonal */
    linear-gradient(
      157deg,
      transparent 22%,
      rgba(184,115,51,0.06) 22.1%,
      rgba(184,115,51,0.04) 22.3%,
      transparent 22.4%,
      transparent 58%,
      rgba(184,115,51,0.05) 58.1%,
      rgba(184,115,51,0.03) 58.2%,
      transparent 58.3%
    ),
    /* crack 2 — branching */
    linear-gradient(
      203deg,
      transparent 35%,
      rgba(184,115,51,0.05) 35.1%,
      rgba(184,115,51,0.03) 35.2%,
      transparent 35.3%,
      transparent 71%,
      rgba(184,115,51,0.04) 71.1%,
      rgba(184,115,51,0.02) 71.3%,
      transparent 71.4%
    ),
    /* crack 3 — horizontal stress line */
    linear-gradient(
      93deg,
      transparent 40%,
      rgba(184,115,51,0.04) 40.1%,
      rgba(184,115,51,0.02) 40.2%,
      transparent 40.3%,
      transparent 78%,
      rgba(184,115,51,0.03) 78.1%,
      transparent 78.2%
    ),
    /* stone grain — fine noise */
    repeating-conic-gradient(
      rgba(255,255,255,0.01) 0%,
      transparent 0.5%,
      transparent 1%,
      rgba(0,0,0,0.015) 1.5%,
      transparent 2%
    ),
    /* base color */
    var(--bg);
  background-attachment: fixed;
}
```

with:

```css
body {
  -webkit-font-smoothing: antialiased;
  background:
    /* crack 1 — long diagonal */
    linear-gradient(
      157deg,
      transparent 22%,
      color-mix(in srgb, var(--accent) 6%, transparent) 22.1%,
      color-mix(in srgb, var(--accent) 4%, transparent) 22.3%,
      transparent 22.4%,
      transparent 58%,
      color-mix(in srgb, var(--accent) 5%, transparent) 58.1%,
      color-mix(in srgb, var(--accent) 3%, transparent) 58.2%,
      transparent 58.3%
    ),
    /* crack 2 — branching */
    linear-gradient(
      203deg,
      transparent 35%,
      color-mix(in srgb, var(--accent) 5%, transparent) 35.1%,
      color-mix(in srgb, var(--accent) 3%, transparent) 35.2%,
      transparent 35.3%,
      transparent 71%,
      color-mix(in srgb, var(--accent) 4%, transparent) 71.1%,
      color-mix(in srgb, var(--accent) 2%, transparent) 71.3%,
      transparent 71.4%
    ),
    /* crack 3 — horizontal stress line */
    linear-gradient(
      93deg,
      transparent 40%,
      color-mix(in srgb, var(--accent) 4%, transparent) 40.1%,
      color-mix(in srgb, var(--accent) 2%, transparent) 40.2%,
      transparent 40.3%,
      transparent 78%,
      color-mix(in srgb, var(--accent) 3%, transparent) 78.1%,
      transparent 78.2%
    ),
    /* stone grain — fine noise */
    repeating-conic-gradient(
      rgba(255,255,255,0.01) 0%,
      transparent 0.5%,
      transparent 1%,
      rgba(0,0,0,0.015) 1.5%,
      transparent 2%
    ),
    /* base color */
    var(--bg);
  background-attachment: fixed;
}
```

- [ ] **Step 3: Add the Pergamino-specific vignette override**

Right after the `body` rule (still before the `.stone-card` rule), add:

```css
[data-theme="pergamino"] body {
  background:
    radial-gradient(
      ellipse at center,
      transparent 60%,
      rgba(0, 0, 0, 0.08) 100%
    ),
    /* crack 1 — long diagonal */
    linear-gradient(
      157deg,
      transparent 22%,
      color-mix(in srgb, var(--accent) 6%, transparent) 22.1%,
      color-mix(in srgb, var(--accent) 4%, transparent) 22.3%,
      transparent 22.4%,
      transparent 58%,
      color-mix(in srgb, var(--accent) 5%, transparent) 58.1%,
      color-mix(in srgb, var(--accent) 3%, transparent) 58.2%,
      transparent 58.3%
    ),
    /* crack 2 — branching */
    linear-gradient(
      203deg,
      transparent 35%,
      color-mix(in srgb, var(--accent) 5%, transparent) 35.1%,
      color-mix(in srgb, var(--accent) 3%, transparent) 35.2%,
      transparent 35.3%,
      transparent 71%,
      color-mix(in srgb, var(--accent) 4%, transparent) 71.1%,
      color-mix(in srgb, var(--accent) 2%, transparent) 71.3%,
      transparent 71.4%
    ),
    /* crack 3 — horizontal stress line */
    linear-gradient(
      93deg,
      transparent 40%,
      color-mix(in srgb, var(--accent) 4%, transparent) 40.1%,
      color-mix(in srgb, var(--accent) 2%, transparent) 40.2%,
      transparent 40.3%,
      transparent 78%,
      color-mix(in srgb, var(--accent) 3%, transparent) 78.1%,
      transparent 78.2%
    ),
    /* stone grain — fine noise */
    repeating-conic-gradient(
      rgba(255,255,255,0.01) 0%,
      transparent 0.5%,
      transparent 1%,
      rgba(0,0,0,0.015) 1.5%,
      transparent 2%
    ),
    /* base color */
    var(--bg);
  background-attachment: fixed;
}
```

- [ ] **Step 4: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed with no errors (this task only touches CSS; `npm run build` is what actually compiles/validates it).

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add Pergamino and Furia de Sangre theme tokens, make crack texture theme-aware"
```

---

### Task 2: Widen the theme type and replace toggleTheme with a direct setter

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/hooks/useTheme.ts`

**Interfaces:**
- Produces: `AppSettings["theme"]` widened to `"piedra-viva" | "dark-fantasy" | "pergamino" | "furia-de-sangre"`; `useTheme()` now returns `setTheme: (next: AppSettings["theme"]) => void` instead of `toggleTheme: () => void`; new exported `THEME_META: { id: AppSettings["theme"]; label: string; swatch: string }[]` from `src/hooks/useTheme.ts`. Consumed by Task 3.

- [ ] **Step 1: Widen the `AppSettings.theme` union**

In `src/lib/types.ts`, replace:

```ts
export interface AppSettings {
  theme: "piedra-viva" | "dark-fantasy";
  lastCharacterId: string;
  density: "compact" | "spacious";
  encyclopediaFavorites: string[];
  encyclopediaLanguage: "en" | "es";
}
```

with:

```ts
export interface AppSettings {
  theme: "piedra-viva" | "dark-fantasy" | "pergamino" | "furia-de-sangre";
  lastCharacterId: string;
  density: "compact" | "spacious";
  encyclopediaFavorites: string[];
  encyclopediaLanguage: "en" | "es";
}
```

- [ ] **Step 2: Replace `useTheme.ts` with the 4-theme version**

Replace the entire contents of `src/hooks/useTheme.ts`:

```ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { loadSettings, saveSettings } from "@/lib/storage";
import type { AppSettings } from "@/lib/types";

export const THEME_META: {
  id: AppSettings["theme"];
  label: string;
  swatch: string;
}[] = [
  { id: "piedra-viva", label: "Piedra Viva", swatch: "#b87333" },
  { id: "dark-fantasy", label: "Dark Fantasy", swatch: "#8b6d2d" },
  { id: "pergamino", label: "Pergamino", swatch: "#9c2b2b" },
  { id: "furia-de-sangre", label: "Furia de Sangre", swatch: "#c23b2b" },
];

export function useTheme() {
  const [theme, setThemeState] = useState<AppSettings["theme"]>(
    "piedra-viva"
  );
  const [density, setDensity] = useState<AppSettings["density"]>("spacious");
  const [encyclopediaFavorites, setEncyclopediaFavorites] = useState<
    string[]
  >([]);
  const [encyclopediaLanguage, setEncyclopediaLanguageState] = useState<
    AppSettings["encyclopediaLanguage"]
  >("en");

  useEffect(() => {
    const settings = loadSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: localStorage is unavailable during the static-export build's prerender pass, so this read must be deferred to after client mount.
    setThemeState(settings.theme);
    setDensity(settings.density);
    setEncyclopediaFavorites(settings.encyclopediaFavorites);
    setEncyclopediaLanguageState(settings.encyclopediaLanguage);
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, []);

  const setTheme = useCallback((next: AppSettings["theme"]) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    const settings = loadSettings();
    saveSettings({ ...settings, theme: next });
  }, []);

  const toggleDensity = useCallback(() => {
    setDensity((prev) => {
      const next = prev === "spacious" ? "compact" : "spacious";
      const settings = loadSettings();
      saveSettings({ ...settings, density: next });
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setEncyclopediaFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      const settings = loadSettings();
      saveSettings({ ...settings, encyclopediaFavorites: next });
      return next;
    });
  }, []);

  const setEncyclopediaLanguage = useCallback(
    (lang: AppSettings["encyclopediaLanguage"]) => {
      setEncyclopediaLanguageState(lang);
      const settings = loadSettings();
      saveSettings({ ...settings, encyclopediaLanguage: lang });
    },
    []
  );

  return {
    theme,
    setTheme,
    density,
    toggleDensity,
    encyclopediaFavorites,
    toggleFavorite,
    encyclopediaLanguage,
    setEncyclopediaLanguage,
  };
}
```

- [ ] **Step 3: Type-check (a transient error is expected)**

Run: `npx tsc --noEmit`
Expected: **one** error, in `src/components/tabs/SettingsTab.tsx`, referencing `toggleTheme` no longer existing on the object returned by `useThemeContext()`. This is expected — `SettingsTab.tsx` is the sole consumer of the old API and is fixed in Task 3. Do not attempt to fix it here.

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts src/hooks/useTheme.ts
git commit -m "feat: widen AppSettings.theme to 4 values, replace toggleTheme with setTheme"
```

---

### Task 3: Replace the theme toggle row with a 4-theme picker in SettingsTab

**Files:**
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Consumes: `THEME_META` (Task 2, `src/hooks/useTheme.ts`); `useThemeContext()`'s `theme`/`setTheme` (Task 2).
- Produces: no new exports — final integration point for this plan.

- [ ] **Step 1: Import `THEME_META`**

In `src/components/tabs/SettingsTab.tsx`, add to the imports:

```ts
import { THEME_META } from "@/hooks/useTheme";
```

- [ ] **Step 2: Update the destructured hook values**

Replace:

```ts
  const { theme, toggleTheme, density, toggleDensity } = useThemeContext();
```

with:

```ts
  const { theme, setTheme, density, toggleDensity } = useThemeContext();
```

- [ ] **Step 3: Replace the single toggle row with 4 picker rows**

Replace:

```tsx
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3 bg-card rounded-lg border border-border"
          >
            <span className="text-sm">
              {theme === "piedra-viva" ? "Piedra Viva" : "Dark Fantasy"}
            </span>
            <span className="text-xs text-muted">Tap para cambiar</span>
          </button>
```

with:

```tsx
          {THEME_META.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className="w-full flex items-center justify-between p-3 bg-card rounded-lg border border-border"
            >
              <span className="flex items-center gap-2 text-sm">
                <span
                  className="w-3 h-3 rounded-full border border-border/60 shrink-0"
                  style={{ backgroundColor: t.swatch }}
                />
                {t.label}
              </span>
              {theme === t.id ? (
                <span className="text-xs text-accent">Activo</span>
              ) : (
                <span className="text-xs text-muted">Tap para cambiar</span>
              )}
            </button>
          ))}
```

- [ ] **Step 4: Type-check, build, lint**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all succeed, lint reports 0 errors (pre-existing `@next/next/no-img-element` warnings in `SettingsTab.tsx`/`SheetTab.tsx` are unrelated and expected to remain).

- [ ] **Step 5: Manual browser verification**

Start the dev server:

```bash
npm run dev &
echo $! > /tmp/mavok-dev.pid
until curl -sf http://localhost:3000 >/dev/null; do sleep 1; done
```

Using a headless-Chromium driver (or manually), open Ajustes → Tema and verify:
- All 4 rows render: Piedra Viva, Dark Fantasy, Pergamino, Furia de Sangre — each with its own colored swatch dot.
- Tapping each row switches the whole app's background/cards/accent/cord colors immediately, and marks that row "Activo".
- Reload the page — the last-selected theme persists.
- Dark Fantasy's crack texture on the background now reads gold-tinted, not copper.
- Pergamino renders as a light parchment page with a visible vignette darkening at the screen edges.
- Furia de Sangre's accent reads as a hotter red-orange than Piedra Viva's muted copper.
- Check the browser console for errors — expect none.

Stop the dev server when done:

```bash
kill "$(cat /tmp/mavok-dev.pid)"
```

- [ ] **Step 6: Commit**

```bash
git add src/components/tabs/SettingsTab.tsx public/sw.js
git commit -m "feat: replace theme toggle with a 4-theme picker in SettingsTab"
```

(`public/sw.js` is regenerated by the `prebuild` script during `npm run build` in Step 4 — commit it alongside per the project's established convention.)

---

## Self-Review Notes

- **Spec coverage:** Palette tokens (Section 1) ✅ Task 1 Step 1. Texture fix + Pergamino vignette (Section 2) ✅ Task 1 Steps 2–3. Four-theme architecture — type widening, `setTheme`, `THEME_META` (Section 3) ✅ Task 2. Picker UI (Section 3) ✅ Task 3. Out-of-scope items (no typography/layout changes, no `.stone-card`/`.cord-line`/`.crack-divider` edits) are honored — no task touches those rules.
- **Type consistency:** `AppSettings["theme"]` used identically across Task 2's type widening, `THEME_META`'s `id` field, and `setTheme`'s parameter type; Task 3's `THEME_META.map((t) => ...)` and `setTheme(t.id)` match that exact shape.
- **No placeholders:** every step has complete, literal code; Task 2's expected transient tsc error is explicitly named (which file, which symbol) rather than hand-waved.
