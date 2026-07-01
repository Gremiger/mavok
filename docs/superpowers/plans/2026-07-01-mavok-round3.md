# Mavok Round 3 Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the five improvements from `docs/superpowers/specs/2026-07-01-mavok-round3-design.md` — a Proficiency Bonus badge, a dedicated Feats section, undo toasts for deletions, a visual micro-animation substitute for haptics, and a print/PDF export view.

**Architecture:** Six independent slices touching six different areas of the app. Tasks 1-5 are small, self-contained UI additions to existing files with no data model changes. Task 6 introduces the app's first-ever route beyond the root (`/print`), reading character data by calling the `useCharacter()` hook directly rather than through `CharacterContext` (that Context Provider only wraps the tree inside `src/app/page.tsx` — it does not exist on a standalone route).

**Tech Stack:** Next.js 15 (App Router, static export), React 19, TypeScript, Tailwind CSS, `framer-motion` (already a dependency), `sonner` (already a dependency, already used for toasts in this codebase).

## Global Constraints

- No changes to `src/lib/types.ts`, no data model version bump, no migration — every section in this plan is display/UX only.
- Spanish UI labels, English D&D terms (existing convention).
- No test suite exists in this repo. Per `CLAUDE.md`, verify every task with `npx tsc --noEmit && npm run build && npm run lint` — **lint is required**, not optional, since it's the only one of the three that catches React Hooks ordering violations.
- **All hooks (`useState`, `useEffect`, `useCharacter()`, `useLongPress`, etc.) must be called before any conditional early return** (e.g. `if (!character) return null;`) in every component this plan touches. This codebase hit two real Rules-of-Hooks bugs from getting this wrong in the previous round.
- Never include a "Co-authored-by" trailer in commit messages (per `CLAUDE.md`).
- `npm run lint` currently reports 8 pre-existing errors across `RageTracker.tsx`, `JournalList.tsx`, `useCharacter.ts`, `useTheme.ts`, `SettingsTab.tsx` — these are known/accepted debt (documented in `CLAUDE.md`). Don't treat them as new regressions; only investigate a lint failure that's new after your change.

---

### Task 1: Proficiency Bonus badge + Feats section

**Files:**
- Modify: `src/components/tabs/SheetTab.tsx`

**Interfaces:**
- Consumes: nothing from other tasks — fully self-contained.
- Produces: nothing consumed by later tasks.

**Context:** `SheetTab.tsx` already has an established pattern for adding a small badge/control alongside a `CollapsibleSection` without modifying the shared `CollapsibleSection` component itself — the "Habilidades" section wraps its `CollapsibleSection` in a `<div className="relative">` and absolutely-positions a small button/badge on top of it (see the existing `groupByAbility` toggle button, `SheetTab.tsx` around the "Habilidades" section). This task reuses that exact pattern for the PB badge instead of adding a new prop to `CollapsibleSection`.

Feats require **zero new data** — both Mavok's origin feat and any ASI-granted feats are already stored in `character.features` with `source: "Dote"` (confirmed by reading `src/data/mavok-default.ts`, where the origin feat "Tough" is `{ name: "Tough", source: "Dote", description: "...", level: 1 }`, and `LevelUpFlow.tsx` pushes ASI-granted feats the same way). This task is a pure filter/display split.

- [ ] **Step 1: Add the Proficiency Bonus badge**

In `src/components/tabs/SheetTab.tsx`, find:

```tsx
      {/* Atributos */}
      <CollapsibleSection title="Atributos" defaultOpen>
```

