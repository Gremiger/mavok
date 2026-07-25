import { describe, it, expect } from "vitest";
import { stripMarkdown } from "./markdown";

describe("stripMarkdown", () => {
  it("strips bold markers", () => {
    expect(stripMarkdown("**Can't See:** You can't see.")).toBe(
      "Can't See: You can't see."
    );
  });

  it("strips italic markers", () => {
    expect(stripMarkdown("*Can't See:*")).toBe("Can't See:");
  });

  it("strips list markers at the start of a line", () => {
    expect(stripMarkdown("- First point\n- Second point")).toBe(
      "First point\nSecond point"
    );
  });

  it("strips numbered list markers", () => {
    expect(stripMarkdown("1. First\n2. Second")).toBe("First\nSecond");
  });

  it("leaves plain text untouched", () => {
    expect(stripMarkdown("No markdown here.")).toBe("No markdown here.");
  });

  it("produces no stray asterisk after truncating the stripped text", () => {
    const text =
      "**Exhaustion Levels:** This condition is cumulative and dangerous.";
    const truncated = stripMarkdown(text).slice(0, 20);
    expect(truncated).not.toContain("*");
  });
});
