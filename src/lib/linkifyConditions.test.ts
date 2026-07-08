import { describe, it, expect, vi } from "vitest";
import { isValidElement } from "react";
import { linkifyConditions } from "./linkifyConditions";

describe("linkifyConditions", () => {
  it("wraps a condition name embedded mid-sentence in a clickable element", () => {
    const onClick = vi.fn();
    const result = linkifyConditions(
      "El objetivo hace una salvación de CON o queda Prone.",
      onClick
    );

    const button = result.find(
      (part) => isValidElement(part) && (part.props as { children: string }).children === "Prone"
    );
    expect(button).toBeDefined();
  });

  it("calls onConditionClick with the matched name when clicked", () => {
    const onClick = vi.fn();
    const result = linkifyConditions("El objetivo queda Prone.", onClick);
    const button = result.find(
      (part) => isValidElement(part) && (part.props as { children: string }).children === "Prone"
    );
    (button as React.ReactElement<{ onClick: () => void }>).props.onClick();
    expect(onClick).toHaveBeenCalledWith("Prone");
  });

  it("returns plain text unchanged when no condition is mentioned", () => {
    const result = linkifyConditions("Sin efectos especiales.", vi.fn());
    expect(result.join("")).toBe("Sin efectos especiales.");
    expect(result.every((part) => typeof part === "string")).toBe(true);
  });

  it("links multiple distinct condition mentions in one string", () => {
    const result = linkifyConditions(
      "Puede quedar Prone o Restrained según la tirada.",
      vi.fn()
    );
    const linked = result.filter(isValidElement).map(
      (el) => (el.props as { children: string }).children
    );
    expect(linked).toEqual(["Prone", "Restrained"]);
  });

  it("does not false-positive on a condition name inside a longer unrelated word", () => {
    const result = linkifyConditions("Pronounced clearly.", vi.fn());
    expect(result.every((part) => typeof part === "string")).toBe(true);
    expect(result.join("")).toBe("Pronounced clearly.");
  });
});
