import { describe, expect, test } from "vitest";
import {
  EFFECT_DURATIONS,
  TAB_TRANSITION_MS,
  addEffect,
  pruneEffects,
  shouldAnimate,
  swipeOrigin,
  tabDirection,
  type ActiveEffect,
  type EffectName,
} from "./motion";

const NAMES: EffectName[] = [
  "rage-ignite",
  "rage-end",
  "crit",
  "level-up",
  "long-rest",
  "short-rest",
  "inspiration",
];

describe("durations", () => {
  test("every effect has a positive duration", () => {
    for (const n of NAMES) expect(EFFECT_DURATIONS[n]).toBeGreaterThan(0);
  });
  test("tab transitions: flashy is longer than normal", () => {
    expect(TAB_TRANSITION_MS.normal).toBe(300);
    expect(TAB_TRANSITION_MS.flashy).toBe(820);
  });
});

describe("shouldAnimate", () => {
  test("only flashy without reduced motion animates", () => {
    expect(shouldAnimate("flashy", false)).toBe(true);
    expect(shouldAnimate("flashy", true)).toBe(false);
    expect(shouldAnimate("normal", false)).toBe(false);
    expect(shouldAnimate("normal", true)).toBe(false);
  });
});

describe("active effect list", () => {
  const crit: ActiveEffect = { id: "crit-1", name: "crit", startedAt: 1000 };
  test("addEffect appends", () => {
    expect(addEffect([], crit)).toEqual([crit]);
  });
  test("addEffect ignores an id that is already active", () => {
    const list = addEffect([crit], { ...crit, startedAt: 2000 });
    expect(list).toHaveLength(1);
    expect(list[0].startedAt).toBe(1000);
  });
  test("pruneEffects keeps running effects and drops finished ones", () => {
    const end = crit.startedAt + EFFECT_DURATIONS.crit;
    expect(pruneEffects([crit], end - 1)).toEqual([crit]);
    expect(pruneEffects([crit], end)).toEqual([]);
  });
});

describe("tabDirection", () => {
  const order = ["ficha", "combate", "notas"] as const;
  test("moving right is +1, left is -1", () => {
    expect(tabDirection(order, "ficha", "notas")).toBe(1);
    expect(tabDirection(order, "notas", "combate")).toBe(-1);
  });
  test("same tab counts as +1", () => {
    expect(tabDirection(order, "combate", "combate")).toBe(1);
  });
});

describe("swipeOrigin", () => {
  test("moving right in order starts the ink at the right edge", () => {
    expect(swipeOrigin(1, 390, 844)).toEqual({ x: 390, y: 804 });
  });
  test("moving left starts it at the left edge", () => {
    expect(swipeOrigin(-1, 390, 844)).toEqual({ x: 0, y: 804 });
  });
});
