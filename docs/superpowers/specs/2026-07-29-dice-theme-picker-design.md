# Dice Theme Picker — Design

## Problem

The 3D dice feature (previous sub-projects) only ever uses `dice-box`'s
`"default"` theme (green). This design adds a curated theme catalog —
4 "normal" themes plus 2 Mavok-themed "special" ones — and a picker in
Ajustes to switch between them, while keeping the door open for a
future (explicitly out-of-scope-for-now) custom photo-based theme.

## Theme Roster (confirmed via real renders)

Every candidate was actually downloaded from `@3d-dice/dice-themes`,
rendered through this app's live `dice-box` pipeline (not a mockup —
the literal canvas pixel buffer, read via `canvas.toDataURL()` since
this environment's screenshot tool doesn't composite WebGL), and
approved against the real image:

**Normal** (`category: "normal"`):
- **Default** (`systemName: "default"`) — the current green, already
  installed, zero extra cost
- **Wooden** (`systemName: "wooden"`) — real wood-grain texture
- **Blue-Green Metal** (`systemName: "blueGreenMetal"`) — weathered
  metal texture
- **Gemstone Marble** (`systemName: "gemstoneMarble"`) — rounded-edge
  marble

**Special** (`category: "especial"`), both using dice-box's `"color"`
material type with a custom `themeColor` override (confirmed by
rendering both the theme's own baked-in default color and these
custom ones — these were the approved renders):
- **Rock** (`systemName: "rock"`, `themeColor: "#8a8a8a"`) — stone
  grey, thematically tied to Mavok's Goliath/Stone Giant ancestry
- **Rust** (`systemName: "rust"`, `themeColor: "#8b0000"`) — deep
  blood-red, thematically tied to Rage

All 5 non-default theme folders (`wooden`, `blueGreenMetal`,
`gemstoneMarble`, `rock`, `rust`) are already downloaded into
`public/assets/themes/` in the working tree, verified against real
renders — the implementation just needs to `git add` them.

## Architecture

**Key simplification over how `diceRollMode` was threaded through the
codebase** (sub-project 3 touched 6+ files to pass `mode` through every
call site): the selected theme is **not** passed as a parameter through
`rollWithMode.ts`/`SheetTab.tsx`/`CombatTab.tsx`/`AttackRow.tsx`/
`QuickActionsFab.tsx`/`DiceRoller.tsx` at all. Unlike `diceRollMode`,
the theme has no bearing on any of those components' own rendering or
logic — it only matters at the exact moment `dice-box` rolls. So
`diceBox.ts`'s `roll3D()` reads the current theme directly from
`loadSettings()` (the same storage module already imported everywhere
`AppSettings` is read) at roll time, instead of requiring it as an
argument. This keeps the change contained to `diceBox.ts`, a new data
file, and the Ajustes UI — nothing else in the call chain changes.

