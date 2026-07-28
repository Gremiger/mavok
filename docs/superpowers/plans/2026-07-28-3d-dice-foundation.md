# 3D Dice Foundation (Sub-project 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `dice.ts`'s raw-face generation from total composition, convert every roll call site to `async`/`await`, and add an (invisible-for-now) `diceRollMode` setting — zero visible behavior change, but the seam sub-project 2 needs to wire in `@3d-dice/dice-box` without touching any call site again.

**Architecture:** `dice.ts` gains `parseExpression`/`generateFaces`/`composeRoll` pure helpers plus `*Async` wrappers that, for now, just resolve the existing synchronous path. Every function up the chain that currently calls `rollDice`/`rollD20`/`rollD20WithAdvantage` synchronously becomes `async` and awaits the new wrapper instead — a mechanical, behavior-preserving change. `AppSettings` gains a `diceRollMode: "text" | "3d"` field with no UI yet.

**Tech Stack:** TypeScript, Vitest — no new dependencies (this sub-project doesn't touch `@3d-dice/dice-box`).

## Global Constraints

- Zero visible behavior change in this sub-project — every conversion must produce bit-for-bit identical `DiceRoll` output to today, just resolved via a `Promise`.
- No new npm dependencies.
- `generateFaces`/`composeRoll` must be reusable by a future non-`Math.random()` source (sub-project 2) without modification — confirmed by design review that `composeRoll`'s "sum all rolls + modifier" shape fits every case except `rollD20WithAdvantage`, which keeps its own "max of two" total calculation.
- Verify every task with `npx tsc --noEmit && npm run build && npm run lint && npm test` — 0 lint errors required (per `CLAUDE.md`).
- No migration needed for the new `AppSettings` field — `loadSettings()` already merges stored JSON over defaults (`{ ...defaults, ...JSON.parse(raw) }`), so a missing key just gets the default.
- No toggle added to `SettingsTab.tsx` in this sub-project (explicit user choice — the setting exists and round-trips, but stays invisible until sub-project 2 gives it visible meaning).

---

### Task 1: `dice.ts` refactor — split generation from composition

**Files:**
- Modify: `src/lib/dice.ts`
- Test: `src/lib/dice.test.ts`

**Interfaces:**
- Produces: `parseExpression(expression: string): { count: number; faces: number; modifier: number }`, `generateFaces(count: number, faces: number): number[]`, `composeRoll(expression: string, rolls: number[], modifier: number): DiceRoll` — all exported for sub-project 2 to reuse. `rollDice`, `rollD20`, `rollD20WithAdvantage`, `isD20Crit`, `isD20Fumble` keep their exact existing signatures and behavior.

- [ ] **Step 1: Write the failing tests**

Add to `src/lib/dice.test.ts` (before the existing `describe("isD20Crit", ...)` block):

```typescript
import {
  isD20Crit,
  isD20Fumble,
  parseExpression,
  generateFaces,
  composeRoll,
  type DiceRoll,
} from "./dice";

describe("parseExpression", () => {
  it("parses count, faces, and a positive modifier", () => {
    expect(parseExpression("2d6+3")).toEqual({
      count: 2,
      faces: 6,
      modifier: 3,
    });
  });

  it("parses a negative modifier", () => {
    expect(parseExpression("1d20-2")).toEqual({
      count: 1,
      faces: 20,
      modifier: -2,
    });
  });

  it("defaults modifier to 0 when absent", () => {
    expect(parseExpression("1d12")).toEqual({
      count: 1,
      faces: 12,
      modifier: 0,
    });
  });

  it("throws on an invalid expression", () => {
    expect(() => parseExpression("not-dice")).toThrow(
      "Invalid dice expression: not-dice"
    );
  });
});

describe("generateFaces", () => {
  it("generates the requested count of rolls", () => {
    expect(generateFaces(3, 6)).toHaveLength(3);
  });

  it("generates values within 1..faces", () => {
    const rolls = generateFaces(50, 6);
    for (const r of rolls) {
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(6);
    }
  });
});

describe("composeRoll", () => {
  it("sums the rolls and adds the modifier", () => {
    const result = composeRoll("2d6+3", [4, 5], 3);
    expect(result.total).toBe(12);
    expect(result.expression).toBe("2d6+3");
    expect(result.rolls).toEqual([4, 5]);
    expect(result.modifier).toBe(3);
  });

  it("stamps a timestamp", () => {
    const before = Date.now();
    const result = composeRoll("1d6+0", [3], 0);
    expect(result.timestamp).toBeGreaterThanOrEqual(before);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/dice.test.ts`
Expected: FAIL — `parseExpression`, `generateFaces`, `composeRoll` are not exported yet.

- [ ] **Step 3: Refactor dice.ts**

Replace the full contents of `src/lib/dice.ts` with:

```typescript
export interface DiceRoll {
  expression: string;
  rolls: number[];
  modifier: number;
  total: number;
  timestamp: number;
}

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
  return Array.from({ length: count }, () =>
    Math.floor(Math.random() * faces) + 1
  );
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

export function rollD20(modifier: number = 0): DiceRoll {
  return rollDice(`1d20${modifier >= 0 ? "+" : ""}${modifier}`);
}

export function rollD20WithAdvantage(modifier: number = 0): DiceRoll {
  const [d1, d2] = generateFaces(2, 20);
  return {
    expression: `1d20adv${modifier >= 0 ? "+" : ""}${modifier}`,
    rolls: [d1, d2],
    modifier,
    total: Math.max(d1, d2) + modifier,
    timestamp: Date.now(),
  };
}

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

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/dice.test.ts`
Expected: PASS, all tests (existing `isD20Crit`/`isD20Fumble` tests plus the new ones).

- [ ] **Step 5: Commit**

```bash
git add src/lib/dice.ts src/lib/dice.test.ts
git commit -m "feat: split dice.ts raw-face generation from total composition, add async wrappers"
```

---

### Task 2: Async conversion — `attackRoll.ts` and `hitDice.ts`

**Files:**
- Modify: `src/lib/attackRoll.ts`
- Modify: `src/lib/hitDice.ts`
- Test: `src/lib/attackRoll.test.ts`
- Test: `src/lib/hitDice.test.ts`

**Interfaces:**
- Consumes: `rollD20Async`, `rollD20WithAdvantageAsync`, `rollDiceAsync` from Task 1
- Produces: `rollAttackHit(attack, opts): Promise<DiceRoll>`, `rollAttackDamage(attack, opts): Promise<DiceRoll>`, `spendHitDie(combat, conMod): Promise<HitDiceSpendResult | null>` — all now async, consumed by Task 4's call-site updates

- [ ] **Step 1: Update attackRoll.ts's tests to await**

In `src/lib/attackRoll.test.ts`, change every `describe("rollAttackHit", ...)` and `describe("rollAttackDamage", ...)` test to be `async` and `await` the call. Replace:

```typescript
describe("rollAttackHit", () => {
  it("rolls a single d20 without reckless", () => {
    const result = rollAttackHit(makeAttack(), {
      recklessActive: false,
      exhaustionLevel: 0,
    });
    expect(result.rolls).toHaveLength(1);
    expect(result.modifier).toBe(5);
  });

  it("rolls with advantage (2 dice) when reckless on a STR-based attack", () => {
    const result = rollAttackHit(makeAttack(), {
      recklessActive: true,
      exhaustionLevel: 0,
    });
    expect(result.rolls).toHaveLength(2);
    expect(result.modifier).toBe(5);
  });

  it("does not grant advantage on a Finesse weapon even if reckless", () => {
    const finesse = makeAttack({ properties: ["Finesse"] });
    const result = rollAttackHit(finesse, {
      recklessActive: true,
      exhaustionLevel: 0,
    });
    expect(result.rolls).toHaveLength(1);
  });

  it("subtracts the exhaustion penalty from the modifier", () => {
    const result = rollAttackHit(makeAttack(), {
      recklessActive: false,
      exhaustionLevel: 3,
    });
    expect(result.modifier).toBe(5 - 6);
  });
});

describe("rollAttackDamage", () => {
  it("uses the base damage modifier with no rage", () => {
    const result = rollAttackDamage(makeAttack(), {
      rageActive: false,
      rageDamage: 2,
    });
    expect(result.modifier).toBe(3);
  });

  it("folds the rage bonus into the modifier for a STR-based attack", () => {
    const result = rollAttackDamage(makeAttack(), {
      rageActive: true,
      rageDamage: 2,
    });
    expect(result.modifier).toBe(5);
  });

  it("does not add a rage bonus for a Finesse attack", () => {
    const finesse = makeAttack({ properties: ["Finesse"], damage: "1d6+2" });
    const result = rollAttackDamage(finesse, {
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

- [ ] **Step 2: Update hitDice.test.ts's tests to await**

In `src/lib/hitDice.test.ts`, replace the `describe("spendHitDie", ...)` block:

```typescript
describe("spendHitDie", () => {
  it("returns null when no hit dice remain", () => {
    const combat = makeCombat({ hitDice: { total: 2, remaining: 0, die: "d12" } });
    expect(spendHitDie(combat, 2)).toBeNull();
  });

  it("decrements remaining and leaves total unchanged", () => {
    const combat = makeCombat({ hitDice: { total: 2, remaining: 2, die: "d12" } });
    const result = spendHitDie(combat, 2);
    expect(result).not.toBeNull();
    expect(result!.combat.hitDice.remaining).toBe(1);
    expect(result!.combat.hitDice.total).toBe(2);
  });

  it("clamps healed HP at maxHp regardless of the roll", () => {
    const combat = makeCombat({ currentHp: 16, maxHp: 16 });
    const result = spendHitDie(combat, 2);
    expect(result).not.toBeNull();
    expect(result!.combat.currentHp).toBe(16);
  });

  it("healing is always at least 1", () => {
    const combat = makeCombat({ currentHp: 0, maxHp: 16 });
    const result = spendHitDie(combat, -5);
    expect(result).not.toBeNull();
    expect(result!.healing).toBeGreaterThanOrEqual(1);
  });
});
```

with:

```typescript
describe("spendHitDie", () => {
  it("returns null when no hit dice remain", async () => {
    const combat = makeCombat({ hitDice: { total: 2, remaining: 0, die: "d12" } });
    expect(await spendHitDie(combat, 2)).toBeNull();
  });

  it("decrements remaining and leaves total unchanged", async () => {
    const combat = makeCombat({ hitDice: { total: 2, remaining: 2, die: "d12" } });
    const result = await spendHitDie(combat, 2);
    expect(result).not.toBeNull();
    expect(result!.combat.hitDice.remaining).toBe(1);
    expect(result!.combat.hitDice.total).toBe(2);
  });

  it("clamps healed HP at maxHp regardless of the roll", async () => {
    const combat = makeCombat({ currentHp: 16, maxHp: 16 });
    const result = await spendHitDie(combat, 2);
    expect(result).not.toBeNull();
    expect(result!.combat.currentHp).toBe(16);
  });

  it("healing is always at least 1", async () => {
    const combat = makeCombat({ currentHp: 0, maxHp: 16 });
    const result = await spendHitDie(combat, -5);
    expect(result).not.toBeNull();
    expect(result!.healing).toBeGreaterThanOrEqual(1);
  });
});
```

Note: unlike a typical TDD red/green cycle, these updated tests will
actually **pass** even before the source conversion below — `await` on
a plain (non-`Promise`) value in JavaScript still resolves to that
value, so `await rollAttackHit(...)` works whether `rollAttackHit` is
sync or async. There's no failing-test checkpoint to run here; proceed
straight to converting the source, then verify everything together.

- [ ] **Step 3: Convert attackRoll.ts and hitDice.ts to async**

In `src/lib/attackRoll.ts`, replace:

```typescript
import type { Attack } from "./types";
import { rollD20, rollD20WithAdvantage, rollDice, type DiceRoll } from "./dice";
import { exhaustionPenalty } from "./exhaustion";
```

with:

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

Replace:

```typescript
export function rollAttackHit(
  attack: Attack,
  opts: { recklessActive: boolean; exhaustionLevel: number }
): DiceRoll {
  const bonus = attack.attackBonus + exhaustionPenalty(opts.exhaustionLevel);
  return opts.recklessActive && isStrBasedAttack(attack)
    ? rollD20WithAdvantage(bonus)
    : rollD20(bonus);
}

export function rollAttackDamage(
  attack: Attack,
  opts: { rageActive: boolean; rageDamage: number }
): DiceRoll {
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
  return rollDice(expr);
}
```

with:

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

In `src/lib/hitDice.ts`, replace:

```typescript
import { rollDice } from "./dice";
import type { CombatState } from "./types";

export interface HitDiceSpendResult {
  combat: Pick<CombatState, "currentHp" | "hitDice">;
  healing: number;
  rollTotal: number;
}

export function spendHitDie(
  combat: CombatState,
  conMod: number
): HitDiceSpendResult | null {
  if (combat.hitDice.remaining <= 0) return null;
  const roll = rollDice(`1d12${conMod >= 0 ? "+" : ""}${conMod}`);
  const healing = Math.max(1, roll.total);
  const newHp = Math.min(combat.currentHp + healing, combat.maxHp);
  return {
    combat: {
      currentHp: newHp,
      hitDice: { ...combat.hitDice, remaining: combat.hitDice.remaining - 1 },
    },
    healing,
    rollTotal: roll.total,
  };
}
```

with:

```typescript
import { rollDiceAsync } from "./dice";
import type { CombatState } from "./types";

export interface HitDiceSpendResult {
  combat: Pick<CombatState, "currentHp" | "hitDice">;
  healing: number;
  rollTotal: number;
}

export async function spendHitDie(
  combat: CombatState,
  conMod: number
): Promise<HitDiceSpendResult | null> {
  if (combat.hitDice.remaining <= 0) return null;
  const roll = await rollDiceAsync(`1d12${conMod >= 0 ? "+" : ""}${conMod}`);
  const healing = Math.max(1, roll.total);
  const newHp = Math.min(combat.currentHp + healing, combat.maxHp);
  return {
    combat: {
      currentHp: newHp,
      hitDice: { ...combat.hitDice, remaining: combat.hitDice.remaining - 1 },
    },
    healing,
    rollTotal: roll.total,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/attackRoll.test.ts src/lib/hitDice.test.ts`
Expected: PASS, all tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/attackRoll.ts src/lib/hitDice.ts src/lib/attackRoll.test.ts src/lib/hitDice.test.ts
git commit -m "feat: convert rollAttackHit, rollAttackDamage, and spendHitDie to async"
```

---

### Task 3: `diceRollMode` setting (no UI)

**Files:**
- Modify: `src/lib/types.ts:189-196`
- Modify: `src/lib/storage.ts:43-51`
- Modify: `src/hooks/useTheme.ts`
- Test: `src/lib/storage.test.ts`

**Interfaces:**
- Produces: `AppSettings.diceRollMode: "text" | "3d"`, `useTheme()`'s returned object gains `diceRollMode` and `setDiceRollMode` — consumed by sub-project 2 (not this plan)

- [ ] **Step 1: Add the field to AppSettings**

In `src/lib/types.ts`, replace:

```typescript
export interface AppSettings {
  theme: "piedra-viva" | "cumbre-helada" | "pergamino" | "furia-de-sangre";
  lastCharacterId: string;
  density: "compact" | "spacious";
  encyclopediaFavorites: string[];
  encyclopediaLanguage: "en" | "es";
  magicItemIndicator: "number-only" | "explicit-tag";
}
```

with:

```typescript
export interface AppSettings {
  theme: "piedra-viva" | "cumbre-helada" | "pergamino" | "furia-de-sangre";
  lastCharacterId: string;
  density: "compact" | "spacious";
  encyclopediaFavorites: string[];
  encyclopediaLanguage: "en" | "es";
  magicItemIndicator: "number-only" | "explicit-tag";
  diceRollMode: "text" | "3d";
}
```

- [ ] **Step 2: Add the default in storage.ts**

In `src/lib/storage.ts`, replace:

```typescript
  const defaults: AppSettings = {
    theme: "piedra-viva",
    lastCharacterId: "mavok-1",
    density: "spacious",
    encyclopediaFavorites: [],
    encyclopediaLanguage: "en",
    magicItemIndicator: "number-only",
  };
```

with:

```typescript
  const defaults: AppSettings = {
    theme: "piedra-viva",
    lastCharacterId: "mavok-1",
    density: "spacious",
    encyclopediaFavorites: [],
    encyclopediaLanguage: "en",
    magicItemIndicator: "number-only",
    diceRollMode: "text",
  };
```

- [ ] **Step 3: Fix the existing storage.test.ts literal and add a new test**

In `src/lib/storage.test.ts`, the third test constructs a full `AppSettings` literal that will now fail to type-check without the new field. Replace:

```typescript
  it("preserves a stored cumbre-helada theme as-is", () => {
    saveSettings({
      theme: "cumbre-helada",
      lastCharacterId: "mavok-1",
      density: "spacious",
      encyclopediaFavorites: [],
      encyclopediaLanguage: "en",
      magicItemIndicator: "number-only",
    });

    const settings = loadSettings();
    expect(settings.theme).toBe("cumbre-helada");
  });
});
```

with:

```typescript
  it("preserves a stored cumbre-helada theme as-is", () => {
    saveSettings({
      theme: "cumbre-helada",
      lastCharacterId: "mavok-1",
      density: "spacious",
      encyclopediaFavorites: [],
      encyclopediaLanguage: "en",
      magicItemIndicator: "number-only",
      diceRollMode: "text",
    });

    const settings = loadSettings();
    expect(settings.theme).toBe("cumbre-helada");
  });

  it("defaults diceRollMode to text when no settings are stored", () => {
    const settings = loadSettings();
    expect(settings.diceRollMode).toBe("text");
  });
});
```

- [ ] **Step 4: Add state and setter to useTheme.ts**

In `src/hooks/useTheme.ts`, add a new state declaration after the `magicItemIndicator` one:

```typescript
  const [magicItemIndicator, setMagicItemIndicatorState] = useState<
    AppSettings["magicItemIndicator"]
  >("number-only");
  const [diceRollMode, setDiceRollModeState] = useState<
    AppSettings["diceRollMode"]
  >("text");
```

In the mount `useEffect`, add after `setMagicItemIndicatorState(settings.magicItemIndicator);`:

```typescript
    setDiceRollModeState(settings.diceRollMode);
```

After the `setMagicItemIndicator` callback, add a new setter:

```typescript
  const setDiceRollMode = useCallback(
    (mode: AppSettings["diceRollMode"]) => {
      setDiceRollModeState(mode);
      const settings = loadSettings();
      saveSettings({ ...settings, diceRollMode: mode });
    },
    []
  );
```

In the returned object, add after `setMagicItemIndicator,`:

```typescript
    diceRollMode,
    setDiceRollMode,
```

- [ ] **Step 5: Run full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: `tsc` clean, build succeeds, 0 lint errors, all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/storage.ts src/lib/storage.test.ts src/hooks/useTheme.ts
git commit -m "feat: add diceRollMode setting (no UI yet, foundation for 3D dice sub-project 2)"
```

---

### Task 4: Convert every roll call site to async/await

**Files:**
- Modify: `src/components/tabs/SheetTab.tsx`
- Modify: `src/components/tabs/CombatTab.tsx`
- Modify: `src/components/combat/AttackRow.tsx`
- Modify: `src/components/combat/DiceRoller.tsx`
- Modify: `src/components/tabs/SettingsTab.tsx`
- Modify: `src/components/levelup/LevelUpFlow.tsx`

**Interfaces:**
- Consumes: `rollD20Async`, `rollD20WithAdvantageAsync`, `rollDiceAsync` (Task 1), `rollAttackHit`, `rollAttackDamage` (now async, Task 2), `spendHitDie` (now async, Task 2)

This task touches UI components with no unit tests, consistent with the project's existing scope (no component tests). Verification is `tsc`/`build`/`lint`/`test` plus a manual walkthrough.

- [ ] **Step 1: SheetTab.tsx**

Change the import from:

```typescript
import { rollD20, rollD20WithAdvantage, type DiceRoll } from "@/lib/dice";
```

to:

```typescript
import { rollD20Async, rollD20WithAdvantageAsync, type DiceRoll } from "@/lib/dice";
```

Replace the four roll functions:

```typescript
  function rollAbility(ab: AbilityScore) {
    const mod = abilityModifier(attributes[ab]) + exhaustionPenalty(combat.exhaustionLevel);
    const result = rollD20(mod);
    setActiveRoll({ key: `ability-${ab}`, roll: result });
  }

  function rollSave(ab: AbilityScore) {
    const total = saveTotal(character!, ab) + exhaustionPenalty(combat.exhaustionLevel);
    const result =
      ab === "dex" && hasDangerSense
        ? rollD20WithAdvantage(total)
        : rollD20(total);
    setActiveRoll({ key: `save-${ab}`, roll: result });
  }

  function rollSkill(key: string) {
    const total = skillTotal(character!, key) + exhaustionPenalty(combat.exhaustionLevel);
    const result = rollD20(total);
    setActiveRoll({ key: `skill-${key}`, roll: result });
  }

  function rollSkillStr(key: string) {
    const skill = skills[key];
    const strMod = abilityModifier(attributes.str);
    const total =
      strMod +
      (skill?.proficient ? meta.proficiencyBonus : 0) +
      exhaustionPenalty(combat.exhaustionLevel);
    const result = rollD20(total);
    setActiveRoll({ key: `skill-str-${key}`, roll: result });
  }
```

with:

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

- [ ] **Step 2: CombatTab.tsx**

Change the import from:

```typescript
import { rollD20, type DiceRoll } from "@/lib/dice";
```

to:

```typescript
import { rollD20Async, type DiceRoll } from "@/lib/dice";
```

Replace:

```typescript
  function rollInitiative() {
    const total = combat.initiative + exhaustionPenalty(combat.exhaustionLevel);
    setInitiativeRoll(rollD20(total));
  }
```

with:

```typescript
  async function rollInitiative() {
    const total = combat.initiative + exhaustionPenalty(combat.exhaustionLevel);
    setInitiativeRoll(await rollD20Async(total));
  }
```

- [ ] **Step 3: AttackRow.tsx**

Replace:

```typescript
  function handleRollHit() {
    const result = rollAttackHit(attack, { recklessActive, exhaustionLevel });
    setLastRoll({ roll: result, type: "hit" });
  }

  function handleRollDamage() {
    const result = rollAttackDamage(attack, { rageActive, rageDamage });
    setLastRoll({ roll: result, type: "damage" });
  }
```

with:

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

- [ ] **Step 4: DiceRoller.tsx**

Change the import from:

```typescript
import { rollDice, isD20Crit, isD20Fumble, type DiceRoll } from "@/lib/dice";
```

to:

```typescript
import { rollDiceAsync, isD20Crit, isD20Fumble, type DiceRoll } from "@/lib/dice";
```

Replace:

```typescript
  function roll(expression: string) {
    try {
      const result = rollDice(expression);
      setHistory((prev) => [result, ...prev].slice(0, 5));
    } catch {
      // invalid expression, ignore
    }
  }
```

with:

```typescript
  async function roll(expression: string) {
    try {
      const result = await rollDiceAsync(expression);
      setHistory((prev) => [result, ...prev].slice(0, 5));
    } catch {
      // invalid expression, ignore
    }
  }
```

- [ ] **Step 5: SettingsTab.tsx**

Replace:

```typescript
  function spendHitDie() {
    const result = computeHitDieSpend(character!.combat, conMod);
    if (!result) return;
    updateCombat(result.combat);
    setShortRestLog((prev) => [
      `1d12+${conMod} = ${result.rollTotal} → ${result.healing} HP (${result.combat.currentHp}/${character!.combat.maxHp})`,
      ...prev,
    ]);
    toast(`+${result.healing} HP curados`, { icon: "💚" });
  }
```

with:

```typescript
  async function spendHitDie() {
    const result = await computeHitDieSpend(character!.combat, conMod);
    if (!result) return;
    updateCombat(result.combat);
    setShortRestLog((prev) => [
      `1d12+${conMod} = ${result.rollTotal} → ${result.healing} HP (${result.combat.currentHp}/${character!.combat.maxHp})`,
      ...prev,
    ]);
    toast(`+${result.healing} HP curados`, { icon: "💚" });
  }
```

- [ ] **Step 6: LevelUpFlow.tsx**

Change the import from:

```typescript
import { rollDice } from "@/lib/dice";
```

to:

```typescript
import { rollDiceAsync } from "@/lib/dice";
```

Replace:

```typescript
  function rollHp() {
    const result = rollDice("1d12+0");
    setHpRoll(result.rolls[0]);
  }
```

with:

```typescript
  async function rollHp() {
    const result = await rollDiceAsync("1d12+0");
    setHpRoll(result.rolls[0]);
  }
```

- [ ] **Step 7: Run full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: `tsc` clean, build succeeds, 0 lint errors, all tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/tabs/SheetTab.tsx src/components/tabs/CombatTab.tsx src/components/combat/AttackRow.tsx src/components/combat/DiceRoller.tsx src/components/tabs/SettingsTab.tsx src/components/levelup/LevelUpFlow.tsx
git commit -m "feat: convert every roll call site to async/await

Zero behavior change — each call site now awaits an async dice
function that currently just resolves the existing synchronous path.
This is the seam the 3D dice sub-project 2 needs to wire in real
async physics-based rolling without touching any call site again."
```

---

### Task 5: Full verification pass

This task produces no code changes on its own — it's a verification gate. If the walkthrough surfaces a real defect, fix it as part of this task and commit the fix; otherwise this task produces no commit.

- [ ] **Step 1: Run the full check suite**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: 0 lint errors, all tests passing.

- [ ] **Step 2: Confirm every non-test call site of the sync dice functions was converted**

Run: `grep -rln "rollDice(\|rollD20(\|rollD20WithAdvantage(" src/ --include="*.ts" --include="*.tsx" | grep -v "\.test\.ts"`
Expected: only `src/lib/dice.ts` itself (where `rollD20`/`rollD20WithAdvantage` call `rollDice`/`generateFaces` internally, and the `*Async` wrappers call the sync versions) — no other file should appear, confirming every call site listed in the spec was actually converted.

- [ ] **Step 3: Verify the async round-trip produces identical output to the sync path**

Run: `npx tsx -e '
import { rollD20Async, rollDiceAsync } from "./src/lib/dice";

(async () => {
  const a = await rollD20Async(5);
  console.log("rollD20Async(5):", a.expression, a.modifier, typeof a.total);
  const b = await rollDiceAsync("2d6+3");
  console.log("rollDiceAsync(\"2d6+3\"):", b.expression, b.rolls, b.total);
})();
'`

Expected: `rollD20Async(5): 1d20+5 5 number` and `rollDiceAsync("2d6+3"): 2d6+3 [X, Y] <sum+3>` where X and Y are each between 1 and 6.

- [ ] **Step 4: Confirm no stray symlinks or worktree pollution**

Run: `find <repo-root> -maxdepth 3 -type l 2>/dev/null | grep -v node_modules`
Expected: no output.

- [ ] **Step 5: Manual dev-server smoke check**

Start `npm run dev`, `curl -s -o /dev/null -w "http:%{http_code}\n" http://localhost:3000` and expect `http:200`, then stop the dev server. Since every roll now resolves via an immediately-fulfilled `Promise`, there should be no visible delay or behavior difference in Ficha (ability/save/skill rolls), Combate (attacks, initiative, the quick dice roller), or level-up's HP roll — confirm this by tracing through the code paths, since Chrome DevTools MCP browser tooling is unavailable this session (consistent with how prior plans this session were verified).

If any step surfaces a real defect, fix it, re-run the full check suite, and commit. If everything passes cleanly, this task produces no commit.
