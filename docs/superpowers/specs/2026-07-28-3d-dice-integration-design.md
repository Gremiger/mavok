# 3D Dice Rolling — Sub-project 2: Minimal Integration — Design

## Problem

Sub-project 1 made every roll call site `async`/`await`-ready and added
an invisible `AppSettings.diceRollMode` field, with zero visible change.
This sub-project wires in real 3D physics dice rolling via
`@3d-dice/dice-box`, scoped to exactly one call site — `DiceRoller.tsx`
(Combate's standalone quick-dice roller) — to validate the whole
pipeline (install, assets, canvas, roll, fallback) before extending it
everywhere in sub-project 3.

## Package Investigation (verified against the real source, not docs)

`@3d-dice/dice-box@1.1.4` — BabylonJS + AmmoJS physics, 5 dependencies.
Docs pages (fetched via WebFetch) were too thin to answer the two
questions that actually matter for this design, so the published
tarball was downloaded and inspected directly:

- **Install**: `postinstall: node copyAssets.js` prompts via `readline`
  for a destination folder, with a **10-second timeout** that falls
  back to copying into `<repo>/public/assets` if nothing answers —
  works fine non-interactively, just adds a ~10s pause the first time.
  `public/assets/` doesn't exist yet in this repo (no collision).
- **npm 11** (this project's version) blocks lifecycle scripts for
  newly-installed packages by default — `npm approve-scripts` will be
  needed after `npm install @3d-dice/dice-box`, or the asset copy won't
  run at all.
- **Constructor/API** (confirmed by reading `dist/dice-box.es.js`
  directly): `new DiceBox("#dice-box-canvas", { assetPath: "/assets/" })`,
  then `await box.init()`. Critically — `box.roll(notation)` **returns
  a Promise** that resolves once the physics settle (source:
  `roll(l, {...}) { ...; return this.rollCollectionData[Z].promise; }`),
  so there's no need to rely on the `onRollComplete` config callback at
  all. The resolved value is an array of per-die objects with a `value`
  field holding the settled face (verified in source:
  `d.rolls[b.rollId].value = l.value`, and the promise resolves with
  `Object.values(X.rolls).map(({ collectionId, id, meshName, ...rest }) => rest)` —
  each entry keeps `sides`, `dieType`, `groupId`, `rollId`, `theme`,
  `themeColor`, `value`).

Since `dice-box` doesn't support forcing a result (confirmed in
sub-project 1's spec) and its own modifier-notation handling is
untested/unclear from source, this design **never passes a modifier to
dice-box** — it only ever asks for the bare dice (e.g. `"2d20"`, not
`"2d20+5"`), reads back the raw per-die `value`s, and applies the
modifier itself via the existing `composeRoll` from sub-project 1 —
avoiding any risk of double-counting a modifier.

## Modules

**`src/lib/diceBox.ts`** (new) — the `DiceBox` singleton lifecycle,
isolated so nothing else in the codebase needs to know about the
`@3d-dice/dice-box` package or its async init dance:

```typescript
let boxPromise: Promise<DiceBoxInstance> | null = null;

async function getDiceBox(): Promise<DiceBoxInstance> {
  if (!boxPromise) {
    boxPromise = (async () => {
      const { default: DiceBox } = await import("@3d-dice/dice-box");
      const box = new DiceBox("#dice-box-canvas", { assetPath: "/assets/" });
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
  return results.map((r: { value: number }) => r.value);
}

export async function hide3D(): Promise<void> {
  if (!boxPromise) return;
  const box = await boxPromise;
  box.hide();
}
```

The `import("@3d-dice/dice-box")` is a dynamic import — the ~1MB+
BabylonJS/Ammo bundle is never fetched for a user who stays in text
mode, matching the "lazy-load only if activated" decision from
sub-project 1. `boxPromise` being module-level state (not per-component)
means the engine initializes once per page load, however many times a
3D roll happens.

**`src/lib/rollWithMode.ts`** (new) — the only module that knows about
both the text and 3D worlds:

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

`usedFallback` is `true` only when the caller *asked* for 3D and didn't
get it (mode was `"3d"` but the `try` block failed) — it's `false` both
when 3D succeeded and when the caller was already in text mode, so the
caller only ever shows the "3D unavailable" toast when it's actually
surprising. The caller (`DiceRoller.tsx`) reads this flag to show the
"Dados 3D no disponible, usando texto" toast, since `rollWithMode`
itself has no UI concerns.

`dice.ts` itself is untouched — it never imports `diceBox.ts` or
`rollWithMode.ts`, keeping it dependency-free of the heavy 3D package
even at the type level.

## Global Canvas

**`src/components/DiceBoxCanvas.tsx`** (new) — a single, always-mounted,
empty anchor element:

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

Mounted once in `src/app/page.tsx`, alongside the existing `<Toaster
/>`/`<OfflineBadge />` (both already rendered unconditionally at the
top of the returned JSX, `page.tsx:80-91`):

```tsx
          <DiceBoxCanvas />
```

This div exists from first paint regardless of `diceRollMode`, so when
`getDiceBox()` runs for the first time (on the first-ever 3D roll), the
`#dice-box-canvas` selector it needs is already in the DOM. `dice-box`
itself manages the canvas element's visibility inside that div via its
own `.show()`/`.hide()` methods (confirmed in source:
`hide() { ...canvas.style.display = "none"... }`) — `roll3D` calls
`box.show()` before rolling, and `rollDiceMode` schedules `hide3D()`
1.5 seconds after the roll settles, so the player has a moment to see
the resting dice before the full-screen overlay disappears.

## `DiceRoller.tsx` Changes

Replace the `rollDiceAsync` import/call with `rollDiceMode`, reading
`diceRollMode` from `useThemeContext()`:

```typescript
import { rollDiceMode } from "@/lib/rollWithMode";
import { useThemeContext } from "@/lib/context";
import { toast } from "sonner";
// ...
const { diceRollMode } = useThemeContext();
// ...
async function roll(expression: string) {
  try {
    const { roll: result, usedFallback } = await rollDiceMode(expression, diceRollMode);
    if (usedFallback) {
      toast("Dados 3D no disponible, usando texto");
    }
    setHistory((prev) => [result, ...prev].slice(0, 5));
  } catch {
    // invalid expression, ignore
  }
}
```

## `SettingsTab.tsx` Changes

Add a toggle mirroring the existing `magicItemIndicator` row
(`SettingsTab.tsx:239-249`), reading/writing `diceRollMode` from
`useThemeContext()` (already wired through in sub-project 1):

```tsx
<CompactRow
  onClick={() =>
    setDiceRollMode(diceRollMode === "text" ? "3d" : "text")
  }
  name={`Modo de tirada: ${
    diceRollMode === "3d" ? "3D (solo Dado suelto por ahora)" : "Texto"
  }`}
  right={<span className="text-xs text-muted">Tap para cambiar</span>}
/>
```

The "(solo Dado suelto por ahora)" qualifier is only shown when 3D is
selected, per the user's explicit choice to expose the toggle now while
being honest that Ficha/Combate's other rolls (attacks, initiative,
ability/save/skill checks) still resolve instantly in text — that's
sub-project 3.

## Setup Steps (not code, but required before this can work)

1. `npm install @3d-dice/dice-box@1.1.4`
2. Answer the postinstall's asset-destination prompt (or let it
   timeout after 10s) — either way it lands in `public/assets/`
