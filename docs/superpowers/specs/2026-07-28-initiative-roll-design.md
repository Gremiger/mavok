# Tap-to-Roll Initiative — Design

## Problem

Every other d20 test in the app (ability checks, saves, skills in
`SheetTab.tsx`; attacks in `AttackRow.tsx`) is one tap away, showing a
`DiceResult` with the roll breakdown. Initiative is the one exception:
`CombatVitals.tsx:120` renders it as a static `StatBadge` with no
`onClick`, so at the start of combat the player has to compute and roll
Initiative outside the app entirely.

## Scope

`combat.initiative` (`recalculate.ts:69`, currently `dexMod`) is
unchanged — this design only adds the ability to roll it and see the
result, it doesn't change how the base value is derived. Confirmed
against `barbarian-progression.ts:181` that Danger Sense (level 2) only
grants Advantage on Dexterity saving throws, not on Initiative — so this
is a plain `1d20 + initiative + exhaustionPenalty`, no advantage logic
needed, unlike `rollSave`'s Dex-save special case in `SheetTab.tsx`.

## Changes

**`CombatVitals.tsx`** (presentational component, unchanged pattern —
stays fully controlled via props, no internal roll logic):
- Two new props: `onRollInitiative: () => void`, `initiativeRoll:
  DiceRoll | null` (`DiceRoll` from `@/lib/dice`)
- The "Init" `StatBadge` (line 120) gets `onClick={onRollInitiative}`
  added — `StatBadge` already renders as a `<button>` whenever `onClick`
  is passed (`StatBadge.tsx`), so no change needed there
- After the badge row's closing `</div>` (line 128), conditionally
  render:
  ```tsx
  {initiativeRoll && (
    <div className="mt-2">
      <DiceResult
        roll={initiativeRoll}
        label="Iniciativa"
        onClear={() => onClearInitiativeRoll()}
      />
    </div>
  )}
  ```
  (This needs a third prop, `onClearInitiativeRoll: () => void`, since
  `CombatVitals` doesn't own the state — matches how every other
  vitals field here is controlled from `CombatTab.tsx`.)

**`CombatTab.tsx`** (owns the logic, matching where every other roll
handler already lives in this file's sibling `SheetTab.tsx`):
- New imports: `rollD20` and `type DiceRoll` from `@/lib/dice`,
  `exhaustionPenalty` from `@/lib/exhaustion`
- New state: `const [initiativeRoll, setInitiativeRoll] = useState<DiceRoll | null>(null);`
- New handler:
  ```typescript
  function rollInitiative() {
    const total = combat.initiative + exhaustionPenalty(combat.exhaustionLevel);
    setInitiativeRoll(rollD20(total));
  }
  ```
- Passes `onRollInitiative={rollInitiative}`,
  `initiativeRoll={initiativeRoll}`, and
  `onClearInitiativeRoll={() => setInitiativeRoll(null)}` to
  `<CombatVitals>`

## Testing

No new pure-logic module — `rollInitiative` is a thin wrapper composing
two already-tested functions (`rollD20`, `exhaustionPenalty`), consistent
with how `rollAbility`/`rollSave`/`rollSkill` in `SheetTab.tsx` are
untested UI-layer glue today. Verification is `tsc`/`build`/`lint` plus
a manual walkthrough (tap Init, see a `DiceResult` appear with the
correct total, tap ✕ or wait 4s for auto-close, confirm exhaustion
penalty is included when `exhaustionLevel > 0`).

## Out of Scope

- Changing how `combat.initiative` itself is derived (stays `dexMod`)
- Advantage/disadvantage on the Initiative roll (confirmed not
  applicable — Danger Sense is Dex-saves only)
- Any change to `StatBadge.tsx` (already supports `onClick`)
