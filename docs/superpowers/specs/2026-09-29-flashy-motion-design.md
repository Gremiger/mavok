# Flashy Motion — Design

**Date:** 2026-09-29
**Status:** Approved in brainstorming ("keep them all, go ahead and build it")

## Intent

Add an app-wide animation setting, **Animaciones: Normales / Llamativas**. "Normal" keeps today's behaviour plus a calm tab transition; "Llamativas" (flashy) adds a whimsical, showy layer to the moments that matter at the table. The user explored live demos and approved every effect as shown.

Reference demos (the CSS/timings there are the source of truth for each effect):
- `assets/2026-09-29-tab-transitions.html` — "Normal" and "Flashy · Ink & scatter" tab transitions.
- `assets/2026-09-29-flashy-effects-lab.html` — every other flashy effect.

## Non-goals

- No change to game logic, data model or `Character` shape; no migration.
- No new runtime dependencies (framer-motion and CSS already cover everything).
- Rage effects fire from the Combate flame button only; toggling Rage from the Quick Actions FAB or ending it via a long rest does not play the ignite/end effects (the breathing glow still follows Rage state everywhere).

## 1. Setting

- `AppSettings.motionStyle: "normal" | "flashy"`, default `"normal"`. `loadSettings()` already merges defaults, so old saved settings load unchanged.
- `useTheme` exposes `motionStyle` / `setMotionStyle` (same pattern as `diceRollMode`), shared through `ThemeContext`.
- Ajustes → Tema gets a row: "Animaciones: Normales" / "Animaciones: Llamativas", tap to toggle.
- **Reduced motion:** if the OS reports `prefers-reduced-motion: reduce`, flashy effects never play and tab switches are instant, regardless of the setting.
- Effective flag: `flashy = motionStyle === "flashy" && !prefersReducedMotion`.

## 2. Tab transitions

- New `TabTransition` component wraps the active tab in `page.tsx`. On tab change it keeps the previous tab mounted as an absolutely-positioned overlay while it animates out, then unmounts it. The new tab starts at scroll top; the leaving tab is visually frozen at its old scroll offset.
- **Normal:** old tab fades out with a 14px slide (140ms), new tab fades in with an 18px slide from the travel direction (220ms, 60ms delay). Total ≈ 300ms.
- **Flashy — "Ink & scatter"** (≈ 820ms): old tab dims and its cards tumble away; a seal-red ink splat with droplets bursts from the origin; the new tab is revealed by an expanding ink circle (`clip-path`) from the origin; its cards drop in with a bounce, chapter numerals stamp down, and a few embers rise.
- **Direction** follows `TAB_ORDER`: moving right → +1, left → −1.
- **Origin:** tapped nav button centre; for swipes, the screen edge on the side the user swiped from (bottom area).
- A new tab change during a running transition cancels it: the old overlay is dropped immediately and the new transition starts from the current tab.
- **Reduced motion:** instant swap.
- The Roman-numeral `chapters` counter class moves from `<main>` onto each tab's own wrapper inside `TabTransition`, so two overlapping tabs never share a counter.

## 3. Effects system

- `EffectsProvider` (inside the character/theme providers in `page.tsx`) owns a list of active effects and exposes `useEffects(): { play(name, opts?), flashy }`.
- `play()` is a no-op unless `flashy`. Each effect has a fixed duration and is removed when it ends. Each play has an `id`; replaying an id that is still active is ignored (dedupe — e.g. a re-mounted roll result).
- `EffectsLayer` renders full-screen, `pointer-events: none`, as a **top-layer popover** (`popover="manual"`, re-shown on each new effect) so it paints above open `<dialog>` modals.
- Screen shake is applied by the provider to the app root element.
- Effects are small components under `src/components/effects/`.

| Effect | Trigger | Where | Duration |
|---|---|---|---|
| `rage-ignite` | flame button turns Rage on | RageCluster click handler | 1300ms |
| `rage-end` | flame button turns Rage off | RageCluster click handler | 1500ms |
| `crit` | a nat-20 roll result appears | DiceResult (per roll timestamp) | 1400ms |
| `level-up` | "Confirmar nivel N" applied | LevelUpFlow `applyAll` | 1800ms |
| `long-rest` | long rest confirmed | SettingsTab long-rest handler | 2700ms |
| `short-rest` | "Terminar descanso" | SettingsTab short-rest handler | 1700ms |
| `inspiration` | Inspiration toggled on | CombatVitals | 800ms |

Visuals per effect exactly as in the lab: ignite = shockwave ring from the flame, red edge pulse, shake, "¡FURIA!" red stamp, ember burst; end = grey ash falling from the vitals card; crit = gold burst at the result + "¡CRÍTICO!" gold stamp + sparks; level-up = dimming, rotating rays, wax-seal "Nivel N", ember burst; long rest = night overlay, rising moon, stars, dawn sweep; short rest = campfire glow + rising sparks; inspiration = sparkle burst at the Insp badge.

**Persistent:** while Rage is active and `flashy`, the layer shows a breathing red edge vignette (state-driven from `resources.rpiRages.active`, so it appears however Rage was turned on).

## 4. Local flourishes (flashy only, via `useEffects().flashy`)

- **Tally slash:** when a Rage slot is marked used via its tally button, an ink stroke draws across that mark.
- **HP damage:** when current HP drops while the Combate vitals are on screen — HP number flinches red, three claw slashes draw across the card, a short shake of the card, and a pale ghost bar lags behind the HP bar before catching up.
- **HP heal:** when HP rises — the number pulses green and green sparks rise from it.
- **Fumble:** a nat-1 roll result shakes, a crack draws across it, and an ink drop falls.
- **Condition stamp:** a condition added in Combate stamps onto the page.
- **Death-save marks:** a newly filled success/failure mark stamps in.

HP flourishes derive from HP changes inside `CombatVitals` (prev-value pattern in render, per CLAUDE.md), so any HP change while that card is visible animates; changes made on other tabs do not.

## 5. Testing

- Pure helpers (`src/lib/motion.ts`): durations table covers every effect; `shouldAnimate(motionStyle, reduced)`; active-effect list add/dedupe/prune; tab direction; transition origin.
- `EffectsProvider` component test (fake timers): normal → nothing rendered; flashy → effect rendered then removed after its duration; duplicate id ignored; reduced motion → nothing.
- `TabTransition` component test (fake timers): both tabs present during a transition, old one removed after; a second change mid-transition leaves only old-current → new; reduced motion swaps instantly; each tab wrapper carries `chapters`.
- Settings: `loadSettings()` default `motionStyle` is `"normal"`; existing stored settings without the field load as `"normal"`.
- Browser pass: every effect in both modes, all four themes spot-checked, swipe navigation, a modal open during an effect, reduced-motion emulation.
- Full chain: `npx tsc --noEmit && npm run build && npm run lint && npm test`.

## Risks

- **Performance on older phones:** particles are capped (≤ 30 per effect), animations use transform/opacity/clip-path only, overlays are removed after they end.
- **Popover support:** top-layer popover needs iOS 17+/Chrome 114+; where `showPopover` is missing the layer falls back to a fixed high-z-index overlay (effects under open modals then play behind them).
- **Two tabs mounted briefly:** tab-local state of the leaving tab is discarded at the end, as today; effects in the leaving tab are not re-run.
