import type { AbilityScore } from "./types";
import { abilityModifier } from "./utils";

const DC_MASTERIES = new Set(["Topple", "Push"]);

export function computeMasterySaveDC(
  masteryName: string,
  weaponProperties: string[],
  proficiencyBonus: number,
  attributes: Record<AbilityScore, number>
): number | null {
  if (!DC_MASTERIES.has(masteryName)) return null;
  const isFinesse = weaponProperties.includes("Finesse");
  const abilityMod = isFinesse
    ? Math.max(abilityModifier(attributes.str), abilityModifier(attributes.dex))
    : abilityModifier(attributes.str);
  return 8 + proficiencyBonus + abilityMod;
}
