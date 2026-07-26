# Species/Background catalogs and @mention note linking

## Problem

Three related asks:

1. **Species reference.** Enciclopedia has no "Especies" category. Mavok's
   own Goliath traits are hand-typed as `Feature` entries in
   `mavok-default.ts`, but there's no reference catalog — no way to look up
   the official text for Goliath (or any other species) independent of
   Mavok's specific character sheet.
2. **Background reference.** Same gap for backgrounds — `meta.background:
   "Farmer"` is a plain label with no linked skill/tool/equipment grants
   anywhere.
3. **Cross-referencing notes with `@mentions`.** A note like "Casona:
   Hogar de @Riti" should let the user tap `@Riti` and jump straight to the
   NPC note titled "Riti" (and vice versa) — today `@Riti` is just inert
   text.

## Approach

### Species and Backgrounds — same recipe as magic items/rules

- `../dnd/5etools-src/data/races.json`, filtered to `source === "XPHB"` — 10
  species (Aasimar, Dragonborn, Dwarf, Elf, Gnome, Goliath, Halfling, Human,
  Orc, Tiefling).
- `../dnd/5etools-src/data/backgrounds.json`, filtered to `source ===
  "XPHB"` — 16 backgrounds (confirmed Mavok's own "Farmer" is among them,
  matching `mavok-default.ts`).
- New data files `src/data/species.ts` (`SpeciesData { name, size, speed,
  description }`) and `src/data/backgrounds.ts` (`BackgroundData { name,
  description }`), extracted via two new functions in
  `scripts/extract-5etools.ts`, following the exact `extractMagicItems`/
  `extractVariantRules` pattern.
- Two new Enciclopedia categories (`species` → "Especies", `backgrounds` →
  "Trasfondos"), following the exact `mapItems`/`CATEGORY_ITEMS` pattern.
  Species get a small stat block (Tamaño, translated from the size-code
  abbreviation; Velocidad in feet); Backgrounds get no stat block (their
  extracted description already contains the Ability Scores/Feat/Skill
  Proficiencies/Tool Proficiency/Equipment breakdown as bold sub-headers,
  same as how Conditions/Actions already work without a stat block).

### `flattenEntries` gap #2: singular `.entry` field, and colon-doubling

Backgrounds' source data uses a *different* list-item shape than magic
items/species did: `{"type": "item", "name": "Feat:", "entry": "..."}` —
note **`entry` (singular string)**, not `entries` (array), and the `name`
already ends in `:`. Confirmed against the real "Farmer" background data.
Without a fix, this would (a) silently drop every list item's body text
(same class of bug as the nested-list fix from the previous plan, just a
different shape) and (b) render as `**Feat::**` (doubled colon) for the
label.

**Fix**, in `scripts/extract-helpers.ts`'s `flattenEntries`: also check for
`typeof obj.entry === "string"` (in addition to the existing `.entries`/
`.items` array checks) and append it via `stripMarkup`; and strip a
trailing `:` off `obj.name` before wrapping it in `**name:**` so a
pre-colon-ed label doesn't double up. Verified this doesn't change the
existing "Section One" test case (that name has no trailing colon).

### `@mention` note linking

**Matching.** New `src/lib/note-links.ts`:
```ts
export interface LinkableNote {
  id: string;
  section: "world" | "npcs" | "quests" | "journal";
  title: string;
}

export function buildLinkableNotes(notes: Notes): LinkableNote[];
export function linkifyMentions(content: string, linkables: LinkableNote[]): string;
```
`buildLinkableNotes` enumerates `notes.npcs`, `notes.world`, `notes.quests`,
`notes.journal` **in that order** — NPCs first, Mundo, Misiones, Diario —
this array order is how title-collisions get resolved (see below). Quick
notes (`notes.quick`) aren't linkable — they have no `title` field.

