# 3D Dice Full Rollout (Sub-project 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend 3D-aware rolling (from sub-project 2's `DiceRoller.tsx`-only integration) to every Ficha (ability/save/skill) and Combate (attacks, initiative) roll site.

**Architecture:** Two new mode-aware functions in `rollWithMode.ts` (`rollD20Mode`, `rollD20WithAdvantageMode`) mirror `dice.ts`'s `rollD20`/`rollD20WithAdvantage`. `attackRoll.ts`'s `rollAttackHit`/`rollAttackDamage` gain a `mode` parameter and switch to the new mode-aware functions internally. Four UI files thread `diceRollMode` (from `useThemeContext()`) through to these calls.

**Tech Stack:** No new dependencies — reuses everything from sub-projects 1 and 2.

## Global Constraints

- `spendHitDie` (short rest) and `LevelUpFlow`'s HP roll stay text-only — explicit scope decision, not touched by this plan.
- `rollAttackHit`/`rollAttackDamage` keep returning a plain `DiceRoll` (not `RollWithModeResult`) — the `usedFallback` toast stays exclusive to `DiceRoller.tsx`, per the spec's explicit scope boundary.
- Verify every task with `npx tsc --noEmit && npm run build && npm run lint && npm test` — 0 lint errors required (per `CLAUDE.md`).
- No changes to `dice.ts`, `diceBox.ts`, or `DiceBoxCanvas.tsx` — all untouched from sub-project 2.

---

### Task 1: `rollWithMode.ts` — add `rollD20Mode` and `rollD20WithAdvantageMode`

**Files:**
- Modify: `src/lib/rollWithMode.ts`

**Interfaces:**
- Consumes: `rollD20WithAdvantage`, `type DiceRoll` from `@/lib/dice`; `roll3D`, `hide3D` from `@/lib/diceBox` (already imported in this file)
- Produces: `rollD20Mode(modifier: number, mode: AppSettings["diceRollMode"]): Promise<RollWithModeResult>`, `rollD20WithAdvantageMode(modifier: number, mode: AppSettings["diceRollMode"]): Promise<RollWithModeResult>` — consumed by Task 2 (`attackRoll.ts`) and Task 3 (`SheetTab.tsx`/`CombatTab.tsx`)

No dedicated unit tests — same reasoning as `rollDiceMode` in sub-project 2 (the interesting branch, 3D failure → fallback, needs mocking a real `dice-box` roll, not worth the complexity for a fallback path that degrades to already-tested `rollD20`/`rollD20WithAdvantage`).

- [ ] **Step 1: Update the import line**

Replace:

```typescript
import { parseExpression, composeRoll, rollDice, type DiceRoll } from "./dice";
```

with:

```typescript
import {
  parseExpression,
  composeRoll,
  rollDice,
  rollD20WithAdvantage,
  type DiceRoll,
} from "./dice";
```

- [ ] **Step 2: Add the two new functions**

Add at the end of `src/lib/rollWithMode.ts`:

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

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/rollWithMode.ts
git commit -m "feat: add rollD20Mode and rollD20WithAdvantageMode"
```

---

### Task 2: `attackRoll.ts` — thread `mode` through `rollAttackHit`/`rollAttackDamage`

**Files:**
- Modify: `src/lib/attackRoll.ts`
- Test: `src/lib/attackRoll.test.ts`

**Interfaces:**
- Consumes: `rollD20Mode`, `rollD20WithAdvantageMode`, `rollDiceMode` from `@/lib/rollWithMode` (Task 1); `AppSettings` from `@/lib/types`
- Produces: `rollAttackHit(attack, opts, mode: AppSettings["diceRollMode"]): Promise<DiceRoll>`, `rollAttackDamage(attack, opts, mode: AppSettings["diceRollMode"]): Promise<DiceRoll>` — consumed by Task 3 (`AttackRow.tsx`, `QuickActionsFab.tsx`)

- [ ] **Step 1: Update the test file to pass a mode argument**

In `src/lib/attackRoll.test.ts`, every call to `rollAttackHit`/
`rollAttackDamage` needs a third `"text"` argument. Replace:

```typescript
describe("rollAttackHit", () => {
  it("rolls a single d20 without reckless", async () => {
    const result = await rollAttackHit(makeAttack(), {
      recklessActive: false,
      exhaustionLevel: 0,
    });
    expect(result.rolls).toHaveLength(1);
    expect(result.modifier).toBe(5);
  });

  it("rolls with advantage (2 dice) when reckless on a STR-based attack", async () => {
    const result = await rollAttackHit(makeAttack(), {
      recklessActive: true,
      exhaustionLevel: 0,
    });
    expect(result.rolls).toHaveLength(2);
    expect(result.modifier).toBe(5);
  });

  it("does not grant advantage on a Finesse weapon even if reckless", async () => {
    const finesse = makeAttack({ properties: ["Finesse"] });
    const result = await rollAttackHit(finesse, {
      recklessActive: true,
      exhaustionLevel: 0,
    });
    expect(result.rolls).toHaveLength(1);
  });

  it("subtracts the exhaustion penalty from the modifier", async () => {
    const result = await rollAttackHit(makeAttack(), {
      recklessActive: false,
      exhaustionLevel: 3,
    });
    expect(result.modifier).toBe(5 - 6);
  });
});

