// src/components/inventory/ItemFormModal.tsx
"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { WEAPONS } from "@/data/weapons";
import { ARMOR } from "@/data/armor";
import { GEAR } from "@/data/gear";
import type { InventoryItem, GrantedAction } from "@/lib/types";

const CATEGORIES: { value: InventoryItem["category"]; label: string }[] = [
  { value: "weapon", label: "Arma" },
  { value: "armor", label: "Armadura" },
  { value: "gear", label: "Equipo" },
  { value: "consumable", label: "Consumible" },
  { value: "personal", label: "Personal" },
];

const EMPTY_FORM = {
  name: "",
  quantity: 1,
  weight: "",
  value: "",
  category: "gear" as InventoryItem["category"],
  description: "",
  magicBonus: "",
  magicBonusTargets: [] as ("ac" | "save")[],
  magicAttackBonus: "",
  magicDamageBonus: "",
  baseWeaponName: "",
  grantsAction: false,
  actionName: "",
  actionType: "action" as GrantedAction["actionType"],
  actionDescription: "",
  actionLimitedUses: false,
  actionTotalUses: "",
  actionRecharge: "long" as NonNullable<GrantedAction["charges"]>["recharge"],
};

function formFromItem(item: InventoryItem): typeof EMPTY_FORM {
  return {
    name: item.name,
    quantity: item.quantity,
    weight: item.weight !== null ? String(item.weight) : "",
    value: item.value !== null ? String(item.value) : "",
    category: item.category,
    description: item.description,
    magicBonus: item.magicBonus !== null ? String(item.magicBonus) : "",
    magicBonusTargets: [...item.magicBonusTargets],
    magicAttackBonus:
      item.magicAttackBonus !== null ? String(item.magicAttackBonus) : "",
    magicDamageBonus:
      item.magicDamageBonus !== null ? String(item.magicDamageBonus) : "",
    baseWeaponName: item.baseWeaponName ?? "",
    grantsAction: item.grantedAction !== null,
    actionName: item.grantedAction?.name ?? "",
    actionType: item.grantedAction?.actionType ?? "action",
    actionDescription: item.grantedAction?.description ?? "",
    actionLimitedUses: !!item.grantedAction?.charges,
    actionTotalUses: item.grantedAction?.charges
      ? String(item.grantedAction.charges.total)
      : "",
    actionRecharge: item.grantedAction?.charges?.recharge ?? "long",
  };
}

