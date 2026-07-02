# Mavok Round 5 Improvements — Design Spec
Date: 2026-07-02

## Overview

Six improvements, sourced from cross-referencing the full XPHB Barbarian/Goliath ruleset (`../dnd/5etools-src`) against what's actually implemented as interactive mechanics in the app, versus what only exists as static feature-list text. Scope is deliberately limited to near-term mechanics (levels 1-5, where Mavok — currently level 1 — will be soon) plus a feats browser; higher-level mechanics (Brutal Strike at 9, Relentless Rage at 11, Persistent Rage at 15, Indomitable Might at 18, Primal Champion at 20) are explicitly deferred to a future round.

No data model changes in this round — everything here is either pure UI/logic on existing fields, or mutates existing `Attack`/`skills` fields in already-established ways (matching Round 4's custom-attack-management precedent).

---

## Section 1 — Advantage-roll infrastructure (shared foundation for Sections 2 and 3)

**Files:** `src/lib/dice.ts`, `src/components/ui/DiceResult.tsx`

- New `rollD20WithAdvantage(modifier: number): DiceRoll` in `dice.ts`: rolls two d20s independently, `total = Math.max(d1, d2) + modifier`, and stores **both** dice in `rolls: [d1, d2]` (not just the winner) so the UI can show "rolled 14 and 8, took 14" — matches the existing `DiceRoll.rolls: number[]` shape, no type change needed.
- **Crit/fumble detection must NOT be symmetric between the two dice** — this is a real correctness trap, not a stylistic choice. With advantage you keep the *higher* die:
  - **Crit** (natural 20): correct as `rolls.some(r => r === 20)` — since 20 is the maximum possible value, if *either* die shows 20, that die is necessarily the one kept (or both are 20). `some` is correct here.
  - **Fumble** (natural 1): must be `rolls.every(r => r === 1)`, **not** `some`. Rolling `[1, 15]` with advantage means the kept result is 15 — not a fumble. Only a fumble if *both* dice are 1, since the higher of two dice can only be 1 if neither die beat it.
  - `DiceResult.tsx`'s existing `isCrit`/`isFumble` (already gated on `roll.expression.startsWith("1d20")` per round 3's fix) change to:
    ```typescript
    const isCrit = isD20 && roll.rolls.some((r) => r === 20);
    const isFumble = isD20 && roll.rolls.length > 0 && roll.rolls.every((r) => r === 1);
    ```
    This is backward-compatible with existing single-roll (`rolls.length === 1`) usage: for a single die, `some` and `every` are equivalent, so normal (non-advantage) rolls behave exactly as before.

## Section 2 — Reckless Attack toggle (level 2)

**File:** `src/components/tabs/CombatTab.tsx`

- A manual per-turn toggle (like Rage's toggle) in the Acciones adicionales section — the app has no turn-order/turn-tracking concept anywhere, so this is self-managed by the player, consistent with how Rage itself is already self-managed (no auto-expiry). A small note: "Atacantes contra ti tienen ventaja hasta tu próximo turno."
- Only shown once `character.features.some(f => f.name === "Reckless Attack")` (granted at level 2 via the existing level-up flow, following the same feature-presence-check pattern already used for the "Dotes" section).
- `AttackRow.tsx` gains a new `recklessActive: boolean` prop, passed down from `CombatTab.tsx`'s own toggle state — the same wiring pattern already used for `rageActive`/`rageDamage`. When `recklessActive && isStrBased` (the row's existing `isStrBased` computation: `!attack.properties.includes("Finesse")`), the "Hit" button calls `rollD20WithAdvantage(attack.attackBonus)` instead of `rollD20(attack.attackBonus)`. **Reuse only `isStrBased`, not the additional `!attack.range.includes("/")` (ranged/thrown) exclusion that `rageBonus` already applies** — these are different rules with different scope: Reckless Attack's XPHB text grants advantage on any Strength-based attack roll, with no melee-only restriction, unlike Rage's damage bonus. Do not copy the range exclusion.
  - Side note, not in scope for this round: the existing `rageBonus` computation's range exclusion is itself worth double-checking against XPHB's actual Rage damage-bonus text in a future round — it's not obviously correct either, but that's a separate, pre-existing question this round doesn't touch.

## Section 3 — Danger Sense indicator (level 2)