Replace with (wrapping the whole Atributos section, matching the Habilidades section's existing `relative` + absolutely-positioned badge pattern):

```tsx
      {/* Atributos */}
      <div className="relative">
        <div
          className="absolute right-0 top-0 z-10 text-[0.6rem] text-muted border border-border rounded px-1.5 py-0.5 uppercase tracking-wider"
          style={{ marginTop: "0.9rem" }}
        >
          PB {formatModifier(meta.proficiencyBonus)}
        </div>
        <CollapsibleSection title="Atributos" defaultOpen>
```

Then find the closing tag for this section:

```tsx
        )}
      </CollapsibleSection>

      {/* Tiradas de salvación */}
```

Replace with (adding the closing `</div>` for the new wrapping `<div className="relative">`):

```tsx
        )}
      </CollapsibleSection>
      </div>

      {/* Tiradas de salvación */}
```

- [ ] **Step 2: Exclude feats from the existing Features section**

Find:

```tsx
      {/* Rasgos y características */}
      <CollapsibleSection title="Rasgos y características">
        <div className="space-y-3">
          {features
            .filter(f => f.level <= meta.level)
            .map((f, i) => (
```

Replace with:

```tsx
      {/* Rasgos y características */}
      <CollapsibleSection title="Rasgos y características">
        <div className="space-y-3">
          {features
            .filter(f => f.source !== "Dote" && f.level <= meta.level)
            .map((f, i) => (
```

- [ ] **Step 3: Add the new "Dotes" section**

Find:

```tsx
      </CollapsibleSection>

      {/* Apariencia */}
```

Replace with (inserting the new "Dotes" section between the two, right after "Rasgos y características" closes and right before "Apariencia" begins):

```tsx
      </CollapsibleSection>

      {/* Dotes */}
      <CollapsibleSection title="Dotes">
        <div className="space-y-3">
          {features
            .filter(f => f.source === "Dote" && f.level <= meta.level)
            .map((f, i) => (
              <div key={i} className="stone-card rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-heading text-accent text-base font-semibold">
                    {f.name}
                  </span>
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed">{f.description}</p>
              </div>
            ))}
          {features.filter(f => f.source === "Dote" && f.level <= meta.level).length === 0 && (
            <p className="text-muted text-sm text-center py-4">Sin dotes todavía.</p>
          )}
        </div>
      </CollapsibleSection>

      {/* Apariencia */}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS (no new lint errors in `SheetTab.tsx`).

- [ ] **Step 5: Manual check**

Run `npm run dev`, open the Ficha tab:
- A small "PB +3" (or whatever the current value is) badge appears above-right of the "Atributos" section, matching the visual style of the "Grupo/A-Z" toggle badge on Habilidades.
- Scroll to "Rasgos y características" — Mavok's "Tough" feat entry (`source: "Dote"`) no longer appears there.
- A new "Dotes" section appears (after Features, before Apariencia) showing "Tough" with its description.

- [ ] **Step 6: Commit**

```bash
git add src/components/tabs/SheetTab.tsx
git commit -m "feat: add Proficiency Bonus badge and dedicated Feats section to Sheet tab"
```

---

### Task 2: Undo toast for inventory item deletion

**Files:**
- Modify: `src/components/tabs/InventoryTab.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by later tasks.

**Context:** `InventoryTab.tsx` already imports `toast` from `"sonner"` (used for the "agregado" toast on add) and already destructures `addInventoryItem`/`removeInventoryItem` from `useCharacterContext()`. `addInventoryItem(item)` performs zero processing — it just appends the exact `InventoryItem` object passed to it (confirmed by reading `src/hooks/useCharacter.ts`), so re-adding the original captured object (including its original `id`) is a safe, correct undo — no id regeneration or collision risk.

- [ ] **Step 1: Add the undo toast to the delete button**

In `src/components/tabs/InventoryTab.tsx`, find:

```tsx
                      <button
                        onClick={() => removeInventoryItem(item.id)}
                        className="ml-auto px-3 py-1 text-xs text-danger border border-danger/30 rounded hover:bg-danger/10"
                      >
                        Eliminar
                      </button>
```

Replace with:

```tsx
                      <button
                        onClick={() => {
                          removeInventoryItem(item.id);
                          toast(`${item.name} eliminado`, {
                            action: {
                              label: "Deshacer",
                              onClick: () => addInventoryItem(item),
                            },
                          });
                        }}
                        className="ml-auto px-3 py-1 text-xs text-danger border border-danger/30 rounded hover:bg-danger/10"
                      >
                        Eliminar
                      </button>
```

`item` is already in scope here (the button is inside `group.items.map((item) => (...))`), and `addInventoryItem` is already destructured at the top of the component — no new imports or state needed.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

- [ ] **Step 3: Manual check**

Run `npm run dev`, open the Inventario tab, expand an item, tap "Eliminar":
- The item disappears immediately from the list.
- A toast appears: "{item name} eliminado" with a "Deshacer" button.
- Tapping "Deshacer" within the toast's visible window brings the item back (it reappears in its category group, since `addInventoryItem` just appends and the existing `grouped`/sort logic re-groups it correctly).
- Letting the toast time out without tapping "Deshacer" leaves the deletion permanent.

- [ ] **Step 4: Commit**

```bash
git add src/components/tabs/InventoryTab.tsx
git commit -m "feat: add undo toast when deleting an inventory item"
```

---

### Task 3: Undo toast for condition removal

**Files:**
- Modify: `src/components/tabs/CombatTab.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by later tasks.

**Context:** `CombatTab.tsx` already imports `toast` from `"sonner"` and already has both `addCondition(name)` (guards against duplicates — adding an already-present condition is a safe no-op) and `removeCondition(name)` defined.

- [ ] **Step 1: Add the undo toast to condition removal**

In `src/components/tabs/CombatTab.tsx`, find:

```tsx
        {combat.conditions.map((c) => (
          <Tag key={c} label={c} onRemove={() => removeCondition(c)} />
        ))}
```

Replace with:

```tsx
        {combat.conditions.map((c) => (
          <Tag
            key={c}
            label={c}
            onRemove={() => {
              removeCondition(c);
              toast(`${c} eliminada`, {
                action: {
                  label: "Deshacer",
                  onClick: () => addCondition(c),
                },
              });
            }}
          />
        ))}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

- [ ] **Step 3: Manual check**

Run `npm run dev`, open the Combate tab, add a condition (e.g. "Prone"), then remove it via its Tag's remove control:
- The condition disappears immediately.
- A toast appears: "Prone eliminada" with a "Deshacer" button.
- Tapping "Deshacer" restores the condition.

- [ ] **Step 4: Commit**

```bash
git add src/components/tabs/CombatTab.tsx
git commit -m "feat: add undo toast when removing a condition"
```

---

### Task 4: Resource-spend pulse animation

**Files:**
- Modify: `src/components/tabs/CombatTab.tsx`

**Interfaces:**
- Consumes: nothing from other tasks. (Independent of Task 3 — both touch `CombatTab.tsx` but different, non-overlapping regions; dispatch and review sequentially, not in parallel, per the standard rule against parallel implementers on the same file.)
- Produces: nothing consumed by later tasks.

**Context:** Replaces `navigator.vibrate` (dropped from scope — unsupported on iOS Safari, the user's primary device) with a `framer-motion` scale-pulse, matching the existing usage of `framer-motion` elsewhere in this codebase (e.g. `RageTracker.tsx`'s `AnimatePresence` details panel). Triggers on (a) entering Rage — not exiting it — and (b) a successful `spendStoneEndurance()`/`spendHealerKit()` call (i.e. only when the existing `remaining <= 0` guard did *not* short-circuit).

- [ ] **Step 1: Import `motion` and add pulse-key state**

In `src/components/tabs/CombatTab.tsx`, find:

```tsx
import { useLongPress } from "@/hooks/useLongPress";
```

Add right after it:

```tsx
import { motion } from "framer-motion";
```

Find:

```tsx
  const [stoneEnduranceEditing, setStoneEnduranceEditing] = useState(false);
  const [healerKitEditing, setHealerKitEditing] = useState(false);
```

Add right after it (still before the `if (!character) return null;` line, alongside the other hooks — this satisfies the hooks-safety constraint above):

```tsx
  const [ragePulseKey, setRagePulseKey] = useState(0);
  const [stoneEndurancePulseKey, setStoneEndurancePulseKey] = useState(0);
  const [healerKitPulseKey, setHealerKitPulseKey] = useState(0);
```

- [ ] **Step 2: Bump the pulse keys on successful spend/activate**

Find:

```tsx
  function spendHealerKit() {
    if (resources.healerKit.remaining <= 0) return;
    updateResources({
      healerKit: {
        ...resources.healerKit,
        remaining: resources.healerKit.remaining - 1,
      },
    });
  }
```

Replace with:

```tsx
  function spendHealerKit() {
    if (resources.healerKit.remaining <= 0) return;
    updateResources({
      healerKit: {
        ...resources.healerKit,
        remaining: resources.healerKit.remaining - 1,
      },
    });
    setHealerKitPulseKey((k) => k + 1);
  }
```

Find:

```tsx
  function spendStoneEndurance() {
    if (resources.stoneEndurance.remaining <= 0) return;
    updateResources({
      stoneEndurance: {
        ...resources.stoneEndurance,
        remaining: resources.stoneEndurance.remaining - 1,
      },
    });
  }
```

Replace with:

```tsx
  function spendStoneEndurance() {
    if (resources.stoneEndurance.remaining <= 0) return;
    updateResources({
      stoneEndurance: {
        ...resources.stoneEndurance,
        remaining: resources.stoneEndurance.remaining - 1,
      },
    });
    setStoneEndurancePulseKey((k) => k + 1);
  }
```

Find:

```tsx
  function toggleRageActive() {
    const next = !rageActive;
    updateResources({
      rpiRages: { ...resources.rpiRages, active: next },
    });
    if (next) toast("Rage activado", { icon: "🔥" });
    else toast("Rage desactivado", { icon: "💨" });
  }
```

Replace with:

```tsx
  function toggleRageActive() {
    const next = !rageActive;
    updateResources({
      rpiRages: { ...resources.rpiRages, active: next },
    });
    if (next) {
      toast("Rage activado", { icon: "🔥" });
      setRagePulseKey((k) => k + 1);
    } else {
      toast("Rage desactivado", { icon: "💨" });
    }
  }
```

- [ ] **Step 3: Wrap the Rage toggle button in a pulse**

Find:

```tsx
          <button
            onClick={toggleRageActive}
            className={`w-full p-3 rounded-lg border text-left ${
              rageActive
                ? "border-rage bg-rage/10 text-rage"
                : resources.rpiRages.remaining > 0
                  ? "border-border bg-card text-foreground"
                  : "border-border bg-card text-muted opacity-50"
            }`}
          >
            <span className="font-heading text-accent">Rage</span>
            <span className="text-muted ml-2">
              {rageActive
                ? "(activo — tap para desactivar)"
                : `(${resources.rpiRages.remaining} usos restantes)`}
            </span>
          </button>
```

Replace with:

```tsx
          <motion.button
            key={ragePulseKey}
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.25 }}
            onClick={toggleRageActive}
            className={`w-full p-3 rounded-lg border text-left ${
              rageActive
                ? "border-rage bg-rage/10 text-rage"
                : resources.rpiRages.remaining > 0
                  ? "border-border bg-card text-foreground"
                  : "border-border bg-card text-muted opacity-50"
            }`}
          >
            <span className="font-heading text-accent">Rage</span>
            <span className="text-muted ml-2">
              {rageActive
                ? "(activo — tap para desactivar)"
                : `(${resources.rpiRages.remaining} usos restantes)`}
            </span>
          </motion.button>
```

(`motion.button` accepts the same `onClick`/`className`/children as a plain `<button>` — only `initial`/`animate`/`transition`/`key` are new.)

- [ ] **Step 4: Wrap the Healer's Kit card in a pulse**

Find:

```tsx
        <div
          className={`p-3 rounded-lg border mt-2 ${
            healerKit.remaining > 0
              ? "border-border bg-card"
              : "border-border bg-card opacity-50"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-heading text-accent">Healer&apos;s Kit</span>
```

Replace with:

```tsx
        <motion.div
          key={healerKitPulseKey}
          initial={{ scale: 1.03 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.25 }}
          className={`p-3 rounded-lg border mt-2 ${
            healerKit.remaining > 0
              ? "border-border bg-card"
              : "border-border bg-card opacity-50"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-heading text-accent">Healer&apos;s Kit</span>
```

Then find the matching closing tag for this card:

```tsx
          <p className="text-xs text-muted">
            Acción · estabiliza o cura 1d6+4 HP a una criatura · usos no se recuperan con descansos
          </p>
        </div>
```

Replace with:

```tsx
          <p className="text-xs text-muted">
            Acción · estabiliza o cura 1d6+4 HP a una criatura · usos no se recuperan con descansos
          </p>
        </motion.div>
```

- [ ] **Step 5: Wrap the Stone's Endurance card in a pulse**

Find:

```tsx
          <div
            className={`p-3 rounded-lg border ${
              stoneEndurance.remaining > 0
                ? "border-border bg-card"
                : "border-border bg-card opacity-50"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-heading text-accent">Stone&apos;s Endurance</span>
```

Replace with:

```tsx
          <motion.div
            key={stoneEndurancePulseKey}
            initial={{ scale: 1.03 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.25 }}
            className={`p-3 rounded-lg border ${
              stoneEndurance.remaining > 0
                ? "border-border bg-card"
                : "border-border bg-card opacity-50"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-heading text-accent">Stone&apos;s Endurance</span>
```

Then find the matching closing tag for this card:

```tsx
            <p className="text-xs text-muted">
              Reacción · tira 1d12 + CON mod · reduce el daño entrante por ese total
            </p>
          </div>

          {/* Opportunity Attack */}
```

Replace with:

```tsx
            <p className="text-xs text-muted">
              Reacción · tira 1d12 + CON mod · reduce el daño entrante por ese total
            </p>
          </motion.div>

          {/* Opportunity Attack */}
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

- [ ] **Step 7: Manual check**

Run `npm run dev`, open the Combate tab:
- Tapping "Rage" to activate it triggers a brief scale-pulse on the Rage button. Deactivating Rage does NOT pulse.
- Tapping "Usar" on Stone's Endurance or Healer's Kit (with `remaining > 0`) triggers a brief scale-pulse on that card. Tapping "Usar" when `remaining` is already 0 does not pulse (the spend function's existing guard returns before the pulse-key bump).
- The long-press-to-stepper behavior from the previous round (holding "Usar" to correct a count) still works unchanged.

- [ ] **Step 8: Commit**

```bash
git add src/components/tabs/CombatTab.tsx
git commit -m "feat: add visual pulse animation on Rage activation and resource spends"
```

---

### Task 5: Crit/fumble pulse animation on dice rolls

**Files:**
- Modify: `src/components/ui/DiceResult.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by later tasks.

**Context:** `DiceResult.tsx` already computes `isCrit`/`isFumble` (natural 20 / natural 1 on a single-die d20 roll) and already renders "¡CRIT!"/"Pifia" labels — this task only adds the pulse animation on top of the existing detection, it does not need to build detection from scratch.

- [ ] **Step 1: Replace the outer `div` with an animated `motion.div`**

In `src/components/ui/DiceResult.tsx`, find:

```tsx
"use client";

import { useEffect } from "react";
import type { DiceRoll } from "@/lib/dice";
```

Replace with:

```tsx
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import type { DiceRoll } from "@/lib/dice";
```

Find:

```tsx
  const isCrit = roll.rolls.length === 1 && roll.rolls[0] === 20;
  const isFumble = roll.rolls.length === 1 && roll.rolls[0] === 1;

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-accent/10 rounded text-sm animate-in fade-in">
```

Replace with:

```tsx
  const isCrit = roll.rolls.length === 1 && roll.rolls[0] === 20;
  const isFumble = roll.rolls.length === 1 && roll.rolls[0] === 1;

  return (
    <motion.div
      key={roll.timestamp}
      initial={
        isCrit
          ? { scale: 1.15, boxShadow: "0 0 0 4px rgba(234,179,8,0.5)" }
          : isFumble
            ? { scale: 1.15, boxShadow: "0 0 0 4px rgba(220,38,38,0.5)" }
            : { scale: 1, boxShadow: "0 0 0 0 rgba(0,0,0,0)" }
      }
      animate={{ scale: 1, boxShadow: "0 0 0 0 rgba(0,0,0,0)" }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-2 px-2 py-1 bg-accent/10 rounded text-sm animate-in fade-in"
    >
```

Find the matching closing tag:

```tsx
      <button
        onClick={onClear}
        className="ml-auto text-muted hover:text-foreground text-xs leading-none"
      >
        ✕
      </button>
    </div>
  );
}
```

Replace with:

```tsx
      <button
        onClick={onClear}
        className="ml-auto text-muted hover:text-foreground text-xs leading-none"
      >
        ✕
      </button>
    </motion.div>
  );
}
```

Non-crit, non-fumble rolls get `initial={{ scale: 1, boxShadow: "0 0 0 0 rgba(0,0,0,0)" }}` — i.e. no visible pulse, since `initial` already equals `animate`. Only a natural 20 or natural 1 shows the gold/red glow-and-scale effect.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

- [ ] **Step 3: Manual check**

Run `npm run dev`, roll a d20-based check (ability/save/skill on the Ficha tab, or an attack's "Hit" button on Combate) repeatedly until a natural 20 or natural 1 comes up:
- A natural 20 shows a brief gold glow + scale pulse alongside the existing "¡CRIT!" label.
- A natural 1 shows a brief red glow + scale pulse alongside the existing "Pifia" label.
- Any other roll (including non-d20 damage rolls) displays exactly as before, with no pulse.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/DiceResult.tsx
git commit -m "feat: add crit/fumble pulse animation to dice roll results"
```

---

### Task 6: Print / PDF export view

**Files:**
- Create: `src/app/print/page.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Consumes: `useCharacter` hook from `src/hooks/useCharacter.ts` (exact signature: `useCharacter(id?: string): { character: Character | null, ...updaters }`), called directly — **not** `useCharacterContext()`, since `CharacterContext.Provider` only wraps the component tree inside `src/app/page.tsx`'s `Home` component and does not exist on any other route. Calling `useCharacterContext()` from `/print` would throw ("useCharacterContext must be inside CharacterProvider").
- Produces: nothing consumed by later tasks.

**Context:** This is the first route this app has beyond the root — confirmed by reading `src/app/layout.tsx` (bare `<html>/<body>` shell, only `ServiceWorkerRegistration` and `{children}`, no Context providers) and `src/app/page.tsx` (where `CharacterContext.Provider`/`ThemeContext.Provider` are established). Next.js `output: 'export'` supports additional static pages beyond the root with no special configuration — `src/app/print/page.tsx` becomes `out/print/index.html` at build time. The service worker's fetch handler (`public/sw.js`) treats all navigation requests as network-first, so hitting `/print` while online works with no special handling; it will not load while the device is fully offline (a known, accepted limitation — printing isn't an offline use case).

- [ ] **Step 1: Create the print page**

Create `src/app/print/page.tsx`:

```tsx
"use client";

import { useCharacter } from "@/hooks/useCharacter";
import type { AbilityScore } from "@/lib/types";
import {
  abilityModifier,
  formatModifier,
  abilityLabel,
  skillLabel,
  skillTotal,
  saveTotal,
} from "@/lib/utils";

const ABILITIES: AbilityScore[] = ["str", "dex", "con", "int", "wis", "cha"];

export default function PrintPage() {
  const { character } = useCharacter();

  if (!character) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  const {
    meta,
    attributes,
    skills,
    savingThrows,
    proficiencies,
    features,
    attacks,
    inventory,
    currency,
  } = character;

  return (
    <div className="print-sheet max-w-3xl mx-auto p-8 text-black bg-white">
      <header className="mb-6 border-b-2 border-black pb-3">
        <h1 className="text-3xl font-bold">{meta.name}</h1>
        <p className="text-sm">
          {meta.class} {meta.subclass ? `· ${meta.subclass}` : ""} — Nivel{" "}
          {meta.level} · PB {formatModifier(meta.proficiencyBonus)}
        </p>
        <p className="text-xs">
          {meta.species} · {meta.giantAncestry} · {meta.background} ·{" "}
          {meta.origin}
        </p>
      </header>

      <section className="mb-6">
        <h2 className="text-lg font-bold mb-2 border-b border-black">
          Atributos
        </h2>
        <div className="grid grid-cols-6 gap-2 text-center text-sm">
          {ABILITIES.map((ab) => (
            <div key={ab} className="border border-black rounded p-1">
              <div className="text-xs uppercase">{abilityLabel(ab)}</div>
              <div className="font-bold text-lg">{attributes[ab]}</div>
              <div className="text-xs">
                {formatModifier(abilityModifier(attributes[ab]))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-bold mb-2 border-b border-black">
            Salvaciones
          </h2>
          <div className="text-sm space-y-0.5">
            {ABILITIES.map((ab) => (
              <div key={ab} className="flex justify-between">
                <span>
                  {savingThrows[ab]?.proficient ? "●" : "○"} {abilityLabel(ab)}
                </span>
                <span>{formatModifier(saveTotal(character, ab))}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold mb-2 border-b border-black">
            Habilidades
          </h2>
          <div className="text-sm space-y-0.5">
            {Object.entries(skills)
              .sort(([a], [b]) => skillLabel(a).localeCompare(skillLabel(b)))
              .map(([key, skill]) => (
                <div key={key} className="flex justify-between">
                  <span>
                    {skill.proficient ? "●" : "○"} {skillLabel(key)}
                  </span>
                  <span>{formatModifier(skillTotal(character, key))}</span>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-bold mb-2 border-b border-black">
          Competencias
        </h2>
        <div className="text-sm space-y-1">
          <p>
            <strong>Armaduras:</strong> {proficiencies.armor.join(", ")}
          </p>
          <p>
            <strong>Armas:</strong> {proficiencies.weapons.join(", ")}
          </p>
          <p>
            <strong>Herramientas:</strong> {proficiencies.tools.join(", ")}
          </p>
          <p>
            <strong>Idiomas:</strong> {proficiencies.languages.join(", ")}
          </p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-bold mb-2 border-b border-black">
          Rasgos, características y dotes
        </h2>
        <div className="text-sm space-y-2">
          {features
            .filter((f) => f.level <= meta.level)
            .map((f, i) => (
              <div key={i}>
                <p>
                  <strong>{f.name}</strong>{" "}
                  <span className="text-xs">({f.source})</span>
                </p>
                <p>{f.description}</p>
              </div>
            ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-bold mb-2 border-b border-black">
          Ataques
        </h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-black text-left">
              <th className="py-1">Arma</th>
              <th className="py-1">Bono</th>
              <th className="py-1">Daño</th>
              <th className="py-1">Alcance</th>
            </tr>
          </thead>
          <tbody>
            {attacks.map((a) => (
              <tr key={a.id} className="border-b border-black/20">
                <td className="py-1">{a.name}</td>
                <td className="py-1">{formatModifier(a.attackBonus)}</td>
                <td className="py-1">
                  {a.damage} {a.damageType}
                </td>
                <td className="py-1">{a.range}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-2 border-b border-black">
          Inventario
        </h2>
        <p className="text-sm mb-2">
          Monedas: {currency.pp}pp {currency.gp}gp {currency.ep}ep{" "}
          {currency.sp}sp {currency.cp}cp
        </p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-black text-left">
              <th className="py-1">Objeto</th>
              <th className="py-1">Cant.</th>
              <th className="py-1">Peso</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="border-b border-black/20">
                <td className="py-1">
                  {item.name}
                  {item.equipped ? " (equipado)" : ""}
                </td>
                <td className="py-1">{item.quantity}</td>
                <td className="py-1">
                  {item.weight !== null
                    ? `${item.weight * item.quantity} lb`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Add print-media CSS override**

In `src/app/globals.css`, append to the end of the file:

```css

/* Print view */
@media print {
  body {
    background: #fff !important;
    color: #000 !important;
  }
}
```

This overrides `layout.tsx`'s dark-theme `bg-background text-foreground` classes on `<body>` at print time, regardless of which of the two in-app themes is active — the print page's own `bg-white text-black` classes handle the rest.

- [ ] **Step 3: Add the Settings button linking to `/print`**

In `src/components/tabs/SettingsTab.tsx`, add the import:

```typescript
import Link from "next/link";
```

alongside the existing imports at the top of the file.

Find, inside the "Datos" `CollapsibleSection`:

```tsx
          <button
            onClick={() => exportQuickNotes(character.notes.quick)}
            className="w-full p-3 bg-card rounded-lg border border-border text-left text-sm"
          >
            Exportar notas rápidas (TXT)
          </button>
```

Add right after it (still inside the same `<div className="space-y-2">`):

```tsx
          <Link
            href="/print"
            className="block w-full p-3 bg-card rounded-lg border border-border text-left text-sm"
          >
            Imprimir / Exportar PDF
          </Link>
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS. Confirm the build output includes a new static route for `/print` (look for `Route (app)` output listing `/print` alongside `/`).

- [ ] **Step 5: Manual check**

Run `npm run dev`:
- Open Ajustes → tap "Imprimir / Exportar PDF" → navigates to `/print`, showing a plain black-on-white, single-column character sheet (name/level/class header, attributes, saves, skills, competencias, features+feats, attacks table, inventory table + currency).
- Trigger the browser's print dialog (Cmd/Ctrl+P on desktop, or Share → Print on iOS Safari) from the `/print` page — the page renders sensibly on paper with no dark background bleeding through and no app chrome (no nav, no buttons) visible.
- Navigate back to the main app (browser back button) — the app's LocalStorage-backed state is untouched (the print page never calls any updater function).

- [ ] **Step 6: Commit**

```bash
git add src/app/print/page.tsx src/app/globals.css src/components/tabs/SettingsTab.tsx
git commit -m "feat: add print/PDF export view"
```

---

## Final Verification

After all 6 tasks:

```bash
npx tsc --noEmit && npm run build && npm run lint
```

Expected: all PASS, with only the 8 pre-existing, documented lint errors remaining (no new ones).
