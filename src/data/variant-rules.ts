export interface VariantRuleData {
  name: string;
  description: string;
}

export const VARIANT_RULES: VariantRuleData[] = [
  {
    "name": "Ability Check",
    "description": "An ability check is a D20 Test that represents using one of the six abilities—or a specific skill associated with an ability—to overcome a challenge."
  },
  {
    "name": "Ability Score and Modifier",
    "description": "A creature has six ability scores—Strength, Dexterity, Constitution, Intelligence, Wisdom, and Charisma—each of which has a corresponding modifier. Add the modifier when you make a D20 Test with the corresponding ability or when a rule asks you to do so."
  },
  {
    "name": "Action",
    "description": "On your turn, you can take one action. Choose which action to take from those below or from the special actions provided by your features. These actions are defined elsewhere in this glossary: Attack Dodge Dash Help Disengage Hide Influence Magic Ready Search Study Utilize"
  },
  {
    "name": "Advantage",
    "description": "If you have Advantage on a D20 Test, roll two d20s, and use the higher roll. A roll can't be affected by more than one Advantage, and Advantage and Disadvantage on the same roll cancel each other."
  },
  {
    "name": "Adventure",
    "description": "An adventure is a series of Encounter. A story emerges through playing them."
  },
  {
    "name": "Alignment",
    "description": "A creature's alignment broadly describes its ethical attitudes and ideals. Alignment is a combination of two factors: one identifies morality (good, evil, or neutral), and the other describes attitudes toward order (lawful, chaotic, or neutral). These factors allow for nine possible combinations, such as Lawful Good and Neutral Evil."
  },
  {
    "name": "Ally",
    "description": "A creature is your ally if it is a member of your adventuring party, your friend, on your side in combat, or a creature that the rules or the DM designates as your ally."
  },
  {
    "name": "Area of Effect",
    "description": "The descriptions of many spells and other features specify that they have an area of effect, which typically has one of six shapes. These shapes are defined elsewhere in this glossary: Cone [Area of Effect] Cube [Area of Effect] Cylinder [Area of Effect] Emanation [Area of Effect] Line [Area of Effect] Sphere [Area of Effect] An area of effect has a point of origin, a location from which the effect's energy erupts. The rules for each shape specify how to position its point of origin. If all straight lines extending from the point of origin to a location in the area of effect are blocked, that location isn't included in the area of effect. To block a line, an obstruction must provide Cover. If the creator of an area of effect places it at an unseen point and an obstruction—such as a wall—is between the creator and that point, the point of origin comes into being on the near side of the obstruction."
  },
  {
    "name": "Armor Class",
    "description": "An Armor Class (AC) is the target number for an attack roll. AC represents how difficult it is to hit a target. Your base AC calculation is 10 plus your Dexterity modifier. If a rule gives you another base AC calculation, you choose which calculation to use; you can't use more than one."
  },
  {
    "name": "Armor Training",
    "description": "Armor training allows you to use armor of a certain category without the following drawbacks. If you wear Light, Medium, or Heavy armor and lack training with it, you have Disadvantage on any D20 Test that involves Strength or Dexterity, and you can't cast spells. If you use a Shield and lack training with it, you don't gain its AC bonus."
  },
  {
    "name": "Attack Roll",
    "description": "An attack roll is a D20 Test that represents making an attack with a weapon, an Unarmed Strike, or a spell."
  },
  {
    "name": "Attitude",
    "description": "A Monster has a starting attitude toward a Player Character: Friendly [Attitude], Hostile [Attitude], or Indifferent [Attitude]."
  },
  {
    "name": "Attunement",
    "description": "Some magic items require a creature to form a bond—called Attunement—with them before the creature can use an item's magical properties. A creature can have Attunement with no more than three magic items at a time."
  },
  {
    "name": "Bonus Action",
    "description": "A Bonus Action is a special action that you can take on the same turn that you take an action. You can't take more than one Bonus Action on a turn, and you have a Bonus Action to take only if a rule explicitly says so."
  },
  {
    "name": "Breaking Objects",
    "description": "Objects can be harmed by attacks and by some spells, using the rules below. If an object is exceedingly fragile, the DM may allow a creature to break it automatically with the Attack or Utilize action. **Armor Class:** The Object Armor Class table suggests ACs for various substances. **Hit Points:** An object is destroyed when it has 0 Hit Points. The Object Hit Points table suggests Hit Points for fragile and resilient objects that are Large or smaller. To track Hit Points for a Huge or Gargantuan object, divide it into Large or smaller sections, and track each section's Hit Points separately. The DM determines whether destroying part of an object causes the whole thing to collapse. **Damage Types and Objects:** Objects have Immunity to Poison and Psychic damage. The DM might decide that some Damage Types are more or less effective against an object. For example, Bludgeoning damage works well for smashing things but not for cutting. Paper or cloth objects might have Vulnerability to Fire damage. **Damage Threshold:** Big objects, such as castle walls, often have extra resilience represented by a damage threshold. **No Ability Scores:** An object lacks ability scores unless a rule assigns scores to the object. Without ability scores, an object can't make ability checks, and it fails all saving throws."
  },
  {
    "name": "Bright Light",
    "description": "Bright Light is normal illumination."
  },
  {
    "name": "Burrow Speed",
    "description": "A creature that has a Burrow Speed can use that speed to move through sand, earth, mud, or ice. The creature can't burrow through solid rock unless the creature has a trait that allows it to do so."
  },
  {
    "name": "Campaign",
    "description": "A campaign is a series of Adventure."
  },
  {
    "name": "Cantrip",
    "description": "A cantrip is a level 0 spell, which is cast without a spell slot."
  },
  {
    "name": "Carrying Capacity",
    "description": "Your size and Strength score determines the maximum weight in pounds that you can carry, as shown in the Carrying Capacity table. The table also shows the maximum weight you can drag, lift or push. While dragging, lifting, or pushing weight in excess of the maximum weight you can carry, your Speed can be no more than 5 feet."
  },
  {
    "name": "Challenge Rating",
    "description": "Challenge Rating (CR) summarizes the threat a Monster poses to a group of four Player Character. Compare a Monster CR to the characters' level. If the CR is higher, the Monster is likely a danger. If the CR is lower, the Monster likely poses little threat. But circumstances and the number of Player Character can significantly alter how threatening a Monster is in actual play. The Dungeon Master's Guide provides guidance to the DM on using CR while planning potential combat Encounter."
  },
  {
    "name": "Character Sheet",
    "description": "A character sheet is a paper or digital record that you use to track your character's information."
  },
  {
    "name": "Climb Speed",
    "description": "A Climb Speed can be used in place of Speed to traverse a vertical surface without expending the extra movement normally associated with climbing."
  },
  {
    "name": "Climbing",
    "description": "While you're climbing, each foot of movement costs 1 extra foot (2 extra feet in Difficult Terrain). You ignore this extra cost if you have a Climb Speed and use it to climb. At the DM's option, climbing a slippery surface or one with few handholds might require a successful 15 Strength (Athletics) check."
  },
  {
    "name": "Condition",
    "description": "A condition is a temporary game state. The definition of a condition says how it affects its recipient, and various rules define how to end a condition. This glossary defines these conditions: Blinded Charmed Deafened Exhaustion Frightened Grappled Incapacitated Invisible Paralyzed Petrified Poisoned Prone Restrained Stunned Unconscious A condition doesn't stack with itself; a recipient either has a condition or doesn't. The Exhaustion condition is an exception to that rule."
  },
  {
    "name": "Cone [Area of Effect]",
    "description": "A Cone is an area of effect that extends in straight lines from a point of origin in a direction its creator chooses. A Cone's width at any point along its length is equal to that point's distance from the point of origin. For example, a Cone is 15 feet wide at a point along its length that is 15 feet from the point of origin. The effect that creates a Cone specifies its maximum length. A Cone's point of origin isn't included in the area of effect unless its creator decides otherwise."
  },
  {
    "name": "Cover",
    "description": "Cover provides a degree of protection to a target behind it. There are three degrees of cover, each of which provides a different benefit to a target: Half Cover (+2 bonus to AC and Dexterity saving throws), Three-Quarters Cover (+5 bonus to AC and Dexterity Saving Throw), and Total Cover (can't be targeted directly). If behind more than one degree of cover, a target benefits only from the most protective degree."
  },
  {
    "name": "Crawling",
    "description": "While you're crawling, each foot of movement costs 1 extra foot (2 extra feet in Difficult Terrain)."
  },
  {
    "name": "Creature",
    "description": "Any being in the game, including Player Character, is a creature."
  },
  {
    "name": "Creature Type",
    "description": "Every creature, including every Player Character, has a tag in the rules that identifies the type of creature it is. Most Player Character are of the Humanoid type. These are the game's creature types: Aberration Beast Celestial Construct Dragon Elemental Fey Fiend Giant Humanoid Monstrosity Ooze Plant Undead The types don't have rules themselves, but some rules in the game affect creatures of certain types in different ways."
  },
  {
    "name": "Critical Hit",
    "description": "If you roll a 20 on the d20 for an attack roll, you score a Critical Hit, and the attack hits regardless of any modifiers or the target's AC. A Critical Hit lets you roll extra dice for the attack's damage against the target. Roll all of the attack's damage dice twice and add them together. Then add any relevant modifiers."
  },
  {
    "name": "Cube [Area of Effect]",
    "description": "A Cube is an area of effect that extends in straight lines from a point of origin located anywhere on a face of the Cube. The effect that creates a Cube specifies its size, which is the length of each side. A Cube's point of origin isn't included in the area of effect unless its creator decides otherwise."
  },
  {
    "name": "Curses",
    "description": "Some game effects curse a creature or an object. The effect that confers a curse defines what the curse does. Curses can be removed by the Remove Curse and Greater Restoration spells or other magic that explicitly ends curses."
  },
  {
    "name": "Cylinder [Area of Effect]",
    "description": "A Cylinder is an area of effect that extends in straight lines from a point of origin located at the center of the circular top or bottom of the Cylinder. The effect that creates a Cylinder specifies the radius of the Cylinder's base and the Cylinder's height. A Cylinder's point of origin is included in the area of effect."
  },
  {
    "name": "D20 Test",
    "description": "D20 Tests encompass the three main d20 rolls of the game: Ability Check, Attack Roll, and Saving Throw. If something in the game affects D20 Tests, it affects all three of these rolls. The DM determines whether a D20 Test is warranted in a given circumstance."
  },
  {
    "name": "Damage",
    "description": "Damage represents harm that causes a creature or an object to lose Hit Points."
  },
  {
    "name": "Damage Roll",
    "description": "A damage roll is a die roll, adjusted by any applicable modifiers, that deals damage to a target."
  },
  {
    "name": "Damage Threshold",
    "description": "A creature or an object that has a damage threshold has Immunity to all damage unless it takes an amount of damage from a single attack or effect equal to or greater than its damage threshold, in which case it takes that entire instance of damage. Any damage that fails to meet or exceed the damage threshold is superficial and doesn't reduce Hit Points. For example, if an object has a damage threshold of 10, the object takes no damage if 9 damage is dealt to it, since that damage fails to exceed the threshold. If the same object is dealt 11 damage, it takes all of that damage."
  },
  {
    "name": "Damage Types",
    "description": "Attacks and other harmful effects deal different types of damage. Damage types have no rules of their own, but other rules, such as Resistance, rely on the types. The Damage Types table offers examples to help a DM assign a type to a new effect."
  },
  {
    "name": "Darkness",
    "description": "An area of Darkness is Heavily Obscured."
  },
  {
    "name": "Dead",
    "description": "A dead creature has no Hit Points and can't regain them unless it is first revived by magic such as the Raise Dead or Revivify spell. When such a spell is cast, the spirit knows who is casting it and can refuse. The spirit of a dead creature has left the body and departed for the Outer Planes, and reviving the creature requires calling the spirit back. If the creature returns to life, the revival effect determines the creature's current Hit Points. Unless otherwise stated, the creature returns to life with any Condition, magical contagions, or curses that were affecting it at death if the durations of those effects are still ongoing. If the creature died with any Exhaustion levels, it returns with 1 fewer level. If the creature had Attunement to one or more magic items, it is no longer attuned to them."
  },
  {
    "name": "Death Saving Throw",
    "description": "A Player Character must make a Death Saving Throw (also called a Death Save) if they start their turn with 0 Hit Points."
  },
  {
    "name": "Difficult Terrain",
    "description": "If a space is Difficult Terrain, every foot of movement in that space costs 1 extra foot. For example, moving 5 feet through Difficult Terrain costs 10 feet of movement. Difficult Terrain isn't cumulative; either a space is Difficult Terrain or it isn't. A space is Difficult Terrain if the space contains any of the following or something similar: A creature that isn't Tiny or your ally Furniture that is sized for creatures of your size or larger Heavy snow, ice, rubble, or undergrowth Liquid that's between shin- and waist-deep A narrow opening sized for a creature one size smaller than you A slope of 20 degrees or more"
  },
  {
    "name": "Difficulty Class",
    "description": "A Difficulty Class (DC) is the target number for an ability check or a Saving Throw."
  },
  {
    "name": "Dim Light",
    "description": "An area with Dim Light is Lightly Obscured."
  },
  {
    "name": "Disadvantage",
    "description": "If you have Disadvantage on a D20 Test, roll two d20s and use the lower roll. A roll can't be affected by more than one Disadvantage, and Advantage and Disadvantage on the same roll cancel each other."
  },
  {
    "name": "Emanation [Area of Effect]",
    "description": "An Emanation is an area of effect that extends in straight lines from a creature or an object in all directions. The effect that creates an Emanation specifies the distance it extends. An Emanation moves with the creature or object that is its origin unless it is an instantaneous or a stationary effect. An Emanation's origin (creature or object) isn't included in the area of effect unless its creator decides otherwise."
  },
  {
    "name": "Encounter",
    "description": "An encounter is a scene in an adventure that is part of at least one of the game's three pillars: social interaction, exploration, or combat."
  },
  {
    "name": "Enemy",
    "description": "A creature is your enemy if it fights against you in combat, actively works to harm you, or is designated as your enemy by the rules or DM."
  },
  {
    "name": "Experience Points",
    "description": "As they overcome challenges and complete adventures, characters earn Experience Points (XP) which are awarded by the Dungeon Master. When a character's XP total crosses certain thresholds, the character's level increases. The Dungeon Master's Guide provides guidance on awarding XP."
  },
  {
    "name": "Expertise",
    "description": "Expertise is a feature that enhances your use of a skill proficiency. When you make an ability check with a skill proficiency in which you have Expertise, your Proficiency is doubled for that check unless the bonus is doubled by another feature. If you gain Expertise, you gain it in one skill in which you have proficiency. You can't have Expertise in the same skill proficiency more than once."
  },
  {
    "name": "Fly Speed",
    "description": "A Fly Speed can be used to travel through the air. While you have a Fly Speed, you can stay aloft until you land, fall, or die."
  },
  {
    "name": "Flying",
    "description": "A variety of effects allow a creature to fly. While flying, you fall if you have the Incapacitated or Prone condition or your Fly Speed is reduced to 0. You can stay aloft in those circumstances if you can hover."
  },
  {
    "name": "Friendly [Attitude]",
    "description": "A Friendly creature views you favorably. You have Advantage on an ability check to influence a Friendly creature."
  },
  {
    "name": "Grappling",
    "description": "A creature can grapple another creature. Characters typically grapple by using an Unarmed Strike. Many Monster have special attacks that allow them to quickly grapple prey. However a grapple is initiated, it follows these rules. **Grappled Condition:** Successfully grappling a creature gives it the Grappled condition. **One Grapple per Hand:** A creature must have a hand free to grapple another creature. Some stat blocks and game effects allow a creature to grapple using a tentacle, a maw, or another body part. Whatever part a grappler uses, it can grapple only one creature at a time with that part, and the grappler can't use that part to target another creature unless it ends the grapple. **Ending a Grapple:** A Grappled creature can use its action to make a Strength (Athletics) or Dexterity (Acrobatics) check against the grapple's escape DC, ending the Condition on itself on a success. The Condition also ends if the grappler has the Incapacitated condition or if the distance between the Grappled target and the grappler exceeds the grapple's range. In addition, the grappler can release the target at any time (no action required)."
  },
  {
    "name": "Hazard",
    "description": "A hazard is an environmental danger."
  },
  {
    "name": "Healing",
    "description": "Healing is how you regain Hit Points."
  },
  {
    "name": "Heavily Obscured",
    "description": "You have the Blinded condition while trying to see something in a Heavily Obscured space."
  },
  {
    "name": "Heroic Inspiration",
    "description": "If you (Player Character) have Heroic Inspiration, you can expend it to reroll any die immediately after rolling it, and you must use the new roll. If you gain Heroic Inspiration but already have it, it's lost unless you give it to a Player Character who lacks it."
  },
  {
    "name": "High Jump",
    "description": "When you make a High Jump, you leap into the air a number of feet equal to 3 plus your Strength modifier (minimum of 0 feet) if you move at least 10 feet on foot immediately before the jump. When you make a standing High Jump, you can jump only half that distance. Either way, each foot of the jump costs a foot of movement. You can extend your arms half your height above yourself during the jump. Thus, you can reach a distance equal to the height of the jump plus 1½ times your height."
  },
  {
    "name": "Hit Point Dice",
    "description": "Hit Point Dice, or Hit Dice for short, help determine a Player Character Hit Point maximum, as explained in chapter 2. Most Monster also have Hit Dice. A creature can spend Hit Dice during a Short Rest to regain Hit Points."
  },
  {
    "name": "Hit Points",
    "description": "Hit Points (HP) are a measure of how difficult it is to kill or destroy a creature or an object. Damage reduces Hit Points, and healing restores them. You can't have more Hit Points than your Hit Point maximum, and you can't have less than 0."
  },
  {
    "name": "Hostile [Attitude]",
    "description": "A Hostile creature views you unfavorably. You have Disadvantage on an ability check to influence a Hostile creature."
  },
  {
    "name": "Hover",
    "description": "Some creatures can hover, as noted in their stat blocks, and some spells and other effects grant the ability to hover. Hovering while Flying prevents you from falling in certain circumstances."
  },
  {
    "name": "Illusions",
    "description": "Spells and other effects sometimes create magical illusions. Such an effect defines what the illusion does and which senses or mental faculties it deceives. If an illusion manifests in space, the illusion is insubstantial and weightless, yet it seems to be affected by the environment as if the illusion were real unless the effect that created it specifies otherwise. For example, a visual illusion of a creature casts shadows and reflections, and wind appears to affect the illusory creature. Similarly, an audible illusion echoes in an echoey space."
  },
  {
    "name": "Immunity",
    "description": "If you have Immunity to a Damage Types or a Condition, it doesn't affect you in any way."
  },
  {
    "name": "Improvised Weapons",
    "description": "An improvised weapon is an object wielded as a makeshift weapon, such as broken glass, a table leg, or a frying pan. A Simple or Martial weapon also counts as an improvised weapon if it's wielded in a way contrary to its design; if you use a Ranged weapon to make a melee attack or throw a Melee weapon that lacks the Thrown property, the weapon counts as an improvised weapon. An improvised weapon follows the rules below. **Proficiency:** Don't add your Proficiency to attack rolls with an improvised weapon. **Damage:** On a hit, the weapon deals 1d4 damage of a type the DM thinks is appropriate for the object. **Range:** If you throw the weapon, it has a normal range of 20 feet and a long range of 60 feet. **Weapon Equivalents:** If an improvised weapon resembles a Simple or Martial weapon, the DM may say it functions as that weapon and uses that weapon's rules. For example, the DM could treat a table leg as a Club."
  },
  {
    "name": "Indifferent [Attitude]",
    "description": "An Indifferent creature has no desire to help or hinder you. Indifferent is the default attitude of a Monster."
  },
  {
    "name": "Initiative",
    "description": "Initiative determines the order of turns during combat. The combat rules in chapter 1 explain how to roll Initiative. Sometimes a DM might have combatants use their Initiative scores instead of rolling Initiative. Your Initiative score equals 10 plus your Dexterity modifier. If you have Advantage on Initiative rolls, increase your Initiative score by 5. If you have Disadvantage on those rolls, decrease that score by 5."
  },
  {
    "name": "Jumping",
    "description": "When you jump, you make either a Long Jump (horizontal) or a High Jump (vertical)."
  },
  {
    "name": "Knocking Out a Creature",
    "description": "When you would reduce a creature to 0 Hit Points with a melee attack, you can instead reduce the creature to 1 Hit Point. The creature then has the Unconscious condition and starts a Short Rest. The creature remains Unconscious until it regains any Hit Points or until someone uses an action to administer first aid to it, which requires a successful 10 Wisdom (Medicine) check."
  },
  {
    "name": "Lightly Obscured",
    "description": "You have Disadvantage on Wisdom (Perception) checks to see something in a Lightly Obscured space."
  },
  {
    "name": "Line [Area of Effect]",
    "description": "A Line is an area of effect that extends from a point of origin in a straight path along its length and covers an area defined by its width. The effect that creates a Line specifies its length and width. A Line's point of origin isn't included in the area of effect unless its creator decides otherwise."
  },
  {
    "name": "Long Jump",
    "description": "When you make a Long Jump, you leap horizontally a number of feet up to your Strength score if you move at least 10 feet immediately before the jump. When you make a standing Long Jump, you can leap only half that distance. Either way, each foot you jump costs a foot of movement. If you land in Difficult Terrain, you must succeed on a 10 Dexterity (Acrobatics) check or have the Prone condition. This Long Jump rule assumes that the height of the jump doesn't matter, such as a jump across a stream or chasm. At your DM's option, you must succeed on a 10 Strength (Athletics) check to clear a low obstacle (no taller than a quarter of the jump's distance), such as a hedge or low wall. Otherwise, you hit the obstacle."
  },
  {
    "name": "Long Rest",
    "description": "A Long Rest is a period of extended downtime—at least 8 hours—available to any creature. During a Long Rest, you sleep for at least 6 hours and perform no more than 2 hours of light activity, such as reading, talking, eating, or standing watch. During sleep, you have the Unconscious condition. After you finish a Long Rest, you must wait at least 16 hours before starting another one. **Benefits of the Rest:** To start a Long Rest, you must have at least 1 Hit Points. When you finish the rest, you gain the following benefits: **Regain All HP:** You regain all lost Hit Points and all spent Hit Point Dice. If your Hit Point maximum was reduced, it returns to normal. **Ability Scores Restored:** If any of your ability scores were reduced, they return to normal. **Exhaustion Reduced:** If you have the Exhaustion condition, its level decreases by 1. **Special Feature:** Some features are recharged by a Long Rest. If you have such a feature, it recharges in the way specified in its description. **Interrupting the Rest:** A Long Rest is stopped by the following interruptions: Rolling Initiative Casting a spell other than a cantrip Taking any damage. 1 hour of walking or other physical exertion. If you rested at least 1 hour before the interruption you gain the benefits of a Short Rest. You can resume a Long Rest immediately after an interruption. If you do so, the rest requires 1 additional hour per interruption to finish."
  },
  {
    "name": "Magical Effect",
    "description": "An effect is magical if it is created by a spell, a magic item, or a phenomenon that a rule labels as magical."
  },
  {
    "name": "Monster",
    "description": "A monster is a creature controlled by the DM, even if the creature is benevolent."
  },
  {
    "name": "Nonplayer Character",
    "description": "A nonplayer character (NPC) is a Monster that has a personal name and a distinct personality."
  },
  {
    "name": "Object",
    "description": "An object is a nonliving, distinct thing. Composite things, like buildings, comprise more than one object."
  },
  {
    "name": "Occupied Space",
    "description": "A space is occupied if a creature is in it or if it is completely filled by objects."
  },
  {
    "name": "Passive Perception",
    "description": "Passive Perception is a score that reflects a creature's general awareness of its surroundings. The DM uses this score when determining whether a creature notices something without consciously making a Wisdom (Perception) check. A creature's Passive Perception equals 10 plus the creature's Wisdom (Perception) check bonus. If the creature has Advantage on such checks, increase the score by 5. If the creature has Disadvantage on them, decrease the score by 5. For example, a level 1 character with a Wisdom of 15 and proficiency in Perception has a Passive Perception of 14 (10 + 2 + 2). If that character has Advantage on Wisdom (Perception) checks, the score becomes 10 + 2 + 2 + 5."
  },
  {
    "name": "Per Day",
    "description": "If a rule says you can use something a certain number of times per day, that means you must finish a Long Rest to use it again after you run out of uses."
  },
  {
    "name": "Player Character",
    "description": "A player character is a character controlled by a player."
  },
  {
    "name": "Possession",
    "description": "Some effects cause a creature to be possessed by another creature or entity. A possessing effect defines how the possession operates. Possession can be prevented by the Protection from Evil and Good spell and ended by the Dispel Evil and Good spell."
  },
  {
    "name": "Proficiency",
    "description": "If you have proficiency with something, you can add your Proficiency Bonus to any D20 Test you make using that thing. A creature might have proficiency in a skill or Saving Throw or with a weapon or tool."
  },
  {
    "name": "Reaction",
    "description": "A Reaction is a special action taken in response to a trigger defined in the Reaction's description. You can take a Reaction on another creature's turn, and if you take it on your turn, you can do so even if you also take an action, a Bonus Action, or both. Once you take a Reaction, you can't take another one until the start of your next turn. The Opportunity Attack is a Reaction available to all creatures."
  },
  {
    "name": "Resistance",
    "description": "If you have Resistance to a Damage Types, damage of that type is halved against you (round down). Resistance is applied only once to an instance of damage."
  },
  {
    "name": "Ritual",
    "description": "If you have a spell prepared that has the Ritual tag, you can cast that spell as a Ritual. The Ritual version of a spell takes 10 minutes longer to cast than normal. It also doesn't expend a spell slot, which means the ritual version of a spell can't be cast at a higher level."
  },
  {
    "name": "Round Down",
    "description": "Whenever you divide or multiply a number in the game, round down if you end up with a fraction, even if the fraction is one-half or greater. Some rules make an exception and tell you to round up."
  },
  {
    "name": "Save",
    "description": "Save is another name for a Saving Throw."
  },
  {
    "name": "Saving Throw",
    "description": "A saving throw—also called a save—represents an attempt to avoid or resist a threat. You normally make a saving throw only when a rule requires you to do so, but you can decide to fail the save without rolling. The result of a save is detailed in the effect that allowed it. If a target is forced to make a save and lacks the ability score used by it, the target automatically fails."
  },
  {
    "name": "Shape-Shifting",
    "description": "If an effect, such as Wild Shape or the Polymorph spell, lets you shape-shift, its description specifies what happens to you. Unless that description says otherwise, any ongoing effects on you—Condition, spells, curses, and the like—carry over from one form to the other. You revert to your true form if you die."
  },
  {
    "name": "Short Rest",
    "description": "A Short Rest is a 1-hour period of downtime, during which a creature does nothing more strenuous than reading, talking, eating, or standing watch. To start a Short Rest, you must have at least 1 Hit Points. **Benefits of the Rest:** When you finish the rest, you gain the following benefits: **Spend Hit Point Dice:** You can spend one or more of your Hit Point Dice to regain Hit Points. For each Hit Point Dice you spend in this way, roll the die and add your Constitution modifier to it. You regain Hit Points equal to the total (minimum of 1 Hit Point). You can decide to spend an additional Hit Point Dice after each roll. **Special Feature:** Some features are recharged by a Short Rest. If you have such a feature, it recharges in the way specified in its description. **Interrupting the Rest:** A Short Rest is stopped by the following interruptions: Rolling Initiative Casting a spell other than a cantrip Taking any damage An interrupted Short Rest confers no benefits."
  },
  {
    "name": "Simultaneous Effects",
    "description": "If two or more things happen at the same time on a turn, the person at the game table—player or DM whose turn it is decides the order in which those things happen. For example, if two effects occur at the start of a Player Character turn, the player decides which of the effects happens first."
  },
  {
    "name": "Size",
    "description": "A creature or an object belongs to a size category: Tiny, Small, Medium, Large, Huge, or Gargantuan. A creature's size determines how much space the creature occupies in combat. An object's size affects its Hit Points."
  },
  {
    "name": "Skill",
    "description": "A skill is an area of specialization associated with an ability check. If you have proficiency in a skill, you can add your Proficiency when you make an ability check associated with that skill."
  },
  {
    "name": "Speed",
    "description": "A creature has a Speed, which is the distance in feet the creature can cover when it moves on its turn. **Special Speeds:** Some creatures have special speeds, such as a Burrow Speed, Climb Speed, Fly Speed, or Swim Speed, each of which is defined in this glossary. If you have more than one speed, choose which one to use when you move; you can switch between the speeds during your move. Whenever you switch, subtract the distance already moved from the new speed. The result determines how much farther you can move. If the result is 0 or less, you can't use the new speed during the current move. For example, if you have a Speed of 30 and a Fly Speed of 40, you could fly 10 feet, walk 10 feet, and leap into the air to fly 20 feet more. **Changes to Your Speeds:** If an effect increases or decreases your Speed for a time, any special speed you have increases or decreases by an equal amount for the same duration. For example, if your Speed is reduced to 0 and you have a Climb Speed, your Climb Speed is also reduced to 0. Similarly, if your Speed is halved and you have a Fly Speed, your Fly Speed is also halved."
  },
  {
    "name": "Spell",
    "description": "A spell is a Magical Effect that has the characteristics described in chapter 7."
  },
  {
    "name": "Spell Attack",
    "description": "A spell attack is an attack roll made as part of a spell or another Magical Effect."
  },
  {
    "name": "Spellcasting Focus",
    "description": "A Spellcasting Focus is an object that certain creatures can use in place of a spell's Material components if those materials aren't consumed by the spell and don't have a cost specified. Some classes allow its members to use certain types of Spellcasting Focuses."
  },
  {
    "name": "Sphere [Area of Effect]",
    "description": "A Sphere is an area of effect that extends in straight lines from a point of origin outward in all directions. The effect that creates a Sphere specifies the distance it extends as the radius of the Sphere. A Sphere's point of origin is included in the Sphere's area of effect."
  },
  {
    "name": "Stable",
    "description": "A creature is Stable if it has 0 Hit Points but isn't required to make Death Saving Throw."
  },
  {
    "name": "Stat Block",
    "description": "A stat block contains the game statistics of a Monster. Each stat block includes the following information presented after the Monster name. **Size:** A Monster is Tiny, Small, Med ium, Large, Huge, or Gargantuan. **Creature Type:** This entry notes the family of beings a Monster belongs to, along with any descriptive tags. **Alignment:** An alignment is suggested for the Monster, with the DM determining its actual alignment. **AC, Initiative, and HP:** These entries give the Monster Armor Class, Initiative, and Hit Points, which are detailed in chapter 1. In parentheses after the Hit Points, the Monster Hit Point Dice are provided, along with the contribution of its Constitution, if any, to its Hit Points. Following the Initiative modifier is an Initiative score. Some creatures that are created by magic lack Hit Dice and Initiative information. **Speed:** Here the Monster Speed is provided, along with any special speeds. **Ability Scores:** A table provides the Monster ability scores, modifiers, and Saving Throw modifiers, all of which are detailed in chapter 1. **Skills:** This entry lists the Monster skill proficiencies, if any. **Resistances and Vulnerabilities:** These entries list the Monster Resistances and Vulnerabilities, if any. **Immunities:** This section lists the Monster damage and Condition Immunities, if any. **Gear:** If the Monster has any equipment that can be given away or retrieved, it's listed in this entry. **Senses:** This entry lists the Monster special senses, such as Darkvision, and its Passive Perception. **Languages:** This entry lists any languages the Monster knows. **CR:** Challenge Rating summarizes the threat a Monster poses and is detailed in the Monster Manual. The Experience Points characters receive for defeating a Monster and its Proficiency follow. Some creatures that are created by magic have no CR. **Traits:** The Monster traits, if any, are features that are active at all times or in certain situations. **Actions:** The Monster can take these actions in addition to those detailed in this glossary. **Bonus Actions:** If the Monster has Bonus Action options, they are listed in this section. **Reactions:** If the Monster can take special Reaction, those are listed in this section. **Attack Notation:** The entry for a Monster attack starts by identifying whether the attack is a melee or a ranged attack and then provides the attack roll's bonus, its reach or range, and what happens on a hit. An attack is against one target unless its entry says otherwise. **Saving Throw Effect Notation:** If an effect forces a Saving Throw, the effect's entry starts by identifying the kind of Saving Throw required and then provides the save's DC, a description of which creatures must make the save, and what happens on a failed or a successful save. **Damage Notation:** A stat block usually provides both a static number and a die expression for each instance of damage. For example, an attack might deal 4 (1d4 + 2) damage on a hit. The DM determines whether you use the static number or the die expression in parentheses; you don't use both."
  },
  {
    "name": "Swim Speed",
    "description": "A Swim Speed can be used to swim without expending the extra movement normally associated with swimming."
  },
  {
    "name": "Swimming",
    "description": "While you're swimming, each foot of movement costs 1 extra foot (2 extra feet in Difficult Terrain). You ignore this extra cost if you have a Swim Speed and use it to swim. At the DM's option, moving any distance in rough water might require a successful 15 Strength (Athletics) check."
  },
  {
    "name": "Target",
    "description": "A target is the creature or object targeted by an attack roll, forced to make a Saving Throw by an effect, or selected to receive the effects of a spell or another phenomenon."
  },
  {
    "name": "Telepathy",
    "description": "Telepathy is a magical ability that allows a creature to communicate mentally with another creature within a specified range. Unless a rule states otherwise, the contacted creature doesn't need to share a language with the telepath to understand this communication, but the contacted creature must be able to understand at least one language or be telepathic itself to understand. A telepath doesn't need to see a contacted creature, and the telepath can start or end the telepathic contact at any time (no action required). Telepathic contact can't be initiated and is immediately broken if either the telepath or the other creature has the Incapacitated condition. Telepathic contact is also broken if the contacted creature is no longer within the telepathy's range or if the telepath contacts a different creature within range. A creature without telepathy can receive telepathic messages but can't initiate a telepathic conversation. Once a telepathic conversation starts, the non-telepath can communicate mentally to the telepath until the telepathic connection ends."
  },
  {
    "name": "Teleportation",
    "description": "Teleportation is a special kind of magical transportation. If you teleport, you disappear and reappear elsewhere instantly, without moving through the intervening space. This transportation doesn't expend movement unless a rule tells you otherwise, and teleportation never provokes Opportunity Attack. When you teleport, all the equipment you're wearing and carrying teleports with you. If you're touching another creature when you teleport, that creature doesn't teleport with you unless the teleportation effect says otherwise. If the destination space of your teleportation is occupied by another creature or blocked by a solid obstacle, you instead appear in the nearest unoccupied space of your choice. The description of a teleportation effect tells you if you must see the teleportation's destination."
  },
  {
    "name": "Temporary Hit Points",
    "description": "Temporary Hit Points are granted by certain effects and act as a buffer against losing real Hit Points."
  },
  {
    "name": "Unarmed Strike",
    "description": "Instead of using a weapon to make a melee attack, you can use a punch, kick, head-butt, or similar forceful blow. In game terms, this is an Unarmed Strike—a melee attack that involves you using your body to damage, grapple, or shove a target within 5 feet of you. Whenever you use your Unarmed Strike, choose one of the following options for its effect. **Damage:** You make an attack roll against the target. Your bonus to the roll equals your Strength modifier plus your Proficiency. On a hit, the target takes Bludgeoning damage equal to 1 plus your Strength modifier. **Grapple:** The target must succeed on a Strength or Dexterity Saving Throw (it chooses which), or it has the Grappled condition. The DC for the Saving Throw and any escape attempts equals 8 plus your Strength modifier and Proficiency. This grapple is possible only if the target is no more than one size larger than you and if you have a hand free to grab it. **Shove:** The target must succeed on a Strength or Dexterity Saving Throw (it chooses which), or you either push it 5 feet away or cause it to have the Prone condition. The DC for the Saving Throw equals 8 plus your Strength modifier and Proficiency. This shove is possible only if the target is no more than one size larger than you."
  },
  {
    "name": "Unoccupied Space",
    "description": "A space is unoccupied if no creatures are in it and it isn't completely filled by objects."
  },
  {
    "name": "Vulnerability",
    "description": "If you have Vulnerability to a Damage Types, damage of that type is doubled against you. Vulnerability is applied only once to an instance of damage."
  },
  {
    "name": "Weapon",
    "description": "A weapon is an object that is in the Simple or Martial weapon category."
  },
  {
    "name": "Weapon Attack",
    "description": "A weapon attack is an attack roll made with a weapon."
  }
];
