# Combat Tab Redesign (UI Redesign Phase 1) — Design

## Context

This is phase 1 of a larger "fresh look" initiative for the app. Motivation is aesthetic, not a functional complaint — nothing about the current UI is broken. Scope was deliberately split: this spec covers the shared design system plus a redesign of `CombatTab.tsx` (the highest-stakes, most time-pressured tab, and the one already prototyped). The other five tabs (Ficha, Inventario, Notas, Enciclopedia, Ajustes) and a fourth theme direction are follow-up rounds that reuse the system defined here.

Directions were explored via rendered mockups (not just described) across four style concepts — three fantasy-flavored, one modern/non-fantasy. The modern direction ("Modern Tactical") got zero interest; all engagement was on the three fantasy directions, so **the app stays in the fantasy aesthetic space**. The user confirmed "keep 4 themes," so rather than inventing new theme slots, the three chosen directions become refinements of three *existing* theme slots:

| Direction | Refines existing theme | Character |
|---|---|---|
| A · Carved Stone & Cord | `piedra-viva` | Same soul as today, more refined: deeper texture, tighter type, better contrast. Evolution, not reinvention. |
| B · Illuminated Manuscript | `pergamino` | Parchment, ink, gold-leaf flourishes — a hand-kept adventuring journal. |
| C · Ink & Blood Grimoire | `furia-de-sangre` | Near-black, high contrast, sharp serif type, **one accent color only** (blood-red). Grim and minimal. |

`dark-fantasy` (the fourth slot) is explicitly **out of scope** — left as-is, refined in a later round.

Layout scope also grew mid-brainstorm: the user initially framed this as "just a fresh look" (skin only), then confirmed — after seeing a side-by-side mockup in the same palette — that the redesign should also restructure layout, not just recolor the existing stacked-card structure. A further "segmented sub-nav instead of scrolling sections" idea was raised and explicitly declined in favor of keeping the current scrollable-sections structure, just restructured and de-duplicated within it.

All mockups referenced below are preserved in `.superpowers/brainstorm/6015-1784431225/content/` for reference (`visual-style.html`, `layout-scope.html`, `combat-full.html`, `combat-v2.html`, `combat-fixes.html`).

## 1. Design tokens (shared system, all 3 themes)

No new custom property *names* are needed — every pattern below is built from the 7 tokens `globals.css` already defines per theme (`--bg`, `--card`, `--accent`, `--cord`, `--fg`, `--muted`, `--border-color`) plus the existing `--color-danger`/`--color-success` semantic colors.

**The token *values* do change, though** — this needs to be explicit, since an earlier draft of this section implied otherwise while the Context table above it already said "deeper texture, better contrast" for direction A. Those aren't compatible unless the underlying hex values move. The three approved mockup files are the literal source of truth for the new values (not this prose — don't re-derive colors from a text description):

- `piedra-viva` ← `.superpowers/brainstorm/6015-1784431225/content/combat-fixes.html`, `.prev-a`/`.fix-box` rules (background `#14100c`→`#241d16`, card gradient `#1a140e`→`#2a2016`, border `#4a3520`, accent-as-value-text `#c98a4b`, cord unchanged at `#a63d2f`).
- `pergamino` ← `visual-style.html`, `.prev-b` rules (background `#d9c396`→`#e8dcb8`, card `#f3e9cc`, border `#9c8a54`, accent `#7a1f1f`).
- `furia-de-sangre` ← `visual-style.html`, `.prev-c` rules (background `#0a0a0a`, card `#131313`, border `#2a2a2a`, single accent `#c23b2b`).

Implementation should extract exact values from those files' `<style>` blocks and update the corresponding `[data-theme="..."]` blocks in `src/app/globals.css` — treat this the same way `2026-07-04-new-themes-design.md` treated its palette table, just sourced from HTML instead of restated in Markdown, to avoid transcription drift between this doc and the approved mockups. **Verify text contrast** (`--fg`/`--muted` against `--bg`/`--card`) still holds at roughly WCAG AA (4.5:1 for body text) once the real values land, especially for `--muted` text at the §1 11px floor below — mockups were checked visually, not measured, and darker/richer tones can quietly fail contrast where the current flatter tones didn't.

Two rules govern how new components use these tokens, both discovered by catching my own mistakes during mockup review:

