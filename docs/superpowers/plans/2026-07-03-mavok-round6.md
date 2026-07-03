# Mavok Round 6 Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the twelve improvements from `docs/superpowers/specs/2026-07-03-mavok-round6-design.md` — lint debt cleanup, a Lance weapon extraction bug, a confirmed `rageBonus` rules bug, dynamic Weapon Mastery flavor text, three round-4 leftovers, damage-type icons, move-button attack reordering, a global density toggle, read-more previews, a conditions quick-lookup, and a one-page reference-card print mode.

**Architecture:** Twelve sequential tasks (never dispatched in parallel — several tasks touch the same file more than once, and each task's diff is written against the file state the previous task touching it left behind). `AttackRow.tsx` is touched in Tasks 3, 6, 7, 9 (in that order); `CombatTab.tsx` in Tasks 5, 7, 11; `SettingsTab.tsx` in Tasks 5, 8; `useTheme.ts` in Tasks 1, 8; `useCharacter.ts` in Tasks 1, 7; `JournalList.tsx` in Tasks 1, 9, 10; `NoteList.tsx` and `QuestList.tsx` in Tasks 9, 10.

**Tech Stack:** Next.js 15 (App Router, static export), React 19, TypeScript, Tailwind CSS, `lucide-react` (icons, already a dependency). No new dependencies.

## Global Constraints

- Spanish UI labels, English D&D terms (existing convention).
- No test suite exists in this repo. Verify every task with `npx tsc --noEmit && npm run build && npm run lint`.
- Never include a "Co-authored-by" trailer in commit messages.
- **Task 1 resolves all 7 pre-existing lint errors.** After Task 1, `npm run lint` must report 0 errors. Every task after that must stay at 0 — a new lint error anywhere is a regression, not "pre-existing debt," unlike in prior rounds' plans.
- **No `Character` schema changes.** `CURRENT_DATA_VERSION` stays at 4, `src/lib/migrations.ts` is untouched. The only settings-shape addition is `AppSettings.density` (Task 8) — `AppSettings` isn't part of the versioned `Character` migration system.
- **The `rageBonus` fix (Task 3) is a confirmed XPHB rules correction**, not a style preference — verified against `../dnd/5etools-src/data/class/class-barbarian.json`'s actual Rage Damage text, which has no melee-only restriction. Don't add the exclusion back.
- **The eslint-disable comments added in Tasks 1 and 8 are deliberate and must stay scoped to one line each**, with the justification comment explaining the SSR/localStorage constraint. Do not broaden them to a file-level or block-level disable.

---

### Task 1: Lint debt cleanup

**Files:**
- Modify: `src/components/combat/RageTracker.tsx`
- Modify: `src/components/notes/JournalList.tsx`
- Modify: `src/hooks/useCharacter.ts`
- Modify: `src/hooks/useTheme.ts`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by other tasks (Tasks 7, 8, 9, 10 touch these same files again later, but don't depend on any new export from this task — they just need the file to already be lint-clean when they land their own changes).

**Context:** Three genuinely different root causes. `RageTracker.tsx`'s `Ember` component calls `Math.random()` directly inside JSX prop values on every render (`react-hooks/purity`, 4 errors). `JournalList.tsx`'s effect exists purely to mirror a prop into state (the "you might not need an effect" anti-pattern). `useCharacter.ts` and `useTheme.ts` read `localStorage` once on mount inside an effect *by design* — `localStorage` doesn't exist during this static-export app's build-time prerender pass (see `src/lib/storage.ts`'s `typeof window === "undefined"` guards) — so per the design spec's decision, these two get a scoped, justified suppression rather than an architectural rewrite.

- [ ] **Step 1: Fix `RageTracker.tsx`'s impure random values**

Find:

```typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface RageTrackerProps {
  slots: boolean[];
  active: boolean;
  onToggleSlot: (index: number) => void;
  onToggleActive: () => void;
}

function Ember({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-orange-400"
      initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -20, -40, -55],
        x: [0, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 40],
        scale: [0, 1.5, 1, 0],
      }}
      transition={{
        duration: 1.8,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
        ease: "easeOut",
      }}
      style={{
        left: `${30 + Math.random() * 40}%`,
        bottom: "10%",
        filter: "blur(0.5px)",
      }}
    />
  );
}
```

Replace with:

```typescript
"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RageTrackerProps {
  slots: boolean[];
  active: boolean;
  onToggleSlot: (index: number) => void;
  onToggleActive: () => void;
}

function Ember({ delay }: { delay: number }) {
  const offsets = useMemo(
    () => ({
      xMid: (Math.random() - 0.5) * 30,
      xEnd: (Math.random() - 0.5) * 40,
      repeatDelay: Math.random() * 2,
      left: 30 + Math.random() * 40,
    }),
    []
  );
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-orange-400"
      initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -20, -40, -55],
        x: [0, offsets.xMid, offsets.xEnd],
        scale: [0, 1.5, 1, 0],
      }}
      transition={{
        duration: 1.8,
        delay,
        repeat: Infinity,
        repeatDelay: offsets.repeatDelay,
        ease: "easeOut",
      }}
      style={{
        left: `${offsets.left}%`,
        bottom: "10%",
        filter: "blur(0.5px)",
      }}
    />
  );
}
```

- [ ] **Step 2: Fix `JournalList.tsx`'s prop-mirroring effect**

In `src/components/notes/JournalList.tsx`, find:

```typescript
import { useState, useEffect } from "react";
```

Replace with:

```typescript
import { useState } from "react";
```

Find:

```typescript
  const [form, setForm] = useState({
    session: 1,
    title: "",
    content: "",
  });

  useEffect(() => {
    if (initialOpenId) setViewingId(initialOpenId);
  }, [initialOpenId]);

  if (!character) return null;
```

Replace with:

```typescript
  const [form, setForm] = useState({
    session: 1,
    title: "",
    content: "",
  });
  const [prevInitialOpenId, setPrevInitialOpenId] = useState(initialOpenId);
  if (initialOpenId !== prevInitialOpenId) {
    setPrevInitialOpenId(initialOpenId);
    if (initialOpenId) setViewingId(initialOpenId);
  }

  if (!character) return null;
```

- [ ] **Step 3: Suppress the deliberate `useCharacter.ts` effect**

In `src/hooks/useCharacter.ts`, find:

```typescript
  useEffect(() => {
    const data = loadCharacter(id);
    setCharacter(data ?? MAVOK_DEFAULT);
    setReady(true);
  }, [id]);
```

Replace with:

```typescript
  useEffect(() => {
    const data = loadCharacter(id);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: localStorage is unavailable during the static-export build's prerender pass (see storage.ts's `typeof window === "undefined"` guards), so this read must be deferred to after client mount, not computed during render.
    setCharacter(data ?? MAVOK_DEFAULT);
    setReady(true);
  }, [id]);
```

- [ ] **Step 4: Suppress the deliberate `useTheme.ts` effect**

In `src/hooks/useTheme.ts`, find:

```typescript
  useEffect(() => {
    const settings = loadSettings();
    setTheme(settings.theme);
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, []);
```

Replace with:

```typescript
  useEffect(() => {
    const settings = loadSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: localStorage is unavailable during the static-export build's prerender pass, so this read must be deferred to after client mount.
    setTheme(settings.theme);
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, []);
```

- [ ] **Step 5: Update CLAUDE.md's lint-debt paragraph**

In `CLAUDE.md`, find:

```
`npm run lint` currently reports 7 pre-existing errors across 4 files, unrelated to any one feature: `react-hooks/purity` (`Math.random()` called during render) x4 in `RageTracker.tsx`, and `react-hooks/set-state-in-effect` x1 each in `JournalList.tsx`, `useCharacter.ts`, and `useTheme.ts`. These are known/accepted debt — don't treat them as regressions caused by your own change; only investigate a lint failure that's new.
```

Replace with:

```
`npm run lint` should report 0 errors. Two lines (in `useCharacter.ts` and `useTheme.ts`, both reading `localStorage` on mount) carry a scoped `eslint-disable-next-line react-hooks/set-state-in-effect` with an inline justification — that's deliberate (localStorage is unavailable during this static-export app's build-time prerender pass), not new debt. Don't remove those comments, and don't add a similar suppression elsewhere without the same SSR/localStorage justification.
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS. `npm run lint` reports **0 errors** (2 pre-existing `@next/next/no-img-element` warnings in `SettingsTab.tsx`/`SheetTab.tsx` remain — those were never part of the "7 errors" count and aren't touched by this task).

- [ ] **Step 7: Commit**

```bash
git add src/components/combat/RageTracker.tsx src/components/notes/JournalList.tsx src/hooks/useCharacter.ts src/hooks/useTheme.ts CLAUDE.md
git commit -m "fix: resolve all pre-existing lint errors"
```

---

### Task 2: Lance weapon data bug

**Files:**
- Modify: `scripts/extract-5etools.ts`
- Regenerate: `src/data/weapons.ts` (and the other 6 generated `src/data/*.ts` files, though only `weapons.ts` should actually change)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by other tasks.

**Context:** Confirmed root cause against `../dnd/5etools-src/data/items-base.json`: Lance's `property` array is `["H|XPHB", "R|XPHB", {"uid": "2H|XPHB", "note": "unless mounted"}]` — the third entry is an object, not a string. `scripts/extract-5etools.ts`'s `extractWeapons()` maps non-string properties via `String(p)`, which produces the literal text `"[object Object]"` — already visible today in `src/data/weapons.ts`'s Lance entry (`properties: ["Heavy", "Reach", "[object Object]"]`).

- [ ] **Step 1: Fix the property mapper**

In `scripts/extract-5etools.ts`, find:

```typescript
      const rawProps = (i.property as string[]) || [];
      const props = rawProps.map((p: string) => {
        const abbr = typeof p === "string" ? p.split("|")[0] : String(p);
        return propAbbrevMap[abbr] || abbr;
      });
```

Replace with:

```typescript
      const rawProps = (i.property as (string | { uid: string })[]) || [];
      const props = rawProps.map((p) => {
        const raw = typeof p === "string" ? p : p.uid;
        const abbr = raw.split("|")[0];
        return propAbbrevMap[abbr] || abbr;
      });
```

- [ ] **Step 2: Regenerate and verify the diff scope**

Run:

```bash
npx tsx scripts/extract-5etools.ts
git diff --stat src/data/
```

Expected: the diff touches only `src/data/weapons.ts`. Then confirm the actual content change:

```bash
git diff src/data/weapons.ts
```

Expected: Lance's `properties` array changes from `["Heavy", "Reach", "[object Object]"]` to `["Heavy", "Reach", "Two-Handed"]`, and nothing else in the file changes.

If `git diff --stat` shows any file other than `weapons.ts`, **stop and investigate** before proceeding — the 5etools source hasn't changed, so a wider diff means the script fix has an unintended side effect.

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS, 0 lint errors (per Task 1).

- [ ] **Step 4: Commit**

```bash
git add scripts/extract-5etools.ts src/data/weapons.ts
git commit -m "fix: correctly extract Lance's conditional Two-Handed property"
```

---

### Task 3: `rageBonus` range-exclusion fix

**Files:**
- Modify: `src/components/combat/AttackRow.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by other tasks (Tasks 6, 7, 9 touch this same file again later, in unrelated regions).

**Context:** Confirmed against XPHB's actual Rage Damage text (`../dnd/5etools-src/data/class/class-barbarian.json`): *"When you make an attack using Strength—with either a weapon or an Unarmed Strike—and deal damage to the target, you gain a bonus to the damage..."* — no melee-only restriction. The only text suggesting otherwise, "Crushing Throw," belongs to Path of the Giant (`subclassSource: "BGG"`), not one of the 4 XPHB subclasses this app supports (confirmed via `src/data/subclasses.ts` — none of the 4 supported subclasses mention thrown or ranged exceptions at all).

- [ ] **Step 1: Remove the exclusion**

Find:

```typescript
  const isStrBased = !attack.properties.includes("Finesse");
  const rageBonus = rageActive && isStrBased && !attack.range.includes("/") ? rageDamage : 0;
```

Replace with:

```typescript
  const isStrBased = !attack.properties.includes("Finesse");
  const rageBonus = rageActive && isStrBased ? rageDamage : 0;
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS, 0 lint errors.

Manually verify in `npm run dev`: activate Rage, confirm the Maul (melee) still shows the rage damage bonus in its displayed damage, and confirm the Javelin (thrown, `range` includes `/`) **now also** shows the rage damage bonus — this is the fix; previously it didn't.

- [ ] **Step 3: Commit**

```bash
git add src/components/combat/AttackRow.tsx
git commit -m "fix: Rage damage bonus applies to thrown Strength-based attacks too"
```

---

### Task 4: Dynamic Weapon Mastery flavor text

**Files:**
- Create: `src/lib/weaponMatch.ts`
- Modify: `src/components/settings/WeaponMasteryModal.tsx`
- Modify: `src/components/tabs/SheetTab.tsx`

**Interfaces:**
- Produces: `baseWeaponName(attackName: string): string | null` and `describeWeaponMastery(attacks: Attack[]): string`, both exported from `src/lib/weaponMatch.ts`.
- Consumes: `WEAPONS` from `@/data/weapons`, `Attack` type from `@/lib/types`.

**Context:** `WeaponMasteryModal.tsx` already has a local `baseWeaponName` function (from round 5) that matches an `Attack.name` like `"Handaxe (melee)"` back to its base `WEAPONS` entry name (`"Handaxe"`). This task extracts it into a shared file and adds a new `describeWeaponMastery` function, then uses it in `SheetTab.tsx` to replace the static, go-stale-after-a-swap "Weapon Mastery" feature description with a live-computed one.

- [ ] **Step 1: Create the shared helper**

Create `src/lib/weaponMatch.ts`:

```typescript
import { WEAPONS } from "@/data/weapons";
import type { Attack } from "./types";

export function baseWeaponName(attackName: string): string | null {
  const match = WEAPONS.find(
    (w) => attackName === w.name || attackName.startsWith(`${w.name} (`)
  );
  return match ? match.name : null;
}

export function describeWeaponMastery(attacks: Attack[]): string {
  const activeNames = Array.from(
    new Set(
      attacks
        .filter((a) => a.mastery !== null)
        .map((a) => baseWeaponName(a.name))
        .filter((n): n is string => n !== null)
    )
  );
  const parts = activeNames.map((name) => {
    const attack = attacks.find((a) => baseWeaponName(a.name) === name);
    return `${name} (${attack?.mastery})`;
  });
  const count = activeNames.length;
  return `Conoce las propiedades de maestría de ${count} arma${count === 1 ? "" : "s"}: ${parts.join(", ")}.`;
}
```

- [ ] **Step 2: Refactor `WeaponMasteryModal.tsx` to use the shared helper**

In `src/components/settings/WeaponMasteryModal.tsx`, find:

```typescript
import { WEAPONS } from "@/data/weapons";
import { MASTERY_PROPERTIES } from "@/data/mastery";
import { computeMasterySaveDC } from "@/lib/masteryDC";
import { toast } from "sonner";

function baseWeaponName(attackName: string): string | null {
  const match = WEAPONS.find(
    (w) => attackName === w.name || attackName.startsWith(`${w.name} (`)
  );
  return match ? match.name : null;
}
```

Replace with:

```typescript
import { WEAPONS } from "@/data/weapons";
import { MASTERY_PROPERTIES } from "@/data/mastery";
import { computeMasterySaveDC } from "@/lib/masteryDC";
import { baseWeaponName } from "@/lib/weaponMatch";
import { toast } from "sonner";
```

- [ ] **Step 3: Add `attacks` to `SheetTab.tsx`'s character destructure**

In `src/components/tabs/SheetTab.tsx`, find:

```typescript
  const {
    meta,
    attributes,
    skills,
    savingThrows,
    proficiencies,
    features,
    resources,
  } = character;
```

Replace with:

```typescript
  const {
    meta,
    attributes,
    skills,
    savingThrows,
    proficiencies,
    features,
    resources,
    attacks,
  } = character;
```

- [ ] **Step 4: Compute the description live in the Rasgos render**

Find:

```typescript
import { rollD20, rollD20WithAdvantage, type DiceRoll } from "@/lib/dice";
```

Replace with:

```typescript
import { rollD20, rollD20WithAdvantage, type DiceRoll } from "@/lib/dice";
import { describeWeaponMastery } from "@/lib/weaponMatch";
```

Find:

```tsx
      {/* Rasgos y características */}
      <CollapsibleSection title="Rasgos y características">
        <div className="space-y-3">
          {features
            .filter(f => f.source !== "Dote" && f.level <= meta.level)
            .map((f, i) => (
            <div key={i} className="stone-card rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-heading text-accent text-base font-semibold">
                  {f.name}
                </span>
                <span className="text-muted text-[0.6rem] px-1.5 py-0.5 border border-border rounded uppercase tracking-wider">
                  {f.source}
                </span>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>
```

Replace with:

```tsx
      {/* Rasgos y características */}
      <CollapsibleSection title="Rasgos y características">
        <div className="space-y-3">
          {features
            .filter(f => f.source !== "Dote" && f.level <= meta.level)
            .map((f, i) => (
            <div key={i} className="stone-card rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-heading text-accent text-base font-semibold">
                  {f.name}
                </span>
                <span className="text-muted text-[0.6rem] px-1.5 py-0.5 border border-border rounded uppercase tracking-wider">
                  {f.source}
                </span>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {f.name === "Weapon Mastery" ? describeWeaponMastery(attacks) : f.description}
              </p>
            </div>
          ))}
        </div>
      </CollapsibleSection>
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS, 0 lint errors.

Manually verify in `npm run dev`: Sheet tab → Rasgos y características → "Weapon Mastery" shows "Conoce las propiedades de maestría de 2 armas: Maul (Topple), Handaxe (Vex)." (matching Mavok's starting data). Then use Settings → "Practicar con armas" to swap Handaxe out for Javelin, return to Sheet tab, confirm the same feature now shows "...Maul (Topple), Javelin (Slow)." — live-updated, not stale.

- [ ] **Step 6: Commit**

```bash
git add src/lib/weaponMatch.ts src/components/settings/WeaponMasteryModal.tsx src/components/tabs/SheetTab.tsx
git commit -m "feat: compute Weapon Mastery feature description live instead of storing it statically"
```

---

### Task 5: Round-4 leftovers

**Files:**
- Modify: `src/components/tabs/CombatTab.tsx`
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by other tasks (both files are touched again later — `CombatTab.tsx` in Tasks 7 and 11, `SettingsTab.tsx` in Task 8 — in unrelated regions).

**Context:** Three small, independent, previously-documented fixes.

- [ ] **Step 1: Fix the undo-toast attack position**

In `src/components/tabs/CombatTab.tsx`, find:

```typescript
  const {
    character,
    updateCombat,
    updateResources,
    updateMeta,
    addAttack,
    updateAttack,
    removeAttack,
  } = useCharacterContext();
```

Replace with:

```typescript
  const {
    character,
    update,
    updateCombat,
    updateResources,
    updateMeta,
    addAttack,
    updateAttack,
    removeAttack,
  } = useCharacterContext();
```

Find:

```tsx
            onEdit={() => setAttackModalState(a)}
            onDelete={() => {
              removeAttack(a.id);
              toast(`${a.name} eliminado`, {
                action: {
                  label: "Deshacer",
                  onClick: () => addAttack(a),
                },
              });
            }}
          />
        ))}
```

Replace with:

```tsx
            onEdit={() => setAttackModalState(a)}
            onDelete={() => {
              const index = attacks.findIndex((x) => x.id === a.id);
              removeAttack(a.id);
              toast(`${a.name} eliminado`, {
                action: {
                  label: "Deshacer",
                  onClick: () =>
                    update((c) => {
                      const next = [...c.attacks];
                      next.splice(index, 0, a);
                      return { ...c, attacks: next };
                    }),
                },
              });
            }}
          />
        ))}
```

- [ ] **Step 2: Fix portrait upload error handling and black-composite bug**

In `src/components/tabs/SettingsTab.tsx`, find:

```typescript
  async function handlePortraitUpload(file: File) {
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = objectUrl;
      await img.decode();

      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - side) / 2;
      const sy = (img.naturalHeight - side) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, 400, 400);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      updateMeta({ portraitDataUrl: dataUrl });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }
```

Replace with:

```typescript
  async function handlePortraitUpload(file: File) {
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = objectUrl;
      await img.decode();

      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - side) / 2;
      const sy = (img.naturalHeight - side) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, sx, sy, side, side, 0, 0, 400, 400);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      updateMeta({ portraitDataUrl: dataUrl });
    } catch {
      toast.error("No se pudo procesar la imagen");
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }
```

- [ ] **Step 3: Fix level-up history's array-index key**

Find:

```tsx
            {character.levelUpHistory
              .slice()
              .reverse()
              .map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-card rounded-lg border border-border"
                >
```

Replace with:

```tsx
            {character.levelUpHistory
              .slice()
              .reverse()
              .map((entry) => (
                <div
                  key={`${entry.level}-${entry.date}`}
                  className="flex items-center justify-between p-2 bg-card rounded-lg border border-border"
                >
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS, 0 lint errors.

Manually verify in `npm run dev`: delete an attack that isn't last in the list, tap "Deshacer," confirm it reappears at its original position (not appended at the end). Upload a portrait image, confirm it still works normally; there's no way to easily simulate a decode failure manually, so just confirm no regression in the working case.

- [ ] **Step 5: Commit**

```bash
git add src/components/tabs/CombatTab.tsx src/components/tabs/SettingsTab.tsx
git commit -m "fix: round-4 leftovers - undo position, portrait upload errors, history key"
```

---

### Task 6: Damage-type icons

**Files:**
- Modify: `src/components/combat/AttackRow.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by other tasks (Tasks 7 and 9 touch this same file again later, in unrelated regions).

**Context:** `AttackRow.tsx`'s collapsed row shows damage type as abbreviated text. The only three `damageType` values this app ever produces are `Bludgeoning`, `Piercing`, `Slashing` (confirmed across `mavok-default.ts` and `weapons.ts`). `Sword`, `Target`, and `Hammer` all exist in the installed `lucide-react` version (confirmed).

- [ ] **Step 1: Add the icon mapping**

Find:

```typescript
import { rollD20, rollD20WithAdvantage, rollDice, type DiceRoll } from "@/lib/dice";
import { DiceResult } from "@/components/ui/DiceResult";
```

Replace with:

```typescript
import { rollD20, rollD20WithAdvantage, rollDice, type DiceRoll } from "@/lib/dice";
import { DiceResult } from "@/components/ui/DiceResult";
import { Sword, Target, Hammer } from "lucide-react";

const DAMAGE_TYPE_ICONS: Record<string, typeof Sword> = {
  Slashing: Sword,
  Piercing: Target,
  Bludgeoning: Hammer,
};
```

- [ ] **Step 2: Compute and render the icon**

Find:

```typescript
  const isStrBased = !attack.properties.includes("Finesse");
  const rageBonus = rageActive && isStrBased ? rageDamage : 0;
```

Replace with:

```typescript
  const isStrBased = !attack.properties.includes("Finesse");
  const rageBonus = rageActive && isStrBased ? rageDamage : 0;
  const DamageIcon = DAMAGE_TYPE_ICONS[attack.damageType];
```

Find:

```tsx
          <div className="text-xs text-muted mt-0.5">
            +{attack.attackBonus} · {displayDamage()} {attack.damageType.slice(0, 4).toLowerCase()}. · {attack.range}
          </div>
```

Replace with:

```tsx
          <div className="text-xs text-muted mt-0.5">
            {DamageIcon && (
              <DamageIcon size={11} className="inline-block mb-0.5 mr-1" />
            )}
            +{attack.attackBonus} · {displayDamage()} {attack.damageType.slice(0, 4).toLowerCase()}. · {attack.range}
          </div>
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS, 0 lint errors.

Manually verify in `npm run dev`: Combat tab → confirm the Maul (Bludgeoning) shows a hammer icon, the Handaxe entries (Slashing) show a sword icon, and the Javelin/Sickle... wait, Sickle is Slashing too, Javelin is Piercing — confirm Javelin shows a target icon.

- [ ] **Step 4: Commit**

```bash
git add src/components/combat/AttackRow.tsx
git commit -m "feat: add damage-type icons to attack rows"
```

---

### Task 7: Move-button attack reordering

**Files:**
- Modify: `src/hooks/useCharacter.ts`
- Modify: `src/components/combat/AttackRow.tsx`
- Modify: `src/components/tabs/CombatTab.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `moveAttack(attackId: string, direction: "up" | "down"): void` on the character context, and `AttackRow` gains two new optional props: `onMoveUp?: () => void`, `onMoveDown?: () => void`.

**Context:** No drag gestures — per the design decision, small ↑/↓ buttons instead, following the established "only render the button if its handler prop is provided" convention already used for `onEdit`/`onDelete` on this same component.

- [ ] **Step 1: Add `moveAttack` to `useCharacter.ts`**

Find:

```typescript
  const removeAttack = useCallback(
    (attackId: string) =>
      update((c) => ({
        ...c,
        attacks: c.attacks.filter((a) => a.id !== attackId),
      })),
    [update]
  );
```

Replace with:

```typescript
  const removeAttack = useCallback(
    (attackId: string) =>
      update((c) => ({
        ...c,
        attacks: c.attacks.filter((a) => a.id !== attackId),
      })),
    [update]
  );

  const moveAttack = useCallback(
    (attackId: string, direction: "up" | "down") =>
      update((c) => {
        const index = c.attacks.findIndex((a) => a.id === attackId);
        if (index === -1) return c;
        const swapWith = direction === "up" ? index - 1 : index + 1;
        if (swapWith < 0 || swapWith >= c.attacks.length) return c;
        const attacks = [...c.attacks];
        [attacks[index], attacks[swapWith]] = [attacks[swapWith], attacks[index]];
        return { ...c, attacks };
      }),
    [update]
  );
```

Find:

```typescript
    addAttack,
    updateAttack,
    removeAttack,
    addQuickNote,
```

Replace with:

```typescript
    addAttack,
    updateAttack,
    removeAttack,
    moveAttack,
    addQuickNote,
```

- [ ] **Step 2: Add the props and buttons to `AttackRow.tsx`**

Find:

```typescript
export function AttackRow({
  attack,
  rageActive,
  rageDamage,
  recklessActive,
  onEdit,
  onDelete,
}: {
  attack: Attack;
  rageActive: boolean;
  rageDamage: number;
  recklessActive: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
```

Replace with:

```typescript
export function AttackRow({
  attack,
  rageActive,
  rageDamage,
  recklessActive,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  attack: Attack;
  rageActive: boolean;
  rageDamage: number;
  recklessActive: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
```

Find:

```tsx
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRollDamage();
            }}
            className="px-2.5 py-1.5 bg-danger/20 text-danger rounded text-xs font-heading active:scale-95 transition-transform"
          >
            Dmg
          </button>
          {(onEdit || onDelete) && (
```

Replace with:

```tsx
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRollDamage();
            }}
            className="px-2.5 py-1.5 bg-danger/20 text-danger rounded text-xs font-heading active:scale-95 transition-transform"
          >
            Dmg
          </button>
          {(onMoveUp || onMoveDown) && (
            <div className="flex flex-col gap-0.5">
              {onMoveUp && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp();
                  }}
                  className="text-muted hover:text-accent text-xs leading-none px-1"
                >
                  ▲
                </button>
              )}
              {onMoveDown && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown();
                  }}
                  className="text-muted hover:text-accent text-xs leading-none px-1"
                >
                  ▼
                </button>
              )}
            </div>
          )}
          {(onEdit || onDelete) && (
```

- [ ] **Step 3: Destructure `moveAttack` and wire the buttons in `CombatTab.tsx`**

Find:

```typescript
  const {
    character,
    update,
    updateCombat,
    updateResources,
    updateMeta,
    addAttack,
    updateAttack,
    removeAttack,
  } = useCharacterContext();
```

Replace with:

```typescript
  const {
    character,
    update,
    updateCombat,
    updateResources,
    updateMeta,
    addAttack,
    updateAttack,
    removeAttack,
    moveAttack,
  } = useCharacterContext();
```

Find:

```tsx
      <CollapsibleSection title="Acciones" defaultOpen>
        {attacks.map((a) => (
          <AttackRow
            key={a.id}
            attack={a}
            rageActive={rageActive}
            rageDamage={rageDamage}
            recklessActive={recklessActive}
            onEdit={() => setAttackModalState(a)}
            onDelete={() => {
              const index = attacks.findIndex((x) => x.id === a.id);
              removeAttack(a.id);
              toast(`${a.name} eliminado`, {
                action: {
                  label: "Deshacer",
                  onClick: () =>
                    update((c) => {
                      const next = [...c.attacks];
                      next.splice(index, 0, a);
                      return { ...c, attacks: next };
                    }),
                },
              });
            }}
          />
        ))}
```

Replace with:

```tsx
      <CollapsibleSection title="Acciones" defaultOpen>
        {attacks.map((a, i) => (
          <AttackRow
            key={a.id}
            attack={a}
            rageActive={rageActive}
            rageDamage={rageDamage}
            recklessActive={recklessActive}
            onEdit={() => setAttackModalState(a)}
            onDelete={() => {
              const index = attacks.findIndex((x) => x.id === a.id);
              removeAttack(a.id);
              toast(`${a.name} eliminado`, {
                action: {
                  label: "Deshacer",
                  onClick: () =>
                    update((c) => {
                      const next = [...c.attacks];
                      next.splice(index, 0, a);
                      return { ...c, attacks: next };
                    }),
                },
              });
            }}
            onMoveUp={i > 0 ? () => moveAttack(a.id, "up") : undefined}
            onMoveDown={
              i < attacks.length - 1 ? () => moveAttack(a.id, "down") : undefined
            }
          />
        ))}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS, 0 lint errors.

Manually verify in `npm run dev`: confirm the first attack in the list has no ▲ button (only ▼), the last attack has no ▼ button (only ▲), and every attack in between has both. Tap ▼ on the first attack, confirm it swaps with the second attack and the buttons update accordingly (now the (formerly-first, now-second) attack has both buttons).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCharacter.ts src/components/combat/AttackRow.tsx src/components/tabs/CombatTab.tsx
git commit -m "feat: add move-up/move-down attack reordering"
```

---

### Task 8: Density toggle infrastructure

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/storage.ts`
- Modify: `src/hooks/useTheme.ts`
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Produces: `AppSettings.density: "compact" | "spacious"`; `useTheme()` returns `{ theme, toggleTheme, density, toggleDensity }` (was `{ theme, toggleTheme }`) — `ThemeContextType` (`ReturnType<typeof useTheme>`, in `src/lib/context.ts`) picks up the new fields automatically, no changes needed there.
- Consumes: nothing from other tasks (this task sets up the value; Task 9 is the one that actually applies it to list styling).

**Context:** `AppSettings` isn't part of the versioned `Character` migration system, so this is a plain type addition — but `loadSettings()` currently does `raw ? JSON.parse(raw) : defaults`, meaning an *existing* stored settings blob predating this field would come back with `density` simply absent (not defaulted). Fixing `loadSettings()` to merge parsed data over defaults is good general hygiene, not just for this field.

- [ ] **Step 1: Add the field to `AppSettings`**

In `src/lib/types.ts`, find:

```typescript
export interface AppSettings {
  theme: "piedra-viva" | "dark-fantasy";
  lastCharacterId: string;
}
```

Replace with:

```typescript
export interface AppSettings {
  theme: "piedra-viva" | "dark-fantasy";
  lastCharacterId: string;
  density: "compact" | "spacious";
}
```

- [ ] **Step 2: Fix `loadSettings()` to merge defaults**

In `src/lib/storage.ts`, find:

```typescript
export function loadSettings(): AppSettings {
  if (typeof window === "undefined")
    return { theme: "piedra-viva", lastCharacterId: "mavok-1" };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw
      ? JSON.parse(raw)
      : { theme: "piedra-viva", lastCharacterId: "mavok-1" };
  } catch {
    return { theme: "piedra-viva", lastCharacterId: "mavok-1" };
  }
}
```

Replace with:

```typescript
export function loadSettings(): AppSettings {
  const defaults: AppSettings = {
    theme: "piedra-viva",
    lastCharacterId: "mavok-1",
    density: "spacious",
  };
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}
```

- [ ] **Step 3: Add `density`/`toggleDensity` to `useTheme.ts`**

Find:

```typescript
export function useTheme() {
  const [theme, setTheme] = useState<AppSettings["theme"]>("piedra-viva");

  useEffect(() => {
    const settings = loadSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: localStorage is unavailable during the static-export build's prerender pass, so this read must be deferred to after client mount.
    setTheme(settings.theme);
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next =
        prev === "piedra-viva" ? "dark-fantasy" : "piedra-viva";
      document.documentElement.setAttribute("data-theme", next);
      const settings = loadSettings();
      saveSettings({ ...settings, theme: next });
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
```

Replace with:

```typescript
export function useTheme() {
  const [theme, setTheme] = useState<AppSettings["theme"]>("piedra-viva");
  const [density, setDensity] = useState<AppSettings["density"]>("spacious");

  useEffect(() => {
    const settings = loadSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: localStorage is unavailable during the static-export build's prerender pass, so this read must be deferred to after client mount.
    setTheme(settings.theme);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
    setDensity(settings.density);
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next =
        prev === "piedra-viva" ? "dark-fantasy" : "piedra-viva";
      document.documentElement.setAttribute("data-theme", next);
      const settings = loadSettings();
      saveSettings({ ...settings, theme: next });
      return next;
    });
  }, []);

  const toggleDensity = useCallback(() => {
    setDensity((prev) => {
      const next = prev === "spacious" ? "compact" : "spacious";
      const settings = loadSettings();
      saveSettings({ ...settings, density: next });
      return next;
    });
  }, []);

  return { theme, toggleTheme, density, toggleDensity };
}
```

- [ ] **Step 4: Add the toggle UI in `SettingsTab.tsx`**

Find:

```typescript
  const { theme, toggleTheme } = useThemeContext();
```

Replace with:

```typescript
  const { theme, toggleTheme, density, toggleDensity } = useThemeContext();
```

Find:

```tsx
      {/* Theme */}
      <CollapsibleSection title="Tema" defaultOpen>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-3 bg-card rounded-lg border border-border"
        >
          <span className="text-sm">
            {theme === "piedra-viva" ? "Piedra Viva" : "Dark Fantasy"}
          </span>
          <span className="text-xs text-muted">Tap para cambiar</span>
        </button>
      </CollapsibleSection>
```

Replace with:

```tsx
      {/* Theme */}
      <CollapsibleSection title="Tema" defaultOpen>
        <div className="space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3 bg-card rounded-lg border border-border"
          >
            <span className="text-sm">
              {theme === "piedra-viva" ? "Piedra Viva" : "Dark Fantasy"}
            </span>
            <span className="text-xs text-muted">Tap para cambiar</span>
          </button>
          <button
            onClick={toggleDensity}
            className="w-full flex items-center justify-between p-3 bg-card rounded-lg border border-border"
          >
            <span className="text-sm">
              {density === "compact" ? "Compacto" : "Espacioso"}
            </span>
            <span className="text-xs text-muted">Tap para cambiar</span>
          </button>
        </div>
      </CollapsibleSection>
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS, 0 lint errors.

Manually verify in `npm run dev`: Settings → Tema → tap the new density button, confirm the label toggles between "Espacioso" and "Compacto," reload the page, confirm the choice persisted. Note that no list actually looks different yet — that's Task 9.

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/storage.ts src/hooks/useTheme.ts src/components/tabs/SettingsTab.tsx
git commit -m "feat: add global density toggle infrastructure"
```

---

### Task 9: Apply density across lists

**Files:**
- Modify: `src/components/tabs/InventoryTab.tsx`
- Modify: `src/components/notes/NoteList.tsx`
- Modify: `src/components/notes/QuestList.tsx`
- Modify: `src/components/notes/JournalList.tsx`
- Modify: `src/components/combat/AttackRow.tsx`

**Interfaces:**
- Consumes: `density` from `useThemeContext()` (Task 8).
- Produces: nothing consumed by other tasks (Task 10 touches `NoteList.tsx`, `QuestList.tsx`, `JournalList.tsx` again later, in the same rows but for a different, additive concern).

**Context:** Per the design spec's scope decision: "compact" reduces padding/gap only, it does not hide any content "spacious" shows.

- [ ] **Step 1: `InventoryTab.tsx`**

Find:

```typescript
import { useState } from "react";
import { useCharacterContext } from "@/lib/context";
```

Replace with:

```typescript
import { useState } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
```

Find:

```typescript
export function InventoryTab() {
  const {
    character,
    updateCurrency,
    addInventoryItem,
    removeInventoryItem,
    updateInventoryItem,
  } = useCharacterContext();
```

Replace with:

```typescript
export function InventoryTab() {
  const {
    character,
    updateCurrency,
    addInventoryItem,
    removeInventoryItem,
    updateInventoryItem,
  } = useCharacterContext();
  const { density } = useThemeContext();
```

Find:

```tsx
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer"
                  onClick={() =>
                    setExpandedItem(
                      expandedItem === item.id ? null : item.id
                    )
                  }
                >
```

Replace with:

```tsx
                <div
                  className={`flex items-center cursor-pointer ${density === "compact" ? "gap-2 p-1.5" : "gap-3 p-3"}`}
                  onClick={() =>
                    setExpandedItem(
                      expandedItem === item.id ? null : item.id
                    )
                  }
                >
```

- [ ] **Step 2: `NoteList.tsx`**

Find:

```typescript
import { useState, useEffect } from "react";
import { useCharacterContext } from "@/lib/context";
```

Replace with:

```typescript
import { useState, useEffect } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
```

Find:

```typescript
  const { character, addNote, updateNote, removeNote } =
    useCharacterContext();
```

Replace with:

```typescript
  const { character, addNote, updateNote, removeNote } =
    useCharacterContext();
  const { density } = useThemeContext();
```

Find:

```tsx
        <div
          key={note.id}
          onClick={() => openEdit(note)}
          className="stone-card rounded-lg p-3 cursor-pointer active:scale-[0.99] transition-transform"
        >
```

Replace with:

```tsx
        <div
          key={note.id}
          onClick={() => openEdit(note)}
          className={`stone-card rounded-lg cursor-pointer active:scale-[0.99] transition-transform ${density === "compact" ? "p-2" : "p-3"}`}
        >
```

- [ ] **Step 3: `QuestList.tsx`**

Find:

```typescript
import { useState, useEffect } from "react";
import { useCharacterContext } from "@/lib/context";
```

Replace with:

```typescript
import { useState, useEffect } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
```

Find:

```typescript
  const { character, addQuest, updateQuest, removeQuest } =
    useCharacterContext();
```

Replace with:

```typescript
  const { character, addQuest, updateQuest, removeQuest } =
    useCharacterContext();
  const { density } = useThemeContext();
```

Find:

```tsx
        <div
          key={quest.id}
          onClick={() => openEdit(quest)}
          className="stone-card rounded-lg p-3 cursor-pointer active:scale-[0.99] transition-transform"
        >
```

Replace with:

```tsx
        <div
          key={quest.id}
          onClick={() => openEdit(quest)}
          className={`stone-card rounded-lg cursor-pointer active:scale-[0.99] transition-transform ${density === "compact" ? "p-2" : "p-3"}`}
        >
```

- [ ] **Step 4: `JournalList.tsx`**

Find:

```typescript
import { useState } from "react";
import { useCharacterContext } from "@/lib/context";
```

Replace with:

```typescript
import { useState } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
```

Find:

```typescript
  const { character, addJournalEntry, updateJournalEntry, removeJournalEntry } =
    useCharacterContext();
```

Replace with:

```typescript
  const { character, addJournalEntry, updateJournalEntry, removeJournalEntry } =
    useCharacterContext();
  const { density } = useThemeContext();
```

Find:

```tsx
          <div
            key={entry.id}
            onClick={() => setViewingId(entry.id)}
            className="stone-card rounded-lg p-3 cursor-pointer active:scale-[0.99] transition-transform"
          >
```

Replace with:

```tsx
          <div
            key={entry.id}
            onClick={() => setViewingId(entry.id)}
            className={`stone-card rounded-lg cursor-pointer active:scale-[0.99] transition-transform ${density === "compact" ? "p-2" : "p-3"}`}
          >
```

- [ ] **Step 5: `AttackRow.tsx`**

Find:

```typescript
import { Sword, Target, Hammer } from "lucide-react";
```

Replace with:

```typescript
import { Sword, Target, Hammer } from "lucide-react";
import { useThemeContext } from "@/lib/context";
```

Find:

```typescript
  const [expanded, setExpanded] = useState(false);
  const [lastRoll, setLastRoll] = useState<{ roll: DiceRoll; type: "hit" | "damage" } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
```

Replace with:

```typescript
  const { density } = useThemeContext();
  const [expanded, setExpanded] = useState(false);
  const [lastRoll, setLastRoll] = useState<{ roll: DiceRoll; type: "hit" | "damage" } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
```

Find:

```tsx
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
```

Replace with:

```tsx
      <div
        className={`flex items-center justify-between cursor-pointer ${density === "compact" ? "p-2" : "p-3"}`}
        onClick={() => setExpanded(!expanded)}
      >
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS, 0 lint errors.

Manually verify in `npm run dev`: Settings → toggle density to "Compacto." Visit Inventory, Notes (Mundo/NPCs/Misiones/Diario), and Combat tabs, confirm each list's rows are visibly tighter (less padding) but show exactly the same information as before. Toggle back to "Espacioso," confirm rows return to their original spacing.

- [ ] **Step 7: Commit**

```bash
git add src/components/tabs/InventoryTab.tsx src/components/notes/NoteList.tsx src/components/notes/QuestList.tsx src/components/notes/JournalList.tsx src/components/combat/AttackRow.tsx
git commit -m "feat: apply density setting to Inventory, Notes, and Attacks lists"
```

---

### Task 10: Read-more expansion

**Files:**
- Modify: `src/components/notes/NoteList.tsx`
- Modify: `src/components/notes/QuestList.tsx`
- Modify: `src/components/notes/JournalList.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by other tasks.

**Context:** An inline "ver más" / "ver menos" toggle inside each list's truncated preview paragraph, independent of the row's existing tap-to-view/edit interaction (which still works via `e.stopPropagation()` on the new toggle button). Per the design spec's deliberate simplification, the toggle always appears when content is non-empty, regardless of whether it actually overflows two/three lines — detecting real overflow would need a `ResizeObserver`, which is more complexity than this feature is worth.

- [ ] **Step 1: `NoteList.tsx`**

Find:

```typescript
  const [newFieldKey, setNewFieldKey] = useState("");
```

Replace with:

```typescript
  const [newFieldKey, setNewFieldKey] = useState("");
  const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(
    new Set()
  );

  function togglePreview(id: string) {
    setExpandedPreviews((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
```

Find:

```tsx
          <h4 className="font-heading text-accent text-sm">{note.title}</h4>
          {note.content && (
            <p className="text-xs text-foreground/80 mt-1 line-clamp-2">
              {note.content}
            </p>
          )}
```

Replace with:

```tsx
          <h4 className="font-heading text-accent text-sm">{note.title}</h4>
          {note.content && (
            <>
              <p
                className={`text-xs text-foreground/80 mt-1 ${expandedPreviews.has(note.id) ? "" : "line-clamp-2"}`}
              >
                {note.content}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePreview(note.id);
                }}
                className="text-[0.65rem] text-accent mt-0.5"
              >
                {expandedPreviews.has(note.id) ? "ver menos" : "ver más"}
              </button>
            </>
          )}
```

- [ ] **Step 2: `QuestList.tsx`**

Find:

```typescript
  const [filter, setFilter] = useState<StatusFilter>("all");
```

Replace with:

```typescript
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(
    new Set()
  );

  function togglePreview(id: string) {
    setExpandedPreviews((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
```

Find:

```tsx
          {quest.givenBy && (
            <p className="text-xs text-muted mt-1">De: {quest.givenBy}</p>
          )}
          {quest.content && (
            <p className="text-xs text-foreground/80 mt-1 line-clamp-2">
              {quest.content}
            </p>
          )}
```

Replace with:

```tsx
          {quest.givenBy && (
            <p className="text-xs text-muted mt-1">De: {quest.givenBy}</p>
          )}
          {quest.content && (
            <>
              <p
                className={`text-xs text-foreground/80 mt-1 ${expandedPreviews.has(quest.id) ? "" : "line-clamp-2"}`}
              >
                {quest.content}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePreview(quest.id);
                }}
                className="text-[0.65rem] text-accent mt-0.5"
              >
                {expandedPreviews.has(quest.id) ? "ver menos" : "ver más"}
              </button>
            </>
          )}
```

- [ ] **Step 3: `JournalList.tsx`**

Find:

```typescript
  const [prevInitialOpenId, setPrevInitialOpenId] = useState(initialOpenId);
```

Replace with:

```typescript
  const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(
    new Set()
  );

  function togglePreview(id: string) {
    setExpandedPreviews((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const [prevInitialOpenId, setPrevInitialOpenId] = useState(initialOpenId);
```

Find:

```tsx
            {entry.content && (
              <p className="text-xs text-foreground/80 mt-2 line-clamp-3">
                {entry.content}
              </p>
            )}
```

Replace with:

```tsx
            {entry.content && (
              <>
                <p
                  className={`text-xs text-foreground/80 mt-2 ${expandedPreviews.has(entry.id) ? "" : "line-clamp-3"}`}
                >
                  {entry.content}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePreview(entry.id);
                  }}
                  className="text-[0.65rem] text-accent mt-0.5"
                >
                  {expandedPreviews.has(entry.id) ? "ver menos" : "ver más"}
                </button>
              </>
            )}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS, 0 lint errors.

Manually verify in `npm run dev`: in each of Notes (Mundo/NPCs), Misiones, and Diario, find an entry with content, tap "ver más," confirm the full text expands in place (no modal opens) and the label changes to "ver menos," tap it again to collapse. Confirm tapping elsewhere on the same card still opens the normal edit/view modal as before.

- [ ] **Step 5: Commit**

```bash
git add src/components/notes/NoteList.tsx src/components/notes/QuestList.tsx src/components/notes/JournalList.tsx
git commit -m "feat: add inline read-more expansion to note, quest, and journal previews"
```

---

### Task 11: Conditions quick-lookup

**Files:**
- Modify: `src/components/ui/Tag.tsx`
- Modify: `src/components/tabs/CombatTab.tsx`

**Interfaces:**
- Produces: `Tag` gains a new optional `onClick?: () => void` prop, applied to the label span (separate from the existing `onRemove?: () => void`, applied to the "✕" button). The two are sibling elements, so both work independently with no `stopPropagation` needed.
- Consumes: `CONDITIONS` from `@/data/conditions` (already has full XPHB `description` text for all 14 conditions — confirmed, no data gap).

- [ ] **Step 1: Add `onClick` to `Tag`**

In `src/components/ui/Tag.tsx`, find:

```tsx
export function Tag({
  label,
  onRemove,
  variant = "default",
}: {
  label: string;
  onRemove?: () => void;
  variant?: "default" | "success" | "danger";
}) {
  const colors = {
    default: "bg-accent/15 text-accent border border-accent/20",
    success: "bg-success/15 text-success border border-success/20",
    danger: "bg-danger/15 text-danger border border-danger/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded ${colors[variant]}`}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="opacity-60 hover:opacity-100 leading-none"
        >
          ✕
        </button>
      )}
    </span>
  );
}
```

Replace with:

```tsx
export function Tag({
  label,
  onRemove,
  onClick,
  variant = "default",
}: {
  label: string;
  onRemove?: () => void;
  onClick?: () => void;
  variant?: "default" | "success" | "danger";
}) {
  const colors = {
    default: "bg-accent/15 text-accent border border-accent/20",
    success: "bg-success/15 text-success border border-success/20",
    danger: "bg-danger/15 text-danger border border-danger/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded ${colors[variant]}`}
    >
      <span onClick={onClick} className={onClick ? "cursor-pointer" : undefined}>
        {label}
      </span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="opacity-60 hover:opacity-100 leading-none"
        >
          ✕
        </button>
      )}
    </span>
  );
}
```

- [ ] **Step 2: Wire the lookup in `CombatTab.tsx`**

Find:

```typescript
import { CONDITIONS } from "@/data/conditions";
```

Keep as-is (already imported) — no change needed to this line.

Find:

```typescript
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
```

Replace with:

```typescript
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [viewingCondition, setViewingCondition] = useState<string | null>(
    null
  );
```

Find:

```tsx
      {/* Conditions */}
      <div className="flex flex-wrap items-center gap-1.5">
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

Replace with:

```tsx
      {/* Conditions */}
      <div className="flex flex-wrap items-center gap-1.5">
        {combat.conditions.map((c) => (
          <Tag
            key={c}
            label={c}
            onClick={() => setViewingCondition(c)}
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

Find:

```tsx
      {/* Condition Selection Modal */}
      <Modal
        open={conditionModalOpen}
        onClose={() => setConditionModalOpen(false)}
        title="Agregar condición"
      >
```

Replace with:

```tsx
      {/* Condition Detail Modal */}
      <Modal
        open={viewingCondition !== null}
        onClose={() => setViewingCondition(null)}
        title={viewingCondition ?? ""}
      >
        <p className="text-sm text-foreground/80 leading-relaxed">
          {CONDITIONS.find((c) => c.name === viewingCondition)?.description}
        </p>
      </Modal>

      {/* Condition Selection Modal */}
      <Modal
        open={conditionModalOpen}
        onClose={() => setConditionModalOpen(false)}
        title="Agregar condición"
      >
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS, 0 lint errors.

Manually verify in `npm run dev`: add a condition (e.g. Poisoned) via the "+" button, confirm it appears as a tag. Tap the condition's label text (not the "✕"), confirm a modal opens showing its full XPHB description. Close it, confirm tapping "✕" still removes the condition with the existing undo toast.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Tag.tsx src/components/tabs/CombatTab.tsx
git commit -m "feat: add conditions quick-lookup to active condition tags"
```

---

### Task 12: One-page reference card export

**Files:**
- Modify: `src/app/print/page.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by other tasks.

**Context:** A `mode: "full" | "card"` toggle at the top of the existing `/print` page, hidden from the actual printed output via Tailwind's `print:` variant (confirmed supported — this project uses Tailwind v4). No new route.

- [ ] **Step 1: Add the mode state and toggle UI**

In `src/app/print/page.tsx`, find:

```tsx
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
```

Replace with:

```tsx
export default function PrintPage() {
  const { character } = useCharacter();
  const [mode, setMode] = useState<"full" | "card">("full");

  if (!character) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  const {
    meta,
    combat,
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
      <div className="print:hidden flex gap-2 mb-4 justify-center">
        <button
          onClick={() => setMode("full")}
          className={mode === "full" ? "font-bold underline" : ""}
        >
          Ficha completa
        </button>
        <button
          onClick={() => setMode("card")}
          className={mode === "card" ? "font-bold underline" : ""}
        >
          Tarjeta rápida
        </button>
      </div>

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

      {mode === "card" && (
        <>
          <section className="mb-6">
            <h2 className="text-lg font-bold mb-2 border-b border-black">
              Estado
            </h2>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div className="border border-black rounded p-1">
                <div className="text-xs uppercase">AC</div>
                <div className="font-bold text-lg">{combat.armorClass}</div>
              </div>
              <div className="border border-black rounded p-1">
                <div className="text-xs uppercase">HP</div>
                <div className="font-bold text-lg">
                  {combat.currentHp}/{combat.maxHp}
                </div>
              </div>
              <div className="border border-black rounded p-1">
                <div className="text-xs uppercase">Velocidad</div>
                <div className="font-bold text-lg">{combat.speed} ft</div>
              </div>
              <div className="border border-black rounded p-1">
                <div className="text-xs uppercase">Iniciativa</div>
                <div className="font-bold text-lg">
                  {formatModifier(combat.initiative)}
                </div>
              </div>
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold mb-2 border-b border-black">
              Salvaciones
            </h2>
            <div className="text-sm space-y-0.5">
              {ABILITIES.map((ab) => (
                <div key={ab} className="flex justify-between">
                  <span>
                    {savingThrows[ab]?.proficient ? "●" : "○"}{" "}
                    {abilityLabel(ab)}
                  </span>
                  <span>{formatModifier(saveTotal(character, ab))}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
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
        </>
      )}

      {mode === "full" && (
        <>
```

- [ ] **Step 2: Close the `mode === "full"` block and add the `useState` import**

Find (the very end of the file):

```tsx
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
```

Replace with:

```tsx
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
        </>
      )}
    </div>
  );
```

Find:

```typescript
"use client";

import { useCharacter } from "@/hooks/useCharacter";
```

Replace with:

```typescript
"use client";

import { useState } from "react";
import { useCharacter } from "@/hooks/useCharacter";
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS, 0 lint errors.

Manually verify in `npm run dev`: navigate to `/print`. Confirm "Ficha completa" is selected by default and shows the full existing sheet. Tap "Tarjeta rápida," confirm it shows only the header, a 4-box AC/HP/Speed/Initiative row, saving throws, and the attacks table — no skills, competencias, rasgos, or inventory sections. Open the browser's print preview (or use browser dev tools' print-emulation) and confirm the "Ficha completa / Tarjeta rápida" toggle buttons do not appear in the print preview.

- [ ] **Step 4: Commit**

```bash
git add src/app/print/page.tsx
git commit -m "feat: add one-page reference card mode to the print page"
```

---

## Final Verification

```bash
npx tsc --noEmit && npm run build && npm run lint
```

Expected: all PASS, **0 lint errors**, 2 pre-existing `@next/next/no-img-element` warnings only.
