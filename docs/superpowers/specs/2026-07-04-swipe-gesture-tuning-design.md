# Swipe Gesture Tuning — Design

## Context

The app has a swipe-to-change-tab gesture at the top level (`src/app/page.tsx`), implemented with framer-motion's `drag="x"` on the main content container, a 50px offset / 300px-per-second velocity threshold, and a spring-back animation. It's currently too sensitive — small, accidental horizontal drags (e.g. scrolling a long list, bumping the screen) trigger an unintended tab change.

A prior session fixed this specifically for the Enciclopedia tab by disabling the page-level drag entirely whenever `activeTab === "enciclopedia"` (`src/app/page.tsx`), since the category pill row there needs to scroll horizontally without fighting the page swipe. That fix works, but leaves two gaps: swiping over Enciclopedia's *content area* (not just the pills) now does nothing, and Notas has no equivalent protection at all — its sub-tab pill row (`overflow-x-auto`, same pattern as Enciclopedia) can still trigger an accidental page-tab change.

This spec: (1) raises the global swipe threshold so accidental swipes stop firing everywhere, and (2) gives Enciclopedia and Notas their own local swipe gesture — swiping their content area moves between categories / sub-tabs instead of changing the main app tab.

## 1. Shared hook

New `src/hooks/useSwipeNavigation.ts`, extracting the exact drag/threshold/animation logic already in `page.tsx`'s `Home()` component into a reusable, generic hook:

```ts
"use client";

import { useCallback } from "react";
import { useMotionValue, useTransform, animate } from "framer-motion";

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 500;

export function useSwipeNavigation<T extends string>(
  items: readonly T[],
  active: T,
  onChange: (next: T) => void
) {
  const dragX = useMotionValue(0);
  const dragOpacity = useTransform(dragX, [-150, 0, 150], [0.5, 1, 0.5]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const idx = items.indexOf(active);
      const swipe =
        Math.abs(info.offset.x) > SWIPE_THRESHOLD ||
        Math.abs(info.velocity.x) > SWIPE_VELOCITY_THRESHOLD;

      if (swipe && info.offset.x < 0 && idx < items.length - 1) {
        onChange(items[idx + 1]);
      } else if (swipe && info.offset.x > 0 && idx > 0) {
        onChange(items[idx - 1]);
      }
      animate(dragX, 0, { type: "spring", stiffness: 300, damping: 30 });
    },
    [items, active, onChange, dragX]
  );

  return { dragX, dragOpacity, handleDragEnd };
}
```

`SWIPE_THRESHOLD` (100px, up from 50) and `SWIPE_VELOCITY_THRESHOLD` (500px/s, up from 300) are defined once here and used by all three call sites below — "increase swipe force everywhere" becomes a single change point instead of three copies that could drift apart.

## 2. Global tab swipe (`page.tsx`)

Replace the inline `dragX`/`dragOpacity`/`handleDragEnd` in `Home()` with `useSwipeNavigation(TAB_ORDER, activeTab, setActiveTab)`, wired to the existing `motion.main`. Extend the `drag` prop's disable condition from `isPinching || activeTab === "enciclopedia"` to `isPinching || activeTab === "enciclopedia" || activeTab === "notas"` — both of those tabs now own their own local swipe (Sections 3–4), so the outer page-level swipe must stay fully out of their way.

## 3. Encyclopedia category swipe

In `EncyclopediaTab.tsx`: `useSwipeNavigation(PILLS.map((p) => p.id), activeCategory, setActiveCategory)` — the swipeable sequence is the full pill order including "Favoritos". Wrap the content area (the `<div className="flex-1 overflow-y-auto p-4">` block) in a `motion.div` using the hook's `dragX`/`dragOpacity`/`handleDragEnd`, with `drag={searchQuery ? false : "x"}` (disabled while searching, matching the pills already being hidden then), the same `dragConstraints={{ left: 0, right: 0 }}`, `dragElastic={0.2}`, and `touchAction: 'pan-y pinch-zoom'` style already used in `page.tsx`. Vertical scrolling of long lists (391 spells) is unaffected — `drag="x"` only captures the horizontal gesture axis, already proven by `page.tsx`'s own scrollable content coexisting with its drag.

## 4. Notes sub-tab swipe

Same pattern in `NotesTab.tsx`: `useSwipeNavigation(SUB_TABS.map((t) => t.id), activeSubTab, setActiveSubTab)`, wrapping its content area in a `motion.div` with `drag={searchQuery ? false : "x"}` and the same constraints/elastic/touchAction values. This is the actual fix for "change global swipe for notes swipe" — today Notes has no local swipe handling, so a swipe anywhere on it (including over the sub-tab pill row) falls through to the global page-tab swipe; after this change, Notes' content area owns horizontal swipe, and the outer page-level swipe is disabled for this tab per Section 2.

## Out of scope

- No changes to `CombatTab`, `InventoryTab`, or `SheetTab` — they don't have sub-navigation that would conflict with the page-level swipe.
- No changes to swipe *visual* feedback (opacity fade, spring-back animation) beyond the threshold numbers — reusing the existing feel exactly.

## Verification

`npx tsc --noEmit && npm run build && npm run lint` must pass. Manually verify in a browser (touch-emulated): confirm a small/slow drag no longer changes tabs anywhere; confirm a deliberate full swipe still changes the main app tab from Ficha/Combate/Inventario/Ajustes; confirm swiping Enciclopedia's content area moves between categories (including into/out of Favoritos) without changing the main app tab; confirm swiping Notas' content area moves between sub-tabs (Rápidas/Mundo/NPCs/Misiones/Diario) without changing the main app tab; confirm both category-pill and sub-tab-pill rows still scroll natively without triggering anything.
