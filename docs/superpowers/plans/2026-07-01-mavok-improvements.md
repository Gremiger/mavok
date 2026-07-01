# Mavok Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix XPHB data compliance issues, add Stone's Endurance tracker, improve mobile UX (zoom/island/passives), add skill grouping, rage details panel, and standard actions modal.

**Architecture:** All changes are client-side only. Data model bumps from v2 → v3 via the existing versioned migration system in `src/lib/migrations.ts`; the migration patches existing LocalStorage data so no user action is required. UI additions are self-contained components following existing patterns (CollapsibleSection, Modal, stone-card styling).

**Tech Stack:** Next.js 15 static export, React 19, TypeScript, Tailwind CSS, Framer Motion, Sonner toasts. No tests — verify with `npx tsc --noEmit && npm run build`.

## Global Constraints

- No backend, no API routes — all state in LocalStorage via `useCharacter()` hook
- `output: 'export'` in next.config — no server components, no dynamic routes
- All UI labels in Spanish; D&D terms stay in English (Rage, Grapple, etc.)
- Stone's Endurance uses XPHB rules: Reaction, 1d12 + CON mod, uses = Proficiency Bonus, Long Rest recovery only
- Rage uses XPHB rules: 1 use recovered on Short Rest, all on Long Rest; ends end of next turn unless extended
- Large Form available at character level 5 only (not level 1)
- Verify each task: `npx tsc --noEmit && npm run build` from `/Users/gremiger/Documents/Personal/coding/dnd/mavok`
- Follow existing stone-card / cord-line / crack-divider visual patterns
- Commit after every task

---

## File Map

| File | Task | Change |
|------|------|--------|
| `src/lib/types.ts` | 1 | Add `stoneEndurance` to `Resources`; bump `CURRENT_DATA_VERSION` to 3 |
| `src/lib/migrations.ts` | 1 | Add v3 migration: stoneEndurance + feature patches |
| `src/data/mavok-default.ts` | 2 | Fix Rage desc, Giant Ancestry desc, Large Form level, add Stone's Endurance feature + resource |
| `src/components/tabs/SettingsTab.tsx` | 3 | Short rest: +1 Rage use; Long rest: restore stoneEndurance |
| `src/app/globals.css` | 4 | `input` font-size fix; raise `.nav-island-bottom` and `.pb-safe-nav` |
| `src/app/page.tsx` | 4 | Raise nav island; fix pinch-zoom on motion.main |
| `src/components/tabs/SheetTab.tsx` | 5 | Level-gate features; passive badges; skill grouping toggle |
| `src/components/combat/RageTracker.tsx` | 6 | Rage details mini-panel when active |
| `src/components/combat/StandardActionsModal.tsx` | 7 | New — XPHB standard actions popup |
| `src/components/tabs/CombatTab.tsx` | 8 | Stone's Endurance reaction card; standard actions cards |

---

## Task 1: Data model + migration

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/migrations.ts`

**Interfaces:**
- Produces: `Resources.stoneEndurance: { total: number; remaining: number }` — consumed by Tasks 2, 3, 8

- [ ] **Step 1: Bump version and add stoneEndurance to Resources**

In `src/lib/types.ts`, make these two changes:

```typescript
// Line 3 — change:
export const CURRENT_DATA_VERSION = 3;

// Inside Resources interface — add stoneEndurance:
export interface Resources {
  rpiRages: { total: number; remaining: number; active: boolean; slots: boolean[] };
  healerKit: { total: number; remaining: number };
  stoneEndurance: { total: number; remaining: number };
}
```

- [ ] **Step 2: Add v3 migration**

In `src/lib/migrations.ts`, replace the `// Future migrations go here:` comment block with:

