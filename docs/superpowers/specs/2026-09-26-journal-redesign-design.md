# Journal Redesign ("Journal on stone") — Design

**Date:** 2026-09-26
**Status:** Approved in brainstorming, pending spec review

## Intent

The user finds the current UI **flat/samey** (every section header is the same all-caps serif with a cord knot; ten collapsed sections read as one block) and **generic**. Goal: a bolder visual identity that feels like Mavok's own campaign journal, without changing any behavior or data.

Chosen direction (from visual mockups): **H1 "Journal on stone"** — the *War journal* direction's type and structure (IM Fell lettering, Roman-numeral chapters, tally-mark Rage, table-of-contents rows) carved onto the *Carved monolith* direction's dark stone slabs — **with H2's shield-shaped AC badge**. Reference mockup: `assets/2026-09-26-journal-redesign-mockup.html` (panel H1, plus the `.shield` badge from H2).

Implementation approach: **foundation first** — tokens + shared components carry the look to every tab; bespoke work only on the Ficha and Combate screens.

## Non-goals

- No data-model change, no migration. Theme IDs (`piedra-viva`, `cumbre-helada`, `pergamino`, `furia-de-sangre`) and `AppSettings` unchanged.
- No behavior change: same handlers, state, props semantics (except additive optional props below).
- No bespoke redesign of Inventario, Notas, Enciclopedia, Ajustes — they inherit via shared components only.
- `/print` page, 3D dice (`DiceBoxCanvas`, dice themes) untouched.
- No new icon library (stay on `lucide-react`) and no other new runtime dependencies.

## 1. Foundation

### Typography

Loaded with `next/font/google` in `src/app/layout.tsx`, `subsets: ["latin"]`, `display: "swap"`, only the weights used:

| Role | Font | Token | Notes |
|---|---|---|---|
| Headings, labels, chapter numerals | IM Fell English (regular + italic) | `--font-heading` (repointed) | Replaces Cormorant Garamond. All existing `font-heading` usages switch automatically. |
| Body | Spectral (400, 500, 600) | `--font-body` (repointed) | Replaces DM Sans. |
| Numbers | Fraunces (600, 900; opsz axis) | new `--font-numeric` → Tailwind `font-numeric` | With `font-variant-numeric: lining-nums tabular-nums`. |

