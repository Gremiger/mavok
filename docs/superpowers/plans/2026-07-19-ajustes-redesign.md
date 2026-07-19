# Ajustes Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert every plain settings-row button in `SettingsTab.tsx` to `CompactRow`, replace two theming-breaking native `confirm()` dialogs with in-app Modals, replace one native `alert()` with `toast.error()`, and converge the Google Drive connection status and active-theme indicator onto already-established shared-component idioms (`Tag`, Inventario's checkmark badge).

**Architecture:** Eight sequential edits to a single file (`src/components/tabs/SettingsTab.tsx`), each scoped to one `CollapsibleSection` or one confirmation flow. All edits are independent of each other (different regions of the file, no shared "Find" anchors between tasks) except that both confirm()→Modal tasks add to the same block of `useState` declarations near the top of the component, so they must land in the order given below.

**Tech Stack:** Next.js 15 client component, Tailwind CSS v4, existing shared components `CompactRow` (`src/components/ui/CompactRow.tsx`) and `Tag` (`src/components/ui/Tag.tsx`).

## Global Constraints

- Full design spec: `docs/superpowers/specs/2026-07-19-ajustes-redesign-design.md`.
- Scope is `src/components/tabs/SettingsTab.tsx` only.
- Every task must end passing: `npx tsc --noEmit && npm run build && npm run lint && npm test`.
- Portrait row and the `/print` `Link` are explicitly NOT converted to `CompactRow` (composite avatar+button layout `CompactRow` doesn't fit; real anchor semantics needed for navigation, respectively) — do not touch them in any task.
- Changelog section, the Nivel section's centered stat display, and the About section are explicitly out of scope — do not touch them.
- Manual verification after every task: `npm run dev`, open the app, switch to each of the 3 active themes (`piedra-viva`, `pergamino`, `furia-de-sangre`) and both densities via the Ajustes tab itself.
- Commit messages in this round are prefixed `Feature UI-Redesign-PT7: `.
- `public/sw.js` will show as modified after every verification build (commit-hash stamp) — discard with `git checkout -- public/sw.js` before each task's real commit, it is not part of any task's diff.

---

## Task 1: Add CompactRow import + convert Tema section

**Files:**
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Consumes: `CompactRow` (`src/components/ui/CompactRow.tsx`, props `{ name: ReactNode; meta?: ReactNode; right: ReactNode; onClick?: () => void; dim?: boolean }`), already used throughout Inventario/Notas/Enciclopedia.
- Produces: nothing consumed by later tasks — this task's `import { CompactRow } ...` line is reused (not re-added) by Tasks 2-7, which assume it's already present.

- [ ] **Step 1: Add the import**

Find:

```tsx
import { Modal } from "@/components/ui/Modal";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
```

Replace with:

```tsx
import { Modal } from "@/components/ui/Modal";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { CompactRow } from "@/components/ui/CompactRow";
```

- [ ] **Step 2: Convert the Tema section**

Find:

```tsx
      {/* Theme */}
      <CollapsibleSection title="Tema" defaultOpen>
        <div className="space-y-2">
          {THEME_META.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className="w-full flex items-center justify-between p-3 bg-card rounded-lg border border-border"
            >
              <span className="flex items-center gap-2 text-sm">
                <span
                  className="w-3 h-3 rounded-full border border-border/60 shrink-0"
                  style={{ backgroundColor: t.swatch }}
                />
                {t.label}
              </span>
              {theme === t.id ? (
                <span className="text-xs text-accent">Activo</span>
              ) : (
                <span className="text-xs text-muted">Tap para cambiar</span>
              )}
            </button>
          ))}
          <button
            onClick={toggleDensity}
            className="w-full flex items-center justify-between p-3 bg-card rounded-lg border border-border"
          >
            <span className="text-sm">
              {density === "compact" ? "Compacto" : "Espacioso"}
            </span>
            <span className="text-xs text-muted">Tap para cambiar</span>
          </button>
          <button
            onClick={() =>
              setMagicItemIndicator(
                magicItemIndicator === "number-only"
                  ? "explicit-tag"
                  : "number-only"
              )
            }
            className="w-full flex items-center justify-between p-3 bg-card rounded-lg border border-border"
          >
            <span className="text-sm">
              Indicador de bonos mágicos:{" "}
              {magicItemIndicator === "explicit-tag"
                ? "Etiqueta explícita"
                : "Solo número"}
            </span>
            <span className="text-xs text-muted">Tap para cambiar</span>
          </button>
        </div>
      </CollapsibleSection>
```

Replace with:

```tsx
      {/* Theme */}
      <CollapsibleSection title="Tema" defaultOpen>
        <div className="space-y-2">
          {THEME_META.map((t) => (
            <CompactRow
              key={t.id}
              onClick={() => setTheme(t.id)}
              name={
                <span className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full border border-border/60 shrink-0"
                    style={{ backgroundColor: t.swatch }}
                  />
                  {t.label}
                </span>
              }
              right={
                theme === t.id ? (
                  <span className="w-5 h-5 rounded border-2 border-accent bg-accent text-white flex items-center justify-center text-xs">
                    ✓
                  </span>
                ) : (
                  <span className="text-xs text-muted">Tap para cambiar</span>
                )
              }
            />
          ))}
          <CompactRow
            onClick={toggleDensity}
            name={density === "compact" ? "Compacto" : "Espacioso"}
            right={<span className="text-xs text-muted">Tap para cambiar</span>}
          />
          <CompactRow
            onClick={() =>
              setMagicItemIndicator(
                magicItemIndicator === "number-only"
                  ? "explicit-tag"
                  : "number-only"
              )
            }
            name={`Indicador de bonos mágicos: ${
              magicItemIndicator === "explicit-tag" ? "Etiqueta explícita" : "Solo número"
            }`}
            right={<span className="text-xs text-muted">Tap para cambiar</span>}
          />
        </div>
      </CollapsibleSection>
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass.

- [ ] **Step 4: Manual check**

`npm run dev`, Ajustes tab. Confirm the three theme rows render with the swatch dot + label on the left; the currently-active theme shows a filled checkmark badge on the right (matching Inventario's equipped-item checkmark look), inactive themes show "Tap para cambiar". Tap a different theme — confirm it switches and the checkmark moves. Confirm density and magic-indicator rows still toggle correctly. Check across all 3 themes and both densities.

- [ ] **Step 5: Commit**

```bash
git checkout -- public/sw.js
git add src/components/tabs/SettingsTab.tsx
git commit -m "Feature UI-Redesign-PT7: convert Tema section to CompactRow with checkmark indicator"
```

---

## Task 2: Convert Descanso section

**Files:**
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Consumes: `CompactRow` from Task 1's import.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Convert the three rest rows**

Find:

```tsx
      {/* Rest */}
      <CollapsibleSection title="Descanso" defaultOpen>
        <div className="space-y-2">
          <button
            onClick={() => {
              setShortRestLog([]);
              setShortRestOpen(true);
            }}
            className="w-full p-3 bg-card rounded-lg border border-border text-left"
          >
            <span className="font-heading text-accent text-sm">
              Descanso corto
            </span>
            <span className="text-xs text-muted block mt-0.5">
              Gastar dados de golpe · Recuperar 1 Rage
            </span>
          </button>
          <button
            onClick={() => setLongRestOpen(true)}
            className="w-full p-3 bg-card rounded-lg border border-border text-left"
          >
            <span className="font-heading text-accent text-sm">
              Descanso largo
            </span>
            <span className="text-xs text-muted block mt-0.5">
              Recuperar HP, rage, dados de golpe
            </span>
          </button>
          <button
            onClick={() => setWeaponMasteryOpen(true)}
            className="w-full p-3 bg-card rounded-lg border border-border text-left"
          >
            <span className="font-heading text-accent text-sm">
              Practicar con armas
            </span>
            <span className="text-xs text-muted block mt-0.5">
              {character.weaponMasteryUsedThisRest
                ? "⚠️ Ya practicaste este descanso largo — esto no sigue las reglas"
                : "Cambiar una maestría de arma (1 por descanso largo)"}
            </span>
          </button>
        </div>
      </CollapsibleSection>
```

Replace with:

```tsx
      {/* Rest */}
      <CollapsibleSection title="Descanso" defaultOpen>
        <div className="space-y-2">
          <CompactRow
            onClick={() => {
              setShortRestLog([]);
              setShortRestOpen(true);
            }}
            name={<span className="font-heading text-accent">Descanso corto</span>}
            meta="Gastar dados de golpe · Recuperar 1 Rage"
            right={null}
          />
          <CompactRow
            onClick={() => setLongRestOpen(true)}
            name={<span className="font-heading text-accent">Descanso largo</span>}
            meta="Recuperar HP, rage, dados de golpe"
            right={null}
          />
          <CompactRow
            onClick={() => setWeaponMasteryOpen(true)}
            name={<span className="font-heading text-accent">Practicar con armas</span>}
            meta={
              character.weaponMasteryUsedThisRest
                ? "⚠️ Ya practicaste este descanso largo — esto no sigue las reglas"
                : "Cambiar una maestría de arma (1 por descanso largo)"
            }
            right={null}
          />
        </div>
      </CollapsibleSection>
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass.

- [ ] **Step 3: Manual check**

`npm run dev`, Ajustes tab. Confirm all three rows show a heading-styled title with a muted description line below, and each opens its correct modal (Short Rest, Long Rest, Weapon Mastery). If `weaponMasteryUsedThisRest` is true in the current save, confirm the warning text shows instead of the normal description. Check across all 3 themes and both densities.

- [ ] **Step 4: Commit**

```bash
git checkout -- public/sw.js
git add src/components/tabs/SettingsTab.tsx
git commit -m "Feature UI-Redesign-PT7: convert Descanso section to CompactRow"
```

---

## Task 3: Convert Acciones rápidas and Historial de niveles sections

**Files:**
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Consumes: `CompactRow` from Task 1's import.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Convert the Quick Actions row**

Find:

```tsx
      {/* Quick Actions */}
      <CollapsibleSection title="Acciones rápidas">
        <p className="text-sm text-muted mb-3">
          Elegí qué acciones aparecen en el botón flotante de Ficha y Combate.
        </p>
        <button
          onClick={() => setQuickActionsPickerOpen(true)}
          className="w-full py-2 bg-card border border-border rounded-lg text-sm text-foreground hover:border-accent"
        >
          Configurar ({character.quickActions.length}/5)
        </button>
      </CollapsibleSection>
```

Replace with:

```tsx
      {/* Quick Actions */}
      <CollapsibleSection title="Acciones rápidas">
        <p className="text-sm text-muted mb-3">
          Elegí qué acciones aparecen en el botón flotante de Ficha y Combate.
        </p>
        <CompactRow
          onClick={() => setQuickActionsPickerOpen(true)}
          name="Configurar"
          right={<span className="text-xs text-muted">{character.quickActions.length}/5</span>}
        />
      </CollapsibleSection>
```

- [ ] **Step 2: Convert the Level History row**

Find:

```tsx
      {/* Level-up History */}
      <CollapsibleSection title="Historial de niveles">
        <button
          onClick={() => setLevelUpHistoryOpen(true)}
          className="w-full py-2 bg-card border border-border rounded-lg text-sm text-foreground hover:border-accent"
        >
          Ver historial completo
        </button>
      </CollapsibleSection>
```

Replace with:

```tsx
      {/* Level-up History */}
      <CollapsibleSection title="Historial de niveles">
        <CompactRow
          onClick={() => setLevelUpHistoryOpen(true)}
          name="Ver historial completo"
          right={null}
        />
      </CollapsibleSection>
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass.

- [ ] **Step 4: Manual check**

`npm run dev`, Ajustes tab. Confirm "Configurar" opens the Quick Actions picker and shows the correct count on the right (e.g. "3/5"). Confirm "Ver historial completo" opens the Level-up History modal. Check across all 3 themes and both densities.

- [ ] **Step 5: Commit**

```bash
git checkout -- public/sw.js
git add src/components/tabs/SettingsTab.tsx
git commit -m "Feature UI-Redesign-PT7: convert Acciones rapidas and Historial de niveles rows to CompactRow"
```

---

## Task 4: Convert Datos section

**Files:**
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Consumes: `CompactRow` from Task 1's import.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Convert the four export/import rows, leave the Print/PDF Link untouched**

Find:

```tsx
      {/* Import / Export */}
      <CollapsibleSection title="Datos">
        <div className="space-y-2">
          <button
            onClick={() => exportCharacterJSON(character)}
            className="w-full p-3 bg-card rounded-lg border border-border text-left text-sm"
          >
            Exportar datos (JSON)
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-3 bg-card rounded-lg border border-border text-left text-sm"
          >
            Importar datos (JSON)
          </button>
          <button
            onClick={() => exportInventoryCSV(character.inventory)}
            className="w-full p-3 bg-card rounded-lg border border-border text-left text-sm"
          >
            Exportar inventario (CSV)
          </button>
          <button
            onClick={() => exportQuickNotes(character.notes.quick)}
            className="w-full p-3 bg-card rounded-lg border border-border text-left text-sm"
          >
            Exportar notas rápidas (TXT)
          </button>
          <Link
            href="/print"
            className="block w-full p-3 bg-card rounded-lg border border-border text-left text-sm"
          >
            Imprimir / Exportar PDF
          </Link>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
              e.target.value = "";
            }}
          />
        </div>
      </CollapsibleSection>
