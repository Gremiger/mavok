# Mavok Round 2 Improvements — Design Spec
Date: 2026-07-01

## Overview

Three independent UX/feature gaps identified after the first improvement round: inventory findability, a way to correct resource-tracker misclicks, and cross-note search. PWA install prompting and dice-roll integration were considered and dropped — dice rolls are already wired into attack rows, skill checks, saves, and ability checks; PWA installability isn't needed since this is a personal-use app, not distributed to others.

---

## Section 1 — Inventory search, sort, category filter

**File:** `src/components/tabs/InventoryTab.tsx`

- Add a search input above the currency bar. Local state `searchQuery: string`, default `""`.
- Add a sort control (a small `<select>` or segmented toggle) with three options: **Nombre** (`.sort((a,b) => a.name.localeCompare(b.name))` — note this changes today's implicit insertion-order display to true alphabetical order), **Peso** (`.sort((a,b) => (b.weight ?? 0) - (a.weight ?? 0))`, heaviest first), **Equipado** (equipped items first, then unequipped). Default: Nombre. Local state `sortBy: "name" | "weight" | "equipped"`.
- Add category filter chips: one toggle chip per category (`CATEGORIES` array already defines the 5: weapon/armor/gear/consumable/personal). Local state `hiddenCategories: Set<InventoryItem["category"]>`, default empty (all visible). Tapping a chip toggles membership in the set — the updater must construct a new `Set` from the previous one (e.g. `setHiddenCategories(prev => { const next = new Set(prev); next.has(cat) ? next.delete(cat) : next.add(cat); return next; })`); mutating the existing `Set` in place won't trigger a re-render.
- **Order of operations**, all applied inside the existing `grouped` computation (category grouping itself is unchanged — items still display under their category headers):
  1. Filter `inventory` by `item.name.toLowerCase().includes(searchQuery.toLowerCase())` when `searchQuery` is non-empty.
  2. Group the filtered items by category, as today.
  3. Drop groups whose category is in `hiddenCategories` (`.filter((g) => !hiddenCategories.has(g.value))`).
  4. Sort each remaining group's `items` array in place by `sortBy` (the chosen comparator applies independently within each category group, never across the whole flattened list — the grouped layout itself never changes).
- All three pieces of state (`searchQuery`, `sortBy`, `hiddenCategories`) are local `useState` — not persisted to the character JSON. They reset to defaults on tab remount. This is intentional: these are viewing conveniences, not character data.
- No changes to `InventoryItem` type, no migration needed.

## Section 2 — Long-press-to-restore on Stone's Endurance and Healer's Kit

**Files:** `src/components/tabs/CombatTab.tsx`, new hook `src/hooks/useLongPress.ts`

- New hook `useLongPress(onLongPress: () => void, delay = 500)`: returns pointer event handlers (`onPointerDown`, `onPointerUp`, `onPointerLeave`, `onPointerCancel`) that start a `setTimeout` on down, call `onLongPress` and clear on fire, and cancel the timeout on early up/leave/cancel (so a normal tap, or a touch the browser reinterprets as a scroll, does not trigger it).
- The hook also tracks whether the timer fired (`firedRef.current`, a ref so it doesn't trigger re-renders) and exposes a `wasLongPress()` accessor. This matters because the "Usar" button will carry both the long-press handlers *and* its existing `onClick`: after a successful long-press, the browser still dispatches a native `click` on pointer-up. Without this guard, that trailing click would call `spendStoneEndurance`/`spendHealerKit` immediately after entering edit mode, silently burning a use at the exact moment the user meant to correct one. The `onClick` handler must check `wasLongPress()` first and, if true, no-op and reset the flag instead of spending.
- In `CombatTab.tsx`, both the Stone's Endurance card and the Healer's Kit card get:
  - Local state per card: `stoneEnduranceEditing: boolean`, `healerKitEditing: boolean` (default `false`).
  - The long-press hook wraps the card's "Usar" button. On long-press fire, set the corresponding `*Editing` state to `true` (and the button's `onClick` no-ops per the guard above).
  - When `*Editing` is `true`, replace the remaining/total display + "Usar" button with an inline stepper: `-` button (decrements remaining, floor 0), the current remaining count, `+` button (increments remaining, ceiling `total`), and a checkmark button that sets `*Editing` back to `false`. These stepper buttons are plain `onClick` handlers with no long-press wiring.
  - A normal tap (release before the 500ms threshold, `wasLongPress()` false) on the "Usar" button outside of editing mode behaves exactly as today — spends one use via the existing `spendStoneEndurance` / `spendHealerKit` functions.
  - No change to Rage — its existing per-slot tap-to-toggle UI already provides full manual control over `remaining`.
- No data model changes — both resources already have `{ total, remaining }` shape.

## Section 3 — Notes search bar

**File:** `src/components/tabs/NotesTab.tsx`

- Add a search input pinned above the sub-tab row. Local state `searchQuery: string`, default `""`.
- When `searchQuery` is empty: render exactly as today (the active sub-tab's list component).
- When `searchQuery` is non-empty: instead of rendering the active sub-tab's component, render a flat filtered results list computed in `NotesTab` directly from `character.notes`:
  - Search `world` and `npcs` entries: match if `title` or `content` (case-insensitive) includes the query.
  - Search `quests`: same match on `title`/`content`.
  - Search `journal`: same match on `title`/`content`.
  - Search `quick`: match on `text`.
  - Each result row shows a small type badge (Mundo / NPC / Misión / Diario / Rápida) and the title (or truncated text for quick notes), styled consistent with existing `stone-card` list rows.
  - Tapping a result: `NotesTab` holds state `pendingOpenId: string | undefined`. On tap, set `activeSubTab` to the entry's section, set `pendingOpenId` to the entry's id, and clear `searchQuery`. Pass `initialOpenId={pendingOpenId}` and `onInitialOpenHandled={() => setPendingOpenId(undefined)}` to the active sub-tab component. Existing components (`NoteList`, `QuestList`, `JournalList`) each manage their own `editingId`/`viewingId` state internally: add these two optional props, consumed in a `useEffect` keyed on `[initialOpenId]` that does nothing when `initialOpenId` is falsy (guards against the reset below re-triggering anything) and, when truthy, opens that entry's edit/view modal via the component's existing internal state and then calls `onInitialOpenHandled?.()`. `NotesTab` resets `pendingOpenId` back to `undefined` from that callback, immediately after the modal has opened — this guarantees a later tap on the same result (`pendingOpenId` transitioning `undefined → id` again) is a real state change React will pick up, so the effect reliably refires.
  - `QuickNotes` has no per-entry modal — confirmed by reading `src/components/notes/QuickNotes.tsx` (flat list with an inline "⋯" promote/delete menu, no separate edit modal). Tapping a quick-note search result just switches to the Quick sub-tab; no auto-open needed there.
- No data model changes.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/tabs/InventoryTab.tsx` | Add search input, sort control, category filter chips (local state only) |
| `src/hooks/useLongPress.ts` | New file — reusable long-press gesture hook |
| `src/components/tabs/CombatTab.tsx` | Wire long-press stepper onto Stone's Endurance and Healer's Kit cards |
| `src/components/tabs/NotesTab.tsx` | Add cross-note search bar, flat filtered results view |
| `src/components/notes/NoteList.tsx` | Add optional `initialOpenId` / `onInitialOpenHandled` props |
| `src/components/notes/QuestList.tsx` | Add optional `initialOpenId` / `onInitialOpenHandled` props |
| `src/components/notes/JournalList.tsx` | Add optional `initialOpenId` / `onInitialOpenHandled` props |

## Explicitly Out of Scope

- PWA install prompt (personal-use app, not needed)
- Dice roll integration into attack/skill/save rows (already implemented — `AttackRow.tsx` has Hit/Dmg buttons; `SheetTab.tsx` skill/save/ability rows each call `rollD20`/`rollDice` directly)
- Notes tab structural changes beyond search (existing fields/tags/status/session features are sufficient)
