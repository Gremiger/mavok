import type { Attack } from "./types";
import { rollD20, rollD20WithAdvantage, rollDice, type DiceRoll } from "./dice";
import { exhaustionPenalty } from "./exhaustion";

export function isStrBasedAttack(attack: Attack): boolean {
  return !attack.properties.includes("Finesse");
}

export function toggleVersatileDamage(attack: Attack): Attack {
  if (!attack.versatileDamage) return attack;
  const match = attack.damage.match(/^(.+?)([+-]\d+)?$/);
  const currentBase = match ? match[1].trim() : attack.damage;
  const mod = match?.[2] ?? "";
  return {
    ...attack,
    damage: `${attack.versatileDamage}${mod}`,
    versatileDamage: currentBase,
  };
}

export function computeRageBonus(
  attack: Attack,
  rageActive: boolean,
  rageDamage: number
): number {
  return rageActive && isStrBasedAttack(attack) ? rageDamage : 0;
}

export function rollAttackHit(
  attack: Attack,
  opts: { recklessActive: boolean; exhaustionLevel: number }
): DiceRoll {
  const bonus = attack.attackBonus + exhaustionPenalty(opts.exhaustionLevel);
  return opts.recklessActive && isStrBasedAttack(attack)
    ? rollD20WithAdvantage(bonus)
    : rollD20(bonus);
}

export function rollAttackDamage(
  attack: Attack,
  opts: { rageActive: boolean; rageDamage: number }
): DiceRoll {
  const rageBonus = computeRageBonus(attack, opts.rageActive, opts.rageDamage);
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
  return rollDice(expr);
}
