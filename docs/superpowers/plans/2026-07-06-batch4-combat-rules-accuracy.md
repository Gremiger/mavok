# Batch 4: Combat Rules Accuracy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Weapon Mastery swapping warn (not block) when used more than once per long rest, and implement Exhaustion as a real numeric mechanic (0-6) that penalizes every d20 test the app can roll, reduces displayed Speed, and recovers on long rest.

**Architecture:** One migration bump adds `CombatState.exhaustionLevel` and `Character.weaponMasteryUsedThisRest`. A single pure helper (`exhaustionPenalty(level)`) is applied as an additive adjustment at every genuine d20-test roll-and-display pair (attack rolls, ability checks, saves, skills) — never inside `saveTotal`/`skillTotal`/`abilityModifier` themselves, since those are also used for passive scores and derived stats that must not be exhaustion-penalized. A new stepper UI in Combat tab drives the level; a new Speed badge shows the reduced value; long rest recovers 1 level.

**Tech Stack:** Next.js 15 (static export), React 19, TypeScript, Tailwind, sonner (toast), lucide-react.

## Global Constraints

- No test framework in this repo. Verify every task with `npx tsc --noEmit` + `npm run lint` (catches Rules-of-Hooks violations — the only tool that does per `CLAUDE.md`), plus a concrete manual dev-server check. `npm run build` runs once at the end of the final task as the batch-closing check.
- Spanish UI labels, English D&D terms.
- `src/data/conditions.ts`'s `CONDITIONS` array is generated (do not hand-edit); `CONDITION_GROUPS` in the same file is hand-added presentation data (safe to edit).
- No "Co-authored-by" trailer in commit messages.
- The exhaustion penalty must **never** be applied inside `saveTotal`, `skillTotal`, or `abilityModifier` (`src/lib/utils.ts`) — those feed passive scores (`SheetTab.tsx`'s `passivePerception`/`passiveInsight`/`passiveInvestigation`) and derived stats (AC, mastery DC) that are not d20 tests and must stay unaffected.

---

### Task 1: Data model — schema, migration, defaults

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/migrations.ts`
- Modify: `src/data/mavok-default.ts`

**Interfaces:**
- Produces: `CombatState.exhaustionLevel: number`, `Character.weaponMasteryUsedThisRest: boolean`, `CURRENT_DATA_VERSION = 8`.

- [ ] **Step 1: Bump version, add the two fields**

In `src/lib/types.ts`, change:

```ts
export const CURRENT_DATA_VERSION = 7;
```

to:

```ts
export const CURRENT_DATA_VERSION = 8;
```

Add `exhaustionLevel` to `CombatState` (alongside `recklessActive: boolean;`):

```ts
export interface CombatState {
  maxHp: number;
  currentHp: number;
  tempHp: number;
  armorClass: number;
  initiative: number;
  speed: number;
  passivePerception: number;
  hitDice: { total: number; remaining: number; die: string };
  deathSaves: { successes: number; failures: number };
  conditions: string[];
  recklessActive: boolean;
  exhaustionLevel: number;
}
```

Add `weaponMasteryUsedThisRest` to `Character` (alongside `quickActions: PinnedAction[];`):

```ts
export interface Character {
  _version: number;
  id: string;
  meta: CharacterMeta;
  attributes: Record<AbilityScore, number>;
  combat: CombatState;
  resources: Resources;
  savingThrows: Record<AbilityScore, { proficient: boolean }>;
  skills: Record<string, { attribute: AbilityScore; proficient: boolean }>;
  proficiencies: Proficiencies;
  features: Feature[];
  attacks: Attack[];
  inventory: InventoryItem[];
  currency: Currency;
  notes: Notes;
  levelUpHistory: LevelUpHistoryEntry[];
  quickActions: PinnedAction[];
  weaponMasteryUsedThisRest: boolean;
}
```

- [ ] **Step 2: Add the v8 migration**

In `src/lib/migrations.ts`, add a new entry to `MIGRATIONS` right after the existing `7:` entry (before the closing `};`):

```ts
  8: (data) => {
    const d = data as Record<string, unknown>;
    d._version = 8;

    const combat = d.combat as Record<string, unknown> | undefined;
    if (combat && combat.exhaustionLevel === undefined) {
      combat.exhaustionLevel = 0;
    }

    if (d.weaponMasteryUsedThisRest === undefined) {
      d.weaponMasteryUsedThisRest = false;
    }

    return d;
  },
