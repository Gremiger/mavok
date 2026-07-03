"use client";

import { useState, useEffect, useCallback } from "react";
import { loadSettings, saveSettings } from "@/lib/storage";
import type { AppSettings } from "@/lib/types";

export function useTheme() {
  const [theme, setTheme] = useState<AppSettings["theme"]>("piedra-viva");

  useEffect(() => {
    const settings = loadSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: localStorage is unavailable during the static-export build's prerender pass, so this read must be deferred to after client mount.
    setTheme(settings.theme);
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

  return { theme, toggleTheme };
}
