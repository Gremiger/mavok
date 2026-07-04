# Two New Themes: Pergamino + Furia de Sangre — Design

## Context

The app has a clean 2-theme system: `AppSettings.theme` is a `"piedra-viva" | "dark-fantasy"` union, `useTheme()` manages it with a binary `toggleTheme()`, and `globals.css` defines 7 CSS custom properties per `[data-theme="..."]` block (`--bg`, `--card`, `--accent`, `--cord`, `--fg`, `--muted`, `--border-color`). `SettingsTab.tsx` exposes a single "tap to cycle" row.

This spec adds two more themes — **Pergamino** (a light, aged-parchment theme) and **Furia de Sangre** (a dark, ember-crimson theme leaning into the Barbarian Rage mechanic) — and fixes a real bug uncovered along the way: the decorative "stone crack" background texture is hardcoded to `rgba(184,115,51,X)`, which is literally Piedra Viva's accent color (`#b87333`) baked in as a literal. Dark Fantasy has always silently inherited Piedra Viva's copper-colored cracks instead of getting its own gold tone. Both new themes, plus this fix for the two existing ones, ship together since a 4-theme picker is the natural point to make the texture theme-aware.

Palettes were reviewed and approved via a rendered side-by-side comparison (all 4 themes, same card/heading/accent-pill/cord-line layout, only tokens differ).

## 1. Palette tokens

Add to `src/app/globals.css`, alongside the existing two blocks:

```css
[data-theme="pergamino"] {
  --bg: #d9c9a3;
  --card: #f0e6cc;
  --accent: #9c2b2b;
  --cord: #5c3a1f;
  --fg: #2e2417;
  --muted: #8a7554;
  --border-color: #c4b28e;
}

[data-theme="furia-de-sangre"] {
  --bg: #160b0b;
  --card: #241010;
  --accent: #c23b2b;
  --cord: #6e1414;
  --fg: #e8d8ce;
  --muted: #6b4444;
  --border-color: #3a1414;
}
```

Pergamino is the app's first light theme — background/card contrast is inverted from the other three (light bg, darker card reads as a "page" sitting on aged parchment) and `--fg` is a dark sepia ink rather than an off-white. Furia de Sangre stays dark-family like Piedra Viva/Dark Fantasy but pushes the accent to a hotter, more saturated red-orange (`#c23b2b` vs Piedra Viva's muted copper `#b87333`) and warms `--fg` slightly toward bone/blood tones.

