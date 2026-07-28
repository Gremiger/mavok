import type { Attack, AppSettings } from "./types";
import type { DiceRoll } from "./dice";
import { rollD20Mode, rollD20WithAdvantageMode, rollDiceMode } from "./rollWithMode";
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

export async function rollAttackHit(
  attack: Attack,
  opts: { recklessActive: boolean; exhaustionLevel: number },
  mode: AppSettings["diceRollMode"]
): Promise<DiceRoll> {
  const bonus = attack.attackBonus + exhaustionPenalty(opts.exhaustionLevel);
  const { roll } =
    opts.recklessActive && isStrBasedAttack(attack)
      ? await rollD20WithAdvantageMode(bonus, mode)
      : await rollD20Mode(bonus, mode);
  return roll;
}

export async function rollAttackDamage(
  attack: Attack,
  opts: { rageActive: boolean; rageDamage: number },
  mode: AppSettings["diceRollMode"]
): Promise<DiceRoll> {
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
  const { roll } = await rollDiceMode(expr, mode);
  return roll;
}
