# Magic Item Attunement Tracking + Quick-Pick Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Track which inventory items are attuned (with a "3 items" informational warning) and add a fourth quick-pick dropdown in `ItemFormModal` for `MAGIC_ITEMS`, prefilling name/description/category/attunement.

**Architecture:** Two new boolean fields (`requiresAttunement`, `attuned`) on `InventoryItem`, backfilled by a new migration. `ItemFormModal.tsx` gets a `prefillFromMagicItem` quick-pick (mirroring the existing weapon/armor/gear ones) plus two checkboxes. `InventoryTab.tsx` gets an attuned-count line above the list and a per-item "Sintonizado" chip.

**Tech Stack:** React 19, TypeScript, Vitest — no new dependencies.

## Global Constraints

- Attunement is informational only — it must never gate whether a magic bonus applies in `recalculate.ts`. Bonus application stays keyed on `equipped` alone, unchanged.
- `requiresAttunement`/`attuned` are manually toggled per item, like `equipped` already is — never derived by matching an item's `name` against `MAGIC_ITEMS` at render or recalculate time. The quick-pick is the only place catalog data is copied in, and only as a one-time prefill.
- No changes to `src/data/magic-items.ts` itself.
- Verify every task with `npx tsc --noEmit && npm run build && npm run lint && npm test` — 0 lint errors required (per `CLAUDE.md`).
- Data model changes to `Character`/`InventoryItem` require a migration (per `CLAUDE.md`'s "Adding a New Data Model Field" section) — never break old LocalStorage data.

---

### Task 1: Data model + migration

**Files:**
- Modify: `src/lib/types.ts` (bump `CURRENT_DATA_VERSION`, add fields to `InventoryItem`)
- Modify: `src/lib/migrations.ts` (new migration `13`)
- Test: `src/lib/migrations.test.ts` (new test case)
- Modify: `src/data/mavok-default.ts` (backfill the 10 existing inventory entries)

**Interfaces:**
- Produces: `InventoryItem.requiresAttunement: boolean`, `InventoryItem.attuned: boolean` — consumed by Task 2 (`ItemFormModal`) and Task 3 (`InventoryTab`)

- [ ] **Step 1: Write the failing migration test**

Add to `src/lib/migrations.test.ts` (following the existing style of the file's other version-specific tests):

```typescript
it("migration 13 backfills requiresAttunement and attuned on inventory items", () => {
  const raw = JSON.stringify({
    _version: 12,
    meta: { proficiencyBonus: 2 },
    resources: {
      rpiRages: { total: 2, remaining: 2, slots: [true, true] },
      stoneEndurance: { total: 2, remaining: 2 },
    },
    combat: { maxHp: 16, currentHp: 16 },
    features: [],
    inventory: [
      { id: "inv-1", name: "Old Item" },
      { id: "inv-2", name: "Already Set", requiresAttunement: true, attuned: true },
    ],
    levelUpHistory: [],
  });
  const { data } = migrateCharacterData(raw);
  const result = JSON.parse(data);

  expect(result._version).toBe(CURRENT_DATA_VERSION);
  expect(result.inventory[0].requiresAttunement).toBe(false);
  expect(result.inventory[0].attuned).toBe(false);
  // A field the data already had is left untouched by the backfill.
  expect(result.inventory[1].requiresAttunement).toBe(true);
  expect(result.inventory[1].attuned).toBe(true);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/migrations.test.ts`
Expected: FAIL — `result._version` will not equal the new `CURRENT_DATA_VERSION` (13) since migration 13 doesn't exist yet, and/or `requiresAttunement`/`attuned` will be `undefined`.

- [ ] **Step 3: Bump the data version**

In `src/lib/types.ts`, change:

```typescript
export const CURRENT_DATA_VERSION = 12;
```

to:

```typescript
export const CURRENT_DATA_VERSION = 13;
```

- [ ] **Step 4: Add the fields to InventoryItem**

In `src/lib/types.ts`, in the `InventoryItem` interface, add after `grantedAction: GrantedAction | null;`:

```typescript
  requiresAttunement: boolean;
  attuned: boolean;
```

- [ ] **Step 5: Add migration 13**

In `src/lib/migrations.ts`, add after the closing `},` of migration `12` (before the final `};` that closes the `MIGRATIONS` object):

```typescript
  13: (data) => {
    const d = data as Record<string, unknown>;
    d._version = 13;

    const inventory = d.inventory as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(inventory)) {
      for (const item of inventory) {
        if (item.requiresAttunement === undefined) {
          item.requiresAttunement = false;
        }
        if (item.attuned === undefined) {
          item.attuned = false;
        }
      }
    }

    return d;
  },
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run src/lib/migrations.test.ts`
Expected: PASS, all tests in the file (including the new one) pass.

- [ ] **Step 7: Backfill mavok-default.ts**

`src/data/mavok-default.ts` has 16 inline inventory item object literals (ids `inv-1` through `inv-16`), each ending in the identical literal substring `baseWeaponName: null, grantedAction: null },`. Since all 16 share this exact suffix, replace every occurrence in the file in one shot:

```bash
sed -i '' 's/baseWeaponName: null, grantedAction: null },/baseWeaponName: null, grantedAction: null, requiresAttunement: false, attuned: false },/g' src/data/mavok-default.ts
```

After running it, `grep -c "requiresAttunement: false, attuned: false" src/data/mavok-default.ts` must print `16`.

- [ ] **Step 8: Run full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: `tsc` clean (this confirms `mavok-default.ts`'s object literals now satisfy the updated `InventoryItem` type), build succeeds, 0 lint errors, all tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/lib/types.ts src/lib/migrations.ts src/lib/migrations.test.ts src/data/mavok-default.ts
git commit -m "feat: add attunement fields to InventoryItem with migration 13"
```

---

### Task 2: ItemFormModal — quick-pick and checkboxes

**Files:**
- Modify: `src/components/inventory/ItemFormModal.tsx`

**Interfaces:**
- Consumes: `MAGIC_ITEMS` from `@/data/magic-items` (fields: `name: string`, `rarity: string`, `itemType: "weapon" | "armor" | "wondrous"`, `requiresAttunement: boolean`, `description: string`), `InventoryItem.requiresAttunement`/`.attuned` from Task 1
- Produces: `ItemFormModal`'s saved `InventoryItem` now includes `requiresAttunement`/`attuned`, consumed by Task 3 (`InventoryTab`'s list rendering)

This is a UI component with no unit test, consistent with the project's existing scope (no component tests). Verification is `tsc`/`build`/`lint` plus the manual walkthrough in Task 4.

- [ ] **Step 1: Import MAGIC_ITEMS**

Add near the top of `src/components/inventory/ItemFormModal.tsx`, alongside the existing `WEAPONS`/`ARMOR`/`GEAR` imports:

```typescript
import { MAGIC_ITEMS } from "@/data/magic-items";
```

- [ ] **Step 2: Add the two new fields to EMPTY_FORM**

In `EMPTY_FORM` (currently ending `actionRecharge: "long" as NonNullable<GrantedAction["charges"]>["recharge"],`), add:

```typescript
  requiresAttunement: false,
  attuned: false,
```

- [ ] **Step 3: Add the two new fields to formFromItem**

In `formFromItem()`, add (anywhere in the returned object — e.g. right after `baseWeaponName: item.baseWeaponName ?? "",`):

```typescript
    requiresAttunement: item.requiresAttunement,
    attuned: item.attuned,
```

- [ ] **Step 4: Write prefillFromMagicItem**

Add after the existing `prefillFromGear` function:

```typescript
  function prefillFromMagicItem(itemName: string) {
    const m = MAGIC_ITEMS.find((mi) => mi.name === itemName);
    if (m) {
      setForm({
        ...form,
        name: m.name,
        category:
          m.itemType === "weapon"
            ? "weapon"
            : m.itemType === "armor"
              ? "armor"
              : "gear",
        description: m.description,
        requiresAttunement: m.requiresAttunement,
        attuned: false,
      });
    }
  }
```

- [ ] **Step 5: Add the quick-pick dropdown**

Inside the `{!item && (...)}` block, after the existing "Equipo rápido" `<div>` (before its closing `</>`), add:

```tsx
            <div>
              <label className="text-xs text-muted">Objeto mágico rápido</label>
              <select
                onChange={(e) => {
                  if (e.target.value) prefillFromMagicItem(e.target.value);
                  e.target.value = "";
                }}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground mt-1"
                defaultValue=""
              >
                <option value="">Elegir objeto mágico...</option>
                {MAGIC_ITEMS.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.rarity})
                  </option>
                ))}
              </select>
            </div>
