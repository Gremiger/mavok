import { describe, it, expect } from "vitest";
import { migrateCharacterData } from "./migrations";
import { CURRENT_DATA_VERSION } from "./types";

function makeV1Data(overrides: Record<string, unknown> = {}) {
  return {
    id: "test-1",
    meta: {
      name: "Test",
      level: 1,
      proficiencyBonus: 2,
    },
    resources: {
      rpiRages: { total: 2, remaining: 2 },
    },
    combat: {
      maxHp: 16,
      currentHp: 16,
    },
    features: [{ name: "Rage", source: "Barbarian", description: "old text", level: 1 }],
    inventory: [{ id: "inv-1", name: "Item", quantity: 1 }],
    ...overrides,
  };
}

describe("migrateCharacterData", () => {
  it("migrates a v1 character all the way to CURRENT_DATA_VERSION with every field backfilled", () => {
    const raw = JSON.stringify(makeV1Data());
    const { data, migrated } = migrateCharacterData(raw);
    expect(migrated).toBe(true);

    const result = JSON.parse(data);
    expect(result._version).toBe(CURRENT_DATA_VERSION);
    expect(result.resources.rpiRages.slots).toEqual([true, true]);
    expect(result.resources.stoneEndurance).toEqual({ total: 2, remaining: 2 });
    expect(result.meta.portraitDataUrl).toBeNull();
    expect(result.levelUpHistory).toEqual([]);
    expect(result.inventory[0].value).toBeNull();
    expect(result.combat.recklessActive).toBe(false);
    expect(result.quickActions).toEqual([{ type: "rage" }, { type: "hpAdjust" }]);
    expect(result.combat.exhaustionLevel).toBe(0);
    expect(result.weaponMasteryUsedThisRest).toBe(false);
    expect(result.inventory[0].magicBonus).toBeNull();
    expect(result.inventory[0].magicBonusTargets).toEqual([]);
  });

  it("returns unmigrated data when already at CURRENT_DATA_VERSION", () => {
    const raw = JSON.stringify({ _version: CURRENT_DATA_VERSION, foo: "bar" });
    const { data, migrated } = migrateCharacterData(raw);
    expect(migrated).toBe(false);
    expect(data).toBe(raw);
  });

  it("returns the original data unmigrated when JSON is malformed", () => {
    const raw = "not json";
    const { data, migrated } = migrateCharacterData(raw);
    expect(migrated).toBe(false);
    expect(data).toBe(raw);
  });

  it("only applies remaining steps when starting from an intermediate version", () => {
    const raw = JSON.stringify({
      _version: 5,
      meta: { proficiencyBonus: 2 },
      resources: {
        rpiRages: { total: 2, remaining: 2, slots: [true, true] },
        stoneEndurance: { total: 2, remaining: 2 },
      },
      combat: { maxHp: 16, currentHp: 16 },
      features: [],
      inventory: [],
      levelUpHistory: [],
    });
    const { data } = migrateCharacterData(raw);
    const result = JSON.parse(data);

    expect(result._version).toBe(CURRENT_DATA_VERSION);
    // v3's "add Stone's Endurance feature if missing" step does not re-run when
    // starting from v5 — proves the loop only applies steps after currentVersion.
    expect(result.features).toEqual([]);
    // v8's step still applies since it's after the v5 starting point.
    expect(result.combat.exhaustionLevel).toBe(0);
  });

  it("does not overwrite a field the user already set before the version that backfills it", () => {
    const raw = JSON.stringify({
      _version: 5,
      meta: { proficiencyBonus: 2 },
      resources: {
        rpiRages: { total: 2, remaining: 2, slots: [true, true] },
        stoneEndurance: { total: 2, remaining: 2 },
      },
      combat: { maxHp: 16, currentHp: 16, recklessActive: true },
      features: [],
      inventory: [],
      levelUpHistory: [],
    });
    const { data } = migrateCharacterData(raw);
    const result = JSON.parse(data);

    // v6 backfills recklessActive only when undefined — it was already true here.
    expect(result.combat.recklessActive).toBe(true);
  });
});
