import type { AbilityScore, Character } from "./types";

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function skillTotal(
  character: Character,
  skillKey: string
): number {
  const skill = character.skills[skillKey];
  if (!skill) return 0;
  const mod = abilityModifier(character.attributes[skill.attribute]);
  return mod + (skill.proficient ? character.meta.proficiencyBonus : 0);
}

export function saveTotal(
  character: Character,
  ability: AbilityScore
): number {
  const mod = abilityModifier(character.attributes[ability]);
  const prof = character.savingThrows[ability]?.proficient
    ? character.meta.proficiencyBonus
    : 0;
  const itemBonus = character.inventory
    .filter((i) => i.equipped && i.magicBonusTargets.includes("save"))
    .reduce((sum, i) => sum + (i.magicBonus ?? 0), 0);
  return mod + prof + itemBonus;
}

const SKILL_LABELS: Record<string, string> = {
  acrobatics: "Acrobatics",
  animalHandling: "Animal Handling",
  arcana: "Arcana",
  athletics: "Athletics",
  deception: "Deception",
  history: "History",
  insight: "Insight",
  intimidation: "Intimidation",
  investigation: "Investigation",
  medicine: "Medicine",
  nature: "Nature",
  perception: "Perception",
  performance: "Performance",
  persuasion: "Persuasion",
  religion: "Religion",
  sleightOfHand: "Sleight of Hand",
  stealth: "Stealth",
  survival: "Survival",
};

export function skillLabel(key: string): string {
  return SKILL_LABELS[key] || key;
}

const ABILITY_LABELS: Record<AbilityScore, string> = {
  str: "FUE",
  dex: "DES",
  con: "CON",
  int: "INT",
  wis: "SAB",
  cha: "CAR",
};

export function abilityLabel(key: AbilityScore): string {
  return ABILITY_LABELS[key] || key.toUpperCase();
}

const ABILITY_LABELS_SHORT: Record<AbilityScore, string> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};

export function abilityLabelShort(key: AbilityScore): string {
  return ABILITY_LABELS_SHORT[key] || key.toUpperCase();
}
