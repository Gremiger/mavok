import type { Attack, Character } from "./types";
import { abilityModifier } from "./utils";
import { ARMOR } from "../data/armor";

export function sumMagicBonus(
  character: Character,
  target: "weapon" | "ac" | "save"
): number {
  return character.inventory
    .filter((i) => i.equipped && i.magicBonusTargets.includes(target))
    .reduce((sum, i) => sum + (i.magicBonus ?? 0), 0);
}

export function findMagicWeaponBonus(
  character: Character,
  attack: Attack
): number {
  const matchingWeapon = character.inventory.find(
    (i) =>
      i.equipped &&
      i.magicBonusTargets.includes("weapon") &&
      (i.name === attack.name || attack.name.startsWith(`${i.name} (`))
  );
  return matchingWeapon?.magicBonus ?? 0;
}

export function computeArmorClass(character: Character): number {
  const dexMod = abilityModifier(character.attributes.dex);
  const conMod = abilityModifier(character.attributes.con);

  const equippedArmorNames = character.inventory
    .filter((i) => i.category === "armor" && i.equipped)
    .map((i) => i.name);

  const wornArmor = ARMOR.find(
    (a) => equippedArmorNames.includes(a.name) && a.type !== "shield"
  );
  const shield = ARMOR.find(
    (a) => equippedArmorNames.includes(a.name) && a.type === "shield"
  );

  const dexCap =
    wornArmor?.type === "heavy" ? 0 : wornArmor?.type === "medium" ? 2 : null;
  const base = wornArmor
    ? wornArmor.ac + (dexCap !== null ? Math.min(dexMod, dexCap) : dexMod)
    : 10 + dexMod + conMod; // Unarmored Defense fallback

  return base + (shield?.ac ?? 0) + sumMagicBonus(character, "ac");
}

export function recalculateDerived(character: Character): Character {
  const c = structuredClone(character);
  const strMod = abilityModifier(c.attributes.str);
  const dexMod = abilityModifier(c.attributes.dex);
  const wisMod = abilityModifier(c.attributes.wis);
  const pb = c.meta.proficiencyBonus;

  c.combat.armorClass = computeArmorClass(c);
  c.combat.initiative = dexMod;

  const percProf = c.skills.perception?.proficient ? pb : 0;
  c.combat.passivePerception = 10 + wisMod + percProf;

  c.attacks = c.attacks.map((a) => {
    const isMelee = !a.range.includes("/") || a.range === "5 ft";
    const isThrown = a.properties.includes("Thrown");
    const isFinesse = a.properties.includes("Finesse");

    const atkMod = isFinesse
      ? Math.max(strMod, dexMod)
      : isMelee || isThrown
        ? strMod
        : dexMod;

    const magicBonus = findMagicWeaponBonus(c, a);
    const newBonus = atkMod + pb + magicBonus;
    const baseDice = a.damage.replace(/[+-]\d+$/, "");
    const newDamage = `${baseDice}+${atkMod + magicBonus}`;

    return {
      ...a,
      attackBonus: newBonus,
      damage: newDamage,
      masterySaveDC: a.mastery ? 8 + atkMod + pb : null,
    };
  });

  return c;
}
