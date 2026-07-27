import { describe, it, expect } from "vitest";
import { resolveItemDescription } from "./inventory";
import type { InventoryItem } from "./types";

const BASE_ITEM: InventoryItem = {
  id: "test-1",
  name: "",
  quantity: 1,
  weight: null,
  value: null,
  category: "gear",
  equipped: false,
  description: "",
  magicBonus: null,
  magicBonusTargets: [],
  magicAttackBonus: null,
  magicDamageBonus: null,
  baseWeaponName: null,
  grantedAction: null,
  requiresAttunement: false,
  attuned: false,
};

describe("resolveItemDescription", () => {
  it("returns the item's own description when set", () => {
    const item = { ...BASE_ITEM, name: "Anything", description: "Mi nota." };
    expect(resolveItemDescription(item)).toBe("Mi nota.");
  });

  it("falls back to a WEAPONS summary when description is empty", () => {
    const item = { ...BASE_ITEM, name: "Handaxe", description: "" };
    expect(resolveItemDescription(item)).toBe(
      "1d6 S · Light, Thrown · Mastery: Vex"
    );
  });

  it("falls back to an ARMOR summary when description is empty", () => {
    const item = { ...BASE_ITEM, name: "Leather Armor", description: "" };
    expect(resolveItemDescription(item)).toBe("AC 11");
  });

  it("falls back to the GEAR catalog description when description is empty", () => {
    const item = { ...BASE_ITEM, name: "Rope", description: "" };
    expect(resolveItemDescription(item)).toContain(
      "As a Utilize action, you can tie a knot with Rope"
    );
  });

  it("falls back to a MAGIC_ITEMS description when description is empty", () => {
    const item = {
      ...BASE_ITEM,
      name: "Axe of the Dwarvish Lords",
      description: "",
    };
    expect(resolveItemDescription(item)).toContain(
      "grants a +3 bonus to attack rolls and damage rolls"
    );
  });

  it("returns an empty string when nothing matches", () => {
    const item = {
      ...BASE_ITEM,
      name: "Nonexistent Item XYZ",
      description: "",
    };
    expect(resolveItemDescription(item)).toBe("");
  });
});
