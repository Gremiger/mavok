# Mavok Round 2 Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add inventory search/sort/filter, a long-press correction gesture for Stone's Endurance and Healer's Kit, and cross-note search — the three gaps identified and designed in `docs/superpowers/specs/2026-07-01-mavok-round2-design.md`.

**Architecture:** Three independent slices, each touching a different tab. A new standalone `useLongPress` hook is built first since `CombatTab` depends on it. The notes-search slice is split into "give the list components a way to be opened programmatically" (Task 4) and "wire the search bar that uses it" (Task 5), since the former is a reusable interface change the latter depends on.

**Tech Stack:** Next.js 15 (App Router, static export), React 19, TypeScript, Tailwind CSS. No backend — all state in LocalStorage via `useCharacterContext()`.

## Global Constraints

- Spanish UI labels, English D&D terms (existing convention — do not translate "Rage", "Stone's Endurance", "Healer's Kit", etc.)
- No test suite exists in this repo. Per `CLAUDE.md`, the verification step for every change is `npx tsc --noEmit && npm run build`, both must pass — this plan uses that in place of a unit-test cycle.
- Never include a "Co-authored-by" trailer in commit messages (per `CLAUDE.md`).
- Match existing Tailwind utility conventions already used in the touched files (`stone-card`, `text-accent`, `text-muted`, `border-border`, the filter-chip pattern already used in `QuestList.tsx`) — do not introduce a new visual language.
- `searchQuery`, `sortBy`, `hiddenCategories` (Task 2) and `searchQuery`/`pendingOpenId` (Task 5) are local `useState`, never persisted to the character JSON and never added to `src/lib/types.ts`. No data-model version bump is needed anywhere in this plan.

---

### Task 1: `useLongPress` hook

**Files:**
- Create: `src/hooks/useLongPress.ts`

**Interfaces:**
- Produces: `useLongPress(onLongPress: () => void, delay?: number): { handlers: { onPointerDown, onPointerUp, onPointerLeave, onPointerCancel, onContextMenu }, wasLongPress: () => boolean }` — consumed by Task 3.

- [ ] **Step 1: Write the hook**

```typescript
import { useRef } from "react";

export function useLongPress(onLongPress: () => void, delay = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const firedRef = useRef(false);

  function start() {
    firedRef.current = false;
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      onLongPress();
    }, delay);
  }

  function clear() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  return {
    handlers: {
      onPointerDown: start,
      onPointerUp: clear,
      onPointerLeave: clear,
      onPointerCancel: clear,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    },
    wasLongPress: () => firedRef.current,
  };
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: both PASS. The hook is not consumed yet (that's Task 3) — this step only confirms the new file type-checks and doesn't break the build.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useLongPress.ts
git commit -m "feat: add useLongPress hook for resource-tracker correction gesture"
```

---

### Task 2: Inventory search, sort, category filter

**Files:**
- Modify: `src/components/tabs/InventoryTab.tsx`

**Interfaces:**
- Consumes: nothing from other tasks — fully self-contained.
- Produces: nothing consumed by later tasks.

**Context:** `InventoryTab.tsx` currently declares state at the top of the component (`addModalOpen`, `editingCurrency`, `expandedItem`, `newItem`), then after the `if (!character) return null;` guard computes `const { inventory, currency, attributes } = character;` and builds:

```typescript
const grouped = CATEGORIES.map((cat) => ({
  ...cat,
  items: inventory.filter((i) => i.category === cat.value),
})).filter((g) => g.items.length > 0);
```

This task adds three pieces of local view-state (search text, sort mode, hidden categories) and reworks `grouped` to apply them, without changing `InventoryItem` or persisted data.

- [ ] **Step 1: Add the new state**

In `src/components/tabs/InventoryTab.tsx`, right after the existing `const [newItem, setNewItem] = useState({...})` block (before the `if (!character) return null;` line), add:

```typescript
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "weight" | "equipped">("name");
  const [hiddenCategories, setHiddenCategories] = useState<
    Set<InventoryItem["category"]>
  >(new Set());
```

- [ ] **Step 2: Replace the `grouped` computation**

Replace:

```typescript
  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: inventory.filter((i) => i.category === cat.value),
  })).filter((g) => g.items.length > 0);
```

with:

