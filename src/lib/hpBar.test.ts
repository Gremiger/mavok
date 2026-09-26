import { describe, expect, test } from "vitest";
import { hpFraction } from "./hpBar";

describe("hpFraction", () => {
  test("ratio of current to max", () => {
    expect(hpFraction(47, 55)).toBeCloseTo(47 / 55, 10);
  });
  test("clamps above max (e.g. over-healed) to 1", () => {
    expect(hpFraction(60, 55)).toBe(1);
  });
  test("clamps negative HP to 0", () => {
    expect(hpFraction(-5, 55)).toBe(0);
  });
  test("max of 0 or less gives 0, never NaN/Infinity", () => {
    expect(hpFraction(0, 0)).toBe(0);
    expect(hpFraction(10, 0)).toBe(0);
    expect(hpFraction(10, -3)).toBe(0);
  });
  test("non-finite inputs give 0", () => {
    expect(hpFraction(Number.NaN, 55)).toBe(0);
    expect(hpFraction(10, Number.POSITIVE_INFINITY)).toBe(0);
  });
});
