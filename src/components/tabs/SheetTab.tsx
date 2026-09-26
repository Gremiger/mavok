"use client";

import { useState, useCallback } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { CompactRow } from "@/components/ui/CompactRow";
import { GhostChip } from "@/components/ui/GhostChip";
import { DiceResult } from "@/components/ui/DiceResult";
import { FeatsBrowserModal } from "@/components/sheet/FeatsBrowserModal";
import { Markdown } from "@/components/ui/Markdown";
import { User, Zap } from "lucide-react";
import { splitNameHighlight } from "@/lib/nameHighlight";
import type { AbilityScore } from "@/lib/types";
import type { DiceRoll } from "@/lib/dice";
import { rollD20Mode, rollD20WithAdvantageMode } from "@/lib/rollWithMode";
import { describeWeaponMastery } from "@/lib/weaponMatch";
import { exhaustionPenalty } from "@/lib/exhaustion";
import {
  abilityModifier,
  formatModifier,
  abilityLabel,
  abilityLabelShort,
  abilityName,
  skillLabel,
  skillTotal,
  saveTotal,
} from "@/lib/utils";
import { sumMagicBonus } from "@/lib/recalculate";

const ABILITIES: AbilityScore[] = ["str", "dex", "con", "int", "wis", "cha"];
const PRIMAL_KNOWLEDGE_SKILLS = [
  "acrobatics",
  "intimidation",
  "perception",
  "stealth",
  "survival",
];

