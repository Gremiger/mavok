"use client";

import { useState } from "react";
import { useCharacterContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import type { Feature } from "@/lib/types";

function FeatureList({
  level,
  features,
  expandedKey,
  onToggle,
}: {
  level: number;
  features: Feature[];
  expandedKey: string | null;
  onToggle: (key: string | null) => void;
}) {
  if (features.length === 0) return null;
  return (
    <div className="mt-1 space-y-1">
      {features.map((f) => {
        const key = `${level}:${f.name}`;
        return (
          <div key={key}>
            <button
              onClick={() => onToggle(expandedKey === key ? null : key)}
              className="text-xs text-foreground/80 hover:text-accent text-left"
            >
              • {f.name}
            </button>
            {expandedKey === key && (
              <p className="text-xs text-foreground/70 leading-relaxed bg-card/50 border border-border rounded-lg p-2 mt-1">
                {f.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function LevelUpHistoryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { character } = useCharacterContext();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (!character) return null;

  const featuresAtLevel = (level: number) =>
    character.features.filter((f) => f.level === level);

  return (
    <Modal open={open} onClose={onClose} title="Historial de niveles">
      <div className="relative pl-4">
        <div className="absolute left-[3px] top-2 bottom-2 w-px bg-border" />

        {/* Level 1: character creation, synthesized (not from levelUpHistory) */}
        <div className="relative pb-4">
          <div className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-accent" />
          <span className="text-sm font-heading text-accent">Nivel 1</span>
          <FeatureList
            level={1}
            features={featuresAtLevel(1)}
            expandedKey={expandedKey}
            onToggle={setExpandedKey}
          />
        </div>

        {character.levelUpHistory.map((entry) => (
          <div key={`${entry.level}-${entry.date}`} className="relative pb-4">
            <div className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-accent" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-heading text-accent">
                Nivel {entry.level}
              </span>
              <span className="text-xs text-muted">
                {new Date(entry.date).toLocaleDateString("es")}
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              {[entry.asiChoice, entry.featChosen].filter(Boolean).join(" · ") ||
                "—"}
              {entry.hpIncrease !== undefined && ` · +${entry.hpIncrease} HP`}
            </p>
            <FeatureList
              level={entry.level}
              features={featuresAtLevel(entry.level)}
              expandedKey={expandedKey}
              onToggle={setExpandedKey}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
}
