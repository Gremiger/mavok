# Notas + Enciclopedia Redesign (UI Redesign Phase 6) — Design

## Context

Continuation of the tab-by-tab UI redesign (Combat tab: phase 1; Combat modals: phase 2; Ficha light pass: phase 3; Combat vitals rage flair: phase 4; Inventario light pass: phase 5). This round covers the two remaining lightweight tabs, Notas and Enciclopedia, grouped together because they already share near-identical structure (search bar + segmented toggle, horizontal category/sub-tab strip, list rows that navigate rather than expand inline).

Scope started as a light consistency pass (matching the Ficha/Inventario rounds) but grew after a "what can go deeper" follow-up surfaced concrete, well-scoped opportunities beyond pure visual consistency. Final agreed scope is five items, described below as sections A–E.

**Files in scope:** `src/components/tabs/NotesTab.tsx`, `src/components/tabs/EncyclopediaTab.tsx`, `src/components/notes/QuestList.tsx`, `src/components/notes/NoteList.tsx`. (`QuickNotes.tsx` and `JournalList.tsx` were read and found already consistent with established patterns — no changes needed there.)

## A. Consistency conversions

**`NotesTab.tsx` search-result rows** (currently a hand-rolled `stone-card` div, lines ~200-212) become `CompactRow`. The type-label badge (`text-[0.6rem] px-1.5 py-0.5 bg-accent/20 text-accent rounded`) goes inside the `name` prop as a leading inline sibling to the title text — not wrapped in its own `flex` div — since `CompactRow`'s `name` slot is already a `block truncate` span; nesting a `flex` div inside it would break truncation the same way it would have on Inventario's item rows (already caught and avoided in phase 5). A plain inline badge span followed directly by the title text works correctly because inline siblings flow next to each other without needing an explicit flex container:

```tsx
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
```

**`EncyclopediaTab.tsx`'s `renderRow`** (lines ~260-288) gets the same treatment — category badge (when `showCategoryBadge`) composed inline in `name` ahead of `item.name`, and the hint text + favorite star button move to `right`:

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

**`QuestList.tsx`'s status filter chips** (lines ~127-141, currently `px-3 py-1 rounded-full text-xs` with manual `bg-accent text-white` / `bg-card border border-border text-muted` branching — the exact pre-`GhostChip` pattern Inventario's category chips had before phase 5) become `GhostChip`:

```tsx
<div className="flex gap-1">
  {(["all", "active", "completed", "failed"] as const).map((f) => (
    <GhostChip key={f} onClick={() => setFilter(f)} solid={filter === f}>
      {f === "all" ? "Todas" : STATUS_CONFIG[f].label}
    </GhostChip>
  ))}
</div>
```

## B. Encyclopedia detail modal → structured stat block

Today, `buildWeaponItems`, `buildArmorItems`, `buildFeatItems`, and `buildSpellItems` each build a `header: string` field by joining several lines with `\n`, which `resolveDetail()` then concatenates with the description body and renders as one `whitespace-pre-line` paragraph. The other five categories (conditions, actions, skills, gear, mastery) have an empty `header` and are pure prose already — those are unaffected by this change.

`EncyclopediaItem`'s `header: string` field is replaced with `statBlock: { label: string; value: string }[]` (empty array for the five prose-only categories). Each of the four affected `buildXItems` functions changes from building a joined string to building an array, filtering out rows whose value doesn't apply:

```ts
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
```

Armor, Feats, and Spells follow the same shape — filtered array of `{label, value}`, translating each existing header line 1:1 into a labeled row:

```ts
// Armor
statBlock: [
  { label: "Tipo", value: a.type },
  { label: "CA", value: String(a.ac) },
  { label: "Peso", value: `${a.weight} lb${a.value !== null ? ` · Valor: ${a.value} gp` : ""}` },
  a.stealthDisadvantage ? { label: "Sigilo", value: "Desventaja" } : null,
  a.strengthRequirement ? { label: "Requiere FUE", value: String(a.strengthRequirement) } : null,
].filter((row): row is { label: string; value: string } => row !== null),

// Feats
statBlock: [
  { label: "Categoría", value: f.category },
  f.levelRequired ? { label: "Nivel", value: String(f.levelRequired) } : null,
  f.repeatable ? { label: "Repetible", value: "Sí" } : null,
].filter((row): row is { label: string; value: string } => row !== null),

// Spells
statBlock: [
  { label: "Nivel", value: s.level === 0 ? "Cantrip" : `Nivel ${s.level}` },
  { label: "Escuela", value: s.school },
  s.ritual ? { label: "Ritual", value: "Sí" } : null,
  { label: "Lanzamiento", value: s.castingTime },
  { label: "Alcance", value: s.range },
  { label: "Componentes", value: s.components },
  { label: "Duración", value: `${s.duration}${s.concentration ? " (Concentración)" : ""}` },
].filter((row): row is { label: string; value: string } => row !== null),
```

`resolveDetail()` drops the header-joining logic and returns just the translated/description body:

```ts
function resolveDetail(item: EncyclopediaItem, language: "en" | "es"): string {
  const translations = TRANSLATIONS[item.category];
  const translated = language === "es" ? translations?.[item.name] : undefined;
  return translated ? `${TRANSLATION_DISCLAIMER}\n\n${translated}` : item.description;
}
```

The detail `Modal` renders the stat block (when non-empty) as a bordered block above the body text:

```tsx
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
```

For the five prose-only categories, `statBlock` is `[]`, so this block doesn't render — output is unchanged from today (still just the description paragraph).

## C. Favorites → dedicated star toggle

Favorites currently lives as `FAVORITES_ID`, the first entry in the 10-item `PILLS` scrollable tab-strip (`CATEGORIES` + favorites) — easy to miss since it's off-screen unless scrolled to the far left.

Removed from the tab-strip entirely: `PILLS`/`PILL_IDS`/`FAVORITES_ID` are deleted, and the tab-strip (and `useSwipeNavigation`) goes back to iterating `CATEGORIES` directly (9 items, `activeCategory: Category` — the union no longer includes `typeof FAVORITES_ID`).

New `showingFavorites` boolean state, toggled by a star button placed next to the EN/ES language toggle in the search bar row:

```tsx
<button
  onClick={() => setShowingFavorites((v) => !v)}
  className={`shrink-0 p-2 rounded-lg border ${
    showingFavorites ? "border-accent bg-accent/20 text-accent" : "border-border text-muted"
  }`}
  aria-label={showingFavorites ? "Ver categoría actual" : "Ver favoritos"}
>
  <Star size={16} fill={showingFavorites ? "currentColor" : "none"} />
</button>
```

Category tab clicks always exit favorites mode, so tapping any category "wins" over a stale favorites view:

```tsx
onClick={() => {
  setActiveCategory(tab.id);
  setShowingFavorites(false);
}}
```

Content render order becomes: search query (unchanged) → `showingFavorites` (the existing favorites list/empty-state branch, unchanged content) → normal category view (unchanged). The tab-strip hides under the same condition search results currently hide it under (`!searchQuery`), now additionally hidden when `showingFavorites` is true, mirroring how it already hides during search — a favorites view and a category view are mutually exclusive display modes, same relationship search already has with the category view: `{!searchQuery && !showingFavorites && (<tab-strip>)}`.

