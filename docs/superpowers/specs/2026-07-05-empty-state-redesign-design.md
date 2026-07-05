# Empty State Redesign — Design

## Context

A visual audit across all 6 tabs (with real Mavok character data, touch-emulated browser) found the app is largely polished and consistent — stone-card styling, category pills, icons all read as one coherent design language. The one concrete gap: every full-tab-level empty state (Notas' 5 sub-tabs, Enciclopedia's search/favorites, Inventario's filtered-empty view) renders as a single line of muted text near the top of the screen followed by a large, textureless void. It's visibly less finished than the rest of the app's visual identity.

Grepping the codebase confirms this is one consistent, duplicated pattern — `<p className="text-muted text-sm text-center py-8">...</p>` — repeated across 8 full-tab-level call sites, never extracted into a shared component (unlike `Modal` and `CollapsibleSection`, which already live in `src/components/ui/`). This spec extracts a shared `EmptyState` component and rolls it out to those 8 sites.

Two other occurrences of the same literal class string exist in `SheetTab.tsx` (Dotes section, `py-4`) and `FeatsBrowserModal.tsx` (filtered feats list) — both sit inline alongside other visible content (a collapsible section header, a modal's search bar), not in an empty full-tab void. They don't exhibit the problem the audit found and are explicitly out of scope.

No copy changes — the existing messages already read as calls to action ("Toca + para agregar", "Escribe algo arriba para empezar"). Only the visual treatment changes.

## 1. The `EmptyState` component

New file `src/components/ui/EmptyState.tsx`:

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

The circular icon frame uses `border-border` — already a theme-reactive CSS variable, so it recolors correctly across all 4 themes with no extra work. Padding goes from `py-8` to `py-16`: not a true vertical center (that would require restructuring each parent into a flex column with the empty state as the sole flex-grow child, which is more invasive than this warrants), but enough presence that it reads as a deliberate, designed state rather than a stray line of text. `max-w-[240px]` keeps longer messages (e.g. the favorites explainer) from stretching into an awkward centered paragraph.

## 2. Rollout to the 8 full-tab-level call sites

Each site keeps its exact existing message text, swapping only the markup and adding one icon import.

| File | Current line(s) | Icon | Notes |
|---|---|---|---|
| `src/components/tabs/NotesTab.tsx` | ~184, "Sin resultados para..." | `SearchX` | search-no-results |
| `src/components/notes/QuickNotes.tsx` | ~196, "Sin notas rápidas..." | `NotebookPen` | |
| `src/components/notes/NoteList.tsx` | ~176, "Sin notas de {title}..." | `Map` (section === "world") / `Users` (section === "npcs") | one component serves both sections; icon picked from the existing `section` prop |
| `src/components/notes/QuestList.tsx` | ~201, "Sin misiones..." | `ScrollText` | |
| `src/components/notes/JournalList.tsx` | ~142, "Sin entradas de diario..." | `BookOpen` | |
| `src/components/tabs/EncyclopediaTab.tsx` | ~357, "Sin resultados para..." | `SearchX` | search-no-results |
| `src/components/tabs/EncyclopediaTab.tsx` | ~367, "Aún no tienes favoritos..." | `Star` | already imported in this file for the row/modal star toggle |
| `src/components/tabs/InventoryTab.tsx` | ~370, "Sin objetos que coincidan..." | `SearchX` | |

All icons come from `lucide-react`, already a project dependency (used elsewhere for `Plus`, `Star`, etc.).

## Out of scope

- `SheetTab.tsx`'s "Sin dotes todavía" (inline within the Dotes `CollapsibleSection`, alongside other visible feats) and `FeatsBrowserModal.tsx`'s "Sin dotes que coincidan" (inline within a modal that already shows a search bar and category filter) — neither is a full-tab void, so neither gets the new component.
- No copy/message changes anywhere.
- No changes to the FAB "add" buttons, search bars, or any other surrounding UI — purely the empty-state markup itself.

## Verification

`npx tsc --noEmit && npm run build && npm run lint` must pass. Manually verify in the dev server / browser: trigger each of the 8 empty states (empty Notas sub-tabs, an Enciclopedia search with no matches, Enciclopedia's Favoritos pill with nothing favorited, an Inventario search/filter combination that matches nothing) and confirm each renders the icon-in-circle + message treatment, correctly themed across at least two of the four themes (e.g. Piedra Viva and Pergamino, to confirm the light theme's border/icon contrast reads fine too).