```

- [ ] **Step 6: Add the two checkboxes**

After the `magicBonus`-targets conditional block (the `{form.magicBonus && parseInt(form.magicBonus) !== 0 && (...)}` block that renders "Aplica a"), add:

```tsx
        <label className="flex items-center gap-1.5 text-xs text-foreground">
          <input
            type="checkbox"
            checked={form.requiresAttunement}
            onChange={(e) =>
              setForm({
                ...form,
                requiresAttunement: e.target.checked,
                attuned: e.target.checked ? form.attuned : false,
              })
            }
          />
          Requiere sintonía
        </label>

        {form.requiresAttunement && (
          <label className="flex items-center gap-1.5 text-xs text-foreground">
            <input
              type="checkbox"
              checked={form.attuned}
              onChange={(e) => setForm({ ...form, attuned: e.target.checked })}
            />
            Sintonizado
          </label>
        )}
```

- [ ] **Step 7: Add the fields to the saved object**

In `handleSave()`, in the `saved: InventoryItem` object literal, add after `grantedAction,`:

```typescript
      requiresAttunement: form.requiresAttunement,
      attuned: form.attuned,
```

- [ ] **Step 8: Run full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: `tsc` clean, build succeeds, 0 lint errors, all tests pass (this task adds no new tests, so the count from Task 1 stays the same).

- [ ] **Step 9: Commit**

```bash
git add src/components/inventory/ItemFormModal.tsx
git commit -m "feat: add magic item quick-pick and attunement checkboxes to ItemFormModal"
```

---

### Task 3: InventoryTab — counter and chip

**Files:**
- Modify: `src/components/tabs/InventoryTab.tsx`

**Interfaces:**
- Consumes: `InventoryItem.attuned` from Task 1

- [ ] **Step 1: Add the attuned-count line above the list**

In `src/components/tabs/InventoryTab.tsx`, right before the `{/* Inventory List */}` comment (immediately after the closing `</div>` of the Search/Sort/Filter block), add:

```tsx
      {(() => {
        const attunedCount = inventory.filter((i) => i.attuned).length;
        if (attunedCount === 0) return null;
        return (
          <p
            className={`text-xs ${attunedCount > 3 ? "text-danger" : "text-muted"}`}
          >
            Sintonizados: {attunedCount}/3
          </p>
        );
      })()}
