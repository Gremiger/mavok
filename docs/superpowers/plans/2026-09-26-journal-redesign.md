# Journal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the Mavok PWA into the "Journal on stone" look (IM Fell + Spectral + Fraunces, carved slabs, Roman-numeral chapters, shield AC, tally-mark Rage) across all four themes, with no behavior or data changes.

**Architecture:** Foundation first. Design tokens and utility classes in `src/app/globals.css` plus fonts in `src/app/layout.tsx` carry the look everywhere; shared primitives (`CollapsibleSection`, `Modal`, `StatBadge`, `Tag`, `GhostChip`, `EmptyState`, nav) are restyled next; then bespoke work on Ficha (`SheetTab`) and Combate (`CombatVitals`, `RageCluster`, `AttackRow`, `CombatTab`). Small pure helpers (contrast, name highlight, HP fraction, theme-color) are unit-tested; `CollapsibleSection` gets a jsdom component test.

**Tech Stack:** Next.js 16 static export, React 19, Tailwind CSS v4 (`@theme inline` in `globals.css`, no `tailwind.config`), `next/font/google`, lucide-react, framer-motion, Vitest 4 (jsdom).

**Spec:** `docs/superpowers/specs/2026-09-26-journal-redesign-design.md` (reference mockup: `docs/superpowers/specs/assets/2026-09-26-journal-redesign-mockup.html`, panel H1 + H2's `.shield`).

## Global Constraints

- No data-model change, no migration; theme IDs `piedra-viva`, `cumbre-helada`, `pergamino`, `furia-de-sangre` and `AppSettings` unchanged.
- No behavior change: same handlers/state; only additive optional props (`CollapsibleSection` `count`, `aside`).
- No new runtime dependencies; icons from `lucide-react` only, always `strokeWidth={1.5}`.
- `/print` page, `DiceBoxCanvas`, dice themes untouched.
- Fonts: IM Fell English (400, normal+italic) → `--font-heading`; Spectral (400/500/600, normal+italic) → `--font-body`; Fraunces (600/900) → new `--font-numeric`. All `subsets: ["latin"]`, `display: "swap"`.
- Numbers never render in IM Fell (old-style figures): any number uses `font-numeric` (lining + tabular).
- Informational text is never smaller than 12px (`text-xs`); text under ~13px uses Spectral (italic for labels), not IM Fell.
- Headings in sentence case: no `uppercase tracking-*` on headings/labels touched by this plan.
- Contrast: `--fg`, `--muted`, `--accent` ≥ 4.5:1 and `--cord` ≥ 3:1 against `--bg`, `--card`, `--surface-hi`, `--surface-lo` in every theme (enforced by test).
- Hooks before any early `return` (e.g. `if (!character) return null;`); no `setState` inside `useEffect` bodies (see `CLAUDE.md`).
- Verify every task with `npx tsc --noEmit && npm run build && npm run lint && npm test` (lint must be 0 errors).
- Commit messages: conventional prefix, **no** `Co-authored-by` trailer (repo rule in `CLAUDE.md`). `public/sw.js` changes on every build — commit it with the task that triggered the build.

## Review Focus

1. **Tapping a chapter's `aside` control** (e.g. the "Grupo" chip on Habilidades) must run the chip's action without collapsing/expanding the section — pinned in Task 4's component test.
2. **HP outside 0…max** (temp-healed above max, `maxHp` 0 on a fresh/broken character, negative HP) must render a sane bar (0–100%, never `NaN%`) — pinned in Task 7's `hpFraction` tests.
3. **Unusual character names** (single word, extra spaces, empty string) must render without crashing or losing text — pinned in Task 6's `splitNameHighlight` tests.
4. **Sections inside a modal opened from a tab** (e.g. `AttackFormModal`) must show no Roman numeral and must not shift the tab's numbering — CSS-only, pinned by an explicit screenshot check in Task 10.
5. **Switching theme at runtime** must update the browser `theme-color`, and a page without the meta tag must not crash — pinned in Task 3's `applyThemeColor` tests.

---

## File Map

| File | Responsibility | Tasks |
|---|---|---|
| `src/lib/contrast.ts` (new) | WCAG contrast math + parse theme token blocks from CSS text | 1 |
| `src/lib/contrast.test.ts` (new) | Unit tests for the helpers | 1 |
| `src/lib/themeContrast.test.ts` (new) | Asserts every theme in `globals.css` meets contrast floors and matches `THEME_META.bg` | 2 |
| `src/app/globals.css` | Tokens, palettes, grain, slab, utility classes, chapter CSS | 2, 3, 4 |
| `src/hooks/useTheme.ts` | `THEME_META.bg`, new swatches, `applyThemeColor` | 2, 3 |
| `src/lib/themeColor.ts` (new) + test | `applyThemeColor(doc, bg)` | 3 |
| `src/app/layout.tsx` | Fonts, default `theme-color` | 3 |
| `src/app/page.tsx` | Toast font, `chapters` class on `<main>`, nav, loading screen | 3, 4, 5 |
| `src/components/ui/CollapsibleSection.tsx` + test | Chapter header, `count`, `aside` | 4 |
| `src/components/ui/{Modal,StatBadge,Tag,GhostChip,EmptyState}.tsx` | Restyle | 5 |
| `src/lib/nameHighlight.ts` (new) + test | Split the name for the red middle-name highlight | 6 |
| `src/lib/utils.ts` | `abilityName()` full Spanish names | 6 |
| `src/components/tabs/SheetTab.tsx` | Header, attributes, saves/skills, features | 4, 6 |
| `src/lib/hpBar.ts` (new) + test | `hpFraction(current, max)` | 7 |
| `src/components/combat/CombatVitals.tsx`, `RageCluster.tsx` | Shield AC, HP bar, tally Rage | 7 |
| `src/components/combat/AttackRow.tsx`, `src/components/tabs/CombatTab.tsx` | Attack rows, quick buttons, conditions, exhaustion | 4, 8 |
| Any file with number-bearing `font-heading` or tiny uppercase labels | Audit | 9 |

---

### Task 1: Contrast and theme-token helpers

**Files:**
- Create: `src/lib/contrast.ts`
- Test: `src/lib/contrast.test.ts`

**Interfaces:**
- Produces:
  - `hexToRgb(hex: string): [number, number, number]` — throws `Error("Not a 6-digit hex color: <hex>")` for anything but `#rrggbb`.
  - `contrastRatio(a: string, b: string): number` — WCAG 2.x ratio, order-independent.
  - `parseThemeTokens(css: string): Record<string, Record<string, string>>` — maps theme id → token name (without `--`) → raw value, collected from rule blocks whose selector list consists only of `:root` and/or `[data-theme="<id>"]` selectors (e.g. `:root, [data-theme="piedra-viva"]`). Blocks like `[data-theme="x"] body` are ignored. `:root` alone contributes to no theme.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/contrast.test.ts
import { describe, expect, test } from "vitest";
import { contrastRatio, hexToRgb, parseThemeTokens } from "./contrast";

describe("hexToRgb", () => {
  test("parses 6-digit hex, case-insensitive", () => {
    expect(hexToRgb("#17130F")).toEqual([0x17, 0x13, 0x0f]);
  });
  test("rejects short, named and rgba colors", () => {
    expect(() => hexToRgb("#fff")).toThrow("Not a 6-digit hex color: #fff");
    expect(() => hexToRgb("red")).toThrow();
    expect(() => hexToRgb("rgba(0,0,0,1)")).toThrow();
  });
});

describe("contrastRatio", () => {
  test("black on white is 21", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });
  test("same color is 1 and order does not matter", () => {
    expect(contrastRatio("#a8977a", "#a8977a")).toBeCloseTo(1, 5);
    expect(contrastRatio("#e8dcc2", "#17130f")).toBeCloseTo(
      contrastRatio("#17130f", "#e8dcc2"),
      10
    );
  });
  test("known pair", () => {
    // #767676 on white is the classic 4.54:1 AA threshold color
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });
});