describe("rollAttackDamage", () => {
  it("uses the base damage modifier with no rage", async () => {
    const result = await rollAttackDamage(makeAttack(), {
      rageActive: false,
      rageDamage: 2,
    });
    expect(result.modifier).toBe(3);
  });

  it("folds the rage bonus into the modifier for a STR-based attack", async () => {
    const result = await rollAttackDamage(makeAttack(), {
      rageActive: true,
      rageDamage: 2,
    });
    expect(result.modifier).toBe(5);
  });

  it("does not add a rage bonus for a Finesse attack", async () => {
    const finesse = makeAttack({ properties: ["Finesse"], damage: "1d6+2" });
    const result = await rollAttackDamage(finesse, {
      rageActive: true,
      rageDamage: 2,
    });
    expect(result.modifier).toBe(2);
  });
});
```

with:

```typescript
describe("rollAttackHit", () => {
  it("rolls a single d20 without reckless", async () => {
    const result = await rollAttackHit(
      makeAttack(),
      { recklessActive: false, exhaustionLevel: 0 },
      "text"
    );
    expect(result.rolls).toHaveLength(1);
    expect(result.modifier).toBe(5);
  });

  it("rolls with advantage (2 dice) when reckless on a STR-based attack", async () => {
    const result = await rollAttackHit(
      makeAttack(),
      { recklessActive: true, exhaustionLevel: 0 },
      "text"
    );
    expect(result.rolls).toHaveLength(2);
    expect(result.modifier).toBe(5);
  });

  it("does not grant advantage on a Finesse weapon even if reckless", async () => {
    const finesse = makeAttack({ properties: ["Finesse"] });
    const result = await rollAttackHit(
      finesse,
      { recklessActive: true, exhaustionLevel: 0 },
      "text"
    );
    expect(result.rolls).toHaveLength(1);
  });

  it("subtracts the exhaustion penalty from the modifier", async () => {
    const result = await rollAttackHit(
      makeAttack(),
      { recklessActive: false, exhaustionLevel: 3 },
      "text"
    );
    expect(result.modifier).toBe(5 - 6);
  });
});

describe("rollAttackDamage", () => {
  it("uses the base damage modifier with no rage", async () => {
    const result = await rollAttackDamage(
      makeAttack(),
      { rageActive: false, rageDamage: 2 },
      "text"
    );
    expect(result.modifier).toBe(3);
  });

  it("folds the rage bonus into the modifier for a STR-based attack", async () => {
    const result = await rollAttackDamage(
      makeAttack(),
      { rageActive: true, rageDamage: 2 },
      "text"
    );
    expect(result.modifier).toBe(5);
  });

  it("does not add a rage bonus for a Finesse attack", async () => {
    const finesse = makeAttack({ properties: ["Finesse"], damage: "1d6+2" });
    const result = await rollAttackDamage(
      finesse,
      { rageActive: true, rageDamage: 2 },
      "text"
    );
    expect(result.modifier).toBe(2);
  });
});
```

- [ ] **Step 2: Update attackRoll.ts**

Replace:

```typescript
import type { Attack } from "./types";
import {
  rollD20Async,
  rollD20WithAdvantageAsync,
  rollDiceAsync,
  type DiceRoll,
} from "./dice";
import { exhaustionPenalty } from "./exhaustion";
```

with:

```typescript
import type { Attack, AppSettings } from "./types";
import type { DiceRoll } from "./dice";
import { rollD20Mode, rollD20WithAdvantageMode, rollDiceMode } from "./rollWithMode";
import { exhaustionPenalty } from "./exhaustion";
```

Replace:

```typescript
export async function rollAttackHit(
  attack: Attack,
  opts: { recklessActive: boolean; exhaustionLevel: number }
): Promise<DiceRoll> {
  const bonus = attack.attackBonus + exhaustionPenalty(opts.exhaustionLevel);
  return opts.recklessActive && isStrBasedAttack(attack)
    ? rollD20WithAdvantageAsync(bonus)
    : rollD20Async(bonus);
}

