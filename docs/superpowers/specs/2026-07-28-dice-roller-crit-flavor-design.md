# DiceRoller Crit/Fumble Flavor — Design

## Problem

`DiceResult.tsx:23-25` already detects crits/fumbles on a d20 roll
(`isD20 = roll.expression.startsWith("1d20")`, plus `isCrit`/`isFumble`
checks against `roll.rolls`) and shows a gold flash + "¡CRIT!" badge or a
red flash + "Pifia" badge. It's used everywhere a single roll is
displayed: `AttackRow.tsx`, `CombatVitals.tsx`, `SheetTab.tsx`. But
`DiceRoller.tsx` (the standalone quick-dice roller in Combate, with its
own 5-entry roll history) renders every roll as plain text
(`DiceRoller.tsx:59-79`) — a natural 20 on the loose d20 button gets no
celebration at all, unlike every other roll in the app.

`DiceResult` itself isn't reusable as-is here: it's built for exactly one
roll with an auto-close timer (`autoCloseMs`), not a persistent 5-entry
history list. So this reuses the *detection logic* and the *visual
language* (flash animation, badge), not the component itself.

## Changes

**`src/lib/dice.ts`** — extract the crit/fumble check that's currently
inline in `DiceResult.tsx` into pure, exported functions:

```typescript
function isD20Roll(roll: DiceRoll): boolean {
  return roll.expression.startsWith("1d20");
}

export function isD20Crit(roll: DiceRoll): boolean {
  return isD20Roll(roll) && roll.rolls.some((r) => r === 20);
}

export function isD20Fumble(roll: DiceRoll): boolean {
  return (
    isD20Roll(roll) &&
    roll.rolls.length > 0 &&
    roll.rolls.every((r) => r === 1)
  );
}
```

**`DiceResult.tsx`** — replace its inline `isD20`/`isCrit`/`isFumble`
calculation with calls to the new `isD20Crit(roll)`/`isD20Fumble(roll)`
imported from `@/lib/dice`. Purely a dedup — no behavior change, since
the logic is copied verbatim.

**`DiceRoller.tsx`** — for each entry in the `history.map((r, i) => ...)`
render:
- Compute `const crit = isD20Crit(r); const fumble = isD20Fumble(r);`
- **`i === 0`** (the just-landed roll): if `crit` or `fumble`, wrap the
  row in a `motion.div` with the same flash `initial`/`animate`/
  `transition` values `DiceResult.tsx:31-38` already uses (gold
  `boxShadow` pulse for crit, red for fumble, scale 1.15 → 1, 0.4s), and
  render the same "¡CRIT!"/"Pifia" badge spans (`DiceResult.tsx:49-54`)
  next to the total.
- **`i > 0`** (older history entries, already styled `text-muted`): if
  `crit` or `fumble`, render the same static badge and accent color
  (`text-success`/`text-danger`) as `DiceResult`, but with **no**
  `motion` wrapper and no flash animation — it already happened, so
  nothing pulses, but the historical record still shows what it was.

This needs a new `import { motion } from "framer-motion";` in
`DiceRoller.tsx` (not currently imported there) and `import { isD20Crit,
isD20Fumble } from "@/lib/dice";` (alongside the existing `rollDice`
import).

## Testing

`src/lib/dice.test.ts` (new — `dice.ts` currently has no test file) gets
cases for `isD20Crit`/`isD20Fumble`: a natural 20 on `rollD20()`, a
natural 1, a normal roll (neither), and a non-d20 expression (e.g.
`2d6+5`) — confirming it's never flagged as crit/fumble regardless of
its individual die values, since only `1d20*`-prefixed expressions
qualify (matching `rollD20WithAdvantage`'s `"1d20adv..."` expression,
which also correctly starts with `"1d20"`).

`DiceResult.tsx` and `DiceRoller.tsx` remain untested UI components,
consistent with the project's existing scope (`CLAUDE.md`: "No
component/UI tests yet").

## Out of Scope

- Any change to `DiceResult.tsx`'s own visible behavior (dedup only)
- Animating history entries other than the most recent one (explicitly
  declined — a static badge on old entries, no flash)
- Sound/haptics on crit/fumble (not requested here, separate idea)
