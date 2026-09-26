// Fill fraction for the Combate HP bar, safe for over-healed, negative or
// zero-max characters.
export function hpFraction(current: number, max: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(1, Math.max(0, current / max));
}
