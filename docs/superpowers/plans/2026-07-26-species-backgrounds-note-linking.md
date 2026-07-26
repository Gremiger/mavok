# Species/Background Catalogs and @mention Note Linking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "Especies" and "Trasfondos" categories to Enciclopedia, and let `@Name` in Notas/Misiones/Diario content link directly to the matching note, NPC, quest, or journal entry.

**Architecture:** A second, independent fix to `flattenEntries` (a new data shape: singular `.entry` string fields, plus a colon-doubling cosmetic bug) unlocks clean extraction of two new reference categories, wired into Enciclopedia exactly like every prior category. Separately, a new `src/lib/note-links.ts` module does pure-text `@mention` → markdown-link conversion; `Markdown` gains a link renderer and an `onInternalLink` callback; `NotesTab.tsx`'s existing cross-section navigation (already used by search) gets one more entry point. A pre-existing inconsistency (`NoteList`/`QuestList` jump to *edit* on external navigation, `JournalList` already correctly jumps to *view*) gets fixed as part of wiring this up.

**Tech Stack:** Next.js 15 / React 19 / TypeScript / Tailwind CSS 4 / Vitest / tsx. No new npm dependencies.

## Global Constraints

- Verify every task with `npx tsc --noEmit && npm run build && npm run lint && npm test` before committing — all four must pass.
- `npm run lint` must report 0 errors.
- Never hand-edit `src/data/*.ts` — regenerate via `npx tsx scripts/extract-5etools.ts` after changing the extraction script.
- No `Character`/`InventoryItem`/`Notes` schema changes, no migration — species/background data is generated reference data; `@mention` links are resolved fresh from note titles at render time, nothing new is persisted.
- Spanish UI labels, English D&D terms.
- Commit messages: no "Co-authored-by" (or similar attribution) trailer.
- **Environment note for the task that runs `npx tsx scripts/extract-5etools.ts`:** if working in a nested git worktree, the script's relative path to `../../dnd/5etools-src/data` may not resolve without a temporary symlink at `<repo>/.claude/worktrees/dnd` pointing to the real sibling `dnd` folder. If you create one, **delete it in the same task, immediately after running the extraction** — a past plan left this in place and it polluted `lint`/`test` runs from the main checkout after merging.

---

### Task 1: Fix `flattenEntries` for singular `.entry` fields and colon-doubling

**Files:**
- Modify: `scripts/extract-helpers.ts`
- Modify: `scripts/extract-5etools.test.ts`

**Interfaces:**
- `flattenEntries`'s signature is unchanged (`(entries: unknown[]) => string`) — only its internal handling of one more object shape changes. No other file's calls to it change.

**Context:** Confirmed directly against `../dnd/5etools-src/data/backgrounds.json`'s real "Farmer" entry (Mavok's own background): its feature list uses `{"type": "item", "name": "Feat:", "entry": "..."}` — note **`entry`, singular string**, not the `entries` array shape every previously-extracted category has used. `flattenEntries` today only checks `.entries` (array) and `.items` (array, added by a previous plan) — it has no branch for a singular `.entry` string, so this content would be silently dropped, exactly like the nested-list bug fixed before. Separately, this data's `name` fields already end in `:` (`"Feat:"`), which the existing `` `**${obj.name}:** ` `` template would double up into `**Feat::**`.

- [ ] **Step 1: Write the failing test**

Add to `scripts/extract-5etools.test.ts`, inside the existing `describe("flattenEntries", ...)` block:

```typescript
  it("recurses into a singular `.entry` string field and doesn't double a trailing colon in the name", () => {
    const entries = [
      {
        type: "list",
        items: [{ type: "item", name: "Feat:", entry: "{@feat Tough|XPHB}" }],
      },
    ];
    expect(flattenEntries(entries)).toBe("**Feat:** Tough");
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- extract-5etools.test.ts`
Expected: FAIL — actual output is `"**Feat::** "` (doubled colon, no "Tough" — the `.entry` string is silently dropped).

- [ ] **Step 3: Fix `flattenEntries`**

