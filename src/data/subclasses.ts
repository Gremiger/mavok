export interface SubclassData {
  name: string;
  shortName: string;
  features: SubclassFeature[];
}

export interface SubclassFeature {
  name: string;
  level: number;
  description: string;
}

export const SUBCLASSES: SubclassData[] = [
  {
    "name": "Path of the Berserker",
    "shortName": "Berserker",
    "features": [
      {
        "name": "Path of the Berserker",
        "level": 3,
        "description": "Channel Rage into Violent Fury Barbarians who walk the Path of the Berserker direct their Rage primarily toward violence. Their path is one of untrammeled fury, and they thrill in the chaos of battle as they allow their Rage to seize and empower them."
      },
      {
        "name": "Mindless Rage",
        "level": 6,
        "description": "You have Immunity to the Charmed and Frightened conditions while your Rage is active. If you're Charmed or Frightened when you enter your Rage, the condition ends on you."
      },
      {
        "name": "Retaliation",
        "level": 10,
        "description": "When you take damage from a creature that is within 5 feet of you, you can take a Reaction to make one melee attack against that creature, using a weapon or an Unarmed Strike."
      },
      {
        "name": "Intimidating Presence",
        "level": 14,
        "description": "As a Bonus Action, you can strike terror into others with your menacing presence and primal power. When you do so, each creature of your choice in a 30-foot Emanation [Area of Effect] originating from you must make a Wisdom saving throw (8 plus your Strength modifier and Proficiency). On a failed save, a creature has the Frightened condition for 1 minute. At the end of each of the Frightened creature's turns, the creature repeats the save, ending the effect on itself on a success. Once you use this feature, you can't use it again until you finish a Long Rest unless you expend a use of your Rage (no action required) to restore your use of it."
      }
    ]
  },
  {
    "name": "Path of the Wild Heart",
    "shortName": "Wild Heart",
    "features": [
      {
        "name": "Path of the Wild Heart",
        "level": 3,
        "description": "Walk in Community with the Animal World Barbarians who follow the Path of the Wild Heart view themselves as kin to animals. These Barbarians learn magical means to communicate with animals, and their Rage heightens their connection to animals as it fills them with supernatural might."
      },
      {
        "name": "Aspect of the Wilds",
        "level": 6,
        "description": "You gain one of the following options of your choice. Whenever you finish a Long Rest, you can change your choice. **Owl:** You have Darkvision with a range of 60 feet. If you already have Darkvision, its range increases by 60 feet. **Panther:** You have a Climb Speed equal to your Speed. **Salmon:** You have a Swim Speed equal to your Speed."
      },
      {
        "name": "Nature Speaker",
        "level": 10,
        "description": "You can cast the Commune with Nature spell but only as a Ritual. Wisdom is your spellcasting ability for it."
      },
      {
        "name": "Power of the Wilds",
        "level": 14,
        "description": "Whenever you activate your Rage, you gain one of the following options of your choice. **Falcon:** While your Rage is active, you have a Fly Speed equal to your Speed if you aren't wearing any armor. **Lion:** While your Rage is active, any of your enemies within 5 feet of you have Disadvantage on attack rolls against targets other than you or another Barbarian who has this option active. **Ram:** While your Rage is active, you can cause a Large or smaller creature to have the Prone condition when you hit it with a melee attack."
      }
    ]
  },
  {
    "name": "Path of the World Tree",
    "shortName": "World Tree",
    "features": [
      {
        "name": "Path of the World Tree",
        "level": 3,
        "description": "Trace the Roots and Branches of the Multiverse Barbarians who follow the Path of the World Tree connect with the cosmic tree Yggdrasil through their Rage. This tree grows among the Outer Planes, connecting them to each other and the Material Plane. These Barbarians draw on the tree's magic for vitality and as a means of dimensional travel."
      },
      {
        "name": "Branches of the Tree",
        "level": 6,
        "description": "Whenever a creature you can see starts its turn within 30 feet of you while your Rage is active, you can take a Reaction to summon spectral branches of the World Tree around it. The target must succeed on a Strength saving throw (8 plus your Strength modifier and Proficiency) or be teleported to an unoccupied space you can see within 5 feet of yourself or in the nearest unoccupied space you can see. After the target teleports, you can reduce its Speed to 0 until the end of the current turn."
      },
      {
        "name": "Battering Roots",
        "level": 10,
        "description": "During your turn, your reach is 10 feet greater with any Melee weapon that has the Heavy or Versatile property, as tendrils of the World Tree extend from you. When you hit with such a weapon on your turn, you can activate the Push or Topple mastery property in addition to a different mastery property you're using with that weapon."
      },
      {
        "name": "Travel Along the Tree",
        "level": 14,
        "description": "When you activate your Rage and as a Bonus Action while your Rage is active, you can teleport up to 60 feet to an unoccupied space you can see. In addition, once per Rage, you can increase the range of that teleport to 150 feet. When you do so, you can also bring up to six willing creatures who are within 10 feet of you. Each creature teleports to an unoccupied space of your choice within 10 feet of your destination space."
      }
    ]
  },
  {
    "name": "Path of the Zealot",
    "shortName": "Zealot",
    "features": [
      {
        "name": "Path of the Zealot",
        "level": 3,
        "description": "Rage in Ecstatic Union with a God Barbarians who walk the Path of the Zealot receive boons from a god or pantheon. These Barbarians experience their Rage as an ecstatic episode of divine union that infuses them with power. They are often allies to the priests and other followers of their god or pantheon."
      },
      {
        "name": "Fanatical Focus",
        "level": 6,
        "description": "Once per active Rage, if you fail a saving throw, you can reroll it with a bonus equal to your Rage Damage bonus, and you must use the new roll."
      },
      {
        "name": "Zealous Presence",
        "level": 10,
        "description": "As a Bonus Action, you unleash a battle cry infused with divine energy. Up to ten other creatures of your choice within 60 feet of you gain Advantage on attack rolls and saving throws until the start of your next turn. Once you use this feature, you can't use it again until you finish a Long Rest unless you expend a use of your Rage (no action required) to restore your use of it."
      },
      {
        "name": "Rage of the Gods",
        "level": 14,
        "description": "When you activate your Rage, you can assume the form of a divine warrior. This form lasts for 1 minute or until you drop to 0 Hit Points. Once you use this feature, you can't do so again until you finish a Long Rest. While in this form, you gain the benefits below. **Flight:** You have a Fly Speed equal to your Speed and can hover. **Resistance:** You have Resistance to Necrotic, Psychic, and Radiant damage. **Revivification:** When a creature within 30 feet of you would drop to 0 Hit Points, you can take a Reaction to expend a use of your Rage to instead change the target's Hit Points to a number equal to your Barbarian level."
      }
    ]
  }
];
