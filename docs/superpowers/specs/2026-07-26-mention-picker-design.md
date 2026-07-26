# @mention Autocomplete Picker — Design

## Problem

`@mention` linking (Mundo/NPCs/Misiones/Diario cross-references) shipped
with a plain-text matching scheme (`src/lib/note-links.ts`): typing
`@Riti` in a note's content links to the note titled "Riti" if the text
matches exactly. This works, but has no discoverability or feedback while
typing — the user has to recall and type the *exact* title, including
spacing and case, with zero visual confirmation. For single-word titles
this is usually fine; for multi-word titles ("Bar de Nim") it's
impractical to get right blind. This design adds an autocomplete dropdown
that appears while typing after `@`, showing matching notes to tap
instead of typing the full title from memory.

This also fixes nothing about `linkifyMentions` itself — that matching
logic is confirmed working for multi-word titles already (verified via
direct test). The picker is purely an input-time aid; it does not change
how mentions are parsed or rendered at view time.

## Scope

The picker is added to the 4 existing content textareas where
`linkifyMentions`/`onInternalLink` are already wired up:
- `NoteList.tsx`'s note form (`Mundo`/`NPCs` — one shared component)
- `QuestList.tsx`'s quest form
- `JournalList.tsx`'s new-entry form and edit-entry form (two separate
  textareas in the same file)

Quick Notes (`QuickNotes.tsx`) is explicitly **out of scope** — quick
notes have no title and aren't valid mention targets, and the user chose
not to extend picker/linkify support there.

## Detection & Filtering

Given the textarea's current value and caret position, an "active
mention" is detected by scanning backward from the caret for an `@`
character, where:
- there is no newline between the `@` and the caret (a mention cannot
  span multiple lines)
- the character immediately before `@` is either the start of the string
  or whitespace (so `email@domain`-style text mid-word never triggers
  the picker)

If found, the substring between `@` and the caret is the **query**. This
logic lives in a new pure function `findActiveMention(value, caretIndex)`
in `src/lib/mention-picker.ts`, unit-tested the same way other pure
helpers in `src/lib/` are.

Filtering (`filterLinkables(linkables, query, limit = 5)`, same file):
case-insensitive **starts-with** match against each linkable's title,
capped at **5** results. An empty query (just typed `@`) shows the first
5 linkables unfiltered, in `buildLinkableNotes`'s existing order (NPCs →
Mundo → Misiones → Diario). Scope of mentionable items is unchanged from
today: all four sections, matching what `linkifyMentions` already
resolves.

If `linkables` is empty (no notes exist yet anywhere), the picker never
opens — there's nothing to suggest.

If the query has no matches, the dropdown stays open showing a single
disabled "Sin resultados" row (consistent with the chosen close
behavior below — it does not auto-close on a non-matching query).

## Insertion Behavior

Tapping/clicking a suggestion replaces the active mention range (the `@`
through the caret) with `<title> ` — the full title plus one trailing
space — and moves the caret to just after that inserted space, so the
user can keep typing immediately. This is done by computing the new
string in JS, calling the existing `onChange` with it, and then
imperatively restoring the textarea's `selectionStart`/`selectionEnd` via
a ref (React controlled inputs don't move the native caret on their own
after a value change).

## Closing Behavior

Per the user's explicit choice, the picker does **not** close on typing a
space — this is required for multi-word titles like "Bar de Nim" to keep
filtering correctly as you type through the spaces. It closes only on:
- **Escape** — cancels the picker, no text change
- **Clicking/tapping outside** both the textarea and the dropdown
  (standard "click outside" listener while the picker is open)
- Selecting a suggestion (see above)
- A newline in the value at or before the caret invalidates the active
  mention region (the backward scan in `findActiveMention` never crosses
  a newline), so pressing Enter naturally ends any in-progress mention
  query without needing special-case handling.

No keyboard navigation (arrow keys / Enter-to-select) is implemented,
per the user's choice to keep this phone-first/tap-only, matching the
project's stated phone-first design.

## Component

`src/components/notes/MentionTextarea.tsx` (new): a drop-in replacement
for a plain `<textarea>`. Props:

```ts
interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  linkables: LinkableNote[];
  placeholder?: string;
  rows?: number;
  className?: string;
  autoFocus?: boolean;
}
```

Renders the `<textarea>` (forwarding the above props directly, same as
today's plain textareas) plus, when a mention is active and matches
exist, a dropdown block directly below it (not a floating/absolutely
positioned popover — matches the user's choice and is simplest on
mobile). Each suggestion row shows the title and a small section-label
chip (Mundo/NPC/Misión/Diario) so same-named entries across sections
stay distinguishable. Suggestion buttons use `onMouseDown={e =>
e.preventDefault()}` so tapping a suggestion doesn't blur the textarea
before the click's `onClick` fires (standard pattern for this kind of
dropdown-under-input UI).

This is a UI component and is not unit-tested, consistent with the
project's existing scope ("No component/UI tests yet" per `CLAUDE.md`) —
only the pure logic in `mention-picker.ts` gets tests.

## Call Sites

`NoteList.tsx`, `QuestList.tsx`, `JournalList.tsx` each already compute
`buildLinkableNotes(character.notes)` for rendering (in the view modal).
Each file's content `<textarea>` in its form(s) is replaced with:

```tsx
<MentionTextarea
  value={form.content}
  onChange={(v) => setForm({ ...form, content: v })}
  linkables={buildLinkableNotes(character.notes)}
  placeholder="Detalles"
  rows={4}
/>
```

(`JournalList.tsx` does this twice — once for `form.content` in the new
entry modal, once for `editForm.content` in the edit view.)

## Testing

- `src/lib/mention-picker.test.ts`: unit tests for `findActiveMention`
  (mid-word `@` not preceded by whitespace → no match; multi-word query
  spanning spaces; newline invalidates a stale mention; caret not at end
  of string) and `filterLinkables` (starts-with case-insensitivity, empty
  query returns first N, limit respected, zero matches returns empty
  array).
- Manual verification: dev server + programmatic/`curl` substitute checks
  (per this session's established pattern, since Chrome DevTools MCP is
  currently unavailable) — confirm the picker opens/filters/inserts/closes
  as designed by reading the rendered component logic and tracing example
  inputs through `findActiveMention`/`filterLinkables` directly, the same
  way the note-links round-trip was verified in the prior plan.

## Out of Scope

- Quick Notes mention/picker support (explicitly declined)
- Keyboard navigation of the dropdown (explicitly declined)
- Floating/cursor-relative popup positioning (declined in favor of
  below-textarea placement)
- Any change to `linkifyMentions`/`parseNoteLink`/the view-time rendering
  path — already correct, untouched by this design
