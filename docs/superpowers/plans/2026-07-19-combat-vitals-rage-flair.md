# Combat Vitals Rage Flair (UI Redesign Phase 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring back the Rage rules description on the Combat tab's vitals header (fixing a real bug where it hardcoded `+2 daño` regardless of character level), and give the header three layered ambient effects plus a one-time ignition flourish while Rage is active.

**Architecture:** Four self-contained changes to the existing `CombatVitals`/`RageCluster` component pair: (1) wire the already-correct `rageDamage` value through and render the description text, (2) replace the old static active-glow with a new `globals.css`-defined animated border-sheen + HP heartbeat pulse, (3) add a steady looping ember particle effect to the flame toggle, (4) add a one-time "ignition" burst on the false→true `active` transition using this codebase's established key-remount idiom for one-shot CSS animations.

**Tech Stack:** Next.js 15 (client components), Tailwind CSS v4 + CSS custom properties per `[data-theme]`, plain CSS keyframe animations in `globals.css` (no animation library — the codebase already has `framer-motion` available via `motion.div` but this effort's animations are pure CSS per the design spec).

## Global Constraints

- Full design spec: `docs/superpowers/specs/2026-07-19-combat-vitals-rage-flair-design.md`. Reference animated mockup (source of truth for exact CSS values — colors, sizes, timings): `docs/superpowers/specs/2026-07-19-combat-vitals-rage-flair-mockups/rage-combined.html`.
- Scope is `CombatVitals.tsx`, `RageCluster.tsx`, one line in `DeathSaves.tsx` (see Task 2), `CombatTab.tsx` (one new prop), and `globals.css`. Nothing else.
- Every task must end passing: `npx tsc --noEmit && npm run build && npm run lint && npm test`. Lint is not optional — `react-hooks/rules-of-hooks` and `react-hooks/set-state-in-effect` are the only things that catch hook-ordering/effect-state bugs; `tsc`/`build`/`test` do not.
- No `useEffect` for the ignition-transition detection — compare `active` against a `prevActive` state value in the render body and call `setState` directly there, exactly like `CollapsibleSection`'s `forceOpenKey` (`src/components/ui/CollapsibleSection.tsx:16-22`) and `CombatTab.tsx`'s `healerKitPulseKey` (`src/components/tabs/CombatTab.tsx:350-355`).
- No haptic/vibration feedback anywhere in this work (iOS Safari, including installed PWAs, has never implemented the Vibration API — confirmed out of scope in the spec).
- All colors must come from theme CSS variables (`var(--cord)`, `var(--card)`, `color-mix(in srgb, var(--cord) X%, white)`, etc.) — never hardcoded hex — so the effects render correctly across all 3 active themes (`piedra-viva`, `pergamino`, `furia-de-sangre`). The reference mockup uses hardcoded hex; translate, don't copy literally.
- Manual verification after every task: `npm run dev`, open the app, switch to each of the 3 active themes via the Ajustes tab, and check Rage's visual state on the Combat tab.
- Commit messages in this round are prefixed `Feature UI-Redesign-PT4: ` (continuing the `PT2`/`PT3` convention from the prior two rounds of this same redesign effort).

---

## Task 1: Fix the rageDamage bug — wire the prop and render the description text

**Files:**
- Modify: `src/components/combat/CombatVitals.tsx` (add `rageDamage` prop, render description block)
- Modify: `src/components/tabs/CombatTab.tsx:185-213` (pass the prop)

**Interfaces:**
- Consumes: `rageDamage` — already computed correctly at `src/components/tabs/CombatTab.tsx:79-80` as `BARBARIAN_LEVELS.find((l) => l.level === meta.level)?.rageDamage ?? 2`.
- Produces: `CombatVitalsProps.rageDamage: number` (new required prop) — no other task depends on this, but Task 2 edits the same JSX region so must be applied after this task lands.

- [ ] **Step 1: Add `rageDamage` to `CombatVitalsProps` and destructure it**

In `src/components/combat/CombatVitals.tsx`, add the field to the interface (insert after the existing `rage: RageClusterProps;` line):

```tsx
export interface CombatVitalsProps {
  isDying: boolean;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  displayAc: number;
  tempAcMod: number;
  magicAcBonus: number;
  showExplicitMagicTag: boolean;
  initiative: number;
  inspiration: boolean;
  effectiveSpeed: number;
  speedReduction: number;
  rage: RageClusterProps;
  rageDamage: number;
  deathSaves: { successes: number; failures: number };
  onOpenHp: () => void;
  onOpenTempHp: () => void;
  onOpenAc: () => void;
  onToggleInspiration: () => void;
  onDeathSavesChange: (successes: number, failures: number) => void;
  onRegainConsciousness: () => void;
}
```

And in the destructured function parameters, add `rageDamage,` after `rage,`:

```tsx
export function CombatVitals({
  isDying,
  currentHp,
  maxHp,
  tempHp,
  displayAc,
  tempAcMod,
  magicAcBonus,
  showExplicitMagicTag,
  initiative,
  inspiration,
  effectiveSpeed,
  speedReduction,
  rage,
  rageDamage,
  deathSaves,
  onOpenHp,
  onOpenTempHp,
  onOpenAc,
  onToggleInspiration,
  onDeathSavesChange,
  onRegainConsciousness,
}: CombatVitalsProps) {
```

- [ ] **Step 2: Add `relative` to the primary HP/AC row**

Task 2 will replace the card's background with a version that has an animated `::before` overlay; any direct content of the card that isn't `position: relative` would render underneath that overlay. Add it now on the primary row too (the RageCluster and secondary-stat rows get it in Step 3 below), so Task 2 doesn't have to touch this line separately. Find:

```tsx
        <div className="flex items-center justify-between gap-2">
```

Replace with:

```tsx
        <div className="relative flex items-center justify-between gap-2">
```

- [ ] **Step 3: Render the description block**

Find this block in `src/components/combat/CombatVitals.tsx`:

```tsx
      <div className="mt-2.5">
        <RageCluster {...rage} />
      </div>

      <div className="flex items-center justify-around gap-1.5 mt-2.5 pt-2 border-t border-border/40">
```

Replace it with (this inserts the new description block between the two existing rows; the `relative` classes are needed by Task 2, add them now so Task 1's diff and Task 2's diff don't collide):

```tsx
      <div className="relative mt-2.5">
        <RageCluster {...rage} />
      </div>

      {rage.active && (
        <div className="relative mt-2.5 pt-2 border-t border-cord/30 text-[0.7rem] leading-relaxed text-foreground/85">
          <span className="text-accent font-semibold">{rageDamage} daño</span> · Resistencia
          Bludgeoning/Piercing/Slashing · Ventaja FUE checks/saves
          <br />
          Extiende: ataca · fuerza salvación · Bonus Action · No concentración ni hechizos
        </div>
      )}

      <div className="relative flex items-center justify-around gap-1.5 mt-2.5 pt-2 border-t border-border/40">
```

Note: only the opening `<div className="relative mt-2.5">` (RageCluster wrapper) and `<div className="relative flex items-center justify-around ...">` (secondary stats row) lines change; the closing tags and the `StatBadge` rows inside the last block are untouched.

- [ ] **Step 4: Pass `rageDamage` from `CombatTab.tsx`**

In `src/components/tabs/CombatTab.tsx`, find the `<CombatVitals ... rage={{...}} ...>` call (starts at line 185) and add `rageDamage={rageDamage}` — insert it right after the `rage={{...}}` block, before `deathSaves={combat.deathSaves}`:

```tsx
      <CombatVitals
        isDying={isDying}
        currentHp={combat.currentHp}
        maxHp={combat.maxHp}
        tempHp={combat.tempHp}
        displayAc={displayAc}
        tempAcMod={tempAcMod}
        magicAcBonus={magicAcBonus}
        showExplicitMagicTag={magicItemIndicator === "explicit-tag"}
        initiative={combat.initiative}
        inspiration={meta.inspiration}
        effectiveSpeed={effectiveSpeed}
        speedReduction={speedReduction}
        rage={{
          slots,
          active: rageActive,
          onToggleSlot: toggleRageSlot,
          onToggleActive: toggleRageActive,
        }}
        rageDamage={rageDamage}
        deathSaves={combat.deathSaves}
        onOpenHp={() => setHpModalOpen(true)}
        onOpenTempHp={() => setTempHpInput(true)}
        onOpenAc={() => setAcModalOpen(true)}
        onToggleInspiration={toggleInspiration}
        onDeathSavesChange={(s, f) => updateCombat({ deathSaves: { successes: s, failures: f } })}
        onRegainConsciousness={() =>
          updateCombat({ currentHp: 1, deathSaves: { successes: 0, failures: 0 } })
        }
      />
```

(`rageDamage` is already an existing local variable in this file at line 79-80 — this step only adds the one new prop line, nothing else in the call changes.)

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass with no errors (no test file references `CombatVitals`/`CombatTab`, so `npm test` output is unchanged from before this task).

- [ ] **Step 6: Manual check — the actual bug fix**

Run `npm run dev`, open the app, go to the Combat tab. Activate Rage and confirm the description text appears and shows the correct level-scaled damage bonus. Mavok's default level is unlikely to be 1 (where `rageDamage` is `2`, same as the old hardcoded value and thus not a useful test) — check `src/data/mavok-default.ts` or the in-app level display for the current level, and if it happens to be a level where `rageDamage` is `2`, temporarily bump the level via the Ficha tab, confirm the description updates to `3 daño`/`4 daño` accordingly, then revert the level change (don't leave test data committed).

- [ ] **Step 7: Commit**

```bash
git add src/components/combat/CombatVitals.tsx src/components/tabs/CombatTab.tsx
git commit -m "Feature UI-Redesign-PT4: fix hardcoded +2 rage damage, restore description text

rageDamage was already computed correctly in CombatTab.tsx but never
wired to the header after the phase-1 redesign dropped RageTracker.
Wires it through and brings the rules description back."
```

---

## Task 2: Steady-state border sheen + HP heartbeat (replaces the old static glow)

**Files:**
- Modify: `src/app/globals.css` (add `.stone-card-raging`, `.hp-heartbeat`, and their keyframes)
- Modify: `src/components/combat/CombatVitals.tsx` (swap the static glow classes for the new treatment; apply `.hp-heartbeat` to the HP number)
- Modify: `src/components/combat/DeathSaves.tsx:18` (add `relative` so its content still renders above the new sheen overlay when `isDying` + `rage.active` both hold)

**Interfaces:**
- Consumes: nothing from Task 1 beyond the file already being in the state Task 1 left it (the `relative` classes on the primary HP/AC row, RageCluster wrapper, and secondary-stats row already exist from Task 1 Steps 2 and 3 — don't re-add them).
- Produces: CSS classes `.stone-card-raging` and `.hp-heartbeat` in `globals.css`, consumed only within this task's own component edits (no later task depends on these names).

- [ ] **Step 1: Add the new CSS to `globals.css`**

In `src/app/globals.css`, insert the following immediately after the `.crack-divider::after { ... }` block (ends around line 258) and before the `/* Dialog centering */` comment:

```css
/* Rage active — animated border sheen, replaces the old static glow */
.stone-card-raging {
  position: relative;
  border: 1px solid transparent;
  background-image:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--card) 95%, rgba(255,255,255,0.03)) 0%,
      var(--card) 50%,
      color-mix(in srgb, var(--card) 95%, rgba(0,0,0,0.1)) 100%
    ),
    linear-gradient(90deg, var(--cord), color-mix(in srgb, var(--cord) 45%, white), var(--cord));
  background-origin: border-box;
  background-clip: padding-box, border-box;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.04),
    inset 0 -1px 0 rgba(0,0,0,0.2),
    0 0 16px color-mix(in srgb, var(--cord) 35%, transparent);
}
.stone-card-raging::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    120deg,
    transparent 30%,
    color-mix(in srgb, var(--cord) 45%, white) 50%,
    transparent 70%
  );
  background-size: 250% 250%;
  animation: rage-sheen 3.4s ease-in-out infinite;
  pointer-events: none;
}
@keyframes rage-sheen {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
}

/* Beast Within — HP number heartbeat pulse while raging */
.hp-heartbeat {
  display: block;
  animation: rage-heartbeat 1.15s ease-in-out infinite;
  transform-origin: left center;
}
@keyframes rage-heartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(1.07); }
  28% { transform: scale(1); }
  42% { transform: scale(1.04); }
  60% { transform: scale(1); }
}
```

(`.stone-card-raging`'s `::before` paints above the card's own base background but below the actual content, because the content divs already got `position: relative` in Task 1 Step 2 — CSS stacking order puts positioned descendants above non-positioned ones regardless of z-index value, so no explicit `z-index` is needed here. See the design spec's mockup at `docs/superpowers/specs/2026-07-19-combat-vitals-rage-flair-mockups/rage-combined.html` for the visual this reproduces.)

- [ ] **Step 2: Swap the root div's class and apply the heartbeat class to the HP number**

In `src/components/combat/CombatVitals.tsx`, find:

```tsx
  return (
    <div
      className={`stone-card rounded-lg p-3 transition-all ${
        rage.active ? "!border-cord/50 shadow-[0_0_16px_rgba(166,61,47,0.3)]" : ""
      }`}
    >
```

Replace with:

```tsx
  return (
    <div
      className={`${rage.active ? "stone-card-raging" : "stone-card"} rounded-lg p-3 transition-all`}
    >
```

Then find the HP `<span>` (inside the `!isDying` branch, Task 1 didn't touch this element):

```tsx
            <span className="block font-heading text-2xl leading-none text-accent">
              {currentHp}/{maxHp}
            </span>
```

Replace with:

```tsx
            <span
              className={`block font-heading text-2xl leading-none text-accent ${
                rage.active ? "hp-heartbeat" : ""
              }`}
            >
              {currentHp}/{maxHp}
            </span>
```

- [ ] **Step 3: Add `relative` to `DeathSaves.tsx`'s root div**

`CombatVitals` renders `<DeathSaves />` in place of the HP/AC row when `isDying` is true, but `RageCluster` and the new description block still render below it — so if a character is both dying and raging, `.stone-card-raging`'s `::before` sheen would paint over `DeathSaves`'s content unless it's also a positioned element. In `src/components/combat/DeathSaves.tsx`, find:

```tsx
  return (
    <div>
      <h3 className="font-heading text-danger text-center text-sm mb-3">
```

Replace with:

```tsx
  return (
    <div className="relative">
      <h3 className="font-heading text-danger text-center text-sm mb-3">
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass.

- [ ] **Step 5: Manual check**

`npm run dev`, Combat tab, activate Rage. Confirm: the card border now shows a slow diagonal light sheen instead of the old static red glow; the HP number pulses with a subtle heartbeat; all card content (HP, AC ring, rage pips/flame, description, secondary stats) remains fully visible and on top of the sheen, not washed out or hidden behind it. Repeat across the three active themes (`piedra-viva`, `pergamino`, `furia-de-sangre`) via the Ajustes tab — the sheen and heartbeat should be visible but tasteful in all three, including the light `pergamino` theme. Then reduce HP to 0 while Rage is still active (or toggle Rage on while already at 0 HP) and confirm `DeathSaves` renders cleanly on top of the sheen effect, not underneath it.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/components/combat/CombatVitals.tsx src/components/combat/DeathSaves.tsx
git commit -m "Feature UI-Redesign-PT4: add animated border sheen + HP heartbeat while raging

Replaces the old static border-glow with a slow diagonal light sheen
(dual-background-layer gradient border, avoiding the box-shadow
stacking pitfall from the modals round) plus a heartbeat pulse on the
HP number. DeathSaves gets position:relative so it still renders above
the sheen if a character is both dying and raging."
```

---

## Task 3: Ember Wisp — steady particles rising from the flame toggle

**Files:**
- Modify: `src/app/globals.css` (add `.ember-wisp` and its keyframe)
- Modify: `src/components/combat/RageCluster.tsx` (render 3 staggered particles on the flame button while `active`)

**Interfaces:**
- Consumes: nothing from earlier tasks (this task only touches `RageCluster.tsx`, which Tasks 1-2 didn't modify).
- Produces: CSS class `.ember-wisp` in `globals.css`; local constants `EMBER_WISP_OFFSETS`/`EMBER_WISP_DELAYS` in `RageCluster.tsx`, both consumed only within Task 4's edits to the same file (Task 4 adds burst particles alongside these, using a different class name so the two don't collide).

- [ ] **Step 1: Add the ember-wisp CSS to `globals.css`**

Append this immediately after the `.hp-heartbeat`/`@keyframes rage-heartbeat` block added in Task 2:

```css

/* Ember Wisp — steady particles rising from the flame toggle while raging */
.ember-wisp {
  position: absolute;
  bottom: 40%;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--cord) 40%, white);
  pointer-events: none;
  animation: rage-ember-rise 2s ease-out infinite;
}
@keyframes rage-ember-rise {
  0% { opacity: 0; transform: translateY(0) scale(0.6); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-22px) scale(1.2); }
}
```

- [ ] **Step 2: Render the particles on the flame button**

In `src/components/combat/RageCluster.tsx`, add the stagger constants above the component function:

```tsx
const EMBER_WISP_OFFSETS = [25, 55, 75];
const EMBER_WISP_DELAYS = [0.2, 0.9, 1.6];
```

Then find the flame button:

```tsx
      <button
        onClick={onToggleActive}
        disabled={!active && !canActivate}
        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm border transition-shadow ${
          active
            ? "border-cord bg-cord shadow-[0_0_8px_rgba(166,61,47,0.6)]"
            : canActivate
              ? "border-cord/50"
              : "border-border/40 opacity-40 cursor-not-allowed"
        }`}
        aria-label={active ? "Desactivar Rage" : "Activar Rage"}
      >
        🔥
      </button>
```

Replace with (adds `relative` to the button so the absolutely-positioned particles anchor to it, and renders the particles conditionally on `active`):

```tsx
      <button
        onClick={onToggleActive}
        disabled={!active && !canActivate}
        className={`relative w-6 h-6 rounded-full flex items-center justify-center text-sm border transition-shadow ${
          active
            ? "border-cord bg-cord shadow-[0_0_8px_rgba(166,61,47,0.6)]"
            : canActivate
              ? "border-cord/50"
              : "border-border/40 opacity-40 cursor-not-allowed"
        }`}
        aria-label={active ? "Desactivar Rage" : "Activar Rage"}
      >
        🔥
        {active &&
          EMBER_WISP_OFFSETS.map((left, i) => (
            <span
              key={`wisp-${i}`}
              className="ember-wisp"
              style={{ left: `${left}%`, animationDelay: `${EMBER_WISP_DELAYS[i]}s` }}
            />
          ))}
      </button>
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass.

- [ ] **Step 4: Manual check**

`npm run dev`, Combat tab, activate Rage. Confirm 3 small embers rise and fade from the flame icon on a staggered, continuous loop — contained to the flame, not spilling across the whole card. Deactivate Rage and confirm the embers disappear immediately (they're conditionally rendered on `active`, so no lingering particles). Check across the 3 active themes — the ember color should read as a lighter tint of that theme's `--cord`, not a fixed orange that clashes with `pergamino`'s lighter palette.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/components/combat/RageCluster.tsx
git commit -m "Feature UI-Redesign-PT4: add Ember Wisp particle loop to the rage flame toggle"
```

---

## Task 4: Ignition flourish — one-time burst on Rage activation

**Files:**
- Modify: `src/app/globals.css` (add `.ignite-flash`, `.ember-burst`, and their keyframes)
- Modify: `src/components/combat/RageCluster.tsx` (detect the false→true `active` transition, play a one-shot flash + denser ember burst)

**Interfaces:**
- Consumes: `EMBER_WISP_OFFSETS`/`EMBER_WISP_DELAYS` constants and the flame `<button>` JSX structure from Task 3 — this task edits the same button element Task 3 added particles to, so Task 3 must land first.
- Produces: nothing consumed by later tasks (this is the last task).

- [ ] **Step 1: Add the ignition CSS to `globals.css`**

Append this immediately after the `.ember-wisp`/`@keyframes rage-ember-rise` block added in Task 3:

```css

/* Ignition flourish — one-time burst on Rage activation */
.ignite-flash {
  display: inline-block;
  animation: rage-ignite-flash 400ms ease-out 1;
}
@keyframes rage-ignite-flash {
  0% { transform: scale(1); filter: brightness(1); }
  30% { transform: scale(1.35); filter: brightness(1.6); }
  100% { transform: scale(1); filter: brightness(1); }
}
.ember-burst {
  position: absolute;
  bottom: 40%;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--cord) 30%, white);
  pointer-events: none;
  animation: rage-ember-burst 400ms ease-out 1;
}
@keyframes rage-ember-burst {
  0% { opacity: 0; transform: translateY(0) scale(0.4); }
  15% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-30px) scale(1); }
}
```

- [ ] **Step 2: Add transition-detection state and burst constants**

In `src/components/combat/RageCluster.tsx`, find the two constants Task 3 added:

```tsx
const EMBER_WISP_OFFSETS = [25, 55, 75];
const EMBER_WISP_DELAYS = [0.2, 0.9, 1.6];
```

Add two new constants directly below them (do not redeclare the two above — they already exist from Task 3):

```tsx
const EMBER_BURST_OFFSETS = [15, 30, 45, 60, 75, 90];
const EMBER_BURST_DELAYS = [0, 0.05, 0.1, 0.15, 0.2, 0.25];
```

Then find the component body's existing state:

```tsx
  const [expanded, setExpanded] = useState(false);
