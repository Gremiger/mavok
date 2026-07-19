# Combat Vitals Rage Flair (UI Redesign Phase 4) — Design

## Context

Follow-up on user feedback after the Combat tab redesign (phase 1): bring back the Rage rules description that was dropped when `RageTracker.tsx` was retired in favor of the compact `RageCluster`, and give the vitals header more personality while raging — "slick, a little whimsical and cool" per explicit request. Scope confirmed as `CombatVitals.tsx` only (HP/AC/Rage cluster/secondary stats card) — not the quick-actions row or the conditions/exhaustion rows below it.

Explored via **animated** visual mockups, not static comparisons, since motion was the actual subject of the question. Four candidate directions were shown (Ember Wisp, Molten Crack, Beast Within, Battle Roar); rather than pick one, three were approved combined (Ember Wisp + Molten Crack + Beast Within), since they're spatially separated — flame corner, card border, HP number — and don't compete for the same visual space. A fourth addition (a one-time "ignition" flourish on activation) came out of a follow-up round; a fifth idea (haptic vibration) was explicitly dropped — iOS Safari, including installed PWAs, has never implemented the Vibration API, and iOS is this project's primary target device.

This also fixes a real, pre-existing bug: the old `RageTracker`'s description text hardcoded `"+2 daño"` regardless of character level. The actual bonus scales (2→3→4 per `BARBARIAN_LEVELS` in `barbarian-progression.ts`) and is already correctly computed as `rageDamage` in `CombatTab.tsx` (`BARBARIAN_LEVELS.find((l) => l.level === meta.level)?.rageDamage ?? 2`) — it was simply never passed down to the header after the redesign, since the redesign dropped the description entirely along with the old component.

## 1. Rage description text

Rendered only when `rage.active` is true, directly below the primary HP/AC/rage row, above the secondary stat row:

```
{rageDamage} daño · Resistencia Bludgeoning/Piercing/Slashing · Ventaja FUE checks/saves
Extiende: ataca · fuerza salvación · Bonus Action · No concentración ni hechizos
```

Condensed from the real Rage feature text in `barbarian-progression.ts` (checked against source, not assumed) — same content the old `RageTracker` showed, corrected for the level-scaling bug. `rageDamage` becomes a new required prop on `CombatVitals`, passed straight through from `CombatTab.tsx` (which already computes it correctly — this is a wiring fix, not new logic).

## 2. Steady-state "raging" treatment — three effects, layered

All three fire together whenever `rage.active` is true, deliberately offset in timing so they don't sync into one distracting pulse. This treatment **replaces** the current static `rage.active` glow on `CombatVitals`'s root div (`!border-cord/50 shadow-[0_0_16px_rgba(166,61,47,0.3)]` from the Phase 1 redesign) — the two would look redundant layered together, and the new treatment is a strict superset of what the old one was going for.

- **Ember Wisp**: 3 small particles rise and fade from the flame toggle specifically (not the whole card), staggered ~0.7s apart on a ~2s loop each.
- **Molten Crack**: a soft diagonal light-sheen sweeps across the vitals card's border on a slow ~3.4s loop. Implemented as a dual-background-layer gradient border (the card's own fill plus an animated gradient, clipped separately) rather than fighting over `box-shadow` the way an earlier mistake in this same redesign series already did once (Combat modals' `Modal.tsx` — see that spec's Task 1) — worth naming explicitly since it's the same category of CSS pitfall.
- **Beast Within**: the HP number pulses on a ~1.15s heartbeat rhythm (quick-scale, settle, smaller second beat, rest) — doubles as reinforcing "this is your life total," not pure decoration.

Given the CSS complexity (multi-layer gradient border + `::before` sheen overlay + keyframes), this lives as a new named class in `globals.css` (matching how `stone-card`/`cord-line`/`crack-divider` are already implemented there) rather than as inline Tailwind arbitrary values — consistent with existing codebase convention for decorative treatments.

## 3. Ignition flourish — one-time transition on activation

The addition from the follow-up round: when Rage transitions **inactive → active** (not on every render while already active, not on deactivation, not on initial mount if rage happens to already be active from a page reload mid-rage), the flame toggle plays a distinct ~400ms burst — brief scale-up + brighter flash on the flame itself, plus a denser/faster burst of embers — before settling into the steady Ember Wisp loop from §2.

Implementation: this is a one-shot CSS animation (`animation-iteration-count: 1`), not a continuously-toggled state that needs cleanup. Detecting the false→true transition uses this codebase's established pattern for "do something once when a prop changes" (see `CollapsibleSection`'s `forceOpenKey`, and the retired `ragePulseKey`/`healerKitPulseKey` pattern from `CombatTab.tsx`): compare `active` against a `prevActive` state value in the render body and call `setState` directly there — never inside a `useEffect`, per this project's `react-hooks/set-state-in-effect` convention. On the false→true edge, increment a local `igniteKey` counter; the ignition-burst markup gets `key={igniteKey}`, so React remounts it and the one-shot animation replays naturally, with no `setTimeout`/cleanup needed anywhere.

The burst embers must be a **separate set of particle elements** from the steady-state Ember Wisp particles in §2, not the same 3 spans repurposed — running a one-shot burst keyframe and the continuous loop keyframe on the same elements at the same time would have both animations fighting over the same `transform`/`opacity` properties. The steady 3 embers keep looping uninterrupted the whole time Rage is active; the burst renders its own handful of particles keyed to `igniteKey`, plays once, and (since nothing re-renders them after their animation ends) simply sits inert until the next remount replaces them — no explicit cleanup needed.

No haptic/vibration feedback — confirmed out of scope per the iOS limitation above.

## Out of scope

- Vibration API (per above).
- A "dying ember" fade-out on deactivation — flagged as a good future idea, but a real exit-transition (vs. a one-shot mount-triggered animation) is a bigger lift than this round's scope.
- Everything below the vitals card (quick actions, conditions, exhaustion, section rows) — unrelated to this request.
- The other 3 remaining tabs (Inventario, Notas, Enciclopedia, Ajustes) and the 4th theme direction — still deferred from earlier rounds.

## Verification

`npx tsc --noEmit && npm run build && npm run lint && npm test` must pass. Manually verify in the dev server across `piedra-viva`, `pergamino`, `furia-de-sangre`:

- Activate Rage: confirm the description text shows the **correct level-scaled** damage bonus (test at more than one character level, not just level 1 where the bug would be invisible since `2` happens to match the buggy hardcoded value).
- Confirm the ignition flourish plays exactly once on activation, does not replay on unrelated re-renders while still active (e.g. tapping a rage slot pip while raging), and does not play on deactivation.
- Reload the page while Rage is already active (or simulate via localStorage) — confirm the ignition flourish does **not** fire on mount, only on an actual false→true transition.
- Confirm the three steady-state effects (embers, border sheen, heartbeat) all run simultaneously without visually fighting each other, and that deactivating Rage cleanly removes all of them (including the border/glow treatment reverting to the normal non-active `stone-card` look).
- Confirm the old static `!border-cord/50 shadow-[...]` treatment is gone, not layered underneath the new one.
