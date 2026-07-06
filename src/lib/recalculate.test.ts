import { describe, it, expect } from "vitest";
import { recalculateDerived } from "./recalculate";
import type { Character, Attack } from "./types";

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