```typescript
  3: (data) => {
    const d = data as Record<string, unknown>;
    d._version = 3;

    // Add stoneEndurance tracker
    const meta = d.meta as Record<string, unknown> | undefined;
    const profBonus = (meta?.proficiencyBonus as number) || 2;
    const resources = d.resources as Record<string, unknown> | undefined;
    if (resources && !resources.stoneEndurance) {
      resources.stoneEndurance = { total: profBonus, remaining: profBonus };
    }

    // Patch features stored in LocalStorage
    const features = d.features as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(features)) {
      const rage = features.find(f => f.name === 'Rage');
      if (rage) {
        rage.description =
          "Bonus Action para entrar en Rage (no puedes llevar Heavy Armor). " +
          "2 usos — recuperas 1 uso tras descanso corto, todos tras descanso largo. " +
          "Mientras activo: +2 daño en ataques de Fuerza (arma o Unarmed Strike), " +
          "Resistencia a Bludgeoning/Piercing/Slashing, Ventaja en pruebas y salvaciones de FUE. " +
          "No puedes concentrarte ni lanzar hechizos. " +
          "La Rage termina al final de tu siguiente turno salvo que la extiendas atacando, " +
          "forzando una salvación o gastando una Bonus Action. " +
          "Máximo 10 minutos. Termina antes si equipas Heavy Armor o quedas Incapacitated.";
      }

      const giantAncestry = features.find(f => f.name === 'Giant Ancestry: Stone Giant');
      if (giantAncestry) {
        giantAncestry.description =
          "Descendiente de Stone Giants. Boon elegido: Stone's Endurance. " +
          "Usos iguales a tu Proficiency Bonus; se recuperan todos en un descanso largo.";
      }

      const largeForm = features.find(f => f.name === 'Large Form');
      if (largeForm) {
        largeForm.level = 5;
      }

      const hasStoneEndurance = features.some(f => f.name === "Stone's Endurance");
      if (!hasStoneEndurance) {
        features.push({
          name: "Stone's Endurance",
          source: "Goliath",
          description:
            `Reacción: cuando recibes daño, tira 1d12 y añade tu modificador de CON. ` +
            `Reduce el daño entrante por ese total. Usos: ${profBonus} por descanso largo.`,
          level: 1,
        });
      }
    }

    return d;
  },
```

- [ ] **Step 3: Verify**

```bash
cd /Users/gremiger/Documents/Personal/coding/dnd/mavok
npx tsc --noEmit && npm run build
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts src/lib/migrations.ts
git commit -m "feat: data model v3 — stoneEndurance tracker + XPHB feature migration"
```

---

## Task 2: mavok-default.ts updates

**Files:**
- Modify: `src/data/mavok-default.ts`

**Interfaces:**
- Consumes: `Resources.stoneEndurance` from Task 1

- [ ] **Step 1: Add stoneEndurance to resources**

In `src/data/mavok-default.ts`, inside the `resources` object:

```typescript
resources: {
  rpiRages: { total: 2, remaining: 2, active: false, slots: [true, true] },
  healerKit: { total: 10, remaining: 10 },
  stoneEndurance: { total: 2, remaining: 2 },
},
```

- [ ] **Step 2: Fix Rage description**

Replace the Rage feature description:

```typescript
{
  name: "Rage",
  source: "Bárbaro",
  description:
    "Bonus Action para entrar en Rage (no puedes llevar Heavy Armor). " +
    "2 usos — recuperas 1 uso tras descanso corto, todos tras descanso largo. " +
    "Mientras activo: +2 daño en ataques de Fuerza (arma o Unarmed Strike), " +
    "Resistencia a Bludgeoning/Piercing/Slashing, Ventaja en pruebas y salvaciones de FUE. " +
    "No puedes concentrarte ni lanzar hechizos. " +
    "La Rage termina al final de tu siguiente turno salvo que la extiendas atacando, " +
    "forzando una salvación o gastando una Bonus Action. " +
    "Máximo 10 minutos. Termina antes si equipas Heavy Armor o quedas Incapacitated.",
  level: 1,
},
```

- [ ] **Step 3: Update Giant Ancestry description**

