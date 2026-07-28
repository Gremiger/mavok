# 3D Dice Integration (Sub-project 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire real 3D physics dice rolling (`@3d-dice/dice-box`) into exactly one call site — `DiceRoller.tsx`'s standalone quick-dice roller in Combate — behind the `diceRollMode` setting from sub-project 1, with a graceful text fallback on any 3D failure.

**Architecture:** A new `src/lib/diceBox.ts` lazily dynamic-imports and owns the `DiceBox` singleton lifecycle. A new `src/lib/rollWithMode.ts` is the only module that knows about both text and 3D — it reuses sub-project 1's `parseExpression`/`composeRoll`/`rollDice` from `dice.ts` (which stays 3D-agnostic) and adds the 3D path with a fallback. A new always-mounted `DiceBoxCanvas` component in `page.tsx` provides the DOM anchor `dice-box` needs, shown as a full-screen overlay only while a roll is animating. `DiceRoller.tsx` switches from `rollDiceAsync` to the new mode-aware `rollDiceMode`, and `SettingsTab.tsx` gets a toggle to switch modes.

**Tech Stack:** `@3d-dice/dice-box@1.1.4` (BabylonJS + AmmoJS), dynamic `import()`, no other new dependencies.

## Global Constraints

- `dice-box` never receives a modifier in its roll notation — only bare `countdfaces` (e.g. `"2d20"`). The modifier is always applied afterward via `composeRoll`, to avoid any risk of double-counting (confirmed in the spec: dice-box's own modifier-notation handling is unverified from source, so this design never relies on it).
- The 3D engine is lazy — `import("@3d-dice/dice-box")` must never execute for a user who stays in text mode.
- Any 3D failure (assets missing, WebGL unsupported, offline) must fall back to the text roll and never block the ability to roll.
- `dice.ts` (from sub-project 1) is never modified and never imports `diceBox.ts`/`rollWithMode.ts` — it stays 3D-agnostic.
- Verify every task with `npx tsc --noEmit && npm run build && npm run lint && npm test` — 0 lint errors required (per `CLAUDE.md`).
- The `SettingsTab.tsx` toggle's label must say "(solo Dado suelto por ahora)" while 3D is selected, since Ficha/Combate's other rolls don't support 3D yet (sub-project 3).

---

### Task 1: Install `@3d-dice/dice-box` and verify assets

**Files:**
- Modify: `package.json`, `package-lock.json` (via `npm install`)
- Create (via postinstall, not hand-written): `public/assets/ammo/`, `public/assets/themes/default/`

**Interfaces:**
- Produces: the `@3d-dice/dice-box` package available for import in Task 2, and static asset files served at `/assets/...` by the Next.js static export (anything under `public/` is served at the site root)

- [ ] **Step 1: Install the package**

Run: `npm install @3d-dice/dice-box@1.1.4`

The postinstall script (`copyAssets.js`) prompts via terminal for a destination folder and waits up to 10 seconds; if nothing is typed, it defaults to copying into `public/assets/` relative to the repo root. Just wait for the command to finish (~10s) rather than trying to answer the prompt — the default destination is exactly what this plan expects.

- [ ] **Step 2: Verify the assets landed in the expected place**

Run: `ls public/assets/ammo/ammo.wasm.wasm public/assets/themes/default/theme.config.json`
Expected: both files exist (no "No such file" errors). If they're missing, re-run `npm install @3d-dice/dice-box@1.1.4` and watch the terminal output for where `copyAssets.js` actually wrote them, then adjust `assetPath` in Task 2's `diceBox.ts` to match.

- [ ] **Step 3: Record the approved script (optional but recommended)**

Run: `npm approve-scripts @3d-dice/dice-box`

This records the package in `package.json`'s `allowScripts` field and silences the "unreviewed install script" warning on future clean installs. It is not required for the postinstall to have run — npm's current release runs install scripts by default regardless (confirmed via `npm help approve-scripts`: "this field is advisory: install scripts still run by default").

- [ ] **Step 4: Run full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: `tsc` clean, build succeeds, 0 lint errors, all tests pass (installing a package with no code referencing it yet shouldn't change anything).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json public/assets
git commit -m "chore: install @3d-dice/dice-box and its static assets"
```

---

### Task 2: `diceBox.ts` — the DiceBox singleton wrapper

**Files:**
- Create: `src/types/dice-box.d.ts`
- Create: `src/lib/diceBox.ts`

**Interfaces:**
- Consumes: `@3d-dice/dice-box`'s default export (`DiceBox` class), installed in Task 1
- Produces: `roll3D(count: number, faces: number): Promise<number[]>`, `hide3D(): Promise<void>` — consumed by Task 3 (`rollWithMode.ts`)

This is a thin wrapper around a third-party browser-only library (dynamic import, canvas, WebGL) — no unit test, consistent with the project's existing scope for browser-dependent glue code.

- [ ] **Step 1: Add an ambient module declaration for the untyped package**

`@3d-dice/dice-box` ships no TypeScript declaration files (confirmed in
the design spec's package inspection — the extracted tarball contains
only `.js`/`.json`/`.wasm`/`.png` files, no `.d.ts`). With this
project's `tsconfig.json` `"strict": true`, importing it as-is triggers
TS7016 ("Could not find a declaration file for module
'@3d-dice/dice-box'"). Create `src/types/dice-box.d.ts`:

```typescript
declare module "@3d-dice/dice-box";
```

This tells TypeScript to trust the import exists and treat its default
export as `any`, which Task 2's own `DiceBoxInstance`/
`DiceBoxRollResult` interfaces (below) then narrow via an explicit
cast — so `any` never leaks past `diceBox.ts`'s boundary.

- [ ] **Step 2: Write the module**

Create `src/lib/diceBox.ts`:

```typescript
interface DiceBoxRollResult {
  sides: number;
  value: number;
  [key: string]: unknown;
}

interface DiceBoxInstance {
  init(): Promise<DiceBoxInstance>;
  roll(notation: string): Promise<DiceBoxRollResult[]>;
  show(): DiceBoxInstance;
  hide(): DiceBoxInstance;
}

let boxPromise: Promise<DiceBoxInstance> | null = null;

async function getDiceBox(): Promise<DiceBoxInstance> {
  if (!boxPromise) {
    boxPromise = (async () => {
      const { default: DiceBox } = await import("@3d-dice/dice-box");
      const box = new DiceBox("#dice-box-canvas", {
        assetPath: "/assets/",
      }) as DiceBoxInstance;
      await box.init();
      return box;
    })();
  }
  return boxPromise;
}

export async function roll3D(count: number, faces: number): Promise<number[]> {
  const box = await getDiceBox();
  box.show();
  const results = await box.roll(`${count}d${faces}`);
  return results.map((r) => r.value);
}

export async function hide3D(): Promise<void> {
  if (!boxPromise) return;
  const box = await boxPromise;
  box.hide();
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors — the ambient declaration from Step 1 silences TS7016, and the `as DiceBoxInstance` cast narrows the resulting `any` to this file's own minimal interface.

- [ ] **Step 4: Commit**

```bash
git add src/types/dice-box.d.ts src/lib/diceBox.ts
git commit -m "feat: add DiceBox singleton wrapper with lazy dynamic import"
```

---

### Task 3: `rollWithMode.ts` — mode-aware rolling with fallback

**Files:**
- Create: `src/lib/rollWithMode.ts`

**Interfaces:**
- Consumes: `parseExpression`, `composeRoll`, `rollDice`, `type DiceRoll` from `@/lib/dice` (sub-project 1); `roll3D`, `hide3D` from `@/lib/diceBox` (Task 2); `AppSettings` from `@/lib/types`
- Produces: `RollWithModeResult { roll: DiceRoll; usedFallback: boolean }`, `rollDiceMode(expression: string, mode: AppSettings["diceRollMode"]): Promise<RollWithModeResult>` — consumed by Task 5 (`DiceRoller.tsx`)

This is a thin orchestration function with no dedicated unit test — its only interesting branch (3D failure → text fallback) would require mocking a real `dice-box` roll, not worth the complexity for a fallback path that degrades to already-tested `rollDice`. Consistent with sub-project 1's `*Async` wrappers also having no dedicated tests.

- [ ] **Step 1: Write the module**

Create `src/lib/rollWithMode.ts`:

```typescript
import { parseExpression, composeRoll, rollDice, type DiceRoll } from "./dice";
import { roll3D, hide3D } from "./diceBox";
import type { AppSettings } from "./types";

export interface RollWithModeResult {
  roll: DiceRoll;
  usedFallback: boolean;
}

export async function rollDiceMode(
  expression: string,
  mode: AppSettings["diceRollMode"]
): Promise<RollWithModeResult> {
  if (mode === "3d") {
    try {
      const { count, faces, modifier } = parseExpression(expression);
      const faceValues = await roll3D(count, faces);
      const roll = composeRoll(expression, faceValues, modifier);
      setTimeout(() => hide3D(), 1500);
      return { roll, usedFallback: false };
    } catch {
      // Falls through to the text path below — 3D unavailable
      // (assets missing, WebGL unsupported, offline with nothing
      // cached) never blocks the ability to roll.
    }
  }
  return { roll: rollDice(expression), usedFallback: mode === "3d" };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/rollWithMode.ts
git commit -m "feat: add rollDiceMode with automatic 3D-to-text fallback"
```

---

### Task 4: Global `DiceBoxCanvas` anchor

**Files:**
- Create: `src/components/DiceBoxCanvas.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: a `<div id="dice-box-canvas">` DOM anchor always present from first paint, which `diceBox.ts`'s `getDiceBox()` (Task 2) selects by that same ID when it initializes on first use

- [ ] **Step 1: Write the component**

Create `src/components/DiceBoxCanvas.tsx`:

```tsx
"use client";

export function DiceBoxCanvas() {
  return (
    <div
      id="dice-box-canvas"
      className="fixed inset-0 z-50 pointer-events-none"
    />
  );
}
```

- [ ] **Step 2: Mount it in page.tsx**

In `src/app/page.tsx`, add the import alongside the existing `OfflineBadge` import:

```typescript
import { OfflineBadge } from "@/components/OfflineBadge";
import { DiceBoxCanvas } from "@/components/DiceBoxCanvas";
```

Add the component alongside the existing `<OfflineBadge />` render (both are currently rendered unconditionally right after `<Toaster ... />`):

```tsx
          <OfflineBadge />
          <DiceBoxCanvas />
```

- [ ] **Step 3: Run full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: `tsc` clean, build succeeds, 0 lint errors, all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/DiceBoxCanvas.tsx src/app/page.tsx
git commit -m "feat: add always-mounted DiceBoxCanvas anchor for the 3D dice engine"
```

---

### Task 5: Wire `DiceRoller.tsx` to `rollDiceMode` and add the Ajustes toggle

**Files:**
- Modify: `src/components/combat/DiceRoller.tsx`
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Consumes: `rollDiceMode` from `@/lib/rollWithMode` (Task 3); `diceRollMode`/`setDiceRollMode` from `useThemeContext()` (already added in sub-project 1's `useTheme.ts`)

This task touches UI components with no unit tests, consistent with the project's existing scope. Verification is `tsc`/`build`/`lint`/`test` plus a manual walkthrough.

- [ ] **Step 1: Update DiceRoller.tsx's imports**

Replace:

```typescript
import { rollDiceAsync, isD20Crit, isD20Fumble, type DiceRoll } from "@/lib/dice";
```

with:

```typescript
import { isD20Crit, isD20Fumble, type DiceRoll } from "@/lib/dice";
import { rollDiceMode } from "@/lib/rollWithMode";
import { useThemeContext } from "@/lib/context";
import { toast } from "sonner";
```

- [ ] **Step 2: Read diceRollMode and update the roll function**

Replace:

```typescript
export function DiceRoller() {
  const [history, setHistory] = useState<DiceRoll[]>([]);
  const [custom, setCustom] = useState("");

  async function roll(expression: string) {
    try {
      const result = await rollDiceAsync(expression);
      setHistory((prev) => [result, ...prev].slice(0, 5));
    } catch {
      // invalid expression, ignore
    }
  }
```

with:

```typescript
export function DiceRoller() {
  const { diceRollMode } = useThemeContext();
  const [history, setHistory] = useState<DiceRoll[]>([]);
  const [custom, setCustom] = useState("");

  async function roll(expression: string) {
    try {
      const { roll: result, usedFallback } = await rollDiceMode(
        expression,
        diceRollMode
      );
      if (usedFallback) {
        toast("Dados 3D no disponible, usando texto");
      }
      setHistory((prev) => [result, ...prev].slice(0, 5));
    } catch {
      // invalid expression, ignore
    }
  }
```

- [ ] **Step 3: Add the Ajustes toggle**

In `src/components/tabs/SettingsTab.tsx`, destructure the new setting from `useThemeContext()`. Replace:

```typescript
  const {
    theme,
    setTheme,
    density,
    toggleDensity,
    magicItemIndicator,
    setMagicItemIndicator,
  } = useThemeContext();
```

with:

```typescript
  const {
    theme,
    setTheme,
    density,
    toggleDensity,
    magicItemIndicator,
    setMagicItemIndicator,
    diceRollMode,
    setDiceRollMode,
  } = useThemeContext();
```

Add the toggle row right after the existing `magicItemIndicator` `CompactRow` (which currently ends the `</div>` block before `</CollapsibleSection>` for the theme/density section). Replace:

```tsx
          <CompactRow
            onClick={() =>
              setMagicItemIndicator(
                magicItemIndicator === "number-only"
                  ? "explicit-tag"
                  : "number-only"
              )
            }
            name={`Indicador de bonos mágicos: ${
              magicItemIndicator === "explicit-tag" ? "Etiqueta explícita" : "Solo número"
            }`}
            right={<span className="text-xs text-muted">Tap para cambiar</span>}
          />
        </div>
      </CollapsibleSection>
```

with:

```tsx
          <CompactRow
            onClick={() =>
              setMagicItemIndicator(
                magicItemIndicator === "number-only"
                  ? "explicit-tag"
                  : "number-only"
              )
            }
            name={`Indicador de bonos mágicos: ${
              magicItemIndicator === "explicit-tag" ? "Etiqueta explícita" : "Solo número"
            }`}
            right={<span className="text-xs text-muted">Tap para cambiar</span>}
          />
          <CompactRow
            onClick={() =>
              setDiceRollMode(diceRollMode === "text" ? "3d" : "text")
            }
            name={`Modo de tirada: ${
              diceRollMode === "3d"
                ? "3D (solo Dado suelto por ahora)"
                : "Texto"
            }`}
            right={<span className="text-xs text-muted">Tap para cambiar</span>}
          />
        </div>
      </CollapsibleSection>
```

- [ ] **Step 4: Run full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: `tsc` clean, build succeeds, 0 lint errors, all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/combat/DiceRoller.tsx src/components/tabs/SettingsTab.tsx
git commit -m "feat: wire DiceRoller to rollDiceMode and add the Ajustes 3D toggle"
```

---

### Task 6: Full verification pass

This task produces no code changes on its own — it's a verification gate. If the walkthrough surfaces a real defect, fix it as part of this task and commit the fix; otherwise this task produces no commit.

- [ ] **Step 1: Run the full check suite**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: 0 lint errors, all tests passing.

- [ ] **Step 2: Verify the text-mode path is unaffected**

Run: `npx tsx -e '
import { rollDiceMode } from "./src/lib/rollWithMode";

(async () => {
  const { roll, usedFallback } = await rollDiceMode("2d6+3", "text");
  console.log("text mode:", roll.expression, roll.rolls, roll.total, "usedFallback:", usedFallback);
})();
'`

Expected: `text mode: 2d6+3 [X, Y] <sum+3> usedFallback: false` where X and Y are each between 1 and 6, confirming text mode never touches the 3D path at all (no delay, no dynamic import triggered).

- [ ] **Step 3: Confirm no stray symlinks or worktree pollution**

Run: `find <repo-root> -maxdepth 3 -type l 2>/dev/null | grep -v node_modules`
Expected: no output.

- [ ] **Step 4: Manual dev-server smoke check**

Start `npm run dev`, `curl -s -o /dev/null -w "http:%{http_code}\n" http://localhost:3000` and expect `http:200`, then stop the dev server. Since Chrome DevTools MCP browser tooling is unavailable this session, the actual 3D-mode visual walkthrough (toggle to 3D in Ajustes, roll a quick die in Combate, confirm the full-screen canvas appears and a result lands correctly) can't be click-tested here — note this limitation explicitly rather than claiming it was verified, consistent with how prior plans this session handled the same tooling gap.

If any step surfaces a real defect, fix it, re-run the full check suite, and commit. If everything passes cleanly, this task produces no commit.
