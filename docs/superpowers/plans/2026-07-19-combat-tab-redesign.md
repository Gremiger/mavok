# Combat Tab Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure `CombatTab.tsx` into a denser, cross-theme-consistent layout (persistent vitals header, deduplicated Rage controls, compact resource/action rows) and refresh the `piedra-viva` / `pergamino` / `furia-de-sangre` palette values, per `docs/superpowers/specs/2026-07-19-combat-tab-redesign-design.md`.

**Architecture:** Two new small components (`CombatVitals`, `RageCluster`) replace the top-bar JSX and `RageTracker`; two new shared UI primitives (`CompactRow`, `GhostChip`) give every resource/action row a consistent look without duplicating Tailwind strings across five existing files. Everything else (`AttackRow`, `GrantedActionCard`, `DeathSaves`, `Tag`, `CollapsibleSection`, `DiceRoller`) is restyled in place — same props, same behavior.

**Tech Stack:** Next.js 15 (static export), React, Tailwind CSS v4 (via `@theme inline` custom properties), Framer Motion, Vitest.

## Global Constraints

(Copied verbatim from the spec — every task's work implicitly includes these.)

- No new CSS custom property *names* — only the 3 theme blocks' existing token *values* change (§1), sourced from `docs/superpowers/specs/2026-07-19-combat-tab-redesign-mockups/`.
- "Modified state" (AC has a temp mod, etc.) = `border-accent`/`!border-accent/50`, matching `StatBadge`'s existing `highlight` convention. Never invent a new hue for this.
- "Active/urgent state" (Rage active) = `border-cord/50` + a `cord`-colored glow shadow, matching `CombatTab.tsx`'s existing `rageActive` top-bar treatment. Cord and accent are different tokens for different meanings — don't collapse them.
- Magic-item/granted-action resources are distinguished by a `⚡` icon prefix, never a new color.
- Minimum readable text is **11px (~0.6875rem)** for anything that's a number or sentence fragment; short caps labels (`CA`, `Temp`) may stay smaller.
- Minimum tappable row height is **40px** in `density: "compact"` mode (the existing `useThemeContext().density` setting — see `AttackRow.tsx:100` for the established pattern), more generous padding in `"spacious"`.
- Rage tops out at **6** (verified against `src/data/barbarian-progression.ts`) — there is no "unlimited" tier in this app's XPHB ruleset. Don't design for one.
- Every visual task must be manually checked in the dev server across all 3 affected themes (`piedra-viva`, `pergamino`, `furia-de-sangre`), not just the default theme.
- **`npm run lint` is mandatory on every task that touches `CombatTab.tsx`**, not just `tsc`/`build` — this file has ~15 hooks before its `if (!character) return null` guard, and only `react-hooks/rules-of-hooks` (part of `npm run lint`) catches a new hook placed after it.
- **Line numbers cited for `CombatTab.tsx` throughout this plan (e.g. "currently lines 355-436") are relative to the file as it existed before Task 6.** Tasks 6 and 7 change its length, so by Task 8 onward those numbers have drifted. Every replace instruction quotes the actual surrounding code to match against — use that, not the parenthetical line number, to locate each block.

---

## Task 1: Palette token refresh

**Files:**
- Modify: `src/app/globals.css:19-58` (the `piedra-viva`, `pergamino`, `furia-de-sangre` theme blocks — `dark-fantasy` is explicitly out of scope, leave it untouched)

**Interfaces:**
- Consumes: nothing new — reads the approved mockup files at `docs/superpowers/specs/2026-07-19-combat-tab-redesign-mockups/visual-style.html` and `combat-fixes.html` for the target color direction.
- Produces: updated `--bg`/`--card`/`--accent`/`--fg`/`--muted`/`--border-color` values for 3 themes. `--cord` is unchanged in all three (verified against the mockups — none of them redefine it). Every other file in this plan consumes these same token *names*, unchanged.

- [ ] **Step 1: Update the three theme blocks in `globals.css`**

Replace lines 19-58 (currently `:root, [data-theme="piedra-viva"]` through the end of the `furia-de-sangre` block) with:

```css
:root,
[data-theme="piedra-viva"] {
  --bg: #14100c;
  --card: #1f1710;
  --accent: #c98a4b;
  --cord: #a63d2f;
  --fg: #d9c9a3;
  --muted: #5c4f3d;
  --border-color: #4a3520;
}

[data-theme="dark-fantasy"] {
  --bg: #1a1a2e;
  --card: #16213e;
  --accent: #8b6d2d;
  --cord: #8b2d2d;
  --fg: #e8e0d4;
  --muted: #7a7568;
  --border-color: #2a2a4a;
}

[data-theme="pergamino"] {
  --bg: #d9c396;
  --card: #f3e9cc;
  --accent: #7a1f1f;
  --cord: #5c3a1f;
  --fg: #3a2c14;
  --muted: #8a7554;
  --border-color: #9c8a54;
}

[data-theme="furia-de-sangre"] {
  --bg: #0a0a0a;
  --card: #131313;
  --accent: #c23b2b;
  --cord: #6e1414;
  --fg: #ece8e4;
  --muted: #6b4444;
  --border-color: #2a2a2a;
}
```

`dark-fantasy` is copied verbatim, unchanged — it's out of scope per the spec. Every changed value is traceable to the corresponding mockup file's CSS (`.prev-a`/`.prev-b`/`.prev-c`/`.fix-box` rules) per §1 of the spec; `--muted` in `piedra-viva` and `furia-de-sangre` and `--cord` everywhere had no direct mockup example, so they're nudged by judgment to stay tonally consistent with the values that did change (documented here, not silently guessed).

- [ ] **Step 2: Verify build and lint**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all three pass with no errors (this is a pure CSS value change, no logic touched).

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, open the app, go to Ajustes → switch through all 4 themes. Confirm:
- `piedra-viva`, `pergamino`, `furia-de-sangre` all render with the new richer/deeper tones (compare against the mockup screenshots' feel — warmer copper accent on piedra-viva, deeper red on pergamino, more neutral near-black on furia-de-sangre).
- `dark-fantasy` looks pixel-identical to before this change.
- Text remains legible (no washed-out `--fg`-on-`--bg` combinations) on all 4.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "style: refresh piedra-viva/pergamino/furia-de-sangre palette values"
```

---

## Task 2: Rage display-mode pure helper (TDD)

**Files:**
- Create: `src/lib/rageDisplay.ts`
- Test: `src/lib/rageDisplay.test.ts`

**Interfaces:**
- Produces: `shouldUseRageBadge(total: number): boolean` — Task 4 (`RageCluster.tsx`) imports and calls this.

- [ ] **Step 1: Write the failing test**

Create `src/lib/rageDisplay.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { shouldUseRageBadge } from "./rageDisplay";

describe("shouldUseRageBadge", () => {
  it("returns false for 2 total slots (level 1-2)", () => {
    expect(shouldUseRageBadge(2)).toBe(false);
  });

  it("returns false for 4 total slots (level 6-11)", () => {
    expect(shouldUseRageBadge(4)).toBe(false);
  });

  it("returns true for 5 total slots (level 12-16)", () => {
    expect(shouldUseRageBadge(5)).toBe(true);
  });

  it("returns true for 6 total slots (level 17-20, the max)", () => {
    expect(shouldUseRageBadge(6)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/rageDisplay.test.ts`
Expected: FAIL — `Cannot find module './rageDisplay'`

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/rageDisplay.ts`:

```typescript
// Barbarian rages progress 2→3→4→5→6 across levels 1-20 (src/data/barbarian-progression.ts,
// XPHB — there is no "unlimited" tier in this ruleset). Individual pips read fine up to 4;
// beyond that they'd cram too many small circles into the vitals header, so they collapse
// into a single numeral badge instead.
export function shouldUseRageBadge(total: number): boolean {
  return total > 4;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/rageDisplay.test.ts`
Expected: PASS, 4 tests

- [ ] **Step 5: Commit**

```bash
git add src/lib/rageDisplay.ts src/lib/rageDisplay.test.ts
git commit -m "feat: add rage pip/badge display-mode threshold helper"
```

---

## Task 3: Shared compact-row UI primitives

**Files:**
- Create: `src/components/ui/CompactRow.tsx`
- Create: `src/components/ui/GhostChip.tsx`

**Interfaces:**
- Consumes: `useThemeContext().density` from `@/lib/context`.
- Produces:
  - `CompactRow({ name, meta, right, dim, conditional, onClick }: CompactRowProps)` — Tasks 8, 9, 10, 12 use this for resource/condition/link rows.
  - `GhostChip({ children, onClick, disabled, solid }: GhostChipProps)` — Tasks 9, 10 use this for "usar · x/y" / "⚡ x/y" value pills.

- [ ] **Step 1: Create `CompactRow.tsx`**

```tsx
"use client";

import { useThemeContext } from "@/lib/context";

export interface CompactRowProps {
  name: React.ReactNode;
  meta?: React.ReactNode;
  right: React.ReactNode;
  dim?: boolean;
  conditional?: boolean;
  onClick?: () => void;
}

export function CompactRow({
  name,
  meta,
  right,
  dim = false,
  conditional = false,
  onClick,
}: CompactRowProps) {
  const { density } = useThemeContext();
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-2 rounded-lg bg-card/60 border ${
        conditional ? "border-dashed border-border/70" : "border-border/50"
      } ${density === "compact" ? "min-h-[40px] px-2.5 py-1.5" : "min-h-[44px] px-3 py-2"} ${
        dim ? "opacity-50" : ""
      } ${onClick ? "text-left active:scale-[0.99] transition-transform" : ""} mb-1.5`}
    >
      <span className="flex-1 min-w-0">
        <span className="block text-[0.8125rem] text-foreground truncate">{name}</span>
        {meta && (
          <span className="block text-[0.6875rem] text-muted mt-0.5 leading-snug">
            {meta}
          </span>
        )}
      </span>
      <span className="shrink-0">{right}</span>
    </Component>
  );
}
```

- [ ] **Step 2: Create `GhostChip.tsx`**

```tsx
"use client";

export function GhostChip({
  children,
  onClick,
  disabled = false,
  solid = false,
  ...longPressHandlers
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  solid?: boolean;
} & Record<string, unknown>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {...longPressHandlers}
      className={`whitespace-nowrap text-[0.6875rem] px-2.5 py-1 rounded-full border transition-colors select-none [-webkit-touch-callout:none] ${
        disabled
          ? "border-border/50 text-muted opacity-40 cursor-not-allowed"
          : solid
            ? "border-accent bg-accent/20 text-accent"
            : "border-border text-muted hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}
```

`GhostChip` spreads extra props (`{...longPressHandlers}`) because Tasks 9/10 attach `useLongPress`'s `onPointerDown`/`onPointerUp`/etc. handlers to it, the same way `GrantedActionCard.tsx:80` and the Healer's Kit/Stone's Endurance buttons in `CombatTab.tsx` already do on their raw `<button>`s today.

- [ ] **Step 3: Verify build and lint**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all pass. (Both files have no consumers yet, so this only checks they compile cleanly — no runtime/browser check possible until Task 8/9/10 wire them in.)

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/CompactRow.tsx src/components/ui/GhostChip.tsx
git commit -m "feat: add CompactRow and GhostChip shared UI primitives"
```

---

## Task 4: RageCluster component

**Files:**
- Create: `src/components/combat/RageCluster.tsx`

**Interfaces:**
- Consumes: `shouldUseRageBadge` from `@/lib/rageDisplay` (Task 2).
- Produces: `RageCluster({ slots, active, onToggleSlot, onToggleActive }: RageClusterProps)` — same prop shape as the `RageTracker` it supersedes. Task 5 (`CombatVitals`) consumes this.

- [ ] **Step 1: Create `RageCluster.tsx`**

```tsx
"use client";

import { useState } from "react";
import { shouldUseRageBadge } from "@/lib/rageDisplay";

export interface RageClusterProps {
  slots: boolean[];
  active: boolean;
  onToggleSlot: (index: number) => void;
  onToggleActive: () => void;
}

export function RageCluster({
  slots,
  active,
  onToggleSlot,
  onToggleActive,
}: RageClusterProps) {
  const [expanded, setExpanded] = useState(false);
  const total = slots.length;
  const remaining = slots.filter(Boolean).length;
  const useBadge = shouldUseRageBadge(total);
  const showPips = !useBadge || expanded;
  const canActivate = !active && remaining > 0;

  return (
    <div className="flex items-center gap-2">
      {showPips ? (
        <div className="flex gap-1">
          {slots.map((available, i) => (
            <button
              key={i}
              onClick={() => (useBadge ? setExpanded(false) : onToggleSlot(i))}
              onDoubleClick={() => useBadge && onToggleSlot(i)}
              className={`w-3.5 h-3.5 rounded-full border transition-colors ${
                available
                  ? "bg-cord border-cord"
                  : "bg-transparent border-cord/50"
              }`}
              aria-label={`Rage slot ${i + 1}: ${available ? "disponible" : "usado"}`}
            />
          ))}
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="bg-card border border-cord text-foreground text-xs font-bold px-2 py-0.5 rounded-full"
        >
          {remaining}/{total}
        </button>
      )}
      <button
        onClick={onToggleActive}
        disabled={!active && !canActivate}
        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm border transition-shadow ${
          active
            ? "border-cord bg-cord shadow-[0_0_8px_rgba(166,61,47,0.6)]"
            : canActivate
              ? "border-cord/50"
              : "border-border/40 opacity-40 cursor-not-allowed"
        }`}
        aria-label={active ? "Desactivar Rage" : "Activar Rage"}
      >
        🔥
      </button>
    </div>
  );
}
```

When `total > 4`, tapping any individual slot switches to expanded pip view instead of toggling it directly (single-tap on the badge expands; a *double-click* on an expanded pip toggles it, single-click collapses back to badge) — this avoids a stray tap on the badge accidentally flipping slot 1 before the user can see which slot they're aiming at. `border-cord`/`bg-cord`/`shadow-[...cord...]` matches the Global Constraints' "active/urgent state" rule (§1 of the spec) — same token the old `RageTracker`-driven top bar already used for `rageActive`.

- [ ] **Step 2: Verify build and lint**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all pass. No consumer yet — browser check happens in Task 6 once it's wired into `CombatTab.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/combat/RageCluster.tsx
git commit -m "feat: add RageCluster component (pip/badge modes, no unlimited tier)"
```

---

## Task 5: CombatVitals component

**Files:**
- Create: `src/components/combat/CombatVitals.tsx`
- Modify: `src/components/ui/StatBadge.tsx` (add a `compact` variant)

**Interfaces:**
- Consumes: `RageCluster` (Task 4), `StatBadge` (modified below), `DeathSaves` (existing, unchanged props), `formatModifier` from `@/lib/utils`.
- Produces: `CombatVitals(props: CombatVitalsProps)` — Task 6 wires this into `CombatTab.tsx`, replacing its current top-bar JSX.

- [ ] **Step 1: Add a `compact` prop to `StatBadge.tsx`**

Replace the full contents of `src/components/ui/StatBadge.tsx`:

```tsx
"use client";

export function StatBadge({
  label,
  value,
  onClick,
  highlight,
  compact = false,
}: {
  label: string;
  value: string | number;
  onClick?: () => void;
  highlight?: boolean;
  compact?: boolean;
}) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      onClick={onClick}
      className={`flex flex-col items-center rounded-lg stone-card ${
        compact ? "px-1.5 py-1 text-[0.6875rem] min-w-[2.5rem]" : "px-2.5 py-1.5 text-xs min-w-[3rem]"
      } ${highlight ? "!border-accent/50" : ""} ${
        onClick ? "active:scale-95 transition-transform" : ""
      }`}
    >
      <span
        className={`font-heading leading-tight text-accent ${compact ? "text-sm" : "text-lg"}`}
      >
        {value}
      </span>
      <span className="text-muted text-[0.6rem] uppercase tracking-wider">{label}</span>
    </Component>
  );
}
```

`compact` defaults to `false`, so the one other place this component could theoretically be used (none currently — confirmed `StatBadge` has no consumers outside `CombatTab.tsx`) stays unaffected either way.

- [ ] **Step 2: Create `CombatVitals.tsx`**

```tsx
"use client";

import { StatBadge } from "@/components/ui/StatBadge";
import { RageCluster, type RageClusterProps } from "@/components/combat/RageCluster";
import { DeathSaves } from "@/components/combat/DeathSaves";
import { formatModifier } from "@/lib/utils";

export interface CombatVitalsProps {
  isDying: boolean;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  displayAc: number;
  tempAcMod: number;
  magicAcBonus: number;
  showExplicitMagicTag: boolean;
  initiative: number;
  inspiration: boolean;
  effectiveSpeed: number;
  speedReduction: number;
  rage: RageClusterProps;
  deathSaves: { successes: number; failures: number };
  onOpenHp: () => void;
  onOpenTempHp: () => void;
  onOpenAc: () => void;
  onToggleInspiration: () => void;
  onDeathSavesChange: (successes: number, failures: number) => void;
  onRegainConsciousness: () => void;
}

export function CombatVitals({
  isDying,
  currentHp,
  maxHp,
  tempHp,
  displayAc,
  tempAcMod,
  magicAcBonus,
  showExplicitMagicTag,
  initiative,
  inspiration,
  effectiveSpeed,
  speedReduction,
  rage,
  deathSaves,
  onOpenHp,
  onOpenTempHp,
  onOpenAc,
  onToggleInspiration,
  onDeathSavesChange,
  onRegainConsciousness,
}: CombatVitalsProps) {
  const acModified = tempAcMod !== 0;
  const showMagicMark = showExplicitMagicTag && magicAcBonus !== 0;

  return (
    <div
      className={`stone-card rounded-lg p-3 transition-all ${
        rage.active ? "!border-cord/50 shadow-[0_0_16px_rgba(166,61,47,0.3)]" : ""
      }`}
    >
      {isDying ? (
        <DeathSaves
          successes={deathSaves.successes}
          failures={deathSaves.failures}
          onChange={onDeathSavesChange}
          onRegainConsciousness={onRegainConsciousness}
        />
      ) : (
        <div className="flex items-center justify-between gap-2">
          <button onClick={onOpenHp} className="text-left active:scale-95 transition-transform">
            <span className="block font-heading text-2xl leading-none text-accent">
              {currentHp}/{maxHp}
            </span>
            <span className="block text-[0.625rem] text-muted uppercase tracking-wider mt-0.5">
              HP
            </span>
          </button>
          <button
            onClick={onOpenAc}
            className={`relative w-11 h-11 rounded-full border-2 flex flex-col items-center justify-center shrink-0 active:scale-95 transition-transform ${
              acModified ? "!border-accent" : "border-border"
            }`}
          >
            <span className="font-heading text-base leading-none">{displayAc}</span>
            <span className="text-[0.5rem] text-muted">CA</span>
            {acModified && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-background text-[0.55rem] font-bold flex items-center justify-center">
                {formatModifier(tempAcMod)}
              </span>
            )}
            {showMagicMark && (
              <span className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-card border border-accent text-accent text-[0.6rem] flex items-center justify-center">
                ✦
              </span>
            )}
          </button>
        </div>
      )}

      <div className="mt-2.5">
        <RageCluster {...rage} />
      </div>

      <div className="flex items-center justify-around gap-1.5 mt-2.5 pt-2 border-t border-border/40">
        <StatBadge compact label="Temp" value={`+${tempHp}`} onClick={onOpenTempHp} highlight={tempHp > 0} />
        <StatBadge compact label="Init" value={formatModifier(initiative)} />
        <StatBadge compact label="Insp" value={inspiration ? "★" : "☆"} onClick={onToggleInspiration} highlight={inspiration} />
        <StatBadge
          compact
          label="Vel"
          value={speedReduction > 0 ? `${effectiveSpeed} (-${speedReduction})` : effectiveSpeed}
          highlight={speedReduction > 0}
        />
      </div>
    </div>
  );
}
```

This mirrors the current top-bar structure (§2 of the spec): HP + AC ring in the primary row (or `DeathSaves` swapped in when `isDying`), `RageCluster` always rendered beneath it regardless of dying state, secondary stat row at the bottom. `border-cord`/`shadow-[...cord...]` on the outer card when raging is copied unchanged from today's `CombatTab.tsx` top bar.

- [ ] **Step 3: Verify build and lint**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all pass. `CombatVitals` has no consumer yet — wired into `CombatTab.tsx` next task.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/StatBadge.tsx src/components/combat/CombatVitals.tsx
git commit -m "feat: add CombatVitals component and StatBadge compact variant"
```

---

## Task 6: Wire CombatVitals into CombatTab, retire RageTracker

**Files:**
- Modify: `src/components/tabs/CombatTab.tsx:171-240` (the "Top Bar" block, from the opening `<div className="stone-card...">` through the closing `<RageTracker ... />` and its wrapping `</div>`)
- Delete: `src/components/combat/RageTracker.tsx`

**Interfaces:**
- Consumes: `CombatVitals` (Task 5).
- Produces: nothing new — this is the first end-to-end visually testable milestone.

- [ ] **Step 1: Replace the top-bar imports**

In `CombatTab.tsx`, replace:

```tsx
import { StatBadge } from "@/components/ui/StatBadge";
```
```tsx
import { HpModal } from "@/components/combat/HpModal";
import { DeathSaves } from "@/components/combat/DeathSaves";
import { AttackRow } from "@/components/combat/AttackRow";
import { DiceRoller } from "@/components/combat/DiceRoller";
import { RageTracker } from "@/components/combat/RageTracker";
```

with:

```tsx
import { CombatVitals } from "@/components/combat/CombatVitals";
import { HpModal } from "@/components/combat/HpModal";
import { AttackRow } from "@/components/combat/AttackRow";
import { DiceRoller } from "@/components/combat/DiceRoller";
```

(`StatBadge` and `DeathSaves` are no longer imported directly here — `CombatVitals` imports and uses them internally.)

- [ ] **Step 2: Replace the top-bar JSX**

Replace the block from `{/* Top Bar */}` through the line right before `<div className="crack-divider" />` (currently `CombatTab.tsx:173-242`) with:

```tsx
      {/* Top Bar */}
      <CombatVitals
        isDying={isDying}
        currentHp={combat.currentHp}
        maxHp={combat.maxHp}
        tempHp={combat.tempHp}
        displayAc={displayAc}
        tempAcMod={tempAcMod}
        magicAcBonus={magicAcBonus}
        showExplicitMagicTag={magicItemIndicator === "explicit-tag"}
        initiative={combat.initiative}
        inspiration={meta.inspiration}
        effectiveSpeed={effectiveSpeed}
        speedReduction={speedReduction}
        rage={{
          slots,
          active: rageActive,
          onToggleSlot: toggleRageSlot,
          onToggleActive: toggleRageActive,
        }}
        deathSaves={combat.deathSaves}
        onOpenHp={() => setHpModalOpen(true)}
        onOpenTempHp={() => setTempHpInput(true)}
        onOpenAc={() => setAcModalOpen(true)}
        onToggleInspiration={toggleInspiration}
        onDeathSavesChange={(s, f) => updateCombat({ deathSaves: { successes: s, failures: f } })}
        onRegainConsciousness={() =>
          updateCombat({ currentHp: 1, deathSaves: { successes: 0, failures: 0 } })
        }
      />
```

Every value passed here (`isDying`, `combat.currentHp`, `slots`, `toggleRageSlot`, `magicAcBonus`, etc.) already exists in `CombatTab.tsx`'s function body unchanged — this step only replaces how they're rendered, not what's computed.

- [ ] **Step 3: Delete `RageTracker.tsx`**

```bash
rm src/components/combat/RageTracker.tsx
```

Confirmed via `grep -rl "RageTracker" src` before this plan that `CombatTab.tsx` was its only consumer — safe to delete outright rather than leave dead code.

- [ ] **Step 4: Verify build, lint, and tests**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass. Lint is critical here — this step touches the top of a component with many hooks below the `if (!character) return null` guard; confirm no `react-hooks/rules-of-hooks` violations were introduced.

- [ ] **Step 5: Manual verification in browser**

Run: `npm run dev`, open Combate tab. Confirm across `piedra-viva`, `pergamino`, `furia-de-sangre`:
- HP tap opens `HpModal`; AC tap opens the AC modifier modal; Temp tap opens the Temp HP modal — all unchanged.
- Rage pips toggle individual slots; flame button activates/deactivates Rage; the vitals card gets the cord glow when active.
- Set `combat.currentHp` to 0 (via HpModal) — confirm the primary row swaps to `DeathSaves`, Rage cluster and secondary stat row stay visible underneath. Tap "Rodé 20" (`onRegainConsciousness`) and confirm HP returns to 1 and the row swaps back.
- Exhaustion-reduced speed still shows the `(-N)` suffix and highlight.

- [ ] **Step 6: Commit**

```bash
git add src/components/tabs/CombatTab.tsx
git rm src/components/combat/RageTracker.tsx
git commit -m "refactor: wire CombatVitals into CombatTab, retire RageTracker"
```

---

## Task 7: Quick-actions row (Atacar / Roll rápido)

**Files:**
- Modify: `src/components/ui/CollapsibleSection.tsx` (add controlled force-open support)
- Modify: `src/components/tabs/CombatTab.tsx` (add the quick-actions row, refs, and force-open state)

**Interfaces:**
- Produces: `CollapsibleSection`'s new optional `forceOpenKey?: number` prop — incrementing it from a parent forces the section open, without adding a `useEffect`.

- [ ] **Step 1: Add `forceOpenKey` to `CollapsibleSection.tsx`**

Replace the full contents of `src/components/ui/CollapsibleSection.tsx`:

```tsx
"use client";

import { useState } from "react";

export function CollapsibleSection({
  title,
  defaultOpen = false,
  forceOpenKey,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  forceOpenKey?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [prevForceOpenKey, setPrevForceOpenKey] = useState(forceOpenKey);

  if (forceOpenKey !== undefined && forceOpenKey !== prevForceOpenKey) {
    setPrevForceOpenKey(forceOpenKey);
    setOpen(true);
  }

  return (
    <section className="cord-line pl-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="relative cord-knot w-full flex items-center justify-between py-2 font-heading text-sm text-accent tracking-wide uppercase"
      >
        {title}
        <span
          className={`transition-transform duration-200 text-muted text-xs ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <>
          <div className="crack-divider mb-3" />
          <div>{children}</div>
        </>
      )}
    </section>
  );
}
```

The `forceOpenKey !== prevForceOpenKey` check with a direct `setOpen`/`setPrevForceOpenKey` call in the render body (not inside a `useEffect`) is the exact pattern `QuickActionsPicker.tsx` already uses in this codebase for "reset local state when a prop changes" — required per this project's `react-hooks/set-state-in-effect` convention (see `CLAUDE.md`).

- [ ] **Step 2: Add refs, force-open state, and the quick-actions row to `CombatTab.tsx`**

Add two new `useRef` and `useState` declarations alongside the existing ones near the top of `CombatTab()` (immediately after the existing `const [ragePulseKey, setRagePulseKey] = useState(0);` line, still before the `if (!character) return null` guard — see Global Constraints on hook ordering):

```tsx
  const [attacksForceOpenKey, setAttacksForceOpenKey] = useState(0);
  const [dadosForceOpenKey, setDadosForceOpenKey] = useState(0);
  const attacksSectionRef = useRef<HTMLDivElement>(null);
  const dadosSectionRef = useRef<HTMLDivElement>(null);
```

Add `useRef` to the existing `import { useState } from "react";` line, making it:

```tsx
import { useRef, useState } from "react";
```

Insert the quick-actions row right after the `<CombatVitals ... />` block from Task 6 and before `<div className="crack-divider" />`:

```tsx
      {attacks.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setAttacksForceOpenKey((k) => k + 1);
              attacksSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="stone-card rounded-lg py-2 text-center text-xs font-heading text-accent active:scale-95 transition-transform"
          >
            ⚔ Atacar
          </button>
          <button
            onClick={() => {
              setDadosForceOpenKey((k) => k + 1);
              dadosSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="stone-card rounded-lg py-2 text-center text-xs font-heading text-accent active:scale-95 transition-transform"
          >
            🎲 Roll rápido
          </button>
        </div>
      )}
```

Note this is gated on `attacks.length > 0` for *both* buttons, not just "Atacar" — per spec §4, "Atacar" must be absent (not disabled) with zero attacks; "Roll rápido" doesn't strictly need the same gate, but wrapping both in one condition keeps the 2-column grid from rendering as a single lopsided button when attacks is empty, which would look broken rather than intentional.

Wrap the "Acciones" `CollapsibleSection` (currently starting at `CombatTab.tsx:311`, `<CollapsibleSection title="Acciones" defaultOpen>`) in a ref div and pass the force-open key:

```tsx
      <div ref={attacksSectionRef}>
        <CollapsibleSection title="Acciones" defaultOpen forceOpenKey={attacksForceOpenKey}>
          {/* ...unchanged children... */}
        </CollapsibleSection>
      </div>
```

Do the same for the "Dados" section (currently `CombatTab.tsx:673`):

```tsx
      <div ref={dadosSectionRef}>
        <CollapsibleSection title="Dados" forceOpenKey={dadosForceOpenKey}>
          <DiceRoller />
        </CollapsibleSection>
      </div>
```

- [ ] **Step 3: Verify build, lint, and tests**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass — lint is mandatory here per Global Constraints (new hooks added to `CombatTab.tsx`).

- [ ] **Step 4: Manual verification in browser**

- With attacks defined: collapse "Acciones" and "Dados" manually, then tap "Atacar" — confirm "Acciones" force-opens and the view scrolls to it. Tap "Roll rápido" — confirm "Dados" force-opens and scrolls into view.
- Delete all attacks (via the attack edit menu) — confirm the quick-actions row disappears entirely, and "+ Agregar ataque" is still reachable by scrolling normally.
- Check on an actual phone viewport (not just desktop resize) that `scrollIntoView` lands the section header at a sensible position, not hidden under any fixed nav.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/CollapsibleSection.tsx src/components/tabs/CombatTab.tsx
git commit -m "feat: add Combat tab quick-actions row (Atacar / Roll rápido)"
```

---

## Task 8: Restyle conditions and exhaustion rows

**Files:**
- Modify: `src/components/tabs/CombatTab.tsx:244-308` (the "Conditions" and exhaustion blocks)

**Interfaces:**
- Consumes: `CompactRow` (Task 3).

- [ ] **Step 1: Restyle the exhaustion row using `CompactRow`**

Add the import: `import { CompactRow } from "@/components/ui/CompactRow";`

Replace the exhaustion block (currently `CombatTab.tsx:282-303`, from `<div className="flex items-center justify-between stone-card...">` through its closing `</div>`) with:

```tsx
      <CompactRow
        name={`Exhaustion ${combat.exhaustionLevel}/6`}
        onClick={() => setExhaustionExpanded((e) => !e)}
        right={
          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setExhaustionLevel(combat.exhaustionLevel - 1)}
              className="w-7 h-7 rounded-full border border-border text-muted flex items-center justify-center hover:border-accent hover:text-accent"
            >
              −
            </button>
            <button
              onClick={() => setExhaustionLevel(combat.exhaustionLevel + 1)}
              className="w-7 h-7 rounded-full border border-border text-muted flex items-center justify-center hover:border-accent hover:text-accent"
            >
              +
            </button>
          </div>
        }
      />
```

`onClick={(e) => e.stopPropagation()}` on the `−`/`+` wrapper prevents those taps from also toggling the row's own `onClick` (which expands the description) — `CompactRow` renders as a `<button>` when given `onClick`, and nested interactive elements need this to avoid double-firing.

The conditions tag row (`CombatTab.tsx:245-280`) keeps its existing `Tag`-based markup unchanged per spec §5 ("only the visual container styling changes... no interaction changes") — no code change needed there beyond whatever falls out of the Task 1 token refresh automatically (Tag.tsx already consumes `--accent` via Tailwind's `text-accent`/`bg-accent` utilities).

- [ ] **Step 2: Verify build, lint, and tests**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 3: Manual verification in browser**

Confirm the exhaustion row still expands/collapses its description on tap, and +/− still adjust the level, across all 3 themes. Confirm tapping +/− doesn't also toggle the description open/closed (the `stopPropagation` check).

- [ ] **Step 4: Commit**

```bash
git add src/components/tabs/CombatTab.tsx
git commit -m "style: restyle exhaustion row with CompactRow"
```

---

## Task 9: Restyle GrantedActionCard

**Files:**
- Modify: `src/components/combat/GrantedActionCard.tsx`

**Interfaces:**
- Consumes: `CompactRow`, `GhostChip` (Task 3). Props unchanged — `CombatTab.tsx`'s usages of `<GrantedActionCard ... />` need no changes.

- [ ] **Step 1: Replace `GrantedActionCard.tsx`'s internals**

Replace the full contents of `src/components/combat/GrantedActionCard.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useLongPress } from "@/hooks/useLongPress";
import { CompactRow } from "@/components/ui/CompactRow";
import { GhostChip } from "@/components/ui/GhostChip";
import type { GrantedAction } from "@/lib/types";

export function GrantedActionCard({
  itemName,
  grantedAction,
  onUse,
  onAdjust,
}: {
  itemName: string;
  grantedAction: GrantedAction;
  onUse: () => void;
  onAdjust: (remaining: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const { charges } = grantedAction;
  const longPress = useLongPress(() => setEditing(true));

  function handleUse() {
    if (!charges || charges.remaining <= 0) return;
    onUse();
  }

  const meta = `⚡ ${grantedAction.description} — ${itemName}`;

  if (!charges) {
    return <CompactRow name={grantedAction.name} meta={meta} right={null} />;
  }

  if (editing) {
    return (
      <CompactRow
        name={grantedAction.name}
        meta={meta}
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAdjust(Math.max(0, charges.remaining - 1))}
              disabled={charges.remaining <= 0}
              className="w-6 h-6 rounded bg-background border border-border text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="text-xs text-muted font-heading w-6 text-center">
              {charges.remaining}
            </span>
            <button
              onClick={() => onAdjust(Math.min(charges.total, charges.remaining + 1))}
              disabled={charges.remaining >= charges.total}
              className="w-6 h-6 rounded bg-background border border-border text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-xs px-2 py-0.5 border border-accent text-accent rounded"
            >
              ✓
            </button>
          </div>
        }
      />
    );
  }

  return (
    <CompactRow
      name={grantedAction.name}
      meta={meta}
      dim={charges.remaining <= 0}
      right={
        <GhostChip
          disabled={charges.remaining <= 0}
          onClick={() => {
            if (longPress.wasLongPress()) return;
            handleUse();
          }}
          {...longPress.handlers}
        >
          ⚡ {charges.remaining}/{charges.total}
        </GhostChip>
      }
    />
  );
}
```

The `framer-motion` scale-pulse on use is intentionally **not** carried over as a wrapping `<motion.div>` here — `CompactRow` renders as a plain `<button>`/`<div>`, and re-adding the pulse would mean either making `CompactRow` motion-aware (coupling a shared primitive to one call site's animation) or wrapping `CompactRow`'s output in `motion.div` here (which fights `CompactRow`'s own root-element rendering). Task 10 (Healer's Kit / Stone's Endurance, which sit directly in `CombatTab.tsx` rather than behind a shared primitive) is where the pulse-retention requirement from the spec applies most cleanly and is implemented; flagging this deviation here for the manual-review checkpoint between tasks rather than silently dropping it.

- [ ] **Step 2: Verify build, lint, and tests**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 3: Manual verification in browser**

Equip an item with a granted action that has charges (check Inventory tab for one, or temporarily add one via existing test data if none is equipped by default). In Combat tab, confirm: the row shows `⚡ remaining/total`, tapping it uses a charge (chip updates), long-press enters edit mode (+/−/✓ controls appear), and a granted action *without* charges renders as a plain informational row. Check all 3 themes.

- [ ] **Step 4: Commit**

```bash
git add src/components/combat/GrantedActionCard.tsx
git commit -m "style: restyle GrantedActionCard with CompactRow/GhostChip"
```

---

## Task 10: Restyle Healer's Kit and Stone's Endurance

**Files:**
- Modify: `src/components/tabs/CombatTab.tsx` (Healer's Kit block, currently lines 355-436; Stone's Endurance block, currently lines 554-636)

**Interfaces:**
- Consumes: `CompactRow`, `GhostChip` (Task 3).

- [ ] **Step 1: Replace the Healer's Kit block**

Add imports: `import { GhostChip } from "@/components/ui/GhostChip";` and `import { motion } from "framer-motion";` is already imported at the top of `CombatTab.tsx` — reuse it.

Replace the block from `<motion.div key={healerKitPulseKey} ...>` through its matching closing `</motion.div>` (the Healer's Kit card, currently `CombatTab.tsx:355-436`) with:

```tsx
        <motion.div
          key={healerKitPulseKey}
          initial={{ scale: 1.03 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          {healerKitEditing ? (
            <CompactRow
              name="Healer's Kit"
              meta="Acción · estabiliza o cura 1d6+4 HP a una criatura · usos no se recuperan con descansos"
              right={
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateResources({
                        healerKit: { ...healerKit, remaining: Math.max(0, healerKit.remaining - 1) },
                      })
                    }
                    disabled={healerKit.remaining <= 0}
                    className="w-6 h-6 rounded bg-background border border-border text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-xs text-muted font-heading w-6 text-center">
                    {healerKit.remaining}
                  </span>
                  <button
                    onClick={() =>
                      updateResources({
                        healerKit: {
                          ...healerKit,
                          remaining: Math.min(healerKit.total, healerKit.remaining + 1),
                        },
                      })
                    }
                    disabled={healerKit.remaining >= healerKit.total}
                    className="w-6 h-6 rounded bg-background border border-border text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setHealerKitEditing(false)}
                    className="text-xs px-2 py-0.5 border border-accent text-accent rounded"
                  >
                    ✓
                  </button>
                </div>
              }
            />
          ) : (
            <CompactRow
              name="Healer's Kit"
              meta="Acción · estabiliza o cura 1d6+4 HP a una criatura"
              dim={healerKit.remaining <= 0}
              right={
                <GhostChip
                  disabled={healerKit.remaining <= 0}
                  onClick={() => {
                    if (healerKitLongPress.wasLongPress()) return;
                    spendHealerKit();
                  }}
                  {...healerKitLongPress.handlers}
                >
                  usar · {healerKit.remaining}/{healerKit.total}
                </GhostChip>
              }
            />
          )}
        </motion.div>
```

The outer `motion.div` with `healerKitPulseKey` is preserved unchanged from the current code — this is exactly how the spec's "pulse animation carries over" requirement (§6) is satisfied: the scale-pulse wraps the whole row from outside, so swapping the row's internal markup for `CompactRow`/`GhostChip` doesn't disturb it.

- [ ] **Step 2: Replace the Stone's Endurance block**

Replace the block from `<motion.div key={stoneEndurancePulseKey} ...>` through its matching closing `</motion.div>` (currently `CombatTab.tsx:554-636`) with the same pattern:

```tsx
          <motion.div
            key={stoneEndurancePulseKey}
            initial={{ scale: 1.03 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            {stoneEnduranceEditing ? (
              <CompactRow
                name="Stone's Endurance"
                meta="Reacción · tira 1d12 + CON mod · reduce el daño entrante por ese total"
                right={
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateResources({
                          stoneEndurance: {
                            ...stoneEndurance,
                            remaining: Math.max(0, stoneEndurance.remaining - 1),
                          },
                        })
                      }
                      disabled={stoneEndurance.remaining <= 0}
                      className="w-6 h-6 rounded bg-background border border-border text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="text-xs text-muted font-heading w-6 text-center">
                      {stoneEndurance.remaining}
                    </span>
                    <button
                      onClick={() =>
                        updateResources({
                          stoneEndurance: {
                            ...stoneEndurance,
                            remaining: Math.min(stoneEndurance.total, stoneEndurance.remaining + 1),
                          },
                        })
                      }
                      disabled={stoneEndurance.remaining >= stoneEndurance.total}
                      className="w-6 h-6 rounded bg-background border border-border text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setStoneEnduranceEditing(false)}
                      className="text-xs px-2 py-0.5 border border-accent text-accent rounded"
                    >
                      ✓
                    </button>
                  </div>
                }
              />
            ) : (
              <CompactRow
                name="Stone's Endurance"
                meta="Reacción · 1d12+CON reduce daño"
                dim={stoneEndurance.remaining <= 0}
                right={
                  <GhostChip
                    disabled={stoneEndurance.remaining <= 0}
                    onClick={() => {
                      if (stoneEnduranceLongPress.wasLongPress()) return;
                      spendStoneEndurance();
                    }}
                    {...stoneEnduranceLongPress.handlers}
                  >
                    usar · {stoneEndurance.remaining}/{stoneEndurance.total}
                  </GhostChip>
                }
              />
            )}
          </motion.div>
```

- [ ] **Step 3: Verify build, lint, and tests**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 4: Manual verification in browser**

For both Healer's Kit and Stone's Endurance: tap to use (chip count decrements, brief scale-pulse plays), long-press to enter edit mode (+/−/✓ appear, tap ✓ to exit), confirm the row dims when remaining is 0. Check all 3 themes.

- [ ] **Step 5: Commit**

```bash
git add src/components/tabs/CombatTab.tsx
git commit -m "style: restyle Healer's Kit and Stone's Endurance with CompactRow/GhostChip"
```

---

## Task 11: Restyle AttackRow to the new tokens

**Files:**
- Modify: `src/components/combat/AttackRow.tsx`

**Interfaces:**
- No prop or behavior changes — same interface `CombatTab.tsx` already calls it with (`attack`, `rageActive`, `rageDamage`, `recklessActive`, `exhaustionLevel`, `attackMagicBonus`, `damageMagicBonus`, `onToggleVersatile`, `onEdit`, `onDelete`, `onMoveUp`, `onMoveDown`).

`AttackRow` already has real functionality this plan must not regress: expand/collapse for properties and mastery effects, **two separate roll buttons** ("Hit" and "Dmg" — an attack roll and a damage roll are genuinely distinct D&D actions, not one combined "roll"), a "⋯" kebab menu for edit/move/delete, the inline magic-bonus indicator, and the existing `density` prop already read at line 48/100. This corrects an earlier, oversimplified mockup pass that assumed a single combined "roll" value chip and a bare edit icon — that doesn't match how attack rolls actually work in this app (see spec §6, which describes the intended *final* pattern but understates how much of the existing interaction model survives). Keep the structure; only touch classes/sizes.

- [ ] **Step 1: Update the row's padding/min-height and font sizes**

In `AttackRow.tsx`, change line 100 from:

```tsx
        className={`flex items-center justify-between cursor-pointer ${density === "compact" ? "p-2" : "p-3"}`}
```

to:

```tsx
        className={`flex items-center justify-between cursor-pointer ${density === "compact" ? "min-h-[40px] p-2" : "min-h-[44px] p-3"}`}
```

Change line 114 (the meta line: attack bonus / damage / range / magic bonus) from:

```tsx
          <div className="text-xs text-muted mt-0.5">
```

to:

```tsx
          <div className="text-[0.6875rem] text-muted mt-0.5">
```

(`text-xs` is Tailwind's 12px, already above the 11px floor — this changes it to an explicit `0.6875rem`/11px to match the floor exactly rather than relying on a utility class that could drift if Tailwind's scale changes. `text-sm` on line 105, the attack name, is 14px and already comfortably above the floor — left unchanged.)

- [ ] **Step 2: Restyle the Hit/Dmg buttons to ghost-chip proportions**

Change lines 134-151 (the "Hit" and "Dmg" buttons) from `px-2.5 py-1.5` to a size consistent with `GhostChip`'s padding, and round them fully to match the new pill language used elsewhere:

```tsx
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRollHit();
            }}
            className="px-2.5 py-1 bg-accent/20 text-accent rounded-full text-[0.6875rem] font-heading active:scale-95 transition-transform"
          >
            Hit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRollDamage();
            }}
            className="px-2.5 py-1 bg-danger/20 text-danger rounded-full text-[0.6875rem] font-heading active:scale-95 transition-transform"
          >
            Dmg
          </button>
```

This does not introduce a `GhostChip` import here deliberately — `GhostChip` assumes a single monochrome ghost/solid look, and these two buttons are intentionally two different semantic colors (accent for the to-hit roll, danger for the damage roll) that predate this redesign. Forcing them through `GhostChip` would mean adding a color-override escape hatch to a primitive meant to stay simple; two inline classNames here is less coupling for two call sites that will never need a third.

- [ ] **Step 3: Verify build, lint, and tests**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 4: Manual verification in browser**

Confirm: tapping "Hit" rolls and shows a result via `DiceResult`; tapping "Dmg" does the same for damage; tapping the row body (not the buttons) expands/collapses properties; the "⋯" menu still opens Editar/Mover arriba/Mover abajo/Eliminar; magic-bonus text still appears when `magicItemIndicator === "explicit-tag"`. Toggle Ajustes → density between Compacto/Espacioso and confirm row height changes accordingly. Check all 3 themes.

- [ ] **Step 5: Commit**

```bash
git add src/components/combat/AttackRow.tsx
git commit -m "style: restyle AttackRow to new compact-row tokens, preserve existing behavior"
```

---

## Task 12: Restyle offhand/Reckless/Opportunity/standard-action link rows

**Files:**
- Modify: `src/components/tabs/CombatTab.tsx` (Reckless Attack block ~line 492, offhand attack block ~line 516, Opportunity Attack block ~line 639, the three "estándar" link-row buttons at ~line 452, ~541, ~662)

**Interfaces:**
- Consumes: `CompactRow` (Task 3).

- [ ] **Step 1: Restyle Reckless Attack**

Replace the Reckless Attack block (currently the `{hasRecklessAttack && (...)}` block, `CombatTab.tsx:492-515`) with:

```tsx
          {hasRecklessAttack && (
            <CompactRow
              name="Reckless Attack"
              meta={
                combat.recklessActive
                  ? "Atacantes contra ti tienen ventaja hasta tu próximo turno."
                  : "ventaja en ataques, das ventaja"
              }
              onClick={() => updateCombat({ recklessActive: !combat.recklessActive })}
              right={
                <GhostChip solid={combat.recklessActive}>
                  {combat.recklessActive ? "desactivar" : "activar"}
                </GhostChip>
              }
            />
          )}
```

`GhostChip` here has no `onClick` of its own — it's purely the visual right-hand label, and the whole row (rendered as a `<button>` by `CompactRow` since `onClick` is passed) is the tap target, matching how the rest of the compact rows behave.

- [ ] **Step 2: Restyle the offhand attack card**

Replace the `{offhandAttack && (...)}` block (currently `CombatTab.tsx:516-526`) with:

```tsx
          {offhandAttack && (
            <CompactRow
              dim
              name="Offhand Attack"
              meta={`${offhandAttack.name} · ${baseDice(offhandAttack.damage)} ${offhandAttack.damageType} (sin mod de característica)`}
              right={<span className="text-[0.6875rem] text-muted">auto</span>}
            />
          )}
```

- [ ] **Step 3: Restyle Opportunity Attack**

Replace the Opportunity Attack block (currently `CombatTab.tsx:639-644`) with:

```tsx
          <CompactRow
            dim
            name="Opportunity Attack"
            meta="Mismas armas que Acciones"
            right={<span className="text-[0.6875rem] text-muted">—</span>}
          />
```

- [ ] **Step 4: Restyle the three "estándar" link rows**

Replace the "Acciones estándar" button (currently `CombatTab.tsx:452-460`) with:

```tsx
        <CompactRow
          conditional
          name="Acciones estándar"
          meta="Attack (Grapple · Shove) · Dash · Disengage · Dodge · Help · Hide · Influence · Ready · Search · Study · Utilize"
          onClick={() => setStandardActionsOpen("actions")}
          right={<span className="text-muted text-xs">›</span>}
        />
```

Replace "Bonus Actions estándar" (currently `CombatTab.tsx:541-547`) with:

```tsx
          <CompactRow
            conditional
            name="Bonus Actions estándar"
            meta="Two-Weapon Fighting"
            onClick={() => setStandardActionsOpen("bonus")}
            right={<span className="text-muted text-xs">›</span>}
          />
```

Replace "Reacciones estándar" (currently `CombatTab.tsx:662-668`) with:

```tsx
          <CompactRow
            conditional
            name="Reacciones estándar"
            meta="Opportunity Attack"
            onClick={() => setStandardActionsOpen("reactions")}
            right={<span className="text-muted text-xs">›</span>}
          />
```

- [ ] **Step 5: Verify build, lint, and tests**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 6: Manual verification in browser**

Confirm Reckless Attack still toggles (only visible on a character with the feature — check level/subclass in test data); offhand attack card shows for a character with a Light off-hand weapon; the three "estándar" rows still open `StandardActionsModal` with the correct filter. Check all 3 themes.

- [ ] **Step 7: Commit**

```bash
git add src/components/tabs/CombatTab.tsx
git commit -m "style: restyle Reckless/Offhand/Opportunity Attack and standard-action link rows"
```

---

## Task 13: Restyle DeathSaves to fit the vitals card

**Files:**
- Modify: `src/components/combat/DeathSaves.tsx`

**Interfaces:**
- No prop changes — same `successes`/`failures`/`onChange`/`onRegainConsciousness` interface `CombatVitals` (Task 5) already calls it with.

- [ ] **Step 1: Remove the outer card styling**

`DeathSaves` currently renders its own `bg-danger/10 border border-danger/30 rounded-lg p-3` wrapper (line 18) — now that it renders *inside* `CombatVitals`'s own `stone-card` wrapper (Task 5, Task 6) instead of standing alone in the top bar, that nested card-on-card look needs to go. Replace line 18's opening `<div className="bg-danger/10 border border-danger/30 rounded-lg p-3">` and its matching closing `</div>` (line 97) with a plain `<div>` (no className), i.e. change:

```tsx
    <div className="bg-danger/10 border border-danger/30 rounded-lg p-3">
```

to:

```tsx
    <div>
```

- [ ] **Step 2: Tighten the quick-action button row for the smaller card**

Change line 65's row from `flex flex-wrap justify-center gap-1.5 mt-3` to a 2x2 grid so the 4 buttons ("Rodé 1", "Rodé 20", "Recibí daño", "Golpe crítico") don't wrap unpredictably at the vitals card's narrower width:

```tsx
      <div className="grid grid-cols-2 gap-1.5 mt-3">
```

(the 4 `<button>` children inside stay unchanged — same `onClick`s, same text, same `text-xs px-2 py-0.5 border border-border rounded hover:border-accent hover:text-accent` classes.)

- [ ] **Step 3: Verify build, lint, and tests**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 4: Manual verification in browser**

Set HP to 0, confirm `DeathSaves` renders cleanly inside the vitals card (no double-bordered nested-card look), the 4 quick-action buttons sit in a readable 2x2 grid, tapping success/failure dots still works, "Rodé 20" still revives to 1 HP. Check all 3 themes — pay particular attention to `pergamino` (light background) since `bg-danger`/`text-danger` contrast was previously tuned against the old dark-only top bar context.

- [ ] **Step 5: Commit**

```bash
git add src/components/combat/DeathSaves.tsx
git commit -m "style: restyle DeathSaves to fit inside the CombatVitals card"
```

---

## Task 14: Final cross-theme verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full verification command**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass, 0 lint errors (per this project's convention).

- [ ] **Step 2: Full manual walkthrough per the spec's Verification section**

Run `npm run dev` and, on each of `piedra-viva`, `pergamino`, `furia-de-sangre`, walk the full Combat tab checklist from `docs/superpowers/specs/2026-07-19-combat-tab-redesign-design.md`'s Verification section:

- Vitals header at HP full / HP partial / HP 0 (dying → death-saves swap, including reviving).
- AC ring modified-state treatment with a temp AC modifier active, and the `✦` magic-bonus mark when `magicItemIndicator === "explicit-tag"` and a magic AC bonus is present — confirm `furia-de-sangre` never shows a second accent hue anywhere in this flow.
- Rage cluster: pip mode at a low character level (2-4 rages) and badge mode at a high one (5-6 rages, e.g. temporarily set `meta.level` to 17+ in test data) — both toggle slots and activate/deactivate correctly, with no leftover "Furia" quick-action or Adicionales row anywhere.
- Quick-actions row scrolls to and expands `attacks[0]` / the Dados section correctly; "Atacar" is absent (not disabled) on a character with zero attacks.
- Attack rows: Hit/Dmg both roll correctly, "⋯" menu still edits/moves/deletes, "+ Agregar ataque" still adds.
- Healer's Kit and Stone's Endurance: tap spends a charge (with pulse animation), long-press enters edit mode.
- At least one equipped magic item with charges renders correctly as a granted-action row.
- **Glow/shadow check on `pergamino` specifically**: confirm the Rage-active card glow and flame-toggle glow read clearly against the light background, not muddy/invisible — this was flagged in the spec as untested against a light theme during brainstorming.
- No text below the 11px floor; every interactive row meets the 40px minimum tap height in `density: "compact"` — check on an actual phone viewport, not just a resized desktop browser window.
- Toggle Ajustes → density between Compacto/Espacioso and confirm every restyled row (AttackRow, CompactRow-based rows) responds.

- [ ] **Step 3: Confirm out-of-scope items are untouched**

Quickly check: all 5 modals (`HpModal`, AC modifier, Temp HP, condition picker, `AttackFormModal`, `StandardActionsModal`) still look like the pre-redesign styling (not yet restyled — that's a later round); `dark-fantasy` theme is pixel-identical to before Task 1; the other 5 tabs (Ficha, Inventario, Notas, Enciclopedia, Ajustes) are unaffected.

- [ ] **Step 4: Final commit (if Step 2/3 surfaced any fixes)**

If the walkthrough found nothing to fix, this task produces no diff and needs no commit — its purpose is verification, not new code. If it did surface something, fix it, re-run Step 1's verification command, and commit with a message describing exactly what the walkthrough caught.