```typescript
  const filteredInventory = searchQuery
    ? inventory.filter((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : inventory;

  function sortItems(items: InventoryItem[]): InventoryItem[] {
    const sorted = [...items];
    if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "weight") {
      sorted.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
    } else {
      sorted.sort((a, b) => {
        if (a.equipped !== b.equipped) return a.equipped ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    }
    return sorted;
  }

  function toggleCategory(cat: InventoryItem["category"]) {
    setHiddenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const grouped = CATEGORIES.filter((cat) => !hiddenCategories.has(cat.value))
    .map((cat) => ({
      ...cat,
      items: sortItems(
        filteredInventory.filter((i) => i.category === cat.value)
      ),
    }))
    .filter((g) => g.items.length > 0);
```

Note: `totalWeight` and `carryCapacity` (declared just above this block) must keep using the unfiltered `inventory`, not `filteredInventory` — encumbrance always reflects everything carried, regardless of the search box or hidden-category chips. Do not change those two lines.

- [ ] **Step 3: Add the search/sort/filter UI**

In the JSX, right after the Currency Bar's closing `</div>` and before the `{/* Inventory List */}` comment, insert:

```tsx
      {/* Search, Sort, Filter */}
      <div className="space-y-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar objeto..."
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
        />
        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "name" | "weight" | "equipped")
            }
            className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground"
          >
            <option value="name">Nombre</option>
            <option value="weight">Peso</option>
            <option value="equipped">Equipado</option>
          </select>
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                className={`px-2 py-1 rounded-full text-xs transition-colors ${
                  hiddenCategories.has(cat.value)
                    ? "bg-card border border-border text-muted opacity-50"
                    : "bg-accent text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
```

- [ ] **Step 4: Add the empty state**

Right after the `{grouped.map((group, gi) => ( ... ))}` block closes and before the `{/* Encumbrance Footer */}` comment, insert:

```tsx
      {grouped.length === 0 && (
        <p className="text-muted text-sm text-center py-8">
          Sin objetos que coincidan. Ajusta la búsqueda o los filtros.
        </p>
      )}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: both PASS.

- [ ] **Step 6: Manual check**

Run `npm run dev`, open the Inventario tab:
- Typing in the search box narrows the list to matching item names, case-insensitively.
- Switching the sort dropdown reorders items within each category (Nombre → alphabetical, Peso → heaviest first, Equipado → equipped items first).
- Tapping a category chip toggles that category's visibility; toggling all of them off (or searching for a nonsense string) shows "Sin objetos que coincidan..."
- Encumbrance line at the bottom still reflects total inventory weight regardless of search/filters.

- [ ] **Step 7: Commit**

```bash
git add src/components/tabs/InventoryTab.tsx
git commit -m "feat: add search, sort, and category filter to Inventory tab"
```

---

### Task 3: Long-press-to-restore on Stone's Endurance and Healer's Kit

**Files:**
- Modify: `src/components/tabs/CombatTab.tsx`

**Interfaces:**
- Consumes: `useLongPress` from Task 1 (`src/hooks/useLongPress.ts`), exact signature `useLongPress(onLongPress: () => void, delay?: number): { handlers, wasLongPress }`.
- Produces: nothing consumed by later tasks.

**Context:** `CombatTab.tsx` currently renders the Healer's Kit card (in the Acciones section) and the Stone's Endurance card (in the Reacciones section) each as a static remaining/total display plus a single "Usar" button wired to `spendHealerKit`/`spendStoneEndurance`. Both spend functions already guard `if (remaining <= 0) return;`.

A key detail the design spec didn't spell out at the DOM level: the "Usar" button currently uses the HTML `disabled` attribute when `remaining <= 0`. A `disabled` button does not reliably fire pointer events in browsers — so if this task disabled the button while wiring long-press to it, a user whose resource hit 0 would have **no way to long-press it back open** to correct the count, which is exactly the scenario this feature exists for. This task keeps the button always pointer-interactive; the visual "disabled" look is done with `opacity`/`cursor` classes instead of the `disabled` attribute, and the tap-to-spend behavior still safely no-ops via the existing guard inside `spendHealerKit`/`spendStoneEndurance`.

- [ ] **Step 1: Import the hook and add state**

In `src/components/tabs/CombatTab.tsx`, add the import alongside the existing ones:

```typescript
import { useLongPress } from "@/hooks/useLongPress";
```

Add two new pieces of state alongside the existing `useState` declarations at the top of `CombatTab()`:

```typescript
  const [stoneEnduranceEditing, setStoneEnduranceEditing] = useState(false);
  const [healerKitEditing, setHealerKitEditing] = useState(false);
```

- [ ] **Step 2: Create the two hook instances**

Right after the `const offhandAttack = ...` line (still before the `slots` computation), add:

```typescript
  const stoneEnduranceLongPress = useLongPress(() =>
    setStoneEnduranceEditing(true)
  );
  const healerKitLongPress = useLongPress(() => setHealerKitEditing(true));
```

These must be two separate calls — each `useLongPress` call owns its own internal timer/ref, so reusing one instance's handlers on both cards would let a long-press on one card flip the other card's editing state.

- [ ] **Step 3: Replace the Healer's Kit card**

Replace the entire Healer's Kit `<div>` block (the one with `Healer&apos;s Kit` heading, inside the Acciones `CollapsibleSection`) with:

```tsx
        <div
          className={`p-3 rounded-lg border mt-2 ${
            healerKit.remaining > 0
              ? "border-border bg-card"
              : "border-border bg-card opacity-50"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-heading text-accent">Healer&apos;s Kit</span>
            {healerKitEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateResources({
                      healerKit: {
                        ...healerKit,
                        remaining: Math.max(0, healerKit.remaining - 1),
                      },
                    })
                  }
                  disabled={healerKit.remaining <= 0}
                  className="w-6 h-6 rounded bg-background border border-border text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="text-xs text-muted font-heading w-6 text-center">
                  {healerKit.remaining}
                </span>
                <button
                  onClick={() =>
                    updateResources({
                      healerKit: {
                        ...healerKit,
                        remaining: Math.min(
                          healerKit.total,
                          healerKit.remaining + 1
                        ),
                      },
                    })
                  }
                  disabled={healerKit.remaining >= healerKit.total}
                  className="w-6 h-6 rounded bg-background border border-border text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
                <button
                  onClick={() => setHealerKitEditing(false)}
                  className="text-xs px-2 py-0.5 border border-accent text-accent rounded"
                >
                  ✓
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted font-heading">
                  {healerKit.remaining}/{healerKit.total}
                </span>
                <button
                  {...healerKitLongPress.handlers}
                  onClick={() => {
                    if (healerKitLongPress.wasLongPress()) return;
                    spendHealerKit();
                  }}
                  className={`text-xs px-2 py-0.5 border rounded transition-colors select-none [-webkit-touch-callout:none] ${
                    healerKit.remaining <= 0
                      ? "border-border text-muted opacity-40 cursor-not-allowed"
                      : "border-border hover:border-accent hover:text-accent"
                  }`}
                >
                  Usar
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-muted">
            Acción · estabiliza o cura 1d6+4 HP a una criatura · usos no se recuperan con descansos
          </p>
        </div>
```

- [ ] **Step 4: Replace the Stone's Endurance card**

Replace the entire Stone's Endurance `<div>` block (inside the Reacciones `CollapsibleSection`) with:

```tsx
          <div
            className={`p-3 rounded-lg border ${
              stoneEndurance.remaining > 0
                ? "border-border bg-card"
                : "border-border bg-card opacity-50"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-heading text-accent">Stone&apos;s Endurance</span>
              {stoneEnduranceEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateResources({
                        stoneEndurance: {
                          ...stoneEndurance,
                          remaining: Math.max(0, stoneEndurance.remaining - 1),
                        },
                      })
                    }
                    disabled={stoneEndurance.remaining <= 0}
                    className="w-6 h-6 rounded bg-background border border-border text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-xs text-muted font-heading w-6 text-center">
                    {stoneEndurance.remaining}
                  </span>
                  <button
                    onClick={() =>
                      updateResources({
                        stoneEndurance: {
                          ...stoneEndurance,
                          remaining: Math.min(
                            stoneEndurance.total,
                            stoneEndurance.remaining + 1
                          ),
                        },
                      })
                    }
                    disabled={stoneEndurance.remaining >= stoneEndurance.total}
                    className="w-6 h-6 rounded bg-background border border-border text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setStoneEnduranceEditing(false)}
                    className="text-xs px-2 py-0.5 border border-accent text-accent rounded"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted font-heading">
                    {stoneEndurance.remaining}/{stoneEndurance.total}
                  </span>
                  <button
                    {...stoneEnduranceLongPress.handlers}
                    onClick={() => {
                      if (stoneEnduranceLongPress.wasLongPress()) return;
                      spendStoneEndurance();
                    }}
                    className={`text-xs px-2 py-0.5 border rounded transition-colors select-none [-webkit-touch-callout:none] ${
                      stoneEndurance.remaining <= 0
                        ? "border-border text-muted opacity-40 cursor-not-allowed"
                        : "border-border hover:border-accent hover:text-accent"
                    }`}
                  >
                    Usar
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted">
              Reacción · tira 1d12 + CON mod · reduce el daño entrante por ese total
            </p>
          </div>
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: both PASS.

- [ ] **Step 6: Manual check**

Run `npm run dev`, open the Combate tab:
- Tapping "Usar" on Healer's Kit or Stone's Endurance spends one use as before.
- Holding "Usar" for ~500ms opens the inline `-`/count/`+`/✓ stepper instead of spending a use.
- The stepper's `-`/`+` buttons move `remaining` within `[0, total]` and are disabled at the bounds.
- Tapping ✓ closes the stepper and returns to the normal remaining/total + Usar display.
- With `remaining` at 0, the "Usar" button still visually dims but a long-press on it still opens the stepper (so you can restore uses after hitting 0) — a normal tap does nothing.
- No native text-selection/context-menu popup appears on long-press on a mobile browser or device emulation.

- [ ] **Step 7: Commit**

```bash
git add src/components/tabs/CombatTab.tsx
git commit -m "feat: long-press Usar to correct Stone's Endurance / Healer's Kit uses"
```

---

### Task 4: `initialOpenId` support in NoteList, QuestList, JournalList

**Files:**
- Modify: `src/components/notes/NoteList.tsx`
- Modify: `src/components/notes/QuestList.tsx`
- Modify: `src/components/notes/JournalList.tsx`

**Interfaces:**
- Produces: each component gains an optional prop `initialOpenId?: string`, consumed by Task 5's `NotesTab`. Component signatures become:
  - `NoteList({ section, title, initialOpenId }: { section: "world" | "npcs"; title: string; initialOpenId?: string })`
  - `QuestList({ initialOpenId }: { initialOpenId?: string } = {})`
  - `JournalList({ initialOpenId }: { initialOpenId?: string } = {})`

**Context:** All three components declare their `useState` hooks, then have a line `if (!character) return null;`, and only after that compute local variables (`notes`, `quests`, `journal`) and define their `openEdit`/`openNew` functions as `function` declarations (hoisted within the component body). React's Rules of Hooks forbid any hook — including `useEffect` — from being called after a conditional early return, so the new `useEffect` in each component must be placed **before** the `if (!character) return null;` line, guarding on `character` itself inside the effect body. Because `openEdit` is a hoisted function declaration, it can still be referenced from an effect positioned earlier in the same function body.

- [ ] **Step 1: `NoteList.tsx`**

Add `useEffect` to the import: change `import { useState } from "react";` to `import { useState, useEffect } from "react";`.

Change the component signature from:

```typescript
export function NoteList({
  section,
  title,
}: {
  section: "world" | "npcs";
  title: string;
}) {
```

to:

```typescript
export function NoteList({
  section,
  title,
  initialOpenId,
}: {
  section: "world" | "npcs";
  title: string;
  initialOpenId?: string;
}) {
```

Right after the existing `const [newFieldKey, setNewFieldKey] = useState("");` line and before `if (!character) return null;`, add:

```typescript
  useEffect(() => {
    if (!character || !initialOpenId) return;
    const note = character.notes[section].find((n) => n.id === initialOpenId);
    if (note) openEdit(note);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOpenId]);
```

- [ ] **Step 2: `QuestList.tsx`**

Add `useEffect` to the import: change `import { useState } from "react";` to `import { useState, useEffect } from "react";`.

Change the component signature from `export function QuestList() {` to:

```typescript
export function QuestList({
  initialOpenId,
}: {
  initialOpenId?: string;
} = {}) {
```

Right after the existing `const [form, setForm] = useState({...})` block and before `if (!character) return null;`, add:

```typescript
  useEffect(() => {
    if (!character || !initialOpenId) return;
    const quest = character.notes.quests.find((q) => q.id === initialOpenId);
    if (quest) openEdit(quest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOpenId]);
```

Note this reads from `character.notes.quests` directly, not the component's locally filtered `quests` variable (defined later as `character.notes.quests.filter((q) => filter === "all" || q.status === filter)`) — if the target quest's status doesn't match the currently active status-filter chip, it would be missing from that filtered list even though it still exists.

- [ ] **Step 3: `JournalList.tsx`**

Add `useEffect` to the import: change `import { useState } from "react";` to `import { useState, useEffect } from "react";`.

Change the component signature from `export function JournalList() {` to:

```typescript
export function JournalList({
  initialOpenId,
}: {
  initialOpenId?: string;
} = {}) {
```

Right after the existing `const [form, setForm] = useState({...})` block and before `if (!character) return null;`, add:

```typescript
  useEffect(() => {
    if (initialOpenId) setViewingId(initialOpenId);
  }, [initialOpenId]);
```

`JournalList` has no `formOpen`/`openEdit` — its modal's `open` prop is derived as `!!viewingEntry` where `viewingEntry = journal.find(j => j.id === viewingId)`, computed after this line. Setting `viewingId` directly is enough; if `initialOpenId` doesn't match any entry, `viewingEntry` stays `undefined` and the modal simply doesn't open — a safe no-op.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: both PASS. (`initialOpenId` isn't passed by any caller yet — `NotesTab` still calls these three components with their old prop lists — so behavior is unchanged until Task 5.)

- [ ] **Step 5: Commit**

```bash
git add src/components/notes/NoteList.tsx src/components/notes/QuestList.tsx src/components/notes/JournalList.tsx
git commit -m "feat: add optional initialOpenId prop to note/quest/journal lists"
```

---

### Task 5: Cross-note search bar in NotesTab

**Files:**
- Modify: `src/components/tabs/NotesTab.tsx`

**Interfaces:**
- Consumes: `initialOpenId?: string` prop on `NoteList`, `QuestList`, `JournalList` from Task 4.
- Produces: nothing consumed by later tasks.

**Context:** `NotesTab.tsx` currently holds `activeSubTab` state and renders the sub-tab nav row plus whichever of `QuickNotes`/`NoteList`/`QuestList`/`JournalList` matches `activeSubTab`, each in its own `{activeSubTab === "x" && <Component />}` conditional — meaning switching sections always unmounts one component and mounts another (React doesn't preserve identity across differently-conditioned JSX branches). This task adds a search box that, whenever non-empty, replaces the entire sub-tab-nav-and-content area with a flat list of matches across all five note types; because that flat view fully unmounts whichever sub-tab component was showing, and every result-tap clears the search query in the same handler that sets `activeSubTab`, the target sub-tab component is *always* a fresh mount by the time it receives `initialOpenId` — Task 4's `useEffect` on mount is sufficient, no extra synchronization is needed.

- [ ] **Step 1: Add imports and module-level search helpers**

At the top of `src/components/tabs/NotesTab.tsx`, change:

```typescript
"use client";

import { useState } from "react";
import { useCharacterContext } from "@/lib/context";
import { QuickNotes } from "@/components/notes/QuickNotes";
import { NoteList } from "@/components/notes/NoteList";
import { QuestList } from "@/components/notes/QuestList";
import { JournalList } from "@/components/notes/JournalList";
```

to:

```typescript
"use client";

import { useState } from "react";
import { useCharacterContext } from "@/lib/context";
import { QuickNotes } from "@/components/notes/QuickNotes";
import { NoteList } from "@/components/notes/NoteList";
import { QuestList } from "@/components/notes/QuestList";
import { JournalList } from "@/components/notes/JournalList";
import type { Notes } from "@/lib/types";
```

Right after the existing `type SubTab = (typeof SUB_TABS)[number]["id"];` line, add:

```typescript
interface SearchResult {
  id: string;
  section: SubTab;
  typeLabel: string;
  title: string;
}

const TYPE_LABELS: Record<SubTab, string> = {
  quick: "Rápida",
  world: "Mundo",
  npcs: "NPC",
  quests: "Misión",
  journal: "Diario",
};

function computeSearchResults(notes: Notes, query: string): SearchResult[] {
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const n of notes.world) {
    if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
      results.push({ id: n.id, section: "world", typeLabel: TYPE_LABELS.world, title: n.title });
    }
  }
  for (const n of notes.npcs) {
    if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
      results.push({ id: n.id, section: "npcs", typeLabel: TYPE_LABELS.npcs, title: n.title });
    }
  }
  for (const quest of notes.quests) {
    if (quest.title.toLowerCase().includes(q) || quest.content.toLowerCase().includes(q)) {
      results.push({ id: quest.id, section: "quests", typeLabel: TYPE_LABELS.quests, title: quest.title });
    }
  }
  for (const entry of notes.journal) {
    if (entry.title.toLowerCase().includes(q) || entry.content.toLowerCase().includes(q)) {
      results.push({ id: entry.id, section: "journal", typeLabel: TYPE_LABELS.journal, title: entry.title });
    }
  }
  for (const quick of notes.quick) {
    if (quick.text.toLowerCase().includes(q)) {
      results.push({
        id: quick.id,
        section: "quick",
        typeLabel: TYPE_LABELS.quick,
        title: quick.text.length > 60 ? `${quick.text.slice(0, 60)}…` : quick.text,
      });
    }
  }

  return results;
}
```

- [ ] **Step 2: Replace the component body**

Replace the entire `export function NotesTab() { ... }` body with:

```tsx
export function NotesTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("quick");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingOpenId, setPendingOpenId] = useState<string | undefined>(
    undefined
  );
  const charCtx = useCharacterContext();

  if (!charCtx.character) return null;

  const results = searchQuery
    ? computeSearchResults(charCtx.character.notes, searchQuery)
    : [];

  function handleResultTap(result: SearchResult) {
    setActiveSubTab(result.section);
    setPendingOpenId(result.id);
    setSearchQuery("");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-2 border-b border-border bg-card shrink-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en notas..."
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
        />
      </div>

      {/* Sub-tab navigation (hidden while searching) */}
      {!searchQuery && (
        <div className="flex overflow-x-auto border-b border-border bg-card px-2 gap-1 shrink-0">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3 py-2.5 text-xs whitespace-nowrap transition-colors border-b-2 ${
                activeSubTab === tab.id
                  ? "text-accent border-accent"
                  : "text-muted border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
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
            <p className="text-muted text-sm text-center py-8">
              Sin resultados para &quot;{searchQuery}&quot;.
            </p>
          )
        ) : (
          <>
            {activeSubTab === "quick" && <QuickNotes />}
            {activeSubTab === "world" && (
              <NoteList section="world" title="Mundo" initialOpenId={pendingOpenId} />
            )}
            {activeSubTab === "npcs" && (
              <NoteList section="npcs" title="NPCs" initialOpenId={pendingOpenId} />
            )}
            {activeSubTab === "quests" && (
              <QuestList initialOpenId={pendingOpenId} />
            )}
            {activeSubTab === "journal" && (
              <JournalList initialOpenId={pendingOpenId} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: both PASS.

- [ ] **Step 4: Manual check**

Run `npm run dev`, open the Notas tab:
- Typing in the search box hides the sub-tab row and shows a flat list of matches across World/NPCs/Quests/Journal/Quick, each with a small type badge.
- Searching a string that matches nothing shows "Sin resultados para "...".".
- Tapping a result switches to the correct sub-tab, clears the search box, and immediately opens that entry's edit/view modal (test at least one World note, one Quest, and one Journal entry).
- For Quest results specifically: set the Quest sub-tab's status filter to something that excludes the target quest's status, then search for and tap that quest from search results anyway — it should still open correctly (this exercises the "look up from the full list, not the filtered one" fix).
- Tapping a Quick Note result switches to the Quick sub-tab without attempting to open any modal (there isn't one).

- [ ] **Step 5: Commit**

```bash
git add src/components/tabs/NotesTab.tsx
git commit -m "feat: add cross-note search bar to Notes tab"
```

---

## Final Verification

After all 5 tasks:

```bash
npx tsc --noEmit && npm run build
```

Expected: both PASS with no errors.