```

- [ ] **Step 3: Update the default character data**

In `src/data/mavok-default.ts`, add `exhaustionLevel: 0,` to the `combat:` block (alongside `recklessActive: false,`), and add `weaponMasteryUsedThisRest: false,` at the top level of `MAVOK_DEFAULT` (alongside `quickActions: [...]`).

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: 0 errors (some pre-existing `<img>` warnings are fine — unrelated).

- [ ] **Step 5: Manual verification**

Run `npm run dev`, open the app, check LocalStorage (`mavok_character_mavok-1`) for `"_version": 8`, `"combat": {..., "exhaustionLevel": 0}`, and `"weaponMasteryUsedThisRest": false`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/migrations.ts src/data/mavok-default.ts
git commit -m "feat: add exhaustionLevel and weaponMasteryUsedThisRest to schema (v8 migration)"
```

---

### Task 2: Exhaustion penalty helper

**Files:**
- Create: `src/lib/exhaustion.ts`

**Interfaces:**
- Produces: `exhaustionPenalty(level: number): number` — consumed by Tasks 3 and 4.

- [ ] **Step 1: Create the helper**

```ts
export function exhaustionPenalty(level: number): number {
  return -2 * level;
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/exhaustion.ts
git commit -m "feat: add exhaustionPenalty helper"
```

---

### Task 3: Apply exhaustion penalty to attack rolls

**Files:**
- Modify: `src/lib/attackRoll.ts`
- Modify: `src/components/combat/AttackRow.tsx`
- Modify: `src/components/tabs/CombatTab.tsx`
- Modify: `src/components/ui/QuickActionsFab.tsx`

**Interfaces:**
- Consumes: `exhaustionPenalty` (Task 2).
- Produces: `rollAttackHit(attack, opts: { recklessActive: boolean; exhaustionLevel: number })` — the `opts` shape changes; both existing call sites (AttackRow, QuickActionsFab) are updated in this task.

- [ ] **Step 1: Update `rollAttackHit` to accept and apply exhaustion**

In `src/lib/attackRoll.ts`, add the import:

```ts
import { exhaustionPenalty } from "./exhaustion";
```

Replace `rollAttackHit`:

```ts
export function rollAttackHit(
  attack: Attack,
  opts: { recklessActive: boolean; exhaustionLevel: number }
): DiceRoll {
  const bonus = attack.attackBonus + exhaustionPenalty(opts.exhaustionLevel);
  return opts.recklessActive && isStrBasedAttack(attack)
    ? rollD20WithAdvantage(bonus)
    : rollD20(bonus);
}
```

- [ ] **Step 2: Update `AttackRow.tsx` — new prop, adjusted display and roll call**

Add `exhaustionLevel` to the props type and destructure (currently `attack, rageActive, rageDamage, recklessActive, onEdit, onDelete, onMoveUp, onMoveDown`):

```ts
export function AttackRow({
  attack,
  rageActive,
  rageDamage,
  recklessActive,
  exhaustionLevel,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  attack: Attack;
  rageActive: boolean;
  rageDamage: number;
  recklessActive: boolean;
  exhaustionLevel: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
```

Add the import:

```ts
import { formatModifier } from "@/lib/utils";
import { exhaustionPenalty } from "@/lib/exhaustion";
```

Add a computed value right after the existing `const rageBonus = computeRageBonus(...)` line:

```ts
  const effectiveAttackBonus = attack.attackBonus + exhaustionPenalty(exhaustionLevel);
```

Change the displayed bonus (currently `+{attack.attackBonus} · {displayDamage()} ...`) to:

```tsx
            {DamageIcon && (
              <DamageIcon size={11} className="inline-block mb-0.5 mr-1" />
            )}
            {formatModifier(effectiveAttackBonus)} · {displayDamage()} {attack.damageType.slice(0, 4).toLowerCase()}. · {attack.range}
```

Update `handleRollHit`:

```ts
  function handleRollHit() {
    const result = rollAttackHit(attack, { recklessActive, exhaustionLevel });
    setLastRoll({ roll: result, type: "hit" });
  }
```

