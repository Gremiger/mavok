import type { Character, AppSettings } from "./types";

const CHAR_PREFIX = "mavok_character_";
const SETTINGS_KEY = "mavok_settings";

export function loadCharacter(id: string): Character | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`${CHAR_PREFIX}${id}`);
  return raw ? JSON.parse(raw) : null;
}

export function saveCharacter(character: Character): void {
  localStorage.setItem(
    `${CHAR_PREFIX}${character.id}`,
    JSON.stringify(character)
  );
}

export function loadSettings(): AppSettings {
  if (typeof window === "undefined")
    return { theme: "dark-fantasy", lastCharacterId: "mavok-1" };
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw
    ? JSON.parse(raw)
    : { theme: "dark-fantasy", lastCharacterId: "mavok-1" };
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
