import { describe, it, expect } from "vitest";
import { spendHitDie } from "./hitDice";
import type { CombatState } from "./types";

function makeCombat(overrides: Partial<CombatState> = {}): CombatState {
  return {
    maxHp: 16,
    currentHp: 10,
    tempHp: 0,
    armorClass: 14,
    initiative: 2,
    speed: 35,
    passivePerception: 13,
    hitDice: { total: 2, remaining: 2, die: "d12" },
    deathSaves: { successes: 0, failures: 0 },
    conditions: [],
    recklessActive: false,
    exhaustionLevel: 0,
    ...overrides,
  };
}

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
