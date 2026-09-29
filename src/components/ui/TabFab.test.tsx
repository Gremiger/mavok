import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { TabFab } from "./TabFab";
import { TabTransition } from "./TabTransition";

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

const fabs = () => document.querySelectorAll('button[aria-label="Añadir"]');

describe("TabFab", () => {
  test("renders outside the tab (portal on body) so tab transforms can't move it", () => {
    act(() => root.render(<TabFab label="Añadir" onClick={() => {}} />));
    expect(fabs()).toHaveLength(1);
    expect(container.contains(fabs()[0])).toBe(false);
  });

  test("a leaving tab's button disappears immediately; the new tab's shows", () => {
    const tab = (key: string) => (
      <TabTransition tabKey={key} order={["a", "b"]} origin={null} mode="normal" scrollOffset={0}>
        {key === "a" ? <TabFab label="Añadir" onClick={() => {}} /> : <p>b</p>}
      </TabTransition>
    );
    act(() => root.render(tab("a")));
    expect(fabs()).toHaveLength(1);
    act(() => root.render(tab("b")));
    expect(fabs()).toHaveLength(0);
  });
});
