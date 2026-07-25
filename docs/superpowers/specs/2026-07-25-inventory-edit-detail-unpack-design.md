# Inventory editing, detail fallback, and pack unpacking

## Problem

Three related gaps in `InventoryTab.tsx`'s item management:

1. **No editing.** Once an item is added, only quantity (+/-), equipped status,
   and full removal can change — every other field (name, weight, value,
   category, description, magic bonuses, granted action) is fixed at creation
   time. Fixing a typo or adjusting a magic bonus means deleting and
   re-adding the item.
2. **Missing detail.** The expanded item view shows `item.description`
   verbatim, but that field is frequently empty — e.g. Mavok's starting
   Explorer's Pack (`src/data/mavok-default.ts`, `inv-4`) has
   `description: ""`, even though the extracted `GEAR` catalog
   (`src/data/gear.ts`) already has the full text ("An Explorer's Pack
   contains the following items: Backpack, Bedroll, 2 flasks of Oil, 10 days
   of Rations, Rope, Tinderbox, 10 Torch, and Waterskin."). The user has no
   way to see what's actually in a pack they're carrying.
3. **No pack unpacking.** Even once the contents are visible as prose, there's
   no way to turn "Explorer's Pack" into eight separate inventory rows
   (Backpack, Bedroll, Oil ×2, Rations ×10, Rope, Tinderbox, Torch ×10,
   Waterskin) without manually typing each one in.

## Approach

### 1. Editing — shared `ItemFormModal`

Extract the existing "Agregar objeto" form (currently inline in
`InventoryTab.tsx`, roughly lines 562-875: all of `newItem` state, its
handlers, and the modal JSX) into `src/components/inventory/ItemFormModal.tsx`,
matching the existing pattern of `src/components/combat/AttackFormModal.tsx`
(a standalone form modal, not inlined in its parent tab).

```ts
interface ItemFormModalProps {
  open: boolean;
  onClose: () => void;
  item?: InventoryItem; // present = edit mode, absent = add mode
}
```

- **Add mode** (`item` undefined): behavior identical to today — the three
  catalog quick-fill selects (Arma/Armadura/Equipo rápido) are shown, the
  form starts empty, saving calls `addInventoryItem`.
- **Edit mode** (`item` present): the quick-fill selects are hidden (editing
  an existing item isn't "start from a catalog template" — the item already
  has its own identity); the form's initial state is derived from `item`
  (all fields: name, quantity, weight, value, category, description, magic
  bonus + targets, magic attack/damage bonus, base weapon name, granted
  action fields); the modal title reads "Editar objeto"; saving calls
  `updateInventoryItem(item.id, {...})` instead of `addInventoryItem`, and
  does not reset form state afterward (the modal just closes — there's no
  "next item" flow like Add has).
- `InventoryTab.tsx` gains one new piece of state: `editingItem: InventoryItem
  | null`. An "Editar" button is added next to the existing "Eliminar" button
  in the expanded item view (same row, same button styling family).
- `handleAddItem`, `toggleMagicBonusTarget`, `prefillFromWeapon`,
  `prefillFromArmor`, `prefillFromGear`, and the `newItem` state all move
  into `ItemFormModal.tsx` — `InventoryTab.tsx` no longer owns any of that
  state after this change.

### 2. Detail view — description fallback

New helper, `resolveItemDescription(item: InventoryItem): string`, added to
`src/lib/inventory.ts` (new file — this is inventory-domain logic, not a
generic utility, so it doesn't belong in `src/lib/utils.ts`):

```ts
function resolveItemDescription(item: InventoryItem): string {
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

The weapon/armor summary strings intentionally match the exact format
`prefillFromWeapon`/`prefillFromArmor` already write into `description` at
add-time (`InventoryTab.tsx` lines 256, 270) — the fallback produces the same
text a freshly-added catalog item would have had, so there's no visible
difference between "this item's description was set at creation" and "this
item's description was back-filled by the fallback."

`InventoryTab.tsx`'s expanded-item block replaces its
`{item.description && <p>...}` conditional with a call through
`resolveItemDescription(item)` (rendered via `<Markdown>`, per the prior
markdown-rendering plan, since `GEAR` descriptions contain `**bold**`
markup).

No data patch to `mavok-default.ts` — the fallback is computed live, so
patching the stored default would just create a second, driftable copy of
text that's already available from the catalog.

### 3. Pack unpacking

**Data layer.** 5etools' raw `items.json` already carries structured
`packContents` for exactly 7 XPHB items — confirmed by inspecting the source
directly:

```
Burglar's Pack, Diplomat's Pack, Dungeoneer's Pack, Entertainer's Pack,
Explorer's Pack, Priest's Pack, Scholar's Pack
```

(`Iron Spikes` also has a `packContents` — a single entry, `10× Iron Spike`
— and picks up "Abrir" support automatically as a side effect of the general
fix, with no special-casing needed.)

Each entry is a mix of bare ref strings (`"backpack|xphb"`, meaning quantity
1) and `{item: "oil|xphb", quantity: 2}` objects. All 30 distinct referenced
sub-items across all 7 packs were confirmed present by name in the extracted
`GEAR` catalog (`src/data/gear.ts`).

`GearData` (in `scripts/extract-5etools.ts` and the generated
`src/data/gear.ts`) gains:

```ts
export interface GearData {
  name: string;
  weight: number | null;
  value: number | null;
  description: string;
  packContents: { name: string; quantity: number }[] | null;
}
```

`extractGear()` resolves each `packContents` ref against a lookup map built
from the full (unfiltered) `raw.item` array in `items.json`, keyed by
`` `${name.toLowerCase()}|${(source ?? "").toLowerCase()}` `` (matching the
ref format 5etools uses, e.g. `"map or scroll case|xphb"`), so the resolved
`name` in the generated data is the item's real display name (`"Map or Scroll
Case"`), not a naively-capitalized slug. Items without `packContents` in the
source get `packContents: null` in the generated data (not `undefined` —
`JSON.stringify` on the generated `GearData[]` array needs an explicit,
consistent shape).

**UI.** In the expanded item view, if
`GEAR.find((g) => g.name === item.name)?.packContents` is non-null, render a
"Contenido" list (name × quantity per entry) and an "Abrir {item.name}"
button below it. Tapping the button opens a confirmation `Modal` (not
`window.confirm` — the app has already migrated every other destructive
confirmation to an in-app `Modal`, per `CLAUDE.md`'s notes on the Ajustes
redesign) listing exactly what will be added and what will happen to the
pack itself, with "Cancelar"/"Abrir" actions.

**On confirm**, a single atomic `update()` call (matching the pattern
`toggleEquipped` already uses for multi-field inventory changes):

- For each content entry: if an inventory item with that exact `name`
  already exists, its `quantity` increases by the content entry's quantity.
  Otherwise, a new `InventoryItem` is created — `id: crypto.randomUUID()`
  (not the `` `inv-${Date.now()}` `` pattern `handleAddItem` uses, since
  multiple items are created in the same tick here and `Date.now()` values
  could collide), `category: "gear"`, `weight`/`value` copied from the
  matching `GEAR` catalog entry, `equipped: false`, everything else at its
  default/empty value.
- The pack item's own `quantity` decreases by 1; if it was 1, the item is
  removed from `inventory` entirely.
- A `toast` confirms the unpack (matching the style of other inventory
  toasts, e.g. `` `${item.name} agregado` ``).

## Data model / migrations

No `Character` or `InventoryItem` schema changes, no migration. The only
schema change is `GearData.packContents` — a field on generated,
non-`Character` reference data (`src/data/gear.ts`), which isn't versioned
by `CURRENT_DATA_VERSION` and needs no migration, same as any other
`src/data/*.ts` re-extraction.

## Testing

- `resolveItemDescription` is a pure function — unit test in
  `src/lib/inventory.test.ts` covering: item with its own description
  (returned as-is), item matching a `WEAPONS` entry with empty description
  (summary format), item matching `ARMOR`, item matching `GEAR`, and an item
  matching nothing (empty string).
- No unit test for the unpack `update()` logic itself or the `ItemFormModal`
  component — both are UI-state-and-DOM heavy with no existing
  component-test harness in this repo (per `CLAUDE.md`), consistent with how
  the rest of `InventoryTab.tsx` is untested today.
- Manual verification per `CLAUDE.md`: run the dev server; edit an existing
  item and confirm the change persists; expand an item with an empty
  description that matches a catalog entry (Explorer's Pack) and confirm the
  fallback text appears; open the Explorer's Pack, confirm the confirmation
  modal lists all 8 contents correctly, confirm it, and confirm 8 new/updated
  rows appear and the pack itself is gone (had quantity 1); add a second
  Explorer's Pack, open it, and confirm sub-items that already exist from the
  first unpack get their quantity incremented rather than duplicated.
- `npx tsc --noEmit && npm run build && npm run lint && npm test` must all
  pass.
