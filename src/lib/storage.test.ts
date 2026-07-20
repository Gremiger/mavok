import { describe, it, expect, beforeEach } from "vitest";
import { loadSettings, saveSettings } from "./storage";

describe("loadSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns piedra-viva theme by default when no settings are stored", () => {
    const settings = loadSettings();
    expect(settings.theme).toBe("piedra-viva");
  });

  it("normalizes a stored dark-fantasy theme to cumbre-helada", () => {
    localStorage.setItem(
      "mavok_settings",
      JSON.stringify({ theme: "dark-fantasy", lastCharacterId: "mavok-1" })
    );

    const settings = loadSettings();
    expect(settings.theme).toBe("cumbre-helada");
  });

  it("preserves a stored cumbre-helada theme as-is", () => {
    saveSettings({
      theme: "cumbre-helada",
      lastCharacterId: "mavok-1",
      density: "spacious",
      encyclopediaFavorites: [],
      encyclopediaLanguage: "en",
      magicItemIndicator: "number-only",
    });

    const settings = loadSettings();
    expect(settings.theme).toBe("cumbre-helada");
  });
});
