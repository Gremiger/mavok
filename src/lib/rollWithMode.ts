import { parseExpression, composeRoll, rollDice, type DiceRoll } from "./dice";
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
