# Swipe Gesture Tuning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise the swipe threshold everywhere and give Enciclopedia and Notas their own local swipe-to-change-category/sub-tab gesture, so the global page-swipe stops firing accidentally and no longer competes with their pill rows.

**Architecture:** Extract the existing drag/threshold/spring-back logic from `page.tsx` into a reusable `useSwipeNavigation` hook with a single, raised threshold. Reuse that hook in `page.tsx` (main tabs), `EncyclopediaTab.tsx` (categories + Favoritos), and `NotesTab.tsx` (sub-tabs), disabling the outer page-level swipe whenever one of those two tabs is active so their local swipe owns the gesture instead.

**Tech Stack:** TypeScript, Next.js 15 (static export), framer-motion (already a dependency) — no test framework; verification is `npx tsc --noEmit && npm run build && npm run lint` plus manual touch-emulated browser checks per CLAUDE.md.

## Global Constraints

- `npm run lint` must report 0 errors — it's the only tool that catches React Hooks ordering violations; all hook calls (including `useSwipeNavigation`) must be placed before any conditional early return in every component that uses them.
- `output: 'export'` — no server-only APIs.
- `SWIPE_THRESHOLD = 100` and `SWIPE_VELOCITY_THRESHOLD = 500` (up from 50px / 300px-per-second) are defined once in the new hook and used by all three call sites — no duplicated threshold constants.
- No changes to `CombatTab`, `InventoryTab`, or `SheetTab`.

---

### Task 1: Extract the shared `useSwipeNavigation` hook

**Files:**
- Create: `src/hooks/useSwipeNavigation.ts`

**Interfaces:**
- Produces: `useSwipeNavigation<T extends string>(items: readonly T[], active: T, onChange: (next: T) => void): { dragX: MotionValue<number>; dragOpacity: MotionValue<number>; handleDragEnd: (event: unknown, info: { offset: { x: number }; velocity: { x: number } }) => void }` — consumed by Tasks 2–4.

- [ ] **Step 1: Create the hook file**

Create `src/hooks/useSwipeNavigation.ts`:

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

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useSwipeNavigation.ts
git commit -m "feat: extract useSwipeNavigation hook with a stronger swipe threshold"
```

---

### Task 2: Wire the hook into the global tab swipe (`page.tsx`)

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `useSwipeNavigation` (Task 1).
- Produces: no new exports.

- [ ] **Step 1: Update imports**

Replace:

```ts
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
```

with:

```ts
import { motion } from "framer-motion";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
```

Replace:

```ts
import { useState, useCallback } from "react";
```

with:

```ts
import { useState } from "react";
```

- [ ] **Step 2: Remove the old threshold constant and inline drag logic**

Remove this line:

```ts
const SWIPE_THRESHOLD = 50;
```

Replace:

```ts
  const dragX = useMotionValue(0);
  const dragOpacity = useTransform(dragX, [-150, 0, 150], [0.5, 1, 0.5]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const idx = TAB_ORDER.indexOf(activeTab);
      const swipe =
        Math.abs(info.offset.x) > SWIPE_THRESHOLD ||
        Math.abs(info.velocity.x) > 300;

      if (swipe && info.offset.x < 0 && idx < TAB_ORDER.length - 1) {
        setActiveTab(TAB_ORDER[idx + 1]);
      } else if (swipe && info.offset.x > 0 && idx > 0) {
        setActiveTab(TAB_ORDER[idx - 1]);
      }
      animate(dragX, 0, { type: "spring", stiffness: 300, damping: 30 });
    },
    [activeTab, dragX]
  );
```

with:

```ts
  const { dragX, dragOpacity, handleDragEnd } = useSwipeNavigation(
    TAB_ORDER,
    activeTab,
    setActiveTab
  );
```

- [ ] **Step 3: Extend the drag-disable condition to include Notas**

Replace:

```tsx
            drag={isPinching || activeTab === "enciclopedia" ? false : "x"}
```

with:

```tsx
            drag={
              isPinching ||
              activeTab === "enciclopedia" ||
              activeTab === "notas"
                ? false
                : "x"
            }
```

- [ ] **Step 4: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: use shared swipe hook for global tab navigation, disable it on Notas too"
```

---

### Task 3: Local category swipe in EncyclopediaTab

**Files:**
- Modify: `src/components/tabs/EncyclopediaTab.tsx`

**Interfaces:**
- Consumes: `useSwipeNavigation` (Task 1).
- Produces: no new exports.

- [ ] **Step 1: Add imports and the pill-id list**

Add to the imports at the top of the file:

```ts
import { motion } from "framer-motion";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
```

Right after the `PILLS` constant, add:

```ts
const PILL_IDS = PILLS.map((p) => p.id);
```

- [ ] **Step 2: Call the hook in the component**

In `EncyclopediaTab()`, right after the `useState` calls (before `allItems`), add:

```ts
  const { dragX, dragOpacity, handleDragEnd } = useSwipeNavigation(
    PILL_IDS,
    activeCategory,
    setActiveCategory
  );
```

- [ ] **Step 3: Wrap the content area in a `motion.div` with the swipe gesture**

Replace:

```tsx
      <div className="flex-1 overflow-y-auto p-4">
        {searchQuery ? (
```

with:

```tsx
      <motion.div
        className="flex-1 overflow-y-auto p-4"
        style={{ x: dragX, opacity: dragOpacity, touchAction: "pan-y pinch-zoom" }}
        drag={searchQuery ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        {searchQuery ? (
```