Swipe navigation (`useSwipeNavigation`'s drag handling on the `motion.div`) must also be disabled while `showingFavorites` is true, for the same reason it's already disabled during search — there's no "adjacent category" to swipe to from the favorites view, and letting a swipe gesture silently change `activeCategory` in the background while favorites is still the visible content would desync what's on screen from what `activeCategory` actually holds. The existing `drag={searchQuery ? false : "x"}` becomes `drag={searchQuery || showingFavorites ? false : "x"}`.

## D. NoteList: labeled divider before custom fields

In `NoteList.tsx`'s add/edit `Modal` (world/NPC notes), the dynamic custom-fields section (the `Object.entries(form.fields).map(...)` block, the "add field" input, and the suggested-fields quick-add chips) gets a plain non-interactive label above it, matching `AttackFormModal`'s established divider style from phase 2 (a labeled boundary between field groups, not a `CollapsibleSection` — Quest/Journal's modals were checked and found too flat/short to warrant grouping, so they're untouched):

```tsx
<div className="pt-1 border-t border-border">
  <span className="text-[0.65rem] text-muted uppercase tracking-wide">Detalles</span>
</div>
```

Placed immediately before the `{Object.entries(form.fields).map(...)}` block, after the `tags` input. Always rendered (not conditional) — on a fresh new-note form, `form.fields` is empty but the suggested-fields quick-add chips are already visible, so the divider is meaningful from the first render, not just once fields exist.

## E. Encyclopedia: extract `mapItems` helper

Pure internal refactor, no visual or behavioral change. The 9 `buildXItems` functions repeat the same `{id: `${category}-${name}`, category, name, ...}` object-literal shape. Extracted to a shared helper:

```ts
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
```

Each `buildXItems` function is rewritten in terms of `mapItems`, e.g.:

```ts
function buildConditionItems(): EncyclopediaItem[] {
  return mapItems("conditions", CONDITIONS, (c) => ({
    hint: "",
    statBlock: [],
    description: c.description,
  }));
}
```

Since this file has no existing test coverage (consistent with the rest of the codebase's "no component/UI tests yet" convention) and the refactor is behavior-preserving, verification is manual: confirm every category's list view and detail modal render identically before/after.

## Out of scope

- `QuickNotes.tsx` and `JournalList.tsx` — read and found already consistent with established patterns (density-aware `stone-card` cards, the same "⋯" dropdown-menu idiom as `AttackRow`, `JournalList` already uses the correct `prevInitialOpenId` render-body-comparison idiom). No changes.
- Quest/Journal modal field-grouping — considered under section D's original framing, ruled out as unnecessary (both modals are already short and flat, nothing to group).
- The horizontal tab-strip navigation pattern itself and the two-option segmented toggles (Aquí/Todo, EN/ES) — these are their own coherent, purpose-built patterns already consistent between the two tabs; not a gap, not touched.
- Ajustes tab — remains its own future round (860 lines, themes/backup/level-history/data-management — substantially larger and more complex than this round's two tabs).
- The 4th theme direction to replace `dark-fantasy` — still deferred from earlier rounds.

## Verification

`npx tsc --noEmit && npm run build && npm run lint && npm test` must pass. Manually verify in the dev server across `piedra-viva`, `pergamino`, `furia-de-sangre`:

- Notas: search across sub-tabs, confirm result rows render correctly (badge + title, tappable, navigates to the right sub-tab/entry) in both compact and spacious density.
- Enciclopedia: browse each of the 9 categories, confirm rows render correctly (badge only shown in search results, hint + star always on the right). Search across categories. Verify weapons/armor/feats/spells detail modals show the new stat-block layout with correct label/value rows; verify conditions/actions/skills/gear/mastery detail modals are unchanged (still plain prose, no stat block rendered).
- Favorites: star a few items across different categories, tap the new star toggle button, confirm the favorites-only view shows exactly the starred items with the tab-strip hidden; tap a category tab, confirm it exits favorites mode and shows that category; confirm swipe navigation between categories still works with favorites removed from the swipe set.
- QuestList: confirm the four status filter chips (`GhostChip`) correctly filter and show solid/ghost state matching the active filter.
- NoteList: open the "Nueva nota" form for both World and NPC sections, confirm the "Detalles" divider appears above the custom-fields area on a fresh (empty-fields) form.
- Encyclopedia refactor: spot-check at least one item from each of the 9 categories in both the list view and detail modal to confirm the `mapItems` refactor produced identical output to before.
