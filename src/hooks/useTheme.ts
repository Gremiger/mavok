"use client";

import { useState, useEffect, useCallback } from "react";
import { loadSettings, saveSettings } from "@/lib/storage";
import type { AppSettings } from "@/lib/types";

export function useTheme() {
  const [theme, setTheme] = useState<AppSettings["theme"]>("piedra-viva");
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
    setTheme(settings.theme);
    setDensity(settings.density);
    setEncyclopediaFavorites(settings.encyclopediaFavorites);
    setEncyclopediaLanguageState(settings.encyclopediaLanguage);
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next =
        prev === "piedra-viva" ? "dark-fantasy" : "piedra-viva";
      document.documentElement.setAttribute("data-theme", next);
      const settings = loadSettings();
      saveSettings({ ...settings, theme: next });
      return next;
    });
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
    toggleTheme,
    density,
    toggleDensity,
    encyclopediaFavorites,
    toggleFavorite,
    encyclopediaLanguage,
    setEncyclopediaLanguage,
  };
}