**File:** `src/components/tabs/SheetTab.tsx`

- Passive, no toggle. `rollSave("dex")` checks `character.features.some(f => f.name === "Danger Sense")`; if present, calls `rollD20WithAdvantage(total)` instead of `rollD20(total)` for the DEX save specifically (all other saves unaffected).
- A small "⚡" badge next to the DEX save row when the feature is present, indicating advantage is automatic.

## Section 4 — Primal Knowledge (level 3)

**Files:** `src/components/levelup/LevelUpFlow.tsx`, `src/components/tabs/SheetTab.tsx`

- **`"Primal Knowledge"` already exists in `BARBARIAN_FEATURES` at level 3** (`barbarian-progression.ts:197-201`) — `applyAll()`'s existing `newFeatures`/dedup-by-name logic already auto-adds this feature's description text the moment Mavok reaches level 3, with no changes needed. This section's new step is **only** responsible for the skill-choice mechanic the feature text describes ("gain proficiency in another skill of your choice") — it does not create or duplicate the feature entry itself.
- **Extra skill choice**: a new step in the level-up wizard when reaching level 3, parallel to the existing subclass-choice step (`needsSubclass = newLevel === SUBCLASS_LEVEL && !character.meta.subclass`) — gate this new step the same way: `needsPrimalKnowledge = newLevel === 3 && !character.features.some(f => f.name === "Primal Knowledge")`. Since the feature is always added exactly at level 3 regardless of path, checking its presence is equivalent to "has this character already passed through level 3," so the gate correctly fires exactly once and never re-prompts on a later dry-run or re-entry. Lets the player pick one skill from the Barbarian skill list to gain proficiency in; on confirm, sets `skills[chosenSkill].proficient = true` — nothing else, since the feature entry is already handled automatically as noted above.
  - **Known, accepted limitation** (consistent with existing behavior, not a new gap): like ASI-granted ability score increases (which the existing "Bajar de nivel" handler already does not revert), a Primal-Knowledge-granted skill proficiency also won't be reverted on level-down. Skill proficiencies have no "granted by feature X" tag, so there's nothing to hook a revert into — matches the tool's existing "quick undo for the most recent mistake" scope, not a full state-machine reversal.
- **STR-substitution while raging is a per-roll player CHOICE, not an automatic override** — this is a correction from an earlier draft of this design that had it silently substituting. XPHB's actual wording is "you *can* make it as a Strength check," meaning the player decides each time, not that the ability always changes. Design: when `resources.rpiRages.active` is true (`SheetTab.tsx` needs to destructure `resources` from `character`, which it currently doesn't) **and** `character.features.some(f => f.name === "Primal Knowledge")` — both conditions required — the five affected skill rows (Acrobatics, Intimidation, Perception, Stealth, Survival) show a small additional button/icon next to the normal roll button, offering "Tirar con FUE" — a separate roll using `attributes.str`'s modifier + proficiency (if proficient in that skill) instead of the skill's normal ability. The normal roll button is untouched and still uses the skill's actual ability.

## Section 5 — Weapon Mastery swap on Long Rest

**Files:** `src/hooks/useCharacter.ts`, `src/components/tabs/SettingsTab.tsx`, new `src/lib/masteryDC.ts`

