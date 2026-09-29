"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { StatBadge } from "@/components/ui/StatBadge";
import { useEffects } from "@/components/effects/EffectsProvider";
import { particleSpread } from "@/lib/motion";
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
  const { play, flashy } = useEffects();
  const cardRef = useRef<HTMLDivElement>(null);
  const inspRef = useRef<HTMLSpanElement>(null);
  const [prevHp, setPrevHp] = useState(currentHp);
  const [hpAnim, setHpAnim] = useState<{ kind: "damage" | "heal"; n: number } | null>(null);

  // Flashy HP flourishes follow HP changes while this card is on screen.
  if (currentHp !== prevHp) {
    setPrevHp(currentHp);
    setHpAnim(
      flashy
        ? { kind: currentHp < prevHp ? "damage" : "heal", n: (hpAnim?.n ?? 0) + 1 }
        : null
    );
  }

  // Card shake on damage (Web Animations API; no React state involved).
  useEffect(() => {
    if (hpAnim?.kind !== "damage") return;
    cardRef.current?.animate?.(
      [
        { transform: "translate(0,0)" },
        { transform: "translate(-6px,2px)" },
        { transform: "translate(5px,-2px)" },
        { transform: "translate(-3px,1px)" },
        { transform: "translate(0,0)" },
      ],
      { duration: 320, easing: "cubic-bezier(.36,.07,.19,.97)" }
    );
  }, [hpAnim]);

  function toggleInspiration() {
    if (!inspiration) {
      const r = inspRef.current?.getBoundingClientRect();
      play("inspiration", {
        origin: r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined,
      });
    }
    onToggleInspiration();
  }

  const acModified = tempAcMod !== 0;
  const showMagicMark = showExplicitMagicTag && magicAcBonus !== 0;

  return (
    <div
      ref={cardRef}
      data-vitals
      className={`${rage.active ? "stone-card-raging" : "stone-card"} relative rounded-2xl p-4 transition-all`}
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
                key={hpAnim ? `hp-${hpAnim.n}` : "hp"}
                className={`relative block ${hpAnim ? `hp-${hpAnim.kind}` : ""}`}
              >
                <span
                  className={`block font-numeric font-black text-[3.5rem] leading-[0.85] tracking-tight text-foreground ${
                    rage.active ? "hp-heartbeat" : ""
                  }`}
                >
                  {currentHp}
                  <span className="text-2xl font-semibold text-muted"> / {maxHp}</span>
                </span>
                {hpAnim?.kind === "heal" &&
                  particleSpread(`heal-${hpAnim.n}`, 14).map((p, i) => (
                    <i
                      key={i}
                      className="hp-heal-spark"
                      style={
                        {
                          left: `${p.a * 100}%`,
                          animationDelay: `${Math.round(p.b * 300)}ms`,
                          "--dx": `${p.c * 40 - 20}px`,
                        } as CSSProperties
                      }
                    />
                  ))}
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
          <div className={`hp-bar mt-3${flashy ? " has-ghost" : ""}`} aria-hidden="true">
            {flashy && (
              <span className="hp-ghost" style={{ width: `${hpFraction(currentHp, maxHp) * 100}%` }} />
            )}
            <span className="hp-fill" style={{ width: `${hpFraction(currentHp, maxHp) * 100}%` }} />
          </div>
        </div>
      )}

      {hpAnim?.kind === "damage" && (
        <svg key={`claw-${hpAnim.n}`} className="hp-claws" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M14 4 L52 44" />
          <path d="M26 2 L64 42" style={{ animationDelay: "70ms" }} />
          <path d="M38 0 L76 40" style={{ animationDelay: "140ms" }} />
        </svg>
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
        <span ref={inspRef} className="inline-flex">
          <StatBadge compact label="Insp" value={inspiration ? "★" : "☆"} onClick={toggleInspiration} highlight={inspiration} />
        </span>
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
