# Encyclopedia / Quick Lookup — Design

## Context

The app has no rules-reference surface. Weapons, armor, gear, conditions, weapon mastery properties, and feats are already extracted from `5etools-src` into `src/data/*.ts`, but there's no UI that browses or searches them independent of a character sheet. There's also no data for spells, actions (Attack, Dash, Grapple, etc.), or skills.

The goal: a table-wide reference tool, not a character-specific one — "if someone at the table doesn't know a rule/spell/item, check it in the app quickly." This should work even though Mavok (a Barbarian) doesn't cast spells; other players' spells are still worth having on hand.

There's already a strong UI precedent for this exact "type-to-search across categorized reference data, tap for detail" pattern: `NotesTab.tsx`'s sub-tab + search architecture (search bar hides category pills and shows cross-category tagged results; tapping a result jumps to its section) and `CombatTab.tsx`'s condition-detail `Modal` (tap a condition tag → full description in a modal). This design reuses both directly rather than inventing new patterns.

## 1. Data layer (extraction script + generated files)

Add three new extraction functions to `scripts/extract-5etools.ts`, following the existing pattern (`fs.readFileSync` from `TOOLS_DIR`, filter `source === "XPHB"`, map, emit a `.ts` file with an interface + const array, reuse `flattenEntries`/`stripMarkup`):

- **`extractActions()`** → `src/data/actions.ts`, reading `actions.json`:
  ```ts
  export interface ActionData {
    name: string;
    description: string;
  }
  export const ACTIONS: ActionData[];
  ```
- **`extractSkills()`** → `src/data/skills-reference.ts` (named to avoid clashing with the unrelated `Character.skills` field), reading `skills.json`:
  ```ts
  export interface SkillData {
    name: string;
    ability: string; // e.g. "Dexterity"
    description: string;
  }
  export const SKILLS_REFERENCE: SkillData[];
  ```
- **`extractSpells()`** → `src/data/spells.ts`, reading `spells/spells-xphb.json`:
  ```ts
  export interface SpellData {
    name: string;
    level: number; // 0 = cantrip
    school: string; // full name, e.g. "Evocation" (map from XPHB's single-letter codes: A/C/D/E/V/I/N/T)
    castingTime: string; // e.g. "1 Action"
    range: string; // e.g. "60 feet", "Self", "Touch"
    components: string; // e.g. "V, S, M (a strip of white cloth)"
    duration: string; // e.g. "Instantaneous", "1 Hour"
    concentration: boolean;
    ritual: boolean;
    description: string;
  }
  export const SPELLS: SpellData[];
  ```
  `description` = `flattenEntries(entries)`; append `entriesHigherLevel` content (Cantrip Upgrade / higher-level slot text) when present, same flattening helper.

Wire all three into the script's run-all section. Re-run `npx tsx scripts/extract-5etools.ts` and commit the three new generated files.

## 2. Navigation

In `src/app/page.tsx`:
- Add `"enciclopedia"` to the `Tab` union type and `TAB_ORDER` array (after `"notas"`, before `"ajustes"`).
- Add an entry to `TAB_META` with a new icon — `Library` from `lucide-react` (distinct from Notes' `BookOpen`).
- Add `enciclopedia: <EncyclopediaTab />` to the `tabContent` record.

No other changes to the swipeable bottom-nav mechanics — it already handles N tabs generically.

## 3. EncyclopediaTab UI

New `src/components/tabs/EncyclopediaTab.tsx`, structured like `NotesTab.tsx`:

- **Categories** (9, horizontally-scrollable pill row, same `overflow-x-auto` pattern as Notes' sub-tabs): Condiciones (`CONDITIONS`), Acciones (`ACTIONS`), Habilidades (`SKILLS_REFERENCE`), Armas (`WEAPONS`), Armaduras (`ARMOR`), Equipo (`GEAR`), Maestrías (`MASTERY_PROPERTIES`), Dotes (`FEATS`), Hechizos (`SPELLS`).
- **Search bar** at top, same as Notes: when non-empty, hides the category pills and instead lists cross-category matches (name-substring match only, case-insensitive) tagged with a category badge (mirroring Notes' `typeLabel` pattern). Tapping a result opens its detail modal directly.
- **Category list view**: when not searching, shows the active category's items as rows (name + one short inline hint per category — e.g. spells show `Nv. {level} · {school}`, weapons show `{damage} {damageType}`, conditions show just the name). Tapping a row opens the detail modal.
- **Detail modal**: reuses the existing `Modal` component (same as `CombatTab`'s condition-detail modal). Content is category-specific formatted text — e.g. for spells: level/school/casting time/range/components/duration/concentration/ritual as a compact header block, then the description below.

## Out of scope

- No class-based spell filtering (5etools-src's XPHB spell entries used here don't carry a clean `classes` field in this dataset; not needed for a generic reference tool).
- No level/school filter UI for the 391-spell list — search-to-narrow is sufficient, consistent with how Notes already handles its lists.
- No changes to `recalculate.ts`, `Character` type, or any character-specific state — this tab reads only static reference data, nothing from `useCharacterContext()`.

## Verification

`npx tsc --noEmit && npm run build && npm run lint` must pass. Manually verify in the dev server: switch to the Enciclopedia tab, browse each of the 9 categories, search by name and confirm cross-category tagged results appear, tap into detail modals for a condition, a spell, and a weapon to confirm formatting.