Typography, layout, and existing decorative elements (`.stone-card`, `.cord-line`/`.cord-knot`, `.crack-divider`) are unchanged — themes are recolorizations of the same established visual language, not new design systems. The red cord specifically is character lore (Mavok's people, the Toduk-Rojum) and persists across every theme, just recolored via `--cord`.

## 2. Background texture fix + Pergamino vignette

In `src/app/globals.css`, the `body` background currently hardcodes the crack-pattern color as `rgba(184,115,51,X)` at various opacities across 3 `linear-gradient` layers (this is literally `#b87333` at those alphas — Piedra Viva's accent, hardcoded). Replace each `rgba(184,115,51,X)` with `color-mix(in srgb, var(--accent) Y%, transparent)`, where `Y` = the existing alpha × 100 (e.g. `rgba(184,115,51,0.06)` → `color-mix(in srgb, var(--accent) 6%, transparent)`). This preserves Piedra Viva's exact current look while making Dark Fantasy, Pergamino, and Furia de Sangre each get cracks tinted with their own accent color instead of inheriting copper. The neutral grain layer (`repeating-conic-gradient` with plain white/black low-alpha) is unrelated to accent color and stays as-is — it reads as paper/stone grain regardless of theme.

Add one Pergamino-specific override so its background reads as parchment rather than "cream-colored stone":

```css
[data-theme="pergamino"] body {
  background:
    radial-gradient(
      ellipse at center,
      transparent 60%,
      rgba(0, 0, 0, 0.08) 100%
    ),
    /* crack 1 */
    linear-gradient(157deg, transparent 22%, color-mix(in srgb, var(--accent) 6%, transparent) 22.1%, color-mix(in srgb, var(--accent) 4%, transparent) 22.3%, transparent 22.4%, transparent 58%, color-mix(in srgb, var(--accent) 5%, transparent) 58.1%, color-mix(in srgb, var(--accent) 3%, transparent) 58.2%, transparent 58.3%),
    /* crack 2 */
    linear-gradient(203deg, transparent 35%, color-mix(in srgb, var(--accent) 5%, transparent) 35.1%, color-mix(in srgb, var(--accent) 3%, transparent) 35.2%, transparent 35.3%, transparent 71%, color-mix(in srgb, var(--accent) 4%, transparent) 71.1%, color-mix(in srgb, var(--accent) 2%, transparent) 71.3%, transparent 71.4%),
    /* crack 3 */
    linear-gradient(93deg, transparent 40%, color-mix(in srgb, var(--accent) 4%, transparent) 40.1%, color-mix(in srgb, var(--accent) 2%, transparent) 40.2%, transparent 40.3%, transparent 78%, color-mix(in srgb, var(--accent) 3%, transparent) 78.1%, transparent 78.2%),
    /* grain */
    repeating-conic-gradient(rgba(255,255,255,0.01) 0%, transparent 0.5%, transparent 1%, rgba(0,0,0,0.015) 1.5%, transparent 2%),
    var(--bg);
  background-attachment: fixed;
}
```

This is the same layer stack as the shared default, with one added radial-gradient vignette layer at the front — Pergamino's signature touch, everything else reuses the existing mechanism.

## 3. Four-theme architecture

- `src/lib/types.ts`: widen `AppSettings.theme` to `"piedra-viva" | "dark-fantasy" | "pergamino" | "furia-de-sangre"`. No migration needed — `AppSettings` isn't versioned like `Character`; `loadSettings()` already merges stored settings over hardcoded defaults, so this is backward-compatible automatically.
- `src/hooks/useTheme.ts`: remove the binary `toggleTheme()` (a flip doesn't generalize to 4 options) and replace it with a direct setter, `setTheme(theme: AppSettings["theme"])`, following the same pattern already used this session for `setEncyclopediaLanguage` — set state, persist via `saveSettings`, and (unlike the language setter) also update `document.documentElement.setAttribute("data-theme", theme)` like the current `toggleTheme` does.
- New `THEME_META` list (small, colocated in `useTheme.ts` since it's the single consumer today): `{ id: AppSettings["theme"]; label: string; swatch: string }[]`, one entry per theme, `swatch` = that theme's accent hex, for `SettingsTab` to render the picker from without a hardcoded label ternary.
- `src/components/tabs/SettingsTab.tsx`: replace the single "tap to cycle" theme row with 4 directly-tappable rows generated from `THEME_META` — each shows a small color-swatch dot (background: `swatch`) + theme name, tapping calls `setTheme(id)` directly, and the currently-active one is visually marked (e.g. accent-colored border/checkmark), reusing the existing row style (`w-full flex items-center justify-between p-3 bg-card rounded-lg border border-border`) rather than introducing a new UI pattern.

## Out of scope

- No per-theme typography or layout changes — only color tokens and the one Pergamino vignette layer.
- No changes to `.stone-card`, `.cord-line`/`.cord-knot`, or `.crack-divider` mechanics — they already consume `var(--accent)`/`var(--cord)`/`var(--card)` and pick up new themes automatically.
- No broader UI audit — that's a separate, later spec per our discussion.

## Verification

`npx tsc --noEmit && npm run build && npm run lint` must pass. Manually verify in the dev server / browser: switch through all 4 themes via the new picker rows in Ajustes, confirm each applies immediately (background, cards, accent, cord all update) and persists across a reload; confirm Dark Fantasy's crack texture is now gold-tinted instead of copper; confirm Pergamino reads as light parchment with visible vignette darkening at the edges; confirm Furia de Sangre's accent reads as a hotter red than Piedra Viva's copper.
