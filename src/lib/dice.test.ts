import { describe, it, expect } from "vitest";
import { isD20Crit, isD20Fumble, type DiceRoll } from "./dice";

function makeRoll(overrides: Partial<DiceRoll> = {}): DiceRoll {
  return {
    expression: "1d20+0",
    rolls: [10],
    modifier: 0,
    total: 10,
    timestamp: 0,
    ...overrides,
  };
}

describe("isD20Crit", () => {
  it("returns true for a natural 20 on a d20 roll", () => {
    expect(isD20Crit(makeRoll({ rolls: [20], total: 20 }))).toBe(true);
  });

  it("returns false for a non-20 d20 roll", () => {
    expect(isD20Crit(makeRoll({ rolls: [15], total: 15 }))).toBe(false);
  });

  it("returns false for a 20 on a non-d20 expression", () => {
    expect(
      isD20Crit(makeRoll({ expression: "2d6+5", rolls: [20, 5], total: 30 }))
    ).toBe(false);
  });

  it("recognizes an advantage-roll expression as a d20 roll", () => {
    expect(
      isD20Crit(
        makeRoll({ expression: "1d20adv+3", rolls: [20, 12], total: 23 })
      )
    ).toBe(true);
  });
});

describe("isD20Fumble", () => {
  it("returns true for a natural 1 on a d20 roll", () => {
    expect(isD20Fumble(makeRoll({ rolls: [1], total: 1 }))).toBe(true);
  });

  it("returns false for a non-1 d20 roll", () => {
    expect(isD20Fumble(makeRoll({ rolls: [15], total: 15 }))).toBe(false);
  });

  it("returns false for a 1 on a non-d20 expression", () => {
    expect(
      isD20Fumble(makeRoll({ expression: "2d6+5", rolls: [1, 1], total: 7 }))
    ).toBe(false);
  });
});
