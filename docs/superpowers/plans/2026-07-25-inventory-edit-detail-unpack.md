# Inventory Editing, Detail Fallback, and Pack Unpacking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user edit existing inventory items, see accurate item details even when the item's own `description` is empty, and "open" one of the 7 real 5etools adventuring-gear packs (Explorer's Pack, etc.) into its individual contents.

**Architecture:** A new `resolveItemDescription` helper falls back from an item's own (possibly empty) `description` to a matching `WEAPONS`/`ARMOR`/`GEAR` catalog entry. `extract-5etools.ts` gains a `packContents` field on `GearData`, sourced directly from 5etools' own structured pack-contents data (no prose parsing). A new `ItemFormModal` component (mirroring the existing `AttackFormModal` add/edit pattern exactly) replaces `InventoryTab.tsx`'s inline add-only form, gaining edit support for free. An "Abrir {pack}" button and confirmation `Modal` in `InventoryTab.tsx` turn a pack item into its contents via one atomic `update()` call.

**Tech Stack:** Next.js 15 (static export) / React 19 / TypeScript / Tailwind CSS 4 / Vitest. No new dependencies.

## Global Constraints

- Verify every task with `npx tsc --noEmit && npm run build && npm run lint && npm test` before committing — all four must pass (`CLAUDE.md`).
- `npm run lint` must report 0 errors.
- Never hand-edit `src/data/*.ts` — regenerate via `npx tsx scripts/extract-5etools.ts` after fixing the generator script.
- No `Character` schema changes, no migration — `GearData.packContents` is generated reference data, not part of `Character`.
- Spanish UI labels, English D&D terms.
- Commit messages: no "Co-authored-by" trailer.
- **Cross-plan dependency:** Task 3 below prefers to render the fallback description through `<Markdown>` (`src/components/ui/Markdown.tsx`), introduced by the separate `docs/superpowers/plans/2026-07-25-markdown-rendering.md` plan. Task 3's steps include both cases — check whether that file exists first, and follow whichever branch applies. This plan does not otherwise depend on that one.

---

### Task 1: `resolveItemDescription()` helper + unit tests

**Files:**
- Create: `src/lib/inventory.ts`
- Test: `src/lib/inventory.test.ts`

**Interfaces:**
- Produces: `resolveItemDescription(item: InventoryItem): string` — returns `item.description` if non-empty; otherwise looks up `item.name` in `WEAPONS`, then `ARMOR`, then `GEAR` (in that order) and returns a description derived from whichever catalog matches first, or `""` if none match.

- [ ] **Step 1: Write the failing tests**

```typescript
// src/lib/inventory.test.ts
import { describe, it, expect } from "vitest";
import { resolveItemDescription } from "./inventory";
import type { InventoryItem } from "./types";

const BASE_ITEM: InventoryItem = {
  id: "test-1",
  name: "",
  quantity: 1,
  weight: null,
  value: null,
  category: "gear",
  equipped: false,
  description: "",
  magicBonus: null,
  magicBonusTargets: [],
  magicAttackBonus: null,
  magicDamageBonus: null,
  baseWeaponName: null,
  grantedAction: null,
};

describe("resolveItemDescription", () => {
  it("returns the item's own description when set", () => {
    const item = { ...BASE_ITEM, name: "Anything", description: "Mi nota." };
    expect(resolveItemDescription(item)).toBe("Mi nota.");
  });

  it("falls back to a WEAPONS summary when description is empty", () => {
    const item = { ...BASE_ITEM, name: "Handaxe", description: "" };
    expect(resolveItemDescription(item)).toBe(
      "1d6 S · Light, Thrown · Mastery: Vex"
    );
  });

  it("falls back to an ARMOR summary when description is empty", () => {
    const item = { ...BASE_ITEM, name: "Leather Armor", description: "" };
    expect(resolveItemDescription(item)).toBe("AC 11");
  });

  it("falls back to the GEAR catalog description when description is empty", () => {
    const item = { ...BASE_ITEM, name: "Rope", description: "" };
    expect(resolveItemDescription(item)).toContain(
      "As a Utilize action, you can tie a knot with Rope"
    );
  });

  it("returns an empty string when nothing matches", () => {
    const item = {
      ...BASE_ITEM,
      name: "Nonexistent Item XYZ",
      description: "",
    };
    expect(resolveItemDescription(item)).toBe("");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- inventory.test.ts`
Expected: FAIL — `Cannot find module './inventory'`.

- [ ] **Step 3: Implement `resolveItemDescription`**

```typescript
// src/lib/inventory.ts
import { WEAPONS } from "@/data/weapons";
import { ARMOR } from "@/data/armor";
import { GEAR } from "@/data/gear";
import type { InventoryItem } from "./types";

export function resolveItemDescription(item: InventoryItem): string {
  if (item.description) return item.description;

  const weapon = WEAPONS.find((w) => w.name === item.name);
  if (weapon) {
    return `${weapon.damage} ${weapon.damageType} · ${weapon.properties.join(", ")}${weapon.mastery ? ` · Mastery: ${weapon.mastery}` : ""}`;
  }

  const armor = ARMOR.find((a) => a.name === item.name);
  if (armor) {
    return `AC ${armor.ac}${armor.stealthDisadvantage ? " · Desventaja en Sigilo" : ""}${armor.strengthRequirement ? ` · Requiere FUE ${armor.strengthRequirement}` : ""}`;
  }

  const gear = GEAR.find((g) => g.name === item.name);
  return gear?.description ?? "";
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- inventory.test.ts`
Expected: PASS, 5/5.

