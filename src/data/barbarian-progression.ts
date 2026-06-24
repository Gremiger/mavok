export interface BarbarianLevel {
  level: number;
  proficiencyBonus: number;
  rages: number;
  rageDamage: number;
  weaponMasteries: number;
}

export interface BarbarianFeature {
  name: string;
  level: number;
  description: string;
  isSubclassSlot: boolean;
}

export const BARBARIAN_LEVELS: BarbarianLevel[] = [
  {
    "level": 1,
    "proficiencyBonus": 2,
    "rages": 2,
    "rageDamage": 2,
    "weaponMasteries": 2
  },
  {
    "level": 2,
    "proficiencyBonus": 2,
    "rages": 2,
    "rageDamage": 2,
    "weaponMasteries": 2
  },
  {
    "level": 3,
    "proficiencyBonus": 2,
    "rages": 3,
    "rageDamage": 2,
    "weaponMasteries": 2
  },
  {
    "level": 4,
    "proficiencyBonus": 2,
    "rages": 3,
    "rageDamage": 2,
    "weaponMasteries": 3
  },
  {
    "level": 5,
    "proficiencyBonus": 3,
    "rages": 3,
    "rageDamage": 2,
    "weaponMasteries": 3
  },
  {
    "level": 6,
    "proficiencyBonus": 3,
    "rages": 4,
    "rageDamage": 2,
    "weaponMasteries": 3
  },
  {
    "level": 7,
    "proficiencyBonus": 3,
    "rages": 4,
    "rageDamage": 2,
    "weaponMasteries": 3
  },
  {
    "level": 8,
    "proficiencyBonus": 3,
    "rages": 4,
    "rageDamage": 2,
    "weaponMasteries": 3
  },
  {
    "level": 9,
    "proficiencyBonus": 4,
    "rages": 4,
    "rageDamage": 3,
    "weaponMasteries": 3
  },
  {
    "level": 10,
    "proficiencyBonus": 4,
    "rages": 4,
    "rageDamage": 3,
    "weaponMasteries": 4
  },
  {
    "level": 11,
    "proficiencyBonus": 4,
    "rages": 4,
    "rageDamage": 3,
    "weaponMasteries": 4
  },
  {
    "level": 12,
    "proficiencyBonus": 4,
    "rages": 5,
    "rageDamage": 3,
    "weaponMasteries": 4
  },
  {
    "level": 13,
    "proficiencyBonus": 5,
    "rages": 5,
    "rageDamage": 3,
    "weaponMasteries": 4
  },
  {
    "level": 14,
    "proficiencyBonus": 5,
    "rages": 5,
    "rageDamage": 3,
    "weaponMasteries": 4
  },
  {
    "level": 15,
    "proficiencyBonus": 5,
    "rages": 5,
    "rageDamage": 3,
    "weaponMasteries": 4
  },
  {
    "level": 16,
    "proficiencyBonus": 5,
    "rages": 5,
    "rageDamage": 4,
    "weaponMasteries": 4
  },
  {
    "level": 17,
    "proficiencyBonus": 6,
    "rages": 6,
    "rageDamage": 4,
    "weaponMasteries": 4
  },
  {
    "level": 18,
    "proficiencyBonus": 6,
    "rages": 6,
    "rageDamage": 4,
    "weaponMasteries": 4
  },
  {
    "level": 19,
    "proficiencyBonus": 6,
    "rages": 6,
    "rageDamage": 4,
    "weaponMasteries": 4
  },
  {
    "level": 20,
    "proficiencyBonus": 6,
    "rages": 6,
    "rageDamage": 4,
    "weaponMasteries": 4
  }
];

