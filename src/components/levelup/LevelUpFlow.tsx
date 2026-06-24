"use client";

import { useState } from "react";
import { useCharacterContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { rollDice } from "@/lib/dice";
import { abilityModifier, formatModifier, abilityLabel } from "@/lib/utils";
import { recalculateDerived } from "@/lib/recalculate";
import {
  BARBARIAN_LEVELS,
  BARBARIAN_FEATURES,
} from "@/data/barbarian-progression";
import { SUBCLASSES } from "@/data/subclasses";
import { FEATS, type FeatData } from "@/data/feats";
import type { AbilityScore, Character, Feature } from "@/lib/types";

const ABILITIES: AbilityScore[] = ["str", "dex", "con", "int", "wis", "cha"];
const ASI_LEVELS = [4, 8, 12, 16, 19];
const SUBCLASS_LEVEL = 3;

interface PendingChanges {
  hpIncrease: number;
  newFeatures: Feature[];
  subclass: string | null;
  abilityIncreases: Partial<Record<AbilityScore, number>>;
  feat: { name: string; description: string } | null;
  newProfBonus: number | null;
  newRages: number | null;
  newRageDamage: number | null;
  newWeaponMasteries: number | null;
  newSpeed: number | null;
}

type Step = "confirm" | "hp" | "subclass" | "asi" | "features" | "summary";

export function LevelUpFlow({
  open,
  onClose,
  dryRun = false,
}: {
  open: boolean;
  onClose: () => void;
  dryRun?: boolean;
}) {
  const { character, update } = useCharacterContext();
  const [step, setStep] = useState<Step>("confirm");
  const [changes, setChanges] = useState<PendingChanges>(emptyChanges());
  const [hpRoll, setHpRoll] = useState<number | null>(null);
  const [featSearch, setFeatSearch] = useState("");

  if (!character) return null;

  const newLevel = character.meta.level + 1;
  const levelData = BARBARIAN_LEVELS[newLevel - 1];
  const currentLevelData = BARBARIAN_LEVELS[character.meta.level - 1];
  const conMod = abilityModifier(character.attributes.con);
  const toughBonus = 2;

  const needsSubclass = newLevel === SUBCLASS_LEVEL && !character.meta.subclass;
  const needsASI = ASI_LEVELS.includes(newLevel);

  const newFeatures = BARBARIAN_FEATURES.filter(
    (f) => f.level === newLevel && !f.isSubclassSlot
  );
  const subclassFeatures = character.meta.subclass
    ? SUBCLASSES.find((s) => s.name === character.meta.subclass)
        ?.features.filter((f) => f.level === newLevel) || []
    : [];

  function buildSteps(): Step[] {
    const steps: Step[] = ["confirm", "hp"];
    if (needsSubclass) steps.push("subclass");
    if (needsASI) steps.push("asi");
    if (newFeatures.length > 0 || subclassFeatures.length > 0)
      steps.push("features");
    steps.push("summary");
    return steps;
  }

  const steps = buildSteps();

  function nextStep() {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) setStep(steps[idx + 1]);
  }

  function rollHp() {
    const result = rollDice("1d12+0");
    setHpRoll(result.rolls[0]);
  }

  function confirmHp(rolled: boolean) {
    const dieValue = rolled && hpRoll ? hpRoll : 7;
    setChanges((prev) => ({
      ...prev,
      hpIncrease: dieValue + conMod + toughBonus,
    }));
    nextStep();
  }

  function selectSubclass(name: string) {
    const sub = SUBCLASSES.find((s) => s.name === name);
    if (!sub) return;
    const subFeatures = sub.features
      .filter((f) => f.level === SUBCLASS_LEVEL)
      .map((f) => ({
        name: f.name,
        source: sub.name,
        description: f.description,
        level: f.level,
      }));
    setChanges((prev) => ({
      ...prev,
      subclass: name,
      newFeatures: [...prev.newFeatures, ...subFeatures],
    }));
    nextStep();
  }

  function applyASI(ability1: AbilityScore, ability2: AbilityScore | null) {
    const increases: Partial<Record<AbilityScore, number>> = {};
    if (ability2 && ability1 !== ability2) {
      increases[ability1] = 1;
      increases[ability2] = 1;
    } else {
      increases[ability1] = 2;
    }
    setChanges((prev) => ({
      ...prev,
      abilityIncreases: increases,
      feat: null,
    }));
    nextStep();
  }

  function applyFeat(feat: FeatData | { name: string; description: string }) {
    const bonuses =
      "abilityBonuses" in feat && feat.abilityBonuses
        ? (feat.abilityBonuses as Record<string, number>)
        : {};
    const increases: Partial<Record<AbilityScore, number>> = {};
    for (const [k, v] of Object.entries(bonuses)) {
      if (ABILITIES.includes(k as AbilityScore)) {
        increases[k as AbilityScore] = v;
      }
    }
    setChanges((prev) => ({
      ...prev,
      feat: { name: feat.name, description: feat.description },
      abilityIncreases: increases,
    }));
    nextStep();
  }

  function applyAll() {
    update((c) => {
      let updated = structuredClone(c);
      updated.meta.level = newLevel;

      // HP
      updated.combat.maxHp += changes.hpIncrease;
      updated.combat.currentHp += changes.hpIncrease;
      updated.combat.hitDice.total = newLevel;
      updated.combat.hitDice.remaining += 1;

      // Proficiency bonus
      if (levelData.proficiencyBonus !== currentLevelData.proficiencyBonus) {
        updated.meta.proficiencyBonus = levelData.proficiencyBonus;
      }

      // Rages
      if (levelData.rages !== currentLevelData.rages) {
        updated.resources.rpiRages.total = levelData.rages;
        updated.resources.rpiRages.remaining = levelData.rages;
      }

      // Speed (Fast Movement at level 5)
      if (newLevel === 5) {
        updated.combat.speed += 10;
      }

      // Subclass
      if (changes.subclass) {
        updated.meta.subclass = changes.subclass;
      }

      // Ability increases
      for (const [ab, inc] of Object.entries(changes.abilityIncreases)) {
        const key = ab as AbilityScore;
        updated.attributes[key] = Math.min(
          20,
          updated.attributes[key] + (inc || 0)
        );
      }

      // Features
      const allNewFeatures = [
        ...newFeatures.map((f) => ({
          name: f.name,
          source: "Bárbaro",
          description: f.description,
          level: newLevel,
        })),
        ...subclassFeatures.map((f) => ({
          name: f.name,
          source: character!.meta.subclass || "Subclase",
          description: f.description,
          level: newLevel,
        })),
        ...changes.newFeatures,
      ];

      if (changes.feat) {
        allNewFeatures.push({
          name: changes.feat.name,
          source: "Dote",
          description: changes.feat.description,
          level: newLevel,
        });
      }

      // Deduplicate by name
      const existingNames = new Set(updated.features.map((f) => f.name));
      for (const f of allNewFeatures) {
        if (!existingNames.has(f.name)) {
          updated.features.push(f);
          existingNames.add(f.name);
        }
      }

      // Recalculate derived values
      updated = recalculateDerived(updated);

      return updated;
    });
    onClose();
    resetState();
  }

  function resetState() {
    setStep("confirm");
    setChanges(emptyChanges());
    setHpRoll(null);
    setFeatSearch("");
  }

  function getEligibleFeats(): FeatData[] {
    return FEATS.filter((f) => {
      if (f.category === "Fighting Style") return false;
      if (f.levelRequired && f.levelRequired > newLevel) return false;
      if (f.requiresSpellcasting) return false;
      if (f.abilityPrereqs) {
        const meetsAny = f.abilityPrereqs.some((prereq) =>
          Object.entries(prereq).every(
            ([ab, min]) =>
              (character!.attributes[ab as AbilityScore] || 0) >= min
          )
        );
        if (!meetsAny) return false;
      }
      return true;
    });
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        resetState();
      }}
      title={`${dryRun ? "🔍 Dry Run — " : ""}Subir a nivel ${newLevel}`}
    >
      {/* Confirm */}
      {step === "confirm" && (
        <div className="space-y-4 text-center">
          <p className="font-heading text-4xl text-accent">{newLevel}</p>
          <p className="text-sm">
            {character.meta.name} sube a nivel {newLevel}. ¿Continuar?
          </p>
          <button
            onClick={nextStep}
            className="w-full py-3 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
          >
            Continuar
          </button>
        </div>
      )}

      {/* HP */}
      {step === "hp" && (
        <div className="space-y-4">
          <p className="text-sm">
            Tirar 1d12 o tomar 7 (promedio). Se suma CON mod (
            {formatModifier(conMod)}) y Tough (+{toughBonus}).
          </p>

          <div className="flex gap-2">
            <button
              onClick={rollHp}
              className="flex-1 py-3 bg-card border border-border rounded-lg font-heading text-accent active:scale-95 transition-transform"
            >
              Tirar 1d12
            </button>
            <button
              onClick={() => confirmHp(false)}
              className="flex-1 py-3 bg-card border border-border rounded-lg font-heading text-accent active:scale-95 transition-transform"
            >
              Tomar 7
            </button>
          </div>

          {hpRoll !== null && (
            <div className="text-center space-y-2">
              <p className="text-sm">
                Tirada: <span className="font-heading text-accent text-xl">{hpRoll}</span>
                {" + "}{conMod} (CON) + {toughBonus} (Tough) ={" "}
                <span className="font-heading text-accent text-xl">
                  {hpRoll + conMod + toughBonus}
                </span>{" "}
                HP
              </p>
              <button
                onClick={() => confirmHp(true)}
                className="w-full py-3 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
              >
                Confirmar ({hpRoll + conMod + toughBonus} HP)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Subclass */}
      {step === "subclass" && (
        <div className="space-y-3">
          <p className="text-sm">Elige tu subclase de Bárbaro:</p>
          {SUBCLASSES.map((sc) => (
            <button
              key={sc.name}
              onClick={() => selectSubclass(sc.name)}
              className="w-full p-3 bg-card border border-border rounded-lg text-left active:scale-[0.99] transition-transform"
            >
              <span className="font-heading text-accent text-sm">
                {sc.name}
              </span>
              <span className="text-xs text-muted block mt-1">
                Nivel 3:{" "}
                {sc.features.find((f) => f.level === 3)?.name || ""}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ASI / Feat */}
      {step === "asi" && (
        <ASIStep
          character={character}
          eligibleFeats={getEligibleFeats()}
          featSearch={featSearch}
          onFeatSearchChange={setFeatSearch}
          onASI={applyASI}
          onFeat={applyFeat}
        />
      )}

      {/* Features */}
      {step === "features" && (
        <div className="space-y-3">
          <p className="text-sm">Nuevos rasgos en nivel {newLevel}:</p>
          {newFeatures.map((f) => (
            <div
              key={f.name}
              className="bg-card rounded-lg border border-border p-3"
            >
              <span className="font-heading text-accent text-sm">
                {f.name}
              </span>
              <p className="text-xs text-foreground/80 mt-1">
                {f.description.slice(0, 200)}
                {f.description.length > 200 ? "..." : ""}
              </p>
            </div>
          ))}
          {subclassFeatures.map((f) => (
            <div
              key={f.name}
              className="bg-card rounded-lg border border-border p-3"
            >
              <span className="font-heading text-accent text-sm">
                {f.name}
              </span>
              <span className="text-xs text-muted ml-2">
                ({character.meta.subclass})
              </span>
              <p className="text-xs text-foreground/80 mt-1">
                {f.description.slice(0, 200)}
                {f.description.length > 200 ? "..." : ""}
              </p>
            </div>
          ))}
          <button
            onClick={nextStep}
            className="w-full py-3 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
          >
            Continuar
          </button>
        </div>
      )}

      {/* Summary */}
      {step === "summary" && (
        <div className="space-y-3">
          <p className="text-sm font-heading text-accent">
            Resumen de cambios:
          </p>
          <ul className="text-sm space-y-1">
            <li>
              Nivel: {character.meta.level} → {newLevel}
            </li>
            <li>
              HP: +{changes.hpIncrease} (nuevo máximo:{" "}
              {character.combat.maxHp + changes.hpIncrease})
            </li>
            {levelData.proficiencyBonus !==
              currentLevelData.proficiencyBonus && (
              <li>
                Competencia: +{currentLevelData.proficiencyBonus} → +
                {levelData.proficiencyBonus}
              </li>
            )}
            {levelData.rages !== currentLevelData.rages && (
              <li>
                Rages: {currentLevelData.rages} → {levelData.rages}
              </li>
            )}
            {levelData.rageDamage !== currentLevelData.rageDamage && (
              <li>
                Rage damage: +{currentLevelData.rageDamage} → +
                {levelData.rageDamage}
              </li>
            )}
            {changes.subclass && <li>Subclase: {changes.subclass}</li>}
            {Object.entries(changes.abilityIncreases).map(([ab, inc]) => (
              <li key={ab}>
                {abilityLabel(ab as AbilityScore)}: +{inc} (→{" "}
                {character.attributes[ab as AbilityScore] + (inc || 0)})
              </li>
            ))}
            {changes.feat && <li>Dote: {changes.feat.name}</li>}
            {newFeatures.map((f) => (
              <li key={f.name}>Nuevo: {f.name}</li>
            ))}
            {subclassFeatures.map((f) => (
              <li key={f.name}>
                Nuevo: {f.name} ({character.meta.subclass})
              </li>
            ))}
            {newLevel === 5 && <li>Velocidad: +10 ft</li>}
          </ul>
          {dryRun ? (
            <div className="space-y-2">
              <div className="text-center text-xs text-muted bg-card border border-border rounded-lg py-2">
                🔍 Dry Run — no se aplicarán cambios
              </div>
              <button
                onClick={() => {
                  onClose();
                  resetState();
                }}
                className="w-full py-3 border border-accent text-accent rounded-lg font-heading active:scale-95 transition-transform"
              >
                Cerrar preview
              </button>
            </div>
          ) : (
            <button
              onClick={applyAll}
              className="w-full py-3 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
            >
              Confirmar nivel {newLevel}
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}

function ASIStep({
  character,
  eligibleFeats,
  featSearch,
  onFeatSearchChange,
  onASI,
  onFeat,
}: {
  character: Character;
  eligibleFeats: FeatData[];
  featSearch: string;
  onFeatSearchChange: (s: string) => void;
  onASI: (a1: AbilityScore, a2: AbilityScore | null) => void;
  onFeat: (feat: FeatData | { name: string; description: string }) => void;
}) {
  const [mode, setMode] = useState<"asi" | "feat">("asi");
  const [asi1, setAsi1] = useState<AbilityScore>("str");
  const [asi2, setAsi2] = useState<AbilityScore>("con");
  const [asiMode, setAsiMode] = useState<"+2" | "+1/+1">("+1/+1");
  const [homebrew, setHomebrew] = useState({ name: "", description: "" });

  const filtered = eligibleFeats.filter((f) =>
    f.name.toLowerCase().includes(featSearch.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("asi")}
          className={`flex-1 py-2 rounded-lg text-sm font-heading ${
            mode === "asi"
              ? "bg-accent text-white"
              : "bg-card border border-border text-muted"
          }`}
        >
          Atributos
        </button>
        <button
          onClick={() => setMode("feat")}
          className={`flex-1 py-2 rounded-lg text-sm font-heading ${
            mode === "feat"
              ? "bg-accent text-white"
              : "bg-card border border-border text-muted"
          }`}
        >
          Dote
        </button>
      </div>

      {mode === "asi" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setAsiMode("+2")}
              className={`flex-1 py-1 rounded text-xs ${asiMode === "+2" ? "bg-accent/20 text-accent" : "text-muted"}`}
            >
              +2 a uno
            </button>
            <button
              onClick={() => setAsiMode("+1/+1")}
              className={`flex-1 py-1 rounded text-xs ${asiMode === "+1/+1" ? "bg-accent/20 text-accent" : "text-muted"}`}
            >
              +1 a dos
            </button>
          </div>

          <div>
            <label className="text-xs text-muted">
              {asiMode === "+2" ? "Atributo (+2)" : "Atributo 1 (+1)"}
            </label>
            <select
              value={asi1}
              onChange={(e) => setAsi1(e.target.value as AbilityScore)}
              className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground mt-1"
            >
              {ABILITIES.map((ab) => (
                <option key={ab} value={ab} disabled={character.attributes[ab] >= 20}>
                  {abilityLabel(ab)} ({character.attributes[ab]})
                  {character.attributes[ab] >= 20 ? " (máx)" : ""}
                </option>
              ))}
            </select>
          </div>

          {asiMode === "+1/+1" && (
            <div>
              <label className="text-xs text-muted">Atributo 2 (+1)</label>
              <select
                value={asi2}
                onChange={(e) => setAsi2(e.target.value as AbilityScore)}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground mt-1"
              >
                {ABILITIES.filter((ab) => ab !== asi1).map((ab) => (
                  <option key={ab} value={ab} disabled={character.attributes[ab] >= 20}>
                    {abilityLabel(ab)} ({character.attributes[ab]})
                    {character.attributes[ab] >= 20 ? " (máx)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() =>
              onASI(asi1, asiMode === "+1/+1" ? asi2 : null)
            }
            className="w-full py-3 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
          >
            Confirmar
          </button>
        </div>
      )}

      {mode === "feat" && (
        <div className="space-y-3">
          <input
            value={featSearch}
            onChange={(e) => onFeatSearchChange(e.target.value)}
            placeholder="Buscar dote..."
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />

          <div className="max-h-60 overflow-y-auto space-y-1">
            {filtered.map((f) => (
              <button
                key={f.name}
                onClick={() => onFeat(f)}
                className="w-full p-2 bg-card border border-border rounded-lg text-left active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-2">
                  <span className="font-heading text-accent text-xs">
                    {f.name}
                  </span>
                  <span className="text-[0.6rem] text-muted">
                    {f.category}
                  </span>
                </div>
                <p className="text-[0.65rem] text-foreground/70 mt-0.5 line-clamp-2">
                  {f.description}
                </p>
              </button>
            ))}
          </div>

          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted mb-2">Dote personalizada:</p>
            <input
              value={homebrew.name}
              onChange={(e) =>
                setHomebrew({ ...homebrew, name: e.target.value })
              }
              placeholder="Nombre"
              className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground mb-2"
            />
            <textarea
              value={homebrew.description}
              onChange={(e) =>
                setHomebrew({ ...homebrew, description: e.target.value })
              }
              placeholder="Descripción"
              rows={2}
              className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none mb-2"
            />
            <button
              onClick={() => {
                if (homebrew.name.trim()) onFeat(homebrew);
              }}
              disabled={!homebrew.name.trim()}
              className="w-full py-2 bg-accent text-white rounded-lg font-heading text-sm disabled:opacity-50"
            >
              Usar dote personalizada
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function emptyChanges(): PendingChanges {
  return {
    hpIncrease: 0,
    newFeatures: [],
    subclass: null,
    abilityIncreases: {},
    feat: null,
    newProfBonus: null,
    newRages: null,
    newRageDamage: null,
    newWeaponMasteries: null,
    newSpeed: null,
  };
}
