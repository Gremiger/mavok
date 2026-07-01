# Mavok Improvements — Design Spec
Date: 2026-07-01

## Overview

Nine improvements across three categories: data fixes (XPHB compliance), visual/UX fixes, and feature additions. All implemented in a single pass (one version bump, one migration).

---

## Section 1 — Data Fixes (XPHB Compliance)

### 1a. Large Form level fix
- Change `level: 1` → `level: 5` on the Large Form feature in `src/data/mavok-default.ts`
- XPHB source: *"Starting at character level 5…"*
- Add level gating to SheetTab's "Rasgos y características" section: only render features where `feature.level <= character.meta.level`

### 1b. Rage description correction
Current description is wrong for XPHB in two ways:
1. Recovery: says "2 usos por descanso largo" — XPHB grants **1 use per Short Rest**, all uses per Long Rest
2. Duration: says "Duración: 10 minutos" — XPHB Rage ends at **end of your next turn** unless extended each round by: (a) making an attack roll against an enemy, (b) forcing an enemy to make a saving throw, or (c) taking a Bonus Action to extend. Max duration 10 minutes total.

New description:
> "Bonus Action para entrar en Rage (no puedes llevar Heavy Armor). 2 usos: recuperas 1 uso por descanso corto y todos por descanso largo. Mientras activo: +2 daño con ataques de Fuerza (arma o Unarmed Strike), Resistencia a Bludgeoning/Piercing/Slashing, Ventaja en pruebas y salvaciones de FUE. No puedes concentrarte ni lanzar hechizos. Duración: termina al final de tu siguiente turno a menos que lo extiendas atacando, forzando una salvación o con Bonus Action. Máximo 10 minutos. Termina antes si equipas Heavy Armor o quedas Incapacitated."

### 1c. Giant Ancestry: Stone Giant — update description
Current description is vague. New description:
> "Descendiente de Stone Giants. Boon elegido: Stone's Endurance. Usos: igual a tu Proficiency Bonus por descanso largo."

### 1d. Stone's Endurance — add as separate feature
Add a new Feature entry:
```
name: "Stone's Endurance"
source: "Goliath"
level: 1
description: "Reacción: cuando recibes daño, tira 1d12 y añade tu modificador de CON. Reduce el daño entrante por ese total. Usos: igual a tu Proficiency Bonus (actualmente 2) por descanso largo."
```

This also requires adding a use tracker to `Resources` (see Section 1e).

### 1e. Data model change — stoneEndurance tracker + feature patches in migration
- Add `stoneEndurance: { total: number; remaining: number }` to the `Resources` interface in `src/lib/types.ts`
- Increment `CURRENT_DATA_VERSION` from 2 → 3
- Update `src/data/mavok-default.ts`: `stoneEndurance: { total: 2, remaining: 2 }`

The v3 migration in `src/lib/migrations.ts` must do **all of the following** (features are stored in the character JSON in LocalStorage — changing `mavok-default.ts` only affects new characters):

1. Add `resources.stoneEndurance = { total: meta.proficiencyBonus, remaining: meta.proficiencyBonus }`
2. Fix Rage feature description to XPHB text (short rest recovery + duration/extension mechanic)
3. Update Giant Ancestry: Stone Giant description to clarify Stone's Endurance boon and uses
4. Add Stone's Endurance as a new feature entry (if not already present by name)
5. Fix Large Form `level` field from 1 → 5

### 1f. Mountain Born — no action needed
Mountain Born does not exist in XPHB. The Goliath species in XPHB has Giant Ancestry + Large Form + Powerful Build only. Nothing to add or remove.

---

## Section 2 — Visual / UX Fixes

### 2a. Move island nav higher
- In `src/app/page.tsx`: change nav from `bottom-0` → `bottom-4`
- Update `pb-safe-nav` in `src/app/globals.css` to add ~16px extra padding so content isn't hidden behind the raised nav

### 2b. Fix iOS text zoom-in
- iOS auto-zooms on inputs with `font-size < 16px`
- In `globals.css`: add `font-size: 16px` rule targeting `input, textarea, select`
- This stops the auto-zoom without blocking pinch-to-zoom

### 2c. Improve pinch-to-zoom
- In `src/app/page.tsx`: the `drag="x"` on `motion.main` intercepts multi-touch events and breaks native pinch-zoom
- Fix: track touch count with `onTouchStart`. When `touches.length > 1`, disable drag via `dragEnabled` prop. Re-enable on touch end.
- Replace `touch-pan-y` Tailwind class with explicit `style={{ touchAction: 'pan-y pinch-zoom' }}`