3. `npm approve-scripts @3d-dice/dice-box` (or equivalent) so the
   postinstall actually runs on future clean installs / CI
4. Verify `public/assets/ammo/ammo.wasm.wasm` and
   `public/assets/themes/default/...` exist after install

## Testing

- `src/lib/rollWithMode.ts`: no dedicated unit test — it's a thin
  orchestration function whose only interesting branch (3D failure →
  text fallback) requires mocking a real `dice-box` roll, which isn't
  worth the complexity for a fallback path that degrades to
  already-tested `rollDice`. Consistent with how `dice.ts`'s own
  `*Async` wrappers got no dedicated tests in sub-project 1.
- `src/lib/diceBox.ts`: not unit-tested — it's a thin wrapper around a
  third-party browser-only library (dynamic import, canvas, WebGL),
  nothing pure to test in Vitest's jsdom-less/lightweight environment.
- `DiceRoller.tsx`, `DiceBoxCanvas.tsx`: UI components, untested,
  consistent with the project's existing scope.
- Manual verification: toggle to 3D in Ajustes, roll a quick die in
  Combate, confirm the full-screen canvas appears and a result lands in
  the history with the correct total; toggle back to text and confirm
  identical behavior to before this sub-project.

## Out of Scope

- Extending 3D to any other roll site (Ficha, attacks, initiative) —
  sub-project 3
- Caching `dice-box`'s static assets in the service worker for offline
  use — the fallback-to-text path already handles "3D unavailable"
  gracefully, so this isn't needed yet
- Advantage-roll (2d20-keep-higher) 3D support — `DiceRoller` never
  rolls with advantage, so `rollDiceMode` only needs to handle plain
  `count`d`faces`+`modifier` notation, not the "roll 2, take the max"
  logic `rollD20WithAdvantage` uses
