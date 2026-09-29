# Flashy Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An app-wide "Animaciones: Normales / Llamativas" setting with calm/flashy tab transitions and a set of flashy effects (Rage, crits/fumbles, HP, level up, rests, small touches).

**Architecture:** Pure helpers in `src/lib/motion.ts`; a `motionStyle` setting in `useTheme`; an `EffectsProvider` + top-layer `EffectsLayer` that plays named full-screen effects on `play(name)`; a `TabTransition` wrapper in `page.tsx`; local CSS flourishes gated by `useEffects().flashy`. All effect CSS lives in `src/app/effects.css`, ported from the approved demos.

**Tech Stack:** Next.js 16 static export, React 19, Tailwind v4, plain CSS keyframes, Vitest 4 (jsdom, `react-dom/client` + `act` for component tests).

**Spec:** `docs/superpowers/specs/2026-09-29-flashy-motion-design.md` (demos: `docs/superpowers/specs/assets/2026-09-29-tab-transitions.html`, `docs/superpowers/specs/assets/2026-09-29-flashy-effects-lab.html`).

## Global Constraints

- No `Character` changes, no migration; `AppSettings.motionStyle` defaults to `"normal"` via `loadSettings()` defaults.
- No new dependencies.
- `flashy = motionStyle === "flashy" && !prefersReducedMotion`; reduced motion also makes tab switches instant.
- Hooks before any early `return`; never `setState` inside a `useEffect` body; derive-from-prop changes use the prev-state-in-render pattern (CLAUDE.md).
- Animations use transform / opacity / clip-path / box-shadow only; ≤ 30 particles per effect; every overlay element is removed when its effect ends.
- Effect names and durations (ms): `rage-ignite` 1300, `rage-end` 1500, `crit` 1400, `level-up` 1800, `long-rest` 2700, `short-rest` 1700, `inspiration` 800. Tab transitions: normal 300, flashy 820.
- Spanish UI copy: "Animaciones: Normales" / "Animaciones: Llamativas", stamps "¡FURIA!", "¡CRÍTICO!", "Nivel N".
- Verify with `npx tsc --noEmit && npm run build && npm run lint && npm test` (0 lint errors). Commits: conventional prefix, no Co-authored-by trailer. Commit `public/sw.js` with the task that rebuilt it.

## Review Focus

1. Rapid tab tapping or swiping mid-transition must never leave two tabs stacked, a blank screen, or a stuck overlay — pinned in Task 4's component test.
2. Effects played while a modal (`<dialog>`) is open (level up, rests) must render above it and never block taps — pinned by `pointer-events:none` + popover in Task 3 and a browser check in Task 6.
3. A roll result re-mounting (tab switch back) must not replay the crit — pinned by id dedupe test in Task 1/3.
4. OS reduced-motion must suppress every flashy effect and tab animation — pinned in Tasks 3 and 4 tests.
5. Old saved settings (no `motionStyle`) must load as Normal — pinned in Task 2.

---

### Task 1: Pure motion helpers

**Files:** Create `src/lib/motion.ts`, `src/lib/motion.test.ts`.

**Produces:**
- `type EffectName = "rage-ignite" | "rage-end" | "crit" | "level-up" | "long-rest" | "short-rest" | "inspiration"`
- `EFFECT_DURATIONS: Record<EffectName, number>`, `TAB_TRANSITION_MS: { normal: 300; flashy: 820 }`
- `shouldAnimate(style: "normal" | "flashy", reducedMotion: boolean): boolean`
- `interface ActiveEffect { id: string; name: EffectName; startedAt: number; origin?: { x: number; y: number }; data?: Record<string, string | number> }`
- `addEffect(list: ActiveEffect[], fx: ActiveEffect): ActiveEffect[]` (ignores an id already present)
- `pruneEffects(list: ActiveEffect[], now: number): ActiveEffect[]` (drops effects whose `startedAt + duration <= now`)
- `tabDirection<T>(order: readonly T[], from: T, to: T): 1 | -1`
- `swipeOrigin(dir: 1 | -1, width: number, height: number): { x: number; y: number }` (dir +1 = moved right in order = swiped left → origin at right edge `x = width`; −1 → `x = 0`; `y = height - 40`)