```typescript
{
  name: "Giant Ancestry: Stone Giant",
  source: "Goliath",
  description:
    "Descendiente de Stone Giants. Boon elegido: Stone's Endurance. " +
    "Usos iguales a tu Proficiency Bonus; se recuperan todos en un descanso largo.",
  level: 1,
},
```

- [ ] **Step 4: Fix Large Form level and add Stone's Endurance feature**

Change Large Form `level: 1` → `level: 5`:

```typescript
{
  name: "Large Form",
  source: "Goliath",
  description:
    "A partir del nivel 5: Bonus Action para adoptar forma Large si hay espacio suficiente. " +
    "Dura 10 minutos o hasta cancelarla (sin acción). Durante la transformación: " +
    "Ventaja en pruebas de FUE y +10 ft a tu Velocidad. 1 uso por descanso largo.",
  level: 5,
},
```

Add Stone's Endurance feature (after Giant Ancestry entry):

```typescript
{
  name: "Stone's Endurance",
  source: "Goliath",
  description:
    "Reacción: cuando recibes daño, tira 1d12 y añade tu modificador de CON. " +
    "Reduce el daño entrante por ese total. Usos: 2 por descanso largo.",
  level: 1,
},
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/data/mavok-default.ts
git commit -m "feat: fix XPHB data — Rage desc, Large Form level 5, Stone's Endurance feature"
```

---

## Task 3: Short rest + long rest mechanics

**Files:**
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Consumes: `Resources.stoneEndurance` from Task 1

- [ ] **Step 1: Add Rage +1 recovery on short rest**

In `SettingsTab.tsx`, the short rest currently only uses hit dice. Add Rage recovery when the "Terminar descanso" button is clicked. Replace the `setShortRestOpen(false)` handler on that button:

```tsx
<button
  onClick={() => {
    // XPHB: regain 1 Rage use on short rest
    const rages = character.resources.rpiRages;
    if (rages.remaining < rages.total) {
      const newRemaining = Math.min(rages.remaining + 1, rages.total);
      const newSlots = rages.slots.map((s, i) => i < newRemaining ? true : s);
      update((c) => ({
        ...c,
        resources: {
          ...c.resources,
          rpiRages: {
            ...c.resources.rpiRages,
            remaining: newRemaining,
            slots: newSlots,
          },
        },
      }));
      toast("Rage +1 recuperado", { icon: "🔥" });
    }
    setShortRestOpen(false);
  }}
  className="w-full py-2 text-sm text-muted border border-border rounded-lg"
>
  Terminar descanso
</button>
```

Also update the Short Rest modal description to mention Rage:

```tsx
<span className="text-xs text-muted block mt-0.5">
  Gastar dados de golpe · Recuperar 1 Rage
</span>
```

- [ ] **Step 2: Add Stone's Endurance restore on long rest**

In `applyLongRest`, add stoneEndurance reset inside the `update` call:

```typescript
function applyLongRest() {
  const hitDiceRecovery = Math.max(
    1,
    Math.floor(character!.combat.hitDice.total / 2)
  );
  updateCombat({
    currentHp: character!.combat.maxHp,
    tempHp: 0,
    hitDice: {
      ...character!.combat.hitDice,
      remaining: Math.min(
        character!.combat.hitDice.remaining + hitDiceRecovery,
        character!.combat.hitDice.total
      ),
    },
    deathSaves: { successes: 0, failures: 0 },
    conditions: [],
  });
  update((c) => ({
    ...c,
    resources: {
      ...c.resources,
      rpiRages: {
        ...c.resources.rpiRages,
        remaining: c.resources.rpiRages.total,
        active: false,
        slots: Array(c.resources.rpiRages.total).fill(true),
      },
      stoneEndurance: {
        ...c.resources.stoneEndurance,
        remaining: c.resources.stoneEndurance.total,
      },
    },
  }));
  setLongRestOpen(false);
  toast.success("Descanso largo completado");
}
```

- [ ] **Step 3: Update Long Rest modal description**

In the Long Rest modal `<ul>`, add a line after the Rage line:

