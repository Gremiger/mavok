"use client";

import { useCharacterContext } from "@/lib/context";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import type { AbilityScore } from "@/lib/types";
import {
  abilityModifier,
  formatModifier,
  abilityLabel,
  abilityLabelShort,
  skillLabel,
  skillTotal,
  saveTotal,
} from "@/lib/utils";

const ABILITIES: AbilityScore[] = ["str", "dex", "con", "int", "wis", "cha"];

export function SheetTab() {
  const { character } = useCharacterContext();
  if (!character) return null;

  const { meta, attributes, skills, savingThrows, proficiencies, features } =
    character;

  return (
    <div className="p-4 space-y-0">
      {/* Header */}
      <div className="mb-4">
        <h1 className="font-heading text-2xl text-accent">{meta.name}</h1>
        <p className="text-muted text-sm mt-1">
          {meta.class} {meta.subclass ? `(${meta.subclass})` : ""} — Nivel{" "}
          {meta.level} · {meta.species} · {meta.background}
        </p>
        <p className="text-muted text-xs mt-0.5">
          {meta.origin} · {meta.age} años · {meta.giantAncestry}
        </p>
      </div>

      {/* Atributos */}
      <CollapsibleSection title="Atributos" defaultOpen>
        <div className="grid grid-cols-3 gap-2">
          {ABILITIES.map((ab) => (
            <div
              key={ab}
              className="bg-card rounded-lg p-2 text-center border border-border"
            >
              <div className="text-muted text-xs">{abilityLabel(ab)}</div>
              <div className="font-heading text-2xl text-accent">
                {attributes[ab]}
              </div>
              <div className="text-sm text-foreground">
                {formatModifier(abilityModifier(attributes[ab]))}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Tiradas de salvación */}
      <CollapsibleSection title="Tiradas de salvación">
        <div className="space-y-1">
          {ABILITIES.map((ab) => (
            <div
              key={ab}
              className="flex items-center justify-between py-1 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full border ${
                    savingThrows[ab]?.proficient
                      ? "bg-accent border-accent"
                      : "border-muted"
                  }`}
                />
                <span>{abilityLabel(ab)}</span>
              </div>
              <span className="font-heading text-accent">
                {formatModifier(saveTotal(character, ab))}
              </span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Habilidades */}
      <CollapsibleSection title="Habilidades">
        <div className="space-y-1">
          {Object.entries(skills)
            .sort(([a], [b]) => skillLabel(a).localeCompare(skillLabel(b)))
            .map(([key, skill]) => (
              <div
                key={key}
                className="flex items-center justify-between py-1 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full border ${
                      skill.proficient
                        ? "bg-accent border-accent"
                        : "border-muted"
                    }`}
                  />
                  <span>{skillLabel(key)}</span>
                  <span className="text-muted text-xs">
                    ({abilityLabelShort(skill.attribute)})
                  </span>
                </div>
                <span className="font-heading text-accent">
                  {formatModifier(skillTotal(character, key))}
                </span>
              </div>
            ))}
        </div>
      </CollapsibleSection>

      {/* Competencias */}
      <CollapsibleSection title="Competencias">
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="text-muted text-xs uppercase mb-1">Armaduras</h4>
            <p>{proficiencies.armor.join(", ")}</p>
          </div>
          <div>
            <h4 className="text-muted text-xs uppercase mb-1">Armas</h4>
            <p>{proficiencies.weapons.join(", ")}</p>
          </div>
          <div>
            <h4 className="text-muted text-xs uppercase mb-1">Herramientas</h4>
            <p>{proficiencies.tools.join(", ")}</p>
          </div>
          <div>
            <h4 className="text-muted text-xs uppercase mb-1">Idiomas</h4>
            <p>{proficiencies.languages.join(", ")}</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Rasgos y características */}
      <CollapsibleSection title="Rasgos y características">
        <div className="space-y-3">
          {features.map((f, i) => (
            <div key={i} className="bg-card rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-heading text-accent text-sm">
                  {f.name}
                </span>
                <span className="text-muted text-xs px-1.5 py-0.5 bg-background rounded">
                  {f.source}
                </span>
              </div>
              <p className="text-sm text-foreground/80">{f.description}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Apariencia */}
      <CollapsibleSection title="Apariencia">
        <p className="text-sm whitespace-pre-line">{meta.appearance}</p>
      </CollapsibleSection>

      {/* Personalidad */}
      <CollapsibleSection title="Personalidad">
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="text-muted text-xs uppercase mb-1">Rasgo</h4>
            <p>{meta.personalityTrait}</p>
          </div>
          <div>
            <h4 className="text-muted text-xs uppercase mb-1">Ideal</h4>
            <p>{meta.ideal}</p>
          </div>
          <div>
            <h4 className="text-muted text-xs uppercase mb-1">Vínculo</h4>
            <p>{meta.bond}</p>
          </div>
          <div>
            <h4 className="text-muted text-xs uppercase mb-1">Defecto</h4>
            <p>{meta.flaw}</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Historia */}
      <CollapsibleSection title="Historia">
        <p className="text-sm whitespace-pre-line">{meta.backstory}</p>
      </CollapsibleSection>

      {/* Objetivos */}
      <CollapsibleSection title="Objetivos">
        <ol className="list-decimal list-inside space-y-1 text-sm">
          {meta.goals.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ol>
      </CollapsibleSection>
    </div>
  );
}
