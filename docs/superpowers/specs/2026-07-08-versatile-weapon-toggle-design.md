# Versatile Weapon Toggle — Design Spec

## Context

Weapons with the "Versatile" property (Battleaxe, Longsword, Quarterstaff, Spear, Trident, War Pick, Warhammer in XPHB) deal a different, higher damage die when wielded two-handed instead of one-handed. `5etools-src`'s `items-base.json` encodes this as `dmg1` (one-handed) / `dmg2` (two-handed) on each weapon, but `scripts/extract-5etools.ts`'s `extractWeapons()` only reads `dmg1` — so `src/data/weapons.ts` has no record of the two-handed die at all, and the Combat tab shows a single static damage die with no way to switch.

## Scope

- Adds the two-handed damage die to the generated weapons catalog.
- Adds a per-attack toggle (tap the existing "Versatile" property tag) that swaps the active damage die.
- Fixes a related pre-existing bug in damage-string formatting that the toggle's parsing would otherwise trip over.
- Out of scope: equipment-slot validation (blocking two-handed mode while a shield is equipped — the app doesn't model slot conflicts anywhere today), and auto-detecting melee-vs-thrown attack variants for Thrown+Versatile weapons (Spear, Trident) — the toggle is offered whenever `versatileDamage` is set, same "trust the player" approach as the rest of the app.

## Data Model

`src/data/weapons.ts` (generated) — `WeaponData` gains:
```ts
versatileDamage: string | null;
```
`scripts/extract-5etools.ts`'s `extractWeapons()` sets `versatileDamage: (i.dmg2 as string) || null`.

`src/lib/types.ts` — `Attack` gains:
```ts
versatileDamage: string | null;
```
This holds *the other die you'd get by toggling*, not a fixed "two-handed" value — `null` means no versatile toggle applies to this attack. Requires bumping `CURRENT_DATA_VERSION`, updating `mavok-default.ts`, and a migration that backfills `versatileDamage: null` on all existing attacks, with one best-effort exception: if an attack's `properties` includes `"Versatile"` and its name matches a `WEAPONS` catalog entry (exact match, or the established `"Name ("`-prefix convention for variant attacks), the migration backfills the real die from that catalog entry instead of `null` — so existing Longsword/Battleaxe/etc. attacks don't lose the capability just because they predate this feature. This requires `migrations.ts` to import `WEAPONS` from `src/data/weapons.ts` — a new but clean, non-circular dependency.

## Toggle Mechanics

A pure function in `src/lib/attackRoll.ts` (alongside the existing Attack helpers already covered by `attackRoll.test.ts`):

```ts
export function toggleVersatileDamage(attack: Attack): Attack {
  if (!attack.versatileDamage) return attack;
  const match = attack.damage.match(/^(.+?)([+-]\d+)?$/);
  const currentBase = match ? match[1].trim() : attack.damage;
  const mod = match?.[2] ?? "";
  return {
    ...attack,
    damage: `${attack.versatileDamage}${mod}`,
    versatileDamage: currentBase,
  };
}
```

Since `recalculateDerived` already preserves whatever's in `damage`'s dice-prefix (it only rewrites the trailing modifier on recompute), swapping the prefix here is all that's needed — the new die persists correctly across level-ups, equip toggles, and every other recompute trigger with no other code changes.

**Bug fix required for this to be safe**: `recalculateDerived`'s damage string is currently built as `` `${baseDice}+${atkMod + damageMagicBonus}` `` — a raw concatenation that hardcodes a literal `"+"`. When the total is negative (reachable now that negative magic damage bonuses exist), this produces `"1d10+-2"` instead of `"1d10-2"`, a double-sign string the toggle's regex would mis-parse, corrupting the stored base dice. Fix at the source using the existing `formatModifier` helper: `` `${baseDice}${formatModifier(atkMod + damageMagicBonus)}` ``.

## UI

- `AttackRow.tsx`'s expanded view currently renders `Propiedades: {attack.properties.join(", ")}` as one plain string. This changes to render each property individually; `"Versatile"` becomes a tappable button (only when `attack.versatileDamage` is set) calling a new `onToggleVersatile` prop, while every other property stays plain text. Tapping it swaps the die and the updated damage shows immediately in the collapsed row above.
- `AttackFormModal.tsx` gets a new optional field "Daño versátil (opcional, ej. 1d10)" mapped to `versatileDamage`, next to the existing "Daño" input. `formFromWeapon`/`prefillFromWeapon` (used by the "Arma rápida" quick-select) also prefill it from the `WEAPONS` catalog's `versatileDamage` when adding a new attack.
- `CombatTab.tsx` wires `onToggleVersatile={() => updateAttack(a.id, toggleVersatileDamage(a))}` into each `AttackRow`.

## Testing

Pure-function tests for `toggleVersatileDamage` in `attackRoll.test.ts`: swap forward (one-handed → two-handed die), swap back (toggling twice returns to the original), preserves the trailing modifier (including a negative one, now that the formatting bug is fixed), and no-op when `versatileDamage` is `null`. A migration test covers the name-match backfill (an old attack with `"Versatile"` in `properties` and a matching catalog name gets the real die; a non-matching or non-Versatile attack gets `null`). Standard `npx tsc --noEmit && npm run build && npm run lint && npm test` gate applies. UI verification (tapping the property tag, confirming the damage display updates) is interaction, not pure logic — verify by hand in a browser.
