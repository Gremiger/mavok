export type DiceThemeId =
  | "default"
  | "wooden"
  | "blueGreenMetal"
  | "gemstoneMarble"
  | "rock"
  | "rust"
  | "steel"
  | "mist";

export interface DiceThemePreset {
  systemName: DiceThemeId;
  label: string;
  category: "normal" | "especial" | "mistborn";
  themeColor?: string;
  swatch: string;
}

export const DICE_THEMES: DiceThemePreset[] = [
  {
    systemName: "default",
    label: "Verde clásico",
    category: "normal",
    swatch: "#2f8f4e",
  },
  {
    systemName: "wooden",
    label: "Madera",
    category: "normal",
    swatch: "#8a5a35",
  },
  {
    systemName: "blueGreenMetal",
    label: "Metal verde-azulado",
    category: "normal",
    swatch: "#3a6b6b",
  },
  {
    systemName: "gemstoneMarble",
    label: "Mármol",
    category: "normal",
    swatch: "#4a5b7a",
  },
  {
    systemName: "rock",
    label: "Piedra (Goliath)",
    category: "especial",
    themeColor: "#8a8a8a",
    swatch: "#8a8a8a",
  },
  {
    systemName: "rust",
    label: "Sangre de Rage",
    category: "especial",
    themeColor: "#8b0000",
    swatch: "#8b0000",
  },
  {
    systemName: "steel",
    label: "Acero (Mistborn)",
    category: "mistborn",
    themeColor: "#8A99A6",
    swatch: "#8A99A6",
  },
  {
    systemName: "mist",
    label: "Bruma (Mistborn)",
    category: "mistborn",
    themeColor: "#C9C9C4",
    swatch: "#C9C9C4",
  },
];
