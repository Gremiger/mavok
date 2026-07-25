export interface MagicItemData {
  name: string;
  rarity: string;
  itemType: "weapon" | "armor" | "wondrous";
  requiresAttunement: boolean;
  description: string;
}

export const MAGIC_ITEMS: MagicItemData[] = [
  {
    "name": "+1 Rod of the Pact Keeper",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While holding this rod, you gain a +1 bonus to spell attack rolls and to the saving throw DCs of your Warlock spells. In addition, you can regain one spell slot as a Magic action while holding the rod. You can't use this property again until you finish a Long Rest."
  },
  {
    "name": "+1 Wand of the War Mage",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While holding this wand, you gain a +1 bonus to spell attack rolls. In addition, you ignore Cover when making a spell attack roll."
  },
  {
    "name": "+1 Wraps of Unarmed Power",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While wearing these wraps, you have a +1 bonus to attack rolls and damage rolls made with your Unarmed Strikes. Those strikes deal your choice of Force damage or their normal damage type."
  },
  {
    "name": "+2 Rod of the Pact Keeper",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While holding this rod, you gain a +2 bonus to spell attack rolls and to the saving throw DCs of your Warlock spells. In addition, you can regain one spell slot as a Magic action while holding the rod. You can't use this property again until you finish a Long Rest."
  },
  {
    "name": "+2 Wand of the War Mage",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While holding this wand, you gain a +2 bonus to spell attack rolls. In addition, you ignore Cover when making a spell attack roll."
  },
  {
    "name": "+2 Wraps of Unarmed Power",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While wearing these wraps, you have a +2 bonus to attack rolls and damage rolls made with your Unarmed Strikes. Those strikes deal your choice of Force damage or their normal damage type."
  },
  {
    "name": "+3 Rod of the Pact Keeper",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While holding this rod, you gain a +3 bonus to spell attack rolls and to the saving throw DCs of your Warlock spells. In addition, you can regain one spell slot as a Magic action while holding the rod. You can't use this property again until you finish a Long Rest."
  },
  {
    "name": "+3 Wand of the War Mage",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While holding this wand, you gain a +3 bonus to spell attack rolls. In addition, you ignore Cover when making a spell attack roll."
  },
  {
    "name": "+3 Wraps of Unarmed Power",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While wearing these wraps, you have a +3 bonus to attack rolls and damage rolls made with your Unarmed Strikes. Those strikes deal your choice of Force damage or their normal damage type."
  },
  {
    "name": "Alchemy Jug",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This ceramic jug appears to be able to hold a gallon of liquid and weighs 12 pounds whether full or empty. The jug sloshes when it is shaken, even if the jug is empty. You can take a Magic action and name one liquid from the Alchemy Jug Liquids table to cause the jug to produce the chosen liquid. Afterward, you can uncork the jug as a Utilize action and pour that liquid out, up to 2 gallons per minute. The maximum amount of liquid the jug can produce depends on the liquid you named. Once the jug starts producing a liquid, it can't produce a different one, or more of one that has reached its maximum, until the next dawn."
  },
  {
    "name": "Amulet of Health",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "Your Constitution score is 19 while you wear this amulet. It has no effect on you if your Constitution is already 19 or higher without it."
  },
  {
    "name": "Amulet of Proof against Detection and Location",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this amulet, you can't be targeted by Divination spells or perceived through magical scrying sensors unless you allow it."
  },
  {
    "name": "Amulet of the Planes",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this amulet, you can take a Magic action to name a location that you are familiar with on another plane of existence. Then make a 15 Intelligence (Arcana) check. On a successful check, you cast Plane Shift. On a failed check, you and each creature and object within 15 feet of you travel to a random destination determined by rolling 1d100 and consulting the following table."
  },
  {
    "name": "Animated Shield",
    "rarity": "very rare",
    "itemType": "armor",
    "requiresAttunement": true,
    "description": "While holding this Shield, you can take a Bonus Action to cause it to animate. The Shield leaps into the air and hovers in your space to protect you as if you were wielding it, leaving your hands free. The Shield remains animate for 1 minute, until you take a Bonus Action to end this effect, or until you die or have the Incapacitated condition, at which point the Shield falls to the ground or into your hand if you have one free."
  },
  {
    "name": "Apparatus of Kwalish",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This item first appears to be a sealed iron barrel weighing 500 pounds. The barrel has a hidden catch, which can be found with a successful 20 Intelligence (Investigation) check. Releasing the catch unlocks a hatch at one end of the barrel, allowing two Medium or smaller creatures to crawl inside. Ten levers are set in a row at the far end, each in a neutral position, able to move up or down. When certain levers are used, the apparatus transforms to resemble a giant lobster. The Apparatus of Kwalish is a Large object with the following statistics: AC 20; HP 200; Speed 30 ft., Swim 30 ft. (or 0 ft. for both if the legs aren't extended); Immunity to Poison and Psychic damage. To be used as a vehicle, the apparatus requires one pilot. While the apparatus's hatch is closed, the compartment is airtight and watertight. The compartment holds enough air for 10 hours of breathing, divided by the number of breathing creatures inside. The apparatus floats on water. It can also go underwater to a depth of 900 feet. Below that, the vehicle takes 2d6 Bludgeoning damage each minute from pressure. A creature in the compartment can take a Utilize action to move as many as two of the apparatus's levers up or down. After each use, a lever goes back to its neutral position. Each lever, from left to right, functions as shown in the Apparatus of Kwalish Levers table."
  },
  {
    "name": "Armor of Invulnerability",
    "rarity": "legendary",
    "itemType": "armor",
    "requiresAttunement": true,
    "description": "You have Resistance to Bludgeoning, Piercing, and Slashing damage while you wear this armor. **Metal Shell:** You can take a Magic action to give yourself Immunity to Bludgeoning, Piercing, and Slashing damage for 10 minutes or until you are no longer wearing the armor. Once this property is used, it can't be used again until the next dawn."
  },
  {
    "name": "Arrow-Catching Shield",
    "rarity": "rare",
    "itemType": "armor",
    "requiresAttunement": true,
    "description": "You gain a +2 bonus to Armor Class against ranged attack rolls while you wield this Shield. This bonus is in addition to the Shield's normal bonus to AC. Whenever an attacker makes a ranged attack roll against a target within 5 feet of you, you can take a Reaction to become the target of the attack instead."
  },
  {
    "name": "Axe of the Dwarvish Lords",
    "rarity": "artifact",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "A young dwarf prince set out to forge a weapon that would be regarded as a symbol of unity among his people. Venturing deep under the mountains, deeper than any dwarf had ever delved, the prince came to the blazing heart of a great volcano. With the aid of Moradin, a god of creation, he first crafted four mighty tools: the Starmetal Pick, the Earthheart Forge, the Anvil of Songs, and the Shaping Hammer. With these tools, he forged the Axe of the Dwarvish Lords. Armed with the Artifact, the prince brought peace to the dwarf clans, ending grudges and answering slights. The clans became allies, and they threw back their enemies and enjoyed an era of prosperity. This young dwarf is remembered as the First King. When he became old, he passed the weapon, which had become his badge of office, to his heir. The rightful inheritors passed the axe on for many generations. Later, in an era marked by treachery and wickedness, the axe was lost in a bloody civil war fomented by greed for its power and the status it bestowed. Centuries later, the dwarves still search for the axe, and many adventurers have made careers of chasing after rumors and plundering old vaults to find it. **Magic Weapon:** The Axe of the Dwarvish Lords is a magic weapon that grants a +3 bonus to attack rolls and damage rolls made with it. When you attack a creature with the axe and roll a 20 on the d20 for the attack roll, the axe deals an extra 20 Slashing damage. The axe has T with a normal range of 20 feet and a long range of 60 feet. When you hit with a ranged attack using this weapon, it deals an extra 1d8 Force damage, or an extra 2d8 Force damage if the target is a creature of the Giant type. Immediately after hitting or missing, the weapon flies back to your hand. **Blessings of Moradin:** While attuned to the axe, you gain the following benefits: **Darkvision:** You gain Darkvision with a range of 60 feet. If you already have Darkvision, its range increases by 60 feet. **Fortitude of Stone:** Your Constitution increases by 2, to a maximum of 20. **Gifts of the Creator:** You have proficiency with Brewer's Supplies, Mason's Tools, and Smith's Tools. **One with the Forge:** You have Immunity to Poison damage and Resistance to Fire damage. **Sunder:** When you hit an object with the axe, the object takes the maximum amount of damage possible. **Conjure Earth Elemental:** While holding the axe, you can take a Magic action to summon an Earth Elemental. It appears in an unoccupied space you choose within 30 feet of yourself, understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. The elemental disappears after 24 hours, when it dies, or when you dismiss it as a Bonus Action. You can't use this property again until the next dawn. **Random Properties:** The axe has the following random properties: 2 Artifact Properties; Minor Beneficial Properties properties 1 Artifact Properties; Major Beneficial Properties property 2 Artifact Properties; Minor Detrimental Properties properties **Travel the Depths:** You can take a Magic action to touch the axe to a fixed piece of dwarven stonework and cast Teleport from the axe. If your intended destination is underground, there is no chance of a mishap or arriving somewhere unexpected. You can't use this property again until 3 days have passed. **Destroying the Axe:** The only way to destroy the axe is to melt it down in the Earthheart Forge, where it was created. It must remain in the burning forge for 50 years before it finally succumbs to the fire and is consumed."
  },
  {
    "name": "Baba Yaga's Dancing Broom",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "The archfey Baba Yaga crafted many of these magic brooms. No two appear exactly alike. While holding the broom, you can take a Magic action to transform it into an Animated Broom under your control. The broom then moves into an unoccupied space as close to you as possible. The broom acts immediately after you on your Initiative count and remains animate until you take a Bonus Action and use a command word to render it inanimate. On your turn, you can mentally command the animated broom if it is within 30 feet of you and you don't have the Incapacitated condition (no action required). You decide what action the broom takes and where it moves during its next turn, or you can issue it a general command, such as to attack your enemies or guard a location. If the broom is reduced to 0 Hit Points, it shatters and is destroyed. If the broom reverts to its inanimate form before losing all its Hit Points it regains all of them."
  },
  {
    "name": "Bag of Beans",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This heavy cloth bag contains 3d4 dry beans when found. The bag weighs half a pound regardless of how many beans it contains and becomes a nonmagical item when it no longer contains any beans. If you dump one or more beans out of the bag, they explode in a 10-foot-radius Sphere [Area of Effect] centered on them. All the dumped beans are destroyed in the explosion, and each creature in the Sphere [Area of Effect], including you, makes a 15 Dexterity saving throw, taking 5d4 Force damage on a failed save or half as much damage on a successful one. If you remove a bean from the bag, plant it in dirt or sand, and then water it, the bean disappears as it produces an effect 1 minute later from the ground where it was planted. The DM can choose an effect from the following table or determine it randomly."
  },
  {
    "name": "Bag of Devouring",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This bag resembles a Bag of Holding but is a feeding orifice for a gigantic extradimensional creature. Turning the bag inside out closes the orifice. The extradimensional creature attached to the bag can sense whatever is placed inside the bag. Animal or vegetable matter placed wholly in the bag is devoured and lost forever. When part of a living creature is placed in the bag, as happens when someone reaches inside it, there is a 50 chance that the creature is pulled inside the bag. A creature inside the bag can take an action to try to escape, doing so with a successful 15 Strength (Athletics) check. Another creature can take an action to reach into the bag to pull a creature out, doing so with a successful 20 Strength (Athletics) check, provided the puller isn't pulled inside the bag first. Any creature that starts its turn inside the bag is devoured, its body destroyed. Inanimate objects can be stored in the bag, which can hold a cubic foot of such material. However, once each day, the bag swallows any objects inside it and spits them out into another plane of existence. The DM determines the time and plane. If the bag is pierced or torn, it is destroyed, and anything contained within it is transported to a random location on the Astral Plane."
  },
  {
    "name": "Bag of Holding",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This bag has an interior space considerably larger than its outside dimensions—roughly 2 feet square and 4 feet deep on the inside. The bag can hold up to 500 pounds, not exceeding a volume of 64 cubic feet. The bag weighs 5 pounds, regardless of its contents. Retrieving an item from the bag requires a Utilize action. If the bag is overloaded, pierced, or torn, it is destroyed, and its contents are scattered in the Astral Plane. If the bag is turned inside out, its contents spill forth unharmed, but the bag must be put right before it can be used again. The bag holds enough air for 10 minutes of breathing, divided by the number of breathing creatures inside. Placing a Bag of Holding inside an extradimensional space created by a Heward's Handy Haversack, Portable Hole, or similar item instantly destroys both items and opens a gate to the Astral Plane. The gate originates where the one item was placed inside the other. Any creature within a 10-foot-radius Sphere [Area of Effect] centered on the gate is sucked through it to a random location on the Astral Plane. The gate then closes. The gate is one-way and can't be reopened."
  },
  {
    "name": "Bag of Tricks, Gray",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This bag made from gray cloth appears empty. Reaching inside the bag, however, reveals the presence of a small, fuzzy object. You can take a Magic action to pull the fuzzy object from the bag and throw it up to 20 feet. When the object lands, it transforms into a creature you determine by rolling on the table below. See the Monster Manual for the creature's stat block. The creature vanishes at the next dawn or when it is reduced to 0 Hit Points. The creature is Friendly [Attitude] to you and your allies, and it acts immediately after you on your Initiative count. You can take a Bonus Action to command how the creature moves and what action it takes on its next turn, such as attacking an enemy. In the absence of such orders, the creature acts in a fashion appropriate to its nature. Once three fuzzy objects have been pulled from the bag, the bag can't be used again until the next dawn."
  },
  {
    "name": "Bag of Tricks, Rust",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This bag made from rust cloth appears empty. Reaching inside the bag, however, reveals the presence of a small, fuzzy object. You can take a Magic action to pull the fuzzy object from the bag and throw it up to 20 feet. When the object lands, it transforms into a creature you determine by rolling on the table below. See the Monster Manual for the creature's stat block. The creature vanishes at the next dawn or when it is reduced to 0 Hit Points. The creature is Friendly [Attitude] to you and your allies, and it acts immediately after you on your Initiative count. You can take a Bonus Action to command how the creature moves and what action it takes on its next turn, such as attacking an enemy. In the absence of such orders, the creature acts in a fashion appropriate to its nature. Once three fuzzy objects have been pulled from the bag, the bag can't be used again until the next dawn."
  },
  {
    "name": "Bag of Tricks, Tan",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This bag made from tan cloth appears empty. Reaching inside the bag, however, reveals the presence of a small, fuzzy object. You can take a Magic action to pull the fuzzy object from the bag and throw it up to 20 feet. When the object lands, it transforms into a creature you determine by rolling on the table below. See the Monster Manual for the creature's stat block. The creature vanishes at the next dawn or when it is reduced to 0 Hit Points. The creature is Friendly [Attitude] to you and your allies, and it acts immediately after you on your Initiative count. You can take a Bonus Action to command how the creature moves and what action it takes on its next turn, such as attacking an enemy. In the absence of such orders, the creature acts in a fashion appropriate to its nature. Once three fuzzy objects have been pulled from the bag, the bag can't be used again until the next dawn."
  },
  {
    "name": "Bead of Force",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This small black sphere measures 3/4 of an inch in diameter and weighs an ounce. Typically, 1d4 + 4 Beads of Force are found together. You can take a Magic action to throw the bead up to 60 feet. The bead explodes in a 10-foot-radius Sphere [Area of Effect] on impact and is destroyed. Each creature in the Sphere [Area of Effect] must succeed on a 15 Dexterity saving throw or take 5d4 Force damage. A sphere of transparent force then encloses the area for 1 minute. Any creature that failed the save and is completely within the area is trapped inside this sphere. Creatures that succeeded on the save or are partially within the area are pushed away from the center of the sphere until they are no longer inside it. Only breathable air can pass through the sphere's wall. No attack or other effect can pass through. An enclosed creature can take a Utilize action to push against the sphere's wall, moving the sphere up to half the creature's Speed. The sphere can be picked up, and its magic causes it to weigh only 1 pound, regardless of the weight of creatures inside."
  },
  {
    "name": "Bead of Nourishment",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This flavorless, gelatinous bead dissolves on your tongue and provides as much nourishment as 1 day of Rations."
  },
  {
    "name": "Bead of Refreshment",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This flavorless, gelatinous bead dissolves in liquid, transforming up to a pint of the liquid into fresh, cold drinking water. The bead has no effect on magical liquids or harmful substances such as poison."
  },
  {
    "name": "Belt of Cloud Giant Strength",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this belt, your Strength score changes to 27. The item has no effect on you if your Strength without the belt is equal to or greater than the belt's score."
  },
  {
    "name": "Belt of Dwarvenkind",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this belt, you gain the following benefits: **Dwarvish:** You know Dwarvish. **Friend of Dwarvenkind:** You have Advantage on Charisma (Persuasion) checks made to interact with dwarves and duergar. **Toughness:** Your Constitution increases by 2, to a maximum of 20. In addition, while attuned to the belt, you have a 50 chance each day at dawn of growing a full beard if you can grow one, or a thicker beard if you already have one. If you aren't a dwarf or duergar, you gain the following additional benefits while wearing the belt: **Darkvision:** You have Darkvision with a range of 60 feet. **Resilience:** You have Resistance to Poison damage. You also have Advantage on saving throws you make to avoid or end the Poisoned condition."
  },
  {
    "name": "Belt of Fire Giant Strength",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this belt, your Strength score changes to 25. The item has no effect on you if your Strength without the belt is equal to or greater than the belt's score."
  },
  {
    "name": "Belt of Frost Giant Strength",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this belt, your Strength score changes to 23. The item has no effect on you if your Strength without the belt is equal to or greater than the belt's score."
  },
  {
    "name": "Belt of Hill Giant Strength",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this belt, your Strength score changes to 21. The item has no effect on you if your Strength without the belt is equal to or greater than the belt's score."
  },
  {
    "name": "Belt of Stone Giant Strength",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this belt, your Strength score changes to 23. The item has no effect on you if your Strength without the belt is equal to or greater than the belt's score."
  },
  {
    "name": "Belt of Storm Giant Strength",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this belt, your Strength score changes to 29. The item has no effect on you if your Strength without the belt is equal to or greater than the belt's score."
  },
  {
    "name": "Black Dragon Scale Mail",
    "rarity": "very rare",
    "itemType": "armor",
    "requiresAttunement": true,
    "description": "{#itemEntry Dragon Scale Mail|XDMG}"
  },
  {
    "name": "Blackrazor",
    "rarity": "artifact",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "Hidden in the dungeon of White Plume Mountain, Blackrazor shines like a piece of night sky filled with stars. Its black scabbard is decorated with pieces of cut obsidian. You gain a +3 bonus to attack rolls and damage rolls made with this magic weapon. If you hit an Undead with this weapon, you take 1d10 Necrotic damage, and the target regains 1d10 Hit Points. If this Necrotic damage reduces you to 0 Hit Points, Blackrazor devours your soul (see \"Devour Soul\" below). While you hold this weapon, you have Immunity to the Charmed and Frightened conditions, and you have Blindsight with a range of 30 feet. **Devour Soul:** Whenever you use Blackrazor to reduce a creature to 0 Hit Points, the sword slays the creature and devours its soul unless it is a Construct or an Undead. A creature whose soul has been devoured by Blackrazor can be restored to life only by a Wish spell. When Blackrazor devours a soul that isn't yours, you gain Temporary Hit Points equal to the slain creature's Hit Points maximum. **Haste:** Blackrazor can cast Haste on you, after which it can't cast this spell again until the next dawn. Blackrazor decides when to cast the spell, which takes effect at the start of your turn. The spell lasts for 1 minute (no Concentration required) or until Blackrazor decides to end it, which it can do at the end of any of your turns. **Sentience:** Blackrazor is a sentient Chaotic Neutral weapon with an Intelligence of 17, a Wisdom of 10, and a Charisma of 19. It has hearing and Darkvision out to 120 feet. The weapon speaks Common and can communicate with its wielder telepathically. Its voice is deep and echoing. While you are attuned to it, Blackrazor also understands every language you know. **Personality:** Blackrazor speaks with an imperious tone, as though accustomed to being obeyed.The sword's purpose is to consume souls. It doesn't care whose souls it eats, including the wielder's. The sword believes that all matter and energy sprang from a void of negative energy and will one day return to it. Blackrazor is meant to hurry that process along. Despite its nihilism, Blackrazor feels a strange kinship to Wave and Whelm, two other weapons locked away under White Plume Mountain. It wants the three weapons to be reunited and wielded together in combat, even though it violently disagrees with Whelm and finds Wave tedious. Blackrazor's hunger for souls must be regularly fed. If the sword goes 3 days or more without consuming a soul, a conflict between it and its wielder occurs at the next sunset. **Destroying Blackrazor:** Blackrazor can be destroyed by crushing it in the great gears of Mechanus. Primus, the creator of the modrons, also knows a series of musical tones that Blackrazor can't stand to hear, causing the sword to shatter."
  },
  {
    "name": "Blue Dragon Scale Mail",
    "rarity": "very rare",
    "itemType": "armor",
    "requiresAttunement": true,
    "description": "{#itemEntry Dragon Scale Mail|XDMG}"
  },
  {
    "name": "Book of Exalted Deeds",
    "rarity": "artifact",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "The definitive treatise on all that is good in the multiverse, the Book of Exalted Deeds figures prominently in many religions. Rather than being a scripture devoted to a particular faith, the book's authors filled the pages with their own visions of true virtue, providing guidance for defeating evil. The Book of Exalted Deeds rarely lingers in one place. As soon as the book is read, it vanishes to some other corner of the multiverse where its moral guidance can bring hope to an endangered world. Although attempts have been made to copy the work, efforts to do so fail to capture its magical nature or translate the benefits it offers to those pure of heart and firm of purpose. A heavy clasp, wrought to look like angel wings, keeps the book's contents secure. Only a creature that is attuned to the book can release the clasp that holds it shut. Once the book is opened, the attuned creature must spend 80 hours reading and studying the book to digest its contents and gain its benefits. Other creatures that peruse the book's open pages can read the text but glean no deeper meaning and reap no benefits. A Fiend, an Undead, or a servant of a god from the Lower Planes that tries to read from the book takes 24d6 Radiant damage. This damage ignores Resistance and Immunity, and it can't be reduced or avoided by any means. A creature reduced to 0 Hit Points by this damage disappears in a flash and is destroyed, leaving its possessions behind. The book then vanishes, and the creature's Attunement to it ends. Benefits granted by the Book of Exalted Deeds last only as long as you strive to do good. If you fail to perform at least one act of kindness or generosity within the span of 10 days, or if you willingly perform an evil act, you lose all the benefits granted by the book. **Celestial Calm:** While attuned to the book, you have Immunity to the Charmed and Frightened conditions and Resistance to Psychic damage. These benefits become permanent after you spend the requisite amount of time reading and studying the book. **Divine Wisdom:** After you spend the requisite amount of time reading and studying the book, your Wisdom increases by 2, to a maximum of 24. You can't gain this benefit from the book more than once. **Enlightened Magic:** After you spend the requisite amount of time reading and studying the book, any spell slot you expend to cast a spell counts as a spell slot of one level higher. **Halo:** After you spend the requisite amount of time reading and studying the book, you gain a protective halo. This halo sheds Bright Light in a 10-foot radius and Dim Light for an additional 10 feet. You can dismiss or manifest the halo as a Bonus Action. While present, the halo gives you Advantage on Charisma (Persuasion) checks. In addition, Fiends and Undead within the halo's Bright Light make attack rolls against you with Disadvantage. **Random Properties:** The Book of Exalted Deeds has the following random properties: 2 Artifact Properties; Minor Beneficial Properties properties 2 Artifact Properties; Major Beneficial Properties properties **Destroying the Book:** The Book of Exalted Deeds can't be destroyed. However, drowning the book in the River Styx removes all writing and imagery from its pages and renders the book powerless for 1d100 years."
  },
  {
    "name": "Book of Vile Darkness",
    "rarity": "artifact",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "The contents of this foul manuscript are the meat and drink of the wicked. It contains knowledge so horrid that to even glimpse the scrawled pages invites doom. Most believe the lich-god Vecna authored the Book of Vile Darkness. He recorded in its pages every horrid idea, every corrupt thought, and every example of foul magic he came across or devised. Other practitioners of evil have added their own input to the book's catalog of vile knowledge. Their additions are clear, for the writers of later works stitched whatever they were writing into the tome or, in some cases, made notations and additions to existing text. There are places where pages are missing, torn, or covered so completely with ink, blood, and scratches that the original text can't be divined. Nature can't abide the book's presence. Ordinary plants wither in its presence, common animals are unwilling to approach it, and the book gradually destroys whatever it touches. Even stone cracks and turns to powder if the book rests on it long enough. Whenever a creature that isn't a Fiend or an Undead attunes to the Book of Vile Darkness, that creature makes a 17 Charisma saving throw. On a failed save, the creature is magically transformed into a Larva under the DM's control. Only a Wish spell can reverse this vile transformation. A creature attuned to the book must spend 80 hours reading and studying it to digest its contents and use its Adjusted Ability Scores, Tireless Form, Spells, Vile Lore, and Vile Speech properties. The Book of Vile Darkness remains with you only as long as you strive to work evil in the world. If you fail to perform at least one evil act within the span of 10 days, or if you willingly perform a good act, the book disappears, your Attunement to it ends immediately, and you lose all benefits granted by it. If you die while attuned to the book, an entity of great evil claims your soul. You can't be restored to life by any means while your soul remains imprisoned. **Adjusted Ability Scores:** One ability score of your choice increases by 2, to a maximum of 24. Another ability score of your choice decreases by 2, to a minimum of 3. The book can't adjust your ability scores again. **Tireless Form:** While the book is on your person, you have Immunity to the Exhaustion condition. **Random Properties:** The Book of Vile Darkness has the following random properties: 3 Artifact Properties; Minor Beneficial Properties properties 1 Artifact Properties; Major Beneficial Properties property 3 Artifact Properties; Minor Detrimental Properties properties 2 Artifact Properties; Major Detrimental Properties properties **Spells:** While holding the book and holding it, you can cast the following spells (save 18) from it: Animate Dead Circle of Death Dominate Monster Finger of Death Once you use the book to cast a spell, you can't cast that spell again from it until the next dawn. **Vile Lore:** You can reference the Book of Vile Darkness whenever you make an Intelligence check to recall information about some aspect of evil, such as lore about demons. When you do so, you have Advantage on that check. At the DM's discretion, the book might reveal secrets no mortal should know, such as the true names of powerful Fiends, foul rites that allow one to transform into a death knight or lich, or long-lost spells crafted by beings so evil their names ought never to be spoken aloud. **Vile Speech:** While the book is on your person, you can take a Magic action to recite words from its pages in a foul, dead language. Each time you do so, you take 1d12 Psychic damage, and each creature within 15 feet of you takes 3d6 Psychic damage unless the creature is a Fiend or an Undead. **Destroying the Book:** The Book of Vile Darkness allows pages to be torn from it, but any evil lore contained on those pages finds its way back into the book eventually, usually when a new author adds pages to the tome. If a solar tears the book in two, the book is destroyed for 1d100 years, after which it re-forms in some far corner of the multiverse. A creature attuned to the book for 100 years can unearth a phrase hidden in the original text that, when translated to Celestial and spoken aloud, destroys both the speaker and the book in a flash of radiance. However, as long as evil exists in the multiverse, the book re-forms 1d10 × 100 years later."
  },
  {
    "name": "Boots of Elvenkind",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While you wear these boots, your steps make no sound, regardless of the surface you are moving across. You also have Advantage on Dexterity (Stealth) checks."
  },
  {
    "name": "Boots of False Tracks",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While wearing these boots, you can have them leave tracks like those of any kind of Humanoid of your size."
  },
  {
    "name": "Boots of Levitation",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While you wear these boots, you can cast Levitate on yourself."
  },
  {
    "name": "Boots of Speed",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While you wear these boots, you can take a Bonus Action to click the boots' heels together. If you do, the boots double your Speed, and any creature that makes an Opportunity Attack against you has Disadvantage on the attack roll. If you click your heels together again, you end the effect. When you've used the boots' property for a total of 10 minutes, the magic ceases to function for you until you finish a Long Rest."
  },
  {
    "name": "Boots of Striding and Springing",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While you wear these boots, your Speed becomes 30 feet unless your Speed is higher, and your Speed isn't reduced by you carrying weight in excess of your carrying capacity or wearing Heavy Armor. Once on each of your turns, you can jump up to 30 feet by spending only 10 feet of movement."
  },
  {
    "name": "Boots of the Winterlands",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "These furred boots are snug and feel warm. While wearing them, you gain the following benefits. **Cold Resistance:** You have Resistance to Cold damage and can tolerate temperatures of 0 degrees Fahrenheit or lower without any additional protection. **Winter Strider:** You ignore Difficult Terrain created by ice or snow."
  },
  {
    "name": "Bowl of Commanding Water Elementals",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While this bowl is filled with water and you are within 5 feet of it, you can take a Magic action to summon a Water Elemental. The elemental appears in an unoccupied space as close to the bowl as possible, understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. The elemental disappears after 1 hour, when it dies, or when you dismiss it as a Bonus Action. The bowl can't be used this way again until the next dawn. The bowl is about 1 foot in diameter and half as deep. It holds about 3 gallons."
  },
  {
    "name": "Bracers of Archery",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing these bracers, you have proficiency with the Longbow and Shortbow, and you gain a +2 bonus to damage rolls made with such weapons."
  },
  {
    "name": "Bracers of Defense",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing these bracers, you gain a +2 bonus to Armor Class if you are wearing no armor and using no Shield."
  },
  {
    "name": "Brass Dragon Scale Mail",
    "rarity": "very rare",
    "itemType": "armor",
    "requiresAttunement": true,
    "description": "{#itemEntry Dragon Scale Mail|XDMG}"
  },
  {
    "name": "Brazier of Commanding Fire Elementals",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While you are within 5 feet of this brazier, you can take a Magic action to summon a Fire Elemental. The elemental appears in an unoccupied space as close to the brazier as possible, understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. The elemental disappears after 1 hour, when it dies, or when you dismiss it as a Bonus Action. The brazier can't be used this way again until the next dawn."
  },
  {
    "name": "Bronze Dragon Scale Mail",
    "rarity": "very rare",
    "itemType": "armor",
    "requiresAttunement": true,
    "description": "{#itemEntry Dragon Scale Mail|XDMG}"
  },
  {
    "name": "Brooch of Shielding",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this brooch, you have Resistance to Force damage, and you have Immunity to damage from the Magic Missile spell."
  },
  {
    "name": "Broom of Flying",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This wooden broom functions like a mundane broom until you stand astride it and take a Magic action to make it hover beneath you, at which time it can be ridden in the air. It has a Fly Speed of 50 feet. It can carry up to 400 pounds, but its Fly Speed becomes 30 feet while carrying over 200 pounds. The broom stops hovering when you land or when you're no longer riding it. As a Magic action, you can send the broom to travel alone to a destination within 1 mile of you if you name the location and are familiar with it. The broom comes back to you when you take a Magic action and use a command word if the broom is still within 1 mile of you."
  },
  {
    "name": "Candle of Invocation",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This candle's magic is activated when the candle is lit, which requires a Magic action. After burning for 4 hours, the candle is destroyed. You can snuff it out early for use at a later time. Deduct the time it burned in increments of 1 minute from its total burn time. While lit, the candle sheds Dim Light in a 30-foot radius. While you are within that light, you have Advantage on D20 Test. In addition, a Cleric or Druid in the light can cast level 1 spells they have prepared without expending spell slots. Alternatively, when you light the candle for the first time, you can cast Gate with it. Doing so destroys the candle. The portal created by the spell links to a particular Outer Plane chosen by the DM or determined by rolling on the following table."
  },
  {
    "name": "Candle of the Deep",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "The flame of this candle isn't extinguished when immersed in water. It gives off light and heat like a normal candle."
  },
  {
    "name": "Cap of Water Breathing",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While wearing this cap underwater, you can take a Magic action to create a bubble of air around your head. This bubble allows you to breathe normally underwater. This bubble stays with you until the cap is removed or you are no longer underwater."
  },
  {
    "name": "Cape of the Mountebank",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This cape smells faintly of brimstone. While wearing it, you can use it to cast Dimension Door as a Magic action. This property can't be used again until the next dawn. When you teleport with that spell, you leave behind a cloud of smoke. The space you left is Lightly Obscured by that smoke until the end of your next turn."
  },
  {
    "name": "Carpet of Flying, 3 ft. × 5 ft.",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "You can make this carpet hover and fly by taking a Magic action and using the carpet's command word. It moves according to your directions if you are within 30 feet of it. A 3 ft. × 5 ft. carpet can carry up to 200 lb. at a fly speed of 80 feet. A carpet can carry up to twice the weight shown on the table, but its Fly Speed is halved if it carries more than its normal capacity."
  },
  {
    "name": "Carpet of Flying, 4 ft. × 6 ft.",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "You can make this carpet hover and fly by taking a Magic action and using the carpet's command word. It moves according to your directions if you are within 30 feet of it. A 4 ft. × 6 ft. carpet can carry up to 400 lb. at a fly speed of 60 feet. A carpet can carry up to twice the weight shown on the table, but its Fly Speed is halved if it carries more than its normal capacity."
  },
  {
    "name": "Carpet of Flying, 5 ft. × 7 ft.",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "You can make this carpet hover and fly by taking a Magic action and using the carpet's command word. It moves according to your directions if you are within 30 feet of it. A 5 ft. × 7 ft. carpet can carry up to 600 lb. at a fly speed of 40 feet. A carpet can carry up to twice the weight shown on the table, but its Fly Speed is halved if it carries more than its normal capacity."
  },
  {
    "name": "Carpet of Flying, 6 ft. × 9 ft.",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "You can make this carpet hover and fly by taking a Magic action and using the carpet's command word. It moves according to your directions if you are within 30 feet of it. A 6 ft. × 9 ft. carpet can carry up to 800 lb. at a fly speed of 30 feet. A carpet can carry up to twice the weight shown on the table, but its Fly Speed is halved if it carries more than its normal capacity."
  },
  {
    "name": "Cauldron of Rebirth",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This Tiny pot bears relief scenes of heroes on its cast-iron sides. You can use the cauldron as a Spellcasting Focus for your spells, and it functions as a suitable component for the Scrying spell. **Brew Potion:** When you finish a Long Rest, you can use the cauldron to create a Potion of Greater Healing, which takes 1 minute. The potion lasts for 24 hours, then loses its magic if not consumed. **Raise Dead:** As a Magic action, you can cause the cauldron to grow large enough for a Medium creature to crouch within. You can revert the cauldron to its normal size as a Magic action, harmlessly shunting anything that can't fit inside to the nearest unoccupied space. If you place the corpse of a Humanoid into the cauldron and cover the corpse with 200 pounds of salt (which costs 10 GP) for at least 8 hours, the salt is consumed and the creature returns to life as if by Raise Dead at the next dawn. Once used, this property can't be used again for 7 days."
  },
  {
    "name": "Censer of Controlling Air Elementals",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While gently swinging this censer, you can take a Magic action to summon an Air Elemental. The elemental appears in an unoccupied space as close to the censer as possible, understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. The elemental disappears after 1 hour, when it dies, or when you dismiss it as a Bonus Action. The censer can't be used this way again until the next dawn."
  },
  {
    "name": "Charlatan's Die",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "Whenever you roll this six-sided die, you can control which number it rolls."
  },
  {
    "name": "Chime of Opening",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This hollow metal tube measures about 1 foot long and weighs 1 pound. As a Magic action, you can strike the chime to cast Knock. The spell's customary knocking sound is replaced by the clear, ringing tone of the chime, which is audible out to 300 feet. The chime can be used 10 times. After the tenth time, it cracks and becomes useless."
  },
  {
    "name": "Circlet of Blasting",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While wearing this circlet, you can cast Scorching Ray with it (5 to hit). The circlet can't cast this spell again until the next dawn."
  },
  {
    "name": "Cloak of Arachnida",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This fine garment is made of black silk interwoven with faint, silvery threads. While wearing it, you gain the following benefits. **Poison Resistance:** You have Resistance to Poison damage. **Spider Climb:** You have a Climb Speed equal to your Speed and can move up, down, and across vertical surfaces and along ceilings, while leaving your hands free. **Spider Walk:** You can't be caught in webs of any sort and can move through webs as if they were Difficult Terrain. **Web:** You can cast Web (save 13). The web created by the spell fills twice its normal area. Once used, this property can't be used again until the next dawn."
  },
  {
    "name": "Cloak of Billowing",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While wearing this cloak, you can take a Bonus Action to make it billow dramatically for 1 minute."
  },
  {
    "name": "Cloak of Displacement",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While you wear this cloak, it magically projects an illusion that makes you appear to be standing in a place near your actual location, causing any creature to have Disadvantage on attack rolls against you. If you take damage, the property ceases to function until the start of your next turn. This property is suppressed while your Speed is 0."
  },
  {
    "name": "Cloak of Elvenkind",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While you wear this cloak, Wisdom (Perception) checks made to perceive you have Disadvantage, and you have Advantage on Dexterity (Stealth) checks."
  },
  {
    "name": "Cloak of Invisibility",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This cloak has 3 charges and regains 1d3 expended charges daily at dawn. While wearing the cloak, you can take a Magic action to pull its hood over your head and expend 1 charge to give yourself the Invisible condition for 1 hour. The effect ends early if you pull the hood down (no action required) or cease wearing the hood."
  },
  {
    "name": "Cloak of Many Fashions",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While wearing this cloak, you can take a Bonus Action to change the style, color, and apparent quality of the garment. The cloak's weight doesn't change. Regardless of its appearance, the cloak can't be anything but a cloak. Although it can duplicate the appearance of other magic cloaks, it doesn't gain their magical properties."
  },
  {
    "name": "Cloak of Protection",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "You gain a +1 bonus to Armor Class and saving throws while you wear this cloak."
  },
  {
    "name": "Cloak of the Bat",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this cloak, you have Advantage on Dexterity (Stealth) checks. In an area of Dim Light or Darkness, you can grip the edges of the cloak and use it to gain a Fly Speed of 40 feet. If you ever fail to grip the cloak's edges while flying in this way, or if you are no longer in Dim Light or Darkness, you lose this Fly Speed. While wearing the cloak in an area of Dim Light or Darkness, you can cast Polymorph on yourself, shape-shifting into a Bat. While in that form, you retain your Intelligence, Wisdom, and Charisma scores. The cloak can't be used this way again until the next dawn."
  },
  {
    "name": "Cloak of the Manta Ray",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this cloak, you can breathe underwater, and you have a Swim Speed of 60 feet."
  },
  {
    "name": "Clockwork Amulet",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This copper amulet contains tiny interlocking gears and is powered by magic from Mechanus, a plane of clockwork predictability. Faint ticking and whirring noises emanate from within. When you make an attack roll while wearing the amulet, you can forgo rolling the d20 to get a 10 on the die. Once used, this property can't be used again until the next dawn."
  },
  {
    "name": "Clothes of Mending",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This elegant outfit magically mends itself to counteract daily wear and tear. Pieces of the outfit that are destroyed can't be repaired in this way."
  },
  {
    "name": "Copper Dragon Scale Mail",
    "rarity": "very rare",
    "itemType": "armor",
    "requiresAttunement": true,
    "description": "{#itemEntry Dragon Scale Mail|XDMG}"
  },
  {
    "name": "Crystal Ball",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "The typical crystal ball, a very rare item, is about 6 inches in diameter. While touching it, you can cast the Scrying spell (save 17) with it."
  },
  {
    "name": "Crystal Ball of Mind Reading",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While touching this crystal orb, you can cast Scrying (save 17) with it. In addition, you can cast Detect Thoughts (save 17) targeting creatures you can see within 30 feet of the spell's sensor. You don't need to concentrate on this Detect Thoughts spell to maintain it during its duration, but it ends if the Scrying spell ends."
  },
  {
    "name": "Crystal Ball of Telepathy",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While touching this crystal orb, you can cast Scrying (save 17) with it. In addition, you can communicate telepathically with creatures you can see within 30 feet of the spell's sensor. You can also cast Suggestion (save 17) through the sensor on one of those creatures. You don't need to concentrate on this Suggestion to maintain it during its duration, but it ends if Scrying ends. You can't cast Suggestion in this way again until the next dawn."
  },
  {
    "name": "Crystal Ball of True Seeing",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While touching this crystal orb, you can cast Scrying (save 17) with it. In addition, you have Truesight with a range of 120 feet centered on the spell's sensor."
  },
  {
    "name": "Cube of Force",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This cube is about an inch across. Each face has a distinct marking on it. You can press one of those faces, expend the number of charges required for it, and thereby cast the spell associated with it (save 17), as shown in the Cube of Force Faces table. The cube starts with 10 charges, and it regains 1d6 expended charges daily at dawn."
  },
  {
    "name": "Cube of Summoning",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This Tiny cube looks like a jack-in-the-box. When you wind its crank as a Magic action, a merry tune emits from the box, the lid pops open, a creature appears in the nearest unoccupied space, and the lid closes. The lid can't otherwise be opened. Roll on the Cube of Summoning table to determine which spell the cube casts to summon the creature. The spell is cast at level 5 (save 17, +9 attack bonus) and doesn't require Concentration, but you otherwise function as the spell's caster. Once the cube summons a creature, the cube can't do so again until the next dawn."
  },
  {
    "name": "Cubic Gate",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This cube is 3 inches across and radiates palpable magical energy. The six sides of the cube are each keyed to a different plane of existence, one of which is the Material Plane. The other sides are linked to planes determined by the DM. The cube has 3 charges and regains 1d3 expended charges daily at dawn. As a Magic action, you can expend 1 of the cube's charges to cast one of the following spells using the cube. **Gate:** Pressing one side of the cube, you cast Gate, opening a portal to the plane of existence keyed to that side. **Plane Shift:** Pressing one side of the cube twice, you cast Plane Shift, transporting the targets to the plane of existence keyed to that side."
  },
  {
    "name": "Daern's Instant Fortress",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "As a Magic action, you can place this 1-inch adamantine statuette on the ground and, using a command word, cause it to grow rapidly into a square adamantine tower. Repeating the command word causes the tower to revert to statuette form, which works only if the tower is empty. Each creature in the area where the tower appears is pushed to an unoccupied space outside but next to the tower. Objects in the area that aren't being worn or carried are also pushed clear of the tower. The tower is 20 feet on a side and 30 feet high, with arrow slits on all sides and a battlement atop it. Its interior is divided into two floors, with a ladder, staircase, or ramp (your choice) connecting them. This ladder, staircase, or ramp ends at a trapdoor leading to the roof. When created, the tower has a single door at ground level on the side facing you. The door opens only at your command, which you can issue as a Bonus Action. It is immune to the Knock spell and similar magic. Magic prevents the tower from being tipped over. The roof, the door, and the walls each have AC 20; HP 100; Immunity to Bludgeoning, Piercing, and Slashing damage except that which is dealt by siege equipment; and Resistance to all other damage. Shrinking the tower back down to statuette form doesn't repair damage to the tower. Only a Wish spell can repair the tower (this use of the spell counts as replicating a spell of level 8 or lower). Each casting of Wish causes the tower to regain all its Hit Points."
  },
  {
    "name": "Dagger of Venom",
    "rarity": "rare",
    "itemType": "weapon",
    "requiresAttunement": false,
    "description": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon. You can take a Bonus Action to magically coat the blade with poison. The poison remains for 1 minute or until an attack using this weapon hits a creature. That creature must succeed on a 15 Constitution saving throw or take 2d10 Poison damage and have the Poisoned condition for 1 minute. The weapon can't be used this way again until the next dawn."
  },
  {
    "name": "Dark Shard Amulet",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This amulet is fashioned from a shard of resilient material originating from an otherworldly realm. While you are wearing it, you gain the following benefits. **Spellcasting Focus:** You can use the amulet as a Spellcasting Focus for your Warlock spells. **Unknown Spell:** As a Magic action, you can try to cast a cantrip that you don't know. The cantrip must be on the Warlock spell list and have a casting time of an action, and you make a 10 Intelligence (Arcana) check. On a successful check, you cast the spell. On a failed check, the spell fails, and the action used to cast it is wasted. In either case, you can't use this property again until you finish a Long Rest."
  },
  {
    "name": "Decanter of Endless Water",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This stoppered flask sloshes when shaken, as if it contains water. The decanter weighs 2 pounds. You can take a Magic action to remove the stopper and issue one of three command words, whereupon an amount of fresh water or salt water (your choice) pours out of the flask. The water stops pouring out at the start of your next turn. Choose from the following command words: **Splash:** The decanter produces 1 gallon of water. **Fountain:** The decanter produces 5 gallons of water. **Geyser:** The decanter produces 30 gallons of water that gushes forth in a Line [Area of Effect] 30 feet long and 1 foot wide. If you're holding the decanter, you can aim the geyser in one direction (no action required). One creature of your choice in the Line [Area of Effect] must succeed on a 13 Strength saving throw or take 1d4 Bludgeoning damage and have the Prone condition. Instead of a creature, you can target one object in the Line [Area of Effect] that isn't being worn or carried and that weighs no more than 200 pounds. The object is knocked over by the geyser."
  },
  {
    "name": "Deck of Illusions",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This box contains a set of cards. A full deck has 34 cards: 32 depicting specific creatures and two with a mirrored surface. A deck found as treasure is usually missing 1d20 - 1 cards. The magic of the deck functions only if its cards are drawn at random. You can take a Magic action to draw a card at random from the deck and throw it to the ground at a point within 30 feet of yourself. An illusion of a creature, determined by rolling on the Deck of Illusions table, forms over the thrown card and remains until dispelled. The illusory creature created by the card looks and behaves like a real creature of its kind, except that it can do no harm. While you are within 120 feet of the illusory creature and can see it, you can take a Magic action to move it anywhere within 30 feet of its card. Any physical interaction with the illusory creature reveals it to be false, because objects pass through it. A creature that takes a Study action to visually inspect the illusory creature identifies it as an illusion with a successful 15 Intelligence (Investigation) check. The illusion lasts until its card is moved or the illusion is dispelled (using a Dispel Magic spell or a similar effect). When the illusion ends, the image on its card disappears, and that card can't be used again."
  },
  {
    "name": "Deck of Many Things",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "Usually found in a box or pouch, this deck contains a number of cards made of ivory or vellum. Most (75 percent) of these decks have thirteen cards, but some have twenty-two. Use the appropriate column of the Deck of Many Things table when randomly determining cards drawn from the deck. Before you draw a card, you must declare how many cards you intend to draw and then draw them randomly. Any cards drawn in excess of this number have no effect. Otherwise, as soon as you draw a card from the deck, its magic takes effect. You must draw each card no more than 1 hour after the previous draw. If you fail to draw the chosen number, the remaining number of cards fly from the deck on their own and take effect all at once. Once a card is drawn, it disappears. Unless the card is the Fool or Jester, the card reappears in the deck, making it possible to draw the same card twice. (Once the Fool or Jester has left the deck, reroll on the table if that card comes up again.) Each card's effect is described below. **Balance:** You can increase one of your ability scores by 2, to a maximum of 22, provided you also decrease another one of your ability scores by 2. You can't decrease an ability that has a score of 5 or lower. Alternatively, you can choose not to adjust your ability scores, in which case this card has no effect. **Comet:** The next time you enter combat against one or more Hostile [Attitude] creatures, you can select one of them as your foe when you roll Initiative. If you reduce your foe to 0 Hit Points during that combat, you have Advantage on Death Saving Throw for 1 year. If someone else reduces your chosen foe to 0 Hit Points or you don't choose a foe, this card has no effect. **Donjon:** You disappear and become entombed in a state of suspended animation in an extradimensional sphere. Everything you're wearing and carrying disappears with you except for Artifacts, which stay behind in the space you occupied when you disappeared. You remain imprisoned until you are found and removed from the sphere. You can't be located by any Divination magic, but a Wish spell can reveal the location of your prison. You draw no more cards. **Euryale:** The card's medusa-like visage curses you. You take a -2 penalty to saving throws while cursed in this way. Only a god or the magic of the Fates card can end this curse. **Fates:** Reality's fabric unravels and spins anew, allowing you to avoid or erase one event as if it never happened. You can use the card's magic as soon as you draw the card or at any other time before you die. **Flames:** A powerful devil becomes your enemy. The devil seeks your ruin and torments you, savoring your suffering before attempting to slay you. This enmity lasts until either you or the devil dies. **A Question of Enmity:** Two of the cards in the Deck of Many Things can earn a character the enmity of another being. With the Flames card, the enmity is overt. The character should experience the devil's malevolent efforts on multiple occasions. Seeking out the fiend shouldn't be a simple task, and the adventurer should clash with the devil's allies and followers a few times before being able to confront the devil. In the case of the Rogue card, the enmity is secret and should come from someone thought to be a friend or an ally. As Dungeon Master, you should wait for a dramatically appropriate moment to reveal this enmity, leaving the adventurer guessing who is likely to become a betrayer. **Fool:** You have Disadvantage on D20 Test for the next 72 hours. Draw another card; this draw doesn't count as one of your declared draws. **Gem:** Twenty-five pieces of jewelry worth 2,000 GP each or fifty gems worth 1,000 GP each appear at your feet. **Jester:** You have Advantage on D20 Test for the next 72 hours, or you can draw two additional cards beyond your declared draws. **Key:** A Rare or rarer magic weapon with which you are proficient appears on your person. The DM chooses the weapon. **Knight:** You gain the service of a Knight, who magically appears in an unoccupied space you choose within 30 feet of yourself. The knight has the same alignment as you and serves you loyally until death, believing the two of you have been drawn together by fate. Work with your DM to create a name and backstory for this NPC. The DM can use a different stat block to represent the knight, as desired. **Moon:** You gain the ability to cast Wish 1d3 times. **Puzzle:** Permanently reduce your Intelligence or Wisdom by 1d4 + 1 (to a minimum score of 1). You can draw one additional card beyond your declared draws. **Rogue:** An NPC of the DM's choice becomes Hostile [Attitude] toward you. You don't know the identity of this NPC until they or someone else reveals it. Nothing less than a Wish spell or divine intervention can end the NPC's hostility toward you. **Ruin:** All forms of wealth that you carry or own, other than magic items, are lost to you. Portable property vanishes. Businesses, buildings, and land you own are lost in a way that alters reality the least. If you have a Bastion (see the Dungeon Master's Guide), it is destroyed by some calamity beyond your control. Any documentation that proves you should own something lost to this card also disappears. **Sage:** At any time you choose within one year of drawing this card, you can ask a question in meditation and mentally receive a truthful answer to that question. **Skull:** An Avatar of Death appears in an unoccupied space as close to you as possible. The avatar targets only you with its attacks, appearing as a ghostly skeleton clad in a tattered black robe and carrying a spectral scythe. The avatar disappears when it drops to 0 Hit Points or you die. If an ally of yours deals damage to the avatar, that ally summons another Avatar of Death. The new avatar appears in an unoccupied space as close to that ally as possible and targets only that ally with its attacks. You and your allies can each summon only one avatar as a consequence of this draw. A creature slain by an avatar can't be restored to life. **Star:** Increase one of your ability scores by 2, to a maximum of 24. **Sun:** A magic item (chosen by the DM) appears on your person. In addition, you gain 10 Temporary Hit Points daily at dawn until you die. **Talons:** Every magic item you wear or carry disintegrates. Artifacts in your possession vanish instead. **Throne:** You gain proficiency and Expertise in your choice of History, Insight, Intimidation, or Persuasion. In addition, you gain rightful ownership of a small keep somewhere in the world. However, the keep is currently home to one or more monsters, which must be cleared out before you can claim the keep as yours. **Void:** Your soul is drawn from your body and contained in an object in a place of the DM's choice. One or more powerful beings guard the place. While your soul is trapped in this way, your body is inert, ceases aging, and requires no food, air, or water. A Wish spell can't return your soul to your body, but the spell reveals the location of the object that holds your soul. You draw no more cards."
  },
  {
    "name": "Demonomicon of Iggwilv",
    "rarity": "artifact",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This treatise, composed by Iggwilv the archmage, documents the Abyss's layers and inhabitants and is widely regarded as the most thorough and blasphemous tome of demonology in the multiverse. The tome recounts both the oldest and most current profanities of the Abyss and demons. Demons have attempted to censor the text, and while sections have been ripped from the book's spine, the general chapters remain, ever revealing demonic secrets. Caged behind lines of script roils a secret piece of the Abyss itself, which keeps the book up-to-date, no matter how many pages are removed, and it longs to be more than mere reference material. **Abyssal Lore:** You can reference the Demonomicon whenever you make an Intelligence check to discern information about demons or a Wisdom (Survival) check related to the Abyss. When you do so, you gain Advantage on the check. **Containment:** The first ten pages of the Demonomicon are blank. As a Magic action while holding the book, you can target a Fiend that you can see that is trapped within the area of a Magic Circle spell. The Fiend must succeed on a 20 Charisma saving throw with Disadvantage or become trapped within one of the Demonomicon's blank pages, which fills with writing detailing the trapped creature's widely known name and depravities. Once used, this action can't be used again until the next dawn. When you finish a Long Rest, if you and the Demonomicon are on the same plane of existence, one trapped creature within the book can attempt to possess you. You make a 20 Charisma saving throw. On a failed save, you are possessed by the creature, which controls you like a puppet. As a Magic action, the possessing creature can release you and appear in the closest unoccupied space to you. On a successful save, the Fiend can't try to possess you again for 7 days (but another Fiend trapped in the book can certainly try). When the tome is discovered, it has 1d4 Fiends occupying its pages—typically an assortment of demons. **Ensnarement:** While carrying the book, whenever you cast Magic Circle naming only Fiends or cast Planar Binding targeting a Fiend, the spell is cast at level 9, regardless of what level spell slot you used, if any. Additionally, the Fiend has Disadvantage on its saving throw against the spell. **Fiendish Scourging:** While carrying the book, when you make a damage roll for a spell you cast against a Fiend, you use the maximum possible result instead of rolling. **Random Properties:** The Artifact has the following random properties: 2 Artifact Properties; Minor Beneficial Properties properties 1 Artifact Properties; Minor Detrimental Properties property 1 Artifact Properties; Major Detrimental Properties property **Spells:** The book has 8 charges and regains 1d8 expended charges daily at dawn. While holding the book, you can take a Magic action to cast one of the spells (save 20) on the following table. The table indicates how many charges you must expend to cast the spell. **Destroying the Demonomicon:** To destroy the book, six different demon lords must each tear out a sixth of the book's pages. If this occurs, the pages reappear after 24 hours. Before all those hours pass, anyone who opens the book's remaining binding is transported to a nascent layer of the Abyss that lies hidden within the book. At the heart of this deadly, semi-sentient domain lies a long-lost Artifact, Fraz-Urb'luu's Staff. If the staff is dragged from the pocket plane, the tome is reduced to a mundane and out-of-date copy of the Tome of Zyx, the work that served as the foundation of the Demonomicon of Iggwilv. The Tome of Zyx can be destroyed like any ordinary book. Once the staff emerges, the demon lord Fraz-Urb'luu knows instantly."
  },
  {
    "name": "Dimensional Shackles",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "You can take a Utilize action to place these shackles on a creature that has the Incapacitated condition. The shackles adjust to fit a creature of Small to Large size. The shackles prevent a creature bound by them from using any method of extradimensional movement, including teleportation or travel to a different plane of existence. They don't prevent the creature from passing through an interdimensional portal. You and any creature you designate when you use the shackles can take a Utilize action to remove them. Once every 30 days, the bound creature can make a 30 Strength (Athletics) check. On a successful check, the creature breaks free and destroys the shackles."
  },
  {
    "name": "Dread Helm",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While you're wearing this fearsome steel helm, your eyes glow red and the rest of your face is hidden in shadow."
  },
  {
    "name": "Driftglobe",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This small sphere of thick glass weighs 1 pound. If you are within 60 feet of it, you can command it to emanate light equivalent to that of the Light or Daylight spell (your choice). Once used, the Daylight effect can't be used again until the next dawn. You can issue another command as a Magic action to make the illuminated globe rise into the air and float no more than 5 feet off the ground. The globe hovers in this way until you or another creature grasps it. If you move more than 60 feet from the hovering globe, it follows you until it is within 60 feet of you. It takes the shortest route to do so. If prevented from moving, the globe sinks gently to the ground and becomes inactive, and its light winks out."
  },
  {
    "name": "Dust of Disappearance",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This powder resembles fine sand. There is enough of it for one use. When you take a Utilize action to throw the dust into the air, you and each creature and object within a 10-foot Emanation [Area of Effect] originating from you have the Invisible condition for 2d4 minutes. The duration is the same for all subjects, and the dust is consumed when its magic takes effect. Immediately after an affected creature makes an attack roll, deals damage, or casts a spell, the Invisible condition ends for that creature."
  },
  {
    "name": "Dust of Dryness",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This small packet contains 1d6 + 4 pinches of dust. As a Utilize action, you can sprinkle a pinch of the dust over water, turning up to a 15-foot Cube [Area of Effect] of water into one marble-sized pellet, which floats or rests near where the dust was sprinkled. The pellet's weight is negligible. A creature can take a Utilize action to smash the pellet against a hard surface, causing the pellet to shatter and release the water the dust absorbed. Doing so destroys the pellet and ends its magic. As a Utilize action, you can sprinkle a pinch of the dust on an Elemental within 5 feet of yourself that is composed mostly of water (such as a Water Elemental or a Water Weird). Such a creature exposed to a pinch of the dust makes a 13 Constitution saving throw, taking 10d6 Necrotic damage on a failed save or half as much damage on a successful one."
  },
  {
    "name": "Dust of Sneezing and Choking",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "Found in a small container, this powder resembles Dust of Disappearance, and Identify reveals it to be such. There is enough of it for one use. As a Utilize action, you can throw the dust into the air, forcing yourself and every creature in a 30-foot Emanation [Area of Effect] originating from you to make a 15 Constitution saving throw. Constructs, Elementals, Oozes, Plants, and Undead succeed on the save automatically. On a failed save, a creature begins sneezing uncontrollably; it has the Incapacitated condition and is suffocating. The creature repeats the save at the end of each of its turns, ending the effect on itself on a success. The effect also ends on any creature targeted by a Lesser Restoration spell."
  },
  {
    "name": "Dwarven Thrower",
    "rarity": "very rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "You gain a +3 bonus to attack rolls and damage rolls made with this magic weapon. It has T with a normal range of 20 feet and a long range of 60 feet. When you hit with a ranged attack using this weapon, it deals an extra 1d8 Force damage, or an extra 2d8 Force damage if the target is a Giant. Immediately after hitting or missing, the weapon flies back to your hand."
  },
  {
    "name": "Ear Horn of Hearing",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While held up to your ear, this horn suppresses the effects of the Deafened condition on you."
  },
  {
    "name": "Efreeti Bottle",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you take a Magic action to remove the stopper of this painted brass bottle, a cloud of thick smoke flows out of it. At the end of your turn, the smoke disappears with a flash of harmless fire, and an Efreeti appears in an unoccupied space within 30 feet of you. The first time the bottle is opened, the DM rolls on the following table to determine what happens."
  },
  {
    "name": "Elemental Gem, Blue Sapphire",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This gem contains a mote of elemental energy. When you take a Utilize action to break the gem, an Air Elemental is summoned, and the gem ceases to be magical. The elemental appears in an unoccupied space as close to the broken gem as possible, understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. The elemental disappears after 1 hour, when it dies, or when you dismiss it as a Bonus Action."
  },
  {
    "name": "Elemental Gem, Emerald",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This gem contains a mote of elemental energy. When you take a Utilize action to break the gem, a Water Elemental is summoned, and the gem ceases to be magical. The elemental appears in an unoccupied space as close to the broken gem as possible, understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. The elemental disappears after 1 hour, when it dies, or when you dismiss it as a Bonus Action."
  },
  {
    "name": "Elemental Gem, Red Corundum",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This gem contains a mote of elemental energy. When you take a Utilize action to break the gem, a Fire Elemental is summoned, and the gem ceases to be magical. The elemental appears in an unoccupied space as close to the broken gem as possible, understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. The elemental disappears after 1 hour, when it dies, or when you dismiss it as a Bonus Action."
  },
  {
    "name": "Elemental Gem, Yellow Diamond",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This gem contains a mote of elemental energy. When you take a Utilize action to break the gem, an Earth Elemental is summoned, and the gem ceases to be magical. The elemental appears in an unoccupied space as close to the broken gem as possible, understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. The elemental disappears after 1 hour, when it dies, or when you dismiss it as a Bonus Action."
  },
  {
    "name": "Elixir of Health",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, you are cured of all magical contagions. In addition, the following conditions end on you: Blinded, Deafened, Paralyzed, and Poisoned. The clear, red liquid has tiny bubbles of light in it."
  },
  {
    "name": "Enduring Spellbook",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This spellbook, along with anything written on its pages, can't be damaged by fire or water. In addition, the spellbook doesn't deteriorate with age."
  },
  {
    "name": "Enspelled Staff (Cantrip)",
    "rarity": "uncommon",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "Bound into this staff is a cantrip. The cantrip is determined when the staff is created and can be of any school of magic. The staff has 6 charges and regains 1d6 expended charges daily at dawn. While holding the staff, you can expend 1 charge to cast its spell. If you expend the staff's last charge, roll 1d20. On a 1, the staff loses its properties and becomes a nonmagical Quarterstaff. The spell's saving throw DC is 13, and its attack bonus is 5."
  },
  {
    "name": "Enspelled Staff (Level 1)",
    "rarity": "uncommon",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "Bound into this staff is a level 1 spell. The spell is determined when the staff is created and can be of any school of magic. The staff has 6 charges and regains 1d6 expended charges daily at dawn. While holding the staff, you can expend 1 charge to cast its spell. If you expend the staff's last charge, roll 1d20. On a 1, the staff loses its properties and becomes a nonmagical Quarterstaff. The spell's saving throw DC is 13, and its attack bonus is 5."
  },
  {
    "name": "Enspelled Staff (Level 2)",
    "rarity": "rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "Bound into this staff is a level 2 spell. The spell is determined when the staff is created and can be of any school of magic. The staff has 6 charges and regains 1d6 expended charges daily at dawn. While holding the staff, you can expend 1 charge to cast its spell. If you expend the staff's last charge, roll 1d20. On a 1, the staff loses its properties and becomes a nonmagical Quarterstaff. The spell's saving throw DC is 13, and its attack bonus is 5."
  },
  {
    "name": "Enspelled Staff (Level 3)",
    "rarity": "rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "Bound into this staff is a level 3 spell. The spell is determined when the staff is created and can be of any school of magic. The staff has 6 charges and regains 1d6 expended charges daily at dawn. While holding the staff, you can expend 1 charge to cast its spell. If you expend the staff's last charge, roll 1d20. On a 1, the staff loses its properties and becomes a nonmagical Quarterstaff. The spell's saving throw DC is 15, and its attack bonus is 7."
  },
  {
    "name": "Enspelled Staff (Level 4)",
    "rarity": "very rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "Bound into this staff is a level 4 spell. The spell is determined when the staff is created and can be of any school of magic. The staff has 6 charges and regains 1d6 expended charges daily at dawn. While holding the staff, you can expend 1 charge to cast its spell. If you expend the staff's last charge, roll 1d20. On a 1, the staff loses its properties and becomes a nonmagical Quarterstaff. The spell's saving throw DC is 15, and its attack bonus is 7."
  },
  {
    "name": "Enspelled Staff (Level 5)",
    "rarity": "very rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "Bound into this staff is a level 5 spell. The spell is determined when the staff is created and can be of any school of magic. The staff has 6 charges and regains 1d6 expended charges daily at dawn. While holding the staff, you can expend 1 charge to cast its spell. If you expend the staff's last charge, roll 1d20. On a 1, the staff loses its properties and becomes a nonmagical Quarterstaff. The spell's saving throw DC is 17, and its attack bonus is 9."
  },
  {
    "name": "Enspelled Staff (Level 6)",
    "rarity": "legendary",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "Bound into this staff is a level 6 spell. The spell is determined when the staff is created and can be of any school of magic. The staff has 6 charges and regains 1d6 expended charges daily at dawn. While holding the staff, you can expend 1 charge to cast its spell. If you expend the staff's last charge, roll 1d20. On a 1, the staff loses its properties and becomes a nonmagical Quarterstaff. The spell's saving throw DC is 17, and its attack bonus is 9."
  },
  {
    "name": "Enspelled Staff (Level 7)",
    "rarity": "legendary",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "Bound into this staff is a level 7 spell. The spell is determined when the staff is created and can be of any school of magic. The staff has 6 charges and regains 1d6 expended charges daily at dawn. While holding the staff, you can expend 1 charge to cast its spell. If you expend the staff's last charge, roll 1d20. On a 1, the staff loses its properties and becomes a nonmagical Quarterstaff. The spell's saving throw DC is 18, and its attack bonus is 10."
  },
  {
    "name": "Enspelled Staff (Level 8)",
    "rarity": "legendary",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "Bound into this staff is a level 8 spell. The spell is determined when the staff is created and can be of any school of magic. The staff has 6 charges and regains 1d6 expended charges daily at dawn. While holding the staff, you can expend 1 charge to cast its spell. If you expend the staff's last charge, roll 1d20. On a 1, the staff loses its properties and becomes a nonmagical Quarterstaff. The spell's saving throw DC is 18, and its attack bonus is 10."
  },
  {
    "name": "Ersatz Eye",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This magical eye replaces a real one that was lost or removed. While the Ersatz Eye is embedded in your eye socket, you can see through the tiny orb as though it were your natural eye. You can insert or remove the Ersatz Eye as a Magic action, and it can't be removed against your will while you are alive."
  },
  {
    "name": "Eversmoking Bottle",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "As a Magic action, you can open or close this bottle. Opening the bottle causes thick smoke to billow out, forming a cloud that fills a 60-foot Emanation [Area of Effect] originating from the bottle. The area within the smoke is Heavily Obscured. Each minute the bottle remains open, the size of the Emanation [Area of Effect] increases by 10 feet until it reaches its maximum size of 120 feet. Closing the bottle causes the cloud to become fixed in place until it disperses after 10 minutes. A strong wind (such as that created by the Gust of Wind spell) disperses the cloud after 1 minute."
  },
  {
    "name": "Eye of Vecna",
    "rarity": "artifact",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "Vecna was a mighty wizard who, through magic and conquest, forged a terrible empire. For all his power, however, Vecna feared death and took steps to prevent his demise by becoming a lich. A treacherous lieutenant named Kas brought Vecna's rule to an end in a terrible battle. Of Vecna, all that remained were one hand and one eye, grisly Artifacts that still seek to work Vecna's will in the world. The Eye of Vecna and the Hand of Vecna are separate Artifacts that might be found together or separately. The eye looks like a bloodshot organ torn free from the socket. The hand is a shriveled left extremity. **Random Properties of the Eye and Hand:** The Eye of Vecna has the following random properties: 1 Artifact Properties; Minor Beneficial Properties property 1 Artifact Properties; Major Beneficial Properties property 1 Artifact Properties; Minor Detrimental Properties property **Attuning to the Eye:** To attune to the eye, you must press it into your empty socket. The eye grafts itself to your head and remains there until you die. If the eye is ever removed, you die. **Properties of the Eye:** While you are attuned to the eye, your alignment is Neutral Evil, and you gain the following benefits: **Truesight:** You have Truesight out to 240 feet. **Spellcasting:** The eye has 8 charges and regains 1d4 + 4 expended charges daily at dawn. You can cast a spell on the Eye of Vecna Spells table from the eye (save 18). The table indicates how many charges you must expend to cast the spell. Each time you cast a spell from the eye, there is a 5 chance that Vecna tears your soul from your body, devours it, and then takes control of the body like a puppet. If that happens, you become an NPC under the DM's control. **X-ray Vision:** You can take a Magic action to gain X-ray vision with a range of 30 feet for 1 minute. To you, solid objects within that radius appear transparent and don't prevent light from passing through themselves. The vision can penetrate 1 foot of stone, 1 inch of common metal, or up to 3 feet of wood or dirt. Thicker substances block the vision, as does a thin sheet of lead. **Destroying the Eye and Hand:** If the Eye of Vecna and the Hand of Vecna are both attached to the same creature and that creature is slain by the Sword of Kas, both the eye and the hand burst into flame, turn to ash, and are destroyed. Any other attempt to destroy the eye or hand seems to work, but the Artifact reappears in one of Vecna's many hidden vaults, where it waits to be rediscovered."
  },
  {
    "name": "Eyes of Charming",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "These crystal lenses fit over the eyes. They have 3 charges. While wearing them, you can expend 1 or more charges to cast Charm Person (save 13). For 1 charge, you cast the level 1 version of the spell. You increase the spell's level by one for each additional charge you expend. The lenses regain all expended charges daily at dawn."
  },
  {
    "name": "Eyes of Minute Seeing",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "These crystal lenses fit over the eyes. While wearing them, your vision improves significantly out to a range of 1 foot, granting you Darkvision within that range and Advantage on Intelligence (Investigation) checks made to examine something within that range."
  },
  {
    "name": "Eyes of the Eagle",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "These crystal lenses fit over the eyes. While wearing them, you have Advantage on Wisdom (Perception) checks that rely on sight. In conditions of clear visibility, you can make out details of even extremely distant creatures and objects as small as 2 feet across."
  },
  {
    "name": "Figurine of Wondrous Power, Bronze Griffon",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Figurine of Wondrous Power is a statuette small enough to fit in a pocket. If you take a Magic action to throw the figurine to a point on the ground within 60 feet of yourself, the figurine becomes a living creature specified in the figurine's description below. If the space where the creature would appear is occupied by other creatures or objects, or if there isn't enough space for the creature, the figurine doesn't become a creature. The creature is Friendly [Attitude] to you and your allies. It understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. If you issue no commands, the creature defends itself but takes no other actions. The creature exists for a duration specific to each figurine. At the end of the duration, the creature reverts to its figurine form. It reverts to a figurine early if its creature form drops to 0 Hit Points or if you take a Magic action while touching the creature to make it revert to figurine form. When the creature becomes a figurine again, its property can't be used again until a certain amount of time has passed, as specified below. **Bronze Griffon (Rare):** This bronze statuette is of a griffon rampant. It can become a Griffon for up to 6 hours. Once it has been used, it can't be used again until 5 days have passed."
  },
  {
    "name": "Figurine of Wondrous Power, Ebony Fly",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Figurine of Wondrous Power is a statuette small enough to fit in a pocket. If you take a Magic action to throw the figurine to a point on the ground within 60 feet of yourself, the figurine becomes a living creature specified in the figurine's description below. If the space where the creature would appear is occupied by other creatures or objects, or if there isn't enough space for the creature, the figurine doesn't become a creature. The creature is Friendly [Attitude] to you and your allies. It understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. If you issue no commands, the creature defends itself but takes no other actions. The creature exists for a duration specific to each figurine. At the end of the duration, the creature reverts to its figurine form. It reverts to a figurine early if its creature form drops to 0 Hit Points or if you take a Magic action while touching the creature to make it revert to figurine form. When the creature becomes a figurine again, its property can't be used again until a certain amount of time has passed, as specified below. **Ebony Fly (Rare):** This ebony statuette, carved in the likeness of a horsefly, can become a Giant Fly for up to 12 hours and can be ridden as a mount. Once it has been used, it can't be used again until 2 days have passed."
  },
  {
    "name": "Figurine of Wondrous Power, Golden Lions",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Figurine of Wondrous Power is a statuette small enough to fit in a pocket. If you take a Magic action to throw the figurine to a point on the ground within 60 feet of yourself, the figurine becomes a living creature specified in the figurine's description below. If the space where the creature would appear is occupied by other creatures or objects, or if there isn't enough space for the creature, the figurine doesn't become a creature. The creature is Friendly [Attitude] to you and your allies. It understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. If you issue no commands, the creature defends itself but takes no other actions. The creature exists for a duration specific to each figurine. At the end of the duration, the creature reverts to its figurine form. It reverts to a figurine early if its creature form drops to 0 Hit Points or if you take a Magic action while touching the creature to make it revert to figurine form. When the creature becomes a figurine again, its property can't be used again until a certain amount of time has passed, as specified below. **Golden Lions (Rare):** These gold statuettes of lions are always created in pairs. You can use one figurine or both simultaneously. Each can become a Lion for up to 1 hour. Once a lion has been used, it can't be used again until 7 days have passed."
  },
  {
    "name": "Figurine of Wondrous Power, Ivory Goats",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Figurine of Wondrous Power is a statuette small enough to fit in a pocket. If you take a Magic action to throw the figurine to a point on the ground within 60 feet of yourself, the figurine becomes a living creature specified in the figurine's description below. If the space where the creature would appear is occupied by other creatures or objects, or if there isn't enough space for the creature, the figurine doesn't become a creature. The creature is Friendly [Attitude] to you and your allies. It understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. If you issue no commands, the creature defends itself but takes no other actions. The creature exists for a duration specific to each figurine. At the end of the duration, the creature reverts to its figurine form. It reverts to a figurine early if its creature form drops to 0 Hit Points or if you take a Magic action while touching the creature to make it revert to figurine form. When the creature becomes a figurine again, its property can't be used again until a certain amount of time has passed, as specified below. **Ivory Goats (Rare):** These ivory statuettes of goats are always created in sets of three. Each goat looks unique and functions differently from the others. Their properties are as follows: **Goat of Terror:** This figurine can become a Giant Goat for up to 3 hours. The goat can't attack, but you can (harmlessly) remove its horns and use them as weapons. One horn becomes a +1 Lance, and the other becomes a +2 Longsword. Removing a horn requires a Magic action, and the weapons disappear and the horns return when the goat reverts to figurine form. While you ride the goat, any Hostile [Attitude] creature that starts its turn within a 30-foot Emanation [Area of Effect] originating from the goat must succeed on a 15 Wisdom saving throw or have the Frightened condition for 1 minute, until you are no longer riding the goat, or until the goat reverts to figurine form. The Frightened creature repeats the save at the end of each of its turns, ending the effect on itself on a success. Once it succeeds on the save, a creature is immune to this effect for the next 24 hours. Once the figurine has been used, it can't be used again until 15 days have passed. **Goat of Traveling:** This figurine can become a Large goat with the same statistics as a Riding Horse. It has 24 charges, and each hour or portion thereof it spends in goat form costs 1 charge. While it has charges, you can use it as often as you wish. When it runs out of charges, it reverts to a figurine and can't be used again until 7 days have passed, when it regains all expended charges. **Goat of Travail:** This figurine can become a Giant Goat for up to 3 hours. Once it has been used, it can't be used again until 30 days have passed."
  },
  {
    "name": "Figurine of Wondrous Power, Marble Elephant",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Figurine of Wondrous Power is a statuette small enough to fit in a pocket. If you take a Magic action to throw the figurine to a point on the ground within 60 feet of yourself, the figurine becomes a living creature specified in the figurine's description below. If the space where the creature would appear is occupied by other creatures or objects, or if there isn't enough space for the creature, the figurine doesn't become a creature. The creature is Friendly [Attitude] to you and your allies. It understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. If you issue no commands, the creature defends itself but takes no other actions. The creature exists for a duration specific to each figurine. At the end of the duration, the creature reverts to its figurine form. It reverts to a figurine early if its creature form drops to 0 Hit Points or if you take a Magic action while touching the creature to make it revert to figurine form. When the creature becomes a figurine again, its property can't be used again until a certain amount of time has passed, as specified below. **Marble Elephant (Rare):** This marble statuette resembles a trumpeting elephant. It can become an Elephant for up to 24 hours. Once it has been used, it can't be used again until 7 days have passed."
  },
  {
    "name": "Figurine of Wondrous Power, Obsidian Steed",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Figurine of Wondrous Power is a statuette small enough to fit in a pocket. If you take a Magic action to throw the figurine to a point on the ground within 60 feet of yourself, the figurine becomes a living creature specified in the figurine's description below. If the space where the creature would appear is occupied by other creatures or objects, or if there isn't enough space for the creature, the figurine doesn't become a creature. The creature is Friendly [Attitude] to you and your allies. It understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. If you issue no commands, the creature defends itself but takes no other actions. The creature exists for a duration specific to each figurine. At the end of the duration, the creature reverts to its figurine form. It reverts to a figurine early if its creature form drops to 0 Hit Points or if you take a Magic action while touching the creature to make it revert to figurine form. When the creature becomes a figurine again, its property can't be used again until a certain amount of time has passed, as specified below. **Obsidian Steed (Very Rare):** This polished obsidian horse can become a Nightmare for up to 24 hours. The nightmare fights only to defend itself. Once it has been used, it can't be used again until 5 days have passed. The figurine has a 10 chance each time you use it to ignore your orders, including a command to revert to figurine form. If you mount the nightmare while it is ignoring your orders, you and the nightmare are instantly transported to a random location on the plane of Hades, where the nightmare reverts to figurine form."
  },
  {
    "name": "Figurine of Wondrous Power, Onyx Dog",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Figurine of Wondrous Power is a statuette small enough to fit in a pocket. If you take a Magic action to throw the figurine to a point on the ground within 60 feet of yourself, the figurine becomes a living creature specified in the figurine's description below. If the space where the creature would appear is occupied by other creatures or objects, or if there isn't enough space for the creature, the figurine doesn't become a creature. The creature is Friendly [Attitude] to you and your allies. It understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. If you issue no commands, the creature defends itself but takes no other actions. The creature exists for a duration specific to each figurine. At the end of the duration, the creature reverts to its figurine form. It reverts to a figurine early if its creature form drops to 0 Hit Points or if you take a Magic action while touching the creature to make it revert to figurine form. When the creature becomes a figurine again, its property can't be used again until a certain amount of time has passed, as specified below. **Onyx Dog (Rare):** This onyx statuette of a dog can become a Mastiff for up to 6 hours. The mastiff has an Intelligence of 8 and can speak Common. It also has Blindsight with a range of 60 feet. Once it has been used, it can't be used again until 7 days have passed."
  },
  {
    "name": "Figurine of Wondrous Power, Serpentine Owl",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Figurine of Wondrous Power is a statuette small enough to fit in a pocket. If you take a Magic action to throw the figurine to a point on the ground within 60 feet of yourself, the figurine becomes a living creature specified in the figurine's description below. If the space where the creature would appear is occupied by other creatures or objects, or if there isn't enough space for the creature, the figurine doesn't become a creature. The creature is Friendly [Attitude] to you and your allies. It understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. If you issue no commands, the creature defends itself but takes no other actions. The creature exists for a duration specific to each figurine. At the end of the duration, the creature reverts to its figurine form. It reverts to a figurine early if its creature form drops to 0 Hit Points or if you take a Magic action while touching the creature to make it revert to figurine form. When the creature becomes a figurine again, its property can't be used again until a certain amount of time has passed, as specified below. **Serpentine Owl (Rare):** This serpentine statuette of an owl can become a Giant Owl for up to 8 hours. The owl can communicate telepathically with you at any range if you and it are on the same plane of existence. Once it has been used, it can't be used again until 2 days have passed."
  },
  {
    "name": "Figurine of Wondrous Power, Silver Raven",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Figurine of Wondrous Power is a statuette small enough to fit in a pocket. If you take a Magic action to throw the figurine to a point on the ground within 60 feet of yourself, the figurine becomes a living creature specified in the figurine's description below. If the space where the creature would appear is occupied by other creatures or objects, or if there isn't enough space for the creature, the figurine doesn't become a creature. The creature is Friendly [Attitude] to you and your allies. It understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. If you issue no commands, the creature defends itself but takes no other actions. The creature exists for a duration specific to each figurine. At the end of the duration, the creature reverts to its figurine form. It reverts to a figurine early if its creature form drops to 0 Hit Points or if you take a Magic action while touching the creature to make it revert to figurine form. When the creature becomes a figurine again, its property can't be used again until a certain amount of time has passed, as specified below. **Silver Raven (Uncommon):** This silver statuette of a raven can become a Raven for up to 12 hours. Once it has been used, it can't be used again until 2 days have passed. While in raven form, the figurine grants you the ability to cast Animal Messenger on it."
  },
  {
    "name": "Folding Boat",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This object appears as a wooden box that measures 12 inches long, 6 inches wide, and 6 inches deep. It weighs 4 pounds and floats. It can be opened to store items inside. This item also has three command words, each requiring a Magic action to use: **First Command Word:** The box unfolds into a Rowboat. **Second Command Word:** The box unfolds into a Keelboat. **Third Command Word:** The Folding Boat folds back into a box if no creatures are aboard. Any objects in the vessel that can't fit inside the box remain outside the box as it folds. Any objects in the vessel that can fit inside the box do so. When the box becomes a vessel, its weight becomes that of a normal vessel its size, and anything that was stored in the box remains in the boat. Statistics for the Rowboat and Keelboat appear in the Player's Handbook. If either vessel is reduced to 0 Hit Points, the Folding Boat is destroyed."
  },
  {
    "name": "Gauntlets of Ogre Power",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "Your Strength score is 19 while you wear these gauntlets. They have no effect on you if your Strength is 19 or higher without them."
  },
  {
    "name": "Gem of Brightness",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This prism has 50 charges. While you are holding it, you can take a Magic action and use one of three command words to cause one of the following effects: **First Command Word:** The gem sheds Bright Light in a 30-foot radius and Dim Light for an additional 30 feet. This effect doesn't expend a charge. It lasts until you take a Bonus Action to repeat the command word or until you use another function of the gem. **Second Command Word:** You expend 1 charge and cause the gem to fire a brilliant beam of light at one creature you can see within 60 feet of yourself. The creature must succeed on a 15 Constitution saving throw or have the Blinded condition for 1 minute. The creature repeats the save at the end of each of its turns, ending the effect on itself on a success. **Third Command Word:** You expend 5 charges and cause the gem to flare with intense light in a 30-foot Cone [Area of Effect]. Each creature in the Cone [Area of Effect] makes a saving throw as if struck by the beam created with the second command word. When all of the gem's charges are expended, the gem becomes a nonmagical jewel worth 50 GP."
  },
  {
    "name": "Gem of Seeing",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This gem has 3 charges. As a Magic action, you can expend 1 charge. For the next 10 minutes, you have Truesight out to 120 feet when you peer through the gem. The gem regains 1d3 expended charges daily at dawn."
  },
  {
    "name": "Glamoured Studded Leather",
    "rarity": "rare",
    "itemType": "armor",
    "requiresAttunement": false,
    "description": "While wearing this armor, you gain a +1 bonus to Armor Class. You can also take a Bonus Action to cause the armor to assume the appearance of a normal set of clothing or some other kind of armor. You decide what it looks like—including color, style, and accessories—but the armor retains its normal bulk and weight. The illusory appearance lasts until you use this property again or doff the armor."
  },
  {
    "name": "Gloves of Missile Snaring",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "If you're hit by an attack roll made with a Ranged or Thrown weapon while wearing these gloves, you can take a Reaction to reduce the damage by 1d10 plus your Dexterity modifier if you have a free hand. If you reduce the damage to 0, you can catch the ammunition or weapon if it is small enough for you to hold in that hand."
  },
  {
    "name": "Gloves of Swimming and Climbing",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing these gloves, climbing and swimming don't cost you extra movement, and you gain a +5 bonus to Strength (Athletics) checks made to climb or swim."
  },
  {
    "name": "Gloves of Thievery",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "These gloves are imperceptible while worn. While wearing them, you gain a +5 bonus to Dexterity (Sleight of Hand) checks."
  },
  {
    "name": "Goggles of Night",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While wearing these dark lenses, you have Darkvision out to 60 feet. If you already have Darkvision, wearing the goggles increases its range by 60 feet."
  },
  {
    "name": "Gold Dragon Scale Mail",
    "rarity": "very rare",
    "itemType": "armor",
    "requiresAttunement": true,
    "description": "{#itemEntry Dragon Scale Mail|XDMG}"
  },
  {
    "name": "Green Dragon Scale Mail",
    "rarity": "very rare",
    "itemType": "armor",
    "requiresAttunement": true,
    "description": "{#itemEntry Dragon Scale Mail|XDMG}"
  },
  {
    "name": "Hag Eye",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Hag Eye has 3 charges. While wearing or holding this item, you can expend 1 charge to cast Darkvision (targeting yourself only) or See Invisibility. The Hag Eye regains all expended charges daily at dawn. **Coven Sensor:** The Hag Eye is usually entrusted to a hag's minion for safekeeping and transport. As a Magic action, a hag who belongs to the coven that created the Hag Eye can see what the Hag Eye sees if the hag and the Hag Eye are on the same plane of existence. This effect lasts as long as the hag maintains Concentration. Multiple hags in the coven can see through the Hag Eye simultaneously. **Creating a Hag Eye:** Only a hag coven can craft this item, which is made from a real eye coated in varnish and often fitted to a pendant or another wearable item. A hag coven can have only one Hag Eye at a time, and creating a new one requires all three members of the coven to perform a special rite. This rite takes 1 hour, and the hags can't perform it if one or more of them has the Incapacitated condition. If the hags take any other actions during this rite, the rite fails and ends."
  },
  {
    "name": "Hand of Vecna",
    "rarity": "artifact",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "Vecna was a mighty wizard who, through magic and conquest, forged a terrible empire. For all his power, however, Vecna feared death and took steps to prevent his demise by becoming a lich. A treacherous lieutenant named Kas brought Vecna's rule to an end in a terrible battle. Of Vecna, all that remained were one hand and one eye, grisly Artifacts that still seek to work Vecna's will in the world. The Eye of Vecna and the Hand of Vecna are separate Artifacts that might be found together or separately. The eye looks like a bloodshot organ torn free from the socket. The hand is a shriveled left extremity. **Random Properties of the Eye and Hand:** The Hand of Vecna has the following random properties: 1 Artifact Properties; Minor Beneficial Properties property 1 Artifact Properties; Major Beneficial Properties property 1 Artifact Properties; Minor Detrimental Properties property **Attuning to the Hand:** To attune to the hand, you must press it against the stump where your left hand was. The hand grafts itself to your arm and becomes a functioning appendage. If the hand is ever removed, you die. **Properties of the Hand:** When you are attuned to the hand, your alignment is Neutral Evil, and you gain the following benefits: **Great Strength:** Your Strength becomes 20 unless it is already 20 or higher. **Icy Touch:** Any melee spell attack you make with the hand and any melee attack made with a weapon held by it deals an extra 2d8 Cold damage on a hit. **Spellcasting:** The hand has 8 charges and regains 1d4 + 4 expended charges daily at dawn. You can cast a spell on the Hand of Vecna Spells table from the hand (save 18). The table indicates how many charges you must expend to cast the spell. Each time you cast a spell from it, the hand casts Suggestion on you (save 18; no Concentration required), demanding that you commit an evil act. The hand might have a specific act in mind or leave it up to you. **Destroying the Eye and Hand:** If the Eye of Vecna and the Hand of Vecna are both attached to the same creature and that creature is slain by the Sword of Kas, both the eye and the hand burst into flame, turn to ash, and are destroyed. Any other attempt to destroy the eye or hand seems to work, but the Artifact reappears in one of Vecna's many hidden vaults, where it waits to be rediscovered."
  },
  {
    "name": "Hat of Disguise",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this hat, you can cast the Disguise Self spell. The spell ends if the hat is removed."
  },
  {
    "name": "Hat of Many Spells",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This pointed hat has the following properties. **Spellcasting Focus:** While holding the hat, you can use it as a Spellcasting Focus for your Wizard spells. Any spell you cast using the hat gains a special Somatic component: you must reach into the hat and \"pull\" the spell out of it. **Unknown Spell:** While holding the hat, you can try to cast a level 1+ spell you don't know. The spell must be on the Wizard spell list, it must be of a level you can cast, and it can't have Material components costing more than 1,000 GP. Once you decide on the spell, you must expend a spell slot of the spell's level. Then, to determine whether you cast the spell, make an Intelligence (Arcana) check (10 plus the spell's level). On a successful check, you cast the spell using its normal casting time, and you can't use this property again until you finish a Short Rest or Long Rest. On a failed check, you fail to cast the spell and a random effect occurs instead, determined by rolling on the following table. Any spell you cast from the hat uses your spell save DC and spell attack bonus."
  },
  {
    "name": "Hat of Vermin",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This hat has 3 charges. While holding the hat, you can take a Magic action to expend 1 charge and summon your choice of a Bat, a Frog, or a Rat. The summoned creature magically appears in the hat and tries to get away from you as quickly as possible. The creature is Indifferent [Attitude] toward you and other creatures, and it isn't under your control. It behaves as an ordinary creature of its kind and disappears after 1 hour or when it drops to 0 Hit Points. The hat regains all expended charges daily at dawn."
  },
  {
    "name": "Hat of Wizardry",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This cone-shaped hat is adorned with moons and stars. While you are wearing it, you gain the following benefits. **Spellcasting Focus:** You can use the hat as a Spellcasting Focus for your Wizard spells. **Unknown Spell:** As a Magic action, you can try to cast a cantrip that you don't know. The cantrip must be on the Wizard spell list and have a casting time of an action, and you make a 10 Intelligence (Arcana) check. On a successful check, you cast the spell. On a failed check, the spell fails, and the action used to cast the spell is wasted. In either case, you can't use this property again until you finish a Long Rest."
  },
  {
    "name": "Headband of Intellect",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "Your Intelligence score is 19 while you wear this headband. It has no effect on you if your Intelligence is 19 or higher without it."
  },
  {
    "name": "Helm of Brilliance",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This helm is set with 1d10 diamonds, 2d10 rubies, 3d10 fire opals, and 4d10 opals. Any gem pried from the helm crumbles to dust. When all the gems are removed or destroyed, the helm loses its magic. You gain the following benefits while wearing the helm. **Diamond Light:** As long as it has at least one diamond, the helm emits a 30-foot Emanation [Area of Effect]. When at least one Undead is within that area, the Emanation [Area of Effect] is filled with Dim Light. Any Undead that starts its turn in that area takes 1d6 Radiant damage. **Fire Opal Flames:** As long as the helm has at least one fire opal, you can take a Magic action to cause one weapon you are holding to burst into flames. The flames emit Bright Light in a 10-foot radius and Dim Light for an additional 10 feet. The flames are harmless to you and the weapon. When you hit with an attack using the blazing weapon, the target takes an extra 1d6 Fire damage. The flames last until you take a Bonus Action to extinguish them or until you drop or stow the weapon. **Ruby Resistance:** As long as the helm has at least one ruby, you have Resistance to Fire damage. **Spells:** You can cast one of the following spells (save 18), using one of the helm's gems of the specified type as a component: Daylight (opal), Fireball (fire opal), Prismatic Spray (diamond), or Wall of Fire (ruby). The gem is destroyed when the spell is cast and disappears from the helm. **Taking Fire Damage:** Roll 1d20 if you are wearing the helm and take Fire damage as a result of failing a saving throw against a spell. On a roll of 1, the helm emits beams of light from its remaining gems and is then destroyed. Each creature within a 60-foot Emanation [Area of Effect] originating from you must succeed on a 17 Dexterity saving throw or be struck by a beam, taking Radiant damage equal to the number of gems in the helm."
  },
  {
    "name": "Helm of Comprehending Languages",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While wearing this helm, you can cast Comprehend Languages from it."
  },
  {
    "name": "Helm of Telepathy",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this helm, you have telepathy with a range of 30 feet, and you can cast Detect Thoughts or Suggestion (save 13) from the helm. Once either spell is cast from the helm, that spell can't be cast from it again until the next dawn."
  },
  {
    "name": "Helm of Teleportation",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This helm has 3 charges. While wearing it, you can expend 1 charge to cast Teleport from it. The helm regains 1d3 expended charges daily at dawn."
  },
  {
    "name": "Heward's Handy Haversack",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This backpack has a central pouch and two side pouches, each of which is an extradimensional space. Each side pouch can hold up to 200 pounds of material, not exceeding a volume of 25 cubic feet. The central pouch can hold up to 500 pounds of material, not exceeding a volume of 64 cubic feet. The haversack always weighs 5 pounds, regardless of its contents. Retrieving an item from the haversack requires a Utilize action or a Bonus Action (your choice). When you reach into the haversack for a specific item, the item is always magically on top. If any of its pouches is overloaded, pierced, or torn, the haversack ruptures and is destroyed. If the haversack is destroyed, its contents are lost forever, although an Artifact always turns up again somewhere. If the haversack is turned inside out, its contents spill forth unharmed, and the haversack must be put right before it can be used again. Each pouch of the haversack holds enough air for 10 minutes of breathing, divided by the number of breathing creatures inside. Placing the haversack inside an extradimensional space created by a Bag of Holding, Portable Hole, or similar item instantly destroys both items and opens a gate to the Astral Plane. The gate originates where the one item was placed inside the other. Any creature within 10 feet of the gate and not behind Cover is sucked through it and deposited in a random location on the Astral Plane. The gate then closes. The gate is one-way only and can't be reopened."
  },
  {
    "name": "Heward's Handy Spice Pouch",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This belt pouch appears empty and has 10 charges. While holding the pouch, you can take a Magic action to expend 1 charge, name any nonmagical food seasoning (such as salt, pepper, saffron, or cilantro), and remove a pinch of the desired seasoning from the pouch. A pinch is enough to season a single meal. The pouch regains 1d6 + 4 expended charges daily at dawn."
  },
  {
    "name": "Horn of Blasting",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "You can take a Magic action to blow the horn, which emits a thunderous blast in a 30-foot Cone [Area of Effect] that is audible out to 600 feet. Each creature in the Cone [Area of Effect] makes a 15 Constitution saving throw. On a failed save, a creature takes 5d8 Thunder damage and has the Deafened condition for 1 minute. On a successful save, a creature takes half as much damage only. Glass or crystal objects in the Cone [Area of Effect] that aren't being worn or carried take 10d8 Thunder damage. Each use of the horn's magic has a 20 chance of causing the horn to explode. The explosion deals 10d6 Force damage to the user and destroys the horn."
  },
  {
    "name": "Horn of Silent Alarm",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This horn has 4 charges and regains 1d4 expended charges daily at dawn. As a Magic action, you can blow the horn while expending 1 charge. One creature of your choice hears the horn's blare, provided that creature is within 600 feet of the horn. No other creature hears the horn."
  },
  {
    "name": "Horn of Valhalla, Brass",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "You can take a Magic action to blow this horn. In response, warrior spirits from the plane of Ysgard appear in unoccupied spaces within 60 feet of you. Each spirit uses the Berserker stat block and returns to Ysgard after 1 hour or when it drops to 0 Hit Points. The spirits look like living, breathing warriors, and they have Immunity to the Charmed and Frightened conditions. Once you use the horn, it can't be used again until 7 days have passed. A brass horn summons 3 Berserker. To use the brass horn, you must have Proficiency with all Simple weapons. If you blow the horn without meeting its requirement, the summoned Berserker attack you. If you meet the requirement, they are Friendly [Attitude] to you and your allies and follow your commands."
  },
  {
    "name": "Horn of Valhalla, Bronze",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "You can take a Magic action to blow this horn. In response, warrior spirits from the plane of Ysgard appear in unoccupied spaces within 60 feet of you. Each spirit uses the Berserker stat block and returns to Ysgard after 1 hour or when it drops to 0 Hit Points. The spirits look like living, breathing warriors, and they have Immunity to the Charmed and Frightened conditions. Once you use the horn, it can't be used again until 7 days have passed. A bronze horn summons 4 Berserker. To use the bronze horn, you must have training with all Medium armor. If you blow the horn without meeting its requirement, the summoned Berserker attack you. If you meet the requirement, they are Friendly [Attitude] to you and your allies and follow your commands."
  },
  {
    "name": "Horn of Valhalla, Iron",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "You can take a Magic action to blow this horn. In response, warrior spirits from the plane of Ysgard appear in unoccupied spaces within 60 feet of you. Each spirit uses the Berserker stat block and returns to Ysgard after 1 hour or when it drops to 0 Hit Points. The spirits look like living, breathing warriors, and they have Immunity to the Charmed and Frightened conditions. Once you use the horn, it can't be used again until 7 days have passed. A iron horn summons 5 Berserker. To use the iron horn, you must have Proficiency with all Martial weapons. If you blow the horn without meeting its requirement, the summoned Berserker attack you. If you meet the requirement, they are Friendly [Attitude] to you and your allies and follow your commands."
  },
  {
    "name": "Horn of Valhalla, Silver",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "You can take a Magic action to blow this horn. In response, warrior spirits from the plane of Ysgard appear in unoccupied spaces within 60 feet of you. Each spirit uses the Berserker stat block and returns to Ysgard after 1 hour or when it drops to 0 Hit Points. The spirits look like living, breathing warriors, and they have Immunity to the Charmed and Frightened conditions. Once you use the horn, it can't be used again until 7 days have passed. A silver horn summons 2 Berserker. They are Friendly [Attitude] to you and your allies and follow your commands."
  },
  {
    "name": "Horseshoes of a Zephyr",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "These horseshoes come in a set of four. As a Magic action, you can touch one of the horseshoes to the hoof of a horse or similar creature, whereupon the horseshoe affixes itself to the hoof. Removing a horseshoe also takes a Magic action. While all four shoes are affixed to the hooves of a horse or similar creature, they allow the creature to move normally while floating 4 inches above a surface. This effect means the creature can cross or stand above nonsolid or unstable surfaces, such as water or lava. The creature leaves no tracks and ignores Difficult Terrain. In addition, the creature can travel for up to 12 hours a day without gaining Exhaustion levels from extended travel."
  },
  {
    "name": "Horseshoes of Speed",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "These horseshoes come in a set of four. As a Magic action, you can touch one of the horseshoes to the hoof of a horse or similar creature, whereupon the horseshoe affixes itself to the hoof. Removing a horseshoe also takes a Magic action. While all four horseshoes are attached to the same creature, its Speed is increased by 30 feet."
  },
  {
    "name": "Immovable Rod",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This iron rod has a button on one end. You can take a Utilize action to press the button, which causes the rod to become magically fixed in place. Until you or another creature takes a Utilize action to push the button again, the rod doesn't move, even if it defies gravity. The rod can hold up to 8,000 pounds of weight. More weight causes the rod to deactivate and fall. A creature can take a Utilize action to make a 30 Strength (Athletics) check, moving the fixed rod up to 10 feet on a successful check."
  },
  {
    "name": "Instrument of Illusions",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While you are playing this musical instrument, you can take a Magic action to create harmless, illusory visual effects within a 5-foot Emanation [Area of Effect] originating from the instrument. If you are a Bard, the size of the Emanation [Area of Effect] increases to 15 feet. Sample visual effects include luminous musical notes, a spectral dancer, butterflies, and gently falling snow. The magical effects have neither substance nor sound, and they are obviously illusory. The effects end when you stop playing."
  },
  {
    "name": "Instrument of Scribing",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This musical instrument has 3 charges and regains all expended charges daily at dawn. While you are playing it, you can take a Magic action to expend 1 charge and write a magical message on a nonmagical object or surface that you can see within 30 feet of yourself. The message can be up to six words long and is written in a language you know. If you are a Bard, you can scribe an additional seven words and make the message glow faintly, allowing it to be seen in nonmagical Darkness. Casting the Dispel Magic spell on the message erases it. Otherwise, the message fades away after 24 hours."
  },
  {
    "name": "Instrument of the Bards, Anstruth Harp",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "An Instrument of the Bards is superior to an ordinary instrument in every way. Seven types of these instruments exist, each named after a bard college. A creature that attempts to play the instrument without being attuned to it must succeed on a 15 Wisdom saving throw or take 2d4 Psychic damage. You can play Anstruth Harp to cast one of the following spells: Fly, Invisibility, Levitate, Protection from Evil and Good, Cure Wounds (level 5), Ice Storm, and Wall of Thorns. Once the Anstruth Harp has been used to cast a spell, it can't be used to cast that spell again until the next dawn. The spells use your spellcasting ability and spell save DC."
  },
  {
    "name": "Instrument of the Bards, Canaith Mandolin",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "An Instrument of the Bards is superior to an ordinary instrument in every way. Seven types of these instruments exist, each named after a bard college. A creature that attempts to play the instrument without being attuned to it must succeed on a 15 Wisdom saving throw or take 2d4 Psychic damage. You can play the Canaith Mandolin to cast one of the following spells: Fly, Invisibility, Levitate, Protection from Evil and Good, Cure Wounds (level 3), Dispel Magic, and Protection from Energy (Lightning damage only). Once the Canaith Mandolin has been used to cast a spell, it can't be used to cast that spell again until the next dawn. The spells use your spellcasting ability and spell save DC."
  },
  {
    "name": "Instrument of the Bards, Cli Lyre",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "An Instrument of the Bards is superior to an ordinary instrument in every way. Seven types of these instruments exist, each named after a bard college. A creature that attempts to play the instrument without being attuned to it must succeed on a 15 Wisdom saving throw or take 2d4 Psychic damage. You can play the Cli Lyre to cast one of the following spells: Fly, Invisibility, Levitate, Protection from Evil and Good, Stone Shape, Wall of Fire, and Wind Wall. Once the Cli Lyre has been used to cast a spell, it can't be used to cast that spell again until the next dawn. The spells use your spellcasting ability and spell save DC."
  },
  {
    "name": "Instrument of the Bards, Doss Lute",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "An Instrument of the Bards is superior to an ordinary instrument in every way. Seven types of these instruments exist, each named after a bard college. A creature that attempts to play the instrument without being attuned to it must succeed on a 15 Wisdom saving throw or take 2d4 Psychic damage. You can play the Doss Lute to cast one of the following spells: Fly, Invisibility, Levitate, Protection from Evil and Good, Animal Friendship, Protection from Energy (Fire damage only), and Protection from Poison. Once the Doss Lute has been used to cast a spell, it can't be used to cast that spell again until the next dawn. The spells use your spellcasting ability and spell save DC."
  },
  {
    "name": "Instrument of the Bards, Fochlucan Bandore",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "An Instrument of the Bards is superior to an ordinary instrument in every way. Seven types of these instruments exist, each named after a bard college. A creature that attempts to play the instrument without being attuned to it must succeed on a 15 Wisdom saving throw or take 2d4 Psychic damage. You can play the Fochlucan Bandore to cast one of the following spells: Fly, Invisibility, Levitate, Protection from Evil and Good, Entangle, Faerie Fire, Shillelagh, and Speak with Animals. Once the Fochlucan Bandore has been used to cast a spell, it can't be used to cast that spell again until the next dawn. The spells use your spellcasting ability and spell save DC."
  },
  {
    "name": "Instrument of the Bards, Mac-Fuirmidh Cittern",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "An Instrument of the Bards is superior to an ordinary instrument in every way. Seven types of these instruments exist, each named after a bard college. A creature that attempts to play the instrument without being attuned to it must succeed on a 15 Wisdom saving throw or take 2d4 Psychic damage. You can play the Mac-Fuirmidh Cittern to cast one of the following spells: Fly, Invisibility, Levitate, Protection from Evil and Good, Barkskin, Cure Wounds, and Fog Cloud. Once the Mac-Fuirmidh Cittern has been used to cast a spell, it can't be used to cast that spell again until the next dawn. The spells use your spellcasting ability and spell save DC."
  },
  {
    "name": "Instrument of the Bards, Ollamh Harp",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "An Instrument of the Bards is superior to an ordinary instrument in every way. Seven types of these instruments exist, each named after a bard college. A creature that attempts to play the instrument without being attuned to it must succeed on a 15 Wisdom saving throw or take 2d4 Psychic damage. You can play the Ollamh Harp to cast one of the following spells: Fly, Invisibility, Levitate, Protection from Evil and Good, Confusion, Control Weather, and Fire Storm. Once the Ollamh Harp has been used to cast a spell, it can't be used to cast that spell again until the next dawn. The spells use your spellcasting ability and spell save DC."
  },
  {
    "name": "Ioun Stone, Absorption",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "{#itemEntry Ioun Stone|XDMG} While this pale lavender ellipsoid orbits your head, you can take a Reaction to cancel a spell of level 4 or lower cast by a creature you can see. A canceled spell has no effect, and any resources used to cast it are wasted. Once the stone has canceled 20 levels of spells, it burns out, turns dull gray, and loses its magic."
  },
  {
    "name": "Ioun Stone, Agility",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "{#itemEntry Ioun Stone|XDMG} Your Dexterity increases by 2, to a maximum of 20, while this deep-red sphere orbits your head."
  },
  {
    "name": "Ioun Stone, Awareness",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "{#itemEntry Ioun Stone|XDMG} While this dark-blue rhomboid orbits your head, you have Advantage on Initiative rolls and Wisdom (Perception) checks."
  },
  {
    "name": "Ioun Stone, Fortitude",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "{#itemEntry Ioun Stone|XDMG} Your Constitution increases by 2, to a maximum of 20, while this pink rhomboid orbits your head."
  },
  {
    "name": "Ioun Stone, Greater Absorption",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "{#itemEntry Ioun Stone|XDMG} While this marbled lavender and green ellipsoid orbits your head, you can take a Reaction to cancel a spell of level 8 or lower cast by a creature you can see. A canceled spell has no effect, and any resources used to cast it are wasted. Once the stone has canceled 20 levels of spells, it burns out, turns dull gray, and loses its magic."
  },
  {
    "name": "Ioun Stone, Insight",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "{#itemEntry Ioun Stone|XDMG} Your Wisdom increases by 2, to a maximum of 20, while this incandescent blue sphere orbits your head."
  },
  {
    "name": "Ioun Stone, Intellect",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "{#itemEntry Ioun Stone|XDMG} Your Intelligence increases by 2, to a maximum of 20, while this marbled scarlet and blue sphere orbits your head."
  },
  {
    "name": "Ioun Stone, Leadership",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "{#itemEntry Ioun Stone|XDMG} Your Charisma increases by 2, to a maximum of 20, while this marbled pink and green sphere orbits your head."
  },
  {
    "name": "Ioun Stone, Mastery",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "{#itemEntry Ioun Stone|XDMG} Your Proficiency increases by 1 while this pale green prism orbits your head."
  },
  {
    "name": "Ioun Stone, Protection",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "{#itemEntry Ioun Stone|XDMG} You gain a +1 bonus to Armor Class while this dusty-rose prism orbits your head."
  },
  {
    "name": "Ioun Stone, Regeneration",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "{#itemEntry Ioun Stone|XDMG} You regain 15 Hit Points at the end of each hour this pearly white spindle orbits your head if you have at least 1 Hit Points."
  },
  {
    "name": "Ioun Stone, Reserve",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "{#itemEntry Ioun Stone|XDMG} This vibrant purple prism stores spells cast into it, holding them until you use them. The stone can store up to 4 levels of spells at a time. When found, it contains 1d4 levels of stored spells chosen by the DM. Any creature can cast a spell of level 1 through 4 into the stone by touching it as the spell is cast. The spell has no effect, other than to be stored in the stone. If the stone can't hold the spell, the spell is expended without effect. The level of the slot used to cast the spell determines how much space it uses. While this stone orbits your head, you can cast any spell stored in it. The spell uses the slot level, spell save DC, spell attack bonus, and spellcasting ability of the original caster but is otherwise treated as if you cast the spell. The spell cast from the stone is no longer stored in it, freeing up space."
  },
  {
    "name": "Ioun Stone, Strength",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "{#itemEntry Ioun Stone|XDMG} Your Strength increases by 2, to a maximum of 20, while this pale blue rhomboid orbits your head."
  },
  {
    "name": "Ioun Stone, Sustenance",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "{#itemEntry Ioun Stone|XDMG} You don't need to eat or drink while this clear spindle orbits your head."
  },
  {
    "name": "Iron Bands of Bilarro",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This rusty iron sphere measures 3 inches in diameter and weighs 1 pound. You can take a Magic action to throw the sphere at a Huge or smaller creature you can see within 60 feet of yourself. As the sphere moves through the air, it opens into a tangle of metal bands. Make a ranged attack roll with an attack bonus equal to your Dexterity modifier plus your Proficiency. On a hit, the target has the Restrained condition until you take a Bonus Action to issue a command that releases it. Doing so or missing with the attack causes the bands to contract and become a sphere once more. A creature that can touch the bands, including the one Restrained, can take an action to make a 20 Strength (Athletics) check to break the iron bands. On a successful check, the item is destroyed, and the Restrained creature is freed. On a failed check, any further attempts made by that creature automatically fail until 24 hours have elapsed. Once the bands are used, they can't be used again until the next dawn."
  },
  {
    "name": "Iron Flask",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While holding this brass-stoppered iron flask, you can take a Magic action to target a creature that you can see within 60 feet of yourself. If the flask is empty and the target is native to a plane of existence other than the one you're on, the target must succeed on a 17 Wisdom saving throw or be trapped in the flask. If the target has been trapped by the flask before, it has Advantage on the save. Once trapped, a creature remains in the flask until released. The flask can hold only one creature at a time. A creature trapped in the flask doesn't age and doesn't need to breathe, eat, or drink. You can take a Magic action to remove the flask's stopper and release the creature in the flask. The creature then obeys your commands for 1 hour, understanding those commands even if it doesn't know the language in which the commands are given. If you issue no commands or give the creature a command that is likely to result in its death or imprisonment, it defends itself but otherwise takes no actions. At the end of the duration, the creature acts in accordance with its normal disposition and alignment. An Identify spell reveals if the flask contains a creature, but the only way to determine the type of creature is to open the flask. A newly discovered Iron Flask might already contain a creature chosen by the DM or determined randomly by rolling on the following table (see the Monster Manual for the creature's stat block)."
  },
  {
    "name": "Javelin of Lightning",
    "rarity": "uncommon",
    "itemType": "weapon",
    "requiresAttunement": false,
    "description": "Each time you make an attack roll with this magic weapon and hit, you can have it deal Lightning damage instead of Piercing damage. **Lightning Bolt:** When you throw this weapon at a target no farther than 120 feet from you, you can forgo making a ranged attack roll and instead turn the weapon into a bolt of lightning. This bolt forms a 5-foot-wide Line [Area of Effect] between you and the target. The target and each other creature in the Line [Area of Effect] (excluding you) makes a 13 Dexterity saving throw, taking 4d6 Lightning damage on a failed save or half as much damage on a successful one. Immediately after dealing this damage, the weapon reappears in your hand. This property can't be used again until the next dawn."
  },
  {
    "name": "Keoghtom's Ointment",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This glass jar, 3 inches in diameter, contains 1d4 + 1 doses of a thick mixture that smells faintly of aloe. The jar and its contents weigh 1/2 pound. As a Utilize action, you can swallow one dose of the ointment or apply it to a creature within 5 feet of yourself. The creature that receives it regains 2d8 + 2 Hit Points and ceases to have the Poisoned condition."
  },
  {
    "name": "Lantern of Revealing",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While lit, this hooded lantern burns for 6 hours on 1 pint of oil, shedding Bright Light in a 30-foot radius and Dim Light for an additional 30 feet. Invisible creatures and objects are visible as long as they are in the lantern's Bright Light. You can take a Utilize action to lower the hood, reducing the lantern's light to Dim Light in a 5-foot radius."
  },
  {
    "name": "Lock of Trickery",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This lock appears to be an ordinary Lock (of the type described in chapter 6 of the Player's Handbook) and comes with a single key. The tumblers in this lock magically adjust to thwart burglars. Dexterity checks made to pick the lock have Disadvantage."
  },
  {
    "name": "Lute of Thunderous Thumping",
    "rarity": "very rare",
    "itemType": "weapon",
    "requiresAttunement": false,
    "description": "This reinforced lute can be wielded as a magic Club that deals an extra 2d8 Thunder damage on a hit. **Sing and Swing:** If you're a Bard, you can use your Charisma modifier instead of your Strength modifier when making a melee attack roll with the lute, provided you sing or hum while making the attack."
  },
  {
    "name": "Mace of Disruption",
    "rarity": "rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "When you hit a Fiend or an Undead with this magic weapon, that creature takes an extra 2d6 Radiant damage. If the target has 25 Hit Points or fewer after taking this damage, it must succeed on a 15 Wisdom saving throw or be destroyed. On a successful save, the creature has the Frightened condition until the end of your next turn. **Light:** While you hold this weapon, it sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet."
  },
  {
    "name": "Mace of Smiting",
    "rarity": "rare",
    "itemType": "weapon",
    "requiresAttunement": false,
    "description": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon. The bonus increases to +3 when you use the weapon to attack a Construct. When you roll a 20 on an attack roll made with this weapon, the target takes an extra 7 Bludgeoning damage, or 14 Bludgeoning damage if it's a Construct. If a Construct has 25 Hit Points or fewer after taking this damage, it is destroyed."
  },
  {
    "name": "Mace of Terror",
    "rarity": "rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "This magic weapon has 3 charges and regains 1d3 expended charges daily at dawn. While holding the weapon, you can take a Magic action and expend 1 charge to release a wave of terror from it. Each creature of your choice within 30 feet of you must succeed on a 15 Wisdom saving throw or have the Frightened condition for 1 minute. While Frightened in this way, a creature must spend its turns trying to move as far away from you as it can, and it can't make Opportunity Attack. For its action, it can use only the Dash action or try to escape from an effect that prevents it from moving. If it has nowhere it can move, the creature can take the Dodge action. At the end of each of its turns, a creature repeats the save, ending the effect on itself on a success."
  },
  {
    "name": "Mantle of Spell Resistance",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "You have Advantage on saving throws against spells while you wear this cloak."
  },
  {
    "name": "Manual of Bodily Health",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This book contains health and diet tips, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book's contents and practicing its guidelines, your Constitution increases by 2, to a maximum of 30. The manual then loses its magic, but regains it in a century."
  },
  {
    "name": "Manual of Clay Golems",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This tome contains information and incantations necessary to make a clay golem. To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. A creature that can't use a manual of golems and attempts to read it takes 6d6 psychic damage. To create a clay golem, you must spend 30 days, working without interruption with the manual at hand and resting no more than 8 hours per day. You must also pay 65,000 gp to purchase supplies. Once you finish creating the golem, the book is consumed in eldritch flames. The golem becomes animate when the ashes of the manual are sprinkled on it. It is under your control, and it understands and obeys your spoken commands."
  },
  {
    "name": "Manual of Flesh Golems",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This tome contains information and incantations necessary to make a flesh golem. To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. A creature that can't use a manual of golems and attempts to read it takes 6d6 psychic damage. To create a flesh golem, you must spend 60 days, working without interruption with the manual at hand and resting no more than 8 hours per day. You must also pay 50,000 gp to purchase supplies. Once you finish creating the golem, the book is consumed in eldritch flames. The golem becomes animate when the ashes of the manual are sprinkled on it. It is under your control, and it understands and obeys your spoken commands."
  },
  {
    "name": "Manual of Gainful Exercise",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This book describes fitness exercises, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book's contents and practicing its guidelines, your Strength increases by 2, to a maximum of 30. The manual then loses its magic, but regains it in a century."
  },
  {
    "name": "Manual of Iron Golems",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This tome contains information and incantations necessary to make a iron golem. To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. A creature that can't use a manual of golems and attempts to read it takes 6d6 psychic damage. To create an iron golem, you must spend 120 days, working without interruption with the manual at hand and resting no more than 8 hours per day. You must also pay 100,000 gp to purchase supplies. Once you finish creating the golem, the book is consumed in eldritch flames. The golem becomes animate when the ashes of the manual are sprinkled on it. It is under your control, and it understands and obeys your spoken commands."
  },
  {
    "name": "Manual of Quickness of Action",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This book contains coordination and balance exercises, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book's contents and practicing its guidelines, your Dexterity increases by 2, to a maximum of 30. The manual then loses its magic, but regains it in a century."
  },
  {
    "name": "Manual of Stone Golems",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This tome contains information and incantations necessary to make a stone golem. To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. A creature that can't use a manual of golems and attempts to read it takes 6d6 psychic damage. To create a stone golem, you must spend 90 days, working without interruption with the manual at hand and resting no more than 8 hours per day. You must also pay 80,000 gp to purchase supplies. Once you finish creating the golem, the book is consumed in eldritch flames. The golem becomes animate when the ashes of the manual are sprinkled on it. It is under your control, and it understands and obeys your spoken commands."
  },
  {
    "name": "Medallion of Thoughts",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "The medallion has 5 charges. While wearing it, you can expend 1 charge to cast Detect Thoughts (save 13) from it. The medallion regains 1d4 expended charges daily at dawn."
  },
  {
    "name": "Mirror of Life Trapping",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When this 4-foot-tall, 2-foot-wide mirror is viewed indirectly, its surface shows faint images of creatures. The mirror weighs 50 pounds, and it has AC 11, HP 10, Immunity to Poison and Psychic damage, and Vulnerability to Bludgeoning damage. It shatters and is destroyed when reduced to 0 Hit Points. If the mirror is hanging on a vertical surface and you are within 5 feet of it, you can take a Magic action and use a command word to activate it. It remains activated until you take a Magic action and repeat the command word to deactivate it. Any creature other than you that sees its reflection in the activated mirror while within 30 feet of the mirror must succeed on a 15 Charisma saving throw or be trapped, along with anything it is wearing or carrying, in one of the mirror's twelve extradimensional cells. A creature that knows the mirror's nature makes the save with Advantage, and Constructs succeed on the save automatically. An extradimensional cell is an infinite expanse filled with thick fog that reduces visibility to 10 feet. Creatures trapped in the mirror's cells don't age, and they don't need to eat, drink, or sleep. A creature trapped within a cell can escape using magic that permits planar travel. Otherwise, the creature is confined to the cell until freed. If the mirror traps a creature but its twelve extradimensional cells are already occupied, the mirror frees one trapped creature at random to accommodate the new prisoner. A freed creature appears in an unoccupied space within sight of the mirror but facing away from it. If the mirror is shattered, all creatures it contains are freed and appear in unoccupied spaces near it. While within 5 feet of the mirror, you can take a Magic action to name one creature trapped in it or call out a particular cell by number. The creature named or contained in the named cell appears as an image on the mirror's surface. You and the creature can then communicate. In a similar way, you can take a Magic action and use a second command word to free one creature trapped in the mirror. The freed creature appears, along with its possessions, in the unoccupied space nearest to the mirror and facing away from it. Placing the mirror inside an extradimensional space created by a Bag of Holding, Portable Hole, or similar item instantly destroys both items and opens a gate to the Astral Plane. The gate originates where the one item was placed inside the other. Any creature within 10 feet of the gate and not behind Cover is sucked through it to a random location on the Astral Plane. The gate then closes. The gate is one-way only and can't be reopened."
  },
  {
    "name": "Mystery Key",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A question mark is worked into the head of this key. The key has a 5 chance of unlocking any lock into which it's inserted. Once it unlocks something, the key disappears."
  },
  {
    "name": "Nature's Mantle",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This cloak shifts color and texture to blend with the terrain surrounding you. While wearing the cloak, you can use it as a Spellcasting Focus for your Druid and Ranger spells. While you are in an area that is Lightly Obscured, you can Hide as a Bonus Action even if you are being directly observed."
  },
  {
    "name": "Necklace of Adaptation",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this necklace, you can breathe normally in any environment, and you have Advantage on saving throws made to avoid or end the Poisoned condition."
  },
  {
    "name": "Necklace of Fireballs",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This necklace has 1d6 + 3 beads hanging from it. You can take a Magic action to detach a bead and throw it up to 60 feet away. When it reaches the end of its trajectory, the bead detonates as a level 3 Fireball (save 15). You can hurl multiple beads, or even the whole necklace, at one time. When you do so, increase the damage of the Fireball by 1d6 for each bead after the first (maximum 12d6)."
  },
  {
    "name": "Necklace of Prayer Beads",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This necklace has 1d4 + 2 magic beads made from aquamarine, black pearl, or topaz. It also has many nonmagical beads made from stones such as amber, bloodstone, citrine, coral, jade, pearl, or quartz. If a magic bead is removed from the necklace, that bead loses its magic. Six types of magic beads exist. The DM decides the type of each bead on the necklace or determines it randomly by rolling on the table below. A necklace can have more than one bead of the same type. To use one, you must be wearing the necklace. Each bead contains a spell that you can cast from it as a Bonus Action (using your spell save DC if a save is necessary). Once a magic bead's spell is cast, that bead can't be used again until the next dawn."
  },
  {
    "name": "Nolzur's Marvelous Pigments",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This fine wooden box contains 1d4 pots of pigment and a brush (weighing 1 pound in total). Using the brush and expending 1 pot of pigment, you can paint any number of three-dimensional objects and terrain features (such as walls, doors, trees, flowers, weapons, webs, and pits), provided these elements are all confined to a 20-foot Cube [Area of Effect]. The effort takes 10 minutes (regardless of the number of elements you create), during which time you must remain in the Cube [Area of Effect], and requires Concentration. If your Concentration is broken or you leave the Cube [Area of Effect] before the work is done, all the painted elements vanish, and the pot of pigment is wasted. When the work is done, all the painted objects and terrain features become real. Thus, painting a door on a wall creates an actual door, which can be opened to whatever is beyond. Painting a pit creates a real pit, the entire depth of which must lie within the 20-foot Cube [Area of Effect]. No object created by a pot of pigment can have a value greater than 25 GP, and the total value of all objects created by a pot of pigment can't exceed 500 GP. If you paint objects of greater value (such as a large pile of gold), they look authentic, but close inspection reveals they're made from paste, cookies, or some other worthless material. If you paint a form of energy such as fire or lightning, the energy dissipates as soon as you complete the painting, doing no harm."
  },
  {
    "name": "Oil of Etherealness",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "One vial of this oil can cover one Medium or smaller creature, along with the equipment it's wearing and carrying (one additional vial is required for each size category above Medium). Applying the oil takes 10 minutes. The affected creature then gains the effect of the Etherealness spell for 1 hour. Beads of this cloudy, gray oil form on the outside of its container and quickly evaporate."
  },
  {
    "name": "Oil of Sharpness",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "One vial of this oil can coat one Melee weapon or twenty pieces of ammunition, but only ammunition and Melee weapons that are nonmagical and deal Slashing or Piercing damage are affected. Applying the oil takes 1 minute, after which the oil magically seeps into whatever it coats, turning the coated weapon into a +3 Weapon or the coated ammunition into +3 Ammunition. This clear, gelatinous oil sparkles with tiny, ultrathin silver shards."
  },
  {
    "name": "Oil of Slipperiness",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "One vial of this oil can cover one Medium or smaller creature, along with the equipment it's wearing and carrying (one additional vial is required for each size category above Medium). Applying the oil takes 10 minutes. The affected creature then gains the effect of the Freedom of Movement spell for 8 hours. Alternatively, the oil can be poured on the ground as a Magic action, where it covers a 10-foot square, duplicating the effect of the Grease spell in that area for 8 hours. This sticky, black unguent is thick and heavy, but it flows quickly when poured."
  },
  {
    "name": "Orb of Direction",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This orb can be used as an Arcane Focus. While holding this orb, you can take a Magic action to determine which way is magnetic north. Nothing happens if the orb is used in a location that has no magnetic north."
  },
  {
    "name": "Orb of Dragonkind",
    "rarity": "artifact",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "Long ago, in the Dragonlance setting, elves and humans waged a terrible war against chromatic dragons. When the world seemed doomed, the wizards of the Towers of High Sorcery came together and forged five Orbs of Dragonkind to help defeat the dragons. One orb was taken to each of the five towers, and there they were used to speed the war toward a victorious end. The wizards used the orbs to lure dragons to them, then destroyed the dragons with powerful magic. As the Towers of High Sorcery fell in later ages, the orbs were destroyed or faded into legend, and only three are thought to survive. Their magic has been warped over the centuries. Their primary purpose of calling dragons still functions, but they also allow some measure of control over dragons. Each orb contains the essence of an evil dragon, a presence that resents any attempt to coax magic from it. Those who try to wield an orb's magic but lack sufficient force of personality might find themselves under the orb's control. An orb is an etched crystal globe about 10 inches in diameter. When used, it grows to about 20 inches in diameter, and mist swirls inside it. While attuned to an orb, you can take a Magic action to peer into the orb's depths. You must then make a 15 Charisma saving throw. On a successful save, you control the orb for as long as you remain attuned to it. On a failed save, the orb imposes the Charmed condition on you for as long as you remain attuned to it. While you are Charmed by the orb, you can't voluntarily end your Attunement to it, and the orb casts Suggestion on you at will (save 18), urging you to work toward the evil ends it desires. The dragon essence within the orb might want many things: the annihilation of a particular society or organization, freedom from the orb, to spread suffering in the world, to advance the worship of Tiamat, or something else the DM decides. **Random Properties:** An Orb of Dragonkind has the following random properties: 2 Artifact Properties; Minor Beneficial Properties properties 1 Artifact Properties; Minor Detrimental Properties property 1 Artifact Properties; Major Detrimental Properties property **Spells:** The orb has 7 charges and regains 1d4 + 3 expended charges daily at dawn. If you control the orb, you can cast one of the spells on the following table from it. The table indicates how many charges you must expend to cast the spell. **Call Dragons:** While you control the orb, you can take a Magic action to cause the orb to issue a telepathic call that extends in all directions for 40 miles. Chromatic dragons in range feel compelled to come to the orb as soon as possible by the most direct route. Dragon deities such as Tiamat are unaffected by this call. Chromatic dragons drawn to the orb might be Hostile [Attitude] toward you for compelling them against their will. Once you have used this property, it can't be used again for 1 hour. **Destroying an Orb:** An Orb of Dragonkind has AC 20 and is destroyed if it takes damage from a +3 Weapon or a Disintegrate spell. Nothing else can harm it."
  },
  {
    "name": "Orb of Time",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This orb can be used as an Arcane Focus. While holding the orb, you can take a Magic action to determine whether it is morning, afternoon, evening, or nighttime. This property functions only on the Material Plane."
  },
  {
    "name": "Pearl of Power",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While this pearl is on your person, you can take a Magic action to regain one expended spell slot of level 3 or lower. Once you use the pearl, it can't be used again until the next dawn."
  },
  {
    "name": "Perfume of Bewitching",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This tiny vial contains magic perfume, enough for one use. You can take a Magic action to apply the perfume to yourself, and its effect lasts 1 hour. For the duration, you have Advantage on all Charisma (Deception and Persuasion) checks made to influence a creature within 5 feet of yourself."
  },
  {
    "name": "Periapt of Health",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this pendant, you can take a Magic action to regain 2d4 + 2 Hit Points. Once used, this property can't be used again until the next dawn. In addition, you have Advantage on saving throws to avoid or end the Poisoned condition while you wear this pendant."
  },
  {
    "name": "Periapt of Proof against Poison",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This delicate silver chain has a brilliant-cut black gem pendant. While you wear it, you have Immunity to the Poisoned condition and Poison damage."
  },
  {
    "name": "Periapt of Wound Closure",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this pendant, you gain the following benefits. **Life Preservation:** Whenever you make a Death Saving Throw, you can change a roll of 9 or lower to a 10, turning a failed save into a successful one. **Natural Healing Boost:** Whenever you roll a Hit Point Dice to regain Hit Points, double the number of Hit Points it restores."
  },
  {
    "name": "Philter of Love",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "The next time you see a creature within 10 minutes after drinking this philter, you are charmed by that creature and have the Charmed condition for 1 hour. This rose-hued, effervescent liquid contains one easy-to-miss bubble shaped like a heart."
  },
  {
    "name": "Pipe of Smoke Monsters",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While smoking this pipe, you can take a Magic action to exhale a puff of smoke that takes the form of a creature, such as a dragon, a flumph, or a slaad. The form must be small enough to fit in a 1-foot cube and loses its shape after a few seconds, becoming an ordinary puff of smoke."
  },
  {
    "name": "Pipes of Haunting",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "These pipes have 3 charges and regain 1d3 expended charges daily at dawn. You can take a Magic action to play them and expend 1 charge to create an eerie, spellbinding tune. Each creature of your choice within 30 feet of you must succeed on a 15 Wisdom saving throw or have the Frightened condition for 1 minute. A creature that fails the save repeats it at the end of each of its turns, ending the effect on itself on a success. A creature that succeeds on its save is immune to the effect of these pipes for 24 hours."
  },
  {
    "name": "Pipes of the Sewers",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While these pipes are on your person, ordinary rat and giant rat are Indifferent [Attitude] toward you and won't attack you unless you threaten or harm them. The pipes have 3 charges and regain 1d3 expended charges daily at dawn. If you play the pipes as a Magic action, you can take a Bonus Action to expend 1 to 3 charges, calling forth one Swarm of Rats with each expended charge if enough rats are within half a mile of you to be called in this fashion (as determined by the DM). If there aren't enough rats to form a swarm, the charge is wasted. Called swarms move toward the music by the shortest available route but aren't under your control otherwise. Whenever a Swarm of Rats that isn't under another creature's control comes within 30 feet of you while you are playing the pipes, the swarm makes a 15 Wisdom saving throw. On a successful save, the swarm behaves as it normally would and can't be swayed by the pipes' music for the next 24 hours. On a failed save, the swarm is swayed by the pipes' music and becomes Friendly [Attitude] to you and your allies for as long as you continue to play the pipes each round as a Magic action. A Friendly [Attitude] swarm obeys your commands. If you issue no commands to a Friendly [Attitude] swarm, it defends itself but otherwise takes no actions. If a Friendly [Attitude] swarm starts its turn more than 30 feet away from you, your control over that swarm ends, and the swarm behaves as it normally would and can't be swayed by the pipes' music for the next 24 hours."
  },
  {
    "name": "Pole of Angling",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This item functions as a Pole. While holding it, you can take a Magic action to cause it to transform into a fishing pole with a hook, a line, and a reel, or have the fishing pole revert to a Pole."
  },
  {
    "name": "Pole of Collapsing",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This item functions as a Pole. While holding it, you can take a Magic action to collapse it into a 1-foot-long rod for ease of storage (the pole's weight doesn't change) or cause the 1-foot-long rod to revert to a Pole. The rod elongates only as far as the surrounding space allows."
  },
  {
    "name": "Portable Hole",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This fine black cloth, soft as silk, is folded up to the dimensions of a handkerchief. It unfolds into a circular sheet 6 feet in diameter. You can take a Magic action to unfold a Portable Hole and place it on or against a solid surface, whereupon the Portable Hole creates an extradimensional hole 10 feet deep. The cylindrical space within the hole exists on a different plane of existence, so it can't be used to create open passages. Any creature inside an open Portable Hole can exit the hole by climbing out of it. You can take a Magic action to close a Portable Hole by taking hold of the edges of the cloth and folding it up. Folding the cloth closes the hole, and any creatures or objects within remain in the extradimensional space. No matter what's in it, the hole weighs next to nothing. If the hole is folded up, a creature within the hole's extradimensional space can take an action to make a 10 Strength (Athletics) check. On a successful check, the creature forces its way out and appears within 5 feet of the Portable Hole. A closed Portable Hole holds enough air for 1 hour of breathing, divided by the number of breathing creatures inside. Placing a Portable Hole inside an extradimensional space created by a Bag of Holding, Heward's Handy Haversack, or similar item instantly destroys both items and opens a gate to the Astral Plane. The gate originates where the one item was placed inside the other. Any creature within 10 feet of the gate and not behind Cover is sucked through it and deposited in a random location on the Astral Plane. The gate then closes. The gate is one-way only and can't be reopened."
  },
  {
    "name": "Pot of Awakening",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "If you plant an ordinary shrub in this 10-pound clay pot and let it grow for 30 days, the shrub magically transforms into an Awakened Shrub at the end of that time. When the shrub awakens, its roots break the pot, destroying it. The awakened shrub is Friendly [Attitude] toward you and obeys your commands. Absent commands from you, it does nothing."
  },
  {
    "name": "Potion of Acid Resistance",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Potion of Resistance|XDMG}"
  },
  {
    "name": "Potion of Animal Friendship",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, you can cast the level 3 version of the Animal Friendship spell (save 13). Agitating this potion's muddy liquid brings little bits into view: a fish scale, a hummingbird feather, a cat claw, or a squirrel hair."
  },
  {
    "name": "Potion of Clairvoyance",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, you gain the effect of the Clairvoyance spell (no Concentration required). An eyeball bobs in this potion's yellowish liquid but vanishes when the potion is opened."
  },
  {
    "name": "Potion of Climbing",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, you gain a Climb Speed equal to your Speed for 1 hour. During this time, you have Advantage on Strength (Athletics) checks to climb. This potion is separated into brown, silver, and gray layers resembling bands of stone. Shaking the bottle fails to mix the colors."
  },
  {
    "name": "Potion of Cloud Giant Strength",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, your Strength score changes to 27 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a cloud giant."
  },
  {
    "name": "Potion of Cold Resistance",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Potion of Resistance|XDMG}"
  },
  {
    "name": "Potion of Comprehension",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, you gain the effect of the Comprehend Languages spell for 1 hour. This potion's liquid is a clear concoction with bits of salt and soot swirling in it."
  },
  {
    "name": "Potion of Diminution",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, you gain the \"reduce\" effect of the Enlarge/Reduce spell for 1d4 hours (no Concentration required). The red in the potion's liquid continuously contracts to a tiny bead and then expands to color the clear liquid around it. Shaking the bottle fails to interrupt this process."
  },
  {
    "name": "Potion of Fire Breath",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "After drinking this potion, you can take a Bonus Action to exhale fire at a target within 30 feet of yourself. The target makes a 13 Dexterity saving throw, taking 4d6 Fire damage on a failed save or half as much damage on a successful one. The effect ends after you exhale the fire three times or when 1 hour has passed. This potion's orange liquid flickers, and smoke fills the top of the container and wafts out whenever it is opened."
  },
  {
    "name": "Potion of Fire Giant Strength",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, your Strength score changes to 25 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a fire giant."
  },
  {
    "name": "Potion of Fire Resistance",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Potion of Resistance|XDMG}"
  },
  {
    "name": "Potion of Flying",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, you gain a Fly Speed equal to your Speed for 1 hour and can hover. If you're in the air when the potion wears off, you fall unless you have some other means of staying aloft. This potion's clear liquid floats at the top of its container and has cloudy white impurities drifting in it."
  },
  {
    "name": "Potion of Force Resistance",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Potion of Resistance|XDMG}"
  },
  {
    "name": "Potion of Frost Giant Strength",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, your Strength score changes to 23 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a frost giant."
  },
  {
    "name": "Potion of Gaseous Form",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, you gain the effect of the Gaseous Form spell for 1 hour (no Concentration required) or until you end the effect as a Bonus Action. This potion's container seems to hold fog that moves and pours like water."
  },
  {
    "name": "Potion of Greater Healing",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "You regain 4d4 + 4 Hit Points when you drink this potion. The potion's red liquid glimmers when agitated."
  },
  {
    "name": "Potion of Greater Invisibility",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This potion's container looks empty but feels as though it holds liquid. When you drink the potion, you have the Invisible condition for 1 hour."
  },
  {
    "name": "Potion of Growth",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, you gain the \"enlarge\" effect of the Enlarge/Reduce spell for 10 minutes (no Concentration required). The red in the potion's liquid continuously expands from a tiny bead to color the clear liquid around it and then contracts. Shaking the bottle fails to interrupt this process."
  },
  {
    "name": "Potion of Healing",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This potion is a magic item. As a Bonus Action, you can drink it or administer it to another creature within 5 feet of yourself. The creature that drinks the magical red fluid in this vial regains 2d4 + 2 Hit Points. The potion's red liquid glimmers when agitated."
  },
  {
    "name": "Potion of Heroism",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, you gain 10 Temporary Hit Points that last for 1 hour. For the same duration, you are under the effect of the Bless spell (no Concentration required). This potion's blue liquid bubbles and steams as if boiling."
  },
  {
    "name": "Potion of Hill Giant Strength",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, your Strength score changes to 21 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a hill giant."
  },
  {
    "name": "Potion of Invisibility",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This potion's container looks empty but feels as though it holds liquid. When you drink the potion, you have the Invisible condition for 1 hour. The effect ends early if you make an attack roll, deal damage, or cast a spell."
  },
  {
    "name": "Potion of Invulnerability",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "For 1 minute after you drink this potion, you have Resistance to all damage. This potion's syrupy liquid looks like liquefied iron."
  },
  {
    "name": "Potion of Lightning Resistance",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Potion of Resistance|XDMG}"
  },
  {
    "name": "Potion of Longevity",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, your physical age is reduced by 1d6 + 6 years, to a minimum of 13 years. Each time you subsequently drink a Potion of Longevity, there is 10 percent cumulative chance that you instead age by 1d6 + 6 years. Suspended in this amber liquid is a tiny heart that, against all reason, is still beating. These ingredients vanish when the potion is opened."
  },
  {
    "name": "Potion of Mind Reading",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, you gain the effect of the Detect Thoughts spell (save 13) for 10 minutes (no Concentration required). This potion's dense, purple liquid has an ovoid cloud of pink floating in it."
  },
  {
    "name": "Potion of Necrotic Resistance",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Potion of Resistance|XDMG}"
  },
  {
    "name": "Potion of Poison",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This concoction looks, smells, and tastes like a Potion of Healing or another beneficial potion. However, it is actually poison masked by illusion magic. Identify reveals its true nature. If you drink this potion, you take 4d6 Poison damage and must succeed on a 13 Constitution saving throw or have the Poisoned condition for 1 hour."
  },
  {
    "name": "Potion of Poison Resistance",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Potion of Resistance|XDMG}"
  },
  {
    "name": "Potion of Psychic Resistance",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Potion of Resistance|XDMG}"
  },
  {
    "name": "Potion of Pugilism",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "After you drink this potion, each Unarmed Strike you make deals an extra 1d6 Force damage on a hit. This effect lasts 10 minutes. This potion is a thick green fluid that tastes like spinach."
  },
  {
    "name": "Potion of Radiant Resistance",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Potion of Resistance|XDMG}"
  },
  {
    "name": "Potion of Speed",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, you gain the effect of the Haste spell for 1 minute (no Concentration required) without suffering the wave of lethargy that typically occurs when the effect ends. This potion's yellow fluid is streaked with black and swirls on its own."
  },
  {
    "name": "Potion of Stone Giant Strength",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, your Strength score changes to 23 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a stone giant."
  },
  {
    "name": "Potion of Storm Giant Strength",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, your Strength score changes to 29 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a storm giant."
  },
  {
    "name": "Potion of Superior Healing",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "You regain 8d4 + 8 Hit Points when you drink this potion. The potion's red liquid glimmers when agitated."
  },
  {
    "name": "Potion of Supreme Healing",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "You regain 10d4 + 20 Hit Points when you drink this potion. The potion's red liquid glimmers when agitated."
  },
  {
    "name": "Potion of Thunder Resistance",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Potion of Resistance|XDMG}"
  },
  {
    "name": "Potion of Vitality",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you drink this potion, it removes any Exhaustion levels you have and ends the Poisoned condition on you. For the next 24 hours, you regain the maximum number of Hit Points for any Hit Point Dice you spend. This potion's crimson liquid regularly pulses with dull light, calling to mind a heartbeat."
  },
  {
    "name": "Potion of Water Breathing",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "You can breathe underwater for 24 hours after drinking this potion. This potion's cloudy green fluid smells of the sea and has a jellyfish-like bubble floating in it."
  },
  {
    "name": "Prosthetic Limb",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This magic item replaces a lost limb—a hand, an arm, a foot, a leg, or a similar body part. While the prosthetic is attached, it functions identically to the part it replaces. You can detach or reattach it as a Magic action, and it can't be removed against your will while you are alive."
  },
  {
    "name": "Quaal's Feather Token, Anchor",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This object looks like a feather. You can take a Magic action to touch the token to a boat or ship. For the next 24 hours, the vessel can't be moved by any means. Touching the token to the vessel again ends the effect. When the effect ends, the token disappears."
  },
  {
    "name": "Quaal's Feather Token, Bird",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This object looks like a feather. You can take a Magic action to toss the token 5 feet into the air. The token disappears and an enormous, multicolored bird takes its place. The bird has the statistics of a Roc, but it can't attack. It obeys your simple commands and can carry up to 500 pounds while flying at its maximum speed (16 miles per hour for a maximum of 144 miles per day, with a 1-hour rest for every 3 hours of flying) or 1,000 pounds at half that speed. The bird disappears after flying its maximum distance for a day or if it drops to 0 Hit Points. You can dismiss the bird as a Magic action."
  },
  {
    "name": "Quaal's Feather Token, Fan",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This object looks like a feather. If you are on a boat or ship, you can take a Magic action to toss the token up to 10 feet in the air. The token disappears, and a giant flapping fan takes its place. The fan floats and creates a strong wind. This wind can fill the sails of one ship, increasing its speed by 5 miles per hour for 8 hours. You can dismiss the fan as a Magic action."
  },
  {
    "name": "Quaal's Feather Token, Swan Boat",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This object looks like a feather. You can take a Magic action to touch the token to a body of water at least 60 feet in diameter. The token disappears, and a 50-foot-long, 20-foot-wide boat shaped like a swan takes its place. The boat is self-propelled and moves across water at a speed of 6 miles per hour. You can take a Magic action while on the boat to command it to move or to turn up to 90 degrees. The boat remains for 24 hours and then disappears. You can dismiss the boat as a Magic action."
  },
  {
    "name": "Quaal's Feather Token, Tree",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This object looks like a feather. You must be outdoors to use this token. You can take a Magic action to touch it to an unoccupied space on the ground. The token disappears, and in its place a nonmagical oak tree springs into existence. The tree is 60 feet tall and has a 5-foot-diameter trunk, and its branches at the top spread out in a 20-foot radius."
  },
  {
    "name": "Quaal's Feather Token, Whip",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This object looks like a feather. You can take a Magic action to throw the token to a point within 10 feet of yourself. The token disappears, and a floating whip takes its place. You can then take a Bonus Action to make a melee spell attack against a creature within 10 feet of the whip, with an attack bonus of +9. On a hit, the target takes 1d6 + 5 Force damage. As a Bonus Action, you can direct the whip to fly up to 20 feet and repeat the attack against a creature within 10 feet of the whip. The whip disappears after 1 hour, when you take a Magic action to dismiss it, or when you die or have the Incapacitated condition."
  },
  {
    "name": "Quarterstaff of the Acrobat",
    "rarity": "very rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "You have a +2 bonus to attack rolls and damage rolls made with this magic weapon. While holding this weapon, you can cause it to emit green Dim Light out to 10 feet, either as a Bonus Action or after you roll Initiative, or you can extinguish the light as a Bonus Action. While holding this weapon, you can take a Bonus Action to alter its form, turning it into a 6-inch rod (for ease of storage) or a 10-foot pole, or reverting it a Quarterstaff; the weapon will elongate only as far as the surrounding space allows. In certain forms, the weapon has the following additional properties. **Acrobatic Assist (Quarterstaff and 10-Foot Pole Forms Only):** While holding this weapon, you have Advantage on Dexterity (Acrobatics) checks. **Attack Deflection (Quarterstaff Form Only):** When you are hit by an attack while holding the weapon, you can take a Reaction to twirl the weapon around you, gaining a +5 bonus to your Armor Class against the triggering attack, potentially causing the attack to miss you. You can't use this property again until you finish a Short Rest or Long Rest. **Ranged Weapon (Quarterstaff Form Only):** This weapon has T with a normal range of 30 feet and a long range of 120 feet. Immediately after you make a ranged attack with the weapon, it flies back to your hand."
  },
  {
    "name": "Quiver of Ehlonna",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "Each of the quiver's three compartments connects to an extradimensional space that allows the quiver to hold numerous items while never weighing more than 2 pounds. The shortest compartment can hold up to 60 Arrow, Bolt, or similar objects. The midsize compartment holds up to 18 Javelin or similar objects. The longest compartment holds up to 6 long objects, such as bows, Quarterstaff, or Spear. You can draw any item the quiver contains as if doing so from a regular quiver or scabbard."
  },
  {
    "name": "Red Dragon Scale Mail",
    "rarity": "very rare",
    "itemType": "armor",
    "requiresAttunement": true,
    "description": "{#itemEntry Dragon Scale Mail|XDMG}"
  },
  {
    "name": "Ring of Acid Resistance",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Ring of Resistance|XDMG}"
  },
  {
    "name": "Ring of Animal Influence",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This ring has 3 charges, and it regains 1d3 expended charges daily at dawn. While wearing the ring, you can expend 1 charge to cast one of the following spells (save 13) from it: Animal Friendship Fear (affects Beasts only) Speak with Animals"
  },
  {
    "name": "Ring of Cold Resistance",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Ring of Resistance|XDMG}"
  },
  {
    "name": "Ring of Djinni Summoning",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this ring, you can take a Magic action to summon a particular Djinni from the Elemental Plane of Air. The djinni appears in an unoccupied space you choose within 120 feet of yourself. It remains as long as you maintain Concentration, to a maximum of 1 hour, or until it drops to 0 Hit Points. While summoned, the djinni is Friendly [Attitude] to you and your allies, and it obeys your commands. If you fail to command it, the djinni defends itself against attackers but takes no other actions. After the djinni departs, it can't be summoned again for 24 hours, and the ring becomes nonmagical if the djinni dies. Rings of Djinni Summoning are often created by the djinn they summon and given to mortals as gifts of friendship or tokens of esteem."
  },
  {
    "name": "Ring of Elemental Command (Air)",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "The Ring of Elemental Command (air) is linked to the Elemental Plane of Air. Every Ring of Elemental Command has the following two properties: **Elemental Bane:** While wearing the ring, you have Advantage on attack rolls against Elementals and they have Disadvantage on attack rolls against you. **Elemental Compulsion:** While wearing the ring, you can take a Magic action to try to compel an Elemental you see within 60 feet of yourself. The Elemental makes a 18 Wisdom saving throw. On a failed save, the Elemental has the Charmed condition until the start your next turn, and you determine what it does with its move and action on its next turn. **Elemental Focus:** While wearing the ring, you benefit from additional properties corresponding to the ring's linked Elemental Plane: **Air:** You know Auran, you have Resistance to Lightning damage, and you have a Fly Speed equal to your Speed and can hover. **Spellcasting:** The ring has 5 charges and regains 1d4 + 1 expended charges daily at dawn. While wearing the ring, you can cast a spell from it. A spell cast from the ring has a save DC of 18. Choose the spell from the following list: Chain Lightning (3 charges), Feather Fall (0 charges), Gust of Wind (2 charges), Wind Wall (1 charge)"
  },
  {
    "name": "Ring of Elemental Command (Earth)",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "The Ring of Elemental Command (earth) is linked to the Elemental Plane of Earth. Every Ring of Elemental Command has the following two properties: **Elemental Bane:** While wearing the ring, you have Advantage on attack rolls against Elementals and they have Disadvantage on attack rolls against you. **Elemental Compulsion:** While wearing the ring, you can take a Magic action to try to compel an Elemental you see within 60 feet of yourself. The Elemental makes a 18 Wisdom saving throw. On a failed save, the Elemental has the Charmed condition until the start your next turn, and you determine what it does with its move and action on its next turn. **Elemental Focus:** While wearing the ring, you benefit from additional properties corresponding to the ring's linked Elemental Plane: **Earth:** You know Terran, and you have Resistance to Acid damage. Terrain composed of rubble, rocks, or dirt isn't Difficult Terrain for you. In addition, you can move through solid earth or rock as if those areas were Difficult Terrain without disturbing the matter through which you pass. If you end your turn in solid earth or rock, you are shunted out to the nearest unoccupied space you last occupied. **Spellcasting:** The ring has 5 charges and regains 1d4 + 1 expended charges daily at dawn. While wearing the ring, you can cast a spell from it. A spell cast from the ring has a save DC of 18. Choose the spell from the following list: Earthquake (5 charges), Stone Shape (2 charges), Stoneskin (3 charges), Wall of Stone (3 charges)"
  },
  {
    "name": "Ring of Elemental Command (Fire)",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "The Ring of Elemental Command (fire) is linked to the Elemental Plane of Fire. Every Ring of Elemental Command has the following two properties: **Elemental Bane:** While wearing the ring, you have Advantage on attack rolls against Elementals and they have Disadvantage on attack rolls against you. **Elemental Compulsion:** While wearing the ring, you can take a Magic action to try to compel an Elemental you see within 60 feet of yourself. The Elemental makes a 18 Wisdom saving throw. On a failed save, the Elemental has the Charmed condition until the start your next turn, and you determine what it does with its move and action on its next turn. **Elemental Focus:** While wearing the ring, you benefit from additional properties corresponding to the ring's linked Elemental Plane: **Fire:** You know Ignan, and you have Immunity to Fire damage. **Spellcasting:** The ring has 5 charges and regains 1d4 + 1 expended charges daily at dawn. While wearing the ring, you can cast a spell from it. A spell cast from the ring has a save DC of 18. Choose the spell from the following list: Burning Hands (1 charge), Fireball (2 charges), Fire Storm (4 charges), Wall of Fire (3 charges)"
  },
  {
    "name": "Ring of Elemental Command (Water)",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "The Ring of Elemental Command (water) is linked to the Elemental Plane of Water. Every Ring of Elemental Command has the following two properties: **Elemental Bane:** While wearing the ring, you have Advantage on attack rolls against Elementals and they have Disadvantage on attack rolls against you. **Elemental Compulsion:** While wearing the ring, you can take a Magic action to try to compel an Elemental you see within 60 feet of yourself. The Elemental makes a 18 Wisdom saving throw. On a failed save, the Elemental has the Charmed condition until the start your next turn, and you determine what it does with its move and action on its next turn. **Elemental Focus:** While wearing the ring, you benefit from additional properties corresponding to the ring's linked Elemental Plane: **Water:** You know Aquan, you gain a Swim Speed of 60 feet, and you can breathe underwater. **Spellcasting:** The ring has 5 charges and regains 1d4 + 1 expended charges daily at dawn. While wearing the ring, you can cast a spell from it. A spell cast from the ring has a save DC of 18. Choose the spell from the following list: Create or Destroy Water (1 charge), Ice Storm (2 charges), Tsunami (5 charges), Wall of Ice (3 charges), Water Walk (2 charges)"
  },
  {
    "name": "Ring of Evasion",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This ring has 3 charges, and it regains 1d3 expended charges daily at dawn. When you fail a Dexterity saving throw while wearing the ring, you can take a Reaction to expend 1 charge to succeed on that save instead."
  },
  {
    "name": "Ring of Feather Falling",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "When you fall while wearing this ring, you descend 60 feet per round and take no damage from falling."
  },
  {
    "name": "Ring of Fire Resistance",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Ring of Resistance|XDMG}"
  },
  {
    "name": "Ring of Force Resistance",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Ring of Resistance|XDMG}"
  },
  {
    "name": "Ring of Free Action",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While you wear this ring, Difficult Terrain doesn't cost you extra movement. In addition, magic can neither reduce any of your Speeds nor cause you to have the Paralyzed or Restrained condition."
  },
  {
    "name": "Ring of Invisibility",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this ring, you can take a Magic action to give yourself the Invisible condition. You remain Invisible until the ring is removed or until you take a Bonus Action to become visible again."
  },
  {
    "name": "Ring of Jumping",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this ring, you can cast Jump from it, but can target only yourself when you do so."
  },
  {
    "name": "Ring of Lightning Resistance",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Ring of Resistance|XDMG}"
  },
  {
    "name": "Ring of Mind Shielding",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this ring, you are immune to magic that allows other creatures to read your thoughts, determine whether you are lying, know your alignment, or know your creature type. Creatures can telepathically communicate with you only if you allow it. You can take a Magic action to cause the ring to become imperceptible until you take another Magic action to make it perceptible, until you remove the ring, or until you die. If you die while wearing the ring, your soul enters it, unless it already houses a soul. You can remain in the ring or depart for the afterlife. As long as your soul is in the ring, you can telepathically communicate with any creature wearing it. A wearer can't prevent this telepathic communication."
  },
  {
    "name": "Ring of Necrotic Resistance",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Ring of Resistance|XDMG}"
  },
  {
    "name": "Ring of Poison Resistance",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Ring of Resistance|XDMG}"
  },
  {
    "name": "Ring of Protection",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "You gain a +1 bonus to Armor Class and saving throws while wearing this ring."
  },
  {
    "name": "Ring of Psychic Resistance",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Ring of Resistance|XDMG}"
  },
  {
    "name": "Ring of Radiant Resistance",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Ring of Resistance|XDMG}"
  },
  {
    "name": "Ring of Regeneration",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this ring, you regain 1d6 Hit Points every 10 minutes if you have at least 1 Hit Points. If you lose a body part, the ring causes the missing part to regrow and return to full functionality after 1d6 + 1 days if you have at least 1 Hit Points the whole time."
  },
  {
    "name": "Ring of Shooting Stars",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "You can cast Dancing Lights or Light from the ring. The ring has 6 charges and regains 1d6 expended charges daily at dawn. You can expend its charges to use the properties below. **Faerie Fire:** You can expend 1 charge to cast Faerie Fire from the ring. **Lightning Spheres:** You can expend 2 charges as a Magic action to create up to four 3-foot-diameter spheres of lightning. Each sphere appears in an unoccupied space you can see within 120 feet of yourself. The spheres last as long as you maintain Concentration, up to 1 minute. Each sphere sheds Dim Light in a 30-foot radius. As a Bonus Action, you can move each sphere up to 30 feet, but no farther than 120 feet away from yourself. The first time the sphere comes within 5 feet of a creature other than you that isn't behind Cover, the sphere discharges lightning at that creature and disappears. That creature makes a 15 Dexterity saving throw. On a failed save, the creature takes Lightning damage based on the number of spheres you created, as shown in the following table. On a successful save, the creature takes half as much damage. **Shooting Stars:** You can expend 1 to 3 charges as a Magic action. For every charge you expend, you launch a glowing mote of light from the ring at a point you can see within 60 feet of yourself. Each creature in a 15-foot Cube [Area of Effect] originating from that point is showered in sparks and makes a 15 Dexterity saving throw, taking 5d4 Radiant damage on a failed save or half as much damage on a successful one."
  },
  {
    "name": "Ring of Spell Storing",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This ring stores spells cast into it, holding them until the attuned wearer uses them. The ring can store up to 5 levels worth of spells at a time. When found, it contains 1d6 - 1 levels of stored spells chosen by the DM. Any creature can cast a spell of level 1 through 5 into the ring by touching the ring as the spell is cast. The spell has no effect other than to be stored in the ring. If the ring can't hold the spell, the spell is expended without effect. The level of the slot used to cast the spell determines how much space it uses. While wearing this ring, you can cast any spell stored in it. The spell uses the slot level, spell save DC, spell attack bonus, and spellcasting ability of the original caster but is otherwise treated as if you cast the spell. The spell cast from the ring is no longer stored in it, freeing up space."
  },
  {
    "name": "Ring of Spell Turning",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this ring, you have Advantage on saving throws against spells. If you succeed on the save for a spell of level 7 or lower, the spell has no effect on you. If that spell targeted only you and didn't create an area of effect, you can take a Reaction to deflect the spell back at the spell's caster; the caster must make a saving throw against the spell using their own spell save DC."
  },
  {
    "name": "Ring of Swimming",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "You have a Swim Speed of 40 feet while wearing this ring."
  },
  {
    "name": "Ring of Telekinesis",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this ring, you can cast Telekinesis from it."
  },
  {
    "name": "Ring of the Ram",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This ring has 3 charges and regains 1d3 expended charges daily at dawn. While wearing the ring, you can take a Magic action to expend 1 to 3 charges to make a ranged spell attack against one creature you can see within 60 feet of yourself. The ring produces a spectral ram's head and makes its attack roll with a +7 bonus. On a hit, for each charge you spend, the target takes 2d10 Force damage and is pushed 5 feet away from you. Alternatively, you can expend 1 to 3 of the ring's charges as a Magic action to try to break a nonmagical object you can see within 60 feet of yourself that isn't being worn or carried. The ring makes a Strength check with a +5 bonus for each charge you spend."
  },
  {
    "name": "Ring of Three Wishes",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While wearing this ring, you can expend 1 of its 3 charges to cast Wish from it. The ring becomes nonmagical when you use the last charge."
  },
  {
    "name": "Ring of Thunder Resistance",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Ring of Resistance|XDMG}"
  },
  {
    "name": "Ring of Warmth",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "If you take Cold damage while wearing this ring, the ring reduces the damage you take by 2d8. In addition, while wearing this ring, you and everything you wear and carry are unharmed by temperatures of 0 degrees Fahrenheit or lower."
  },
  {
    "name": "Ring of Water Walking",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While wearing this ring, you cast Water Walk from it, targeting only yourself."
  },
  {
    "name": "Ring of X-ray Vision",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this ring, you can take a Magic action to gain X-ray vision with a range of 30 feet for 1 minute. To you, solid objects within that radius appear transparent and don't prevent light from passing through them. The vision can penetrate 1 foot of stone, 1 inch of common metal, or up to 3 feet of wood or dirt. Thicker substances or a thin sheet of lead block the vision. Whenever you use the ring again before taking a Long Rest, you must succeed on a 15 Constitution saving throw or gain 1 Exhaustion level."
  },
  {
    "name": "Rival Coin",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This gold coin has a creature embossed on each side. The two depicted creatures must be famous rivals or enemies of each other. For example, a Rival Coin might show Iggwilv on one side and Mordenkainen on the other, or Venger on one side and Tiamat on the other. One of these figures is on the \"heads\" side of the coin, the other on the \"tails\" side. The coin has 1 charge and regains its expended charge daily at dawn. You can take a Magic action to toss the coin, expending its charge. Roll any die to determine whether the coin comes up heads (on an even number) or tails (on an odd number). The roll also determines the effect: **Heads:** Target one creature you can see within 60 feet of yourself. The target makes a 13 Wisdom saving throw. On a failed save, the target takes 2d4 Psychic damage and has Disadvantage on the next attack roll it makes before the end of its next turn. On a successful save, the target takes half as much damage only. **Tails:** You take 1d4 Psychic damage."
  },
  {
    "name": "Robe of Eyes",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This robe is adorned with eyelike patterns. While you wear the robe, you gain the following benefits: **All-Around Vision:** The robe gives you Advantage on Wisdom (Perception) checks that rely on sight. **Special Senses:** You have Darkvision and Truesight, both with a range of 120 feet. **Drawbacks:** A Light spell cast on the robe or a Daylight spell cast within 5 feet of the robe gives you the Blinded condition for 1 minute. At the end of each of your turns, you make a Constitution saving throw (11 for Light or 15 for Daylight), ending the condition on yourself on a success."
  },
  {
    "name": "Robe of Scintillating Colors",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This robe has 3 charges, and it regains 1d3 expended charges daily at dawn. While you wear it, you can take a Magic action and expend 1 charge to cause the garment to display a shifting pattern of dazzling hues until the end of your next turn. During this time, the robe sheds Bright Light in a 30-foot radius and Dim Light for an additional 30 feet, and creatures that can see you have Disadvantage on attack rolls against you. Any creature in the Bright Light that can see you when the robe's power is activated must succeed on a 15 Wisdom saving throw or have the Stunned condition until the effect ends."
  },
  {
    "name": "Robe of Stars",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This black or dark-blue robe is embroidered with small white or silver stars. You gain a +1 bonus to saving throws while you wear it. Six stars, located on the robe's upper-front portion, are particularly large. While wearing this robe, you can take a Magic action to remove one of the stars and expend it to cast the level 5 version of Magic Missile. Daily at dusk, 1d6 removed stars reappear on the robe. While you wear the robe, you can take a Magic action to enter the Astral Plane along with everything you are wearing and carrying. You remain there until you take a Magic action to return to the plane you were on. You reappear in the last space you occupied or, if that space is occupied, the nearest unoccupied space."
  },
  {
    "name": "Robe of the Archmagi",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This elegant garment is made from exquisite cloth and adorned with runes. You gain these benefits while wearing the robe. **Armor:** If you aren't wearing armor, your base Armor Class is 15 plus your Dexterity modifier. **Magic Resistance:** You have Advantage on saving throws against spells and other magical effects. **War Mage:** Your spell save DC and spell attack bonus each increase by 2."
  },
  {
    "name": "Robe of Useful Items",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This robe has cloth patches of various shapes and colors covering it. While wearing the robe, you can take a Magic action to detach one of the patches, causing it to become the object or creature it represents. Once the last patch is removed, the robe becomes an ordinary garment. The robe has two of each of the following patches: Bullseye Lantern (filled and lit) Dagger Mirror Pole Rope (coiled) Sack In addition, the robe has 4d4 other patches. The DM chooses the patches or determines them randomly by rolling on the following table."
  },
  {
    "name": "Rod of Absorption",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While holding this rod, you can take a Reaction to absorb a spell that is targeting only you and doesn't create an area of effect. The absorbed spell's effect is canceled, and the spell's energy—not the spell itself—is stored in the rod. The energy has the same level as the spell when it was cast. A canceled spell dissipates with no effect, and any resources used to cast it are wasted. The rod can absorb and store up to 50 levels of energy over the course of its existence. Once the rod absorbs 50 levels of energy, it can't absorb more. If you are targeted by a spell that the rod can't store, the rod has no effect on that spell. When you become attuned to the rod, you know how many levels of energy the rod has absorbed over the course of its existence and how many levels of spell energy it currently has stored. If you are a spellcaster holding the rod, you can convert energy stored in it into spell slots to cast spells you have prepared or know. You can create spell slots only of a level equal to or lower than your own spell slots, up to a maximum of level 5. You use the stored levels in place of your slots but otherwise cast the spell as normal. For example, you can use 3 levels stored in the rod as a level 3 spell slot. A newly found rod typically has 1d10 levels of spell energy stored in it. A rod that can no longer absorb spell energy and has no energy remaining becomes nonmagical."
  },
  {
    "name": "Rod of Alertness",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This rod has the following properties. **Alertness:** While holding the rod, you have Advantage on Wisdom (Perception) checks and on Initiative rolls. **Spells:** While holding the rod, you can cast the following spells from it: Detect Evil and Good Detect Magic Detect Poison and Disease See Invisibility **Protective Aura:** As a Magic action, you can plant the haft end of the rod in the ground, whereupon the rod's head sheds Bright Light in a 60-foot radius and Dim Light for an additional 60 feet. While in that Bright Light, you and your allies gain a +1 bonus to Armor Class and saving throws and can sense the location of any Invisible creature that is also in the Bright Light. The rod's head stops glowing and the effect ends after 10 minutes or when a creature takes a Magic action to pull the rod from the ground. Once used, this property can't be used again until the next dawn."
  },
  {
    "name": "Rod of Lordly Might",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This rod has a flanged head, and it functions as a magic Mace that grants a +3 bonus to attack rolls and damage rolls made with it. The rod has properties associated with six different buttons that are set in a row along the haft. It has three other properties as well, detailed below. **Buttons:** You can press one of the following buttons as a Bonus Action; a button's effect lasts until you push a different button or until you push the same button again, which causes the rod to revert to its normal form: **Button 1:** A fiery blade sprouts from the end opposite the rod's flanged head. The flames shed Bright Light in a 40-foot radius and Dim Light for an additional 40 feet, and the blade functions as a magic Longsword or Shortsword (your choice) that deals an extra 2d6 Fire damage on a hit. **Button 2:** The rod's flanged head folds down and two crescent-shaped blades spring out, transforming the rod into a magic Battleaxe that grants a +3 bonus to attack rolls and damage rolls made with it. **Button 3:** The rod's flanged head folds down, a spear point springs from the rod's tip, and the rod's handle lengthens into a 6-foot haft, transforming the rod into a magic Spear that grants a +3 bonus to attack rolls and damage rolls made with it. **Button 4:** The rod transforms into a climbing pole up to 50 feet long (you specify the length), though the rod's buttons remain within your reach. In surfaces as hard as granite, a spike at the bottom and three hooks at the top anchor the pole. Horizontal bars 3 inches long fold out from the sides, 1 foot apart, forming a ladder. The pole can bear up to 4,000 pounds. More weight or lack of solid anchoring causes the rod to revert to its normal form. **Button 5:** The rod transforms into a handheld battering ram and grants its user a +10 bonus to Strength (Athletics) checks made to break through doors, barricades, and other barriers. **Button 6:** The rod assumes or remains in its normal form and indicates magnetic north. (Nothing happens if this function of the rod is used in a location that has no magnetic north.) The rod also gives you knowledge of your approximate depth beneath the ground or your height above it. **Drain Life:** When you hit a creature with a melee attack using the rod, you can force the target to make a 17 Constitution saving throw. On a failed save, the target takes an extra 4d6 Necrotic damage, and you regain a number of Hit Points equal to half that Necrotic damage. Once used, this property can't be used again until the next dawn. **Paralyze:** When you hit a creature with a melee attack using the rod, you can force the target to make a 17 Constitution saving throw. On a failed save, the target has the Paralyzed condition for 1 minute. The target repeats the save at the end of each of its turns, ending the effect on a success. Once used, this property can't be used again until the next dawn. **Terrify:** While holding the rod, you can take a Magic action to force each creature you can see within 30 feet of yourself to make a 17 Wisdom saving throw. On a failed save, a target has the Frightened condition for 1 minute. A Frightened target repeats the save at the end of each of its turns, ending the effect on itself on a success. Once used, this property can't be used again until the next dawn."
  },
  {
    "name": "Rod of Resurrection",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "The rod has 5 charges. While you hold it, you can cast one of the following spells from it: Heal (expends 1 charge) or Resurrection (expends 5 charges). The rod regains 1 expended charge daily at dawn. If you expend the last charge, roll 1d20. On a 1, the rod disappears in a harmless burst of radiance."
  },
  {
    "name": "Rod of Rulership",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "You can take a Magic action to present the rod and command obedience from each creature of your choice that you can see within 120 feet of yourself. Each target must succeed on a 15 Wisdom saving throw or have the Charmed condition for 8 hours. While Charmed in this way, the creature regards you as its trusted leader. If harmed by you or your allies or commanded to do something contrary to its nature, a target ceases to be Charmed in this way. Once used, this property can't be used again until the next dawn."
  },
  {
    "name": "Rod of Security",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While holding this rod, you can take a Magic action to activate it. The rod then instantly transports you and up to 199 other willing creatures you can see to a demiplane. You choose the form the demiplane takes. It could be a tranquil garden, a cheery tavern, an immense palace, a tropical island, a fantastic carnival, or whatever else you can imagine. Regardless of its nature, the demiplane contains enough water and food to sustain its visitors, and the demiplane's environment can't harm its occupants. Everything else that can be interacted with there can exist only there. For example, a flower picked from a garden there disappears if it is taken outside the demiplane. For each hour spent in the demiplane, a visitor regains Hit Points as if it had spent 1 Hit Point Dice. Also, creatures don't age while there, although time passes normally. Visitors can remain there for up to 200 days divided by the number of creatures present (round down). When the time runs out or you take a Magic action to end the effect, all visitors reappear in the location they occupied when you activated the rod or an unoccupied space nearest that location. Once used, this property can't be used again until 10 days have passed."
  },
  {
    "name": "Rope of Climbing",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This 60-foot length of rope can hold up to 3,000 pounds. While holding one end of the rope, you can take a Magic action to command the other end of the rope to animate and move toward a destination you choose, up to the rope's length away from you. That end moves 10 feet on your turn when you first command it and 10 feet at the start of each of your subsequent turns until reaching its destination or until you tell it to stop. You can also tell the rope to fasten itself securely to an object or to unfasten itself, to knot or unknot itself, or to coil itself for carrying. If you tell the rope to knot, large knots appear at 1-foot intervals along the rope. While knotted, the rope shortens to a 50-foot length and grants Advantage on ability checks made to climb using the rope. The rope has AC 20, HP 20, and Immunity to Poison and Psychic damage. It regains 1 Hit Points every 5 minutes as long as it has at least 1 Hit Points. If the rope drops to 0 Hit Points, it is destroyed."
  },
  {
    "name": "Rope of Entanglement",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This rope is 30 feet long. While holding one end of the rope, you can take a Magic action to command the other end to dart forward and entangle one creature you can see within 20 feet of yourself. The target must succeed on a 15 Dexterity saving throw or have the Restrained condition. You can release the target by letting go of your end of the rope (causing the rope to coil up in the target's space) or by using a Bonus Action to repeat the command (causing the rope to coil up in your hand). A target Restrained by the rope can take an action to make its choice of a 15 Strength (Athletics) or Dexterity (Acrobatics) check. On a successful check, the target is no longer Restrained by the rope. If you're still holding onto the rope when a target escapes from it, you can take a Reaction to command the rope to coil up in your hand; otherwise, the rope coils up in the target's space. The rope has AC 20, HP 20, and Immunity to Poison and Psychic damage. It regains 1 Hit Points every 5 minutes as long as it has at least 1 Hit Points. If the rope drops to 0 Hit Points, it is destroyed."
  },
  {
    "name": "Rope of Mending",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This 50-foot coil of rope can repair itself when cut into any number of smaller pieces. As a Magic action, you can cause all pieces of the rope that are in contact with each other and not otherwise in use to knit back together. A Rope of Mending is forever shortened if a section of it is lost or destroyed."
  },
  {
    "name": "Ruby of the War Mage",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "Etched with eldritch runes, this 1-inch-diameter ruby allows you to use a Simple or Martial weapon as a Spellcasting Focus for your spells. For this property to work, you must attach the ruby to the weapon by pressing the ruby against it for at least 10 minutes. Thereafter, the ruby can't be removed unless you detach it as a Magic action, the weapon is destroyed, or your Attunement to the ruby ends."
  },
  {
    "name": "Saddle of the Cavalier",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While in this saddle on a mount, you can't be dismounted against your will if you're conscious, and attack rolls against the mount have disadvantage."
  },
  {
    "name": "Scarab of Protection",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This beetle-shaped medallion provides three benefits while it is on your person. **Defense:** You gain a +1 bonus to Armor Class. **Preservation:** The scarab has 12 charges. If you fail a saving throw against a Necromancy spell or a harmful effect originating from an Undead, you can take a Reaction to expend 1 charge and turn the failed save into a successful one. The scarab crumbles into powder and is destroyed when its last charge is expended. **Spell Resistance:** You have Advantage on saving throws against spells."
  },
  {
    "name": "Scimitar of Speed",
    "rarity": "very rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "You gain a +2 bonus to attack rolls and damage rolls made with this magic weapon. In addition, you can make one attack with it as a Bonus Action on each of your turns."
  },
  {
    "name": "Scroll of Protection (Aberrations)",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Scroll of Protection|XDMG}"
  },
  {
    "name": "Scroll of Protection (Beasts)",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Scroll of Protection|XDMG}"
  },
  {
    "name": "Scroll of Protection (Celestials)",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Scroll of Protection|XDMG}"
  },
  {
    "name": "Scroll of Protection (Constructs)",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Scroll of Protection|XDMG}"
  },
  {
    "name": "Scroll of Protection (Dragons)",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Scroll of Protection|XDMG}"
  },
  {
    "name": "Scroll of Protection (Elementals)",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Scroll of Protection|XDMG}"
  },
  {
    "name": "Scroll of Protection (Fey)",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Scroll of Protection|XDMG}"
  },
  {
    "name": "Scroll of Protection (Fiends)",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Scroll of Protection|XDMG}"
  },
  {
    "name": "Scroll of Protection (Giants)",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Scroll of Protection|XDMG}"
  },
  {
    "name": "Scroll of Protection (Humanoids)",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Scroll of Protection|XDMG}"
  },
  {
    "name": "Scroll of Protection (Monstrosities)",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Scroll of Protection|XDMG}"
  },
  {
    "name": "Scroll of Protection (Oozes)",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Scroll of Protection|XDMG}"
  },
  {
    "name": "Scroll of Protection (Plants)",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Scroll of Protection|XDMG}"
  },
  {
    "name": "Scroll of Protection (Undead)",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "{#itemEntry Scroll of Protection|XDMG}"
  },
  {
    "name": "Scroll of Titan Summoning (Animal Lord)",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you take a Magic action to read this scroll, an Animal Lord appears in an unoccupied space on the ground or in water that you can see within 1 mile of yourself. The Animal Lord is Hostile [Attitude] toward all other creatures and disappears when it drops to 0 Hit Points. If the Animal Lord is summoned into a space that isn't large enough to contain it, the summoning fails, and the scroll is wasted."
  },
  {
    "name": "Scroll of Titan Summoning (Blob of Annihilation)",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you take a Magic action to read this scroll, a Blob of Annihilation appears in an unoccupied space on the ground or in water that you can see within 1 mile of yourself. The Blob of Annihilation is Hostile [Attitude] toward all other creatures and disappears when it drops to 0 Hit Points. If the Blob of Annihilation is summoned into a space that isn't large enough to contain it, the summoning fails, and the scroll is wasted."
  },
  {
    "name": "Scroll of Titan Summoning (Colossus)",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you take a Magic action to read this scroll, a Colossus appears in an unoccupied space on the ground or in water that you can see within 1 mile of yourself. The Colossus is Hostile [Attitude] toward all other creatures and disappears when it drops to 0 Hit Points. If the Colossus is summoned into a space that isn't large enough to contain it, the summoning fails, and the scroll is wasted."
  },
  {
    "name": "Scroll of Titan Summoning (Elemental Cataclysm)",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you take a Magic action to read this scroll, an Elemental Cataclysm appears in an unoccupied space on the ground or in water that you can see within 1 mile of yourself. The Elemental Cataclysm is Hostile [Attitude] toward all other creatures and disappears when it drops to 0 Hit Points. If the Elemental Cataclysm is summoned into a space that isn't large enough to contain it, the summoning fails, and the scroll is wasted."
  },
  {
    "name": "Scroll of Titan Summoning (Empyrean)",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you take a Magic action to read this scroll, an Empyrean appears in an unoccupied space on the ground or in water that you can see within 1 mile of yourself. The Empyrean is Hostile [Attitude] toward all other creatures and disappears when it drops to 0 Hit Points. If the Empyrean is summoned into a space that isn't large enough to contain it, the summoning fails, and the scroll is wasted."
  },
  {
    "name": "Scroll of Titan Summoning (Kraken)",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you take a Magic action to read this scroll, a Kraken appears in an unoccupied space in water that you can see within 1 mile of yourself. A kraken requires a body of water large enough to contain it, or the summoning fails and the scroll is wasted The Kraken is Hostile [Attitude] toward all other creatures and disappears when it drops to 0 Hit Points. If the Kraken is summoned into a space that isn't large enough to contain it, the summoning fails, and the scroll is wasted."
  },
  {
    "name": "Scroll of Titan Summoning (Tarrasque)",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "When you take a Magic action to read this scroll, a Tarrasque appears in an unoccupied space on the ground or in water that you can see within 1 mile of yourself. The Tarrasque is Hostile [Attitude] toward all other creatures and disappears when it drops to 0 Hit Points. If the Tarrasque is summoned into a space that isn't large enough to contain it, the summoning fails, and the scroll is wasted."
  },
  {
    "name": "Sending Stones",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "Sending Stones come in pairs, with each stone carved to match the other so the pairing is easily recognized. While you touch one stone, you can cast Sending from it. The target is the bearer of the other stone. If no creature bears the other stone, you know that fact as soon as you use the stone, and you don't cast the spell. Once Sending is cast using either stone, the stones can't be used again until the next dawn. If one of the stones in a pair is destroyed, the other one becomes nonmagical."
  },
  {
    "name": "Sentinel Shield",
    "rarity": "uncommon",
    "itemType": "armor",
    "requiresAttunement": false,
    "description": "While holding this Shield, you have Advantage on Initiative rolls and Wisdom (Perception) checks. The Shield is emblazoned with a symbol of an eye."
  },
  {
    "name": "Shield of Expression",
    "rarity": "common",
    "itemType": "armor",
    "requiresAttunement": false,
    "description": "The front of this Shield is shaped in the likeness of a face. While bearing the Shield, you can take a Bonus Action to alter the face's expression."
  },
  {
    "name": "Shield of Missile Attraction",
    "rarity": "rare",
    "itemType": "armor",
    "requiresAttunement": true,
    "description": "While holding this Shield, you have Resistance to damage from attacks made with Ranged weapons. **Curse:** This Shield is cursed. Attuning to it curses you until you are targeted by a Remove Curse spell or similar magic. Removing the Shield fails to end the curse on you. Whenever an attack with a Ranged weapon targets a creature within 10 feet of you, the curse causes you to become the target instead."
  },
  {
    "name": "Shield of the Cavalier",
    "rarity": "very rare",
    "itemType": "armor",
    "requiresAttunement": true,
    "description": "While holding this Shield, you have a +2 bonus to Armor Class. This bonus is in addition to the Shield's normal bonus to AC. The Shield has the following additional properties that you can use while holding it. **Forceful Bash:** When you take the Attack action, you can make one of the attack rolls using the Shield against a target within 5 feet of yourself. Apply your Proficiency and Strength modifier to the attack roll. On a hit, the Shield deals Force damage to the target equal to 2d6 + 2 plus your Strength modifier, and if the target is a creature, you can push it up to 10 feet directly away from yourself. If the creature is your size or smaller, you can also knock it down, giving it the Prone condition. **Protective Field:** As a Reaction, when you or an ally you can see within 5 feet of you is targeted by an attack or makes a saving throw against an area of effect, you can use the Shield to create an immobile 5-foot Emanation [Area of Effect] originating from you. When the Emanation [Area of Effect] appears, any creatures or objects not fully contained within it are pushed into the nearest unoccupied spaces outside it. The attack or area of effect that triggered the Reaction has no effect on creatures and objects inside the Emanation [Area of Effect], which lasts as long as you maintain Concentration, up to 1 minute. Nothing can pass into or out of the Emanation [Area of Effect]. A creature or object inside the Emanation [Area of Effect] can't be damaged by attacks or effects originating from outside, nor can a creature inside the Emanation [Area of Effect] damage anything outside it. Once this property is used, it can't be used again until the next dawn."
  },
  {
    "name": "Silver Dragon Scale Mail",
    "rarity": "very rare",
    "itemType": "armor",
    "requiresAttunement": true,
    "description": "{#itemEntry Dragon Scale Mail|XDMG}"
  },
  {
    "name": "Slippers of Spider Climbing",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While you wear these light shoes, you can move up, down, and across vertical surfaces and along ceilings, while leaving your hands free. You have a Climb Speed equal to your Speed. However, the slippers don't allow you to move this way on a slippery surface, such as one covered by ice or oil."
  },
  {
    "name": "Sovereign Glue",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This viscous, milky-white substance can form a permanent adhesive bond between any two objects. It must be stored in a jar or flask that has been coated inside with Oil of Slipperiness. When found, a container contains 1d6 + 1 ounces. One ounce of the glue can cover a 1-foot square surface. Applying an ounce of Sovereign Glue takes a Utilize action, and the applied glue takes 1 minute to set. Once it has done so, the bond it creates can be broken only by the application of Universal Solvent or Oil of Etherealness, or with a Wish spell."
  },
  {
    "name": "Spell Scroll (Cantrip)",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Spell Scroll bears the words of a single spell, written in a mystical cipher. If the spell is on your spell list, you can read the scroll and cast its spell without Material components. Otherwise, the scroll is unintelligible. Casting the spell by reading the scroll requires the spell's normal casting time. Once the spell is cast, the scroll crumbles to dust. If the casting is interrupted, the scroll isn't lost. If the spell is on your spell list but of a higher level than you can normally cast, you make a 10 ability check using your spellcasting ability to determine whether you cast the spell. On a failed check, the spell disappears from the scroll with no other effect. If the spell requires a saving throw or an attack roll, the spell save DC is 13, and the attack bonus is 5."
  },
  {
    "name": "Spell Scroll (Level 1)",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Spell Scroll bears the words of a single spell, written in a mystical cipher. If the spell is on your spell list, you can read the scroll and cast its spell without Material components. Otherwise, the scroll is unintelligible. Casting the spell by reading the scroll requires the spell's normal casting time. Once the spell is cast, the scroll crumbles to dust. If the casting is interrupted, the scroll isn't lost. If the spell is on your spell list but of a higher level than you can normally cast, you make a 11 ability check using your spellcasting ability to determine whether you cast the spell. On a failed check, the spell disappears from the scroll with no other effect. If the spell requires a saving throw or an attack roll, the spell save DC is 13, and the attack bonus is 5. **Copying a Scroll into a Spellbook:** A Wizard spell on a Spell Scroll can be copied into a spellbook. When a level 1 spell is copied in this way, the copier must succeed on a 11 Intelligence (Arcana). On a successful check, the spell is copied. Whether the check succeeds or fails, the Spell Scroll is destroyed."
  },
  {
    "name": "Spell Scroll (Level 2)",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Spell Scroll bears the words of a single spell, written in a mystical cipher. If the spell is on your spell list, you can read the scroll and cast its spell without Material components. Otherwise, the scroll is unintelligible. Casting the spell by reading the scroll requires the spell's normal casting time. Once the spell is cast, the scroll crumbles to dust. If the casting is interrupted, the scroll isn't lost. If the spell is on your spell list but of a higher level than you can normally cast, you make a 12 ability check using your spellcasting ability to determine whether you cast the spell. On a failed check, the spell disappears from the scroll with no other effect. If the spell requires a saving throw or an attack roll, the spell save DC is 13, and the attack bonus is 5. **Copying a Scroll into a Spellbook:** A Wizard spell on a Spell Scroll can be copied into a spellbook. When a level 2 spell is copied in this way, the copier must succeed on a 12 Intelligence (Arcana). On a successful check, the spell is copied. Whether the check succeeds or fails, the Spell Scroll is destroyed."
  },
  {
    "name": "Spell Scroll (Level 3)",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Spell Scroll bears the words of a single spell, written in a mystical cipher. If the spell is on your spell list, you can read the scroll and cast its spell without Material components. Otherwise, the scroll is unintelligible. Casting the spell by reading the scroll requires the spell's normal casting time. Once the spell is cast, the scroll crumbles to dust. If the casting is interrupted, the scroll isn't lost. If the spell is on your spell list but of a higher level than you can normally cast, you make a 13 ability check using your spellcasting ability to determine whether you cast the spell. On a failed check, the spell disappears from the scroll with no other effect. If the spell requires a saving throw or an attack roll, the spell save DC is 15, and the attack bonus is 7. **Copying a Scroll into a Spellbook:** A Wizard spell on a Spell Scroll can be copied into a spellbook. When a level 3 spell is copied in this way, the copier must succeed on a 13 Intelligence (Arcana). On a successful check, the spell is copied. Whether the check succeeds or fails, the Spell Scroll is destroyed."
  },
  {
    "name": "Spell Scroll (Level 4)",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Spell Scroll bears the words of a single spell, written in a mystical cipher. If the spell is on your spell list, you can read the scroll and cast its spell without Material components. Otherwise, the scroll is unintelligible. Casting the spell by reading the scroll requires the spell's normal casting time. Once the spell is cast, the scroll crumbles to dust. If the casting is interrupted, the scroll isn't lost. If the spell is on your spell list but of a higher level than you can normally cast, you make a 14 ability check using your spellcasting ability to determine whether you cast the spell. On a failed check, the spell disappears from the scroll with no other effect. If the spell requires a saving throw or an attack roll, the spell save DC is 15, and the attack bonus is 7. **Copying a Scroll into a Spellbook:** A Wizard spell on a Spell Scroll can be copied into a spellbook. When a level 4 spell is copied in this way, the copier must succeed on a 14 Intelligence (Arcana). On a successful check, the spell is copied. Whether the check succeeds or fails, the Spell Scroll is destroyed."
  },
  {
    "name": "Spell Scroll (Level 5)",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Spell Scroll bears the words of a single spell, written in a mystical cipher. If the spell is on your spell list, you can read the scroll and cast its spell without Material components. Otherwise, the scroll is unintelligible. Casting the spell by reading the scroll requires the spell's normal casting time. Once the spell is cast, the scroll crumbles to dust. If the casting is interrupted, the scroll isn't lost. If the spell is on your spell list but of a higher level than you can normally cast, you make a 15 ability check using your spellcasting ability to determine whether you cast the spell. On a failed check, the spell disappears from the scroll with no other effect. If the spell requires a saving throw or an attack roll, the spell save DC is 17, and the attack bonus is 9. **Copying a Scroll into a Spellbook:** A Wizard spell on a Spell Scroll can be copied into a spellbook. When a level 5 spell is copied in this way, the copier must succeed on a 15 Intelligence (Arcana). On a successful check, the spell is copied. Whether the check succeeds or fails, the Spell Scroll is destroyed."
  },
  {
    "name": "Spell Scroll (Level 6)",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Spell Scroll bears the words of a single spell, written in a mystical cipher. If the spell is on your spell list, you can read the scroll and cast its spell without Material components. Otherwise, the scroll is unintelligible. Casting the spell by reading the scroll requires the spell's normal casting time. Once the spell is cast, the scroll crumbles to dust. If the casting is interrupted, the scroll isn't lost. If the spell is on your spell list but of a higher level than you can normally cast, you make a 16 ability check using your spellcasting ability to determine whether you cast the spell. On a failed check, the spell disappears from the scroll with no other effect. If the spell requires a saving throw or an attack roll, the spell save DC is 17, and the attack bonus is 9. **Copying a Scroll into a Spellbook:** A Wizard spell on a Spell Scroll can be copied into a spellbook. When a level 6 spell is copied in this way, the copier must succeed on a 16 Intelligence (Arcana). On a successful check, the spell is copied. Whether the check succeeds or fails, the Spell Scroll is destroyed."
  },
  {
    "name": "Spell Scroll (Level 7)",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Spell Scroll bears the words of a single spell, written in a mystical cipher. If the spell is on your spell list, you can read the scroll and cast its spell without Material components. Otherwise, the scroll is unintelligible. Casting the spell by reading the scroll requires the spell's normal casting time. Once the spell is cast, the scroll crumbles to dust. If the casting is interrupted, the scroll isn't lost. If the spell is on your spell list but of a higher level than you can normally cast, you make a 17 ability check using your spellcasting ability to determine whether you cast the spell. On a failed check, the spell disappears from the scroll with no other effect. If the spell requires a saving throw or an attack roll, the spell save DC is 18, and the attack bonus is 10. **Copying a Scroll into a Spellbook:** A Wizard spell on a Spell Scroll can be copied into a spellbook. When a level 7 spell is copied in this way, the copier must succeed on a 17 Intelligence (Arcana). On a successful check, the spell is copied. Whether the check succeeds or fails, the Spell Scroll is destroyed."
  },
  {
    "name": "Spell Scroll (Level 8)",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Spell Scroll bears the words of a single spell, written in a mystical cipher. If the spell is on your spell list, you can read the scroll and cast its spell without Material components. Otherwise, the scroll is unintelligible. Casting the spell by reading the scroll requires the spell's normal casting time. Once the spell is cast, the scroll crumbles to dust. If the casting is interrupted, the scroll isn't lost. If the spell is on your spell list but of a higher level than you can normally cast, you make a 18 ability check using your spellcasting ability to determine whether you cast the spell. On a failed check, the spell disappears from the scroll with no other effect. If the spell requires a saving throw or an attack roll, the spell save DC is 18, and the attack bonus is 10. **Copying a Scroll into a Spellbook:** A Wizard spell on a Spell Scroll can be copied into a spellbook. When a level 8 spell is copied in this way, the copier must succeed on a 18 Intelligence (Arcana). On a successful check, the spell is copied. Whether the check succeeds or fails, the Spell Scroll is destroyed."
  },
  {
    "name": "Spell Scroll (Level 9)",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "A Spell Scroll bears the words of a single spell, written in a mystical cipher. If the spell is on your spell list, you can read the scroll and cast its spell without Material components. Otherwise, the scroll is unintelligible. Casting the spell by reading the scroll requires the spell's normal casting time. Once the spell is cast, the scroll crumbles to dust. If the casting is interrupted, the scroll isn't lost. If the spell is on your spell list but of a higher level than you can normally cast, you make a 19 ability check using your spellcasting ability to determine whether you cast the spell. On a failed check, the spell disappears from the scroll with no other effect. If the spell requires a saving throw or an attack roll, the spell save DC is 19, and the attack bonus is 11. **Copying a Scroll into a Spellbook:** A Wizard spell on a Spell Scroll can be copied into a spellbook. When a level 9 spell is copied in this way, the copier must succeed on a 19 Intelligence (Arcana). On a successful check, the spell is copied. Whether the check succeeds or fails, the Spell Scroll is destroyed."
  },
  {
    "name": "Spellguard Shield",
    "rarity": "very rare",
    "itemType": "armor",
    "requiresAttunement": true,
    "description": "While holding this Shield, you have Advantage on saving throws against spells and other magical effects, and spell attack rolls have Disadvantage against you."
  },
  {
    "name": "Sphere of Annihilation",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This 2-foot-diameter black sphere is a hole in the multiverse, hovering in space and stabilized by a magical field surrounding it. The sphere obliterates all matter it passes through and all matter that passes through it. Artifacts are the exception. Unless an Artifact is susceptible to damage from a Sphere of Annihilation, it passes through the sphere unscathed. Anything else that touches the sphere but isn't wholly engulfed and obliterated by it takes 8d10 Force damage. **Controlling the Sphere:** A Sphere of Annihilation is stationary until someone takes control of it. If you are within 60 feet of a sphere, you can take a Magic action to make a 25 Intelligence (Arcana) check. On a successful check, you control the sphere until the start of your next turn, and if it was under another creature's control, that creature loses control of the sphere. On a failed check, the sphere moves 10 feet toward you in a straight line. While in control of the sphere, you can take a Bonus Action to cause it to move in one direction of your choice, up to a number of feet equal to 5 times your Intelligence modifier (minimum 5 feet). Any creature whose space the sphere enters must succeed on a 19 Dexterity saving throw or be touched by it, taking 8d10 Force damage. A creature reduced to 0 Hit Points by this damage is obliterated, leaving its possessions behind but no other physical remains. **Sphere Interactions:** If the sphere comes into contact with a planar portal (such as that created by the Gate spell) or an extradimensional space (such as that within a Portable Hole), the DM determines randomly what happens using the following table."
  },
  {
    "name": "Spirit Board",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This ornate wooden board has the letters of the Common alphabet printed on one side, alongside the words \"Yes\" and \"No\" and symbols representing \"Weal\" and \"Woe.\" The board comes with a heart-shaped, wooden planchette. This planchette must be resting on the lettered side of the board for the board's magic to function. This board has 3 charges and regains 1 expended charge daily at dawn. While touching the planchette, you can take 1 minute to cast one of the spells on the table below. The table indicates how many charges you must expend to cast the spell. As you cast the spell, you call on the spirits of the dead to help guide the planchette across the board's surface, answering your questions by pointing to the letters or words on the board."
  },
  {
    "name": "Staff of Adornment",
    "rarity": "common",
    "itemType": "weapon",
    "requiresAttunement": false,
    "description": "If you place a Tiny object weighing no more than 1 pound (such as a shard of crystal, an egg, or a stone) above the tip of this staff while holding it, the object floats an inch from the staff's tip and remains there until it is removed or until the staff is no longer in your possession. The staff can have up to three such objects floating over its tip at any given time. While holding the staff, you can make one or more of the objects slowly spin or turn in place."
  },
  {
    "name": "Staff of Birdcalls",
    "rarity": "common",
    "itemType": "weapon",
    "requiresAttunement": false,
    "description": "This wooden staff is decorated with bird carvings. It has 10 charges. While holding it, you can take a Magic action to expend 1 charge from the staff and cause it to create one of the following sounds, which can be heard out to 120 feet: a finch's chirp, a raven's caw, a duck's quack, a chicken's cluck, a goose's honk, a loon's call, a turkey's gobble, a seagull's cry, an owl's hoot, or an eagle's shriek. **Regaining Charges:** The staff regains 1d6 + 4 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, the staff explodes in a harmless cloud of bird feathers and is lost forever."
  },
  {
    "name": "Staff of Charming",
    "rarity": "rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "This staff has 10 charges. While holding the staff, you can use any of its properties: **Cast Spell:** You can expend 1 of the staff's charges to cast Charm Person, Command, or Comprehend Languages from it using your spell save DC. **Reflect Enchantment:** If you succeed on a saving throw against an Enchantment spell that targets only you, you can take a Reaction to expend 1 charge from the staff and turn the spell back on its caster as if you had cast the spell. **Resist Enchantment:** If you fail a saving throw against an Enchantment spell that targets only you, you can turn your failed save into a successful one. You can't use this property of the staff again until the next dawn. **Regaining Charges:** The staff regains 1d8 + 2 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, the staff crumbles to dust and is destroyed."
  },
  {
    "name": "Staff of Fire",
    "rarity": "very rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "You have Resistance to Fire damage while you hold this staff. **Spells:** The staff has 10 charges. While holding the staff, you can cast one of the spells on the following table from it, using your spell save DC. The table indicates how many charges you must expend to cast the spell. **Regaining Charges:** The staff regains 1d6 + 4 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, the staff crumbles into cinders and is destroyed."
  },
  {
    "name": "Staff of Flowers",
    "rarity": "common",
    "itemType": "weapon",
    "requiresAttunement": false,
    "description": "This wooden staff has 10 charges. While holding it, you can take a Magic action to expend 1 charge from the staff and cause a flower to sprout from a patch of earth or soil within 5 feet of yourself, or from the staff itself. Unless you choose a specific kind of flower, the staff creates a mild-scented daisy. The flower is harmless and nonmagical, and it grows or withers as a normal flower would. **Regaining Charges:** The staff regains 1d6 + 4 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, the staff turns into flower petals and is lost forever."
  },
  {
    "name": "Staff of Frost",
    "rarity": "very rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "You have Resistance to Cold damage while you hold this staff. **Spells:** The staff has 10 charges. While holding the staff, you can cast one of the spells on the following table from it, using your spell save DC. The table indicates how many charges you must expend to cast the spell. **Regaining Charges:** The staff regains 1d6 + 4 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, the staff turns to water and is destroyed."
  },
  {
    "name": "Staff of Healing",
    "rarity": "rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "This staff has 10 charges. While holding the staff, you can cast one of the spells on the following table from it, using your spellcasting ability modifier. The table indicates how many charges you must expend to cast the spell. **Regaining Charges:** The staff regains 1d6 + 4 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, the staff vanishes in a flash of light, lost forever."
  },
  {
    "name": "Staff of Power",
    "rarity": "very rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "This staff has 20 charges and can be wielded as a magic Quarterstaff that grants a +2 bonus to attack rolls and damage rolls made with it. While holding it, you gain a +2 bonus to Armor Class, saving throws, and spell attack rolls. **Spells:** While holding the staff , you can cast one of the spells on the following table from it, using your spell save DC. The table indicates how many charges you must expend to cast the spell. **Regaining Charges:** The staff regains 2d8 + 4 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, the staff retains its +2 bonus to attack rolls and damage rolls but loses all other properties. On a 20, the staff regains 1d8 + 2 charges. **Retributive Strike:** You can take a Magic action to break the staff over your knee or against a solid surface. The staff is destroyed and releases its magic in an explosion that fills a 30-foot Emanation [Area of Effect] originating from itself. You have a 50 chance to instantly travel to a random plane of existence, avoiding the explosion. If you fail to avoid the effect, you take Force damage equal to 16 times the number of charges in the staff. Each other creature in the area makes a 17 Dexterity saving throw. On a failed save, a creature takes Force damage equal to 4 times the number of charges in the staff. On a successful save, a creature takes half as much damage."
  },
  {
    "name": "Staff of Striking",
    "rarity": "very rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "This staff can be wielded as a magic Quarterstaff that grants a +3 bonus to attack rolls and damage rolls made with it. The staff has 10 charges. When you hit with a melee attack using it, you can expend up to 3 charges. For each charge you expend, the target takes an extra 1d6 Force damage. **Regaining Charges:** The staff regains 1d6 + 4 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, the staff becomes a nonmagical Quarterstaff."
  },
  {
    "name": "Staff of Swarming Insects",
    "rarity": "rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "This staff has 10 charges. **Insect Cloud:** While holding the staff , you can take a Magic action and expend 1 charge to cause a swarm of harmless flying insects to fill a 30-foot Emanation [Area of Effect] originating from you. The insects remain for 10 minutes, making the area Heavily Obscured for creatures other than you. A strong wind (like that created by Gust of Wind) disperses the swarm and ends the effect. **Spells:** While holding the staff, you can cast one of the spells on the following table from it, using your spell save DC and spell attack modifier. The table indicates how many charges you must expend to cast the spell. **Regaining Charges:** The staff regains 1d6 + 4 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, a swarm of insects consumes and destroys the staff, then disperses."
  },
  {
    "name": "Staff of the Adder",
    "rarity": "uncommon",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "As a Bonus Action, you can turn the head of this staff into that of an animate, venomous snake for 1 minute or revert the staff to its inanimate form. When you take the Attack action, you can make one of the attack rolls using the animated snake head, which has a reach of 5 feet. Apply your Proficiency and Wisdom modifier to the attack roll. On a hit, the target takes 1d6 Piercing damage and 3d6 Poison damage. The snake head can be attacked while it is animate. It has AC 15, HP 20, and Immunity to Poison and Psychic damage. If the head drops to 0 Hit Points, the staff is destroyed. As long as it's not destroyed, the staff regains all lost Hit Points when it reverts to its inanimate form."
  },
  {
    "name": "Staff of the Magi",
    "rarity": "legendary",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "This staff has 50 charges and can be wielded as a magic Quarterstaff that grants a +2 bonus to attack rolls and damage rolls made with it. While you hold it, you gain a +2 bonus to spell attack rolls. **Spell Absorption:** While holding the staff , you have Advantage on saving throws against spells. In addition, you can take a Reaction when another creature casts a spell that targets only you. If you do, the staff absorbs the magic of the spell, canceling its effect and gaining a number of charges equal to the absorbed spell's level. However, if doing so brings the staff's total number of charges above 50, the staff explodes as if you activated its Retributive Strike (see below). **Spells:** While holding the staff, you can cast one of the spells on the following table from it, using your spell save DC. The table indicates how many charges you must expend to cast the spell. **Regaining Charges:** The staff regains 4d6 + 2 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 20, the staff regains 1d12 + 1 charges. **Retributive Strike:** You can take a Magic action to break the staff over your knee or against a solid surface. The staff is destroyed and releases its magic in an explosion that fills a 30-foot Emanation [Area of Effect] originating from itself. You have a 50 chance to instantly travel to a random plane of existence, avoiding the explosion. If you fail to avoid the effect, you take Force damage equal to 16 times the number of charges in the staff. Each other creature in the area makes a 17 Dexterity saving throw. On a failed save, a creature takes Force damage equal to 6 times the number of charges in the staff. On a successful save, a creature takes half as much damage."
  },
  {
    "name": "Staff of the Python",
    "rarity": "uncommon",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "As a Magic action, you can throw this staff so that it lands in an unoccupied space within 10 feet of you, causing the staff to become a Giant Constrictor Snake in that space. The snake is under your control and shares your Initiative count, taking its turn immediately after yours. On your turn, you can mentally command the snake (no action required) if it is within 60 feet of you and you don't have the Incapacitated condition. You decide what action the snake takes and where it moves during its turn, or you can issue it a general command, such as to attack your enemies or guard a location. Absent commands from you, the snake defends itself. As a Bonus Action, you can command the snake to revert to staff form in its current space, and you can't use the staff's property again for 1 hour. If the snake is reduced to 0 Hit Points, it dies and reverts to its staff form; the staff then shatters and is destroyed. If the snake reverts to staff form before losing all its Hit Points, it regains all of them."
  },
  {
    "name": "Staff of the Woodlands",
    "rarity": "rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "This staff has 6 charges and can be wielded as a magic Quarterstaff that grants a +2 bonus to attack rolls and damage rolls made with it. While holding it, you have a +2 bonus to spell attack rolls. **Spells:** While holding the staff, you can cast one of the spells on the following table from it, using your spell save DC. The table indicates how many charges you must expend to cast the spell. **Tree Form:** You can take a Magic action to plant one end of the staff in earth in an unoccupied space and expend 1 charge to transform the staff into a healthy tree. The tree is 60 feet tall and has a 5-foot-diameter trunk, and its branches at the top spread out in a 20-foot radius. The tree appears ordinary but radiates a faint aura of Transmutation magic that can be discerned with the Detect Magic spell. While touching the tree and using a Magic action, you return the staff to its normal form. Any creature in the tree falls when the tree reverts to a staff. **Regaining Charges:** The staff regains 1d6 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, the staff loses its properties and becomes a nonmagical Quarterstaff."
  },
  {
    "name": "Staff of Thunder and Lightning",
    "rarity": "very rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "This staff can be wielded as a magic Quarterstaff that grants a +2 bonus to attack rolls and damage rolls made with it. It also has the following additional properties. Once one of these properties is used, it can't be used again until the next dawn. **Lightning:** When you hit with a melee attack using the staff, you can cause the target to take an extra 2d6 Lightning damage (no action required). **Thunder:** When you hit with a melee attack using the staff, you can cause the staff to emit a crack of thunder audible out to 300 feet (no action required). The target you hit must succeed on a 17 Constitution saving throw or have the Stunned condition until the end of your next turn. **Thunder and Lightning:** Immediately after you hit with a melee attack using the staff, you can take a Bonus Action to use the Lightning and Thunder properties (see above) at the same time. Doing so doesn't expend the daily use of those properties, only the use of this one. **Lightning Strike:** You can take a Magic action to cause a bolt of lightning to leap from the staff's tip in a Line [Area of Effect] that is 5 feet wide and 120 feet long. Each creature in that Line [Area of Effect] makes a 17 Dexterity saving throw, taking 9d6 Lightning damage on a failed save or half as much damage on a successful one. **Thunderclap:** You can take a Magic action to cause the staff to produce a thunderclap audible out to 600 feet. Every creature within a 60-foot Emanation [Area of Effect] originating from you makes a 17 Constitution saving throw. On a failed save, a creature takes 2d6 Thunder damage and has the Deafened condition for 1 minute. On a successful save, a creature takes half as much damage only."
  },
  {
    "name": "Staff of Withering",
    "rarity": "rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "This staff has 3 charges and regains 1d3 expended charges daily at dawn. The staff can be wielded as a magic Quarterstaff. On a hit, it deals damage as a normal Quarterstaff , and you can expend 1 charge to deal an extra 2d10 Necrotic damage to the target and force it to make a 15 Constitution saving throw. On a failed save, the target has Disadvantage for 1 hour on any ability check or saving throw that uses Strength or Constitution."
  },
  {
    "name": "Stone of Controlling Earth Elementals",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While touching this 5-pound stone to the ground, you can take a Magic action to summon an Earth Elemental. The elemental appears in an unoccupied space you choose within 30 feet of yourself, obeys your commands, and takes its turn immediately after you on your Initiative count. The elemental disappears after 1 hour, when it dies, or when you dismiss it as a Bonus Action. The stone can't be used this way again until the next dawn."
  },
  {
    "name": "Stone of Good Luck",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While this polished agate is on your person, you gain a +1 bonus to ability checks and saving throws."
  },
  {
    "name": "Sun Blade",
    "rarity": "rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "This item appears to be a sword hilt. **Blade of Radiance:** While grasping the hilt, you can take a Bonus Action to cause a blade of pure radiance to spring into existence or make the blade disappear. While the blade exists, this magic weapon functions as a Longsword with F. If you are proficient with Longswords or Shortswords, you are proficient with the Sun Blade. You gain a +2 bonus to attack rolls and damage rolls made with this weapon, which deals Radiant damage instead of Slashing damage. When you hit an Undead with it, that target takes an extra 1d8 Radiant damage. **Sunlight:** The sword's luminous blade emits Bright Light in a 15-foot radius and Dim Light for an additional 15 feet. The light is sunlight. While the blade persists, you can take a Magic action to expand or reduce its radius of Bright Light and Dim Light by 5 feet each, to a maximum of 30 feet each or a minimum of 10 feet each."
  },
  {
    "name": "Sword of Answering",
    "rarity": "legendary",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "You gain a +3 bonus to attack rolls and damage rolls made with this sword. In addition, while you hold the sword, you can take a Reaction to make one melee attack with it against any creature in your reach that deals damage to you. You have Advantage on the attack roll, and any damage dealt with this special attack ignores any Immunity or Resistance the target has to that damage."
  },
  {
    "name": "Sword of Kas",
    "rarity": "artifact",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "Kas was a powerful warrior who served Vecna and whose loyalty was rewarded with this sword. As Kas's power grew, so did his hubris. The sword urged Kas to destroy Vecna and usurp his throne. Legend says Vecna's destruction came at Kas's hand, but Vecna also wrought his rebellious lieutenant's doom, leaving only Kas's sword behind. **Bloodthirst:** The sword thirsts for blood. If the sword doesn't taste blood on its blade within 1 minute of being drawn from its scabbard, its wielder makes a 15 Charisma saving throw. On a successful save, the wielder takes 3d6 Psychic damage. On a failed save, the wielder is dominated by the sword, as if by the Dominate Monster spell, and the sword demands blood. The spell effect ends when the sword's demand is met. **Magic Weapon:** You gain a +3 bonus to attack rolls and damage rolls made with the sword, which scores a Critical Hit on a roll of 19 or 20 on the d20 and deals an extra 2d10 Slashing damage to Undead. **Random Properties:** The sword has the following random properties: 1 Artifact Properties; Minor Beneficial Properties property 1 Artifact Properties; Major Beneficial Properties property 1 Artifact Properties; Minor Detrimental Properties property 1 Artifact Properties; Major Detrimental Properties property **Spells:** While the sword is on your person, you can cast the following spells (save 18) from it: Call Lightning Divine Word Finger of Death Once you use the sword to cast a spell, you can't cast that spell again from it until the next dawn. **Spirit of Kas:** While the sword is on your person, you gain the following benefits: **Battle Hunger:** You add 1d10 to your Initiative rolls. **Blade of Defense:** When you take an action to attack with the sword, you can transfer some or all of its attack bonus to your Armor Class instead. The adjusted bonuses remain in effect until the start of your next turn. **Necrotic Resistance:** You have Resistance to Necrotic damage. **Sentience:** The Sword of Kas is a sentient Chaotic Evil weapon with an Intelligence of 15, a Wisdom of 13, and a Charisma of 16. It has hearing and Darkvision out to 120 feet. The weapon communicates telepathically with its wielder and speaks Common. **Personality:** The sword's purpose is to bring ruin to Vecna. Killing Vecna's worshipers, destroying the lich's works, and foiling his machinations all help to fulfill this goal. The Sword of Kas also seeks to destroy anyone corrupted by the Eye and Hand of Vecna. **Destroying the Sword:** A creature attuned to both the Eye of Vecna and the Hand of Vecna can use the Wish property of those combined Artifacts to unmake the Sword of Kas, provided the sword is within 30 feet of the spell's caster. Upon casting Wish, the creature makes a 18 Charisma saving throw. On a failed save, nothing happens, and the Wish spell is wasted. On a successful save, the Sword of Kas is destroyed."
  },
  {
    "name": "Talisman of Pure Good",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This talisman is a mighty symbol of goodness. A Fiend or an Undead that touches the talisman takes 8d6 Radiant damage and takes the damage again each time it ends its turn holding or carrying the talisman. **Holy Symbol:** You can use the talisman as a Holy Symbol. You gain a +2 bonus to spell attack rolls while you wear or hold it. **Pure Rebuke:** The talisman has 7 charges. While wearing or holding the talisman, you can take a Magic action to expend 1 charge and target one creature you can see on the ground within 120 feet of yourself. A flaming fissure opens under the target, and the target makes a 20 Dexterity saving throw. If the target is a Fiend or an Undead, it has Disadvantage on the save. On a failed save, the target falls into the fissure and is destroyed, leaving no remains. On a successful save, the target isn't cast into the fissure but takes 4d6 Psychic damage from the ordeal. In either case, the fissure then closes, leaving no trace of its existence. When you expend the last charge, the talisman disperses into motes of golden light and is destroyed."
  },
  {
    "name": "Talisman of the Sphere",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While holding or wearing this talisman, you have Advantage on any Intelligence (Arcana) check you make to control a Sphere of Annihilation. In addition, when you start your turn in control of a Sphere of Annihilation, you can take a Magic action to move it 10 feet plus a number of additional feet equal to 10 times your Intelligence modifier. This movement doesn't have to be in a straight line."
  },
  {
    "name": "Talisman of Ultimate Evil",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This item symbolizes unrepentant evil. A creature that isn't a Fiend or an Undead that touches the talisman takes 8d6 Necrotic damage and takes the damage again each time it ends its turn holding or carrying the talisman. **Holy Symbol:** You can use the talisman as a Holy Symbol. You gain a +2 bonus to spell attack rolls while you wear or hold it. **Ultimate End:** The talisman has 6 charges. While wearing or holding the talisman, you can take a Magic action to expend 1 charge and target one creature you can see on the ground within 120 feet of yourself. A flaming fissure opens under the target, and the target makes a 20 Dexterity saving throw. If the target is a Celestial, it has Disadvantage on the save. On a failed save, the target falls into the fissure and is destroyed, leaving no remains. On a successful save, the target isn't cast into the fissure but takes 4d6 Psychic damage from the ordeal. In either case, the fissure then closes, leaving no trace of its existence. When you expend the last charge, the talisman dissolves into foul-smelling slime and is destroyed."
  },
  {
    "name": "Talking Doll",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While this doll is within 5 feet of you, you can spend a Short Rest telling it to say up to six phrases, none of which can be more than six words long, and set a condition under which the doll speaks each phrase. You can also replace old phrases with new ones. Whatever the condition, it must occur within 5 feet of the doll to make it speak. For example, whenever someone picks up the doll, it might say, \"I want a piece of candy.\" The doll's phrases are lost when your Attunement to the doll ends."
  },
  {
    "name": "Tankard of Sobriety",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This tankard has a stern face sculpted into one side. You can drink ale, wine, or any other nonmagical alcoholic beverage poured into it without becoming inebriated. The tankard has no effect on magical liquids or harmful substances such as poison."
  },
  {
    "name": "Tentacle Rod",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This rod ends in three rubbery tentacles. While holding the rod, you can take a Magic action to direct the tentacles to stretch outward, each one attacking a creature you can see within 15 feet of yourself. For each tentacle, make a melee attack roll with a +9 bonus. A tentacle deals 1d6 Psychic damage on a hit. If you hit the same target with all three tentacles, the target must succeed on a 15 Dexterity saving throw or have the Restrained condition until you have the Incapacitated condition, until you take a Bonus Action to release the target, or until the target is no longer within 15 feet of you. While Restrained in this way, the target takes 3d6 Psychic damage at the start of each of its turns. At the end of each of its turns, the target repeats the save, ending the effect on itself on a success."
  },
  {
    "name": "Thunderous Greatclub",
    "rarity": "very rare",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "While you are attuned to this magic weapon, your Strength is 20 unless your Strength is already equal to or greater than that score. The weapon deals an extra 1d8 Thunder damage to any creature it hits and an extra 3d8 Thunder damage to objects it hits that aren't being worn or carried. The weapon has the following additional properties. **Clap of Thunder:** As a Magic action, you can strike the weapon against a hard surface to create a loud clap of thunder audible out to 300 feet. You also create a 30-foot Cone [Area of Effect] of thunderous energy. Each creature in the Cone [Area of Effect] must succeed on a 15 Strength saving throw or have the Prone condition. Nonmagical objects in the Cone [Area of Effect] that aren't being worn or carried take 3d8 Thunder damage. **Earthquake:** As a Magic action, you can strike the weapon against the ground to create an intense seismic disturbance in a 50-foot-radius circle centered on the point of impact. Structures in contact with the ground in that area take 50 Bludgeoning damage, and each creature on the ground in that area must succeed on a 20 Dexterity saving throw or have the Prone condition. If that creature is also Concentration, it must succeed on a 20 Constitution saving throw or its Concentration is broken. In addition, you can cause a 30-foot-deep, 10-foot-wide fissure to open up on the ground anywhere in the area. Any creature on a spot where the fissure opens must make a 20 Dexterity saving throw, falling into the fissure on a failed save or moving with the fissure's edge on a successful one. Any structure on a spot where the fissure opens collapses into the fissure. Once you use this property, it can't be used again until the next dawn."
  },
  {
    "name": "Tome of Clear Thought",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This book contains memory and logic exercises, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book's contents and practicing its guidelines, your Intelligence increases by 2, to a maximum of 30. The manual then loses its magic, but regains it in a century."
  },
  {
    "name": "Tome of Leadership and Influence",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This book contains guidelines for influencing and charming others, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book's contents and practicing its guidelines, your Charisma increases by 2, to a maximum of 30. The manual then loses its magic, but regains it in a century."
  },
  {
    "name": "Tome of the Stilled Tongue",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This book has a desiccated tongue pinned to its front cover. Five of these tomes exist, and it's unknown which one is the original. The tongue on the first Tome of the Stilled Tongue belonged to a treacherous former servant of the lich Vecna. The tongues pinned to the covers of the four copies came from other spellcasters who crossed Vecna. The first few pages of each tome are filled with indecipherable scrawls. The remaining pages are blank. While attuned to this item, you can use it as a Spellbook and an Arcane Focus. In addition, while holding the tome, you can take a Bonus Action to cast a spell you have written in this tome, without expending a spell slot or using any Verbal or Somatic components. Once used, this property of the tome can't be used again until the next dawn. Only you can remove the tongue from the book's cover. If you do so, all spells written in the book are permanently erased. Vecna watches anyone using this tome and can write cryptic messages in it. These messages typically fade away after they are read."
  },
  {
    "name": "Tome of Understanding",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This book contains intuition and insight exercises, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book's contents and practicing its guidelines, your Wisdom increases by 2, to a maximum of 30. The manual then loses its magic, but regains it in a century."
  },
  {
    "name": "Trident of Fish Command",
    "rarity": "uncommon",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "This magic weapon has 3 charges, and it regains 1d3 expended charges daily at dawn. While you carry it, you can expend 1 charge to cast Dominate Beast (save 15) from it on a Beast that has a Swim Speed."
  },
  {
    "name": "Universal Solvent",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This tube holds milky liquid with a strong alcohol smell. When found, a tube contains 1d6 + 1 ounces. You can take a Utilize action to pour 1 or more ounces of solvent from the tube onto a surface within reach. Each ounce instantly dissolves up to 1 square foot of adhesive it touches, including Sovereign Glue."
  },
  {
    "name": "Veteran's Cane",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "As a Bonus Action, you can transform this walking cane into an ordinary Longsword or change the Longsword back into a walking cane. In either case, you must be holding the item."
  },
  {
    "name": "Wand of Binding",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This wand has 7 charges. **Spells:** While holding the wand, you can cast one of the spells (save 17) on the following table from it. The table indicates how many charges you must expend to cast the spell. **Regaining Charges:** The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand's last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
  },
  {
    "name": "Wand of Conducting",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This wand has 3 charges. While holding it, you can take a Magic action to expend 1 charge and create orchestral music by waving it around. The music can be heard out to 120 feet and ends when you stop waving the wand. **Regaining Charges:** The wand regains all expended charges daily at dawn. If you expend the wand's last charge, roll 1d20. On a 1, a sad tuba sound plays as the wand crumbles into dust and is destroyed."
  },
  {
    "name": "Wand of Enemy Detection",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This wand has 7 charges. While holding it, you can take a Magic action to expend 1 charge. For 1 minute, you know the direction of the nearest creature Hostile [Attitude] to you within 60 feet, but not its distance from you. The wand can sense the presence of Hostile [Attitude] creatures that are Invisible, ethereal, disguised, or hidden, as well as those in plain sight. The effect ends if you stop holding the wand. **Regaining Charges:** The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand's last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
  },
  {
    "name": "Wand of Fear",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This wand has 7 charges. **Spells:** While holding the wand, you can cast one of the spells (save 15) on the following table from it. The table indicates how many charges you must expend to cast the spell. **Regaining Charges:** The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand's last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
  },
  {
    "name": "Wand of Fireballs",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This wand has 7 charges. While holding it, you can expend no more than 3 charges to cast Fireball (save 15) from it. For 1 charge, you cast the level 3 version of the spell. You can increase the spell's level by 1 for each additional charge you expend. **Regaining Charges:** The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand's last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
  },
  {
    "name": "Wand of Lightning Bolts",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This wand has 7 charges. While holding it, you can expend no more than 3 charges to cast Lightning Bolt (save 15) from it. For 1 charge, you cast the level 3 version of the spell. You can increase the spell's level by 1 for each additional charge you expend. **Regaining Charges:** The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand's last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
  },
  {
    "name": "Wand of Magic Detection",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This wand has 3 charges. While holding it, you can expend 1 charge to cast Detect Magic from it. The wand regains 1d3 expended charges daily at dawn."
  },
  {
    "name": "Wand of Magic Missiles",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This wand has 7 charges. While holding it, you can expend no more than 3 charges to cast Magic Missile from it. For 1 charge, you cast the level 1 version of the spell. You can increase the spell's level by 1 for each additional charge you expend. **Regaining Charges:** The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand's last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
  },
  {
    "name": "Wand of Orcus",
    "rarity": "artifact",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "Crafted and wielded by Orcus, this ghastly wand slips from the demon lord's grasp from time to time. When it does, it magically appears wherever the demon lord senses an opportunity to achieve some fell goal. The wand is topped with a skull that once belonged to a human hero slain by Orcus. The wand can magically change in size to better conform to the grip of its user. All Holy Water within 10 feet of the wand is destroyed. Any creature besides Orcus that tries to attune to the wand makes a 17 Constitution saving throw. On a successful save, the creature takes 10d6 Necrotic damage. On a failed save, the creature dies and, if it is a Humanoid, turns into a Zombie. **Magic Weapon:** You can wield the wand as a magic Mace that grants a +3 bonus to attack rolls and damage rolls made with it. The wand deals an extra 2d12 Necrotic damage on a hit. **Random Properties:** The Wand of Orcus has the following random properties: 2 Artifact Properties; Minor Beneficial Properties properties 1 Artifact Properties; Major Beneficial Properties property 2 Artifact Properties; Minor Detrimental Properties properties 1 Artifact Properties; Major Detrimental Properties property The detrimental properties of the Wand of Orcus are suppressed while the wand is attuned to Orcus. **Protection:** You gain a +3 bonus to Armor Class while holding the wand. **Spells:** The wand has 7 charges and regains 1d4 + 3 expended charges daily at dawn. While holding the wand, you can cast one of the spells on the following table from it (save 18). The table indicates how many charges you must expend to cast the spell. While attuned to the wand, Orcus or a follower blessed by him can cast each of the wand's spells using 2 fewer charges (minimum of 0). **Call Undead:** While holding the wand, you can take a Magic action to conjure 15 Skeleton and 15 Zombie. These Undead magically rise up from the ground or otherwise form in unoccupied spaces within 300 feet of you and obey your commands until they are destroyed or until the next dawn, when they collapse into inanimate piles of bones and rotting corpses. Once you use this property, you can't use it again until the next dawn. While holding the wand, Orcus can summon any kind of Undead, not just skeletons and zombies. These Undead don't perish at dawn the following day, remaining until Orcus dismisses them. **Sentience:** The Wand of Orcus is a sentient Chaotic Evil item with an Intelligence of 16, a Wisdom of 12, and a Charisma of 16. It has hearing and Darkvision out to 120 feet. The wand communicates telepathically with its wielder and speaks Abyssal and Common. **Personality:** The wand's purpose is to help satisfy Orcus's desire to slay everything in the multiverse. The wand is cruel, nihilistic, and bereft of humor. To further Orcus's goals, the wand feigns devotion to its current user and makes grandiose promises that it has no intention of fulfilling, such as vowing to help its user overthrow Orcus. **Destroying the Wand:** Destroying the Wand of Orcus requires that it be taken to the Positive Energy Plane by the ancient hero whose skull surmounts it. For this to happen, the long-lost hero must first be restored to life—no easy task, given the fact that Orcus has imprisoned the hero's soul and keeps it hidden and well guarded. Bathing the wand in positive energy (such as that which permeates the Positive Plane) causes it to crack and explode, but unless the above conditions are met, the wand instantly re-forms on Orcus's layer of the Abyss."
  },
  {
    "name": "Wand of Paralysis",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This wand has 7 charges. While holding it, you can take a Magic action to expend 1 charge to cause a thin blue ray to streak from the tip toward a creature you can see within 60 feet of yourself. The target must succeed on a 15 Constitution saving throw or have the Paralyzed condition for 1 minute. At the end of each of the target's turns, it repeats the save, ending the effect on itself on a success. **Regaining Charges:** The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand's last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
  },
  {
    "name": "Wand of Polymorph",
    "rarity": "very rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This wand has 7 charges. While holding it, you can expend 1 charge to cast Polymorph (save 15) from it. **Regaining Charges:** The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand's last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
  },
  {
    "name": "Wand of Pyrotechnics",
    "rarity": "common",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This wand has 7 charges. While holding it, you can take a Magic action to expend 1 charge and create a harmless burst of multicolored light at a point you can see up to 120 feet away. The burst of light is accompanied by a crackling noise that can be heard up to 300 feet away. The light is as bright as a torch flame but lasts only a second. **Regaining Charges:** The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand's last charge, roll 1d20. On a 1, the wand erupts in a harmless pyrotechnic display and is destroyed."
  },
  {
    "name": "Wand of Secrets",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This wand has 3 charges and regains 1d3 expended charges daily at dawn. While holding it, you can take a Magic action to expend 1 charge, and if a secret door or trap is within 60 feet of you, the wand pulses and points at the one nearest to you."
  },
  {
    "name": "Wand of Web",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This wand has 7 charges. While holding it, you can expend 1 charge to cast Web (save 13) from it. **Regaining Charges:** The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand's last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
  },
  {
    "name": "Wand of Wonder",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "This wand has 7 charges. While holding it, you can take a Magic action to expend 1 charge while choosing a point within 120 feet of yourself. That location becomes the point of origin of a spell or other magical effect determined by rolling on the Wand of Wonder Effects table. Spells cast from the wand have a save DC of 15. If a spell's maximum range is normally less than 120 feet, it becomes 120 feet when cast from the wand. If an effect has multiple possible subjects, the DM determines randomly which among them are affected. **Regaining Charges:** The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand's last charge, roll 1d20. On a 1, the wand crumbles into dust and is destroyed."
  },
  {
    "name": "Wave",
    "rarity": "artifact",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "Held in the dungeon of White Plume Mountain, Wave is engraved with images of waves, shells, and sea creatures. You gain a +3 bonus to attack rolls and damage rolls made with this magic weapon. When you roll a 20 on the d20 for an attack roll with this weapon, the target takes an extra 21 Necrotic damage. While holding Wave, you gain the following benefits: **Combat Ready:** You have Advantage on Initiative rolls. **Underwater Adaptation:** A bubble of air forms around your head while you are underwater, allowing you to breathe normally in that environment. **Aquatic Command:** Wave has 3 charges and regains 1d3 expended charges daily at dawn. While you carry it, you can expend 1 charge to cast Dominate Beast (save 20) from it on a Beast that has a Swim Speed. **Globe of Invulnerability:** While holding Wave, you can cast the level 9 version of Globe of Invulnerability from it. Once used, this property can't be used again until the next dawn. **Sentience:** Wave is a sentient weapon of Neutral alignment, with an Intelligence of 14, a Wisdom of 10, and a Charisma of 18. It has hearing and Darkvision out to 120 feet. The weapon communicates telepathically with its wielder and speaks Aquan. **Personality:** Wave zealously encourages mortals to worship sea gods and has a habit of humming sea chanteys. Conflict arises if the wielder fails to further the weapon's objectives in the world. **Destroying Wave:** Wave can be destroyed only on the island of Thunderforge, where it was forged. The weapon must be melted down by a storm giant or someone imbued with a storm giant's strength. Destroying Wave angers a god of the sea, who sends powerful agents to attack the island and punish the destroyers."
  },
  {
    "name": "Well of Many Worlds",
    "rarity": "legendary",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "This fine black cloth, soft as silk, is folded up to the dimensions of a handkerchief. It unfolds into a circular sheet 6 feet in diameter. You can take a Magic action to unfold the Well of Many Worlds and place it on a solid surface, whereupon it forms a two-way, 6-foot-diameter, circular portal to another world or plane of existence. Each time the item opens a portal, the DM decides where it leads. The portal remains open until a creature within 5 feet of it takes a Magic action to close it by taking hold of the edges of the cloth and folding it up. Once the Well of Many Worlds has opened a portal, it can't do so again for 1d8 hours."
  },
  {
    "name": "Whelm",
    "rarity": "artifact",
    "itemType": "weapon",
    "requiresAttunement": true,
    "description": "Whelm is a powerful weapon forged by dwarves and lost in the dungeon of White Plume Mountain. You gain a +3 bonus to attack rolls and damage rolls made with this magic weapon. **Hurl:** Whelm has T with a normal range of 60 feet and a long range of 180 feet. When you hit with a ranged attack roll using Whelm, the target takes an extra 1d8 Force damage, or an extra 4d8 Force damage if the target is a Construct, an Elemental, or a Giant. Immediately after hitting or missing, the weapon flies back to your hand. **Shock Wave:** You can take a Magic action to strike the ground with Whelm and send a shock wave out from the point of impact. Each creature of your choice on the ground within 60 feet of that point must succeed on a 20 Constitution saving throw or have the Stunned condition for 1 minute. A creature repeats the save at the end of each of its turns, ending the effect on itself on a success. Once used, this property can't be used again until the next dawn. **Supernatural Awareness:** While you are holding the weapon, it alerts you to the location of any secret or concealed doors within 30 feet of you. In addition, you can cast Detect Evil and Good or Locate Object from the weapon. Once you cast either spell, you can't cast it from the weapon again until the next dawn. **Sentience:** Whelm is a sentient, Lawful Neutral weapon with an Intelligence of 15, a Wisdom of 12, and a Charisma of 15. It has hearing and Darkvision out to 120 feet. The weapon communicates telepathically with its wielder and speaks Dwarvish, Giant, and Goblin. **Personality:** Whelm has ties to the dwarf clan that created it, called the Dankil or the Mightyhammer clan. It longs to be returned to that clan. Whelm's purpose is to protect dwarves. Conflict arises if the wielder doesn't share this goal. **Destroying Whelm:** Whelm can be dissolved in the acidic bile of a recently slain ancient black dragon. It can also be melted down in the forges of the Mightyhammer dwarf clan, but only by the rightful leader of that clan."
  },
  {
    "name": "White Dragon Scale Mail",
    "rarity": "very rare",
    "itemType": "armor",
    "requiresAttunement": true,
    "description": "{#itemEntry Dragon Scale Mail|XDMG}"
  },
  {
    "name": "Wind Fan",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": false,
    "description": "While holding this fan, you can cast Gust of Wind (save 13) from it. Each subsequent time the fan is used before the next dawn, it has a cumulative 20 chance of not working; if the fan fails to work, it tears into useless, nonmagical tatters."
  },
  {
    "name": "Winged Boots",
    "rarity": "uncommon",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "These boots have 4 charges and regain 1d4 expended charges daily at dawn. While wearing the boots, you can take a Magic action to expend 1 charge, gaining a Fly Speed of 30 feet for 1 hour. If you are flying when the duration expires, you descend at a rate of 30 feet per round until you land."
  },
  {
    "name": "Wings of Flying",
    "rarity": "rare",
    "itemType": "wondrous",
    "requiresAttunement": true,
    "description": "While wearing this cloak, you can take a Magic action to turn the cloak into a pair of wings on your back. The wings lasts for 1 hour or until you end the effect early as a Magic action. The wings give you a Fly Speed of 60 feet. If you are aloft when the wings disappear, you fall. When the wings disappear, you can't use them again for 1d12 hours."
  }
];
