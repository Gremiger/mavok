import { describe, it, expect } from "vitest";
import {
  isD20Crit,
  isD20Fumble,
  parseExpression,
  generateFaces,
  composeRoll,
  type DiceRoll,
} from "./dice";

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
