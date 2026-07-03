import * as fs from "fs";
import * as path from "path";

const TOOLS_DIR = path.resolve(__dirname, "../../dnd/5etools-src/data");
const OUT_DIR = path.resolve(__dirname, "../src/data");

function stripMarkup(text: string): string {
  return text
    .replace(/\{@\w+\s+([^|}]+?)(?:\|[^}]*)?\}/g, "$1")
    .replace(/\{@dc\s+(\d+)\}/g, "DC $1");
}

function flattenEntries(entries: unknown[]): string {
  const parts: string[] = [];
  for (const e of entries) {
    if (typeof e === "string") {
      parts.push(stripMarkup(e));
    } else if (typeof e === "object" && e !== null) {
      const obj = e as Record<string, unknown>;
      if (obj.name) parts.push(`**${obj.name}:** `);
      if (Array.isArray(obj.entries)) {
        parts.push(flattenEntries(obj.entries));
      }
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

// --- Conditions ---
function extractConditions() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "conditionsdiseases.json"), "utf-8")
  );
  const conditions = raw.condition
    .filter((c: Record<string, unknown>) => c.source === "XPHB")
    .map((c: Record<string, unknown>) => ({
      name: c.name as string,
      description: flattenEntries(c.entries as unknown[]),
    }));

  const ts = `export interface Condition {
  name: string;
  description: string;
}

export const CONDITIONS: Condition[] = ${JSON.stringify(conditions, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "conditions.ts"), ts);
  console.log(`Conditions: ${conditions.length}`);
}

// --- Weapons ---
function extractWeapons() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "items-base.json"), "utf-8")
  );
  const typeMap: Record<string, string> = { M: "melee", R: "ranged" };
  const weapons = raw.baseitem
    .filter(
      (i: Record<string, unknown>) =>
        i.source === "XPHB" &&
        typeof i.type === "string" &&
        (i.type.startsWith("M|") || i.type.startsWith("R|"))
    )
    .map((i: Record<string, unknown>) => {
      const typeKey = (i.type as string).split("|")[0];
      const propAbbrevMap: Record<string, string> = {
        "2H": "Two-Handed", H: "Heavy", L: "Light", F: "Finesse",
        T: "Thrown", V: "Versatile", A: "Ammunition", R: "Reach",
        LD: "Loading",
      };
      const rawProps = (i.property as (string | { uid: string })[]) || [];
      const props = rawProps.map((p) => {
        const raw = typeof p === "string" ? p : p.uid;
        const abbr = raw.split("|")[0];
        return propAbbrevMap[abbr] || abbr;
      });
      const rawMasteries = (i.mastery as string[]) || [];
      const masteries = rawMasteries.map((m: string) =>
        typeof m === "string" ? m.split("|")[0] : String(m)
      );
      const range = i.range
        ? typeof i.range === "string"
          ? `${i.range} ft`
          : `${i.range} ft`
        : null;
      return {
        name: i.name as string,
        type: typeMap[typeKey] || typeKey,
        category: i.weaponCategory as string,
        damage: i.dmg1 as string,
        damageType: i.dmgType as string,
        weight: (i.weight as number) || 0,
        properties: props,
        mastery: masteries[0] || null,
        range,
        value: typeof i.value === "number" ? i.value / 100 : null,
      };
    });

  const ts = `export interface WeaponData {
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

export const WEAPONS: WeaponData[] = ${JSON.stringify(weapons, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "weapons.ts"), ts);
  console.log(`Weapons: ${weapons.length}`);
}

// --- Armor ---
function extractArmor() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "items-base.json"), "utf-8")
  );
  const typeMap: Record<string, string> = {
    LA: "light",
    MA: "medium",
    HA: "heavy",
    S: "shield",
  };
  const armor = raw.baseitem
    .filter(
      (i: Record<string, unknown>) =>
        i.source === "XPHB" &&
        typeof i.type === "string" &&
        Object.keys(typeMap).some((t) => (i.type as string).startsWith(t + "|"))
    )
    .map((i: Record<string, unknown>) => {
      const typeKey = (i.type as string).split("|")[0];
      return {
        name: i.name as string,
        type: typeMap[typeKey] || typeKey,
        ac: (i.ac as number) || 0,
        weight: (i.weight as number) || 0,
        stealthDisadvantage: !!(i.stealth as boolean),
        strengthRequirement: i.strength ? parseInt(String(i.strength)) : null,
        value: typeof i.value === "number" ? i.value / 100 : null,
      };
    });

  const ts = `export interface ArmorData {
  name: string;
  type: "light" | "medium" | "heavy" | "shield";
  ac: number;
  weight: number;
  stealthDisadvantage: boolean;
  strengthRequirement: number | null;
  value: number | null;
}

export const ARMOR: ArmorData[] = ${JSON.stringify(armor, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "armor.ts"), ts);
  console.log(`Armor: ${armor.length}`);
}

// --- General Adventuring Gear ---
function extractGear() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "items.json"), "utf-8")
  );
  const gear = raw.item
    .filter(
      (i: Record<string, unknown>) =>
        i.source === "XPHB" && i.type === "G|XPHB"
    )
    .map((i: Record<string, unknown>) => ({
      name: i.name as string,
      weight: typeof i.weight === "number" ? i.weight : null,
      value: typeof i.value === "number" ? i.value / 100 : null,
      description: flattenEntries((i.entries as unknown[]) || []),
    }));

  const ts = `export interface GearData {
  name: string;
  weight: number | null;
  value: number | null;
  description: string;
}

