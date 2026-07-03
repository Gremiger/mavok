export interface GearData {
  name: string;
  weight: number | null;
  value: number | null;
  description: string;
}

export const GEAR: GearData[] = [
  {
    "name": "Acid",
    "weight": 1,
    "value": 25,
    "description": "When you take the Attack action, you can replace one of your attacks with throwing a vial of Acid. Target one creature or object you can see within 20 feet of yourself. The target must succeed on a Dexterity saving throw (8 plus your Dexterity modifier and Proficiency) or take 2d6 Acid damage."
  },
  {
    "name": "Alchemist's Fire",
    "weight": 1,
    "value": 50,
    "description": "When you take the Attack action, you can replace one of your attacks with throwing a flask of Alchemist's Fire. Target one creature or object you can see within 20 feet of yourself. The target must succeed on a Dexterity saving throw (8 plus your Dexterity modifier and Proficiency) or take 1d4 Fire damage and start burning."
  },
  {
    "name": "Antitoxin",
    "weight": null,
    "value": 50,
    "description": "As a Bonus Action, you can drink a vial of Antitoxin to gain Advantage on saving throws to avoid or end the Poisoned condition for 1 hour."
  },
  {
    "name": "Backpack",
    "weight": 5,
    "value": 2,
    "description": "A Backpack holds up to 30 pounds within 1 cubic foot. It can also serve as a saddlebag."
  },
  {
    "name": "Ball Bearings",
    "weight": 2,
    "value": 1,
    "description": "As a Utilize action, you can spill Ball Bearings from their pouch. They spread to cover a level, 10-foot-square area within 10 feet of yourself. A creature that enters this area for the first time on a turn must succeed on a 10 Dexterity saving throw or have the Prone condition. It takes 10 minutes to recover the Ball Bearings."
  },
  {
    "name": "Barrel",
    "weight": 70,
    "value": 2,
    "description": "A Barrel holds up to 40 gallons of liquid or up to 4 cubic feet of dry goods."
  },
  {
    "name": "Basic Poison",
    "weight": null,
    "value": 100,
    "description": "As a Bonus Action, you can use a vial of Basic Poison to coat one weapon or up to three pieces of ammunition. A creature that takes Piercing or Slashing damage from the poisoned weapon or ammunition takes an extra 1d4 Poison damage. Once applied, the poison retains potency for 1 minute or until its damage is dealt, whichever comes first."
  },
  {
    "name": "Basket",
    "weight": 2,
    "value": 0.4,
    "description": "A Basket holds up to 40 pounds within 2 cubic feet."
  },
  {
    "name": "Bedroll",
    "weight": 7,
    "value": 1,
    "description": "A Bedroll sleeps one Small or Medium creature. While in a Bedroll, you automatically succeed on saving throws against extreme cold (see the Dungeon Master's Guide)."
  },
  {
    "name": "Bell",
    "weight": null,
    "value": 1,
    "description": "When rung as a Utilize action, a Bell produces a sound that can be heard up to 60 feet away."
  },
  {
    "name": "Blanket",
    "weight": 3,
    "value": 0.5,
    "description": "While wrapped in a blanket, you have Advantage on saving throws against extreme cold (see the Dungeon Master's Guide)."
  },
  {
    "name": "Block and Tackle",
    "weight": 5,
    "value": 1,
    "description": "A Block and Tackle allows you to hoist up to four times the weight you can normally lift."
  },
  {
    "name": "Book",
    "weight": 5,
    "value": 25,
    "description": "A Book contains fiction or nonfiction. If you consult an accurate nonfiction Book about its topic, you gain a +5 bonus to Intelligence (Arcana, History, Nature, or Religion) checks you make about that topic."
  },
  {
    "name": "Bucket",
    "weight": 2,
    "value": 0.05,
    "description": "A Bucket holds up to half a cubic foot of contents."
  },
  {
    "name": "Bullseye Lantern",
    "weight": 2,
    "value": 10,
    "description": "A Bullseye Lantern burns Oil as fuel to cast Bright Light in a 60-foot Cone and Dim Light for an additional 60 feet."
  },
  {
    "name": "Burglar's Pack",
    "weight": 47.5,
    "value": 16,
    "description": "A Burglar's Pack contains the following items: Backpack, Ball Bearings, Bell, 10 Candle, Crowbar, Hooded Lantern, 7 flasks of Oil, 5 days of Rations, Rope, Tinderbox, and Waterskin."
  },
  {
    "name": "Caltrops",
    "weight": 2,
    "value": 1,
    "description": "As a Utilize action, you can spread Caltrops from their bag to cover a 5-foot-square area within 5 feet of yourself. A creature that enters this area for the first time on a turn must succeed on a 15 Dexterity saving throw or take 1 Piercing damage and have its Speed reduced to 0 until the start of its next turn. It takes 10 minutes to recover the Caltrops."
  },
  {
    "name": "Candle",
    "weight": null,
    "value": 0.01,
    "description": "For 1 hour, a lit Candle sheds Bright Light in a 5-foot radius and Dim Light for an additional 5 feet."
  },
  {
    "name": "Chain",
    "weight": 10,
    "value": 5,
    "description": "As a Utilize action, you can wrap a Chain around an unwilling creature within 5 feet of yourself that has the Grappled, Incapacitated, or Restrained condition if you succeed on a 13 Strength (Athletics) check. If the creature's legs are bound, the creature has the Restrained condition until it escapes. Escaping the Chain requires the creature to make a successful 18 Dexterity (Acrobatics) check as an action. Bursting the Chain requires a successful 20 Strength (Athletics) check as an action."
  },
  {
    "name": "Chest",
    "weight": 25,
    "value": 5,
    "description": "A Chest holds up to 12 cubic feet of contents."
  },
  {
    "name": "Climber's Kit",
    "weight": 12,
    "value": 25,
    "description": "A Climber's Kit includes boot tips, gloves, pitons, and a harness. As a Utilize action, you can use the Climber's Kit to anchor yourself; when you do, you can't fall more than 25 feet from the anchor point, and you can't move more than 25 feet from there without undoing the anchor as a Bonus Action."
  },
  {
    "name": "Component Pouch",
    "weight": 2,
    "value": 25,
    "description": "A Component Pouch is watertight and filled with compartments that hold all the free Material components of your spells."
  },
  {
    "name": "Costume",
    "weight": 4,
    "value": 5,
    "description": "While wearing a Costume, you have Advantage on any ability check you make to impersonate the person or type of person it represents."
  },
  {
    "name": "Crossbow Bolt Case",
    "weight": 1,
    "value": 1,
    "description": "A Crossbow Bolt Case holds up to 20 Bolts."
  },
  {
    "name": "Crowbar",
    "weight": 5,
    "value": 2,
    "description": "Using a Crowbar gives you Advantage on Strength checks where the Crowbar's leverage can be applied."
  },
  {
    "name": "Diplomat's Pack",
    "weight": 39,
    "value": 39,
    "description": "A Diplomat's Pack contains the following items: Chest, Fine Clothes, Ink, 5 Ink Pen, Lamp, 2 Map or Scroll Case, 4 flasks of Oil, 5 sheets of Paper, 5 sheets of Parchment, Perfume, and Tinderbox."
  },
  {
    "name": "Dungeoneer's Pack",
    "weight": 55,
    "value": 12,
    "description": "A Dungeoneer's Pack contains the following items: Backpack, Caltrops, Crowbar, 2 flasks of Oil, 10 days of Rations, Rope, Tinderbox, 10 Torch, and Waterskin."
  },
  {
    "name": "Entertainer's Pack",
    "weight": 58.5,
    "value": 40,
    "description": "An Entertainer's Pack contains the following items: Backpack, Bedroll, Bell, Bullseye Lantern, 3 Costume, Mirror, 8 flasks of Oil, 9 days of Rations, Tinderbox, and Waterskin."
  },
  {
    "name": "Explorer's Pack",
    "weight": 55,
    "value": 10,
    "description": "An Explorer's Pack contains the following items: Backpack, Bedroll, 2 flasks of Oil, 10 days of Rations, Rope, Tinderbox, 10 Torch, and Waterskin."
  },
  {
    "name": "Fine Clothes",
    "weight": 6,
    "value": 15,
    "description": "Fine Clothes are made of expensive fabrics and adorned with expertly crafted details. Some events and locations admit only people wearing these clothes."
  },
  {
    "name": "Flask",
    "weight": 1,
    "value": 0.02,
    "description": "A Flask holds up to 1 pint."
  },
  {
    "name": "Glass Bottle",
    "weight": 2,
    "value": 2,
    "description": "A Glass Bottle holds up to 1½ pints."
  },
  {
    "name": "Grappling Hook",
    "weight": 4,
    "value": 2,
    "description": "As a Utilize action, you can throw the Grappling Hook at a railing, a ledge, or another catch within 50 feet of yourself, and the hook catches on if you succeed on a 13 Dexterity (Acrobatics) check. If you tied a Rope to the hook, you can then climb it."
  },
  {
    "name": "Healer's Kit",
    "weight": 3,
    "value": 5,
    "description": "A Healer's Kit has ten uses. As a Utilize action, you can expend one of its uses to stabilize an Unconscious creature that has 0 Hit Points without needing to make a Wisdom (Medicine) check."
  },
  {
    "name": "Holy Water",
    "weight": 1,
    "value": 25,
    "description": "When you take the Attack action, you can replace one of your attacks with throwing a flask of Holy Water. Target one creature you can see within 20 feet of yourself. The target must succeed on a Dexterity saving throw (8 plus your Dexterity modifier and Proficiency) or take 2d8 Radiant damage if it is a Fiend or an Undead."
  },
  {
    "name": "Hooded Lantern",
    "weight": 2,
    "value": 5,
    "description": "A Hooded Lantern burns Oil as fuel to cast Bright Light in a 30-foot radius and Dim Light for an additional 30 feet. As a Bonus Action, you can lower the hood, reducing the light to Dim Light in a 5-foot radius, or raise it again."
  },
  {
    "name": "Hunting Trap",
    "weight": 25,
    "value": 5,
    "description": "As a Utilize action, you can set a Hunting Trap, which is a sawtooth steel ring that snaps shut when a creature steps on a pressure plate in the center. The trap is affixed by a heavy chain to an immobile object, such as a tree or a spike driven into the ground. A creature that steps on the plate must succeed on a 13 Dexterity saving throw or take 1d4 Piercing damage and have its Speed reduced to 0 until the start of its next turn. Thereafter, until the creature breaks free of the trap, its movement is limited by the length of the chain (typically 3 feet). A creature can use its action to make a 13 Strength (Athletics) check, freeing itself or another creature within its reach on a success. Each failed check deals 1 Piercing damage to the trapped creature."
  },
  {
    "name": "Ink",
    "weight": null,
    "value": 10,
    "description": "Ink comes in a 1-ounce bottle, which provides enough ink to write about 500 pages."
  },
  {
    "name": "Ink Pen",
    "weight": null,
    "value": 0.02,
    "description": "Using Ink, an Ink Pen is used to write or draw."
  },
  {
    "name": "Iron Pot",
    "weight": 10,
    "value": 2,
    "description": "An Iron Pot holds up to 1 gallon."
  },
  {
    "name": "Iron Spike",
    "weight": 0.5,
    "value": 0.1,
    "description": "Iron Spikes come in bundles of ten. As a Utilize action, you can use a blunt object, such as a Light Hammer, to hammer a spike into wood, earth, or a similar material. You can do so to jam a door shut or to then tie a Rope or Chain to the Spike."
  },
  {
    "name": "Iron Spikes",
    "weight": 5,
    "value": 1,
    "description": "Iron Spikes come in bundles of ten. As a Utilize action, you can use a blunt object, such as a Light Hammer, to hammer a spike into wood, earth, or a similar material. You can do so to jam a door shut or to then tie a Rope or Chain to the Spike."
  },
  {
    "name": "Jug",
    "weight": 4,
    "value": 0.02,
    "description": "A Jug holds up to 1 gallon."
  },
  {
    "name": "Ladder",
    "weight": 25,
    "value": 0.1,
    "description": "A Ladder is 10 feet tall. You must climb to move up or down it."
  },
  {
    "name": "Lamp",
    "weight": 1,
    "value": 0.5,
    "description": "A Lamp burns Oil as fuel to cast Bright Light in a 15-foot radius and Dim Light for an additional 30 feet."
  },
  {
    "name": "Lock",
    "weight": 1,
    "value": 10,
    "description": "A Lock comes with a key. Without the key, a creature can use Thieves' Tools to pick this Lock with a successful 15 Dexterity (Sleight of Hand) check."
  },
  {
    "name": "Magnifying Glass",
    "weight": null,
    "value": 100,
    "description": "A Magnifying Glass grants Advantage on any ability check made to appraise or inspect a highly detailed item. Lighting a fire with a Magnifying Glass requires light as bright as sunlight to focus, tinder to ignite, and about 5 minutes for the fire to ignite."
  },
  {
    "name": "Manacles",
    "weight": 6,
    "value": 2,
    "description": "As a Utilize action, you can use Manacles to bind an unwilling Small or Medium creature within 5 feet of yourself that has the Grappled, Incapacitated, or Restrained condition if you succeed on a 13 Dexterity (Sleight of Hand) check. While bound, a creature has Disadvantage on attack rolls, and the creature is Restrained if the Manacles are attached to a chain or hook that is fixed in place. Escaping the Manacles requires a successful 20 Dexterity (Sleight of Hand) check as an action. Bursting them requires a successful 25 Strength (Athletics) check as an action. Each set of Manacles comes with a key. Without the key, a creature can use Thieves' Tools to pick the Manacles' lock with a successful 15 Dexterity (Sleight of Hand) check."
  },
  {
    "name": "Map",
    "weight": null,
    "value": 1,
    "description": "If you consult an accurate Map, you gain a +5 bonus to Wisdom (Survival) checks you make to find your way in the place represented on it."
  },
  {
    "name": "Map or Scroll Case",
    "weight": 1,
    "value": 1,
    "description": "A Map or Scroll Case holds up to 10 sheets of paper or 5 sheets of parchment."
  },
  {
    "name": "Mirror",
    "weight": 0.5,
    "value": 5,
    "description": "A handheld steel Mirror is useful for personal cosmetics but also for peeking around corners and reflecting light as a signal."
  },
  {
    "name": "Net",
    "weight": 3,
    "value": 1,
    "description": "When you take the Attack action, you can replace one of your attacks with throwing a Net. Target a creature you can see within 15 feet of yourself. The target must succeed on a Dexterity saving throw (8 plus your Dexterity modifier and Proficiency) or have the Restrained condition until it escapes. The target succeeds automatically if it is Huge or larger. To escape, the target or a creature within 5 feet of it must take an action to make a 10 Strength (Athletics) check, freeing the Restrained creature on a success. Destroying the Net (AC 10; 5 HP; Immunity to Bludgeoning, Poison, and Psychic damage) also frees the target, ending the effect."
  },
  {
    "name": "Oil",
    "weight": 1,
    "value": 0.1,
    "description": "You can douse a creature, object, or space with Oil or use it as fuel, as detailed below. **Dousing a Creature or an Object:** When you take the Attack action, you can replace one of your attacks with throwing an Oil flask. Target one creature or object within 20 feet of yourself. The target must succeed on a Dexterity saving throw (8 plus your Dexterity modifier and Proficiency) or be covered in oil. If the target takes Fire damage before the oil dries (after 1 minute), the target takes an extra 5 Fire damage from burning oil. **Dousing a Space:** You can take the Utilize action to pour an Oil flask on level ground to cover a 5-foot-square area within 5 feet of yourself. If lit, the oil burns until the end of the turn 2 rounds from when the oil was lit (or 12 seconds) and deals 5 Fire damage to any creature that enters the area or ends its turn there. A creature can take this damage only once per turn. **Fuel:** Oil serves as fuel for Lamps and Lanterns. Once lit, a flask of Oil burns for 6 hours in a Lamp or Lantern. That duration doesn't need to be consecutive; you can extinguish the burning Oil (as a Utilize action) and rekindle it again until it has burned for a total of 6 hours."
  },
  {
    "name": "Paper",
    "weight": null,
    "value": 0.2,
    "description": "One sheet of Paper can hold about 250 handwritten words."
  },
  {
    "name": "Parchment",
    "weight": null,
    "value": 0.1,
    "description": "One sheet of Parchment can hold about 250 handwritten words."
  },
  {
    "name": "Perfume",
    "weight": null,
    "value": 5,
    "description": "Perfume comes in a 4-ounce vial. For 1 hour after applying Perfume to yourself, you have Advantage on Charisma (Persuasion) checks made to influence an Indifferent Humanoid within 5 feet of yourself."
  },
  {
    "name": "Pole",
    "weight": 7,
    "value": 0.05,
    "description": "A Pole is 10 feet long. You can use it to touch something up to 10 feet away. If you must make a Strength (Athletics) check as part of a High or Long Jump, you can use the Pole to vault, giving yourself Advantage on the check."
  },
  {
    "name": "Portable Ram",
    "weight": 35,
    "value": 4,
    "description": "You can use a Portable Ram to break down doors. When doing so, you gain a +4 bonus to the Strength check. One other character can help you use the ram, giving you Advantage on this check."
  },
  {
    "name": "Pouch",
    "weight": 1,
    "value": 0.5,
    "description": "A Pouch holds up to 6 pounds within one-fifth of a cubic foot."
  },
  {
    "name": "Priest's Pack",
    "weight": 29,
    "value": 33,
    "description": "A Priest's Pack contains the following items: Backpack, Blanket, Holy Water, Lamp, 7 days of Rations, Robe, and Tinderbox."
  },
  {
    "name": "Quiver",
    "weight": 1,
    "value": 1,
    "description": "A Quiver holds up to 20 Arrows."
  },
  {
    "name": "Rations",
    "weight": 2,
    "value": 0.5,
    "description": "Rations consist of travel-ready food, including jerky, dried fruit, hardtack, and nuts. See \"Malnutrition\" for the risks of not eating."
  },
  {
    "name": "Robe",
    "weight": 4,
    "value": 1,
    "description": "A Robe has vocational or ceremonial significance. Some events and locations admit only people wearing a Robe bearing certain colors or symbols."
  },
  {
    "name": "Rope",
    "weight": 5,
    "value": 1,
    "description": "As a Utilize action, you can tie a knot with Rope if you succeed on a 10 Dexterity (Sleight of Hand) check. The Rope can be burst with a successful 20 Strength (Athletics) check. You can bind an unwilling creature with the Rope only if the creature has the Grappled, Incapacitated, or Restrained condition. If the creature's legs are bound, the creature has the Restrained condition until it escapes. Escaping the Rope requires the creature to make a successful 15 Dexterity (Acrobatics) check as an action."
  },
  {
    "name": "Sack",
    "weight": 0.5,
    "value": 0.01,
    "description": "A Sack holds up to 30 pounds within 1 cubic foot."
  },
  {
    "name": "Scholar's Pack",
    "weight": 22,
    "value": 40,
    "description": "A Scholar's Pack contains the following items: Backpack, Book, Ink, Ink Pen, Lamp, 10 flasks of Oil, 10 sheets of Parchment, and Tinderbox."
  },
  {
    "name": "Shovel",
    "weight": 5,
    "value": 2,
    "description": "Working for 1 hour, you can use a Shovel to dig a hole that is 5 feet on each side in soil or similar material."
  },
  {
    "name": "Signal Whistle",
    "weight": null,
    "value": 0.05,
    "description": "When blown as a Utilize action, a Signal Whistle produces a sound that can be heard up to 600 feet away."
  },
  {
    "name": "Spyglass",
    "weight": 1,
    "value": 1000,
    "description": "Objects viewed through a Spyglass are magnified to twice their size."
  },
  {
    "name": "String",
    "weight": null,
    "value": 0.1,
    "description": "String is 10 feet long. You can tie a knot in it as a Utilize action."
  },
  {
    "name": "Tent",
    "weight": 20,
    "value": 2,
    "description": "A Tent sleeps up to two Small or Medium creatures."
  },
  {
    "name": "Tinderbox",
    "weight": 1,
    "value": 0.5,
    "description": "A Tinderbox is a small container holding flint, fire steel, and tinder (usually dry cloth soaked in light oil) used to kindle a fire. Using it to light a Candle, Lamp, Hooded Lantern, or Torch—or anything else with exposed fuel—takes a Bonus Action. Lighting any other fire takes 1 minute."
  },
  {
    "name": "Torch",
    "weight": 1,
    "value": 0.01,
    "description": "A Torch burns for 1 hour, casting Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. When you take the Attack action, you can attack with the Torch, using it as a Simple Melee weapon. On a hit, the target takes 1 Fire damage."
  },
  {
    "name": "Traveler's Clothes",
    "weight": 4,
    "value": 2,
    "description": "Traveler's Clothes are resilient garments designed for travel in various environments."
  },
  {
    "name": "Trinket",
    "weight": null,
    "value": null,
    "description": "When you make your character, you can roll once on the Trinkets table to gain a Tiny trinket, a simple item lightly touched by mystery. The DM might also use this table. It can help stock a room in a dungeon or fill a creature's pockets."
  },
  {
    "name": "Vial",
    "weight": null,
    "value": 1,
    "description": "A Vial holds up to 4 ounces."
  },
  {
    "name": "Waterskin",
    "weight": 5,
    "value": 0.2,
    "description": "A Waterskin holds up to 4 pints. If you don't drink sufficient water, you risk dehydration."
  }
];