```tsx
<li>Rage → {character.resources.rpiRages.total}/{character.resources.rpiRages.total}</li>
<li>Stone's Endurance → {character.resources.stoneEndurance.total}/{character.resources.stoneEndurance.total}</li>
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/tabs/SettingsTab.tsx
git commit -m "feat: XPHB short rest +1 rage, long rest restores Stone's Endurance"
```

---

## Task 4: UX fixes — island, zoom, pinch

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Fix input font-size (prevents iOS auto-zoom)**

In `src/app/globals.css`, add after the `body` rule:

```css
/* Prevent iOS auto-zoom on input focus (requires font-size >= 16px) */
input, textarea, select {
  font-size: max(16px, 1rem);
}
```

- [ ] **Step 2: Raise island nav and update content padding**

In `src/app/globals.css`, update `.nav-island-bottom` and `.pb-safe-nav`:

```css
.nav-island-bottom {
  bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
}

.pb-safe-nav {
  padding-bottom: calc(6.5rem + env(safe-area-inset-bottom, 0px));
}

.bottom-safe-fab {
  bottom: calc(7rem + env(safe-area-inset-bottom, 0px));
}
```

(Was `0.75rem` / `5.5rem` / `6rem` — raised by ~8px to lift the island off the bottom edge.)

- [ ] **Step 3: Fix pinch-to-zoom on motion.main**

In `src/app/page.tsx`, the `motion.main` `drag="x"` sets `touch-action: none` internally, blocking pinch-zoom. Fix by removing `touch-pan-y` class and applying `touchAction: 'pan-y pinch-zoom'` via inline style, and tracking multi-touch to disable drag during pinch:

```tsx
// Add at top of Home() function body, after existing state:
const [isPinching, setIsPinching] = useState(false);
```

Replace the `motion.main` element:

```tsx
<motion.main
  className="flex-1 overflow-y-auto pb-safe-nav"
  style={{ x: dragX, opacity: dragOpacity, touchAction: 'pan-y pinch-zoom' }}
  drag={isPinching ? false : "x"}
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.2}
  onDragEnd={handleDragEnd}
  onTouchStart={(e) => {
    if (e.touches.length > 1) setIsPinching(true);
  }}
  onTouchEnd={() => setIsPinching(false)}
>
  {tabContent[activeTab]}
</motion.main>
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/page.tsx
git commit -m "fix: raise island nav, prevent iOS text zoom, fix pinch-to-zoom"
```

---

## Task 5: SheetTab — level gating, passive badges, skill grouping

**Files:**
- Modify: `src/components/tabs/SheetTab.tsx`

- [ ] **Step 1: Add skill grouping state and ability order**

At the top of `SheetTab()`, add after existing state:

```tsx
const [groupByAbility, setGroupByAbility] = useState(false);

const ABILITY_ORDER: AbilityScore[] = ["str", "dex", "con", "int", "wis", "cha"];
```

- [ ] **Step 2: Add passive perception badges**

Add a computed passives block inside the render, after destructuring `character`:

```tsx
const passivePerception = 10 + skillTotal(character, 'perception');
const passiveInsight = 10 + skillTotal(character, 'insight');
const passiveInvestigation = 10 + skillTotal(character, 'investigation');
```

Inside the "Habilidades" `CollapsibleSection`, add this row **before** the skills list:

```tsx
<div className="flex gap-2 flex-wrap mb-3">
  {[
    { label: "Percepción Pasiva", value: passivePerception },
    { label: "Perspicacia Pasiva", value: passiveInsight },
    { label: "Investigación Pasiva", value: passiveInvestigation },
  ].map(({ label, value }) => (
    <div key={label} className="stone-card rounded-lg px-2 py-1 flex items-center gap-1.5">
      <span className="text-muted text-[0.6rem] uppercase tracking-wider">{label}</span>
      <span className="font-heading text-accent text-sm font-bold">{value}</span>
    </div>
  ))}
</div>
```

- [ ] **Step 3: Add grouping toggle to section header**

