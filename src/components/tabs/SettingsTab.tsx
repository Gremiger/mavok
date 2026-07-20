"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useCharacterContext, useGoogleDriveContext } from "@/lib/context";
import { useThemeContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { CompactRow } from "@/components/ui/CompactRow";
import { Tag } from "@/components/ui/Tag";
import { spendHitDie as computeHitDieSpend } from "@/lib/hitDice";
import { abilityModifier } from "@/lib/utils";
import { toast } from "sonner";
import {
  exportCharacterJSON,
  exportInventoryCSV,
  exportQuickNotes,
  importCharacterJSON,
} from "@/lib/export";
import {
  parseBackupTimestamp,
  isRunningAsStandalonePWA,
  type DriveFile,
} from "@/lib/googleDrive";
import { LevelUpFlow } from "@/components/levelup/LevelUpFlow";
import { WeaponMasteryModal } from "@/components/settings/WeaponMasteryModal";
import { QuickActionsPicker } from "@/components/ui/QuickActionsPicker";
import { LevelUpHistoryModal } from "@/components/settings/LevelUpHistoryModal";
import { getBackups, restoreBackup } from "@/lib/migrations";
import { getCharacterStorageKey } from "@/lib/storage";
import { CURRENT_DATA_VERSION } from "@/lib/types";
import { CHANGELOG } from "@/data/changelog";
import { THEME_META } from "@/hooks/useTheme";

export function SettingsTab() {
  const {
    character,
    lastSaved,
    update,
    updateCombat,
    updateMeta,
    updateQuickActions,
  } = useCharacterContext();
  const {
    theme,
    setTheme,
    density,
    toggleDensity,
    magicItemIndicator,
    setMagicItemIndicator,
  } = useThemeContext();
  const [shortRestOpen, setShortRestOpen] = useState(false);
  const [longRestOpen, setLongRestOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    name: string;
    level: number;
    data: ReturnType<typeof JSON.parse>;
  } | null>(null);
  const [shortRestLog, setShortRestLog] = useState<string[]>([]);
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [levelUpDryRun, setLevelUpDryRun] = useState(false);
  const [weaponMasteryOpen, setWeaponMasteryOpen] = useState(false);
  const [quickActionsPickerOpen, setQuickActionsPickerOpen] = useState(false);
  const [levelUpHistoryOpen, setLevelUpHistoryOpen] = useState(false);
  const [restoringBackupKey, setRestoringBackupKey] = useState<string | null>(null);
  const [levelDownConfirmOpen, setLevelDownConfirmOpen] = useState(false);
  const [expandedChangelogEntry, setExpandedChangelogEntry] = useState<
    string | null
  >(null);
  const drive = useGoogleDriveContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portraitInputRef = useRef<HTMLInputElement>(null);

  if (!character) return null;

  const conMod = abilityModifier(character.attributes.con);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  async function handleDriveRestore(file: DriveFile) {
    const data = await drive.restore(file);
    if (!data) return;
    setImportPreview({
      name: data.meta?.name || "Desconocido",
      level: data.meta?.level || 0,
      data,
    });
  }

  function spendHitDie() {
    const result = computeHitDieSpend(character!.combat, conMod);
    if (!result) return;
    updateCombat(result.combat);
    setShortRestLog((prev) => [
      `1d12+${conMod} = ${result.rollTotal} → ${result.healing} HP (${result.combat.currentHp}/${character!.combat.maxHp})`,
      ...prev,
    ]);
    toast(`+${result.healing} HP curados`, { icon: "💚" });
  }

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
      exhaustionLevel: Math.max(0, character!.combat.exhaustionLevel - 1),
    });
    update((c) => ({
      ...c,
      weaponMasteryUsedThisRest: false,
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
      inventory: c.inventory.map((item) =>
        item.grantedAction?.charges
          ? {
              ...item,
              grantedAction: {
                ...item.grantedAction,
                charges: {
                  ...item.grantedAction.charges,
                  remaining: item.grantedAction.charges.total,
                },
              },
            }
          : item
      ),
    }));
    setLongRestOpen(false);
    toast.success("Descanso largo completado");
  }

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

  function confirmImport() {
    if (importPreview) {
      update(() => importPreview.data);
      setImportPreview(null);
      toast.success("Personaje restaurado");
    }
  }

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

  return (
    <div className="p-4 space-y-4">
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

      {/* Portrait */}
      <CollapsibleSection title="Retrato">
        <div className="flex items-center gap-3">
          {character.meta.portraitDataUrl ? (
            <img
              src={character.meta.portraitDataUrl}
              alt="Retrato"
              className="w-16 h-16 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-16 h-16 rounded-full border border-border bg-card flex items-center justify-center text-muted text-[0.6rem] text-center">
              Sin foto
            </div>
          )}
          <button
            onClick={() => portraitInputRef.current?.click()}
            className="flex-1 p-3 bg-card rounded-lg border border-border text-left text-sm"
          >
            {character.meta.portraitDataUrl
              ? "Cambiar retrato"
              : "Subir retrato"}
          </button>
        </div>
        <input
          ref={portraitInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handlePortraitUpload(file);
            e.target.value = "";
          }}
        />
      </CollapsibleSection>

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

      {/* Level Up */}
      <CollapsibleSection title="Nivel" defaultOpen>
        <div className="text-center py-2">
          <div className="font-heading text-4xl text-accent">
            {character.meta.level}
          </div>
          <div className="text-sm text-muted mt-1">
            {character.meta.class}
            {character.meta.subclass && ` — ${character.meta.subclass}`}
          </div>
          {character.meta.level >= 20 ? (
            <p className="mt-3 text-sm text-muted">Nivel máximo alcanzado</p>
          ) : (
            <div className="flex gap-2 justify-center mt-3">
              <button
                onClick={() => {
                  setLevelUpDryRun(false);
                  setLevelUpOpen(true);
                }}
                className="px-5 py-2 bg-accent text-white rounded-lg font-heading text-sm active:scale-95 transition-transform"
              >
                Subir de nivel
              </button>
              <button
                onClick={() => {
                  setLevelUpDryRun(true);
                  setLevelUpOpen(true);
                }}
                className="px-5 py-2 border border-accent text-accent rounded-lg font-heading text-sm active:scale-95 transition-transform"
              >
                {"Dry Run ↑"}
              </button>
            </div>
          )}
          {character.meta.level > 1 && (
            <button
              onClick={() => setLevelDownConfirmOpen(true)}
              className="mt-2 text-xs text-muted hover:text-danger"
            >
              Bajar de nivel
            </button>
          )}
        </div>
      </CollapsibleSection>

      {/* Level-up History */}
      <CollapsibleSection title="Historial de niveles">
        <CompactRow
          onClick={() => setLevelUpHistoryOpen(true)}
          name="Ver historial completo"
          right={null}
        />
      </CollapsibleSection>

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
      <div className="text-center text-xs text-muted py-4">
        <p className="font-heading text-accent">Mavok PWA</p>
        <p className="mt-1">{character.meta.name}</p>
        <p className="mt-1">
          D&D 5.5e (2024) · Data v{CURRENT_DATA_VERSION}
        </p>
        {lastSaved && (
          <p className="mt-1">
            Guardado: {new Date(lastSaved).toLocaleTimeString("es")}
          </p>
        )}
        <p className="mt-1 font-mono text-[0.6rem] text-muted/60">
          {process.env.NEXT_PUBLIC_COMMIT_SHA?.slice(0, 7) || "dev"}
        </p>
      </div>

      {/* Short Rest Modal */}
      <Modal
        open={shortRestOpen}
        onClose={() => setShortRestOpen(false)}
        title="Descanso corto"
      >
        <div className="space-y-3">
          <div className="text-center">
            <span className="text-sm">HP: </span>
            <span className="font-heading text-accent text-lg">
              {character.combat.currentHp}/{character.combat.maxHp}
            </span>
          </div>
          <div className="text-center">
            <span className="text-sm">Dados de golpe: </span>
            <span className="font-heading text-accent">
              {character.combat.hitDice.remaining}/
              {character.combat.hitDice.total}
            </span>
          </div>

          <button
            onClick={spendHitDie}
            disabled={
              character.combat.hitDice.remaining <= 0 ||
              character.combat.currentHp >= character.combat.maxHp
            }
            className="w-full py-3 bg-accent text-white rounded-lg font-heading disabled:opacity-50 active:scale-95 transition-transform"
          >
            Gastar dado de golpe (1d12+{conMod})
          </button>

          {shortRestLog.length > 0 && (
            <div className="space-y-1">
              {shortRestLog.map((log, i) => (
                <p
                  key={i}
                  className={`text-xs ${i === 0 ? "text-foreground" : "text-muted"}`}
                >
                  {log}
                </p>
              ))}
            </div>
          )}

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
              update((c) => ({
                ...c,
                inventory: c.inventory.map((item) =>
                  item.grantedAction?.charges?.recharge === "short"
                    ? {
                        ...item,
                        grantedAction: {
                          ...item.grantedAction,
                          charges: {
                            ...item.grantedAction.charges,
                            remaining: item.grantedAction.charges.total,
                          },
                        },
                      }
                    : item
                ),
              }));
              setShortRestOpen(false);
            }}
            className="w-full py-2 text-sm text-muted border border-border rounded-lg"
          >
            Terminar descanso
          </button>
        </div>
      </Modal>

      {/* Long Rest Modal */}
      <Modal
        open={longRestOpen}
        onClose={() => setLongRestOpen(false)}
        title="Descanso largo"
      >
        <div className="space-y-3">
          <p className="text-sm">Se restaurará:</p>
          <ul className="text-sm space-y-1">
            <li>
              HP → {character.combat.maxHp}/{character.combat.maxHp}
            </li>
            <li>
              Rage → {character.resources.rpiRages.total}/
              {character.resources.rpiRages.total}
            </li>
            <li>
              {"Stone's Endurance"} → {character.resources.stoneEndurance.total}/{character.resources.stoneEndurance.total}
            </li>
            <li>
              Dados de golpe: +
              {Math.max(1, Math.floor(character.combat.hitDice.total / 2))}
            </li>
            <li>Death saves → reset</li>
            <li>Condiciones → eliminadas</li>
          </ul>
          <div className="flex gap-2">
            <button
              onClick={() => setLongRestOpen(false)}
              className="flex-1 py-2 text-sm border border-border rounded-lg text-muted"
            >
              Cancelar
            </button>
            <button
              onClick={applyLongRest}
              className="flex-1 py-2 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>

      {/* Level Up Flow */}
      <LevelUpFlow open={levelUpOpen} onClose={() => setLevelUpOpen(false)} dryRun={levelUpDryRun} />

      {/* Weapon Mastery Swap */}
      <WeaponMasteryModal
        open={weaponMasteryOpen}
        onClose={() => setWeaponMasteryOpen(false)}
      />

      {/* Quick Actions Picker */}
      <QuickActionsPicker
        open={quickActionsPickerOpen}
        onClose={() => setQuickActionsPickerOpen(false)}
        selected={character.quickActions}
        attacks={character.attacks}
        onSave={updateQuickActions}
      />

      {/* Level-up History */}
      <LevelUpHistoryModal
        open={levelUpHistoryOpen}
        onClose={() => setLevelUpHistoryOpen(false)}
      />

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

      {/* Import Preview Modal */}
      <Modal
        open={!!importPreview}
        onClose={() => setImportPreview(null)}
        title="Importar personaje"
      >
        {importPreview && (
          <div className="space-y-3">
            <p className="text-sm">
              Cargar: <strong>{importPreview.name}</strong> (Nivel{" "}
              {importPreview.level})
            </p>
            <p className="text-xs text-danger">
              Esto reemplazará todos los datos actuales.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setImportPreview(null)}
                className="flex-1 py-2 text-sm border border-border rounded-lg text-muted"
              >
                Cancelar
              </button>
              <button
                onClick={confirmImport}
                className="flex-1 py-2 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
              >
                Importar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
