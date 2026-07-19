"use client";

import { StatBadge } from "@/components/ui/StatBadge";
import { RageCluster, type RageClusterProps } from "@/components/combat/RageCluster";
import { DeathSaves } from "@/components/combat/DeathSaves";
import { formatModifier } from "@/lib/utils";

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
  inspiration: boolean;
  effectiveSpeed: number;
  speedReduction: number;
  rage: RageClusterProps;
  deathSaves: { successes: number; failures: number };
  onOpenHp: () => void;
  onOpenTempHp: () => void;
  onOpenAc: () => void;
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
  inspiration,
  effectiveSpeed,
  speedReduction,
  rage,
  deathSaves,
  onOpenHp,
  onOpenTempHp,
  onOpenAc,
  onToggleInspiration,
  onDeathSavesChange,
  onRegainConsciousness,
}: CombatVitalsProps) {
  const acModified = tempAcMod !== 0;
  const showMagicMark = showExplicitMagicTag && magicAcBonus !== 0;

  return (
    <div
      className={`stone-card rounded-lg p-3 transition-all ${
        rage.active ? "!border-cord/50 shadow-[0_0_16px_rgba(166,61,47,0.3)]" : ""
      }`}
    >
      {isDying ? (
        <DeathSaves
          successes={deathSaves.successes}
          failures={deathSaves.failures}
          onChange={onDeathSavesChange}
          onRegainConsciousness={onRegainConsciousness}
        />
      ) : (
        <div className="flex items-center justify-between gap-2">
          <button onClick={onOpenHp} className="text-left active:scale-95 transition-transform">
            <span className="block font-heading text-2xl leading-none text-accent">
              {currentHp}/{maxHp}
            </span>
            <span className="block text-[0.625rem] text-muted uppercase tracking-wider mt-0.5">
              HP
            </span>
          </button>
          <button
            onClick={onOpenAc}
            className={`relative w-11 h-11 rounded-full border-2 flex flex-col items-center justify-center shrink-0 active:scale-95 transition-transform ${
              acModified ? "!border-accent" : "border-border"
            }`}
          >
            <span className="font-heading text-base leading-none">{displayAc}</span>
            <span className="text-[0.5rem] text-muted">CA</span>
            {acModified && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-background text-[0.55rem] font-bold flex items-center justify-center">
                {formatModifier(tempAcMod)}
              </span>
            )}
            {showMagicMark && (
              <span className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-card border border-accent text-accent text-[0.6rem] flex items-center justify-center">
                ✦
              </span>
            )}
          </button>
        </div>
      )}

      <div className="mt-2.5">
        <RageCluster {...rage} />
      </div>

      <div className="flex items-center justify-around gap-1.5 mt-2.5 pt-2 border-t border-border/40">
        <StatBadge compact label="Temp" value={`+${tempHp}`} onClick={onOpenTempHp} highlight={tempHp > 0} />
        <StatBadge compact label="Init" value={formatModifier(initiative)} />
        <StatBadge compact label="Insp" value={inspiration ? "★" : "☆"} onClick={onToggleInspiration} highlight={inspiration} />
        <StatBadge
          compact
          label="Vel"
          value={speedReduction > 0 ? `${effectiveSpeed} (-${speedReduction})` : effectiveSpeed}
          highlight={speedReduction > 0}
        />
      </div>
    </div>
  );
}
