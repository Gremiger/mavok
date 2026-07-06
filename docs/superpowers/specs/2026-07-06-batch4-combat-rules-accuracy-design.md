# Batch 4: Combat Rules Accuracy — Design

Part of the same brainstorm of app improvements as Batches 1-3. This spec covers Batch 4: gating Weapon Mastery swapping to once per long rest, and implementing Exhaustion as a real numeric mechanic instead of flavor text.

## Existing state (discovered during design, not previously known)

**Weapon Mastery**: `WeaponMasteryModal.tsx` ("Practicar con armas", opened from `SettingsTab.tsx`) is fully implemented — it enforces the weapon-count limit from `BARBARIAN_LEVELS[level].weaponMasteries`, lets the user pick which active mastery to drop and which inactive weapon to activate instead, and recomputes `mastery`/`masteryEffect`/`masterySaveDC` on the swapped attacks correctly. The "1 per descanso largo" text next to the button (`SettingsTab.tsx:262`) is purely a label — nothing gates the swap to actually happen only once per long rest. That's the only gap.

**Exhaustion**: `conditions.ts` has the correct 2024 reference text, but `CombatState.conditions` is a flat `string[]` with no numeric level, and nothing applies any mechanical effect. Separately, the app already centralizes every d20 test roll it supports: `SheetTab.tsx`'s `rollAbility`/`rollSave`/`rollSkill`/`rollSkillStr`, and `attackRoll.ts`'s `rollAttackHit` (shared by `AttackRow` and the Quick Actions FAB). `combat.speed` exists in the data model but isn't displayed anywhere in the UI today. Initiative (`combat.initiative`) is a stored flat number with no "roll initiative" interaction anywhere, so — like Speed before this batch — it has no roll trigger to attach a penalty to; this batch does not add one.

**Important subtlety**: `saveTotal(character, ability)` and `skillTotal(character, key)` (`src/lib/utils.ts`) are used both for actual d20-test rolls/displays *and* for passive scores (`SheetTab.tsx:62-64`: `passivePerception = 10 + skillTotal(character, 'perception')`, similarly for insight/investigation). Passive scores are explicitly not d20 tests under 2024 rules and must not take the exhaustion penalty. This means the penalty **cannot** be baked into `saveTotal`/`skillTotal`/`abilityModifier` themselves — it must be applied as a separate additive adjustment only at the genuine roll-and-display call sites, never at passive-score call sites.

## Data model change

One migration bump (v7 → v8, `CURRENT_DATA_VERSION` in `src/lib/types.ts`):

```ts
interface Character {
  // ...existing fields
  weaponMasteryUsedThisRest: boolean; // new
}

interface CombatState {
  // ...existing fields
  exhaustionLevel: number; // new, 0-6
}
```

Migration backfill: `weaponMasteryUsedThisRest: false`, `exhaustionLevel: 0`.

## Feature: Weapon Mastery gating

