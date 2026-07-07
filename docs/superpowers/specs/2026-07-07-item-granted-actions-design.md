# Item-Granted Special Actions/Bonus Actions/Reactions — Design Spec

## Context

This is Part 2 of the two-part magic item feature (Part 1: numeric `+N`/`-N` bonuses, already shipped). Part 2 covers the other half of the original request: an item can grant an entirely new action/bonus action/reaction — not a modifier to an existing computed number, but a new grantable ability (e.g. "Boots of Speed: bonus action, double speed for 1 minute"), optionally with its own limited-use charge tracking, similar in shape to how Stone's Endurance already works (a reaction with `total`/`remaining` uses that recharge on rest).

The Combat tab's Actions/Bonus Actions/Reactions sections (`CombatTab.tsx`) are currently hand-authored cards (attacks, Rage, Stone's Endurance, Healer's Kit, Opportunity Attack) — there's no generic mechanism today for "any equipped item can contribute a card to one of these three sections."

## Scope

- Adds one optional `grantedAction` to `InventoryItem`, allowed on any category (matching Part 1's "all categories" precedent for magic bonuses — not gated to weapon/armor).
- Adds a reusable Combat tab card for any equipped item's granted action, shown in whichever of the three sections (Acciones/Acciones adicionales/Reacciones) matches its type.
- Adds optional charge tracking (total/remaining, recharging on short rest, long rest, or never/manual) reusing the app's existing rest flows.
- Out of scope: multiple granted actions per item (split into separate inventory entries if ever needed), editing a granted action after item creation (same creation-only limitation as every other item field), and spending more than 1 charge per use (Usar always consumes exactly 1, matching Stone's Endurance).

## Data Model

`src/lib/types.ts` — new exported type and `InventoryItem` field:

```ts
export interface GrantedAction {
  name: string;
  actionType: "action" | "bonus" | "reaction";
  description: string;
  charges: {
    total: number;
    remaining: number;
    recharge: "short" | "long" | "none";
  } | null; // null = always available, no tracking
}

export interface InventoryItem {
  // ...existing fields...
  grantedAction: GrantedAction | null;
}
```

Defaults to `null`. Requires bumping `CURRENT_DATA_VERSION` (v9 → v10), a migration backfilling `grantedAction: null` on every existing item, and updating `mavok-default.ts`.

`charges.remaining` lives on the item itself (mutated via `updateInventoryItem`, the same way `quantity` already does) — no separate top-level `resources` entry, since granted actions come from arbitrary future items rather than being fixed class/species features. `remaining` persists across equip/unequip toggles (unequipping doesn't reset or hide the stored charge count, only the card's visibility in Combat).

## Rest Integration

Recharge semantics: `"short"` recharges on **either** a short or long rest (a long rest is a superset event); `"long"` only recharges on a long rest; `"none"` never auto-recharges (manual +/- adjustment only, via the same editing UI described below).

`SettingsTab.tsx`'s `applyLongRest` gains a step: for every `InventoryItem` with `grantedAction?.charges` present (regardless of `"short"` or `"long"`), reset `remaining: total`. Items with `"none"` are left untouched.

The "Descanso corto" modal's "Terminar descanso" button gains a step: for every item with `grantedAction?.charges?.recharge === "short"`, reset `remaining: total`. Items with `"long"` or `"none"` are untouched on a short rest.

## Combat Tab UI

New reusable component `GrantedActionCard.tsx` (`src/components/combat/`), mirroring the existing Stone's Endurance/Healer's Kit card pattern exactly — including `useLongPress` for the "Usar" button (disabled at `remaining <= 0`) and a local `editing` toggle exposing -/+ buttons to manually adjust `remaining` (clamped to `[0, total]`). Built as its own component rather than duplicated inline JSX, since there can now be an arbitrary number of granted-action items equipped at once — unlike Stone's Endurance/Healer's Kit, which only work inline because there's exactly one of each.

Props (explicit, not the whole nullable-shaped `InventoryItem`, since the parent already guarantees non-null via the filter below):

```ts
{
  itemName: string;
  grantedAction: GrantedAction;
  onUse: () => void;
  onAdjust: (remaining: number) => void;
}
```

Renders the action's name, a small muted line naming the source item (e.g. "— Guantes de Poder", useful once more than one magic item is equipped), the description, and — only if `charges` is non-null — the `remaining/total` counter with the "Usar"/editing controls. If `charges` is `null`, it's just a description card, always shown while equipped.

A small pure helper in `utils.ts`:

```ts
export function getEquippedGrantedActions(
  character: Character,
  actionType: "action" | "bonus" | "reaction"
): InventoryItem[];
```

`CombatTab.tsx` renders `getEquippedGrantedActions(character, "action").map(...)` in **Acciones** (after the Healer's Kit card, before "Acciones estándar"), `"bonus"` in **Acciones adicionales** (before "Bonus Actions estándar"), and `"reaction"` in **Reacciones** (after Opportunity Attack, before "Reacciones estándar") — each wired to `onUse`/`onAdjust` closures over `updateInventoryItem` (added to `CombatTab`'s context destructuring).

## Add Item Form UI

In `InventoryTab.tsx`'s Add Item modal, below the existing magic-bonus fields: a checkbox "Otorga una acción especial (opcional)". When checked, reveals:
- Nombre (text)
- Tipo: select — Acción / Bonus Action / Reacción
- Descripción (textarea)
- Checkbox "Usos limitados" → reveals Total usos (number) + Recarga: select — Descanso corto / Descanso largo / Sin recarga

Mirrors the existing magic-bonus conditional-reveal pattern (Part 1) rather than introducing a separate modal. Same creation-only limitation as every other item field (no edit-after-creation).

## Testing

`getEquippedGrantedActions` gets unit tests (equipped vs unequipped, matching action type vs not, multiple items across different types). Rest-integration recharge logic (`applyLongRest`, short-rest "Terminar descanso") and the Combat tab card/editing UI are interaction, not pure logic — verify by hand: add an item with a charge-tracked bonus action, equip it, confirm its card appears in Acciones adicionales with the right remaining/total; spend a charge and confirm it decrements; take a short rest and confirm a `"short"`-recharge item resets while a `"long"`-recharge item doesn't; take a long rest and confirm both reset; unequip the item and confirm its card disappears without losing the stored `remaining` value. Standard `npx tsc --noEmit && npm run build && npm run lint && npm test` gate applies.
