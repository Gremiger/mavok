import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { HandDrawn } from "./HandDrawn";

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

const mark = () => container.querySelector(".rough-annotation");

describe("HandDrawn", () => {
  test("no ink while hidden", () => {
    act(() => root.render(<HandDrawn show={false} type="strike-through">Rescatar al herrero</HandDrawn>));
    expect(mark()).toBeNull();
    expect(container.textContent).toBe("Rescatar al herrero");
  });

  test("a mark already on at mount is there, inside the toned wrapper", () => {
    act(() => root.render(<HandDrawn show type="crossed-off" tone="danger">Rescatar al herrero</HandDrawn>));
    expect(mark()?.parentElement?.getAttribute("data-tone")).toBe("danger");
  });

  test("turning it off wipes the ink", () => {
    act(() => root.render(<HandDrawn show type="strike-through">Rescatar al herrero</HandDrawn>));
    act(() => root.render(<HandDrawn show={false} type="strike-through">Rescatar al herrero</HandDrawn>));
    expect(mark()).toBeNull();
  });
});