describe("parseThemeTokens", () => {
  const css = `
@theme inline { --color-background: var(--bg); }
:root,
[data-theme="piedra-viva"] {
  --bg: #17130f;
  --fg: #e8dcc2;
}
[data-theme="pergamino"] { --bg: #d9c9a3; --nav-bg: rgba(1, 2, 3, 0.9); }
[data-theme="pergamino"] body { --bg: #000000; }
:root { --only-root: #111111; }
@media print { body { color: #000; } }
`;
  test("collects tokens per theme, including the :root-shared block", () => {
    const t = parseThemeTokens(css);
    expect(t["piedra-viva"]).toEqual({ bg: "#17130f", fg: "#e8dcc2" });
    expect(t["pergamino"]).toEqual({ bg: "#d9c9a3", "nav-bg": "rgba(1, 2, 3, 0.9)" });
  });
  test("ignores descendant selectors, @theme and bare :root", () => {
    const t = parseThemeTokens(css);
    expect(Object.keys(t).sort()).toEqual(["pergamino", "piedra-viva"]);
    expect(t["pergamino"].bg).toBe("#d9c9a3");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/contrast.test.ts`
Expected: FAIL — `Failed to resolve import "./contrast"`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/contrast.ts
// WCAG 2.x contrast helpers, plus a tiny parser that pulls theme tokens out
// of globals.css so tests can check every theme's palette.

export function hexToRgb(hex: string): [number, number, number] {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`Not a 6-digit hex color: ${hex}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const THEME_SELECTOR = /^\[data-theme="([\w-]+)"\]$/;

export function parseThemeTokens(
  css: string
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  const blockRe = /([^{}]+)\{([^{}]*)\}/g;
  for (const block of css.matchAll(blockRe)) {
    const selectors = block[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const onlyThemeSelectors = selectors.every(
      (s) => s === ":root" || THEME_SELECTOR.test(s)
    );
    if (!onlyThemeSelectors) continue;
    const ids = selectors
      .map((s) => THEME_SELECTOR.exec(s)?.[1])
      .filter((id): id is string => Boolean(id));
    if (ids.length === 0) continue;
    const tokens: Record<string, string> = {};
    for (const decl of block[2].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
      tokens[decl[1]] = decl[2].trim();
    }
    for (const id of ids) out[id] = { ...out[id], ...tokens };
  }
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/contrast.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/contrast.ts src/lib/contrast.test.ts
git commit -m "test: add WCAG contrast and theme-token parsing helpers"
```

---

### Task 2: Theme palettes with enforced contrast

**Files:**
- Test: `src/lib/themeContrast.test.ts` (new)
- Modify: `src/app/globals.css` (the four theme token blocks, lines ~20–112 today; and `@theme inline`, lines 3–17)
- Modify: `src/hooks/useTheme.ts:7-16` (`THEME_META`)

**Interfaces:**
- Consumes: `contrastRatio`, `parseThemeTokens` from Task 1.
- Produces:
  - `THEME_META: { id: AppSettings["theme"]; label: string; swatch: string; bg: string }[]` — `bg` equals the theme's CSS `--bg`.
  - CSS tokens per theme: `--bg --surface-hi --surface-lo --card --fg --muted --accent --cord --border-color --nav-bg --grain-opacity --lip --slab-shadow`.
  - Tailwind colors: `bg-surface-hi`, `bg-surface-lo` (plus all existing ones).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/themeContrast.test.ts
import { readFileSync } from "fs";
import path from "path";
import { describe, expect, test } from "vitest";
import { contrastRatio, parseThemeTokens } from "./contrast";
import { THEME_META } from "@/hooks/useTheme";

const css = readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf8");
const themes = parseThemeTokens(css);
const SURFACES = ["bg", "card", "surface-hi", "surface-lo"] as const;
const TEXT_TOKENS = ["fg", "muted", "accent"] as const;

describe.each(THEME_META.map((t) => [t.id, t] as const))("theme %s", (id, meta) => {
  const tokens = themes[id];

  test("defines every required token", () => {
    expect(tokens, `no [data-theme="${id}"] block in globals.css`).toBeDefined();
    for (const name of [...SURFACES, ...TEXT_TOKENS, "cord", "border-color", "nav-bg", "grain-opacity", "lip", "slab-shadow"]) {
      expect(tokens[name], `--${name} missing in ${id}`).toBeDefined();
    }
  });

  test.each(TEXT_TOKENS.flatMap((fg) => SURFACES.map((bg) => [fg, bg] as const)))(
    "--%s on --%s is at least 4.5:1",
    (fg, bg) => {
      expect(contrastRatio(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5);
    }
  );

  test.each(SURFACES.map((bg) => [bg] as const))("--cord on --%s is at least 3:1", (bg) => {
    expect(contrastRatio(tokens.cord, tokens[bg])).toBeGreaterThanOrEqual(3);
  });

  test("THEME_META.bg matches CSS --bg (drives the theme-color meta)", () => {
    expect(meta.bg.toLowerCase()).toBe(tokens.bg.toLowerCase());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/themeContrast.test.ts`
Expected: FAIL — missing tokens (`--surface-hi` etc.), current piedra-viva `--muted #5c4f3d` below 4.5:1, and a TypeScript/runtime failure on `meta.bg` being `undefined`.

- [ ] **Step 3: Replace the `@theme inline` block and the four theme token blocks in `globals.css`**

Replace lines 3–17 (`@theme inline { … }`) with:

```css
@theme inline {
  --font-heading: var(--font-fell);
  --font-body: var(--font-spectral);
  --font-numeric: var(--font-fraunces);

  --color-background: var(--bg);
  --color-card: var(--card);
  --color-surface-hi: var(--surface-hi);
  --color-surface-lo: var(--surface-lo);
  --color-accent: var(--accent);
  --color-cord: var(--cord);
  --color-foreground: var(--fg);
  --color-muted: var(--muted);
  --color-border: var(--border-color);
  --color-danger: #8b3a3a;
  --color-success: #4a7c59;
  --color-rage: var(--cord);
}
```

Replace the four token blocks (`:root, [data-theme="piedra-viva"]`, `[data-theme="cumbre-helada"]`, `[data-theme="pergamino"]`, `[data-theme="furia-de-sangre"]` — **only the blocks that set `--bg` etc.**, not the `… body` background blocks, which Task 3 handles) with:

```css
:root,
[data-theme="piedra-viva"] {
  --bg: #17130f;
  --surface-hi: #2a221a;
  --surface-lo: #1d1812;
  --card: #1f1913;
  --fg: #e8dcc2;
  --muted: #a8977a;
  --accent: #e9b877;
  --cord: #c9463a;
  --border-color: #4a3d2e;
  --nav-bg: rgba(34, 27, 21, 0.94);
  --grain-opacity: 0.07;
  --lip: rgba(0, 0, 0, 0.45);
  --slab-shadow: rgba(20, 10, 2, 0.75);
}

[data-theme="furia-de-sangre"] {
  --bg: #0f0e0e;
  --surface-hi: #211d1c;
  --surface-lo: #161413;
  --card: #181615;
  --fg: #ece6e0;
  --muted: #a39088;
  --accent: #e06a52;
  --cord: #d23a2c;
  --border-color: #3a2a28;
  --nav-bg: rgba(24, 21, 20, 0.94);
  --grain-opacity: 0.06;
  --lip: rgba(0, 0, 0, 0.5);
  --slab-shadow: rgba(0, 0, 0, 0.8);
}

[data-theme="pergamino"] {
  --bg: #d9c9a3;
  --surface-hi: #f1e6c8;
  --surface-lo: #e6d7b2;
  --card: #ebdfc1;
  --fg: #2e2215;
  --muted: #5f4b30;
  --accent: #7a1f1f;
  --cord: #9b2c22;
  --border-color: #b8a27a;
  --nav-bg: rgba(235, 223, 193, 0.94);
  --grain-opacity: 0.1;
  --lip: rgba(90, 60, 25, 0.16);
  --slab-shadow: rgba(80, 55, 20, 0.35);
}

[data-theme="cumbre-helada"] {
  --bg: #dfe7ec;
  --surface-hi: #f7fafb;
  --surface-lo: #e9eff2;
  --card: #eef3f5;
  --fg: #1c2a33;
  --muted: #4f606b;
  --accent: #2f5f86;
  --cord: #7a1f2b;
  --border-color: #b3c3cc;
  --nav-bg: rgba(238, 243, 245, 0.94);
  --grain-opacity: 0.08;
  --lip: rgba(30, 50, 65, 0.14);
  --slab-shadow: rgba(30, 50, 65, 0.3);
}
```

- [ ] **Step 4: Add `bg` to `THEME_META` and refresh swatches** in `src/hooks/useTheme.ts`

```ts
export const THEME_META: {
  id: AppSettings["theme"];
  label: string;
  swatch: string;
  bg: string;
}[] = [
  { id: "piedra-viva", label: "Piedra Viva", swatch: "#e9b877", bg: "#17130f" },
  { id: "cumbre-helada", label: "Cumbre Helada", swatch: "#2f5f86", bg: "#dfe7ec" },
  { id: "pergamino", label: "Pergamino", swatch: "#7a1f1f", bg: "#d9c9a3" },
  { id: "furia-de-sangre", label: "Furia de Sangre", swatch: "#d23a2c", bg: "#0f0e0e" },
];
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/themeContrast.test.ts src/lib/contrast.test.ts`
Expected: PASS. (Ratios were pre-computed: lowest are pergamino `--muted`/`--bg` 5.06 and furia `--cord`/`--surface-hi` 3.49.)

- [ ] **Step 6: Full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass. The app still uses Cormorant/DM Sans vars until Task 3 — `--font-fell` etc. are undefined, so headings/body fall back to the browser default font for now. That is expected between Task 2 and Task 3; do not ship between them.

- [ ] **Step 7: Commit**

```bash
git add src/app/globals.css src/hooks/useTheme.ts src/lib/themeContrast.test.ts public/sw.js
git commit -m "feat: journal redesign palettes with enforced contrast for all themes"
```

---

### Task 3: Fonts, surfaces, texture, theme-color and utility classes

**Files:**
- Create: `src/lib/themeColor.ts`, `src/lib/themeColor.test.ts`
- Modify: `src/app/layout.tsx` (fonts, meta)
- Modify: `src/hooks/useTheme.ts` (call `applyThemeColor`)
- Modify: `src/app/page.tsx:81-91` (Toaster font)
- Modify: `src/app/globals.css` (body backgrounds, `.stone-card`, `.stone-card-raging`, new utility classes)

**Interfaces:**
- Produces:
  - `applyThemeColor(doc: Document, bg: string | undefined): void` — sets `content` on `meta[name="theme-color"]`; no-op if the meta or `bg` is missing.
  - CSS utility classes used by later tasks (exact names): `font-numeric` (Tailwind, from `--font-numeric`) with lining/tabular figures, `btn-primary`, `btn-seal`, `ink-stamp`, `shield-ac`, `tally-mark` (+ `is-used`), `prof-mark` (+ `is-on`), `hp-bar`, `rule-line`.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/themeColor.test.ts
import { afterEach, describe, expect, test } from "vitest";
import { applyThemeColor } from "./themeColor";

afterEach(() => {
  document.head.innerHTML = "";
});

describe("applyThemeColor", () => {
  test("updates the theme-color meta content", () => {
    document.head.innerHTML = '<meta name="theme-color" content="#000000">';
    applyThemeColor(document, "#d9c9a3");
    expect(
      document.querySelector('meta[name="theme-color"]')?.getAttribute("content")
    ).toBe("#d9c9a3");
  });
  test("does nothing when the meta tag is absent", () => {
    expect(() => applyThemeColor(document, "#d9c9a3")).not.toThrow();
  });
  test("does nothing when bg is undefined", () => {
    document.head.innerHTML = '<meta name="theme-color" content="#17130f">';
    applyThemeColor(document, undefined);
    expect(
      document.querySelector('meta[name="theme-color"]')?.getAttribute("content")
    ).toBe("#17130f");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/themeColor.test.ts`
Expected: FAIL — `Failed to resolve import "./themeColor"`.

- [ ] **Step 3: Implement `applyThemeColor`**

```ts
// src/lib/themeColor.ts
// Keeps the browser/OS chrome color (theme-color meta) in step with the
// active theme's background.
export function applyThemeColor(doc: Document, bg: string | undefined): void {
  if (!bg) return;
  doc.querySelector('meta[name="theme-color"]')?.setAttribute("content", bg);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/themeColor.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Wire it into `useTheme`**

In `src/hooks/useTheme.ts` add `import { applyThemeColor } from "@/lib/themeColor";` and a module-level helper below `THEME_META`:

```ts
function themeBg(id: AppSettings["theme"]): string | undefined {
  return THEME_META.find((t) => t.id === id)?.bg;
}
```

In the mount effect, after `document.documentElement.setAttribute("data-theme", settings.theme);` add:

```ts
    applyThemeColor(document, themeBg(settings.theme));
```

In `setTheme`, after `document.documentElement.setAttribute("data-theme", next);` add:

```ts
    applyThemeColor(document, themeBg(next));
```

- [ ] **Step 6: Swap fonts in `src/app/layout.tsx`**

Replace the Cormorant/DM Sans imports and constants with:

```tsx
import { IM_Fell_English, Spectral, Fraunces } from "next/font/google";

const fell = IM_Fell_English({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-fell",
  display: "swap",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "900"],
  variable: "--font-fraunces",
  display: "swap",
});
```

Change the `<html>` className to `` `${fell.variable} ${spectral.variable} ${fraunces.variable}` `` and the meta to `<meta name="theme-color" content="#17130f" />`.

- [ ] **Step 7: Fix the Toaster font** in `src/app/page.tsx`: change `fontFamily: "var(--font-inter)",` to `fontFamily: "var(--font-body)",`.

- [ ] **Step 8: Replace backgrounds and surfaces in `globals.css`**

Delete all three crack-gradient background rules: `[data-theme="cumbre-helada"] body { … }`, the plain `body { … }` rule, and `[data-theme="pergamino"] body { … }`. Keep the iOS input font-size rule. Add:

```css
body {
  -webkit-font-smoothing: antialiased;
  background:
    radial-gradient(120% 55% at 50% 0%, var(--surface-hi) 0%, transparent 65%),
    var(--bg);
  background-attachment: fixed;
}

[data-theme="pergamino"] body,
[data-theme="cumbre-helada"] body {
  background:
    radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.08) 100%),
    radial-gradient(120% 55% at 50% 0%, var(--surface-hi) 0%, transparent 65%),
    var(--bg);
  background-attachment: fixed;
}

/* Film grain — one fixed layer behind all content, strength per theme */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: var(--grain-opacity);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

Replace the `.stone-card` rule with:

```css
/* Carved slab */
.stone-card {
  background: linear-gradient(180deg, var(--surface-hi), var(--surface-lo));
  border: 1px solid color-mix(in srgb, var(--border-color) 55%, transparent);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--fg) 8%, transparent),
    inset 0 -2px 0 var(--lip),
    0 10px 24px -10px var(--slab-shadow);
}
```

In `.stone-card-raging`, change the first `background-image` layer from the old 135deg card gradient to `linear-gradient(180deg, var(--surface-hi), var(--surface-lo)),` and change its `box-shadow` first two lines to `inset 0 1px 0 color-mix(in srgb, var(--fg) 8%, transparent), inset 0 -2px 0 var(--lip),`. Leave the sheen `::before` and all rage keyframes untouched.

Add these utility classes (after `.stone-card-raging`'s block):

```css
/* Numbers: Fraunces with lining, tabular figures */
.font-numeric {
  font-variant-numeric: lining-nums tabular-nums;
}

/* Keyboard focus */
:where(button, a, input, textarea, select, [role="button"], [tabindex]):focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.btn-primary {
  background: var(--accent);
  color: var(--bg);
}
.btn-seal {
  background: color-mix(in srgb, var(--cord) 10%, transparent);
  box-shadow: inset 0 0 0 1px var(--cord);
  color: color-mix(in srgb, var(--cord) 55%, var(--fg));
}

/* Small squared label, like an ink stamp */
.ink-stamp {
  display: inline-flex;
  align-items: center;
  padding: 0 0.375rem;
  border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
  border-radius: 3px;
  color: var(--accent);
  font-family: var(--font-body);
  font-style: italic;
  font-size: 0.75rem;
  line-height: 1.25rem;
  white-space: nowrap;
}

/* AC shield */
.shield-ac {
  clip-path: polygon(50% 0, 100% 14%, 100% 62%, 50% 100%, 0 62%, 0 14%);
  background: linear-gradient(180deg, var(--cord), color-mix(in srgb, var(--cord) 60%, #000));
  color: #f7e6d8;
}

/* Rage tally mark */
.tally-mark {
  display: block;
  width: 5px;
  height: 22px;
  border-radius: 2px;
  transform: rotate(10deg);
  background: var(--cord);
  box-shadow: 0 0 8px color-mix(in srgb, var(--cord) 55%, transparent);
  transition: background-color 150ms, box-shadow 150ms;
}
.tally-mark.is-used {
  background: transparent;
  box-shadow: none;
  border: 1px dashed var(--muted);
}

/* Proficiency diamond */
.prof-mark {
  display: inline-block;
  width: 0.6rem;
  height: 0.6rem;
  transform: rotate(45deg);
  border-radius: 2px;
  border: 1px solid var(--muted);
}
.prof-mark.is-on {
  background: var(--accent);
  border-color: var(--accent);
}

/* HP bar */
.hp-bar {
  height: 7px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--bg) 70%, #000);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}
.hp-bar > span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, color-mix(in srgb, var(--cord) 65%, #000), var(--cord));
  transition: width 300ms ease;
}

/* Hand-ruled line */
.rule-line {
  height: 1px;
  background: linear-gradient(90deg, var(--border-color), transparent);
}
```

Leave `.nav-island-bottom`, `dialog`, `.pb-safe-nav`, `.bottom-safe-fab`, print and `#dice-box-canvas` rules as they are. **Do not** delete `.cord-line`, `.cord-knot`, `.crack-divider` yet (Task 4 removes them with their usages).

- [ ] **Step 9: Full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass. If `next build` reports an unknown font export, check the exact `next/font/google` export name with `grep -o "IM_Fell_English[A-Za-z_]*" node_modules/next/dist/compiled/@next/font/dist/google/index.d.ts | sort -u` and use the plain `IM_Fell_English`.

- [ ] **Step 10: Visual smoke check**

Start `npm run dev`, open `http://localhost:3000` at 390×844 (Chrome DevTools device mode or the chrome-devtools MCP `emulate` tool with `390x844x2,mobile,touch`). Switch themes in Ajustes → Tema. Expect: Fell headings, Spectral body, grain visible but subtle, slabs lighter on top than bottom in all four themes, the browser `theme-color` meta changes on switch (`document.querySelector('meta[name=theme-color]').content`).

- [ ] **Step 11: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx src/app/globals.css src/hooks/useTheme.ts src/lib/themeColor.ts src/lib/themeColor.test.ts public/sw.js
git commit -m "feat: journal redesign fonts, carved surfaces, grain and theme-color"
```

---

### Task 4: Chapter sections (`CollapsibleSection`) and retiring cord/crack decorations

**Files:**
- Modify: `src/components/ui/CollapsibleSection.tsx` (full rewrite below)
- Test: `src/components/ui/CollapsibleSection.test.tsx` (new)
- Modify: `src/app/globals.css` (add chapter CSS, delete `.cord-line`, `.cord-line::before`, `.cord-knot::before`, `.crack-divider`, `.crack-divider::after`)
- Modify: `src/app/page.tsx` (`chapters` class on `<motion.main>`)
- Modify: `src/components/tabs/SheetTab.tsx` (header cord classes at ~151–168, PB chip ~181–183, Grupo chip ~260–267, counts)
- Modify: `src/components/tabs/CombatTab.tsx:253`, `src/components/tabs/SettingsTab.tsx:597`, `src/components/tabs/InventoryTab.tsx:311,497` (`crack-divider` usages)

**Interfaces:**
- Consumes: `.rule-line` from Task 3.
- Produces: `CollapsibleSection` props `{ title: string; defaultOpen?: boolean; forceOpenKey?: number; count?: number | string; aside?: React.ReactNode; children: React.ReactNode }`. DOM: `section.chapter` > header `div` > (`button[aria-expanded]` containing `span.chapter-num`, title, and when collapsed `span.chapter-leader` + count) + optional aside `div`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/ui/CollapsibleSection.test.tsx
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CollapsibleSection } from "./CollapsibleSection";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function render(ui: React.ReactNode) {
  act(() => root.render(ui));
}
const toggle = () => container.querySelector("button[aria-expanded]") as HTMLButtonElement;

describe("CollapsibleSection", () => {
  test("starts collapsed, shows count, hides children", () => {
    render(<CollapsibleSection title="Habilidades" count={18}><p>body</p></CollapsibleSection>);
    expect(toggle().getAttribute("aria-expanded")).toBe("false");
    expect(container.textContent).toContain("18");
    expect(container.textContent).not.toContain("body");
  });

  test("opening shows children and hides the count", () => {
    render(<CollapsibleSection title="Habilidades" count={18}><p>body</p></CollapsibleSection>);
    act(() => toggle().click());
    expect(toggle().getAttribute("aria-expanded")).toBe("true");
    expect(container.textContent).toContain("body");
    expect(container.textContent).not.toContain("18");
  });

  test("clicking an aside control runs it without toggling the section", () => {
    const onAside = vi.fn();
    render(
      <CollapsibleSection title="Habilidades" aside={<button onClick={onAside}>Grupo</button>}>
        <p>body</p>
      </CollapsibleSection>
    );
    const asideButton = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "Grupo"
    )!;
    act(() => asideButton.click());
    expect(onAside).toHaveBeenCalledOnce();
    expect(toggle().getAttribute("aria-expanded")).toBe("false");
    expect(toggle().contains(asideButton)).toBe(false);
  });

  test("aside stays visible while open", () => {
    render(
      <CollapsibleSection title="Atributos" defaultOpen aside={<span>competencia +2</span>}>
        <p>body</p>
      </CollapsibleSection>
    );
    expect(container.textContent).toContain("competencia +2");
  });

  test("a new forceOpenKey opens a collapsed section", () => {
    render(<CollapsibleSection title="Acciones" forceOpenKey={0}><p>body</p></CollapsibleSection>);
    expect(container.textContent).not.toContain("body");
    render(<CollapsibleSection title="Acciones" forceOpenKey={1}><p>body</p></CollapsibleSection>);
    expect(container.textContent).toContain("body");
  });

  test("numeral slot is decorative and empty (numbering is pure CSS)", () => {
    render(<CollapsibleSection title="Dotes"><p>body</p></CollapsibleSection>);
    const num = container.querySelector(".chapter-num")!;
    expect(num.getAttribute("aria-hidden")).toBe("true");
    expect(num.textContent).toBe("");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/CollapsibleSection.test.tsx`
Expected: FAIL — no `button[aria-expanded]` (current button has no `aria-expanded`), count not rendered, `.chapter-num` missing.

- [ ] **Step 3: Rewrite `CollapsibleSection.tsx`**

```tsx
"use client";

import { useState } from "react";

export function CollapsibleSection({
  title,
  defaultOpen = false,
  forceOpenKey,
  count,
  aside,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  forceOpenKey?: number;
  count?: number | string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [prevForceOpenKey, setPrevForceOpenKey] = useState(forceOpenKey);

  if (forceOpenKey !== undefined && forceOpenKey !== prevForceOpenKey) {
    setPrevForceOpenKey(forceOpenKey);
    setOpen(true);
  }

  return (
    <section className="chapter mb-2">
      {/* Header is a div, not a button: `aside` may hold its own buttons. */}
      <div className="flex items-baseline gap-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex-1 min-w-0 flex items-baseline gap-2.5 py-2.5 text-left"
        >
          <span className="chapter-num font-heading text-cord text-[1.4rem] leading-none" aria-hidden="true" />
          <span className="font-heading text-foreground text-[1.3rem] leading-tight">
            {title}
          </span>
          {!open && (
            <>
              <span className="chapter-leader flex-1" aria-hidden="true" />
              {count !== undefined && (
                <span className="font-numeric italic text-sm text-muted">{count}</span>
              )}
            </>
          )}
        </button>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      {open && (
        <>
          <div className="rule-line mb-3" />
          <div>{children}</div>
        </>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ui/CollapsibleSection.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Chapter CSS and retire old decorations in `globals.css`**

Delete the rules `.cord-line`, `.cord-line::before`, `.cord-knot::before`, `.crack-divider`, `.crack-divider::after` (and their comments). Add:

```css
/* Chapters: Roman numerals per tab, via CSS counters (see CollapsibleSection) */
.chapter-num {
  display: none;
}
.chapters {
  counter-reset: chapter;
}
.chapters .chapter {
  counter-increment: chapter;
}
.chapters .chapter-num {
  display: inline-block;
  min-width: 1.6rem;
}
.chapters .chapter-num::before {
  content: counter(chapter, upper-roman);
}
/* Sections inside modals: no numeral, don't consume the tab's numbering */
.chapters dialog .chapter {
  counter-increment: none;
}
.chapters dialog .chapter-num {
  display: none;
}
.chapter-leader {
  min-width: 1rem;
  border-bottom: 1px dotted var(--border-color);
  transform: translateY(-0.3em);
}
```

- [ ] **Step 6: Add `chapters` to the tab container** in `src/app/page.tsx`: change `className="flex-1 overflow-y-auto pb-safe-nav"` on `<motion.main>` to `className="chapters flex-1 overflow-y-auto pb-safe-nav"`. (Only one tab renders at a time, so the counter resets per tab.)

- [ ] **Step 7: Remove every `crack-divider` / `cord-*` usage**

Run `grep -rn "crack-divider\|cord-line\|cord-knot" src` and fix each hit:
- `SheetTab.tsx` header (~151–168): change `<div className="mb-6 cord-line pl-4">` → `<div className="mb-6">`, `<div className="relative cord-knot flex items-center gap-3">` → `<div className="flex items-center gap-3">`, `<div className="crack-divider mt-2 mb-2" />` → `<div className="rule-line mt-2 mb-2" />`. (Task 6 redesigns this header fully.)
- `CombatTab.tsx:253`: `<div className="crack-divider" />` → `<div className="rule-line" />`.
- `SettingsTab.tsx:597`: `crack-divider mb-4` → `rule-line mb-4`.
- `InventoryTab.tsx:311`: `crack-divider mb-4` → `rule-line mb-4`; `InventoryTab.tsx:497`: `crack-divider` → `rule-line`.

Re-run the grep: expected no output.

- [ ] **Step 8: Move the floating chips into `aside` in `SheetTab.tsx`**

Attributes (~181–210): delete the wrapping `<div className="relative">`, its absolutely-positioned `<div className="absolute right-0 top-0 z-10" …><GhostChip>PB …</GhostChip></div>` and the matching closing `</div>`, and pass the chip as `aside`:

```tsx
      <CollapsibleSection
        title="Atributos"
        defaultOpen
        aside={<GhostChip>PB {formatModifier(meta.proficiencyBonus)}</GhostChip>}
      >
```

(Task 6 replaces this aside with the "competencia" text.)

Habilidades (~259–310): same treatment for the "Grupo" chip:

```tsx
      <CollapsibleSection
        title="Habilidades"
        count={Object.keys(skills).length}
        aside={
          <GhostChip onClick={() => setGroupByAbility((g) => !g)}>
            {groupByAbility ? "A–Z" : "Grupo"}
          </GhostChip>
        }
      >
```

Add counts to the other Ficha sections:

```tsx
<CollapsibleSection title="Tiradas de salvación" count={ABILITIES.length}>
<CollapsibleSection title="Rasgos y características" count={features.filter((f) => f.source !== "Dote" && f.level <= meta.level).length}>
<CollapsibleSection title="Dotes" count={features.filter((f) => f.source === "Dote" && f.level <= meta.level).length}>
```

In `CombatTab.tsx` (~327): `<CollapsibleSection title="Acciones" defaultOpen forceOpenKey={attacksForceOpenKey} count={attacks.length}>`.

- [ ] **Step 9: Full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass, lint 0 errors.

- [ ] **Step 10: Visual check**

Dev server at 390×844. Ficha: sections read "I Atributos … PB +2" (open, chip aligned on the title baseline), "II Tiradas de salvación ······ 6", "III Habilidades ······ 18  Grupo", etc. Combate: "I Acciones", then II, III, IV. Tapping "⚔ Atacar" still opens and scrolls to Acciones. Open the "+ añadir ataque" form (Acciones → add row) and confirm the nested section inside the modal shows **no** numeral.

- [ ] **Step 11: Commit**

```bash
git add src/components/ui/CollapsibleSection.tsx src/components/ui/CollapsibleSection.test.tsx src/app/globals.css src/app/page.tsx src/components/tabs/SheetTab.tsx src/components/tabs/CombatTab.tsx src/components/tabs/SettingsTab.tsx src/components/tabs/InventoryTab.tsx public/sw.js
git commit -m "feat: numbered chapter sections with contents rows and aside slot"
```

---

### Task 5: Shared primitives, nav island and loading screen

**Files:**
- Modify: `src/components/ui/Modal.tsx`, `StatBadge.tsx`, `Tag.tsx`, `GhostChip.tsx`, `EmptyState.tsx`
- Modify: `src/app/page.tsx` (loading screen ~50–58, nav ~117–149, `TAB_META` icons)

**Interfaces:**
- Consumes: `.ink-stamp`, `bg-surface-hi` from Tasks 2–3.
- Produces: unchanged component props (visual only).

- [ ] **Step 1: `Modal.tsx`** — add `import { X } from "lucide-react";` and replace the sticky header `div`:

```tsx
      <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-border bg-surface-hi z-10">
        <h2 className="font-heading text-foreground text-xl leading-tight">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="w-9 h-9 -mr-2 flex items-center justify-center rounded-lg text-muted hover:text-foreground transition-colors"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>
```

- [ ] **Step 2: `StatBadge.tsx`** — replace the two inner spans:

```tsx
      <span
        className={`font-numeric font-semibold leading-tight text-accent ${compact ? "text-base" : "text-lg"}`}
      >
        {value}
      </span>
      <span className="text-muted text-xs italic">{label}</span>
```

and in the outer className change `px-1.5 py-1 text-[0.6875rem] min-w-[2.5rem]` → `px-2 py-1 min-w-[2.75rem]`, `px-2.5 py-1.5 text-xs min-w-[3rem]` → `px-2.5 py-1.5 min-w-[3rem]`, `rounded-lg` stays, and `active:scale-95 transition-transform` → `active:scale-[0.97] transition-transform duration-150`.

- [ ] **Step 3: `Tag.tsx`** — add `import { X } from "lucide-react";`, replace `colors` and the markup:

```tsx
  const colors = {
    default: "",
    success: "!text-success !border-success/50",
    danger: "!text-danger !border-danger/50",
  };

  return (
    <span className={`ink-stamp gap-1 ${colors[variant]}`}>
      <span onClick={onClick} className={onClick ? "cursor-pointer" : undefined}>
        {label}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar ${label}`}
          className="opacity-60 hover:opacity-100 -mr-1 p-0.5"
        >
          <X size={12} strokeWidth={1.5} />
        </button>
      )}
    </span>
  );
```

- [ ] **Step 4: `GhostChip.tsx`** — in the className, change `text-[0.6875rem] px-2.5 py-1 rounded-full border transition-colors` → `text-xs italic px-2.5 py-1 rounded-md border transition-colors duration-150`.

- [ ] **Step 5: `EmptyState.tsx`** — replace the returned JSX:

```tsx
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="w-10 h-10 rotate-45 rounded-md border border-border flex items-center justify-center">
        <Icon className="-rotate-45 w-5 h-5 text-muted" strokeWidth={1.5} />
      </div>
      <p className="text-muted text-sm italic max-w-[240px] [text-wrap:balance]">{message}</p>
    </div>
```

- [ ] **Step 6: Nav island in `page.tsx`**

Set every `TAB_META` icon to `strokeWidth={1.5}` (e.g. `<Shield size={20} strokeWidth={1.5} />`). Replace the nav's inner `div` and buttons:

```tsx
              <div
                className="mx-auto max-w-md flex items-center justify-around h-16 rounded-2xl border border-border/60"
                style={{
                  background: "var(--nav-bg)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  boxShadow:
                    "0 6px 24px var(--slab-shadow), inset 0 1px 0 color-mix(in srgb, var(--fg) 6%, transparent)",
                }}
              >
                {TAB_META.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={activeTab === tab.id ? "page" : undefined}
                    className={`relative flex flex-col items-center justify-center gap-0.5 font-heading text-[0.75rem] tracking-[-0.01em] flex-1 h-full transition-colors duration-200 ${
                      activeTab === tab.id ? "text-accent" : "text-muted"
                    }`}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-1 w-1.5 h-1.5 rotate-45 rounded-[1px] bg-cord"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
```

- [ ] **Step 7: Loading screen in `page.tsx`** — replace the `if (!charState.character)` return:

```tsx
  if (!charState.character) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <p className="font-heading italic text-muted">Diario de campaña de</p>
          <p className="font-heading text-4xl text-foreground">Mavok</p>
        </motion.div>
      </div>
    );
  }
```

(Hooks in `Home` are all above this return already — keep it that way.)

- [ ] **Step 8: Full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 9: Visual check**

390×844, all four themes: nav background matches the theme (light bar on Pergamino/Cumbre helada), all six labels fit without overlapping — measure with `Array.from(document.querySelectorAll('nav button span')).map(s => s.scrollWidth > s.parentElement.clientWidth)` → all `false`. If "Enciclopedia" overflows, change the nav label class to `font-body italic text-[0.75rem]` (Spectral, narrower) and re-check. Open any modal (Ajustes → Historial de niveles): Fell title, X icon, focus ring visible when tabbing with a keyboard.

- [ ] **Step 10: Commit**

```bash
git add src/components/ui/Modal.tsx src/components/ui/StatBadge.tsx src/components/ui/Tag.tsx src/components/ui/GhostChip.tsx src/components/ui/EmptyState.tsx src/app/page.tsx public/sw.js
git commit -m "feat: restyle shared primitives, nav island and loading screen"
```

---

### Task 6: Ficha — header, attributes, saves, skills, features

**Files:**
- Create: `src/lib/nameHighlight.ts`, `src/lib/nameHighlight.test.ts`
- Modify: `src/lib/utils.ts` (add `abilityName`)
- Create: `src/lib/abilityName.test.ts`
- Modify: `src/components/tabs/SheetTab.tsx`

**Interfaces:**
- Consumes: `CollapsibleSection` `aside`/`count` (Task 4); `.prof-mark`, `.ink-stamp`, `font-numeric`, `rule-line` (Task 3).
- Produces:
  - `splitNameHighlight(name: string): { before: string; highlight: string; after: string }` — `highlight` is the second whitespace-separated word up to its first hyphen; `before + highlight + after === name.trim()` always.
  - `abilityName(key: AbilityScore): string` — full Spanish name (`"Fuerza"`, `"Destreza"`, `"Constitución"`, `"Inteligencia"`, `"Sabiduría"`, `"Carisma"`).

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/nameHighlight.test.ts
import { describe, expect, test } from "vitest";
import { splitNameHighlight } from "./nameHighlight";

const joined = (p: ReturnType<typeof splitNameHighlight>) => p.before + p.highlight + p.after;

describe("splitNameHighlight", () => {
  test("highlights the second word up to its first hyphen", () => {
    const p = splitNameHighlight("Mavok Toro-de-casa Toduk-Rojum");
    expect(p).toEqual({ before: "Mavok ", highlight: "Toro", after: "-de-casa Toduk-Rojum" });
  });
  test("plain second word", () => {
    expect(splitNameHighlight("Mavok Grr")).toEqual({ before: "Mavok ", highlight: "Grr", after: "" });
  });
  test("single word: no highlight", () => {
    expect(splitNameHighlight("Mavok")).toEqual({ before: "Mavok", highlight: "", after: "" });
  });
  test("empty and whitespace-only names", () => {
    expect(splitNameHighlight("")).toEqual({ before: "", highlight: "", after: "" });
    expect(splitNameHighlight("   ")).toEqual({ before: "", highlight: "", after: "" });
  });
  test("extra spaces are preserved between words, outer spaces trimmed", () => {
    const p = splitNameHighlight("  Mavok   Toro  ");
    expect(p.highlight).toBe("Toro");
    expect(joined(p)).toBe("Mavok   Toro");
  });
  test("second word starting with a hyphen: no highlight, no text lost", () => {
    const p = splitNameHighlight("Mavok -Toro");
    expect(p.highlight).toBe("");
    expect(joined(p)).toBe("Mavok -Toro");
  });
});
```

```ts
// src/lib/abilityName.test.ts
import { expect, test } from "vitest";
import { abilityName } from "./utils";

test("full Spanish ability names", () => {
  expect(["str", "dex", "con", "int", "wis", "cha"].map((k) => abilityName(k as never))).toEqual([
    "Fuerza", "Destreza", "Constitución", "Inteligencia", "Sabiduría", "Carisma",
  ]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/nameHighlight.test.ts src/lib/abilityName.test.ts`
Expected: FAIL — `./nameHighlight` not found; `abilityName` is not exported.

- [ ] **Step 3: Implement**

```ts
// src/lib/nameHighlight.ts
// Splits a character name so the header can ink the second name word
// (up to its first hyphen) in seal red: "Mavok [Toro]-de-casa Toduk-Rojum".
export function splitNameHighlight(name: string): {
  before: string;
  highlight: string;
  after: string;
} {
  const trimmed = name.trim();
  const m = /^(\S+\s+)([^\s-]+)(.*)$/.exec(trimmed);
  if (!m) return { before: trimmed, highlight: "", after: "" };
  return { before: m[1], highlight: m[2], after: m[3] };
}
```

In `src/lib/utils.ts`, after `abilityLabel`:

```ts
const ABILITY_NAMES: Record<AbilityScore, string> = {
  str: "Fuerza",
  dex: "Destreza",
  con: "Constitución",
  int: "Inteligencia",
  wis: "Sabiduría",
  cha: "Carisma",
};

export function abilityName(key: AbilityScore): string {
  return ABILITY_NAMES[key];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/nameHighlight.test.ts src/lib/abilityName.test.ts`
Expected: PASS.

- [ ] **Step 5: Header** — in `SheetTab.tsx` add imports `import { splitNameHighlight } from "@/lib/nameHighlight";` and `abilityName` to the `@/lib/utils` import list, plus `Zap` to the lucide import (`import { User, Zap } from "lucide-react";`). Replace the whole header block (`{/* Header */}` div) with:

```tsx
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3">
          {meta.portraitDataUrl ? (
            <img
              src={meta.portraitDataUrl}
              alt={meta.name}
              className="w-14 h-14 rounded-xl object-cover border border-accent/60 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl stone-card flex items-center justify-center text-muted shrink-0">
              <User size={24} strokeWidth={1.5} />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-heading italic text-sm text-muted">Diario de campaña de</p>
            <h1 className="font-heading text-[2.125rem] leading-[1.02] text-foreground [text-wrap:balance]">
              {nameParts.before}
              {nameParts.highlight && <span className="text-cord">{nameParts.highlight}</span>}
              {nameParts.after}
            </h1>
          </div>
        </div>
        <div className="rule-line mt-3 mb-2" />
        <p className="text-sm text-muted">
          {meta.class} {meta.subclass ? `· ${meta.subclass}` : ""} · Nivel{" "}
          <span className="font-numeric">{meta.level}</span>
        </p>
        <p className="text-sm text-muted mt-0.5">
          {meta.species} · {meta.giantAncestry} · {meta.background} · {meta.origin}
        </p>
      </header>
```

and compute `const nameParts = splitNameHighlight(meta.name);` next to the other derived values (after the `if (!character) return null;` guard — it is not a hook).

- [ ] **Step 6: Attributes** — replace the section's `aside` and grid buttons:

```tsx
      <CollapsibleSection
        title="Atributos"
        defaultOpen
        aside={
          <span className="font-heading italic text-sm text-muted">
            competencia{" "}
            <span className="font-numeric not-italic">{formatModifier(meta.proficiencyBonus)}</span>
          </span>
        }
      >
        <div className="grid grid-cols-3 gap-2">
          {ABILITIES.map((ab) => (
            <button
              key={ab}
              onClick={() => rollAbility(ab)}
              className="stone-card rounded-xl px-1 pt-2 pb-2.5 text-center active:scale-[0.97] transition-transform duration-150 cursor-pointer"
            >
              <div className="italic text-xs text-muted truncate">{abilityName(ab)}</div>
              <div className="font-numeric font-black text-[1.8rem] leading-tight text-foreground">
                {formatModifier(abilityModifier(attributes[ab]) + exhaustionPenalty(combat.exhaustionLevel))}
              </div>
              <div className="font-numeric text-xs text-accent">{attributes[ab]}</div>
            </button>
          ))}
        </div>
```

(`GhostChip` is still imported for the Habilidades aside.)

- [ ] **Step 7: Saves and skills rows**

In the saves list, replace the proficiency circle span with `<span className={`prof-mark ${savingThrows[ab]?.proficient ? "is-on" : ""}`} aria-hidden="true" />`, the label `<span>{abilityLabel(ab)}</span>` with `<span>{abilityName(ab)}</span>`, the ⚡ span with `<Zap size={12} strokeWidth={1.5} className="text-accent" aria-label="Ventaja automática (Danger Sense)" />`, and the total's `className="font-heading text-accent"` with `className="font-numeric font-semibold text-accent"`.

In `renderSkillRow`: circle span → `<span className={`prof-mark ${skill.proficient ? "is-on" : ""}`} aria-hidden="true" />`; total `font-heading text-accent` → `font-numeric font-semibold text-accent`; the FUE button className → `ink-stamp shrink-0` (keep `title` and handler).

Passive badges: label span → `className="text-muted text-xs italic"`, value span → `className="font-numeric font-semibold text-accent text-sm"`. Group-by-ability sub-labels: `text-muted text-[0.6rem] uppercase tracking-widest px-1 mb-1` → `font-heading italic text-sm text-muted px-1 mb-1` and render `{abilityName(ab)}` instead of `{abilityLabelShort(ab)}` (remove `abilityLabelShort` from imports only if no longer used — `renderSkillRow` still uses it for the `showAbility` suffix, so keep it).

- [ ] **Step 8: Features, feats, sub-headings**

Feature and feat cards: name span `font-heading text-accent text-base font-semibold` → `font-heading text-foreground text-lg leading-tight`; source span → `className="ink-stamp"`. Every `<h4 className="text-muted text-xs uppercase mb-1">` (Competencias, Personalidad) → `<h4 className="font-heading italic text-sm text-muted mb-0.5">`. "Sin dotes todavía." → add `italic`.

- [ ] **Step 9: Full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass, lint 0 errors.

- [ ] **Step 10: Visual check**

390×844, all four themes, Ficha: "Diario de campaña de / Mavok **Toro**-de-casa Toduk-Rojum" with "Toro" in red; attribute cards show +3 big / 17 small; save and skill rows show diamonds; "competencia +2" sits on the Atributos title line. Compare with the mockup (`docs/superpowers/specs/assets/2026-09-26-journal-redesign-mockup.html`, H1).

- [ ] **Step 11: Commit**

```bash
git add src/lib/nameHighlight.ts src/lib/nameHighlight.test.ts src/lib/abilityName.test.ts src/lib/utils.ts src/components/tabs/SheetTab.tsx public/sw.js
git commit -m "feat: journal-style Ficha header, modifier-first attributes and rows"
```

---

### Task 7: Combate vitals — shield AC, HP bar, tally-mark Rage

**Files:**
- Create: `src/lib/hpBar.ts`, `src/lib/hpBar.test.ts`
- Modify: `src/components/combat/CombatVitals.tsx`
- Modify: `src/components/combat/RageCluster.tsx`

**Interfaces:**
- Consumes: `.shield-ac`, `.hp-bar`, `.tally-mark`, `.ink-stamp`, `font-numeric` (Task 3).
- Produces: `hpFraction(current: number, max: number): number` in `[0, 1]`; `0` when `max <= 0` or either input is non-finite.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/hpBar.test.ts
import { describe, expect, test } from "vitest";
import { hpFraction } from "./hpBar";

describe("hpFraction", () => {
  test("ratio of current to max", () => {
    expect(hpFraction(47, 55)).toBeCloseTo(47 / 55, 10);
  });
  test("clamps above max (e.g. over-healed) to 1", () => {
    expect(hpFraction(60, 55)).toBe(1);
  });
  test("clamps negative HP to 0", () => {
    expect(hpFraction(-5, 55)).toBe(0);
  });
  test("max of 0 or less gives 0, never NaN/Infinity", () => {
    expect(hpFraction(0, 0)).toBe(0);
    expect(hpFraction(10, 0)).toBe(0);
    expect(hpFraction(10, -3)).toBe(0);
  });
  test("non-finite inputs give 0", () => {
    expect(hpFraction(Number.NaN, 55)).toBe(0);
    expect(hpFraction(10, Number.POSITIVE_INFINITY)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/hpBar.test.ts`
Expected: FAIL — `./hpBar` not found.

- [ ] **Step 3: Implement**

```ts
// src/lib/hpBar.ts
// Fill fraction for the Combate HP bar, safe for over-healed, negative or
// zero-max characters.
export function hpFraction(current: number, max: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(1, Math.max(0, current / max));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/hpBar.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: `CombatVitals.tsx`** — add `import { hpFraction } from "@/lib/hpBar";`. Change the outer card's `rounded-lg p-3` → `rounded-2xl p-4`. Replace the non-dying branch (the `<div className="relative flex items-center justify-between gap-2">…</div>`) with:

```tsx
        <div className="relative">
          <div className="flex items-end justify-between gap-3">
            <button
              type="button"
              onClick={onOpenHp}
              aria-label={`Puntos de golpe ${currentHp} de ${maxHp}`}
              className="text-left active:scale-[0.98] transition-transform duration-150"
            >
              <span className="block font-heading italic text-sm text-muted">Puntos de golpe</span>
              <span
                className={`block font-numeric font-black text-[3.5rem] leading-[0.85] tracking-tight text-foreground ${
                  rage.active ? "hp-heartbeat" : ""
                }`}
              >
                {currentHp}
                <span className="text-2xl font-semibold text-muted"> / {maxHp}</span>
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenAc}
              aria-label={`Clase de armadura ${displayAc}`}
              className="relative shrink-0 active:scale-95 transition-transform duration-150"
            >
              <span className="shield-ac w-[58px] h-[66px] flex flex-col items-center justify-center pb-2">
                <span className="font-numeric font-black text-2xl leading-none">{displayAc}</span>
                <span className="font-heading italic text-xs leading-none mt-0.5">CA</span>
              </span>
              {acModified && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-accent text-background text-xs font-numeric font-semibold flex items-center justify-center">
                  {formatModifier(tempAcMod)}
                </span>
              )}
              {showMagicMark && (
                <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-card border border-accent text-accent text-xs flex items-center justify-center">
                  ✦
                </span>
              )}
            </button>
          </div>
          <div className="hp-bar mt-3" aria-hidden="true">
            <span style={{ width: `${hpFraction(currentHp, maxHp) * 100}%` }} />
          </div>
        </div>
```

Change the rage-info block's `text-[0.7rem]` → `text-xs` and `<span className="text-accent font-semibold">{rageDamage} daño</span>` → `<span className="text-accent font-semibold"><span className="font-numeric">{rageDamage}</span> daño</span>`.

- [ ] **Step 6: `RageCluster.tsx`** — add `import { Flame } from "lucide-react";` and replace the returned JSX (keep all state/logic above it unchanged):

```tsx
  return (
    <div className="flex items-center gap-1">
      <span className="font-heading italic text-sm text-muted mr-1">Furias</span>
      {showPips ? (
        <div className="flex">
          {slots.map((available, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onToggleSlot(i);
                if (useBadge) setExpanded(false);
              }}
              className="w-8 h-8 flex items-center justify-center"
              aria-label={`Rage slot ${i + 1}: ${available ? "disponible" : "usado"}`}
            >
              <span className={`tally-mark ${available ? "" : "is-used"}`} />
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="ink-stamp !not-italic font-numeric !text-foreground !border-cord"
        >
          {remaining}/{total}
        </button>
      )}
      <button
        type="button"
        onClick={onToggleActive}
        disabled={!active && !canActivate}
        className={`relative ml-auto w-9 h-9 rounded-full flex items-center justify-center border transition-shadow duration-200 ${
          active
            ? "border-cord bg-cord text-[#f7e6d8] shadow-[0_0_10px_color-mix(in_srgb,var(--cord)_60%,transparent)]"
            : canActivate
              ? "border-cord/60 text-cord"
              : "border-border/40 text-muted opacity-40 cursor-not-allowed"
        }`}
        aria-label={active ? "Desactivar Rage" : "Activar Rage"}
      >
        <span key={`flame-${igniteKey}`} className={igniteKey > 0 ? "ignite-flash" : undefined}>
          <Flame size={18} strokeWidth={1.5} />
        </span>
        {active &&
          EMBER_WISP_OFFSETS.map((left, i) => (
            <span
              key={`wisp-${i}`}
              className="ember-wisp"
              style={{ left: `${left}%`, animationDelay: `${EMBER_WISP_DELAYS[i]}s` }}
            />
          ))}
        {igniteKey > 0 &&
          EMBER_BURST_OFFSETS.map((left, i) => (
            <span
              key={`burst-${igniteKey}-${i}`}
              className="ember-burst"
              style={{ left: `${left}%`, animationDelay: `${EMBER_BURST_DELAYS[i]}s` }}
            />
          ))}
      </button>
    </div>
  );
```

- [ ] **Step 7: Full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 8: Visual check**

390×844, four themes, Combate: big HP, bar width matches HP, red shield with CA. Tap each tally → toggles independently (used = dashed). Tap the flame → Rage on: sheen, heartbeat, embers. Open HP modal, deal damage past 0 → death-saves view appears; heal back. Set a temporary AC modifier → the badge sits on the shield's corner.

- [ ] **Step 9: Commit**

```bash
git add src/lib/hpBar.ts src/lib/hpBar.test.ts src/components/combat/CombatVitals.tsx src/components/combat/RageCluster.tsx public/sw.js
git commit -m "feat: shield AC, HP bar and tally-mark Rage in Combate vitals"
```

---

### Task 8: Combate — attack rows, quick buttons, conditions, exhaustion

**Files:**
- Modify: `src/components/combat/AttackRow.tsx`
- Modify: `src/components/tabs/CombatTab.tsx` (~226–247 quick buttons, ~256–283 conditions, ~295–314 exhaustion)

**Interfaces:**
- Consumes: `.btn-primary`, `.btn-seal`, `.ink-stamp`, `font-numeric`, `GhostChip`.

- [ ] **Step 1: `AttackRow.tsx`** — add `MoreHorizontal` to the lucide import. Make these replacements:
  - Name span: `font-heading text-sm text-accent truncate` → `font-heading text-[1.1875rem] leading-tight text-foreground truncate`.
  - Mastery span: `text-[0.6rem] px-1.5 py-0.5 bg-accent/20 text-accent rounded` → `ink-stamp`.
  - Meta line div: `text-[0.6875rem] text-muted mt-0.5` → `text-xs text-muted mt-0.5`; damage icon `size={11}` → `size={12} strokeWidth={1.5}`; wrap the numbers: `<span className="font-numeric">{formatModifier(effectiveAttackBonus)}</span> · <span className="font-numeric">{displayDamage()}</span> {attack.damageType.slice(0, 4).toLowerCase()}. · {attack.range}`.
  - Hit button className → `btn-primary min-h-9 px-3 rounded-lg font-heading text-[0.95rem] active:scale-95 transition-transform duration-150`.
  - Dmg button className → `btn-seal min-h-9 px-3 rounded-lg font-heading text-[0.95rem] active:scale-95 transition-transform duration-150`.
  - Menu toggle: replace `⋯` text with `<MoreHorizontal size={18} strokeWidth={1.5} />`, add `aria-label="Más opciones"`, className → `text-muted hover:text-foreground w-8 h-9 flex items-center justify-center`. Change the dropdown `top-6` → `top-10`, and each menu item `text-xs` → `text-sm`.
  - Expanded details `text-xs` stays; `text-accent font-heading` mastery label stays (text, no numbers except the DC — wrap `{attack.masterySaveDC}` as `<span className="font-numeric">…</span>`).

- [ ] **Step 2: Quick buttons in `CombatTab.tsx`** — add `Swords, Dices` to a lucide import (`import { Swords, Dices } from "lucide-react";`). Replace both buttons' className with `stone-card rounded-xl py-2.5 flex items-center justify-center gap-2 font-heading text-base text-foreground active:scale-[0.97] transition-transform duration-150` and their content with `<Swords size={16} strokeWidth={1.5} className="text-accent" /> Atacar` and `<Dices size={16} strokeWidth={1.5} className="text-accent" /> Roll rápido`.

- [ ] **Step 3: Conditions** — replace the unlabeled `+` button with:

```tsx
          {combat.conditions.length === 0 && (
            <span className="italic text-sm text-muted">sin condiciones</span>
          )}
          <GhostChip onClick={() => setConditionModalOpen(true)}>+ Condición</GhostChip>
```

The condition detail box: `text-xs text-foreground/80 bg-card/50 border border-border rounded-lg p-2` → `text-sm text-foreground/85 stone-card rounded-xl p-3`.

- [ ] **Step 4: Exhaustion** — replace the `CompactRow`'s `name` and the two buttons:

```tsx
      <CompactRow
        name={
          <span className="flex items-center gap-2">
            Exhaustion
            <span className="flex gap-1" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-3.5 rounded-sm rotate-[10deg] ${
                    i < combat.exhaustionLevel ? "bg-cord" : "border border-muted/60"
                  }`}
                />
              ))}
            </span>
            <span className="font-numeric text-muted text-xs">{combat.exhaustionLevel}/6</span>
          </span>
        }
        onClick={() => setExhaustionExpanded((e) => !e)}
        right={
          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label="Reducir Exhaustion"
              onClick={() => setExhaustionLevel(combat.exhaustionLevel - 1)}
              className="w-8 h-8 rounded-lg border border-border text-muted flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
            >
              −
            </button>
            <button
              type="button"
              aria-label="Aumentar Exhaustion"
              onClick={() => setExhaustionLevel(combat.exhaustionLevel + 1)}
              className="w-8 h-8 rounded-lg border border-border text-muted flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
            >
              +
            </button>
          </div>
        }
      />
```

The exhaustion detail box gets the same class change as the condition box in Step 3.

- [ ] **Step 5: Full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 6: Visual check**

390×844, four themes, Combate: attack rows with Fell names, Fraunces numbers, readable Dmg button in every theme; ⋯ menu opens below the row and all items work (Editar, Mover, Eliminar + undo toast). No conditions → "sin condiciones  + Condición"; add Prone → ink-stamp tag with X; remove → undo toast works. Exhaustion −/+ updates marks and `n/6`; Hit rolls still apply the exhaustion penalty.

- [ ] **Step 7: Commit**

```bash
git add src/components/combat/AttackRow.tsx src/components/tabs/CombatTab.tsx public/sw.js
git commit -m "feat: journal-style attack rows, conditions and exhaustion in Combate"
```

---

### Task 9: App-wide numbers and small-label audit

**Files:**
- Modify: whichever files the greps below surface (expected: `DiceResult.tsx`, `DeathSaves.tsx`, `InventoryTab.tsx`, `SettingsTab.tsx`, `LevelUpFlow.tsx`, `HpModal.tsx`, `GrantedActionCard.tsx`, notes components, `EncyclopediaTab.tsx`).

**Interfaces:** none new.

- [ ] **Step 1: List number-bearing `font-heading` elements**

Run: `grep -rn "font-heading" src/components src/app | grep -v "print/"`
For each hit, open the line and decide: if the element's content is a number, modifier, dice total, currency amount, level, count or `n/m` value → replace `font-heading` with `font-numeric` (add `font-semibold` if it was bold/prominent). If it is words (a title, a name, a label) → leave it. Known must-change: `DiceResult.tsx:46` (`= {roll.total}`) → `font-numeric font-semibold text-accent`.

- [ ] **Step 2: List tiny / all-caps labels**

Run: `grep -rnE "text-\[0\.(5|6)[0-9]*rem\]|uppercase" src/components src/app | grep -v "print/"`
For each: text that carries information → at least `text-xs`; `uppercase tracking-*` on labels/headings → remove and use `italic` (Spectral) instead, sentence-casing any hardcoded ALL-CAPS string only if it's a Spanish word label (do not change D&D abbreviations like `FUE`, `CA`, `DC`, `HP`).

- [ ] **Step 3: Icon stroke audit**

Run: `grep -rnE "<[A-Z][A-Za-z]+ [^>]*size=\{[0-9]+\}" src/components src/app | grep -v strokeWidth`
For every lucide icon element listed, add `strokeWidth={1.5}` (spec: one stroke weight everywhere).

- [ ] **Step 3b: Re-run the greps** from Steps 1–3 and confirm every remaining hit is intentional (a word-valued `font-heading`, an abbreviation, or a non-lucide element).

- [ ] **Step 4: Full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 5: Visual pass of the inherited tabs**

390×844, Piedra viva and Pergamino: Inventario, Notas, Enciclopedia, Ajustes, and a dice roll result. Fix anything **broken** (overflow, unreadable contrast, clipped text, misaligned chips). Anything merely plain: add a one-line note to the final summary; do not redesign.

- [ ] **Step 6: Commit**

```bash
git add -A src public/sw.js
git status --short   # confirm only intended files are staged (.gitignore must NOT be staged)
git commit -m "fix: lining numerals and readable labels across remaining screens"
```

If `.gitignore` shows as staged, `git restore --staged .gitignore` before committing (it's an unrelated user change).

---

### Task 10: Final verification across themes and states

**Files:** none (verification only; fix-ups go back to the owning task's files).

- [ ] **Step 1: Full chain**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass, lint 0 errors, test count = previous suites + `contrast`, `themeContrast`, `themeColor`, `CollapsibleSection`, `nameHighlight`, `abilityName`, `hpBar`.

- [ ] **Step 2: Screenshot matrix**

Dev server, 390×844×2 mobile. For each theme (set via Ajustes → Tema, or in the console: `localStorage.setItem('mavok_settings', JSON.stringify({...JSON.parse(localStorage.getItem('mavok_settings') || '{}'), theme: 'pergamino'})); location.reload()`), capture full-page screenshots of:
1. Ficha with Atributos and Habilidades open.
2. Combate, Rage inactive, no conditions.
3. Combate, Rage active (tap the flame), one condition added.
4. Combate, dying (HP modal → damage to 0) — then heal back.
5. The add-attack modal (Acciones → add) — **Review Focus 4:** its inner section shows no Roman numeral and the tab behind still reads I, II, III, IV.

Compare 1–3 in Piedra viva against mockup H1. Fix discrepancies in the owning task's files, re-run Step 1.

- [ ] **Step 3: Keyboard pass**

On desktop width, Tab through Ficha: every button shows the accent focus ring; chapter headers expose `aria-expanded`.

- [ ] **Step 4: Commit any fix-ups**

```bash
git add <fixed files> public/sw.js
git commit -m "fix: journal redesign polish from final theme review"
```

Skip if nothing changed.
