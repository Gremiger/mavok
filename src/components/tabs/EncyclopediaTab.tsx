"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star, SearchX } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { CompactRow } from "@/components/ui/CompactRow";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useThemeContext } from "@/lib/context";
import { CONDITIONS } from "@/data/conditions";
import { ACTIONS } from "@/data/actions";
import { SKILLS_REFERENCE } from "@/data/skills-reference";
import { WEAPONS } from "@/data/weapons";
import { ARMOR } from "@/data/armor";
import { GEAR } from "@/data/gear";
import { MASTERY_PROPERTIES } from "@/data/mastery";
import { FEATS } from "@/data/feats";
import { SPELLS } from "@/data/spells";
import {
  CONDITIONS_ES,
  ACTIONS_ES,
  SKILLS_ES,
  SPELLS_ES,
} from "@/data/translations-es";
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

const FAVORITES_ID = "favorites" as const;

const PILLS: { id: Category | typeof FAVORITES_ID; label: string }[] = [
  { id: FAVORITES_ID, label: "Favoritos" },
  ...CATEGORIES,
];

const PILL_IDS = PILLS.map((p) => p.id);

const TRANSLATIONS: Partial<Record<Category, Record<string, string>>> = {
  conditions: CONDITIONS_ES,
  actions: ACTIONS_ES,
  skills: SKILLS_ES,
  spells: SPELLS_ES,
};

const TRANSLATION_DISCLAIMER =
  "Traducción no oficial — verifica en inglés si hay dudas.";

interface EncyclopediaItem {
  id: string;
  category: Category;
  name: string;
  hint: string;
  header: string;
  description: string;
}

function resolveDetail(
  item: EncyclopediaItem,
  language: "en" | "es"
): string {
  const translations = TRANSLATIONS[item.category];
  const translated = language === "es" ? translations?.[item.name] : undefined;
  const body = translated
    ? `${TRANSLATION_DISCLAIMER}\n\n${translated}`
    : item.description;
  return [item.header, body].filter(Boolean).join("\n\n");
}

function buildConditionItems(): EncyclopediaItem[] {
  return CONDITIONS.map((c) => ({
    id: `conditions-${c.name}`,
    category: "conditions",
    name: c.name,
    hint: "",
    header: "",
    description: c.description,
  }));
}

function buildActionItems(): EncyclopediaItem[] {
  return ACTIONS.map((a) => ({
    id: `actions-${a.name}`,
    category: "actions",
    name: a.name,
    hint: "",
    header: "",
    description: a.description,
  }));
}

function buildSkillItems(): EncyclopediaItem[] {
  return SKILLS_REFERENCE.map((s) => ({
    id: `skills-${s.name}`,
    category: "skills",
    name: s.name,
    hint: abilityLabel(s.ability as AbilityScore),
    header: "",
    description: s.description,
  }));
}

