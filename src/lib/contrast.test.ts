import { describe, expect, test } from "vitest";
import { contrastRatio, hexToRgb, parseThemeTokens } from "./contrast";

describe("hexToRgb", () => {
  test("parses 6-digit hex, case-insensitive", () => {
    expect(hexToRgb("#17130F")).toEqual([0x17, 0x13, 0x0f]);
  });
  test("rejects short, named and rgba colors", () => {
    expect(() => hexToRgb("#fff")).toThrow("Not a 6-digit hex color: #fff");
    expect(() => hexToRgb("red")).toThrow();
    expect(() => hexToRgb("rgba(0,0,0,1)")).toThrow();
  });
});

describe("contrastRatio", () => {
  test("black on white is 21", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });
  test("same color is 1 and order does not matter", () => {
    expect(contrastRatio("#a8977a", "#a8977a")).toBeCloseTo(1, 5);
    expect(contrastRatio("#e8dcc2", "#17130f")).toBeCloseTo(
      contrastRatio("#17130f", "#e8dcc2"),
      10
    );
  });
  test("known pair", () => {
    // #767676 on white is the classic 4.54:1 AA threshold color
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });
});

describe("parseThemeTokens", () => {
  const css = `
@theme inline { --color-background: var(--bg); }
:root,
[data-theme="piedra-viva"] {
  --bg: #17130f;
  --fg: #e8dcc2;
}
[data-theme="pergamino"] { --bg: #d9c9a3; --nav-bg: rgba(1, 2, 3, 0.9); }
[data-theme="pergamino"] body { --bg: #000000; }
:root { --only-root: #111111; }
@media print { body { color: #000; } }
`;
  test("collects tokens per theme, including the :root-shared block", () => {
    const t = parseThemeTokens(css);
    expect(t["piedra-viva"]).toEqual({ bg: "#17130f", fg: "#e8dcc2" });
    expect(t["pergamino"]).toEqual({ bg: "#d9c9a3", "nav-bg": "rgba(1, 2, 3, 0.9)" });
  });
  test("ignores descendant selectors, @theme and bare :root", () => {
    const t = parseThemeTokens(css);
    expect(Object.keys(t).sort()).toEqual(["pergamino", "piedra-viva"]);
    expect(t["pergamino"].bg).toBe("#d9c9a3");
  });
});
