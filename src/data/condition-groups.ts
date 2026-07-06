// Hand-maintained grouping of CONDITIONS (src/data/conditions.ts) for the
// Combat tab's condition picker UI. Not derived from 5etools — re-extraction
// of conditions.ts never touches this file.
export const CONDITION_GROUPS: { name: string; conditions: string[] }[] = [
  {
    name: "Incapacidad",
    conditions: ["Incapacitated", "Paralyzed", "Petrified", "Stunned", "Unconscious"],
  },
  {
    name: "Movimiento",
    conditions: ["Grappled", "Restrained", "Prone"],
  },
  {
    name: "Sentidos y mente",
    conditions: ["Blinded", "Charmed", "Deafened", "Frightened", "Invisible"],
  },
  {
    name: "Otros",
    conditions: ["Poisoned"],
  },
];