The `CollapsibleSection` component doesn't support header actions, so render the toggle inside the section body before the badges. Replace the "Habilidades" `CollapsibleSection` opening with a version that has a toggle in the title. Since `CollapsibleSection` only takes a `title` string, render the toggle inline just above it:

```tsx
<div className="relative">
  <button
    onClick={() => setGroupByAbility(g => !g)}
    className="absolute right-0 top-0 z-10 text-[0.6rem] text-muted border border-border rounded px-1.5 py-0.5 uppercase tracking-wider hover:border-accent hover:text-accent"
    style={{ marginTop: '0.9rem' }}
  >
    {groupByAbility ? "A–Z" : "Grupo"}
  </button>
  <CollapsibleSection title="Habilidades">
    {/* passives + skills list */}
  </CollapsibleSection>
</div>
```

- [ ] **Step 4: Implement grouped and alphabetical skill rendering**

Replace the existing skills `<div className="space-y-1">` block:

```tsx
<div className="space-y-1">
  {groupByAbility
    ? ABILITY_ORDER.map((ab) => {
        const group = Object.entries(skills).filter(([, s]) => s.attribute === ab);
        if (group.length === 0) return null;
        return (
          <div key={ab} className="mb-2">
            <div className="text-muted text-[0.6rem] uppercase tracking-widest px-1 mb-1">
              {abilityLabelShort(ab)}
            </div>
            {group
              .sort(([a], [b]) => skillLabel(a).localeCompare(skillLabel(b)))
              .map(([key, skill]) => (
                <button
                  key={key}
                  onClick={() => rollSkill(key)}
                  className="w-full flex items-center justify-between py-1.5 px-1 text-sm rounded hover:bg-card/50 active:scale-[0.99] transition-transform cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full border ${skill.proficient ? "bg-accent border-accent" : "border-muted"}`} />
                    <span>{skillLabel(key)}</span>
                  </div>
                  <span className="font-heading text-accent">
                    {formatModifier(skillTotal(character, key))}
                  </span>
                </button>
              ))}
          </div>
        );
      })
    : Object.entries(skills)
        .sort(([a], [b]) => skillLabel(a).localeCompare(skillLabel(b)))
        .map(([key, skill]) => (
          <button
            key={key}
            onClick={() => rollSkill(key)}
            className="w-full flex items-center justify-between py-1.5 px-1 text-sm rounded hover:bg-card/50 active:scale-[0.99] transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full border ${skill.proficient ? "bg-accent border-accent" : "border-muted"}`} />
              <span>{skillLabel(key)}</span>
              <span className="text-muted text-xs">({abilityLabelShort(skill.attribute)})</span>
            </div>
            <span className="font-heading text-accent">
              {formatModifier(skillTotal(character, key))}
            </span>
          </button>
        ))
  }
</div>
```

Note: in grouped view the ability abbreviation sub-header replaces per-row attribute labels; in alphabetical view keep `({abilityLabelShort})` per row as before.

- [ ] **Step 5: Add level gating to Rasgos section**

In the "Rasgos y características" section, filter features by level:

```tsx
{features
  .filter(f => f.level <= meta.level)
  .map((f, i) => (
    // ... existing card JSX unchanged
  ))}
```

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/components/tabs/SheetTab.tsx
git commit -m "feat: passive badges, skill grouping toggle, level-gate features in SheetTab"
```

---

## Task 6: RageTracker — details panel when active

**Files:**
- Modify: `src/components/combat/RageTracker.tsx`

- [ ] **Step 1: Add rage details panel**

In `RageTracker.tsx`, inside the outer `<motion.div>` wrapper, add this block after the existing "Bottom bar" `<AnimatePresence>` section (around line 228):