- [ ] Step 1: write `motion.test.ts` covering: every EffectName has a positive duration; `shouldAnimate` truth table (only flashy + not reduced is true); `addEffect` appends and ignores duplicate ids; `pruneEffects` keeps an effect at `startedAt + duration - 1` and drops it at `startedAt + duration`; `tabDirection` +1/−1 incl. same-index → +1; `swipeOrigin` both directions.
- [ ] Step 2: run `npx vitest run src/lib/motion.test.ts` → FAIL (module missing).
- [ ] Step 3: implement `motion.ts`.
- [ ] Step 4: run → PASS. Commit `feat: pure motion helpers for effects and tab transitions`.

### Task 2: `motionStyle` setting and reduced-motion hook

**Files:** Modify `src/lib/types.ts` (`AppSettings`), `src/lib/storage.ts` (defaults), `src/hooks/useTheme.ts`, `src/components/tabs/SettingsTab.tsx`. Create `src/hooks/usePrefersReducedMotion.ts`, `src/lib/settingsDefaults.test.ts`.

**Produces:** `useThemeContext().motionStyle`, `.setMotionStyle(style)`; `usePrefersReducedMotion(): boolean` (false when `matchMedia` is unavailable; subscribes to changes with `useSyncExternalStore`, so no setState-in-effect).

- [ ] Step 1: test: `loadSettings()` with empty storage → `motionStyle === "normal"`; with stored `{"theme":"pergamino"}` (no field) → `"normal"` and theme kept; with stored `"flashy"` → `"flashy"`.
- [ ] Step 2: run → FAIL. Step 3: add the field + default, then `useTheme` state/loader/setter (mirror `diceRollMode`), the hook, and the Ajustes row under Tema: `CompactRow` name `` `Animaciones: ${motionStyle === "flashy" ? "Llamativas" : "Normales"}` ``, right "Tap para cambiar", toggles.
- [ ] Step 4: tests pass; full chain; commit `feat: Animaciones setting (Normales / Llamativas) with reduced-motion hook`.

### Task 3: Effects provider, top-layer layer, effect components

**Files:** Create `src/components/effects/EffectsProvider.tsx` (context, `useEffects`, layer), `src/components/effects/effectViews.tsx` (one small component per effect), `src/app/effects.css` (imported from `globals.css`), `src/components/effects/EffectsProvider.test.tsx`. Modify `src/app/page.tsx` (wrap app in provider inside Character/Theme providers; root element ref for shake).

**Produces:** `useEffects(): { play(name: EffectName, opts?: { id?: string; origin?: {x:number;y:number}; data?: Record<string,string|number> }): void; flashy: boolean; shake(): void }`.

Layer: a `div` with `popover="manual"`, `data-effects-layer`, fixed full-screen, `pointer-events:none`, transparent, no UA popover border/inset styles; on every new effect call `hidePopover?.()` then `showPopover?.()` (guarded; fallback = `position:fixed; z-index:120`). Renders each active effect's view, plus the persistent breathing Rage vignette when `flashy && character.resources.rpiRages.active`.

Views (port CSS/markup from the lab demo, scaled to the full viewport): `rage-ignite` (ring at origin, edge pulse, `¡FURIA!` red stamp, 22 embers at origin) + calls `shake()`; `rage-end` (18 ash particles across the origin rect given as `data.w/h`); `crit` (gold burst + 26 sparks at origin, `¡CRÍTICO!` gold stamp); `level-up` (dim, rays, 30 embers, seal "Nivel {data.level}"); `long-rest` (night, moon, 18 stars, dawn); `short-rest` (fire glow, 16 sparks); `inspiration` (16 sparkles at origin). Particle offsets are generated once per effect instance (`useState` initializer), not per render.

Timing: provider stores `ActiveEffect[]`; `play()` adds via `addEffect` and schedules removal with `setTimeout(duration)` (timeouts cleared on unmount); ids default to `${name}-${Date.now()}`.

- [ ] Step 1: tests (fake timers, render provider with a test child that calls `play`): normal style → no `[data-effect]` element; flashy → `[data-effect="crit"]` present, gone after 1400ms; same id twice → one element; reduced motion (mock `matchMedia` → matches) → nothing. Provide theme/character contexts with minimal fakes.
- [ ] Step 2: run → FAIL. Step 3: implement. Step 4: pass; full chain; commit `feat: effects provider with top-layer effects layer and flashy effect views`.

### Task 4: Tab transitions

