"use client";

import { useState } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { GhostChip } from "@/components/ui/GhostChip";
import { Markdown } from "@/components/ui/Markdown";
import { AttackFormModal } from "@/components/combat/AttackFormModal";
import { exportInventoryCSV } from "@/lib/export";
import { formatModifier, simplifyCurrency } from "@/lib/utils";
import { resolveItemDescription } from "@/lib/inventory";
import { toast } from "sonner";
import { Sword, Shield, Wrench, FlaskConical, Heart, Plus, SearchX } from "lucide-react";
import type { InventoryItem } from "@/lib/types";
import type { ReactNode } from "react";
import { WEAPONS } from "@/data/weapons";
import { GEAR } from "@/data/gear";
import { recalculateDerived } from "@/lib/recalculate";
import { ItemFormModal } from "@/components/inventory/ItemFormModal";

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
  const [unpackingItem, setUnpackingItem] = useState<InventoryItem | null>(
    null
  );
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [attackPrefillWeapon, setAttackPrefillWeapon] = useState<string | null>(
    null
  );
  const [attackPrefillDisplayName, setAttackPrefillDisplayName] = useState<
    string | undefined
  >(undefined);

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
      const catalogName = item.baseWeaponName ?? item.name;
      const inCatalog = WEAPONS.some((w) => w.name === catalogName);
      if (inCatalog && !alreadyTracked) {
        toast(`¿Agregar "${item.name}" a tus acciones de combate?`, {
          action: {
            label: "Agregar",
            onClick: () => {
              setAttackPrefillWeapon(catalogName);
              setAttackPrefillDisplayName(item.name);
            },
          },
        });
      }
    }
  }

  function packContentsFor(
    item: InventoryItem
  ): { name: string; quantity: number }[] | null {
    return GEAR.find((g) => g.name === item.name)?.packContents ?? null;
  }

  function handleUnpack(item: InventoryItem) {
    const contents = packContentsFor(item);
    if (!contents) return;
    update((c) => {
      let nextInventory = c.inventory.map((i) =>
        i.id === item.id && i.quantity > 1
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
      if (item.quantity <= 1) {
        nextInventory = nextInventory.filter((i) => i.id !== item.id);
      }
      for (const content of contents) {
        const existingIndex = nextInventory.findIndex(
          (i) => i.name === content.name
        );
        if (existingIndex !== -1) {
          nextInventory = nextInventory.map((i, idx) =>
            idx === existingIndex
              ? { ...i, quantity: i.quantity + content.quantity }
              : i
          );
        } else {
          const catalogEntry = GEAR.find((g) => g.name === content.name);
          nextInventory = [
            ...nextInventory,
            {
              id: crypto.randomUUID(),
              name: content.name,
              quantity: content.quantity,
              weight: catalogEntry?.weight ?? null,
              value: catalogEntry?.value ?? null,
              category: "gear",
              equipped: false,
              description: "",
              magicBonus: null,
              magicBonusTargets: [],
              magicAttackBonus: null,
              magicDamageBonus: null,
              baseWeaponName: null,
              grantedAction: null,
              requiresAttunement: false,
              attuned: false,
            },
          ];
        }
      }
      return { ...c, inventory: nextInventory };
    });
    toast(`${item.name} abierto`, { icon: "📦" });
    setUnpackingItem(null);
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

  return (
    <div className="p-4 space-y-4">
      {/* Currency Bar */}
      <div className="stone-card rounded-lg p-3">
        <div className="flex justify-around">
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
        <button
          onClick={() => updateCurrency(simplifyCurrency(currency))}
          className="w-full mt-2 p-2 rounded-lg border border-border/50 bg-card/50 text-center"
        >
          <span className="font-heading text-muted text-xs">
            Simplificar monedas
          </span>
        </button>
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
              <GhostChip
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                solid={!hiddenCategories.has(cat.value)}
              >
                {cat.label}
              </GhostChip>
            ))}
          </div>
        </div>
      </div>

      {(() => {
        const attunedCount = inventory.filter((i) => i.attuned).length;
        if (attunedCount === 0) return null;
        return (
          <p
            className={`text-xs ${attunedCount > 3 ? "text-danger" : "text-muted"}`}
          >
            Sintonizados: {attunedCount}/3
          </p>
        );
      })()}

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
                  className={`flex items-center gap-2 cursor-pointer ${density === "compact" ? "min-h-[40px] p-2" : "min-h-[44px] p-3"}`}
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
                    <span className="font-heading text-sm text-accent">{item.name}</span>
                    {item.quantity > 1 && (
                      <span className="text-muted text-xs ml-1">
                        ×{item.quantity}
                      </span>
                    )}
                    {(() => {
                      const values = [
                        item.magicBonus,
                        item.magicAttackBonus,
                        item.magicDamageBonus,
                      ].filter((v): v is number => v !== null);
                      const unique = [...new Set(values)];
                      if (unique.length === 0) return null;
                      return (
                        <span className="text-accent text-xs ml-1 font-heading">
                          {unique.length === 1 ? formatModifier(unique[0]) : "✦"}
                        </span>
                      );
                    })()}
                    {item.attuned && (
                      <span className="text-[0.6rem] px-1.5 py-0.5 bg-accent/20 text-accent rounded ml-1">
                        Sintonizado
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
                    {resolveItemDescription(item) && (
                      <Markdown className="text-xs text-foreground/80">
                        {resolveItemDescription(item)}
                      </Markdown>
                    )}
                    {!!item.magicBonus && (
                      <p className="text-xs text-accent">
                        Bono mágico: {formatModifier(item.magicBonus)} (
                        {item.magicBonusTargets
                          .map((t) => (t === "ac" ? "CA" : "Salvaciones"))
                          .join(", ") || "sin aplicar"}
                        )
                      </p>
                    )}
                    {!!item.magicAttackBonus && (
                      <p className="text-xs text-accent">
                        Bono de ataque: {formatModifier(item.magicAttackBonus)}
                        {item.category === "weapon"
                          ? ` (vinculado a ${item.baseWeaponName ?? item.name})`
                          : " (a todos tus ataques)"}
                      </p>
                    )}
                    {!!item.magicDamageBonus && (
                      <p className="text-xs text-accent">
                        Bono de daño: {formatModifier(item.magicDamageBonus)}
                        {item.category === "weapon"
                          ? ` (vinculado a ${item.baseWeaponName ?? item.name})`
                          : " (a todos tus ataques)"}
                      </p>
                    )}
                    {item.grantedAction && (
                      <p className="text-xs text-accent">
                        {item.grantedAction.name} (
                        {item.grantedAction.actionType === "action"
                          ? "Acción"
                          : item.grantedAction.actionType === "bonus"
                            ? "Bonus Action"
                            : "Reacción"}
                        {item.grantedAction.charges
                          ? ` · ${item.grantedAction.charges.remaining}/${item.grantedAction.charges.total} usos`
                          : ""}
                        )
                      </p>
                    )}
                    {packContentsFor(item) && (
                      <button
                        onClick={() => setUnpackingItem(item)}
                        className="text-xs text-accent border border-accent/30 rounded-lg px-3 py-1.5 hover:bg-accent/10"
                      >
                        Abrir {item.name}
                      </button>
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
                        onClick={() => setEditingItem(item)}
                        className="ml-auto px-3 py-1 text-xs text-accent border border-accent/30 rounded hover:bg-accent/10"
                      >
                        Editar
                      </button>
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
                        className="px-3 py-1 text-xs text-danger border border-danger/30 rounded hover:bg-danger/10"
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

      <ItemFormModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={(item) => {
          addInventoryItem(item);
          toast(`${item.name} agregado`, { icon: "📦" });
        }}
      />

      <ItemFormModal
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem ?? undefined}
        onSave={(item) =>
          update((c) => {
            const nextInventory = c.inventory.map((i) =>
              i.id === item.id ? item : i
            );
            return recalculateDerived({ ...c, inventory: nextInventory });
          })
        }
      />

      {/* Unpack Confirmation Modal */}
      <Modal
        open={!!unpackingItem}
        onClose={() => setUnpackingItem(null)}
        title={`Abrir ${unpackingItem?.name ?? ""}`}
      >
        {unpackingItem &&
          (() => {
            const contents = packContentsFor(unpackingItem);
            if (!contents) return null;
            return (
              <div className="space-y-3">
                <p className="text-sm text-foreground/80">Se agregará:</p>
                <ul className="text-sm text-foreground/80 list-disc pl-4 space-y-0.5">
                  {contents.map((c) => (
                    <li key={c.name}>
                      {c.quantity > 1 ? `${c.quantity}× ` : ""}
                      {c.name}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted">
                  {unpackingItem.quantity > 1
                    ? `${unpackingItem.name} bajará a ${unpackingItem.quantity - 1}.`
                    : `${unpackingItem.name} se eliminará del inventario.`}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUnpackingItem(null)}
                    className="flex-1 py-2 text-sm border border-border rounded-lg text-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleUnpack(unpackingItem)}
                    className="flex-1 py-2 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
                  >
                    Abrir
                  </button>
                </div>
              </div>
            );
          })()}
      </Modal>

      <AttackFormModal
        open={attackPrefillWeapon !== null}
        onClose={() => setAttackPrefillWeapon(null)}
        onSave={(a) => {
          addAttack(a);
          setAttackPrefillWeapon(null);
        }}
        initialWeaponName={attackPrefillWeapon ?? undefined}
        initialDisplayName={attackPrefillDisplayName}
      />
    </div>
  );
}
