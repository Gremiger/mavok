import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { useViewPref } from "./useViewPref";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  localStorage.clear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function Probe() {
  const [view, setView] = useViewPref("attacksView");
  return <button onClick={() => setView(view === "hand" ? "list" : "hand")}>{view}</button>;
}

describe("useViewPref", () => {
  test("defaults, then persists the choice into the app settings", () => {
    act(() => root.render(<Probe />));
    const btn = container.querySelector("button")!;
    expect(btn.textContent).toBe("hand");
    act(() => btn.click());
    expect(btn.textContent).toBe("list");
    expect(JSON.parse(localStorage.getItem("mavok_settings")!).attacksView).toBe("list");
  });

  test("keeps the other settings intact", () => {
    localStorage.setItem("mavok_settings", JSON.stringify({ theme: "pergamino" }));
    act(() => root.render(<Probe />));
    act(() => container.querySelector("button")!.click());
    expect(JSON.parse(localStorage.getItem("mavok_settings")!).theme).toBe("pergamino");
  });
});
