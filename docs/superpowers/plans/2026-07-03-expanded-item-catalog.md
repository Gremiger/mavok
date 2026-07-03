# Expanded Item Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the InventoryTab "quick add" catalog beyond weapons to include armor and general adventuring gear from 5etools-src, and add value (gp) tracking to inventory items.

**Architecture:** Extend the existing extraction script (`scripts/extract-5etools.ts`) to add a `value` field to weapons/armor and a brand-new gear extraction producing `src/data/gear.ts`. Extend the `InventoryItem` type with a `value` field via the project's standard versioned-migration mechanism. Wire the new/expanded catalogs into `InventoryTab`'s existing quick-add pattern (`prefillFromWeapon` already exists — add sibling functions for armor and gear).

**Tech Stack:** TypeScript, Next.js 15 (static export), no test framework — verification is `npx tsc --noEmit && npm run build && npm run lint` plus manual dev-server checks per CLAUDE.md.

## Global Constraints

- `npm run lint` must report 0 errors — it's the only tool that catches React Hooks ordering violations; run it after every UI task.
- `output: 'export'` — no server-only APIs.
- `Character`/`InventoryItem` changes must go through the versioned migration system in `src/lib/migrations.ts`; never break backward compatibility with existing LocalStorage data.
- `src/data/*.ts` (except `mavok-default.ts`) are fully generated from `scripts/extract-5etools.ts` — do not hand-edit `weapons.ts`, `armor.ts`, or `gear.ts` directly; edit the script and re-run it.
- 5etools source data lives at `../../dnd/5etools-src/data` relative to `scripts/` (resolves to the sibling `5etools-src` checkout) — this is already working for existing extractions, don't change `TOOLS_DIR`.

---

### Task 1: Add `value` to WeaponData and ArmorData, extract GearData

**Files:**
- Modify: `scripts/extract-5etools.ts` (weapons section ~lines 52–116, armor section ~lines 118–161, run-all section ~lines 417–426)
- Generated (do not hand-edit, produced by running the script): `src/data/weapons.ts`, `src/data/armor.ts`, `src/data/gear.ts` (new)

**Interfaces:**
- Produces: `WeaponData.value: number | null`, `ArmorData.value: number | null`, and new `src/data/gear.ts` exporting:
  ```ts
  export interface GearData {
    name: string;
    weight: number | null;
    value: number | null; // gp
    description: string;
  }
  export const GEAR: GearData[];
  ```
- Consumes: existing `flattenEntries`/`stripMarkup` helpers already defined at the top of `scripts/extract-5etools.ts`.

- [ ] **Step 1: Add `value` to the weapon mapping and interface**

In `scripts/extract-5etools.ts`, inside `extractWeapons()`, change the `.map()` return (around line 87–97) to include `value`:

```ts
      return {
        name: i.name as string,
        type: typeMap[typeKey] || typeKey,
        category: i.weaponCategory as string,
        damage: i.dmg1 as string,
        damageType: i.dmgType as string,
        weight: (i.weight as number) || 0,
        properties: props,
        mastery: masteries[0] || null,
        range,
        value: typeof i.value === "number" ? i.value / 100 : null,
      };
```

Update the emitted interface string (around line 100–110) to add the field:

```ts
  const ts = `export interface WeaponData {
  name: string;
  type: "melee" | "ranged";
  category: string;
  damage: string;
  damageType: string;
  weight: number;
  properties: string[];
  mastery: string | null;
  range: string | null;
  value: number | null;
}

export const WEAPONS: WeaponData[] = ${JSON.stringify(weapons, null, 2)};
`;
```

- [ ] **Step 2: Add `value` to the armor mapping and interface**

Inside `extractArmor()`, change the `.map()` return (around line 136–146):

```ts
      return {
        name: i.name as string,
        type: typeMap[typeKey] || typeKey,
        ac: (i.ac as number) || 0,
        weight: (i.weight as number) || 0,
        stealthDisadvantage: !!(i.stealth as boolean),
        strengthRequirement: i.strength ? parseInt(String(i.strength)) : null,
        value: typeof i.value === "number" ? i.value / 100 : null,
      };
```