- **Verified Mavok's current data is already XPHB-correct, not a bug**: checked `mavok-default.ts` directly — exactly 2 weapon types have active mastery (Maul: Topple, Handaxe: Vex, applied consistently to both the melee and thrown Handaxe entries since they're the same weapon type), matching `weaponMasteries: 2` at level 1 (`barbarian-progression.ts`). Javelin and Sickle correctly show `mastery: null`. This section adds only the missing swap UI — XPHB: "Whenever you finish a Long Rest, you can practice weapon drills and change one of those weapon choices."
- New `updateAttackMastery` isn't a new hook function — reuses the existing `updateAttack(attackId, patch)` from Round 4's Task 2, called once per attack sharing the affected weapon name.
- **XPHB only allows swapping ONE weapon mastery choice per Long Rest** ("you can practice weapon drills and change one of those weapon choices"), not freely re-picking all known types at once — the UI must reflect this exactly, not be more generous than the real rule. New "Practicar con armas" button in Settings (manual action, matching how other rest-adjacent mechanics in this app — Rage, Stone's Endurance — are already just buttons rather than automated triggers on an actual rest timer) opens a two-step picker: (1) choose one currently-*active*-mastery weapon type to give up, from the distinct weapon *names* present across `character.attacks` that currently have `mastery !== null` (deduplicated — Handaxe melee/thrown count as one entry since they're the same weapon type); (2) choose one currently-*inactive* weapon type (has an entry in `WEAPONS` with a non-null `mastery` but the character's matching `Attack` entries currently show `mastery: null`) to activate in its place. The total count of active-mastery weapon types stays exactly at `weaponMasteries` (looked up from `BARBARIAN_LEVELS` by current level, already tracked) before and after every swap — this is a 1-for-1 exchange, not a free re-pick.
- **Activating** a weapon type: look up its inherent mastery from `WEAPONS` (`src/data/weapons.ts`, already has `mastery: string | null` per weapon — confirmed e.g. Javelin→"Slow", Sickle→"Nick"), look up the mastery's description from `MASTERY_PROPERTIES` (`src/data/mastery.ts`), and call `updateAttack` on every `Attack` entry matching that weapon name with `{ mastery, masteryEffect: description }`.
- **Deactivating**: `updateAttack(id, { mastery: null, masteryEffect: null, masterySaveDC: null })`.
- **`masterySaveDC` computation — not always STR, and not every mastery needs one.** New small helper file `src/lib/masteryDC.ts`:
  ```typescript
  const DC_MASTERIES = new Set(["Topple", "Push"]);

  export function computeMasterySaveDC(
    masteryName: string,
    weaponProperties: string[],
    proficiencyBonus: number,
    attributes: Record<AbilityScore, number>
  ): number | null {
    if (!DC_MASTERIES.has(masteryName)) return null;
    const isFinesse = weaponProperties.includes("Finesse");
    const abilityMod = isFinesse
      ? Math.max(abilityModifier(attributes.str), abilityModifier(attributes.dex))
      : abilityModifier(attributes.str);
    return 8 + proficiencyBonus + abilityMod;
  }
  ```
  Only `Topple` (CON save) and `Push` (STR save) require a DC among all XPHB mastery properties — the rest (`Vex`, `Nick`, `Slow`, `Cleave`, `Graze`, `Sap`) don't. None of Mavok's current 4 weapon types use Push, but this must be correct generally, not hardcoded for Topple only, since the player can add new weapons via Round 4's custom-attack-management feature and might add a Push-mastery weapon later. The DC formula itself (`8 + proficiency + STR-or-Finesse-choice-of-DEX`) is the standard XPHB weapon mastery DC formula, not specific to any one property.

## Section 6 — Feats reference browser

**Files:** new `src/components/sheet/FeatsBrowserModal.tsx`, modify `src/components/tabs/SheetTab.tsx`, new `src/lib/feats.ts`

- Entry point: a small "Ver todas las dotes disponibles" compact card at the bottom of the existing "Dotes" section (added in round 3), matching the visual weight of the "Acciones estándar" compact-card pattern already established in `CombatTab.tsx` — tap opens `FeatsBrowserModal`.
- Lets the player browse **all** feats in `FEATS` (`src/data/feats.ts`), not just ones Mavok has — the explicit purpose is planning ahead before reaching an ASI level (4/8/12/16/19), so locked/ineligible feats must still be visible, just clearly marked, not filtered out.
- **Extract the shared "meets ability prereqs" check** from `LevelUpFlow.tsx`'s existing `getEligibleFeats()` (`LevelUpFlow.tsx:280-295`) into new `src/lib/feats.ts`:
  ```typescript
  export function meetsAbilityPrereqs(
    feat: FeatData,
    attributes: Record<AbilityScore, number>
  ): boolean {
    if (!feat.abilityPrereqs) return true;
    return feat.abilityPrereqs.some((prereq) =>
      Object.entries(prereq).every(
        ([ab, min]) => (attributes[ab as AbilityScore] || 0) >= min
      )
    );
  }
  ```
  `LevelUpFlow.tsx`'s `getEligibleFeats()` is updated to call this shared function instead of inlining the check, rather than maintaining two copies of the same logic. Its other filters (category, `levelRequired > newLevel`, `requiresSpellcasting`) stay local to `LevelUpFlow` since they're specific to "is this choosable right now during level-up," not shared with the browser.
- **Two default-on, removable filters, not hard exclusions.** `LevelUpFlow.tsx`'s existing `getEligibleFeats()` (`LevelUpFlow.tsx:280-295`) treats `category === "Fighting Style"` and `requiresSpellcasting` as hard `return false` exclusions since neither is something Mavok can ever take for himself (Fighting Style feats aren't choosable via the general ASI/feat slot for a Barbarian at all; Mavok has no path to spellcasting anywhere in this app). But the browser has a second use case beyond planning Mavok's own build — looking up a feat a friend's character has (a Fighter's Fighting Style pick, a caster's spellcasting-gated feat) — so both categories default to hidden but must be toggle-able back on, rather than permanently excluded like they are in `getEligibleFeats`. Two toggle chips above the category filters: "Sin lanzamiento de conjuros" (default ON — hides `requiresSpellcasting` feats) and "Sin Fighting Style" (default ON — hides `category === "Fighting Style"` feats). Turning either off reveals that category's feats in the list — for these two categories specifically, "Disponible ahora" never applies to Mavok even when shown, so show a fixed "No aplica a tu build" label instead of computing a misleading eligibility status.
- For all other feats, the browser computes a **per-feat status label**, not a binary include/exclude filter (unlike `getEligibleFeats`, which excludes ineligible feats entirely) — since the whole point is showing what's still locked:
  - "Disponible ahora" — `meetsAbilityPrereqs(feat, character.attributes)` is true AND (`feat.levelRequired == null` OR `character.meta.level >= feat.levelRequired`).
  - "Requiere nivel N" — level not yet met (still show ability-prereq status too, e.g. "Requiere nivel 4 · Cumples CAR 13+").
  - "Requiere [ability] N+" — ability prereq not met, formatted from `feat.abilityPrereqs` (e.g. "Requiere CAR 13+", or "Requiere FUE 13+ o DES 13+" when multiple alternative prereq sets exist).
