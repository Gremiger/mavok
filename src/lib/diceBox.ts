import { DICE_THEMES } from "@/data/dice-themes";
import { loadSettings } from "./storage";

interface DiceBoxRollResult {
  sides: number;
  value: number;
  [key: string]: unknown;
}

interface DiceBoxRollOptions {
  theme?: string;
  themeColor?: string;
}

interface DiceBoxInstance {
  init(): Promise<DiceBoxInstance>;
  loadTheme(systemName: string): Promise<unknown>;
  roll(
    notation: string,
    options?: DiceBoxRollOptions
  ): Promise<DiceBoxRollResult[]>;
  show(): DiceBoxInstance;
  hide(): DiceBoxInstance;
}

let boxPromise: Promise<DiceBoxInstance> | null = null;

async function getDiceBox(): Promise<DiceBoxInstance> {
  if (!boxPromise) {
    boxPromise = (async () => {
      const { default: DiceBox } = await import("@3d-dice/dice-box");
      const box = new DiceBox({
        container: "#dice-box-canvas",
        assetPath: "/assets/",
        scale: 7,
      }) as DiceBoxInstance;
      await box.init();
      return box;
    })();
  }
  return boxPromise;
}

export async function roll3D(count: number, faces: number): Promise<number[]> {
  const box = await getDiceBox();
  const { diceTheme } = loadSettings();
  const preset =
    DICE_THEMES.find((t) => t.systemName === diceTheme) ?? DICE_THEMES[0];
  // dice-box only auto-loads the theme passed to its constructor at init()
  // time (here, "default") — any other theme passed as a per-call `roll()`
  // override must be explicitly loaded first, or `roll()` throws
  // synchronously trying to read the not-yet-loaded theme's data.
  // `loadTheme` is memoized internally, so this is a no-op after the first
  // roll with a given theme.
  await box.loadTheme(preset.systemName);
  box.show();
  const results = await box.roll(`${count}d${faces}`, {
    theme: preset.systemName,
    themeColor: preset.themeColor,
  });
  return results.map((r) => r.value);
}

export async function hide3D(): Promise<void> {
  if (!boxPromise) return;
  const box = await boxPromise;
  box.hide();
}