export const BARBARIAN_FEATURES: BarbarianFeature[] = [
  {
    "name": "Rage",
    "level": 1,
    "description": "You can imbue yourself with a primal power called Rage, a force that grants you extraordinary might and resilience. You can enter it as a Bonus Action if you aren't wearing Heavy armor. You can enter your Rage the number of times shown for your Barbarian level in the Rages column of the Barbarian Features table. You regain one expended use when you finish a Short Rest, and you regain all expended uses when you finish a Long Rest. While active, your Rage follows the rules below. **Damage Resistance:** You have Resistance to Bludgeoning, Piercing, and Slashing damage. **Rage Damage:** When you make an attack using Strength—with either a weapon or an Unarmed Strike—and deal damage to the target, you gain a bonus to the damage that increases as you gain levels as a Barbarian, as shown in the Rage Damage column of the Barbarian Features table. **Strength Advantage:** You have Advantage on Strength checks and Strength saving throws. **No Concentration or Spells:** You can't maintain Concentration, and you can't cast spells. **Duration:** The Rage lasts until the end of your next turn, and it ends early if you don Heavy armor or have the Incapacitated condition. If your Rage is still active on your next turn, you can extend the Rage for another round by doing one of the following: Each time the Rage is extended, it lasts until the end of your next turn. You can maintain a Rage for up to 10 minutes.",
    "isSubclassSlot": false
  },
  {
    "name": "Unarmored Defense",
    "level": 1,
    "description": "While you aren't wearing any armor, your base Armor Class equals 10 plus your Dexterity and Constitution modifiers. You can use a Shield and still gain this benefit.",
    "isSubclassSlot": false
  },
  {
    "name": "Weapon Mastery",
    "level": 1,
    "description": "Your training with weapons allows you to use the weapon mastery properties of two kinds of Simple or Martial Melee weapons of your choice, such as Greataxe and Handaxe. Whenever you finish a Long Rest, you can practice weapon drills and change one of those weapon choices. When you reach certain Barbarian levels, you gain the ability to use the weapon mastery properties of more kinds of weapons, as shown in the Weapon Mastery column of the Barbarian Features table.",
    "isSubclassSlot": false
  },
  {
    "name": "Danger Sense",
    "level": 2,
    "description": "You gain an uncanny sense of when things aren't as they should be, giving you an edge when you dodge perils. You have Advantage on Dexterity saving throws unless you have the Incapacitated condition.",
    "isSubclassSlot": false
  },
  {
    "name": "Reckless Attack",
    "level": 2,
    "description": "You can throw aside all concern for defense to attack with increased ferocity. When you make your first attack roll on your turn, you can decide to attack recklessly. Doing so gives you Advantage on attack rolls using Strength until the start of your next turn, but attack rolls against you have Advantage during that time.",
    "isSubclassSlot": false
  },
  {
    "name": "Barbarian Subclass",
    "level": 3,
    "description": "You gain a Barbarian subclass of your choice. A subclass is a specialization that grants you features at certain Barbarian levels. For the rest of your career, you gain each of your subclass's features that are of your Barbarian level or lower.",
    "isSubclassSlot": true
  },
  {
    "name": "Primal Knowledge",
    "level": 3,
    "description": "You gain proficiency in another skill of your choice from the skill list available to Barbarians at level 1. In addition, while your Rage is active, you can channel primal power when you attempt certain tasks; whenever you make an ability check using one of the following skills, you can make it as a Strength check even if it normally uses a different ability: Acrobatics, Intimidation, Perception, Stealth, or Survival. When you use this ability, your Strength represents primal power coursing through you, honing your agility, bearing, and senses.",
    "isSubclassSlot": false
  },
  {
    "name": "Ability Score Improvement",
    "level": 4,
    "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify. You gain this feature again at Barbarian levels 8, 12, and 16.",
    "isSubclassSlot": false
  },
  {
    "name": "Extra Attack",
    "level": 5,
    "description": "You can attack twice instead of once whenever you take the Attack action on your turn.",
    "isSubclassSlot": false
  },
  {
    "name": "Fast Movement",
    "level": 5,
    "description": "Your speed increases by 10 feet while you aren't wearing Heavy armor.",
    "isSubclassSlot": false
  },
  {
    "name": "Subclass Feature",
    "level": 6,
    "description": "You gain a feature from your Barbarian subclass.",
    "isSubclassSlot": true
  },
  {
    "name": "Feral Instinct",
    "level": 7,
    "description": "Your instincts are so honed that you have Advantage on Initiative rolls.",
    "isSubclassSlot": false
  },
  {
    "name": "Instinctive Pounce",
    "level": 7,
    "description": "As part of the Bonus Action you take to enter your Rage, you can move up to half your Speed.",
    "isSubclassSlot": false
  },
  {
    "name": "Ability Score Improvement",
    "level": 8,
    "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify.",
    "isSubclassSlot": false
  },
  {
    "name": "Brutal Strike",
    "level": 9,
    "description": "If you use Reckless Attack, you can forgo any Advantage on one Strength-based attack roll of your choice on your turn. The chosen attack roll mustn't have Disadvantage. If the chosen attack roll hits, the target takes an extra 1d10 damage of the same type dealt by the weapon or Unarmed Strike, and you can cause one Brutal Strike effect of your choice. You have the following effect options. **Forceful Blow:** The target is pushed 15 feet straight away from you. You can then move up to half your Speed straight toward the target without provoking Opportunity Attack. **Hamstring Blow:** The target's Speed is reduced by 15 feet until the start of your next turn. A target can be affected by only one Hamstring Blow at a time—the most recent one.",
    "isSubclassSlot": false
  },
  {
    "name": "Subclass Feature",
    "level": 10,
    "description": "You gain a feature from your Barbarian subclass.",
    "isSubclassSlot": true
  },
  {
    "name": "Relentless Rage",
    "level": 11,
    "description": "Your Rage can keep you fighting despite grievous wounds. If you drop to 0 Hit Points while your Rage is active and don't die outright, you can make a 10 Constitution saving throw. If you succeed, your Hit Points instead change to a number equal to twice your Barbarian level. Each time you use this feature after the first, the DC increases by 5. When you finish a Short Rest or Long Rest, the DC resets to 10.",
    "isSubclassSlot": false
  },
  {
    "name": "Ability Score Improvement",
    "level": 12,
    "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify.",
    "isSubclassSlot": false
  },
  {
    "name": "Improved Brutal Strike",
    "level": 13,
    "description": "You have honed new ways to attack furiously. The following effects are now among your Brutal Strike options. **Staggering Blow:** The target has Disadvantage on the next saving throw it makes, and it can't make Opportunity Attack until the start of your next turn. **Sundering Blow:** Before the start of your next turn, the next attack roll made by another creature against the target gains a +5 bonus to the roll. An attack roll can gain only one Sundering Blow bonus.",
    "isSubclassSlot": false
  },
  {
    "name": "Subclass Feature",
    "level": 14,
    "description": "You gain a feature from your Barbarian subclass.",
    "isSubclassSlot": true
  },
  {
    "name": "Persistent Rage",
    "level": 15,
    "description": "When you roll Initiative, you can regain all expended uses of Rage. After you regain uses of Rage in this way, you can't do so again until you finish a Long Rest. In addition, your Rage is so fierce that it now lasts for 10 minutes without you needing to do anything to extend it from round to round. Your Rage ends early if you have the Unconscious condition (not just the Incapacitated condition) or don Heavy armor.",
    "isSubclassSlot": false
  },
  {
    "name": "Ability Score Improvement",
    "level": 16,
    "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify.",
    "isSubclassSlot": false
  },
  {
    "name": "Improved Brutal Strike",
    "level": 17,
    "description": "The extra damage of your Brutal Strike increases to 2d10. In addition, you can use two different Brutal Strike effects whenever you use your Brutal Strike feature.",
    "isSubclassSlot": false
  },
  {
    "name": "Indomitable Might",
    "level": 18,
    "description": "If your total for a Strength check or Strength saving throw is less than your Strength score, you can use that score in place of the total.",
    "isSubclassSlot": false
  },
  {
    "name": "Epic Boon",
    "level": 19,
    "description": "You gain an Epic Boon feat or another feat of your choice for which you qualify. Boon of Irresistible Offense is recommended.",
    "isSubclassSlot": false
  },
  {
    "name": "Primal Champion",
    "level": 20,
    "description": "You embody primal power. Your Strength and Constitution scores increase by 4, to a maximum of 25.",
    "isSubclassSlot": false
  }
];
