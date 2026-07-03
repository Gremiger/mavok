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
      };
    });

  const ts = `export interface ArmorData {
  name: string;
  type: "light" | "medium" | "heavy" | "shield";
  ac: number;
  weight: number;
  stealthDisadvantage: boolean;
  strengthRequirement: number | null;
}

export const ARMOR: ArmorData[] = ${JSON.stringify(armor, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, "armor.ts"), ts);
  console.log(`Armor: ${armor.length}`);
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
extractMastery();
extractFeats();
extractBarbarianProgression();
extractSubclasses();
console.log("\nDone!");
