# Cumbre Helada Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the unfinished `dark-fantasy` placeholder theme with `cumbre-helada` ("Cumbre Helada"), a bright glacier/high-peaks theme, across type definitions, theme metadata, CSS palette, and stored-settings normalization.

**Architecture:** Rename the theme id everywhere it's typed/listed (types.ts, useTheme.ts), swap the CSS variable block in globals.css to the new palette, add a bespoke body-texture override copied from `pergamino`'s pattern, and add one normalization line in `loadSettings()` so any existing `"dark-fantasy"` stored value carries forward as `"cumbre-helada"` instead of silently losing its override.

**Tech Stack:** Next.js 15 static export, TypeScript, Tailwind CSS v4 with CSS custom properties, Vitest (jsdom environment).

## Global Constraints

- Theme id: `cumbre-helada`, label: "Cumbre Helada", swatch: `#2f6690` (from spec).
- Palette (from spec): `--bg: #e9f1f5`, `--card: #f8fbfc`, `--accent: #2f6690`, `--cord: #7a1f2b`, `--fg: #1f2e38`, `--muted: #6c7f8a`, `--border-color: #b7c8d1`.
- No changes to any tab component, `Modal`, `CompactRow`, `Tag`, or other shared UI components.
- No changes to the other 3 themes' palettes or CSS blocks.
- Verify with `npx tsc --noEmit && npm run build && npm run lint && npm test` after every task, per project convention (CLAUDE.md) — lint specifically catches issues `tsc`/`build`/`test` don't.

---

### Task 1: Rename theme id in types and theme metadata

**Files:**
- Modify: `src/lib/types.ts:188`
- Modify: `src/hooks/useTheme.ts:12-16`

**Interfaces:**
- Produces: `AppSettings["theme"]` union now includes the literal `"cumbre-helada"` in place of `"dark-fantasy"`. `THEME_META` (array of `{id, label, swatch}`) has its second entry as `{ id: "cumbre-helada", label: "Cumbre Helada", swatch: "#2f6690" }`.

- [ ] **Step 1: Update the `AppSettings["theme"]` union**

In `src/lib/types.ts:188`, change:

```ts
  theme: "piedra-viva" | "dark-fantasy" | "pergamino" | "furia-de-sangre";
```

to:

```ts
  theme: "piedra-viva" | "cumbre-helada" | "pergamino" | "furia-de-sangre";
```

- [ ] **Step 2: Update `THEME_META`**

In `src/hooks/useTheme.ts`, change:

```ts
  { id: "piedra-viva", label: "Piedra Viva", swatch: "#b87333" },
  { id: "dark-fantasy", label: "Dark Fantasy", swatch: "#8b6d2d" },
  { id: "pergamino", label: "Pergamino", swatch: "#9c2b2b" },
  { id: "furia-de-sangre", label: "Furia de Sangre", swatch: "#c23b2b" },
```

to:

```ts
  { id: "piedra-viva", label: "Piedra Viva", swatch: "#b87333" },
  { id: "cumbre-helada", label: "Cumbre Helada", swatch: "#2f6690" },
  { id: "pergamino", label: "Pergamino", swatch: "#9c2b2b" },
  { id: "furia-de-sangre", label: "Furia de Sangre", swatch: "#c23b2b" },
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (If any other file referenced the literal `"dark-fantasy"`, this step surfaces it — grep confirmed during design that only `types.ts`, `useTheme.ts`, and `globals.css` reference it, so none are expected.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts src/hooks/useTheme.ts
git commit -m "Feature Cumbre-Helada-Theme: rename dark-fantasy theme id to cumbre-helada"
```

---

### Task 2: Normalize stored `"dark-fantasy"` settings on load

**Files:**
- Modify: `src/lib/storage.ts:43-59` (`loadSettings`)
- Test: `src/lib/storage.test.ts` (new file)

**Interfaces:**
- Consumes: `AppSettings` type from Task 1 (theme union now `"piedra-viva" | "cumbre-helada" | "pergamino" | "furia-de-sangre"`).
- Produces: `loadSettings(): AppSettings` — same signature as before; now guarantees the returned `theme` is never the literal string `"dark-fantasy"`, even if that value is present in `localStorage`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/storage.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { loadSettings, saveSettings } from "./storage";

