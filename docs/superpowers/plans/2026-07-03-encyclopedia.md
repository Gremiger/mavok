# Encyclopedia / Quick Lookup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a table-wide rules-reference tab ("Enciclopedia") that lets anyone at the table search/browse conditions, actions, skills, weapons, armor, gear, weapon mastery properties, feats, and spells extracted from 5etools-src.

**Architecture:** Extend `scripts/extract-5etools.ts` with three new extractors (actions, skills, spells) producing generated `src/data/*.ts` files, following the exact pattern of the existing extractors. Build a new `EncyclopediaTab.tsx` that normalizes all 9 reference-data arrays into one common shape and reuses `NotesTab.tsx`'s proven search/category-pill UI pattern plus `CombatTab.tsx`'s detail-`Modal` pattern. Wire the tab into the existing 5-tab bottom nav in `src/app/page.tsx`.

**Tech Stack:** TypeScript, Next.js 15 (static export), no test framework — verification is `npx tsc --noEmit && npm run build && npm run lint` plus manual dev-server/browser checks per CLAUDE.md.

## Global Constraints

- `npm run lint` must report 0 errors — it's the only tool that catches React Hooks ordering violations.
- `output: 'export'` — no server-only APIs.
- `src/data/*.ts` (except `mavok-default.ts`) are fully generated from `scripts/extract-5etools.ts` — do not hand-edit `actions.ts`, `skills-reference.ts`, or `spells.ts`; edit the script and re-run it.
- 5etools source data lives at `../../dnd/5etools-src/data` relative to `scripts/` — `TOOLS_DIR` is already correct, don't change it.
- No changes to `Character` type, `recalculate.ts`, or any character-specific state — this feature reads only static reference data.
- Spanish UI labels, English D&D terms (per CLAUDE.md) — category labels and search placeholder are Spanish; spell/condition/item names and D&D terminology (Action, Bonus Action, Sphere, etc.) stay English.

---

### Task 1: Extract actions, skills, and spells from 5etools-src

**Files:**
- Modify: `scripts/extract-5etools.ts` (add 3 new functions, wire into run-all section ~line 425–433)
- Generated (do not hand-edit): `src/data/actions.ts`, `src/data/skills-reference.ts`, `src/data/spells.ts` (all new)

**Interfaces:**
- Consumes: existing `flattenEntries`/`stripMarkup` helpers (top of `scripts/extract-5etools.ts`).
- Produces:
  ```ts
  export interface ActionData { name: string; description: string; }
  export const ACTIONS: ActionData[];

  export interface SkillData { name: string; ability: string; description: string; }
  export const SKILLS_REFERENCE: SkillData[];

  export interface SpellData {
    name: string;
    level: number;
    school: string;
    castingTime: string;
    range: string;
    components: string;
    duration: string;
    concentration: boolean;
    ritual: boolean;
    description: string;
  }
  export const SPELLS: SpellData[];
  ```

- [ ] **Step 1: Add `extractActions()`**

In `scripts/extract-5etools.ts`, insert this function after `extractGear()` (right before the `// --- Weapon Mastery Properties ---` comment):

```ts
// --- Actions ---
function extractActions() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "actions.json"), "utf-8")
  );
  const actions = raw.action
    .filter((a: Record<string, unknown>) => a.source === "XPHB")
    .map((a: Record<string, unknown>) => ({
      name: a.name as string,
      description: flattenEntries(a.entries as unknown[]),
    }));

  const ts = `export interface ActionData {
  name: string;
  description: string;
}

export const ACTIONS: ActionData[] = ${JSON.stringify(actions, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "actions.ts"), ts);
  console.log(`Actions: ${actions.length}`);
}
```

- [ ] **Step 2: Add `extractSkills()`**

Insert immediately after `extractActions()`:

```ts
// --- Skills ---
function extractSkills() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "skills.json"), "utf-8")
  );
  const skills = raw.skill
    .filter((s: Record<string, unknown>) => s.source === "XPHB")
    .map((s: Record<string, unknown>) => ({
      name: s.name as string,
      ability: s.ability as string,
      description: flattenEntries(s.entries as unknown[]),
    }));

  const ts = `export interface SkillData {
  name: string;
  ability: string;
  description: string;
}

export const SKILLS_REFERENCE: SkillData[] = ${JSON.stringify(skills, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "skills-reference.ts"), ts);
  console.log(`Skills: ${skills.length}`);
}
```

- [ ] **Step 3: Add `extractSpells()`**

Insert immediately after `extractSkills()`:

