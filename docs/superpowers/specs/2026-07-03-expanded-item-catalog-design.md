# Expanded Item Catalog — Design

## Context

`InventoryTab` currently only offers a "quick add" prefill for weapons (`WEAPONS` from `src/data/weapons.ts`). Armor data already exists in `src/data/armor.ts` (extracted via `scripts/extract-5etools.ts`) but is completely unused in the UI. General adventuring gear (rope, torches, acid, antitoxin, tinderbox, etc. — 77 XPHB items in `items.json` under type `G|XPHB`) has no extraction at all; users must type every non-weapon item by hand.

This spec expands the quick-add catalog to cover armor and general gear, and adds value (gp) tracking to inventory items — useful for loot bookkeeping.

Out of scope: tools, mounts, vehicles, ships, food & drink, trade goods, gaming sets (niche for a solo Barbarian sheet). Also out of scope: wiring armor into AC calculation — Barbarian Unarmored Defense (`10 + DEX + CON`) already drives AC in `recalculate.ts`, and auto-deriving AC from equipped armor is a separate concern not requested here.

## 1. Data layer (extraction script + generated files)

- Add `value: number | null` (gp) to `WeaponData` (`src/data/weapons.ts`) and `ArmorData` (`src/data/armor.ts`). Source is the raw 5etools `value` field, which is in copper pieces — divide by 100, or `null` if absent.
- Add a new `extractGear()` function to `scripts/extract-5etools.ts` that reads `items.json`, filters `source === "XPHB" && type === "G|XPHB"`, and maps to:
  ```ts
  interface GearData {
    name: string;
    weight: number | null;
    value: number | null; // gp
    description: string;
  }
  ```
  `description` uses the existing `flattenEntries`/`stripMarkup` helpers already used for conditions/features. Output to new `src/data/gear.ts`.
- Wire `extractGear()` into the script's `Run all` section.
- Re-run `npx tsx scripts/extract-5etools.ts` and commit the regenerated `weapons.ts`, `armor.ts`, and new `gear.ts`.

## 2. Character data model

- Add `value: number | null` to `InventoryItem` in `src/lib/types.ts`.
- Bump `CURRENT_DATA_VERSION` from `4` to `5` in `types.ts`.
- Add migration `5` in `src/lib/migrations.ts` that backfills `value: null` on every entry in `d.inventory` that doesn't already have a `value` field, following the pattern of migration `4`.
- Update `src/data/mavok-default.ts`'s starting inventory items to include `value: null` (or a real value where known) so it satisfies the `InventoryItem` interface.

## 3. InventoryTab UI

- In the "Agregar objeto" modal, add two more quick-add dropdowns next to the existing "Arma rápida": **"Armadura rápida"** and **"Equipo rápido"**, sourced from `ARMOR` and `GEAR` respectively.
- Add `prefillFromArmor(name)` and `prefillFromGear(name)` functions mirroring today's `prefillFromWeapon`: set `name`, `weight`, `value`, `category` (`"armor"` / `"gear"`), and `description`.
- Add a "Valor (gp)" number input next to the existing "Peso (lb)" input in the modal, bound to `newItem.value`.
- In the expanded inventory row, display value next to weight when present, e.g. `12 lb · 5 gp`.
- `handleAddItem` includes `value: newItem.value ? parseFloat(newItem.value) : null` when constructing the `InventoryItem`.

## Verification

`npx tsc --noEmit && npm run build && npm run lint` must pass. Manually verify in the dev server: add an item via each of the three quick-add dropdowns, confirm prefilled fields and value display, confirm existing (pre-migration) inventory items still load without a value shown.
