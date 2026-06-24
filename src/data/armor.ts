export interface ArmorData {
  name: string;
  type: "light" | "medium" | "heavy" | "shield";
  ac: number;
  weight: number;
  stealthDisadvantage: boolean;
  strengthRequirement: number | null;
}

export const ARMOR: ArmorData[] = [
  {
    "name": "Breastplate",
    "type": "medium",
    "ac": 14,
    "weight": 20,
    "stealthDisadvantage": false,
    "strengthRequirement": null
  },
  {
    "name": "Chain Mail",
    "type": "heavy",
    "ac": 16,
    "weight": 55,
    "stealthDisadvantage": true,
    "strengthRequirement": 13
  },
  {
    "name": "Chain Shirt",
    "type": "medium",
    "ac": 13,
    "weight": 20,
    "stealthDisadvantage": false,
    "strengthRequirement": null
  },
  {
    "name": "Half Plate Armor",
    "type": "medium",
    "ac": 15,
    "weight": 40,
    "stealthDisadvantage": true,
    "strengthRequirement": null
  },
  {
    "name": "Hide Armor",
    "type": "medium",
    "ac": 12,
    "weight": 12,
    "stealthDisadvantage": false,
    "strengthRequirement": null
  },
  {
    "name": "Leather Armor",
    "type": "light",
    "ac": 11,
    "weight": 10,
    "stealthDisadvantage": false,
    "strengthRequirement": null
  },
  {
    "name": "Padded Armor",
    "type": "light",
    "ac": 11,
    "weight": 8,
    "stealthDisadvantage": true,
    "strengthRequirement": null
  },
  {
    "name": "Plate Armor",
    "type": "heavy",
    "ac": 18,
    "weight": 65,
    "stealthDisadvantage": true,
    "strengthRequirement": 15
  },
  {
    "name": "Ring Mail",
    "type": "heavy",
    "ac": 14,
    "weight": 40,
    "stealthDisadvantage": true,
    "strengthRequirement": null
  },
  {
    "name": "Scale Mail",
    "type": "medium",
    "ac": 14,
    "weight": 45,
    "stealthDisadvantage": true,
    "strengthRequirement": null
  },
  {
    "name": "Shield",
    "type": "shield",
    "ac": 2,
    "weight": 6,
    "stealthDisadvantage": false,
    "strengthRequirement": null
  },
  {
    "name": "Splint Armor",
    "type": "heavy",
    "ac": 17,
    "weight": 60,
    "stealthDisadvantage": true,
    "strengthRequirement": 15
  },
  {
    "name": "Studded Leather Armor",
    "type": "light",
    "ac": 12,
    "weight": 13,
    "stealthDisadvantage": false,
    "strengthRequirement": null
  }
];