- `applyLongRest()` in `SettingsTab.tsx` (currently resets HP/hit dice/death saves/conditions via `updateCombat`, and Rage/Stone's Endurance via a separate `update()` call) gains two additions: `exhaustionLevel: Math.max(0, character!.combat.exhaustionLevel - 1)` added to the existing `updateCombat({...})` call, and `weaponMasteryUsedThisRest: false` added to the existing top-level `update((c) => ({...}))` call.
- `WeaponMasteryModal.tsx`'s `performSwap()` sets `weaponMasteryUsedThisRest: true` (via `update()`, since this is a top-level Character field, not nested under `attacks`/`resources`) right before its existing `toast.success(...)` call.
- **Not blocked, warned instead**: the "Practicar con armas" button in `SettingsTab.tsx` stays enabled regardless of `weaponMasteryUsedThisRest` — swapping is never prevented. When `character.weaponMasteryUsedThisRest` is already `true`, `SettingsTab.tsx` shows an inline warning line under the button ("⚠️ Ya practicaste este descanso largo — esto no sigue las reglas") instead of the current plain hint text, and `performSwap()`'s success toast reflects the same warning when it fires as an extra swap (`"⚠️ Mastery cambiada fuera de las reglas: ${deactivateName} → ${activateName}"` instead of the normal `"Mastery cambiada: ${deactivateName} → ${activateName}"`).

## Feature: Exhaustion tracking

**New shared helper** `src/lib/exhaustion.ts`:

```ts
export function exhaustionPenalty(level: number): number {
  return -2 * level;
}
```

**Applied at every genuine d20-test roll-and-display pair** (not at `saveTotal`/`skillTotal`/`abilityModifier` themselves, per the subtlety above):

- `SheetTab.tsx`: `rollAbility` (roll) and its displayed modifier (`formatModifier(abilityModifier(attributes[ab]))`, `SheetTab.tsx:~187`); `rollSave` (roll) and its displayed modifier (`formatModifier(saveTotal(character, ab))`, `SheetTab.tsx:~232`); `rollSkill` (roll) and its displayed modifier (`formatModifier(skillTotal(character!, key))`, `SheetTab.tsx:~120`); `rollSkillStr` (roll only — this variant has no separate displayed number today, it reuses the primary skill row's display, which is out of scope to change here).
- `src/lib/attackRoll.ts`'s `rollAttackHit` (roll — gains an `exhaustionLevel` field in its `opts`) and `AttackRow.tsx`'s displayed attack-bonus badge.
- The Quick Actions FAB's `attackRoll` action (`QuickActionsFab.tsx`) already calls `rollAttackHit`; it gains the same `exhaustionLevel` argument, no display change needed there (it only shows a toast with the roll result, no pre-roll badge).

**Not touched**: `saveTotal`/`skillTotal`/`abilityModifier` stay exactly as they are (still used for AC, attack-bonus derivation in `recalculate.ts`, mastery-DC computation in `WeaponMasteryModal.tsx`, and passive scores — none of which should be exhaustion-penalized).

**UI — new stepper, replacing the generic condition entry**: Combat tab's conditions area gets a `+`/`−` stepper (clamped 0-6) showing "Exhaustion: N/6", separate from the generic on/off condition tags introduced in Batch 1. Tapping the label expands the rules description inline (reusing `CONDITIONS.find(c => c.name === "Exhaustion")?.description` and the same tap-to-expand interaction Batch 1 established for conditions and Batch 3 reused for level-up features). "Exhaustion" is removed from `CONDITION_GROUPS` in `src/data/conditions.ts` (my own hand-added grouping export, not part of the generated 5etools data — `CONDITIONS` itself is untouched) so it no longer appears in the generic add-picker as a disconnected duplicate. This means `CONDITION_GROUPS` now intentionally covers 14 of the 15 `CONDITIONS` entries — a deliberate exclusion, not a gap to "fix" later.

**Long rest**: covered above (`exhaustionLevel` reduced by 1, floored at 0, as part of the same `applyLongRest()` change already described for Weapon Mastery).

**Level 6**: incrementing the stepper to 6 shows a toast ("Nivel de Exhaustion 6 — tu personaje muere"). No automatic state change — consistent with the app never automating character death elsewhere (death saves already require manual tracking).

## Feature: Speed display

A new "Vel" `StatBadge` added to Combat tab's top stat row (alongside HP/Temp/AC/Init/Insp), mirroring the existing AC badge's temp-modifier display pattern exactly:

```tsx
const speedReduction = 5 * combat.exhaustionLevel;
const effectiveSpeed = Math.max(0, combat.speed - speedReduction);
// ...
<StatBadge
  label="Vel"
  value={speedReduction > 0 ? `${effectiveSpeed} (-${speedReduction})` : combat.speed}
  highlight={speedReduction > 0}
/>
```

No `onClick` — like the Initiative badge, this is read-only (there's no existing edit flow for base speed, and adding one is out of scope for this batch).

## Out of scope

- Any other batch's work (Technical hardening)
- A "roll initiative" interaction (doesn't exist today; not added by this batch, so no exhaustion penalty attaches to initiative)
- Editing base Speed (no edit flow exists or is added; only display)
- Fixing the pre-existing quirk where `rollSkillStr`'s alternate (STR-based) total has no dedicated displayed number
