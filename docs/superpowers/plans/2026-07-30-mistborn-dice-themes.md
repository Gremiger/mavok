# Mistborn Dice Themes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two Mistborn-inspired dice themes (Steel, Mist) in a new "Mistborn" picker category, reusing Rock's existing mesh/texture assets with new tint colors.

**Architecture:** Same pattern as the existing Rock/Rust special themes — `material.type: "color"` theme configs that tint a shared base texture via `themeColor`. No new texture assets are needed; `steel/` and `mist/` are copies of `rock/`'s asset files with their own `theme.config.json`. `DiceThemePreset.category` gains a third value (`"mistborn"`), and the picker modal gains a third grouped section.

**Tech Stack:** No new dependencies — reuses the already-installed `@3d-dice/dice-box` and existing `rock/` theme assets.

## Global Constraints

- Steel: `systemName: "steel"`, `themeColor: "#8A99A6"` — confirmed via live render during design.
- Mist: `systemName: "mist"`, `themeColor: "#C9C9C4"` — confirmed via live render during design.
- Both use the same `smoothDice` mesh/material shape as Rock/Rust (no new mesh authoring).
- Verify every task with `npx tsc --noEmit && npm run build && npm run lint && npm test` — 0 lint errors required (per `CLAUDE.md`).

---

### Task 1: Steel and Mist theme asset folders

