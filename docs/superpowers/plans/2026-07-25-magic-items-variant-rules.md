# Magic Items and Rules Glossary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two new Enciclopedia categories — named magic items (from the 2024 DMG) and the 2024 rules glossary — and connect magic items into the existing inventory description fallback chain.

**Architecture:** A shared, side-effect-free `scripts/extract-helpers.ts` module (extracted from `extract-5etools.ts`) fixes a real data-loss bug in `flattenEntries` (nested `{"type":"list"}` structures were silently dropped) and becomes independently testable. Two new extraction functions generate `src/data/magic-items.ts` and `src/data/variant-rules.ts`, following the exact pattern every other `src/data/*.ts` file already uses. `resolveItemDescription` gains a fourth fallback link. `EncyclopediaTab.tsx` gains two new categories via its existing `mapItems`/`CATEGORY_ITEMS` pattern — no new UI architecture.

**Tech Stack:** Next.js 15 / React 19 / TypeScript / Tailwind CSS 4 / Vitest / tsx (for the extraction script). No new npm dependencies.

## Global Constraints

- Verify every task with `npx tsc --noEmit && npm run build && npm run lint && npm test` before committing — all four must pass.
- `npm run lint` must report 0 errors.
- Never hand-edit `src/data/*.ts` — regenerate via `npx tsx scripts/extract-5etools.ts` after changing the extraction script.
- No `Character`/`InventoryItem` schema changes, no migration — all new data is generated reference data, same as every other file in `src/data/`.
- Spanish UI labels, English D&D terms.
- Commit messages: no "Co-authored-by" (or similar attribution) trailer.
- **Environment note for any task that runs `npx tsx scripts/extract-5etools.ts`:** the script reads `../../dnd/5etools-src/data` relative to `scripts/`, which only resolves correctly if a `dnd/5etools-src` directory is reachable two levels up from the working checkout's `scripts/` folder. If working in a nested git worktree (e.g. `<repo>/.claude/worktrees/<name>/scripts/`), this resolves to `<repo>/.claude/worktrees/dnd/5etools-src` — which doesn't exist by default. If you need it: create a symlink at that exact path pointing to the real sibling `dnd` folder (find it by checking where `../dnd/5etools-src` resolves from the main repo checkout, not the worktree), run the extraction, **then delete the symlink immediately in the same task, before doing anything else** — a previous plan's execution left this symlink in place and it polluted `lint`/`test` runs from the main checkout after merging. Confirm it's gone (`ls` the parent directory) before considering the task done.

---

### Task 1: Extract shared parsing helpers, fix the nested-list bug, add tests

**Files:**
- Create: `scripts/extract-helpers.ts`
- Modify: `scripts/extract-5etools.ts` (remove the local `stripMarkup`/`flattenEntries` definitions, import them instead)
- Test: `scripts/extract-5etools.test.ts`

**Interfaces:**
- Produces: `stripMarkup(text: string): string` and `flattenEntries(entries: unknown[]): string`, both exported from `scripts/extract-helpers.ts`. Every extraction function in `extract-5etools.ts` continues to call these exactly as before — only their location changes, not their call sites' syntax (same function names, same signatures).

**Context:** `scripts/extract-5etools.ts` currently defines `stripMarkup`/`flattenEntries` as local, unexported functions, and its bottom section runs the entire extraction pipeline unconditionally at module load time (`extractConditions(); extractWeapons(); ...`). Importing this file from a test would re-run that whole pipeline as a side effect — reading real 5etools source files and overwriting every file in `src/data/`. Moving the two pure parsing helpers into their own module, with no top-level side effects, makes them safely testable without touching the orchestration script's execution model.

`flattenEntries` recurses into an object's `.entries` array, but 5etools' `{"type": "list", "items": [...]}` nodes hold their content in `.items`, not `.entries` — so list content is silently dropped today. Confirmed against real XDMG magic item data: "Axe of the Dwarvish Lords" has a "Blessings of Moradin" section whose 5 named benefits (Darkvision, Fortitude of Stone, Gifts of the Creator, One with the Forge, Sunder) live entirely inside a `type: "list"` node and would be lost without this fix.