Replace:
```typescript
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
with:
```typescript
export function flattenEntries(entries: unknown[]): string {
  const parts: string[] = [];
  for (const e of entries) {
    if (typeof e === "string") {
      parts.push(stripMarkup(e));
    } else if (typeof e === "object" && e !== null) {
      const obj = e as Record<string, unknown>;
      if (typeof obj.name === "string") {
        const label = obj.name.endsWith(":") ? obj.name.slice(0, -1) : obj.name;
        parts.push(`**${label}:** `);
      }
      if (Array.isArray(obj.entries)) {
        parts.push(flattenEntries(obj.entries));
      }
      if (Array.isArray(obj.items)) {
        parts.push(flattenEntries(obj.items));
      }
      if (typeof obj.entry === "string") {
        parts.push(stripMarkup(obj.entry));
      }
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- extract-5etools.test.ts`
Expected: PASS, 4/4 (the 3 existing cases plus this new one).

- [ ] **Step 5: Verify nothing else broke**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass. This task doesn't re-run extraction, so no `src/data/*.ts` file changes yet — that happens in Task 2.

- [ ] **Step 6: Commit**

```bash
git add scripts/extract-helpers.ts scripts/extract-5etools.test.ts
git commit -m "fix: flatten singular .entry fields and avoid colon-doubling in extraction"
```

---

### Task 2: Extract Species (XPHB) and Backgrounds (XPHB)

**Files:**
- Modify: `scripts/extract-5etools.ts` (add `extractSpecies()`, `extractBackgrounds()`, call both at the bottom)
- Create (generated): `src/data/species.ts`, `src/data/backgrounds.ts`

**Interfaces:**
- Produces: `SpeciesData { name: string; size: string; speed: number; description: string }` exported as `SPECIES` from `src/data/species.ts`. `BackgroundData { name: string; description: string }` exported as `BACKGROUNDS` from `src/data/backgrounds.ts`.
- Consumes: `flattenEntries` from `scripts/extract-helpers.ts` (Task 1's fix).

**Context:** Confirmed directly: `../dnd/5etools-src/data/races.json` filtered to `source === "XPHB"` yields exactly 10 species (Aasimar, Dragonborn, Dwarf, Elf, Gnome, Goliath, Halfling, Human, Orc, Tiefling). `../dnd/5etools-src/data/backgrounds.json` filtered to `source === "XPHB"` yields exactly 16 backgrounds (Acolyte, Artisan, Charlatan, Criminal, Entertainer, Farmer, Guard, Guide, Hermit, Merchant, Noble, Sage, Sailor, Scribe, Soldier, Wayfarer) — "Farmer" confirmed to match Mavok's own `meta.background` in `mavok-default.ts`.

- [ ] **Step 1: Add `extractSpecies()`**

Add this function to `scripts/extract-5etools.ts`, right after `extractVariantRules`:

```typescript
// --- Species (XPHB) ---
function extractSpecies() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "races.json"), "utf-8")
  );
  const sizeMap: Record<string, string> = {
    T: "Diminuto",
    S: "Pequeño",
    M: "Mediano",
    L: "Grande",
    H: "Enorme",
  };
  const species = raw.race
    .filter((r: Record<string, unknown>) => r.source === "XPHB")
    .map((r: Record<string, unknown>) => {
      const sizes = (r.size as string[]) || ["M"];
      return {
        name: r.name as string,
        size: sizes.map((s) => sizeMap[s] || s).join("/"),
        speed: typeof r.speed === "number" ? r.speed : 30,
        description: flattenEntries((r.entries as unknown[]) || []),
      };
    });

  const ts = `export interface SpeciesData {
  name: string;
  size: string;
  speed: number;
  description: string;
}

export const SPECIES: SpeciesData[] = ${JSON.stringify(species, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "species.ts"), ts);
  console.log(`Species: ${species.length}`);
}
```

- [ ] **Step 2: Add `extractBackgrounds()`**

Add right after `extractSpecies`:

```typescript
// --- Backgrounds (XPHB) ---
function extractBackgrounds() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "backgrounds.json"), "utf-8")
  );
  const backgrounds = raw.background
    .filter((b: Record<string, unknown>) => b.source === "XPHB")
    .map((b: Record<string, unknown>) => ({
      name: b.name as string,
      description: flattenEntries((b.entries as unknown[]) || []),
    }));

  const ts = `export interface BackgroundData {
  name: string;
  description: string;
}

export const BACKGROUNDS: BackgroundData[] = ${JSON.stringify(backgrounds, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "backgrounds.ts"), ts);
  console.log(`Backgrounds: ${backgrounds.length}`);
}
```

- [ ] **Step 3: Call both in the "Run all" section**

Replace:
```typescript
extractMagicItems();
extractVariantRules();
extractBarbarianProgression();
```
with:
```typescript
extractMagicItems();
extractVariantRules();
extractSpecies();
extractBackgrounds();
extractBarbarianProgression();
```

- [ ] **Step 4: Run extraction (set up the symlink first only if needed, per Global Constraints)**

Run: `npx tsx scripts/extract-5etools.ts`

Expected output includes two new lines: `Species: 10` and `Backgrounds: 16`, every other category's count unchanged from before this task.

- [ ] **Step 5: Verify the generated data**

Run:
```bash
grep -c '"name":' src/data/species.ts
grep -c '"name":' src/data/backgrounds.ts
```
Expected: `10` and `16`.

Run:
```bash
grep -A4 '"name": "Goliath"' src/data/species.ts
```
Expected: `"size": "Mediano"`, `"speed": 35`, and a description containing "Giant Ancestry" and at least one of the named ancestry benefits (e.g. "Cloud's Jaunt" or "Fire's Burn").

Run:
```bash
grep -A2 '"name": "Farmer"' src/data/backgrounds.ts
```
Expected: a description containing `**Feat:** Tough` (not `**Feat::**`), proving Task 1's fix actually resolves the real data-loss bug it was written for, and `**Skill Proficiencies:**` mentioning Animal Handling and Nature.

Run:
```bash
git diff --stat
```
Expected: only `scripts/extract-5etools.ts`, `src/data/species.ts` (new), `src/data/backgrounds.ts` (new). No other `src/data/*.ts` file should show as changed — if any other file changed, Task 1's fix touched a shape used elsewhere too; read the diff before proceeding and confirm it's a genuine improvement (recovered content), same as happened in a prior plan, not a regression.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add scripts/extract-5etools.ts src/data/species.ts src/data/backgrounds.ts
git commit -m "feat: extract Species (XPHB) and Backgrounds (XPHB)"
```

(If Step 5's `git diff --stat` showed other changed files, `git add` those too and note the recovered content in the commit message, matching how a similar situation was handled previously.)

---

### Task 3: Add "Especies" and "Trasfondos" categories to Enciclopedia

**Files:**
- Modify: `src/components/tabs/EncyclopediaTab.tsx`

**Interfaces:**
- Consumes: `SPECIES` from `src/data/species.ts`, `BACKGROUNDS` from `src/data/backgrounds.ts` (both Task 2).

- [ ] **Step 1: Add imports**

Replace:
```tsx
import { MAGIC_ITEMS } from "@/data/magic-items";
import { VARIANT_RULES } from "@/data/variant-rules";
```
with:
```tsx
import { MAGIC_ITEMS } from "@/data/magic-items";
import { VARIANT_RULES } from "@/data/variant-rules";
import { SPECIES } from "@/data/species";
import { BACKGROUNDS } from "@/data/backgrounds";
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
  { id: "magicItems", label: "Objetos mágicos" },
  { id: "rules", label: "Reglas" },
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
  { id: "species", label: "Especies" },
  { id: "backgrounds", label: "Trasfondos" },
] as const;
```

- [ ] **Step 3: Add the two build functions**

Add after `buildRuleItems` (before `CATEGORY_ITEMS`):

```tsx
function buildSpeciesItems(): EncyclopediaItem[] {
  return mapItems("species", SPECIES, (s) => ({
    hint: `${s.size} · ${s.speed} ft`,
    statBlock: [
      { label: "Tamaño", value: s.size },
      { label: "Velocidad", value: `${s.speed} ft` },
    ],
    description: s.description,
  }));
}

function buildBackgroundItems(): EncyclopediaItem[] {
  return mapItems("backgrounds", BACKGROUNDS, (b) => ({
    hint: "",
    statBlock: [],
    description: b.description,
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
  magicItems: buildMagicItemItems,
  rules: buildRuleItems,
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
  species: buildSpeciesItems,
  backgrounds: buildBackgroundItems,
};
```

- [ ] **Step 5: Manual check**

Run `npm run dev`, open Enciclopedia, confirm "Especies" and "Trasfondos" appear as new tabs after "Reglas". Open "Especies" → "Goliath", confirm Tamaño "Mediano", Velocidad "35 ft", and the "Giant Ancestry" section with its named benefits renders with bold sub-headers. Open "Trasfondos" → "Farmer", confirm the Ability Scores/Feat/Skill Proficiencies/Tool Proficiency/Equipment breakdown renders correctly (no doubled colons, no missing feat/tool text).

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/tabs/EncyclopediaTab.tsx
git commit -m "feat: add Especies and Trasfondos categories to Enciclopedia"
```

---

### Task 4: `note-links.ts` — `@mention` matching and note-link parsing

**Files:**
- Create: `src/lib/note-links.ts`
- Test: `src/lib/note-links.test.ts`

**Interfaces:**
- Produces:
  - `LinkableNote { id: string; section: "world" | "npcs" | "quests" | "journal"; title: string }`
  - `buildLinkableNotes(notes: Notes): LinkableNote[]` — enumerates `notes.npcs`, `notes.world`, `notes.quests`, `notes.journal` **in that order** (this order is the same-length title-collision tiebreaker).
  - `linkifyMentions(content: string, linkables: LinkableNote[]): string` — replaces `@Title` occurrences with `[Title](mavok-note://section/id)`, longest-title-first, word-boundary-checked, unmatched mentions left as plain text.
  - `parseNoteLink(href: string): { section: LinkableNote["section"]; id: string } | null` — parses a `mavok-note://section/id` href back into its parts, `null` if it doesn't match the expected shape.

- [ ] **Step 1: Write the failing tests**

```typescript
// src/lib/note-links.test.ts
import { describe, it, expect } from "vitest";
import {
  buildLinkableNotes,
  linkifyMentions,
  parseNoteLink,
  type LinkableNote,
} from "./note-links";
import type { Notes } from "./types";

const EMPTY_NOTES: Notes = {
  world: [],
  npcs: [],
  quests: [],
  journal: [],
  quick: [],
};

describe("linkifyMentions", () => {
  it("links a single-word mention to a matching note", () => {
    const linkables: LinkableNote[] = [
      { id: "npc-1", section: "npcs", title: "Riti" },
    ];
    expect(linkifyMentions("Hogar de @Riti", linkables)).toBe(
      "Hogar de [Riti](mavok-note://npcs/npc-1)"
    );
  });

  it("prefers the longest matching title over a shorter prefix", () => {
    const linkables: LinkableNote[] = [
      { id: "world-1", section: "world", title: "Casona" },
      { id: "world-2", section: "world", title: "Casona Vaelcrest" },
    ];
    expect(linkifyMentions("Vive en @Casona Vaelcrest ahora", linkables)).toBe(
      "Vive en [Casona Vaelcrest](mavok-note://world/world-2) ahora"
    );
  });

  it("leaves an unmatched mention as plain text", () => {
    const linkables: LinkableNote[] = [
      { id: "npc-1", section: "npcs", title: "Riti" },
    ];
    expect(linkifyMentions("Hogar de @Nadie", linkables)).toBe(
      "Hogar de @Nadie"
    );
  });

  it("doesn't match a title as a prefix of a longer word", () => {
    const linkables: LinkableNote[] = [
      { id: "npc-1", section: "npcs", title: "Riti" },
    ];
    expect(linkifyMentions("@Ritila no es Riti", linkables)).toBe(
      "@Ritila no es Riti"
    );
  });

  it("resolves same-length title collisions using the linkables array order", () => {
    const linkables: LinkableNote[] = [
      { id: "npc-1", section: "npcs", title: "Sol" },
      { id: "world-1", section: "world", title: "Sol" },
    ];
    expect(linkifyMentions("@Sol brilla", linkables)).toBe(
      "[Sol](mavok-note://npcs/npc-1) brilla"
    );
  });
});

describe("buildLinkableNotes", () => {
  it("orders NPCs before Mundo, Misiones, and Diario", () => {
    const notes: Notes = {
      ...EMPTY_NOTES,
      world: [
        { id: "w1", title: "Mundo Uno", content: "", tags: [], createdAt: "", updatedAt: "" },
      ],
      npcs: [
        { id: "n1", title: "NPC Uno", content: "", tags: [], createdAt: "", updatedAt: "" },
      ],
      quests: [
        {
          id: "q1",
          title: "Quest Uno",
          content: "",
          tags: [],
          givenBy: "",
          status: "active",
          createdAt: "",
          updatedAt: "",
        },
      ],
      journal: [{ id: "j1", title: "Diario Uno", session: 1, date: "", content: "" }],
    };
    const result = buildLinkableNotes(notes);
    expect(result.map((l) => l.section)).toEqual([
      "npcs",
      "world",
      "quests",
      "journal",
    ]);
  });
});

describe("parseNoteLink", () => {
  it("parses a valid mavok-note:// href", () => {
    expect(parseNoteLink("mavok-note://npcs/npc-1")).toEqual({
      section: "npcs",
      id: "npc-1",
    });
  });

  it("returns null for a non-matching href", () => {
    expect(parseNoteLink("https://example.com")).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- note-links.test.ts`
Expected: FAIL — `Cannot find module './note-links'`.

- [ ] **Step 3: Implement `note-links.ts`**

```typescript
// src/lib/note-links.ts
import type { Notes } from "./types";

export interface LinkableNote {
  id: string;
  section: "world" | "npcs" | "quests" | "journal";
  title: string;
}

export function buildLinkableNotes(notes: Notes): LinkableNote[] {
  return [
    ...notes.npcs.map((n) => ({
      id: n.id,
      section: "npcs" as const,
      title: n.title,
    })),
    ...notes.world.map((n) => ({
      id: n.id,
      section: "world" as const,
      title: n.title,
    })),
    ...notes.quests.map((q) => ({
      id: q.id,
      section: "quests" as const,
      title: q.title,
    })),
    ...notes.journal.map((j) => ({
      id: j.id,
      section: "journal" as const,
      title: j.title,
    })),
  ];
}

export function linkifyMentions(
  content: string,
  linkables: LinkableNote[]
): string {
  if (!content.includes("@") || linkables.length === 0) return content;

  const sorted = [...linkables].sort(
    (a, b) => b.title.length - a.title.length
  );
  let result = "";
  let i = 0;
  while (i < content.length) {
    if (content[i] === "@") {
      const rest = content.slice(i + 1);
      const match = sorted.find((l) => {
        if (l.title.length === 0) return false;
        if (!rest.toLowerCase().startsWith(l.title.toLowerCase())) {
          return false;
        }
        const nextChar = rest[l.title.length];
        return nextChar === undefined || !/[a-zA-Z0-9]/.test(nextChar);
      });
      if (match) {
        const matchedText = rest.slice(0, match.title.length);
        result += `[${matchedText}](mavok-note://${match.section}/${match.id})`;
        i += 1 + match.title.length;
        continue;
      }
    }
    result += content[i];
    i++;
  }
  return result;
}

export function parseNoteLink(
  href: string
): { section: LinkableNote["section"]; id: string } | null {
  const match = href.match(
    /^mavok-note:\/\/(world|npcs|quests|journal)\/(.+)$/
  );
  if (!match) return null;
  return { section: match[1] as LinkableNote["section"], id: match[2] };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- note-links.test.ts`
Expected: PASS, 8/8.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/note-links.ts src/lib/note-links.test.ts
git commit -m "feat: add note-links helper for @mention matching and parsing"
```

---

### Task 5: `Markdown` component gains a link renderer and `onInternalLink`

**Files:**
- Modify: `src/components/ui/Markdown.tsx`

**Interfaces:**
- `Markdown`'s props gain one new optional field: `onInternalLink?: (href: string) => void`. Every existing call site (10+ across the app) continues to work unchanged — this is purely additive.

- [ ] **Step 1: Add the `a` renderer and `onInternalLink` prop**

Replace:
```tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="list-disc pl-4 space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 space-y-0.5">{children}</ol>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
```
with:
```tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export function Markdown({
  children,
  className,
  onInternalLink,
}: {
  children: string;
  className?: string;
  onInternalLink?: (href: string) => void;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="list-disc pl-4 space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 space-y-0.5">{children}</ol>
          ),
          a: ({ href, children }) => {
            if (href?.startsWith("mavok-note://") && onInternalLink) {
              return (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInternalLink(href);
                  }}
                  className="text-accent underline underline-offset-2"
                >
                  {children}
                </button>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass — no existing call site passes `onInternalLink`, so they all fall through to the plain external-link branch (which none of their current content exercises anyway, since no existing data has real markdown links in it — this is a no-op for every current usage, purely additive).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Markdown.tsx
git commit -m "feat: add link rendering and internal-link support to Markdown component"
```

---

### Task 6: Wire `@mention` linking into Notas, Misiones, and Diario

**Files:**
- Modify: `src/components/tabs/NotesTab.tsx`
- Modify: `src/components/notes/NoteList.tsx`
- Modify: `src/components/notes/QuestList.tsx`
- Modify: `src/components/notes/JournalList.tsx`

**Interfaces:**
- Consumes: `buildLinkableNotes`, `linkifyMentions`, `parseNoteLink` from `src/lib/note-links.ts` (Task 4); `Markdown`'s new `onInternalLink` prop (Task 5).
- `NoteList`, `QuestList`, `JournalList` each gain one new optional prop: `onNavigate?: (section: "world" | "npcs" | "quests" | "journal", id: string) => void`.

**Context:** `NotesTab.tsx` already owns cross-section navigation (`activeSubTab`/`pendingOpenId`), driven today only by `handleResultTap` (search results). This task adds a second entry point (`handleNavigate`, called from `@mention` clicks) using the exact same mechanism. Separately: `JournalList.tsx`'s `initialOpenId` handling already opens the read-only view (`setViewingId`) — confirmed correct. `NoteList.tsx` and `QuestList.tsx`'s `initialOpenId` effects instead call `openEdit(note)`, jumping into the raw-text edit form — a leftover from before their view/edit split existed. This task fixes both to match `JournalList`'s existing, correct behavior, since a mention-link click should open the *view*, not the edit form.

- [ ] **Step 1: `NotesTab.tsx` — add `handleNavigate` and pass it down**

Replace:
```tsx
  function handleResultTap(result: SearchResult) {
    setActiveSubTab(result.section);
    setPendingOpenId(result.id);
    setSearchQuery("");
  }
```
with:
```tsx
  function handleResultTap(result: SearchResult) {
    setActiveSubTab(result.section);
    setPendingOpenId(result.id);
    setSearchQuery("");
  }

  function handleNavigate(
    section: "world" | "npcs" | "quests" | "journal",
    id: string
  ) {
    setActiveSubTab(section);
    setPendingOpenId(id);
  }
```

Replace:
```tsx
            {activeSubTab === "quick" && <QuickNotes />}
            {activeSubTab === "world" && (
              <NoteList section="world" title="Mundo" initialOpenId={pendingOpenId} />
            )}
            {activeSubTab === "npcs" && (
              <NoteList section="npcs" title="NPCs" initialOpenId={pendingOpenId} />
            )}
            {activeSubTab === "quests" && (
              <QuestList initialOpenId={pendingOpenId} />
            )}
            {activeSubTab === "journal" && (
              <JournalList initialOpenId={pendingOpenId} />
            )}
```
with:
```tsx
            {activeSubTab === "quick" && <QuickNotes />}
            {activeSubTab === "world" && (
              <NoteList
                section="world"
                title="Mundo"
                initialOpenId={pendingOpenId}
                onNavigate={handleNavigate}
              />
            )}
            {activeSubTab === "npcs" && (
              <NoteList
                section="npcs"
                title="NPCs"
                initialOpenId={pendingOpenId}
                onNavigate={handleNavigate}
              />
            )}
            {activeSubTab === "quests" && (
              <QuestList initialOpenId={pendingOpenId} onNavigate={handleNavigate} />
            )}
            {activeSubTab === "journal" && (
              <JournalList initialOpenId={pendingOpenId} onNavigate={handleNavigate} />
            )}
```

- [ ] **Step 2: `NoteList.tsx` — accept `onNavigate`, fix `initialOpenId`, linkify the view**

Replace:
```tsx
import { Markdown } from "@/components/ui/Markdown";
import { Plus, Map, Users } from "lucide-react";
import type { NoteEntry } from "@/lib/types";
import { toast } from "sonner";

export function NoteList({
  section,
  title,
  initialOpenId,
}: {
  section: "world" | "npcs";
  title: string;
  initialOpenId?: string;
}) {
```
with:
```tsx
import { Markdown } from "@/components/ui/Markdown";
import { Plus, Map, Users } from "lucide-react";
import type { NoteEntry } from "@/lib/types";
import { toast } from "sonner";
import {
  buildLinkableNotes,
  linkifyMentions,
  parseNoteLink,
} from "@/lib/note-links";

export function NoteList({
  section,
  title,
  initialOpenId,
  onNavigate,
}: {
  section: "world" | "npcs";
  title: string;
  initialOpenId?: string;
  onNavigate?: (
    section: "world" | "npcs" | "quests" | "journal",
    id: string
  ) => void;
}) {
```

Replace:
```tsx
  useEffect(() => {
    if (!character || !initialOpenId) return;
    const note = character.notes[section].find((n) => n.id === initialOpenId);
    if (note) openEdit(note);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOpenId]);
```
with:
```tsx
  useEffect(() => {
    if (!character || !initialOpenId) return;
    const note = character.notes[section].find((n) => n.id === initialOpenId);
    if (note) setViewingId(note.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOpenId]);
```

Replace:
```tsx
              {note.content && (
                <Markdown className="text-sm">{note.content}</Markdown>
              )}
```
with:
```tsx
              {note.content && (
                <Markdown
                  className="text-sm"
                  onInternalLink={(href) => {
                    const link = parseNoteLink(href);
                    if (link) onNavigate?.(link.section, link.id);
                  }}
                >
                  {linkifyMentions(
                    note.content,
                    buildLinkableNotes(character.notes)
                  )}
                </Markdown>
              )}
```
(This is inside the View Modal's IIFE, where `note` refers to the item being viewed — not the card-preview render at the top of the file, which stays exactly as-is: it renders `{note.content}` raw into `<Markdown>` with no linkification, per the design's card-preview scope decision.)

- [ ] **Step 3: `QuestList.tsx` — same three changes**

Replace:
```tsx
import { Markdown } from "@/components/ui/Markdown";
import { Plus, ScrollText } from "lucide-react";
import type { QuestEntry } from "@/lib/types";
import { toast } from "sonner";
```
with:
```tsx
import { Markdown } from "@/components/ui/Markdown";
import { Plus, ScrollText } from "lucide-react";
import type { QuestEntry } from "@/lib/types";
import { toast } from "sonner";
import {
  buildLinkableNotes,
  linkifyMentions,
  parseNoteLink,
} from "@/lib/note-links";
```

Replace:
```tsx
export function QuestList({
  initialOpenId,
}: {
  initialOpenId?: string;
} = {}) {
```
with:
```tsx
export function QuestList({
  initialOpenId,
  onNavigate,
}: {
  initialOpenId?: string;
  onNavigate?: (
    section: "world" | "npcs" | "quests" | "journal",
    id: string
  ) => void;
} = {}) {
```

Replace:
```tsx
  useEffect(() => {
    if (!character || !initialOpenId) return;
    const quest = character.notes.quests.find((q) => q.id === initialOpenId);
    if (quest) openEdit(quest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOpenId]);
```
with:
```tsx
  useEffect(() => {
    if (!character || !initialOpenId) return;
    const quest = character.notes.quests.find((q) => q.id === initialOpenId);
    if (quest) setViewingId(quest.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOpenId]);
```

Replace:
```tsx
              {quest.content && (
                <Markdown className="text-sm">{quest.content}</Markdown>
              )}
```
with:
```tsx
              {quest.content && (
                <Markdown
                  className="text-sm"
                  onInternalLink={(href) => {
                    const link = parseNoteLink(href);
                    if (link) onNavigate?.(link.section, link.id);
                  }}
                >
                  {linkifyMentions(
                    quest.content,
                    buildLinkableNotes(character.notes)
                  )}
                </Markdown>
              )}
```
(Again, this is inside the Quest View Modal's IIFE — the card-preview render earlier in the file is untouched.)

- [ ] **Step 4: `JournalList.tsx` — accept `onNavigate`, linkify the view (no `initialOpenId` fix needed here)**

Replace:
```tsx
import { Markdown } from "@/components/ui/Markdown";
import { Plus, BookOpen } from "lucide-react";
import type { JournalEntry } from "@/lib/types";
import { toast } from "sonner";

export function JournalList({
  initialOpenId,
}: {
  initialOpenId?: string;
} = {}) {
```
with:
```tsx
import { Markdown } from "@/components/ui/Markdown";
import { Plus, BookOpen } from "lucide-react";
import type { JournalEntry } from "@/lib/types";
import { toast } from "sonner";
import {
  buildLinkableNotes,
  linkifyMentions,
  parseNoteLink,
} from "@/lib/note-links";

export function JournalList({
  initialOpenId,
  onNavigate,
}: {
  initialOpenId?: string;
  onNavigate?: (
    section: "world" | "npcs" | "quests" | "journal",
    id: string
  ) => void;
} = {}) {
```

Replace:
```tsx
              <Markdown className="text-sm">{viewingEntry.content}</Markdown>
```
with:
```tsx
              <Markdown
                className="text-sm"
                onInternalLink={(href) => {
                  const link = parseNoteLink(href);
                  if (link) onNavigate?.(link.section, link.id);
                }}
              >
                {linkifyMentions(
                  viewingEntry.content,
                  buildLinkableNotes(character.notes)
                )}
              </Markdown>
```
(This is the `editing ? (...) : (...)` view-mode branch's `Markdown` call — the only one in this file; the card-preview render earlier is untouched.)

- [ ] **Step 5: Manual check**

Run `npm run dev`, open Notas → NPCs, create a note titled "Riti" (leave content empty or add a short description). Switch to Mundo, create a note titled "Casona" with content `Hogar de @Riti`. Tap into "Casona" (opens its view) — confirm `@Riti` renders as an underlined, accent-colored link, not literal text. Tap the link — confirm the tab switches to NPCs and "Riti"'s *view* opens (not its edit form). From "Riti"'s view, tap "Editar" and add `vive en @Casona` to its content, save, re-open the view — confirm `@Casona` is now a working link back to Mundo → "Casona". Separately, confirm the *card list* preview of "Casona" still shows the literal text `@Riti` (not a link) — the v1 scope decision. Finally, search for "Riti" via the search bar and tap the result — confirm it now opens the *view* (not the edit form), verifying the `initialOpenId` fix didn't just enable linking but also correctly changed this pre-existing navigation path.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass — pay attention to lint here: `NoteList`/`QuestList`/`JournalList` all guard `if (!character) return null;` before their hooks, and this task's `useEffect` edits change what's called *inside* an existing effect, not the effect's position, so this shouldn't introduce a hooks-order violation, but confirm lint is clean regardless.

- [ ] **Step 7: Commit**

```bash
git add src/components/tabs/NotesTab.tsx src/components/notes/NoteList.tsx src/components/notes/QuestList.tsx src/components/notes/JournalList.tsx
git commit -m "feat: link @mentions between Notas, Misiones, and Diario"
```

---

### Task 7: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run the full check suite**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass, 0 lint errors, all tests green (including the 4 `flattenEntries` tests from Task 1 — 1 new plus 3 existing — and the 8 new `note-links` tests from Task 4).

- [ ] **Step 2: Confirm no stray symlink or build artifacts were left behind**

Run: `find . -maxdepth 3 -type l 2>/dev/null` (from the repo root) — confirm no unexpected symlinks under `.claude/worktrees/` or elsewhere, per the Global Constraints note.

- [ ] **Step 3: Full manual walkthrough**

Run `npm run dev` and check:
1. Enciclopedia → Especies: all 10 species load; open a couple beyond Goliath and confirm they render correctly.
2. Enciclopedia → Trasfondos: all 16 backgrounds load; spot-check 2-3 for correct Ability Scores/Feat/Skill Proficiencies/Tool Proficiency/Equipment text.
3. Full `@mention` round-trip exactly as described in Task 6 Step 5 (create linked Mundo/NPC notes, tap through both directions, confirm search-result navigation now opens view not edit).
4. Confirm a `@mention` referencing a title that doesn't exist (e.g. `@Nadie`) renders as plain text, not a broken-looking link.
5. Check the browser console for errors across all of the above.

- [ ] **Step 4: Confirm no regressions in existing Enciclopedia/Notas behavior**

Spot-check that Objetos mágicos, Reglas, and a couple of earlier categories (Condiciones, Hechizos) still load correctly. Confirm adding/editing/deleting notes, quests, and journal entries (the plain CRUD flows, untouched by this plan) still work exactly as before.

- [ ] **Step 5: Final commit (if Step 3 or 4 surfaces any fix)**

If any of the manual checks above reveal a bug, fix it, re-run Step 1, and commit:
```bash
git add -A
git commit -m "fix: address species/backgrounds/note-linking issues found in verification pass"
```
If nothing needs fixing, this task produces no commit — it's a pure verification gate.
