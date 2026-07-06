import { describe, it, expect } from "vitest";
import { exhaustionPenalty } from "./exhaustion";

describe("exhaustionPenalty", () => {
  it("returns 0 at level 0", () => {
    // -2 * 0 is -0 in JS; === treats it as equal to 0, which is what matters here.
    expect(exhaustionPenalty(0) === 0).toBe(true);
  });

  it("returns -6 at level 3", () => {
    expect(exhaustionPenalty(3)).toBe(-6);
  });

  it("returns -12 at level 6", () => {
    expect(exhaustionPenalty(6)).toBe(-12);
  });
});
