# Magic Item Bonuses (+N/-N) — Design Spec

## Context

`InventoryItem` (`src/lib/types.ts`) has no way to represent a magic item's numeric bonus. Today, equipping a `"+1 Leather Armor"`-style item does nothing beyond whatever `computeArmorClass`/`recalculateDerived` already do for mundane gear (matching by exact catalog name) — a magic bonus would be silently dropped, or the player would have to hand-track it off-sheet. This spec adds a general, opt-in numeric bonus (`+N`/`-N`) that can apply to attack & damage, AC, and/or saving throws, sourced from any equipped inventory item regardless of category.

This is Part 1 of two related features (per user decision): this spec covers numeric bonuses only. A second spec will separately cover item-granted special actions/bonus actions/reactions (e.g., "Boots of Speed: bonus action, double speed"), which is a different mechanic (a grantable ability, potentially with charge tracking) rather than a modifier to an existing computed number.

## Scope

- Adds `magicBonus` (signed integer) and `magicBonusTargets` (`"weapon" | "ac" | "save"`, multi-select) to `InventoryItem`.
- Wires the bonus into `computeArmorClass`, `recalculateDerived`'s attack computation, and `saveTotal` so the numbers already shown on the sheet (AC, attack bonus, damage string, save totals) reflect it automatically — no separate "magic bonus" line the player has to add by hand.
- Adds a settings toggle (`magicItemIndicator`) controlling whether an explicit `✦+N` badge appears next to affected numbers, or whether the corrected number alone is shown (default).
- Bonus is set at item creation time only, in the existing "Add Item" modal — matching the current app-wide limitation that no other inventory item field (name, weight, description, etc.) is editable after creation either. Not a new gap introduced by this feature.
- Out of scope: item-granted special actions/bonus actions/reactions (separate spec), attunement limits or stacking-legality validation (the app doesn't model attunement at all; it sums whatever's marked `equipped`, trusting the player the same way it already trusts them for rage slots, HP, etc.), editing an existing item's bonus after creation, and identifying/curse mechanics.

## Data Model

`src/lib/types.ts` — `InventoryItem` gains:

```ts
export interface InventoryItem {
  // ...existing fields...
  magicBonus: number | null;                          // +1, +2, -1, -2...
  magicBonusTargets: ("weapon" | "ac" | "save")[];    // what it modifies
}
```

Both default to `null` / `[]`. Requires:
- Bump `CURRENT_DATA_VERSION` in `types.ts`.
- New migration in `migrations.ts` backfilling every existing `InventoryItem` with `magicBonus: null, magicBonusTargets: []`.
- Update `mavok-default.ts` inventory entries with the same defaults.

No changes to `Attack` — a weapon's magic bonus is applied to its matching `Attack` at computation time (see below), not stored redundantly on the attack itself.

## Computation Integration

**AC** (`computeArmorClass`, `src/lib/recalculate.ts`): after the existing `base + shield` calculation, add the sum of `magicBonus` from every *equipped* inventory item (any category) whose `magicBonusTargets` includes `"ac"`. This is how a Ring of Protection (`category: "personal"`) contributes AC without ever touching the armor-catalog lookup that only fires for `category === "armor"`.

