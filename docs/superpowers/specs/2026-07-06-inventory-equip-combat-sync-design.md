# Inventory Equip → Combat Sync — Design Spec

## Context

`InventoryItem` and `Attack` (`src/lib/types.ts`) are completely separate, unlinked shapes — no shared ID, no cross-reference. Toggling `equipped` on an inventory item currently has **zero** effect anywhere else in the app:

- **Armor**: `combat.armorClass` is hardcoded in `recalculate.ts` to Mavok's Barbarian Unarmored Defense formula (`10 + DEX mod + CON mod`), recomputed only at level-up, with no awareness of equipped armor at all.
- **Weapons**: the Combat tab's attack list (`character.attacks`) is populated entirely by hand via "+ Agregar ataque" (`AttackFormModal`), independent of the Inventory tab. Equipping a weapon item does nothing to it.

The AC modal that already exists in `CombatTab.tsx` (`"Modificador temporal de AC"`) is explicitly for session-only temporary bonuses (Shield spell, cover, etc.) — it's local component state, not persisted, and not a substitute for a real "what armor am I wearing" calculation.

## Scope

- Fixes AC computation to respect equipped armor/shield, falling back to Unarmored Defense when nothing (non-shield) is equipped.
- Adds a one-tap **offer**, not automatic sync, to create a matching `Attack` entry when equipping a cataloged weapon.
- Out of scope: heavy armor Strength-requirement speed penalty, stealth disadvantage, auto-deleting `Attack` entries on unequip, and any two-way sync that could clobber manually-customized attacks. These are deliberately left alone — the goal is closing the "equipping does nothing" gap, not building a full equipment simulation.

## Part 1: Armor equip → AC

Extract a new exported function in `src/lib/recalculate.ts`:

```ts
export function computeArmorClass(character: Character): number {
  const dexMod = abilityModifier(character.attributes.dex);
  const conMod = abilityModifier(character.attributes.con);

  const equippedArmorNames = character.inventory
    .filter((i) => i.category === "armor" && i.equipped)
    .map((i) => i.name);

  const wornArmor = ARMOR.find(
    (a) => equippedArmorNames.includes(a.name) && a.type !== "shield"
  );
  const shield = ARMOR.find(
    (a) => equippedArmorNames.includes(a.name) && a.type === "shield"
  );

  const dexCap =
    wornArmor?.type === "heavy" ? 0 : wornArmor?.type === "medium" ? 2 : null;
  const base = wornArmor
    ? wornArmor.ac + (dexCap !== null ? Math.min(dexMod, dexCap) : dexMod)
    : 10 + dexMod + conMod; // Unarmored Defense fallback

  return base + (shield?.ac ?? 0);
}
```

`recalculateDerived` calls this instead of its current hardcoded line (same trigger point: level-up).

`InventoryTab.tsx`'s single equip-toggle handler (currently just `updateInventoryItem(item.id, { equipped: !item.equipped })`) is replaced with one function that branches by category, still producing one atomic state change via `update()` (already exposed via `useCharacterContext()`, currently unused in this file):

```ts
function toggleEquipped(item: InventoryItem) {
  const nowEquipped = !item.equipped;
  update((c) => {
    const inventory = c.inventory.map((i) =>
      i.id === item.id ? { ...i, equipped: nowEquipped } : i
    );
    const next = { ...c, inventory };
    return item.category === "armor"
      ? { ...next, combat: { ...next.combat, armorClass: computeArmorClass(next) } }
      : next;
  });
  // Weapon-offer toast (Part 2) fires here, after the state update, using
  // `nowEquipped` and the pre-toggle `character.attacks` still in scope.
}
```

Gear/consumable/personal items pass through unchanged (`next` as-is, no side effect). See Part 2 for what the weapon branch adds.

## Part 2: Weapon equip → offer to add an Attack

1. `AttackFormModal` (`src/components/combat/AttackFormModal.tsx`) gains a new optional prop `initialWeaponName?: string`. In the existing sync-on-open block (currently: prefill from `existingAttack` or reset to `EMPTY_FORM`), add a third branch: if there's no `existingAttack` but `initialWeaponName` is set, prefill via the same lookup `prefillFromWeapon` already does internally. This is additive — existing callers (CombatTab) are unaffected since they never pass this prop.

2. `InventoryTab.tsx` imports `AttackFormModal` and `addAttack` from context, adding local state `const [attackPrefillWeapon, setAttackPrefillWeapon] = useState<string | null>(null)`, and renders the modal:

```tsx
<AttackFormModal
  open={attackPrefillWeapon !== null}
  onClose={() => setAttackPrefillWeapon(null)}
  onSave={(a) => { addAttack(a); setAttackPrefillWeapon(null); }}
  initialWeaponName={attackPrefillWeapon ?? undefined}
/>
```

3. `toggleEquipped` (Part 1), when marking a `category: "weapon"` item as equipped (`nowEquipped === true`), checks two things before offering: the name matches an entry in `WEAPONS`, and no existing `Attack` already tracks that weapon. Existing attacks in this app follow a `"Weapon Name (variant)"` convention for multi-mode weapons (e.g. `"Handaxe (melee)"`, `"Handaxe (thrown)"` — there's no attack literally named `"Handaxe"`), so an exact-name check would miss these and re-prompt every time the Handaxe is re-equipped. Match with `character.attacks.some(a => a.name === item.name || a.name.startsWith(item.name + " ("))` instead. If both conditions hold:

```ts
toast(`¿Agregar "${item.name}" a tus acciones de combate?`, {
  action: { label: "Agregar", onClick: () => setAttackPrefillWeapon(item.name) },
});
```

This needs `attacks` from `character` in scope (already destructured or easily added) to check the "not already tracked" condition. Un-equipping a weapon does nothing — no toast, no removal of any existing `Attack`.

## Testing

`computeArmorClass` is a pure function — add unit tests in `recalculate.test.ts` alongside existing coverage:
- No armor equipped → Unarmored Defense (`10 + dexMod + conMod`)
- Light armor equipped → `armor.ac + dexMod` (uncapped)
- Medium armor equipped → `armor.ac + min(dexMod, 2)`
- Heavy armor equipped → `armor.ac` flat (no dex)
- Shield equipped alone → Unarmored Defense + shield AC
- Shield equipped with body armor → body armor calc + shield AC

The weapon-offer toast and modal wiring is UI interaction, not pure logic — verify by hand: equip a weapon matching `WEAPONS` (e.g. add "Spear" to inventory, equip it), confirm the toast appears with a working "Agregar" action that opens `AttackFormModal` pre-filled; confirm re-equipping the Maul (already an existing attack named exactly "Maul") does *not* prompt; confirm re-equipping the Handaxe (existing attacks are "Handaxe (melee)"/"Handaxe (thrown)", not an exact "Handaxe" match) also does *not* prompt, exercising the `startsWith` branch specifically; confirm unequipping never prompts. Standard `npx tsc --noEmit && npm run build && npm run lint && npm test` gate applies.
