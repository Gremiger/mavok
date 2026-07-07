"use client";

import { useState } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { AttackFormModal } from "@/components/combat/AttackFormModal";
import { exportInventoryCSV } from "@/lib/export";
import { formatModifier } from "@/lib/utils";
import { toast } from "sonner";
import { Sword, Shield, Wrench, FlaskConical, Heart, Plus, SearchX } from "lucide-react";
import type { InventoryItem } from "@/lib/types";
import type { ReactNode } from "react";
import { WEAPONS } from "@/data/weapons";
import { ARMOR } from "@/data/armor";
import { GEAR } from "@/data/gear";
import { recalculateDerived } from "@/lib/recalculate";

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
    update,
    updateCurrency,
    addInventoryItem,
    removeInventoryItem,
    updateInventoryItem,
    addAttack,
  } = useCharacterContext();
  const { density } = useThemeContext();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [attackPrefillWeapon, setAttackPrefillWeapon] = useState<string | null>(
    null
  );
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    weight: "",
    value: "",
    category: "gear" as InventoryItem["category"],
    description: "",
    magicBonus: "",
    magicBonusTargets: [] as ("weapon" | "ac" | "save")[],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "weight" | "equipped">("name");
  const [hiddenCategories, setHiddenCategories] = useState<
    Set<InventoryItem["category"]>
  >(new Set());

  if (!character) return null;

  const { inventory, currency, attributes, attacks } = character;
  const strMod = attributes.str;
  const carryCapacity = strMod * 15 * 2;
  const totalWeight = inventory.reduce(
    (sum, item) => sum + (item.weight ?? 0) * item.quantity,
    0
  );

  const filteredInventory = searchQuery
    ? inventory.filter((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : inventory;

  function sortItems(items: InventoryItem[]): InventoryItem[] {
    const sorted = [...items];
    if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "weight") {
      sorted.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
    } else {
      sorted.sort((a, b) => {
        if (a.equipped !== b.equipped) return a.equipped ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    }
    return sorted;
  }

  function toggleEquipped(item: InventoryItem) {
    const nowEquipped = !item.equipped;
    update((c) => {
      const nextInventory = c.inventory.map((i) =>
        i.id === item.id ? { ...i, equipped: nowEquipped } : i
      );
      return recalculateDerived({ ...c, inventory: nextInventory });
    });

    if (item.category === "weapon" && nowEquipped) {
      const alreadyTracked = attacks.some(
        (a) => a.name === item.name || a.name.startsWith(`${item.name} (`)
      );
      const inCatalog = WEAPONS.some((w) => w.name === item.name);
      if (inCatalog && !alreadyTracked) {
        toast(`¿Agregar "${item.name}" a tus acciones de combate?`, {
          action: {
            label: "Agregar",
            onClick: () => setAttackPrefillWeapon(item.name),
          },
        });
      }
    }
  }

  function toggleCategory(cat: InventoryItem["category"]) {
    setHiddenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const grouped = CATEGORIES.filter((cat) => !hiddenCategories.has(cat.value))
    .map((cat) => ({
      ...cat,
      items: sortItems(
        filteredInventory.filter((i) => i.category === cat.value)
      ),
    }))
    .filter((g) => g.items.length > 0);

  function handleAddItem() {
    if (!newItem.name.trim()) return;
    const magicBonus = newItem.magicBonus ? parseInt(newItem.magicBonus) : 0;
    const item: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newItem.name.trim(),
      quantity: newItem.quantity,
      weight: newItem.weight ? parseFloat(newItem.weight) : null,
      value: newItem.value ? parseFloat(newItem.value) : null,
      category: newItem.category,
      equipped: false,
      description: newItem.description,
      magicBonus: magicBonus ? magicBonus : null,
      magicBonusTargets: magicBonus ? newItem.magicBonusTargets : [],
    };
    addInventoryItem(item);
    toast(`${item.name} agregado`, { icon: "📦" });
    setNewItem({
      name: "",
      quantity: 1,
      weight: "",
      value: "",
      category: "gear",
      description: "",
      magicBonus: "",
      magicBonusTargets: [],
    });
    setAddModalOpen(false);
  }

  function toggleMagicBonusTarget(target: "weapon" | "ac" | "save") {
    setNewItem((prev) => ({
      ...prev,
      magicBonusTargets: prev.magicBonusTargets.includes(target)
        ? prev.magicBonusTargets.filter((t) => t !== target)
        : [...prev.magicBonusTargets, target],
    }));
  }

  function prefillFromWeapon(weaponName: string) {
    const w = WEAPONS.find((wp) => wp.name === weaponName);
    if (w) {
      setNewItem({
        ...newItem,
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
      setNewItem({
        ...newItem,
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
      setNewItem({
        ...newItem,
        name: g.name,
        weight: g.weight !== null ? String(g.weight) : "",
        value: g.value !== null ? String(g.value) : "",
        category: "gear",
        description: g.description,
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

      {/* Search, Sort, Filter */}
      <div className="space-y-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar objeto..."
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
        />
        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "name" | "weight" | "equipped")
            }
            className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground"
          >
            <option value="name">Nombre</option>
            <option value="weight">Peso</option>
            <option value="equipped">Equipado</option>
          </select>
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                className={`px-2 py-1 rounded-full text-xs transition-colors ${
                  hiddenCategories.has(cat.value)
                    ? "bg-card border border-border text-muted opacity-50"
                    : "bg-accent text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
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
                  className={`flex items-center cursor-pointer ${density === "compact" ? "gap-2 p-1.5" : "gap-3 p-3"}`}
                  onClick={() =>
                    setExpandedItem(
                      expandedItem === item.id ? null : item.id
                    )
                  }
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEquipped(item);
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
                    {!!item.magicBonus && (
                      <span className="text-accent text-xs ml-1 font-heading">
                        {formatModifier(item.magicBonus)}
                      </span>
                    )}
                  </div>
                  {(item.weight !== null || item.value !== null) && (
                    <span className="text-muted text-xs">
                      {item.weight !== null
                        ? `${item.weight * item.quantity} lb`
                        : ""}
                      {item.weight !== null && item.value !== null ? " · " : ""}
                      {item.value !== null ? `${item.value} gp` : ""}
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
                    {!!item.magicBonus && (
                      <p className="text-xs text-accent">
                        Bono mágico: {formatModifier(item.magicBonus)} (
                        {item.magicBonusTargets
                          .map((t) =>
                            t === "weapon"
                              ? "Ataque y daño"
                              : t === "ac"
                                ? "CA"
                                : "Salvaciones"
                          )
                          .join(", ") || "sin aplicar"}
                        )
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
                        onClick={() => {
                          removeInventoryItem(item.id);
                          toast(`${item.name} eliminado`, {
                            action: {
                              label: "Deshacer",
                              onClick: () => addInventoryItem(item),
                            },
                          });
                        }}
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

      {grouped.length === 0 && (
        <EmptyState
          icon={SearchX}
          message="Sin objetos que coincidan. Ajusta la búsqueda o los filtros."
        />
      )}

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
            <input
              value={newItem.value}
              onChange={(e) =>
                setNewItem({ ...newItem, value: e.target.value })
              }
              placeholder="Valor (gp)"
              className="w-1/3 bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            />
          </div>

          <select
            value={newItem.category}
            onChange={(e) =>
              setNewItem({
                ...newItem,
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
            value={newItem.description}
            onChange={(e) =>
              setNewItem({ ...newItem, description: e.target.value })
            }
            placeholder="Descripción (opcional)"
            rows={2}
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
          />

          <input
            type="number"
            inputMode="numeric"
            value={newItem.magicBonus}
            onChange={(e) =>
              setNewItem({ ...newItem, magicBonus: e.target.value })
            }
            placeholder="Bono mágico (opcional, ej. 1 o -1)"
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />

          {newItem.magicBonus && parseInt(newItem.magicBonus) !== 0 && (
            <div>
              <label className="text-xs text-muted">Aplica a</label>
              <div className="flex gap-3 mt-1">
                {(
                  [
                    { value: "weapon", label: "Ataque y daño" },
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
                      checked={newItem.magicBonusTargets.includes(t.value)}
                      onChange={() => toggleMagicBonusTarget(t.value)}
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAddItem}
            className="w-full py-3 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
          >
            Agregar
          </button>
        </div>
      </Modal>

      <AttackFormModal
        open={attackPrefillWeapon !== null}
        onClose={() => setAttackPrefillWeapon(null)}
        onSave={(a) => {
          addAttack(a);
          setAttackPrefillWeapon(null);
        }}
        initialWeaponName={attackPrefillWeapon ?? undefined}
      />
    </div>
  );
}