And replace the closing tag right after it:

```tsx
      </div>

      <Modal
```

with:

```tsx
      </motion.div>

      <Modal
```

- [ ] **Step 4: Type-check, build, lint**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all succeed, lint reports 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/tabs/EncyclopediaTab.tsx
git commit -m "feat: add local swipe-to-change-category gesture to EncyclopediaTab"
```

---

### Task 4: Local sub-tab swipe in NotesTab, and final verification

**Files:**
- Modify: `src/components/tabs/NotesTab.tsx`

**Interfaces:**
- Consumes: `useSwipeNavigation` (Task 1).
- Produces: no new exports — final integration point for this plan.

- [ ] **Step 1: Add imports and the sub-tab-id list**

Replace:

```ts
"use client";

import { useState } from "react";
import { useCharacterContext } from "@/lib/context";
```

with:

```ts
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useCharacterContext } from "@/lib/context";
```

Right after the `SUB_TABS` constant, add:

```ts
const SUB_TAB_IDS = SUB_TABS.map((t) => t.id);
```

- [ ] **Step 2: Call the hook before the early return**

In `NotesTab()`, the existing hooks are:

```ts
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("quick");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingOpenId, setPendingOpenId] = useState<string | undefined>(
    undefined
  );
  const charCtx = useCharacterContext();

  if (!charCtx.character) return null;
```

Insert the hook call right after `setPendingOpenId`'s `useState` and before `useCharacterContext()` (still before the early return, per this project's Rules-of-Hooks constraint):

```ts
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("quick");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingOpenId, setPendingOpenId] = useState<string | undefined>(
    undefined
  );
  const { dragX, dragOpacity, handleDragEnd } = useSwipeNavigation(
    SUB_TAB_IDS,
    activeSubTab,
    setActiveSubTab
  );
  const charCtx = useCharacterContext();

  if (!charCtx.character) return null;
```

- [ ] **Step 3: Wrap the content area in a `motion.div` with the swipe gesture**

Replace:

```tsx
      <div className="flex-1 overflow-y-auto p-4">
        {searchQuery ? (
```

with:

```tsx
      <motion.div
        className="flex-1 overflow-y-auto p-4"
        style={{ x: dragX, opacity: dragOpacity, touchAction: "pan-y pinch-zoom" }}
        drag={searchQuery ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        {searchQuery ? (
```

And replace the closing tag right after the sub-tab content block:

```tsx
          </>
        )}
      </div>
    </div>
  );
}
```

with:

```tsx
          </>
        )}
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 4: Type-check, build, lint**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all succeed, lint reports 0 errors (pre-existing `@next/next/no-img-element` warnings in `SettingsTab.tsx`/`SheetTab.tsx` are unrelated and expected to remain).

- [ ] **Step 5: Manual browser verification (touch-emulated)**

Start the dev server:

```bash
npm run dev &
echo $! > /tmp/mavok-dev.pid
until curl -sf http://localhost:3000 >/dev/null; do sleep 1; done
```

Using touch-emulated Playwright (`hasTouch: true, isMobile: true` context, CDP `Input.dispatchTouchEvent` for swipes — same technique already validated in this project's session history), verify all of the spec's checks:

- A small/slow drag (well under 100px and 500px/s) on Ficha, Combate, Inventario, or Ajustes does **not** change tabs.
- A deliberate full-width swipe on those same tabs **does** change the main app tab, in both directions.
- On Enciclopedia: swiping the content area (not the pill row) moves between categories in `PILL_IDS` order, including into and out of "Favoritos"; the main app tab does not change.
- On Enciclopedia: the category pill row still scroll natively left/right without triggering anything.
- On Notas: swiping the content area moves between sub-tabs (Rápidas → Mundo → NPCs → Misiones → Diario); the main app tab does not change.
- On Notas: the sub-tab pill row still scrolls natively without triggering anything.
- Check the browser console for errors — expect none.

Stop the dev server when done:

```bash
kill "$(cat /tmp/mavok-dev.pid)"
```

- [ ] **Step 6: Commit**

```bash
git add src/components/tabs/NotesTab.tsx public/sw.js
git commit -m "feat: add local swipe-to-change-sub-tab gesture to NotesTab"
```

(`public/sw.js` is regenerated by the `prebuild` script during `npm run build` in Step 4 — commit it alongside per the project's established convention.)

---

## Self-Review Notes

- **Spec coverage:** Shared hook with raised threshold (Task 1) ✅. Global tab swipe using the hook + disabling on Notas (Task 2) ✅. Encyclopedia local category swipe including Favoritos (Task 3) ✅. Notes local sub-tab swipe (Task 4) ✅. Out-of-scope items (CombatTab/InventoryTab/SheetTab untouched, no visual-feedback changes beyond thresholds) are honored — no task touches those files or the opacity/spring parameters.
- **Type consistency:** `useSwipeNavigation<T extends string>(items, active, onChange)` signature used identically across all three call sites — `TAB_ORDER`/`activeTab`/`setActiveTab` (Task 2), `PILL_IDS`/`activeCategory`/`setActiveCategory` (Task 3), `SUB_TAB_IDS`/`activeSubTab`/`setActiveSubTab` (Task 4) — each pair's array-element type matches the corresponding state's type (`Tab`, `Category | "favorites"`, `SubTab`).
- **No placeholders:** every step has complete, literal code.
