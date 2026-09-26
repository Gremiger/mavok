import { readFileSync } from "fs";
import path from "path";
import { expect, test } from "vitest";
import { THEME_META } from "@/hooks/useTheme";

// The installed PWA's splash screen and first paint come from manifest.json,
// before any theme is applied, so they must match the default theme's --bg.
test("manifest colors match the default theme background", () => {
  const manifest = JSON.parse(
    readFileSync(path.resolve(process.cwd(), "public/manifest.json"), "utf8")
  );
  const defaultBg = THEME_META.find((t) => t.id === "piedra-viva")!.bg;
  expect(manifest.background_color.toLowerCase()).toBe(defaultBg);
  expect(manifest.theme_color.toLowerCase()).toBe(defaultBg);
});