function buildWeaponItems(): EncyclopediaItem[] {
  return WEAPONS.map((w) => ({
    id: `weapons-${w.name}`,
    category: "weapons",
    name: w.name,
    hint: `${w.damage} ${w.damageType}`,
    header: [
      `${w.type === "melee" ? "Cuerpo a cuerpo" : "A distancia"} · ${w.category}`,
      `Daño: ${w.damage} ${w.damageType}`,
      w.range ? `Alcance: ${w.range}` : null,
      `Peso: ${w.weight} lb${w.value !== null ? ` · Valor: ${w.value} gp` : ""}`,
      `Propiedades: ${w.properties.length ? w.properties.join(", ") : "Ninguna"}`,
      w.mastery ? `Maestría: ${w.mastery}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    description: "",
  }));
}

function buildArmorItems(): EncyclopediaItem[] {
  return ARMOR.map((a) => ({
    id: `armor-${a.name}`,
    category: "armor",
    name: a.name,
    hint: `AC ${a.ac}`,
    header: [
      `Tipo: ${a.type}`,
      `CA: ${a.ac}`,
      `Peso: ${a.weight} lb${a.value !== null ? ` · Valor: ${a.value} gp` : ""}`,
      a.stealthDisadvantage ? "Desventaja en Sigilo" : null,
      a.strengthRequirement ? `Requiere FUE ${a.strengthRequirement}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    description: "",
  }));
}

function buildGearItems(): EncyclopediaItem[] {
  return GEAR.map((g) => ({
    id: `gear-${g.name}`,
    category: "gear",
    name: g.name,
    hint: g.value !== null ? `${g.value} gp` : "",
    header: "",
    description: g.description,
  }));
}

function buildMasteryItems(): EncyclopediaItem[] {
  return MASTERY_PROPERTIES.map((m) => ({
    id: `mastery-${m.name}`,
    category: "mastery",
    name: m.name,
    hint: "",
    header: "",
    description: m.description,
  }));
}

function buildFeatItems(): EncyclopediaItem[] {
  return FEATS.map((f) => ({
    id: `feats-${f.name}`,
    category: "feats",
    name: f.name,
    hint: f.category,
    header: [
      f.category,
      f.levelRequired ? `Nivel ${f.levelRequired}` : null,
      f.repeatable ? "Repetible" : null,
    ]
      .filter(Boolean)
      .join(" · "),
    description: f.description,
  }));
}

function buildSpellItems(): EncyclopediaItem[] {
  return SPELLS.map((s) => ({
    id: `spells-${s.name}`,
    category: "spells",
    name: s.name,
    hint: `${s.level === 0 ? "Cantrip" : `Nv. ${s.level}`} · ${s.school}`,
    header: [
      `${s.level === 0 ? "Cantrip" : `Nivel ${s.level}`} · ${s.school}${s.ritual ? " (Ritual)" : ""}`,
      `Tiempo de lanzamiento: ${s.castingTime}`,
      `Alcance: ${s.range}`,
      `Componentes: ${s.components}`,
      `Duración: ${s.duration}${s.concentration ? " (Concentración)" : ""}`,
    ].join("\n"),
    description: s.description,
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
  const {
    encyclopediaFavorites,
    toggleFavorite,
    encyclopediaLanguage,
    setEncyclopediaLanguage,
  } = useThemeContext();
  const [activeCategory, setActiveCategory] = useState<
    Category | typeof FAVORITES_ID
  >("conditions");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingItem, setViewingItem] = useState<EncyclopediaItem | null>(null);
  const { dragX, dragOpacity, handleDragEnd } = useSwipeNavigation(
    PILL_IDS,
    activeCategory,
    setActiveCategory
  );

  const allItems = useMemo(
    () => CATEGORIES.flatMap((c) => CATEGORY_ITEMS[c.id]()),
    []
  );
  const categoryItems = useMemo(
    () =>
      activeCategory === FAVORITES_ID ? [] : CATEGORY_ITEMS[activeCategory](),
    [activeCategory]
  );
  const favoriteItems = useMemo(
    () => allItems.filter((item) => encyclopediaFavorites.includes(item.id)),
    [allItems, encyclopediaFavorites]
  );

  const searchResults = searchQuery
    ? allItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  function renderRow(item: EncyclopediaItem, showCategoryBadge: boolean) {
    const isFavorite = encyclopediaFavorites.includes(item.id);
    return (
      <CompactRow
        key={item.id}
        onClick={() => setViewingItem(item)}
        name={
          <>
            {showCategoryBadge && (
              <span className="text-[0.6rem] px-1.5 py-0.5 bg-accent/20 text-accent rounded mr-1.5">
                {CATEGORIES.find((c) => c.id === item.category)?.label}
              </span>
            )}
            {item.name}
          </>
        }
        right={
          <span className="flex items-center gap-2">
            {item.hint && <span className="text-muted text-xs">{item.hint}</span>}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(item.id);
              }}
              className="text-accent"
            >
              <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </span>
        }
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search bar + language toggle */}
      <div className="p-2 border-b border-border bg-card shrink-0 flex gap-2 items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en la enciclopedia..."
          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
        />
        <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
          <button
            onClick={() => setEncyclopediaLanguage("en")}
            className={`px-2 py-2 text-xs font-heading ${
              encyclopediaLanguage === "en"
                ? "bg-accent text-white"
                : "text-muted"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setEncyclopediaLanguage("es")}
            className={`px-2 py-2 text-xs font-heading ${
              encyclopediaLanguage === "es"
                ? "bg-accent text-white"
                : "text-muted"
            }`}
          >
            ES
          </button>
        </div>
      </div>

      {/* Category navigation (hidden while searching) */}
      {!searchQuery && (
        <div className="flex overflow-x-auto border-b border-border bg-card px-2 gap-1 shrink-0">
          {PILLS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-2.5 text-xs whitespace-nowrap transition-colors border-b-2 ${
                activeCategory === tab.id
                  ? "text-accent border-accent"
                  : "text-muted border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <motion.div
        className="flex-1 overflow-y-auto p-4"
        style={{ x: dragX, opacity: dragOpacity, touchAction: "pan-y pinch-zoom" }}
        drag={searchQuery ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        {searchQuery ? (
          searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((item) => renderRow(item, true))}
            </div>
          ) : (
            <EmptyState
              icon={SearchX}
              message={`Sin resultados para "${searchQuery}".`}
            />
          )
        ) : activeCategory === FAVORITES_ID ? (
          favoriteItems.length > 0 ? (
            <div className="space-y-2">
              {favoriteItems.map((item) => renderRow(item, true))}
            </div>
          ) : (
            <EmptyState
              icon={Star}
              message="Aún no tienes favoritos — toca la estrella en cualquier entrada."
            />
          )
        ) : (
          <div className="space-y-2">
            {categoryItems.map((item) => renderRow(item, false))}
          </div>
        )}
      </motion.div>

      <Modal
        open={viewingItem !== null}
        onClose={() => setViewingItem(null)}
        title={viewingItem?.name ?? ""}
      >
        {viewingItem && (
          <>
            <button
              onClick={() => toggleFavorite(viewingItem.id)}
              className="flex items-center gap-1.5 text-xs text-accent mb-3"
            >
              <Star
                size={16}
                fill={
                  encyclopediaFavorites.includes(viewingItem.id)
                    ? "currentColor"
                    : "none"
                }
              />
              {encyclopediaFavorites.includes(viewingItem.id)
                ? "En favoritos"
                : "Agregar a favoritos"}
            </button>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {resolveDetail(viewingItem, encyclopediaLanguage)}
            </p>
          </>
        )}
      </Modal>
    </div>
  );
}
