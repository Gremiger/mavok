import { afterEach, describe, expect, test } from "vitest";
import { applyThemeColor } from "./themeColor";

afterEach(() => {
  document.head.innerHTML = "";
});

describe("applyThemeColor", () => {
  test("updates the theme-color meta content", () => {
    document.head.innerHTML = '<meta name="theme-color" content="#000000">';
    applyThemeColor(document, "#d9c9a3");
    expect(
      document.querySelector('meta[name="theme-color"]')?.getAttribute("content")
    ).toBe("#d9c9a3");
  });
  test("does nothing when the meta tag is absent", () => {
    expect(() => applyThemeColor(document, "#d9c9a3")).not.toThrow();
  });
  test("does nothing when bg is undefined", () => {
    document.head.innerHTML = '<meta name="theme-color" content="#17130f">';
    applyThemeColor(document, undefined);
    expect(
      document.querySelector('meta[name="theme-color"]')?.getAttribute("content")
    ).toBe("#17130f");
  });
});