```

Replace with (adds the `prevActive`/`igniteKey` pair, using the exact same render-body-comparison idiom as `CollapsibleSection`'s `forceOpenKey` — never inside a `useEffect`, per this project's `react-hooks/set-state-in-effect` convention):

```tsx
  const [expanded, setExpanded] = useState(false);
  const [prevActive, setPrevActive] = useState(active);
  const [igniteKey, setIgniteKey] = useState(0);

  if (active !== prevActive) {
    setPrevActive(active);
    if (active) setIgniteKey((k) => k + 1);
  }
```

- [ ] **Step 3: Wrap the flame emoji and add the burst particles**

Find the flame button (as left by Task 3):

```tsx
      >
        🔥
        {active &&
          EMBER_WISP_OFFSETS.map((left, i) => (
            <span
              key={`wisp-${i}`}
              className="ember-wisp"
              style={{ left: `${left}%`, animationDelay: `${EMBER_WISP_DELAYS[i]}s` }}
            />
          ))}
      </button>
```

Replace with:

```tsx
      >
        <span key={`flame-${igniteKey}`} className={igniteKey > 0 ? "ignite-flash" : undefined}>
          🔥
        </span>
        {active &&
          EMBER_WISP_OFFSETS.map((left, i) => (
            <span
              key={`wisp-${i}`}
              className="ember-wisp"
              style={{ left: `${left}%`, animationDelay: `${EMBER_WISP_DELAYS[i]}s` }}
            />
          ))}
        {igniteKey > 0 &&
          EMBER_BURST_OFFSETS.map((left, i) => (
            <span
              key={`burst-${igniteKey}-${i}`}
              className="ember-burst"
              style={{ left: `${left}%`, animationDelay: `${EMBER_BURST_DELAYS[i]}s` }}
            />
          ))}
      </button>