- [ ] **Step 5: Commit**

```bash
git add src/lib/inventory.ts src/lib/inventory.test.ts
git commit -m "feat: add resolveItemDescription fallback helper"
```

---

### Task 2: Extract structured `packContents` for adventuring-gear packs

**Files:**
- Modify: `scripts/extract-5etools.ts` (the `extractGear` function, lines ~172-199)
- Regenerate: `src/data/gear.ts`

**Context:** 5etools' raw `items.json` carries structured `packContents` for exactly 7 XPHB items (Burglar's Pack, Diplomat's Pack, Dungeoneer's Pack, Entertainer's Pack, Explorer's Pack, Priest's Pack, Scholar's Pack) plus Iron Spikes — confirmed directly against the source. Entries are a mix of bare ref strings (`"backpack|xphb"`, implying quantity 1) and `{item: "oil|xphb", quantity: 2}` objects. All referenced sub-item names were confirmed present in the extracted `GEAR` catalog by name.

**Interfaces:**
- Produces: `GearData.packContents: { name: string; quantity: number }[] | null` — every `GEAR` entry gets this field; `null` when the source item has no `packContents`.

- [ ] **Step 1: Extend `GearData` and `extractGear`**

Replace the entire `extractGear` function:
```typescript
// --- General Adventuring Gear ---
function extractGear() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "items.json"), "utf-8")
  );
  const gear = raw.item
    .filter(
      (i: Record<string, unknown>) =>
        i.source === "XPHB" && i.type === "G|XPHB"
    )
    .map((i: Record<string, unknown>) => ({
      name: i.name as string,
      weight: typeof i.weight === "number" ? i.weight : null,
      value: typeof i.value === "number" ? i.value / 100 : null,
      description: flattenEntries((i.entries as unknown[]) || []),
    }));

  const ts = `export interface GearData {
  name: string;
  weight: number | null;
  value: number | null;
  description: string;
}

export const GEAR: GearData[] = ${JSON.stringify(gear, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "gear.ts"), ts);
  console.log(`Gear: ${gear.length}`);
}
```
with:
```typescript
// --- General Adventuring Gear ---
function extractGear() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "items.json"), "utf-8")
  );

  // 5etools refs packContents entries as "name|source" (lowercased). Build a
  // lookup over every item in the file (not just XPHB gear) so refs to items
  // in other categories still resolve to their real display name.
  const itemsByRef = new Map<string, string>();
  for (const i of raw.item as Record<string, unknown>[]) {
    const name = i.name as string;
    const source = ((i.source as string) || "").toLowerCase();
    itemsByRef.set(`${name.toLowerCase()}|${source}`, name);
  }

  function resolvePackContents(
    packContents: unknown[] | undefined
  ): { name: string; quantity: number }[] | null {
    if (!packContents || packContents.length === 0) return null;
    return packContents.map((entry) => {
      if (typeof entry === "string") {
        return { name: itemsByRef.get(entry) ?? entry, quantity: 1 };
      }
      const obj = entry as { item: string; quantity: number };
      return {
        name: itemsByRef.get(obj.item) ?? obj.item,
        quantity: obj.quantity,
      };
    });
  }

  const gear = raw.item
    .filter(
      (i: Record<string, unknown>) =>
        i.source === "XPHB" && i.type === "G|XPHB"
    )
    .map((i: Record<string, unknown>) => ({
      name: i.name as string,
      weight: typeof i.weight === "number" ? i.weight : null,
      value: typeof i.value === "number" ? i.value / 100 : null,
      description: flattenEntries((i.entries as unknown[]) || []),
      packContents: resolvePackContents(
        i.packContents as unknown[] | undefined
      ),
    }));

  const ts = `export interface GearData {
  name: string;
  weight: number | null;
  value: number | null;
  description: string;
  packContents: { name: string; quantity: number }[] | null;
}

export const GEAR: GearData[] = ${JSON.stringify(gear, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "gear.ts"), ts);
  console.log(`Gear: ${gear.length}`);
}
```

- [ ] **Step 2: Re-run extraction**

