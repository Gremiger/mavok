"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CONDITIONS } from "@/data/conditions";
import { ACTIONS } from "@/data/actions";
import { SKILLS_REFERENCE } from "@/data/skills-reference";
import { WEAPONS } from "@/data/weapons";
import { ARMOR } from "@/data/armor";
import { GEAR } from "@/data/gear";
import { MASTERY_PROPERTIES } from "@/data/mastery";
import { FEATS } from "@/data/feats";
import { SPELLS } from "@/data/spells";
import { abilityLabel } from "@/lib/utils";
import type { AbilityScore } from "@/lib/types";

const CATEGORIES = [
  { id: "conditions", label: "Condiciones" },
  { id: "actions", label: "Acciones" },
  { id: "skills", label: "Habilidades" },
  { id: "weapons", label: "Armas" },
  { id: "armor", label: "Armaduras" },
  { id: "gear", label: "Equipo" },
  { id: "mastery", label: "Maestrías" },
  { id: "feats", label: "Dotes" },
  { id: "spells", label: "Hechizos" },
] as const;

type Category = (typeof CATEGORIES)[number]["id"];

interface EncyclopediaItem {
  id: string;
  category: Category;
  name: string;
  hint: string;
  detail: string;
}

function buildConditionItems(): EncyclopediaItem[] {
  return CONDITIONS.map((c) => ({
    id: `conditions-${c.name}`,
    category: "conditions",
    name: c.name,
    hint: "",
    detail: c.description,
  }));
}

function buildActionItems(): EncyclopediaItem[] {
  return ACTIONS.map((a) => ({
    id: `actions-${a.name}`,
    category: "actions",
    name: a.name,
    hint: "",
    detail: a.description,
  }));
}

function buildSkillItems(): EncyclopediaItem[] {
  return SKILLS_REFERENCE.map((s) => ({
    id: `skills-${s.name}`,
    category: "skills",
    name: s.name,
    hint: abilityLabel(s.ability as AbilityScore),
    detail: s.description,
  }));
}