```ts
// --- Spells ---
function extractSpells() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "spells/spells-xphb.json"), "utf-8")
  );
  const schoolMap: Record<string, string> = {
    A: "Abjuration", C: "Conjuration", D: "Divination", E: "Enchantment",
    V: "Evocation", I: "Illusion", N: "Necromancy", T: "Transmutation",
  };

  function formatCastingTime(time: Record<string, unknown>[]): string {
    const t = time[0] as { number: number; unit: string; condition?: string };
    const unitLabels: Record<string, string> = {
      action: "Action", bonus: "Bonus Action", reaction: "Reaction",
      minute: "Minute", hour: "Hour",
    };
    const label = unitLabels[t.unit] || t.unit;
    const plural =
      t.number > 1 && (t.unit === "minute" || t.unit === "hour") ? "s" : "";
    const base = `${t.number} ${label}${plural}`;
    return t.condition ? `${base}, ${t.condition}` : base;
  }

  function formatRange(range: Record<string, unknown>): string {
    const type = range.type as string;
    const distance = range.distance as
      | { type: string; amount?: number }
      | undefined;
    if (type === "point") {
      if (!distance) return "Self";
      switch (distance.type) {
        case "touch":
          return "Touch";
        case "self":
          return "Self";
        case "sight":
          return "Sight";
        case "unlimited":
          return "Unlimited";
        case "feet":
          return `${distance.amount} feet`;
        case "miles":
          return `${distance.amount} miles`;
        default:
          return distance.type;
      }
    }
    const shapeLabels: Record<string, string> = {
      cone: "Cone", sphere: "Sphere", cube: "Cube", line: "Line",
      emanation: "Emanation",
    };
    const unit = distance?.type === "miles" ? "mile" : "foot";
    return `Self (${distance?.amount}-${unit} ${shapeLabels[type] || type})`;
  }

  function formatDuration(duration: Record<string, unknown>[]): string {
    const d = duration[0] as {
      type: string;
      duration?: { amount: number; type: string };
    };
    if (d.type === "instant") return "Instantaneous";
    if (d.type === "permanent") return "Until dispelled";
    if (d.type === "special") return "Special";
    if (d.type === "timed" && d.duration) {
      const amt = d.duration.amount;
      const unit = d.duration.type;
      const plural = amt > 1 ? "s" : "";
      return `${amt} ${unit.charAt(0).toUpperCase()}${unit.slice(1)}${plural}`;
    }
    return d.type;
  }

  function formatComponents(components: Record<string, unknown>): string {
    const parts: string[] = [];
    if (components.v) parts.push("V");
    if (components.s) parts.push("S");
    if (components.m) {
      const m = components.m;
      const text = typeof m === "string" ? m : (m as { text?: string }).text;
      parts.push(text ? `M (${text})` : "M");
    }
    return parts.join(", ");
  }

  const spells = raw.spell
    .filter((s: Record<string, unknown>) => s.source === "XPHB")
    .map((s: Record<string, unknown>) => {
      const duration = s.duration as Record<string, unknown>[];
      const higherLevel = s.entriesHigherLevel
        ? flattenEntries(s.entriesHigherLevel as unknown[])
        : "";
      const baseDescription = flattenEntries(s.entries as unknown[]);
      return {
        name: s.name as string,
        level: s.level as number,
        school: schoolMap[s.school as string] || (s.school as string),
        castingTime: formatCastingTime(s.time as Record<string, unknown>[]),
        range: formatRange(s.range as Record<string, unknown>),
        components: formatComponents(s.components as Record<string, unknown>),
        duration: formatDuration(duration),
        concentration: !!(duration[0] as Record<string, unknown>)
          ?.concentration,
        ritual: !!(s.meta as Record<string, unknown> | undefined)?.ritual,
        description: higherLevel
          ? `${baseDescription} ${higherLevel}`
          : baseDescription,
      };
    });

  const ts = `export interface SpellData {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
}

export const SPELLS: SpellData[] = ${JSON.stringify(spells, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "spells.ts"), ts);
  console.log(`Spells: ${spells.length}`);
}
```

- [ ] **Step 4: Wire the three new extractors into the run-all section**

Find the `// --- Run all ---` section at the end of the file and change it to:

```ts
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

- [ ] **Step 5: Run the extraction script and verify output**

Run: `npx tsx scripts/extract-5etools.ts`

Expected output includes:
```
Actions: 18
Skills: 18
Spells: 391
```
(Along with the previously-existing lines for conditions/weapons/armor/gear/mastery/feats/etc.)

Verify the new files exist and have sensible content:

```bash
grep -c '"name"' src/data/actions.ts src/data/skills-reference.ts src/data/spells.ts
```

Expected: `18`, `18`, `391` respectively.

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add scripts/extract-5etools.ts src/data/actions.ts src/data/skills-reference.ts src/data/spells.ts
git commit -m "feat: extract actions, skills, and spells reference data"
```

