# Notas + Enciclopedia Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring Notas and Enciclopedia in line with the established redesign patterns (`CompactRow`, `GhostChip`), restructure Encyclopedia's weapon/armor/feat/spell detail view from a joined-string text dump into a labeled stat block, relocate Favorites from a buried scrollable tab to a dedicated always-visible toggle, add a field-group divider to `NoteList`'s custom-fields section, and de-duplicate Encyclopedia's category-building functions.

**Architecture:** Five independently-testable changes across four files. `NotesTab.tsx`, `EncyclopediaTab.tsx`'s `renderRow`, and `QuestList.tsx`'s filter chips converge on already-established shared components (Task 1). `EncyclopediaTab.tsx`'s data model and detail modal are restructured (Task 2). Favorites moves out of the category tab-strip into its own toggle (Task 3, structurally independent of Tasks 1-2 — touches different regions of the same file). `NoteList.tsx` gets a small additive change (Task 4). Task 5 is a pure refactor of `EncyclopediaTab.tsx`'s category-builder functions and depends on Task 2 already being in place (it operates on the `statBlock` shape Task 2 introduces).

**Tech Stack:** Next.js 15 client components, Tailwind CSS v4, existing shared components `CompactRow` (`src/components/ui/CompactRow.tsx`) and `GhostChip` (`src/components/ui/GhostChip.tsx`).

## Global Constraints

- Full design spec: `docs/superpowers/specs/2026-07-19-notas-enciclopedia-redesign-design.md`.
- Every task must end passing: `npx tsc --noEmit && npm run build && npm run lint && npm test`.
- No new component/UI test files — this codebase has no test coverage for tab/component files (only `migrations.ts`, `recalculate.ts`, and pure roll/penalty helpers are unit-tested). Verification is `tsc`/`build`/`lint`/`test` plus manual browser checks across `piedra-viva`, `pergamino`, `furia-de-sangre`.
- Commit messages in this round are prefixed `Feature UI-Redesign-PT6: `.
- `public/sw.js` will show as modified after every verification build (commit-hash stamp) — discard with `git checkout -- public/sw.js` before each task's real commit, it is not part of any task's diff.

---

## Task 1: CompactRow / GhostChip conversions

**Files:**
- Modify: `src/components/tabs/NotesTab.tsx` (search-result rows)
- Modify: `src/components/tabs/EncyclopediaTab.tsx` (`renderRow` function only)
- Modify: `src/components/notes/QuestList.tsx` (status filter chips)

**Interfaces:**
- Consumes: `CompactRow` (`src/components/ui/CompactRow.tsx`, props `{ name: ReactNode; meta?: ReactNode; right: ReactNode; onClick?: () => void }`), `GhostChip` (`src/components/ui/GhostChip.tsx`, props `{ children: ReactNode; onClick?: () => void; solid?: boolean }`). Both already exist and are used elsewhere (Inventario, phase 5).
- Produces: nothing consumed by later tasks — `renderRow`'s external call sites (`renderRow(item, true/false)`) and signature are unchanged, only its internal return statement changes, so Task 3 (which edits the call sites' surrounding code, not `renderRow` itself) is unaffected by this task's ordering.

- [ ] **Step 1: Convert NotesTab's search-result rows**

In `src/components/tabs/NotesTab.tsx`, add the import alongside the existing UI imports:

```tsx
import { EmptyState } from "@/components/ui/EmptyState";
import { CompactRow } from "@/components/ui/CompactRow";
```

Find:

```tsx
        {searchQuery ? (
          results.length > 0 ? (
            <div className="space-y-2">
              {results.map((r) => (
                <div
                  key={`${r.section}-${r.id}`}
                  onClick={() => handleResultTap(r)}
                  className="stone-card rounded-lg p-3 cursor-pointer active:scale-[0.99] transition-transform flex items-center gap-2"
                >
                  <span className="text-[0.6rem] px-1.5 py-0.5 bg-accent/20 text-accent rounded shrink-0">
                    {r.typeLabel}
                  </span>
                  <span className="text-sm truncate">{r.title}</span>
                </div>
              ))}
            </div>
          ) : (
```

Replace with:

```tsx
        {searchQuery ? (
          results.length > 0 ? (
            <div className="space-y-2">
              {results.map((r) => (
                <CompactRow
                  key={`${r.section}-${r.id}`}
                  onClick={() => handleResultTap(r)}
                  name={
                    <>
                      <span className="text-[0.6rem] px-1.5 py-0.5 bg-accent/20 text-accent rounded mr-1.5">
                        {r.typeLabel}
                      </span>
                      {r.title}
                    </>
                  }
                  right={null}
                />
              ))}
            </div>
          ) : (
```

- [ ] **Step 2: Convert EncyclopediaTab's `renderRow`**

In `src/components/tabs/EncyclopediaTab.tsx`, add the import:

```tsx
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { CompactRow } from "@/components/ui/CompactRow";
```

Find:

```tsx
  function renderRow(item: EncyclopediaItem, showCategoryBadge: boolean) {
    const isFavorite = encyclopediaFavorites.includes(item.id);
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
          }}
          className="shrink-0 text-accent"
        >
          <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
    );
  }
```

