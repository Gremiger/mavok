# Mavok Round 6 Improvements — Design Spec
Date: 2026-07-03

## Overview

Twelve improvements across three categories: **Polish** (paying down accumulated debt — lint errors, a data-extraction bug, a rules-accuracy bug, and three round-4 leftovers), **UX/UI** (damage-type icons, attack reordering, a density toggle, read-more previews), and **Nice to Have** (a conditions quick-lookup, a one-page reference-card PDF). No `Character` schema changes — the only settings-shape addition is `AppSettings.density`, which isn't part of the versioned `Character` migration system.

---

## Polish

### 1. Lint debt cleanup

Three genuinely different root causes, three different fixes — not one mechanical pattern applied everywhere.

**`RageTracker.tsx`'s `Ember` component (4 errors, lines 20-31):** `Math.random()` is called directly inside JSX prop values (`animate`, `transition`, `style`), which re-evaluates — and produces a *different* random value — on every render, which is what `react-hooks/purity` objects to. Fix: compute the random offsets once per `Ember` instance via `useMemo(() => ({...}), [])`, then reference the memoized values in the JSX:

```typescript
function Ember({ delay }: { delay: number }) {
  const offsets = useMemo(
    () => ({
      xMid: (Math.random() - 0.5) * 30,
      xEnd: (Math.random() - 0.5) * 40,
      repeatDelay: Math.random() * 2,
      left: 30 + Math.random() * 40,
    }),
    []
  );
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-orange-400"
      initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -20, -40, -55],
        x: [0, offsets.xMid, offsets.xEnd],
        scale: [0, 1.5, 1, 0],
      }}
      transition={{
        duration: 1.8,
        delay,
        repeat: Infinity,
        repeatDelay: offsets.repeatDelay,
        ease: "easeOut",
      }}
      style={{
        left: `${offsets.left}%`,
        bottom: "10%",
        filter: "blur(0.5px)",
      }}
    />
  );
}
```

Since each `Ember` is keyed by `i` (`<Ember key={i} delay={i * 0.25} />`) and only ever mounted while `active` is true, each mounted instance gets its own stable random offsets for its lifetime — visually indistinguishable from today's constantly-reshuffling version, since the animation itself (the `animate` keyframe arrays) still loops via `repeat: Infinity`.

**`JournalList.tsx`'s prop-mirroring effect (line 30-32):** this effect exists purely to copy a prop (`initialOpenId`) into state (`viewingId`) — the textbook "you might not need an effect" anti-pattern React's own docs call out, since `JournalList` isn't remounted when `initialOpenId` changes (`NotesTab.tsx` passes it without a `key`, so the same instance receives a new prop value across re-renders when the user searches again and clicks a different result). The fix is React's documented "adjusting state when a prop changes" pattern — compare against the previous value *during render*, not in an effect:

```typescript
const [prevInitialOpenId, setPrevInitialOpenId] = useState(initialOpenId);
if (initialOpenId !== prevInitialOpenId) {
  setPrevInitialOpenId(initialOpenId);
  if (initialOpenId) setViewingId(initialOpenId);
}
```
Remove the now-unused `useEffect` import and the effect block entirely.

