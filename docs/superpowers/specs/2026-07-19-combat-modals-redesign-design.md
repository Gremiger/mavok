# Combat Modals Redesign (UI Redesign Phase 2) — Design

## Context

Phase 1 (`2026-07-19-combat-tab-redesign-design.md`) restyled `CombatTab.tsx`'s body but explicitly left every modal untouched. Since all six modals already route through the shared `Modal.tsx` wrapper, and that wrapper already consumes the refreshed palette tokens from Phase 1, their *colors* already updated automatically — what's left is bringing their *component language* (button shapes, row density, text sizing) in line with the rest of the redesign, plus regrouping `AttackFormModal`'s one long flat form.

This spec was itself caught making the same mistake Phase 1 made in its first drafts: an early version of this design proposed reusing `GhostChip` and `CompactRow` for controls they don't actually fit — `GhostChip` is content-sized and single-accent-colored, but `HpModal`'s mode switcher is a `flex-1` three-way control with three *different* semantic colors (danger/success/accent), and `CompactRow`'s name+meta+right-slot shape doesn't fit a 2-column condition grid or `StandardActionsModal`'s paragraph-length reference cards. That reuse-by-force approach is dropped below in favor of applying shared *tokens* (radius, font floor, tap sizing) to purpose-built local styles instead of forcing every control through the same two components.

The six modals in scope, all reachable from `CombatTab.tsx`: `HpModal.tsx`, `AttackFormModal.tsx`, `StandardActionsModal.tsx` (each their own file), plus the AC-modifier modal, Temp HP modal, and condition-picker modal, which exist as inline `<Modal>` blocks directly inside `CombatTab.tsx` rather than separate files.

## 1. Modal chrome (`Modal.tsx`)

The dialog body moves from flat `bg-card` to the `stone-card` texture used everywhere else. Two things this is *not*, both caught by checking the real markup and `stone-card`'s actual CSS before assuming a drop-in class swap:

- **The header does not need to change.** It already has `border-b border-border` separating it from the scrollable content below — that's a normal, intentional sticky-toolbar pattern, not a bug. Giving the header its own `stone-card` background (an earlier draft of this spec proposed exactly that) would actively break something: `stone-card` declares its own `border` and `box-shadow`, so applying the full class to a header nested inside an already-`stone-card` dialog doubles both. The header stays flat `bg-card`, unchanged.
- **`shadow-xl` doesn't just get dropped.** `stone-card`'s own `box-shadow` (`inset 0 1px 0 rgba(255,255,255,.04), inset 0 -1px 0 rgba(0,0,0,.2), 0 1px 3px rgba(0,0,0,.2)`) is a subtle inset pairing meant for a card sitting flush in a page's flow — not enough elevation for a dialog floating over a 70%-opacity backdrop (`dialog::backdrop` in `globals.css`). Replacing `shadow-xl` with that subtle shadow would make every modal read flatter than it does today. Instead, write an explicit combined `box-shadow` on the dialog: `stone-card`'s two inset lines (for the same textured-surface feel as every other card) plus a strong outer shadow for elevation (e.g. `0 20px 25px -5px rgba(0,0,0,.35)`, in the same weight class as the `shadow-xl` being replaced) — both together, not one replacing the other.

Border and text-color tokens (`border-border`, `text-foreground`, `text-accent` on the title) are already correct and unchanged.

## 2. Per-modal styling

