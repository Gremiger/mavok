export interface Condition {
  name: string;
  description: string;
}

export const CONDITIONS: Condition[] = [
  {
    "name": "Blinded",
    "description": "While you have the Blinded condition, you experience the following effects. **Can't See:** You can't see and automatically fail any ability check that requires sight. **Attacks Affected:** Attack rolls against you have Advantage, and your attack rolls have Disadvantage."
  },
  {
    "name": "Charmed",
    "description": "While you have the Charmed condition, you experience the following effects. **Can't Harm the Charmer:** You can't attack the charmer or target the charmer with damaging abilities or Magical Effect. **Social Advantage:** The charmer has Advantage on any ability check to interact with you socially."
  },
  {
    "name": "Deafened",
    "description": "While you have the Deafened condition, you experience the following effect. **Can't Hear:** You can't hear and automatically fail any ability check that requires hearing."
  },
  {
    "name": "Exhaustion",
    "description": "While you have the Exhaustion condition, you experience the following effects. **Exhaustion Levels:** This condition is cumulative. Each time you receive it, you gain 1 Exhaustion level. You die if your Exhaustion level is 6. **D20 Tests Affected:** When you make a D20 Test the roll is reduced by 2 times your Exhaustion level. **Speed Reduced:** Your Speed is reduced by a number of feet equal to 5 times your Exhaustion level. **Removing Exhaustion Levels:** Finishing a Long Rest removes 1 of your Exhaustion levels. When your Exhaustion level reaches 0, the condition ends."
  },
  {
    "name": "Frightened",
    "description": "While you have the Frightened condition, you experience the following effects. **Ability Checks and Attacks Affected:** You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight. **Can't Approach:** You can't willingly move closer to the source of fear."
  },
  {
    "name": "Grappled",
    "description": "While you have the Grappled condition, you experience the following effects. **Speed 0:** Your Speed is 0 and can't increase. **Attacks Affected:** You have Disadvantage on attack rolls against any target other than the grappler. **Movable:** The grappler can drag or carry you when it moves, but every foot of movement costs it 1 extra foot unless you are Tiny or two or more sizes smaller than it."
  },
  {
    "name": "Incapacitated",
    "description": "While you have the Incapacitated condition, you experience the following effects. **Inactive:** You can't take any Action, Bonus Action, or Reaction. **No Concentration:** Your Concentration is broken. **Speechless:** You can't speak. **Surprised:** If you're Incapacitated when you roll Initiative, you have Disadvantage on the roll."
  },
  {
    "name": "Invisible",
    "description": "While you have the Invisible condition, you experience the following effects. **Surprise:** If you're Invisible when you roll Initiative, you have Advantage on the roll. **Concealed:** You aren't affected by any effect that requires its target to be seen unless the effect's creator can somehow see you. Any equipment you are wearing or carrying is also concealed. **Attacks Affected:** Attack rolls against you have Disadvantage, and your attack rolls have Advantage. If a creature can somehow see you, you don't gain this benefit against that creature."
  },
  {
    "name": "Paralyzed",
    "description": "While you have the Paralyzed condition, you experience the following effects. **Incapacitated:** You have the Incapacitated condition. **Speed 0:** Your Speed is 0 and can't increase. **Saving Throws Affected:** You automatically fail Strength and Dexterity Saving Throw. **Attacks Affected:** Attack rolls against you have Advantage. **Automatic Critical Hits:** Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you."
  },
  {
    "name": "Petrified",
    "description": "While you have the Petrified condition, you experience the following effects. **Turned to Inanimate Substance:** You are transformed, along with any nonmagical objects you are wearing and carrying, into a solid inanimate substance (usually stone). Your weight increases by a factor of ten, and you cease aging. **Incapacitated:** You have the Incapacitated condition. **Speed 0:** Your Speed is 0 and can't increase. **Attacks Affected:** Attack rolls against you have Advantage. **Saving Throws Affected:** You automatically fail Strength and Dexterity Saving Throw. **Resist Damage:** You have Resistance to all damage. **Poison Immunity:** You have Immunity to the Poisoned condition."
  },
  {
    "name": "Poisoned",
    "description": "While you have the Poisoned condition, you experience the following effect. **Ability Checks and Attacks Affected:** You have Disadvantage on attack rolls and ability checks."
  },
  {
    "name": "Prone",
    "description": "While you have the Prone condition, you experience the following effects. **Restricted Movement:** Your only movement options are to Crawling or to spend an amount of movement equal to half your Speed (round down) to right yourself and thereby end the condition. If your Speed is 0, you can't right yourself. **Attacks Affected:** You have Disadvantage on attack rolls. An attack roll against you has Advantage if the attacker is within 5 feet of you. Otherwise, that attack roll has Disadvantage."
  },
  {
    "name": "Restrained",
    "description": "While you have the Restrained condition, you experience the following effects. **Speed 0:** Your Speed is 0 and can't increase. **Attacks Affected:** Attack rolls against you have Advantage, and your attack rolls have Disadvantage. **Saving Throws Affected:** You have Disadvantage on Dexterity Saving Throw."
  },
  {
    "name": "Stunned",
    "description": "While you have the Stunned condition, you experience the following effects. **Incapacitated:** You have the Incapacitated condition. **Saving Throws Affected:** You automatically fail Strength and Dexterity Saving Throw. **Attacks Affected:** Attack rolls against you have Advantage."
  },
  {
    "name": "Unconscious",
    "description": "While you have the Unconscious condition, you experience the following effects. **Inert:** You have the Incapacitated and Prone conditions, and you drop whatever you're holding. When this condition ends, you remain Prone. **Speed 0:** Your Speed is 0 and can't increase. **Attacks Affected:** Attack rolls against you have Advantage. **Saving Throws Affected:** You automatically fail Strength and Dexterity Saving Throw. **Automatic Critical Hits:** Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you. **Unaware:** You're unaware of your surroundings."
  }
];