- **"Modified state" (a stat isn't at its default value — AC has a temp modifier, a resource has non-default charges) reuses the existing `StatBadge` convention: `border-accent`/`!border-accent/50`.** Do not invent a new hue (an earlier mockup pass used a hardcoded amber for this and it broke theme C's one-accent rule — caught and reverted). `--accent` *is* theme C's one allowed accent, so this is compliant by construction, not by exception.
- **"Active/urgent state" (Rage is currently active) keeps the existing distinct treatment**: `border-cord/50` + `shadow-[0_0_16px_rgba(...cord...)]`, exactly as `CombatTab.tsx`'s top bar already does today for `rageActive`. Cord and accent are deliberately different tokens for different meanings (ambient "this is non-default" vs. urgent "this is on right now") — don't collapse them.
- **Granted-action / magic-item resources (e.g. a "Bufanda de Furia" charge) are distinguished by icon (⚡) prefix, never by a new color.** Same reasoning as above — introducing a semantic color for "magic" would be a second accent hue in theme C.
- **Minimum readable text size is 11px (~0.6875rem) for anything that's a sentence fragment or number** (attack damage, resource counts, hint text). Short single-word uppercase labels (`CA`, `Temp`, `Insp`) may stay smaller since they're not read character-by-character. An earlier pass had meta/hint text down at ~9-9.5px, which works against the whole point of restructuring (faster to scan mid-combat) and gets fixed here.
- **Minimum tappable row height is 40px**, achieved via padding, not by shrinking text to fit more rows on screen. Visual density comes from tighter vertical rhythm between rows, not from undersized touch targets — mid-combat mis-taps are worse than a slightly longer scroll.

## 2. Vitals header (new component, replaces the current `flex items-center justify-around` stat-badge row)

Persistent card at the top of the tab (`stone-card`-equivalent styling per theme) containing:

- **HP** (large, primary) — tap opens the existing `HpModal`, unchanged behavior.
- **AC ring** — a circular badge instead of a `StatBadge`. Shows the AC number only; when `tempAcMod !== 0`, the ring gets the modified-state border treatment (§1) plus a small corner badge showing the signed modifier (e.g. `+2`). When `magicItemIndicator === "explicit-tag"` and `sumMagicBonus(character, "ac") !== 0` (today's `✦+N` suffix on the AC `StatBadge`), the ring shows a small `✦` mark in its other corner — same rule as today, just repositioned from inline text to a corner mark so it survives the ring shape. Tap still opens the existing AC modal — the ring's job is to signal "this is modified" at a glance, not to fit the full `17 (+2) ✦+1` string that `StatBadge` currently renders as text.
- **Rage cluster** — see §3, replaces the current always-visible `RageTracker` component's role but keeps its underlying `onToggleSlot`/`onToggleActive` handlers.
- **Secondary row**: Temp, Init, Insp, Vel as small stat chips below the primary row — same data as today's `StatBadge` row, condensed. Vel keeps its existing reduced-speed display (`20 (-10)`) when `exhaustionLevel > 0`; that state gets the modified-state border treatment too.
- **Dying state**: when `combat.currentHp === 0`, the header swaps its primary row (not the whole card) for a death-saves layout — a "Muriendo" label, 3 success dots + 3 failure dots (reusing `--color-success`/`--color-danger`, both already-defined tokens), and a "Recobrar consciencia" action wired to the existing `onRegainConsciousness` handler. The secondary row and rage cluster stay visible underneath, matching current behavior where `RageTracker` always renders regardless of dying state.

## 3. Rage cluster

Verified against `src/data/barbarian-progression.ts` (the actual XPHB progression data, not assumption): rage uses go 2→3→4→5→6 from level 1 to 20 — **there is no "unlimited rage" tier in this app's ruleset** (that's a 2014-edition mechanic; 2024/XPHB caps at 6). An earlier mockup pass designed for an "∞" state that can never occur — dropped.

- **≤4 total slots**: individual pips (filled/empty circles), each tappable to toggle that specific slot — same semantics as today's `toggleRageSlot`.
- **5-6 total slots**: pips collapse to a single numeral badge (`used/total`, e.g. `2/6`) to avoid cramming 6 small circles into the header row. Tapping the badge opens the same slot-editing interaction pips would (exact UI for that — inline expansion vs. a small popover — is an implementation detail, not specified further here).
- **Flame icon toggle** (🔥, filled + glow when active) sits beside the pips/badge and drives `onToggleActive` — this is now the *only* control for activating/deactivating Rage. The previous mockup pass had three redundant Rage controls (header pips, a "Furia" quick-action, and a Rage row inside "Acciones adicionales"); the quick-action and the Adicionales row are both **removed**, since the header is always visible and needs no shortcut duplicating itself.

