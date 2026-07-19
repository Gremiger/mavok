# Combat Modals Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the 6 modals reachable from Combat tab (`Modal.tsx` chrome, `HpModal`, the inline AC/Temp HP modals, `AttackFormModal`) up to the component language established in `2026-07-19-combat-tab-redesign-design.md`, and fix a real bug — the Temp HP modal has no visible submit button today.

**Architecture:** No new shared components. Every change is either a class/token tweak to an existing element, or (for the Temp HP fix and AttackFormModal regroup) a small amount of new local JSX using components that already exist (`CollapsibleSection`). `StandardActionsModal` and the condition-picker modal need **zero code changes** — verified during spec review that both already meet every convention this round establishes — so they appear only in the final verification task, not as implementation tasks.

**Tech Stack:** Next.js 15, React, Tailwind CSS v4, Vitest.

## Global Constraints

(From the spec — every task's work implicitly includes these.)

- The `Modal.tsx` header stays **exactly as it is today** — it already has `border-b border-border` separating it from scrollable content; that's correct, not a bug. Do not apply `stone-card` to it.
- Combine `stone-card`'s texture with strong dialog elevation via **two different CSS properties** (`box-shadow` from `stone-card`, `filter: drop-shadow(...)` via Tailwind's `drop-shadow-2xl` utility) — never stack two competing `box-shadow` declarations on the same element and expect them to merge; they don't, one silently wins.
- Small inline controls (HpModal's mode switcher, quick-add buttons, AC modifier's ± stepper) get `rounded-full` and stay their own local button styles — do **not** reroute them through `GhostChip` or `CompactRow`, which don't fit their shape (multi-color, `flex-1`, or grid-cell content).
- In `AttackFormModal`, only the **Mastery** group becomes a `CollapsibleSection` (optional field). Básico/Daño/Propiedades are always-relevant fields and get plain non-interactive labeled dividers — no tap-to-reveal added to the required path.
- `CombatTab.tsx` has a known hook-ordering footgun (many hooks before `if (!character) return null`) — any new hook added in Task 3 must be declared alongside the existing ones, before the guard. `npm run lint` is mandatory on every task touching that file.

---

## Task 1: Modal.tsx chrome

**Files:**
- Modify: `src/components/ui/Modal.tsx`

**Interfaces:** No prop or behavior changes — same `open`/`onClose`/`title`/`children` interface every modal already uses.

- [ ] **Step 1: Update the dialog's className**

Replace the dialog's `className` (currently `"fixed inset-0 m-auto bg-card text-foreground rounded-xl p-0 w-[90vw] max-w-md max-h-[85vh] overflow-y-auto border border-border shadow-xl"`) with:

```tsx
      className="fixed inset-0 m-auto stone-card text-foreground rounded-xl p-0 w-[90vw] max-w-md max-h-[85vh] overflow-y-auto drop-shadow-2xl"
```

`bg-card` and `border border-border` are dropped because `stone-card` (in `globals.css`) already declares its own `background` gradient and `border: 1px solid var(--border-color)` — keeping the Tailwind versions would be redundant, not conflicting, but there's no reason to keep dead classes. `shadow-xl` is replaced by `drop-shadow-2xl`: `stone-card` sets `box-shadow` (its subtle inset-highlight pairing), and Tailwind's `drop-shadow-*` utilities set `filter: drop-shadow(...)` — a **different CSS property** — so the two compose naturally instead of one silently overriding the other the way two competing `box-shadow` values would. `rounded-xl` stays; `stone-card` doesn't set `border-radius`, so it's independent.

The header block immediately below (`<div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-card z-10">`) is **not touched** — leave it exactly as-is.

- [ ] **Step 2: Verify build and lint**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all pass, no new warnings.

- [ ] **Step 3: Manual verification in browser**