**Files:**
- Create: `public/assets/themes/steel/` (copy of `public/assets/themes/rock/`'s files, new `theme.config.json`)
- Create: `public/assets/themes/mist/` (copy of `public/assets/themes/rock/`'s files, new `theme.config.json`)

**Interfaces:**
- Produces: two theme asset folders served at `/assets/themes/steel/` and `/assets/themes/mist/`, matching the `systemName` values Task 2's catalog will reference

- [ ] **Step 1: Copy Rock's asset files into two new folders**

```bash
mkdir -p public/assets/themes/steel public/assets/themes/mist
cp public/assets/themes/rock/diffuse-dark.png public/assets/themes/rock/diffuse-light.png public/assets/themes/rock/normal.png public/assets/themes/rock/smoothDice.json public/assets/themes/rock/specularity.jpg public/assets/themes/steel/
cp public/assets/themes/rock/diffuse-dark.png public/assets/themes/rock/diffuse-light.png public/assets/themes/rock/normal.png public/assets/themes/rock/smoothDice.json public/assets/themes/rock/specularity.jpg public/assets/themes/mist/
```

- [ ] **Step 2: Write steel's theme.config.json**

Create `public/assets/themes/steel/theme.config.json`:

```json
{
  "name": "Steel",
  "systemName": "steel",
  "author": "Frank Ali",
  "version": 0.2,
  "meshName": "smoothDice",
  "meshFile": "smoothDice.json",
  "material": {
    "type": "color",
    "diffuseTexture": {
      "light": "diffuse-light.png",
      "dark": "diffuse-dark.png"
    },
    "bumpTexture": "normal.png",
    "specularTexture": "specularity.jpg",
    "diffuseLevel": 1,
    "bumpLevel": 1,
    "specularPower": 0.5
  },
  "themeColor": "#8A99A6",
  "diceAvailable": ["d4","d6","d8","d10","d12","d20","d100"]
}
```

- [ ] **Step 3: Write mist's theme.config.json**

Create `public/assets/themes/mist/theme.config.json`:

```json
{
  "name": "Mist",
  "systemName": "mist",
  "author": "Frank Ali",
  "version": 0.2,
  "meshName": "smoothDice",
  "meshFile": "smoothDice.json",
  "material": {
    "type": "color",
    "diffuseTexture": {
      "light": "diffuse-light.png",
      "dark": "diffuse-dark.png"
    },
    "bumpTexture": "normal.png",
    "specularTexture": "specularity.jpg",
    "diffuseLevel": 1,
    "bumpLevel": 1,
    "specularPower": 0.5
  },
  "themeColor": "#C9C9C4",
  "diceAvailable": ["d4","d6","d8","d10","d12","d20","d100"]
}
```

- [ ] **Step 4: Verify both folders have all 6 files**

Run: `for t in steel mist; do echo "=== $t ==="; ls public/assets/themes/$t/; done`
Expected:
```
=== steel ===
diffuse-dark.png
diffuse-light.png
normal.png
smoothDice.json
specularity.jpg
theme.config.json
=== mist ===
diffuse-dark.png
diffuse-light.png
normal.png
smoothDice.json
specularity.jpg
theme.config.json
```

- [ ] **Step 5: Commit**

```bash
git add public/assets/themes/steel public/assets/themes/mist
git commit -m "chore: add steel and mist dice-box theme assets (Mistborn)"
```

---

### Task 2: Add Steel and Mist to the theme catalog

**Files:**
- Modify: `src/data/dice-themes.ts`

**Interfaces:**
- Consumes: nothing new
- Produces: `DiceThemeId` gains `"steel" | "mist"`; `DiceThemePreset.category` gains `"mistborn"`; `DICE_THEMES` gains 2 entries — consumed by Task 3 (`DiceThemePickerModal.tsx`)

- [ ] **Step 1: Update DiceThemeId and DiceThemePreset**

In `src/data/dice-themes.ts`, replace:

```typescript
export type DiceThemeId =
  | "default"
  | "wooden"
  | "blueGreenMetal"
  | "gemstoneMarble"
  | "rock"
  | "rust";

export interface DiceThemePreset {
  systemName: DiceThemeId;
  label: string;
  category: "normal" | "especial";
  themeColor?: string;
  swatch: string;
}
```

with:

```typescript
export type DiceThemeId =
  | "default"
  | "wooden"
  | "blueGreenMetal"
  | "gemstoneMarble"
  | "rock"
  | "rust"
  | "steel"
  | "mist";

export interface DiceThemePreset {
  systemName: DiceThemeId;
  label: string;
  category: "normal" | "especial" | "mistborn";
  themeColor?: string;
  swatch: string;
}
```

- [ ] **Step 2: Append the two new catalog entries**

In `src/data/dice-themes.ts`, replace the end of the `DICE_THEMES` array:

```typescript
  {
    systemName: "rust",
    label: "Sangre de Rage",
    category: "especial",
    themeColor: "#8b0000",
    swatch: "#8b0000",
  },
];
```

with:

```typescript
  {
    systemName: "rust",
    label: "Sangre de Rage",
    category: "especial",
    themeColor: "#8b0000",
    swatch: "#8b0000",
  },
  {
    systemName: "steel",
    label: "Acero (Mistborn)",
    category: "mistborn",
    themeColor: "#8A99A6",
    swatch: "#8A99A6",
  },
  {
    systemName: "mist",
    label: "Bruma (Mistborn)",
    category: "mistborn",
    themeColor: "#C9C9C4",
    swatch: "#C9C9C4",
  },
];
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/data/dice-themes.ts
git commit -m "feat: add Steel and Mist to the dice theme catalog"
```

---

### Task 3: Render the "Mistborn" section in the picker

**Files:**
- Modify: `src/components/settings/DiceThemePickerModal.tsx`

**Interfaces:**
- Consumes: `DICE_THEMES` from `@/data/dice-themes` (Task 2, now including `category: "mistborn"` entries)

- [ ] **Step 1: Add the mistborn filter and section**

In `src/components/settings/DiceThemePickerModal.tsx`, replace:

```tsx
  const normales = DICE_THEMES.filter((t) => t.category === "normal");
  const especiales = DICE_THEMES.filter((t) => t.category === "especial");
```

with:

```tsx
  const normales = DICE_THEMES.filter((t) => t.category === "normal");
  const especiales = DICE_THEMES.filter((t) => t.category === "especial");
  const mistborn = DICE_THEMES.filter((t) => t.category === "mistborn");
```

Replace:

```tsx
        <div>
          <p className="text-xs text-muted uppercase tracking-wide mb-2">
            Especiales
          </p>
          <div className="space-y-1">{especiales.map(renderRow)}</div>
        </div>
      </div>
    </Modal>
  );
}
```

with:

```tsx
        <div>
          <p className="text-xs text-muted uppercase tracking-wide mb-2">
            Especiales
          </p>
          <div className="space-y-1">{especiales.map(renderRow)}</div>
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wide mb-2">
            Mistborn
          </p>
          <div className="space-y-1">{mistborn.map(renderRow)}</div>
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 2: Run full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: `tsc` clean, build succeeds, 0 lint errors, all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/DiceThemePickerModal.tsx
git commit -m "feat: render a Mistborn section in the dice theme picker"
```

---

### Task 4: Final verification pass

This task produces no code changes on its own — it's a verification gate. If it surfaces a real defect, fix it as part of this task and commit the fix; otherwise this task produces no commit.

- [ ] **Step 1: Run the full check suite**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: 0 lint errors, all tests passing.

- [ ] **Step 2: Verify the catalog data directly**

Run: `npx tsx -e '
import { DICE_THEMES } from "./src/data/dice-themes";

const steel = DICE_THEMES.find((t) => t.systemName === "steel");
const mist = DICE_THEMES.find((t) => t.systemName === "mist");
console.log("steel:", steel?.themeColor, steel?.category);
console.log("mist:", mist?.themeColor, mist?.category);
console.log("mistborn count:", DICE_THEMES.filter((t) => t.category === "mistborn").length);
console.log("total count:", DICE_THEMES.length);
'`

Expected: `steel: #8A99A6 mistborn`, `mist: #C9C9C4 mistborn`, `mistborn count: 2`, `total count: 8`.

- [ ] **Step 3: Verify both asset folders are servable**

Run: `for t in steel mist; do test -f "public/assets/themes/$t/theme.config.json" && echo "$t: OK" || echo "$t: MISSING"; done`
Expected: both lines print `OK`.

- [ ] **Step 4: Manual dev-server smoke check**

Start `npm run dev`, unregister any existing service worker in the browser first (Application tab → Service Workers → Unregister, or via `navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()))` in the console) so the dev server's live code is what actually runs — a stale SW-cached production build silently serving old JS was the exact cause of a confusing false bug report during the original dice-theme-picker feature. Then open Ajustes → "Tema de dados", confirm a "Mistborn" section lists Steel and Mist with the correct swatch colors, select each, and roll a die in Ficha to confirm the right tint renders. Stop the dev server after.

If any step surfaces a real defect, fix it, re-run the full check suite, and commit. If everything passes cleanly, this task produces no commit.