## 4. Quick-actions row

Two items only, directly below the vitals header:

- **⚔ Atacar** triggers the same roll as tapping the value chip of `attacks[0]` (the first attack in display order — the same ordering `moveAttack` already controls) — not a picker, not "open the Acciones section." This saves a scroll past conditions/exhaustion for the single highest-frequency roll in combat. **When `attacks.length === 0`, this quick action is hidden**, not shown disabled — a character with no attacks defined yet is already served by the "+ Agregar ataque" row in Acciones, and a dead/disabled shortcut adds visual noise without a path forward.
- **🎲 Roll rápido** does not open a modal (the dice roller has never been a modal in this app). It auto-expands the "Dados" `CollapsibleSection` if collapsed and scrolls it into view — the same underlying `DiceRoller` component, just brought to the user instead of making them scroll to the last section in the tab.

The original 4-item version also included Furia and Curar; both were cut as redundant once Rage moved fully into the header and Healer's Kit (positioned first in the Acciones section, right below the fold) didn't need a duplicate entry point.

## 5. Conditions & exhaustion

Unchanged from current behavior/data flow (`combat.conditions`, tag list with a trailing `+` to open the existing condition-picker modal; `combat.exhaustionLevel` counter with expand-to-description). Only the visual container styling changes to match the new palette — no interaction changes.

## 6. Section content (Acciones / Adicionales / Reacciones / Dados)

The four `CollapsibleSection`s stay — the "segmented sub-nav instead of scrolling" alternative was raised and declined. Each section's rows become a denser "compact row" pattern (`crow`) instead of today's individually-styled cards, sized to the §1 minimums:

- **Attack rows** (Acciones): name + edit icon (✎, opens `AttackFormModal`) on the left, `+N · dice+mod` value chip (rolls) on the right. A dashed "+ Agregar ataque" row follows the list, same placement/behavior as today.
- **Resource rows** (Healer's Kit in Acciones; Stone's Endurance in Reacciones): single ghost-style chip reading `usar · remaining/total`. Tap uses a charge (existing `spendHealerKit`/`spendStoneEndurance`); long-press enters the existing manual-edit mode (`healerKitEditing`/`stoneEnduranceEditing`) via the existing `useLongPress` hook (`stoneEnduranceLongPress`/`healerKitLongPress`) and its `wasLongPress()` guard — both interactions already exist in `CombatTab.tsx`, this only restyles them. The existing `framer-motion` scale-pulse on successful use (`ragePulseKey`/`stoneEndurancePulseKey`/`healerKitPulseKey`) carries over onto the restyled row — it's a small but deliberate piece of feedback polish, not something to drop in the restructure. A small hint line ("mantener pulsado para corregir el conteo") sits under each on first use of the pattern so the long-press affordance isn't hidden.
- **Granted-action rows** (equipped magic items via `getEquippedGrantedActions`): same ghost-chip pattern, `⚡` prefix per §1, charge count when the item has one.
- **Offhand attack card**: stays in "Adicionales" (matches current placement under Bonus Actions), rendered as a dimmed/informational row since it applies automatically rather than being tapped.
- **Reckless Attack, Opportunity Attack**: same compact-row treatment, unchanged toggle/informational behavior.
- **"Acciones estándar" / "Bonus Actions estándar" / "Reacciones estándar" links**: unchanged dashed link-row pattern, opening the existing `StandardActionsModal`.
- **Dados section**: unchanged `DiceRoller` component, restyled container only.

## 7. Component boundaries