Update the emitted interface string (around line 148–157):

```ts
  const ts = `export interface ArmorData {
  name: string;
  type: "light" | "medium" | "heavy" | "shield";
  ac: number;
  weight: number;
  stealthDisadvantage: boolean;
  strengthRequirement: number | null;
  value: number | null;
}

export const ARMOR: ArmorData[] = ${JSON.stringify(armor, null, 2)};
`;
```

- [ ] **Step 3: Add `extractGear()` function**

Insert a new function after `extractArmor()` (after line 161, before the `// --- Weapon Mastery Properties ---` comment):

```ts
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

- [ ] **Step 4: Wire `extractGear()` into the run-all section**

In the `// --- Run all ---` section at the end of the file, add the call:

```ts
console.log("Extracting 5etools data...\n");
extractConditions();
extractWeapons();
extractArmor();
extractGear();
extractMastery();
extractFeats();
extractBarbarianProgression();
extractSubclasses();
console.log("\nDone!");
```

- [ ] **Step 5: Run the extraction script and verify output**

Run: `npx tsx scripts/extract-5etools.ts`

Expected output includes lines like:
```
Weapons: <N>
Armor: 13
Gear: 77
```

Verify `src/data/gear.ts` was created and `src/data/weapons.ts` / `src/data/armor.ts` now have a `value` field on each entry:

```bash
grep -c '"value"' src/data/weapons.ts src/data/armor.ts src/data/gear.ts
```

Expected: non-zero counts matching the number of entries in each file (every object should have gained a `value` key).

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add scripts/extract-5etools.ts src/data/weapons.ts src/data/armor.ts src/data/gear.ts
git commit -m "feat: extract gear catalog and add value field to weapons/armor"
```

---

### Task 2: Add `value` field to InventoryItem via migration v5

**Files:**
- Modify: `src/lib/types.ts` (`InventoryItem` interface ~line 99–107, `CURRENT_DATA_VERSION` at line 3)
- Modify: `src/lib/migrations.ts` (add migration `5`, ~after line 96)
- Modify: `src/data/mavok-default.ts` (inventory array, lines 224–240)

**Interfaces:**
- Consumes: nothing new.
- Produces: `InventoryItem.value: number | null` — used by Task 3's UI code.

- [ ] **Step 1: Bump `CURRENT_DATA_VERSION` and add the field**

In `src/lib/types.ts`, change line 3:

```ts
export const CURRENT_DATA_VERSION = 5;
```

Change the `InventoryItem` interface (lines 99–107):

```ts
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  weight: number | null;
  value: number | null;
  category: "weapon" | "armor" | "gear" | "consumable" | "personal";
  equipped: boolean;
  description: string;
}
```

- [ ] **Step 2: Add migration `5`**

In `src/lib/migrations.ts`, add a new entry to the `MIGRATIONS` object right after the `4` migration (after line 96, before the closing `};` of `MIGRATIONS`):

```ts
  5: (data) => {
    const d = data as Record<string, unknown>;
    d._version = 5;

    const inventory = d.inventory as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(inventory)) {
      for (const item of inventory) {
        if (item.value === undefined) {
          item.value = null;
        }
      }
    }

    return d;
  },
