"use client";

import { useState, useCallback } from "react";
import { useCharacterContext } from "@/lib/context";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { DiceResult } from "@/components/ui/DiceResult";
import type { AbilityScore } from "@/lib/types";
import { rollD20, type DiceRoll } from "@/lib/dice";
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
  const [activeRoll, setActiveRoll] = useState<{
    key: string;
    roll: DiceRoll;
  } | null>(null);

  const clearRoll = useCallback(() => setActiveRoll(null), []);

  if (!character) return null;

  const { meta, attributes, skills, savingThrows, proficiencies, features } =
    character;

  function rollAbility(ab: AbilityScore) {
    const mod = abilityModifier(attributes[ab]);
    const result = rollD20(mod);
    setActiveRoll({ key: `ability-${ab}`, roll: result });
  }

  function rollSave(ab: AbilityScore) {
    const total = saveTotal(character!, ab);
    const result = rollD20(total);
    setActiveRoll({ key: `save-${ab}`, roll: result });
  }

  function rollSkill(key: string) {
    const total = skillTotal(character!, key);
    const result = rollD20(total);
    setActiveRoll({ key: `skill-${key}`, roll: result });
  }

  return (
    <div className="p-4 space-y-0">
      {/* Header */}
      <div className="mb-6 cord-line pl-4">
        <div className="relative cord-knot">
          <h1 className="font-heading text-3xl text-accent font-bold tracking-wide">
            {meta.name}
          </h1>
        </div>
        <div className="crack-divider mt-2 mb-2" />
        <p className="text-muted text-sm">
          {meta.class} {meta.subclass ? `· ${meta.subclass}` : ""} — Nivel{" "}
          {meta.level}
        </p>
        <p className="text-muted text-xs mt-0.5">
          {meta.species} · {meta.giantAncestry} · {meta.background} · {meta.origin}
        </p>
      </div>

      {/* Atributos */}
      <CollapsibleSection title="Atributos" defaultOpen>
        <div className="grid grid-cols-3 gap-2">
          {ABILITIES.map((ab) => (
            <button
              key={ab}
              onClick={() => rollAbility(ab)}
              className="stone-card rounded-lg p-2 text-center active:scale-95 transition-transform cursor-pointer"
            >
              <div className="text-muted text-[0.6rem] uppercase tracking-widest">{abilityLabel(ab)}</div>
              <div className="font-heading text-3xl text-accent font-bold leading-tight">
                {attributes[ab]}
              </div>
              <div className="text-xs text-foreground/70 font-heading">
                {formatModifier(abilityModifier(attributes[ab]))}
              </div>
            </button>
          ))}
        </div>
        {activeRoll?.key.startsWith("ability-") && (
          <div className="mt-2">
            <DiceResult
              roll={activeRoll.roll}
              label={abilityLabel(activeRoll.key.replace("ability-", "") as AbilityScore)}
              onClear={clearRoll}
            />
          </div>
        )}
      </CollapsibleSection>

      {/* Tiradas de salvación */}
      <CollapsibleSection title="Tiradas de salvación">
        <div className="space-y-1">
          {ABILITIES.map((ab) => (
            <button
              key={ab}
              onClick={() => rollSave(ab)}
              className="w-full flex items-center justify-between py-1.5 px-1 text-sm rounded hover:bg-card/50 active:scale-[0.99] transition-transform cursor-pointer"
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
            </button>
          ))}
        </div>
        {activeRoll?.key.startsWith("save-") && (
          <div className="mt-2">
            <DiceResult
              roll={activeRoll.roll}
              label={`Salvación ${abilityLabel(activeRoll.key.replace("save-", "") as AbilityScore)}`}
              onClear={clearRoll}
            />
          </div>
        )}
      </CollapsibleSection>

      {/* Habilidades */}
      <CollapsibleSection title="Habilidades">
        <div className="space-y-1">
          {Object.entries(skills)
            .sort(([a], [b]) => skillLabel(a).localeCompare(skillLabel(b)))
            .map(([key, skill]) => (
              <button
                key={key}
                onClick={() => rollSkill(key)}
                className="w-full flex items-center justify-between py-1.5 px-1 text-sm rounded hover:bg-card/50 active:scale-[0.99] transition-transform cursor-pointer"
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
              </button>
            ))}
        </div>
        {activeRoll?.key.startsWith("skill-") && (
          <div className="mt-2">
            <DiceResult
              roll={activeRoll.roll}
              label={skillLabel(activeRoll.key.replace("skill-", ""))}
              onClear={clearRoll}
            />
          </div>
        )}
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
            <div key={i} className="stone-card rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-heading text-accent text-base font-semibold">
                  {f.name}
                </span>
                <span className="text-muted text-[0.6rem] px-1.5 py-0.5 border border-border rounded uppercase tracking-wider">
                  {f.source}
                </span>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">{f.description}</p>
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
