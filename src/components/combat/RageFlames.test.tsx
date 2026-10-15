import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { RageFlames } from "./RageFlames";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

test("without WebGL it leaves an empty, hidden canvas and unmounts cleanly", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(<RageFlames />));
  const canvas = container.querySelector("canvas.rage-flames")!;
  expect(canvas.getAttribute("aria-hidden")).toBe("true");
  act(() => root.unmount());
});
