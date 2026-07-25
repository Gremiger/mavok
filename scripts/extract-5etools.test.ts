import { describe, it, expect } from "vitest";
import { flattenEntries } from "./extract-helpers";

describe("flattenEntries", () => {
  it("still flattens a plain nested named section (existing behavior)", () => {
    const entries = [
      "Intro text.",
      { name: "Section One", entries: ["Section one body."] },
    ];
    expect(flattenEntries(entries)).toBe(
      "Intro text. **Section One:** Section one body."
    );
  });

  it("recurses into a list of named items instead of dropping them", () => {
    const entries = [
      "While attuned, you gain the following benefits:",
      {
        type: "list",
        items: [
          {
            type: "item",
            name: "Darkvision",
            entries: ["You gain Darkvision with a range of 60 feet."],
          },
          {
            type: "item",
            name: "Fortitude of Stone",
            entries: ["Your Constitution increases by 2."],
          },
        ],
      },
    ];
    const result = flattenEntries(entries);
    expect(result).toContain("Darkvision");
    expect(result).toContain("You gain Darkvision with a range of 60 feet.");
    expect(result).toContain("Fortitude of Stone");
    expect(result).toContain("Your Constitution increases by 2.");
  });

  it("recurses into a list of plain strings instead of dropping them", () => {
    const entries = [
      "The item has the following random properties:",
      {
        type: "list",
        items: ["2 minor beneficial properties", "1 major beneficial property"],
      },
    ];
    const result = flattenEntries(entries);
    expect(result).toContain("2 minor beneficial properties");
    expect(result).toContain("1 major beneficial property");
  });
});
