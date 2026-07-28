interface DiceBoxRollResult {
  sides: number;
  value: number;
  [key: string]: unknown;
}

interface DiceBoxInstance {
  init(): Promise<DiceBoxInstance>;
  roll(notation: string): Promise<DiceBoxRollResult[]>;
  show(): DiceBoxInstance;
  hide(): DiceBoxInstance;
}

let boxPromise: Promise<DiceBoxInstance> | null = null;

async function getDiceBox(): Promise<DiceBoxInstance> {
  if (!boxPromise) {
    boxPromise = (async () => {
      const { default: DiceBox } = await import("@3d-dice/dice-box");
      const box = new DiceBox("#dice-box-canvas", {
        assetPath: "/assets/",
        scale: 9,
      }) as DiceBoxInstance;
      await box.init();
      return box;
    })();
  }
  return boxPromise;
}

export async function roll3D(count: number, faces: number): Promise<number[]> {
  const box = await getDiceBox();
  box.show();
  const results = await box.roll(`${count}d${faces}`);
  return results.map((r) => r.value);
}

export async function hide3D(): Promise<void> {
  if (!boxPromise) return;
  const box = await boxPromise;
  box.hide();
}
