import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CollapsibleSection } from "./CollapsibleSection";

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

function render(ui: React.ReactNode) {
  act(() => root.render(ui));
}
const toggle = () => container.querySelector("button[aria-expanded]") as HTMLButtonElement;

describe("CollapsibleSection", () => {
  test("starts collapsed, shows count, hides children", () => {
    render(<CollapsibleSection title="Habilidades" count={18}><p>body</p></CollapsibleSection>);
    expect(toggle().getAttribute("aria-expanded")).toBe("false");
    expect(container.textContent).toContain("18");
    expect(container.textContent).not.toContain("body");
  });

  test("opening shows children and hides the count", () => {
    render(<CollapsibleSection title="Habilidades" count={18}><p>body</p></CollapsibleSection>);
    act(() => toggle().click());
    expect(toggle().getAttribute("aria-expanded")).toBe("true");
    expect(container.textContent).toContain("body");
    expect(container.textContent).not.toContain("18");
  });

  test("clicking an aside control runs it without toggling the section", () => {
    const onAside = vi.fn();
    render(
      <CollapsibleSection title="Habilidades" aside={<button onClick={onAside}>Grupo</button>}>
        <p>body</p>
      </CollapsibleSection>
    );
    const asideButton = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "Grupo"
    )!;
    act(() => asideButton.click());
    expect(onAside).toHaveBeenCalledOnce();
    expect(toggle().getAttribute("aria-expanded")).toBe("false");
    expect(toggle().contains(asideButton)).toBe(false);
  });

  test("aside stays visible while open", () => {
    render(
      <CollapsibleSection title="Atributos" defaultOpen aside={<span>competencia +2</span>}>
        <p>body</p>
      </CollapsibleSection>
    );
    expect(container.textContent).toContain("competencia +2");
  });

  test("a new forceOpenKey opens a collapsed section", () => {
    render(<CollapsibleSection title="Acciones" forceOpenKey={0}><p>body</p></CollapsibleSection>);
    expect(container.textContent).not.toContain("body");
    render(<CollapsibleSection title="Acciones" forceOpenKey={1}><p>body</p></CollapsibleSection>);
    expect(container.textContent).toContain("body");
  });

  test("numeral slot is decorative and empty (numbering is pure CSS)", () => {
    render(<CollapsibleSection title="Dotes"><p>body</p></CollapsibleSection>);
    const num = container.querySelector(".chapter-num")!;
    expect(num.getAttribute("aria-hidden")).toBe("true");
    expect(num.textContent).toBe("");
  });
});
