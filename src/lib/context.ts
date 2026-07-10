"use client";

import { createContext, useContext } from "react";
import type { useCharacter } from "@/hooks/useCharacter";
import type { useTheme } from "@/hooks/useTheme";
import type { useGoogleDriveAuth } from "@/hooks/useGoogleDriveAuth";

export type CharacterContextType = ReturnType<typeof useCharacter>;
export type ThemeContextType = ReturnType<typeof useTheme>;
export type GoogleDriveContextType = ReturnType<typeof useGoogleDriveAuth>;

export const CharacterContext = createContext<CharacterContextType | null>(null);
export const ThemeContext = createContext<ThemeContextType | null>(null);
export const GoogleDriveContext = createContext<GoogleDriveContextType | null>(
  null
);

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

export function useGoogleDriveContext() {
  const ctx = useContext(GoogleDriveContext);
  if (!ctx)
    throw new Error("useGoogleDriveContext must be inside GoogleDriveContext.Provider");
  return ctx;
}
