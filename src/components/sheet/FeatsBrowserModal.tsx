"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FEATS, type FeatData } from "@/data/feats";
import { meetsAbilityPrereqs } from "@/lib/feats";
import { abilityLabel } from "@/lib/utils";
import type { AbilityScore, Character } from "@/lib/types";

const CATEGORIES = ["General", "Origin", "Epic Boon", "Fighting Style"] as const;
type CategoryFilter = "all" | (typeof CATEGORIES)[number];

function formatAbilityPrereqs(feat: FeatData): string | null {
  if (!feat.abilityPrereqs || feat.abilityPrereqs.length === 0) return null;
  return feat.abilityPrereqs
    .map((prereq) =>
      Object.entries(prereq)
        .map(([ab, min]) => `${abilityLabel(ab as AbilityScore)} ${min}+`)
        .join(" y ")
    )
    .join(" o ");
}

function getFeatStatus(feat: FeatData, character: Character): string {
  const meetsAbility = meetsAbilityPrereqs(feat, character.attributes);
  const meetsLevel =
    feat.levelRequired == null || character.meta.level >= feat.levelRequired;
  const abilityStr = formatAbilityPrereqs(feat);

  if (meetsAbility && meetsLevel) return "Disponible ahora";

  if (!meetsLevel) {
    const levelPart = `Requiere nivel ${feat.levelRequired}`;
    if (!abilityStr) return levelPart;
    return meetsAbility
      ? `${levelPart} · Cumples ${abilityStr}`
      : `${levelPart} · Requiere ${abilityStr}`;
  }

  return `Requiere ${abilityStr}`;
}

export function FeatsBrowserModal({
  open,
  onClose,
  character,
}: {
  open: boolean;
  onClose: () => void;
  character: Character;
}) {
  const [hideSpellcasting, setHideSpellcasting] = useState(true);
  const [hideFightingStyle, setHideFightingStyle] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");

  const visibleCategories = CATEGORIES.filter(
    (c) => c !== "Fighting Style" || !hideFightingStyle
  );

  const filtered = FEATS.filter((f) => {
    if (hideSpellcasting && f.requiresSpellcasting) return false;
    if (hideFightingStyle && f.category === "Fighting Style") return false;
    if (categoryFilter !== "all" && f.category !== categoryFilter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <Modal open={open} onClose={onClose} title="Dotes disponibles">
      <div className="space-y-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar dote..."
          className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
        />

        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setHideSpellcasting((h) => !h)}
            className={`px-2.5 py-1 rounded-full text-xs ${
              hideSpellcasting
                ? "bg-accent text-white"
                : "bg-card border border-border text-muted"
            }`}
          >
            Sin lanzamiento de conjuros
          </button>
          <button
            onClick={() => setHideFightingStyle((h) => !h)}
            className={`px-2.5 py-1 rounded-full text-xs ${
              hideFightingStyle
                ? "bg-accent text-white"
                : "bg-card border border-border text-muted"
            }`}
          >
            Sin Fighting Style
          </button>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-2.5 py-1 rounded-full text-xs ${
              categoryFilter === "all"
                ? "bg-accent text-white"
                : "bg-card border border-border text-muted"
            }`}
          >
            Todas
          </button>
          {visibleCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-2.5 py-1 rounded-full text-xs ${
                categoryFilter === c
                  ? "bg-accent text-white"
                  : "bg-card border border-border text-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="max-h-[50vh] overflow-y-auto space-y-2">
          {filtered.map((f) => {
            const status =
              f.category === "Fighting Style" || f.requiresSpellcasting
                ? "No aplica a tu build"
                : getFeatStatus(f, character);
            return (
              <div key={f.name} className="stone-card rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-heading text-accent text-sm">
                    {f.name}
                  </span>
                  <span className="text-[0.6rem] text-muted border border-border rounded px-1.5 py-0.5">
                    {f.category}
                  </span>
                  <span
                    className={`text-[0.6rem] px-1.5 py-0.5 rounded ${
                      status === "Disponible ahora"
                        ? "bg-success/20 text-success"
                        : "bg-card border border-border text-muted"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <p className="text-xs text-foreground/70 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-muted text-sm text-center py-8">
              Sin dotes que coincidan. Ajusta la búsqueda o los filtros.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