export async function rollAttackDamage(
  attack: Attack,
  opts: { rageActive: boolean; rageDamage: number }
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
  return rollDiceAsync(expr);
}
```

with:

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

- [ ] **Step 3: Run the test file to verify it passes**

Run: `npx vitest run src/lib/attackRoll.test.ts`
Expected: PASS, all tests.

- [ ] **Step 4: Commit**

```bash
git add src/lib/attackRoll.ts src/lib/attackRoll.test.ts
git commit -m "feat: thread diceRollMode through rollAttackHit and rollAttackDamage"
```

---

### Task 3: Wire `SheetTab.tsx` and `CombatTab.tsx`

**Files:**
- Modify: `src/components/tabs/SheetTab.tsx`
- Modify: `src/components/tabs/CombatTab.tsx`

**Interfaces:**
- Consumes: `rollD20Mode`, `rollD20WithAdvantageMode` from `@/lib/rollWithMode` (Task 1)

This task touches UI components with no unit tests, consistent with the project's existing scope. Verification is `tsc`/`build`/`lint`/`test` plus a manual walkthrough.

- [ ] **Step 1: SheetTab.tsx — imports and destructure**

Replace:

```typescript
import { rollD20Async, rollD20WithAdvantageAsync, type DiceRoll } from "@/lib/dice";
```

with:

```typescript
import type { DiceRoll } from "@/lib/dice";
import { rollD20Mode, rollD20WithAdvantageMode } from "@/lib/rollWithMode";
```

Replace:

```typescript
  const { magicItemIndicator } = useThemeContext();
```

with:

```typescript
  const { magicItemIndicator, diceRollMode } = useThemeContext();
```

- [ ] **Step 2: SheetTab.tsx — the four roll functions**

Replace:

```typescript
  async function rollAbility(ab: AbilityScore) {
    const mod = abilityModifier(attributes[ab]) + exhaustionPenalty(combat.exhaustionLevel);
    const result = await rollD20Async(mod);
    setActiveRoll({ key: `ability-${ab}`, roll: result });
  }

  async function rollSave(ab: AbilityScore) {
    const total = saveTotal(character!, ab) + exhaustionPenalty(combat.exhaustionLevel);
    const result =
      ab === "dex" && hasDangerSense
        ? await rollD20WithAdvantageAsync(total)
        : await rollD20Async(total);
    setActiveRoll({ key: `save-${ab}`, roll: result });
  }

  async function rollSkill(key: string) {
    const total = skillTotal(character!, key) + exhaustionPenalty(combat.exhaustionLevel);
    const result = await rollD20Async(total);
    setActiveRoll({ key: `skill-${key}`, roll: result });
  }

  async function rollSkillStr(key: string) {
    const skill = skills[key];
    const strMod = abilityModifier(attributes.str);
    const total =
      strMod +
      (skill?.proficient ? meta.proficiencyBonus : 0) +
      exhaustionPenalty(combat.exhaustionLevel);
    const result = await rollD20Async(total);
    setActiveRoll({ key: `skill-str-${key}`, roll: result });
  }
```

with:

```typescript
  async function rollAbility(ab: AbilityScore) {
    const mod = abilityModifier(attributes[ab]) + exhaustionPenalty(combat.exhaustionLevel);
    const { roll: result } = await rollD20Mode(mod, diceRollMode);
    setActiveRoll({ key: `ability-${ab}`, roll: result });
  }

  async function rollSave(ab: AbilityScore) {
    const total = saveTotal(character!, ab) + exhaustionPenalty(combat.exhaustionLevel);
    const { roll: result } =
      ab === "dex" && hasDangerSense
        ? await rollD20WithAdvantageMode(total, diceRollMode)
        : await rollD20Mode(total, diceRollMode);
    setActiveRoll({ key: `save-${ab}`, roll: result });
  }

  async function rollSkill(key: string) {
    const total = skillTotal(character!, key) + exhaustionPenalty(combat.exhaustionLevel);
    const { roll: result } = await rollD20Mode(total, diceRollMode);
    setActiveRoll({ key: `skill-${key}`, roll: result });
  }

  async function rollSkillStr(key: string) {
    const skill = skills[key];
    const strMod = abilityModifier(attributes.str);
    const total =
      strMod +
      (skill?.proficient ? meta.proficiencyBonus : 0) +
      exhaustionPenalty(combat.exhaustionLevel);
    const { roll: result } = await rollD20Mode(total, diceRollMode);
    setActiveRoll({ key: `skill-str-${key}`, roll: result });
  }