Run: `npx tsx scripts/extract-5etools.ts`
Expected output: `Gear: 77` (unchanged count — this adds a field, it doesn't filter differently), all other counts unchanged too.

- [ ] **Step 3: Confirm the 7 packs (+ Iron Spikes) resolved correctly**

Run:
```bash
grep -A2 '"name": "Explorer'"'"'s Pack"' src/data/gear.ts
```
Expected: a `packContents` array containing `{ "name": "Backpack", "quantity": 1 }`, `{ "name": "Bedroll", "quantity": 1 }`, `{ "name": "Oil", "quantity": 2 }`, `{ "name": "Rations", "quantity": 10 }`, `{ "name": "Rope", "quantity": 1 }`, `{ "name": "Tinderbox", "quantity": 1 }`, `{ "name": "Torch", "quantity": 10 }`, `{ "name": "Waterskin", "quantity": 1 }` — no leftover `|xphb` suffixes or lowercase names.

Run:
```bash
grep -c 'packContents": \[' src/data/gear.ts
```
Expected: `8` (7 packs + Iron Spikes).

Run:
```bash
grep -c 'packContents": null' src/data/gear.ts
```
Expected: `69` (77 total gear items − 8 with contents).

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass — every other `GEAR` entry's `name`/`weight`/`value`/`description` is byte-identical to before, only the new field was added.

- [ ] **Step 5: Commit**

```bash
git add scripts/extract-5etools.ts src/data/gear.ts
git commit -m "feat: extract structured packContents for adventuring-gear packs"
```

---

### Task 3: Wire the description fallback into the inventory detail view

**Files:**
- Modify: `src/components/tabs/InventoryTab.tsx` (the expanded-item description block, currently:)
```tsx
                    {item.description && (
                      <p className="text-xs text-foreground/80">
                        {item.description}
                      </p>
                    )}
```

**Interfaces:**
- Consumes: `resolveItemDescription` from Task 1.

- [ ] **Step 1: Check whether the `Markdown` component exists yet**

Run: `test -f src/components/ui/Markdown.tsx && echo "exists" || echo "missing"`

If it prints **`missing`** (the separate markdown-rendering plan hasn't been implemented in this repo yet), replace the block with:
```tsx
                    {resolveItemDescription(item) && (
                      <p className="text-xs text-foreground/80 whitespace-pre-line">
                        {resolveItemDescription(item)}
                      </p>
                    )}
```
and add the import:
```tsx
import { resolveItemDescription } from "@/lib/inventory";
```

If it prints **`exists`**, replace the block with:
```tsx
                    {resolveItemDescription(item) && (
                      <Markdown className="text-xs text-foreground/80">
                        {resolveItemDescription(item)}
                      </Markdown>
                    )}
```
and add both imports:
```tsx
import { Markdown } from "@/components/ui/Markdown";
import { resolveItemDescription } from "@/lib/inventory";
```

Either way, `item.description` is no longer referenced directly at this call site — `resolveItemDescription(item)` replaces it, including for items that do have their own description (it returns `item.description` unchanged in that case, so no visible behavior change for those items).

- [ ] **Step 2: Manual check**

Run `npm run dev`, open Inventario, expand the Explorer's Pack (or any item you know has an empty `description`) — confirm it now shows the catalog's contents text instead of nothing. Expand an item with its own custom description (e.g. one of Mavok's personal items like "Cuerda roja trenzada") and confirm it's unchanged.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/tabs/InventoryTab.tsx
git commit -m "feat: fall back to catalog description when an item's own description is empty"
```

---

### Task 4: `ItemFormModal` component (add + edit)

**Files:**
- Create: `src/components/inventory/ItemFormModal.tsx`

**Interfaces:**
- Produces: `ItemFormModal({ open, onClose, item, onSave }: { open: boolean; onClose: () => void; item?: InventoryItem; onSave: (item: InventoryItem) => void })`. `item` present = edit mode (form pre-filled from it, catalog quick-fill selects hidden, title/button read "Editar"/"Guardar", saved item keeps `item.id` and `item.equipped`); `item` absent = add mode (identical to `InventoryTab.tsx`'s current inline form). The component calls `onSave(constructedItem)` then `onClose()` itself on save — it does not call `addInventoryItem`/`updateInventoryItem` directly; the caller decides what `onSave` does. This mirrors the existing `AttackFormModal` add/edit pattern exactly (`src/components/combat/AttackFormModal.tsx`), including its `syncKey` technique for resetting form state when the modal reopens for a different item without violating `react-hooks/set-state-in-effect` (see `CLAUDE.md`'s Key Constraints).

- [ ] **Step 1: Create the component**

```tsx
// src/components/inventory/ItemFormModal.tsx
"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { WEAPONS } from "@/data/weapons";
import { ARMOR } from "@/data/armor";
import { GEAR } from "@/data/gear";
import type { InventoryItem, GrantedAction } from "@/lib/types";

const CATEGORIES: { value: InventoryItem["category"]; label: string }[] = [
  { value: "weapon", label: "Arma" },
  { value: "armor", label: "Armadura" },
  { value: "gear", label: "Equipo" },
  { value: "consumable", label: "Consumible" },
  { value: "personal", label: "Personal" },
];

const EMPTY_FORM = {
  name: "",
  quantity: 1,
  weight: "",
  value: "",
  category: "gear" as InventoryItem["category"],
  description: "",
  magicBonus: "",
  magicBonusTargets: [] as ("ac" | "save")[],
  magicAttackBonus: "",
  magicDamageBonus: "",
  baseWeaponName: "",
  grantsAction: false,
  actionName: "",
  actionType: "action" as GrantedAction["actionType"],
  actionDescription: "",
  actionLimitedUses: false,
  actionTotalUses: "",
  actionRecharge: "long" as NonNullable<GrantedAction["charges"]>["recharge"],
};

function formFromItem(item: InventoryItem): typeof EMPTY_FORM {
  return {
    name: item.name,
    quantity: item.quantity,
    weight: item.weight !== null ? String(item.weight) : "",
    value: item.value !== null ? String(item.value) : "",
    category: item.category,
    description: item.description,
    magicBonus: item.magicBonus !== null ? String(item.magicBonus) : "",
    magicBonusTargets: [...item.magicBonusTargets],
    magicAttackBonus:
      item.magicAttackBonus !== null ? String(item.magicAttackBonus) : "",
    magicDamageBonus:
      item.magicDamageBonus !== null ? String(item.magicDamageBonus) : "",
    baseWeaponName: item.baseWeaponName ?? "",
    grantsAction: item.grantedAction !== null,
    actionName: item.grantedAction?.name ?? "",
    actionType: item.grantedAction?.actionType ?? "action",
    actionDescription: item.grantedAction?.description ?? "",
    actionLimitedUses: !!item.grantedAction?.charges,
    actionTotalUses: item.grantedAction?.charges
      ? String(item.grantedAction.charges.total)
      : "",
    actionRecharge: item.grantedAction?.charges?.recharge ?? "long",
  };
}

export function ItemFormModal({
  open,
  onClose,
  item,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  item?: InventoryItem;
  onSave: (item: InventoryItem) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  // Re-sync form state whenever the modal (re)opens for a different item (or
  // for "add"), without syncing state in an Effect — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const syncKey = open ? (item?.id ?? "add") : undefined;
  const [lastSyncKey, setLastSyncKey] = useState(syncKey);
  if (syncKey !== lastSyncKey) {
    setLastSyncKey(syncKey);
    setForm(item ? formFromItem(item) : EMPTY_FORM);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    const magicBonus = form.magicBonus ? parseInt(form.magicBonus) : 0;
    const magicAttackBonus = form.magicAttackBonus
      ? parseInt(form.magicAttackBonus)
      : 0;
    const magicDamageBonus = form.magicDamageBonus
      ? parseInt(form.magicDamageBonus)
      : 0;
    const totalUses = form.actionTotalUses
      ? parseInt(form.actionTotalUses)
      : 0;
    const existingCharges = item?.grantedAction?.charges;
    const grantedAction: GrantedAction | null =
      form.grantsAction && form.actionName.trim()
        ? {
            name: form.actionName.trim(),
            actionType: form.actionType,
            description: form.actionDescription,
            charges:
              form.actionLimitedUses && totalUses > 0
                ? {
                    total: totalUses,
                    // Preserve remaining charges across an edit (clamped to
                    // the new total) instead of resetting an in-progress
                    // item back to full charges just because it was edited.
                    remaining: existingCharges
                      ? Math.min(existingCharges.remaining, totalUses)
                      : totalUses,
                    recharge: form.actionRecharge,
                  }
                : null,
          }
        : null;
    const saved: InventoryItem = {
      id: item?.id ?? `inv-${Date.now()}`,
      name: form.name.trim(),
      quantity: form.quantity,
      weight: form.weight ? parseFloat(form.weight) : null,
      value: form.value ? parseFloat(form.value) : null,
      category: form.category,
      equipped: item?.equipped ?? false,
      description: form.description,
      magicBonus: magicBonus ? magicBonus : null,
      magicBonusTargets: magicBonus ? form.magicBonusTargets : [],
      magicAttackBonus: magicAttackBonus ? magicAttackBonus : null,
      magicDamageBonus: magicDamageBonus ? magicDamageBonus : null,
      baseWeaponName: form.baseWeaponName.trim() || null,
      grantedAction,
    };
    onSave(saved);
    onClose();
  }

  function toggleMagicBonusTarget(target: "ac" | "save") {
    setForm((prev) => ({
      ...prev,
      magicBonusTargets: prev.magicBonusTargets.includes(target)
        ? prev.magicBonusTargets.filter((t) => t !== target)
        : [...prev.magicBonusTargets, target],
    }));
  }

  function prefillFromWeapon(weaponName: string) {
    const w = WEAPONS.find((wp) => wp.name === weaponName);
    if (w) {
      setForm({
        ...form,
        name: w.name,
        weight: String(w.weight),
        value: w.value !== null ? String(w.value) : "",
        category: "weapon",
        description: `${w.damage} ${w.damageType} · ${w.properties.join(", ")}${w.mastery ? ` · Mastery: ${w.mastery}` : ""}`,
      });
    }
  }

  function prefillFromArmor(armorName: string) {
    const a = ARMOR.find((ar) => ar.name === armorName);
    if (a) {
      setForm({
        ...form,
        name: a.name,
        weight: String(a.weight),
        value: a.value !== null ? String(a.value) : "",
        category: "armor",
        description: `AC ${a.ac}${a.stealthDisadvantage ? " · Desventaja en Sigilo" : ""}${a.strengthRequirement ? ` · Requiere FUE ${a.strengthRequirement}` : ""}`,
      });
    }
  }

  function prefillFromGear(gearName: string) {
    const g = GEAR.find((ge) => ge.name === gearName);
    if (g) {
      setForm({
        ...form,
        name: g.name,
        weight: g.weight !== null ? String(g.weight) : "",
        value: g.value !== null ? String(g.value) : "",
        category: "gear",
        description: g.description,
      });
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? "Editar objeto" : "Agregar objeto"}
    >
      <div className="space-y-3">
        {!item && (
          <>
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

            <div>
              <label className="text-xs text-muted">Armadura rápida</label>
              <select
                onChange={(e) => {
                  if (e.target.value) prefillFromArmor(e.target.value);
                  e.target.value = "";
                }}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground mt-1"
                defaultValue=""
              >
                <option value="">Elegir armadura...</option>
                {ARMOR.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name} (AC {a.ac})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted">Equipo rápido</label>
              <select
                onChange={(e) => {
                  if (e.target.value) prefillFromGear(e.target.value);
                  e.target.value = "";
                }}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground mt-1"
                defaultValue=""
              >
                <option value="">Elegir equipo...</option>
                {GEAR.map((g) => (
                  <option key={g.name} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </>
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
            value={form.quantity}
            onChange={(e) =>
              setForm({
                ...form,
                quantity: parseInt(e.target.value) || 1,
              })
            }
            placeholder="Cantidad"
            className="w-1/3 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
          <input
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
            placeholder="Peso (lb)"
            className="w-1/3 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
          <input
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            placeholder="Valor (gp)"
            className="w-1/3 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
        </div>

        <select
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value as InventoryItem["category"],
            })
          }
          className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descripción (opcional)"
          rows={2}
          className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
        />

        <input
          type="number"
          value={form.magicBonus}
          onChange={(e) => setForm({ ...form, magicBonus: e.target.value })}
          placeholder="Bono mágico a CA/Salvaciones (opcional, ej. 1 o -1)"
          className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
        />

        {form.magicBonus && parseInt(form.magicBonus) !== 0 && (
          <div>
            <label className="text-xs text-muted">Aplica a</label>
            <div className="flex gap-3 mt-1">
              {(
                [
                  { value: "ac", label: "CA" },
                  { value: "save", label: "Salvaciones" },
                ] as const
              ).map((t) => (
                <label
                  key={t.value}
                  className="flex items-center gap-1.5 text-xs text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={form.magicBonusTargets.includes(t.value)}
                    onChange={() => toggleMagicBonusTarget(t.value)}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="number"
            value={form.magicAttackBonus}
            onChange={(e) =>
              setForm({ ...form, magicAttackBonus: e.target.value })
            }
            placeholder="Bono de ataque (opcional)"
            className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
          <input
            type="number"
            value={form.magicDamageBonus}
            onChange={(e) =>
              setForm({ ...form, magicDamageBonus: e.target.value })
            }
            placeholder="Bono de daño (opcional)"
            className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
        </div>
        <p className="text-[0.65rem] text-muted -mt-1">
          {form.category === "weapon"
            ? "En un objeto de categoría Arma, aplica solo a esa arma. En cualquier otra categoría (anillo, capa, etc.), aplica a todos tus ataques."
            : "Aplica a todos tus ataques (no está atado a un arma específica)."}
        </p>

        {form.category === "weapon" &&
          (!!form.magicAttackBonus || !!form.magicDamageBonus) && (
            <select
              value={form.baseWeaponName}
              onChange={(e) =>
                setForm({ ...form, baseWeaponName: e.target.value })
              }
              className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            >
              <option value="">
                Vincular a arma del catálogo (si el nombre no coincide)...
              </option>
              {WEAPONS.map((w) => (
                <option key={w.name} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>
          )}

        <label className="flex items-center gap-1.5 text-xs text-foreground">
          <input
            type="checkbox"
            checked={form.grantsAction}
            onChange={(e) =>
              setForm({ ...form, grantsAction: e.target.checked })
            }
          />
          Otorga una acción especial (opcional)
        </label>

        {form.grantsAction && (
          <div className="space-y-2 pl-2 border-l border-border">
            <input
              value={form.actionName}
              onChange={(e) =>
                setForm({ ...form, actionName: e.target.value })
              }
              placeholder="Nombre de la acción"
              className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            />
            <select
              value={form.actionType}
              onChange={(e) =>
                setForm({
                  ...form,
                  actionType: e.target.value as GrantedAction["actionType"],
                })
              }
              className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            >
              <option value="action">Acción</option>
              <option value="bonus">Bonus Action</option>
              <option value="reaction">Reacción</option>
            </select>
            <textarea
              value={form.actionDescription}
              onChange={(e) =>
                setForm({ ...form, actionDescription: e.target.value })
              }
              placeholder="Descripción del efecto"
              rows={2}
              className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
            />
            <label className="flex items-center gap-1.5 text-xs text-foreground">
              <input
                type="checkbox"
                checked={form.actionLimitedUses}
                onChange={(e) =>
                  setForm({
                    ...form,
                    actionLimitedUses: e.target.checked,
                  })
                }
              />
              Usos limitados
            </label>
            {form.actionLimitedUses && (
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.actionTotalUses}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      actionTotalUses: e.target.value,
                    })
                  }
                  placeholder="Total de usos"
                  className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
                />
                <select
                  value={form.actionRecharge}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      actionRecharge: e.target
                        .value as NonNullable<GrantedAction["charges"]>["recharge"],
                    })
                  }
                  className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
                >
                  <option value="short">Descanso corto</option>
                  <option value="long">Descanso largo</option>
                  <option value="none">Sin recarga</option>
                </select>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full py-3 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
        >
          {item ? "Guardar" : "Agregar"}
        </button>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors. (The component isn't used anywhere yet, so `npm run build`/`lint` should also pass but won't exercise it — that happens in Task 6.)

- [ ] **Step 3: Commit**

```bash
git add src/components/inventory/ItemFormModal.tsx
git commit -m "feat: add ItemFormModal component with add/edit support"
```

---

### Task 5: "Abrir kit" — pack-unpacking feature

**Files:**
- Modify: `src/components/tabs/InventoryTab.tsx`

**Interfaces:**
- Consumes: `GEAR` (already imported), specifically `GEAR.find((g) => g.name === item.name)?.packContents` from Task 2.
- Produces: nothing new for other tasks.

**Context:** This task runs before Task 6 (which removes the old inline add-form's only other use of `GEAR`) so that `GEAR` stays a validly-used import throughout — this task adds a new use of it before Task 6 removes the old one.

- [ ] **Step 1: Add `unpackingItem` state and the `packContentsFor`/`handleUnpack` helpers**

Find this block in `InventoryTab.tsx`:
```tsx
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
```
Replace it with:
```tsx
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [unpackingItem, setUnpackingItem] = useState<InventoryItem | null>(
    null
  );
```

Find this block (right after `toggleEquipped`'s closing brace, before `toggleCategory`):
```tsx
  function toggleCategory(cat: InventoryItem["category"]) {
```
Insert immediately before it:
```tsx
  function packContentsFor(
    item: InventoryItem
  ): { name: string; quantity: number }[] | null {
    return GEAR.find((g) => g.name === item.name)?.packContents ?? null;
  }

  function handleUnpack(item: InventoryItem) {
    const contents = packContentsFor(item);
    if (!contents) return;
    update((c) => {
      let nextInventory = c.inventory.map((i) =>
        i.id === item.id && i.quantity > 1
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
      if (item.quantity <= 1) {
        nextInventory = nextInventory.filter((i) => i.id !== item.id);
      }
      for (const content of contents) {
        const existingIndex = nextInventory.findIndex(
          (i) => i.name === content.name
        );
        if (existingIndex !== -1) {
          nextInventory = nextInventory.map((i, idx) =>
            idx === existingIndex
              ? { ...i, quantity: i.quantity + content.quantity }
              : i
          );
        } else {
          const catalogEntry = GEAR.find((g) => g.name === content.name);
          nextInventory = [
            ...nextInventory,
            {
              id: crypto.randomUUID(),
              name: content.name,
              quantity: content.quantity,
              weight: catalogEntry?.weight ?? null,
              value: catalogEntry?.value ?? null,
              category: "gear",
              equipped: false,
              description: "",
              magicBonus: null,
              magicBonusTargets: [],
              magicAttackBonus: null,
              magicDamageBonus: null,
              baseWeaponName: null,
              grantedAction: null,
            },
          ];
        }
      }
      return { ...c, inventory: nextInventory };
    });
    toast(`${item.name} abierto`, { icon: "📦" });
    setUnpackingItem(null);
  }

```
(`update` is already destructured from `useCharacterContext()` at the top of the component — confirm it's there; it is, used by `toggleEquipped`.)

- [ ] **Step 2: Add the "Abrir" button to the expanded item view**

Find:
```tsx
                    {item.grantedAction && (
                      <p className="text-xs text-accent">
                        {item.grantedAction.name} (
                        {item.grantedAction.actionType === "action"
                          ? "Acción"
                          : item.grantedAction.actionType === "bonus"
                            ? "Bonus Action"
                            : "Reacción"}
                        {item.grantedAction.charges
                          ? ` · ${item.grantedAction.charges.remaining}/${item.grantedAction.charges.total} usos`
                          : ""}
                        )
                      </p>
                    )}
                    <div className="flex gap-2">
```
Replace with:
```tsx
                    {item.grantedAction && (
                      <p className="text-xs text-accent">
                        {item.grantedAction.name} (
                        {item.grantedAction.actionType === "action"
                          ? "Acción"
                          : item.grantedAction.actionType === "bonus"
                            ? "Bonus Action"
                            : "Reacción"}
                        {item.grantedAction.charges
                          ? ` · ${item.grantedAction.charges.remaining}/${item.grantedAction.charges.total} usos`
                          : ""}
                        )
                      </p>
                    )}
                    {packContentsFor(item) && (
                      <button
                        onClick={() => setUnpackingItem(item)}
                        className="text-xs text-accent border border-accent/30 rounded-lg px-3 py-1.5 hover:bg-accent/10"
                      >
                        Abrir {item.name}
                      </button>
                    )}
                    <div className="flex gap-2">
```

- [ ] **Step 3: Add the unpack confirmation Modal**

Find (near the end of the file, the old Add Item Modal's closing tag followed by `AttackFormModal`):
```tsx
        </div>
      </Modal>

      <AttackFormModal
```
Replace with:
```tsx
        </div>
      </Modal>

      {/* Unpack Confirmation Modal */}
      <Modal
        open={!!unpackingItem}
        onClose={() => setUnpackingItem(null)}
        title={`Abrir ${unpackingItem?.name ?? ""}`}
      >
        {unpackingItem &&
          (() => {
            const contents = packContentsFor(unpackingItem);
            if (!contents) return null;
            return (
              <div className="space-y-3">
                <p className="text-sm text-foreground/80">Se agregará:</p>
                <ul className="text-sm text-foreground/80 list-disc pl-4 space-y-0.5">
                  {contents.map((c) => (
                    <li key={c.name}>
                      {c.quantity > 1 ? `${c.quantity}× ` : ""}
                      {c.name}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted">
                  {unpackingItem.quantity > 1
                    ? `${unpackingItem.name} bajará a ${unpackingItem.quantity - 1}.`
                    : `${unpackingItem.name} se eliminará del inventario.`}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUnpackingItem(null)}
                    className="flex-1 py-2 text-sm border border-border rounded-lg text-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleUnpack(unpackingItem)}
                    className="flex-1 py-2 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
                  >
                    Abrir
                  </button>
                </div>
              </div>
            );
          })()}
      </Modal>

      <AttackFormModal
```

- [ ] **Step 4: Manual check**

Run `npm run dev`, open Inventario, expand Explorer's Pack, tap "Abrir Explorer's Pack" — confirm the confirmation modal lists all 8 contents with correct quantities and the "se eliminará" message (Mavok's default has quantity 1). Confirm, and check: the pack row is gone, and Backpack/Bedroll/Oil (×2)/Rations (×10)/Rope/Tinderbox/Torch (×10)/Waterskin all appear (or had their quantities incremented, if any already existed — Mavok's defaults don't currently have any of these, so all 8 should appear as new rows). Add a second Explorer's Pack via the add form, open it again, confirm the previously-added contents get their quantities bumped instead of duplicating.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/tabs/InventoryTab.tsx
git commit -m "feat: add pack-opening to Inventario"
```

---

### Task 6: Wire `ItemFormModal` into Inventario (editing + remove the old inline form)

**Files:**
- Modify: `src/components/tabs/InventoryTab.tsx`

**Interfaces:**
- Consumes: `ItemFormModal` from Task 4.

**Context:** This removes `InventoryTab.tsx`'s entire inline add-item form (state, handlers, and JSX) and replaces it with two `ItemFormModal` usages (add and edit). It also removes the `ARMOR` import and the `GrantedAction` type import, both of which become unused once the inline form's `newItem`-handling code is gone (their only other uses were inside that code). `GEAR` and `WEAPONS` stay imported — `GEAR` is used by Task 5's `packContentsFor`/`handleUnpack` (already in place from the previous task) and `WEAPONS` by the existing `toggleEquipped`.

- [ ] **Step 1: Update imports**

Replace:
```tsx
import { WEAPONS } from "@/data/weapons";
import { ARMOR } from "@/data/armor";
import { GEAR } from "@/data/gear";
import { recalculateDerived } from "@/lib/recalculate";
```
with:
```tsx
import { WEAPONS } from "@/data/weapons";
import { GEAR } from "@/data/gear";
import { recalculateDerived } from "@/lib/recalculate";
import { ItemFormModal } from "@/components/inventory/ItemFormModal";
```

Replace:
```tsx
import type { InventoryItem, GrantedAction } from "@/lib/types";
```
with:
```tsx
import type { InventoryItem } from "@/lib/types";
```

- [ ] **Step 2: Remove the `newItem` state block**

Delete:
```tsx
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    weight: "",
    value: "",
    category: "gear" as InventoryItem["category"],
    description: "",
    magicBonus: "",
    magicBonusTargets: [] as ("ac" | "save")[],
    magicAttackBonus: "",
    magicDamageBonus: "",
    baseWeaponName: "",
    grantsAction: false,
    actionName: "",
    actionType: "action" as GrantedAction["actionType"],
    actionDescription: "",
    actionLimitedUses: false,
    actionTotalUses: "",
    actionRecharge: "long" as NonNullable<GrantedAction["charges"]>["recharge"],
  });

```

- [ ] **Step 3: Add `editingItem` state**

Replace:
```tsx
  const [unpackingItem, setUnpackingItem] = useState<InventoryItem | null>(
    null
  );
```
(added in Task 5) with:
```tsx
  const [unpackingItem, setUnpackingItem] = useState<InventoryItem | null>(
    null
  );
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
```

- [ ] **Step 4: Remove `handleAddItem`, `toggleMagicBonusTarget`, and the three `prefillFrom*` functions**

Delete this entire block (from `function handleAddItem()` through the end of `prefillFromGear`):
```tsx
  function handleAddItem() {
    if (!newItem.name.trim()) return;
    const magicBonus = newItem.magicBonus ? parseInt(newItem.magicBonus) : 0;
    const magicAttackBonus = newItem.magicAttackBonus
      ? parseInt(newItem.magicAttackBonus)
      : 0;
    const magicDamageBonus = newItem.magicDamageBonus
      ? parseInt(newItem.magicDamageBonus)
      : 0;
    const totalUses = newItem.actionTotalUses
      ? parseInt(newItem.actionTotalUses)
      : 0;
    const grantedAction: GrantedAction | null =
      newItem.grantsAction && newItem.actionName.trim()
        ? {
            name: newItem.actionName.trim(),
            actionType: newItem.actionType,
            description: newItem.actionDescription,
            charges:
              newItem.actionLimitedUses && totalUses > 0
                ? {
                    total: totalUses,
                    remaining: totalUses,
                    recharge: newItem.actionRecharge,
                  }
                : null,
          }
        : null;
    const item: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newItem.name.trim(),
      quantity: newItem.quantity,
      weight: newItem.weight ? parseFloat(newItem.weight) : null,
      value: newItem.value ? parseFloat(newItem.value) : null,
      category: newItem.category,
      equipped: false,
      description: newItem.description,
      magicBonus: magicBonus ? magicBonus : null,
      magicBonusTargets: magicBonus ? newItem.magicBonusTargets : [],
      magicAttackBonus: magicAttackBonus ? magicAttackBonus : null,
      magicDamageBonus: magicDamageBonus ? magicDamageBonus : null,
      baseWeaponName: newItem.baseWeaponName.trim() || null,
      grantedAction,
    };
    addInventoryItem(item);
    toast(`${item.name} agregado`, { icon: "📦" });
    setNewItem({
      name: "",
      quantity: 1,
      weight: "",
      value: "",
      category: "gear",
      description: "",
      magicBonus: "",
      magicBonusTargets: [],
      magicAttackBonus: "",
      magicDamageBonus: "",
      baseWeaponName: "",
      grantsAction: false,
      actionName: "",
      actionType: "action",
      actionDescription: "",
      actionLimitedUses: false,
      actionTotalUses: "",
      actionRecharge: "long",
    });
    setAddModalOpen(false);
  }

  function toggleMagicBonusTarget(target: "ac" | "save") {
    setNewItem((prev) => ({
      ...prev,
      magicBonusTargets: prev.magicBonusTargets.includes(target)
        ? prev.magicBonusTargets.filter((t) => t !== target)
        : [...prev.magicBonusTargets, target],
    }));
  }

  function prefillFromWeapon(weaponName: string) {
    const w = WEAPONS.find((wp) => wp.name === weaponName);
    if (w) {
      setNewItem({
        ...newItem,
        name: w.name,
        weight: String(w.weight),
        value: w.value !== null ? String(w.value) : "",
        category: "weapon",
        description: `${w.damage} ${w.damageType} · ${w.properties.join(", ")}${w.mastery ? ` · Mastery: ${w.mastery}` : ""}`,
      });
    }
  }

  function prefillFromArmor(armorName: string) {
    const a = ARMOR.find((ar) => ar.name === armorName);
    if (a) {
      setNewItem({
        ...newItem,
        name: a.name,
        weight: String(a.weight),
        value: a.value !== null ? String(a.value) : "",
        category: "armor",
        description: `AC ${a.ac}${a.stealthDisadvantage ? " · Desventaja en Sigilo" : ""}${a.strengthRequirement ? ` · Requiere FUE ${a.strengthRequirement}` : ""}`,
      });
    }
  }

  function prefillFromGear(gearName: string) {
    const g = GEAR.find((ge) => ge.name === gearName);
    if (g) {
      setNewItem({
        ...newItem,
        name: g.name,
        weight: g.weight !== null ? String(g.weight) : "",
        value: g.value !== null ? String(g.value) : "",
        category: "gear",
        description: g.description,
      });
    }
  }

```

- [ ] **Step 5: Add the "Editar" button next to "Eliminar"**

Find:
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
Replace with:
```tsx
                      <button
                        onClick={() => setEditingItem(item)}
                        className="ml-auto px-3 py-1 text-xs text-accent border border-accent/30 rounded hover:bg-accent/10"
                      >
                        Editar
                      </button>
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
                        className="px-3 py-1 text-xs text-danger border border-danger/30 rounded hover:bg-danger/10"
                      >
                        Eliminar
                      </button>
```
(`ml-auto` moves from "Eliminar" to "Editar" — it's the first of the pair now, so it's the one that needs to push both buttons to the right of the row.)

- [ ] **Step 6: Replace the inline "Add Item Modal" with two `ItemFormModal` usages**

Find the entire block starting at the `{/* Add Item Modal */}` comment and ending at its matching `</Modal>` — i.e. everything from:
```tsx
      {/* Add Item Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Agregar objeto"
      >
```
through:
```tsx
        </div>
      </Modal>
```
(the entire ~310-line block — every field, both quick-fill selects, the magic bonus/granted action sections, and the final "Agregar" button). Delete it in full and replace with:
```tsx
      <ItemFormModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={(item) => {
          addInventoryItem(item);
          toast(`${item.name} agregado`, { icon: "📦" });
        }}
      />

      <ItemFormModal
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem ?? undefined}
        onSave={(item) => updateInventoryItem(item.id, item)}
      />
```

- [ ] **Step 7: Manual check**

Run `npm run dev`, open Inventario:
1. Add a new item via the FAB — confirm the form still works exactly as before (quick-fill selects present, saving adds the item and shows the "agregado" toast).
2. Expand an existing item, tap "Editar" — confirm the form opens pre-filled with that item's current values, with no quick-fill selects. Change the weight, save — confirm the row reflects the new weight and no new row was created.
3. Edit an item that has a granted action with limited uses where you've already used some charges (or create one, use it once via its charge counter, then edit the item's name only) — confirm the remaining/total charge count is unchanged after saving the edit.
4. Confirm equipped status is preserved through an edit (equip an item, edit something unrelated about it, confirm it's still equipped after saving).

- [ ] **Step 8: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all pass — pay attention to unused-import lint errors specifically (`ARMOR`, `GrantedAction`) if Step 1 was missed anywhere.

- [ ] **Step 9: Commit**

```bash
git add src/components/tabs/InventoryTab.tsx
git commit -m "feat: wire ItemFormModal into Inventario, enabling item editing"
```

---

### Task 7: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run the full check suite**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass, 0 lint errors, all tests green (including the 5 new `resolveItemDescription` tests from Task 1).

- [ ] **Step 2: Full manual walkthrough**

Run `npm run dev` and check, in order:
1. Add a brand-new custom item (not from any quick-fill) — confirm it saves correctly.
2. Edit that same item's name, weight, and description — confirm changes persist after a page reload (LocalStorage round-trip).
3. Edit an equipped weapon's magic attack/damage bonus — confirm combat-tab attack rolls reflect the new bonus (this exercises `recalculateDerived`-adjacent behavior indirectly, since equip status is preserved through the edit).
4. Expand Explorer's Pack (or any item with an empty description matching a catalog entry) — confirm details show.
5. Open Explorer's Pack, confirm the contents list and post-unpack inventory state.
6. Open a second pack type (e.g. add a Scholar's Pack via quick-fill, then open it) — confirm a different pack's contents resolve correctly, not just Explorer's Pack.
7. Confirm the "Abrir" button does *not* appear on ordinary items that aren't packs (e.g. a plain weapon).
8. Check the browser console for errors across all of the above.

- [ ] **Step 3: Confirm no regressions in unaffected inventory features**

Confirm currency editing, search, sort, category filters, quantity +/- buttons, equip toggling (and its "add to combat?" prompt), and CSV export all still work — none of these were touched by this plan, but they live in the same file and a mis-scoped edit could have clipped one.

- [ ] **Step 4: Final commit (if Step 3 surfaces any fix)**

If any of the manual checks above reveal a bug, fix it, re-run Step 1, and commit:
```bash
git add -A
git commit -m "fix: address inventory editing/unpacking issues found in verification pass"
```
If nothing needs fixing, this task produces no commit — it's a pure verification gate.
