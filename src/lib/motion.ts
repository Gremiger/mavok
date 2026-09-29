// Pure helpers behind the "Animaciones" setting: which flashy effects exist,
// how long each runs, and the bookkeeping for tab transitions.

export type MotionStyle = "normal" | "flashy";

export type EffectName =
  | "rage-ignite"
  | "rage-end"
  | "crit"
  | "level-up"
  | "long-rest"
  | "short-rest"
  | "inspiration";

export const EFFECT_DURATIONS: Record<EffectName, number> = {
  "rage-ignite": 1300,
  "rage-end": 1500,
  crit: 1400,
  "level-up": 1800,
  "long-rest": 2700,
  "short-rest": 1700,
  inspiration: 800,
};

export const TAB_TRANSITION_MS = { normal: 300, flashy: 820 } as const;

export function shouldAnimate(style: MotionStyle, reducedMotion: boolean): boolean {
  return style === "flashy" && !reducedMotion;
}

export interface ActiveEffect {
  id: string;
  name: EffectName;
  startedAt: number;
  origin?: { x: number; y: number };
  data?: Record<string, string | number>;
}

export function addEffect(list: ActiveEffect[], fx: ActiveEffect): ActiveEffect[] {
  if (list.some((e) => e.id === fx.id)) return list;
  return [...list, fx];
}

export function pruneEffects(list: ActiveEffect[], now: number): ActiveEffect[] {
  return list.filter((e) => e.startedAt + EFFECT_DURATIONS[e.name] > now);
}

export function tabDirection<T>(order: readonly T[], from: T, to: T): 1 | -1 {
  return order.indexOf(to) < order.indexOf(from) ? -1 : 1;
}

// Deterministic per-effect randomness for particle positions, so render stays
// pure (no Math.random) and a re-render never reshuffles particles.
export function particleSpread(
  seed: string,
  n: number
): { a: number; b: number; c: number; d: number }[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const next = () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: n }, () => ({ a: next(), b: next(), c: next(), d: next() }));
}

// A swipe that moves forward in the tab order is a right-to-left drag, so the
// ink enters from the right edge (and vice versa), near the nav bar.
export function swipeOrigin(dir: 1 | -1, width: number, height: number): { x: number; y: number } {
  return { x: dir === 1 ? width : 0, y: height - 40 };
}
