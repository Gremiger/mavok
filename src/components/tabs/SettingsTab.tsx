"use client";

import { useState, useRef } from "react";
import { useCharacterContext } from "@/lib/context";
import { useThemeContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { rollDice } from "@/lib/dice";
import { abilityModifier } from "@/lib/utils";
import { toast } from "sonner";
import {
  exportCharacterJSON,
  exportInventoryCSV,
  exportQuickNotes,
  importCharacterJSON,
} from "@/lib/export";
import { LevelUpFlow } from "@/components/levelup/LevelUpFlow";
import { getBackups, restoreBackup } from "@/lib/migrations";
import { getCharacterStorageKey } from "@/lib/storage";
import { CURRENT_DATA_VERSION } from "@/lib/types";

export function SettingsTab() {
  const { character, update, updateCombat } = useCharacterContext();
  const { theme, toggleTheme } = useThemeContext();
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!character) return null;

  const conMod = abilityModifier(character.attributes.con);

  function spendHitDie() {
    if (character!.combat.hitDice.remaining <= 0) return;
    const roll = rollDice(`1d12+${conMod}`);
    const healing = Math.max(1, roll.total);
    const newHp = Math.min(
      character!.combat.currentHp + healing,
      character!.combat.maxHp
    );
    updateCombat({
      currentHp: newHp,
      hitDice: {
        ...character!.combat.hitDice,
        remaining: character!.combat.hitDice.remaining - 1,
      },
    });
    setShortRestLog((prev) => [
      `1d12+${conMod} = [${roll.rolls[0]}]+${conMod} = ${healing} HP (${newHp}/${character!.combat.maxHp})`,
      ...prev,
    ]);
    toast(`+${healing} HP curados`, { icon: "💚" });
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
      },
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
      alert("Error al leer el archivo JSON");
    }
  }

  function confirmImport() {
    if (importPreview) {
      update(() => importPreview.data);
      setImportPreview(null);
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Theme */}
      <CollapsibleSection title="Tema" defaultOpen>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-3 bg-card rounded-lg border border-border"
        >
          <span className="text-sm">
            {theme === "dark-fantasy" ? "Dark Fantasy" : "D&D Classic"}
          </span>
          <span className="text-xs text-muted">Tap para cambiar</span>
        </button>
      </CollapsibleSection>

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
              Gastar dados de golpe para curarse
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
        </div>
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
              Dry Run ↑
            </button>
          </div>
          {character.meta.level > 1 && (
            <button
              onClick={() => {
                if (confirm(`¿Bajar a nivel ${character.meta.level - 1}? Esto revertirá los cambios del último nivel.`)) {
                  update((c) => {
                    const prev = structuredClone(c);
                    prev.meta.level -= 1;
                    const PROF_BY_LEVEL = [2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6];
                    prev.meta.proficiencyBonus = PROF_BY_LEVEL[prev.meta.level - 1];
                    const RAGES_BY_LEVEL = [2,2,3,3,3,4,4,4,4,4,4,5,5,5,5,5,6,6,6,6];
                    prev.resources.rpiRages.total = RAGES_BY_LEVEL[prev.meta.level - 1];
                    prev.resources.rpiRages.remaining = Math.min(prev.resources.rpiRages.remaining, prev.resources.rpiRages.total);
                    prev.resources.rpiRages.slots = Array(prev.resources.rpiRages.total).fill(false).map((_, i) => i < prev.resources.rpiRages.remaining);
                    prev.combat.hitDice.total = prev.meta.level;
                    prev.combat.hitDice.remaining = Math.min(prev.combat.hitDice.remaining, prev.combat.hitDice.total);
                    prev.features = prev.features.filter(f => f.level <= prev.meta.level);
                    if (prev.meta.level < 3) prev.meta.subclass = null;
                    return prev;
                  });
                }
              }}
              className="mt-2 text-xs text-muted hover:text-danger"
            >
              Bajar de nivel
            </button>
          )}
        </div>
      </CollapsibleSection>

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

      {/* About */}
      <div className="text-center text-xs text-muted py-4 border-t border-border">
        <p className="font-heading text-accent">Mavok PWA</p>
        <p className="mt-1">v0.2.0 · {character.meta.name}</p>
        <p className="mt-1">
          D&D 5.5e (2024) · Data v{CURRENT_DATA_VERSION}
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
            onClick={() => setShortRestOpen(false)}
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
