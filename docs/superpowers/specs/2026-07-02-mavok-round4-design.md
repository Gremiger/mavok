# Mavok Round 4 Improvements — Design Spec
Date: 2026-07-02

## Overview

Eight improvements: one crash-bug fix, and seven feature/UX additions spanning Combat, Notes, Settings, and the Sheet header. Two of the eight (character portrait, level-up history log) require a data model change and share a single version bump (v3 → v4); the rest are pure UI/logic additions with no schema impact.

---

## Section 1 — Level-20 crash fix

**File:** `src/components/levelup/LevelUpFlow.tsx`

- `applyAll()` computes `BARBARIAN_LEVELS[newLevel - 1]` (`LevelUpFlow.tsx:55`) and `BARBARIAN_LEVELS[character.meta.level - 1]` (`LevelUpFlow.tsx:56`). `BARBARIAN_LEVELS` has exactly 20 entries (levels 1-20, indices 0-19). At `newLevel = 21`, `BARBARIAN_LEVELS[20]` is `undefined`, and the very next lines read `.proficiencyBonus`/`.rages`/etc. off it, throwing a `TypeError` and crashing the level-up flow. No guard exists anywhere in `LevelUpFlow.tsx` or `SettingsTab.tsx` today.
- Fix in `SettingsTab.tsx` (where the "Subir de nivel" button lives): when `character.meta.level >= 20`, disable the button and replace its label/subtitle with "Nivel máximo alcanzado" instead of opening `LevelUpFlow`.
- No data model changes.

## Section 2 — Custom attack management

**Files:** `src/hooks/useCharacter.ts`, `src/components/tabs/CombatTab.tsx`, new `src/components/combat/AttackFormModal.tsx`

- Add three new functions to `useCharacter.ts`, following the exact pattern of the existing `addInventoryItem`/`updateInventoryItem`/`removeInventoryItem`:
  - `addAttack(attack: Attack)` — appends to `character.attacks`.
  - `updateAttack(attackId: string, patch: Partial<Attack>)` — maps over `character.attacks`, patching the matching entry.
  - `removeAttack(attackId: string)` — filters `character.attacks`.
- New `AttackFormModal.tsx` component, used for both adding and editing (an optional `existingAttack?: Attack` prop switches between "create" and "edit" mode, matching the `editingId` pattern already used by `NoteList.tsx`/`QuestList.tsx`). Fields: a weapon quick-fill `<select>` populated from `WEAPONS` (`src/data/weapons.ts`) that prefills name/damage/damageType/properties/mastery — mirroring `InventoryTab.tsx`'s existing "Arma rápida" quick-select — plus manually-editable text/number inputs for every `Attack` field (`name`, `attackBonus`, `damage`, `damageType`, `range`, `properties` as a comma-separated text field, `mastery`, `masteryEffect`, `masterySaveDC`). Attack bonus is always manually typed — no auto-calculation from ability scores, per the design decision.
- `CombatTab.tsx`'s Acciones section gets a small "+" button (matching the visual weight of the existing "Acciones estándar" compact card) below the attack list, opening `AttackFormModal` in create mode.
- Each `AttackRow` gets a small "⋯" affordance (consistent with the kebab-menu pattern already used in `QuickNotes.tsx`) offering "Editar" (opens `AttackFormModal` pre-filled via `existingAttack`) and "Eliminar" (calls `removeAttack`, with the same undo-toast pattern established in round 3's Task 2/3 — `toast(..., { action: { label: "Deshacer", onClick: () => addAttack(attack) } })`).
- No data model changes — `Attack` already has every field this needs.

## Section 3 — Journal entry editing

**Files:** `src/hooks/useCharacter.ts`, `src/components/notes/JournalList.tsx`

- Add `updateJournalEntry(entryId: string, patch: Partial<JournalEntry>)` to `useCharacter.ts`, following the exact pattern of `updateQuickNote`/`updateNote`.
- `JournalList.tsx`'s existing "View Entry" modal (currently read-only text + a delete button, per `JournalList.tsx:147-170`) gains an `editing: boolean` local state. When editing, the session/title/content fields become the same editable inputs already used in the "New Entry" form, pre-filled from the viewed entry; a "Guardar" button calls `updateJournalEntry` and exits edit mode. An "Editar" button next to the existing "Eliminar" toggles this state on.
- No data model changes.

## Section 4 — Quest tags + NPC linking

**File:** `src/components/notes/QuestList.tsx`

- `QuestEntry` already has a `tags: string[]` field (inherited from `NoteEntry`) that the UI never exposes. Add a tags input to the quest form, matching `NoteList.tsx`'s existing tags UI exactly (comma-separated text input, parsed on save) — and render the tags on each quest card the same way `NoteList.tsx` already does.
- Change the `givenBy` `<input>` to `<input list="npc-names" ...>` with a sibling `<datalist id="npc-names">` populated from `character.notes.npcs.map(n => n.title)`. This suggests existing NPC names as autocomplete while typing but does not restrict input — `givenBy` remains a plain string on `QuestEntry`, no schema change, no hard link/foreign-key relationship.
- No data model changes.

## Section 5 — NPC structured-field search

**File:** `src/components/tabs/NotesTab.tsx`

- `computeSearchResults` (added in round 2) currently matches `world`/`npcs` entries only against `title`/`content`. Extend that branch's condition to also check `Object.values(n.fields ?? {}).some(v => v.toLowerCase().includes(q))` — so searching "Ciudad Alta" (a value someone typed into the suggested "Ubicación" field) surfaces the matching NPC even if that text never appears in the free-text `title`/`content`.
- No data model changes — `fields?: Record<string, string>` already exists on `NoteEntry`.

## Section 6 — Offline indicator

**Files:** new `src/components/OfflineBadge.tsx`, modify `src/app/page.tsx`

- New client component `OfflineBadge.tsx`: on mount, reads `navigator.onLine` into local state, and subscribes to `window`'s `online`/`offline` events to keep it in sync (cleanup in the effect's return). Renders `null` when online; when offline, renders a small fixed-position badge reading "Sin conexión" near the nav island (e.g. `fixed bottom-24 left-1/2 -translate-x-1/2` or similar, styled consistent with existing small badges — muted background, small text, rounded-full).
- Mounted once in `src/app/page.tsx`, alongside the existing nav, so it's visible from every tab.
- No data model changes.

