# Mavok Changelog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a read-only, hand-maintained "Historial de versiones" list to the Settings tab, showing how the app evolved across its 7 development rounds so far.

**Architecture:** One task. A new static data file (`src/data/changelog.ts`) holds the entries; a new `CollapsibleSection` in `SettingsTab.tsx` renders them as an expand/collapse list, following the existing `InventoryTab.tsx` single-open-item pattern. No character data is involved — this section renders unconditionally, independent of `useCharacterContext()`.

**Tech Stack:** Next.js 15 (App Router, static export), React 19, TypeScript, Tailwind CSS. No new dependencies.

## Global Constraints

- Spanish UI labels, English D&D terms where standard (existing convention) — this feature is pure Spanish app-meta copy, no D&D terms involved.
- No test suite exists in this repo. Verify every task with `npx tsc --noEmit && npm run build && npm run lint` — lint is required (only it catches React Hooks ordering violations, though this task adds no hooks beyond one `useState`).
- Never include a "Co-authored-by" trailer in commit messages.
- `npm run lint` currently reports exactly 7 pre-existing, documented errors (`react-hooks/purity` x4 in `RageTracker.tsx`, `react-hooks/set-state-in-effect` x1 each in `JournalList.tsx`, `useCharacter.ts`, `useTheme.ts`) — known/accepted debt. Don't treat them as regressions; only investigate a lint failure that's new.
- **`ChangelogEntry.date` is a plain `YYYY-MM-DD` string and must NEVER be routed through `new Date(entry.date).toLocaleDateString("es")`.** That's the convention used elsewhere in `SettingsTab.tsx` (level-up history, backups), but those store full ISO *timestamps*. Parsing a date-only string as a `Date` treats it as UTC midnight, and `toLocaleDateString` then renders it in the browser's local timezone — in any timezone behind UTC (e.g. Argentina, UTC-3), a `"2026-07-02"` entry would display as `"01/07/2026"`, one day early. Format the date-only string directly (see Task 1, Step 3).
- No data-model changes. `CURRENT_DATA_VERSION` stays at 4, `src/lib/migrations.ts` is untouched — this feature has no `Character` schema involvement at all.

---

### Task 1: Changelog data file and Settings UI

**Files:**
- Create: `src/data/changelog.ts`
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Consumes: nothing from other tasks (this is the only task in this plan).
- Produces: `ChangelogEntry` interface and `CHANGELOG: ChangelogEntry[]` array, exported from `src/data/changelog.ts`. Nothing outside this plan depends on it.

