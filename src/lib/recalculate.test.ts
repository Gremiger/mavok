import { describe, it, expect } from "vitest";
import { recalculateDerived, computeArmorClass } from "./recalculate";
import type { Character, Attack, InventoryItem } from "./types";

function makeInventoryItem(
  overrides: Partial<InventoryItem> = {}
): InventoryItem {
  return {
    id: "inv-1",
    name: "Leather Armor",
    quantity: 1,
    weight: 10,
    value: null,
    category: "armor",
    equipped: true,
    description: "",
    magicBonus: null,
    magicBonusTargets: [],
    magicAttackBonus: null,
    magicDamageBonus: null,
    baseWeaponName: null,
    grantedAction: null,
    ...overrides,
  };
}

function makeAttack(overrides: Partial<Attack> = {}): Attack {
  return {
    id: "atk-1",
    name: "Greataxe",
    attackBonus: 0,
    damage: "1d12+0",
    damageType: "Slashing",
    range: "5 ft",
    properties: ["Heavy", "Two-Handed"],
    mastery: null,
    masteryEffect: null,
    masterySaveDC: null,
    versatileDamage: null,
    ...overrides,
  };
}

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    _version: 8,
    id: "test-1",
    meta: {
      name: "Test",
      level: 1,
      class: "Barbarian",
      subclass: null,
      species: "Goliath",
      giantAncestry: "Stone Giant",
      background: "",
      originFeat: "",
      origin: "",
      age: 20,
      proficiencyBonus: 2,
      inspiration: false,
      appearance: "",
      personalityTrait: "",
      ideal: "",
      bond: "",
      flaw: "",
      backstory: "",
      goals: [],
      portraitDataUrl: null,
    },
    attributes: { str: 16, dex: 14, con: 14, int: 8, wis: 12, cha: 10 },
    combat: {
      maxHp: 16,
      currentHp: 16,
      tempHp: 0,
      armorClass: 0,
      initiative: 0,
      speed: 35,
      passivePerception: 0,
      hitDice: { total: 1, remaining: 1, die: "d12" },
      deathSaves: { successes: 0, failures: 0 },
      conditions: [],
      recklessActive: false,
      exhaustionLevel: 0,
    },
    resources: {
      rpiRages: { total: 2, remaining: 2, active: false, slots: [true, true] },
      healerKit: { total: 1, remaining: 1 },
      stoneEndurance: { total: 2, remaining: 2 },
    },
    savingThrows: {
      str: { proficient: true },
      dex: { proficient: false },
      con: { proficient: true },
      int: { proficient: false },
      wis: { proficient: false },
      cha: { proficient: false },
    },
    skills: {
      perception: { attribute: "wis", proficient: true },
    },
    proficiencies: { armor: [], weapons: [], tools: [], languages: [] },
    features: [],
    attacks: [makeAttack()],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    notes: { world: [], npcs: [], quests: [], journal: [], quick: [] },
    levelUpHistory: [],
    quickActions: [],
    weaponMasteryUsedThisRest: false,
    ...overrides,
  };
}

describe("recalculateDerived", () => {
  it("computes AC as 10 + dexMod + conMod", () => {
    const result = recalculateDerived(makeCharacter());
    // dex 14 -> mod +2, con 14 -> mod +2
    expect(result.combat.armorClass).toBe(14);
  });

  it("computes passive perception as 10 + wisMod + proficiency bonus", () => {
    const result = recalculateDerived(makeCharacter());
    // wis 12 -> mod +1, proficient -> +2
    expect(result.combat.passivePerception).toBe(13);
  });

  it("computes melee STR attack bonus as strMod + proficiency bonus", () => {
    const character = makeCharacter({
      attacks: [makeAttack({ range: "5 ft", properties: ["Heavy"] })],
    });
    const result = recalculateDerived(character);
    // str 16 -> mod +3, pb +2
    expect(result.attacks[0].attackBonus).toBe(5);
  });

  it("uses the higher of STR/DEX for a Finesse weapon", () => {
    const character = makeCharacter({
      attacks: [makeAttack({ range: "5 ft", properties: ["Finesse"] })],
    });
    const result = recalculateDerived(character);
    // str +3 vs dex +2 -> str wins, +2 pb
    expect(result.attacks[0].attackBonus).toBe(5);
  });

  it("uses DEX for a ranged (non-thrown) weapon", () => {
    const character = makeCharacter({
      attacks: [makeAttack({ range: "80/320 ft", properties: [] })],
    });
    const result = recalculateDerived(character);
    // dex 14 -> mod +2, pb +2
    expect(result.attacks[0].attackBonus).toBe(4);
  });

  it("recomputes the damage string using atkMod alone, without proficiency bonus", () => {
    const character = makeCharacter({
      attacks: [makeAttack({ damage: "1d12+99", range: "5 ft", properties: [] })],
    });
    const result = recalculateDerived(character);
    // str 16 -> mod +3 (damage never adds proficiency bonus, unlike attackBonus)
    expect(result.attacks[0].damage).toBe("1d12+3");
  });

  it("computes masterySaveDC as 8 + atkMod + pb when a mastery is set", () => {
    const character = makeCharacter({
      attacks: [makeAttack({ range: "5 ft", properties: [], mastery: "Topple" })],
    });
    const result = recalculateDerived(character);
    // str 16 -> atkMod +3, pb +2 -> 8 + 3 + 2
    expect(result.attacks[0].masterySaveDC).toBe(13);
  });

  it("leaves masterySaveDC null when no mastery is set", () => {
    const result = recalculateDerived(makeCharacter());
    expect(result.attacks[0].masterySaveDC).toBeNull();
  });

  it("does not mutate the input character", () => {
    const character = makeCharacter();
    const originalAc = character.combat.armorClass;
    const originalBonus = character.attacks[0].attackBonus;
    recalculateDerived(character);
    expect(character.combat.armorClass).toBe(originalAc);
    expect(character.attacks[0].attackBonus).toBe(originalBonus);
  });
});

