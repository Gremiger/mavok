# Cumbre Helada Theme — Design Spec

## Summary

Replace the placeholder `dark-fantasy` theme (currently just 7 bare CSS
variables with no bespoke treatment — visibly unfinished compared to the
other 3 themes) with `cumbre-helada` ("Frozen Summit"), a bright
glacier/high-peaks theme. This is the last item from the original
tab-by-tab UI redesign scope (Phases 1–7 covered all 6 tabs; this is a
cross-cutting visual addition, not tab-scoped).

## Motivation

- `dark-fantasy` has no bespoke `body` background override (unlike
  `pergamino`), so it silently falls back to the generic dark-crack-texture
  treatment tuned for dark bases — this is why it reads as unfinished.
- All 3 active themes are dark or warm-parchment; there's no bright/cool
  option.
- Mavok is a Goliath Barbarian with Stone Giant ancestry — a
  mountain/glacier motif fits the character directly, more than an
  unthemed placeholder does.

## Theme identity

- **id**: `cumbre-helada`
- **label**: "Cumbre Helada"
- **swatch** (theme-picker dot): `#2f6690`

Replaces `dark-fantasy` / "Dark Fantasy" in every place that name
currently appears:
- `THEME_META` array in `src/hooks/useTheme.ts`
- `AppSettings["theme"]` union in `src/lib/types.ts`
- The `[data-theme="dark-fantasy"]` CSS block in `src/app/globals.css`

## Palette

| Token | Value | Role |
|---|---|---|
| `--bg` | `#e9f1f5` | pale ice-white page background |
| `--card` | `#f8fbfc` | near-white card surface, cool tint |
| `--accent` | `#2f6690` | steel/glacier blue — buttons, highlights, cracks |
| `--cord` | `#7a1f2b` | deep garnet — Rage cord, ember/heartbeat flair |
| `--fg` | `#1f2e38` | dark slate-navy text |
| `--muted` | `#6c7f8a` | cool grey-blue secondary text |
| `--border-color` | `#b7c8d1` | pale steel-blue borders |

The cord stays a warm garnet red (not a blue) so the existing Rage flair
(`.stone-card-raging`, `.hp-heartbeat`, `.ember-wisp`, `.ignite-flash`,
`.ember-burst` — all driven by `var(--cord)`) still reads as "hot blood
against ice" rather than blending into an all-blue palette.

## Bespoke body texture

`dark-fantasy` never got a `[data-theme="dark-fantasy"] body` override —
it inherits the generic (dark-tuned) crack-texture `body {}` rule. On a
pale background that generic treatment would look muddy, the same
underlying reason `dark-fantasy` currently looks unfinished.

Add a `[data-theme="cumbre-helada"] body` override that reuses the exact
structural pattern already proven by `pergamino`'s override (the other
light theme): a radial vignette (`rgba(0,0,0,0.08)` at the edges) layered
under the same three `var(--accent)`-tinted crack-line gradients and the
fine noise layer, all already token-driven. This is a copy of the
`pergamino` body block, rescoped to `[data-theme="cumbre-helada"]` — no
new visual/CSS technique is introduced.

No other CSS classes change. `.stone-card`, `.cord-line`, `.cord-knot`,
`.crack-divider`, and all Rage-flair classes are already fully
token-driven (`var(--card)`, `var(--accent)`, `var(--cord)`) and
theme-agnostic — confirmed working correctly across `pergamino` (a light
theme) since Phase 4. They require no changes for `cumbre-helada` to look
correct.

## Data safety (existing stored settings)

`AppSettings` (`src/lib/storage.ts` `loadSettings`/`saveSettings`) has no
versioned migration chain — unlike `Character`, it's a flat
`{ ...defaults, ...JSON.parse(raw) }` merge. If a user's stored settings
currently have `theme: "dark-fantasy"`, removing that CSS block would
silently fall back to the Piedra Viva look on next load (harmless — the
`:root` block always supplies base values when no `data-theme` block
matches — but silent and easy to miss as a real behavior change).

Add one normalization step in `loadSettings()`: after merging with
defaults, if the resulting `theme` value is the literal string
`"dark-fantasy"`, rewrite it to `"cumbre-helada"` before returning. This
carries forward an existing selection intentionally instead of by
accident. No character-data migration is needed — this lives entirely in
`AppSettings`.

## Out of scope

- No changes to any tab component, `Modal`, `CompactRow`, `Tag`, or other
  shared UI components — this is a CSS/theme-metadata-only change plus the
  one-line settings normalization.
- No changes to the other 3 themes' palettes or CSS blocks.
- No new theme-specific component classes beyond the one `body` override
  described above.

## Verification

- `npx tsc --noEmit && npm run build && npm run lint && npm test` — the
  `AppSettings["theme"]` union change and `THEME_META` id rename must not
  break any type-checked call site.
- Manual: select the new theme in Ajustes → Tema, confirm the page
  background renders the frost-vignette + crack texture (not the flat
  generic dark treatment), confirm cards/borders/text are legible, and
  confirm Rage flair (enter Rage in Combate) still shows garnet
  ember/heartbeat colors clearly against the pale background.
- Manual: in browser devtools, set `localStorage.mavok_settings` to
  `{"theme":"dark-fantasy", ...}`, reload, and confirm the app normalizes
  to `cumbre-helada` (both visually and by re-reading the stored value)
  rather than rendering an unstyled/fallback theme.