- [ ] **Step 3: Pass `exhaustionLevel` from `CombatTab.tsx`'s `AttackRow` usage**

In `src/components/tabs/CombatTab.tsx`, add `exhaustionLevel={combat.exhaustionLevel}` to the existing `<AttackRow ... recklessActive={combat.recklessActive} .../>` call:

```tsx
          <AttackRow
            key={a.id}
            attack={a}
            rageActive={rageActive}
            rageDamage={rageDamage}
            recklessActive={combat.recklessActive}
            exhaustionLevel={combat.exhaustionLevel}
            onEdit={() => setAttackModalState(a)}
```

- [ ] **Step 4: Update `QuickActionsFab.tsx`'s `attackRoll` case**

Change the existing call:

```ts
        const roll = rollAttackHit(attack, {
          recklessActive: combat.recklessActive,
        });
```

to:

```ts
        const roll = rollAttackHit(attack, {
          recklessActive: combat.recklessActive,
          exhaustionLevel: combat.exhaustionLevel,
        });
```

- [ ] **Step 5: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: 0 errors.

- [ ] **Step 6: Manual verification**

Run `npm run dev`. In Combat tab, use the (not-yet-built, see Task 5) exhaustion control — for now, verify via LocalStorage: manually edit `combat.exhaustionLevel` to `2` in devtools, reload, and confirm an attack's displayed bonus badge drops by 4 and rolling "Hit" produces a total consistent with that reduced bonus. Also verify a normal attack roll (exhaustion 0) is unchanged from before this task.

- [ ] **Step 7: Commit**

```bash
git add src/lib/attackRoll.ts src/components/combat/AttackRow.tsx src/components/tabs/CombatTab.tsx src/components/ui/QuickActionsFab.tsx
git commit -m "feat: apply exhaustion penalty to attack rolls and their displayed bonus"
```

---

### Task 4: Apply exhaustion penalty to ability/save/skill rolls and displays

**Files:**
- Modify: `src/components/tabs/SheetTab.tsx`

**Interfaces:**
- Consumes: `exhaustionPenalty` (Task 2), `combat.exhaustionLevel` (Task 1).

- [ ] **Step 1: Destructure `combat` from `character`**

In `src/components/tabs/SheetTab.tsx`, the existing destructure (around line 46-56):

```ts
  const {
    meta,
    attributes,
    skills,
    savingThrows,
    proficiencies,
    features,
    resources,
    attacks,
  } = character;
```

becomes:

```ts
  const {
    meta,
    attributes,
    skills,
    savingThrows,
    proficiencies,
    features,
    resources,
    attacks,
    combat,
  } = character;
```

- [ ] **Step 2: Add the import**

```ts
import { exhaustionPenalty } from "@/lib/exhaustion";
```

- [ ] **Step 3: Ability checks — roll and display**

Replace `rollAbility`:

```ts
  function rollAbility(ab: AbilityScore) {
    const mod = abilityModifier(attributes[ab]) + exhaustionPenalty(combat.exhaustionLevel);
    const result = rollD20(mod);
    setActiveRoll({ key: `ability-${ab}`, roll: result });
  }
```

Change the displayed modifier (currently `{formatModifier(abilityModifier(attributes[ab]))}` inside the ability button, around line 187):

```tsx
              <div className="text-xs text-foreground/70 font-heading">
                {formatModifier(abilityModifier(attributes[ab]) + exhaustionPenalty(combat.exhaustionLevel))}
              </div>
```

- [ ] **Step 4: Saving throws — roll and display**

Replace `rollSave`:

```ts
  function rollSave(ab: AbilityScore) {
    const total = saveTotal(character!, ab) + exhaustionPenalty(combat.exhaustionLevel);
    const result =
      ab === "dex" && hasDangerSense
        ? rollD20WithAdvantage(total)
        : rollD20(total);
    setActiveRoll({ key: `save-${ab}`, roll: result });
  }
```

Change the displayed modifier (currently `{formatModifier(saveTotal(character, ab))}` around line 232):

```tsx
              <span className="font-heading text-accent">
                {formatModifier(saveTotal(character, ab) + exhaustionPenalty(combat.exhaustionLevel))}
              </span>
```

- [ ] **Step 5: Skills — roll and display**

Replace `rollSkill`:

```ts
  function rollSkill(key: string) {
    const total = skillTotal(character!, key) + exhaustionPenalty(combat.exhaustionLevel);
    const result = rollD20(total);
    setActiveRoll({ key: `skill-${key}`, roll: result });
  }
```

Replace `rollSkillStr`:

```ts
  function rollSkillStr(key: string) {
    const skill = skills[key];
    const strMod = abilityModifier(attributes.str);
    const total =
      strMod +
      (skill?.proficient ? meta.proficiencyBonus : 0) +
      exhaustionPenalty(combat.exhaustionLevel);
    const result = rollD20(total);
    setActiveRoll({ key: `skill-str-${key}`, roll: result });
  }
```

In `renderSkillRow`, change the displayed modifier (currently `{formatModifier(skillTotal(character!, key))}`):

```tsx
          <span className="font-heading text-accent">
            {formatModifier(skillTotal(character!, key) + exhaustionPenalty(combat.exhaustionLevel))}
          </span>
```

- [ ] **Step 6: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: 0 errors. (This also re-validates Rules of Hooks — no hooks were touched here, but lint is cheap insurance.)

- [ ] **Step 7: Manual verification**

Run `npm run dev`. With `combat.exhaustionLevel` still at `2` from Task 3's manual test (or set it again), open Sheet tab: confirm every ability modifier, save modifier, and skill modifier shown is 4 lower than it would be at exhaustion 0, and that rolling any of them (tap to roll) produces a total consistent with the displayed number. Confirm `passivePerception`/`passiveInsight`/`passiveInvestigation` (shown elsewhere in Sheet tab) are **not** reduced — they should still reflect the unpenalized skill total, since passives aren't d20 tests. Set `exhaustionLevel` back to `0` and confirm everything returns to normal.

- [ ] **Step 8: Commit**

```bash
git add src/components/tabs/SheetTab.tsx
git commit -m "feat: apply exhaustion penalty to ability/save/skill rolls and displays"
```

---

### Task 5: Exhaustion stepper + Speed display in Combat tab

**Files:**
- Modify: `src/data/conditions.ts`
- Modify: `src/components/tabs/CombatTab.tsx`

**Interfaces:**
- Consumes: `combat.exhaustionLevel` (Task 1), `CONDITIONS` (existing, for the Exhaustion description text).

- [ ] **Step 1: Remove "Exhaustion" from `CONDITION_GROUPS`**

In `src/data/conditions.ts`, change the `"Otros"` group (currently `conditions: ["Poisoned", "Exhaustion"]`) to:

```ts
  {
    name: "Otros",
    conditions: ["Poisoned"],
  },
```

This intentionally leaves `CONDITION_GROUPS` covering 14 of the 15 `CONDITIONS` entries — Exhaustion gets its own dedicated stepper (this task) instead of appearing in the generic add-picker.

- [ ] **Step 2: Add the Speed stat badge**

In `src/components/tabs/CombatTab.tsx`, add a computed value near the other derived values (e.g. right after `const displayAc = combat.armorClass + tempAcMod;`):

```ts
  const speedReduction = 5 * combat.exhaustionLevel;
  const effectiveSpeed = Math.max(0, combat.speed - speedReduction);
```

Add a new `StatBadge` to the top stat row, right after the existing "Insp" badge:

```tsx
            <StatBadge
              label="Insp"
              value={meta.inspiration ? "★" : "☆"}
              onClick={toggleInspiration}
              highlight={meta.inspiration}
            />
            <StatBadge
              label="Vel"
              value={speedReduction > 0 ? `${effectiveSpeed} (-${speedReduction})` : combat.speed}
              highlight={speedReduction > 0}
            />
```

- [ ] **Step 3: Add the Exhaustion stepper**

Add a new state variable near the other condition-related state (alongside `conditionFilter`):

```ts
  const [exhaustionExpanded, setExhaustionExpanded] = useState(false);
```

Add a helper function near `addCondition`/`removeCondition`:

```ts
  function setExhaustionLevel(next: number) {
    updateCombat({ exhaustionLevel: Math.max(0, Math.min(6, next)) });
    if (next >= 6) {
      toast("Nivel de Exhaustion 6 — tu personaje muere", { icon: "💀" });
    }
  }
```

