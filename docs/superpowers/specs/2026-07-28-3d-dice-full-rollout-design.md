# 3D Dice Rolling — Sub-project 3: Full Rollout — Design

## Problem

Sub-project 2 wired `rollDiceMode` into exactly one call site
(`DiceRoller.tsx`'s standalone quick-dice roller). This sub-project
extends 3D-aware rolling to Ficha (ability/save/skill checks) and
Combate (attacks, initiative) — the remaining roll sites that make up
the actual character-sheet gameplay, as opposed to the free-form dice
utility. Per explicit scope decision, `spendHitDie` (short rest) and
`LevelUpFlow`'s HP roll stay text-only for now — not part of this pass.

Confirmed by grepping the codebase for every caller of `rollD20Async`,
`rollD20WithAdvantageAsync`, `rollAttackHit`, and `rollAttackDamage`:
exactly four UI files need changes — `SheetTab.tsx`, `CombatTab.tsx`,
`AttackRow.tsx`, and `QuickActionsFab.tsx` (the quick-actions FAB, which
reuses `rollAttackHit`/`rollAttackDamage` for its own attack-roll/
attack-damage actions — not named in the original 3-sub-project plan,
but unavoidable once those two functions' signatures change).

## `rollWithMode.ts` Additions

Two new functions, alongside the existing `rollDiceMode`:

```typescript
export async function rollD20Mode(
  modifier: number,
  mode: AppSettings["diceRollMode"]
): Promise<RollWithModeResult> {
  return rollDiceMode(`1d20${modifier >= 0 ? "+" : ""}${modifier}`, mode);
}

export async function rollD20WithAdvantageMode(
  modifier: number,
  mode: AppSettings["diceRollMode"]
): Promise<RollWithModeResult> {
  if (mode === "3d") {
    try {
      const faceValues = await roll3D(2, 20);
      const roll: DiceRoll = {
        expression: `1d20adv${modifier >= 0 ? "+" : ""}${modifier}`,
        rolls: faceValues,
        modifier,
        total: Math.max(...faceValues) + modifier,
        timestamp: Date.now(),
      };
      setTimeout(() => hide3D(), 1500);
      return { roll, usedFallback: false };
    } catch {
      // Falls through to the text path below.
    }
  }
  return { roll: rollD20WithAdvantage(modifier), usedFallback: mode === "3d" };
}
```

`rollD20Mode` is a thin delegate — `1d20+5` already matches
`rollDiceMode`'s expected `countdfaces[+modifier]` notation exactly, so
no new logic is needed there. `rollD20WithAdvantageMode` can't reuse
`rollDiceMode`/`composeRoll` (which sums every roll) because advantage
needs "keep the higher of two" — it builds the `DiceRoll` by hand, the
same reason `rollD20WithAdvantage` in `dice.ts` doesn't go through
`composeRoll` either.

## `attackRoll.ts` Signature Change

`rollAttackHit`/`rollAttackDamage` gain a `mode` parameter and swap
their internal calls from the plain `*Async` dice functions to the new
mode-aware ones:

```typescript
export async function rollAttackHit(
  attack: Attack,
  opts: { recklessActive: boolean; exhaustionLevel: number },
  mode: AppSettings["diceRollMode"]
): Promise<DiceRoll> {
  const bonus = attack.attackBonus + exhaustionPenalty(opts.exhaustionLevel);
  const { roll } =
    opts.recklessActive && isStrBasedAttack(attack)
      ? await rollD20WithAdvantageMode(bonus, mode)
      : await rollD20Mode(bonus, mode);
  return roll;
}

export async function rollAttackDamage(
  attack: Attack,
  opts: { rageActive: boolean; rageDamage: number },
  mode: AppSettings["diceRollMode"]
): Promise<DiceRoll> {
  const rageBonus = computeRageBonus(attack, opts.rageActive, opts.rageDamage);
  const dmgExpr = attack.damage.replace(/\s/g, "");
  let expr = dmgExpr;
  if (rageBonus > 0) {
    const match = expr.match(/^(.+?)([+-]\d+)$/);
    if (match) {
      const newMod = parseInt(match[2]) + rageBonus;
      expr = `${match[1]}${newMod >= 0 ? "+" : ""}${newMod}`;
    } else {
      expr = `${expr}+${rageBonus}`;
    }
  }
  const { roll } = await rollDiceMode(expr, mode);
  return roll;
}
```

Both keep returning a plain `DiceRoll` (not `RollWithModeResult`) — the
`usedFallback` signal isn't surfaced here; per the same reasoning as
sub-project 2, only `DiceRoller.tsx` (the one place a bare toast makes
contextual sense) shows the "3D no disponible" message today. Extending
that toast to attacks/saves/etc. is a UX decision beyond this sub-project's
scope — noted below under Out of Scope.

## Call Site Changes

All four files read `diceRollMode` from `useThemeContext()` (already
available since sub-project 1) and thread it through:

- **`SheetTab.tsx`**: `rollAbility`/`rollSkill`/`rollSkillStr` switch
  from `rollD20Async(x)` to `(await rollD20Mode(x, diceRollMode)).roll`.
  `rollSave` switches its `rollD20WithAdvantageAsync`/`rollD20Async`
  branch to `rollD20WithAdvantageMode`/`rollD20Mode` the same way.
- **`CombatTab.tsx`**: `rollInitiative` switches from `rollD20Async` to
  `rollD20Mode`.
- **`AttackRow.tsx`**: already imports `useThemeContext()` for
  `density`/`magicItemIndicator` (`AttackRow.tsx:14,49`) — just add
  `diceRollMode` to that existing destructure. `handleRollHit`/
  `handleRollDamage` pass it as the third argument to `rollAttackHit`/
  `rollAttackDamage`.
- **`QuickActionsFab.tsx`**: doesn't import `useThemeContext` today (it
  only imports `useCharacterContext`, `QuickActionsFab.tsx:17`) — needs
  the import added. The `attackRoll`/`attackDamage` switch cases pass
  `diceRollMode` as the third argument to the same two functions.

## `SettingsTab.tsx` Label Update

The toggle added in sub-project 2 said "3D (solo Dado suelto por
ahora)" — that qualifier is now false, since 3D covers every roll in
the app. Update the label to drop it:

```typescript
name={`Modo de tirada: ${diceRollMode === "3d" ? "3D" : "Texto"}`}
```

## Testing

- `attackRoll.test.ts`: all 7 existing calls to `rollAttackHit`/
  `rollAttackDamage` add a third argument, `"text"` — the tests assert
  on roll math (dice count, modifier), which the mode-aware path
  preserves identically to the plain async path when `mode` is
  `"text"`. No new test cases needed; this is a signature-compatibility
  update, not new behavior.
- `rollWithMode.ts`'s two new functions get no dedicated tests, same
  reasoning as `rollDiceMode` in sub-project 2 (the interesting branch —
  3D failure → fallback — needs mocking a real `dice-box` roll, not
  worth the complexity for a fallback path that degrades to
  already-tested `rollD20`/`rollD20WithAdvantage`).
- `SheetTab.tsx`, `CombatTab.tsx`, `AttackRow.tsx`,
  `QuickActionsFab.tsx`: UI components, untested, consistent with
  existing project scope.
- Manual verification: with 3D enabled, tap an ability/save/skill in
  Ficha, an attack/damage roll in Combate, and Initiative — confirm
  each shows the full-screen dice animation and the correct final
  total, and that turning 3D off reverts every one of them to instant
  text with no other change.

## Out of Scope

- `spendHitDie` (short rest) and `LevelUpFlow`'s HP roll — explicit
  scope decision, stay text-only, can be added in a later pass if
  wanted
- Surfacing the "3D no disponible, usando texto" fallback toast outside
  `DiceRoller.tsx` — a UX decision about whether every roll site should
  interrupt the player with a toast, deferred rather than decided here
- Any change to `dice.ts`, `diceBox.ts`, or the `DiceBoxCanvas`
  component — all unchanged from sub-project 2