describe("computeArmorClass", () => {
  it("falls back to Unarmored Defense when no armor is equipped", () => {
    const character = makeCharacter({ inventory: [] });
    // dex 14 -> mod +2, con 14 -> mod +2
    expect(computeArmorClass(character)).toBe(14);
  });

  it("ignores an unequipped armor item and falls back to Unarmored Defense", () => {
    const character = makeCharacter({
      inventory: [makeInventoryItem({ equipped: false })],
    });
    expect(computeArmorClass(character)).toBe(14);
  });

  it("adds the uncapped dex modifier for light armor", () => {
    const character = makeCharacter({
      attributes: { str: 16, dex: 18, con: 14, int: 8, wis: 12, cha: 10 },
      inventory: [makeInventoryItem({ name: "Leather Armor" })],
    });
    // Leather Armor AC 11 + dex mod +4 (uncapped)
    expect(computeArmorClass(character)).toBe(15);
  });

  it("caps the dex modifier at +2 for medium armor", () => {
    const character = makeCharacter({
      attributes: { str: 16, dex: 18, con: 14, int: 8, wis: 12, cha: 10 },
      inventory: [makeInventoryItem({ name: "Breastplate" })],
    });
    // Breastplate AC 14 + dex mod capped at +2 (actual dex mod is +4)
    expect(computeArmorClass(character)).toBe(16);
  });

  it("ignores the dex modifier entirely for heavy armor", () => {
    const character = makeCharacter({
      attributes: { str: 16, dex: 18, con: 14, int: 8, wis: 12, cha: 10 },
      inventory: [makeInventoryItem({ name: "Chain Mail" })],
    });
    // Chain Mail AC 16 flat, no dex bonus
    expect(computeArmorClass(character)).toBe(16);
  });

  it("adds a shield's AC on top of Unarmored Defense", () => {
    const character = makeCharacter({
      inventory: [makeInventoryItem({ name: "Shield" })],
    });
    // Unarmored Defense 14 + Shield AC 2
    expect(computeArmorClass(character)).toBe(16);
  });

  it("adds a shield's AC on top of worn body armor", () => {
    const character = makeCharacter({
      inventory: [
        makeInventoryItem({ id: "inv-1", name: "Breastplate" }),
        makeInventoryItem({ id: "inv-2", name: "Shield" }),
      ],
    });
    // Breastplate 14 + dex mod capped at +2 (dex 14 -> +2) + Shield AC 2
    expect(computeArmorClass(character)).toBe(18);
  });

  it("adds a magic AC bonus from an equipped armor-category item", () => {
    const character = makeCharacter({
      inventory: [
        makeInventoryItem({
          name: "Leather Armor",
          magicBonus: 1,
          magicBonusTargets: ["ac"],
        }),
      ],
    });
    // Leather Armor AC 11 + dex mod +2 (uncapped) + magic bonus +1
    expect(computeArmorClass(character)).toBe(14);
  });

  it("adds a magic AC bonus from a non-armor-category item", () => {
    const character = makeCharacter({
      inventory: [
        makeInventoryItem({
          category: "personal",
          name: "Ring of Protection",
          magicBonus: 1,
          magicBonusTargets: ["ac"],
        }),
      ],
    });
    // Unarmored Defense 14 + magic bonus +1 (Ring never touches the armor catalog)
    expect(computeArmorClass(character)).toBe(15);
  });

  it("subtracts a negative magic AC bonus", () => {
    const character = makeCharacter({
      inventory: [
        makeInventoryItem({
          category: "personal",
          name: "Cursed Amulet",
          magicBonus: -1,
          magicBonusTargets: ["ac"],
        }),
      ],
    });
    // Unarmored Defense 14 - 1
    expect(computeArmorClass(character)).toBe(13);
  });

  it("stacks magic AC bonuses from worn armor, a shield, and a ring", () => {
    const character = makeCharacter({
      inventory: [
        makeInventoryItem({
          id: "inv-1",
          name: "Breastplate",
          magicBonus: 1,
          magicBonusTargets: ["ac"],
        }),
        makeInventoryItem({ id: "inv-2", name: "Shield" }),
        makeInventoryItem({
          id: "inv-3",
          category: "personal",
          name: "Ring of Protection",
          magicBonus: 1,
          magicBonusTargets: ["ac"],
        }),
      ],
    });
    // Breastplate 14 + dex mod capped at +2 + magic +1, Shield +2, Ring +1
    expect(computeArmorClass(character)).toBe(20);
  });
});

