import type { Attack, PinnedAction } from "./types";

export const MAX_PINNED_ACTIONS = 5;

export function pinnedActionKey(action: PinnedAction): string {
  switch (action.type) {
    case "rage":
    case "hitDice":
    case "hpAdjust":
      return action.type;
    case "resource":
      return `resource:${action.resource}`;
    case "attackRoll":
    case "attackDamage":
    case "attackDefinition":
      return `${action.type}:${action.attackId}`;
  }
}

export function pinnedActionLabel(
  action: PinnedAction,
  attacks: Attack[]
): string {
  switch (action.type) {
    case "rage":
      return "Rage";
    case "hitDice":
      return "Dado de golpe";
    case "hpAdjust":
      return "Ajustar PG";
    case "resource":
      return action.resource === "healerKit"
        ? "Kit de sanador"
        : "Resistencia pétrea";
    case "attackRoll":
      return `Tirar: ${attacks.find((a) => a.id === action.attackId)?.name ?? "?"}`;
    case "attackDamage":
      return `Daño: ${attacks.find((a) => a.id === action.attackId)?.name ?? "?"}`;
    case "attackDefinition":
      return `Ver: ${attacks.find((a) => a.id === action.attackId)?.name ?? "?"}`;
  }
}