Replace with:

```tsx
  function renderRow(item: EncyclopediaItem, showCategoryBadge: boolean) {
    const isFavorite = encyclopediaFavorites.includes(item.id);
    return (
      <CompactRow
        key={item.id}
        onClick={() => setViewingItem(item)}
        name={
          <>
            {showCategoryBadge && (
              <span className="text-[0.6rem] px-1.5 py-0.5 bg-accent/20 text-accent rounded mr-1.5">
                {CATEGORIES.find((c) => c.id === item.category)?.label}
              </span>
            )}
            {item.name}
          </>
        }
        right={
          <span className="flex items-center gap-2">
            {item.hint && <span className="text-muted text-xs">{item.hint}</span>}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(item.id);
              }}
              className="text-accent"
            >
              <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </span>
        }
      />
    );
  }
```

- [ ] **Step 3: Convert QuestList's status filter chips**

In `src/components/notes/QuestList.tsx`, add the import:

```tsx
import { Modal } from "@/components/ui/Modal";
import { Tag } from "@/components/ui/Tag";
import { EmptyState } from "@/components/ui/EmptyState";
import { GhostChip } from "@/components/ui/GhostChip";
```

Find:

```tsx
      {/* Filter */}
      <div className="flex gap-1">
        {(["all", "active", "completed", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs ${
              filter === f
                ? "bg-accent text-white"
                : "bg-card border border-border text-muted"
            }`}
          >
            {f === "all" ? "Todas" : STATUS_CONFIG[f].label}
          </button>
        ))}
      </div>
```

Replace with:

```tsx
      {/* Filter */}
      <div className="flex gap-1">
        {(["all", "active", "completed", "failed"] as const).map((f) => (
          <GhostChip key={f} onClick={() => setFilter(f)} solid={filter === f}>
            {f === "all" ? "Todas" : STATUS_CONFIG[f].label}
          </GhostChip>
        ))}
      </div>
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass.

- [ ] **Step 5: Manual check**

`npm run dev`. Notas tab: search for something that matches at least one entry, confirm results render as rows with the type-label badge inline before the title, tappable, navigating to the right sub-tab/entry. Toggle density (Ajustes → Espacioso/Compacto) and confirm rows adapt. Enciclopedia tab: browse a category (no badge shown), then search (badge shown), confirm hint text and star button sit on the right, star toggling still works. QuestList (a quest must exist — add one via the Notas → Misiones sub-tab if none exist): confirm the four filter chips show solid/ghost state correctly and filter the list. Check all three across `piedra-viva`, `pergamino`, `furia-de-sangre`.

- [ ] **Step 6: Commit**

```bash
git checkout -- public/sw.js
git add src/components/tabs/NotesTab.tsx src/components/tabs/EncyclopediaTab.tsx src/components/notes/QuestList.tsx
git commit -m "Feature UI-Redesign-PT6: convert Notas/Enciclopedia rows and Quest filters to CompactRow/GhostChip"
```

---

## Task 2: Encyclopedia detail modal → structured stat block

**Files:**
- Modify: `src/components/tabs/EncyclopediaTab.tsx` (`EncyclopediaItem` interface, `resolveDetail`, all 9 `buildXItems` functions, detail `Modal` render)