- **HpModal** (`HpModal.tsx`): the Daño/Curar/Temp HP mode switcher and the +1/+5/+10 quick-add buttons stay their own local button styles — not `GhostChip` — since the mode switcher's three active states are genuinely three different colors (`bg-danger`/`bg-success`/`bg-accent`) and both controls are `flex-1` (fill the row), which `GhostChip` (content-sized) doesn't support. What changes: `rounded-lg` → `rounded-full` on both (matching the pill language established in Phase 1) and the 11px font floor applied to their labels. The "Aplicar" button stays a large `rounded-lg` hero button — that's a deliberate size/shape distinction between a primary submit action and small option controls, not an oversight.
- **AC modifier modal** (inline in `CombatTab.tsx`): the ± stepper buttons (currently `w-12 h-12 rounded-lg`) become `rounded-full` circles, keeping their size and the `text-3xl` modifier readout between them. "Resetear a 0" stays a plain bordered button, unchanged.
- **Temp HP modal** (inline in `CombatTab.tsx`) — **bug fix, not just restyle**: today this modal has no visible submit control at all — applying a value depends entirely on pressing Enter inside a `type="number"` input, and mobile numeric keypads frequently have no Enter/Go key, meaning this flow may be unusable on a phone. Add an explicit "Aplicar" button below the input, styled identically to `HpModal`'s (`w-full py-3 bg-accent text-white rounded-lg font-heading`), wired to the same apply logic the `Enter` keydown handler already calls — the keydown handler stays as a shortcut, it just stops being the *only* way to submit.
- **Condition picker modal** (inline in `CombatTab.tsx`): the existing 2-column grid of condition-name buttons keeps its current structure and its current `rounded-lg` corners (not `CompactRow` — that component's name+meta+right-slot shape doesn't fit a plain short-label grid button; and not `rounded-full` — these are variable-width grid cells with text labels, not short pill content, so the pill radius used elsewhere would look stretched/odd here). Only the 11px font floor applies; the existing `opacity-50` treatment for already-added conditions is unchanged.
- **StandardActionsModal** (`StandardActionsModal.tsx`): on review, these cards already use `stone-card`, an accent-colored heading, and muted description text — they're already consistent with the redesign system. No structural change; only a pass to confirm no text falls below the 11px floor (the sub-item description text at `text-xs`/`text-muted` is already above it, so this is expected to be a no-op check, not an actual edit).

## 3. AttackFormModal restructure

The current 11-field flat list groups into labeled sections — but not all groups are the same kind of thing, and treating them identically was a mistake in an earlier draft of this spec:

- **Arma rápida** — the weapon quick-select dropdown, add-mode only (`!existingAttack`), unchanged placement above the grouped sections.
- **Básico** (nombre, bono de ataque, alcance), **Daño** (daño, tipo de daño, daño versátil), and **Propiedades** (the properties comma-list field) are fields every attack needs, every time. These get a **plain, non-interactive labeled divider** — a small uppercase label (matching the existing `text-xs text-muted uppercase` convention already used for e.g. "Arma rápida") above each group, no expand/collapse chrome. Making required fields tap-to-reveal would slow down the one thing this modal exists to do. They also skip `CollapsibleSection`'s `cord-line`/knot decoration — that motif was designed for Combat tab's few, wide, full-viewport sections, and repeating it 5 times in a ~448px-wide modal is a different visual density than it was built for.
- **Mastery** (mastery, DC, efecto) is genuinely optional — real Mavok data shows most attacks (Javelin, Sickle) have none — so this is the one group that uses `CollapsibleSection`, with `defaultOpen={!!existingAttack?.mastery}`: editing an attack that already has a mastery shows it open, everything else starts collapsed.

Field behavior, validation, and the `onSave`/`prefillFromWeapon` logic are unchanged — this is a layout regrouping of existing fields, not a form redesign.

## Out of scope (this spec)

- Extending `GhostChip` or `CompactRow` to cover the controls in §2 — deliberately rejected above in favor of local styles sharing tokens, not components.
- The other 4 tabs (Ficha, Inventario, Notas, Enciclopedia, Ajustes) and the `dark-fantasy` theme — still deferred from Phase 1, unrelated to this round.
- Any new modal content, fields, or validation rules beyond the Temp HP submit-button fix in §2.

## Verification

`npx tsc --noEmit && npm run build && npm run lint && npm test` must pass. Manually verify in the dev server across all three redesigned themes (`piedra-viva`, `pergamino`, `furia-de-sangre`):

- Every modal opens with the `stone-card` texture on its body, the header unchanged (flat, still separated by its existing `border-b`), and a visibly strong elevation shadow against the dark backdrop — not the flatter look a plain `stone-card`-only shadow would produce.
- HpModal: mode switcher still shows three distinct colors when active, +1/+5/+10 still adjust the amount, Aplicar still applies correctly for damage/heal/temp.
- AC modal: ± stepper still adjusts the modifier, Resetear still resets to 0.
- **Temp HP modal: confirm the new Aplicar button actually applies the value** (this is the bug fix — verify it works via tap, not just Enter key, ideally on an actual phone viewport where the missing-submit-button bug would have been most visible).
- Condition picker: adding/removing conditions still works, already-added conditions still show disabled/dimmed.
- StandardActionsModal: all three filters (actions/bonus/reactions) still render correctly, nothing needed changing.
- AttackFormModal: Básico/Daño/Propiedades are always visible (no expand/collapse); adding a new attack starts with Mastery collapsed; editing an attack that has a mastery (e.g. Maul, which has Topple) opens with Mastery already expanded; saving/editing still produces the correct `Attack` object.
