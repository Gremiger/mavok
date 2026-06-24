import type { Character } from "./types";
import { abilityModifier } from "./utils";

export function recalculateDerived(character: Character): Character {
  const c = structuredClone(character);
  const strMod = abilityModifier(c.attributes.str);
  const dexMod = abilityModifier(c.attributes.dex);
  const conMod = abilityModifier(c.attributes.con);
  const wisMod = abilityModifier(c.attributes.wis);
  const pb = c.meta.proficiencyBonus;

  c.combat.armorClass = 10 + dexMod + conMod;
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

    const newBonus = atkMod + pb;
    const baseDice = a.damage.replace(/[+-]\d+$/, "");
    const newDamage = `${baseDice}+${atkMod}`;

    return {
      ...a,
      attackBonus: newBonus,
      damage: newDamage,
      masterySaveDC: a.mastery ? 8 + atkMod + pb : null,
    };
  });

  return c;
}