This works because `dice-box`'s `roll(notation, { theme, themeColor })`
accepts theme overrides per individual roll call (confirmed in
`dist/dice-box.es.js`'s `roll()` signature) — no need to recreate the
whole `DiceBox` singleton instance when the user switches themes.
`dice-box` lazy-loads a theme's assets internally the first time it's
used in a roll (via its own `loadThemeQueue`), so switching themes
doesn't require any `preloadThemes` config either.

## New Data File: `src/data/dice-themes.ts`

Hand-curated (not extracted from 5etools — this is our own dice-box
theme roster, unrelated to D&D rules data):

```typescript
export type DiceThemeId =
  | "default"
  | "wooden"
  | "blueGreenMetal"
  | "gemstoneMarble"
  | "rock"
  | "rust";

export interface DiceThemePreset {
  systemName: DiceThemeId;
  label: string;
  category: "normal" | "especial";
  themeColor?: string;
  swatch: string;
}

export const DICE_THEMES: DiceThemePreset[] = [
  { systemName: "default", label: "Verde clásico", category: "normal", swatch: "#2f8f4e" },
  { systemName: "wooden", label: "Madera", category: "normal", swatch: "#8a5a35" },
  { systemName: "blueGreenMetal", label: "Metal verde-azulado", category: "normal", swatch: "#3a6b6b" },
  { systemName: "gemstoneMarble", label: "Mármol", category: "normal", swatch: "#4a5b7a" },
  { systemName: "rock", label: "Piedra (Goliath)", category: "especial", themeColor: "#8a8a8a", swatch: "#8a8a8a" },
  { systemName: "rust", label: "Sangre de Rage", category: "especial", themeColor: "#8b0000", swatch: "#8b0000" },
];
```

`swatch` is a plain UI-display color for the picker row (mirroring
`useTheme.ts`'s existing `THEME_META.swatch` pattern for the app's own
color themes) — it does not need to be pixel-identical to the actual
rendered die, just a reasonable at-a-glance indicator.

## `diceBox.ts` Changes

```typescript
import { loadSettings } from "./storage";

export async function roll3D(count: number, faces: number): Promise<number[]> {
  const box = await getDiceBox();
  const { diceTheme } = loadSettings();
  const preset = DICE_THEMES.find((t) => t.systemName === diceTheme) ?? DICE_THEMES[0];
  box.show();
  const results = await box.roll(`${count}d${faces}`, {
    theme: preset.systemName,
    themeColor: preset.themeColor,
  });
  return results.map((r) => r.value);
}
```

(Exact diff to be worked out in the implementation plan — this is the
shape of the change, not final line-level code.)

## Settings

`AppSettings` (`src/lib/types.ts`) gains:

```typescript
diceTheme: DiceThemeId;
```

Default `"default"` in `storage.ts`'s `loadSettings()` — no migration
needed, same reasoning as `diceRollMode`: `AppSettings` isn't part of
the versioned `Character` chain, and `loadSettings` already merges
stored JSON over defaults.

`useTheme.ts` gains `diceTheme`/`setDiceTheme` state and setter,
mirroring the existing `diceRollMode`/`setDiceRollMode` pair exactly.

## UI: `DiceThemePickerModal.tsx`

New component in `src/components/settings/`, following the exact
pattern of `WeaponMasteryModal.tsx` (a `Modal` wrapper, `open`/`onClose`
props, row-per-option list). Two grouped sections, "Normales" and
"Especiales" (filtering `DICE_THEMES` by `category`), each theme as a
row showing its `swatch` as a small color circle (same visual as
`THEME_META` rows in the existing app-theme picker) plus its `label`,
with the currently-selected one marked (✓, same as the existing
app-theme rows).

`SettingsTab.tsx`'s existing "Modo de tirada" `CompactRow` block gains
a sibling row "Tema de dados: `<current label>` — Tap para cambiar"
that opens this new modal (state `diceThemePickerOpen`, mirroring
`weaponMasteryOpen`'s exact wiring at `SettingsTab.tsx:64` and
`:739-740`).

## Testing

- `src/data/dice-themes.ts`: no dedicated test — it's a static, hand-
  curated array, consistent with how other `src/data/*.ts` files (even
  the 5etools-extracted ones) have no test coverage of their own.
- `diceBox.ts`'s theme lookup: no dedicated test — same reasoning as
  the rest of this file (thin wrapper around a third-party
  browser-only library).
- `DiceThemePickerModal.tsx`, `SettingsTab.tsx` changes: UI components,
  untested, consistent with existing project scope.
- Manual verification: open the picker, confirm both category sections
  list the right themes with the right labels/swatches, select a few
  different ones, roll a die in Combate for each, and confirm (via the
  same `canvas.toDataURL()` pixel-read technique used during this
  design's exploration, since the environment's screenshot tool can't
  composite WebGL) that the correct theme/color actually renders.

## Out of Scope

- Custom photo-based themes (the user's stated future goal) — this
  needs real 3D texture authoring (photographing each face, UV-mapping
  onto the die mesh, producing diffuse/normal/specular maps compatible
  with BabylonJS's `StandardMaterial`/`CustomMaterial`, per dice-box's
  own docs constraint that PBR materials aren't supported). The
  `DiceThemeId` union type and `DICE_THEMES` array are structured so
  adding a 7th entry later (e.g. `"mavok-custom"`) is a small, isolated
  change — but authoring that theme's actual assets is a separate,
  much larger effort for a future session.
- Live 3D preview thumbnails inside the picker modal — using a flat
  color swatch instead, matching the existing app-theme picker's own
  established pattern, avoids a new image-asset pipeline for v1.
- Per-roll or per-character theme overrides — one global theme setting
  for the whole app, same scope as `diceRollMode`.
