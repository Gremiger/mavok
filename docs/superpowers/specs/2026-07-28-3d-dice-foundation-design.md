# 3D Dice Rolling — Sub-project 1: Foundation — Design

## Problem

The user wants an option to roll dice with a real 3D physics animation
(via `@3d-dice/dice-box`) instead of the current instant text result,
everywhere a roll happens in the app. Investigated two candidate
libraries first:

- **`roll-a-die`**: CSS-animated, **d6 only**. Disqualified — nearly
  every roll in this app is a d20 test (abilities, saves, skills,
  attacks, initiative) or non-d6 damage dice (d12 Maul, etc.), which
  this library cannot represent.
- **`@3d-dice/dice-box`**: real 3D physics (BabylonJS + AmmoJS),
  supports arbitrary dice notation (`2d20`, `1d12+4`, ...). Static
  assets are copied to a local `public/` folder at install time — no
  CDN dependency, compatible with this project's static export. No
  documented API to force a specific die face (confirmed by reading
  `usage/methods`, `usage/config`, and `addons/advRoller` docs) — but
  this isn't a blocker: this design treats `dice-box` purely as a
  source of random die faces, with all of the app's own modifier/
  advantage/exhaustion math staying exactly where it is today.

**Scope decomposition** (agreed with the user): this is too large for
one spec, since switching to `dice-box` changes every roll call site
from synchronous (`rollD20()` returns instantly) to asynchronous (the
physics animation takes 1-3 seconds before `dice-box`'s completion
callback fires). Three sub-projects:

1. **Foundation (this spec)**: split `dice.ts` into "generate raw
   faces" vs. "compose a total", convert every roll call site to
   `async`/`await`, and add the (currently invisible) `diceRollMode`
   setting — zero visible behavior change.