export function SheetTab() {
  const { character } = useCharacterContext();
  const { magicItemIndicator, diceRollMode } = useThemeContext();
  const [activeRoll, setActiveRoll] = useState<{
    key: string;
    roll: DiceRoll;
  } | null>(null);
  const [groupByAbility, setGroupByAbility] = useState(false);
  const [featsBrowserOpen, setFeatsBrowserOpen] = useState(false);

  const ABILITY_ORDER: AbilityScore[] = ["str", "dex", "con", "int", "wis", "cha"];

  const clearRoll = useCallback(() => setActiveRoll(null), []);

  if (!character) return null;

  const {
    meta,
    attributes,
    skills,
    savingThrows,
    proficiencies,
    features,
    resources,
    attacks,
    combat,
  } = character;

  const hasDangerSense = features.some((f) => f.name === "Danger Sense");
  const primalKnowledgeActive =
    resources.rpiRages.active &&
    features.some((f) => f.name === "Primal Knowledge");

  const magicSaveBonus = sumMagicBonus(character, "save");
  const passivePerception = 10 + skillTotal(character, 'perception');
  const passiveInsight = 10 + skillTotal(character, 'insight');
  const passiveInvestigation = 10 + skillTotal(character, 'investigation');
  const nameParts = splitNameHighlight(meta.name);

  async function rollAbility(ab: AbilityScore) {
    const mod = abilityModifier(attributes[ab]) + exhaustionPenalty(combat.exhaustionLevel);
    const { roll: result } = await rollD20Mode(mod, diceRollMode);
    setActiveRoll({ key: `ability-${ab}`, roll: result });
  }

  async function rollSave(ab: AbilityScore) {
    const total = saveTotal(character!, ab) + exhaustionPenalty(combat.exhaustionLevel);
    const { roll: result } =
      ab === "dex" && hasDangerSense
        ? await rollD20WithAdvantageMode(total, diceRollMode)
        : await rollD20Mode(total, diceRollMode);
    setActiveRoll({ key: `save-${ab}`, roll: result });
  }

  async function rollSkill(key: string) {
    const total = skillTotal(character!, key) + exhaustionPenalty(combat.exhaustionLevel);
    const { roll: result } = await rollD20Mode(total, diceRollMode);
    setActiveRoll({ key: `skill-${key}`, roll: result });
  }

  async function rollSkillStr(key: string) {
    const skill = skills[key];
    const strMod = abilityModifier(attributes.str);
    const total =
      strMod +
      (skill?.proficient ? meta.proficiencyBonus : 0) +
      exhaustionPenalty(combat.exhaustionLevel);
    const { roll: result } = await rollD20Mode(total, diceRollMode);
    setActiveRoll({ key: `skill-str-${key}`, roll: result });
  }

  function renderSkillRow(
    key: string,
    skill: { attribute: AbilityScore; proficient: boolean },
    showAbility: boolean
  ) {
    return (
      <div key={key} className="flex items-center gap-1">
        <button
          onClick={() => rollSkill(key)}
          className="flex-1 flex items-center justify-between py-1.5 px-1 text-sm rounded hover:bg-card/50 active:scale-[0.99] transition-transform cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className={`prof-mark ${skill.proficient ? "is-on" : ""}`} aria-hidden="true" />
            <span>{skillLabel(key)}</span>
            {showAbility && (
              <span className="text-muted text-xs">
                ({abilityLabelShort(skill.attribute)})
              </span>
            )}
          </div>
          <span className="font-numeric font-semibold text-accent">
            {formatModifier(skillTotal(character!, key) + exhaustionPenalty(combat.exhaustionLevel))}
          </span>
        </button>
        {primalKnowledgeActive && PRIMAL_KNOWLEDGE_SKILLS.includes(key) && (
          <button
            onClick={() => rollSkillStr(key)}
            title="Tirar con FUE (Primal Knowledge)"
            className="ink-stamp shrink-0"
          >
            FUE
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-0">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3">
          {meta.portraitDataUrl ? (
            <img
              src={meta.portraitDataUrl}
              alt={meta.name}
              className="w-14 h-14 rounded-xl object-cover border border-accent/60 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl stone-card flex items-center justify-center text-muted shrink-0">
              <User size={24} strokeWidth={1.5} />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-heading italic text-sm text-muted">Diario de campaña de</p>
            <h1 className="font-heading text-[2.125rem] leading-[1.02] text-foreground [text-wrap:balance]">
              {nameParts.before}
              {nameParts.highlight && <span className="text-cord">{nameParts.highlight}</span>}
              {nameParts.after}
            </h1>
          </div>
        </div>
        <div className="rule-line mt-3 mb-2" />
        <p className="text-sm text-muted">
          {meta.class} {meta.subclass ? `· ${meta.subclass}` : ""} · Nivel{" "}
          <span className="font-numeric">{meta.level}</span>
        </p>
        <p className="text-sm text-muted mt-0.5">
          {meta.species} · {meta.giantAncestry} · {meta.background} · {meta.origin}
        </p>
      </header>

      {/* Atributos */}
      <CollapsibleSection
        title="Atributos"
        defaultOpen
        aside={
          <span className="font-heading italic text-sm text-muted">
            competencia{" "}
            <span className="font-numeric not-italic">{formatModifier(meta.proficiencyBonus)}</span>
          </span>
        }
      >
        <div className="grid grid-cols-3 gap-2">
          {ABILITIES.map((ab) => (
            <button
              key={ab}
              onClick={() => rollAbility(ab)}
              className="stone-card rounded-xl px-1 pt-2 pb-2.5 text-center active:scale-[0.97] transition-transform duration-150 cursor-pointer"
            >
              <div className="italic text-xs text-muted truncate">{abilityName(ab)}</div>
              <div className="font-numeric font-black text-[1.8rem] leading-tight text-foreground">
                {formatModifier(abilityModifier(attributes[ab]) + exhaustionPenalty(combat.exhaustionLevel))}
              </div>
              <div className="font-numeric text-xs text-accent">{attributes[ab]}</div>
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
      <CollapsibleSection title="Tiradas de salvación" count={ABILITIES.length}>
        <div className="space-y-1">
          {ABILITIES.map((ab) => (
            <button
              key={ab}
              onClick={() => rollSave(ab)}
              className="w-full flex items-center justify-between py-1.5 px-1 text-sm rounded hover:bg-card/50 active:scale-[0.99] transition-transform cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`prof-mark ${savingThrows[ab]?.proficient ? "is-on" : ""}`}
                  aria-hidden="true"
                />
                <span>{abilityName(ab)}</span>
                {ab === "dex" && hasDangerSense && (
                  <Zap
                    size={12}
                    strokeWidth={1.5}
                    className="text-accent"
                    aria-label="Ventaja automática (Danger Sense)"
                  />
                )}
              </div>
              <span className="font-numeric font-semibold text-accent">
                {formatModifier(saveTotal(character, ab) + exhaustionPenalty(combat.exhaustionLevel))}
                {magicItemIndicator === "explicit-tag" && magicSaveBonus !== 0 && (
                  <span className="ml-1">✦{formatModifier(magicSaveBonus)}</span>
                )}
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
      <CollapsibleSection
        title="Habilidades"
        count={Object.keys(skills).length}
        aside={
          <GhostChip onClick={() => setGroupByAbility((g) => !g)}>
            {groupByAbility ? "A–Z" : "Grupo"}
          </GhostChip>
        }
      >
          <div className="flex gap-2 flex-wrap mb-3">
            {[
              { label: "Percepción Pasiva", value: passivePerception },
              { label: "Perspicacia Pasiva", value: passiveInsight },
              { label: "Investigación Pasiva", value: passiveInvestigation },
            ].map(({ label, value }) => (
              <div key={label} className="stone-card rounded-lg px-2 py-1 flex items-center gap-1.5">
                <span className="text-muted text-xs italic">{label}</span>
                <span className="font-numeric font-semibold text-accent text-sm">{value}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {groupByAbility
              ? ABILITY_ORDER.map((ab) => {
                  const group = Object.entries(skills).filter(([, s]) => s.attribute === ab);
                  if (group.length === 0) return null;
                  return (
                    <div key={ab} className="mb-2">
                      <div className="font-heading italic text-sm text-muted px-1 mb-1">
                        {abilityName(ab)}
                      </div>
                      {group
                        .sort(([a], [b]) => skillLabel(a).localeCompare(skillLabel(b)))
                        .map(([key, skill]) => renderSkillRow(key, skill, false))}
                    </div>
                  );
                })
              : Object.entries(skills)
                  .sort(([a], [b]) => skillLabel(a).localeCompare(skillLabel(b)))
                  .map(([key, skill]) => renderSkillRow(key, skill, true))
            }
          </div>
          {activeRoll?.key.startsWith("skill-") && (
            <div className="mt-2">
              <DiceResult
                roll={activeRoll.roll}
                label={
                  activeRoll.key.startsWith("skill-str-")
                    ? `${skillLabel(activeRoll.key.replace("skill-str-", ""))} (FUE)`
                    : skillLabel(activeRoll.key.replace("skill-", ""))
                }
                onClear={clearRoll}
              />
            </div>
          )}
      </CollapsibleSection>

      {/* Competencias */}
      <CollapsibleSection title="Competencias">
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="font-heading italic text-sm text-muted mb-0.5">Armaduras</h4>
            <p>{proficiencies.armor.join(", ")}</p>
          </div>
          <div>
            <h4 className="font-heading italic text-sm text-muted mb-0.5">Armas</h4>
            <p>{proficiencies.weapons.join(", ")}</p>
          </div>
          <div>
            <h4 className="font-heading italic text-sm text-muted mb-0.5">Herramientas</h4>
            <p>{proficiencies.tools.join(", ")}</p>
          </div>
          <div>
            <h4 className="font-heading italic text-sm text-muted mb-0.5">Idiomas</h4>
            <p>{proficiencies.languages.join(", ")}</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Rasgos y características */}
      <CollapsibleSection
        title="Rasgos y características"
        count={features.filter((f) => f.source !== "Dote" && f.level <= meta.level).length}
      >
        <div className="space-y-3">
          {features
            .filter(f => f.source !== "Dote" && f.level <= meta.level)
            .map((f, i) => (
            <div key={i} className="stone-card rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-heading text-foreground text-lg leading-tight">
                  {f.name}
                </span>
                <span className="ink-stamp">
                  {f.source}
                </span>
              </div>
              {f.name === "Weapon Mastery" ? (
                <p className="text-sm text-foreground/70 leading-relaxed">
                  {describeWeaponMastery(attacks)}
                </p>
              ) : (
                <Markdown className="text-sm text-foreground/70">
                  {f.description}
                </Markdown>
              )}
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Dotes */}
      <CollapsibleSection
        title="Dotes"
        count={features.filter((f) => f.source === "Dote" && f.level <= meta.level).length}
      >
        <div className="space-y-3">
          {features
            .filter(f => f.source === "Dote" && f.level <= meta.level)
            .map((f, i) => (
              <div key={i} className="stone-card rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-heading text-foreground text-lg leading-tight">
                    {f.name}
                  </span>
                </div>
                <Markdown className="text-sm text-foreground/70">
                  {f.description}
                </Markdown>
              </div>
            ))}
          {features.filter(f => f.source === "Dote" && f.level <= meta.level).length === 0 && (
            <p className="text-muted text-sm italic text-center py-4">Sin dotes todavía.</p>
          )}
          <CompactRow
            conditional
            name="Ver todas las dotes disponibles"
            onClick={() => setFeatsBrowserOpen(true)}
            right={<span className="text-muted text-xs">›</span>}
          />
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
            <h4 className="font-heading italic text-sm text-muted mb-0.5">Rasgo</h4>
            <p>{meta.personalityTrait}</p>
          </div>
          <div>
            <h4 className="font-heading italic text-sm text-muted mb-0.5">Ideal</h4>
            <p>{meta.ideal}</p>
          </div>
          <div>
            <h4 className="font-heading italic text-sm text-muted mb-0.5">Vínculo</h4>
            <p>{meta.bond}</p>
          </div>
          <div>
            <h4 className="font-heading italic text-sm text-muted mb-0.5">Defecto</h4>
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

      <FeatsBrowserModal
        open={featsBrowserOpen}
        onClose={() => setFeatsBrowserOpen(false)}
        character={character}
      />
    </div>
  );
}
