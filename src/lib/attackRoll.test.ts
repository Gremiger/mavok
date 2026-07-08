import { describe, it, expect } from "vitest";
import {
  isStrBasedAttack,
  computeRageBonus,
  rollAttackHit,
  rollAttackDamage,
  toggleVersatileDamage,
} from "./attackRoll";
import type { Attack } from "./types";

function makeAttack(overrides: Partial<Attack> = {}): Attack {
  return {
    id: "atk-1",
    name: "Greataxe",
    attackBonus: 5,
    damage: "1d12+3",
    damageType: "Slashing",
    range: "5 ft",
    properties: ["Heavy", "Two-Handed"],
    mastery: null,
    masteryEffect: null,
    masterySaveDC: null,
    versatileDamage: null,
    ...overrides,
  };
}

describe("isStrBasedAttack", () => {
  it("is true for a non-Finesse weapon", () => {
    expect(isStrBasedAttack(makeAttack())).toBe(true);
  });

  it("is false for a Finesse weapon", () => {
    expect(isStrBasedAttack(makeAttack({ properties: ["Finesse", "Light"] }))).toBe(false);
  });
});

describe("computeRageBonus", () => {
  it("returns rageDamage when raging on a STR-based attack", () => {
    expect(computeRageBonus(makeAttack(), true, 2)).toBe(2);
  });

  it("returns 0 when not raging", () => {
    expect(computeRageBonus(makeAttack(), false, 2)).toBe(0);
  });

  it("returns 0 for a Finesse weapon even while raging", () => {
    const finesse = makeAttack({ properties: ["Finesse"] });
    expect(computeRageBonus(finesse, true, 2)).toBe(0);
  });
});

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

describe("toggleVersatileDamage", () => {
  it("swaps the base dice with the stored alternate, preserving the modifier", () => {
    const attack = makeAttack({
      damage: "1d8+3",
      versatileDamage: "1d10",
      properties: ["Versatile"],
    });
    const result = toggleVersatileDamage(attack);
    expect(result.damage).toBe("1d10+3");
    expect(result.versatileDamage).toBe("1d8");
  });

  it("toggling twice returns to the original state", () => {
    const attack = makeAttack({
      damage: "1d8+3",
      versatileDamage: "1d10",
      properties: ["Versatile"],
    });
    const result = toggleVersatileDamage(toggleVersatileDamage(attack));
    expect(result.damage).toBe("1d8+3");
    expect(result.versatileDamage).toBe("1d10");
  });

  it("preserves a negative modifier", () => {
    const attack = makeAttack({
      damage: "1d8-2",
      versatileDamage: "1d10",
      properties: ["Versatile"],
    });
    const result = toggleVersatileDamage(attack);
    expect(result.damage).toBe("1d10-2");
  });

  it("handles a damage string with no modifier", () => {
    const attack = makeAttack({
      damage: "1d8",
      versatileDamage: "1d10",
      properties: ["Versatile"],
    });
    const result = toggleVersatileDamage(attack);
    expect(result.damage).toBe("1d10");
    expect(result.versatileDamage).toBe("1d8");
  });

  it("is a no-op when versatileDamage is null", () => {
    const attack = makeAttack({ damage: "1d12+3", versatileDamage: null });
    const result = toggleVersatileDamage(attack);
    expect(result).toEqual(attack);
  });
});
