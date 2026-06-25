"use client";

import { useState } from "react";
import { useCharacterContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { exportInventoryCSV } from "@/lib/export";
import { toast } from "sonner";
import { Sword, Shield, Wrench, FlaskConical, Heart, Plus } from "lucide-react";
import type { InventoryItem } from "@/lib/types";
import type { ReactNode } from "react";
import { WEAPONS } from "@/data/weapons";

const CURRENCY_LABELS = [
  { key: "cp" as const, label: "CP" },
  { key: "sp" as const, label: "SP" },
  { key: "ep" as const, label: "EP" },
  { key: "gp" as const, label: "GP" },
  { key: "pp" as const, label: "PP" },
];

const CATEGORIES: { value: InventoryItem["category"]; label: string }[] = [
  { value: "weapon", label: "Arma" },
  { value: "armor", label: "Armadura" },
  { value: "gear", label: "Equipo" },
  { value: "consumable", label: "Consumible" },
  { value: "personal", label: "Personal" },
];

const CATEGORY_ICONS: Record<string, ReactNode> = {
  weapon: <Sword size={14} />,
  armor: <Shield size={14} />,
  gear: <Wrench size={14} />,
  consumable: <FlaskConical size={14} />,
  personal: <Heart size={14} />,
};

export function InventoryTab() {
  const {
    character,
    updateCurrency,
    addInventoryItem,
    removeInventoryItem,
    updateInventoryItem,
  } = useCharacterContext();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    weight: "",
    category: "gear" as InventoryItem["category"],
    description: "",
  });

  if (!character) return null;

  const { inventory, currency, attributes } = character;
  const strMod = attributes.str;
  const carryCapacity = strMod * 15 * 2;
  const totalWeight = inventory.reduce(
    (sum, item) => sum + (item.weight ?? 0) * item.quantity,
    0
  );

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: inventory.filter((i) => i.category === cat.value),
  })).filter((g) => g.items.length > 0);

  function handleAddItem() {
    if (!newItem.name.trim()) return;
    const item: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newItem.name.trim(),
      quantity: newItem.quantity,
      weight: newItem.weight ? parseFloat(newItem.weight) : null,
      category: newItem.category,
      equipped: false,
      description: newItem.description,
    };
    addInventoryItem(item);
    toast(`${item.name} agregado`, { icon: "📦" });
    setNewItem({
      name: "",
      quantity: 1,
      weight: "",
      category: "gear",
      description: "",
    });
    setAddModalOpen(false);
  }

  function prefillFromWeapon(weaponName: string) {
    const w = WEAPONS.find((wp) => wp.name === weaponName);
    if (w) {
      setNewItem({
        ...newItem,
        name: w.name,
        weight: String(w.weight),
        category: "weapon",
        description: `${w.damage} ${w.damageType} · ${w.properties.join(", ")}${w.mastery ? ` · Mastery: ${w.mastery}` : ""}`,
      });
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Currency Bar */}
      <div className="flex justify-around stone-card rounded-lg p-3">
        {CURRENCY_LABELS.map(({ key, label }) => (
          <div key={key} className="text-center">
            {editingCurrency === key ? (
              <input
                type="number"
                inputMode="numeric"
                defaultValue={currency[key]}
                className="w-12 bg-background border border-accent rounded text-center text-sm font-heading text-foreground"
                autoFocus
                onBlur={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    updateCurrency({ [key]: val });
                  }
                  setEditingCurrency(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
              />
            ) : (
              <button
                onClick={() => setEditingCurrency(key)}
                className="font-heading text-lg text-accent min-w-[2rem]"
              >
                {currency[key]}
              </button>
            )}
            <div className="text-muted text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Inventory List */}
      {grouped.map((group, gi) => (
        <div key={group.value}>
          {gi > 0 && <div className="crack-divider mb-4" />}
          <h3 className="font-heading text-xs text-muted uppercase mb-2 flex items-center gap-1.5">
            {CATEGORY_ICONS[group.value]} <span>{group.label}</span>
          </h3>
          <div className="space-y-1">
            {group.items.map((item) => (
              <div
                key={item.id}
                className="stone-card rounded-lg overflow-hidden"
              >
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer"
                  onClick={() =>
                    setExpandedItem(
                      expandedItem === item.id ? null : item.id
                    )
                  }
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateInventoryItem(item.id, {
                        equipped: !item.equipped,
                      });
                    }}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                      item.equipped
                        ? "bg-accent border-accent text-white"
                        : "border-muted"
                    }`}
                  >
                    {item.equipped && "✓"}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm">{item.name}</span>
                    {item.quantity > 1 && (
                      <span className="text-muted text-xs ml-1">
                        ×{item.quantity}
                      </span>
                    )}
                  </div>
                  {item.weight !== null && (
                    <span className="text-muted text-xs">
                      {item.weight * item.quantity} lb
                    </span>
                  )}
                </div>

                {expandedItem === item.id && (
                  <div className="px-3 pb-3 border-t border-border pt-2 space-y-2">
                    {item.description && (
                      <p className="text-xs text-foreground/80">
                        {item.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateInventoryItem(item.id, {
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          }
                          className="w-7 h-7 rounded bg-background border border-border text-sm"
                        >
                          -
                        </button>
                        <span className="text-sm w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateInventoryItem(item.id, {
                              quantity: item.quantity + 1,
                            })
                          }
                          className="w-7 h-7 rounded bg-background border border-border text-sm"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeInventoryItem(item.id)}
                        className="ml-auto px-3 py-1 text-xs text-danger border border-danger/30 rounded hover:bg-danger/10"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Encumbrance Footer */}
      <div className="crack-divider" />
      <div className="flex items-center justify-between text-xs text-muted py-2">
        <span>
          Peso: {totalWeight} / {carryCapacity} lbs
        </span>
        <button
          onClick={() => exportInventoryCSV(inventory)}
          className="text-accent hover:underline"
        >
          Exportar CSV
        </button>
      </div>

      {/* Add Item FAB */}
      <button
        onClick={() => setAddModalOpen(true)}
        className="fixed right-4 bottom-safe-fab w-12 h-12 rounded-full bg-accent text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus size={24} />
      </button>

      {/* Add Item Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Agregar objeto"
      >
        <div className="space-y-3">
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

          <input
            value={newItem.name}
            onChange={(e) =>
              setNewItem({ ...newItem, name: e.target.value })
            }
            placeholder="Nombre"
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />

          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  quantity: parseInt(e.target.value) || 1,
                })
              }
              placeholder="Cantidad"
              className="w-1/3 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            />
            <input
              value={newItem.weight}
              onChange={(e) =>
                setNewItem({ ...newItem, weight: e.target.value })
              }
              placeholder="Peso (lb)"
              className="w-1/3 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            />
            <select
              value={newItem.category}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  category: e.target.value as InventoryItem["category"],
                })
              }
              className="w-1/3 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={newItem.description}
            onChange={(e) =>
              setNewItem({ ...newItem, description: e.target.value })
            }
            placeholder="Descripción (opcional)"
            rows={2}
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
          />

          <button
            onClick={handleAddItem}
            className="w-full py-3 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
          >
            Agregar
          </button>
        </div>
      </Modal>
    </div>
  );
}