describe("recalculateDerived — weapon-linked magic bonus", () => {
  it("adds a weapon-linked bonus to attackBonus and damage for a matching equipped item", () => {
    const character = makeCharacter({
      attacks: [makeAttack({ range: "5 ft", properties: ["Heavy"] })],
      inventory: [
        makeInventoryItem({
          category: "weapon",
          name: "Greataxe",
          equipped: true,
          magicAttackBonus: 1,
          magicDamageBonus: 1,
        }),
      ],
    });
    const result = recalculateDerived(character);
    // str 16 -> mod +3, pb +2, magic +1
    expect(result.attacks[0].attackBonus).toBe(6);
    expect(result.attacks[0].damage).toBe("1d12+4");
  });

  it("matches a variant attack name via the established naming convention", () => {
    const character = makeCharacter({
      attacks: [
        makeAttack({
          name: "Handaxe (melee)",
          range: "5 ft",
          properties: [],
        }),
      ],
      inventory: [
        makeInventoryItem({
          category: "weapon",
          name: "Handaxe",
          equipped: true,
          magicAttackBonus: 1,
        }),
      ],
    });
    const result = recalculateDerived(character);
    expect(result.attacks[0].attackBonus).toBe(6);
  });

  it("matches via baseWeaponName when the item's display name differs from the attack", () => {
    const character = makeCharacter({
      attacks: [makeAttack({ name: "Maul", range: "5 ft", properties: ["Heavy"] })],
      inventory: [
        makeInventoryItem({
          category: "weapon",
          name: "Fangbreaker",
          baseWeaponName: "Maul",
          equipped: true,
          magicAttackBonus: 1,
          magicDamageBonus: 1,
        }),
      ],
    });
    const result = recalculateDerived(character);
    expect(result.attacks[0].attackBonus).toBe(6);
    expect(result.attacks[0].damage).toBe("1d12+4");
  });

  it("does NOT match when the display name diverges without a baseWeaponName link", () => {
    const character = makeCharacter({
      attacks: [makeAttack({ name: "Maul", range: "5 ft", properties: ["Heavy"] })],
      inventory: [
        makeInventoryItem({
          category: "weapon",
          name: "+1 Maul",
          equipped: true,
          magicAttackBonus: 1,
        }),
      ],
    });
    const result = recalculateDerived(character);
    expect(result.attacks[0].attackBonus).toBe(5);
  });

  it("applies attack and damage bonuses independently (e.g. a damage-only bonus)", () => {
    const character = makeCharacter({
      attacks: [makeAttack({ range: "5 ft", properties: ["Heavy"] })],
      inventory: [
        makeInventoryItem({
          category: "weapon",
          name: "Greataxe",
          equipped: true,
          magicDamageBonus: 2,
        }),
      ],
    });
    const result = recalculateDerived(character);
    expect(result.attacks[0].attackBonus).toBe(5); // unaffected
    expect(result.attacks[0].damage).toBe("1d12+5"); // atkMod 3 + damage bonus 2
  });

  it("ignores an unequipped weapon's magic bonus", () => {
    const character = makeCharacter({
      attacks: [makeAttack({ range: "5 ft", properties: ["Heavy"] })],
      inventory: [
        makeInventoryItem({
          category: "weapon",
          name: "Greataxe",
          equipped: false,
          magicAttackBonus: 1,
        }),
      ],
    });
    const result = recalculateDerived(character);
    expect(result.attacks[0].attackBonus).toBe(5);
  });
});

describe("recalculateDerived — universal (non-weapon) attack/damage bonus", () => {
  it("applies a non-weapon item's attack bonus to every attack, regardless of name", () => {
    const character = makeCharacter({
      attacks: [
        makeAttack({ name: "Maul", range: "5 ft", properties: ["Heavy"] }),
        makeAttack({ id: "atk-2", name: "Javelin", range: "30/120 ft", properties: ["Thrown"] }),
      ],
      inventory: [
        makeInventoryItem({
          category: "personal",
          name: "Ring of Precision",
          equipped: true,
          magicAttackBonus: 1,
        }),
      ],
    });
    const result = recalculateDerived(character);
    expect(result.attacks[0].attackBonus).toBe(6);
    expect(result.attacks[1].attackBonus).toBe(6);
  });

  it("ignores an unequipped non-weapon item's universal bonus", () => {
    const character = makeCharacter({
      attacks: [makeAttack({ range: "5 ft", properties: ["Heavy"] })],
      inventory: [
        makeInventoryItem({
          category: "personal",
          name: "Ring of Precision",
          equipped: false,
          magicAttackBonus: 1,
        }),
      ],
    });
    const result = recalculateDerived(character);
    expect(result.attacks[0].attackBonus).toBe(5);
  });
});
