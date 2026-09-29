import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { TabTransition, type TransitionMode } from "./TabTransition";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ORDER = ["ficha", "combate", "notas"] as const;

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

function render(tab: string, mode: TransitionMode) {
  act(() =>
    root.render(
      <TabTransition tabKey={tab} order={ORDER} origin={{ x: 100, y: 700 }} mode={mode} scrollOffset={0}>
        <p>{tab} content</p>
      </TabTransition>
    )
  );
}
const panels = () => Array.from(container.querySelectorAll(".tab-panel"));

describe("TabTransition", () => {
  test("renders one chapters panel initially", () => {
    render("ficha", "normal");
    expect(panels()).toHaveLength(1);
    expect(panels()[0].classList.contains("chapters")).toBe(true);
    expect(container.textContent).toContain("ficha content");
  });

  test("normal: old tab animates out alongside the new one, then is removed", () => {
    render("ficha", "normal");
    render("combate", "normal");
    expect(panels()).toHaveLength(2);
    expect(panels()[0].className).toContain("fx-normal-out");
    expect(panels()[1].className).toContain("fx-normal-in");
    act(() => vi.advanceTimersByTime(300));
    expect(panels()).toHaveLength(1);
    expect(container.textContent).toContain("combate content");
    expect(container.textContent).not.toContain("ficha content");
  });

  test("flashy: ink splat shows during the transition and is gone after", () => {
    render("ficha", "flashy");
    render("combate", "flashy");
    expect(container.querySelector(".tab-splat")).not.toBeNull();
    act(() => vi.advanceTimersByTime(820));
    expect(container.querySelector(".tab-splat")).toBeNull();
    expect(panels()).toHaveLength(1);
  });

  test("a second change mid-transition never stacks three panels", () => {
    render("ficha", "flashy");
    render("combate", "flashy");
    act(() => vi.advanceTimersByTime(100));
    render("notas", "flashy");
    expect(panels().length).toBeLessThanOrEqual(2);
    expect(container.textContent).toContain("notas content");
    expect(container.textContent).not.toContain("ficha content");
    act(() => vi.advanceTimersByTime(820));
    expect(panels()).toHaveLength(1);
    expect(container.textContent).toContain("notas content");
  });

  test("the leaving tab keeps its component state (no remount)", () => {
    let mounts = 0;
    function Counter() {
      const [n] = useState(() => ++mounts);
      return <span>mount {n}</span>;
    }
    act(() =>
      root.render(
        <TabTransition tabKey="ficha" order={ORDER} origin={null} mode="normal" scrollOffset={0}>
          <Counter />
        </TabTransition>
      )
    );
    act(() =>
      root.render(
        <TabTransition tabKey="combate" order={ORDER} origin={null} mode="normal" scrollOffset={0}>
          <p>combate</p>
        </TabTransition>
      )
    );
    expect(mounts).toBe(1);
  });

  test("instant mode swaps immediately", () => {
    render("ficha", "instant");
    render("combate", "instant");
    expect(panels()).toHaveLength(1);
    expect(container.textContent).toContain("combate content");
  });
});
