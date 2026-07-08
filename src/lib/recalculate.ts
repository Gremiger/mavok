import type { Attack, Character } from "./types";
import { abilityModifier, formatModifier } from "./utils";
import { ARMOR } from "../data/armor";

export function sumMagicBonus(
  character: Character,
  target: "ac" | "save"
): number {
  return character.inventory
    .filter((i) => i.equipped && i.magicBonusTargets.includes(target))
    .reduce((sum, i) => sum + (i.magicBonus ?? 0), 0);
}

/**
 * A non-weapon item's attack/damage bonus (e.g. a Ring granting "+1 to hit")
 * applies to every attack, since it isn't tied to a specific weapon. A
 * weapon-category item's bonus only applies to its own matching Attack,
 * linked via `baseWeaponName` (falling back to `name`) so a flavor name like
 * "Fangbreaker" can still resolve to the "Maul" it's based on.
 */
export function computeAttackMagicBonus(
  character: Character,
  attack: Attack,
  field: "attack" | "damage"
): number {
  const bonusKey = field === "attack" ? "magicAttackBonus" : "magicDamageBonus";
  return character.inventory.reduce((sum, i) => {
    if (!i.equipped || i[bonusKey] === null) return sum;
    if (i.category !== "weapon") return sum + i[bonusKey]!;
    const linkName = i.baseWeaponName ?? i.name;
    const matches =
      linkName === attack.name || attack.name.startsWith(`${linkName} (`);
    return matches ? sum + i[bonusKey]! : sum;
  }, 0);
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

    const attackMagicBonus = computeAttackMagicBonus(c, a, "attack");
    const damageMagicBonus = computeAttackMagicBonus(c, a, "damage");
    const newBonus = atkMod + pb + attackMagicBonus;
    const baseDice = a.damage.replace(/[+-]\d+$/, "");
    const newDamage = `${baseDice}${formatModifier(atkMod + damageMagicBonus)}`;

    return {
      ...a,
      attackBonus: newBonus,
      damage: newDamage,
      masterySaveDC: a.mastery ? 8 + atkMod + pb : null,
    };
  });

  return c;
}
