import { expect, test } from "vitest";
import { abilityName } from "./utils";

test("full Spanish ability names", () => {
  expect(["str", "dex", "con", "int", "wis", "cha"].map((k) => abilityName(k as never))).toEqual([
    "Fuerza", "Destreza", "Constitución", "Inteligencia", "Sabiduría", "Carisma",
  ]);
});
