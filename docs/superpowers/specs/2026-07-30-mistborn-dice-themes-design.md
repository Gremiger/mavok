# Mistborn Dice Themes — Design

## Problem

The dice-theme roster (4 normal + 2 Mavok-themed special) has no
personal/fandom-driven options tied to the user's other interests.
This adds 2 new themes inspired by Brandon Sanderson's *Mistborn*
series, in their own picker category separate from the Mavok-themed
"Especiales".

## Roster Addition

**Category: "Mistborn"** (new, alongside existing "Normales"/"Especiales"):

- **Steel** (`systemName: "steel"`) — cool brushed-steel grey,
  `themeColor: "#8A99A6"`. Evokes Allomancy/Steelpushing, the core
  magic system of the series.
- **Mist** (`systemName: "mist"`) — pale, hazy ash-grey,
  `themeColor: "#C9C9C4"`. Evokes the Final Empire's constant ashfall
  and nightly mists.

Both colors were rendered live through the app's real `dice-box`
pipeline (via a temporary `themeColor` override on the existing Rock
theme, confirmed against real screenshots, then reverted) and
approved by the user against the actual render, not a mockup.

## Technical Approach

Same pattern as Rock/Rust: `material.type: "color"` themes that tint
an existing base texture via a `themeColor` override — no new texture
photography/authoring needed. Both new theme folders reuse Rock's
existing mesh and diffuse/normal/specular map files as-is; only each
theme's own `theme.config.json` differs (`name`, `systemName`,
`themeColor`).

## Data Model Change

`DiceThemePreset.category` (`src/data/dice-themes.ts`) gains a third
value: `"normal" | "especial" | "mistborn"`. Two new entries:

```typescript
{
  systemName: "steel",
  label: "Acero (Mistborn)",
  category: "mistborn",
  themeColor: "#8A99A6",
  swatch: "#8A99A6",
},
{
  systemName: "mist",
  label: "Bruma (Mistborn)",
  category: "mistborn",
  themeColor: "#C9C9C4",
  swatch: "#C9C9C4",
},
```

`DiceThemeId` gains `"steel" | "mist"`.

## Asset Folders

`public/assets/themes/steel/` and `public/assets/themes/mist/`: each
a copy of `public/assets/themes/rock/`'s existing asset files
(`diffuse-dark.png`, `diffuse-light.png`, `normal.png`,
`smoothDice.json`, `specularity.jpg`), with a new `theme.config.json`
(same shape as Rock's, own `name`/`systemName`/`themeColor`).

## UI Change

`DiceThemePickerModal.tsx` currently renders two grouped sections
("Normales", "Especiales") by filtering `DICE_THEMES` on `category`.
It gains a third section ("Mistborn") using the same
filter-and-render pattern — no structural change, just one more
`category === "..."` filter and a matching `<div>` block.

## Testing

Same scope as the original dice-theme-picker feature: no dedicated
unit tests for the static data file or the third-party-wrapping
`diceBox.ts` (unchanged by this addition). Manual verification: open
the picker, confirm the "Mistborn" section lists Steel and Mist with
correct swatches, select each, roll a die, and confirm the right tint
renders (already visually confirmed during design via the live-render
preview).

## Out of Scope

- Any new mesh/shape for these two themes — they use the same
  `smoothDice` shape as Rock/Rust, keeping this a pure color-swap
  addition like those two.
- The photo-based custom theme work (a separate, already-scoped,
  still-pending feature) is unaffected by this addition.