Rules:
- IM Fell has only old-style numerals, so **every `font-heading` element that renders a number** (HP, attribute values/modifiers, AC, attack bonuses, skill/save totals, StatBadge values) moves to `font-numeric`. Audit by grepping `font-heading` in `src/`.
- Text under 12px uses Spectral (italic where it's a label), never IM Fell. Raise any `text-[0.6rem]`/`text-[0.5rem]`-class sizes to at least 12px where they carry information.
- Section titles in sentence case; drop `uppercase tracking-*` on headings.
- Fix the Toaster's `fontFamily: "var(--font-inter)"` (undefined) → `var(--font-body)`.

### Color tokens

Keep existing token names (`--bg`, `--card`, `--accent`, `--cord`, `--fg`, `--muted`, `--border-color`); `--cord` doubles as the **seal red** (AC shield, Rage marks, chapter numerals). Add:

- `--surface-hi`, `--surface-lo` — top/bottom of the carved-slab gradient
- `--nav-bg` — nav island background (replaces the hardcoded `rgba(26,25,23,.92)`)
- `--grain-opacity` — per-theme strength of the noise texture

Starting palettes (final values must pass the contrast test in §4):

| Token | piedra-viva (H1) | furia-de-sangre | pergamino (vellum) | cumbre-helada |
|---|---|---|---|---|
| `--bg` | `#17130f` | `#0f0e0e` | `#d9c9a3` | `#dfe7ec` |
| `--surface-hi` | `#2a221a` | `#211d1c` | `#f1e6c8` | `#f7fafb` |
| `--surface-lo` | `#1d1812` | `#161413` | `#e6d7b2` | `#e9eff2` |
| `--card` | `#1f1913` | `#181615` | `#ebdfc1` | `#eef3f5` |
| `--fg` | `#e8dcc2` | `#ece6e0` | `#2e2215` | `#1c2a33` |
| `--muted` | `#a8977a` | `#a39088` | `#6b5639` | `#4f606b` |
| `--accent` | `#e9b877` | `#e06a52` | `#7a1f1f` | `#2f5f86` |
| `--cord` (seal) | `#c9463a` | `#b3261e` | `#9b2c22` | `#7a1f2b` |
| `--border-color` | `#4a3d2e` | `#3a2a28` | `#b8a27a` | `#b3c3cc` |

`--danger` / `--success` stay as today.

### Texture and chrome

- Replace the three copy-pasted crack-gradient `body` backgrounds in `globals.css` with **one** rule: an inline SVG `feTurbulence` grain at `--grain-opacity` plus a soft radial glow at the top in `--surface-hi`. Light themes add a faint vignette.
- `theme-color` meta follows the active theme: `useTheme` updates the `<meta name="theme-color">` content to the theme's `--bg` on load and on change.
- Global `:focus-visible` ring: 2px `--accent` outline, 2px offset. Buttons keep/gain `active:scale-[0.98]` press feedback with a 150–200ms transition.

## 2. Shared components

### `CollapsibleSection` → chapter

- **Numbering:** CSS counter. Each tab root (`SheetTab`, `CombatTab`, `InventoryTab`, `NotesTab`, `EncyclopediaTab`, `SettingsTab`) gets a `chapters` class that does `counter-reset: chapter`. The section header increments and renders `counter(chapter, upper-roman)` in `--cord`. Outside a `.chapters` container (e.g. inside `AttackFormModal`) no numeral is shown. No numbering prop.
- **Title:** IM Fell, ~21px, sentence case, `--fg`.
- **Collapsed:** renders as a table-of-contents row — numeral · title · dotted leader · optional italic count.
- **Open:** numeral · title · (aside), followed by a thin ruled line, then children.
- **New optional props:** `count?: number | string` (shown only when collapsed) and `aside?: ReactNode` (right-aligned in the header, always shown). The header becomes a `div` containing the toggle `button` and the `aside` as siblings (the aside may contain buttons; nested buttons are invalid).
- Existing `defaultOpen` / `forceOpenKey` behavior unchanged. Toggle button gets `aria-expanded`.
- Replace the absolutely-positioned PB chip and "Grupo" chip in `SheetTab` with `aside`. Provide `count` where it is already cheap to compute (saves 6, skills, features, feats, attacks, bonus actions, reactions).

### Retired classes

`cord-line`, `cord-knot`, `crack-divider` are removed from `globals.css` and all usages (8 `crack-divider` hits in 6 files → ruled line or spacing).

### Surfaces and small components

- `.stone-card` → carved slab: `linear-gradient(180deg, var(--surface-hi), var(--surface-lo))`, inset top highlight, inset bottom dark lip, shadow tinted from `--bg`. Radius 12px (containers 14px, inner chips 6px). `.stone-card-raging` keeps its animated sheen, rebased on the slab.
- `StatBadge`: value in `font-numeric`, label in Spectral italic, sentence case.
- `Tag` and mastery labels (e.g. in `AttackRow`): small squared "ink stamp" (2–4px radius, 1px border, IM Fell italic or Spectral italic when <12px).
- `GhostChip`: Spectral italic, 6px radius instead of full pill.
- `EmptyState`: rotated-square (diamond) marker instead of the circle, italic message.
- `Modal`: slab surface, IM Fell title, lucide `X` icon button with `aria-label="Cerrar"`.
- Buttons: primary = solid `--accent` with `--bg`-colored text; damage/destructive = `--cord` 1px outline with `--cord`-tinted text; tertiary = text only.
- Icons: lucide only, `strokeWidth={1.5}` everywhere.

### Nav island (`src/app/page.tsx`)

Background `var(--nav-bg)` with backdrop blur; labels in IM Fell ~12.5px; inactive at reduced opacity; active tab full `--accent` plus a small `--cord` seal dot replacing the underline bar (keep the `layoutId` spring). All six tabs remain.

### Loading screen

Replace pulsing "Mavok" with a centered italic "Diario de campaña de" kicker and "Mavok" in IM Fell, fading in (opacity/transform only).

## 3. Key screens

### Ficha (`SheetTab`)

- **Header:** italic kicker "Diario de campaña de"; name in IM Fell ~34px with the second name word in `--cord` (derive by splitting `meta.name` on spaces; if the name has one word, no highlight); a meta line with a top rule: class · subclass · level, then species · ancestry · background · origin. Portrait: rounded square (12px radius), 1px accent frame; empty state = lucide `User` on slab.
- **Attributes:** chapter `aside` = italic "competencia +N". Cards are slabs: full ability name in italic (Spectral when narrow), **modifier big** in `font-numeric` 900 ~29px, score small in `--accent` below. Tap still rolls. Exhaustion penalty display unchanged.
- **Saves/skills rows:** proficiency marker = small rotated square, filled `--accent` when proficient, outline `--muted` otherwise; total in `font-numeric`. Primal Knowledge "FUE" button → ink stamp.

### Combate (`CombatVitals`, `RageCluster`, `AttackRow`, `CombatTab`)

- **Vitals slab:** italic "Puntos de golpe" label; HP as `47 / 55` in `font-numeric` 900 ~56px (max in smaller weight/color), `hp-heartbeat` kept while raging. Under it a 7px HP bar: fill width = `currentHp / maxHp` (clamped 0–1), gradient in `--cord`, track darker than the slab. AC = **shield** (clip-path hexagon-shield as in the H2 mockup), `--cord` gradient, number in `font-numeric`; temp-AC-mod badge and magic ✦ remain attached. Temp / Init / Insp / Vel as a row of small inscriptions (StatBadge compact). Rage-active info block and `DeathSaves` branch unchanged in behavior; restyled to match.
- **Rage (`RageCluster`):** each slot = slanted tally mark (`--cord`, glow when available; dashed `--muted` outline when used). Each slot remains its own button with ≥32px hit area and existing `aria-label`. `shouldUseRageBadge` logic and the `n/total` badge kept (badge restyled as ink stamp). The 🔥 emoji → lucide `Flame` inside a small `--cord` seal; ember wisp/burst and ignite animations kept.
- **Attack rows:** name in IM Fell ~19px, bonus/damage figures in `font-numeric`, mastery as ink stamp, damage-type icons lucide 1.5 stroke. Hit = primary button, Dmg = cord-outline button; both ≥36px tall.
- **Conditions:** the unlabeled `+` → GhostChip "+ Condición"; when there are no conditions, show italic "sin condiciones". Exhaustion row: six small marks (filled up to level) next to the existing −/+ buttons (which get `aria-label`s).

## 4. Verification and rollout

Four commits, each shippable:

1. **Foundation** — fonts, tokens for all four themes, grain, nav/toast/theme-color fixes, focus ring, contrast.
2. **Shared components** — chapter sections (counter, `count`, `aside`), slab, Modal, StatBadge, Tag, GhostChip, EmptyState, buttons, nav, loading screen, removal of retired classes.
3. **Ficha** — header, attributes, saves/skills, numeric font audit for the tab.
4. **Combate** — vitals + shield AC + HP bar, Rage tallies, attack rows, conditions/exhaustion, numeric font audit.

After every phase:

- `npx tsc --noEmit && npm run build && npm run lint && npm test` — all pass, lint 0 errors (hooks-order rules matter here).
- Screenshots at 390px of Ficha and Combate in all four themes, compared against the mockup; include rage-active, dying (death saves), and no-conditions states.
- Quick pass through Inventario, Notas, Enciclopedia, Ajustes: fix anything broken; note (don't redesign) anything merely plain.

New test: `src/lib/themeContrast.test.ts` reads `src/app/globals.css`, extracts each `[data-theme="…"]` block's hex values for `--bg`, `--card`, `--fg`, `--muted`, and asserts WCAG contrast ≥ 4.5:1 for `--fg` and `--muted` against both `--bg` and `--card` in all four themes. `globals.css` stays the single source of truth; the test fails if a theme block or token is missing. Token values in the theme blocks must therefore be plain 6-digit hex.

`public/sw.js` changes on each build — expected, commit it alongside.

## Risks

- **Legibility:** Spectral and IM Fell run larger/more ornate than DM Sans; pages get slightly longer. Mitigated by the 12px floor and Spectral-for-small-labels rule.
- **Font weight:** ~60–90KB added; mitigated by latin subset and limited weights.
- **Light themes:** H1 was mocked only dark; pergamino/cumbre-helada slab gradients and shadows need visual tuning in phase 1 screenshots.
- **Section header restructure:** `CollapsibleSection` is used 24 times; the header changes from one `button` to a `div` + `button` + aside. Verify `forceOpenKey` scroll-into-view flows in `CombatTab` still work.
