"use client";

import { useState } from "react";
import type { Attack } from "@/lib/types";
import { rollD20, rollDice, type DiceRoll } from "@/lib/dice";

export function AttackRow({
  attack,
  rageActive,
  rageDamage,
}: {
  attack: Attack;
  rageActive: boolean;
  rageDamage: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);
  const [rollType, setRollType] = useState<"hit" | "damage" | null>(null);

  const isStrBased = !attack.properties.includes("Finesse");
  const rageBonus = rageActive && isStrBased && !attack.range.includes("/") ? rageDamage : 0;

  function displayDamage() {
    if (rageBonus > 0) {
      const match = attack.damage.match(/^(.+?)([+-]\d+)$/);
      if (match) {
        const base = parseInt(match[2]) + rageBonus;
        return `${match[1]}${base >= 0 ? "+" : ""}${base}`;
      }
      return `${attack.damage}+${rageBonus}`;
    }
    return attack.damage;
  }

  function handleRollHit() {
    const result = rollD20(attack.attackBonus);
    setLastRoll(result);
    setRollType("hit");
  }

  function handleRollDamage() {
    const dmgExpr = attack.damage.replace(/\s/g, "");
    let expr = dmgExpr;
    if (rageBonus > 0) {
      const match = expr.match(/^(.+?)([+-]\d+)$/);
      if (match) {
        const newMod = parseInt(match[2]) + rageBonus;
        expr = `${match[1]}${newMod >= 0 ? "+" : ""}${newMod}`;
      } else {
        expr = `${expr}+${rageBonus}`;
      }
    }
    const result = rollDice(expr);
    setLastRoll(result);
    setRollType("damage");
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden mb-2">
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-heading text-sm text-accent truncate">
              {attack.name}
            </span>
            {attack.mastery && (
              <span className="text-[0.6rem] px-1.5 py-0.5 bg-accent/20 text-accent rounded">
                {attack.mastery}
              </span>
            )}
          </div>
          <div className="text-xs text-muted mt-0.5">
            +{attack.attackBonus} · {displayDamage()} {attack.damageType.slice(0, 4).toLowerCase()}. · {attack.range}
          </div>
        </div>
        <div className="flex gap-1.5 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRollHit();
            }}
            className="px-2.5 py-1.5 bg-accent/20 text-accent rounded text-xs font-heading active:scale-95 transition-transform"
          >
            Hit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRollDamage();
            }}
            className="px-2.5 py-1.5 bg-danger/20 text-danger rounded text-xs font-heading active:scale-95 transition-transform"
          >
            Dmg
          </button>
        </div>
      </div>

      {lastRoll && (
        <div
          className={`px-3 py-2 text-sm border-t border-border ${
            rollType === "hit" ? "bg-accent/5" : "bg-danger/5"
          }`}
        >
          <span className="text-muted">{lastRoll.expression}: </span>
          <span className="text-foreground">
            [{lastRoll.rolls.join(", ")}]
            {lastRoll.modifier !== 0 &&
              ` ${lastRoll.modifier >= 0 ? "+" : ""}${lastRoll.modifier}`}
          </span>
          <span className="font-heading text-accent ml-2">
            = {lastRoll.total}
          </span>
          {rollType === "hit" && lastRoll.rolls[0] === 20 && (
            <span className="ml-2 text-success font-heading">¡CRÍTICO!</span>
          )}
          {rollType === "hit" && lastRoll.rolls[0] === 1 && (
            <span className="ml-2 text-danger font-heading">Pifia</span>
          )}
        </div>
      )}

      {expanded && (
        <div className="px-3 py-2 border-t border-border text-xs space-y-1">
          <div className="text-muted">
            Propiedades: {attack.properties.join(", ")}
          </div>
          {attack.mastery && attack.masteryEffect && (
            <div>
              <span className="text-accent font-heading">
                {attack.mastery}
                {attack.masterySaveDC && ` (DC ${attack.masterySaveDC})`}:
              </span>{" "}
              <span className="text-foreground/80">
                {attack.masteryEffect}
              </span>
            </div>
          )}
          {rageActive && rageBonus > 0 && (
            <div className="text-danger">
              Rage: +{rageDamage} daño incluido
            </div>
          )}
        </div>
      )}
    </div>
  );
}