export function ItemFormModal({
  open,
  onClose,
  item,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  item?: InventoryItem;
  onSave: (item: InventoryItem) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  // Re-sync form state whenever the modal (re)opens for a different item (or
  // for "add"), without syncing state in an Effect — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const syncKey = open ? (item?.id ?? "add") : undefined;
  const [lastSyncKey, setLastSyncKey] = useState(syncKey);
  if (syncKey !== lastSyncKey) {
    setLastSyncKey(syncKey);
    setForm(item ? formFromItem(item) : EMPTY_FORM);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    const magicBonus = form.magicBonus ? parseInt(form.magicBonus) : 0;
    const magicAttackBonus = form.magicAttackBonus
      ? parseInt(form.magicAttackBonus)
      : 0;
    const magicDamageBonus = form.magicDamageBonus
      ? parseInt(form.magicDamageBonus)
      : 0;
    const totalUses = form.actionTotalUses
      ? parseInt(form.actionTotalUses)
      : 0;
    const existingCharges = item?.grantedAction?.charges;
    const grantedAction: GrantedAction | null =
      form.grantsAction && form.actionName.trim()
        ? {
            name: form.actionName.trim(),
            actionType: form.actionType,
            description: form.actionDescription,
            charges:
              form.actionLimitedUses && totalUses > 0
                ? {
                    total: totalUses,
                    // Preserve remaining charges across an edit (clamped to
                    // the new total) instead of resetting an in-progress
                    // item back to full charges just because it was edited.
                    remaining: existingCharges
                      ? Math.min(existingCharges.remaining, totalUses)
                      : totalUses,
                    recharge: form.actionRecharge,
                  }
                : null,
          }
        : null;
    const saved: InventoryItem = {
      id: item?.id ?? `inv-${Date.now()}`,
      name: form.name.trim(),
      quantity: form.quantity,
      weight: form.weight ? parseFloat(form.weight) : null,
      value: form.value ? parseFloat(form.value) : null,
      category: form.category,
      equipped: item?.equipped ?? false,
      description: form.description,
      magicBonus: magicBonus ? magicBonus : null,
      magicBonusTargets: magicBonus ? form.magicBonusTargets : [],
      magicAttackBonus: magicAttackBonus ? magicAttackBonus : null,
      magicDamageBonus: magicDamageBonus ? magicDamageBonus : null,
      baseWeaponName: form.baseWeaponName.trim() || null,
      grantedAction,
    };
    onSave(saved);
    onClose();
  }

  function toggleMagicBonusTarget(target: "ac" | "save") {
    setForm((prev) => ({
      ...prev,
      magicBonusTargets: prev.magicBonusTargets.includes(target)
        ? prev.magicBonusTargets.filter((t) => t !== target)
        : [...prev.magicBonusTargets, target],
    }));
  }

  function prefillFromWeapon(weaponName: string) {
    const w = WEAPONS.find((wp) => wp.name === weaponName);
    if (w) {
      setForm({
        ...form,
        name: w.name,
        weight: String(w.weight),
        value: w.value !== null ? String(w.value) : "",
        category: "weapon",
        description: `${w.damage} ${w.damageType} · ${w.properties.join(", ")}${w.mastery ? ` · Mastery: ${w.mastery}` : ""}`,
      });
    }
  }

  function prefillFromArmor(armorName: string) {
    const a = ARMOR.find((ar) => ar.name === armorName);
    if (a) {
      setForm({
        ...form,
        name: a.name,
        weight: String(a.weight),
        value: a.value !== null ? String(a.value) : "",
        category: "armor",
        description: `AC ${a.ac}${a.stealthDisadvantage ? " · Desventaja en Sigilo" : ""}${a.strengthRequirement ? ` · Requiere FUE ${a.strengthRequirement}` : ""}`,
      });
    }
  }

  function prefillFromGear(gearName: string) {
    const g = GEAR.find((ge) => ge.name === gearName);
    if (g) {
      setForm({
        ...form,
        name: g.name,
        weight: g.weight !== null ? String(g.weight) : "",
        value: g.value !== null ? String(g.value) : "",
        category: "gear",
        description: g.description,
      });
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? "Editar objeto" : "Agregar objeto"}
    >
      <div className="space-y-3">
        {!item && (
          <>
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

            <div>
              <label className="text-xs text-muted">Armadura rápida</label>
              <select
                onChange={(e) => {
                  if (e.target.value) prefillFromArmor(e.target.value);
                  e.target.value = "";
                }}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground mt-1"
                defaultValue=""
              >
                <option value="">Elegir armadura...</option>
                {ARMOR.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name} (AC {a.ac})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted">Equipo rápido</label>
              <select
                onChange={(e) => {
                  if (e.target.value) prefillFromGear(e.target.value);
                  e.target.value = "";
                }}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground mt-1"
                defaultValue=""
              >
                <option value="">Elegir equipo...</option>
                {GEAR.map((g) => (
                  <option key={g.name} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </>
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
            value={form.quantity}
            onChange={(e) =>
              setForm({
                ...form,
                quantity: parseInt(e.target.value) || 1,
              })
            }
            placeholder="Cantidad"
            className="w-1/3 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
          <input
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
            placeholder="Peso (lb)"
            className="w-1/3 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
          <input
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            placeholder="Valor (gp)"
            className="w-1/3 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
        </div>

        <select
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value as InventoryItem["category"],
            })
          }
          className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descripción (opcional)"
          rows={2}
          className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
        />

        <input
          type="number"
          value={form.magicBonus}
          onChange={(e) => setForm({ ...form, magicBonus: e.target.value })}
          placeholder="Bono mágico a CA/Salvaciones (opcional, ej. 1 o -1)"
          className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
        />

        {form.magicBonus && parseInt(form.magicBonus) !== 0 && (
          <div>
            <label className="text-xs text-muted">Aplica a</label>
            <div className="flex gap-3 mt-1">
              {(
                [
                  { value: "ac", label: "CA" },
                  { value: "save", label: "Salvaciones" },
                ] as const
              ).map((t) => (
                <label
                  key={t.value}
                  className="flex items-center gap-1.5 text-xs text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={form.magicBonusTargets.includes(t.value)}
                    onChange={() => toggleMagicBonusTarget(t.value)}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="number"
            value={form.magicAttackBonus}
            onChange={(e) =>
              setForm({ ...form, magicAttackBonus: e.target.value })
            }
            placeholder="Bono de ataque (opcional)"
            className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
          <input
            type="number"
            value={form.magicDamageBonus}
            onChange={(e) =>
              setForm({ ...form, magicDamageBonus: e.target.value })
            }
            placeholder="Bono de daño (opcional)"
            className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
        </div>
        <p className="text-[0.65rem] text-muted -mt-1">
          {form.category === "weapon"
            ? "En un objeto de categoría Arma, aplica solo a esa arma. En cualquier otra categoría (anillo, capa, etc.), aplica a todos tus ataques."
            : "Aplica a todos tus ataques (no está atado a un arma específica)."}
        </p>

        {form.category === "weapon" &&
          (!!form.magicAttackBonus || !!form.magicDamageBonus) && (
            <select
              value={form.baseWeaponName}
              onChange={(e) =>
                setForm({ ...form, baseWeaponName: e.target.value })
              }
              className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            >
              <option value="">
                Vincular a arma del catálogo (si el nombre no coincide)...
              </option>
              {WEAPONS.map((w) => (
                <option key={w.name} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>
          )}

        <label className="flex items-center gap-1.5 text-xs text-foreground">
          <input
            type="checkbox"
            checked={form.grantsAction}
            onChange={(e) =>
              setForm({ ...form, grantsAction: e.target.checked })
            }
          />
          Otorga una acción especial (opcional)
        </label>

        {form.grantsAction && (
          <div className="space-y-2 pl-2 border-l border-border">
            <input
              value={form.actionName}
              onChange={(e) =>
                setForm({ ...form, actionName: e.target.value })
              }
              placeholder="Nombre de la acción"
              className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            />
            <select
              value={form.actionType}
              onChange={(e) =>
                setForm({
                  ...form,
                  actionType: e.target.value as GrantedAction["actionType"],
                })
              }
              className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            >
              <option value="action">Acción</option>
              <option value="bonus">Bonus Action</option>
              <option value="reaction">Reacción</option>
            </select>
            <textarea
              value={form.actionDescription}
              onChange={(e) =>
                setForm({ ...form, actionDescription: e.target.value })
              }
              placeholder="Descripción del efecto"
              rows={2}
              className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
            />
            <label className="flex items-center gap-1.5 text-xs text-foreground">
              <input
                type="checkbox"
                checked={form.actionLimitedUses}
                onChange={(e) =>
                  setForm({
                    ...form,
                    actionLimitedUses: e.target.checked,
                  })
                }
              />
              Usos limitados
            </label>
            {form.actionLimitedUses && (
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.actionTotalUses}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      actionTotalUses: e.target.value,
                    })
                  }
                  placeholder="Total de usos"
                  className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
                />
                <select
                  value={form.actionRecharge}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      actionRecharge: e.target
                        .value as NonNullable<GrantedAction["charges"]>["recharge"],
                    })
                  }
                  className="w-1/2 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
                >
                  <option value="short">Descanso corto</option>
                  <option value="long">Descanso largo</option>
                  <option value="none">Sin recarga</option>
                </select>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full py-3 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
        >
          {item ? "Guardar" : "Agregar"}
        </button>
      </div>
    </Modal>
  );
}