---

### Task 2: Build EncyclopediaTab component

**Files:**
- Create: `src/components/tabs/EncyclopediaTab.tsx`

**Interfaces:**
- Consumes: `CONDITIONS` (`src/data/conditions.ts`), `ACTIONS`/`SKILLS_REFERENCE`/`SPELLS` (Task 1), `WEAPONS` (`src/data/weapons.ts`), `ARMOR` (`src/data/armor.ts`), `GEAR` (`src/data/gear.ts`), `MASTERY_PROPERTIES` (`src/data/mastery.ts`), `FEATS` (`src/data/feats.ts`); `Modal` (`src/components/ui/Modal.tsx`, props `{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }`); `abilityLabel` (`src/lib/utils.ts`, `(key: AbilityScore) => string`); `AbilityScore` type (`src/lib/types.ts`).
- Produces: `export function EncyclopediaTab()` — consumed by Task 3.

- [ ] **Step 1: Create the file with imports, category list, and the common item shape**

Create `src/components/tabs/EncyclopediaTab.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CONDITIONS } from "@/data/conditions";
import { ACTIONS } from "@/data/actions";
import { SKILLS_REFERENCE } from "@/data/skills-reference";
import { WEAPONS } from "@/data/weapons";
import { ARMOR } from "@/data/armor";
import { GEAR } from "@/data/gear";
import { MASTERY_PROPERTIES } from "@/data/mastery";
import { FEATS } from "@/data/feats";
import { SPELLS } from "@/data/spells";
import { abilityLabel } from "@/lib/utils";
import type { AbilityScore } from "@/lib/types";

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

type Category = (typeof CATEGORIES)[number]["id"];

interface EncyclopediaItem {
  id: string;
  category: Category;
  name: string;
  hint: string;
  detail: string;
}
```

- [ ] **Step 2: Add the nine item-builder functions**

Append to the same file, after the `EncyclopediaItem` interface:

```tsx
function buildConditionItems(): EncyclopediaItem[] {
  return CONDITIONS.map((c) => ({
    id: `conditions-${c.name}`,
    category: "conditions",
    name: c.name,
    hint: "",
    detail: c.description,
  }));
}

function buildActionItems(): EncyclopediaItem[] {
  return ACTIONS.map((a) => ({
    id: `actions-${a.name}`,
    category: "actions",
    name: a.name,
    hint: "",
    detail: a.description,
  }));
}

function buildSkillItems(): EncyclopediaItem[] {
  return SKILLS_REFERENCE.map((s) => ({
    id: `skills-${s.name}`,
    category: "skills",
    name: s.name,
    hint: abilityLabel(s.ability as AbilityScore),
    detail: s.description,
  }));
}

function buildWeaponItems(): EncyclopediaItem[] {
  return WEAPONS.map((w) => ({
    id: `weapons-${w.name}`,
    category: "weapons",
    name: w.name,
    hint: `${w.damage} ${w.damageType}`,
    detail: [
      `${w.type === "melee" ? "Cuerpo a cuerpo" : "A distancia"} · ${w.category}`,
      `Daño: ${w.damage} ${w.damageType}`,
      w.range ? `Alcance: ${w.range}` : null,
      `Peso: ${w.weight} lb${w.value !== null ? ` · Valor: ${w.value} gp` : ""}`,
      `Propiedades: ${w.properties.length ? w.properties.join(", ") : "Ninguna"}`,
      w.mastery ? `Maestría: ${w.mastery}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  }));
}