### 2d. Passive perception & other passives
- In `src/components/tabs/SheetTab.tsx`: add a small read-only badge row at the top of the "Habilidades" collapsible section
- Show three computed values (no new stored fields needed):
  - **Passive Perception** = `10 + skillTotal(character, 'perception')`
  - **Passive Insight** = `10 + skillTotal(character, 'insight')`
  - **Passive Investigation** = `10 + skillTotal(character, 'investigation')`
- Display as three compact horizontal badges: `Percepción Pasiva 13 · Perspicacia Pasiva 11 · Investigación Pasiva 9`

---

## Section 3 — Feature Additions

### 3a. Rage details when active
- In `src/components/combat/RageTracker.tsx` (or inline in CombatTab): when `rageActive === true`, show a compact info panel below the rage toggle button
- Content (single line per bullet, small muted text):
  - `+2 daño · Resistencia Bludgeoning/Piercing/Slashing · Ventaja FUE checks/saves`
  - `Extiende: ataca · fuerza salvación · Bonus Action`
  - `No concentración · No hechizos`

### 3b. Group skills by ability
- In `src/components/tabs/SheetTab.tsx`, in the "Habilidades" section header add a small toggle button
- Local state `groupByAbility: boolean` (default: false)
- **Alphabetical view** (current): sorted by `skillLabel()`
- **Grouped view**: skills partitioned by `skill.attribute`, shown under sub-headers using the Spanish ability name (FUE / DES / CON / INT / SAB / CAR), each group sorted alphabetically within
- Passive perception row (from 2d) stays above the toggle, always visible

### 3c. Actions / Bonus Actions / Reactions overhaul

#### Standard Actions Modal
- Create `src/components/combat/StandardActionsModal.tsx`
- Contains the full XPHB list: Attack (with Grapple/Shove as Unarmed Strike sub-options), Dash, Disengage, Dodge, Don or Doff Shield, Help, Hide, Influence, Ready, Search, Study, Utilize
- Each entry: name in accent font, one-line XPHB description
- Triggered by a compact "Acciones estándar" card at the bottom of Acciones and Acciones adicionales sections

#### Acciones section
- Keep weapon attack rows (AttackRow) as-is
- Add "Acciones estándar" compact card at the bottom: title + small subtitle listing action names, tapping opens StandardActionsModal

#### Acciones adicionales section
- Keep Rage toggle button
- Keep Two-Weapon Fighting card (clean up hardcoded text to reference character's Light weapons)
- Add "Acciones adicionales estándar" card → same modal, filtered to bonus action entries (Two-Weapon Fighting)

#### Reacciones section
- **Stone's Endurance** card: shows `remaining/total` uses, tap to spend a use (decrements `resources.stoneEndurance.remaining`), tap-and-hold or long-press to restore a use. Uses the new tracker from 1e.
- **Opportunity Attack** card (existing, cleaned up text)
- **"Reacciones estándar"** card at bottom → modal with Opportunity Attack XPHB text

---

## Implementation Notes

- Single version bump (2 → 3) covering all data model changes
- Migration is additive only — no existing fields removed
- Level gating in SheetTab is purely presentational (filter on render), no data change
- StandardActionsModal can be a simple static component — no character state needed, XPHB text hardcoded in Spanish
- Stone's Endurance use tracking: tap card to spend a use (decrement `remaining`). No long-press needed — restored by long rest only (XPHB: "regain all expended uses when you finish a Long Rest")

### Short rest / Long rest changes (SettingsTab)
- **Short rest** (`applyShortRest`): add Rage +1 recovery (XPHB: "you regain one expended use when you finish a Short Rest"). Clamp to `rpiRages.total`. Update Short Rest modal description to mention "Rage +1".
- **Long rest** (`applyLongRest`): add `stoneEndurance.remaining = stoneEndurance.total` alongside the existing Rage and HP resets. Update Long Rest modal description to list Stone's Endurance.

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/types.ts` | Add `stoneEndurance` to `Resources`, bump `CURRENT_DATA_VERSION` to 3 |
| `src/lib/migrations.ts` | Add v3 migration |
| `src/data/mavok-default.ts` | Fix Rage desc, fix Large Form level, update Giant Ancestry desc, add Stone's Endurance feature, add `stoneEndurance` to resources |
| `src/app/globals.css` | Fix input font-size, update `pb-safe-nav` |
| `src/app/page.tsx` | Raise island, fix pinch-zoom / drag conflict |
| `src/components/tabs/SheetTab.tsx` | Level gating, passive badges, skill grouping toggle |
| `src/components/tabs/CombatTab.tsx` | Rage details panel, Stone's Endurance reaction card, standard actions cards |
| `src/components/combat/RageTracker.tsx` | Rage details when active |
| `src/components/combat/StandardActionsModal.tsx` | New file — XPHB standard actions popup |
