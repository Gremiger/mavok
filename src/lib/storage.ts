import type { Character, AppSettings } from "./types";
import { CURRENT_DATA_VERSION } from "./types";
import { migrateCharacterData } from "./migrations";

const CHAR_PREFIX = "mavok_character_";
const SETTINGS_KEY = "mavok_settings";

export function loadCharacter(id: string): Character | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${CHAR_PREFIX}${id}`);
    if (!raw) return null;

    const { data, migrated } = migrateCharacterData(raw);
    const character = JSON.parse(data) as Character;

    if (migrated) {
      localStorage.setItem(`${CHAR_PREFIX}${id}`, data);
    }

    return character;
  } catch {
    return null;
  }
}

export function saveCharacter(character: Character): void {
  try {
    const toSave = { ...character, _version: CURRENT_DATA_VERSION };
    localStorage.setItem(
      `${CHAR_PREFIX}${character.id}`,
      JSON.stringify(toSave)
    );
  } catch {
    // Storage full or unavailable
  }
}

export function getCharacterStorageKey(id: string): string {
  return `${CHAR_PREFIX}${id}`;
}

export function loadSettings(): AppSettings {
  const defaults: AppSettings = {
    theme: "piedra-viva",
    lastCharacterId: "mavok-1",
    density: "spacious",
    encyclopediaFavorites: [],
    encyclopediaLanguage: "en",
    magicItemIndicator: "number-only",
  };
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const settings = raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
    if ((settings.theme as string) === "dark-fantasy") {
      settings.theme = "cumbre-helada";
    }
    return settings;
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage full or unavailable
  }
}