```

Replace with:

```tsx
      {/* Import / Export */}
      <CollapsibleSection title="Datos">
        <div className="space-y-2">
          <CompactRow onClick={() => exportCharacterJSON(character)} name="Exportar datos (JSON)" right={null} />
          <CompactRow onClick={() => fileInputRef.current?.click()} name="Importar datos (JSON)" right={null} />
          <CompactRow onClick={() => exportInventoryCSV(character.inventory)} name="Exportar inventario (CSV)" right={null} />
          <CompactRow onClick={() => exportQuickNotes(character.notes.quick)} name="Exportar notas rápidas (TXT)" right={null} />
          <Link
            href="/print"
            className="block w-full p-3 bg-card rounded-lg border border-border text-left text-sm"
          >
            Imprimir / Exportar PDF
          </Link>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
              e.target.value = "";
            }}
          />
        </div>
      </CollapsibleSection>
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass.

- [ ] **Step 3: Manual check**

`npm run dev`, Ajustes tab. Confirm the four export/import rows still trigger their file download/picker actions. Confirm "Imprimir / Exportar PDF" is still a real `<a>` tag (right-click it — confirm "Open in new tab" appears in the context menu, which only shows for real links) and navigates to `/print`. Check across all 3 themes and both densities.

- [ ] **Step 4: Commit**

