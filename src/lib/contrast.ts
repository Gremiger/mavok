// WCAG 2.x contrast helpers, plus a tiny parser that pulls theme tokens out
// of globals.css so tests can check every theme's palette.

export function hexToRgb(hex: string): [number, number, number] {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`Not a 6-digit hex color: ${hex}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const THEME_SELECTOR = /^\[data-theme="([\w-]+)"\]$/;

export function parseThemeTokens(
  css: string
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  const blockRe = /([^{}]+)\{([^{}]*)\}/g;
  for (const block of css.matchAll(blockRe)) {
    const selectors = block[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const onlyThemeSelectors = selectors.every(
      (s) => s === ":root" || THEME_SELECTOR.test(s)
    );
    if (!onlyThemeSelectors) continue;
    const ids = selectors
      .map((s) => THEME_SELECTOR.exec(s)?.[1])
      .filter((id): id is string => Boolean(id));
    if (ids.length === 0) continue;
    const tokens: Record<string, string> = {};
    for (const decl of block[2].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
      tokens[decl[1]] = decl[2].trim();
    }
    for (const id of ids) out[id] = { ...out[id], ...tokens };
  }
  return out;
}