**Interfaces:**
- Consumes: nothing from Task 1 (different region of the file — `renderRow` doesn't reference `header`/`statBlock`).
- Produces: `EncyclopediaItem.statBlock: { label: string; value: string }[]` (replaces `header: string`) — Task 5 depends on this shape already being in place; it rewrites these same 9 functions in terms of a new `mapItems` helper but doesn't change what they return.

- [ ] **Step 1: Change the `EncyclopediaItem` interface**

Find:

```tsx
interface EncyclopediaItem {
  id: string;
  category: Category;
  name: string;
  hint: string;
  header: string;
  description: string;
}
```

Replace with:

```tsx
interface EncyclopediaItem {
  id: string;
  category: Category;
  name: string;
  hint: string;
  statBlock: { label: string; value: string }[];
  description: string;
}
```

- [ ] **Step 2: Simplify `resolveDetail`**

Find:

```tsx
function resolveDetail(
  item: EncyclopediaItem,
  language: "en" | "es"
): string {
  const translations = TRANSLATIONS[item.category];
  const translated = language === "es" ? translations?.[item.name] : undefined;
  const body = translated
    ? `${TRANSLATION_DISCLAIMER}\n\n${translated}`
    : item.description;
  return [item.header, body].filter(Boolean).join("\n\n");
}
```

Replace with:

```tsx
function resolveDetail(
  item: EncyclopediaItem,
  language: "en" | "es"
): string {
  const translations = TRANSLATIONS[item.category];
  const translated = language === "es" ? translations?.[item.name] : undefined;
  return translated ? `${TRANSLATION_DISCLAIMER}\n\n${translated}` : item.description;
}
```

- [ ] **Step 3: Update the five prose-only build functions**

Find:

```tsx
function buildConditionItems(): EncyclopediaItem[] {
  return CONDITIONS.map((c) => ({
    id: `conditions-${c.name}`,
    category: "conditions",
    name: c.name,
    hint: "",
    header: "",
    description: c.description,
  }));
}

function buildActionItems(): EncyclopediaItem[] {
  return ACTIONS.map((a) => ({
    id: `actions-${a.name}`,
    category: "actions",
    name: a.name,
    hint: "",
    header: "",
    description: a.description,
  }));
}

function buildSkillItems(): EncyclopediaItem[] {
  return SKILLS_REFERENCE.map((s) => ({
    id: `skills-${s.name}`,
    category: "skills",
    name: s.name,
    hint: abilityLabel(s.ability as AbilityScore),
    header: "",
    description: s.description,
  }));
}
```

Replace with:

```tsx
function buildConditionItems(): EncyclopediaItem[] {
  return CONDITIONS.map((c) => ({
    id: `conditions-${c.name}`,
    category: "conditions",
    name: c.name,
    hint: "",
    statBlock: [],
    description: c.description,
  }));
}

function buildActionItems(): EncyclopediaItem[] {
  return ACTIONS.map((a) => ({
    id: `actions-${a.name}`,
    category: "actions",
    name: a.name,
    hint: "",
    statBlock: [],
    description: a.description,
  }));
}

function buildSkillItems(): EncyclopediaItem[] {
  return SKILLS_REFERENCE.map((s) => ({
    id: `skills-${s.name}`,
    category: "skills",
    name: s.name,
    hint: abilityLabel(s.ability as AbilityScore),
    statBlock: [],
    description: s.description,
  }));
}
```

Find (further down, `buildGearItems` and `buildMasteryItems`):

```tsx
function buildGearItems(): EncyclopediaItem[] {
  return GEAR.map((g) => ({
    id: `gear-${g.name}`,
    category: "gear",
    name: g.name,
    hint: g.value !== null ? `${g.value} gp` : "",
    header: "",
    description: g.description,
  }));
}

function buildMasteryItems(): EncyclopediaItem[] {
  return MASTERY_PROPERTIES.map((m) => ({
    id: `mastery-${m.name}`,
    category: "mastery",
    name: m.name,
    hint: "",
    header: "",
    description: m.description,
  }));
}
```

Replace with:

```tsx
function buildGearItems(): EncyclopediaItem[] {
  return GEAR.map((g) => ({
    id: `gear-${g.name}`,
    category: "gear",
    name: g.name,
    hint: g.value !== null ? `${g.value} gp` : "",
    statBlock: [],
    description: g.description,
  }));
}

function buildMasteryItems(): EncyclopediaItem[] {
  return MASTERY_PROPERTIES.map((m) => ({
    id: `mastery-${m.name}`,
    category: "mastery",
    name: m.name,
    hint: "",
    statBlock: [],
    description: m.description,
  }));
}
```

- [ ] **Step 4: Update `buildWeaponItems` and `buildArmorItems`**

Find:

```tsx
function buildWeaponItems(): EncyclopediaItem[] {
  return WEAPONS.map((w) => ({
    id: `weapons-${w.name}`,
    category: "weapons",
    name: w.name,
    hint: `${w.damage} ${w.damageType}`,
    header: [
      `${w.type === "melee" ? "Cuerpo a cuerpo" : "A distancia"} · ${w.category}`,
      `Daño: ${w.damage} ${w.damageType}`,
      w.range ? `Alcance: ${w.range}` : null,
      `Peso: ${w.weight} lb${w.value !== null ? ` · Valor: ${w.value} gp` : ""}`,
      `Propiedades: ${w.properties.length ? w.properties.join(", ") : "Ninguna"}`,
      w.mastery ? `Maestría: ${w.mastery}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    description: "",
  }));
}

