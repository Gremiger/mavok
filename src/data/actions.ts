export interface ActionData {
  name: string;
  description: string;
}

export const ACTIONS: ActionData[] = [
  {
    "name": "Attack",
    "description": "When you take the Attack action, you can make one attack roll with a weapon or an Unarmed Strike. **Equipping and Unequipping Weapons:** You can either equip or unequip one weapon when you make an attack as part of this action. You do so either before or after the attack. If you equip a weapon before an attack, you don't need to use it for that attack. Equipping a weapon includes drawing it from a sheath or picking it up. Unequipping a weapon includes sheathing, stowing, or dropping it. **Moving Between Attacks:** If you move on your turn and have a feature, such as Extra Attack, that gives you more than one attack as part of the Attack action, you can use some or all of that movement to move between those attacks."
  },
  {
    "name": "Dash",
    "description": "When you take the Dash action, you gain extra movement for the current turn. The increase equals your Speed after applying any modifiers. With a Speed of 30 feet, for example, you can move up to 60 feet on your turn if you Dash. If your Speed of 30 feet is reduced to 15 feet, you can move up to 30 feet this turn if you Dash. If you have a special speed, such as a Fly Speed or Swim Speed, you can use that speed instead of your Speed when you take this action. You choose which speed to use each time you take it."
  },
  {
    "name": "Disengage",
    "description": "If you take the Disengage action, your movement doesn't provoke Opportunity Attack for the rest of the current turn."
  },
  {
    "name": "Dodge",
    "description": "lf you take the Dodge action, you gain the following benefits: until the start of your next turn, any attack roll made against you has Disadvantage if you can see the attacker, and you make Dexterity Saving Throw with Advantage. You lose these benefits if you have the Incapacitated condition or if your Speed is 0."
  },
  {
    "name": "Don or Doff a Shield",
    "description": "A Shield can be donned or doffed as an action."
  },
  {
    "name": "End Concentration",
    "description": "Some spells and other effects require Concentration to remain active, as specified in their descriptions. You can end Concentration at any time (no action required)."
  },
  {
    "name": "Escape a Grapple",
    "description": "A Grappled creature can use its action to make a Strength (Athletics) or Dexterity (Acrobatics) check against the grapple's escape DC, ending the Condition on itself on a success. The Condition also ends if the grappler has the Incapacitated condition or if the distance between the Grappled target and the grappler exceeds the grapple's range."
  },
  {
    "name": "Help",
    "description": "When you take the Help action, you do one of the following. **Assist an Ability Check:** Choose one of your skill or tool proficiencies and one ally who is near enough for you to assist verbally or physically when they make an ability check. That ally has Advantage on the next ability check they make with the chosen skill or tool. This benefit expires if the ally doesn't use it before the start of your next turn. The DM has final say on whether your assistance is possible. **Assist an Attack Roll:** You momentarily distract an enemy within 5 feet of you, giving Advantage to the next attack roll by one of your allies against that enemy. This benefit expires at the start of your next turn. Additionally, the Help action may be used to {@book stabilize a creature.}"
  },
  {
    "name": "Hide",
    "description": "With the Hide action, you try to conceal yourself. To do so, you must succeed on a 15 Dexterity (Stealth) check while you're Heavily Obscured or behind Cover, and you must be out of any enemy's line of sight; if you can see a creature, you can discern whether it can see you. On a successful check, you have the Invisible condition while hidden. Make note of your check's total, which is the DC for a creature to find you with a Wisdom (Perception) check. You stop being hidden immediately after any of the following occurs: you make a sound louder than a whisper, an enemy finds you, you make an attack roll, or you cast a spell with a Verbal component."
  },
  {
    "name": "Improvising an Action",
    "description": "Player characters and monsters can also do things not covered by other actions. Many class features and other abilities provide additional action options, and you can improvise other actions. When you describe an action not detailed elsewhere in the rules, the Dungeon Master tells you whether that action is possible and what kind of D20 Test you need to make, if any."
  },
  {
    "name": "Influence",
    "description": "With the Influence action, you urge a monster to do something. Describe or roleplay how you're communicating with the monster. Are you trying to deceive, intimidate, amuse, or gently persuade? The DM then determines whether the monster feels willing, unwilling, or hesitant due to your interaction; this determination establishes whether an ability check is necessary, as explained below. **Willing:** If your urging aligns with the monster's desires, no ability check is necessary; the monster fulfills your request in a way it prefers. **Unwilling:** If your urging is repugnant to the monster or counter to its alignment, no ability check is necessary; it doesn't comply. **Hesitant:** If you urge the monster to do something that it is hesitant to do, you must make an ability check, which is affected by the monster's attitude: Indifferent, Friendly, or Hostile, each of which is defined in this glossary. The Influence Checks table suggests which ability check to make based on how you're interacting with the monster. The DM chooses the check, which has a default DC equal to 15 or the monster's Intelligence score, whichever is higher. On a successful check, the monster does as urged. On a failed check, you must wait 24 hours (or a duration set by the DM) before urging it in the same way again."
  },
  {
    "name": "Magic",
    "description": "When you take the Magic action, you cast a spell that has a casting time of an action or use a feature or magic item that requires a Magic action to be activated. If you cast a spell that has a casting time of 1 minute or longer, you must take the Magic action on each turn of that casting, and you must maintain Concentration while you do so. If your Concentration is broken, the spell fails, but you don't expend a spell slot."
  },
  {
    "name": "Opportunity Attack",
    "description": "You can make an Opportunity Attack when a creature that you can see leaves your reach using its action, its Bonus Action, its Reaction, or one of its speeds. To make the Opportunity Attack, take a Reaction to make one melee attack with a weapon or an Unarmed Strike against the provoking creature. The attack occurs right before the creature leaves your reach."
  },
  {
    "name": "Ready",
    "description": "You take the Ready action to wait for a particular circumstance before you act. To do so, you take this action on your turn, which lets you act by taking a Reaction before the start of your next turn. First, you decide what perceivable circumstance will trigger your Reaction. Then, you choose the action you will take in response to that trigger, or you choose to move up to your Speed in response to it. Examples include \"If the cultist steps on the trapdoor, I'll pull the lever that opens it,\" and \"If the zombie steps next to me, I move away.\" When the trigger occurs, you can either take your Reaction right after the trigger finishes or ignore the trigger. When you Ready a spell, you cast it as normal (expending any resources used to cast it) but hold its energy, which you release with your Reaction when the trigger occurs. To be readied, a spell must have a casting time of an action, and holding on to the spell's magic requires Concentration, which you can maintain up to the start of your next turn. If your Concentration is broken, the spell dissipates without taking effect."
  },
  {
    "name": "Search",
    "description": "When you take the Search action, you make a Wisdom check to discern something that isn't obvious. The Search table suggests which skills are applicable when you take this action, depending on what you're trying to detect."
  },
  {
    "name": "Study",
    "description": "When you take the Study action, you make an Intelligence check to study your memory, a book, a clue, or another source of knowledge and call to mind an important piece of information about it. The Areas of Knowledge table suggests which skills are applicable to various areas of knowledge."
  },
  {
    "name": "Two-Weapon Fighting",
    "description": "When you take the Attack action on your turn and attack with a Light weapon, you can make one extra attack as a Bonus Action later on the same turn. That extra attack must be made with a different Light weapon, and you don't add your ability modifier to the extra attack's damage unless that modifier is negative. For example, you can attack with a Shortsword in one hand and a Dagger in the other using the Attack action and a Bonus Action, but you don't add your Strength or Dexterity modifier to the damage roll of the Bonus Action unless that modifier is negative."
  },
  {
    "name": "Utilize",
    "description": "You normally interact with an object while doing something else, such as when you draw a sword as part of the Attack action. When an object requires an action for its use, you take the Utilize action."
  }
];