```bash
git checkout -- public/sw.js
git add src/components/tabs/SettingsTab.tsx
git commit -m "Feature UI-Redesign-PT7: convert Datos section rows to CompactRow"
```

---

## Task 5: Convert Google Drive section + Tag badge

**Files:**
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Consumes: `CompactRow` from Task 1's import; `Tag` (`src/components/ui/Tag.tsx`, props `{ label: string; onRemove?: () => void; onClick?: () => void; variant?: "default" | "success" | "danger" }`), already used in `QuestList.tsx` for status badges.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the Tag import**

Find:

```tsx
import { CompactRow } from "@/components/ui/CompactRow";
```

Replace with:

```tsx
import { CompactRow } from "@/components/ui/CompactRow";
import { Tag } from "@/components/ui/Tag";
```

- [ ] **Step 2: Convert the Google Drive section**

Find:

```tsx
      {/* Google Drive backup */}
      <CollapsibleSection title="Backup en Google Drive">
        {!drive.driveToken ? (
          <div className="space-y-2">
            <p className="text-xs text-muted">
              Guardá una copia de tus datos en tu Google Drive, accesible
              desde cualquier dispositivo.
            </p>
            {isRunningAsStandalonePWA() ? (
              <p className="text-xs text-danger">
                Abrí Mavok en una pestaña normal del navegador (no desde el
                ícono instalado) para conectar Google Drive — esta acción no
                funciona de forma confiable en modo app instalada.
              </p>
            ) : (
              <>
                <button
                  onClick={() => drive.connect(googleClientId)}
                  disabled={drive.driveConnecting}
                  className="w-full p-3 bg-card rounded-lg border border-border text-left text-sm disabled:opacity-50"
                >
                  {drive.driveConnecting
                    ? "Conectando..."
                    : "Conectar con Google Drive"}
                </button>
                {!googleClientId && (
                  <p className="text-xs text-danger">
                    Falta configurar NEXT_PUBLIC_GOOGLE_CLIENT_ID.
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-success">Google Drive conectado</p>
            <button
              onClick={() => drive.backup(character)}
              disabled={drive.driveBackingUp}
              className="w-full p-3 bg-card rounded-lg border border-border text-left text-sm disabled:opacity-50"
            >
              {drive.driveBackingUp ? "Subiendo..." : "Subir a Google Drive"}
            </button>
            <button
              onClick={() => {
                if (drive.driveBackups === null) drive.loadBackups();
              }}
              className="w-full p-3 bg-card rounded-lg border border-border text-left text-sm"
            >
              Restaurar desde Google Drive
            </button>
            {drive.driveBackupsLoading && (
              <p className="text-xs text-muted text-center py-2">
                Cargando...
              </p>
            )}
            {drive.driveBackups !== null &&
              !drive.driveBackupsLoading &&
              (drive.driveBackups.length === 0 ? (
                <p className="text-xs text-muted text-center py-2">
                  No hay backups en Google Drive todavía.
                </p>
              ) : (
                <div className="space-y-1">
                  {drive.driveBackups.map((f) => {
                    const ts = parseBackupTimestamp(f.name);
                    return (
                      <div
                        key={f.id}
                        className="flex items-center justify-between p-2 bg-card rounded-lg border border-border"
                      >
                        <span className="text-xs text-foreground">
                          {ts ? ts.toLocaleString("es") : f.name}
                        </span>
                        <button
                          onClick={() => handleDriveRestore(f)}
                          disabled={drive.driveRestoringId === f.id}
                          className="text-xs text-accent hover:underline disabled:opacity-50"
                        >
                          {drive.driveRestoringId === f.id
                            ? "Restaurando..."
                            : "Restaurar"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
          </div>
        )}
      </CollapsibleSection>
```