2. **Minimal integration**: add `@3d-dice/dice-box`, a lazy-loaded
   global canvas, and wire the 3D path into the one most-isolated call
   site (`DiceRoller`'s quick dice) to validate the whole pipeline.
3. **Full rollout**: extend 3D mode to Ficha (abilities/saves/skills)
   and Combate (attacks, initiative), now that the pipeline is proven.

## `dice.ts` Refactor

Split the raw-face generation from the total composition, so a future
non-`Math.random()` source (dice-box's physics results) can plug into
the same composition logic without duplicating it:

```typescript
export function parseExpression(
  expression: string
): { count: number; faces: number; modifier: number } {
  const match = expression.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) throw new Error(`Invalid dice expression: ${expression}`);
  return {
    count: parseInt(match[1]),
    faces: parseInt(match[2]),
    modifier: match[3] ? parseInt(match[3]) : 0,
  };
}

export function generateFaces(count: number, faces: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * faces) + 1);
}

export function composeRoll(
  expression: string,
  rolls: number[],
  modifier: number
): DiceRoll {
  return {
    expression,
    rolls,
    modifier,
    total: rolls.reduce((a, b) => a + b, 0) + modifier,
    timestamp: Date.now(),
  };
}

export function rollDice(expression: string): DiceRoll {
  const { count, faces, modifier } = parseExpression(expression);
  return composeRoll(expression, generateFaces(count, faces), modifier);
}
```

`rollD20(modifier)` is unchanged (still delegates to `rollDice`).
`rollD20WithAdvantage(modifier)` switches its two `Math.random()` calls
to `generateFaces(2, 20)`, but keeps its own "max of the two" total
calculation inline — `composeRoll` sums every roll, which is wrong for
advantage, so it doesn't fit there.

New async wrappers (no 3D logic yet — they just await the existing
synchronous path, establishing the seam sub-project 2 will fill in
without touching any call site again):

```typescript
export async function rollDiceAsync(expression: string): Promise<DiceRoll> {
  return rollDice(expression);
}

export async function rollD20Async(modifier: number = 0): Promise<DiceRoll> {
  return rollD20(modifier);
}

export async function rollD20WithAdvantageAsync(
  modifier: number = 0
): Promise<DiceRoll> {
  return rollD20WithAdvantage(modifier);
}
```

## Call Site Conversions

All of these become `async` and `await` the `*Async` dice function —
mechanical, zero behavior change (an immediately-resolved `Promise`
inside a React event handler behaves identically to a synchronous
return, just one microtask later):

- **`src/lib/attackRoll.ts`**: `rollAttackHit`/`rollAttackDamage` become
  `async`, awaiting `rollD20Async`/`rollD20WithAdvantageAsync`/
  `rollDiceAsync` in place of their current synchronous calls.
  `attackRoll.test.ts`'s existing tests for both functions add `await`.
- **`src/lib/hitDice.ts`**: `spendHitDie` becomes `async`, awaiting
  `rollDiceAsync`. `hitDice.test.ts` adds `await`.
- **`src/components/tabs/SheetTab.tsx`**: `rollAbility`, `rollSave`,
  `rollSkill`, `rollSkillStr` become `async`, awaiting
  `rollD20Async`/`rollD20WithAdvantageAsync` before calling
  `setActiveRoll`.
- **`src/components/tabs/CombatTab.tsx`**: `rollInitiative` becomes
  `async`, awaiting `rollD20Async` before calling `setInitiativeRoll`.
- **`src/components/combat/AttackRow.tsx`**: `handleRollHit`/
  `handleRollDamage` become `async`, awaiting `rollAttackHit`/
  `rollAttackDamage` (now themselves async per above) before calling
  `setLastRoll`.
- **`src/components/combat/DiceRoller.tsx`**: `roll(expression)` becomes
  `async`, awaiting `rollDiceAsync` before calling `setHistory`.
- **`src/components/tabs/SettingsTab.tsx`**: the short-rest flow that
  calls `computeHitDieSpend` (the renamed import of `spendHitDie`)
  awaits it before applying the result.
- **`src/components/levelup/LevelUpFlow.tsx`**: `rollHp()`
  (`LevelUpFlow.tsx:118-120`, the level-up HP die roll) becomes `async`,
  awaiting `rollDiceAsync("1d12+0")` before calling `setHpRoll`.

## Setting (No UI Yet)

`AppSettings` (`src/lib/types.ts:189-196`) gains:

```typescript
diceRollMode: "text" | "3d";
```

Default `"text"` in `storage.ts`'s `loadSettings()` defaults object —
no migration mechanism needed here since `AppSettings` isn't part of
the versioned `Character` chain; `loadSettings` already merges stored
JSON over defaults (`{ ...defaults, ...JSON.parse(raw) }`), so an old
stored settings blob missing this key just gets the default for free.

`useTheme.ts` gains `diceRollMode` state and a `setDiceRollMode`
setter, mirroring the existing `magicItemIndicator`/
`setMagicItemIndicator` pair exactly (load in the mount effect, setter
writes through `saveSettings`).

**No toggle is added to `SettingsTab.tsx` in this sub-project** — per
the user's explicit choice, since selecting "3D" wouldn't visibly do
anything until sub-project 2 lands, and a toggle that appears to do
nothing would be confusing. The setting exists and round-trips through
storage, ready for sub-project 2 to both read it and expose its UI.

## Testing

- `dice.test.ts` gets cases for `parseExpression` (valid expression,
  invalid expression throws), `generateFaces` (correct count, values
  within `1..faces` range), and `composeRoll` (correct total/modifier
  composition) — plus the existing `isD20Crit`/`isD20Fumble` tests
  continue to pass against `rollDice`'s unchanged output shape.
- `attackRoll.test.ts` and `hitDice.test.ts`: existing tests updated to
  `await` the now-async functions; no new test cases needed since the
  underlying logic is unchanged.
- No test needed for the async wrappers themselves beyond confirming
  they resolve to the same shape `rollDice`/`rollD20`/
  `rollD20WithAdvantage` already produce (covered by the existing
  `dice.test.ts` assertions once awaited).

## Out of Scope

- Installing `@3d-dice/dice-box` or any 3D rendering (sub-project 2)
- The global canvas component (sub-project 2)
- Any visible UI for switching modes (sub-project 2)
- Extending async conversion to anything not listed above — confirmed
  by `grep -rln "rollDice(\|rollD20(\|rollD20WithAdvantage(" src/` that
  every non-test call site is one of: `dice.ts` itself, `attackRoll.ts`,
  `hitDice.ts`, `SheetTab.tsx`, `CombatTab.tsx`, `DiceRoller.tsx`, and
  `LevelUpFlow.tsx` — all listed above
