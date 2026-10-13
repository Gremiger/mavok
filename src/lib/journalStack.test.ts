import { describe, expect, test } from "vitest";
import { indexFromPointer, stackPose, VISIBLE_BEHIND } from "./journalStack";

describe("stackPose", () => {
  test("the active card is the front one, fully visible", () => {
    const p = stackPose(3, 3);
    expect(p.y).toBe(0);
    expect(p.z).toBe(0);
    expect(p.opacity).toBe(1);
    expect(p.hidden).toBe(false);
  });

  test("cards behind recede up and back, fading", () => {
    const one = stackPose(4, 3);
    const two = stackPose(5, 3);
    expect(one.y).toBeLessThan(0);
    expect(two.y).toBeLessThan(one.y);
    expect(two.z).toBeLessThan(one.z);
    expect(two.opacity).toBeLessThan(one.opacity);
  });

  test("cards already passed fly toward the viewer and vanish", () => {
    const p = stackPose(2, 3);
    expect(p.opacity).toBe(0);
    expect(p.y).toBeGreaterThan(0);
    expect(p.scale).toBeGreaterThan(1);
  });

  test("only a few cards behind the front are drawn", () => {
    expect(stackPose(3 + VISIBLE_BEHIND, 3).hidden).toBe(false);
    expect(stackPose(4 + VISIBLE_BEHIND, 3).hidden).toBe(true);
    expect(stackPose(1, 3).hidden).toBe(true);
  });
});

describe("indexFromPointer", () => {
  test("maps the pointer's position on the scrubber to an entry", () => {
    expect(indexFromPointer(100, 100, 200, 4)).toBe(0);
    expect(indexFromPointer(160, 100, 200, 4)).toBe(1);
    expect(indexFromPointer(299, 100, 200, 4)).toBe(3);
  });

  test("clamps outside the scrubber", () => {
    expect(indexFromPointer(0, 100, 200, 4)).toBe(0);
    expect(indexFromPointer(999, 100, 200, 4)).toBe(3);
  });
});