Replace with:

```tsx
      {/* Google Drive backup */}
      <CollapsibleSection title="Backup en Google Drive">
        {!drive.driveToken ? (
          <div className="space-y-2">
            <p className="text-xs text-muted">
              Guardá una copia de tus datos en tu Google Drive, accesible
              desde cualquier dispositivo.
            </p>
            {isRunningAsStandalonePWA() ? (
              <p className="text-xs text-danger">
                Abrí Mavok en una pestaña normal del navegador (no desde el
                ícono instalado) para conectar Google Drive — esta acción no
                funciona de forma confiable en modo app instalada.
              </p>
            ) : (
              <>
                <CompactRow
                  onClick={drive.driveConnecting ? undefined : () => drive.connect(googleClientId)}
                  dim={drive.driveConnecting}
                  name={drive.driveConnecting ? "Conectando..." : "Conectar con Google Drive"}
                  right={null}
                />
                {!googleClientId && (
                  <p className="text-xs text-danger">
                    Falta configurar NEXT_PUBLIC_GOOGLE_CLIENT_ID.
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Tag label="Google Drive conectado" variant="success" />
            <CompactRow
              onClick={drive.driveBackingUp ? undefined : () => drive.backup(character)}
              dim={drive.driveBackingUp}
              name={drive.driveBackingUp ? "Subiendo..." : "Subir a Google Drive"}
              right={null}
            />
            <CompactRow
              onClick={() => {
                if (drive.driveBackups === null) drive.loadBackups();
              }}
              name="Restaurar desde Google Drive"
              right={null}
            />
            {drive.driveBackupsLoading && (
              <p className="text-xs text-muted text-center py-2">
                Cargando...
              </p>
            )}
            {drive.driveBackups !== null &&
              !drive.driveBackupsLoading &&
              (drive.driveBackups.length === 0 ? (
                <p className="text-xs text-muted text-center py-2">
                  No hay backups en Google Drive todavía.
                </p>
              ) : (
                <div className="space-y-1">
                  {drive.driveBackups.map((f) => {
                    const ts = parseBackupTimestamp(f.name);
                    return (
                      <CompactRow
                        key={f.id}
                        name={ts ? ts.toLocaleString("es") : f.name}
                        right={
                          <button
                            onClick={() => handleDriveRestore(f)}
                            disabled={drive.driveRestoringId === f.id}
                            className="text-xs text-accent hover:underline disabled:opacity-50"
                          >
                            {drive.driveRestoringId === f.id
                              ? "Restaurando..."
                              : "Restaurar"}
                          </button>
                        }
                      />
                    );
                  })}
                </div>
              ))}
          </div>
        )}
      </CollapsibleSection>
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass.

- [ ] **Step 4: Manual check**

`npm run dev`, Ajustes tab. If not connected to Google Drive: confirm the "Conectar con Google Drive" row renders and (if `NEXT_PUBLIC_GOOGLE_CLIENT_ID` isn't configured locally) shows the missing-config warning. If connected (or after connecting): confirm "Google Drive conectado" now renders as a green `Tag` pill instead of plain text, "Subir a Google Drive" and "Restaurar desde Google Drive" rows work, and any existing backups list as rows with a working "Restaurar" link on the right. Check across all 3 themes and both densities.

- [ ] **Step 5: Commit**

```bash
git checkout -- public/sw.js
git add src/components/tabs/SettingsTab.tsx
git commit -m "Feature UI-Redesign-PT7: convert Google Drive section to CompactRow, status to Tag badge"
```

---

## Task 6: Backups automáticos — CompactRow + confirm() → Modal

**Files:**
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Consumes: `CompactRow` from Task 1's import; `Modal` (already imported at the top of the file).
- Produces: `restoringBackupKey: string | null` state — not consumed by any later task in this plan, but must not collide with Task 7's new state (different variable name, added in a separate step below).

- [ ] **Step 1: Add the `restoringBackupKey` state**

Find:

```tsx
  const [levelUpHistoryOpen, setLevelUpHistoryOpen] = useState(false);
