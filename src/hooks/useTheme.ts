"use client";

import { useState, useEffect, useCallback } from "react";
import { loadSettings, saveSettings } from "@/lib/storage";
import { applyThemeColor } from "@/lib/themeColor";
import type { AppSettings } from "@/lib/types";

export const THEME_META: {
  id: AppSettings["theme"];
  label: string;
  swatch: string;
  bg: string;
}[] = [
  { id: "piedra-viva", label: "Piedra Viva", swatch: "#e9b877", bg: "#17130f" },
  { id: "cumbre-helada", label: "Cumbre Helada", swatch: "#2f5f86", bg: "#dfe7ec" },
  { id: "pergamino", label: "Pergamino", swatch: "#7a1f1f", bg: "#d9c9a3" },
  { id: "furia-de-sangre", label: "Furia de Sangre", swatch: "#d23a2c", bg: "#0f0e0e" },
];

function themeBg(id: AppSettings["theme"]): string | undefined {
  return THEME_META.find((t) => t.id === id)?.bg;
}

export function useTheme() {
  const [theme, setThemeState] = useState<AppSettings["theme"]>(
    "piedra-viva"
  );
  const [density, setDensity] = useState<AppSettings["density"]>("spacious");
  const [encyclopediaFavorites, setEncyclopediaFavorites] = useState<
    string[]
  >([]);
  const [encyclopediaLanguage, setEncyclopediaLanguageState] = useState<
    AppSettings["encyclopediaLanguage"]
  >("en");
  const [magicItemIndicator, setMagicItemIndicatorState] = useState<
    AppSettings["magicItemIndicator"]
  >("number-only");
  const [diceRollMode, setDiceRollModeState] = useState<
    AppSettings["diceRollMode"]
  >("text");
  const [diceTheme, setDiceThemeState] = useState<
    AppSettings["diceTheme"]
  >("default");
  const [motionStyle, setMotionStyleState] = useState<
    AppSettings["motionStyle"]
  >("normal");

  useEffect(() => {
    const settings = loadSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: localStorage is unavailable during the static-export build's prerender pass, so this read must be deferred to after client mount.
    setThemeState(settings.theme);
    setDensity(settings.density);
    setEncyclopediaFavorites(settings.encyclopediaFavorites);
    setEncyclopediaLanguageState(settings.encyclopediaLanguage);
    setMagicItemIndicatorState(settings.magicItemIndicator);
    setDiceRollModeState(settings.diceRollMode);
    setDiceThemeState(settings.diceTheme);
    setMotionStyleState(settings.motionStyle);
    document.documentElement.setAttribute("data-theme", settings.theme);
    applyThemeColor(document, themeBg(settings.theme));
  }, []);

  const setTheme = useCallback((next: AppSettings["theme"]) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    applyThemeColor(document, themeBg(next));
    const settings = loadSettings();
    saveSettings({ ...settings, theme: next });
  }, []);

  const toggleDensity = useCallback(() => {
    setDensity((prev) => {
      const next = prev === "spacious" ? "compact" : "spacious";
      const settings = loadSettings();
      saveSettings({ ...settings, density: next });
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setEncyclopediaFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      const settings = loadSettings();
      saveSettings({ ...settings, encyclopediaFavorites: next });
      return next;
    });
  }, []);

  const setEncyclopediaLanguage = useCallback(
    (lang: AppSettings["encyclopediaLanguage"]) => {
      setEncyclopediaLanguageState(lang);
      const settings = loadSettings();
      saveSettings({ ...settings, encyclopediaLanguage: lang });
    },
    []
  );

  const setMagicItemIndicator = useCallback(
    (mode: AppSettings["magicItemIndicator"]) => {
      setMagicItemIndicatorState(mode);
      const settings = loadSettings();
      saveSettings({ ...settings, magicItemIndicator: mode });
    },
    []
  );

  const setDiceRollMode = useCallback(
    (mode: AppSettings["diceRollMode"]) => {
      setDiceRollModeState(mode);
      const settings = loadSettings();
      saveSettings({ ...settings, diceRollMode: mode });
    },
    []
  );

  const setDiceTheme = useCallback(
    (theme: AppSettings["diceTheme"]) => {
      setDiceThemeState(theme);
      const settings = loadSettings();
      saveSettings({ ...settings, diceTheme: theme });
    },
    []
  );

  const setMotionStyle = useCallback(
    (style: AppSettings["motionStyle"]) => {
      setMotionStyleState(style);
      const settings = loadSettings();
      saveSettings({ ...settings, motionStyle: style });
    },
    []
  );

  return {
    theme,
    setTheme,
    density,
    toggleDensity,
    encyclopediaFavorites,
    toggleFavorite,
    encyclopediaLanguage,
    setEncyclopediaLanguage,
    magicItemIndicator,
    setMagicItemIndicator,
    diceRollMode,
    setDiceRollMode,
    diceTheme,
    setDiceTheme,
    motionStyle,
    setMotionStyle,
  };
}
