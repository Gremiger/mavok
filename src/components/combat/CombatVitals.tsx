"use client";

import { StatBadge } from "@/components/ui/StatBadge";
import { RageCluster, type RageClusterProps } from "@/components/combat/RageCluster";
import { DeathSaves } from "@/components/combat/DeathSaves";
import { DiceResult } from "@/components/ui/DiceResult";
import { formatModifier } from "@/lib/utils";
import { hpFraction } from "@/lib/hpBar";
import type { DiceRoll } from "@/lib/dice";

export interface CombatVitalsProps {
  isDying: boolean;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  displayAc: number;
  tempAcMod: number;
  magicAcBonus: number;
  showExplicitMagicTag: boolean;
  initiative: number;
  initiativeRoll: DiceRoll | null;
  inspiration: boolean;
  effectiveSpeed: number;
  speedReduction: number;
  rage: RageClusterProps;
  rageDamage: number;
  deathSaves: { successes: number; failures: number };
  onOpenHp: () => void;
  onOpenTempHp: () => void;
  onOpenAc: () => void;
  onRollInitiative: () => void;
  onClearInitiativeRoll: () => void;
  onToggleInspiration: () => void;
  onDeathSavesChange: (successes: number, failures: number) => void;
  onRegainConsciousness: () => void;
}

export function CombatVitals({
  isDying,
  currentHp,
  maxHp,
  tempHp,
  displayAc,
  tempAcMod,
  magicAcBonus,
  showExplicitMagicTag,
  initiative,
  initiativeRoll,
  inspiration,
  effectiveSpeed,
  speedReduction,
  rage,
  rageDamage,
  deathSaves,
  onOpenHp,
  onOpenTempHp,
  onOpenAc,
  onRollInitiative,
  onClearInitiativeRoll,
  onToggleInspiration,
  onDeathSavesChange,
  onRegainConsciousness,
}: CombatVitalsProps) {
  const acModified = tempAcMod !== 0;
  const showMagicMark = showExplicitMagicTag && magicAcBonus !== 0;

  return (
    <div
      className={`${rage.active ? "stone-card-raging" : "stone-card"} rounded-2xl p-4 transition-all`}
    >
      {isDying ? (
        <DeathSaves
          successes={deathSaves.successes}
          failures={deathSaves.failures}
          onChange={onDeathSavesChange}
          onRegainConsciousness={onRegainConsciousness}
        />
      ) : (
        <div className="relative">
          <div className="flex items-end justify-between gap-3">
            <button
              type="button"
              onClick={onOpenHp}
              aria-label={`Puntos de golpe ${currentHp} de ${maxHp}`}
              className="text-left active:scale-[0.98] transition-transform duration-150"
            >
              <span className="block font-heading italic text-sm text-muted">Puntos de golpe</span>
              <span
                className={`block font-numeric font-black text-[3.5rem] leading-[0.85] tracking-tight text-foreground ${
                  rage.active ? "hp-heartbeat" : ""
                }`}
              >
                {currentHp}
                <span className="text-2xl font-semibold text-muted"> / {maxHp}</span>
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenAc}
              aria-label={`Clase de armadura ${displayAc}`}
              className="relative shrink-0 active:scale-95 transition-transform duration-150"
            >
              <span className="shield-ac w-[58px] h-[66px] flex flex-col items-center justify-center pb-2">
                <span className="font-numeric font-black text-2xl leading-none">{displayAc}</span>
                <span className="font-heading italic text-xs leading-none mt-0.5">CA</span>
              </span>
              {acModified && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-accent text-background text-xs font-numeric font-semibold flex items-center justify-center">
                  {formatModifier(tempAcMod)}
                </span>
              )}
              {showMagicMark && (
                <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-card border border-accent text-accent text-xs flex items-center justify-center">
                  ✦
                </span>
              )}
            </button>
          </div>
          <div className="hp-bar mt-3" aria-hidden="true">
            <span style={{ width: `${hpFraction(currentHp, maxHp) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="relative mt-2.5">
        <RageCluster {...rage} />
      </div>

      {rage.active && (
        <div className="relative mt-2.5 pt-2 border-t border-cord/30 text-xs leading-relaxed text-foreground/85">
          <span className="text-accent font-semibold">
            <span className="font-numeric">{rageDamage}</span> daño
          </span> · Resistencia
          Bludgeoning/Piercing/Slashing · Ventaja FUE checks/saves
          <br />
          Extiende: ataca · fuerza salvación · Bonus Action · No concentración ni hechizos
        </div>
      )}

      <div className="relative flex items-center justify-around gap-1.5 mt-2.5 pt-2 border-t border-border/40">
        <StatBadge compact label="Temp" value={`+${tempHp}`} onClick={onOpenTempHp} highlight={tempHp > 0} />
        <StatBadge compact label="Init" value={formatModifier(initiative)} onClick={onRollInitiative} />
        <StatBadge compact label="Insp" value={inspiration ? "★" : "☆"} onClick={onToggleInspiration} highlight={inspiration} />
        <StatBadge
          compact
          label="Vel"
          value={speedReduction > 0 ? `${effectiveSpeed} (-${speedReduction})` : effectiveSpeed}
          highlight={speedReduction > 0}
        />
      </div>

      {initiativeRoll && (
        <div className="mt-2">
          <DiceResult
            roll={initiativeRoll}
            label="Iniciativa"
            onClear={onClearInitiativeRoll}
          />
        </div>
      )}
    </div>
  );
}
