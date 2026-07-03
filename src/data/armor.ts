export interface ArmorData {
  name: string;
  type: "light" | "medium" | "heavy" | "shield";
  ac: number;
  weight: number;
  stealthDisadvantage: boolean;
  strengthRequirement: number | null;
  value: number | null;
}

export const ARMOR: ArmorData[] = [
  {
    "name": "Breastplate",
    "type": "medium",
    "ac": 14,
    "weight": 20,
    "stealthDisadvantage": false,
    "strengthRequirement": null,
    "value": 400
  },
  {
    "name": "Chain Mail",
    "type": "heavy",
    "ac": 16,
    "weight": 55,
    "stealthDisadvantage": true,
    "strengthRequirement": 13,
    "value": 75
  },
  {
    "name": "Chain Shirt",
    "type": "medium",
    "ac": 13,
    "weight": 20,
    "stealthDisadvantage": false,
    "strengthRequirement": null,
    "value": 50
  },
  {
    "name": "Half Plate Armor",
    "type": "medium",
    "ac": 15,
    "weight": 40,
    "stealthDisadvantage": true,
    "strengthRequirement": null,
    "value": 750
  },
  {
    "name": "Hide Armor",
    "type": "medium",
    "ac": 12,
    "weight": 12,
    "stealthDisadvantage": false,
    "strengthRequirement": null,
    "value": 10
  },
  {
    "name": "Leather Armor",
    "type": "light",
    "ac": 11,
    "weight": 10,
    "stealthDisadvantage": false,
    "strengthRequirement": null,
    "value": 10
  },
  {
    "name": "Padded Armor",
    "type": "light",
    "ac": 11,
    "weight": 8,
    "stealthDisadvantage": true,
    "strengthRequirement": null,
    "value": 5
  },
  {
    "name": "Plate Armor",
    "type": "heavy",
    "ac": 18,
    "weight": 65,
    "stealthDisadvantage": true,
    "strengthRequirement": 15,
    "value": 1500
  },
  {
    "name": "Ring Mail",
    "type": "heavy",
    "ac": 14,
    "weight": 40,
    "stealthDisadvantage": true,
    "strengthRequirement": null,
    "value": 30
  },
  {
    "name": "Scale Mail",
    "type": "medium",
    "ac": 14,
    "weight": 45,
    "stealthDisadvantage": true,
    "strengthRequirement": null,
    "value": 50
  },
  {
    "name": "Shield",
    "type": "shield",
    "ac": 2,
    "weight": 6,
    "stealthDisadvantage": false,
    "strengthRequirement": null,
    "value": 10
  },
  {
    "name": "Splint Armor",
    "type": "heavy",
    "ac": 17,
    "weight": 60,
    "stealthDisadvantage": true,
    "strengthRequirement": 15,
    "value": 200
  },
  {
    "name": "Studded Leather Armor",
    "type": "light",
    "ac": 12,
    "weight": 13,
    "stealthDisadvantage": false,
    "strengthRequirement": null,
    "value": 45
  }
];