export const GEAR: GearData[] = ${JSON.stringify(gear, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "gear.ts"), ts);
  console.log(`Gear: ${gear.length}`);
}

// --- Actions ---
function extractActions() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "actions.json"), "utf-8")
  );
  const actions = raw.action
    .filter((a: Record<string, unknown>) => a.source === "XPHB")
    .map((a: Record<string, unknown>) => ({
      name: a.name as string,
      description: flattenEntries(a.entries as unknown[]),
    }));

  const ts = `export interface ActionData {
  name: string;
  description: string;
}

export const ACTIONS: ActionData[] = ${JSON.stringify(actions, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "actions.ts"), ts);
  console.log(`Actions: ${actions.length}`);
}

// --- Skills ---
function extractSkills() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "skills.json"), "utf-8")
  );
  const skills = raw.skill
    .filter((s: Record<string, unknown>) => s.source === "XPHB")
    .map((s: Record<string, unknown>) => ({
      name: s.name as string,
      ability: s.ability as string,
      description: flattenEntries(s.entries as unknown[]),
    }));

  const ts = `export interface SkillData {
  name: string;
  ability: string;
  description: string;
}

export const SKILLS_REFERENCE: SkillData[] = ${JSON.stringify(skills, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "skills-reference.ts"), ts);
  console.log(`Skills: ${skills.length}`);
}

// --- Spells ---
function extractSpells() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "spells/spells-xphb.json"), "utf-8")
  );
  const schoolMap: Record<string, string> = {
    A: "Abjuration", C: "Conjuration", D: "Divination", E: "Enchantment",
    V: "Evocation", I: "Illusion", N: "Necromancy", T: "Transmutation",
  };

  function formatCastingTime(time: Record<string, unknown>[]): string {
    const t = time[0] as { number: number; unit: string; condition?: string };
    const unitLabels: Record<string, string> = {
      action: "Action", bonus: "Bonus Action", reaction: "Reaction",
      minute: "Minute", hour: "Hour",
    };
    const label = unitLabels[t.unit] || t.unit;
    const plural =
      t.number > 1 && (t.unit === "minute" || t.unit === "hour") ? "s" : "";
    const base = `${t.number} ${label}${plural}`;
    return t.condition ? `${base}, ${t.condition}` : base;
  }

  function formatRange(range: Record<string, unknown>): string {
    const type = range.type as string;
    const distance = range.distance as
      | { type: string; amount?: number }
      | undefined;
    if (type === "point") {
      if (!distance) return "Self";
      switch (distance.type) {
        case "touch":
          return "Touch";
        case "self":
          return "Self";
        case "sight":
          return "Sight";
        case "unlimited":
          return "Unlimited";
        case "feet":
          return `${distance.amount} feet`;
        case "miles":
          return `${distance.amount} miles`;
        default:
          return distance.type;
      }
    }
    const shapeLabels: Record<string, string> = {
      cone: "Cone", sphere: "Sphere", cube: "Cube", line: "Line",
      emanation: "Emanation",
    };
    const unit = distance?.type === "miles" ? "mile" : "foot";
    return `Self (${distance?.amount}-${unit} ${shapeLabels[type] || type})`;
  }

  function formatDuration(duration: Record<string, unknown>[]): string {
    const d = duration[0] as {
      type: string;
      duration?: { amount: number; type: string };
    };
    if (d.type === "instant") return "Instantaneous";
    if (d.type === "permanent") return "Until dispelled";
    if (d.type === "special") return "Special";
    if (d.type === "timed" && d.duration) {
      const amt = d.duration.amount;
      const unit = d.duration.type;
      const plural = amt > 1 ? "s" : "";
      return `${amt} ${unit.charAt(0).toUpperCase()}${unit.slice(1)}${plural}`;
    }
    return d.type;
  }

  function formatComponents(components: Record<string, unknown>): string {
    const parts: string[] = [];
    if (components.v) parts.push("V");
    if (components.s) parts.push("S");
    if (components.m) {
      const m = components.m;
      const text = typeof m === "string" ? m : (m as { text?: string }).text;
      parts.push(text ? `M (${text})` : "M");
    }
    return parts.join(", ");
  }

  const spells = raw.spell
    .filter((s: Record<string, unknown>) => s.source === "XPHB")
    .map((s: Record<string, unknown>) => {
      const duration = s.duration as Record<string, unknown>[];
      const higherLevel = s.entriesHigherLevel
        ? flattenEntries(s.entriesHigherLevel as unknown[])
        : "";
      const baseDescription = flattenEntries(s.entries as unknown[]);
      return {
        name: s.name as string,
        level: s.level as number,
        school: schoolMap[s.school as string] || (s.school as string),
        castingTime: formatCastingTime(s.time as Record<string, unknown>[]),
        range: formatRange(s.range as Record<string, unknown>),
        components: formatComponents(s.components as Record<string, unknown>),
        duration: formatDuration(duration),
        concentration: !!(duration[0] as Record<string, unknown>)
          ?.concentration,
        ritual: !!(s.meta as Record<string, unknown> | undefined)?.ritual,
        description: higherLevel
          ? `${baseDescription} ${higherLevel}`
          : baseDescription,
      };
    });

  const ts = `export interface SpellData {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
}

export const SPELLS: SpellData[] = ${JSON.stringify(spells, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "spells.ts"), ts);
  console.log(`Spells: ${spells.length}`);
}

// --- Weapon Mastery Properties ---
function extractMastery() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "items-base.json"), "utf-8")
  );
  const masteries = (raw.itemMastery || [])
    .filter((m: Record<string, unknown>) => m.source === "XPHB")
    .map((m: Record<string, unknown>) => ({
      name: m.name as string,
      description: flattenEntries(m.entries as unknown[]),
    }));

  const ts = `export interface MasteryProperty {
  name: string;
  description: string;
}

