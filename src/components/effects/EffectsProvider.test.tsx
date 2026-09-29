import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { EffectsProvider, useEffects } from "./EffectsProvider";
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

function PlayButton({ id = "c1" }: { id?: string }) {
  const { play } = useEffects();
  return <button onClick={() => play("crit", { id, origin: { x: 10, y: 10 } })}>go</button>;
}

function render(motionStyle: MotionStyle, reducedMotion = false, rageActive = false) {
  act(() =>
    root.render(
      <EffectsProvider motionStyle={motionStyle} reducedMotion={reducedMotion} rageActive={rageActive}>
        <PlayButton />
      </EffectsProvider>
    )
  );
}
const click = () => act(() => container.querySelector("button")!.click());
const effects = (name: string) => document.querySelectorAll(`[data-effect="${name}"]`);

describe("EffectsProvider", () => {
  test("normal style plays nothing", () => {
    render("normal");
    click();
    expect(effects("crit")).toHaveLength(0);
  });

  test("flashy renders the effect and removes it after its duration", () => {
    render("flashy");
    click();
    expect(effects("crit")).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1399));
    expect(effects("crit")).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1));
    expect(effects("crit")).toHaveLength(0);
  });

  test("the same id played twice renders once", () => {
    render("flashy");
    click();
    click();
    expect(effects("crit")).toHaveLength(1);
  });

  test("an id that already played never replays, even after the effect ended", () => {
    render("flashy");
    click();
    act(() => vi.advanceTimersByTime(1500));
    expect(effects("crit")).toHaveLength(0);
    click();
    expect(effects("crit")).toHaveLength(0);
  });

  test("reduced motion suppresses flashy effects", () => {
    render("flashy", true);
    click();
    expect(effects("crit")).toHaveLength(0);
  });

  test("breathing rage glow shows only while raging in flashy mode", () => {
    render("flashy", false, true);
    expect(effects("rage-glow")).toHaveLength(1);
    render("normal", false, true);
    expect(effects("rage-glow")).toHaveLength(0);
    render("flashy", false, false);
    expect(effects("rage-glow")).toHaveLength(0);
  });

  test("the layer never intercepts taps", () => {
    render("flashy");
    const layer = document.querySelector("[data-effects-layer]") as HTMLElement;
    expect(layer).not.toBeNull();
    expect(layer.className).toContain("effects-layer");
  });
});
