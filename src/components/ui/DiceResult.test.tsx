import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { DiceResult } from "./DiceResult";
import { EffectsProvider } from "@/components/effects/EffectsProvider";
import type { DiceRoll } from "@/lib/dice";
import type { MotionStyle } from "@/lib/motion";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

const nat20: DiceRoll = { expression: "1d20+5", rolls: [20], modifier: 5, total: 25, timestamp: 111 };
const nat1: DiceRoll = { expression: "1d20+5", rolls: [1], modifier: 5, total: 6, timestamp: 222 };
const noop = () => {};

function render(roll: DiceRoll, motionStyle: MotionStyle, label = "Maul") {
  act(() =>
    root.render(
      <EffectsProvider motionStyle={motionStyle} reducedMotion={false} rageActive={false}>
        <DiceResult roll={roll} label={label} onClear={noop} />
      </EffectsProvider>
    )
  );
}
const crits = () => document.querySelectorAll('[data-effect="crit"]');

describe("DiceResult flashy effects", () => {
  test("a nat 20 plays the crit effect once in flashy mode", () => {
    render(nat20, "flashy");
    expect(crits()).toHaveLength(1);
  });

  test("re-rendering the same roll does not replay the crit", () => {
    render(nat20, "flashy");
    render(nat20, "flashy", "Maul (otra vez)");
    expect(crits()).toHaveLength(1);
  });

  test("re-mounting the same roll after the crit ended does not replay it", () => {
    render(nat20, "flashy");
    act(() => vi.advanceTimersByTime(1500));
    expect(crits()).toHaveLength(0);
    // Collapse (unmount) and reopen (re-mount) the result, as a CollapsibleSection does.
    act(() =>
      root.render(
        <EffectsProvider motionStyle="flashy" reducedMotion={false} rageActive={false}>
          <p>collapsed</p>
        </EffectsProvider>
      )
    );
    render(nat20, "flashy");
    expect(crits()).toHaveLength(0);
  });

  test("normal mode never plays the crit effect", () => {
    render(nat20, "normal");
    expect(crits()).toHaveLength(0);
  });

  test("a nat 1 gets the fumble crack in flashy mode only", () => {
    render(nat1, "flashy");
    expect(container.querySelector(".roll-crack")).not.toBeNull();
    render({ ...nat1, timestamp: 223 }, "normal");
    expect(container.querySelector(".roll-crack")).toBeNull();
  });
});