```tsx
{/* Rage details when active */}
<AnimatePresence>
  {active && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div className="mt-2 px-1 space-y-0.5">
        <p className="text-[0.65rem] text-orange-300/80 leading-relaxed">
          +2 daño · Resistencia Bludgeoning/Piercing/Slashing · Ventaja FUE checks/saves
        </p>
        <p className="text-[0.65rem] text-muted leading-relaxed">
          Extiende: ataca · fuerza salvación · Bonus Action
        </p>
        <p className="text-[0.65rem] text-muted leading-relaxed">
          No concentración · No hechizos
        </p>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/combat/RageTracker.tsx
git commit -m "feat: rage details mini-panel when active"
```

---

## Task 7: StandardActionsModal

**Files:**
- Create: `src/components/combat/StandardActionsModal.tsx`

**Interfaces:**
- Produces: `<StandardActionsModal open={boolean} onClose={() => void} filter="actions" | "bonus" | "reactions" />`
- Consumed by Task 8

- [ ] **Step 1: Create the component**

Create `src/components/combat/StandardActionsModal.tsx`:

```tsx
"use client";

import { Modal } from "@/components/ui/Modal";

type ActionCategory = "actions" | "bonus" | "reactions";

interface StandardAction {
  name: string;
  description: string;
  subItems?: { name: string; description: string }[];
}

const STANDARD_ACTIONS: StandardAction[] = [
  {
    name: "Ataque (Attack)",
    description: "Realiza una tirada de ataque con un arma o Unarmed Strike.",
    subItems: [
      {
        name: "Grapple (Unarmed Strike)",
        description:
          "Athletics vs Athletics/Acrobatics del objetivo (elige el objetivo). Éxito: aplica condición Grappled. El objetivo no puede ser más de una categoría de tamaño mayor que tú.",
      },
      {
        name: "Shove (Unarmed Strike)",
        description:
          "Athletics vs Athletics/Acrobatics del objetivo. Éxito: empuja 5 ft. en dirección que elijas o derriba (condición Prone).",
      },
    ],
  },
  {
    name: "Carrera (Dash)",
    description:
      "Gana movimiento extra igual a tu Velocidad este turno (con modificadores incluidos).",
  },
  {
    name: "Repliegue (Disengage)",
    description:
      "Tus movimientos no provocan Ataques de Oportunidad durante el resto del turno.",
  },
  {
    name: "Esquiva (Dodge)",
    description:
      "Ataques contra ti tienen Desventaja (si puedes ver al atacante). Ventaja en salvaciones de DES. Se pierde si quedas Incapacitated o tu Velocidad es 0.",
  },
  {
    name: "Ayuda (Help)",
    description:
      "Asiste a un aliado en una prueba de habilidad (le concedes Ventaja) o en su próximo ataque contra un enemigo adyacente a ti.",
  },
  {
    name: "Esconderse (Hide)",
    description:
      "Prueba DES (Sigilo) DC 15 mientras estás Heavily Obscured o con Three-Quarters/Total Cover, fuera de la línea de visión de enemigos. Con éxito: condición Invisible hasta que te muevas, hagas ruido, ataques o lances un hechizo.",
  },
  {
    name: "Influir (Influence)",
    description:
      "Convence a un monstruo mediante roleplay (persuasión, engaño, intimidación…). El DM determina si se requiere prueba de habilidad.",
  },
  {
    name: "Preparar (Ready)",
    description:
      "Define un trigger perceptible y una acción/movimiento de Reacción. Cuando ocurre el trigger, puedes ejecutar la Reacción antes de tu próximo turno.",
  },
  {
    name: "Buscar (Search)",
    description:
      "Prueba de SAB para detectar algo no obvio: Perception (criaturas), Insight (estado mental), Medicine (criatura viva/muerta); o INT Investigation (rastrear/examinar).",
  },
  {
    name: "Estudiar (Study)",
    description:
      "Prueba de INT para recordar información: Arcana, History, Nature, Religion, Medicine, Investigation según el tema.",
  },
  {
    name: "Utilizar (Utilize)",
    description:
      "Usa un objeto que requiere una acción para activarse.",
  },
];

const STANDARD_BONUS_ACTIONS: StandardAction[] = [
  {
    name: "Two-Weapon Fighting",
    description:
      "Tras atacar con un arma Light como parte de tu Attack action, puedes atacar con otra arma Light diferente como Bonus Action. No añades tu modificador de habilidad al daño (salvo que sea negativo).",
  },
];

const STANDARD_REACTIONS: StandardAction[] = [
  {
    name: "Ataque de Oportunidad (Opportunity Attack)",
    description:
      "Cuando una criatura que puedes ver abandona tu alcance usando su acción, Bonus Action, Reacción o velocidad: usa tu Reacción para hacer un ataque cuerpo a cuerpo. El ataque ocurre justo antes de que salga de tu alcance.",
  },
];

const DATA: Record<ActionCategory, { title: string; actions: StandardAction[] }> = {
  actions: { title: "Acciones estándar", actions: STANDARD_ACTIONS },
  bonus: { title: "Bonus Actions estándar", actions: STANDARD_BONUS_ACTIONS },
  reactions: { title: "Reacciones estándar", actions: STANDARD_REACTIONS },
};

interface Props {
  open: boolean;
  onClose: () => void;
  filter: ActionCategory;
}

export function StandardActionsModal({ open, onClose, filter }: Props) {
  const { title, actions } = DATA[filter];
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {actions.map((action) => (
          <div key={action.name} className="stone-card rounded-lg p-3">
            <p className="font-heading text-accent text-sm font-semibold mb-1">
              {action.name}
            </p>
            <p className="text-xs text-foreground/70 leading-relaxed">
              {action.description}
            </p>
            {action.subItems && (
              <div className="mt-2 space-y-1.5 pl-2 border-l border-border">
                {action.subItems.map((sub) => (
                  <div key={sub.name}>
                    <p className="text-xs text-accent/80 font-semibold">{sub.name}</p>
                    <p className="text-xs text-muted leading-relaxed">{sub.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/combat/StandardActionsModal.tsx
git commit -m "feat: StandardActionsModal with full XPHB action list"
```

