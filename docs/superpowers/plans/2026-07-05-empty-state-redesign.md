# Empty State Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 8 full-tab-level empty-state paragraphs (currently a lone line of muted text over a large void) with a shared `EmptyState` component — an icon in a themed circular frame plus the existing message, unchanged copy.

**Architecture:** One new presentational component (`src/components/ui/EmptyState.tsx`, following the same `src/components/ui/` pattern as `Modal` and `CollapsibleSection`) consumed by 7 files across 8 call sites. No state, no new data, no copy changes — purely a markup swap at each site plus one icon import.

**Tech Stack:** TypeScript, Next.js 15 (static export), `lucide-react` (already a project dependency) — no test framework; verification is `npx tsc --noEmit && npm run build && npm run lint` plus manual browser checks per CLAUDE.md.

## Global Constraints

- `npm run lint` must report 0 errors.
- `output: 'export'` — no server-only APIs.
- No copy/message changes at any call site — only the surrounding markup.
- Out of scope: `SheetTab.tsx`'s "Sin dotes todavía" and `FeatsBrowserModal.tsx`'s "Sin dotes que coincidan" — both inline within already-populated sections, not full-tab voids. Do not touch them.

---

### Task 1: Create `EmptyState` and roll out to the Notas family

**Files:**
- Create: `src/components/ui/EmptyState.tsx`
- Modify: `src/components/tabs/NotesTab.tsx`
- Modify: `src/components/notes/QuickNotes.tsx`
- Modify: `src/components/notes/NoteList.tsx`
- Modify: `src/components/notes/QuestList.tsx`
- Modify: `src/components/notes/JournalList.tsx`

**Interfaces:**
- Produces: `EmptyState({ icon: LucideIcon; message: string }): JSX.Element`, exported from `src/components/ui/EmptyState.tsx`, consumed by every file in this task and by Task 2.

- [ ] **Step 1: Create the `EmptyState` component**

Create `src/components/ui/EmptyState.tsx`:

```tsx
"use client";

import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  message,
}: {
  icon: LucideIcon;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="w-14 h-14 rounded-full border border-border flex items-center justify-center">
        <Icon className="w-6 h-6 text-muted" strokeWidth={1.5} />
      </div>
      <p className="text-muted text-sm max-w-[240px]">{message}</p>
    </div>
  );
}
```

- [ ] **Step 2: Wire it into `NotesTab.tsx`'s search-no-results state**

In `src/components/tabs/NotesTab.tsx`, replace:

```ts
import { useState } from "react";
import { motion } from "framer-motion";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useCharacterContext } from "@/lib/context";
import { QuickNotes } from "@/components/notes/QuickNotes";
import { NoteList } from "@/components/notes/NoteList";
import { QuestList } from "@/components/notes/QuestList";
import { JournalList } from "@/components/notes/JournalList";
import type { Notes } from "@/lib/types";
```

with:

```ts
import { useState } from "react";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useCharacterContext } from "@/lib/context";
import { QuickNotes } from "@/components/notes/QuickNotes";
import { NoteList } from "@/components/notes/NoteList";
import { QuestList } from "@/components/notes/QuestList";
import { JournalList } from "@/components/notes/JournalList";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Notes } from "@/lib/types";
```

Then replace:

```tsx
            <p className="text-muted text-sm text-center py-8">
              Sin resultados para &quot;{searchQuery}&quot;.
            </p>
```

with:

```tsx
            <EmptyState
              icon={SearchX}
              message={`Sin resultados para "${searchQuery}".`}
            />
```

- [ ] **Step 3: Wire it into `QuickNotes.tsx`**

In `src/components/notes/QuickNotes.tsx`, replace:

```ts
import { useState, useEffect, useRef } from "react";
import { useCharacterContext } from "@/lib/context";
```

with:

```ts
import { useState, useEffect, useRef } from "react";
import { NotebookPen } from "lucide-react";
import { useCharacterContext } from "@/lib/context";
import { EmptyState } from "@/components/ui/EmptyState";
```

Then replace:

```tsx
        {character.notes.quick.length === 0 && (
          <p className="text-muted text-sm text-center py-8">
            Sin notas rápidas. Escribe algo arriba para empezar.
          </p>
        )}
```

with:

```tsx
        {character.notes.quick.length === 0 && (
          <EmptyState
            icon={NotebookPen}
            message="Sin notas rápidas. Escribe algo arriba para empezar."
          />
        )}
```

- [ ] **Step 4: Wire it into `NoteList.tsx`**

In `src/components/notes/NoteList.tsx`, replace:

```ts
import { useState, useEffect } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { Plus } from "lucide-react";
import type { NoteEntry } from "@/lib/types";
```

with:

```ts
import { useState, useEffect } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Plus, Map, Users } from "lucide-react";
import type { NoteEntry } from "@/lib/types";
```

Then replace:

```tsx
      {notes.length === 0 && (
        <p className="text-muted text-sm text-center py-8">
          Sin notas de {title.toLowerCase()}. Toca + para agregar.
        </p>
      )}
```

with:

```tsx
      {notes.length === 0 && (
        <EmptyState
          icon={section === "world" ? Map : Users}
          message={`Sin notas de ${title.toLowerCase()}. Toca + para agregar.`}
        />
      )}
```

- [ ] **Step 5: Wire it into `QuestList.tsx`**

In `src/components/notes/QuestList.tsx`, replace:

```ts
import { useState, useEffect } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { Tag } from "@/components/ui/Tag";
import { Plus } from "lucide-react";
import type { QuestEntry } from "@/lib/types";
```

with:

```ts
import { useState, useEffect } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { Tag } from "@/components/ui/Tag";
import { EmptyState } from "@/components/ui/EmptyState";
import { Plus, ScrollText } from "lucide-react";
import type { QuestEntry } from "@/lib/types";
```

Then replace:

```tsx
      {quests.length === 0 && (
        <p className="text-muted text-sm text-center py-8">
          Sin misiones{filter !== "all" ? ` ${STATUS_CONFIG[filter].label.toLowerCase()}s` : ""}. Toca + para agregar.
        </p>
      )}
```

with:

```tsx
      {quests.length === 0 && (
        <EmptyState
          icon={ScrollText}
          message={`Sin misiones${filter !== "all" ? ` ${STATUS_CONFIG[filter].label.toLowerCase()}s` : ""}. Toca + para agregar.`}
        />
      )}
```

- [ ] **Step 6: Wire it into `JournalList.tsx`**

In `src/components/notes/JournalList.tsx`, replace:

```ts
import { useState } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { Plus } from "lucide-react";
import type { JournalEntry } from "@/lib/types";
```

with:

```ts
import { useState } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Plus, BookOpen } from "lucide-react";
import type { JournalEntry } from "@/lib/types";
```

Then replace:

```tsx
      {journal.length === 0 && (
        <p className="text-muted text-sm text-center py-8">
          Sin entradas de diario. Toca + después de cada sesión.
        </p>
      )}
```

with:

```tsx
      {journal.length === 0 && (
        <EmptyState
          icon={BookOpen}
          message="Sin entradas de diario. Toca + después de cada sesión."
        />
      )}
```

