# Mavok Round 3 Improvements — Design Spec
Date: 2026-07-01

## Overview

Five improvements for the Sheet, Combat, Inventory, and Settings tabs. All are additive display/UX features — no changes to `src/lib/types.ts` and no new data migration required. Haptic feedback (`navigator.vibrate`) was considered and dropped from scope entirely: it is not supported by iOS Safari (the user's primary device) even in an installed PWA, and there is no alternative haptic API exposed to web content on iOS — shipping it would be dead code. A visual micro-animation substitutes for it instead, which works identically on any device.

---

## Section 1 — Proficiency Bonus badge

**File:** `src/components/tabs/SheetTab.tsx`

- Add a small badge, e.g. "PB +3", to the Atributos section header, visually consistent with the existing passive-skill badges (round 1).
- Reads `character.meta.proficiencyBonus` directly — already computed and stored, never displayed anywhere in the UI until now.
- No new state, no data model change.

## Section 2 — Feats section ("Dotes")

**File:** `src/components/tabs/SheetTab.tsx`

- Feats require zero data model changes. Confirmed by reading `src/data/mavok-default.ts`: both the origin feat ("Tough", granted at character creation) and any feats granted later via Ability Score Improvement are already stored as entries in `character.features: Feature[]` with `source: "Dote"` (see `LevelUpFlow.tsx:219-225` for the ASI-feat path, and `mavok-default.ts:151-157` for the origin-feat entry). The `Feature` shape (`{ name, source, description, level }`) already carries everything needed to display a feat card.
- Add a new collapsible section titled "Dotes", rendering `character.features.filter(f => f.source === "Dote" && f.level <= meta.level)`, using the same card layout, `CollapsibleSection` wrapper, and level-gating (`f.level <= meta.level`) already used by the existing "Rasgos y características" section.
- The existing "Rasgos y características" section's filter changes from `features.filter(f => f.level <= meta.level)` to `features.filter(f => f.source !== "Dote" && f.level <= meta.level)`, so feats appear once, in their own section, not duplicated in both.

## Section 3 — Undo toast for deletions

**Files:** `src/components/tabs/InventoryTab.tsx`, `src/components/tabs/CombatTab.tsx`

- Uses `sonner` (already a dependency, already imported and used via `toast(...)` calls in `CombatTab.tsx`) and its built-in action-button API: `toast(message, { action: { label: "Deshacer", onClick: () => restore() } })`.
- **Inventory item delete** (`InventoryTab.tsx`, the "Eliminar" button currently calling `removeInventoryItem(item.id)` directly): before removing, capture the full item object and its index in the `inventory` array. Call `removeInventoryItem(item.id)` immediately (item disappears from the list right away — no perceived lag). Show `toast("${item.name} eliminado", { action: { label: "Deshacer", onClick: () => addInventoryItem(item) } })`. Note: `addInventoryItem` appends to the end of the array rather than reinserting at the original index — for a personal inventory list with no meaningful "position" semantics (items aren't manually ordered, they're grouped/sorted by category per round 2), this is an acceptable simplification; re-adding by identical `id` and full field values is what matters, not array position.
- **Condition removal** (`CombatTab.tsx`, `removeCondition(name)` which filters `combat.conditions`): before removing, capture the condition name. Call `removeCondition(name)` immediately. Show `toast("${name} eliminada", { action: { label: "Deshacer", onClick: () => addCondition(name) } })`. `addCondition` already guards against duplicates, so double-tapping "Deshacer" or re-adding an already-present condition is a safe no-op.
- No timer/expiry logic needs to be written manually — `sonner`'s toast auto-dismisses on its own default duration; once dismissed, the closure capturing the deleted item/name is simply never called again. No cleanup needed.

## Section 4 — Visual micro-animation (haptics substitute)

**Files:** `src/components/ui/DiceResult.tsx`, `src/components/combat/CombatTab.tsx` (Rage toggle, Stone's Endurance / Healer's Kit "Usar" buttons)

- Uses `framer-motion` (already a dependency, already used for `AnimatePresence`/`motion.div` patterns elsewhere — e.g. `RageTracker.tsx`'s details panel).
- **Dice roll crit/fumble pulse**: in `DiceResult.tsx`, when the roll being displayed is a d20 roll (`expression` starts with `"1d20"`) and the single die result (`rolls[0]`) is `20` or `1`, wrap the result in a `motion.div` keyed on the roll's `timestamp` (forces a fresh mount/animation per roll) with `initial={{ scale: 1.3 }} animate={{ scale: 1 }}` and a `boxShadow`/background pulse — gold-tinted (`rgba(234,179,8,...)`) for a natural 20, red-tinted (`rgba(220,38,38,...)`) for a natural 1. Non-d20 rolls and non-crit d20 rolls render exactly as today, no animation.
- **Resource-spend pulse**: triggers specifically on (a) entering Rage via `toggleRageActive()` — not on exiting it, since exiting isn't a "success" moment worth calling out — and (b) a successful `spendStoneEndurance()`/`spendHealerKit()` call (i.e., only when `remaining > 0` before the call, matching the existing spend-guard; a no-op tap on a depleted resource does not pulse). Briefly scale-pulse the card/button that was tapped (`motion.div` wrapping the card, `animate={{ scale: [1, 1.05, 1] }}` one-shot transition triggered by a state toggle or a `key` bump). Purely visual — no change to the underlying spend logic already built in rounds 1-2.

## Section 5 — Print / PDF export

**Files:** Create `src/app/print/page.tsx`; modify `src/components/tabs/SettingsTab.tsx`; modify `src/app/globals.css`

- New static route `src/app/print/page.tsx` (Next.js `output: 'export'` supports additional static pages beyond the root). `"use client"`, reads the character the same way every other tab does — via `useCharacter()`/`CharacterContext`, since there is no separate data-fetching layer to design here.
- Condensed, single-column, print-optimized layout (no tabs, no nav, no interactive controls) covering: header (name, level, class, species, background), attributes + saves + skills (compact table, not the tap-to-roll cards), features + feats (level-gated, same filter as Section 2), attacks table, inventory list + currency. Read-only — no edit affordances, since printing is a point-in-time snapshot.
- `globals.css` gets an `@media print` block: on the print route specifically, hide anything not meant for paper (though the print page itself has no nav/tabs to hide in the first place, since it's a dedicated route, not an overlay on the existing tab shell) and set sane print margins/font sizes/black-on-white colors overriding the dark theme (dark backgrounds waste ink and often print poorly).
- Settings tab gets a new button ("Imprimir / Exportar PDF") that navigates to `/print` (a plain link/anchor is sufficient since this is static export — no client-side route params needed). The user then uses their browser/OS's native print dialog (iOS Safari: Share → Print → pinch out for PDF preview → Share → Save to Files; desktop: Cmd/Ctrl+P → Save as PDF) — no PDF-generation library is added to the project.
- **First route beyond the root**: this is architecturally novel for this codebase — CLAUDE.md describes the app as a single page with tabs rendered conditionally via state, not routes. Checked `public/sw.js`'s fetch handler: navigation requests are network-first (only the root `/index.html` is ever cached for the offline fallback), so hitting `/print` while online works with no special handling. **Known limitation**: if the device is fully offline, `/print` will fail to load (the SW's offline fallback only has `/index.html` cached) — acceptable, since printing while offline isn't a real use case, but worth being aware of rather than surprised by.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/tabs/SheetTab.tsx` | Add PB badge; add "Dotes" section; exclude feats from existing Features section |
| `src/components/tabs/InventoryTab.tsx` | Undo toast on item delete |
| `src/components/tabs/CombatTab.tsx` | Undo toast on condition removal; resource-spend pulse animation |
| `src/components/ui/DiceResult.tsx` | Crit/fumble pulse animation on natural 20/1 |
| `src/app/print/page.tsx` | New file — print-optimized character sheet view |
| `src/app/globals.css` | `@media print` rules |
| `src/components/tabs/SettingsTab.tsx` | New "Imprimir / Exportar PDF" button linking to `/print` |

## Explicitly Out of Scope

- Haptic feedback via `navigator.vibrate` — not supported on iOS Safari (the user's primary device), dropped in favor of Section 4's visual pulse
- Multi-character switching UI — storage already supports it via `mavok_character_<id>` keys, but not requested for this round
- Client-side PDF-generation library (e.g. jsPDF) — browser-native print-to-PDF is sufficient and avoids a new dependency