```

- [ ] **Step 3: Backfill `value` in the default character**

In `src/data/mavok-default.ts`, replace the inventory array (lines 224–240) with the same entries plus `value: null` added to each:

```ts
  inventory: [
    { id: "inv-1", name: "Maul", quantity: 1, weight: 10, value: null, category: "weapon", equipped: true, description: "Herramienta agrícola y de cantería para clavar postes, romper piedra y reparar estructuras." },
    { id: "inv-2", name: "Handaxe", quantity: 2, weight: 2, value: null, category: "weapon", equipped: true, description: "" },
    { id: "inv-3", name: "Javelin", quantity: 4, weight: 2, value: null, category: "weapon", equipped: true, description: "" },
    { id: "inv-4", name: "Explorer's Pack", quantity: 1, weight: null, value: null, category: "gear", equipped: false, description: "" },
    { id: "inv-5", name: "Sickle", quantity: 1, weight: 2, value: null, category: "weapon", equipped: false, description: "Herramienta de trabajo y recuerdo de Karrum-Barra." },
    { id: "inv-6", name: "Carpenter's Tools", quantity: 1, weight: 8, value: null, category: "gear", equipped: false, description: "Para reparar cercos, corrales, carros y estructuras agrícolas." },
    { id: "inv-7", name: "Healer's Kit", quantity: 1, weight: 3, value: null, category: "consumable", equipped: false, description: "10 usos." },
    { id: "inv-8", name: "Iron Pot", quantity: 1, weight: 10, value: null, category: "gear", equipped: false, description: "" },
    { id: "inv-9", name: "Shovel", quantity: 1, weight: 5, value: null, category: "gear", equipped: false, description: "" },
    { id: "inv-10", name: "Traveler's Clothes", quantity: 1, weight: 4, value: null, category: "gear", equipped: true, description: "" },
    { id: "inv-11", name: "Cuerda roja trenzada", quantity: 1, weight: null, value: null, category: "personal", equipped: true, description: "De los Toduk-Rojum, atada a la muñeca." },
    { id: "inv-12", name: "Cuerda roja en trenza lateral", quantity: 1, weight: null, value: null, category: "personal", equipped: true, description: "Entretejida en su trenza lateral." },
    { id: "inv-13", name: "Cuerda roja en maul", quantity: 1, weight: null, value: null, category: "personal", equipped: true, description: "Enrollada alrededor del mango del maul." },
    { id: "inv-14", name: "Cuerda roja para Kraven", quantity: 1, weight: null, value: null, category: "personal", equipped: false, description: "Un tramo adicional reservado para Kraven." },
    { id: "inv-15", name: "Piedra de Karrum-Barra", quantity: 1, weight: null, value: null, category: "personal", equipped: true, description: "" },
    { id: "inv-16", name: "Bolsa con semillas", quantity: 1, weight: null, value: null, category: "personal", equipped: false, description: "Del último cultivo sano de su familia." },
  ],
```

- [ ] **Step 4: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 5: Manual migration check**

Run the dev server (`npm run dev`), open the app in a browser with existing LocalStorage data from before this change (or use browser devtools to set `localStorage['mavok_character_<id>']._version` to `4` and reload). Confirm:
- The app loads without errors.
- Existing inventory items display normally (no crash from missing `value`).
- `localStorage` for that character now shows `_version: 5` and every inventory item has a `value` key (even if `null`).

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/migrations.ts src/data/mavok-default.ts
git commit -m "feat: add value field to InventoryItem with v5 migration"
```

---

### Task 3: Wire armor/gear quick-add and value display into InventoryTab

**Files:**
- Modify: `src/components/tabs/InventoryTab.tsx`

**Interfaces:**
- Consumes: `ARMOR` from `src/data/armor.ts` (`ArmorData { name, type, ac, weight, stealthDisadvantage, strengthRequirement, value }`), `GEAR` from `src/data/gear.ts` (`GearData { name, weight, value, description }`), `InventoryItem.value: number | null` (Task 2).
- Produces: no new exports — UI-only change.

- [ ] **Step 1: Import ARMOR and GEAR, add `value` to newItem state**

In `src/components/tabs/InventoryTab.tsx`, update the imports (line 11) and the `newItem` state (lines 49–55):

```ts
import { WEAPONS } from "@/data/weapons";
import { ARMOR } from "@/data/armor";
import { GEAR } from "@/data/gear";
```

```ts
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    weight: "",
    value: "",
    category: "gear" as InventoryItem["category"],
    description: "",
  });
```

- [ ] **Step 2: Add `prefillFromArmor` and `prefillFromGear`, update `prefillFromWeapon`**

Replace the existing `prefillFromWeapon` function (lines 135–146) with three sibling functions:

```ts
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

- [ ] **Step 3: Add Armadura/Equipo quick-add dropdowns to the Add Item modal**

Right after the existing "Arma rápida" `<div>` block (which ends around line 383, right before the closing `</div>` and blank line before the name `<input>`), add two more dropdown blocks:

```tsx
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
```

(This replaces just the single "Arma rápida" block — keep it as the first of the three, add the other two after it.)

- [ ] **Step 4: Add a "Valor (gp)" input next to weight in the modal**

Find the `<div className="flex gap-2">` block containing the quantity/weight/category inputs (lines 394–432). Change the weight input's wrapper width from `w-1/3` to `w-1/4` and add a new value input, so the row holds four fields:

```tsx
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  quantity: parseInt(e.target.value) || 1,
                })
              }
              placeholder="Cantidad"
              className="w-1/4 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            />
            <input
              value={newItem.weight}
              onChange={(e) =>
                setNewItem({ ...newItem, weight: e.target.value })
              }
              placeholder="Peso (lb)"
              className="w-1/4 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            />
            <input
              value={newItem.value}
              onChange={(e) =>
                setNewItem({ ...newItem, value: e.target.value })
              }
              placeholder="Valor (gp)"
              className="w-1/4 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            />
            <select
              value={newItem.category}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  category: e.target.value as InventoryItem["category"],
                })
              }
              className="w-1/4 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
```

- [ ] **Step 5: Include `value` when constructing the new InventoryItem and reset state**

Update `handleAddItem` (lines 112–133):

```ts
  function handleAddItem() {
    if (!newItem.name.trim()) return;
    const item: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newItem.name.trim(),
      quantity: newItem.quantity,
      weight: newItem.weight ? parseFloat(newItem.weight) : null,
      value: newItem.value ? parseFloat(newItem.value) : null,
      category: newItem.category,
      equipped: false,
      description: newItem.description,
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
    });
    setAddModalOpen(false);
  }
```

- [ ] **Step 6: Display value next to weight in the collapsed row**

Update the row header block (lines 260–273) that currently shows only weight:

```tsx
                  <div className="flex-1 min-w-0">
                    <span className="text-sm">{item.name}</span>
                    {item.quantity > 1 && (
                      <span className="text-muted text-xs ml-1">
                        ×{item.quantity}
                      </span>
                    )}
                  </div>
                  {(item.weight !== null || item.value !== null) && (
                    <span className="text-muted text-xs">
                      {item.weight !== null
                        ? `${item.weight * item.quantity} lb`
                        : ""}
                      {item.weight !== null && item.value !== null ? " · " : ""}
                      {item.value !== null ? `${item.value} gp` : ""}
                    </span>
                  )}
```

- [ ] **Step 7: Lint, type-check, build**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all three succeed, lint reports 0 errors.

- [ ] **Step 8: Manual UI verification**

Run `npm run dev`, open the Inventory tab, tap the `+` FAB:
- Confirm three quick-add dropdowns appear: Arma rápida, Armadura rápida, Equipo rápido.
- Pick an armor (e.g. "Breastplate") — confirm name/weight/value/description prefill and category is set to "armor" (the category `<select>` reflects it).
- Pick a gear item (e.g. "Rope, Hempen (50 feet)" or similar) — confirm prefill.
- Manually type a value into "Valor (gp)" for a freeform item, save it, expand the row, confirm it shows e.g. `2 lb · 5 gp`.
- Confirm an item with no value set shows only weight (no stray `·` separator).

- [ ] **Step 9: Commit**

```bash
git add src/components/tabs/InventoryTab.tsx
git commit -m "feat: add armor/gear quick-add and value tracking to InventoryTab"
```

---

## Self-Review Notes

- **Spec coverage:** Data layer (Task 1) ✅, data model + migration (Task 2) ✅, UI quick-add + value display (Task 3) ✅. AC/encumbrance explicitly left untouched per spec's "out of scope" note — no task modifies `recalculate.ts`.
- **Type consistency:** `value: number | null` used consistently across `WeaponData`, `ArmorData`, `GearData`, and `InventoryItem`. `newItem.value` is a string in component state (matching the existing `weight` string pattern) and parsed with `parseFloat` in `handleAddItem`, matching how `weight` is handled today.
- **No placeholders:** every step has literal code to write, not descriptions.