`linkifyMentions` scans `content` for `@` followed by text that matches a
known title (case-insensitive), and replaces the match with real markdown
link syntax: `[Title](mavok-note://section/id)`. Matching is **longest-title-first**
(sorted by `title.length` descending, a stable sort so same-length ties keep
`buildLinkableNotes`'s NPCs→Mundo→Misiones→Diario order) so a multi-word
title like "Casona Vaelcrest" matches whole, not just its first word, and a
match only counts if the character right after the title is not a
letter/digit (or end of string) — so `@Riti` doesn't accidentally match
inside `@Ritila`. No match → the `@` and following text are left as
plain, unlinked text (no visual "broken link" treatment for v1).

**Rendering.** `src/components/ui/Markdown.tsx` gains an `a` renderer (it
has none today) and an optional prop:
```ts
onInternalLink?: (href: string) => void;
```
If `href` starts with `mavok-note://` and `onInternalLink` is provided,
render a `<button type="button">` styled like a link (`text-accent
underline underline-offset-2`) that calls `e.stopPropagation();
onInternalLink(href)` instead of navigating. Otherwise render a normal
external `<a href target="_blank" rel="noopener noreferrer">` with the same
visual style — this also closes the "no link styling at all" gap noted in
the markdown-rendering plan's final review, as a side effect of building
this properly.

**Scope for v1: full view only, not the card-list preview.** `NoteList`/
`QuestList`/`JournalList`'s card previews already render through
`<Markdown>` (as of the last shipped change) but **don't** run
`linkifyMentions` on their content — so a `@mention` in a card preview
stays literal text there, and the card's own tap-to-open behavior is
unaffected. Only the full read-only view (opened by tapping the card) runs
content through `linkifyMentions` before rendering, and only there is
`onInternalLink` wired up. This sidesteps a real interaction wrinkle
(a link inside a `line-clamp`ed card that's *itself* inside a clickable
card) without needing any event-bubbling workaround.

**Navigation wiring.** `NotesTab.tsx` already owns cross-section navigation
(`activeSubTab`/`pendingOpenId`, currently only driven by search-result
taps via `handleResultTap`). It gains one more entry point:
```ts
function handleNavigate(section: "world" | "npcs" | "quests" | "journal", id: string) {
  setActiveSubTab(section);
  setPendingOpenId(id);
}
```
passed down as a new `onNavigate` prop to `NoteList`/`QuestList`/
`JournalList`. Each of those parses the `mavok-note://<section>/<id>` href
in its `onInternalLink` callback and calls `onNavigate(section, id)`.

**Pre-existing inconsistency fix, required for this to work correctly.**
`JournalList.tsx`'s `initialOpenId` effect already opens the read-only
*view* (`setViewingId(initialOpenId)`) — correct, and how search-result
navigation into Diario already behaves today. `NoteList.tsx` and
`QuestList.tsx`'s `initialOpenId` effects instead call `openEdit(note)`,
jumping straight into the raw-text edit form — a leftover from before the
view/edit split (Tasks 10/11 of the prior plan) that was never updated.
Confirmed by reading both files directly. This plan changes both to call
`setViewingId(initialOpenId)` instead, matching `JournalList`'s existing,
correct behavior. This is a small, deliberate behavior change to *existing*
search-result navigation (tapping a Mundo/NPC/Quest search result now opens
its view instead of its edit form) — necessary for `@mention` links to feel
right (you tap a link to read about someone, not to edit their note), and
makes all three components consistent with each other and with the
tap-a-card-to-view pattern already established everywhere else.

## Data model / migrations

No `Character` schema changes, no migration. `SpeciesData`/`BackgroundData`
are generated reference data like every other `src/data/*.ts` file.
`@mention` linking is pure text transformation at render time — no new
field is added to `NoteEntry`/`QuestEntry`/`JournalEntry` to store link
targets; they're resolved fresh from titles on every render.

## Testing

- Extend `scripts/extract-5etools.test.ts` with a case for the `.entry`
  (singular) fix and the colon-doubling fix, using a synthetic input
  shaped like the real Farmer background list item.
- New `src/lib/note-links.test.ts`: single-word match, multi-word match
  (longest-title-first), no-match passthrough, word-boundary rejection
  (`@Ritila` doesn't match a note titled "Riti"), and same-length-collision
  priority (two equal-length titles in different sections — the one built
  earlier by `buildLinkableNotes`'s ordering wins).
- Manual verification: run the dev server, create a Mundo note "Casona"
  with content "Hogar de @Riti", an NPC note "Riti", tap into "Casona,"
  confirm "@Riti" renders as a tappable link, tap it, confirm it switches to
  NPCs and opens "Riti"'s view (not its edit form). Also verify Especies →
  Goliath and Trasfondos → Farmer show up in Enciclopedia with correct text.
- `npx tsc --noEmit && npm run build && npm run lint && npm test` must all
  pass.
