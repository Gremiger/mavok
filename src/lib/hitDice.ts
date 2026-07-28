import { rollDiceAsync } from "./dice";
import type { CombatState } from "./types";

export interface HitDiceSpendResult {
  combat: Pick<CombatState, "currentHp" | "hitDice">;
  healing: number;
  rollTotal: number;
}

export async function spendHitDie(
  combat: CombatState,
  conMod: number
): Promise<HitDiceSpendResult | null> {
  if (combat.hitDice.remaining <= 0) return null;
  const roll = await rollDiceAsync(`1d12${conMod >= 0 ? "+" : ""}${conMod}`);
  const healing = Math.max(1, roll.total);
  const newHp = Math.min(combat.currentHp + healing, combat.maxHp);
  return {
    combat: {
      currentHp: newHp,
      hitDice: { ...combat.hitDice, remaining: combat.hitDice.remaining - 1 },
    },
    healing,
    rollTotal: roll.total,
  };
}
