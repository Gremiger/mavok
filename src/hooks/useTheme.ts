"use client";

import { useState, useEffect, useCallback } from "react";
import { loadSettings, saveSettings } from "@/lib/storage";
import type { AppSettings } from "@/lib/types";

export const THEME_META: {
  id: AppSettings["theme"];
  label: string;
  swatch: string;
}[] = [
  { id: "piedra-viva", label: "Piedra Viva", swatch: "#b87333" },
  { id: "dark-fantasy", label: "Dark Fantasy", swatch: "#8b6d2d" },
  { id: "pergamino", label: "Pergamino", swatch: "#9c2b2b" },
  { id: "furia-de-sangre", label: "Furia de Sangre", swatch: "#c23b2b" },
];

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

  useEffect(() => {
    const settings = loadSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: localStorage is unavailable during the static-export build's prerender pass, so this read must be deferred to after client mount.
    setThemeState(settings.theme);
    setDensity(settings.density);
    setEncyclopediaFavorites(settings.encyclopediaFavorites);
    setEncyclopediaLanguageState(settings.encyclopediaLanguage);
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, []);

  const setTheme = useCallback((next: AppSettings["theme"]) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
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

  return {
    theme,
    setTheme,
    density,
    toggleDensity,
    encyclopediaFavorites,
    toggleFavorite,
    encyclopediaLanguage,
    setEncyclopediaLanguage,
  };
}
