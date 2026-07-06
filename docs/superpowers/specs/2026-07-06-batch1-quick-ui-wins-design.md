# Batch 1: Quick UI Wins — Design

Part of a larger brainstorm of app improvements, decomposed into 5 independently shippable batches. This spec covers Batch 1: a floating quick-actions button, undo toasts for the remaining unprotected deletes, a faster HP entry path, and a conditions UX upgrade.

## Data model changes

One migration bump (v5 → v6, `CURRENT_DATA_VERSION` in `src/lib/types.ts`):

```ts
interface CombatState {
  // ...existing fields
  recklessActive: boolean; // new — was local-only state in CombatTab, needs to be
                            // shared with the FAB and survive reload
}

interface Character {
  // ...existing fields
  quickActions: PinnedAction[]; // new — user's pinned FAB actions, max 5 enforced in UI
}

type PinnedAction =
  | { type: "rage" }
  | { type: "hitDice" }
  | { type: "hpAdjust" }
  | { type: "resource"; resource: "healerKit" | "stoneEndurance" }
  | { type: "attackRoll"; attackId: string }
  | { type: "attackDamage"; attackId: string }
  | { type: "attackDefinition"; attackId: string };
```

Migration backfill: `recklessActive: false`, `quickActions: [{ type: "rage" }, { type: "hpAdjust" }]`.

`recklessActive` currently lives as `useState` in `CombatTab.tsx:55` and is read by `AttackRow` via props to decide advantage on STR-based attacks. It moves into `combat` state and is toggled the same way, just persisted.

## Feature: Quick Actions FAB

**New component**: `src/components/ui/QuickActionsFab.tsx` — lives with other cross-cutting UI since it's rendered from `page.tsx` and spans two tabs, not owned by either.

**Visibility**: rendered from `page.tsx`, shown only when `activeTab` is `"ficha"` or `"combate"`. Collapses its expanded state on tab change (including swipe navigation).

**Placement**: uses the existing `.bottom-safe-fab` CSS class (`globals.css:282`), already defined at an offset that clears the bottom tab nav and is otherwise unused — clearly reserved for this purpose.

**Tap** expands a vertical speed-dial of up to `quickActions.length` (≤5) mini buttons, icon + short label. Tapping one executes immediately:

| Action type | Behavior |
|---|---|
| `rage` | Toggles `resources.rpiRages.active`, same as `RageTracker` |
| `hitDice` | Decrements `combat.hitDice.remaining` by 1, guarded at 0 (same shape as the spend logic in `SettingsTab.tsx:52`) |
| `hpAdjust` | Opens the existing `HpModal` (see HP section below) — no new popover component |
| `resource` | Decrements the given resource's `remaining` by 1, guarded at 0 (reuses `spendHealerKit`/`spendStoneEndurance` pattern, `CombatTab.tsx:88-107`) |
| `attackRoll` | Rolls `rollD20`/`rollD20WithAdvantage` using the same STR/rage-bonus/reckless logic as `AttackRow.handleRollHit`, shown via toast |
| `attackDamage` | Same as above but `rollDice` / `handleRollDamage` logic, shown via toast |
| `attackDefinition` | Shows the attack's `mastery` + `masteryEffect` text in a dismiss-on-tap-away popover anchored to the FAB (read-only content, shouldn't auto-dismiss like a toast) |

**Long-press** opens a picker bottom-sheet (reuses the existing `useLongPress` hook, `src/hooks/useLongPress.ts` — already used for Healer's Kit/Stone's Endurance long-press-to-edit). The picker is a checklist capped at 5 selections. Attack-scoped entries (`attackRoll`/`attackDamage`/`attackDefinition`) require picking a specific attack from Mavok's current attack list; only attacks with a non-null `mastery` are offered for `attackDefinition`.

**Settings** gets a new "Quick Actions" section (consistent with existing Settings list patterns) that opens the identical picker component.

## Feature: Undo toasts

Undo toasts already exist for Inventory item delete (`InventoryTab.tsx:350`), Attack delete (`CombatTab.tsx:244`), and Condition remove (`CombatTab.tsx:214`) — all follow the same `toast(msg, { action: { label: "Deshacer", onClick: () => addX(item) } })` shape.

**Missing, to add**: `NoteList.tsx` (world/NPC notes), `QuestList.tsx`, `JournalList.tsx`, `QuickNotes.tsx` — same pattern on delete.

**One wrinkle found during design**: `addNote(section, note)`, `addQuest(quest)`, and `addJournalEntry(entry)` (`src/hooks/useCharacter.ts`) all accept a full pre-built object including `id`, so undo-via-re-add restores the exact original object. `addQuickNote(text)` does not — it only takes `text` and generates a fresh `id`/`createdAt` internally. To keep QuickNotes' undo consistent with the other three (exact restore, not a new note with a new timestamp), add a `restoreQuickNote(note: QuickNote)` function to `useCharacter.ts` mirroring the others, and use it for the undo path specifically (`addQuickNote(text)` stays as-is for normal creation).

**Audit note**: all four (three existing + Notes-family) restore via append-to-end, not original array position. Acceptable for these list types; not treated as a bug.

## Feature: HP quick-math input

`HpModal.tsx` already has damage/heal/temp mode buttons + a numeric amount field + quick-add chips (+1/+5/+10) — this is not a new component. The change: let the amount field accept a signed value (`-8`, `+5`) and auto-select `mode` from the sign (`-` → damage, `+` → heal), stripping the sign before the existing math runs. Temp HP stays an explicit mode tap (no sign to infer from). If the user still taps a mode button explicitly, that takes precedence over sign-inference for that entry.

The FAB's `hpAdjust` action simply opens this same `HpModal` — no separate popover needed.

## Feature: Conditions — inline expand + smarter add-picker

**Inline expand**: tapping an applied condition `Tag` (`CombatTab.tsx:207-222`) expands its description inline (replacing the current `viewingCondition` Modal at `CombatTab.tsx:553-562`). Tap again, or tap elsewhere, collapses it.

**Add-picker upgrade** (`conditionModalOpen` Modal, `CombatTab.tsx:564+`): add a search/filter text input, and group the 15 conditions by category:

- **Incapacidad** — Incapacitated, Paralyzed, Petrified, Stunned, Unconscious
- **Movimiento** — Grappled, Restrained, Prone
- **Sentidos y mente** — Blinded, Charmed, Deafened, Frightened, Invisible
- **Otros** — Poisoned, Exhaustion

Already-applied conditions stay disabled in the list, as today.

## Out of scope for this batch

- Multiclassing, Epic Boons, spell support (deferred/declined per brainstorm)
- Weapon Mastery swapping, Exhaustion mechanical effects (Batch 4)
- Notes search, Level-up history view, automated tests, PWA audit (other batches)