describe("loadSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns piedra-viva theme by default when no settings are stored", () => {
    const settings = loadSettings();
    expect(settings.theme).toBe("piedra-viva");
  });

  it("normalizes a stored dark-fantasy theme to cumbre-helada", () => {
    localStorage.setItem(
      "mavok_settings",
      JSON.stringify({ theme: "dark-fantasy", lastCharacterId: "mavok-1" })
    );

    const settings = loadSettings();
    expect(settings.theme).toBe("cumbre-helada");
  });

  it("preserves a stored cumbre-helada theme as-is", () => {
    saveSettings({
      theme: "cumbre-helada",
      lastCharacterId: "mavok-1",
      density: "spacious",
      encyclopediaFavorites: [],
      encyclopediaLanguage: "en",
      magicItemIndicator: "number-only",
    });

    const settings = loadSettings();
    expect(settings.theme).toBe("cumbre-helada");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/storage.test.ts`
Expected: FAIL on the "normalizes a stored dark-fantasy theme" case — `settings.theme` is `"dark-fantasy"`, not `"cumbre-helada"` (the normalization doesn't exist yet).

- [ ] **Step 3: Implement the normalization**

In `src/lib/storage.ts`, change `loadSettings`:

```ts
export function loadSettings(): AppSettings {
  const defaults: AppSettings = {
    theme: "piedra-viva",
    lastCharacterId: "mavok-1",
    density: "spacious",
    encyclopediaFavorites: [],
    encyclopediaLanguage: "en",
    magicItemIndicator: "number-only",
  };
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const settings = raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
    if ((settings.theme as string) === "dark-fantasy") {
      settings.theme = "cumbre-helada";
    }
    return settings;
  } catch {
    return defaults;
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/storage.test.ts`
Expected: PASS (all 3 tests).

- [ ] **Step 5: Run full test suite**

Run: `npm test`
Expected: all tests pass (previous count plus 3 new).

- [ ] **Step 6: Commit**

```bash
git add src/lib/storage.ts src/lib/storage.test.ts
git commit -m "Feature Cumbre-Helada-Theme: normalize stored dark-fantasy settings to cumbre-helada"
```

---

### Task 3: Swap the CSS palette block

**Files:**
- Modify: `src/app/globals.css:30-38`

**Interfaces:**
- Consumes: nothing from prior tasks (pure CSS).
- Produces: a `[data-theme="cumbre-helada"]` selector supplying the same 7 custom properties (`--bg`, `--card`, `--accent`, `--cord`, `--fg`, `--muted`, `--border-color`) every other theme block defines — consumed by Task 4's body override and by all existing token-driven component CSS (`.stone-card`, `.cord-line`, etc.).

- [ ] **Step 1: Replace the CSS block**

In `src/app/globals.css`, change:

```css
[data-theme="dark-fantasy"] {
  --bg: #1a1a2e;
  --card: #16213e;
  --accent: #8b6d2d;
  --cord: #8b2d2d;
  --fg: #e8e0d4;
  --muted: #7a7568;
  --border-color: #2a2a4a;
}
```

to:

```css
[data-theme="cumbre-helada"] {
  --bg: #e9f1f5;
  --card: #f8fbfc;
  --accent: #2f6690;
  --cord: #7a1f2b;
  --fg: #1f2e38;
  --muted: #6c7f8a;
  --border-color: #b7c8d1;
}
```

- [ ] **Step 2: Build to confirm no CSS errors**

Run: `npm run build`
Expected: build succeeds (Tailwind v4 processes custom CSS at build time; a syntax error here would fail the build).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "Feature Cumbre-Helada-Theme: swap dark-fantasy CSS palette for cumbre-helada"
```

---

### Task 4: Add bespoke body-texture override

**Files:**
- Modify: `src/app/globals.css` (insert after the `[data-theme="cumbre-helada"]` variable block added in Task 3, i.e. after the new line 38)

**Interfaces:**
- Consumes: `var(--accent)` and `var(--bg)` from Task 3's `[data-theme="cumbre-helada"]` block.
- Produces: a `[data-theme="cumbre-helada"] body` rule, structurally identical to the existing `[data-theme="pergamino"] body` rule, so the page background renders a frost-vignette + crack-texture + noise composite instead of the generic dark-tuned `body {}` rule.

- [ ] **Step 1: Insert the body override**

In `src/app/globals.css`, immediately after the `[data-theme="cumbre-helada"]` block (end of what was Task 3's insertion, before the `[data-theme="pergamino"]` block), add:

```css
[data-theme="cumbre-helada"] body {
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

This is byte-for-byte the same structure as the existing `[data-theme="pergamino"] body` rule (spec calls for reusing that proven pattern), only the selector changes.

- [ ] **Step 2: Build to confirm no CSS errors**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "Feature Cumbre-Helada-Theme: add bespoke body texture override"
```

---

### Task 5: Full verification and manual browser check

**Files:** none (verification only)

**Interfaces:** none — this task exercises the combined output of Tasks 1–4.

- [ ] **Step 1: Run full verification suite**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four succeed — 0 type errors, successful static export, 0 lint errors, all tests passing (including the 3 new `storage.test.ts` cases from Task 2).

- [ ] **Step 2: Manual verification — theme picker and palette**

Start the dev server (`npm run dev`), open the app, go to Ajustes → Tema. Confirm:
- The second theme row now reads "Cumbre Helada" with a steel-blue swatch dot, not "Dark Fantasy".
- Selecting it applies a pale ice-blue background with a visible crack/vignette texture (not a flat, plain fill).
- Cards, borders, and text are legible (dark slate text on the pale card surface).

- [ ] **Step 3: Manual verification — Rage flair against the new palette**

With Cumbre Helada active, go to Combate and trigger Rage. Confirm the garnet-red ember/heartbeat/ignite flair (`.stone-card-raging`, `.hp-heartbeat`, `.ember-wisp`, `.ignite-flash`, `.ember-burst`) is clearly visible against the pale background, not washed out.

- [ ] **Step 4: Manual verification — old stored theme normalizes correctly**

In browser devtools console, run:

```js
localStorage.setItem("mavok_settings", JSON.stringify({...JSON.parse(localStorage.getItem("mavok_settings") || "{}"), theme: "dark-fantasy"}));
location.reload();
```

Confirm the app loads with Cumbre Helada applied (not an unstyled fallback), and that Ajustes → Tema shows "Cumbre Helada" as the selected theme (checkmark on that row) — confirming `loadSettings()`'s normalization ran and the UI reflects the corrected value, not just the CSS fallback.

- [ ] **Step 5: Restore real settings state**

If the real character's settings were on a different theme before this manual test, reselect that theme in Ajustes → Tema now so the live app returns to its actual prior state (the localStorage write in Step 4 was for verification only).

- [ ] **Step 6: No commit needed for this task**

This task is verification-only; no files changed.

---

## Plan Self-Review

**Spec coverage:**
- Theme identity (id/label/swatch) → Task 1. ✓
- Palette table → Task 3. ✓
- Bespoke body texture reusing `pergamino`'s pattern → Task 4. ✓
- Data safety / `loadSettings` normalization → Task 2. ✓
- Out-of-scope items (no other CSS classes, no other themes) → not touched by any task. ✓
- Verification steps from spec (tsc/build/lint/test, manual theme selection, Rage flair check, old-data normalization check) → all covered in Task 5. ✓

**Placeholder scan:** No "TBD"/"TODO"/"handle appropriately" language; every step has literal code or exact commands.

**Type consistency:** `AppSettings["theme"]` (Task 1) → consumed by `THEME_META` (Task 1) and `loadSettings()`/`saveSettings()` (Task 2, pre-existing signatures unchanged). CSS custom property names (`--bg`, `--card`, `--accent`, `--cord`, `--fg`, `--muted`, `--border-color`) match between Task 3's variable block and Task 4's `var(...)` references, and match the pre-existing names used by `.stone-card` etc. (unchanged, not touched by this plan). No mismatches found.