- [ ] **Step 7: Type-check, build, lint**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all succeed, lint reports 0 errors (pre-existing `@next/next/no-img-element` warnings in `SettingsTab.tsx`/`SheetTab.tsx` are unrelated and expected to remain).

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/EmptyState.tsx src/components/tabs/NotesTab.tsx src/components/notes/QuickNotes.tsx src/components/notes/NoteList.tsx src/components/notes/QuestList.tsx src/components/notes/JournalList.tsx public/sw.js
git commit -m "feat: add EmptyState component, use it across the Notas tab family"
```

(`public/sw.js` is regenerated by the `prebuild` script during `npm run build` in Step 7 — commit it alongside per the project's established convention.)

---

### Task 2: Roll out to Enciclopedia and Inventario, then verify

**Files:**
- Modify: `src/components/tabs/EncyclopediaTab.tsx`
- Modify: `src/components/tabs/InventoryTab.tsx`

**Interfaces:**
- Consumes: `EmptyState` (Task 1, `src/components/ui/EmptyState.tsx`).
- Produces: no new exports — final integration point for this plan.

- [ ] **Step 1: Wire it into `EncyclopediaTab.tsx`'s two empty states**

In `src/components/tabs/EncyclopediaTab.tsx`, replace:

```ts
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useThemeContext } from "@/lib/context";
```

with:

```ts
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star, SearchX } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useThemeContext } from "@/lib/context";
```

Then replace:

```tsx
          ) : (
            <p className="text-muted text-sm text-center py-8">
              Sin resultados para &quot;{searchQuery}&quot;.
            </p>
          )
        ) : activeCategory === FAVORITES_ID ? (
          favoriteItems.length > 0 ? (
            <div className="space-y-2">
              {favoriteItems.map((item) => renderRow(item, true))}
            </div>
          ) : (
            <p className="text-muted text-sm text-center py-8">
              Aún no tienes favoritos — toca la estrella en cualquier
              entrada.
            </p>
          )
```

with:

```tsx
          ) : (
            <EmptyState
              icon={SearchX}
              message={`Sin resultados para "${searchQuery}".`}
            />
          )
        ) : activeCategory === FAVORITES_ID ? (
          favoriteItems.length > 0 ? (
            <div className="space-y-2">
              {favoriteItems.map((item) => renderRow(item, true))}
            </div>
          ) : (
            <EmptyState
              icon={Star}
              message="Aún no tienes favoritos — toca la estrella en cualquier entrada."
            />
          )
```

- [ ] **Step 2: Wire it into `InventoryTab.tsx`**

In `src/components/tabs/InventoryTab.tsx`, replace:

```ts
import { useState } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { exportInventoryCSV } from "@/lib/export";
import { toast } from "sonner";
import { Sword, Shield, Wrench, FlaskConical, Heart, Plus } from "lucide-react";
import type { InventoryItem } from "@/lib/types";
```

with:

```ts
import { useState } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { exportInventoryCSV } from "@/lib/export";
import { toast } from "sonner";
import { Sword, Shield, Wrench, FlaskConical, Heart, Plus, SearchX } from "lucide-react";
import type { InventoryItem } from "@/lib/types";
```

Then replace:

```tsx
      {grouped.length === 0 && (
        <p className="text-muted text-sm text-center py-8">
          Sin objetos que coincidan. Ajusta la búsqueda o los filtros.
        </p>
      )}
```

with:

```tsx
      {grouped.length === 0 && (
        <EmptyState
          icon={SearchX}
          message="Sin objetos que coincidan. Ajusta la búsqueda o los filtros."
        />
      )}
```

- [ ] **Step 3: Type-check, build, lint**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all succeed, lint reports 0 errors.

- [ ] **Step 4: Manual browser verification across all 8 empty states and 2 themes**

Start the dev server:

```bash
npm run dev &
echo $! > /tmp/mavok-dev.pid
until curl -sf http://localhost:3000 >/dev/null; do sleep 1; done
```

Using a headless-Chromium driver (or manually), trigger each of the 8 empty states and confirm each renders the icon-in-circle + message treatment (not the old bare paragraph):

- Notas → Rápidas with all quick notes deleted (or on a fresh character): `NotebookPen` icon.
- Notas → Mundo / NPCs with no entries: `Map` icon for Mundo, `Users` icon for NPCs.
- Notas → Misiones with no quests: `ScrollText` icon.
- Notas → Diario with no entries: `BookOpen` icon.
- Notas search bar with a query matching nothing: `SearchX` icon.
- Enciclopedia search with a query matching nothing: `SearchX` icon.
- Enciclopedia → Favoritos pill with nothing favorited: `Star` icon.
- Inventario search/filter combination matching nothing: `SearchX` icon.

Switch the theme (Ajustes → Tema) to Pergamino (the light theme) and re-check at least 2 of the above empty states to confirm the icon's circular border/muted-icon contrast still reads correctly on a light background, then switch back to Piedra Viva and confirm the same there. Check the browser console for errors — expect none.

Stop the dev server when done:

```bash
kill "$(cat /tmp/mavok-dev.pid)"
```

- [ ] **Step 5: Commit**

```bash
git add src/components/tabs/EncyclopediaTab.tsx src/components/tabs/InventoryTab.tsx public/sw.js
git commit -m "feat: use EmptyState in Enciclopedia and Inventario"
```

---

## Self-Review Notes

- **Spec coverage:** All 8 call sites from the spec's table are covered — 5 in Task 1 (NotesTab search, QuickNotes, NoteList ×2 sections, QuestList, JournalList — that's 6 sites across 5 files, since NoteList serves both "world" and "npcs"), 3 in Task 2 (EncyclopediaTab search, EncyclopediaTab favorites, InventoryTab). Out-of-scope items (`SheetTab.tsx`, `FeatsBrowserModal.tsx`) are untouched by both tasks.
- **Type consistency:** `EmptyState({ icon: LucideIcon; message: string })` defined once in Task 1 Step 1, and every call site in both tasks passes exactly `icon={SomeIcon}` and `message={...}`/`message="..."` matching that shape.
- **No placeholders:** every step has complete, literal code; the manual verification step in Task 2 names every one of the 8 states and which icon to expect, rather than a generic "check the empty states" instruction.
- **Naming collisions checked:** grepped all 7 modified files for `Map`, `Users`, `SearchX`, `ScrollText`, `BookOpen`, `NotebookPen` before choosing them as icon names — no existing identifiers collide (notably `Map`, which shadows the JS built-in `Map` class if it were in scope — confirmed none of these files use the built-in `Map`).
