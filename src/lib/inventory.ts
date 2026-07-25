import { WEAPONS } from "@/data/weapons";
import { ARMOR } from "@/data/armor";
import { GEAR } from "@/data/gear";
import { MAGIC_ITEMS } from "@/data/magic-items";
import type { InventoryItem } from "./types";

export function resolveItemDescription(item: InventoryItem): string {
  if (item.description) return item.description;

  const weapon = WEAPONS.find((w) => w.name === item.name);
  if (weapon) {
    return `${weapon.damage} ${weapon.damageType} · ${weapon.properties.join(", ")}${weapon.mastery ? ` · Mastery: ${weapon.mastery}` : ""}`;
  }

  const armor = ARMOR.find((a) => a.name === item.name);
  if (armor) {
    return `AC ${armor.ac}${armor.stealthDisadvantage ? " · Desventaja en Sigilo" : ""}${armor.strengthRequirement ? ` · Requiere FUE ${armor.strengthRequirement}` : ""}`;
  }

  const gear = GEAR.find((g) => g.name === item.name);
  if (gear) return gear.description;

  const magicItem = MAGIC_ITEMS.find((m) => m.name === item.name);
  return magicItem?.description ?? "";
}
