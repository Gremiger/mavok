import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { TabIcon } from "./TabIcon";

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

describe("TabIcon", () => {
  test("plays its gesture only while its tab is active", () => {
    act(() => root.render(<TabIcon tab="combate" active={false} />));
    const icon = () => container.querySelector("[data-gesture]")!;
    expect(icon().getAttribute("data-gesture")).toBe("off");
    expect(icon().querySelector("svg")).not.toBeNull();
    act(() => root.render(<TabIcon tab="combate" active />));
    expect(icon().getAttribute("data-gesture")).toBe("on");
  });
});
