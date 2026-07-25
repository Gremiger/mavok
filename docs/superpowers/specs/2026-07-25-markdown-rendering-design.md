# Markdown rendering for descriptions and notes

## Problem

Text extracted from 5etools (`src/data/*.ts`) uses `**Label:**`-style markdown as a
lightweight structuring convention — `scripts/extract-5etools.ts` generates it
deliberately (e.g. `parts.push(\`**${obj.name}:** \`)`). There are 727 occurrences
of `**bold**` across `src/data/*.ts` (conditions, feats, actions, gear, subclasses,
spells, translations). Every place that renders a `description` string does so as
plain text (`{description}` inside a `<p>`), so users see literal asterisks instead
of bold sub-headers — e.g. the Exhaustion condition detail in Combate reads
`**Exhaustion Levels:** This condition is cumulative...` verbatim.

Two `{@tag ...}` 5etools inline-tag leftovers also survived extraction (one in
`actions.ts`, one in `spells.ts`) — the strip regex in `extract-5etools.ts` doesn't
catch every tag shape.

Separately, the user wants to write markdown in their own Notes/Quests/Journal
entries and have it render formatted, not just as an escape hatch for the data bug.

## Approach

Add `react-markdown` + `remark-gfm` (bold, italics, lists, tables) as dependencies.
Build one shared component, `src/components/ui/Markdown.tsx`, wrapping
`ReactMarkdown` with custom renderers mapped to the app's existing Tailwind
classes/theme variables — no `@tailwindcss/typography` plugin, no new CSS system.

Add a small helper, `stripMarkdown()` (in `src/lib/markdown.ts` — same file as the
`Markdown` component's shared regexes, or a sibling `.ts` file), that strips
markdown syntax down to plain text via regex. Used anywhere text is
character-truncated or line-clamped, so a cut mid-`**token**` doesn't leave a
dangling asterisk or a broken bold run.

## `Markdown` component styling

- `<strong>` → `font-semibold text-foreground` (not `text-accent` — accent is
  reserved for real headings/interactive elements; using it for every inline
  `**Label:**` sub-header would compete visually).
- `<em>` → italic, inherited color.
- `<ul>`/`<ol>`/`<li>` → bulleted/numbered list, inherits the caller's text size.
- `<p>` → inherits `leading-relaxed` from the wrapper; the component accepts a
  `className` prop so call sites keep their existing `text-xs`/`text-sm` and
  `text-foreground/70`/`/80` sizing instead of the component hardcoding it.
- No heading levels (`h1`-`h6`), blockquotes, or code blocks are styled specially
  beyond default browser rendering — none of the current data or note content uses
  them, and adding bespoke styling for constructs that don't exist yet is
  premature.

## Call sites: 5etools data descriptions (read-only, untruncated)

Replace the raw `{description}` (or equivalent) render with `<Markdown>` in:

- `src/components/tabs/CombatTab.tsx` — condition detail modal (2 sites: a
  selected condition, and the dedicated Exhaustion view)
- `src/components/tabs/EncyclopediaTab.tsx` — detail view (line ~403)
- `src/components/tabs/SheetTab.tsx` — feature description (line ~372; the
  Weapon Mastery special-case at line ~353 stays as-is, it's not raw description
  text)
- `src/components/sheet/FeatsBrowserModal.tsx` — feat description
- `src/components/combat/StandardActionsModal.tsx` — action and sub-action
  description (2 sites)
- `src/components/settings/LevelUpHistoryModal.tsx` — feature description
- `src/components/combat/AttackRow.tsx` — weapon mastery description
- `src/components/combat/GrantedActionCard.tsx` — granted action description
  (currently interpolated into a `meta` string with an emoji prefix; needs
  restructuring so the description renders as `<Markdown>` rather than being
  concatenated into a plain string)

## Call sites: truncated previews

`src/components/levelup/LevelUpFlow.tsx` has two `f.description.slice(0, 200)`
previews (lines ~439, ~456) — these switch to
`stripMarkdown(f.description).slice(0, 200)`. The untruncated full description at
line ~694 uses `<Markdown>`.

## Call sites: user-authored content (Notes / Quests / Journal)

`JournalList.tsx` already has a read-only "view" mode separate from its edit
textarea (lines ~274-304). Swap its `<p className="whitespace-pre-line">{content}</p>`
for `<Markdown>`. The edit textarea is unchanged — users type raw markdown syntax
by hand, same as any markdown editor without a live preview.

`NoteList.tsx` and `QuestList.tsx` currently have no such split — tapping a card
opens straight into the edit form/textarea. Add the same view/edit split Journal
already has: tapping a card opens a read-only view (title, `<Markdown>` content,
tags/fields, "Editar" and "Eliminar" actions); "Editar" switches to the existing
textarea form. This makes the three Notes sections consistent with each other and
gives markdown somewhere to actually render.

List-row card previews (the `line-clamp-2`/`line-clamp-3` snippets in all three
components) switch from raw `{content}` to `stripMarkdown(content)` — a short
plain-text summary, not a partially-rendered markdown fragment. `line-clamp` on
multi-block markdown output (lists, multiple paragraphs) doesn't truncate cleanly,
so previews stay plain text; only the full view renders formatted.

## Data cleanup

Fix the tag-stripping regex in `scripts/extract-5etools.ts` (currently
`/\{@\w+\s+([^|}]+?)(?:\|[^}]*)?\}/g`) so it also catches the two surviving shapes
in `actions.ts` (`{@book stabilize a creature.}`) and `spells.ts`
(`{@variantrule Unarmed Strike|XPHB}`) — the `{@book ...}` tag has no space-then-arg
split it expects, and needs a dedicated case or a broadened pattern. Re-run
`npx tsx scripts/extract-5etools.ts` after the fix so the two data files pick up
the corrected text. This is a data regen, not a hand-edit of the generated files.

## Data model / migrations

No `Character` schema changes. `NoteEntry.content`, `QuestEntry.content`, and
`JournalEntry.content` are already free-form strings — markdown is just a
convention for what a user types into them, not a new field. No migration needed.

## Testing

- `stripMarkdown()` is a pure function — add a unit test (`src/lib/markdown.test.ts`)
  covering bold, italic, and list-marker stripping, plus a truncation-boundary case
  (cutting mid-token doesn't leave a stray `*`).
- No unit tests for the `Markdown` component itself (it's a thin wrapper around a
  well-tested library) or for the Notes/Quests view-mode split (no component test
  harness exists in this repo yet, per `CLAUDE.md`).
- Manual verification per `CLAUDE.md`: run the dev server, check the Exhaustion
  condition detail in Combate renders bold sub-headers instead of literal `**`,
  check a Feats Enciclopedia entry, and create/view a Note with `**bold**` and a
  `- list` item to confirm the new view mode renders it.
- `npx tsc --noEmit && npm run build && npm run lint && npm test` must all pass
  (lint matters here too, even though this feature doesn't touch hooks — it's the
  standing bar for every change per `CLAUDE.md`).