**Files:** Create `src/components/ui/TabTransition.tsx`, `src/components/ui/TabTransition.test.tsx`; tab-transition CSS into `src/app/effects.css` (port `.fx-normal-*` and `.fx-combo-*`, `.splat`, `.drop`, `.ember` from the transitions demo). Modify `src/app/page.tsx`: render `<TabTransition tabKey={activeTab} order={TAB_ORDER} origin={lastOrigin} style={...}>{tabContent[activeTab]}</TabTransition>`; nav click records the button centre as origin; swipe records `swipeOrigin`; remove `chapters` from `<motion.main>` (each TabTransition panel gets `chapters`). On tab change, scroll `<main>` to top and pass the previous scrollTop so the leaving panel is offset by it.

**Produces:** `TabTransition` props `{ tabKey: string; order: readonly string[]; origin: {x:number;y:number} | null; mode: "normal" | "flashy" | "instant"; scrollOffset: number; children: ReactNode }`.

Behaviour: keeps `{ key, node }` of the previous tab (prev-state-in-render when `tabKey` changes), renders it absolutely positioned (`top: -scrollOffset`) with `fx-{mode}-out`, the new one with `fx-{mode}-in`, and for flashy adds splat/droplets/embers; a `setTimeout(TAB_TRANSITION_MS[mode])` (started in an effect, cleared on change/unmount) clears the previous. A change while one is running replaces the previous with the tab that was current (never three panels). `instant` renders only the new tab.

- [ ] Step 1: tests (fake timers): initial render → one `.chapters` panel; change key (normal) → two panels, one with `fx-normal-out`; after 300ms → one; flashy → splat element present during transition; two quick changes → at most two panels and the final key's content present; `instant` → one panel immediately.
- [ ] Step 2: FAIL. Step 3: implement + wire page. Step 4: pass; full chain; browser check both modes + swipe; commit `feat: normal and flashy (ink & scatter) tab transitions`.

### Task 5: Wire triggers and local flourishes

**Files:** Modify `RageCluster.tsx`, `CombatVitals.tsx`, `DiceResult.tsx`, `DeathSaves.tsx`, `Tag.tsx`, `CombatTab.tsx`, `LevelUpFlow.tsx`, `SettingsTab.tsx`; add local-flourish CSS to `effects.css` (port `.tally svg`, `.hp.flinch`, `.hp.heal`, `.claw`, ghost bar, `.roll.fumble` + `.crack` + `.drip`, `.stamp.new`, death-save stamp from the lab).

- RageCluster: flame click → after `onToggleActive()`, `play(active ? "rage-end" : "rage-ignite", { origin })` (origin = flame centre; for end, `data` = card rect via closest `[data-vitals]`). Tally click marking a slot used → remember that index (`useState`) and render an SVG slash with draw animation on that mark when `flashy`; restoring clears it.
- CombatVitals: `data-vitals` on the card; prev-HP in render → `hpAnim` = "damage" | "heal" | null with a key counter; when flashy, apply `.flinch`/`.heal` classes, render claw SVG (damage) / sparks (heal) inside the card (absolute), card shake, ghost bar element under the fill whose width transitions with delay. Inspiration badge click turning it on → `play("inspiration", { origin })`.
- DiceResult: when flashy and crit, `play("crit", { id: "crit-" + roll.timestamp, origin })` from a `useEffect` keyed on `roll.timestamp` (context call, not local setState). Fumble (flashy): `.fumble` shake class + crack SVG + ink drop inside the result.
- DeathSaves / Tag: filled mark and newly added tag use a stamp animation class when flashy (`Tag` gets optional `stampIn`); CombatTab tracks the last added condition to pass `stampIn`.
- LevelUpFlow `applyAll`: `play("level-up", { data: { level: newLevel } })` after the update. SettingsTab: long-rest handler → `play("long-rest")`; "Terminar descanso" → `play("short-rest")`.

- [ ] Step 1: add a `DiceResult` component test: flashy + nat-20 roll → `play` called once with `crit`; re-render same roll → still once; normal → never (mock `useEffects` via provider fake).
- [ ] Step 2: FAIL → implement all wiring → pass; full chain; browser pass of every trigger in flashy and normal; commit `feat: wire flashy effects into rage, dice, HP, level up, rests and small touches`.

### Task 6: Final verification

- [ ] Full chain; browser: every effect (both modes), all four themes spot-check, swipe, level-up with modal open, `emulate` reduced motion (via `matchMedia` override) shows nothing flashy; restore the test character afterwards.
- [ ] Commit any fix-ups.