**`useCharacter.ts` (line 21) and `useTheme.ts` (line 12):** both read `localStorage` once on mount, inside a `useEffect`, *by design* — `localStorage` doesn't exist during this static-export app's build-time prerender pass (`storage.ts`'s `typeof window === "undefined"` guards exist precisely for this), so the read must be deferred until after client mount. This isn't a bug to architect around; it's the correct pattern for exactly this constraint. Per your decision, resolve the lint error with a scoped, justified suppression rather than a `useSyncExternalStore` retrofit (which would need custom same-tab event dispatching to stay reactive to this hook's own writes — real added complexity this single-user app doesn't need):

```typescript
// useCharacter.ts
useEffect(() => {
  const data = loadCharacter(id);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: localStorage is unavailable during the static-export build's prerender pass (see storage.ts's `typeof window === "undefined"` guards); this read must be deferred to after client mount, not computed during render.
  setCharacter(data ?? MAVOK_DEFAULT);
  setReady(true);
}, [id]);
```
(Same pattern for `useTheme.ts`'s `setTheme(settings.theme)` line — see Section 8 for the full rewritten hook, which also adds `density`.)

**Result:** `npm run lint` goes from 7 errors to 0. Update CLAUDE.md's "known/accepted debt" paragraph to remove the now-resolved bullet, or delete it entirely if nothing remains undocumented.

### 2. Lance weapon data bug

Root cause confirmed against the raw 5etools source (`../dnd/5etools-src/data/items-base.json`): Lance's `property` array is `["H|XPHB", "R|XPHB", {"uid": "2H|XPHB", "note": "unless mounted"}]` — the third entry is an **object**, not a string, representing 5etools's way of expressing a conditional property ("Two-Handed, unless mounted"). `scripts/extract-5etools.ts`'s property mapper (`extractWeapons()`) does:

```typescript
const props = rawProps.map((p: string) => {
  const abbr = typeof p === "string" ? p.split("|")[0] : String(p);
  return propAbbrevMap[abbr] || abbr;
});
```

`String(p)` on an object literal produces `"[object Object]"` — exactly the bug already showing up in `src/data/weapons.ts`'s Lance entry (`properties: ["Heavy", "Reach", "[object Object]"]`). Fix the mapper to extract `.uid` before splitting:

```typescript
const rawProps = (i.property as (string | { uid: string })[]) || [];
const props = rawProps.map((p) => {
  const raw = typeof p === "string" ? p : p.uid;
  const abbr = raw.split("|")[0];
  return propAbbrevMap[abbr] || abbr;
});
```

Rerun `npx tsx scripts/extract-5etools.ts` (regenerates all 7 data files, since it's a single script) and diff the result: expect the **only** change to be Lance's `properties` array (`"[object Object]"` → `"Two-Handed"`) in `src/data/weapons.ts`. If anything else changes, stop and investigate before committing — the 5etools source hasn't changed, so a wider diff would mean the script's fix has an unintended side effect elsewhere.

### 3. `rageBonus` range-exclusion fix

Confirmed against XPHB's actual Rage Damage text (`class-barbarian.json`): *"When you make an attack using Strength—with either a weapon or an Unarmed Strike—and deal damage to the target, you gain a bonus to the damage..."* — no melee-only restriction. The only text suggesting a melee/thrown distinction is "Crushing Throw," a feature of **Path of the Giant** (`subclassSource: "BGG"`, Bigby Presents: Glory of the Giants) — not one of the 4 XPHB subclasses this app supports, and irrelevant to Mavok's ruleset. `AttackRow.tsx`'s existing `rageBonus` computation has an extra exclusion that doesn't belong:

Find (`AttackRow.tsx`):
```typescript
const rageBonus = rageActive && isStrBased && !attack.range.includes("/") ? rageDamage : 0;
```
Replace with:
```typescript
const rageBonus = rageActive && isStrBased ? rageDamage : 0;
```

This makes Rage's damage bonus consistent with Reckless Attack's advantage (round 5), which already correctly has no such exclusion — both are Strength-based-attack rules with no RAW melee restriction.

### 4. Dynamic Weapon Mastery flavor text

`mavok-default.ts`'s static `"Weapon Mastery"` feature description (`"Conoce las propiedades de maestría de 2 armas: Maul (Topple) y Handaxe (Vex)."`) goes stale the moment a player uses round 5's Weapon Mastery swap — a documented, accepted limitation from that round. Fix it now: extract `WeaponMasteryModal.tsx`'s `baseWeaponName` helper into a new shared file, and compute the description live wherever it's displayed instead of storing it as static text.

Create `src/lib/weaponMatch.ts`:
```typescript
import { WEAPONS } from "@/data/weapons";
import type { Attack } from "./types";

export function baseWeaponName(attackName: string): string | null {
  const match = WEAPONS.find(
    (w) => attackName === w.name || attackName.startsWith(`${w.name} (`)
  );
  return match ? match.name : null;
}

export function describeWeaponMastery(attacks: Attack[]): string {
  const activeNames = Array.from(
    new Set(
      attacks
        .filter((a) => a.mastery !== null)
        .map((a) => baseWeaponName(a.name))
        .filter((n): n is string => n !== null)
    )
  );
  const parts = activeNames.map((name) => {
    const attack = attacks.find((a) => baseWeaponName(a.name) === name);
    return `${name} (${attack?.mastery})`;
  });
  const count = activeNames.length;
  return `Conoce las propiedades de maestría de ${count} arma${count === 1 ? "" : "s"}: ${parts.join(", ")}.`;
}
```

`WeaponMasteryModal.tsx` drops its local `baseWeaponName` function and imports it from here instead (behavior-identical refactor).

In `SheetTab.tsx`'s "Rasgos y características" render, special-case the "Weapon Mastery" feature by name:
```tsx
<p className="text-sm text-foreground/70 leading-relaxed">
  {f.name === "Weapon Mastery" ? describeWeaponMastery(attacks) : f.description}
</p>
```
This requires adding `attacks` to `SheetTab.tsx`'s existing `character` destructure (currently not read there).

### 5. Round-4 leftovers

Three small, previously-documented, previously-deferred fixes:

- **Undo-toast doesn't restore attack array position** (`CombatTab.tsx`): deleting an attack and tapping "Deshacer" currently calls `addAttack(a)`, which always appends to the end (`useCharacter.ts`'s `addAttack`: `attacks: [...c.attacks, attack]`), losing the original position. Fix: capture the index at delete time and reinsert there using the hook's already-exposed generic `update` function (no new hook API needed):
  ```typescript
  onDelete={() => {
    const index = attacks.findIndex((x) => x.id === a.id);
    removeAttack(a.id);
    toast(`${a.name} eliminado`, {
      action: {
        label: "Deshacer",
        onClick: () =>
          update((c) => {
            const next = [...c.attacks];
            next.splice(index, 0, a);
            return { ...c, attacks: next };
          }),
      },
    });
  }}
  ```
  Requires adding `update` to `CombatTab.tsx`'s existing `useCharacterContext()` destructure.

- **Portrait upload has no error handling / composites onto black** (`SettingsTab.tsx`'s `handlePortraitUpload`): `img.decode()` can reject (corrupt/unsupported file) with no user feedback today, and the canvas isn't given a background before `ctx.drawImage`, so a transparent PNG would render onto whatever the canvas's default (black) is. Fix: wrap in `try`/`catch` with a `toast.error`, and fill the canvas white first:
  ```typescript
  async function handlePortraitUpload(file: File) {
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = objectUrl;
      await img.decode();

      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - side) / 2;
      const sy = (img.naturalHeight - side) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, sx, sy, side, side, 0, 0, 400, 400);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      updateMeta({ portraitDataUrl: dataUrl });
    } catch {
      toast.error("No se pudo procesar la imagen");
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }
  ```

- **Level-up history uses array index as React key** (`SettingsTab.tsx`, the reversed `.map((entry, i) => ...)` list): switch to a stable composite key derived from the entry's own fields — `LevelUpHistoryEntry` has no `id`, but `level` + `date` together are unique in practice (a level is only ever reached once per level-down/up cycle, and each has a distinct timestamp):
  ```tsx
  key={`${entry.level}-${entry.date}`}
  ```

---

## UX/UI

### 6. Damage-type icons

`AttackRow.tsx`'s collapsed row shows damage type as abbreviated text (`attack.damageType.slice(0, 4).toLowerCase()}.`, e.g. "blud."). Add a small icon next to it, mapped from the three XPHB physical damage types this app ever produces (`Bludgeoning`, `Piercing`, `Slashing` — confirmed as the only `damageType` values across `mavok-default.ts` and `weapons.ts`):

```typescript
import { Sword, Target, Hammer } from "lucide-react";

const DAMAGE_TYPE_ICONS: Record<string, typeof Sword> = {
  Slashing: Sword,
  Piercing: Target,
  Bludgeoning: Hammer,
};
```
In the row, next to the existing damage text:
```tsx
const DamageIcon = DAMAGE_TYPE_ICONS[attack.damageType];
// ...
{DamageIcon && <DamageIcon size={11} className="inline-block mb-0.5" />}
```
All three icon names (`Sword`, `Target`, `Hammer`) confirmed to exist in the installed `lucide-react` version.

### 7. Reorder via move buttons

Per your call above: no drag gestures, small ↑/↓ buttons instead. New `moveAttack` function in `useCharacter.ts`, following the existing CRUD-function pattern:
```typescript
const moveAttack = useCallback(
  (attackId: string, direction: "up" | "down") =>
    update((c) => {
      const index = c.attacks.findIndex((a) => a.id === attackId);
      if (index === -1) return c;
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= c.attacks.length) return c;
      const attacks = [...c.attacks];
      [attacks[index], attacks[swapWith]] = [attacks[swapWith], attacks[index]];
      return { ...c, attacks };
    }),
  [update]
);
```
Add to the hook's returned object.

`AttackRow.tsx` gains two new optional props, `onMoveUp?: () => void` and `onMoveDown?: () => void`, rendered as small buttons next to the existing edit/delete kebab menu — following the established "only show the button if the handler is provided" convention already used for `onEdit`/`onDelete`. `CombatTab.tsx` computes each row's index in the map and only passes `onMoveUp` when `index > 0`, and `onMoveDown` when `index < attacks.length - 1`, so the buttons are naturally absent (not just disabled) at the list's boundaries.

### 8. Density toggle

New `AppSettings.density: "compact" | "spacious"` field. `AppSettings` isn't part of the versioned `Character` migration system, so this is a plain type addition — but `loadSettings()` currently does `raw ? JSON.parse(raw) : defaults`, which means an *existing* stored settings blob (saved before this field existed) would come back with `density` simply absent, not defaulted. Fix `loadSettings()` to merge parsed data over defaults (a good general hygiene fix, not just for this field):
```typescript
export function loadSettings(): AppSettings {
  const defaults: AppSettings = {
    theme: "piedra-viva",
    lastCharacterId: "mavok-1",
    density: "spacious",
  };
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}
```

Managed by `useTheme.ts` alongside `theme` (same hook/context — avoids introducing a second settings context for one more field):
```typescript
export function useTheme() {
  const [theme, setTheme] = useState<AppSettings["theme"]>("piedra-viva");
  const [density, setDensity] = useState<AppSettings["density"]>("spacious");

  useEffect(() => {
    const settings = loadSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see useCharacter.ts
    setTheme(settings.theme);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see useCharacter.ts
    setDensity(settings.density);
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "piedra-viva" ? "dark-fantasy" : "piedra-viva";
      document.documentElement.setAttribute("data-theme", next);
      const settings = loadSettings();
      saveSettings({ ...settings, theme: next });
      return next;
    });
  }, []);

  const toggleDensity = useCallback(() => {
    setDensity((prev) => {
      const next = prev === "spacious" ? "compact" : "spacious";
      const settings = loadSettings();
      saveSettings({ ...settings, density: next });
      return next;
    });
  }, []);

  return { theme, toggleTheme, density, toggleDensity };
}
```
`ThemeContextType` (`ReturnType<typeof useTheme>`, `src/lib/context.ts`) picks up the new fields automatically — no changes needed there.

**Scope of "compact" mode — padding/spacing only, not content hiding.** To keep this predictable and avoid a much larger content-truncation redesign, "compact" reduces padding/gap values on list rows; it does not hide any information that "spacious" shows. Applied via `const { density } = useThemeContext();` in each of:
- `InventoryTab.tsx` — item rows: `p-3 gap-3` (spacious, current) → `p-1.5 gap-2` (compact)
- `NoteList.tsx` / `QuestList.tsx` — card rows: `p-3` → `p-2`
- `JournalList.tsx` — entry rows: `p-3` → `p-2`
- Attacks list (`AttackRow.tsx`) — row: `p-3` → `p-2`

New UI in `SettingsTab.tsx`'s existing "Tema" `CollapsibleSection`: a second row alongside the theme toggle button, same visual style, labeled "Compacto" / "Espacioso" with a tap-to-toggle button calling `toggleDensity()`.

### 9. Read-more expansion

Inline "ver más" / "ver menos" toggle inside the truncated preview paragraph in `NoteList.tsx`, `QuestList.tsx`, and `JournalList.tsx` — distinct from the existing tap-to-edit interaction on the rest of the card (which still opens the full edit modal). Each list gets its own `expandedPreviews: Set<string>` state (independent per-entry expansion, not the single-select "one at a time" pattern used elsewhere in this app for *navigational* accordions like Inventory's `expandedItem` — these are more like independent inline disclosures, so multiple can be open at once):
```typescript
const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(new Set());

function togglePreview(id: string) {
  setExpandedPreviews((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
}
```
**The three files use different iteration variable names for the same `.content: string` field** (all three entry types — `NoteEntry`, `QuestEntry`, `JournalEntry` — share `content` via `NoteEntry`, but the loop variable itself differs per file): `NoteList.tsx` maps `.map((note) => ...)`, `QuestList.tsx` maps `.map((quest) => ...)`, `JournalList.tsx` maps `.map((entry) => ...)`. Apply the same shape in each, substituting that file's actual variable name for the placeholder `x` used below — do not introduce a variable literally named `item` or `x`, since neither exists in any of these three files today:
```tsx
<p className={`text-xs text-foreground/80 mt-1 ${expandedPreviews.has(x.id) ? "" : "line-clamp-2"}`}>
  {x.content}
</p>
{x.content && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      togglePreview(x.id);
    }}
    className="text-[0.65rem] text-accent mt-0.5"
  >
    {expandedPreviews.has(x.id) ? "ver menos" : "ver más"}
  </button>
)}
```
(`e.stopPropagation()` prevents the tap from also triggering the card's outer click handler, which already exists in all three files but under different names: `NoteList.tsx` and `QuestList.tsx` both call `onClick={() => openEdit(note)}` / `onClick={() => openEdit(quest)}`; `JournalList.tsx` instead calls `onClick={() => setViewingId(entry.id)}` directly, with no `openEdit` function of its own.)

**Deliberate simplification:** the "ver más" link shows for any entry with non-empty content, regardless of whether it actually overflows two lines — detecting real overflow would need a `ResizeObserver` or DOM measurement, which is more complexity than this feature is worth. Worst case, a short note shows a "ver más" that reveals... the same short text. Harmless, and simpler.

---

## Nice to Have

### 10. Conditions quick-lookup

`Tag.tsx` gains a new optional `onClick?: () => void` prop, separate from the existing `onRemove?: () => void`, applied to the label span rather than the whole chip:
```tsx
export function Tag({
  label,
  onRemove,
  onClick,
  variant = "default",
}: {
  label: string;
  onRemove?: () => void;
  onClick?: () => void;
  variant?: "default" | "success" | "danger";
}) {
  const colors = { /* unchanged */ };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded ${colors[variant]}`}>
      <span onClick={onClick} className={onClick ? "cursor-pointer" : undefined}>
        {label}
      </span>
      {onRemove && (
        <button onClick={onRemove} className="opacity-60 hover:opacity-100 leading-none">
          ✕
        </button>
      )}
    </span>
  );
}
```
The label span and the "✕" button are siblings (not nested), so both handlers fire independently on their own tap targets with no event-propagation conflict — no `stopPropagation` needed.

`CombatTab.tsx`'s existing conditions row passes the new prop, and a new `viewingCondition: string | null` state opens a small `Modal` showing the full XPHB text looked up from `CONDITIONS` (`src/data/conditions.ts`, already has full `description` text for all 14 XPHB conditions — confirmed, no data gap):
```tsx
<Tag
  key={c}
  label={c}
  onClick={() => setViewingCondition(c)}
  onRemove={() => { /* unchanged */ }}
/>
```
```tsx
<Modal
  open={viewingCondition !== null}
  onClose={() => setViewingCondition(null)}
  title={viewingCondition ?? ""}
>
  <p className="text-sm text-foreground/80 leading-relaxed">
    {CONDITIONS.find((c) => c.name === viewingCondition)?.description}
  </p>
</Modal>
```

### 11. One-page reference card export

`src/app/print/page.tsx` gains a `mode: "full" | "card"` toggle, hidden from the actual printed output via Tailwind's `print:` variant:
```tsx
const [mode, setMode] = useState<"full" | "card">("full");
```
```tsx
<div className="print:hidden flex gap-2 mb-4 justify-center">
  <button
    onClick={() => setMode("full")}
    className={mode === "full" ? "font-bold underline" : ""}
  >
    Ficha completa
  </button>
  <button
    onClick={() => setMode("card")}
    className={mode === "card" ? "font-bold underline" : ""}
  >
    Tarjeta rápida
  </button>
</div>
```
The existing full-sheet JSX (header through Inventario) is wrapped in `{mode === "full" && (...)}`. A new `{mode === "card" && (...)}` block renders a condensed layout reusing the same computed values already in scope (adding `combat` to the page's existing `character` destructure, which currently omits it):
- Header (name/level/class/species — same markup as the full sheet)
- A stat row: AC, HP (`combat.currentHp`/`combat.maxHp`), Speed (`combat.speed`), Initiative (`formatModifier(combat.initiative)`)
- Saving throws (same compact list markup as the full sheet's Salvaciones section)
- Attacks table (same table markup as the full sheet's Ataques section)

No new route — both modes share the same `/print` page and the same `useCharacter()` call already there.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/combat/RageTracker.tsx` | Memoize `Ember`'s random offsets |
| `src/components/notes/JournalList.tsx` | Replace prop-mirroring effect with render-time comparison; add read-more toggle; density-aware padding |
| `src/hooks/useCharacter.ts` | Scoped lint suppression with justification |
| `src/hooks/useTheme.ts` | Scoped lint suppression; add `density`/`toggleDensity` |
| `scripts/extract-5etools.ts` | Fix object-shaped weapon property extraction |
| `src/data/weapons.ts` | Regenerated — only Lance's `properties` should change |
| `src/components/combat/AttackRow.tsx` | Remove `rageBonus` range exclusion; damage-type icons; move-up/down props; density-aware padding |
| `src/data/mavok-default.ts` | No change — its static "Weapon Mastery" description field remains in storage, but `SheetTab.tsx` unconditionally overrides the *displayed* text for that one feature with the live-computed version |
| `src/lib/weaponMatch.ts` | New file — `baseWeaponName`, `describeWeaponMastery` |
| `src/components/settings/WeaponMasteryModal.tsx` | Import `baseWeaponName` instead of local copy |
| `src/components/tabs/SheetTab.tsx` | Dynamic Weapon Mastery description; add `attacks` to destructure |
| `src/components/tabs/CombatTab.tsx` | Undo-toast position fix; conditions quick-lookup; move-up/down wiring |
| `src/components/tabs/SettingsTab.tsx` | Portrait upload error handling; level-up history key fix; density toggle UI |
| `src/lib/storage.ts` | `loadSettings()` merges defaults over parsed data |
| `src/lib/types.ts` | Add `density: "compact" \| "spacious"` to `AppSettings` |
| `src/components/ui/Tag.tsx` | Add `onClick` prop, separate from `onRemove` |
| `src/components/notes/NoteList.tsx` | Read-more toggle; density-aware padding |
| `src/components/notes/QuestList.tsx` | Read-more toggle; density-aware padding |
| `src/components/tabs/InventoryTab.tsx` | Density-aware padding |
| `src/app/print/page.tsx` | `full`/`card` mode toggle; condensed reference-card layout |
| `CLAUDE.md` | Remove the now-resolved "7 pre-existing lint errors" paragraph |

## Explicitly Out of Scope

- Real drag-and-drop reordering (per your call — up/down buttons instead).
- Per-list density settings (per your call — one global toggle).
- Overflow-detection for the read-more toggle (per the deliberate simplification in Section 9 — it always offers to expand, whether or not the text actually overflows).
- A separate `/print-card` route (per your call — a mode toggle within the existing `/print` page instead).
- `useSyncExternalStore` refactor of `useCharacter.ts`/`useTheme.ts` (per your call — scoped lint suppression instead).
- Cross-tab sync of theme/density changes (the `storage` event isn't wired up — out of scope for a single-user app with no real multi-tab use case).