```

Replace with:

```tsx
  const [levelUpHistoryOpen, setLevelUpHistoryOpen] = useState(false);
  const [restoringBackupKey, setRestoringBackupKey] = useState<string | null>(null);
```

- [ ] **Step 2: Convert the backup rows and remove the inline `confirm()`**

Find:

```tsx
      {/* Backups */}
      <CollapsibleSection title="Backups automáticos">
        <div className="space-y-2">
          {getBackups().length === 0 ? (
            <p className="text-xs text-muted text-center py-2">
              Los backups se crean automáticamente antes de cada migración de datos.
            </p>
          ) : (
            getBackups().map((b) => (
              <div
                key={b.key}
                className="flex items-center justify-between p-2 bg-card rounded-lg border border-border"
              >
                <div>
                  <span className="text-xs text-foreground">v{b.version}</span>
                  <span className="text-xs text-muted ml-2">
                    {b.date.toLocaleString("es")}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (confirm("¿Restaurar este backup? Se reemplazarán los datos actuales.")) {
                      const key = getCharacterStorageKey(character.id);
                      if (restoreBackup(b.key, key)) {
                        toast.success("Backup restaurado — recargando...");
                        setTimeout(() => window.location.reload(), 500);
                      } else {
                        toast.error("Error al restaurar backup");
                      }
                    }
                  }}
                  className="text-xs text-accent hover:underline"
                >
                  Restaurar
                </button>
              </div>
            ))
          )}
        </div>
      </CollapsibleSection>