- [ ] **Step 1: Write the failing test**

```typescript
// scripts/extract-5etools.test.ts
import { describe, it, expect } from "vitest";
import { flattenEntries } from "./extract-helpers";

describe("flattenEntries", () => {
  it("still flattens a plain nested named section (existing behavior)", () => {
    const entries = [
      "Intro text.",
      { name: "Section One", entries: ["Section one body."] },
    ];
    expect(flattenEntries(entries)).toBe(
      "Intro text. **Section One:**  Section one body."
    );
  });

  it("recurses into a list of named items instead of dropping them", () => {
    const entries = [
      "While attuned, you gain the following benefits:",
      {
        type: "list",
        items: [
          {
            type: "item",
            name: "Darkvision",
            entries: ["You gain Darkvision with a range of 60 feet."],
          },
          {
            type: "item",
            name: "Fortitude of Stone",
            entries: ["Your Constitution increases by 2."],
          },
        ],
      },
    ];
    const result = flattenEntries(entries);
    expect(result).toContain("Darkvision");
    expect(result).toContain("You gain Darkvision with a range of 60 feet.");
    expect(result).toContain("Fortitude of Stone");
    expect(result).toContain("Your Constitution increases by 2.");
  });

  it("recurses into a list of plain strings instead of dropping them", () => {
    const entries = [
      "The item has the following random properties:",
      {
        type: "list",
        items: ["2 minor beneficial properties", "1 major beneficial property"],
      },
    ];
    const result = flattenEntries(entries);
    expect(result).toContain("2 minor beneficial properties");
    expect(result).toContain("1 major beneficial property");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- extract-5etools.test.ts`
Expected: FAIL — `Cannot find module './extract-helpers'`.

- [ ] **Step 3: Create `scripts/extract-helpers.ts`**

```typescript
// scripts/extract-helpers.ts
export function stripMarkup(text: string): string {
  let prev: string;
  do {
    prev = text;
    text = text
      .replace(/\{@\w+\s+([^|}]+?)(?:\|[^}]*)?\}/g, "$1")
      .replace(/\{@dc\s+(\d+)\}/g, "DC $1");
  } while (text !== prev);
  return text;
}

export function flattenEntries(entries: unknown[]): string {
  const parts: string[] = [];
  for (const e of entries) {
    if (typeof e === "string") {
      parts.push(stripMarkup(e));
    } else if (typeof e === "object" && e !== null) {
      const obj = e as Record<string, unknown>;
      if (obj.name) parts.push(`**${obj.name}:** `);
      if (Array.isArray(obj.entries)) {
        parts.push(flattenEntries(obj.entries));
      }
      if (Array.isArray(obj.items)) {
        parts.push(flattenEntries(obj.items));
      }
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
```

- [ ] **Step 4: Update `extract-5etools.ts` to import the helpers instead of defining them locally**

