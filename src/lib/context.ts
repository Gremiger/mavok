"use client";

import { createContext, useContext } from "react";
import type { useCharacter } from "@/hooks/useCharacter";
import type { useTheme } from "@/hooks/useTheme";

export type CharacterContextType = ReturnType<typeof useCharacter>;
export type ThemeContextType = ReturnType<typeof useTheme>;

export const CharacterContext = createContext<CharacterContextType | null>(null);
export const ThemeContext = createContext<ThemeContextType | null>(null);

export function useCharacterContext() {
  const ctx = useContext(CharacterContext);
  if (!ctx)
    throw new Error("useCharacterContext must be inside CharacterProvider");
  return ctx;
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be inside ThemeProvider");
  return ctx;
}
