# Mavok Round 4 Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the eight improvements from `docs/superpowers/specs/2026-07-02-mavok-round4-design.md` — a level-20 crash fix, custom attack management, journal editing, quest tags/NPC linking, structured-field search, an offline indicator, character portrait upload, and a level-up history log.

**Architecture:** Nine tasks. Tasks 1-6 are independent, pure UI/logic additions with no schema impact. Task 7 lays the shared data-model foundation (v3→v4 migration) that Tasks 8 and 9 depend on for the portrait and history-log fields respectively.

**Tech Stack:** Next.js 15 (App Router, static export), React 19, TypeScript, Tailwind CSS, `sonner` (toasts), browser Canvas API (portrait resize — no new dependency).

## Global Constraints

- Spanish UI labels, English D&D terms (existing convention).
- No test suite exists in this repo. Verify every task with `npx tsc --noEmit && npm run build && npm run lint` — lint is required, not optional (it's the only one of the three that catches React Hooks ordering violations).
- **All hooks must be called before any conditional early return** (e.g. `if (!character) return null;`) in every component this plan touches — this codebase has hit two real Rules-of-Hooks bugs from getting this wrong in prior rounds.
- Never include a "Co-authored-by" trailer in commit messages.
- `npm run lint` currently reports 8 pre-existing, documented errors in `RageTracker.tsx`, `JournalList.tsx`, `useCharacter.ts`, `useTheme.ts`, `SettingsTab.tsx` — known/accepted debt (see `CLAUDE.md`). Don't treat them as regressions; only investigate a lint failure that's new.
- Tasks 7-9 are the only ones touching the data model. `CURRENT_DATA_VERSION` goes from 3 to 4, covering both `CharacterMeta.portraitDataUrl` and `Character.levelUpHistory` in one migration — do not create two separate version bumps.

---

### Task 1: Level-20 crash fix

**Files:**
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by later tasks.

**Context:** `LevelUpFlow.tsx:55` computes `BARBARIAN_LEVELS[newLevel - 1]`. `BARBARIAN_LEVELS` (`src/data/barbarian-progression.ts`) has exactly 20 entries (levels 1-20, indices 0-19). At `newLevel = 21` (i.e. leveling up from 20), `BARBARIAN_LEVELS[20]` is `undefined`, and the wizard's "summary" step (`LevelUpFlow.tsx:400+`) and `applyAll()` (`LevelUpFlow.tsx:167+`) both dereference `.proficiencyBonus`/`.rages`/etc. off it, throwing a `TypeError`. **Both** "Subir de nivel" and "Dry Run ↑" buttons open this same wizard and reach the same crash point — `dryRun` only changes the modal's title and skips the final commit button, it does not skip any step.

- [ ] **Step 1: Guard both level-up buttons**

In `src/components/tabs/SettingsTab.tsx`, find:

```tsx
          <div className="flex gap-2 justify-center mt-3">
            <button
              onClick={() => {
                setLevelUpDryRun(false);
                setLevelUpOpen(true);
              }}
              className="px-5 py-2 bg-accent text-white rounded-lg font-heading text-sm active:scale-95 transition-transform"
            >
              Subir de nivel
            </button>
            <button
              onClick={() => {
                setLevelUpDryRun(true);
                setLevelUpOpen(true);
              }}
              className="px-5 py-2 border border-accent text-accent rounded-lg font-heading text-sm active:scale-95 transition-transform"
            >
              Dry Run ↑
            </button>
          </div>
```

Replace with:

```tsx
          {character.meta.level >= 20 ? (
            <p className="mt-3 text-sm text-muted">Nivel máximo alcanzado</p>
          ) : (
            <div className="flex gap-2 justify-center mt-3">
              <button
                onClick={() => {
                  setLevelUpDryRun(false);
                  setLevelUpOpen(true);
                }}
                className="px-5 py-2 bg-accent text-white rounded-lg font-heading text-sm active:scale-95 transition-transform"
              >
                Subir de nivel
              </button>
              <button
                onClick={() => {
                  setLevelUpDryRun(true);
                  setLevelUpOpen(true);
                }}
                className="px-5 py-2 border border-accent text-accent rounded-lg font-heading text-sm active:scale-95 transition-transform"
              >
                Dry Run ↑
              </button>
            </div>
          )}
```

The existing "Bajar de nivel" button (further down, guarded by `character.meta.level > 1`) is untouched by this step — level-down never indexes `BARBARIAN_LEVELS` past the character's current level.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/tabs/SettingsTab.tsx
git commit -m "fix: guard level-up buttons against crash at level 20"
```

---

### Task 2: Custom attack management

**Files:**
- Modify: `src/hooks/useCharacter.ts`
- Modify: `src/components/combat/AttackRow.tsx`
- Create: `src/components/combat/AttackFormModal.tsx`
- Modify: `src/components/tabs/CombatTab.tsx`

**Interfaces:**
- Produces: `addAttack(attack: Attack): void`, `updateAttack(attackId: string, patch: Partial<Attack>): void`, `removeAttack(attackId: string): void` on the character context. `AttackRow` gains two new optional props: `onEdit?: () => void`, `onDelete?: () => void`. `AttackFormModal` exports `{ open, onClose, onSave, existingAttack }: { open: boolean; onClose: () => void; onSave: (attack: Attack) => void; existingAttack?: Attack }`.
- Consumes: nothing from other tasks.

**Context:** `WeaponData.range` (`src/data/weapons.ts`) is `string | null` — 22 melee-only weapons have `range: null` — while `Attack.range` (`src/lib/types.ts`) is a non-nullable `string`. Quick-filling from a null-range weapon must fall back to `"5 ft"`. `AttackRow.tsx`'s outer row `<div>` has `onClick={() => setExpanded(!expanded)}`; its existing Hit/Dmg buttons call `e.stopPropagation()` to avoid also toggling that expand state — the new kebab button must do the same.

- [ ] **Step 1: Add attack CRUD functions to `useCharacter.ts`**

In `src/hooks/useCharacter.ts`, add `Attack` to the type import:

```typescript
import type {
  Character,
  InventoryItem,
  NoteEntry,
  QuestEntry,
  JournalEntry,
  Attack,
} from "@/lib/types";
```

Find:

```typescript
  const updateInventoryItem = useCallback(
    (itemId: string, patch: Partial<InventoryItem>) =>
      update((c) => ({
        ...c,
        inventory: c.inventory.map((i) =>
          i.id === itemId ? { ...i, ...patch } : i
        ),
      })),
    [update]
  );

  const addQuickNote = useCallback(
```

Replace with:

```typescript
  const updateInventoryItem = useCallback(
    (itemId: string, patch: Partial<InventoryItem>) =>
      update((c) => ({
        ...c,
        inventory: c.inventory.map((i) =>
          i.id === itemId ? { ...i, ...patch } : i
        ),
      })),
    [update]
  );

  const addAttack = useCallback(
    (attack: Attack) =>
      update((c) => ({ ...c, attacks: [...c.attacks, attack] })),
    [update]
  );

  const updateAttack = useCallback(
    (attackId: string, patch: Partial<Attack>) =>
      update((c) => ({
        ...c,
        attacks: c.attacks.map((a) =>
          a.id === attackId ? { ...a, ...patch } : a
        ),
      })),
    [update]
  );

  const removeAttack = useCallback(
    (attackId: string) =>
      update((c) => ({
        ...c,
        attacks: c.attacks.filter((a) => a.id !== attackId),
      })),
    [update]
  );

  const addQuickNote = useCallback(
```

Find the return object's `addInventoryItem,` line group and add the three new functions after `updateInventoryItem,`:

```typescript
    addInventoryItem,
    removeInventoryItem,
    updateInventoryItem,
    addQuickNote,
```

Replace with:

```typescript
    addInventoryItem,
    removeInventoryItem,
    updateInventoryItem,
    addAttack,
    updateAttack,
    removeAttack,
    addQuickNote,
```

- [ ] **Step 2: Create `AttackFormModal.tsx`**

Create `src/components/combat/AttackFormModal.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { WEAPONS } from "@/data/weapons";
import type { Attack } from "@/lib/types";

const EMPTY_FORM = {
  name: "",
  attackBonus: "0",
  damage: "",
  damageType: "",
  range: "5 ft",
  properties: "",
  mastery: "",
  masteryEffect: "",
  masterySaveDC: "",
};

export function AttackFormModal({
  open,
  onClose,
  onSave,
  existingAttack,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (attack: Attack) => void;
  existingAttack?: Attack;
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (existingAttack) {
      setForm({
        name: existingAttack.name,
        attackBonus: String(existingAttack.attackBonus),
        damage: existingAttack.damage,
        damageType: existingAttack.damageType,
        range: existingAttack.range,
        properties: existingAttack.properties.join(", "),
        mastery: existingAttack.mastery ?? "",
        masteryEffect: existingAttack.masteryEffect ?? "",
        masterySaveDC:
          existingAttack.masterySaveDC != null
            ? String(existingAttack.masterySaveDC)
            : "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [existingAttack, open]);

  function prefillFromWeapon(weaponName: string) {
    const w = WEAPONS.find((wp) => wp.name === weaponName);
    if (w) {
      setForm({
        ...form,
        name: w.name,
        damage: w.damage,
        damageType: w.damageType,
        properties: w.properties.join(", "),
        mastery: w.mastery ?? "",
        range: w.range ?? "5 ft",
      });
    }
  }

  function handleSave() {
    if (!form.name.trim() || !form.damage.trim()) return;
    const attack: Attack = {
      id: existingAttack?.id ?? `atk-${Date.now()}`,
      name: form.name.trim(),
      attackBonus: parseInt(form.attackBonus) || 0,
      damage: form.damage.trim(),
      damageType: form.damageType.trim(),
      range: form.range.trim() || "5 ft",
      properties: form.properties
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      mastery: form.mastery.trim() || null,
      masteryEffect: form.masteryEffect.trim() || null,
      masterySaveDC: form.masterySaveDC.trim()
        ? parseInt(form.masterySaveDC)
        : null,
    };
    onSave(attack);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existingAttack ? "Editar ataque" : "Nuevo ataque"}
    >
      <div className="space-y-3">
        {!existingAttack && (
          <div>
            <label className="text-xs text-muted">Arma rápida</label>
            <select
              onChange={(e) => {
                if (e.target.value) prefillFromWeapon(e.target.value);
                e.target.value = "";
              }}
              className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground mt-1"
              defaultValue=""
            >
              <option value="">Elegir arma...</option>
              {WEAPONS.map((w) => (
                <option key={w.name} value={w.name}>
                  {w.name} ({w.damage} {w.damageType})
                </option>
              ))}
            </select>
          </div>
        )}

        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nombre"
          className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
        />

        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={form.attackBonus}
            onChange={(e) =>
              setForm({ ...form, attackBonus: e.target.value })
            }
            placeholder="Bono de ataque"
            className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
          <input
            value={form.range}
            onChange={(e) => setForm({ ...form, range: e.target.value })}
            placeholder="Alcance (ej. 5 ft)"
            className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
        </div>

        <div className="flex gap-2">
          <input
            value={form.damage}
            onChange={(e) => setForm({ ...form, damage: e.target.value })}
            placeholder="Daño (ej. 1d6+3)"
            className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
          <input
            value={form.damageType}
            onChange={(e) =>
              setForm({ ...form, damageType: e.target.value })
            }
            placeholder="Tipo de daño"
            className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
        </div>

        <input
          value={form.properties}
          onChange={(e) => setForm({ ...form, properties: e.target.value })}
          placeholder="Propiedades (separadas por coma)"
          className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
        />

        <div className="flex gap-2">
          <input
            value={form.mastery}
            onChange={(e) => setForm({ ...form, mastery: e.target.value })}
            placeholder="Mastery (opcional)"
            className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
          <input
            type="number"
            inputMode="numeric"
            value={form.masterySaveDC}
            onChange={(e) =>
              setForm({ ...form, masterySaveDC: e.target.value })
            }
            placeholder="Mastery DC (opcional)"
            className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
        </div>

        <textarea
          value={form.masteryEffect}
          onChange={(e) =>
            setForm({ ...form, masteryEffect: e.target.value })
          }
          placeholder="Efecto de mastery (opcional)"
          rows={2}
          className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
        />

        <button
          onClick={handleSave}
          className="w-full py-3 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
        >
          {existingAttack ? "Guardar" : "Agregar"}
        </button>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 3: Add the kebab menu to `AttackRow.tsx`**

In `src/components/combat/AttackRow.tsx`, find:

```tsx
"use client";

import { useState, useCallback } from "react";
import type { Attack } from "@/lib/types";
import { rollD20, rollDice, type DiceRoll } from "@/lib/dice";
import { DiceResult } from "@/components/ui/DiceResult";

export function AttackRow({
  attack,
  rageActive,
  rageDamage,
}: {
  attack: Attack;
  rageActive: boolean;
  rageDamage: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [lastRoll, setLastRoll] = useState<{ roll: DiceRoll; type: "hit" | "damage" } | null>(null);
```

Replace with:

```tsx
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Attack } from "@/lib/types";
import { rollD20, rollDice, type DiceRoll } from "@/lib/dice";
import { DiceResult } from "@/components/ui/DiceResult";

export function AttackRow({
  attack,
  rageActive,
  rageDamage,
  onEdit,
  onDelete,
}: {
  attack: Attack;
  rageActive: boolean;
  rageDamage: number;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [lastRoll, setLastRoll] = useState<{ roll: DiceRoll; type: "hit" | "damage" } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleClickOutside);
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside);
  }, [menuOpen]);
```

Find:

```tsx
        <div className="flex gap-1.5 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRollHit();
            }}
            className="px-2.5 py-1.5 bg-accent/20 text-accent rounded text-xs font-heading active:scale-95 transition-transform"
          >
            Hit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRollDamage();
            }}
            className="px-2.5 py-1.5 bg-danger/20 text-danger rounded text-xs font-heading active:scale-95 transition-transform"
          >
            Dmg
          </button>
        </div>
```

Replace with:

```tsx
        <div className="flex gap-1.5 ml-2 items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRollHit();
            }}
            className="px-2.5 py-1.5 bg-accent/20 text-accent rounded text-xs font-heading active:scale-95 transition-transform"
          >
            Hit
          </button>
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
            <div
              className="relative"
              ref={menuOpen ? menuRef : undefined}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((m) => !m);
                }}
                className="text-muted hover:text-foreground text-sm px-1"
              >
                ⋯
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-6 bg-card border border-border rounded-lg shadow-lg z-10 py-1 w-32">
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit();
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-background"
                    >
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-danger hover:bg-background"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
```

- [ ] **Step 4: Wire up `CombatTab.tsx`**

In `src/components/tabs/CombatTab.tsx`, find:

```tsx
import { StandardActionsModal } from "@/components/combat/StandardActionsModal";
import { CONDITIONS } from "@/data/conditions";
```

Replace with:

```tsx
import { StandardActionsModal } from "@/components/combat/StandardActionsModal";
import { AttackFormModal } from "@/components/combat/AttackFormModal";
import { CONDITIONS } from "@/data/conditions";
```

Find:

```tsx
export function CombatTab() {
  const { character, updateCombat, updateResources, updateMeta } =
    useCharacterContext();
```

Replace with:

```tsx
export function CombatTab() {
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

Find:

```tsx
  const [stoneEnduranceEditing, setStoneEnduranceEditing] = useState(false);
  const [healerKitEditing, setHealerKitEditing] = useState(false);
  const stoneEnduranceLongPress = useLongPress(() =>
    setStoneEnduranceEditing(true)
  );
  const healerKitLongPress = useLongPress(() => setHealerKitEditing(true));
```

Replace with:

```tsx
  const [stoneEnduranceEditing, setStoneEnduranceEditing] = useState(false);
  const [healerKitEditing, setHealerKitEditing] = useState(false);
  const [attackModalState, setAttackModalState] = useState<
    "add" | Attack | null
  >(null);
  const stoneEnduranceLongPress = useLongPress(() =>
    setStoneEnduranceEditing(true)
  );
  const healerKitLongPress = useLongPress(() => setHealerKitEditing(true));
```

Add the `Attack` type import — find:

```tsx
import { CONDITIONS } from "@/data/conditions";
import { BARBARIAN_LEVELS } from "@/data/barbarian-progression";
```

Replace with:

```tsx
import { CONDITIONS } from "@/data/conditions";
import { BARBARIAN_LEVELS } from "@/data/barbarian-progression";
import type { Attack } from "@/lib/types";
```

Find:

```tsx
      {/* Actions */}
      <CollapsibleSection title="Acciones" defaultOpen>
        {attacks.map((a) => (
          <AttackRow
            key={a.id}
            attack={a}
            rageActive={rageActive}
            rageDamage={rageDamage}
          />
        ))}
```

Replace with:

```tsx
      {/* Actions */}
      <CollapsibleSection title="Acciones" defaultOpen>
        {attacks.map((a) => (
          <AttackRow
            key={a.id}
            attack={a}
            rageActive={rageActive}
            rageDamage={rageDamage}
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
        <button
          onClick={() => setAttackModalState("add")}
          className="w-full mt-2 p-2 rounded-lg border border-border/50 bg-card/50 text-left"
        >
          <span className="font-heading text-muted text-xs">
            + Agregar ataque
          </span>
        </button>
```

Finally, mount the modal — find:

```tsx
      <StandardActionsModal
        open={standardActionsOpen !== null}
        onClose={() => setStandardActionsOpen(null)}
        filter={standardActionsOpen ?? "actions"}
      />
    </div>
  );
}
```

Replace with:

```tsx
      <StandardActionsModal
        open={standardActionsOpen !== null}
        onClose={() => setStandardActionsOpen(null)}
        filter={standardActionsOpen ?? "actions"}
      />

      <AttackFormModal
        open={attackModalState !== null}
        onClose={() => setAttackModalState(null)}
        onSave={(attack) => {
          if (attackModalState && attackModalState !== "add") {
            updateAttack(attack.id, attack);
          } else {
            addAttack(attack);
          }
        }}
        existingAttack={
          attackModalState && attackModalState !== "add"
            ? attackModalState
            : undefined
        }
      />
    </div>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

- [ ] **Step 6: Manual check**

Run `npm run dev`, open the Combate tab:
- Tapping "+ Agregar ataque" opens the modal in create mode; picking a weapon from "Arma rápida" prefills name/damage/damageType/properties/mastery/range (verify a melee weapon with no ranged option still gets `"5 ft"` in the range field, not blank).
- Saving adds a new attack row.
- Tapping "⋯" on an attack row opens a small menu without also collapsing/expanding the row; "Editar" opens the modal pre-filled; "Eliminar" removes the row and shows an undo toast that restores it.
- Existing Hit/Dmg buttons and the row's own expand/collapse still work exactly as before.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useCharacter.ts src/components/combat/AttackRow.tsx src/components/combat/AttackFormModal.tsx src/components/tabs/CombatTab.tsx
git commit -m "feat: add custom attack management (add/edit/delete)"
```

---

### Task 3: Journal entry editing

**Files:**
- Modify: `src/hooks/useCharacter.ts`
- Modify: `src/components/notes/JournalList.tsx`

**Interfaces:**
- Produces: `updateJournalEntry(entryId: string, patch: Partial<JournalEntry>): void` on the character context.
- Consumes: nothing from other tasks.

**Context:** `JournalEntry` has no `updatedAt` field (unlike `NoteEntry`/`QuestEntry`) — nothing else needs touching on save besides `session`/`title`/`content`. `date` is never user-editable, matching the existing "New Entry" form's behavior.

- [ ] **Step 1: Add `updateJournalEntry` to `useCharacter.ts`**

Find:

```typescript
  const removeJournalEntry = useCallback(
    (entryId: string) =>
      update((c) => ({
        ...c,
        notes: {
          ...c.notes,
          journal: c.notes.journal.filter((j) => j.id !== entryId),
        },
      })),
    [update]
  );
```

Replace with:

```typescript
  const updateJournalEntry = useCallback(
    (entryId: string, patch: Partial<JournalEntry>) =>
      update((c) => ({
        ...c,
        notes: {
          ...c.notes,
          journal: c.notes.journal.map((j) =>
            j.id === entryId ? { ...j, ...patch } : j
          ),
        },
      })),
    [update]
  );

  const removeJournalEntry = useCallback(
    (entryId: string) =>
      update((c) => ({
        ...c,
        notes: {
          ...c.notes,
          journal: c.notes.journal.filter((j) => j.id !== entryId),
        },
      })),
    [update]
  );
```

Find:

```typescript
    addJournalEntry,
    removeJournalEntry,
  };
```

Replace with:

```typescript
    addJournalEntry,
    updateJournalEntry,
    removeJournalEntry,
  };
```

- [ ] **Step 2: Add edit mode to `JournalList.tsx`**

Find:

```tsx
export function JournalList({
  initialOpenId,
}: {
  initialOpenId?: string;
} = {}) {
  const { character, addJournalEntry, removeJournalEntry } =
    useCharacterContext();
  const [formOpen, setFormOpen] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    session: 1,
    title: "",
    content: "",
  });
```

Replace with:

```tsx
export function JournalList({
  initialOpenId,
}: {
  initialOpenId?: string;
} = {}) {
  const { character, addJournalEntry, updateJournalEntry, removeJournalEntry } =
    useCharacterContext();
  const [formOpen, setFormOpen] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    session: 1,
    title: "",
    content: "",
  });
  const [form, setForm] = useState({
    session: 1,
    title: "",
    content: "",
  });
```

Find:

```tsx
  function handleSave() {
    if (!form.title.trim()) return;
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      session: form.session,
      date: new Date().toISOString().slice(0, 10),
      title: form.title.trim(),
      content: form.content,
    };
    addJournalEntry(entry);
    setFormOpen(false);
  }
```

Replace with:

```tsx
  function handleSave() {
    if (!form.title.trim()) return;
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      session: form.session,
      date: new Date().toISOString().slice(0, 10),
      title: form.title.trim(),
      content: form.content,
    };
    addJournalEntry(entry);
    setFormOpen(false);
  }

  function startEdit() {
    if (!viewingEntry) return;
    setEditForm({
      session: viewingEntry.session,
      title: viewingEntry.title,
      content: viewingEntry.content,
    });
    setEditing(true);
  }

  function saveEdit() {
    if (!viewingEntry || !editForm.title.trim()) return;
    updateJournalEntry(viewingEntry.id, {
      session: editForm.session,
      title: editForm.title.trim(),
      content: editForm.content,
    });
    setEditing(false);
  }
```

Find:

```tsx
      {/* View Entry */}
      <Modal
        open={!!viewingEntry}
        onClose={() => setViewingId(null)}
        title={viewingEntry ? `Sesión ${viewingEntry.session}` : ""}
      >
        {viewingEntry && (
          <div className="space-y-3">
            <h3 className="font-heading text-accent">{viewingEntry.title}</h3>
            <p className="text-xs text-muted">{viewingEntry.date}</p>
            <p className="text-sm whitespace-pre-line">
              {viewingEntry.content}
            </p>
            <button
              onClick={() => {
                removeJournalEntry(viewingEntry.id);
                setViewingId(null);
              }}
              className="text-xs text-danger hover:underline"
            >
              Eliminar entrada
            </button>
          </div>
        )}
      </Modal>
```

Replace with:

```tsx
      {/* View/Edit Entry */}
      <Modal
        open={!!viewingEntry}
        onClose={() => {
          setViewingId(null);
          setEditing(false);
        }}
        title={viewingEntry ? `Sesión ${viewingEntry.session}` : ""}
      >
        {viewingEntry &&
          (editing ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="w-1/3">
                  <label className="text-xs text-muted">Sesión</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={editForm.session}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        session: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground mt-1"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted">Título</label>
                  <input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground mt-1"
                    autoFocus
                  />
                </div>
              </div>
              <textarea
                value={editForm.content}
                onChange={(e) =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
                rows={6}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2 text-sm border border-border rounded-lg text-muted"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 py-2 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
                >
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-heading text-accent">{viewingEntry.title}</h3>
              <p className="text-xs text-muted">{viewingEntry.date}</p>
              <p className="text-sm whitespace-pre-line">
                {viewingEntry.content}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={startEdit}
                  className="text-xs text-accent hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    removeJournalEntry(viewingEntry.id);
                    setViewingId(null);
                  }}
                  className="text-xs text-danger hover:underline"
                >
                  Eliminar entrada
                </button>
              </div>
            </div>
          ))}
      </Modal>
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

- [ ] **Step 4: Manual check**

Run `npm run dev`, open Notas → Diario, tap an existing entry, tap "Editar": fields become editable, "Guardar" persists changes and returns to view mode, "Cancelar" discards changes. Creating a new entry still works unchanged. `date` is never shown as an editable field in either flow.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCharacter.ts src/components/notes/JournalList.tsx
git commit -m "feat: add edit mode to journal entries"
```

---

### Task 4: Quest tags + NPC linking

**Files:**
- Modify: `src/components/notes/QuestList.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by later tasks (Task 5 reads `quest.tags`/`quest.givenBy` directly from stored data, not from anything this task exports as a function).

**Context:** `QuestEntry.tags: string[]` and `.givenBy: string` already exist and are already set on every quest (`tags: []`, `givenBy: form.givenBy` in the existing `addQuest` call) — this task only adds UI, no data model change.

- [ ] **Step 1: Add tags to quest form state and save logic**

Find:

```tsx
  const [form, setForm] = useState({
    title: "",
    content: "",
    givenBy: "",
    status: "active" as QuestEntry["status"],
  });
```

Replace with:

```tsx
  const [form, setForm] = useState({
    title: "",
    content: "",
    givenBy: "",
    tags: "",
    status: "active" as QuestEntry["status"],
  });
```

Find:

```tsx
  function openNew() {
    setForm({ title: "", content: "", givenBy: "", status: "active" });
    setEditingId(null);
    setFormOpen(true);
  }

  function openEdit(quest: QuestEntry) {
    setForm({
      title: quest.title,
      content: quest.content,
      givenBy: quest.givenBy,
      status: quest.status,
    });
    setEditingId(quest.id);
    setFormOpen(true);
  }
```

Replace with:

```tsx
  function openNew() {
    setForm({ title: "", content: "", givenBy: "", tags: "", status: "active" });
    setEditingId(null);
    setFormOpen(true);
  }

  function openEdit(quest: QuestEntry) {
    setForm({
      title: quest.title,
      content: quest.content,
      givenBy: quest.givenBy,
      tags: quest.tags.join(", "),
      status: quest.status,
    });
    setEditingId(quest.id);
    setFormOpen(true);
  }
```

Find:

```tsx
  function handleSave() {
    if (!form.title.trim()) return;
    const now = new Date().toISOString();

    if (editingId) {
      updateQuest(editingId, {
        title: form.title.trim(),
        content: form.content,
        givenBy: form.givenBy,
        status: form.status,
        updatedAt: now,
      });
    } else {
      addQuest({
        id: crypto.randomUUID(),
        title: form.title.trim(),
        content: form.content,
        tags: [],
        givenBy: form.givenBy,
        status: form.status,
        createdAt: now,
        updatedAt: now,
      });
    }
    setFormOpen(false);
  }
```

Replace with:

```tsx
  function handleSave() {
    if (!form.title.trim()) return;
    const now = new Date().toISOString();
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingId) {
      updateQuest(editingId, {
        title: form.title.trim(),
        content: form.content,
        givenBy: form.givenBy,
        tags,
        status: form.status,
        updatedAt: now,
      });
    } else {
      addQuest({
        id: crypto.randomUUID(),
        title: form.title.trim(),
        content: form.content,
        tags,
        givenBy: form.givenBy,
        status: form.status,
        createdAt: now,
        updatedAt: now,
      });
    }
    setFormOpen(false);
  }
```

- [ ] **Step 2: Render tags on the quest card**

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
        </div>
      ))}
