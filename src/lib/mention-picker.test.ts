import { describe, it, expect } from "vitest";
import { findActiveMention, filterLinkables } from "./mention-picker";
import type { LinkableNote } from "./note-links";

describe("findActiveMention", () => {
  it("finds a simple mention at the caret", () => {
    const result = findActiveMention("hola @Ri", 8);
    expect(result).toEqual({ start: 5, query: "Ri" });
  });

  it("finds a multi-word query spanning spaces", () => {
    const value = "vive en @Bar de Nim";
    const result = findActiveMention(value, value.length);
    expect(result).toEqual({ start: 8, query: "Bar de Nim" });
  });

  it("does not trigger mid-word (no whitespace before @)", () => {
    const result = findActiveMention("email@domain", 12);
    expect(result).toBeNull();
  });

  it("treats start-of-string as a valid boundary", () => {
    const result = findActiveMention("@Riti", 5);
    expect(result).toEqual({ start: 0, query: "Riti" });
  });

  it("invalidates a mention that crosses a newline", () => {
    const value = "@Bar\nde Nim";
    const result = findActiveMention(value, value.length);
    expect(result).toBeNull();
  });

  it("resolves the query relative to the caret, not the end of string", () => {
    const value = "@Bar de Nim resto del texto";
    const result = findActiveMention(value, 4);
    expect(result).toEqual({ start: 0, query: "Bar" });
  });

  it("returns null when there is no @ before the caret", () => {
    const result = findActiveMention("sin mencion aqui", 5);
    expect(result).toBeNull();
  });
});

describe("filterLinkables", () => {
  const linkables: LinkableNote[] = [
    { id: "1", section: "npcs", title: "Riti" },
    { id: "2", section: "world", title: "Bar de Nim" },
    { id: "3", section: "world", title: "Bar del Puerto" },
    { id: "4", section: "quests", title: "Rescatar a Riti" },
  ];

  it("matches case-insensitively by prefix", () => {
    const result = filterLinkables(linkables, "riti");
    expect(result.map((l) => l.title)).toEqual(["Riti"]);
  });

  it("returns the first N linkables for an empty query", () => {
    const result = filterLinkables(linkables, "", 2);
    expect(result).toEqual(linkables.slice(0, 2));
  });

  it("respects the limit", () => {
    const result = filterLinkables(linkables, "bar", 1);
    expect(result.length).toBe(1);
  });

  it("returns an empty array when nothing matches", () => {
    const result = filterLinkables(linkables, "zzz");
    expect(result).toEqual([]);
  });

  it("does not match mid-title substrings, only prefixes", () => {
    const result = filterLinkables(linkables, "riti");
    expect(result.map((l) => l.title)).not.toContain("Rescatar a Riti");
  });
});