- **Vitals header, quick-actions row, and rage cluster are new components** (e.g. `CombatVitals.tsx`, `RageCluster.tsx` — exact naming is the implementation plan's call), since they combine data/behavior currently spread across the top-bar JSX and `RageTracker.tsx` into one persistent unit. `RageTracker.tsx` itself is superseded by the new rage cluster rather than reused underneath it — the pip/badge-mode switch at 5+ slots (§3) is new behavior `RageTracker` doesn't have today.
- **`StatBadge.tsx` stays** for the secondary row (Temp/Init/Insp/Vel) — "condensed" in §2 means smaller padding/min-width via props or a variant, not a new component, since its `highlight` prop already maps directly onto the §1 modified-state convention.
- **`DeathSaves.tsx` stays**, restyled to fit inside the vitals header's primary-row slot instead of the whole top bar — its `successes`/`failures`/`onChange`/`onRegainConsciousness` interface is unchanged.
- **`AttackRow.tsx`, `GrantedActionCard.tsx`, `CollapsibleSection.tsx`, `Tag.tsx`, `DiceRoller.tsx` all stay**, restyled in place to the compact-row/§1 tokens — none of them change props or behavior, only markup/classes.

## 8. Implementation risk: hook ordering

`CombatTab.tsx` currently declares roughly 15 `useState` calls (plus two `useLongPress` calls) before its `if (!character) return null` guard. This spec restructures a large fraction of that component's render tree, which is exactly the situation this project's own `CLAUDE.md` calls out as a recurring real bug: it's tempting to add a new hook (e.g. state for the rage-badge popover mentioned in §3, or for scroll-to-Dados in §4) further down near the JSX that uses it, after the guard — that violates React's Rules of Hooks, and neither `tsc` nor `npm run build` catches it, only `npm run lint` (`react-hooks/rules-of-hooks`). Any new local state introduced by this redesign must be declared alongside the existing ones, before the guard. **Running `npm run lint` is not optional for this spec** the way it might be for a lower-risk change.

## Out of scope (this spec)

- **All modals** — `HpModal`, the AC temp-mod modal, Temp HP modal, condition picker, `AttackFormModal`, `StandardActionsModal`. They keep current layout/behavior for now; a follow-up round redesigns them to match the new tab-body language, since they're a large enough interaction surface to deserve their own pass rather than being squeezed in here.
- **The other 5 tabs** (Ficha, Inventario, Notas, Enciclopedia, Ajustes) — later rounds, reusing the tokens and row patterns defined in §1.
- **`dark-fantasy` theme** — left untouched; its refined replacement (the "4th direction") is a later round.
- **Segmented sub-navigation within Combat** — considered, explicitly declined; sections stay as scrollable collapsibles.
- **HP severity color-coding** (green/amber/red thresholds) — flagged during review as a plausible future enhancement since HP is the most-glanced stat, but it isn't part of the current app's behavior and wasn't requested, so it's not added here.
- **Toast styling** (`sonner` undo toasts on delete) — cosmetic follow-on, not blocking.

## Verification

`npx tsc --noEmit && npm run build && npm run lint && npm test` must pass. Since there's no component/UI test coverage for `CombatTab.tsx`, manually verify in the dev server across all three affected themes (`piedra-viva`, `pergamino`, `furia-de-sangre`):

- Vitals header renders correctly at HP full / HP partial / HP 0 (dying → death-saves layout swap, including reviving via "Recobrar consciencia").
- AC ring shows the modified-state treatment when a temp AC modifier is active, and the `✦` magic-bonus mark when applicable, in all 3 themes (confirm theme C doesn't pick up a second accent hue anywhere).
- **Glow/shadow treatments** (rage-active card glow, flame-toggle active glow) were only visually tuned against dark backgrounds during brainstorming. Check specifically on `pergamino` (the one light theme) — a colored `box-shadow` blur that reads as a glow on dark backgrounds can read as muddy or invisible on light ones; it may need a darker/harder shadow instead of a colored glow for that theme specifically, not just a token swap.
- Rage cluster: pip mode at a low level (2-4 rages) and badge mode at a high level (5-6 rages) both toggle slots and activate/deactivate correctly, with no leftover "Furia" quick-action or Adicionales row.
- Quick-actions row triggers the correct primary-attack roll and dice-roller open; "Atacar" is absent (not disabled) on a character with zero attacks defined.
- Attack edit icon opens `AttackFormModal`; value chip rolls; "+ Agregar ataque" adds a new attack.
- Healer's Kit and Stone's Endurance: tap spends a charge, long-press enters edit mode, in all 3 themes.
- Granted-action rows render for at least one equipped magic item with charges.
- All text remains legible (no sub-11px body/number text) and every interactive row meets the 40px minimum tap height, checked on an actual phone viewport, not just desktop browser resize.