**Context:** `SettingsTab.tsx` currently ends with a "Backups automáticos" `CollapsibleSection` (lines 393-432) immediately followed by an "About" footer block (`{/* About */}` comment at line 434, showing "Mavok PWA", the character's name, the data version, and the commit SHA). The new section goes between those two — both are app-level metadata, and the About footer is the natural neighbor for "how did this app get here."

`InventoryTab.tsx` already establishes the exact interaction pattern to follow: a single `expandedItem: string | null` state, toggled via `expandedItem === item.id ? null : item.id` on tap, with the detail body conditionally rendered only when `expandedItem === item.id`.

- [ ] **Step 1: Create the changelog data file**

Create `src/data/changelog.ts`:

```typescript
export interface ChangelogEntry {
  version: string;
  date: string; // YYYY-MM-DD
  title: string;
  summary: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "v7",
    date: "2026-07-03",
    title: "Historial de versiones",
    summary: [
      "Nueva sección en Configuración para ver cómo fue evolucionando la app a través del tiempo",
    ],
  },
  {
    version: "v6",
    date: "2026-07-02",
    title: "Mecánicas de Bárbaro",
    summary: [
      "Tiradas con ventaja: Reckless Attack y Danger Sense (salvación de DES)",
      "Primal Knowledge: competencia extra al llegar a nivel 3, tirar con FUE mientras estás enfurecido",
      "Cambiar la maestría de un arma cada descanso largo",
      "Explorador de Dotes: ver requisitos antes de llegar a nivel 4",
    ],
  },
  {
    version: "v5",
    date: "2026-07-02",
    title: "Gestión avanzada",
    summary: [
      "Ataques personalizados: crear, editar y eliminar",
      "Editar entradas del diario",
      "Tags y vínculo con NPCs en las misiones",
      "Búsqueda por campos estructurados",
      "Indicador de estado offline",
      "Foto de perfil del personaje",
      "Historial de subidas de nivel",
      "Corrección de un crash al subir a nivel 20",
    ],
  },
  {
    version: "v4",
    date: "2026-07-01",
    title: "Pulido de ficha",
    summary: [
      "Insignia de Proficiency Bonus",
      "Sección de Dotes en la ficha",
      "Deshacer al eliminar objetos o notas",
      "Animación visual al usar recursos",
      "Exportar / imprimir la ficha en PDF",
    ],
  },
  {
    version: "v3",
    date: "2026-07-01",
    title: "Inventario y notas",
    summary: [
      "Búsqueda, orden y filtro por categoría en Inventario",
      "Mantener presionado \"Usar\" para corregir usos de Stone's Endurance / Healer's Kit",
      "Búsqueda en todas las notas",
    ],
  },
  {
    version: "v2",
    date: "2026-07-01",
    title: "Correcciones XPHB",
    summary: [
      "Corrección de datos según las reglas XPHB 2024 (Large Form, Rage, Giant Ancestry: Stone Giant, Stone's Endurance)",
      "Panel de detalles de Rage cuando está activo",
      "Agrupar habilidades por atributo, mostrar percepción pasiva y otras pasivas",
      "Ficha de Acciones, Bonus Actions y Reacciones completa",
      "Corrección de zoom táctil y navegación en iOS",
      "Migraciones de datos versionadas con backup automático",
    ],
  },
  {
    version: "v1",
    date: "2026-06-24",
    title: "Lanzamiento inicial",
    summary: [
      "Ficha completa: atributos, salvaciones, habilidades, competencias, rasgos",
      "Combate: HP, Rage (con casillas de fuego animadas), ataques, tirador de dados",
      "Inventario: monedas, objetos, capacidad de carga",
      "Notas: notas rápidas, mundo, NPCs, misiones, diario",
      "Sistema guiado de subida de nivel (subclase, ASI/dotes)",
      "Identidad visual \"Piedra Viva\": navegación flotante, textura de piedra, cordón trenzado",
      "Soporte offline instalable (PWA)",
    ],
  },
];
```

- [ ] **Step 2: Import the data and add expand/collapse state in `SettingsTab.tsx`**

Find:

```typescript
import { getBackups, restoreBackup } from "@/lib/migrations";
import { getCharacterStorageKey } from "@/lib/storage";
import { CURRENT_DATA_VERSION } from "@/lib/types";
```

Replace with:

```typescript
import { getBackups, restoreBackup } from "@/lib/migrations";
import { getCharacterStorageKey } from "@/lib/storage";
import { CURRENT_DATA_VERSION } from "@/lib/types";
import { CHANGELOG } from "@/data/changelog";
```

Find:

```typescript
  const [weaponMasteryOpen, setWeaponMasteryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
```

Replace with:

```typescript
  const [weaponMasteryOpen, setWeaponMasteryOpen] = useState(false);
  const [expandedChangelogEntry, setExpandedChangelogEntry] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
```

- [ ] **Step 3: Render the "Historial de versiones" section**

Find:

```tsx
      {/* About */}
      <div className="crack-divider mb-4" />
```

Replace with:

```tsx
      {/* Changelog */}
      <CollapsibleSection title="Historial de versiones">
        <div className="space-y-2">
          {CHANGELOG.map((entry) => {
            const [year, month, day] = entry.date.split("-");
            const displayDate = `${day}/${month}/${year}`;
            const isExpanded = expandedChangelogEntry === entry.version;
            return (
              <div
                key={entry.version}
                className="stone-card rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedChangelogEntry(
                      isExpanded ? null : entry.version
                    )
                  }
                  className="w-full flex items-center justify-between p-3 text-left"
                >
                  <div>
                    <span className="font-heading text-accent text-sm">
                      {entry.version}
                    </span>
                    <span className="text-sm ml-2">{entry.title}</span>
                  </div>
                  <span className="text-xs text-muted">{displayDate}</span>
                </button>
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-border pt-2">
                    <ul className="list-disc list-inside space-y-1 text-xs text-foreground/80">
                      {entry.summary.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* About */}
      <div className="crack-divider mb-4" />
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all PASS, with exactly the 7 pre-existing documented lint errors and no new ones.

- [ ] **Step 5: Manual verification (reasoning + human follow-up)**

Reason through the scenario statically: `CHANGELOG` has 7 entries, newest (`v7`) first; the "Historial de versiones" section renders between "Backups automáticos" and the "About" footer; each row shows `version · title · date` collapsed; tapping toggles `expandedChangelogEntry`, revealing that entry's `summary` bullets; tapping a different entry switches which one is open; tapping the open entry again closes it. Confirm `displayDate` for `v1` (`"2026-06-24"`) computes to `"24/06/2026"` (destructure `["2026", "06", "24"]` → `` `${day}/${month}/${year}` `` → `"24/06/2026"`) — correct, no timezone involved since this never touches `Date`.

A human should confirm in `npm run dev`: Settings tab shows the new section in the right position, tapping entries expands/collapses correctly, and the dates read correctly regardless of the browser's timezone.

- [ ] **Step 6: Commit**

```bash
git add src/data/changelog.ts src/components/tabs/SettingsTab.tsx
git commit -m "feat: add app changelog to Settings tab"
```

---

## Final Verification

```bash
npx tsc --noEmit && npm run build && npm run lint
```

Expected: all PASS, with exactly the 7 pre-existing documented lint errors and no new ones.