function buildArmorItems(): EncyclopediaItem[] {
  return ARMOR.map((a) => ({
    id: `armor-${a.name}`,
    category: "armor",
    name: a.name,
    hint: `AC ${a.ac}`,
    header: [
      `Tipo: ${a.type}`,
      `CA: ${a.ac}`,
      `Peso: ${a.weight} lb${a.value !== null ? ` · Valor: ${a.value} gp` : ""}`,
      a.stealthDisadvantage ? "Desventaja en Sigilo" : null,
      a.strengthRequirement ? `Requiere FUE ${a.strengthRequirement}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    description: "",
  }));
}
```

Replace with:

```tsx
function buildWeaponItems(): EncyclopediaItem[] {
  return WEAPONS.map((w) => ({
    id: `weapons-${w.name}`,
    category: "weapons",
    name: w.name,
    hint: `${w.damage} ${w.damageType}`,
    statBlock: [
      { label: "Tipo", value: `${w.type === "melee" ? "Cuerpo a cuerpo" : "A distancia"} · ${w.category}` },
      { label: "Daño", value: `${w.damage} ${w.damageType}` },
      w.range ? { label: "Alcance", value: w.range } : null,
      { label: "Peso", value: `${w.weight} lb${w.value !== null ? ` · Valor: ${w.value} gp` : ""}` },
      { label: "Propiedades", value: w.properties.length ? w.properties.join(", ") : "Ninguna" },
      w.mastery ? { label: "Maestría", value: w.mastery } : null,
    ].filter((row): row is { label: string; value: string } => row !== null),
    description: "",
  }));
}

function buildArmorItems(): EncyclopediaItem[] {
  return ARMOR.map((a) => ({
    id: `armor-${a.name}`,
    category: "armor",
    name: a.name,
    hint: `AC ${a.ac}`,
    statBlock: [
      { label: "Tipo", value: a.type },
      { label: "CA", value: String(a.ac) },
      { label: "Peso", value: `${a.weight} lb${a.value !== null ? ` · Valor: ${a.value} gp` : ""}` },
      a.stealthDisadvantage ? { label: "Sigilo", value: "Desventaja" } : null,
      a.strengthRequirement ? { label: "Requiere FUE", value: String(a.strengthRequirement) } : null,
    ].filter((row): row is { label: string; value: string } => row !== null),
    description: "",
  }));
}
```

- [ ] **Step 5: Update `buildFeatItems` and `buildSpellItems`**

Find:

```tsx
function buildFeatItems(): EncyclopediaItem[] {
  return FEATS.map((f) => ({
    id: `feats-${f.name}`,
    category: "feats",
    name: f.name,
    hint: f.category,
    header: [
      f.category,
      f.levelRequired ? `Nivel ${f.levelRequired}` : null,
      f.repeatable ? "Repetible" : null,
    ]
      .filter(Boolean)
      .join(" · "),
    description: f.description,
  }));
}

function buildSpellItems(): EncyclopediaItem[] {
  return SPELLS.map((s) => ({
    id: `spells-${s.name}`,
    category: "spells",
    name: s.name,
    hint: `${s.level === 0 ? "Cantrip" : `Nv. ${s.level}`} · ${s.school}`,
    header: [
      `${s.level === 0 ? "Cantrip" : `Nivel ${s.level}`} · ${s.school}${s.ritual ? " (Ritual)" : ""}`,
      `Tiempo de lanzamiento: ${s.castingTime}`,
      `Alcance: ${s.range}`,
      `Componentes: ${s.components}`,
      `Duración: ${s.duration}${s.concentration ? " (Concentración)" : ""}`,
    ].join("\n"),
    description: s.description,
  }));
}
```

Replace with:

```tsx
function buildFeatItems(): EncyclopediaItem[] {
  return FEATS.map((f) => ({
    id: `feats-${f.name}`,
    category: "feats",
    name: f.name,
    hint: f.category,
    statBlock: [
      { label: "Categoría", value: f.category },
      f.levelRequired ? { label: "Nivel", value: String(f.levelRequired) } : null,
      f.repeatable ? { label: "Repetible", value: "Sí" } : null,
    ].filter((row): row is { label: string; value: string } => row !== null),
    description: f.description,
  }));
}

function buildSpellItems(): EncyclopediaItem[] {
  return SPELLS.map((s) => ({
    id: `spells-${s.name}`,
    category: "spells",
    name: s.name,
    hint: `${s.level === 0 ? "Cantrip" : `Nv. ${s.level}`} · ${s.school}`,
    statBlock: [
      { label: "Nivel", value: s.level === 0 ? "Cantrip" : `Nivel ${s.level}` },
      { label: "Escuela", value: s.school },
      s.ritual ? { label: "Ritual", value: "Sí" } : null,
      { label: "Lanzamiento", value: s.castingTime },
      { label: "Alcance", value: s.range },
      { label: "Componentes", value: s.components },
      { label: "Duración", value: `${s.duration}${s.concentration ? " (Concentración)" : ""}` },
    ].filter((row): row is { label: string; value: string } => row !== null),
    description: s.description,
  }));
}
```

- [ ] **Step 6: Render the stat block in the detail Modal**

Find:

```tsx
      <Modal
        open={viewingItem !== null}
        onClose={() => setViewingItem(null)}
        title={viewingItem?.name ?? ""}
      >
        {viewingItem && (
          <>
            <button
              onClick={() => toggleFavorite(viewingItem.id)}
              className="flex items-center gap-1.5 text-xs text-accent mb-3"
            >
              <Star
                size={16}
                fill={
                  encyclopediaFavorites.includes(viewingItem.id)
                    ? "currentColor"
                    : "none"
                }
              />
              {encyclopediaFavorites.includes(viewingItem.id)
                ? "En favoritos"
                : "Agregar a favoritos"}
            </button>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {resolveDetail(viewingItem, encyclopediaLanguage)}
            </p>
          </>
        )}
      </Modal>
```

Replace with:

```tsx
      <Modal
        open={viewingItem !== null}
        onClose={() => setViewingItem(null)}
        title={viewingItem?.name ?? ""}
      >
        {viewingItem && (
          <>
            <button
              onClick={() => toggleFavorite(viewingItem.id)}
              className="flex items-center gap-1.5 text-xs text-accent mb-3"
            >
              <Star
                size={16}
                fill={
                  encyclopediaFavorites.includes(viewingItem.id)
                    ? "currentColor"
                    : "none"
                }
              />
              {encyclopediaFavorites.includes(viewingItem.id)
                ? "En favoritos"
                : "Agregar a favoritos"}
            </button>
            {viewingItem.statBlock.length > 0 && (
              <div className="mb-3 space-y-1 text-xs border-b border-border pb-3">
                {viewingItem.statBlock.map((row) => (
                  <div key={row.label} className="flex justify-between gap-3">
                    <span className="text-muted">{row.label}</span>
                    <span className="text-foreground text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {resolveDetail(viewingItem, encyclopediaLanguage)}
            </p>
          </>
        )}
      </Modal>
```

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass.

- [ ] **Step 8: Manual check**

`npm run dev`, Enciclopedia tab. Open a detail item from each of the 9 categories: confirm weapons/armor/feats/spells show the new label/value stat-block block above the description (with a border-bottom separating it from the body text), and confirm conditions/actions/skills/gear/mastery show no stat-block block at all (unchanged plain-paragraph look). Check across `piedra-viva`, `pergamino`, `furia-de-sangre`.

- [ ] **Step 9: Commit**

```bash
git checkout -- public/sw.js
git add src/components/tabs/EncyclopediaTab.tsx
git commit -m "Feature UI-Redesign-PT6: restructure weapon/armor/feat/spell detail view into a stat block"
```

---

## Task 3: Favorites → dedicated star toggle

**Files:**
- Modify: `src/components/tabs/EncyclopediaTab.tsx` (consts, state, search-bar row, tab-strip, `motion.div` drag/content logic)

**Interfaces:**
- Consumes: nothing from Tasks 1-2 (different regions of the file — no reference to `renderRow`'s internals or `statBlock`/`header`).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Remove `FAVORITES_ID`/`PILLS`/`PILL_IDS`, add `CATEGORY_IDS`**

Find:

```tsx
type Category = (typeof CATEGORIES)[number]["id"];

const FAVORITES_ID = "favorites" as const;

const PILLS: { id: Category | typeof FAVORITES_ID; label: string }[] = [
  { id: FAVORITES_ID, label: "Favoritos" },
  ...CATEGORIES,
];

const PILL_IDS = PILLS.map((p) => p.id);
```

Replace with:

```tsx
type Category = (typeof CATEGORIES)[number]["id"];

const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
```

- [ ] **Step 2: Update component state**

Find:

```tsx
  const [activeCategory, setActiveCategory] = useState<
    Category | typeof FAVORITES_ID
  >("conditions");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingItem, setViewingItem] = useState<EncyclopediaItem | null>(null);
  const { dragX, dragOpacity, handleDragEnd } = useSwipeNavigation(
    PILL_IDS,
    activeCategory,
    setActiveCategory
  );
```

Replace with:

```tsx
  const [activeCategory, setActiveCategory] = useState<Category>("conditions");
  const [searchQuery, setSearchQuery] = useState("");
  const [showingFavorites, setShowingFavorites] = useState(false);
  const [viewingItem, setViewingItem] = useState<EncyclopediaItem | null>(null);
  const { dragX, dragOpacity, handleDragEnd } = useSwipeNavigation(
    CATEGORY_IDS,
    activeCategory,
    setActiveCategory
  );
```

- [ ] **Step 3: Simplify `categoryItems`' memo (no longer needs the favorites guard)**

Find:

```tsx
  const categoryItems = useMemo(
    () =>
      activeCategory === FAVORITES_ID ? [] : CATEGORY_ITEMS[activeCategory](),
    [activeCategory]
  );
```

Replace with:

```tsx
  const categoryItems = useMemo(
    () => CATEGORY_ITEMS[activeCategory](),
    [activeCategory]
  );
```

- [ ] **Step 4: Add the star toggle button to the search bar row**

Find:

```tsx
          <button
            onClick={() => setEncyclopediaLanguage("es")}
            className={`px-2 py-2 text-xs font-heading ${
              encyclopediaLanguage === "es"
                ? "bg-accent text-white"
                : "text-muted"
            }`}
          >
            ES
          </button>
        </div>
      </div>
```

Replace with:

```tsx
          <button
            onClick={() => setEncyclopediaLanguage("es")}
            className={`px-2 py-2 text-xs font-heading ${
              encyclopediaLanguage === "es"
                ? "bg-accent text-white"
                : "text-muted"
            }`}
          >
            ES
          </button>
        </div>
        <button
          onClick={() => setShowingFavorites((v) => !v)}
          className={`shrink-0 p-2 rounded-lg border ${
            showingFavorites
              ? "border-accent bg-accent/20 text-accent"
              : "border-border text-muted"
          }`}
          aria-label={showingFavorites ? "Ver categoría actual" : "Ver favoritos"}
        >
          <Star size={16} fill={showingFavorites ? "currentColor" : "none"} />
        </button>
      </div>
```

- [ ] **Step 5: Update the category tab-strip**

Find:

```tsx
      {/* Category navigation (hidden while searching) */}
      {!searchQuery && (
        <div className="flex overflow-x-auto border-b border-border bg-card px-2 gap-1 shrink-0">
          {PILLS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-2.5 text-xs whitespace-nowrap transition-colors border-b-2 ${
                activeCategory === tab.id
                  ? "text-accent border-accent"
                  : "text-muted border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
```

Replace with:

```tsx
      {/* Category navigation (hidden while searching or viewing favorites) */}
      {!searchQuery && !showingFavorites && (
        <div className="flex overflow-x-auto border-b border-border bg-card px-2 gap-1 shrink-0">
          {CATEGORIES.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id);
                setShowingFavorites(false);
              }}
              className={`px-3 py-2.5 text-xs whitespace-nowrap transition-colors border-b-2 ${
                activeCategory === tab.id
                  ? "text-accent border-accent"
                  : "text-muted border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
```

- [ ] **Step 6: Update the `motion.div` drag prop and content branch**

Find:

```tsx
      <motion.div
        className="flex-1 overflow-y-auto p-4"
        style={{ x: dragX, opacity: dragOpacity, touchAction: "pan-y pinch-zoom" }}
        drag={searchQuery ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        {searchQuery ? (
          searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((item) => renderRow(item, true))}
            </div>
          ) : (
            <EmptyState
              icon={SearchX}
              message={`Sin resultados para "${searchQuery}".`}
            />
          )
        ) : activeCategory === FAVORITES_ID ? (
          favoriteItems.length > 0 ? (
            <div className="space-y-2">
              {favoriteItems.map((item) => renderRow(item, true))}
            </div>
          ) : (
            <EmptyState
              icon={Star}
              message="Aún no tienes favoritos — toca la estrella en cualquier entrada."
            />
          )
        ) : (
          <div className="space-y-2">
            {categoryItems.map((item) => renderRow(item, false))}
          </div>
        )}
      </motion.div>
```

Replace with:

```tsx
      <motion.div
        className="flex-1 overflow-y-auto p-4"
        style={{ x: dragX, opacity: dragOpacity, touchAction: "pan-y pinch-zoom" }}
        drag={searchQuery || showingFavorites ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        {searchQuery ? (
          searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((item) => renderRow(item, true))}
            </div>
          ) : (
            <EmptyState
              icon={SearchX}
              message={`Sin resultados para "${searchQuery}".`}
            />
          )
        ) : showingFavorites ? (
          favoriteItems.length > 0 ? (
            <div className="space-y-2">
              {favoriteItems.map((item) => renderRow(item, true))}
            </div>
          ) : (
            <EmptyState
              icon={Star}
              message="Aún no tienes favoritos — toca la estrella en cualquier entrada."
            />
          )
        ) : (
          <div className="space-y-2">
            {categoryItems.map((item) => renderRow(item, false))}
          </div>
        )}
      </motion.div>
```

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass.

- [ ] **Step 8: Manual check**

`npm run dev`, Enciclopedia tab. Star a few items across different categories. Tap the new star button next to EN/ES: confirm the tab-strip hides, the content area shows only starred items, and swiping left/right does nothing (no category change). Tap a category tab: confirm it exits favorites mode, shows that category, and the tab-strip reappears. Confirm swipe navigation between the 9 categories still works. Confirm searching still works and still hides both the tab-strip and (implicitly) the favorites view. Check across `piedra-viva`, `pergamino`, `furia-de-sangre`.

- [ ] **Step 9: Commit**

```bash
git checkout -- public/sw.js
git add src/components/tabs/EncyclopediaTab.tsx
git commit -m "Feature UI-Redesign-PT6: move Favorites out of the category tab-strip into a dedicated toggle"
```

---

## Task 4: NoteList — labeled divider before custom fields

**Files:**
- Modify: `src/components/notes/NoteList.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks (independent file).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the divider**

Find:

```tsx
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="Tags (separados por coma)"
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />

          {/* Structured fields */}
          {Object.entries(form.fields).map(([key, val]) => (
```

Replace with:

```tsx
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="Tags (separados por coma)"
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />

          <div className="pt-1 border-t border-border">
            <span className="text-[0.65rem] text-muted uppercase tracking-wide">
              Detalles
            </span>
          </div>

          {/* Structured fields */}
          {Object.entries(form.fields).map(([key, val]) => (
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass.

- [ ] **Step 3: Manual check**

`npm run dev`, Notas tab → Mundo sub-tab → tap the add FAB. Confirm the "Detalles" divider appears above the custom-fields area (visible immediately since suggested-field quick-add chips show even with zero fields). Repeat for the NPCs sub-tab. Check across `piedra-viva`, `pergamino`, `furia-de-sangre`.

- [ ] **Step 4: Commit**

```bash
git checkout -- public/sw.js
git add src/components/notes/NoteList.tsx
git commit -m "Feature UI-Redesign-PT6: add labeled divider before NoteList's custom-fields section"
```

---

## Task 5: Encyclopedia — extract `mapItems` helper

**Files:**
- Modify: `src/components/tabs/EncyclopediaTab.tsx` (all 9 `buildXItems` functions)

**Interfaces:**
- Consumes: `EncyclopediaItem.statBlock` shape from Task 2 — this task's "Find" blocks below are the exact post-Task-2 state of each function, so Task 2 must land first.
- Produces: `mapItems<T extends { name: string }>(category: Category, source: T[], build: (item: T) => Omit<EncyclopediaItem, "id" | "category" | "name">) => EncyclopediaItem[]`, a new module-level helper. Nothing later depends on it (last task).

- [ ] **Step 1: Add the `mapItems` helper**

Find:

```tsx
function buildConditionItems(): EncyclopediaItem[] {
  return CONDITIONS.map((c) => ({
    id: `conditions-${c.name}`,
    category: "conditions",
    name: c.name,
    hint: "",
    statBlock: [],
    description: c.description,
  }));
}
```

Replace with:

```tsx
function mapItems<T extends { name: string }>(
  category: Category,
  source: T[],
  build: (item: T) => Omit<EncyclopediaItem, "id" | "category" | "name">
): EncyclopediaItem[] {
  return source.map((item) => ({
    id: `${category}-${item.name}`,
    category,
    name: item.name,
    ...build(item),
  }));
}

function buildConditionItems(): EncyclopediaItem[] {
  return mapItems("conditions", CONDITIONS, (c) => ({
    hint: "",
    statBlock: [],
    description: c.description,
  }));
}
```

- [ ] **Step 2: Rewrite the remaining 8 build functions**

Find:

```tsx
function buildActionItems(): EncyclopediaItem[] {
  return ACTIONS.map((a) => ({
    id: `actions-${a.name}`,
    category: "actions",
    name: a.name,
    hint: "",
    statBlock: [],
    description: a.description,
  }));
}

function buildSkillItems(): EncyclopediaItem[] {
  return SKILLS_REFERENCE.map((s) => ({
    id: `skills-${s.name}`,
    category: "skills",
    name: s.name,
    hint: abilityLabel(s.ability as AbilityScore),
    statBlock: [],
    description: s.description,
  }));
}
```

Replace with:

```tsx
function buildActionItems(): EncyclopediaItem[] {
  return mapItems("actions", ACTIONS, (a) => ({
    hint: "",
    statBlock: [],
    description: a.description,
  }));
}

function buildSkillItems(): EncyclopediaItem[] {
  return mapItems("skills", SKILLS_REFERENCE, (s) => ({
    hint: abilityLabel(s.ability as AbilityScore),
    statBlock: [],
    description: s.description,
  }));
}
```

Find:

```tsx
function buildWeaponItems(): EncyclopediaItem[] {
  return WEAPONS.map((w) => ({
    id: `weapons-${w.name}`,
    category: "weapons",
    name: w.name,
    hint: `${w.damage} ${w.damageType}`,
    statBlock: [
      { label: "Tipo", value: `${w.type === "melee" ? "Cuerpo a cuerpo" : "A distancia"} · ${w.category}` },
      { label: "Daño", value: `${w.damage} ${w.damageType}` },
      w.range ? { label: "Alcance", value: w.range } : null,
      { label: "Peso", value: `${w.weight} lb${w.value !== null ? ` · Valor: ${w.value} gp` : ""}` },
      { label: "Propiedades", value: w.properties.length ? w.properties.join(", ") : "Ninguna" },
      w.mastery ? { label: "Maestría", value: w.mastery } : null,
    ].filter((row): row is { label: string; value: string } => row !== null),
    description: "",
  }));
}

function buildArmorItems(): EncyclopediaItem[] {
  return ARMOR.map((a) => ({
    id: `armor-${a.name}`,
    category: "armor",
    name: a.name,
    hint: `AC ${a.ac}`,
    statBlock: [
      { label: "Tipo", value: a.type },
      { label: "CA", value: String(a.ac) },
      { label: "Peso", value: `${a.weight} lb${a.value !== null ? ` · Valor: ${a.value} gp` : ""}` },
      a.stealthDisadvantage ? { label: "Sigilo", value: "Desventaja" } : null,
      a.strengthRequirement ? { label: "Requiere FUE", value: String(a.strengthRequirement) } : null,
    ].filter((row): row is { label: string; value: string } => row !== null),
    description: "",
  }));
}
```

Replace with:

```tsx
function buildWeaponItems(): EncyclopediaItem[] {
  return mapItems("weapons", WEAPONS, (w) => ({
    hint: `${w.damage} ${w.damageType}`,
    statBlock: [
      { label: "Tipo", value: `${w.type === "melee" ? "Cuerpo a cuerpo" : "A distancia"} · ${w.category}` },
      { label: "Daño", value: `${w.damage} ${w.damageType}` },
      w.range ? { label: "Alcance", value: w.range } : null,
      { label: "Peso", value: `${w.weight} lb${w.value !== null ? ` · Valor: ${w.value} gp` : ""}` },
      { label: "Propiedades", value: w.properties.length ? w.properties.join(", ") : "Ninguna" },
      w.mastery ? { label: "Maestría", value: w.mastery } : null,
    ].filter((row): row is { label: string; value: string } => row !== null),
    description: "",
  }));
}

function buildArmorItems(): EncyclopediaItem[] {
  return mapItems("armor", ARMOR, (a) => ({
    hint: `AC ${a.ac}`,
    statBlock: [
      { label: "Tipo", value: a.type },
      { label: "CA", value: String(a.ac) },
      { label: "Peso", value: `${a.weight} lb${a.value !== null ? ` · Valor: ${a.value} gp` : ""}` },
      a.stealthDisadvantage ? { label: "Sigilo", value: "Desventaja" } : null,
      a.strengthRequirement ? { label: "Requiere FUE", value: String(a.strengthRequirement) } : null,
    ].filter((row): row is { label: string; value: string } => row !== null),
    description: "",
  }));
}
```

Find:

```tsx
function buildGearItems(): EncyclopediaItem[] {
  return GEAR.map((g) => ({
    id: `gear-${g.name}`,
    category: "gear",
    name: g.name,
    hint: g.value !== null ? `${g.value} gp` : "",
    statBlock: [],
    description: g.description,
  }));
}

function buildMasteryItems(): EncyclopediaItem[] {
  return MASTERY_PROPERTIES.map((m) => ({
    id: `mastery-${m.name}`,
    category: "mastery",
    name: m.name,
    hint: "",
    statBlock: [],
    description: m.description,
  }));
}
```

Replace with:

```tsx
function buildGearItems(): EncyclopediaItem[] {
  return mapItems("gear", GEAR, (g) => ({
    hint: g.value !== null ? `${g.value} gp` : "",
    statBlock: [],
    description: g.description,
  }));
}

function buildMasteryItems(): EncyclopediaItem[] {
  return mapItems("mastery", MASTERY_PROPERTIES, (m) => ({
    hint: "",
    statBlock: [],
    description: m.description,
  }));
}
```

Find:

```tsx
function buildFeatItems(): EncyclopediaItem[] {
  return FEATS.map((f) => ({
    id: `feats-${f.name}`,
    category: "feats",
    name: f.name,
    hint: f.category,
    statBlock: [
      { label: "Categoría", value: f.category },
      f.levelRequired ? { label: "Nivel", value: String(f.levelRequired) } : null,
      f.repeatable ? { label: "Repetible", value: "Sí" } : null,
    ].filter((row): row is { label: string; value: string } => row !== null),
    description: f.description,
  }));
}

function buildSpellItems(): EncyclopediaItem[] {
  return SPELLS.map((s) => ({
    id: `spells-${s.name}`,
    category: "spells",
    name: s.name,
    hint: `${s.level === 0 ? "Cantrip" : `Nv. ${s.level}`} · ${s.school}`,
    statBlock: [
      { label: "Nivel", value: s.level === 0 ? "Cantrip" : `Nivel ${s.level}` },
      { label: "Escuela", value: s.school },
      s.ritual ? { label: "Ritual", value: "Sí" } : null,
      { label: "Lanzamiento", value: s.castingTime },
      { label: "Alcance", value: s.range },
      { label: "Componentes", value: s.components },
      { label: "Duración", value: `${s.duration}${s.concentration ? " (Concentración)" : ""}` },
    ].filter((row): row is { label: string; value: string } => row !== null),
    description: s.description,
  }));
}
```

Replace with:

```tsx
function buildFeatItems(): EncyclopediaItem[] {
  return mapItems("feats", FEATS, (f) => ({
    hint: f.category,
    statBlock: [
      { label: "Categoría", value: f.category },
      f.levelRequired ? { label: "Nivel", value: String(f.levelRequired) } : null,
      f.repeatable ? { label: "Repetible", value: "Sí" } : null,
    ].filter((row): row is { label: string; value: string } => row !== null),
    description: f.description,
  }));
}

function buildSpellItems(): EncyclopediaItem[] {
  return mapItems("spells", SPELLS, (s) => ({
    hint: `${s.level === 0 ? "Cantrip" : `Nv. ${s.level}`} · ${s.school}`,
    statBlock: [
      { label: "Nivel", value: s.level === 0 ? "Cantrip" : `Nivel ${s.level}` },
      { label: "Escuela", value: s.school },
      s.ritual ? { label: "Ritual", value: "Sí" } : null,
      { label: "Lanzamiento", value: s.castingTime },
      { label: "Alcance", value: s.range },
      { label: "Componentes", value: s.components },
      { label: "Duración", value: `${s.duration}${s.concentration ? " (Concentración)" : ""}` },
    ].filter((row): row is { label: string; value: string } => row !== null),
    description: s.description,
  }));
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass.

- [ ] **Step 4: Manual check**

`npm run dev`, Enciclopedia tab. Spot-check one item from each of the 9 categories in both the list view and the detail modal — confirm every field (hint, stat block, description) is identical to what it showed before this refactor (compare against Task 2's manual-check results). This is a behavior-preserving refactor, so nothing should look different.

- [ ] **Step 5: Commit**

```bash
git checkout -- public/sw.js
git add src/components/tabs/EncyclopediaTab.tsx
git commit -m "Feature UI-Redesign-PT6: extract mapItems helper to de-duplicate Encyclopedia's build functions"
```

---

## Final Verification

After all five tasks:

```bash
npx tsc --noEmit && npm run build && npm run lint && npm test
```

Manually re-walk the full spec's Verification section end-to-end across all 3 active themes, then hand off to **superpowers:finishing-a-development-branch** to verify tests, present merge/PR/keep/discard options, and complete the branch.
