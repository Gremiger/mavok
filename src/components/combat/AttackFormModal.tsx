"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { WEAPONS } from "@/data/weapons";
import type { Attack } from "@/lib/types";

const EMPTY_FORM = {
  name: "",
  attackBonus: "0",
  damage: "",
  damageType: "",
  range: "5 ft",
  properties: "",
  mastery: "",
  masteryEffect: "",
  masterySaveDC: "",
};

function formFromAttack(existingAttack: Attack): typeof EMPTY_FORM {
  return {
    name: existingAttack.name,
    attackBonus: String(existingAttack.attackBonus),
    damage: existingAttack.damage,
    damageType: existingAttack.damageType,
    range: existingAttack.range,
    properties: existingAttack.properties.join(", "),
    mastery: existingAttack.mastery ?? "",
    masteryEffect: existingAttack.masteryEffect ?? "",
    masterySaveDC:
      existingAttack.masterySaveDC != null
        ? String(existingAttack.masterySaveDC)
        : "",
  };
}

function formFromWeapon(
  weaponName: string,
  displayName?: string
): typeof EMPTY_FORM {
  const w = WEAPONS.find((wp) => wp.name === weaponName);
  if (!w) return EMPTY_FORM;
  return {
    ...EMPTY_FORM,
    name: displayName ?? w.name,
    damage: w.damage,
    damageType: w.damageType,
    properties: w.properties.join(", "),
    mastery: w.mastery ?? "",
    range: w.range ?? "5 ft",
  };
}

export function AttackFormModal({
  open,
  onClose,
  onSave,
  existingAttack,
  initialWeaponName,
  initialDisplayName,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (attack: Attack) => void;
  existingAttack?: Attack;
  initialWeaponName?: string;
  initialDisplayName?: string;
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  // Re-sync form state whenever the modal (re)opens for a different attack
  // (or for "add"), without syncing state in an Effect — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const syncKey = open ? (existingAttack?.id ?? "add") : undefined;
  const [lastSyncKey, setLastSyncKey] = useState(syncKey);
  if (syncKey !== lastSyncKey) {
    setLastSyncKey(syncKey);
    setForm(
      existingAttack
        ? formFromAttack(existingAttack)
        : initialWeaponName
          ? formFromWeapon(initialWeaponName, initialDisplayName)
          : EMPTY_FORM
    );
  }

  function prefillFromWeapon(weaponName: string) {
    const w = WEAPONS.find((wp) => wp.name === weaponName);
    if (w) {
      setForm({
        ...form,
        name: w.name,
        damage: w.damage,
        damageType: w.damageType,
        properties: w.properties.join(", "),
        mastery: w.mastery ?? "",
        range: w.range ?? "5 ft",
      });
    }
  }

  function handleSave() {
    if (!form.name.trim() || !form.damage.trim()) return;
    const attack: Attack = {
      id: existingAttack?.id ?? `atk-${Date.now()}`,
      name: form.name.trim(),
      attackBonus: parseInt(form.attackBonus) || 0,
      damage: form.damage.trim(),
      damageType: form.damageType.trim(),
      range: form.range.trim() || "5 ft",
      properties: form.properties
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      mastery: form.mastery.trim() || null,
      masteryEffect: form.masteryEffect.trim() || null,
      masterySaveDC: form.masterySaveDC.trim()
        ? parseInt(form.masterySaveDC)
        : null,
    };
    onSave(attack);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existingAttack ? "Editar ataque" : "Nuevo ataque"}
    >
      <div className="space-y-3">
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
          value={form.properties}
          onChange={(e) => setForm({ ...form, properties: e.target.value })}
          placeholder="Propiedades (separadas por coma)"
          className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
        />

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

        <button
          onClick={handleSave}
          className="w-full py-3 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
        >
          {existingAttack ? "Guardar" : "Agregar"}
        </button>
      </div>
    </Modal>
  );
}