```

Replace with:

```tsx
          {quest.givenBy && (
            <p className="text-xs text-muted mt-1">De: {quest.givenBy}</p>
          )}
          {quest.content && (
            <p className="text-xs text-foreground/80 mt-1 line-clamp-2">
              {quest.content}
            </p>
          )}
          {quest.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {quest.tags.map((t) => (
                <span
                  key={t}
                  className="text-[0.6rem] px-1.5 py-0.5 bg-background text-muted rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
```

- [ ] **Step 3: Add the tags input and `givenBy` NPC-name datalist to the form**

Find:

```tsx
          <input
            value={form.givenBy}
            onChange={(e) => setForm({ ...form, givenBy: e.target.value })}
            placeholder="Dada por..."
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Detalles"
            rows={4}
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
          />
```

Replace with:

```tsx
          <input
            list="npc-names"
            value={form.givenBy}
            onChange={(e) => setForm({ ...form, givenBy: e.target.value })}
            placeholder="Dada por..."
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
          <datalist id="npc-names">
            {character.notes.npcs.map((n) => (
              <option key={n.id} value={n.title} />
            ))}
          </datalist>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Detalles"
            rows={4}
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
          />
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="Tags (separados por coma)"
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

- [ ] **Step 5: Manual check**

Run `npm run dev`, open Notas → Misiones: create/edit a quest, add comma-separated tags, save, and confirm they render as small badges on the card. Create at least one NPC first, then start typing in "Dada por..." — confirm the NPC's name appears as an autocomplete suggestion, and confirm you can still type any arbitrary text (not restricted to existing NPCs).

- [ ] **Step 6: Commit**

```bash
git add src/components/notes/QuestList.tsx
git commit -m "feat: add tags and NPC-name autocomplete to quests"
```

---

### Task 5: Structured-field search (NPCs/World and Quests)

**Files:**
- Modify: `src/components/tabs/NotesTab.tsx`

**Interfaces:**
- Consumes: `quest.tags`/`quest.givenBy` data (already exists regardless of Task 4's UI — this task searches stored data, not UI state, so it has no hard dependency on Task 4, though testing it meaningfully benefits from Task 4's UI existing to create tagged quests).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Extend `computeSearchResults`**

Find:

```typescript
  for (const n of notes.world) {
    if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
      results.push({ id: n.id, section: "world", typeLabel: TYPE_LABELS.world, title: n.title });
    }
  }
  for (const n of notes.npcs) {
    if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
      results.push({ id: n.id, section: "npcs", typeLabel: TYPE_LABELS.npcs, title: n.title });
    }
  }
  for (const quest of notes.quests) {
    if (quest.title.toLowerCase().includes(q) || quest.content.toLowerCase().includes(q)) {
      results.push({ id: quest.id, section: "quests", typeLabel: TYPE_LABELS.quests, title: quest.title });
    }
  }
```

Replace with:

```typescript
  for (const n of notes.world) {
    const fieldsMatch = Object.values(n.fields ?? {}).some((v) =>
      v.toLowerCase().includes(q)
    );
    if (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      fieldsMatch
    ) {
      results.push({ id: n.id, section: "world", typeLabel: TYPE_LABELS.world, title: n.title });
    }
  }
  for (const n of notes.npcs) {
    const fieldsMatch = Object.values(n.fields ?? {}).some((v) =>
      v.toLowerCase().includes(q)
    );
    if (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      fieldsMatch
    ) {
      results.push({ id: n.id, section: "npcs", typeLabel: TYPE_LABELS.npcs, title: n.title });
    }
  }
  for (const quest of notes.quests) {
    const tagsMatch = quest.tags.join(" ").toLowerCase().includes(q);
    const givenByMatch = quest.givenBy.toLowerCase().includes(q);
    if (
      quest.title.toLowerCase().includes(q) ||
      quest.content.toLowerCase().includes(q) ||
      tagsMatch ||
      givenByMatch
    ) {
      results.push({ id: quest.id, section: "quests", typeLabel: TYPE_LABELS.quests, title: quest.title });
    }
  }
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

- [ ] **Step 3: Manual check**

Run `npm run dev`, open Notas: create an NPC with a value in the suggested "Ubicación" field (e.g. "Ciudad Alta") but nothing matching in title/content, search for "Ciudad Alta" — confirm the NPC shows up. Create a quest with a tag (e.g. "urgente") not present in its title/content, search for "urgente" — confirm the quest shows up. Search for an existing NPC's name after using it in a quest's "Dada por" field — confirm the quest also shows up via `givenBy` match.

- [ ] **Step 4: Commit**

```bash
git add src/components/tabs/NotesTab.tsx
git commit -m "feat: extend cross-note search to structured fields and quest tags"
```

---

### Task 6: Offline indicator

**Files:**
- Create: `src/components/OfflineBadge.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `OfflineBadge` — a self-contained component, no props.
- Consumes: nothing from other tasks.

- [ ] **Step 1: Create `OfflineBadge.tsx`**

Create `src/components/OfflineBadge.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";

export function OfflineBadge() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    function handleOnline() {
      setIsOffline(false);
    }
    function handleOffline() {
      setIsOffline(true);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-3 py-1 bg-card border border-border rounded-full text-xs text-muted shadow-lg">
      Sin conexión
    </div>
  );
}
```

- [ ] **Step 2: Mount it in `page.tsx`**

In `src/app/page.tsx`, add the import — find:

```tsx
import { SettingsTab } from "@/components/tabs/SettingsTab";
import { Toaster } from "sonner";
```

Replace with:

```tsx
import { SettingsTab } from "@/components/tabs/SettingsTab";
import { OfflineBadge } from "@/components/OfflineBadge";
import { Toaster } from "sonner";
```

Find:

```tsx
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--card)",
              color: "var(--fg)",
              border: "1px solid var(--border-color)",
              fontFamily: "var(--font-inter)",
            },
          }}
        />
        <div className="flex flex-col min-h-dvh">
```

Replace with:

```tsx
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--card)",
              color: "var(--fg)",
              border: "1px solid var(--border-color)",
              fontFamily: "var(--font-inter)",
            },
          }}
        />
        <OfflineBadge />
        <div className="flex flex-col min-h-dvh">
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

- [ ] **Step 4: Manual check**

Run `npm run dev`, open browser dev tools' network panel, toggle "Offline" — confirm the "Sin conexión" badge appears; toggle back online — confirm it disappears.

- [ ] **Step 5: Commit**

```bash
git add src/components/OfflineBadge.tsx src/app/page.tsx
git commit -m "feat: add offline indicator badge"
```

---

### Task 7: Data model v4 — portrait + level-up history fields

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/migrations.ts`
- Modify: `src/data/mavok-default.ts`

**Interfaces:**
- Produces: `CharacterMeta.portraitDataUrl: string | null`, `Character.levelUpHistory: LevelUpHistoryEntry[]`, `LevelUpHistoryEntry { level: number; date: string; asiChoice?: string; featChosen?: string }`, `CURRENT_DATA_VERSION = 4`. Tasks 8 and 9 consume these exact field names and types.
- Consumes: nothing from other tasks.

- [ ] **Step 1: Add the new fields to `types.ts`**

Find:

```typescript
export const CURRENT_DATA_VERSION = 3;

export interface Character {
  _version: number;
  id: string;
  meta: CharacterMeta;
  attributes: Record<AbilityScore, number>;
  combat: CombatState;
  resources: Resources;
  savingThrows: Record<AbilityScore, { proficient: boolean }>;
  skills: Record<string, { attribute: AbilityScore; proficient: boolean }>;
  proficiencies: Proficiencies;
  features: Feature[];
  attacks: Attack[];
  inventory: InventoryItem[];
  currency: Currency;
  notes: Notes;
}
```

Replace with:

```typescript
export const CURRENT_DATA_VERSION = 4;

export interface Character {
  _version: number;
  id: string;
  meta: CharacterMeta;
  attributes: Record<AbilityScore, number>;
  combat: CombatState;
  resources: Resources;
  savingThrows: Record<AbilityScore, { proficient: boolean }>;
  skills: Record<string, { attribute: AbilityScore; proficient: boolean }>;
  proficiencies: Proficiencies;
  features: Feature[];
  attacks: Attack[];
  inventory: InventoryItem[];
  currency: Currency;
  notes: Notes;
  levelUpHistory: LevelUpHistoryEntry[];
}

export interface LevelUpHistoryEntry {
  level: number;
  date: string;
  asiChoice?: string;
  featChosen?: string;
}
```

Find:

```typescript
export interface CharacterMeta {
  name: string;
  level: number;
  class: string;
  subclass: string | null;
  species: string;
  giantAncestry: string;
  background: string;
  originFeat: string;
  origin: string;
  age: number;
  proficiencyBonus: number;
  inspiration: boolean;
  appearance: string;
  personalityTrait: string;
  ideal: string;
  bond: string;
  flaw: string;
  backstory: string;
  goals: string[];
}
```

Replace with:

```typescript
export interface CharacterMeta {
  name: string;
  level: number;
  class: string;
  subclass: string | null;
  species: string;
  giantAncestry: string;
  background: string;
  originFeat: string;
  origin: string;
  age: number;
  proficiencyBonus: number;
  inspiration: boolean;
  appearance: string;
  personalityTrait: string;
  ideal: string;
  bond: string;
  flaw: string;
  backstory: string;
  goals: string[];
  portraitDataUrl: string | null;
}
```

- [ ] **Step 2: Add the v4 migration**

In `src/lib/migrations.ts`, find:

```typescript
      const hasStoneEndurance = features.some(f => f.name === "Stone's Endurance");
      if (!hasStoneEndurance) {
        features.push({
          name: "Stone's Endurance",
          source: "Goliath",
          description:
            `Reacción: cuando recibes daño, tira 1d12 y añade tu modificador de CON. ` +
            `Reduce el daño entrante por ese total. Usos: ${profBonus} por descanso largo.`,
          level: 1,
        });
      }
    }

    return d;
  },
};
```

Replace with:

```typescript
      const hasStoneEndurance = features.some(f => f.name === "Stone's Endurance");
      if (!hasStoneEndurance) {
        features.push({
          name: "Stone's Endurance",
          source: "Goliath",
          description:
            `Reacción: cuando recibes daño, tira 1d12 y añade tu modificador de CON. ` +
            `Reduce el daño entrante por ese total. Usos: ${profBonus} por descanso largo.`,
          level: 1,
        });
      }
    }

    return d;
  },

  4: (data) => {
    const d = data as Record<string, unknown>;
    d._version = 4;

    const meta = d.meta as Record<string, unknown> | undefined;
    if (meta && meta.portraitDataUrl === undefined) {
      meta.portraitDataUrl = null;
    }

    if (d.levelUpHistory === undefined) {
      d.levelUpHistory = [];
    }

    return d;
  },
};
```

- [ ] **Step 3: Update `mavok-default.ts`**

Find:

```typescript
    goals: [
      "Encontrar a Kraven Traegrano Toduk-Rojum.",
      "Conseguir comida, semillas o ayuda para Karrum-Barra.",
      "Descubrir por qué la tierra de su pueblo está enferma.",
      "Comprender o silenciar los susurros bajo el suelo.",
      "Proteger a Taruq y a su nueva familia de camino.",
    ],
  },
```

Replace with:

```typescript
    goals: [
      "Encontrar a Kraven Traegrano Toduk-Rojum.",
      "Conseguir comida, semillas o ayuda para Karrum-Barra.",
      "Descubrir por qué la tierra de su pueblo está enferma.",
      "Comprender o silenciar los susurros bajo el suelo.",
      "Proteger a Taruq y a su nueva familia de camino.",
    ],
    portraitDataUrl: null,
  },
```

Find:

```typescript
  currency: { cp: 0, sp: 0, ep: 0, gp: 30, pp: 0 },
  notes: { world: [], npcs: [], quests: [], journal: [], quick: [] },
};
```

Replace with:

```typescript
  currency: { cp: 0, sp: 0, ep: 0, gp: 30, pp: 0 },
  notes: { world: [], npcs: [], quests: [], journal: [], quick: [] },
  levelUpHistory: [],
};
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS. Type errors here would mean something in the codebase already assumes `Character`/`CharacterMeta` don't have these fields — if `tsc` fails, it's pointing at a place that needs updating (there shouldn't be any, since both fields are purely additive).

- [ ] **Step 5: Commit**

```bash
git add src/lib/types.ts src/lib/migrations.ts src/data/mavok-default.ts
git commit -m "feat: data model v4 — portraitDataUrl and levelUpHistory fields"
```

---

### Task 8: Character portrait upload

**Files:**
- Modify: `src/components/tabs/SettingsTab.tsx`
- Modify: `src/components/tabs/SheetTab.tsx`

**Interfaces:**
- Consumes: `CharacterMeta.portraitDataUrl: string | null` from Task 7. `updateMeta` (already exists on the character context).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the upload handler and UI to `SettingsTab.tsx`**

Find:

```tsx
export function SettingsTab() {
  const { character, update, updateCombat } = useCharacterContext();
  const { theme, toggleTheme } = useThemeContext();
  const [shortRestOpen, setShortRestOpen] = useState(false);
  const [longRestOpen, setLongRestOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    name: string;
    level: number;
    data: ReturnType<typeof JSON.parse>;
  } | null>(null);
  const [shortRestLog, setShortRestLog] = useState<string[]>([]);
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [levelUpDryRun, setLevelUpDryRun] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
```

Replace with:

```tsx
export function SettingsTab() {
  const { character, update, updateCombat, updateMeta } =
    useCharacterContext();
  const { theme, toggleTheme } = useThemeContext();
  const [shortRestOpen, setShortRestOpen] = useState(false);
  const [longRestOpen, setLongRestOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    name: string;
    level: number;
    data: ReturnType<typeof JSON.parse>;
  } | null>(null);
  const [shortRestLog, setShortRestLog] = useState<string[]>([]);
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [levelUpDryRun, setLevelUpDryRun] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portraitInputRef = useRef<HTMLInputElement>(null);
```

Find:

```tsx
  function confirmImport() {
    if (importPreview) {
      update(() => importPreview.data);
      setImportPreview(null);
    }
  }
```

Replace with:

```tsx
  function confirmImport() {
    if (importPreview) {
      update(() => importPreview.data);
      setImportPreview(null);
    }
  }

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

      {/* Portrait */}
      <CollapsibleSection title="Retrato">
        <div className="flex items-center gap-3">
          {character.meta.portraitDataUrl ? (
            <img
              src={character.meta.portraitDataUrl}
              alt="Retrato"
              className="w-16 h-16 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-16 h-16 rounded-full border border-border bg-card flex items-center justify-center text-muted text-[0.6rem] text-center">
              Sin foto
            </div>
          )}
          <button
            onClick={() => portraitInputRef.current?.click()}
            className="flex-1 p-3 bg-card rounded-lg border border-border text-left text-sm"
          >
            {character.meta.portraitDataUrl
              ? "Cambiar retrato"
              : "Subir retrato"}
          </button>
        </div>
        <input
          ref={portraitInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handlePortraitUpload(file);
            e.target.value = "";
          }}
        />
      </CollapsibleSection>
```

- [ ] **Step 2: Display the portrait in `SheetTab.tsx`'s header**

Find:

```tsx
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { DiceResult } from "@/components/ui/DiceResult";
```

Replace with:

```tsx
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { DiceResult } from "@/components/ui/DiceResult";
import { User } from "lucide-react";
```

Find:

```tsx
      {/* Header */}
      <div className="mb-6 cord-line pl-4">
        <div className="relative cord-knot">
          <h1 className="font-heading text-3xl text-accent font-bold tracking-wide">
            {meta.name}
          </h1>
        </div>
```

Replace with:

```tsx
      {/* Header */}
      <div className="mb-6 cord-line pl-4">
        <div className="relative cord-knot flex items-center gap-3">
          {meta.portraitDataUrl ? (
            <img
              src={meta.portraitDataUrl}
              alt={meta.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-accent shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full border-2 border-border bg-card flex items-center justify-center text-muted shrink-0">
              <User size={24} />
            </div>
          )}
          <h1 className="font-heading text-3xl text-accent font-bold tracking-wide">
            {meta.name}
          </h1>
        </div>
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

- [ ] **Step 4: Manual check**

Run `npm run dev`, open Ajustes → Retrato, upload a photo (ideally a non-square one, to confirm the center-crop): confirm the circular preview updates and the file input is cleared (uploading the same file again still triggers `onChange`, since `e.target.value = ""` resets it). Switch to Ficha — confirm the same portrait appears next to Mavok's name. With no portrait set (fresh character or after clearing), confirm the silhouette placeholder icon shows instead.

- [ ] **Step 5: Commit**

```bash
git add src/components/tabs/SettingsTab.tsx src/components/tabs/SheetTab.tsx
git commit -m "feat: add character portrait upload"
```

---

### Task 9: Level-up history log

**Files:**
- Modify: `src/components/levelup/LevelUpFlow.tsx`
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Consumes: `Character.levelUpHistory: LevelUpHistoryEntry[]` from Task 7.
- Produces: nothing consumed by later tasks.

**Context:** `applyAll()` never gets called in `dryRun` mode — the "Confirmar nivel" button that calls it is only rendered when `!dryRun` (the dry-run branch renders a "Cerrar preview" button that just closes without calling `applyAll`). So placing the history-append entirely inside `applyAll()` naturally means dry runs never pollute the history log — no extra `dryRun` check needed.

- [ ] **Step 1: Import `abilityLabelShort`**

In `src/components/levelup/LevelUpFlow.tsx`, find:

```typescript
import { abilityModifier, formatModifier, abilityLabel } from "@/lib/utils";
```

Replace with:

```typescript
import {
  abilityModifier,
  formatModifier,
  abilityLabel,
  abilityLabelShort,
} from "@/lib/utils";
```

- [ ] **Step 2: Append a history entry in `applyAll()`**

Find:

```typescript
      // Recalculate derived values
      updated = recalculateDerived(updated);

      return updated;
    });
```

Replace with:

```typescript
      // Recalculate derived values
      updated = recalculateDerived(updated);

      // Level-up history log
      const abilityIncreaseEntries = Object.entries(changes.abilityIncreases);
      const asiChoice =
        abilityIncreaseEntries.length > 0
          ? abilityIncreaseEntries
              .map(
                ([ab, inc]) =>
                  `${abilityLabelShort(ab as AbilityScore)} +${inc}`
              )
              .join(", ")
          : undefined;
      updated.levelUpHistory = [
        ...updated.levelUpHistory,
        {
          level: newLevel,
          date: new Date().toISOString(),
          asiChoice,
          featChosen: changes.feat?.name,
        },
      ];

      return updated;
    });
```

- [ ] **Step 3: Pop the last history entry on level-down**

In `src/components/tabs/SettingsTab.tsx`, find:

```tsx
                    prev.features = prev.features.filter(f => f.level <= prev.meta.level);
                    if (prev.meta.level < 3) prev.meta.subclass = null;
                    return prev;
```

Replace with:

```tsx
                    prev.features = prev.features.filter(f => f.level <= prev.meta.level);
                    if (prev.meta.level < 3) prev.meta.subclass = null;
                    prev.levelUpHistory = prev.levelUpHistory.slice(0, -1);
                    return prev;
```

- [ ] **Step 4: Add the history section to `SettingsTab.tsx`**

Find:

```tsx
          )}
        </div>
      </CollapsibleSection>

      {/* Import / Export */}
```

Replace with:

```tsx
          )}
        </div>
      </CollapsibleSection>

      {/* Level-up History */}
      <CollapsibleSection title="Historial de niveles">
        {character.levelUpHistory.length === 0 ? (
          <p className="text-xs text-muted text-center py-2">
            Sin historial todavía. Se registra cada vez que subes de nivel.
          </p>
        ) : (
          <div className="space-y-2">
            {character.levelUpHistory
              .slice()
              .reverse()
              .map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-card rounded-lg border border-border"
                >
                  <div>
                    <span className="text-sm font-heading text-accent">
                      Nivel {entry.level}
                    </span>
                    <span className="text-xs text-muted ml-2">
                      {new Date(entry.date).toLocaleDateString("es")}
                    </span>
                  </div>
                  <span className="text-xs text-muted">
                    {entry.asiChoice || entry.featChosen || "—"}
                  </span>
                </div>
              ))}
          </div>
        )}
      </CollapsibleSection>

      {/* Import / Export */}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

- [ ] **Step 6: Manual check**

Run `npm run dev`, open Ajustes: use "Dry Run ↑" — confirm no entry appears in "Historial de niveles" afterward. Use "Subir de nivel" for real (on a level that includes an ASI step, e.g. reaching level 4 from 3, or a level without one) — confirm a new entry appears at the top of the history showing the level, today's date, and the ASI/feat choice (or "—" if the level had no ASI step). Use "Bajar de nivel" — confirm the most recent history entry disappears again.

- [ ] **Step 7: Commit**

```bash
git add src/components/levelup/LevelUpFlow.tsx src/components/tabs/SettingsTab.tsx
git commit -m "feat: add level-up history log"
```

---

## Final Verification

After all 9 tasks:

```bash
npx tsc --noEmit && npm run build && npm run lint
```

Expected: all PASS, with only the 8 pre-existing, documented lint errors remaining (no new ones).