Replace:
```typescript
import * as fs from "fs";
import * as path from "path";

const TOOLS_DIR = path.resolve(__dirname, "../../dnd/5etools-src/data");
const OUT_DIR = path.resolve(__dirname, "../src/data");

function stripMarkup(text: string): string {
  let prev: string;
  do {
    prev = text;
    text = text
      .replace(/\{@\w+\s+([^|}]+?)(?:\|[^}]*)?\}/g, "$1")
      .replace(/\{@dc\s+(\d+)\}/g, "DC $1");
  } while (text !== prev);
  return text;
}

function flattenEntries(entries: unknown[]): string {
  const parts: string[] = [];
  for (const e of entries) {
    if (typeof e === "string") {
      parts.push(stripMarkup(e));
    } else if (typeof e === "object" && e !== null) {
      const obj = e as Record<string, unknown>;
      if (obj.name) parts.push(`**${obj.name}:** `);
      if (Array.isArray(obj.entries)) {
        parts.push(flattenEntries(obj.entries));
      }
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
```
with:
```typescript
import * as fs from "fs";
import * as path from "path";
import { stripMarkup, flattenEntries } from "./extract-helpers";

const TOOLS_DIR = path.resolve(__dirname, "../../dnd/5etools-src/data");
const OUT_DIR = path.resolve(__dirname, "../src/data");
```
Every other function in this file (`extractConditions`, `extractWeapons`, `extractGear`, `extractSpells`'s `formatCastingTime`, etc.) keeps calling `stripMarkup(...)`/`flattenEntries(...)` exactly as before — only the two function definitions move, nothing about how they're called changes.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- extract-5etools.test.ts`
Expected: PASS, 3/3.

- [ ] **Step 6: Verify nothing else broke**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass — this task doesn't change any `src/data/*.ts` output (same `stripMarkup`/`flattenEntries` logic, just relocated, plus the additive `.items` handling that no *currently extracted* category's data happens to trigger — confirm this by checking `git status` shows no changes under `src/data/` after this task, only the three script/test files).

- [ ] **Step 7: Commit**

```bash
git add scripts/extract-helpers.ts scripts/extract-5etools.ts scripts/extract-5etools.test.ts
git commit -m "refactor: extract testable parsing helpers, fix nested-list data loss"
```

---

### Task 2: Extract named magic items (XDMG) and the rules glossary (XPHB)

**Files:**
- Modify: `scripts/extract-5etools.ts` (add `extractMagicItems()`, `extractVariantRules()`, call both at the bottom)
- Create (generated): `src/data/magic-items.ts`, `src/data/variant-rules.ts`

**Interfaces:**
- Produces: `MagicItemData { name: string; rarity: string; itemType: "weapon" | "armor" | "wondrous"; requiresAttunement: boolean; description: string }` exported as `MAGIC_ITEMS` from `src/data/magic-items.ts`. `VariantRuleData { name: string; description: string }` exported as `VARIANT_RULES` from `src/data/variant-rules.ts`.
- Consumes: `flattenEntries` from `scripts/extract-helpers.ts` (Task 1).

**Context:** Confirmed directly against the source data:
- `../dnd/5etools-src/data/items.json`, filtered to `source === "XDMG"` and `rarity` present and not `"none"`, yields exactly 435 items (common: 47, uncommon: 111, rare: 127, very rare: 88, legendary: 50, artifact: 12).
- `../dnd/5etools-src/data/variantrules.json`, filtered to `source === "XPHB"`, yields exactly 114 entries (all `ruleType: "C"` — this is the PHB's rules glossary appendix, not a separate optional-rules subset).
- Item `type` field examples seen in the XDMG data: `"M|XPHB"`/`"R|XPHB"` (weapons), `"LA|XPHB"`/`"MA|XPHB"`/`"HA|XPHB"`/`"S|XPHB"` (armor/shield), and others (`"RD|XDMG"` rod, `"WD|XDMG"` wand, `"RG|XDMG"` ring, `"P|XPHB"` potion, `"SCF|XPHB"` spellcasting focus, `"INS|XPHB"` instrument, `"SC|XPHB"` scroll) or no `type` at all (wondrous items) — every one of these non-weapon/non-armor cases classifies as `"wondrous"`.

- [ ] **Step 1: Add `extractMagicItems()`**

Add this function to `scripts/extract-5etools.ts`, anywhere among the other `extract*` function definitions (e.g. right after `extractGear`):

```typescript
// --- Named Magic Items (XDMG) ---
function extractMagicItems() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "items.json"), "utf-8")
  );

  function classifyItemType(
    type: string | undefined
  ): "weapon" | "armor" | "wondrous" {
    const typeKey = type ? type.split("|")[0] : "";
    if (typeKey === "M" || typeKey === "R") return "weapon";
    if (["LA", "MA", "HA", "S"].includes(typeKey)) return "armor";
    return "wondrous";
  }

  const magicItems = raw.item
    .filter(
      (i: Record<string, unknown>) =>
        i.source === "XDMG" &&
        typeof i.rarity === "string" &&
        i.rarity !== "none" &&
        i.rarity !== "unknown"
    )
    .map((i: Record<string, unknown>) => ({
      name: i.name as string,
      rarity: i.rarity as string,
      itemType: classifyItemType(i.type as string | undefined),
      requiresAttunement: !!i.reqAttune,
      description: flattenEntries((i.entries as unknown[]) || []),
    }));

  const ts = `export interface MagicItemData {
  name: string;
  rarity: string;
  itemType: "weapon" | "armor" | "wondrous";
  requiresAttunement: boolean;
  description: string;
}

export const MAGIC_ITEMS: MagicItemData[] = ${JSON.stringify(magicItems, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "magic-items.ts"), ts);
  console.log(`Magic items: ${magicItems.length}`);
}
```

- [ ] **Step 2: Add `extractVariantRules()`**

Add this function right after `extractMagicItems`:

```typescript
// --- Rules Glossary (XPHB) ---
function extractVariantRules() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "variantrules.json"), "utf-8")
  );
  const rules = raw.variantrule
    .filter((v: Record<string, unknown>) => v.source === "XPHB")
    .map((v: Record<string, unknown>) => ({
      name: v.name as string,
      description: flattenEntries(v.entries as unknown[]),
    }));

  const ts = `export interface VariantRuleData {
  name: string;
  description: string;
}

export const VARIANT_RULES: VariantRuleData[] = ${JSON.stringify(rules, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "variant-rules.ts"), ts);
  console.log(`Variant rules: ${rules.length}`);
}
```

- [ ] **Step 3: Call both new functions in the "Run all" section**

Replace:
```typescript
// --- Run all ---
console.log("Extracting 5etools data...\n");
extractConditions();
extractWeapons();
extractArmor();
extractGear();
extractActions();
extractSkills();
extractSpells();
extractMastery();
extractFeats();
extractBarbarianProgression();
extractSubclasses();
console.log("\nDone!");
```
with:
```typescript
// --- Run all ---
console.log("Extracting 5etools data...\n");
extractConditions();
extractWeapons();
extractArmor();
extractGear();
extractActions();
extractSkills();
extractSpells();
extractMastery();
extractFeats();
extractMagicItems();
extractVariantRules();
extractBarbarianProgression();
extractSubclasses();
console.log("\nDone!");
```

- [ ] **Step 4: Set up the 5etools-src symlink (only if needed) and run extraction**

Check first: `ls ../dnd/5etools-src/data 2>&1` from the repo root. If that resolves, no symlink is needed — the extraction script's relative path will already work. If you're in a nested worktree and it doesn't resolve, follow the Global Constraints section's symlink instructions exactly, including deleting it immediately after this step.

Run: `npx tsx scripts/extract-5etools.ts`

Expected output includes two new lines: `Magic items: 435` and `Variant rules: 114`, with every other category's count unchanged from before this task (Conditions: 15, Weapons: 38, Armor: 13, Gear: 77, Actions: 18, Skills: 18, Spells: 391, Mastery properties: 8, Feats: 77, Barbarian levels: 20/26, Subclasses: 4/16).

- [ ] **Step 5: Verify the generated data**

Run:
```bash
grep -c '"name":' src/data/magic-items.ts
grep -c '"name":' src/data/variant-rules.ts
```
Expected: `435` and `114`.

Run:
```bash
grep -A3 '"name": "Axe of the Dwarvish Lords"' src/data/magic-items.ts | head -5
```
Expected: `"rarity": "artifact"`.

Run:
```bash
grep -o '"name": "Axe of the Dwarvish Lords".*Sunder' src/data/magic-items.ts | head -c 2000
```
(or open the file and search manually) — confirm the description contains all 5 "Blessings of Moradin" benefit names: Darkvision, Fortitude of Stone, Gifts of the Creator, One with the Forge, Sunder. This is the concrete, real-data proof that Task 1's `flattenEntries` fix actually resolves the data-loss bug it was written for.

Run:
```bash
git diff --stat
```
Expected: only `scripts/extract-5etools.ts` (the two new function additions + two new call lines), `src/data/magic-items.ts` (new file), `src/data/variant-rules.ts` (new file). No other `src/data/*.ts` file should show as changed.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add scripts/extract-5etools.ts src/data/magic-items.ts src/data/variant-rules.ts
git commit -m "feat: extract named magic items (XDMG) and rules glossary (XPHB)"
```

---

### Task 3: Wire magic items into the inventory description fallback

**Files:**
- Modify: `src/lib/inventory.ts`
- Modify: `src/lib/inventory.test.ts`

**Interfaces:**
- Consumes: `MAGIC_ITEMS` from `src/data/magic-items.ts` (Task 2).

- [ ] **Step 1: Write the failing test**

Add to `src/lib/inventory.test.ts`, inside the existing `describe("resolveItemDescription", ...)` block, right after the GEAR fallback test:

```typescript
  it("falls back to a MAGIC_ITEMS description when description is empty", () => {
    const item = {
      ...BASE_ITEM,
      name: "Axe of the Dwarvish Lords",
      description: "",
    };
    expect(resolveItemDescription(item)).toContain(
      "grants a +3 bonus to attack rolls and damage rolls"
    );
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- inventory.test.ts`
Expected: FAIL — the new case returns `""` (empty string), since `resolveItemDescription` doesn't check `MAGIC_ITEMS` yet.

- [ ] **Step 3: Add the fourth fallback link**

Replace:
```typescript
import { WEAPONS } from "@/data/weapons";
import { ARMOR } from "@/data/armor";
import { GEAR } from "@/data/gear";
import type { InventoryItem } from "./types";

export function resolveItemDescription(item: InventoryItem): string {
  if (item.description) return item.description;

  const weapon = WEAPONS.find((w) => w.name === item.name);
  if (weapon) {
    return `${weapon.damage} ${weapon.damageType} · ${weapon.properties.join(", ")}${weapon.mastery ? ` · Mastery: ${weapon.mastery}` : ""}`;
  }

  const armor = ARMOR.find((a) => a.name === item.name);
  if (armor) {
    return `AC ${armor.ac}${armor.stealthDisadvantage ? " · Desventaja en Sigilo" : ""}${armor.strengthRequirement ? ` · Requiere FUE ${armor.strengthRequirement}` : ""}`;
  }

  const gear = GEAR.find((g) => g.name === item.name);
  return gear?.description ?? "";
}
```
with:
```typescript
import { WEAPONS } from "@/data/weapons";
import { ARMOR } from "@/data/armor";
import { GEAR } from "@/data/gear";
import { MAGIC_ITEMS } from "@/data/magic-items";
import type { InventoryItem } from "./types";

export function resolveItemDescription(item: InventoryItem): string {
  if (item.description) return item.description;

  const weapon = WEAPONS.find((w) => w.name === item.name);
  if (weapon) {
    return `${weapon.damage} ${weapon.damageType} · ${weapon.properties.join(", ")}${weapon.mastery ? ` · Mastery: ${weapon.mastery}` : ""}`;
  }

  const armor = ARMOR.find((a) => a.name === item.name);
  if (armor) {
    return `AC ${armor.ac}${armor.stealthDisadvantage ? " · Desventaja en Sigilo" : ""}${armor.strengthRequirement ? ` · Requiere FUE ${armor.strengthRequirement}` : ""}`;
  }

  const gear = GEAR.find((g) => g.name === item.name);
  if (gear) return gear.description;

  const magicItem = MAGIC_ITEMS.find((m) => m.name === item.name);
  return magicItem?.description ?? "";
}
```
(Note: the `GEAR` branch changes from a bare `return gear?.description ?? "";` tail expression to an explicit `if (gear) return gear.description;` — this is required now that there's a further fallback after it; the final `return magicItem?.description ?? "";` takes over the "nothing matched" empty-string case.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- inventory.test.ts`
Expected: PASS, 6/6.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/inventory.ts src/lib/inventory.test.ts
git commit -m "feat: fall back to named magic item description in inventory"
```

---

### Task 4: Add "Objetos mágicos" and "Reglas" categories to Enciclopedia

**Files:**
- Modify: `src/components/tabs/EncyclopediaTab.tsx`

**Interfaces:**
- Consumes: `MAGIC_ITEMS` from `src/data/magic-items.ts`, `VARIANT_RULES` from `src/data/variant-rules.ts` (both Task 2).

- [ ] **Step 1: Add imports**

Replace:
```tsx
import { FEATS } from "@/data/feats";
import { SPELLS } from "@/data/spells";
```
with:
```tsx
import { FEATS } from "@/data/feats";
import { SPELLS } from "@/data/spells";
import { MAGIC_ITEMS } from "@/data/magic-items";
import { VARIANT_RULES } from "@/data/variant-rules";
```

- [ ] **Step 2: Add the two categories**

Replace:
```tsx
const CATEGORIES = [
  { id: "conditions", label: "Condiciones" },
  { id: "actions", label: "Acciones" },
  { id: "skills", label: "Habilidades" },
  { id: "weapons", label: "Armas" },
  { id: "armor", label: "Armaduras" },
  { id: "gear", label: "Equipo" },
  { id: "mastery", label: "Maestrías" },
  { id: "feats", label: "Dotes" },
  { id: "spells", label: "Hechizos" },
] as const;
```
with:
```tsx
const CATEGORIES = [
  { id: "conditions", label: "Condiciones" },
  { id: "actions", label: "Acciones" },
  { id: "skills", label: "Habilidades" },
  { id: "weapons", label: "Armas" },
  { id: "armor", label: "Armaduras" },
  { id: "gear", label: "Equipo" },
  { id: "mastery", label: "Maestrías" },
  { id: "feats", label: "Dotes" },
  { id: "spells", label: "Hechizos" },
  { id: "magicItems", label: "Objetos mágicos" },
  { id: "rules", label: "Reglas" },
] as const;
```

- [ ] **Step 3: Add the two build functions**

Add after `buildSpellItems` (before the `CATEGORY_ITEMS` map):

```tsx
const RARITY_ES: Record<string, string> = {
  common: "Común",
  uncommon: "Poco común",
  rare: "Raro",
  "very rare": "Muy raro",
  legendary: "Legendario",
  artifact: "Artefacto",
};

const ITEM_TYPE_ES: Record<string, string> = {
  weapon: "Arma",
  armor: "Armadura",
  wondrous: "Maravilloso",
};

function buildMagicItemItems(): EncyclopediaItem[] {
  return mapItems("magicItems", MAGIC_ITEMS, (m) => ({
    hint: RARITY_ES[m.rarity] || m.rarity,
    statBlock: [
      { label: "Rareza", value: RARITY_ES[m.rarity] || m.rarity },
      { label: "Tipo", value: ITEM_TYPE_ES[m.itemType] || m.itemType },
      m.requiresAttunement ? { label: "Sintonización", value: "Sí" } : null,
    ].filter((row): row is { label: string; value: string } => row !== null),
    description: m.description,
  }));
}

function buildRuleItems(): EncyclopediaItem[] {
  return mapItems("rules", VARIANT_RULES, (r) => ({
    hint: "",
    statBlock: [],
    description: r.description,
  }));
}
```

- [ ] **Step 4: Register both in `CATEGORY_ITEMS`**

Replace:
```tsx
const CATEGORY_ITEMS: Record<Category, () => EncyclopediaItem[]> = {
  conditions: buildConditionItems,
  actions: buildActionItems,
  skills: buildSkillItems,
  weapons: buildWeaponItems,
  armor: buildArmorItems,
  gear: buildGearItems,
  mastery: buildMasteryItems,
  feats: buildFeatItems,
  spells: buildSpellItems,
};
```
with:
```tsx
const CATEGORY_ITEMS: Record<Category, () => EncyclopediaItem[]> = {
  conditions: buildConditionItems,
  actions: buildActionItems,
  skills: buildSkillItems,
  weapons: buildWeaponItems,
  armor: buildArmorItems,
  gear: buildGearItems,
  mastery: buildMasteryItems,
  feats: buildFeatItems,
  spells: buildSpellItems,
  magicItems: buildMagicItemItems,
  rules: buildRuleItems,
};
```

Note: `Category` is derived automatically from `CATEGORIES` (`type Category = (typeof CATEGORIES)[number]["id"];`), so it already includes `"magicItems" | "rules"` once Step 2 is done — no separate type edit needed. `TRANSLATIONS` is a `Partial<Record<Category, ...>>` and neither new category needs an entry there (no Spanish translation dataset exists for either, consistent with Armas/Armaduras/Equipo/Dotes).

- [ ] **Step 5: Manual check**

Run `npm run dev`, open Enciclopedia, confirm "Objetos mágicos" and "Reglas" appear as new category tabs after "Hechizos". Open "Objetos mágicos", search or scroll to "Axe of the Dwarvish Lords", open it, and confirm the stat block shows Rareza "Artefacto", Tipo "Arma", Sintonización "Sí", and the description contains all 5 "Blessings of Moradin" benefit names (Darkvision, Fortitude of Stone, Gifts of the Creator, One with the Forge, Sunder) rendered as bold sub-headers via the existing `<Markdown>` wiring. Open "Reglas" and confirm entries like "Advantage" or "Cover" show up with their description.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/tabs/EncyclopediaTab.tsx
git commit -m "feat: add Objetos mágicos and Reglas categories to Enciclopedia"
```

---

### Task 5: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run the full check suite**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass, 0 lint errors, all tests green (including the 3 new `flattenEntries` tests from Task 1 and the 1 new `resolveItemDescription` test from Task 3).

- [ ] **Step 2: Confirm no stray symlink or build artifacts were left behind**

Run: `find . -maxdepth 3 -type l 2>/dev/null` (from the repo root) and confirm no unexpected symlinks exist under `.claude/worktrees/` or anywhere else in the tree, per the Global Constraints note. If this plan was executed in a worktree, confirm cleanup happens per the standard worktree-finishing process, not left dangling.

- [ ] **Step 3: Full manual walkthrough**

Run `npm run dev` and check:
1. Enciclopedia → Objetos mágicos: scroll the list, confirm ~435 entries load without lag or console errors, open a few of different rarities (common, legendary, artifact) and confirm the stat block and description render correctly.
2. Enciclopedia → Reglas: confirm 114 entries, open "Advantage" and "Bonus Action" and confirm their text matches what you'd expect from the 2024 rules.
3. Inventario: add an item named exactly "Axe of the Dwarvish Lords" with an empty description, expand it, and confirm the fallback shows the real magic item text (proves Task 3's wiring end-to-end, not just via unit test).
4. Check the browser console for errors across all of the above.

- [ ] **Step 4: Confirm no regressions in existing Enciclopedia categories**

Spot-check that Condiciones, Armas, Dotes, and Hechizos (categories untouched by this plan) still load and render identically to before — confirms the new categories didn't disturb the shared `mapItems`/`CATEGORY_ITEMS`/search/favorites machinery.

- [ ] **Step 5: Final commit (if Step 3 or 4 surfaces any fix)**

If any of the manual checks above reveal a bug, fix it, re-run Step 1, and commit:
```bash
git add -A
git commit -m "fix: address magic items / rules glossary issues found in verification pass"
```
If nothing needs fixing, this task produces no commit — it's a pure verification gate.
