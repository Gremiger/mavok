import { describe, it, expect } from "vitest";
import { shouldUseRageBadge } from "./rageDisplay";

describe("shouldUseRageBadge", () => {
  it("returns false for 2 total slots (level 1-2)", () => {
    expect(shouldUseRageBadge(2)).toBe(false);
  });

  it("returns false for 4 total slots (level 6-11)", () => {
    expect(shouldUseRageBadge(4)).toBe(false);
  });

  it("returns true for 5 total slots (level 12-16)", () => {
    expect(shouldUseRageBadge(5)).toBe(true);
  });

  it("returns true for 6 total slots (level 17-20, the max)", () => {
    expect(shouldUseRageBadge(6)).toBe(true);
  });
});