---

## Task 8: CombatTab — Stone's Endurance card + standard actions

**Files:**
- Modify: `src/components/tabs/CombatTab.tsx`

**Interfaces:**
- Consumes: `Resources.stoneEndurance` from Task 1
- Consumes: `<StandardActionsModal>` from Task 7

- [ ] **Step 1: Add modal state and import**

At the top of `CombatTab.tsx`, add the import:

```tsx
import { StandardActionsModal } from "@/components/combat/StandardActionsModal";
```

Inside `CombatTab()`, add modal state after existing state declarations:

```tsx
const [standardActionsOpen, setStandardActionsOpen] = useState<"actions" | "bonus" | "reactions" | null>(null);
```

- [ ] **Step 2: Wire destructured stoneEndurance**

After the existing destructuring `const { combat, resources, meta, attacks } = character;`, add:

```tsx
const { stoneEndurance } = resources;
```

- [ ] **Step 3: Add Stone's Endurance tracker function**

After `toggleRageActive`, add:

```tsx
function spendStoneEndurance() {
  if (resources.stoneEndurance.remaining <= 0) return;
  updateResources({
    stoneEndurance: {
      ...resources.stoneEndurance,
      remaining: resources.stoneEndurance.remaining - 1,
    },
  });
}
```

- [ ] **Step 4: Replace Reacciones section**

Replace the entire `{/* Reactions */}` `CollapsibleSection` block:

```tsx
{/* Reactions */}
<CollapsibleSection title="Reacciones">
  <div className="space-y-2 text-sm">
    {/* Stone's Endurance */}
    <div
      className={`p-3 rounded-lg border ${
        stoneEndurance.remaining > 0
          ? "border-border bg-card"
          : "border-border bg-card opacity-50"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-heading text-accent">Stone's Endurance</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-heading">
            {stoneEndurance.remaining}/{stoneEndurance.total}
          </span>
          <button
            onClick={spendStoneEndurance}
            disabled={stoneEndurance.remaining <= 0}
            className="text-xs px-2 py-0.5 border border-border rounded hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Usar
          </button>
        </div>
      </div>
      <p className="text-xs text-muted">
        Reacción · tira 1d12 + CON mod · reduce el daño entrante por ese total
      </p>
    </div>

    {/* Opportunity Attack */}
    <div className="p-3 rounded-lg border border-border bg-card">
      <span className="font-heading text-accent">Opportunity Attack</span>
      <span className="text-muted text-xs ml-2">
        Mismas armas que Acciones
      </span>
    </div>

    {/* Standard reactions compact card */}
    <button
      onClick={() => setStandardActionsOpen("reactions")}
      className="w-full p-2 rounded-lg border border-border/50 bg-card/50 text-left"
    >
      <span className="font-heading text-muted text-xs">Reacciones estándar</span>
      <span className="text-muted/60 text-[0.6rem] ml-2">Opportunity Attack</span>
    </button>
  </div>
</CollapsibleSection>
```

- [ ] **Step 5: Add standard actions card to Acciones section**

At the end of the `{/* Actions */}` `CollapsibleSection` (after the last `AttackRow`), add:

```tsx
<button
  onClick={() => setStandardActionsOpen("actions")}
  className="w-full mt-2 p-2 rounded-lg border border-border/50 bg-card/50 text-left"
>
  <span className="font-heading text-muted text-xs">Acciones estándar</span>
  <p className="text-muted/60 text-[0.6rem] mt-0.5 leading-relaxed">
    Attack (Grapple · Shove) · Dash · Disengage · Dodge · Help · Hide · Influence · Ready · Search · Study · Utilize
  </p>
</button>
```

- [ ] **Step 6: Add standard bonus actions card to Acciones adicionales section**

At the end of the `{/* Bonus Actions */}` `CollapsibleSection` (after the Offhand Attack card), add:

```tsx
<button
  onClick={() => setStandardActionsOpen("bonus")}
  className="w-full mt-1 p-2 rounded-lg border border-border/50 bg-card/50 text-left"
>
  <span className="font-heading text-muted text-xs">Bonus Actions estándar</span>
  <span className="text-muted/60 text-[0.6rem] ml-2">Two-Weapon Fighting</span>
</button>
```

- [ ] **Step 7: Add StandardActionsModal at bottom of JSX**

Before the closing `</div>` at the end of the CombatTab return, add:

```tsx
<StandardActionsModal
  open={standardActionsOpen !== null}
  onClose={() => setStandardActionsOpen(null)}
  filter={standardActionsOpen ?? "actions"}
/>
```

- [ ] **Step 8: Verify**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 9: Commit**

```bash
git add src/components/tabs/CombatTab.tsx
git commit -m "feat: Stone's Endurance tracker, standard actions modal in CombatTab"
```

---

## Self-Review Checklist

After all tasks, run:

```bash
npx tsc --noEmit && npm run build
```

Verify in browser (dev server: `npm run dev`):
- [ ] Open app — no console errors, migration runs silently (check DevTools > Application > LocalStorage to confirm `_version: 3`)
- [ ] **CombatTab**: Stone's Endurance shows 2/2, "Usar" decrements, long rest restores it
- [ ] **CombatTab**: Standard actions cards open correct modal sections
- [ ] **CombatTab**: Rage active shows details panel with 3 info lines
- [ ] **CombatTab**: Short rest (Settings) recovers +1 Rage use
- [ ] **SheetTab**: Passive badges show correct values (Percepción Pasiva 13, Perspicacia Pasiva 11, Investigación Pasiva 9)
- [ ] **SheetTab**: Skill grouping toggle switches between A–Z and grouped view
- [ ] **SheetTab**: Large Form NOT shown at level 1 (level-gated to 5)
- [ ] **SheetTab**: Stone's Endurance feature shows in Rasgos
- [ ] **SheetTab**: Rage description is updated XPHB text
- [ ] **iOS**: Tapping an input does not zoom in
- [ ] **iOS**: Pinch-to-zoom works on all tabs
- [ ] **Nav**: Island floats higher above bottom edge