Insert the stepper right after the conditions block's closing `</div>` and before `{/* Actions */}` (i.e. after the existing `{viewingCondition && ...}` block's closing and the conditions container's closing `</div>`):

```tsx
      <div className="flex items-center justify-between stone-card rounded-lg p-2">
        <button
          onClick={() => setExhaustionExpanded((e) => !e)}
          className="text-sm font-heading text-accent"
        >
          Exhaustion: {combat.exhaustionLevel}/6
        </button>
        <div className="flex gap-1.5">
          <button
            onClick={() => setExhaustionLevel(combat.exhaustionLevel - 1)}
            className="w-7 h-7 rounded-full border border-border text-muted flex items-center justify-center hover:border-accent hover:text-accent"
          >
            −
          </button>
          <button
            onClick={() => setExhaustionLevel(combat.exhaustionLevel + 1)}
            className="w-7 h-7 rounded-full border border-border text-muted flex items-center justify-center hover:border-accent hover:text-accent"
          >
            +
          </button>
        </div>
      </div>
      {exhaustionExpanded && (
        <div className="text-xs text-foreground/80 leading-relaxed bg-card/50 border border-border rounded-lg p-2">
          {CONDITIONS.find((c) => c.name === "Exhaustion")?.description}
        </div>
      )}
```

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: 0 errors.

- [ ] **Step 5: Manual verification**

Run `npm run dev`, open Combat tab. Confirm "Exhaustion" no longer appears in the "+" condition add-picker (search for it — no match). Confirm the new Exhaustion stepper shows "Exhaustion: 0/6"; tap "+" repeatedly — confirm it increments, the Speed badge shows a reduction once above 0, and a toast fires exactly at 6. Tap "−" back down — confirm Speed badge returns to showing the plain value at 0. Tap the "Exhaustion: N/6" label — confirm the rules description expands/collapses inline.

- [ ] **Step 6: Commit**

```bash
git add src/data/conditions.ts src/components/tabs/CombatTab.tsx
git commit -m "feat: add Exhaustion stepper and Speed display to Combat tab"
```

---

### Task 6: Long rest recovery + Weapon Mastery warning

**Files:**
- Modify: `src/components/tabs/SettingsTab.tsx`
- Modify: `src/components/settings/WeaponMasteryModal.tsx`

**Interfaces:**
- Consumes: `combat.exhaustionLevel`, `character.weaponMasteryUsedThisRest` (Task 1).

- [ ] **Step 1: Long rest reduces exhaustion and resets the weapon-mastery flag**

In `src/components/tabs/SettingsTab.tsx`, `applyLongRest()` currently has two update calls. Change the `updateCombat({...})` call (adding `exhaustionLevel`):

```ts
    updateCombat({
      currentHp: character!.combat.maxHp,
      tempHp: 0,
      hitDice: {
        ...character!.combat.hitDice,
        remaining: Math.min(
          character!.combat.hitDice.remaining + hitDiceRecovery,
          character!.combat.hitDice.total
        ),
      },
      deathSaves: { successes: 0, failures: 0 },
      conditions: [],
      exhaustionLevel: Math.max(0, character!.combat.exhaustionLevel - 1),
    });
```

Change the `update((c) => ({...}))` call (adding `weaponMasteryUsedThisRest`):

```ts
    update((c) => ({
      ...c,
      weaponMasteryUsedThisRest: false,
      resources: {
        ...c.resources,
        rpiRages: {
          ...c.resources.rpiRages,
          remaining: c.resources.rpiRages.total,
          active: false,
          slots: Array(c.resources.rpiRages.total).fill(true),
        },
        stoneEndurance: {
          ...c.resources.stoneEndurance,
          remaining: c.resources.stoneEndurance.total,
        },
      },
    }));
```

- [ ] **Step 2: Weapon Mastery button warns instead of describing a rule that isn't enforced**

In `src/components/tabs/SettingsTab.tsx`, change the button's hint text (currently a static `<span>`):

```tsx
            <span className="text-xs text-muted block mt-0.5">
              Cambiar una maestría de arma (1 por descanso largo)
            </span>
```

to:

```tsx
            <span className="text-xs text-muted block mt-0.5">
              {character.weaponMasteryUsedThisRest
                ? "⚠️ Ya practicaste este descanso largo — esto no sigue las reglas"
                : "Cambiar una maestría de arma (1 por descanso largo)"}
            </span>
```