```

- [ ] **Step 3: CombatTab.tsx — imports, destructure, and rollInitiative**

Replace:

```typescript
import { rollD20Async, type DiceRoll } from "@/lib/dice";
```

with:

```typescript
import type { DiceRoll } from "@/lib/dice";
import { rollD20Mode } from "@/lib/rollWithMode";
```

Replace:

```typescript
  const { magicItemIndicator } = useThemeContext();
```

with:

```typescript
  const { magicItemIndicator, diceRollMode } = useThemeContext();
```

Replace:

```typescript
  async function rollInitiative() {
    const total = combat.initiative + exhaustionPenalty(combat.exhaustionLevel);
    setInitiativeRoll(await rollD20Async(total));
  }
```

with:

```typescript
  async function rollInitiative() {
    const total = combat.initiative + exhaustionPenalty(combat.exhaustionLevel);
    const { roll } = await rollD20Mode(total, diceRollMode);
    setInitiativeRoll(roll);
  }
```

- [ ] **Step 4: Run full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: `tsc` clean, build succeeds, 0 lint errors, all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/tabs/SheetTab.tsx src/components/tabs/CombatTab.tsx
git commit -m "feat: wire Ficha and Combate rolls to diceRollMode"
```

---

### Task 4: Wire `AttackRow.tsx` and `QuickActionsFab.tsx`

**Files:**
- Modify: `src/components/combat/AttackRow.tsx`
- Modify: `src/components/ui/QuickActionsFab.tsx`

