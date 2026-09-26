import { readFileSync } from "fs";
import path from "path";
import { describe, expect, test } from "vitest";
import { contrastRatio, parseThemeTokens } from "./contrast";
import { THEME_META } from "@/hooks/useTheme";

const css = readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf8");
const themes = parseThemeTokens(css);
const SURFACES = ["bg", "card", "surface-hi", "surface-lo"] as const;
const TEXT_TOKENS = ["fg", "muted", "accent", "danger", "success"] as const;

describe.each(THEME_META.map((t) => [t.id, t] as const))("theme %s", (id, meta) => {
  const tokens = themes[id];

  test("defines every required token", () => {
    expect(tokens, `no [data-theme="${id}"] block in globals.css`).toBeDefined();
    for (const name of [...SURFACES, ...TEXT_TOKENS, "cord", "border-color", "nav-bg", "grain-opacity", "lip", "slab-shadow"]) {
      expect(tokens[name], `--${name} missing in ${id}`).toBeDefined();
    }
  });

  test.each(TEXT_TOKENS.flatMap((fg) => SURFACES.map((bg) => [fg, bg] as const)))(
    "--%s on --%s is at least 4.5:1",
    (fg, bg) => {
      expect(contrastRatio(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5);
    }
  );

  test.each(SURFACES.map((bg) => [bg] as const))("--cord on --%s is at least 3:1", (bg) => {
    expect(contrastRatio(tokens.cord, tokens[bg])).toBeGreaterThanOrEqual(3);
  });

  test("THEME_META.bg matches CSS --bg (drives the theme-color meta)", () => {
    expect(meta.bg.toLowerCase()).toBe(tokens.bg.toLowerCase());
  });
});
