# Mavok Round 5 Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the six improvements from `docs/superpowers/specs/2026-07-02-mavok-round5-design.md` — advantage-roll infrastructure, a Reckless Attack toggle, a Danger Sense indicator, Primal Knowledge's skill choice and STR-substitution rolls, a Weapon Mastery Long-Rest swap, and a feats reference browser.

**Architecture:** Nine tasks, sequential (each dispatched to a fresh implementer one at a time, never in parallel). Task 1 lays the advantage-roll foundation that Tasks 2 and 3 depend on. Tasks 4/5 (Primal Knowledge) and Tasks 6/7 (Weapon Mastery) and Tasks 8/9 (Feats browser) are each a pair where the second task builds on the first. Several tasks touch the same file more than once across the plan (`SheetTab.tsx` in Tasks 3, 5, 9; `LevelUpFlow.tsx` in Tasks 4, 8) — task order matters and must not be parallelized, since each task's diff is written against the file state left by the previous task that touched it.

**Tech Stack:** Next.js 15 (App Router, static export), React 19, TypeScript, Tailwind CSS, `sonner` (toasts). No new dependencies.

**File Structure:**
- `src/lib/dice.ts` — add `rollD20WithAdvantage` (Task 1)
- `src/components/ui/DiceResult.tsx` — fix crit/fumble detection for two-die rolls (Task 1)
- `src/components/combat/AttackRow.tsx` — advantage roll on Hit when Reckless Attack is active (Task 2)
- `src/components/tabs/CombatTab.tsx` — Reckless Attack toggle (Task 2)
- `src/components/tabs/SheetTab.tsx` — Danger Sense badge (Task 3), Primal Knowledge STR-substitution rolls (Task 5), feats browser entry point (Task 9)
- `src/components/levelup/LevelUpFlow.tsx` — Primal Knowledge skill-choice step (Task 4), shared feat-prereq helper wiring (Task 8)
- `src/lib/masteryDC.ts` — new file, `computeMasterySaveDC` (Task 6)
- `src/components/settings/WeaponMasteryModal.tsx` — new file, the Long-Rest weapon mastery swap picker (Task 7). This lives under `src/components/settings/` rather than `src/components/combat/` because the swap button itself is in `SettingsTab.tsx`'s "Descanso" section, alongside the app's other Long-Rest-adjacent actions — matching this codebase's existing convention of one component subdirectory per tab (`combat/`, `sheet/`, `notes/`, `levelup/`, `inventory/`). Both `src/components/settings/` and `src/components/sheet/` already exist as empty directories in this repo, confirming they're the intended homes for these new files.
- `src/components/tabs/SettingsTab.tsx` — "Practicar con armas" button (Task 7)
- `src/lib/feats.ts` — new file, shared `meetsAbilityPrereqs` (Task 8)
- `src/components/sheet/FeatsBrowserModal.tsx` — new file, the feats reference browser (Task 9)
- `src/hooks/useCharacter.ts` — **not modified**. Weapon Mastery swap reuses Round 4's existing `updateAttack(attackId, patch)`; no new hook function is needed anywhere in this plan.

## Global Constraints