function buildArmorItems(): EncyclopediaItem[] {
  return ARMOR.map((a) => ({
    id: `armor-${a.name}`,
    category: "armor",
    name: a.name,
    hint: `AC ${a.ac}`,
    detail: [
      `Tipo: ${a.type}`,
      `CA: ${a.ac}`,
      `Peso: ${a.weight} lb${a.value !== null ? ` · Valor: ${a.value} gp` : ""}`,
      a.stealthDisadvantage ? "Desventaja en Sigilo" : null,
      a.strengthRequirement ? `Requiere FUE ${a.strengthRequirement}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  }));
}

function buildGearItems(): EncyclopediaItem[] {
  return GEAR.map((g) => ({
    id: `gear-${g.name}`,
    category: "gear",
    name: g.name,
    hint: g.value !== null ? `${g.value} gp` : "",
    detail: g.description,
  }));
}

function buildMasteryItems(): EncyclopediaItem[] {
  return MASTERY_PROPERTIES.map((m) => ({
    id: `mastery-${m.name}`,
    category: "mastery",
    name: m.name,
    hint: "",
    detail: m.description,
  }));
}

function buildFeatItems(): EncyclopediaItem[] {
  return FEATS.map((f) => ({
    id: `feats-${f.name}`,
    category: "feats",
    name: f.name,
    hint: f.category,
    detail: [
      [
        f.category,
        f.levelRequired ? `Nivel ${f.levelRequired}` : null,
        f.repeatable ? "Repetible" : null,
      ]
        .filter(Boolean)
        .join(" · "),
      "",
      f.description,
    ].join("\n"),
  }));
}

function buildSpellItems(): EncyclopediaItem[] {
  return SPELLS.map((s) => ({
    id: `spells-${s.name}`,
    category: "spells",
    name: s.name,
    hint: `${s.level === 0 ? "Cantrip" : `Nv. ${s.level}`} · ${s.school}`,
    detail: [
      `${s.level === 0 ? "Cantrip" : `Nivel ${s.level}`} · ${s.school}${s.ritual ? " (Ritual)" : ""}`,
      `Tiempo de lanzamiento: ${s.castingTime}`,
      `Alcance: ${s.range}`,
      `Componentes: ${s.components}`,
      `Duración: ${s.duration}${s.concentration ? " (Concentración)" : ""}`,
      "",
      s.description,
    ].join("\n"),
  }));
}

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

- [ ] **Step 3: Add the `EncyclopediaTab` component**

Append to the same file:

```tsx
export function EncyclopediaTab() {
  const [activeCategory, setActiveCategory] = useState<Category>("conditions");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingItem, setViewingItem] = useState<EncyclopediaItem | null>(null);

  const allItems = useMemo(
    () => CATEGORIES.flatMap((c) => CATEGORY_ITEMS[c.id]()),
    []
  );
  const categoryItems = useMemo(
    () => CATEGORY_ITEMS[activeCategory](),
    [activeCategory]
  );

  const searchResults = searchQuery
    ? allItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  function renderRow(item: EncyclopediaItem, showCategoryBadge: boolean) {
    return (
      <div
        key={item.id}
        onClick={() => setViewingItem(item)}
        className="stone-card rounded-lg p-3 cursor-pointer active:scale-[0.99] transition-transform flex items-center gap-2"
      >
        {showCategoryBadge && (
          <span className="text-[0.6rem] px-1.5 py-0.5 bg-accent/20 text-accent rounded shrink-0">
            {CATEGORIES.find((c) => c.id === item.category)?.label}
          </span>
        )}
        <span className="text-sm truncate flex-1">{item.name}</span>
        {item.hint && (
          <span className="text-muted text-xs shrink-0">{item.hint}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-2 border-b border-border bg-card shrink-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en la enciclopedia..."
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
        />
      </div>

      {/* Category navigation (hidden while searching) */}
      {!searchQuery && (
        <div className="flex overflow-x-auto border-b border-border bg-card px-2 gap-1 shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-2.5 text-xs whitespace-nowrap transition-colors border-b-2 ${
                activeCategory === cat.id
                  ? "text-accent border-accent"
                  : "text-muted border-transparent"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {searchQuery ? (
          searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((item) => renderRow(item, true))}
            </div>
          ) : (
            <p className="text-muted text-sm text-center py-8">
              Sin resultados para &quot;{searchQuery}&quot;.
            </p>
          )
        ) : (
          <div className="space-y-2">
            {categoryItems.map((item) => renderRow(item, false))}
          </div>
        )}
      </div>

      <Modal
        open={viewingItem !== null}
        onClose={() => setViewingItem(null)}
        title={viewingItem?.name ?? ""}
      >
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
          {viewingItem?.detail}
        </p>
      </Modal>
    </div>
  );
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/tabs/EncyclopediaTab.tsx
git commit -m "feat: add EncyclopediaTab with category browse and cross-category search"
```

---

### Task 3: Wire EncyclopediaTab into navigation and verify end-to-end

**Files:**
- Modify: `src/app/page.tsx` (imports ~line 7–14, `Tab` type ~line 18, `TAB_ORDER` ~line 20, `TAB_META` ~line 22–28, `tabContent` ~line 67–73)

**Interfaces:**
- Consumes: `EncyclopediaTab` from Task 2 (`src/components/tabs/EncyclopediaTab.tsx`).
- Produces: nothing new — this is the final integration point.

- [ ] **Step 1: Import EncyclopediaTab and the Library icon**

In `src/app/page.tsx`, update the imports:

```ts
import { SheetTab } from "@/components/tabs/SheetTab";
import { CombatTab } from "@/components/tabs/CombatTab";
import { InventoryTab } from "@/components/tabs/InventoryTab";
import { NotesTab } from "@/components/tabs/NotesTab";
import { EncyclopediaTab } from "@/components/tabs/EncyclopediaTab";
import { SettingsTab } from "@/components/tabs/SettingsTab";
```

```ts
import { Shield, Swords, Backpack, BookOpen, Library, Settings } from "lucide-react";
```

- [ ] **Step 2: Add the tab to the `Tab` type and `TAB_ORDER`**

```ts
type Tab = "ficha" | "combate" | "inventario" | "notas" | "enciclopedia" | "ajustes";

const TAB_ORDER: Tab[] = ["ficha", "combate", "inventario", "notas", "enciclopedia", "ajustes"];
```

- [ ] **Step 3: Add the tab to `TAB_META`**

```ts
const TAB_META: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "ficha", label: "Ficha", icon: <Shield size={20} /> },
  { id: "combate", label: "Combate", icon: <Swords size={20} /> },
  { id: "inventario", label: "Inventario", icon: <Backpack size={20} /> },
  { id: "notas", label: "Notas", icon: <BookOpen size={20} /> },
  { id: "enciclopedia", label: "Enciclopedia", icon: <Library size={20} /> },
  { id: "ajustes", label: "Ajustes", icon: <Settings size={20} /> },
];
```

- [ ] **Step 4: Add the tab to `tabContent`**

```ts
  const tabContent: Record<Tab, ReactNode> = {
    ficha: <SheetTab />,
    combate: <CombatTab />,
    inventario: <InventoryTab />,
    notas: <NotesTab />,
    enciclopedia: <EncyclopediaTab />,
    ajustes: <SettingsTab />,
  };
```

- [ ] **Step 5: Type-check, build, lint**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: build succeeds, lint reports 0 errors (pre-existing `@next/next/no-img-element` warnings in `SettingsTab.tsx`/`SheetTab.tsx` are unrelated and expected to remain).

- [ ] **Step 6: Manual browser verification**

Start the dev server and confirm with a real browser (per CLAUDE.md's UI-testing requirement):

```bash
npm run dev &
echo $! > /tmp/mavok-dev.pid
until curl -sf http://localhost:3000 >/dev/null; do sleep 1; done
```

Drive it (headless Chromium, or manually if you have a display) through:
- Tap the new "Enciclopedia" tab in the bottom nav — confirm it renders with the 9 category pills and "Condiciones" active by default.
- Tap through a few categories (e.g. "Hechizos", "Armas") — confirm each shows a scrollable list of names with the expected hint text (e.g. spells show "Nv. X · School", weapons show damage).
- Tap an item (e.g. a spell) — confirm the detail modal opens with formatted casting time/range/components/duration and the description text, and closes via the ✕ or backdrop tap.
- Type into the search bar (e.g. "fire") — confirm the category pills hide and cross-category results appear with category badges, spanning multiple categories (e.g. a spell and a gear item both matching).
- Check the browser console for errors — expect none.

Stop the dev server when done:
```bash
kill "$(cat /tmp/mavok-dev.pid)"
```

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx public/sw.js
git commit -m "feat: wire EncyclopediaTab into the bottom navigation"
```

(`public/sw.js` is regenerated by the `prebuild` script during `npm run build` in Step 5 — commit it alongside per the project's established convention.)

---

## Self-Review Notes

- **Spec coverage:** Data layer (actions/skills/spells extraction) ✅ Task 1. Navigation (6th tab, new icon) ✅ Task 3. EncyclopediaTab UI (9 category pills, search-hides-pills-shows-tagged-results, detail modal) ✅ Task 2. Out-of-scope items from the spec (no class-based spell filtering, no level/school filter UI, no character-context reads) are honored — `EncyclopediaTab` never imports `useCharacterContext`.
- **Type consistency:** `EncyclopediaItem` shape (`id`, `category`, `name`, `hint`, `detail`) used consistently across all 9 builder functions and the render/search logic. `Category` union matches `CATEGORIES` ids exactly, used as the `CATEGORY_ITEMS` record key type. `abilityLabel(key: AbilityScore)` signature matches its existing definition in `src/lib/utils.ts:66`.
- **No placeholders:** every step has literal, complete code.
