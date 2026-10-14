import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const loadAnimation = vi.fn((opts: { container: HTMLElement }) => {
  opts.container.appendChild(document.createElement("svg"));
  return { destroy: vi.fn(), addEventListener: vi.fn(), goToAndStop: vi.fn(), totalFrames: 10 };
});
vi.mock("lottie-web/build/player/lottie_light", () => ({ default: { loadAnimation } }));

import { LottieArt } from "./LottieArt";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  loadAnimation.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

// The player and the artwork are dynamic imports; give them time to arrive.
const settle = async (until = () => loadAnimation.mock.calls.length > 0) => {
  for (let i = 0; i < 100 && !until(); i++) await act(() => new Promise((r) => setTimeout(r, 20)));
};

describe("LottieArt", () => {
  test("is decorative and loads its animation into itself", async () => {
    act(() => root.render(<LottieArt name="chest" />));
    const box = container.querySelector<HTMLElement>('[data-lottie="chest"]')!;
    expect(box.getAttribute("aria-hidden")).toBe("true");
    await settle();
    expect(loadAnimation).toHaveBeenCalledTimes(1);
    const opts = loadAnimation.mock.calls[0][0] as unknown as { container: HTMLElement; loop: boolean; autoplay: boolean };
    expect(opts.container).toBe(box);
    expect(opts.loop).toBe(false);
    expect(opts.autoplay).toBe(true);
  });

  test("loop keeps it going", async () => {
    act(() => root.render(<LottieArt name="quill" loop />));
    await settle();
    expect((loadAnimation.mock.calls[0][0] as unknown as { loop: boolean }).loop).toBe(true);
  });

  test("unmounting before the chunks arrive never starts it", async () => {
    act(() => root.render(<LottieArt name="book" />));
    act(() => root.render(<div />));
    await settle(() => false);
    expect(loadAnimation).not.toHaveBeenCalled();
  });
});
