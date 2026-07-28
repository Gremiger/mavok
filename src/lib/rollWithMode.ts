import {
  parseExpression,
  composeRoll,
  rollDice,
  rollD20WithAdvantage,
  type DiceRoll,
} from "./dice";
import { roll3D, hide3D } from "./diceBox";
import type { AppSettings } from "./types";

export interface RollWithModeResult {
  roll: DiceRoll;
  usedFallback: boolean;
}

export async function rollDiceMode(
  expression: string,
  mode: AppSettings["diceRollMode"]
): Promise<RollWithModeResult> {
  if (mode === "3d") {
    try {
      const { count, faces, modifier } = parseExpression(expression);
      const faceValues = await roll3D(count, faces);
      const roll = composeRoll(expression, faceValues, modifier);
      setTimeout(() => hide3D(), 1500);
      return { roll, usedFallback: false };
    } catch {
      // Falls through to the text path below — 3D unavailable
      // (assets missing, WebGL unsupported, offline with nothing
      // cached) never blocks the ability to roll.
    }
  }
  return { roll: rollDice(expression), usedFallback: mode === "3d" };
}

export async function rollD20Mode(
  modifier: number,
  mode: AppSettings["diceRollMode"]
): Promise<RollWithModeResult> {
  return rollDiceMode(`1d20${modifier >= 0 ? "+" : ""}${modifier}`, mode);
}

export async function rollD20WithAdvantageMode(
  modifier: number,
  mode: AppSettings["diceRollMode"]
): Promise<RollWithModeResult> {
  if (mode === "3d") {
    try {
      const faceValues = await roll3D(2, 20);
      const roll: DiceRoll = {
        expression: `1d20adv${modifier >= 0 ? "+" : ""}${modifier}`,
        rolls: faceValues,
        modifier,
        total: Math.max(...faceValues) + modifier,
        timestamp: Date.now(),
      };
      setTimeout(() => hide3D(), 1500);
      return { roll, usedFallback: false };
    } catch {
      // Falls through to the text path below.
    }
  }
  return { roll: rollD20WithAdvantage(modifier), usedFallback: mode === "3d" };
}