**Interfaces:**
- Consumes: `rollAttackHit`, `rollAttackDamage` (Task 2's new 3-argument signature)

- [ ] **Step 1: AttackRow.tsx**

Replace:

```typescript
  const { density, magicItemIndicator } = useThemeContext();
```

with:

```typescript
  const { density, magicItemIndicator, diceRollMode } = useThemeContext();
```

Replace:

```typescript
  async function handleRollHit() {
    const result = await rollAttackHit(attack, { recklessActive, exhaustionLevel });
    setLastRoll({ roll: result, type: "hit" });
  }

  async function handleRollDamage() {
    const result = await rollAttackDamage(attack, { rageActive, rageDamage });
    setLastRoll({ roll: result, type: "damage" });
  }
```

with:

```typescript
  async function handleRollHit() {
    const result = await rollAttackHit(
      attack,
      { recklessActive, exhaustionLevel },
      diceRollMode
    );
    setLastRoll({ roll: result, type: "hit" });
  }

  async function handleRollDamage() {
    const result = await rollAttackDamage(
      attack,
      { rageActive, rageDamage },
      diceRollMode
    );
    setLastRoll({ roll: result, type: "damage" });
  }
```

- [ ] **Step 2: QuickActionsFab.tsx — import and destructure**

Replace:

```typescript
import { useCharacterContext } from "@/lib/context";
```

with:

```typescript
import { useCharacterContext, useThemeContext } from "@/lib/context";
```

Replace:

```typescript
  const { character, updateCombat, updateResources, updateQuickActions } =
    useCharacterContext();
```

with:

```typescript
  const { character, updateCombat, updateResources, updateQuickActions } =
    useCharacterContext();
  const { diceRollMode } = useThemeContext();
```

- [ ] **Step 3: QuickActionsFab.tsx — the attackRoll/attackDamage cases**

Replace:

```typescript
      case "attackRoll": {
        const attack = attacks.find((a) => a.id === action.attackId);
        if (!attack) break;
        const roll = await rollAttackHit(attack, {
          recklessActive: combat.recklessActive,
          exhaustionLevel: combat.exhaustionLevel,
        });
        toast(`${attack.name}: ${roll.total} (${roll.rolls.join(", ")})`, {
          icon: "🎲",
        });
        break;
      }
      case "attackDamage": {
        const attack = attacks.find((a) => a.id === action.attackId);
        if (!attack) break;
        const roll = await rollAttackDamage(attack, { rageActive, rageDamage });
        toast(`${attack.name}: ${roll.total} daño`, { icon: "🎲" });
        break;
      }
```

with:

```typescript
      case "attackRoll": {
        const attack = attacks.find((a) => a.id === action.attackId);
        if (!attack) break;
        const roll = await rollAttackHit(
          attack,
          {
            recklessActive: combat.recklessActive,
            exhaustionLevel: combat.exhaustionLevel,
          },
          diceRollMode
        );
        toast(`${attack.name}: ${roll.total} (${roll.rolls.join(", ")})`, {
          icon: "🎲",
        });
        break;
      }
      case "attackDamage": {
        const attack = attacks.find((a) => a.id === action.attackId);
        if (!attack) break;
        const roll = await rollAttackDamage(
          attack,
          { rageActive, rageDamage },
          diceRollMode
        );
        toast(`${attack.name}: ${roll.total} daño`, { icon: "🎲" });
        break;
      }
```

- [ ] **Step 4: Run full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: `tsc` clean, build succeeds, 0 lint errors, all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/combat/AttackRow.tsx src/components/ui/QuickActionsFab.tsx
git commit -m "feat: wire AttackRow and QuickActionsFab attack rolls to diceRollMode"
```

---

### Task 5: Update the Ajustes toggle label

**Files:**
- Modify: `src/components/tabs/SettingsTab.tsx`

- [ ] **Step 1: Drop the stale qualifier**

Replace:

```tsx
            name={`Modo de tirada: ${
              diceRollMode === "3d"
                ? "3D (solo Dado suelto por ahora)"
                : "Texto"
            }`}
```

with:

```tsx
            name={`Modo de tirada: ${diceRollMode === "3d" ? "3D" : "Texto"}`}
```

- [ ] **Step 2: Run full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: `tsc` clean, build succeeds, 0 lint errors, all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/tabs/SettingsTab.tsx
git commit -m "chore: drop the Dado-suelto-only qualifier from the diceRollMode toggle label"
```

---

### Task 6: Full verification pass

This task produces no code changes on its own — it's a verification gate. If the walkthrough surfaces a real defect, fix it as part of this task and commit the fix; otherwise this task produces no commit.

- [ ] **Step 1: Run the full check suite**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: 0 lint errors, all tests passing.

- [ ] **Step 2: Confirm every caller of the changed functions was updated**

Run: `grep -rln "rollAttackHit(\|rollAttackDamage(\|rollD20Async(\|rollD20WithAdvantageAsync(" src/ --include="*.ts" --include="*.tsx" | grep -v "\.test\.ts"`
Expected: only `src/lib/dice.ts` — it still *defines* `rollD20Async`/
`rollD20WithAdvantageAsync` (this plan doesn't remove them), and each
function's own `export async function rollD20Async(` declaration line
contains the literal substring being grepped, so `dice.ts` always
matches regardless of whether anything else still calls it. No other
file should appear — if `AttackRow.tsx`, `QuickActionsFab.tsx`,
`SheetTab.tsx`, or `CombatTab.tsx` show up, one of Tasks 2-4 missed a
call site, mirroring
the same grep check that caught `QuickActionsFab.tsx` unexpectedly in
sub-project 1.

- [ ] **Step 3: Verify the text-mode round-trip for the new functions**

Run: `npx tsx -e '
import { rollD20Mode, rollD20WithAdvantageMode } from "./src/lib/rollWithMode";

(async () => {
  const a = await rollD20Mode(5, "text");
  console.log("rollD20Mode(5, text):", a.roll.expression, a.roll.modifier, "usedFallback:", a.usedFallback);
  const b = await rollD20WithAdvantageMode(3, "text");
  console.log("rollD20WithAdvantageMode(3, text):", b.roll.expression, b.roll.rolls.length, b.roll.total, "usedFallback:", b.usedFallback);
})();
'`

Expected: `rollD20Mode(5, text): 1d20+5 5 usedFallback: false` and `rollD20WithAdvantageMode(3, text): 1d20adv+3 2 <total> usedFallback: false` where `<total>` is `max(rolls) + 3`.

- [ ] **Step 4: Confirm no stray symlinks or worktree pollution**

Run: `find <repo-root> -maxdepth 3 -type l 2>/dev/null | grep -v node_modules`
Expected: no output.

- [ ] **Step 5: Manual dev-server smoke check**

Start `npm run dev`, `curl -s -o /dev/null -w "http:%{http_code}\n" http://localhost:3000` and expect `http:200`, then stop the dev server. As with sub-project 2, the actual 3D-mode visual walkthrough (toggling 3D in Ajustes and confirming Ficha/Combate rolls animate correctly) can't be click-tested since Chrome DevTools MCP is unavailable this session — note this limitation explicitly rather than claiming it was verified.

If any step surfaces a real defect, fix it, re-run the full check suite, and commit. If everything passes cleanly, this task produces no commit.