## Section 7 — Character portrait upload

**Files:** `src/lib/types.ts`, `src/lib/migrations.ts`, `src/data/mavok-default.ts`, `src/components/tabs/SettingsTab.tsx`, `src/components/tabs/SheetTab.tsx`

- Add `portraitDataUrl: string | null` to `CharacterMeta` in `types.ts`. Increment `CURRENT_DATA_VERSION` to `4`.
- v4 migration in `migrations.ts`: sets `meta.portraitDataUrl = null` if not already present. Purely additive, matching every prior migration's pattern.
- `mavok-default.ts`: add `portraitDataUrl: null` to the default character's `meta`.
- `SettingsTab.tsx` gets a file `<input type="file" accept="image/*">` (hidden, triggered by a styled button, matching the existing import-JSON file-input pattern at `SettingsTab.tsx`'s `fileInputRef`). On selection: load the file into an `<img>`, draw it onto an offscreen `<canvas>` capped at 400×400px (preserving aspect ratio, letterboxed or center-cropped — center-cropped to a square is simpler and matches typical portrait/avatar conventions), export as a JPEG data URL via `canvas.toDataURL("image/jpeg", 0.85)`, and call `updateMeta({ portraitDataUrl: dataUrl })`. Pure browser Canvas API — no new dependency.
- `SheetTab.tsx`'s header (`SheetTab.tsx:63-77`, currently just name/class/level/species text) gets a small circular `<img>` (or a placeholder silhouette icon when `portraitDataUrl` is `null`) next to the name.

## Section 8 — Level-up history log

**Files:** `src/lib/types.ts`, `src/lib/migrations.ts`, `src/data/mavok-default.ts`, `src/components/levelup/LevelUpFlow.tsx`, `src/components/tabs/SettingsTab.tsx`

- Add to `types.ts` (same v4 migration/version bump as Section 7 — one version bump covers both new fields, consistent with how every prior round has bundled data model changes into a single bump):
  ```typescript
  export interface LevelUpHistoryEntry {
    level: number;
    date: string;
    asiChoice?: string;
    featChosen?: string;
  }
  ```
  and add `levelUpHistory: LevelUpHistoryEntry[]` to `Character`.
- v4 migration: sets `levelUpHistory = []` if not already present.
- `mavok-default.ts`: add `levelUpHistory: []`.
- `LevelUpFlow.tsx`'s `applyAll()` appends one `LevelUpHistoryEntry` per completed level-up (`date: new Date().toISOString()`). The existing `PendingChanges` state (`LevelUpFlow.tsx:22-33`) already captures everything needed: `changes.abilityIncreases: Partial<Record<AbilityScore, number>>` becomes `asiChoice` as a formatted summary string (e.g. `"FUE +2"` or `"FUE +1, CON +1"`, built the same way the existing Summary step already renders these increases) when non-empty; `changes.feat?.name` becomes `featChosen` when a feat was chosen instead. Both are `undefined` on levels with no ASI step (`ASI_LEVELS = [4, 8, 12, 16, 19]`, `LevelUpFlow.tsx:19`).
- `SettingsTab.tsx` gets a new collapsible section near the existing Level Up controls, listing `character.levelUpHistory` chronologically (most recent first), each entry showing level reached, date, and ASI/feat choice if any.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/levelup/LevelUpFlow.tsx` | (no code change — crash prevented at the call site) |
| `src/components/tabs/SettingsTab.tsx` | Level-20 button guard; Level-up history section; portrait upload UI |
| `src/hooks/useCharacter.ts` | `addAttack`/`updateAttack`/`removeAttack`, `updateJournalEntry` |
| `src/components/tabs/CombatTab.tsx` | "+" button for new attacks; per-attack edit/delete affordance wiring |
| `src/components/combat/AttackFormModal.tsx` | New file — add/edit attack form |
| `src/components/notes/JournalList.tsx` | Edit mode for journal entries |
| `src/components/notes/QuestList.tsx` | Tags UI; `givenBy` datalist autocomplete |
| `src/components/tabs/NotesTab.tsx` | Structured-field search for World/NPCs |
| `src/components/OfflineBadge.tsx` | New file — offline indicator |
| `src/app/page.tsx` | Mount `OfflineBadge` |
| `src/components/tabs/SheetTab.tsx` | Portrait display in header |
| `src/lib/types.ts` | `CharacterMeta.portraitDataUrl`, `Character.levelUpHistory`, `LevelUpHistoryEntry`, `CURRENT_DATA_VERSION` → 4 |
| `src/lib/migrations.ts` | v4 migration |
| `src/data/mavok-default.ts` | `portraitDataUrl: null`, `levelUpHistory: []` |

## Explicitly Out of Scope

- Auto-calculated attack bonus (manual entry chosen for simplicity and consistency with how every other manually-entered field in this app already works)
- Hard NPC linking / foreign-key relationship for quest `givenBy` (datalist autocomplete chosen — no schema change)
- Theme accessibility pass (contrast, font-scaling, reduced-motion) — deferred to its own round if wanted
- Reset/factory-reset option — considered, not selected for this round
