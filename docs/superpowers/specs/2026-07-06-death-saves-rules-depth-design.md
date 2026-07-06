# Death Saves Rules Depth — Design Spec

## Context

`DeathSaves.tsx` (rendered in `CombatTab.tsx` when `isDying` — derived as `combat.currentHp === 0`) is currently a bare 3-dot success/failure toggle grid with zero rules logic. Per the XPHB source of truth (`5etools-src/data/book/book-xphb.json`):

> "When you roll a 1 on the d20 for a Death Saving Throw, you suffer two failures. If you roll a 20 on the d20, you regain 1 Hit Point."
>
> "If you take any damage while you have 0 Hit Points, you suffer a Death Saving Throw failure. If the damage is from a Critical Hit, you suffer two failures instead. If the damage equals or exceeds your Hit Point maximum, you die."
>
> "A Stable creature doesn't make Death Saving Throws even though it has 0 Hit Points, but it still has the Unconscious condition. If the creature takes damage, it stops being Stable and starts making Death Saving Throws again. A Stable creature that isn't healed regains 1 Hit Point after 1d4 hours."

None of this is represented today — a player has to remember all of it and manually tap dots / edit HP. The player rolls physical dice and only wants the app to record outcomes, not roll anything itself — consistent with the earlier Rage reminder work, this stays in the same "passive/manual, not automated" register, but death saves have real state transitions (unlike Rage's pure reminder), so a few of these become one-tap buttons rather than plain text.

## Design

All changes are in `src/components/combat/DeathSaves.tsx` (props/behavior) and its parent `CombatTab.tsx` (wiring). No new `Character` fields, no migration — `combat.deathSaves.{successes,failures}` and `combat.currentHp` already exist and are sufficient.

### 1. Nat 1 / Nat 20 buttons

Two buttons alongside the existing dot grid, always visible while `isDying`:

- **"Rodé 1"** → `onChange(successes, Math.min(3, failures + 2))`
- **"Rodé 20"** → resets both counters to 0 **and** calls `updateCombat({ currentHp: 1, deathSaves: { successes: 0, failures: 0 } })`. Setting `currentHp` to 1 flips `isDying` to `false` automatically (it's derived from `currentHp === 0`), so the parent naturally swaps back to the normal HP/AC/Init row with no extra state to manage.

`DeathSaves` needs a new prop to reach `updateCombat` (or take an `onStabilizeWithHp` callback) since today it only receives `onChange(successes, failures)`. Simplest: pass a second callback prop, e.g. `onRegainConsciousness: () => void`, that the parent wires to `updateCombat({ currentHp: 1, deathSaves: { successes: 0, failures: 0 } })`.

### 2. Damage-while-at-0-HP buttons

Two more buttons, same row or a second row:

- **"Recibí daño"** → `onChange(successes, Math.min(3, failures + 1))`
- **"Golpe crítico"** → `onChange(successes, Math.min(3, failures + 2))`

These reuse the existing `onChange` prop — no new plumbing needed, they're just alternate ways of incrementing failures beyond tapping a dot directly.

The instant-death rule ("damage ≥ HP max = dead") can't become a button — the widget has no field for incoming damage amount, and adding one would be new state/UI disproportionate to the value (this is a rare edge case the player can already resolve by knowing their own max HP and just marking 3 failures directly, or noting it out-of-band). It becomes reminder text instead (see §3).

### 3. Stable / dead label + reminder text

Above the dot grid, a small status label:
- 3 successes and not yet healed → **"Estable"** (green/success-colored text)
- 3 failures → **"Muerto"** (red/danger-colored text)
- Otherwise → no label (current blank state)

Below the dot grid, one line of static reminder text (matching the Rage hint's styling precedent — `text-muted/60 text-[0.6rem]`):

> "Si el daño recibido iguala o supera tu HP máximo, mueres al instante. Estable: no hace más salvaciones, sigue Unconscious, recupera 1 HP tras 1d4 horas si no es curado antes."

## Testing

No new pure-logic functions worth unit testing in isolation — this is UI wiring (button click → prop call) and a label derived from existing numbers via simple comparison. Verify visually: dev server, drop `currentHp` to 0 to enter the dying view, exercise all four buttons and confirm the success/failure counts and the stable/dead label update correctly, then confirm "Rodé 20" returns to the normal combat view with 1 HP. Standard `npx tsc --noEmit && npm run build && npm run lint && npm test` gate applies.
