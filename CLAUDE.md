# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A phone-first PWA for managing a D&D 5.5e (2024 rules) Barbarian character (Mavok). All data lives in LocalStorage — no backend, no auth, no database. Deployed as a static export to Vercel.

**Language**: Spanish UI labels, English D&D terms (Rage, Perception, etc.).

## Source of Truth: 5etools

`../dnd/5etools-src` is the **sole authoritative source** for all D&D 5.5e (XPHB/2024) rules, mechanics, and reference data in this project — feature text, progression tables, weapon/armor stats, conditions, mastery properties, feats, subclass features, spell data, everything. Never rely on training-data memory of D&D rules; always check `5etools-src` first.

- Before adding, fixing, or verifying any rules-derived content (a feature description, a level table, a damage value, a mechanic), grep `../dnd/5etools-src/data/` for the canonical text or values.
- If existing app data conflicts with `5etools-src`, the app is wrong — fix the app to match, not the other way around.
- If `5etools-src` doesn't have something the app needs, say so explicitly rather than inventing plausible-sounding D&D content.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Static export to out/ (must pass for deploy)
npm run lint         # ESLint
npm test             # Vitest, single run
npx tsc --noEmit     # Type check without emitting
```

Tests are colocated as `*.test.ts` next to the source file they cover (e.g. `src/lib/migrations.test.ts`), run via Vitest. Verify changes by running `npx tsc --noEmit && npm run build && npm run lint && npm test`. **Always include lint** — `tsc`/`build`/`test` do not catch React Hooks ordering violations (see Key Constraints below); only `npm run lint`'s `react-hooks/rules-of-hooks` rule does. A change that skips lint can look clean and still ship a real bug.

Current test coverage: `migrations.ts` (the full version chain), `recalculate.ts`, and the pure roll/penalty helpers (`attackRoll.ts`, `hitDice.ts`, `exhaustion.ts`). No component/UI tests yet — verifying UI changes still means running the app (dev server + a real browser, or an MCP browser tool) and exercising the flow.

`npm run lint` should report 0 errors. Two lines (in `useCharacter.ts` and `useTheme.ts`, both reading `localStorage` on mount) carry a scoped `eslint-disable-next-line react-hooks/set-state-in-effect` with an inline justification — that's deliberate (localStorage is unavailable during this static-export app's build-time prerender pass), not new debt. Don't remove those comments, and don't add a similar suppression elsewhere without the same SSR/localStorage justification.

## Commit Messages

Never include a "Co-authored-by" (or similar attribution) trailer in commit messages for this repo.

## Architecture

**Static export SPA**: Next.js 15 with `output: 'export'`. Everything is `"use client"` — no server components, no API routes. The app is a single page (`src/app/page.tsx`) with 6 tabs (Ficha, Combate, Inventario, Notas, Enciclopedia, Ajustes) rendered conditionally via state, not routes.

**State flow**: `useCharacter()` hook → wraps LocalStorage reads/writes → provides `character` object + update functions → shared via `CharacterContext` (React context). All tabs consume this context. Saving is automatic on every state change.

**Data model**: Single JSON blob per character in LocalStorage (key: `mavok_character_<id>`). The `Character` type in `src/lib/types.ts` is the source of truth. Has a `_version` field for migrations.

**Versioned migrations** (`src/lib/migrations.ts`): When the data model changes, add a migration function keyed by the new version number, increment `CURRENT_DATA_VERSION` in `types.ts`. On load, `storage.ts` auto-detects old data, backs it up, and runs the migration chain. Migration failures preserve original data — never bricks the app.

**5etools reference data** (`src/data/`): Static TypeScript files extracted from `../dnd/5etools-src/data/` via `scripts/extract-5etools.ts`. Contains conditions, weapons, armor, mastery properties, feats, barbarian progression, and subclass data — these files are fully generated, committed to git as-is, and should not be hand-edited (re-extraction overwrites them). Two hand-maintained exceptions: `src/data/mavok-default.ts` (Mavok's specific starting character data, not generic 5etools reference data) and `src/data/condition-groups.ts` (Spanish-language UI groupings for the Combat tab's condition picker — deliberately kept out of `conditions.ts` so re-extraction can never delete it; a prior version had this grouping inline in `conditions.ts` and a re-extraction silently wiped it). Re-extract with `npx tsx scripts/extract-5etools.ts` if the 5etools source changes.

**Theming**: Two themes (Dark Fantasy, D&D Classic) via CSS custom properties on `[data-theme]` attribute. Variables defined in `globals.css`, toggled via `useTheme()` hook. Tailwind classes reference them as `bg-background`, `text-accent`, `bg-card`, etc.

**Service worker cache-busting** (`scripts/generate-sw.ts`): Runs automatically via the `prebuild` npm script before every `npm run build`. It stamps `public/sw.js`'s `STATIC_CACHE` constant with the current git commit hash. This means `public/sw.js` will show as modified after every build — that's expected, not a stray change, and should be committed alongside whatever code change triggered the rebuild. `networkFirstWithFallback` in that same generated file must cache each navigation under its own `request` object (`cache.put(request, ...)`), never a hardcoded string key — an earlier version keyed every navigation to the literal string `"/index.html"`, which meant visiting a different static page (e.g. `/print`) online silently overwrote the cached homepage, and the next offline load served the wrong page.

## Key Constraints

- `output: 'export'` means no `getServerSideProps`, no API routes, no dynamic routes, no `next/image` optimization — all images must use `unoptimized: true`.
- The `Character` interface **must** stay backward-compatible or have a migration. Old data on users' phones will break without one.
- D&D progression data (barbarian levels, subclass features, rage counts) is hardcoded in `src/data/barbarian-progression.ts` and `src/data/subclasses.ts` — not computed from rules. All 4 XPHB subclasses and 20 levels are covered.
- `recalculate.ts` recomputes derived values (attack bonuses, AC, saves, mastery DCs) when attributes or proficiency change. Call it after any ASI/level-up that modifies ability scores.
- Rage slots are tracked as `boolean[]` (`slots` field on `rpiRages`), not derived from `remaining`. Each slot toggles independently.
- **Hooks must be called before any conditional early return** (e.g. `if (!character) return null;`), never after — every component in `src/components/tabs/` and several in `src/components/notes/` guard on `character` being non-null this way, and it's tempting to add a new `useState`/`useEffect`/custom hook (like `useLongPress`) further down near the code that uses it, after the guard. That violates React's Rules of Hooks and this project has hit real bugs from it. `npx tsc --noEmit` and `npm run build` do not catch this — only `npm run lint` does.
- Same reason: don't call `setState` synchronously inside a `useEffect` body (`react-hooks/set-state-in-effect`) — if you need to reset local state when a prop changes (e.g. a modal's "open" prop), compare against a `prevProp` state value and call `setState` directly in the render body, not in an effect. `QuickActionsPicker.tsx` does this for its `open`/`selected` props.
- `combat.exhaustionLevel` (0-6) penalizes d20 tests via `exhaustionPenalty()` (`src/lib/exhaustion.ts`), applied additively at each roll-and-display site (attack rolls, ability checks, saves, skills — see `AttackRow.tsx`, `SheetTab.tsx`). Never fold it into `saveTotal`/`skillTotal`/`abilityModifier` (`src/lib/utils.ts`) — those also compute passive scores (`passivePerception` etc.), which are not d20 tests and must stay unpenalized.

## Adding a New Data Model Field

1. Add the field to the interface in `src/lib/types.ts`
2. Increment `CURRENT_DATA_VERSION`
3. Add a migration in `src/lib/migrations.ts` that backfills the field from old data
4. Update `src/data/mavok-default.ts` with the field
5. Verify: `npx tsc --noEmit && npm run build && npm run lint && npm test`
