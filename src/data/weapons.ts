export interface WeaponData {
  name: string;
  type: "melee" | "ranged";
  category: string;
  damage: string;
  damageType: string;
  weight: number;
  properties: string[];
  mastery: string | null;
  range: string | null;
}

export const WEAPONS: WeaponData[] = [
  {
    "name": "Battleaxe",
    "type": "melee",
    "category": "martial",
    "damage": "1d8",
    "damageType": "S",
    "weight": 4,
    "properties": [
      "Versatile"
    ],
    "mastery": "Topple",
    "range": null
  },
  {
    "name": "Blowgun",
    "type": "ranged",
    "category": "martial",
    "damage": "1",
    "damageType": "P",
    "weight": 1,
    "properties": [
      "Ammunition",
      "Loading"
    ],
    "mastery": "Vex",
    "range": "25/100 ft"
  },
  {
    "name": "Club",
    "type": "melee",
    "category": "simple",
    "damage": "1d4",
    "damageType": "B",
    "weight": 2,
    "properties": [
      "Light"
    ],
    "mastery": "Slow",
    "range": null
  },
  {
    "name": "Dagger",
    "type": "melee",
    "category": "simple",
    "damage": "1d4",
    "damageType": "P",
    "weight": 1,
    "properties": [
      "Finesse",
      "Light",
      "Thrown"
    ],
    "mastery": "Nick",
    "range": "20/60 ft"
  },
  {
    "name": "Dart",
    "type": "ranged",
    "category": "simple",
    "damage": "1d4",
    "damageType": "P",
    "weight": 0.25,
    "properties": [
      "Finesse",
      "Thrown"
    ],
    "mastery": "Vex",
    "range": "20/60 ft"
  },
  {
    "name": "Flail",
    "type": "melee",
    "category": "martial",
    "damage": "1d8",
    "damageType": "B",
    "weight": 2,
    "properties": [],
    "mastery": "Sap",
    "range": null
  },
  {
    "name": "Glaive",
    "type": "melee",
    "category": "martial",
    "damage": "1d10",
    "damageType": "S",
    "weight": 6,
    "properties": [
      "Heavy",
      "Reach",
      "Two-Handed"
    ],
    "mastery": "Graze",
    "range": null
  },
  {
    "name": "Greataxe",
    "type": "melee",
    "category": "martial",
    "damage": "1d12",
    "damageType": "S",
    "weight": 7,
    "properties": [
      "Heavy",
      "Two-Handed"
    ],
    "mastery": "Cleave",
    "range": null
  },
  {
    "name": "Greatclub",
    "type": "melee",
    "category": "simple",
    "damage": "1d8",
    "damageType": "B",
    "weight": 10,
    "properties": [
      "Two-Handed"
    ],
    "mastery": "Push",
    "range": null
  },
  {
    "name": "Greatsword",
    "type": "melee",
    "category": "martial",
    "damage": "2d6",
    "damageType": "S",
    "weight": 6,
    "properties": [
      "Heavy",
      "Two-Handed"
    ],
    "mastery": "Graze",
    "range": null
  },
  {
    "name": "Halberd",
    "type": "melee",
    "category": "martial",
    "damage": "1d10",
    "damageType": "S",
    "weight": 6,
    "properties": [
      "Heavy",
      "Reach",
      "Two-Handed"
    ],
    "mastery": "Cleave",
    "range": null
  },
  {
    "name": "Hand Crossbow",
    "type": "ranged",
    "category": "martial",
    "damage": "1d6",
    "damageType": "P",
    "weight": 3,
    "properties": [
      "Ammunition",
      "Light",
      "Loading"
    ],
    "mastery": "Vex",
    "range": "30/120 ft"
  },
  {
    "name": "Handaxe",
    "type": "melee",
    "category": "simple",
    "damage": "1d6",
    "damageType": "S",
    "weight": 2,
    "properties": [
      "Light",
      "Thrown"
    ],
    "mastery": "Vex",
    "range": "20/60 ft"
  },
  {
    "name": "Heavy Crossbow",
    "type": "ranged",
    "category": "martial",
    "damage": "1d10",
    "damageType": "P",
    "weight": 18,
    "properties": [
      "Ammunition",
      "Heavy",
      "Loading",
      "Two-Handed"
    ],
    "mastery": "Push",
    "range": "100/400 ft"
  },
  {
    "name": "Javelin",
    "type": "melee",
    "category": "simple",
    "damage": "1d6",
    "damageType": "P",
    "weight": 2,
    "properties": [
      "Thrown"
    ],
    "mastery": "Slow",
    "range": "30/120 ft"
  },
  {
    "name": "Lance",
    "type": "melee",
    "category": "martial",
    "damage": "1d10",
    "damageType": "P",
    "weight": 6,
    "properties": [
      "Heavy",
      "Reach",
      "Two-Handed"
    ],
    "mastery": "Topple",
    "range": null
  },
  {
    "name": "Light Crossbow",
    "type": "ranged",
    "category": "simple",
    "damage": "1d8",
    "damageType": "P",
    "weight": 5,
    "properties": [
      "Ammunition",
      "Loading",
      "Two-Handed"
    ],
    "mastery": "Slow",
    "range": "80/320 ft"
  },
  {
    "name": "Light Hammer",
    "type": "melee",
    "category": "simple",
    "damage": "1d4",
    "damageType": "B",
    "weight": 2,
    "properties": [
      "Light",
      "Thrown"
    ],
    "mastery": "Nick",
    "range": "20/60 ft"
  },
  {
    "name": "Longbow",
    "type": "ranged",
    "category": "martial",
    "damage": "1d8",
    "damageType": "P",
    "weight": 2,
    "properties": [
      "Ammunition",
      "Heavy",
      "Two-Handed"
    ],
    "mastery": "Slow",
    "range": "150/600 ft"
  },
  {
    "name": "Longsword",
    "type": "melee",
    "category": "martial",
    "damage": "1d8",
    "damageType": "S",
    "weight": 3,
    "properties": [
      "Versatile"
    ],
    "mastery": "Sap",
    "range": null
  },
  {
    "name": "Mace",
    "type": "melee",
    "category": "simple",
    "damage": "1d6",
    "damageType": "B",
    "weight": 4,
    "properties": [],
    "mastery": "Sap",
    "range": null
  },
  {
    "name": "Maul",
    "type": "melee",
    "category": "martial",
    "damage": "2d6",
    "damageType": "B",
    "weight": 10,
    "properties": [
      "Heavy",
      "Two-Handed"
    ],
    "mastery": "Topple",
    "range": null
  },
  {
    "name": "Morningstar",
    "type": "melee",
    "category": "martial",
    "damage": "1d8",
    "damageType": "P",
    "weight": 4,
    "properties": [],
    "mastery": "Sap",
    "range": null
  },
  {
    "name": "Musket",
    "type": "ranged",
    "category": "martial",
    "damage": "1d12",
    "damageType": "P",
    "weight": 10,
    "properties": [
      "Ammunition",
      "Loading",
      "Two-Handed"
    ],
    "mastery": "Slow",
    "range": "40/120 ft"
  },
  {
    "name": "Pike",
    "type": "melee",
    "category": "martial",
    "damage": "1d10",
    "damageType": "P",
    "weight": 18,
    "properties": [
      "Heavy",
      "Reach",
      "Two-Handed"
    ],
    "mastery": "Push",
    "range": null
  },
  {
    "name": "Pistol",
    "type": "ranged",
    "category": "martial",
    "damage": "1d10",
    "damageType": "P",
    "weight": 3,
    "properties": [
      "Ammunition",
      "Loading"
    ],
    "mastery": "Vex",
    "range": "30/90 ft"
  },
  {
    "name": "Quarterstaff",
    "type": "melee",
    "category": "simple",
    "damage": "1d6",
    "damageType": "B",
    "weight": 4,
    "properties": [
      "Versatile"
    ],
    "mastery": "Topple",
    "range": null
  },
  {
    "name": "Rapier",
    "type": "melee",
    "category": "martial",
    "damage": "1d8",
    "damageType": "P",
    "weight": 2,
    "properties": [
      "Finesse"
    ],
    "mastery": "Vex",
    "range": null
  },
  {
    "name": "Scimitar",
    "type": "melee",
    "category": "martial",
    "damage": "1d6",
    "damageType": "S",
    "weight": 3,
    "properties": [
      "Finesse",
      "Light"
    ],
    "mastery": "Nick",
    "range": null
  },
  {
    "name": "Shortbow",
    "type": "ranged",
    "category": "simple",
    "damage": "1d6",
    "damageType": "P",
    "weight": 2,
    "properties": [
      "Ammunition",
      "Two-Handed"
    ],
    "mastery": "Vex",
    "range": "80/320 ft"
  },
  {
    "name": "Shortsword",
    "type": "melee",
    "category": "martial",
    "damage": "1d6",
    "damageType": "P",
    "weight": 2,
    "properties": [
      "Finesse",
      "Light"
    ],
    "mastery": "Vex",
    "range": null
  },
  {
    "name": "Sickle",
    "type": "melee",
    "category": "simple",
    "damage": "1d4",
    "damageType": "S",
    "weight": 2,
    "properties": [
      "Light"
    ],
    "mastery": "Nick",
    "range": null
  },
  {
    "name": "Sling",
    "type": "ranged",
    "category": "simple",
    "damage": "1d4",
    "damageType": "B",
    "weight": 0,
    "properties": [
      "Ammunition"
    ],
    "mastery": "Slow",
    "range": "30/120 ft"
  },
  {
    "name": "Spear",
    "type": "melee",
    "category": "simple",
    "damage": "1d6",
    "damageType": "P",
    "weight": 3,
    "properties": [
      "Thrown",
      "Versatile"
    ],
    "mastery": "Sap",
    "range": "20/60 ft"
  },
  {
    "name": "Trident",
    "type": "melee",
    "category": "martial",
    "damage": "1d8",
    "damageType": "P",
    "weight": 4,
    "properties": [
      "Thrown",
      "Versatile"
    ],
    "mastery": "Topple",
    "range": "20/60 ft"
  },
  {
    "name": "War Pick",
    "type": "melee",
    "category": "martial",
    "damage": "1d8",
    "damageType": "P",
    "weight": 2,
    "properties": [
      "Versatile"
    ],
    "mastery": "Sap",
    "range": null
  },
  {
    "name": "Warhammer",
    "type": "melee",
    "category": "martial",
    "damage": "1d8",
    "damageType": "B",
    "weight": 5,
    "properties": [
      "Versatile"
    ],
    "mastery": "Push",
    "range": null
  },
  {
    "name": "Whip",
    "type": "melee",
    "category": "martial",
    "damage": "1d4",
    "damageType": "S",
    "weight": 3,
    "properties": [
      "Finesse",
      "Reach"
    ],
    "mastery": "Slow",
    "range": null
  }
];
