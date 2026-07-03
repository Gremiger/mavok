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
  value: number | null;
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
    "range": null,
    "value": 10
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
    "range": "25/100 ft",
    "value": 10
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
    "range": null,
    "value": 0.1
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
    "range": "20/60 ft",
    "value": 2
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
    "range": "20/60 ft",
    "value": 0.05
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
    "range": null,
    "value": 10
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
    "range": null,
    "value": 20
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
    "range": null,
    "value": 30
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
    "range": null,
    "value": 0.2
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
    "range": null,
    "value": 50
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
    "range": null,
    "value": 20
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
    "range": "30/120 ft",
    "value": 75
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
    "range": "20/60 ft",
    "value": 5
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
    "range": "100/400 ft",
    "value": 50
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
    "range": "30/120 ft",
    "value": 0.5
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
    "range": null,
    "value": 10
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
    "range": "80/320 ft",
    "value": 25
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
    "range": "20/60 ft",
    "value": 2
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
    "range": "150/600 ft",
    "value": 50
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
    "range": null,
    "value": 15
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
    "range": null,
    "value": 5
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
    "range": null,
    "value": 10
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
    "range": null,
    "value": 15
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
    "range": "40/120 ft",
    "value": 500
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
    "range": null,
    "value": 5
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
    "range": "30/90 ft",
    "value": 250
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
    "range": null,
    "value": 0.2
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
    "range": null,
    "value": 25
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
    "range": null,
    "value": 25
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
    "range": "80/320 ft",
    "value": 25
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
    "range": null,
    "value": 10
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
    "range": null,
    "value": 1
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
    "range": "30/120 ft",
    "value": 0.1
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
    "range": "20/60 ft",
    "value": 1
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
    "range": "20/60 ft",
    "value": 5
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
    "range": null,
    "value": 5
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
    "range": null,
    "value": 15
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
    "range": null,
    "value": 2
  }
];