```

Replace with:

```tsx
      {/* Backups */}
      <CollapsibleSection title="Backups automáticos">
        <div className="space-y-2">
          {getBackups().length === 0 ? (
            <p className="text-xs text-muted text-center py-2">
              Los backups se crean automáticamente antes de cada migración de datos.
            </p>
          ) : (
            getBackups().map((b) => (
              <CompactRow
                key={b.key}
                name={
                  <>
                    <span>v{b.version}</span>
                    <span className="text-muted ml-2">{b.date.toLocaleString("es")}</span>
                  </>
                }
                right={
                  <button
                    onClick={() => setRestoringBackupKey(b.key)}
                    className="text-xs text-accent hover:underline"
                  >
                    Restaurar
                  </button>
                }
              />
            ))
          )}
        </div>
      </CollapsibleSection>
```

- [ ] **Step 3: Add the confirmation Modal**

Find:

```tsx
      {/* Import Preview Modal */}
      <Modal
        open={!!importPreview}
        onClose={() => setImportPreview(null)}
        title="Importar personaje"
      >
```

Replace with:

```tsx
      {/* Restore Local Backup Confirmation */}
      <Modal
        open={restoringBackupKey !== null}
        onClose={() => setRestoringBackupKey(null)}
        title="Restaurar backup"
      >
        <div className="space-y-3">
          <p className="text-sm">
            ¿Restaurar este backup? Se reemplazarán los datos actuales.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setRestoringBackupKey(null)}
              className="flex-1 py-2 text-sm border border-border rounded-lg text-muted"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (!restoringBackupKey) return;
                const key = getCharacterStorageKey(character.id);
                if (restoreBackup(restoringBackupKey, key)) {
                  toast.success("Backup restaurado — recargando...");
                  setTimeout(() => window.location.reload(), 500);
                } else {
                  toast.error("Error al restaurar backup");
                }
                setRestoringBackupKey(null);
              }}
              className="flex-1 py-2 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Preview Modal */}
      <Modal
        open={!!importPreview}
        onClose={() => setImportPreview(null)}
        title="Importar personaje"
      >
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass.

- [ ] **Step 5: Manual check**