- Spanish UI labels, English D&D terms (existing convention).
- No test suite exists in this repo. Verify every task with `npx tsc --noEmit && npm run build && npm run lint` — lint is required, not optional (it's the only one of the three that catches React Hooks ordering violations).
- **All hooks must be called before any conditional early return** (e.g. `if (!character) return null;`) in every component this plan touches. Ordinary (non-hook) local functions and consts defined *after* that early return are fine — the Rules of Hooks only constrain `useState`/`useEffect`/custom hooks, not plain functions like `renderSkillRow` in Task 5.
- Never include a "Co-authored-by" trailer in commit messages.
- `npm run lint` currently reports 7 pre-existing, documented errors (`react-hooks/purity` x4 in `RageTracker.tsx`, `react-hooks/set-state-in-effect` x1 each in `JournalList.tsx`, `useCharacter.ts`, `useTheme.ts`) — known/accepted debt per `CLAUDE.md`. Don't treat them as regressions; only investigate a lint failure that's new.
- **No data model changes in this round.** `CURRENT_DATA_VERSION` stays at 4, no migration is added. Every change in this plan is either pure UI/logic, or mutates existing `Attack`/`skills` fields via functions that already exist (`updateAttack`, and direct `skills[key].proficient` writes inside `LevelUpFlow.applyAll()`, matching how ability-score increases are already applied there).
- **Advantage-roll crit/fumble asymmetry is load-bearing, not stylistic.** `rollD20WithAdvantage` (Task 1) returns `rolls: [d1, d2]` — both dice, not just the winner. Crit detection is `rolls.some(r => r === 20)` (symmetric — correct, since 20 is the max value). Fumble detection is `rolls.every(r => r === 1)` (asymmetric — required, since with advantage you keep the *higher* die: `[1, 15]` is not a fumble). Any code that reads `DiceRoll.rolls` for crit/fumble purposes elsewhere must follow the same asymmetric rule.
- **Weapon Mastery swap is 1-for-1, not a free re-pick.** XPHB: "Whenever you finish a Long Rest, you can practice weapon drills and change one of those weapon choices." Task 7's picker must always deactivate exactly one weapon type and activate exactly one weapon type — never allow picking multiple activations per deactivation.
- **Only `Topple` and `Push` weapon masteries require a save DC.** `computeMasterySaveDC` (Task 6) returns `null` for the other six XPHB mastery properties (`Vex`, `Nick`, `Slow`, `Cleave`, `Graze`, `Sap`).

---

### Task 1: Advantage-roll infrastructure

**Files:**
- Modify: `src/lib/dice.ts`
- Modify: `src/components/ui/DiceResult.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `rollD20WithAdvantage(modifier?: number): DiceRoll` exported from `src/lib/dice.ts`. Returns a `DiceRoll` whose `expression` starts with `"1d20"` (so `DiceResult.tsx`'s existing `isD20` check picks it up) and whose `rolls` array has **two** entries — Tasks 2 and 3 depend on this exact shape.

**Context:** `DiceRoll` (`src/lib/dice.ts:1-7`) is `{ expression, rolls, modifier, total, timestamp }`. `DiceResult.tsx`'s current crit/fumble logic (`roll.rolls.length === 1 && roll.rolls[0] === 20`) only handles single-die rolls; it needs to handle two-die advantage rolls without breaking the existing single-die case.

- [ ] **Step 1: Add `rollD20WithAdvantage` to `dice.ts`**

In `src/lib/dice.ts`, find:

```typescript
export function rollD20(modifier: number = 0): DiceRoll {
  return rollDice(`1d20${modifier >= 0 ? "+" : ""}${modifier}`);
}
```

Replace with:

```typescript
export function rollD20(modifier: number = 0): DiceRoll {
  return rollDice(`1d20${modifier >= 0 ? "+" : ""}${modifier}`);
}

export function rollD20WithAdvantage(modifier: number = 0): DiceRoll {
  const d1 = Math.floor(Math.random() * 20) + 1;
  const d2 = Math.floor(Math.random() * 20) + 1;
  return {
    expression: `1d20adv${modifier >= 0 ? "+" : ""}${modifier}`,
    rolls: [d1, d2],
    modifier,
    total: Math.max(d1, d2) + modifier,
    timestamp: Date.now(),
  };
}
```

- [ ] **Step 2: Fix crit/fumble detection in `DiceResult.tsx`**

In `src/components/ui/DiceResult.tsx`, find:

```typescript
  const isD20 = roll.expression.startsWith("1d20");
  const isCrit = isD20 && roll.rolls.length === 1 && roll.rolls[0] === 20;
  const isFumble = isD20 && roll.rolls.length === 1 && roll.rolls[0] === 1;
```

Replace with:

```typescript
  const isD20 = roll.expression.startsWith("1d20");
  const isCrit = isD20 && roll.rolls.some((r) => r === 20);
  const isFumble =
    isD20 && roll.rolls.length > 0 && roll.rolls.every((r) => r === 1);
```

- [ ] **Step 3: Verify the logic manually**

Create a throwaway scratch file to confirm the crit/fumble rule against the exact cases the spec calls out — this project has no test suite, so this is a one-off sanity check, not a permanent test:

```bash
cat > /tmp/verify-advantage.ts << 'EOF'
function isCrit(rolls: number[]) { return rolls.some((r) => r === 20); }
function isFumble(rolls: number[]) { return rolls.length > 0 && rolls.every((r) => r === 1); }

console.log("crit [20]:", isCrit([20]) === true);
console.log("crit [20,5]:", isCrit([20, 5]) === true);
console.log("fumble [1]:", isFumble([1]) === true);
console.log("fumble [1,1]:", isFumble([1, 1]) === true);
console.log("NOT fumble [1,15]:", isFumble([1, 15]) === false);
EOF
npx tsx /tmp/verify-advantage.ts
rm /tmp/verify-advantage.ts
```

Expected: all five lines print `true`. The `[1, 15]` case is the one that matters most — it confirms rolling a 1 alongside a higher die under advantage is correctly NOT treated as a fumble (you keep the 15).

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS (7 pre-existing lint errors only, no new ones).

- [ ] **Step 5: Commit**

```bash
git add src/lib/dice.ts src/components/ui/DiceResult.tsx
git commit -m "feat: add advantage-roll dice support with correct crit/fumble detection"
```

---

### Task 2: Reckless Attack toggle

**Files:**
- Modify: `src/components/combat/AttackRow.tsx`
- Modify: `src/components/tabs/CombatTab.tsx`

**Interfaces:**
- Consumes: `rollD20WithAdvantage` from `@/lib/dice` (Task 1).
- Produces: `AttackRow` gains a new required prop `recklessActive: boolean`.

**Context:** `AttackRow.tsx` already computes `const isStrBased = !attack.properties.includes("Finesse");` (line 38) and uses it for the existing `rageBonus` calculation, which *also* excludes ranged/thrown attacks (`!attack.range.includes("/")`). Reckless Attack must reuse `isStrBased` only — **not** the range exclusion, since XPHB grants Reckless Attack's advantage on any Strength-based attack roll with no melee-only restriction (this is a different rule from Rage's damage bonus). `CombatTab.tsx` already has an identical toggle pattern for Rage (`rageActive`/`toggleRageActive`) to follow for Reckless Attack's UI.

- [ ] **Step 1: Add `recklessActive` prop and advantage roll to `AttackRow.tsx`**

In `src/components/combat/AttackRow.tsx`, find:

```typescript
import { rollD20, rollDice, type DiceRoll } from "@/lib/dice";
```

Replace with:

```typescript
import { rollD20, rollD20WithAdvantage, rollDice, type DiceRoll } from "@/lib/dice";
```

Find:

```typescript
export function AttackRow({
  attack,
  rageActive,
  rageDamage,
  onEdit,
  onDelete,
}: {
  attack: Attack;
  rageActive: boolean;
  rageDamage: number;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
```

Replace with:

```typescript
export function AttackRow({
  attack,
  rageActive,
  rageDamage,
  recklessActive,
  onEdit,
  onDelete,
}: {
  attack: Attack;
  rageActive: boolean;
  rageDamage: number;
  recklessActive: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
```

Find:

```typescript
  function handleRollHit() {
    const result = rollD20(attack.attackBonus);
    setLastRoll({ roll: result, type: "hit" });
  }
```

Replace with:

```typescript
  function handleRollHit() {
    const result =
      recklessActive && isStrBased
        ? rollD20WithAdvantage(attack.attackBonus)
        : rollD20(attack.attackBonus);
    setLastRoll({ roll: result, type: "hit" });
  }
```

- [ ] **Step 2: Add the toggle and gate in `CombatTab.tsx`**

In `src/components/tabs/CombatTab.tsx`, find:

```typescript
  const [ragePulseKey, setRagePulseKey] = useState(0);
```

Replace with:

```typescript
  const [ragePulseKey, setRagePulseKey] = useState(0);
  const [recklessActive, setRecklessActive] = useState(false);
```

Find:

```typescript
  const offhandAttack = attacks.find((a) => a.properties.includes("Light"));
```

Replace with:

```typescript
  const offhandAttack = attacks.find((a) => a.properties.includes("Light"));
  const hasRecklessAttack = character.features.some(
    (f) => f.name === "Reckless Attack"
  );
```

Find:

```tsx
        {attacks.map((a) => (
          <AttackRow
            key={a.id}
            attack={a}
            rageActive={rageActive}
            rageDamage={rageDamage}
            onEdit={() => setAttackModalState(a)}
```

Replace with:

```tsx
        {attacks.map((a) => (
          <AttackRow
            key={a.id}
            attack={a}
            rageActive={rageActive}
            rageDamage={rageDamage}
            recklessActive={recklessActive}
            onEdit={() => setAttackModalState(a)}
```

Find:

```tsx
            <span className="font-heading text-accent">Rage</span>
            <span className="text-muted ml-2">
              {rageActive
                ? "(activo — tap para desactivar)"
                : `(${resources.rpiRages.remaining} usos restantes)`}
            </span>
          </motion.button>
          {offhandAttack && (
```

Replace with:

```tsx
            <span className="font-heading text-accent">Rage</span>
            <span className="text-muted ml-2">
              {rageActive
                ? "(activo — tap para desactivar)"
                : `(${resources.rpiRages.remaining} usos restantes)`}
            </span>
          </motion.button>
          {hasRecklessAttack && (
            <button
              onClick={() => setRecklessActive((r) => !r)}
              className={`w-full p-3 rounded-lg border text-left ${
                recklessActive
                  ? "border-danger bg-danger/10 text-danger"
                  : "border-border bg-card text-foreground"
              }`}
            >
              <span className="font-heading text-accent">
                Reckless Attack
              </span>
              <span className="text-muted ml-2">
                {recklessActive
                  ? "(activo — tap para desactivar)"
                  : "(tap para activar)"}
              </span>
              <p className="text-muted/60 text-[0.6rem] mt-0.5">
                Atacantes contra ti tienen ventaja hasta tu próximo turno.
              </p>
            </button>
          )}
          {offhandAttack && (
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

Manually verify in `npm run dev`: level Mavok to 2 (via Settings → Subir de nivel, twice from level 1) so `character.features` includes "Reckless Attack", confirm the toggle appears under Acciones adicionales, confirm the Maul's Hit roll shows two dice in `rolls` when the toggle is active (visible as `[X, Y]` in the roll display), and confirm the Javelin (a thrown weapon, `range` includes `/`) *also* gets advantage when reckless is active — this is the deliberate difference from Rage's range exclusion.

- [ ] **Step 4: Commit**

```bash
git add src/components/combat/AttackRow.tsx src/components/tabs/CombatTab.tsx
git commit -m "feat: add Reckless Attack toggle with advantage on STR-based Hit rolls"
```

---

### Task 3: Danger Sense indicator

**Files:**
- Modify: `src/components/tabs/SheetTab.tsx`

**Interfaces:**
- Consumes: `rollD20WithAdvantage` from `@/lib/dice` (Task 1).
- Produces: a component-scoped `hasDangerSense` const, read by Task 5 is not required (Task 5 defines its own `primalKnowledgeActive`), but subsequent tasks touching this file (5, 9) must preserve this line.

**Context:** `SheetTab.tsx`'s `rollSave` (line 49-53) always calls `rollD20`. Danger Sense grants advantage on DEX saves only, automatically (no toggle — it's always active per XPHB, "unless you have the Incapacitated condition," which this app doesn't track as a gate here, consistent with how other passive features are shown without condition-tracking).

- [ ] **Step 1: Import `rollD20WithAdvantage`**

In `src/components/tabs/SheetTab.tsx`, find:

```typescript
import { rollD20, type DiceRoll } from "@/lib/dice";
```

Replace with:

```typescript
import { rollD20, rollD20WithAdvantage, type DiceRoll } from "@/lib/dice";
```

- [ ] **Step 2: Compute `hasDangerSense` and use it in `rollSave`**

Find:

```typescript
  const { meta, attributes, skills, savingThrows, proficiencies, features } =
    character;

  const passivePerception = 10 + skillTotal(character, 'perception');
```

Replace with:

```typescript
  const { meta, attributes, skills, savingThrows, proficiencies, features } =
    character;

  const hasDangerSense = features.some((f) => f.name === "Danger Sense");

  const passivePerception = 10 + skillTotal(character, 'perception');
```

Find:

```typescript
  function rollSave(ab: AbilityScore) {
    const total = saveTotal(character!, ab);
    const result = rollD20(total);
    setActiveRoll({ key: `save-${ab}`, roll: result });
  }
```

Replace with:

```typescript
  function rollSave(ab: AbilityScore) {
    const total = saveTotal(character!, ab);
    const result =
      ab === "dex" && hasDangerSense
        ? rollD20WithAdvantage(total)
        : rollD20(total);
    setActiveRoll({ key: `save-${ab}`, roll: result });
  }
```

- [ ] **Step 3: Add the badge to the DEX save row**

Find:

```tsx
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full border ${
                    savingThrows[ab]?.proficient
                      ? "bg-accent border-accent"
                      : "border-muted"
                  }`}
                />
                <span>{abilityLabel(ab)}</span>
              </div>
              <span className="font-heading text-accent">
                {formatModifier(saveTotal(character, ab))}
              </span>
            </button>
          ))}
        </div>
        {activeRoll?.key.startsWith("save-") && (
```

Replace with:

```tsx
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full border ${
                    savingThrows[ab]?.proficient
                      ? "bg-accent border-accent"
                      : "border-muted"
                  }`}
                />
                <span>{abilityLabel(ab)}</span>
                {ab === "dex" && hasDangerSense && (
                  <span
                    className="text-[0.6rem]"
                    title="Ventaja automática (Danger Sense)"
                  >
                    ⚡
                  </span>
                )}
              </div>
              <span className="font-heading text-accent">
                {formatModifier(saveTotal(character, ab))}
              </span>
            </button>
          ))}
        </div>
        {activeRoll?.key.startsWith("save-") && (
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

Manually verify in `npm run dev`: level Mavok to 2 so `character.features` includes "Danger Sense", confirm the ⚡ badge appears next to DEX in Tiradas de salvación, confirm tapping DEX shows two dice, confirm CON (or any other save) still shows one die.

- [ ] **Step 5: Commit**

```bash
git add src/components/tabs/SheetTab.tsx
git commit -m "feat: add Danger Sense advantage on DEX saves"
```

---

### Task 4: Primal Knowledge — level-up skill choice

**Files:**
- Modify: `src/components/levelup/LevelUpFlow.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `PendingChanges.primalKnowledgeSkill: string | null`, applied in `applyAll()` by setting `updated.skills[skillKey].proficient = true`. Task 5 (SheetTab.tsx) does not consume anything from this task directly — they're independent features that happen to share a feature name check (`"Primal Knowledge"`).

**Context:** `"Primal Knowledge"` already exists in `BARBARIAN_FEATURES` at level 3 (`barbarian-progression.ts:197-201`) and is auto-added to `character.features` by `applyAll()`'s existing `newFeatures`/dedup-by-name logic — **this task does not touch that**. This task only adds the "gain proficiency in another skill of your choice" mechanic as a new wizard step, gated the same way `needsSubclass` already is. Per 5etools XPHB `class-barbarian.json`, the Barbarian's level-1 skill list is exactly: Animal Handling, Athletics, Intimidation, Nature, Perception, Survival — these map to `character.skills` keys `animalHandling`, `athletics`, `intimidation`, `nature`, `perception`, `survival`.

- [ ] **Step 1: Add `skillLabel` import and the skill list const**

In `src/components/levelup/LevelUpFlow.tsx`, find:

```typescript
import {
  abilityModifier,
  formatModifier,
  abilityLabel,
  abilityLabelShort,
} from "@/lib/utils";
```

Replace with:

```typescript
import {
  abilityModifier,
  formatModifier,
  abilityLabel,
  abilityLabelShort,
  skillLabel,
} from "@/lib/utils";
```

Find:

```typescript
const ABILITIES: AbilityScore[] = ["str", "dex", "con", "int", "wis", "cha"];
const ASI_LEVELS = [4, 8, 12, 16, 19];
const SUBCLASS_LEVEL = 3;
```

Replace with:

```typescript
const ABILITIES: AbilityScore[] = ["str", "dex", "con", "int", "wis", "cha"];
const ASI_LEVELS = [4, 8, 12, 16, 19];
const SUBCLASS_LEVEL = 3;
const PRIMAL_KNOWLEDGE_SKILLS = [
  "animalHandling",
  "athletics",
  "intimidation",
  "nature",
  "perception",
  "survival",
];
```

- [ ] **Step 2: Add `primalKnowledgeSkill` to `PendingChanges` and the `Step` type**

Find:

```typescript
interface PendingChanges {
  hpIncrease: number;
  newFeatures: Feature[];
  subclass: string | null;
  abilityIncreases: Partial<Record<AbilityScore, number>>;
  feat: { name: string; description: string } | null;
  newProfBonus: number | null;
  newRages: number | null;
  newRageDamage: number | null;
  newWeaponMasteries: number | null;
  newSpeed: number | null;
}

type Step = "confirm" | "hp" | "subclass" | "asi" | "features" | "summary";
```

Replace with:

```typescript
interface PendingChanges {
  hpIncrease: number;
  newFeatures: Feature[];
  subclass: string | null;
  abilityIncreases: Partial<Record<AbilityScore, number>>;
  feat: { name: string; description: string } | null;
  primalKnowledgeSkill: string | null;
  newProfBonus: number | null;
  newRages: number | null;
  newRageDamage: number | null;
  newWeaponMasteries: number | null;
  newSpeed: number | null;
}

type Step =
  | "confirm"
  | "hp"
  | "subclass"
  | "primalKnowledge"
  | "asi"
  | "features"
  | "summary";
```

- [ ] **Step 3: Add `needsPrimalKnowledge` gate and wire it into `buildSteps`**

Find:

```typescript
  const needsSubclass = newLevel === SUBCLASS_LEVEL && !character.meta.subclass;
  const needsASI = ASI_LEVELS.includes(newLevel);
```

Replace with:

```typescript
  const needsSubclass = newLevel === SUBCLASS_LEVEL && !character.meta.subclass;
  const needsASI = ASI_LEVELS.includes(newLevel);
  const needsPrimalKnowledge =
    newLevel === 3 &&
    !character.features.some((f) => f.name === "Primal Knowledge");
```

Find:

```typescript
  function buildSteps(): Step[] {
    const steps: Step[] = ["confirm", "hp"];
    if (needsSubclass) steps.push("subclass");
    if (needsASI) steps.push("asi");
    if (newFeatures.length > 0 || subclassFeatures.length > 0)
      steps.push("features");
    steps.push("summary");
    return steps;
  }
```

Replace with:

```typescript
  function buildSteps(): Step[] {
    const steps: Step[] = ["confirm", "hp"];
    if (needsSubclass) steps.push("subclass");
    if (needsPrimalKnowledge) steps.push("primalKnowledge");
    if (needsASI) steps.push("asi");
    if (newFeatures.length > 0 || subclassFeatures.length > 0)
      steps.push("features");
    steps.push("summary");
    return steps;
  }
```

Since the feature is always added exactly at level 3 regardless of path, checking its presence in `needsPrimalKnowledge` is equivalent to "has this character already passed through level 3" — the gate fires exactly once and never re-prompts on a later dry-run or re-entry.

- [ ] **Step 4: Add the selection handler**

Find:

```typescript
  function selectSubclass(name: string) {
    const sub = SUBCLASSES.find((s) => s.name === name);
    if (!sub) return;
    const subFeatures = sub.features
      .filter((f) => f.level === SUBCLASS_LEVEL)
      .map((f) => ({
        name: f.name,
        source: sub.name,
        description: f.description,
        level: f.level,
      }));
    setChanges((prev) => ({
      ...prev,
      subclass: name,
      newFeatures: [...prev.newFeatures, ...subFeatures],
    }));
    nextStep();
  }

  function applyASI(ability1: AbilityScore, ability2: AbilityScore | null) {
```

Replace with:

```typescript
  function selectSubclass(name: string) {
    const sub = SUBCLASSES.find((s) => s.name === name);
    if (!sub) return;
    const subFeatures = sub.features
      .filter((f) => f.level === SUBCLASS_LEVEL)
      .map((f) => ({
        name: f.name,
        source: sub.name,
        description: f.description,
        level: f.level,
      }));
    setChanges((prev) => ({
      ...prev,
      subclass: name,
      newFeatures: [...prev.newFeatures, ...subFeatures],
    }));
    nextStep();
  }

  function selectPrimalKnowledgeSkill(skillKey: string) {
    setChanges((prev) => ({ ...prev, primalKnowledgeSkill: skillKey }));
    nextStep();
  }

  function applyASI(ability1: AbilityScore, ability2: AbilityScore | null) {
```

- [ ] **Step 5: Apply the skill proficiency in `applyAll()`**

Find:

```typescript
      // Ability increases
      for (const [ab, inc] of Object.entries(changes.abilityIncreases)) {
        const key = ab as AbilityScore;
        updated.attributes[key] = Math.min(
          20,
          updated.attributes[key] + (inc || 0)
        );
      }

      // Features
```

Replace with:

```typescript
      // Ability increases
      for (const [ab, inc] of Object.entries(changes.abilityIncreases)) {
        const key = ab as AbilityScore;
        updated.attributes[key] = Math.min(
          20,
          updated.attributes[key] + (inc || 0)
        );
      }

      // Primal Knowledge skill choice
      if (changes.primalKnowledgeSkill) {
        const skillKey = changes.primalKnowledgeSkill;
        updated.skills[skillKey] = {
          ...updated.skills[skillKey],
          proficient: true,
        };
      }

      // Features
```

This is the plan's one documented, accepted limitation: like ASI-granted ability score increases (which "Bajar de nivel" already does not revert), a Primal-Knowledge-granted skill proficiency won't be reverted on level-down either — skill proficiencies carry no "granted by feature X" tag to hook a revert into.

- [ ] **Step 6: Render the wizard step**

Find:

```tsx
      {/* Subclass */}
      {step === "subclass" && (
        <div className="space-y-3">
          <p className="text-sm">Elige tu subclase de Bárbaro:</p>
          {SUBCLASSES.map((sc) => (
            <button
              key={sc.name}
              onClick={() => selectSubclass(sc.name)}
              className="w-full p-3 bg-card border border-border rounded-lg text-left active:scale-[0.99] transition-transform"
            >
              <span className="font-heading text-accent text-sm">
                {sc.name}
              </span>
              <span className="text-xs text-muted block mt-1">
                Nivel 3:{" "}
                {sc.features.find((f) => f.level === 3)?.name || ""}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ASI / Feat */}
      {step === "asi" && (
```

Replace with:

```tsx
      {/* Subclass */}
      {step === "subclass" && (
        <div className="space-y-3">
          <p className="text-sm">Elige tu subclase de Bárbaro:</p>
          {SUBCLASSES.map((sc) => (
            <button
              key={sc.name}
              onClick={() => selectSubclass(sc.name)}
              className="w-full p-3 bg-card border border-border rounded-lg text-left active:scale-[0.99] transition-transform"
            >
              <span className="font-heading text-accent text-sm">
                {sc.name}
              </span>
              <span className="text-xs text-muted block mt-1">
                Nivel 3:{" "}
                {sc.features.find((f) => f.level === 3)?.name || ""}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Primal Knowledge skill choice */}
      {step === "primalKnowledge" && (
        <div className="space-y-3">
          <p className="text-sm">
            Primal Knowledge: elige una competencia adicional de la lista de
            habilidades de Bárbaro.
          </p>
          <div className="space-y-1">
            {PRIMAL_KNOWLEDGE_SKILLS.map((key) => (
              <button
                key={key}
                onClick={() => selectPrimalKnowledgeSkill(key)}
                disabled={character.skills[key]?.proficient}
                className="w-full p-3 bg-card border border-border rounded-lg text-left active:scale-[0.99] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="font-heading text-accent text-sm">
                  {skillLabel(key)}
                </span>
                {character.skills[key]?.proficient && (
                  <span className="text-xs text-muted ml-2">
                    (ya competente)
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ASI / Feat */}
      {step === "asi" && (
```

- [ ] **Step 7: Add the summary line**

Find:

```tsx
            {Object.entries(changes.abilityIncreases).map(([ab, inc]) => (
              <li key={ab}>
                {abilityLabel(ab as AbilityScore)}: +{inc} (→{" "}
                {character.attributes[ab as AbilityScore] + (inc || 0)})
              </li>
            ))}
            {changes.feat && <li>Dote: {changes.feat.name}</li>}
```

Replace with:

```tsx
            {Object.entries(changes.abilityIncreases).map(([ab, inc]) => (
              <li key={ab}>
                {abilityLabel(ab as AbilityScore)}: +{inc} (→{" "}
                {character.attributes[ab as AbilityScore] + (inc || 0)})
              </li>
            ))}
            {changes.primalKnowledgeSkill && (
              <li>
                Primal Knowledge: competencia en{" "}
                {skillLabel(changes.primalKnowledgeSkill)}
              </li>
            )}
            {changes.feat && <li>Dote: {changes.feat.name}</li>}
```

- [ ] **Step 8: Update `emptyChanges()`**

Find:

```typescript
function emptyChanges(): PendingChanges {
  return {
    hpIncrease: 0,
    newFeatures: [],
    subclass: null,
    abilityIncreases: {},
    feat: null,
    newProfBonus: null,
    newRages: null,
    newRageDamage: null,
    newWeaponMasteries: null,
    newSpeed: null,
  };
}
```

Replace with:

```typescript
function emptyChanges(): PendingChanges {
  return {
    hpIncrease: 0,
    newFeatures: [],
    subclass: null,
    abilityIncreases: {},
    feat: null,
    primalKnowledgeSkill: null,
    newProfBonus: null,
    newRages: null,
    newRageDamage: null,
    newWeaponMasteries: null,
    newSpeed: null,
  };
}
```

- [ ] **Step 9: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

Manually verify in `npm run dev`: Settings → Subir de nivel from level 1 to 2, then 2 to 3. At level 3, confirm the wizard shows a subclass-choice step and a Primal Knowledge skill-choice step (both present, in that order), pick a skill not already proficient (e.g. Stealth is not in this list so it won't appear — pick e.g. Survival, which Mavok starts non-proficient in), confirm the summary shows "Primal Knowledge: competencia en Survival", confirm after applying, the Habilidades tab shows Survival as proficient. Then Dry Run from level 3 to 4 and confirm the Primal Knowledge step does NOT reappear (since the feature is already present).

- [ ] **Step 10: Commit**

```bash
git add src/components/levelup/LevelUpFlow.tsx
git commit -m "feat: add Primal Knowledge skill-choice step to level-up wizard"
```

---

### Task 5: Primal Knowledge — STR-substitution rolls

**Files:**
- Modify: `src/components/tabs/SheetTab.tsx`

**Interfaces:**
- Consumes: nothing from other tasks (independent of Task 4's wizard step — both key off the same `"Primal Knowledge"` feature name, but neither task's code depends on the other's).
- Produces: nothing consumed by later tasks. (Task 9 also modifies `SheetTab.tsx`, in an unrelated region — the "Dotes" section — so it doesn't depend on this task's additions either, but must run after it since both touch this file.)

**Context:** XPHB's Primal Knowledge: "while your Rage is active, you can channel primal power... you can make it as a Strength check" for Acrobatics, Intimidation, Perception, Stealth, or Survival. This is a **player choice per roll**, not an automatic override — the normal skill roll button must stay untouched, with a second button offering the STR-based alternative. This task modifies `src/lib/types.ts`'s `Resources` field? No — `resources` already exists on `Character` (`src/lib/types.ts:66`); `SheetTab.tsx` just doesn't currently destructure it.

- [ ] **Step 1: Add the skill list const**

In `src/components/tabs/SheetTab.tsx`, find:

```typescript
const ABILITIES: AbilityScore[] = ["str", "dex", "con", "int", "wis", "cha"];
```

Replace with:

```typescript
const ABILITIES: AbilityScore[] = ["str", "dex", "con", "int", "wis", "cha"];
const PRIMAL_KNOWLEDGE_SKILLS = [
  "acrobatics",
  "intimidation",
  "perception",
  "stealth",
  "survival",
];
```

- [ ] **Step 2: Destructure `resources` and compute `primalKnowledgeActive`**

Find:

```typescript
  const { meta, attributes, skills, savingThrows, proficiencies, features } =
    character;

  const hasDangerSense = features.some((f) => f.name === "Danger Sense");
```

Replace with:

```typescript
  const {
    meta,
    attributes,
    skills,
    savingThrows,
    proficiencies,
    features,
    resources,
  } = character;

  const hasDangerSense = features.some((f) => f.name === "Danger Sense");
  const primalKnowledgeActive =
    resources.rpiRages.active &&
    features.some((f) => f.name === "Primal Knowledge");
```

- [ ] **Step 3: Add `rollSkillStr` and a shared `renderSkillRow` helper**

Find:

```typescript
  function rollSkill(key: string) {
    const total = skillTotal(character!, key);
    const result = rollD20(total);
    setActiveRoll({ key: `skill-${key}`, roll: result });
  }
```

Replace with:

```typescript
  function rollSkill(key: string) {
    const total = skillTotal(character!, key);
    const result = rollD20(total);
    setActiveRoll({ key: `skill-${key}`, roll: result });
  }

  function rollSkillStr(key: string) {
    const skill = skills[key];
    const strMod = abilityModifier(attributes.str);
    const total = strMod + (skill?.proficient ? meta.proficiencyBonus : 0);
    const result = rollD20(total);
    setActiveRoll({ key: `skill-str-${key}`, roll: result });
  }

  function renderSkillRow(
    key: string,
    skill: { attribute: AbilityScore; proficient: boolean },
    showAbility: boolean
  ) {
    return (
      <div key={key} className="flex items-center gap-1">
        <button
          onClick={() => rollSkill(key)}
          className="flex-1 flex items-center justify-between py-1.5 px-1 text-sm rounded hover:bg-card/50 active:scale-[0.99] transition-transform cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full border ${
                skill.proficient ? "bg-accent border-accent" : "border-muted"
              }`}
            />
            <span>{skillLabel(key)}</span>
            {showAbility && (
              <span className="text-muted text-xs">
                ({abilityLabelShort(skill.attribute)})
              </span>
            )}
          </div>
          <span className="font-heading text-accent">
            {formatModifier(skillTotal(character, key))}
          </span>
        </button>
        {primalKnowledgeActive && PRIMAL_KNOWLEDGE_SKILLS.includes(key) && (
          <button
            onClick={() => rollSkillStr(key)}
            title="Tirar con FUE (Primal Knowledge)"
            className="px-1.5 py-1 text-[0.6rem] border border-accent/50 text-accent rounded shrink-0"
          >
            FUE
          </button>
        )}
      </div>
    );
  }
```

Note: `renderSkillRow` is a plain function, not a hook — defining it here, after the component's `if (!character) return null;` early return, does not violate the Rules of Hooks.

- [ ] **Step 4: Use `renderSkillRow` in both skill-list render branches**

Find:

```tsx
                      {group
                        .sort(([a], [b]) => skillLabel(a).localeCompare(skillLabel(b)))
                        .map(([key, skill]) => (
                          <button
                            key={key}
                            onClick={() => rollSkill(key)}
                            className="w-full flex items-center justify-between py-1.5 px-1 text-sm rounded hover:bg-card/50 active:scale-[0.99] transition-transform cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full border ${skill.proficient ? "bg-accent border-accent" : "border-muted"}`} />
                              <span>{skillLabel(key)}</span>
                            </div>
                            <span className="font-heading text-accent">
                              {formatModifier(skillTotal(character, key))}
                            </span>
                          </button>
                        ))}
```

Replace with:

```tsx
                      {group
                        .sort(([a], [b]) => skillLabel(a).localeCompare(skillLabel(b)))
                        .map(([key, skill]) => renderSkillRow(key, skill, false))}
```

Find:

```tsx
              : Object.entries(skills)
                  .sort(([a], [b]) => skillLabel(a).localeCompare(skillLabel(b)))
                  .map(([key, skill]) => (
                    <button
                      key={key}
                      onClick={() => rollSkill(key)}
                      className="w-full flex items-center justify-between py-1.5 px-1 text-sm rounded hover:bg-card/50 active:scale-[0.99] transition-transform cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full border ${
                            skill.proficient
                              ? "bg-accent border-accent"
                              : "border-muted"
                          }`}
                        />
                        <span>{skillLabel(key)}</span>
                        <span className="text-muted text-xs">
                          ({abilityLabelShort(skill.attribute)})
                        </span>
                      </div>
                      <span className="font-heading text-accent">
                        {formatModifier(skillTotal(character, key))}
                      </span>
                    </button>
                  ))
            }
```

Replace with:

```tsx
              : Object.entries(skills)
                  .sort(([a], [b]) => skillLabel(a).localeCompare(skillLabel(b)))
                  .map(([key, skill]) => renderSkillRow(key, skill, true))
            }
```

- [ ] **Step 5: Fix the roll-result label for STR-substitution rolls**

Find:

```tsx
          {activeRoll?.key.startsWith("skill-") && (
            <div className="mt-2">
              <DiceResult
                roll={activeRoll.roll}
                label={skillLabel(activeRoll.key.replace("skill-", ""))}
                onClear={clearRoll}
              />
            </div>
          )}
        </CollapsibleSection>
      </div>
```

Replace with:

```tsx
          {activeRoll?.key.startsWith("skill-") && (
            <div className="mt-2">
              <DiceResult
                roll={activeRoll.roll}
                label={
                  activeRoll.key.startsWith("skill-str-")
                    ? `${skillLabel(activeRoll.key.replace("skill-str-", ""))} (FUE)`
                    : skillLabel(activeRoll.key.replace("skill-", ""))
                }
                onClear={clearRoll}
              />
            </div>
          )}
        </CollapsibleSection>
      </div>
```

This exact block (ending in `</CollapsibleSection>\n</div>`) is the "Habilidades" section's closing — confirm you're editing that occurrence and not the "Atributos" or "Tiradas de salvación" sections, which have different labels and don't start with `"skill-"`.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

Manually verify in `npm run dev`: level Mavok to 3 (so Primal Knowledge is present), go to Combat tab and activate Rage, go back to Sheet tab, confirm a small "FUE" button appears next to Acrobatics, Intimidation, Perception, Stealth, and Survival (and only those five), confirm it does NOT appear when Rage is inactive, tap it and confirm the roll uses `attributes.str`'s modifier (not the skill's normal ability) plus proficiency only if already proficient in that specific skill, confirm the normal skill button still rolls with the skill's real ability.

- [ ] **Step 7: Commit**

```bash
git add src/components/tabs/SheetTab.tsx
git commit -m "feat: add Primal Knowledge STR-substitution rolls while raging"
```

---

### Task 6: Weapon Mastery save DC helper

**Files:**
- Create: `src/lib/masteryDC.ts`

**Interfaces:**
- Consumes: `AbilityScore` from `@/lib/types`, `abilityModifier` from `@/lib/utils`.
- Produces: `computeMasterySaveDC(masteryName: string, weaponProperties: string[], proficiencyBonus: number, attributes: Record<AbilityScore, number>): number | null`, consumed by Task 7.

**Context:** Among all 8 XPHB weapon mastery properties (`src/data/mastery.ts`), only `Topple` (forces a CON save) and `Push` (implicitly a STR-based shove, per XPHB's DC formula convention) require a save DC — the other six (`Vex`, `Nick`, `Slow`, `Cleave`, `Graze`, `Sap`) don't call for a saving throw at all. The DC formula is the standard XPHB weapon attack DC: `8 + proficiency + (STR modifier, or the higher of STR/DEX if the weapon has the Finesse property)`.

- [ ] **Step 1: Create the helper**

Create `src/lib/masteryDC.ts`:

```typescript
import type { AbilityScore } from "./types";
import { abilityModifier } from "./utils";

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

- [ ] **Step 2: Verify against known data**

Create a throwaway scratch file to confirm the formula reproduces Mavok's existing, already-correct Maul entry (`src/data/mavok-default.ts`: `mastery: "Topple"`, `masterySaveDC: 13`, and Mavok's `attributes.str: 17` → modifier +3, `meta.proficiencyBonus: 2`):

```bash
cat > /tmp/verify-masterydc.ts << 'EOF'
import { computeMasterySaveDC } from "/Users/gremiger/Documents/Personal/coding/dnd/mavok/src/lib/masteryDC";

const attrs = { str: 17, dex: 14, con: 14, int: 8, wis: 12, cha: 10 } as const;

console.log("Maul Topple DC === 13:", computeMasterySaveDC("Topple", ["Heavy", "Two-Handed"], 2, attrs) === 13);
console.log("Handaxe Vex DC === null:", computeMasterySaveDC("Vex", ["Light", "Thrown"], 2, attrs) === null);
console.log("Rapier (Finesse) Topple uses max(STR,DEX):", computeMasterySaveDC("Topple", ["Finesse"], 2, { ...attrs, dex: 20 }) === 8 + 2 + 5);
EOF
npx tsx /tmp/verify-masterydc.ts
rm /tmp/verify-masterydc.ts
```

Expected: all three lines print `true`. The first confirms the formula matches the game's existing, hand-verified data exactly; the third confirms the Finesse max(STR,DEX) branch.

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/masteryDC.ts
git commit -m "feat: add weapon mastery save DC calculation helper"
```

---

### Task 7: Weapon Mastery swap UI

**Files:**
- Create: `src/components/settings/WeaponMasteryModal.tsx`
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Consumes: `computeMasterySaveDC` from `@/lib/masteryDC` (Task 6), `useCharacterContext` (existing, for `character` and `updateAttack`), `WEAPONS` from `@/data/weapons`, `MASTERY_PROPERTIES` from `@/data/mastery`, `BARBARIAN_LEVELS` from `@/data/barbarian-progression`.
- Produces: `WeaponMasteryModal` exporting `{ open, onClose }: { open: boolean; onClose: () => void }`, consumed by `SettingsTab.tsx`.

**Context:** `Attack.name` values like `"Handaxe (melee)"` and `"Handaxe (thrown)"` (`src/data/mavok-default.ts`) both represent the same underlying weapon type ("Handaxe") for mastery purposes — they must be treated as one entry when listing active/inactive weapon types, and both must be updated together on a swap. `WEAPONS` (`src/data/weapons.ts`) has no `"(melee)"`/`"(thrown)"` suffixes, so matching requires stripping the suffix: an attack's base weapon name is the `WEAPONS` entry whose `name` either exactly equals the attack name, or is a prefix followed by `" ("`. Attacks with no matching `WEAPONS` entry (e.g. a homebrew attack added via Round 4's custom-attack feature) are excluded from both lists — there's no inherent mastery data to look up for them, and this is a known, accepted limitation consistent with this app's existing homebrew-item handling elsewhere (e.g. Primal Knowledge's own no-revert-on-level-down limitation in Task 4).

**Known, accepted limitation (out of scope for this task):** `mavok-default.ts`'s static `"Weapon Mastery"` feature entry (shown in Sheet tab → Rasgos y características) has hardcoded flavor text — `"Conoce las propiedades de maestría de 2 armas: Maul (Topple) y Handaxe (Vex)."` — that this task does not update on swap. After a swap, that card will say something no longer true, while the Combat tab's attack rows (driven by the live `attack.mastery` field this task does update) stay accurate. Making the flavor text dynamic would mean generating it from `character.attacks` at render time instead of storing it as static text — a larger change than this task's scope, and not requested by the spec. Leave it as a known drift between flavor text and live state; the Combat tab is the source of truth for current mastery.

- [ ] **Step 1: Create the modal**

Create `src/components/settings/WeaponMasteryModal.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useCharacterContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { WEAPONS } from "@/data/weapons";
import { MASTERY_PROPERTIES } from "@/data/mastery";
import { BARBARIAN_LEVELS } from "@/data/barbarian-progression";
import { computeMasterySaveDC } from "@/lib/masteryDC";
import { toast } from "sonner";

function baseWeaponName(attackName: string): string | null {
  const match = WEAPONS.find(
    (w) => attackName === w.name || attackName.startsWith(`${w.name} (`)
  );
  return match ? match.name : null;
}

export function WeaponMasteryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { character, updateAttack } = useCharacterContext();
  const [deactivate, setDeactivate] = useState<string | null>(null);

  if (!character) return null;

  const weaponMasteries =
    BARBARIAN_LEVELS.find((l) => l.level === character.meta.level)
      ?.weaponMasteries ?? 2;

  const activeWeaponNames = Array.from(
    new Set(
      character.attacks
        .filter((a) => a.mastery !== null)
        .map((a) => baseWeaponName(a.name))
        .filter((n): n is string => n !== null)
    )
  );

  const inactiveWeaponNames = Array.from(
    new Set(
      character.attacks
        .filter((a) => a.mastery === null)
        .map((a) => baseWeaponName(a.name))
        .filter((n): n is string => n !== null)
    )
  ).filter((name) => {
    const w = WEAPONS.find((w) => w.name === name);
    return w && w.mastery !== null;
  });

  function reset() {
    setDeactivate(null);
  }

  function performSwap(deactivateName: string, activateName: string) {
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

    toast.success(`Mastery cambiada: ${deactivateName} → ${activateName}`);
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Practicar con armas"
    >
      <p className="text-xs text-muted mb-3">
        Maestrías activas: {activeWeaponNames.length}/{weaponMasteries}
      </p>
      {!deactivate ? (
        <div className="space-y-3">
          <p className="text-sm">
            Elige qué maestría de arma dejas de usar:
          </p>
          {activeWeaponNames.length === 0 ? (
            <p className="text-muted text-sm text-center py-4">
              No tienes maestrías activas.
            </p>
          ) : (
            <div className="space-y-1">
              {activeWeaponNames.map((name) => {
                const w = WEAPONS.find((w) => w.name === name);
                return (
                  <button
                    key={name}
                    onClick={() => setDeactivate(name)}
                    className="w-full p-3 bg-card border border-border rounded-lg text-left active:scale-[0.99] transition-transform"
                  >
                    <span className="font-heading text-accent text-sm">
                      {name}
                    </span>
                    <span className="text-xs text-muted ml-2">
                      ({w?.mastery})
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm">
            Dejando <strong>{deactivate}</strong> (
            {WEAPONS.find((w) => w.name === deactivate)?.mastery}). Elige el
            arma a activar:
          </p>
          {inactiveWeaponNames.length === 0 ? (
            <p className="text-muted text-sm text-center py-4">
              No tienes otras armas disponibles para activar.
            </p>
          ) : (
            <div className="space-y-1">
              {inactiveWeaponNames.map((name) => {
                const w = WEAPONS.find((w) => w.name === name);
                return (
                  <button
                    key={name}
                    onClick={() => performSwap(deactivate, name)}
                    className="w-full p-3 bg-card border border-border rounded-lg text-left active:scale-[0.99] transition-transform"
                  >
                    <span className="font-heading text-accent text-sm">
                      {name}
                    </span>
                    <span className="text-xs text-muted ml-2">
                      ({w?.mastery})
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <button
            onClick={reset}
            className="w-full py-2 text-sm text-muted border border-border rounded-lg"
          >
            Atrás
          </button>
        </div>
      )}
    </Modal>
  );
}
```

- [ ] **Step 2: Wire the button into `SettingsTab.tsx`**

Find:

```typescript
import { LevelUpFlow } from "@/components/levelup/LevelUpFlow";
```

Replace with:

```typescript
import { LevelUpFlow } from "@/components/levelup/LevelUpFlow";
import { WeaponMasteryModal } from "@/components/settings/WeaponMasteryModal";
```

Find:

```typescript
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [levelUpDryRun, setLevelUpDryRun] = useState(false);
```

Replace with:

```typescript
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [levelUpDryRun, setLevelUpDryRun] = useState(false);
  const [weaponMasteryOpen, setWeaponMasteryOpen] = useState(false);
```

Find:

```tsx
          <button
            onClick={() => setLongRestOpen(true)}
            className="w-full p-3 bg-card rounded-lg border border-border text-left"
          >
            <span className="font-heading text-accent text-sm">
              Descanso largo
            </span>
            <span className="text-xs text-muted block mt-0.5">
              Recuperar HP, rage, dados de golpe
            </span>
          </button>
        </div>
      </CollapsibleSection>
```

Replace with:

```tsx
          <button
            onClick={() => setLongRestOpen(true)}
            className="w-full p-3 bg-card rounded-lg border border-border text-left"
          >
            <span className="font-heading text-accent text-sm">
              Descanso largo
            </span>
            <span className="text-xs text-muted block mt-0.5">
              Recuperar HP, rage, dados de golpe
            </span>
          </button>
          <button
            onClick={() => setWeaponMasteryOpen(true)}
            className="w-full p-3 bg-card rounded-lg border border-border text-left"
          >
            <span className="font-heading text-accent text-sm">
              Practicar con armas
            </span>
            <span className="text-xs text-muted block mt-0.5">
              Cambiar una maestría de arma (1 por descanso largo)
            </span>
          </button>
        </div>
      </CollapsibleSection>
```

Find:

```tsx
      {/* Level Up Flow */}
      <LevelUpFlow open={levelUpOpen} onClose={() => setLevelUpOpen(false)} dryRun={levelUpDryRun} />
```

Replace with:

```tsx
      {/* Level Up Flow */}
      <LevelUpFlow open={levelUpOpen} onClose={() => setLevelUpOpen(false)} dryRun={levelUpDryRun} />

      {/* Weapon Mastery Swap */}
      <WeaponMasteryModal
        open={weaponMasteryOpen}
        onClose={() => setWeaponMasteryOpen(false)}
      />
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

Manually verify in `npm run dev`: Settings → Descanso → "Practicar con armas". Confirm it shows "Maestrías activas: 2/2" and lists Maul and Handaxe as active. Tap Handaxe, confirm the next screen offers Javelin and Sickle (both currently `mastery: null`). Tap Javelin, confirm the modal closes with a success toast, then check Combat tab: both Handaxe rows (melee and thrown) now show `mastery: null` and Javelin now shows `mastery: "Slow"`. Reopen the modal and confirm "Maestrías activas: 2/2" still holds (Maul + Javelin now).

- [ ] **Step 4: Commit**

```bash
git add src/components/settings/WeaponMasteryModal.tsx src/components/tabs/SettingsTab.tsx
git commit -m "feat: add Weapon Mastery Long-Rest swap UI"
```

---

### Task 8: Feats browser — shared prereq helper

**Files:**
- Create: `src/lib/feats.ts`
- Modify: `src/components/levelup/LevelUpFlow.tsx`

**Interfaces:**
- Produces: `meetsAbilityPrereqs(feat: FeatData, attributes: Record<AbilityScore, number>): boolean` exported from `src/lib/feats.ts`, consumed by Task 9 (`FeatsBrowserModal.tsx`) and by this task's own refactor of `LevelUpFlow.tsx`.
- Consumes: `FeatData` from `@/data/feats`, `AbilityScore` from `@/lib/types`.

**Context:** `LevelUpFlow.tsx`'s `getEligibleFeats()` (unaffected by Task 4's edits — Task 4 only touched the wizard's step machinery, not this function) currently inlines the ability-prereq check. This task extracts it into a shared function so the new feats browser (Task 9) doesn't duplicate the logic.

- [ ] **Step 1: Create the shared helper**

Create `src/lib/feats.ts`:

```typescript
import type { AbilityScore } from "./types";
import type { FeatData } from "@/data/feats";

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

- [ ] **Step 2: Wire it into `LevelUpFlow.tsx`**

In `src/components/levelup/LevelUpFlow.tsx`, find:

```typescript
import { FEATS, type FeatData } from "@/data/feats";
```

Replace with:

```typescript
import { FEATS, type FeatData } from "@/data/feats";
import { meetsAbilityPrereqs } from "@/lib/feats";
```

Find:

```typescript
  function getEligibleFeats(): FeatData[] {
    return FEATS.filter((f) => {
      if (f.category === "Fighting Style") return false;
      if (f.levelRequired && f.levelRequired > newLevel) return false;
      if (f.requiresSpellcasting) return false;
      if (f.abilityPrereqs) {
        const meetsAny = f.abilityPrereqs.some((prereq) =>
          Object.entries(prereq).every(
            ([ab, min]) =>
              (character!.attributes[ab as AbilityScore] || 0) >= min
          )
        );
        if (!meetsAny) return false;
      }
      return true;
    });
  }
```

Replace with:

```typescript
  function getEligibleFeats(): FeatData[] {
    return FEATS.filter((f) => {
      if (f.category === "Fighting Style") return false;
      if (f.levelRequired && f.levelRequired > newLevel) return false;
      if (f.requiresSpellcasting) return false;
      if (!meetsAbilityPrereqs(f, character!.attributes)) return false;
      return true;
    });
  }
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

Manually verify in `npm run dev`: Settings → Subir de nivel to level 4 (an ASI level), open the Dote tab in the wizard, confirm the eligible feats list is unchanged from before this refactor (e.g. feats requiring STR/DEX/etc. 13+ that Mavok's attributes qualify for still appear, ones he doesn't qualify for still don't, Fighting Style and spellcasting feats still don't appear here).

- [ ] **Step 4: Commit**

```bash
git add src/lib/feats.ts src/components/levelup/LevelUpFlow.tsx
git commit -m "refactor: extract shared ability-prereq check into src/lib/feats.ts"
```

---

### Task 9: Feats reference browser

**Files:**
- Create: `src/components/sheet/FeatsBrowserModal.tsx`
- Modify: `src/components/tabs/SheetTab.tsx`

**Interfaces:**
- Consumes: `meetsAbilityPrereqs` from `@/lib/feats` (Task 8), `FEATS`/`FeatData` from `@/data/feats`, `abilityLabel` from `@/lib/utils`, `Character`/`AbilityScore` from `@/lib/types`.
- Produces: `FeatsBrowserModal` exporting `{ open, onClose, character }: { open: boolean; onClose: () => void; character: Character }`, consumed by `SheetTab.tsx`.

**Context:** Unlike `getEligibleFeats()` (which excludes ineligible feats), this browser shows **all** feats with a per-feat status label, since the point is letting the player see what's still locked before reaching an ASI level. Fighting Style and spellcasting-gated feats default to hidden (toggle chips, default ON = hidden) since neither is ever choosable for Mavok, but must be revealable for looking up a friend's character build.

- [ ] **Step 1: Create the browser modal**

Create `src/components/sheet/FeatsBrowserModal.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FEATS, type FeatData } from "@/data/feats";
import { meetsAbilityPrereqs } from "@/lib/feats";
import { abilityLabel } from "@/lib/utils";
import type { AbilityScore, Character } from "@/lib/types";

const CATEGORIES = ["General", "Origin", "Epic Boon", "Fighting Style"] as const;
type CategoryFilter = "all" | (typeof CATEGORIES)[number];

function formatAbilityPrereqs(feat: FeatData): string | null {
  if (!feat.abilityPrereqs || feat.abilityPrereqs.length === 0) return null;
  return feat.abilityPrereqs
    .map((prereq) =>
      Object.entries(prereq)
        .map(([ab, min]) => `${abilityLabel(ab as AbilityScore)} ${min}+`)
        .join(" y ")
    )
    .join(" o ");
}

function getFeatStatus(feat: FeatData, character: Character): string {
  const meetsAbility = meetsAbilityPrereqs(feat, character.attributes);
  const meetsLevel =
    feat.levelRequired == null || character.meta.level >= feat.levelRequired;
  const abilityStr = formatAbilityPrereqs(feat);

  if (meetsAbility && meetsLevel) return "Disponible ahora";

  if (!meetsLevel) {
    const levelPart = `Requiere nivel ${feat.levelRequired}`;
    if (!abilityStr) return levelPart;
    return meetsAbility
      ? `${levelPart} · Cumples ${abilityStr}`
      : `${levelPart} · Requiere ${abilityStr}`;
  }

  return `Requiere ${abilityStr}`;
}

export function FeatsBrowserModal({
  open,
  onClose,
  character,
}: {
  open: boolean;
  onClose: () => void;
  character: Character;
}) {
  const [hideSpellcasting, setHideSpellcasting] = useState(true);
  const [hideFightingStyle, setHideFightingStyle] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");

  const visibleCategories = CATEGORIES.filter(
    (c) => c !== "Fighting Style" || !hideFightingStyle
  );

  const filtered = FEATS.filter((f) => {
    if (hideSpellcasting && f.requiresSpellcasting) return false;
    if (hideFightingStyle && f.category === "Fighting Style") return false;
    if (categoryFilter !== "all" && f.category !== categoryFilter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <Modal open={open} onClose={onClose} title="Dotes disponibles">
      <div className="space-y-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar dote..."
          className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
        />

        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setHideSpellcasting((h) => !h)}
            className={`px-2.5 py-1 rounded-full text-xs ${
              hideSpellcasting
                ? "bg-accent text-white"
                : "bg-card border border-border text-muted"
            }`}
          >
            Sin lanzamiento de conjuros
          </button>
          <button
            onClick={() => setHideFightingStyle((h) => !h)}
            className={`px-2.5 py-1 rounded-full text-xs ${
              hideFightingStyle
                ? "bg-accent text-white"
                : "bg-card border border-border text-muted"
            }`}
          >
            Sin Fighting Style
          </button>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-2.5 py-1 rounded-full text-xs ${
              categoryFilter === "all"
                ? "bg-accent text-white"
                : "bg-card border border-border text-muted"
            }`}
          >
            Todas
          </button>
          {visibleCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-2.5 py-1 rounded-full text-xs ${
                categoryFilter === c
                  ? "bg-accent text-white"
                  : "bg-card border border-border text-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="max-h-[50vh] overflow-y-auto space-y-2">
          {filtered.map((f) => {
            const status =
              f.category === "Fighting Style" || f.requiresSpellcasting
                ? "No aplica a tu build"
                : getFeatStatus(f, character);
            return (
              <div key={f.name} className="stone-card rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-heading text-accent text-sm">
                    {f.name}
                  </span>
                  <span className="text-[0.6rem] text-muted border border-border rounded px-1.5 py-0.5">
                    {f.category}
                  </span>
                  <span
                    className={`text-[0.6rem] px-1.5 py-0.5 rounded ${
                      status === "Disponible ahora"
                        ? "bg-success/20 text-success"
                        : "bg-card border border-border text-muted"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <p className="text-xs text-foreground/70 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-muted text-sm text-center py-8">
              Sin dotes que coincidan. Ajusta la búsqueda o los filtros.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 2: Wire the entry point into `SheetTab.tsx`**

In `src/components/tabs/SheetTab.tsx`, find:

```typescript
import { DiceResult } from "@/components/ui/DiceResult";
import { User } from "lucide-react";
```

Replace with:

```typescript
import { DiceResult } from "@/components/ui/DiceResult";
import { FeatsBrowserModal } from "@/components/sheet/FeatsBrowserModal";
import { User } from "lucide-react";
```

Find:

```typescript
  const [groupByAbility, setGroupByAbility] = useState(false);

  const ABILITY_ORDER: AbilityScore[] = ["str", "dex", "con", "int", "wis", "cha"];
```

Replace with:

```typescript
  const [groupByAbility, setGroupByAbility] = useState(false);
  const [featsBrowserOpen, setFeatsBrowserOpen] = useState(false);

  const ABILITY_ORDER: AbilityScore[] = ["str", "dex", "con", "int", "wis", "cha"];
```

Find:

```tsx
          {features.filter(f => f.source === "Dote" && f.level <= meta.level).length === 0 && (
            <p className="text-muted text-sm text-center py-4">Sin dotes todavía.</p>
          )}
        </div>
      </CollapsibleSection>

      {/* Apariencia */}
```

Replace with:

```tsx
          {features.filter(f => f.source === "Dote" && f.level <= meta.level).length === 0 && (
            <p className="text-muted text-sm text-center py-4">Sin dotes todavía.</p>
          )}
          <button
            onClick={() => setFeatsBrowserOpen(true)}
            className="w-full p-2 rounded-lg border border-border/50 bg-card/50 text-left"
          >
            <span className="font-heading text-muted text-xs">
              Ver todas las dotes disponibles
            </span>
          </button>
        </div>
      </CollapsibleSection>

      {/* Apariencia */}
```

Find:

```tsx
      {/* Objetivos */}
      <CollapsibleSection title="Objetivos">
        <ol className="list-decimal list-inside space-y-1 text-sm">
          {meta.goals.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ol>
      </CollapsibleSection>
    </div>
  );
}
```

Replace with:

```tsx
      {/* Objetivos */}
      <CollapsibleSection title="Objetivos">
        <ol className="list-decimal list-inside space-y-1 text-sm">
          {meta.goals.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ol>
      </CollapsibleSection>

      <FeatsBrowserModal
        open={featsBrowserOpen}
        onClose={() => setFeatsBrowserOpen(false)}
        character={character}
      />
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS.

Manually verify in `npm run dev`: Sheet tab → Dotes → "Ver todas las dotes disponibles". Confirm Fighting Style and spellcasting-gated feats (e.g. "Archery", "Elemental Adept") are hidden by default, confirm toggling "Sin Fighting Style" off reveals Fighting Style feats each showing "No aplica a tu build", confirm toggling "Sin lanzamiento de conjuros" off reveals spellcasting feats the same way. Confirm a level-4+ feat Mavok doesn't yet qualify for (e.g. "Actor", requires CHA 13+, Mavok has CHA 10) shows "Requiere nivel 4 · Requiere CAR 13+", confirm a feat with no prereqs at Mavok's current level (e.g. "Tough" for a level-1 origin feat, or "Alert") shows "Disponible ahora", confirm the search box and the General/Origin/Epic Boon category chips work.

- [ ] **Step 4: Commit**

```bash
git add src/components/sheet/FeatsBrowserModal.tsx src/components/tabs/SheetTab.tsx
git commit -m "feat: add feats reference browser"
```

---

## Final Verification

After all 9 tasks are complete, run the full verification suite once more from the repo root:

```bash
npx tsc --noEmit && npm run build && npm run lint
```

Expected: all PASS, with exactly the 7 pre-existing documented lint errors and no new ones.