function buildWeaponItems(): EncyclopediaItem[] {
  return WEAPONS.map((w) => ({
    id: `weapons-${w.name}`,
    category: "weapons",
    name: w.name,
    hint: `${w.damage} ${w.damageType}`,
    detail: [
      `${w.type === "melee" ? "Cuerpo a cuerpo" : "A distancia"} · ${w.category}`,
      `Daño: ${w.damage} ${w.damageType}`,
      w.range ? `Alcance: ${w.range}` : null,
      `Peso: ${w.weight} lb${w.value !== null ? ` · Valor: ${w.value} gp` : ""}`,
      `Propiedades: ${w.properties.length ? w.properties.join(", ") : "Ninguna"}`,
      w.mastery ? `Maestría: ${w.mastery}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  }));
}

function buildArmorItems(): EncyclopediaItem[] {
  return ARMOR.map((a) => ({
    id: `armor-${a.name}`,
    category: "armor",
    name: a.name,
    hint: `AC ${a.ac}`,
    detail: [
      `Tipo: ${a.type}`,
      `CA: ${a.ac}`,
      `Peso: ${a.weight} lb${a.value !== null ? ` · Valor: ${a.value} gp` : ""}`,
      a.stealthDisadvantage ? "Desventaja en Sigilo" : null,
      a.strengthRequirement ? `Requiere FUE ${a.strengthRequirement}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  }));
}

function buildGearItems(): EncyclopediaItem[] {
  return GEAR.map((g) => ({
    id: `gear-${g.name}`,
    category: "gear",
    name: g.name,
    hint: g.value !== null ? `${g.value} gp` : "",
    detail: g.description,
  }));
}

function buildMasteryItems(): EncyclopediaItem[] {
  return MASTERY_PROPERTIES.map((m) => ({
    id: `mastery-${m.name}`,
    category: "mastery",
    name: m.name,
    hint: "",
    detail: m.description,
  }));
}

function buildFeatItems(): EncyclopediaItem[] {
  return FEATS.map((f) => ({
    id: `feats-${f.name}`,
    category: "feats",
    name: f.name,
    hint: f.category,
    detail: [
      [
        f.category,
        f.levelRequired ? `Nivel ${f.levelRequired}` : null,
        f.repeatable ? "Repetible" : null,
      ]
        .filter(Boolean)
        .join(" · "),
      "",
      f.description,
    ].join("\n"),
  }));
}

function buildSpellItems(): EncyclopediaItem[] {
  return SPELLS.map((s) => ({
    id: `spells-${s.name}`,
    category: "spells",
    name: s.name,
    hint: `${s.level === 0 ? "Cantrip" : `Nv. ${s.level}`} · ${s.school}`,
    detail: [
      `${s.level === 0 ? "Cantrip" : `Nivel ${s.level}`} · ${s.school}${s.ritual ? " (Ritual)" : ""}`,
      `Tiempo de lanzamiento: ${s.castingTime}`,
      `Alcance: ${s.range}`,
      `Componentes: ${s.components}`,
      `Duración: ${s.duration}${s.concentration ? " (Concentración)" : ""}`,
      "",
      s.description,
    ].join("\n"),
  }));
}

const CATEGORY_ITEMS: Record<Category, () => EncyclopediaItem[]> = {
  conditions: buildConditionItems,
  actions: buildActionItems,
  skills: buildSkillItems,
  weapons: buildWeaponItems,
  armor: buildArmorItems,
  gear: buildGearItems,
  mastery: buildMasteryItems,
  feats: buildFeatItems,
  spells: buildSpellItems,
};

export function EncyclopediaTab() {
  const [activeCategory, setActiveCategory] = useState<Category>("conditions");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingItem, setViewingItem] = useState<EncyclopediaItem | null>(null);

  const allItems = useMemo(
    () => CATEGORIES.flatMap((c) => CATEGORY_ITEMS[c.id]()),
    []
  );
  const categoryItems = useMemo(
    () => CATEGORY_ITEMS[activeCategory](),
    [activeCategory]
  );

  const searchResults = searchQuery
    ? allItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  function renderRow(item: EncyclopediaItem, showCategoryBadge: boolean) {
    return (
      <div
        key={item.id}
        onClick={() => setViewingItem(item)}
        className="stone-card rounded-lg p-3 cursor-pointer active:scale-[0.99] transition-transform flex items-center gap-2"
      >
        {showCategoryBadge && (
          <span className="text-[0.6rem] px-1.5 py-0.5 bg-accent/20 text-accent rounded shrink-0">
            {CATEGORIES.find((c) => c.id === item.category)?.label}
          </span>
        )}
        <span className="text-sm truncate flex-1">{item.name}</span>
        {item.hint && (
          <span className="text-muted text-xs shrink-0">{item.hint}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-2 border-b border-border bg-card shrink-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en la enciclopedia..."
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
        />
      </div>

      {/* Category navigation (hidden while searching) */}
      {!searchQuery && (
        <div className="flex overflow-x-auto border-b border-border bg-card px-2 gap-1 shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-2.5 text-xs whitespace-nowrap transition-colors border-b-2 ${
                activeCategory === cat.id
                  ? "text-accent border-accent"
                  : "text-muted border-transparent"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {searchQuery ? (
          searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((item) => renderRow(item, true))}
            </div>
          ) : (
            <p className="text-muted text-sm text-center py-8">
              Sin resultados para &quot;{searchQuery}&quot;.
            </p>
          )
        ) : (
          <div className="space-y-2">
            {categoryItems.map((item) => renderRow(item, false))}
          </div>
        )}
      </div>

      <Modal
        open={viewingItem !== null}
        onClose={() => setViewingItem(null)}
        title={viewingItem?.name ?? ""}
      >
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
          {viewingItem?.detail}
        </p>
      </Modal>
    </div>
  );
}
