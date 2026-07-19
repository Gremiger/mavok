# Ajustes Redesign (UI Redesign Phase 7) — Design

## Context

Final tab-by-tab round of the UI redesign, covering Ajustes (Settings) — the largest remaining tab (860 lines: theme/density/portrait, rest actions, quick actions, level up/down, level history, import/export, Google Drive backup, local backups, changelog, about). `CollapsibleSection` is already used consistently for every category and `Modal`/`stone-card` are already used correctly where they appear (Short/Long Rest modals, Import Preview modal, Changelog's expand-inline rows) — the structural shell is right. What's unconverted: nearly every row inside those sections is a hand-rolled `w-full p-3 bg-card rounded-lg border border-border text-left` button, predating this redesign series.

Scope was explored the same way as the Notas/Enciclopedia round (light pass first, then "what can go deeper"), and grew to include four structural fixes beyond row styling, all confirmed by re-reading the file: two native `confirm()` dialogs that don't respect the app's theming (real inconsistency against the in-app Modal-confirmation pattern this same file already uses for Long Rest and Import), one native `alert()` inconsistent with a sibling `catch` block four lines away that already uses `toast.error()`, a plain-text Google Drive connection status where the app already has a `Tag` component for exactly this, and a text-only "Activo" theme indicator where Inventario already established a checkmark-badge idiom for "this is the selected one."

**File in scope:** `src/components/tabs/SettingsTab.tsx` only — no other files.

## A. CompactRow conversions

Every plain settings-row button converts to `CompactRow`. Three deliberate exceptions, explained inline below.

### Tema (includes the checkmark indicator)

Find:

```tsx
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
```

Replace with:

```tsx
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
```

The checkmark badge (`w-5 h-5 rounded border-2 border-accent bg-accent text-white`, "✓" glyph) is a direct copy of Inventario's equipped-item indicator — same visual vocabulary for "this is the selected one."

### Retrato — exception, not converted

The portrait row is a `<button>` sitting beside an avatar image in a `flex items-center gap-3` composite layout. `CompactRow` renders its own full-width row and doesn't accept a sizing override (`flex-1`), so it can't sit correctly next to a fixed-width avatar without either breaking the layout or hand-duplicating `CompactRow`'s CSS just to add a width constraint. Left as its current hand-rolled button — this is the same category of judgment call as Inventario's search input (nothing established to converge on that actually fits the shape).

### Descanso

Find:

```tsx
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
```

Replace with:

```tsx
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
```

### Acciones rápidas

Find:

```tsx
        <button
          onClick={() => setQuickActionsPickerOpen(true)}
          className="w-full py-2 bg-card border border-border rounded-lg text-sm text-foreground hover:border-accent"
        >
          Configurar ({character.quickActions.length}/5)
        </button>
```

Replace with:

```tsx
        <CompactRow
          onClick={() => setQuickActionsPickerOpen(true)}
          name="Configurar"
          right={<span className="text-xs text-muted">{character.quickActions.length}/5</span>}
        />
```

### Historial de niveles

Find:

```tsx
        <button
          onClick={() => setLevelUpHistoryOpen(true)}
          className="w-full py-2 bg-card border border-border rounded-lg text-sm text-foreground hover:border-accent"
        >
          Ver historial completo
        </button>
```

Replace with:

```tsx
        <CompactRow
          onClick={() => setLevelUpHistoryOpen(true)}
          name="Ver historial completo"
          right={null}
        />
```

### Datos — Print/PDF exception

Find:

```tsx
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
```

Replace with:

```tsx
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
```

`/print` is real navigation to a static-export page, not an in-app action — `CompactRow` renders `<div role="button">`, not an `<a>`, which would break real anchor semantics (open-in-new-tab, screen readers, prefetch). Left as the existing styled `Link`, unchanged.

### Backup en Google Drive (includes the Tag badge)

Find:

```tsx
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
```

Replace with:

```tsx
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
```

The Google Drive backup-list rows never had an `onClick` on the row itself (only the nested "Restaurar" button is interactive) — `CompactRow` correctly renders as non-interactive (no `role`/`tabIndex`) whenever `onClick` isn't passed, so these rows get `name`/`right` only, matching that existing behavior exactly.

### Backups automáticos

Covered together with section B below, since the row conversion and the `confirm()` → Modal fix touch the same block.

## B. Native `confirm()` → in-app Modal (2 places)

Two places use `window.confirm()`: "Bajar de nivel" and the local-backup "Restaurar" button. (Google Drive restore is *not* one of these — it already funnels through the existing Import Preview modal via `handleDriveRestore` → `setImportPreview`, so it needs no change.) Both native dialogs render as unstyled OS chrome, ignoring the app's theme entirely — a real inconsistency against the Cancel/Confirmar Modal pattern this same file already uses for Long Rest and Import Preview.

### New state

Find:

```tsx
  const [levelUpHistoryOpen, setLevelUpHistoryOpen] = useState(false);
```

Replace with:

```tsx
  const [levelUpHistoryOpen, setLevelUpHistoryOpen] = useState(false);
  const [levelDownConfirmOpen, setLevelDownConfirmOpen] = useState(false);
  const [restoringBackupKey, setRestoringBackupKey] = useState<string | null>(null);
```

### Bajar de nivel

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

The level-down logic itself is unchanged — it moves into the new Modal's Confirmar button (shown below, in the "New Modals" step).

### Backups automáticos row

Find:

```tsx
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

### New Modals

Added alongside the existing modals at the bottom of the component (after the Import Preview modal):

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
```

## C. Native `alert()` → `toast.error()`

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

`toast` is already imported in this file (used by `handlePortraitUpload`'s sibling catch block four lines below this one, and throughout the rest of the file) — no new import needed.

## New imports

```tsx
import { CompactRow } from "@/components/ui/CompactRow";
import { Tag } from "@/components/ui/Tag";
```

## Out of scope

- Portrait row and the `/print` Link — explained inline above as deliberate exceptions.
- Changelog section — already uses `stone-card` + inline-expand, matching the established `AttackRow`/`QuestList`/`JournalList` pattern from earlier rounds. Not touched.
- Nivel section's centered level-number display and Subir de nivel/Dry Run buttons — a stat-display layout, not a list of rows; matches `CombatVitals`' "big number + action buttons" shape already. Only the "Bajar de nivel" confirmation (section B) changes here.
- About section — plain centered text block, not a row list.
- `CollapsibleSection` itself — already the correct, consistent wrapper for every category in this file.

## Verification

`npx tsc --noEmit && npm run build && npm run lint && npm test` must pass. Manually verify in the dev server across `piedra-viva`, `pergamino`, `furia-de-sangre`, and both densities:

- Tema: switching themes updates the checkmark badge correctly (only the active theme shows it); density and magic-indicator toggles still work.
- Descanso: all three rows still open their respective modal/action; meta text still shows the weapon-mastery warning when applicable.
- Acciones rápidas / Historial de niveles: rows still open their pickers/modals.
- Datos: all four export/import rows still trigger correctly; Print/PDF link still navigates to `/print` (confirm it's a real link — inspect that it's an `<a>` tag, not a `<div>`).
- Google Drive: not-connected state shows the connect row (and disables/dims it while connecting); connected state shows the `Tag` badge instead of plain text, upload/restore rows work, backup list rows show timestamp + working Restaurar button.
- Backups automáticos: tapping "Restaurar" opens the new confirmation Modal (not a native browser dialog); Cancelar closes without restoring; Confirmar restores and reloads.
- Nivel: tapping "Bajar de nivel" opens the new confirmation Modal (not a native browser dialog); Cancelar closes without changes; Confirmar applies the level-down and closes.
- Import JSON: select an invalid/corrupt file, confirm a `toast.error` appears (not a native `alert()` popup).
