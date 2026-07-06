# Batch 2: Notes Search Current/Global Toggle — Design

Part of the same brainstorm of app improvements as Batch 1. This spec covers Batch 2: adding a current/global scope toggle to the Notes search that already exists in `NotesTab.tsx`.

## Existing state (discovered during design, not previously known)

`NotesTab.tsx` already implements full cross-section search: `computeSearchResults(notes, query)` (lines 42-99) searches World notes, NPCs, Quests, Journal, and Quick Notes simultaneously, returning tagged results (`{ id, section, typeLabel, title }`). Typing any query hides the sub-tab navigation and shows a unified results list; tapping a result jumps to it via `handleResultTap` (sets `activeSubTab`, `pendingOpenId`, clears the query). This is exactly "global" search — there was just no way to scope it to only the currently active sub-tab. This batch adds only that toggle; the search/matching logic itself does not change.

## Design

**New state**: `const [searchScope, setSearchScope] = useState<"current" | "global">("global")` in `NotesTab.tsx`. Defaults to `"global"` — this preserves today's existing behavior exactly; the toggle is purely additive, not a behavior change for anyone who ignores it.

**Filtering**: `computeSearchResults()` is unchanged. In the component, its output is filtered before rendering:

```ts
const rawResults = searchQuery
  ? computeSearchResults(charCtx.character.notes, searchQuery)
  : [];
const results =
  searchScope === "current"
    ? rawResults.filter((r) => r.section === activeSubTab)
    : rawResults;
```

**Toggle UI**: two small pill buttons, "Aquí" (current) and "Todo" (global), rendered next to the search input inside the existing search bar `<div>`. Always visible (not conditional on `searchQuery`), so the feature is discoverable before the user starts typing.

**Sub-tab navigation visibility (the one behavior change)**: today, `{!searchQuery && (...)}` hides the sub-tab bar the instant any query is typed. This changes to `{(!searchQuery || searchScope === "current") && (...)}` — the sub-tab bar stays visible and tappable during a **current**-scoped search (switching sub-tabs live-changes what "current" means, so the user can search each section in turn without clearing their query), and still hides during a **global** search (sections are irrelevant there, matching today's behavior exactly).

**Swipe navigation**: `drag={searchQuery ? false : "x"}` on the results/content `motion.div` changes to `drag={searchQuery && searchScope === "global" ? false : "x"}` — swipe-to-change-sub-tab keeps working during current-scoped search (it's just an alternate gesture for the same tab switch the visible nav bar already allows), and stays disabled during global search as today.

**Result tap behavior**: unchanged — `handleResultTap` already sets `activeSubTab` and clears the query regardless of scope, so it needs no changes for either mode.

## Out of scope

- Changes to what fields are searched (title/content/fields/tags — already comprehensive per section, not part of this batch)
- Any other batch's work (Level-up history, Combat rules accuracy, Technical hardening)
