import { describe, it, expect } from "vitest";
import { saveTotal } from "./utils";
import type { Character, InventoryItem } from "./types";

function makeInventoryItem(
  overrides: Partial<InventoryItem> = {}
): InventoryItem {
  return {
    id: "inv-1",
    name: "Ring of Protection",
    quantity: 1,
    weight: null,
    value: null,
    category: "personal",
    equipped: true,
    description: "",
    magicBonus: null,
    magicBonusTargets: [],
    ...overrides,
  };
}

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    _version: 9,
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
    attacks: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    notes: { world: [], npcs: [], quests: [], journal: [], quick: [] },
    levelUpHistory: [],
    quickActions: [],
    weaponMasteryUsedThisRest: false,
    ...overrides,
  };
}

describe("saveTotal", () => {
  it("computes mod + proficiency bonus when proficient", () => {
    const character = makeCharacter();
    // str 16 -> mod +3, proficient -> +2
    expect(saveTotal(character, "str")).toBe(5);
  });

  it("computes mod alone when not proficient", () => {
    const character = makeCharacter();
    // dex 14 -> mod +2, not proficient
    expect(saveTotal(character, "dex")).toBe(2);
  });

  it("adds a flat magic save bonus from an equipped item", () => {
    const character = makeCharacter({
      inventory: [
        makeInventoryItem({ magicBonus: 1, magicBonusTargets: ["save"] }),
      ],
    });
    // str 16 -> mod +3, proficient +2, magic +1
    expect(saveTotal(character, "str")).toBe(6);
    // dex 14 -> mod +2, not proficient, magic +1
    expect(saveTotal(character, "dex")).toBe(3);
  });

  it("ignores an unequipped item's magic save bonus", () => {
    const character = makeCharacter({
      inventory: [
        makeInventoryItem({
          equipped: false,
          magicBonus: 1,
          magicBonusTargets: ["save"],
        }),
      ],
    });
    expect(saveTotal(character, "str")).toBe(5);
  });

  it("ignores a matching item whose targets don't include \"save\"", () => {
    const character = makeCharacter({
      inventory: [
        makeInventoryItem({ magicBonus: 1, magicBonusTargets: ["ac"] }),
      ],
    });
    expect(saveTotal(character, "str")).toBe(5);
  });
});