`npm run dev`, Ajustes tab. If no local backups exist yet, trigger one first (any data-migrating action, or check `getBackups()` via devtools) — or verify the empty-state message still shows correctly if none exist. With at least one backup: tap "Restaurar" — confirm an in-app themed Modal opens (not a native browser `confirm()` popup). Tap "Cancelar" — confirm it closes with no changes. Tap "Restaurar" again, then "Confirmar" — confirm the page reloads with the backup restored. Check across all 3 themes and both densities.

- [ ] **Step 6: Commit**

```bash
git checkout -- public/sw.js
git add src/components/tabs/SettingsTab.tsx
git commit -m "Feature UI-Redesign-PT7: replace local-backup restore confirm() with an in-app Modal"
```

---

## Task 7: Bajar de nivel — confirm() → Modal

**Files:**
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Consumes: `Modal` (already imported).
- Produces: `levelDownConfirmOpen: boolean` state — not consumed by any later task.

- [ ] **Step 1: Add the `levelDownConfirmOpen` state**

Find:

```tsx
  const [levelUpHistoryOpen, setLevelUpHistoryOpen] = useState(false);
  const [restoringBackupKey, setRestoringBackupKey] = useState<string | null>(null);
```

Replace with:

```tsx
  const [levelUpHistoryOpen, setLevelUpHistoryOpen] = useState(false);
  const [restoringBackupKey, setRestoringBackupKey] = useState<string | null>(null);
  const [levelDownConfirmOpen, setLevelDownConfirmOpen] = useState(false);
```

- [ ] **Step 2: Simplify the "Bajar de nivel" button**

Find:

```tsx
          {character.meta.level > 1 && (
            <button
              onClick={() => {
                if (confirm(`¿Bajar a nivel ${character.meta.level - 1}? Esto revertirá los cambios del último nivel.`)) {
                  update((c) => {
                    const prev = structuredClone(c);
                    prev.meta.level -= 1;
                    const PROF_BY_LEVEL = [2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6];
                    prev.meta.proficiencyBonus = PROF_BY_LEVEL[prev.meta.level - 1];
                    prev.resources.stoneEndurance.total = PROF_BY_LEVEL[prev.meta.level - 1];
                    prev.resources.stoneEndurance.remaining = Math.min(
                      prev.resources.stoneEndurance.remaining,
                      PROF_BY_LEVEL[prev.meta.level - 1]
                    );
                    const RAGES_BY_LEVEL = [2,2,3,3,3,4,4,4,4,4,4,5,5,5,5,5,6,6,6,6];
                    prev.resources.rpiRages.total = RAGES_BY_LEVEL[prev.meta.level - 1];
                    prev.resources.rpiRages.remaining = Math.min(prev.resources.rpiRages.remaining, prev.resources.rpiRages.total);
                    prev.resources.rpiRages.slots = Array(prev.resources.rpiRages.total).fill(false).map((_, i) => i < prev.resources.rpiRages.remaining);
                    prev.combat.hitDice.total = prev.meta.level;
                    prev.combat.hitDice.remaining = Math.min(prev.combat.hitDice.remaining, prev.combat.hitDice.total);
                    prev.features = prev.features.filter(f => f.level <= prev.meta.level);
                    if (prev.meta.level < 3) prev.meta.subclass = null;
                    prev.levelUpHistory = prev.levelUpHistory.slice(0, -1);
                    return prev;
                  });
                }
              }}
              className="mt-2 text-xs text-muted hover:text-danger"
            >
              Bajar de nivel
            </button>
          )}
```

Replace with:

```tsx
          {character.meta.level > 1 && (
            <button
              onClick={() => setLevelDownConfirmOpen(true)}
              className="mt-2 text-xs text-muted hover:text-danger"
            >
              Bajar de nivel
            </button>
          )}
```

- [ ] **Step 3: Add the confirmation Modal**

Find:

```tsx
      {/* Restore Local Backup Confirmation */}
      <Modal
        open={restoringBackupKey !== null}
```

Replace with:

```tsx
      {/* Level Down Confirmation */}
      <Modal
        open={levelDownConfirmOpen}
        onClose={() => setLevelDownConfirmOpen(false)}
        title="Bajar de nivel"
      >
        <div className="space-y-3">
          <p className="text-sm">
            ¿Bajar a nivel {character.meta.level - 1}? Esto revertirá los
            cambios del último nivel.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setLevelDownConfirmOpen(false)}
              className="flex-1 py-2 text-sm border border-border rounded-lg text-muted"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                update((c) => {
                  const prev = structuredClone(c);
                  prev.meta.level -= 1;
                  const PROF_BY_LEVEL = [2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6];
                  prev.meta.proficiencyBonus = PROF_BY_LEVEL[prev.meta.level - 1];
                  prev.resources.stoneEndurance.total = PROF_BY_LEVEL[prev.meta.level - 1];
                  prev.resources.stoneEndurance.remaining = Math.min(
                    prev.resources.stoneEndurance.remaining,
                    PROF_BY_LEVEL[prev.meta.level - 1]
                  );
                  const RAGES_BY_LEVEL = [2,2,3,3,3,4,4,4,4,4,4,5,5,5,5,5,6,6,6,6];
                  prev.resources.rpiRages.total = RAGES_BY_LEVEL[prev.meta.level - 1];
                  prev.resources.rpiRages.remaining = Math.min(prev.resources.rpiRages.remaining, prev.resources.rpiRages.total);
                  prev.resources.rpiRages.slots = Array(prev.resources.rpiRages.total).fill(false).map((_, i) => i < prev.resources.rpiRages.remaining);
                  prev.combat.hitDice.total = prev.meta.level;
                  prev.combat.hitDice.remaining = Math.min(prev.combat.hitDice.remaining, prev.combat.hitDice.total);
                  prev.features = prev.features.filter(f => f.level <= prev.meta.level);
                  if (prev.meta.level < 3) prev.meta.subclass = null;
                  prev.levelUpHistory = prev.levelUpHistory.slice(0, -1);
                  return prev;
                });
                setLevelDownConfirmOpen(false);
              }}
              className="flex-1 py-2 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>

      {/* Restore Local Backup Confirmation */}
      <Modal
        open={restoringBackupKey !== null}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass.

- [ ] **Step 5: Manual check**

`npm run dev`, Ajustes tab. If the current character is level 1, temporarily bump the level (via `localStorage` — same technique as Phase 4's rageDamage verification — set `meta.level` to something higher, reload) so "Bajar de nivel" is visible. Tap it: confirm an in-app themed Modal opens (not a native `confirm()` popup) showing the target level. Tap "Cancelar" — confirm it closes with no level change. Tap "Bajar de nivel" again, then "Confirmar" — confirm the level actually decrements. Revert any temporary level change made for testing. Check across all 3 themes and both densities.

- [ ] **Step 6: Commit**

```bash
git checkout -- public/sw.js
git add src/components/tabs/SettingsTab.tsx
git commit -m "Feature UI-Redesign-PT7: replace level-down confirm() with an in-app Modal"
```

---

## Task 8: alert() → toast.error()

**Files:**
- Modify: `src/components/tabs/SettingsTab.tsx`

**Interfaces:**
- Consumes: `toast` from `sonner`, already imported at the top of the file.
- Produces: nothing consumed by later tasks (last task).

- [ ] **Step 1: Replace the alert()**

Find:

```tsx
  async function handleImport(file: File) {
    try {
      const data = await importCharacterJSON(file);
      setImportPreview({
        name: data.meta?.name || "Desconocido",
        level: data.meta?.level || 0,
        data,
      });
    } catch {
      alert("Error al leer el archivo JSON");
    }
  }
```

Replace with:

```tsx
  async function handleImport(file: File) {
    try {
      const data = await importCharacterJSON(file);
      setImportPreview({
        name: data.meta?.name || "Desconocido",
        level: data.meta?.level || 0,
        data,
      });
    } catch {
      toast.error("Error al leer el archivo JSON");
    }
  }
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: all four pass.

- [ ] **Step 3: Manual check**

`npm run dev`, Ajustes tab → Datos → "Importar datos (JSON)". Select a non-JSON file (or a `.json` file with invalid/corrupt content, e.g. a text file renamed to `.json`). Confirm a themed `toast.error` notification appears (matching the app's other error toasts) instead of a native browser `alert()` popup. Check across all 3 themes.

- [ ] **Step 4: Commit**

```bash
git checkout -- public/sw.js
git add src/components/tabs/SettingsTab.tsx
git commit -m "Feature UI-Redesign-PT7: replace JSON import alert() with toast.error()"
```

---

## Final Verification

After all eight tasks:

```bash
npx tsc --noEmit && npm run build && npm run lint && npm test
```

Manually re-walk the full spec's Verification section end-to-end across all 3 active themes and both densities, then hand off to **superpowers:finishing-a-development-branch** to verify tests, present merge/PR/keep/discard options, and complete the branch.
