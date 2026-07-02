import type { AbilityScore } from "./types";
import type { FeatData } from "@/data/feats";

export function meetsAbilityPrereqs(
  feat: FeatData,
  attributes: Record<AbilityScore, number>
): boolean {
  if (!feat.abilityPrereqs) return true;
  return feat.abilityPrereqs.some((prereq) =>
    Object.entries(prereq).every(
      ([ab, min]) => (attributes[ab as AbilityScore] || 0) >= min
    )
  );
}