**Weapon attack/damage** (`recalculateDerived`'s attack loop): for each `Attack`, find an equipped weapon `InventoryItem` matching by the naming convention already established for the equip-offer feature (`i.name === a.name || a.name.startsWith(\`${i.name} (\`)`) whose `magicBonusTargets` includes `"weapon"`, and add its `magicBonus` to both `attackBonus` and the damage modifier (e.g. `1d8+1` → `1d8+2` for a +1 weapon). A single number covers both attack and damage together — matching real 5e magic weapons, which never buff one without the other.

**Saves** (`saveTotal`, `src/lib/utils.ts`): sum `magicBonus` from every equipped item with `"save"` in `magicBonusTargets`, added flat across all six abilities (matches a Ring/Cloak of Protection's actual wording — a general save bonus, not tied to one ability).

**Shared helpers** (`src/lib/recalculate.ts`), used both by the computations above and by the UI indicator (Section below), so the equipped-item-matching logic isn't duplicated:

```ts
export function sumMagicBonus(
  character: Character,
  target: "ac" | "save" | "weapon"
): number;

export function findMagicWeaponBonus(
  character: Character,
  attack: Attack
): number;
```

**Trigger point**: `InventoryTab.tsx`'s `toggleEquipped` currently calls `computeArmorClass` only for `category === "armor"`. It's simplified to call the full `recalculateDerived(next)` on every equip/unequip toggle regardless of category — safe, since `recalculateDerived` is a pure, idempotent recompute from current state, and this naturally keeps AC and attack bonuses in sync on any equipment change without category-specific branches.

## UI & Display

**Add Item modal** (`InventoryTab.tsx`): two new optional fields — a numeric input "Bono mágico" (accepts negative values) and, shown once a non-zero bonus is entered, checkboxes "Aplica a: [ ] Ataque y daño  [ ] CA  [ ] Salvaciones". An empty or zero value is treated as no bonus (`magicBonus: null, magicBonusTargets: []`).

**Inventory list row**: a small badge next to the item name (same visual weight as the existing `×{quantity}` suffix) showing the signed bonus, e.g. `Leather Armor` **`+1`** — recognizable at a glance without expanding the row.

**Expanded item view**: a line under the description, e.g. `Bono mágico: +1 (Ataque y daño)`, listing whichever targets are checked.

**Explicit indicator setting**: new `AppSettings.magicItemIndicator: "number-only" | "explicit-tag"` field (default `"number-only"`), following the exact existing pattern of `density`/`encyclopediaLanguage` — no migration needed since `loadSettings()` already merges `{ ...defaults, ...JSON.parse(raw) }`. `useTheme.ts` gets a matching `setMagicItemIndicator`; `SettingsTab.tsx` gets a new toggle row: "Indicador de bonos mágicos" → **Solo número** / **Etiqueta explícita**.

When `magicItemIndicator === "explicit-tag"`, render a small `✦+N` badge (icon + signed value together) next to the relevant number:
- `AttackRow.tsx`: next to the attack's damage, using `findMagicWeaponBonus`.
- Combat tab: next to the AC number, using `sumMagicBonus(character, "ac")`.
- `SheetTab.tsx`: next to each save total, using `sumMagicBonus(character, "save")`.

When `"number-only"` (default), none of these render — the corrected number itself is the only indication.

## Testing

Pure-function coverage in existing/new `*.test.ts` files:

- `recalculate.test.ts` (`computeArmorClass`): magic AC bonus from an `armor`-category item; magic AC bonus from a non-armor item (e.g. `personal` Ring of Protection); negative bonus; combined stacking (worn armor + shield + ring, all contributing).
- `recalculate.test.ts` (`recalculateDerived`): weapon magic bonus applied to both `attackBonus` and `damage` when a matching equipped inventory item has `"weapon"` in `magicBonusTargets`; unaffected when the item isn't equipped, doesn't match by name, or lacks the `"weapon"` target.
- New `utils.test.ts`: `saveTotal` base behavior (mirroring what's implicitly covered elsewhere today) plus new cases for flat magic save bonus from one or more equipped items.
- `migrations.test.ts`: new migration step backfills `magicBonus: null, magicBonusTargets: []` on old data.

UI/display (indicator badge, Add Item form fields, settings toggle) is interaction, not pure logic — verify by hand: add a `+1` weapon item, equip it, confirm its `Attack` damage/attack bonus increase by 1; toggle the indicator setting and confirm the `✦+1` badge appears/disappears accordingly in Combat tab and Sheet tab; add a `+1` Ring of Protection (category `personal`, targets AC+save) and confirm both AC and every save total increase by 1. Standard `npx tsc --noEmit && npm run build && npm run lint && npm test` gate applies.
