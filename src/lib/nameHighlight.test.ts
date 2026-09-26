import { describe, expect, test } from "vitest";
import { splitNameHighlight } from "./nameHighlight";

const joined = (p: ReturnType<typeof splitNameHighlight>) => p.before + p.highlight + p.after;

describe("splitNameHighlight", () => {
  test("highlights the second word up to its first hyphen", () => {
    const p = splitNameHighlight("Mavok Toro-de-casa Toduk-Rojum");
    expect(p).toEqual({ before: "Mavok ", highlight: "Toro", after: "-de-casa Toduk-Rojum" });
  });
  test("plain second word", () => {
    expect(splitNameHighlight("Mavok Grr")).toEqual({ before: "Mavok ", highlight: "Grr", after: "" });
  });
  test("single word: no highlight", () => {
    expect(splitNameHighlight("Mavok")).toEqual({ before: "Mavok", highlight: "", after: "" });
  });
  test("empty and whitespace-only names", () => {
    expect(splitNameHighlight("")).toEqual({ before: "", highlight: "", after: "" });
    expect(splitNameHighlight("   ")).toEqual({ before: "", highlight: "", after: "" });
  });
  test("extra spaces are preserved between words, outer spaces trimmed", () => {
    const p = splitNameHighlight("  Mavok   Toro  ");
    expect(p.highlight).toBe("Toro");
    expect(joined(p)).toBe("Mavok   Toro");
  });
  test("second word starting with a hyphen: no highlight, no text lost", () => {
    const p = splitNameHighlight("Mavok -Toro");
    expect(p.highlight).toBe("");
    expect(joined(p)).toBe("Mavok -Toro");
  });
});