- Filter chips by category (General / Origin / Epic Boon / Fighting Style — the last only meaningful once its toggle is off), matching the filter-chip pattern already used in `QuestList.tsx` (status filter) and `InventoryTab.tsx` (category filter).
- Read-only — no character mutation, matches `StandardActionsModal`'s existing reference-modal pattern (opened from a compact card, browsable/filterable, no state changes to character data).

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/dice.ts` | Add `rollD20WithAdvantage` |
| `src/components/ui/DiceResult.tsx` | Fix crit/fumble detection to handle advantage rolls correctly (asymmetric `some`/`every`) |
| `src/components/tabs/CombatTab.tsx` | Reckless Attack toggle; Weapon Mastery swap button wiring |
| `src/components/combat/AttackRow.tsx` | Use advantage roll for Hit when Reckless Attack is active and attack is STR-based |
| `src/components/tabs/SheetTab.tsx` | Danger Sense advantage on DEX save; Primal Knowledge STR-substitution buttons; Feats browser entry point |
| `src/components/levelup/LevelUpFlow.tsx` | Primal Knowledge skill-choice step; `getEligibleFeats` refactored to use shared `meetsAbilityPrereqs` |
| `src/lib/feats.ts` | New file — shared `meetsAbilityPrereqs` |
| `src/components/sheet/FeatsBrowserModal.tsx` | New file — feats reference browser |
| `src/lib/masteryDC.ts` | New file — `computeMasterySaveDC` |
| `src/hooks/useCharacter.ts` | No new functions — reuses Round 4's `updateAttack` |

## Explicitly Out of Scope

- Brutal Strike / Improved Brutal Strike (levels 9, 13, 17), Relentless Rage (level 11), Persistent Rage (level 15), Indomitable Might (level 18), Primal Champion (level 20) — deferred to a future round, closer to when Mavok actually reaches these levels
- Alternate Giant Ancestry boons (Cloud's Jaunt, Fire's Burn, Frost's Chill, Hill's Tumble, Storm's Thunder) — not applicable; Mavok already permanently chose Stone's Endurance as his one-time boon at character creation, there's nothing to switch
- Disadvantage-roll support (only advantage is needed for this round's features; the crit/fumble fix is written to not need generalizing to disadvantage, since none of this round's features use it)
- Re-auditing the existing `rageBonus` range exclusion in `AttackRow.tsx` against XPHB's actual Rage damage-bonus text — flagged as a possible separate question, not addressed here