Run `npm run dev`, open Combate, tap HP to open `HpModal` (the only modal that exists as of this task — others aren't touched yet, but this one already renders through the shared `Modal.tsx`). Confirm across `piedra-viva`, `pergamino`, `furia-de-sangre`:
- The dialog body shows the same subtle gradient texture every other card has.
- The header stays flat, still visibly separated from the body by its existing bottom border — no seam, no double border.
- The dialog reads as clearly elevated above the dark backdrop (compare against how it looked before this change — it should look at least as elevated, not flatter).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Modal.tsx
git commit -m "style: give Modal.tsx dialog chrome the stone-card texture"
```

---

## Task 2: HpModal button radius

**Files:**
- Modify: `src/components/combat/HpModal.tsx`

**Interfaces:** No changes — same props, same `apply()` logic.

- [ ] **Step 1: Update the mode-switcher buttons**

In `HpModal.tsx`, change the mode-switcher button's className (currently `` `flex-1 py-2 rounded-lg text-sm font-heading transition-colors ${...}` ``) to:

```tsx
              className={`flex-1 py-2 rounded-full text-sm font-heading transition-colors ${
```

(only `rounded-lg` → `rounded-full` changes; the rest of the template string, including the three-color active-state ternary, is unchanged — these buttons stay their own local style precisely because they need three different active colors `GhostChip` can't represent.)

- [ ] **Step 2: Update the quick-add buttons**

Change the `+1`/`+5`/`+10` button's className (currently `"flex-1 py-2 bg-card border border-border rounded-lg text-sm text-foreground active:scale-95 transition-transform"`) to:

```tsx
              className="flex-1 py-2 bg-card border border-border rounded-full text-sm text-foreground active:scale-95 transition-transform"
```

- [ ] **Step 3: Verify build and lint**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all pass.

- [ ] **Step 4: Manual verification in browser**

Open HpModal, confirm the mode switcher (Daño/Curar/Temp HP) and the +1/+5/+10 buttons are now pill-shaped, the three mode colors (danger/success/accent) still show correctly when active, and tapping still applies the right value. Check all 3 themes.

- [ ] **Step 5: Commit**

```bash
git add src/components/combat/HpModal.tsx
git commit -m "style: round HpModal's mode switcher and quick-add buttons to pills"
```

---

## Task 3: AC modifier modal button radius + Temp HP modal submit fix

**Files:**
- Modify: `src/components/tabs/CombatTab.tsx`

**Interfaces:** No new props anywhere in the app — `applyTempHp` is a new local function plus one new `useRef`, both scoped to `CombatTab`.

- [ ] **Step 1: Round the AC modifier's ± buttons**

In `CombatTab.tsx`, find the AC Temp Modifier Modal block (search for `"Modificador temporal de AC"`). Change both stepper buttons' className from:

```tsx
              className="w-12 h-12 rounded-lg bg-card border border-border text-xl font-heading text-foreground active:scale-95 transition-transform"
```

to:

```tsx
              className="w-12 h-12 rounded-full bg-card border border-border text-xl font-heading text-foreground active:scale-95 transition-transform"
```

(applies to both the `−` and `+` buttons; the `text-3xl` modifier readout between them and the "Resetear a 0" button are unchanged.)

- [ ] **Step 2: Add a ref and apply function for the Temp HP modal**

Add a new `useRef` alongside `CombatTab`'s other hooks — immediately after the existing `const dadosSectionRef = useRef<HTMLDivElement>(null);` line, still before the `if (!character) return null` guard:

```tsx
  const tempHpInputRef = useRef<HTMLInputElement>(null);
```

Add a new function near the other combat-action functions (e.g. right after `function toggleInspiration() { ... }`):

```tsx
  function applyTempHp() {
    const val = parseInt(tempHpInputRef.current?.value ?? "");
    if (!isNaN(val) && val >= 0) {
      updateCombat({ tempHp: val });
      setTempHpInput(false);
    }
  }
```

This is the actual bug fix: today, applying a Temp HP value only happens via the `onKeyDown` Enter handler inline in the modal JSX, reading `e.target.value` directly — there's no button, so on a mobile numeric keypad without an Enter/Go key, this modal has no way to submit at all. Pulling the apply logic into a named function lets both the existing Enter-key shortcut and a new visible button call the same code.

- [ ] **Step 3: Wire the ref, update the keydown handler, and add the Aplicar button**

Replace the Temp HP Input Modal block:

```tsx
      {/* Temp HP Input Modal */}
      <Modal
        open={tempHpInput}
        onClose={() => setTempHpInput(false)}
        title="Temp HP"
      >
        <div className="space-y-3">
          <input
            type="number"
            inputMode="numeric"
            defaultValue={combat.tempHp}
            className="w-full bg-background border border-border rounded-lg p-3 text-center text-2xl font-heading text-foreground"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = parseInt((e.target as HTMLInputElement).value);
                if (!isNaN(val) && val >= 0) {
                  updateCombat({ tempHp: val });
                  setTempHpInput(false);
                }
              }
            }}
          />
          <p className="text-xs text-muted text-center">
            Los Temp HP no se acumulan — se usa el valor más alto
          </p>
        </div>
      </Modal>
```

with:

```tsx
      {/* Temp HP Input Modal */}
      <Modal
        open={tempHpInput}
        onClose={() => setTempHpInput(false)}
        title="Temp HP"
      >
        <div className="space-y-3">
          <input
            ref={tempHpInputRef}
            type="number"
            inputMode="numeric"
            defaultValue={combat.tempHp}
            className="w-full bg-background border border-border rounded-lg p-3 text-center text-2xl font-heading text-foreground"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") applyTempHp();
            }}
          />
          <p className="text-xs text-muted text-center">
            Los Temp HP no se acumulan — se usa el valor más alto
          </p>
          <button
            onClick={applyTempHp}
            className="w-full py-3 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
          >
            Aplicar
          </button>
        </div>
      </Modal>
```

- [ ] **Step 4: Verify build, lint, and tests**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass. Lint is mandatory here per Global Constraints — this step adds a new hook to `CombatTab.tsx`.

- [ ] **Step 5: Manual verification in browser**

- AC modal: confirm ± buttons are now circular pills, still adjust the modifier, "Resetear a 0" still works.
- Temp HP modal: **this is the bug fix, verify it directly** — open the modal, type a value, tap the new "Aplicar" button (not just press Enter), confirm it applies and the modal closes. Then verify the Enter-key shortcut still works too. Check on an actual phone viewport if possible, since the missing button was specifically a mobile-keyboard problem.
- Check all 3 themes.

- [ ] **Step 6: Commit**

```bash
git add src/components/tabs/CombatTab.tsx
git commit -m "fix: add missing submit button to Temp HP modal, round AC modal buttons"
```

---

## Task 4: AttackFormModal regroup

**Files:**
- Modify: `src/components/combat/AttackFormModal.tsx`

**Interfaces:** No changes to `onSave`, `existingAttack`, `initialWeaponName`, `initialDisplayName`, or the `Attack` object shape produced — this is a layout regrouping of existing fields only.

- [ ] **Step 1: Import `CollapsibleSection`**

Add to `AttackFormModal.tsx`'s imports:

```tsx
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
```

- [ ] **Step 2: Regroup the field list**

Replace the body of the `<Modal>` (everything from `<div className="space-y-3">` through the closing `</div>` right before the save `<button>`, i.e. the "Arma rápida" select through the `masteryEffect` textarea) with:

```tsx
      <div className="space-y-4">
        {!existingAttack && (
          <div>
            <label className="text-xs text-muted">Arma rápida</label>
            <select
              onChange={(e) => {
                if (e.target.value) prefillFromWeapon(e.target.value);
                e.target.value = "";
              }}
              className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground mt-1"
              defaultValue=""
            >
              <option value="">Elegir arma...</option>
              {WEAPONS.map((w) => (
                <option key={w.name} value={w.name}>
                  {w.name} ({w.damage} {w.damageType})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs text-muted uppercase tracking-wide">Básico</p>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nombre"
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={form.attackBonus}
              onChange={(e) =>
                setForm({ ...form, attackBonus: e.target.value })
              }
              placeholder="Bono de ataque"
              className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            />
            <input
              value={form.range}
              onChange={(e) => setForm({ ...form, range: e.target.value })}
              placeholder="Alcance (ej. 5 ft)"
              className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            />
          </div>
        </div>

        <div className="space-y-2 border-t border-border/30 pt-3">
          <p className="text-xs text-muted uppercase tracking-wide">Daño</p>
          <div className="flex gap-2">
            <input
              value={form.damage}
              onChange={(e) => setForm({ ...form, damage: e.target.value })}
              placeholder="Daño (ej. 1d6+3)"
              className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            />
            <input
              value={form.damageType}
              onChange={(e) =>
                setForm({ ...form, damageType: e.target.value })
              }
              placeholder="Tipo de daño"
              className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            />
          </div>
          <input
            value={form.versatileDamage}
            onChange={(e) =>
              setForm({ ...form, versatileDamage: e.target.value })
            }
            placeholder="Daño versátil (opcional, ej. 1d10)"
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
        </div>

        <div className="space-y-2 border-t border-border/30 pt-3">
          <p className="text-xs text-muted uppercase tracking-wide">Propiedades</p>
          <input
            value={form.properties}
            onChange={(e) => setForm({ ...form, properties: e.target.value })}
            placeholder="Propiedades (separadas por coma)"
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
        </div>

        <CollapsibleSection
          title="Mastery"
          defaultOpen={!!existingAttack?.mastery}
        >
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                value={form.mastery}
                onChange={(e) => setForm({ ...form, mastery: e.target.value })}
                placeholder="Mastery (opcional)"
                className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
              />
              <input
                type="number"
                inputMode="numeric"
                value={form.masterySaveDC}
                onChange={(e) =>
                  setForm({ ...form, masterySaveDC: e.target.value })
                }
                placeholder="Mastery DC (opcional)"
                className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
              />
            </div>
            <textarea
              value={form.masteryEffect}
              onChange={(e) =>
                setForm({ ...form, masteryEffect: e.target.value })
              }
              placeholder="Efecto de mastery (opcional)"
              rows={2}
              className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
            />
          </div>
        </CollapsibleSection>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
        >
          {existingAttack ? "Guardar" : "Agregar"}
        </button>
      </div>
```

Every field, placeholder, and `onChange` handler is copied verbatim from the current file — only the grouping/labels/`CollapsibleSection` wrapper are new. Note `CollapsibleSection` itself renders a `cord-line pl-4` decorative left border on the Mastery group specifically — that's intentional here (it's the one group that's genuinely optional and benefits from being visually set apart), not a leftover from the rejected "wrap everything" approach.

- [ ] **Step 3: Verify build, lint, and tests**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 4: Manual verification in browser**

- Tap "+ Agregar ataque" (new attack): confirm Básico/Daño/Propiedades are all visible immediately (no expand needed), Mastery starts collapsed.
- Edit an attack with a mastery (Maul, which has Topple per `src/data/mavok-default.ts`): confirm Mastery starts **expanded**.
- Edit an attack without mastery (Javelin or Sickle): confirm Mastery starts collapsed.
- Fill out a new attack end-to-end and save; confirm it appears correctly in the Acciones list with the right stats.
- Check all 3 themes.

- [ ] **Step 5: Commit**

```bash
git add src/components/combat/AttackFormModal.tsx
git commit -m "style: regroup AttackFormModal fields, collapse Mastery when unused"
```

---

## Task 5: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full verification command**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all pass, 0 lint errors.

- [ ] **Step 2: Confirm the two untouched modals still meet every convention**

Open the condition picker (tap `+` next to conditions in Combat tab) and `StandardActionsModal` (tap "Acciones estándar" / "Bonus Actions estándar" / "Reacciones estándar"). Per the spec, **no code changes were made to either** — confirm that's actually true by inspection: condition-grid buttons are `text-sm`/group labels `text-xs`, both already above the 11px floor; `StandardActionsModal`'s cards already use `stone-card` + accent heading + muted description. If anything here actually looks inconsistent with the rest of this round, that's a spec-verification miss to flag, not something to silently patch.

- [ ] **Step 3: Full walkthrough across all 3 themes**

On `piedra-viva`, `pergamino`, `furia-de-sangre`, open every one of the 6 modals and confirm:
- Chrome: `stone-card` texture, unchanged header, strong elevation against the backdrop (Task 1).
- HpModal: pill-shaped mode switcher (3 correct colors) and quick-add buttons (Task 2).
- AC modal: circular ± buttons (Task 3).
- **Temp HP modal: the Aplicar button works** — this is the one real bug fix in this round, worth re-confirming here even though Task 3 already verified it (Task 3).
- AttackFormModal: correct default expand/collapse state for Mastery depending on whether the attack being edited has one (Task 4).
- Condition picker and StandardActionsModal: unchanged, still correct (Step 2 above).

- [ ] **Step 4: Final commit (if Step 2/3 surfaced anything)**

If the walkthrough found nothing to fix, this task produces no diff and needs no commit. If it did, fix it, re-run Step 1, and commit with a message describing exactly what the walkthrough caught.