```

- [ ] **Step 2: Add the per-item chip**

In the item row's `<div className="flex-1 min-w-0">` block (which currently renders the item name, the `×quantity` span, and the magic-bonus indicator IIFE), add after the magic-bonus indicator block:

```tsx
                    {item.attuned && (
                      <span className="text-[0.6rem] px-1.5 py-0.5 bg-accent/20 text-accent rounded ml-1">
                        Sintonizado
                      </span>
                    )}
```

- [ ] **Step 3: Run full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: `tsc` clean, build succeeds, 0 lint errors, all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/tabs/InventoryTab.tsx
git commit -m "feat: show attunement count and per-item chip in Inventario"
```

---

### Task 4: Full verification pass

This task produces no code changes on its own — it's a verification gate. If the walkthrough surfaces a real defect, fix it as part of this task and commit the fix; otherwise this task produces no commit.

- [ ] **Step 1: Run the full check suite**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: 0 lint errors, all tests passing.

- [ ] **Step 2: Verify the migration end-to-end against a realistic old save**

Run: `npx tsx -e '
import { migrateCharacterData } from "./src/lib/migrations";

const oldSave = JSON.stringify({
  _version: 12,
  meta: { proficiencyBonus: 2 },
  resources: {
    rpiRages: { total: 2, remaining: 2, slots: [true, true] },
    stoneEndurance: { total: 2, remaining: 2 },
  },
  combat: { maxHp: 16, currentHp: 16 },
  features: [],
  inventory: [
    { id: "inv-1", name: "Maul", equipped: true, magicBonus: null, magicBonusTargets: [], magicAttackBonus: null, magicDamageBonus: null, baseWeaponName: null, grantedAction: null },
  ],
  levelUpHistory: [],
});
const { data, migrated } = migrateCharacterData(oldSave);
const result = JSON.parse(data);
console.log("migrated:", migrated);
console.log("version:", result._version);
console.log("item attunement fields:", result.inventory[0].requiresAttunement, result.inventory[0].attuned);
'`

Expected output: `migrated: true`, `version: 13`, `item attunement fields: false false`.

- [ ] **Step 3: Verify prefillFromMagicItem's category mapping by reading MAGIC_ITEMS' itemType distribution**

Run: `npx tsx -e '
import { MAGIC_ITEMS } from "./src/data/magic-items";
const counts: Record<string, number> = {};
for (const m of MAGIC_ITEMS) counts[m.itemType] = (counts[m.itemType] ?? 0) + 1;
console.log(counts);
const requiresCount = MAGIC_ITEMS.filter((m) => m.requiresAttunement).length;
console.log("requiresAttunement count:", requiresCount, "/", MAGIC_ITEMS.length);
'`

Expected: prints non-zero counts for at least `wondrous` (confirming the `itemType === "wondrous" → category: "gear"` mapping branch is actually exercised by real catalog data), and a `requiresAttunement count` between 0 and the total (confirming both `true` and `false` values exist in the catalog so the checkbox prefill is meaningfully tested by real data, not just a constant).

- [ ] **Step 4: Confirm no stray symlinks or worktree pollution**

Run: `find <repo-root> -maxdepth 3 -type l 2>/dev/null | grep -v node_modules`
Expected: no output.

- [ ] **Step 5: Manual dev-server smoke check**

Start `npm run dev`, `curl -s -o /dev/null -w "http:%{http_code}\n" http://localhost:3000` and expect `http:200`, then stop the dev server. (Chrome DevTools MCP browser tooling is unavailable this session — this substitutes for a live click-through, consistent with how prior plans this session were verified.)

If any step surfaces a real defect, fix it, re-run the full check suite, and commit. If everything passes cleanly, this task produces no commit.
