# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A phone-first PWA for managing a D&D 5.5e (2024 rules) Barbarian character (Mavok). All data lives in LocalStorage — no backend, no auth, no database. Deployed as a static export to Vercel.

**Language**: Spanish UI labels, English D&D terms (Rage, Perception, etc.).

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Static export to out/ (must pass for deploy)
npm run lint         # ESLint
npx tsc --noEmit     # Type check without emitting
```

There are no tests. Verify changes by running `npx tsc --noEmit && npm run build`.

## Architecture

**Static export SPA**: Next.js 15 with `output: 'export'`. Everything is `"use client"` — no server components, no API routes. The app is a single page (`src/app/page.tsx`) with 5 tabs rendered conditionally via state, not routes.

**State flow**: `useCharacter()` hook → wraps LocalStorage reads/writes → provides `character` object + update functions → shared via `CharacterContext` (React context). All tabs consume this context. Saving is automatic on every state change.

**Data model**: Single JSON blob per character in LocalStorage (key: `mavok_character_<id>`). The `Character` type in `src/lib/types.ts` is the source of truth. Has a `_version` field for migrations.

**Versioned migrations** (`src/lib/migrations.ts`): When the data model changes, add a migration function keyed by the new version number, increment `CURRENT_DATA_VERSION` in `types.ts`. On load, `storage.ts` auto-detects old data, backs it up, and runs the migration chain. Migration failures preserve original data — never bricks the app.

**5etools reference data** (`src/data/`): Static TypeScript files extracted from `../dnd/5etools-src/data/` via `scripts/extract-5etools.ts`. Contains conditions, weapons, armor, mastery properties, feats, barbarian progression, and subclass data. Re-extract with `npx tsx scripts/extract-5etools.ts` if the 5etools source changes.

**Theming**: Two themes (Dark Fantasy, D&D Classic) via CSS custom properties on `[data-theme]` attribute. Variables defined in `globals.css`, toggled via `useTheme()` hook. Tailwind classes reference them as `bg-background`, `text-accent`, `bg-card`, etc.

## Key Constraints

- `output: 'export'` means no `getServerSideProps`, no API routes, no dynamic routes, no `next/image` optimization — all images must use `unoptimized: true`.
- The `Character` interface **must** stay backward-compatible or have a migration. Old data on users' phones will break without one.
- D&D progression data (barbarian levels, subclass features, rage counts) is hardcoded in `src/data/barbarian-progression.ts` and `src/data/subclasses.ts` — not computed from rules. All 4 XPHB subclasses and 20 levels are covered.
- `recalculate.ts` recomputes derived values (attack bonuses, AC, saves, mastery DCs) when attributes or proficiency change. Call it after any ASI/level-up that modifies ability scores.
- Rage slots are tracked as `boolean[]` (`slots` field on `rpiRages`), not derived from `remaining`. Each slot toggles independently.

## Adding a New Data Model Field

1. Add the field to the interface in `src/lib/types.ts`
2. Increment `CURRENT_DATA_VERSION`
3. Add a migration in `src/lib/migrations.ts` that backfills the field from old data
4. Update `src/data/mavok-default.ts` with the field
5. Verify: `npx tsc --noEmit && npm run build`
