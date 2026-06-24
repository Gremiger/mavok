"use client";

import { useState, useEffect, useCallback } from "react";
import { loadSettings, saveSettings } from "@/lib/storage";
import type { AppSettings } from "@/lib/types";

export function useTheme() {
  const [theme, setTheme] = useState<AppSettings["theme"]>("dnd-classic");

  useEffect(() => {
    const settings = loadSettings();
    setTheme(settings.theme);
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next =
        prev === "dark-fantasy" ? "dnd-classic" : "dark-fantasy";
      document.documentElement.setAttribute("data-theme", next);
      const settings = loadSettings();
      saveSettings({ ...settings, theme: next });
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