export const MASTERY_PROPERTIES: MasteryProperty[] = ${JSON.stringify(masteries, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "mastery.ts"), ts);
  console.log(`Mastery properties: ${masteries.length}`);
}

// --- Feats ---
function extractFeats() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(TOOLS_DIR, "feats.json"), "utf-8")
  );
  const categoryMap: Record<string, string> = {
    O: "Origin",
    G: "General",
    FS: "Fighting Style",
    "FS:P": "Fighting Style",
    "FS:R": "Fighting Style",
    EB: "Epic Boon",
  };

  const feats = raw.feat
    .filter((f: Record<string, unknown>) => f.source === "XPHB")
    .map((f: Record<string, unknown>) => {
      const prereqs = (f.prerequisite as Record<string, unknown>[]) || [];
      const prereqLevel = prereqs[0]?.level as number | undefined;
      const prereqAbility = prereqs[0]?.ability as
        | Record<string, number>[]
        | undefined;
      const prereqSpellcasting = prereqs[0]?.spellcasting2020 as
        | boolean
        | undefined;

      const abilityBonus = (f.ability as Record<string, unknown>[]) || [];
      const bonuses: Record<string, number> = {};
      for (const ab of abilityBonus) {
        if (ab.hidden) continue;
        for (const [key, val] of Object.entries(ab)) {
          if (typeof val === "number") bonuses[key] = val;
        }
      }

      return {
        name: f.name as string,
        category: categoryMap[(f.category as string) || "G"] || "General",
        levelRequired: prereqLevel || null,
        abilityPrereqs: prereqAbility
          ? prereqAbility.map((a) => a as Record<string, number>)
          : null,
        requiresSpellcasting: !!prereqSpellcasting,
        abilityBonuses: Object.keys(bonuses).length > 0 ? bonuses : null,
        description: flattenEntries(f.entries as unknown[]),
        repeatable: !!(f.repeatable as boolean),
      };
    });

  const ts = `export interface FeatData {
  name: string;
  category: string;
  levelRequired: number | null;
  abilityPrereqs: Record<string, number>[] | null;
  requiresSpellcasting: boolean;
  abilityBonuses: Record<string, number> | null;
  description: string;
  repeatable: boolean;
}

export const FEATS: FeatData[] = ${JSON.stringify(feats, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "feats.ts"), ts);
  console.log(`Feats: ${feats.length}`);
}

// --- Barbarian Progression ---
function extractBarbarianProgression() {
  const raw = JSON.parse(
    fs.readFileSync(
      path.join(TOOLS_DIR, "class/class-barbarian.json"),
      "utf-8"
    )
  );
  const barb = raw.class.find(
    (c: Record<string, unknown>) => c.source === "XPHB"
  );

  const tableRows = barb.classTableGroups[0].rows;
  const profBonusByLevel = [
    2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6,
  ];

  const levels = tableRows.map(
    (row: unknown[], idx: number) => ({
      level: idx + 1,
      proficiencyBonus: profBonusByLevel[idx],
      rages: parseInt(row[0] as string),
      rageDamage:
        typeof row[1] === "object"
          ? (row[1] as Record<string, number>).value
          : parseInt(row[1] as string),
      weaponMasteries: parseInt(row[2] as string),
    })
  );

  // Extract feature names per level
  const featuresByLevel: Record<number, string[]> = {};
  for (const f of barb.classFeatures) {
    let featureStr: string;
    let isSubclass = false;
    if (typeof f === "string") {
      featureStr = f;
    } else {
      featureStr = f.classFeature;
      isSubclass = !!f.gainSubclassFeature;
    }
    const parts = featureStr.split("|");
    const name = parts[0];
    const level = parseInt(parts[parts.length - 1]);
    if (!featuresByLevel[level]) featuresByLevel[level] = [];
    featuresByLevel[level].push(isSubclass ? `[Subclass] ${name}` : name);
  }

  // Extract feature descriptions from classFeature array
  const featureDescriptions: Record<string, string> = {};
  if (raw.classFeature) {
    for (const cf of raw.classFeature) {
      if (cf.source === "XPHB" && cf.className === "Barbarian") {
        featureDescriptions[`${cf.name}|${cf.level}`] = flattenEntries(
          cf.entries || []
        );
      }
    }
  }

  const ts = `export interface BarbarianLevel {
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

export const BARBARIAN_LEVELS: BarbarianLevel[] = ${JSON.stringify(levels, null, 2)};

export const BARBARIAN_FEATURES: BarbarianFeature[] = ${JSON.stringify(
    Object.entries(featuresByLevel).flatMap(([lvl, names]) =>
      names.map((name) => {
        const isSubclass = name.startsWith("[Subclass] ");
        const cleanName = isSubclass ? name.replace("[Subclass] ", "") : name;
        return {
          name: cleanName,
          level: parseInt(lvl),
          description:
            featureDescriptions[`${cleanName}|${lvl}`] || "",
          isSubclassSlot: isSubclass,
        };
      })
    ),
    null,
    2
  )};
`;
  fs.writeFileSync(path.join(OUT_DIR, "barbarian-progression.ts"), ts);
  console.log(
    `Barbarian levels: ${levels.length}, features: ${Object.values(featuresByLevel).flat().length}`
  );
}

// --- Subclasses ---
function extractSubclasses() {
  const raw = JSON.parse(
    fs.readFileSync(
      path.join(TOOLS_DIR, "class/class-barbarian.json"),
      "utf-8"
    )
  );
  const subclasses = raw.subclass
    .filter((sc: Record<string, unknown>) => sc.source === "XPHB")
    .map((sc: Record<string, unknown>) => ({
      name: sc.name as string,
      shortName: (sc.shortName as string) || (sc.name as string),
      features: ((sc.subclassFeatures as string[]) || []).map((sf: string) => {
        const parts = sf.split("|");
        return {
          name: parts[0],
          level: parseInt(parts[parts.length - 1]),
        };
      }),
    }));

  // Extract subclass feature descriptions
  const featureDescriptions: Record<string, string> = {};
  if (raw.subclassFeature) {
    for (const sf of raw.subclassFeature) {
      if (sf.source === "XPHB") {
        featureDescriptions[`${sf.subclassShortName}|${sf.name}|${sf.level}`] =
          flattenEntries(sf.entries || []);
      }
    }
  }

  const enriched = subclasses.map(
    (sc: { name: string; shortName: string; features: { name: string; level: number }[] }) => ({
      ...sc,
      features: sc.features.map((f: { name: string; level: number }) => ({
        ...f,
        description:
          featureDescriptions[`${sc.shortName}|${f.name}|${f.level}`] || "",
      })),
    })
  );

  const ts = `export interface SubclassData {
  name: string;
  shortName: string;
  features: SubclassFeature[];
}

export interface SubclassFeature {
  name: string;
  level: number;
  description: string;
}

export const SUBCLASSES: SubclassData[] = ${JSON.stringify(enriched, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "subclasses.ts"), ts);
  console.log(
    `Subclasses: ${enriched.length}, total features: ${enriched.reduce((a: number, s: { features: unknown[] }) => a + s.features.length, 0)}`
  );
}

// --- Run all ---
console.log("Extracting 5etools data...\n");
extractConditions();
extractWeapons();
extractArmor();
extractGear();
extractActions();
extractSkills();
extractSpells();
extractMastery();
extractFeats();
extractBarbarianProgression();
extractSubclasses();
console.log("\nDone!");
