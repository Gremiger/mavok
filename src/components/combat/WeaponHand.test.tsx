import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { WeaponHand } from "./WeaponHand";
import type { Attack } from "@/lib/types";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function attack(id: string, name: string): Attack {
  return {
    id, name, attackBonus: 7, damage: "2d6+4", damageType: "Bludgeoning", range: "5 ft",
    properties: [], mastery: "Topple", masteryEffect: null, masterySaveDC: null, versatileDamage: null,
  };
}
const attacks = [attack("a", "Maul"), attack("b", "Handaxe"), attack("c", "Javelin")];
const card = (name: string) => container.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`)!;
const hand = () => container.querySelector("[data-fan]")!;

describe("WeaponHand", () => {
  test("starts as a closed deck; touching it opens the fan without picking", () => {
    const onSelect = vi.fn();
    act(() => root.render(<WeaponHand attacks={attacks} selectedId={null} onSelect={onSelect} />));
    expect(hand().getAttribute("data-fan")).toBe("closed");
    act(() => card("Handaxe").click());
    expect(hand().getAttribute("data-fan")).toBe("open");
    expect(onSelect).not.toHaveBeenCalled();
  });

  test("once open, touching a card picks that weapon", () => {
    const onSelect = vi.fn();
    act(() => root.render(<WeaponHand attacks={attacks} selectedId={null} onSelect={onSelect} />));
    act(() => card("Maul").click());
    act(() => card("Javelin").click());
    expect(onSelect).toHaveBeenLastCalledWith("c");
  });

  test("a picked weapon shows the fan open and pressed; touching it again puts it back", () => {
    const onSelect = vi.fn();
    act(() => root.render(<WeaponHand attacks={attacks} selectedId="b" onSelect={onSelect} />));
    expect(hand().getAttribute("data-fan")).toBe("open");
    expect(card("Handaxe").getAttribute("aria-pressed")).toBe("true");
    expect(card("Maul").getAttribute("aria-pressed")).toBe("false");
    act(() => card("Handaxe").click());
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });
});
