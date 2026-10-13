import { describe, expect, test } from "vitest";
import { fanPoses } from "./cardFan";

describe("fanPoses", () => {
  test("closed: every card sits on the deck, nothing spread out", () => {
    const poses = fanPoses(4, { open: false, selected: null });
    for (const p of poses) {
      expect(p.x).toBe(0);
      expect(Math.abs(p.rotate)).toBeLessThanOrEqual(4);
    }
  });

  test("open: the arc is symmetric around the middle card", () => {
    const poses = fanPoses(5, { open: true, selected: null });
    expect(poses[0].rotate).toBeLessThan(0);
    expect(poses[0].rotate).toBeCloseTo(-poses[4].rotate);
    expect(poses[0].x).toBeCloseTo(-poses[4].x);
    expect(poses[2].rotate).toBeCloseTo(0);
    expect(poses[2].x).toBeCloseTo(0);
    // edges dip lower than the middle (a curved hand, not a flat row)
    expect(poses[0].y).toBeGreaterThan(poses[2].y);
  });

  test("open: the total spread stays inside a phone-width row however many cards", () => {
    for (const n of [2, 3, 7, 10]) {
      const poses = fanPoses(n, { open: true, selected: null });
      expect(poses[n - 1].x - poses[0].x).toBeLessThanOrEqual(130);
      expect(poses[n - 1].rotate - poses[0].rotate).toBeLessThanOrEqual(40);
    }
  });

  test("a single card stays centred and upright", () => {
    const [p] = fanPoses(1, { open: true, selected: null });
    expect(p.x).toBe(0);
    expect(p.rotate).toBe(0);
  });

  test("the selected card lifts, grows and goes on top", () => {
    const plain = fanPoses(3, { open: true, selected: null });
    const picked = fanPoses(3, { open: true, selected: 0 });
    expect(picked[0].y).toBeLessThan(plain[0].y);
    expect(picked[0].scale).toBeGreaterThan(1);
    expect(picked[0].zIndex).toBeGreaterThan(Math.max(picked[1].zIndex, picked[2].zIndex));
  });

  test("later cards overlap earlier ones, like a hand held in the left", () => {
    const poses = fanPoses(3, { open: true, selected: null });
    expect(poses[0].zIndex).toBeLessThan(poses[1].zIndex);
    expect(poses[1].zIndex).toBeLessThan(poses[2].zIndex);
  });
});