```

The `key={`flame-${igniteKey}`}` on the emoji span forces React to remount it on every activation, which is what makes the one-shot `.ignite-flash` CSS animation replay each time (a plain class-name change on an already-mounted element would not replay a finished `animation-iteration-count` sequence). Same reasoning for `key={`burst-${igniteKey}-${i}`}` on the burst particles. `igniteKey` starts at `0` and only increments on a real `false→true` transition (never on initial mount, even if `active` is already `true` from a page reload — `prevActive`'s initial value is `active` itself, so no transition is detected on mount), so nothing burst-related renders until the user actually activates Rage at least once in this session.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass. Lint in particular must show 0 errors — this step added new `useState` calls above the existing hooks, so double-check `react-hooks/rules-of-hooks` is clean (all hooks are still called unconditionally at the top of the component, before any JSX).

- [ ] **Step 5: Manual check**

`npm run dev`, Combat tab. With Rage inactive, activate it: confirm a brief (~400ms) brighter flash + denser burst of embers plays once on the flame icon, then settles into the normal steady Ember Wisp loop from Task 3. Tap a rage slot pip while still raging (a re-render, not an activation) and confirm the burst does NOT replay. Deactivate Rage and confirm no burst plays on deactivation. Reload the page while Rage is active (toggle it on, then refresh the browser tab) and confirm the burst does NOT play on that reload — only the steady loop should be present immediately. Reactivate Rage a second time in the same session (deactivate, then activate again) and confirm the burst DOES replay.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/components/combat/RageCluster.tsx
git commit -m "Feature UI-Redesign-PT4: add one-time ignition flourish on rage activation

Uses the same key-remount idiom as CollapsibleSection's forceOpenKey
and CombatTab's healerKitPulseKey to replay a one-shot CSS animation
without setTimeout/cleanup. Burst particles are a separate set of
elements from the steady Ember Wisp loop so the two keyframe
animations never fight over the same element's transform/opacity."
```

---

## Final Verification

After all four tasks:

```bash
npx tsc --noEmit && npm run build && npm run lint && npm test
```

Manually re-walk the full spec's Verification section end-to-end (not just per-task) across all 3 active themes: description text at more than one character level, ignition flourish exactly once per activation and not on mount-while-active, all three steady effects running together without visual conflict, old static glow confirmed gone (not layered under the new one), and the `isDying` + `rage.active` combination rendering cleanly.

Then hand off to **superpowers:finishing-a-development-branch** to verify tests, present merge/PR/keep/discard options, and complete the branch.