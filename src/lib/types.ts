export type AbilityScore = "str" | "dex" | "con" | "int" | "wis" | "cha";

export const CURRENT_DATA_VERSION = 6;

export type PinnedAction =
  | { type: "rage" }
  | { type: "hitDice" }
  | { type: "hpAdjust" }
  | { type: "resource"; resource: "healerKit" | "stoneEndurance" }
  | { type: "attackRoll"; attackId: string }
  | { type: "attackDamage"; attackId: string }
  | { type: "attackDefinition"; attackId: string };

export interface Character {
  _version: number;
  id: string;
  meta: CharacterMeta;
  attributes: Record<AbilityScore, number>;
  combat: CombatState;
  resources: Resources;
  savingThrows: Record<AbilityScore, { proficient: boolean }>;
  skills: Record<string, { attribute: AbilityScore; proficient: boolean }>;
  proficiencies: Proficiencies;
  features: Feature[];
  attacks: Attack[];
  inventory: InventoryItem[];
  currency: Currency;
  notes: Notes;
  levelUpHistory: LevelUpHistoryEntry[];
  quickActions: PinnedAction[];
}

export interface LevelUpHistoryEntry {
  level: number;
  date: string;
  asiChoice?: string;
  featChosen?: string;
}

export interface CharacterMeta {
  name: string;
  level: number;
  class: string;
  subclass: string | null;
  species: string;
  giantAncestry: string;
  background: string;
  originFeat: string;
  origin: string;
  age: number;
  proficiencyBonus: number;
  inspiration: boolean;
  appearance: string;
  personalityTrait: string;
  ideal: string;
  bond: string;
  flaw: string;
  backstory: string;
  goals: string[];
  portraitDataUrl: string | null;
}

export interface CombatState {
  maxHp: number;
  currentHp: number;
  tempHp: number;
  armorClass: number;
  initiative: number;
  speed: number;
  passivePerception: number;
  hitDice: { total: number; remaining: number; die: string };
  deathSaves: { successes: number; failures: number };
  conditions: string[];
  recklessActive: boolean;
}

export interface Resources {
  rpiRages: { total: number; remaining: number; active: boolean; slots: boolean[] };
  healerKit: { total: number; remaining: number };
  stoneEndurance: { total: number; remaining: number };
}

export interface Proficiencies {
  armor: string[];
  weapons: string[];
  tools: string[];
  languages: string[];
}

export interface Feature {
  name: string;
  source: string;
  description: string;
  level: number;
}

export interface Attack {
  id: string;
  name: string;
  attackBonus: number;
  damage: string;
  damageType: string;
  range: string;
  properties: string[];
  mastery: string | null;
  masteryEffect: string | null;
  masterySaveDC: number | null;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  weight: number | null;
  value: number | null;
  category: "weapon" | "armor" | "gear" | "consumable" | "personal";
  equipped: boolean;
  description: string;
}

export interface Currency {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface Notes {
  world: NoteEntry[];
  npcs: NoteEntry[];
  quests: QuestEntry[];
  journal: JournalEntry[];
  quick: QuickNote[];
}

export interface NoteEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  fields?: Record<string, string>;
}

export interface QuestEntry extends NoteEntry {
  status: "active" | "completed" | "failed";
  givenBy: string;
}

export interface JournalEntry {
  id: string;
  session: number;
  date: string;
  title: string;
  content: string;
}

export interface QuickNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface AppSettings {
  theme: "piedra-viva" | "dark-fantasy" | "pergamino" | "furia-de-sangre";
  lastCharacterId: string;
  density: "compact" | "spacious";
  encyclopediaFavorites: string[];
  encyclopediaLanguage: "en" | "es";
}
