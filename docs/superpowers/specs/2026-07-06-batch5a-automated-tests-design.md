# Batch 5a: Automated Data Model Tests — Design

Part of the same brainstorm of app improvements as Batches 1-4. Batch 5 ("Technical hardening") covers two independent subsystems — automated tests and a PWA offline-caching audit — decomposed into separate specs per the brainstorming process. This spec covers 5a: introducing a test runner and covering the highest-risk pure-logic modules. 5b (PWA cache-key fix) is a separate spec.

## Motivation

`CLAUDE.md` states "There are no tests" and flags `migrations.ts` as "the highest-risk-of-silent-breakage code" in the project — a chain of version-step functions (now v2→v8) that runs on real user data in LocalStorage with no safety net beyond a pre-migration backup. A single bad edit to a guard condition (e.g. changing `=== undefined` to something that re-triggers on existing data) could silently corrupt a user's character sheet. `recalculate.ts` (derived combat stats) and the roll/penalty math extracted across Batches 1 and 4 (`attackRoll.ts`, `hitDice.ts`, `exhaustion.ts`) are also pure, currently-untested, and worth covering while they're fresh.

## Test runner setup

- Add `vitest` and `jsdom` as devDependencies. `jsdom` is needed specifically because `migrations.ts`'s auto-backup step calls `localStorage.setItem`, and `localStorage` isn't a Node global.
- New `vitest.config.ts` at the repo root:
  ```ts
  import { defineConfig } from "vitest/config";

  export default defineConfig({
    test: {
      environment: "jsdom",
    },
  });
  ```
  No path-alias resolution is configured, because none of the five target modules import via the `@/` alias — `migrations.ts`, `recalculate.ts`, `attackRoll.ts`, `hitDice.ts`, and `exhaustion.ts` all import each other exclusively via relative paths (`./types`, `./dice`, `./exhaustion`, etc.). If a future batch adds tests for a file that does use `@/`, the config gains a `resolve.alias` entry then — not preemptively now.
- New `package.json` script: `"test": "vitest run"` — a single non-watch run, matching how `lint`/`build` are invoked in the verify recipe (not interactive dev usage; `vitest` with no args remains available locally for watch mode if wanted, just not the scripted entry point).
- `CLAUDE.md`'s verify command (currently at line 28: `` Verify changes by running `npx tsc --noEmit && npm run build && npm run lint`. ``) becomes `` npx tsc --noEmit && npm run build && npm run lint && npm test ``, and the leading "There are no tests." sentence is replaced with a short note: tests are colocated as `*.test.ts` next to their source file, run via `npm test`.

## Test files

All colocated next to source, one file per module:

- **`src/lib/migrations.test.ts`** — exercises the public `migrateCharacterData(raw: string): { data: string; migrated: boolean }` entry point (the per-version `MIGRATIONS` map is private to the module, not exported, so tests are black-box through this function):
  - A minimal v1-shaped object (no `_version`, or `_version: 1`) migrated all the way to `CURRENT_DATA_VERSION` ends with every backfilled field present and correct: `resources.rpiRages.slots` array sized to `total`, `resources.stoneEndurance`, `meta.portraitDataUrl: null`, `levelUpHistory: []`, every inventory item's `value` defaulted, `combat.recklessActive: false`, `quickActions` defaulted, `combat.exhaustionLevel: 0`, `weaponMasteryUsedThisRest: false`.
  - Data already at `CURRENT_DATA_VERSION` returns `{ migrated: false }` with `data` identical to the input string.
  - Data starting at an intermediate version (e.g. `_version: 5`) only applies the remaining steps (6, 7, 8) — verified by confirming a v3-specific backfill (e.g. the `Stone's Endurance` feature push) does *not* re-run/duplicate when starting from v5.
  - Malformed JSON input (`"not json"`) returns `{ data: raw, migrated: false }` without throwing.
  - **The regression case that matters most**: a field the user already has set before reaching the version that would backfill it (e.g. `combat.recklessActive: true` set at v5, then migrated through v6-v8) is preserved, not overwritten — proving the `=== undefined` guards actually protect existing data, which is the exact failure mode this test suite exists to catch.

- **`src/lib/recalculate.test.ts`** — `recalculateDerived(character: Character): Character`:
  - AC = `10 + dexMod + conMod` for given attributes.
  - Attack bonus: melee STR weapon → `strMod + pb`; Finesse weapon → `max(strMod, dexMod) + pb`; ranged (non-thrown) → `dexMod + pb`; thrown → `strMod + pb`.
  - Damage string recomputed as `${baseDice}+${atkMod}` (sign-aware).
  - `masterySaveDC`: `8 + atkMod + pb` when `attack.mastery` is set, `null` otherwise.
  - `passivePerception`: `10 + wisMod + (pb if perception proficient else 0)`.
  - Calling `recalculateDerived` does not mutate the input `Character` object (asserts the input reference's nested fields are unchanged after the call) — locks in the `structuredClone` contract.

- **`src/lib/attackRoll.test.ts`**:
  - `isStrBasedAttack`: `true` unless the attack has the `"Finesse"` property.
  - `computeRageBonus`: returns `rageDamage` when `rageActive && isStrBasedAttack`, else `0`.
  - `rollAttackHit`: with `recklessActive: true` on a STR-based attack, the returned `DiceRoll.rolls` has length 2 (advantage); otherwise length 1. In both cases, `DiceRoll.modifier` equals `attack.attackBonus + exhaustionPenalty(exhaustionLevel)` exactly (this field is deterministic even though `rolls` are random).
  - `rollAttackDamage`: with a rage bonus active, the resulting `DiceRoll.modifier` reflects the attack's base damage modifier plus `rageDamage`, computed via the same sign-aware string-splicing `rollAttackDamage` already does internally — asserted against a hand-computed expected value for a fixed input attack.

- **`src/lib/hitDice.test.ts`** — `spendHitDie(combat: CombatState, conMod: number)`:
  - Returns `null` when `combat.hitDice.remaining <= 0`.
  - Otherwise: `result.combat.hitDice.remaining` is the input minus 1, `result.combat.hitDice.total` is unchanged, and `result.combat.currentHp` never exceeds `combat.maxHp` regardless of the (random) roll — tested by setting `currentHp` equal to `maxHp` already, where any healing roll must clamp to `maxHp` deterministically.

- **`src/lib/exhaustion.test.ts`** — `exhaustionPenalty(0) === 0`, `exhaustionPenalty(3) === -6`, `exhaustionPenalty(6) === -12`.

## Out of scope

- The PWA cache-key bug (separate spec, 5b)
- UI/component tests (React Testing Library, etc.) — this batch covers pure data/logic modules only, per the original "automated data model tests" brainstorm item
- Testing `getBackups`/`restoreBackup` (`migrations.ts`) — lower-risk utility functions, not part of the migration-chain risk this batch targets
- Any other batch's work
