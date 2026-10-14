import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Modal } from "./Modal";

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

// The sheet portals to <body>, so queries go through the whole document.
const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]');

describe("Modal", () => {
  test("renders nothing while closed", () => {
    act(() => root.render(<Modal open={false} onClose={() => {}} title="Puntos de golpe"><p>contenido</p></Modal>));
    expect(dialog()).toBeNull();
  });

  test("open, it is a dialog labelled by its title", () => {
    act(() => root.render(<Modal open onClose={() => {}} title="Puntos de golpe"><p>contenido</p></Modal>));
    const d = dialog()!;
    const labelId = d.getAttribute("aria-labelledby")!;
    expect(document.getElementById(labelId)?.textContent).toBe("Puntos de golpe");
    expect(d.textContent).toContain("contenido");
  });

  test("the close button closes it", () => {
    const onClose = vi.fn();
    act(() => root.render(<Modal open onClose={onClose} title="Puntos de golpe"><p>contenido</p></Modal>));
    act(() => dialog()!.querySelector<HTMLButtonElement>('button[aria-label="Cerrar"]')!.click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