The button itself stays enabled either way — no `disabled` attribute is added.

- [ ] **Step 3: `WeaponMasteryModal` sets the flag and warns on an extra swap**

In `src/components/settings/WeaponMasteryModal.tsx`, add `update` to the existing context destructure:

```ts
  const { character, update, updateAttack } = useCharacterContext();
```

Change `performSwap` (currently ending with `toast.success(...)`, `reset()`, `onClose()`):

```ts
  function performSwap(deactivateName: string, activateName: string) {
    const alreadyUsedThisRest = character!.weaponMasteryUsedThisRest;

    character!.attacks
      .filter((a) => baseWeaponName(a.name) === deactivateName)
      .forEach((a) =>
        updateAttack(a.id, {
          mastery: null,
          masteryEffect: null,
          masterySaveDC: null,
        })
      );

    const weapon = WEAPONS.find((w) => w.name === activateName);
    if (!weapon || !weapon.mastery) return;
    const masteryData = MASTERY_PROPERTIES.find(
      (m) => m.name === weapon.mastery
    );
    const dc = computeMasterySaveDC(
      weapon.mastery,
      weapon.properties,
      character!.meta.proficiencyBonus,
      character!.attributes
    );
    character!.attacks
      .filter((a) => baseWeaponName(a.name) === activateName)
      .forEach((a) =>
        updateAttack(a.id, {
          mastery: weapon.mastery,
          masteryEffect: masteryData?.description ?? null,
          masterySaveDC: dc,
        })
      );

    update((c) => ({ ...c, weaponMasteryUsedThisRest: true }));

    if (alreadyUsedThisRest) {
      toast.success(`⚠️ Mastery cambiada fuera de las reglas: ${deactivateName} → ${activateName}`);
    } else {
      toast.success(`Mastery cambiada: ${deactivateName} → ${activateName}`);
    }
    reset();
    onClose();
  }
```

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: 0 errors.

- [ ] **Step 5: Manual verification**

Run `npm run dev`. In Settings, open "Practicar con armas" and perform a swap — confirm the normal (non-warning) toast, and that the hint text under the button now reads the warning line. Open it again and swap a second time before a long rest — confirm the toast now shows the "⚠️ ... fuera de las reglas" variant, and the button is still clickable (not disabled). Trigger a long rest — confirm the hint text reverts to the normal "(1 por descanso largo)" copy, and (from Task 5) that `combat.exhaustionLevel` decreased by 1 if it was above 0.

- [ ] **Step 6: Full batch build**

Run: `npm run build`
Expected: Build succeeds, confirming the whole batch (schema, exhaustion penalty across all roll types, stepper/speed UI, long rest, weapon mastery warning) compiles and bundles cleanly together.

- [ ] **Step 7: Commit**

```bash
git add src/components/tabs/SettingsTab.tsx src/components/settings/WeaponMasteryModal.tsx
git commit -m "feat: recover exhaustion and reset weapon-mastery flag on long rest; warn instead of blocking extra swaps"
```

---

## Self-Review Notes

- **Spec coverage:** Data model ✓ (Task 1). Weapon Mastery warn-not-block ✓ (Task 6). Exhaustion penalty on attack rolls ✓ (Task 3), on ability/save/skill rolls ✓ (Task 4), stepper UI + removal from add-picker ✓ (Task 5), long rest recovery ✓ (Task 6), level-6 toast ✓ (Task 5). Speed display ✓ (Task 5). The explicit "don't touch `saveTotal`/`skillTotal`/`abilityModifier`" constraint from the spec is honored — Task 4 adds `exhaustionPenalty(...)` additively at each call site rather than modifying those shared functions.
- **Placeholder scan:** No TBD/TODO; every step has complete, runnable code.
- **Type consistency:** `rollAttackHit`'s `opts` shape (`{ recklessActive, exhaustionLevel }`) is defined once in Task 3 and both of its call sites (`AttackRow.tsx`, `QuickActionsFab.tsx`) are updated in the same task, so no other task can be holding a stale signature. `exhaustionPenalty(level: number): number` (Task 2) is used with the same name and signature in Tasks 3 and 4. `weaponMasteryUsedThisRest` and `exhaustionLevel` field names match exactly between Task 1's schema and every later task that reads/writes them.
