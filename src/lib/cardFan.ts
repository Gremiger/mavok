// Poses for a hand of cards fanned out in an arc. The spring-arc idea comes
// from Amicro's CardArc5 (github.com/Subhan-code/Amicro--Micro-transitions-),
// generalised from a fixed five cards to any count and clamped to fit a phone.

export interface FanPose {
  rotate: number;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}

// Sized so a 7rem card fanned to the edge still fits a 390px-wide phone.
const MAX_STEP_DEG = 12;
const MAX_SPREAD_DEG = 40;
const MAX_STEP_PX = 48;
const MAX_SPREAD_PX = 130;
const CURVE_PX = 4; // how far the edges dip per step from the middle
const LIFT_PX = 30;

export function fanPoses(
  count: number,
  { open, selected }: { open: boolean; selected: number | null }
): FanPose[] {
  const center = (count - 1) / 2;
  const steps = Math.max(count - 1, 1);
  const degStep = Math.min(MAX_STEP_DEG, MAX_SPREAD_DEG / steps);
  const pxStep = Math.min(MAX_STEP_PX, MAX_SPREAD_PX / steps);

  return Array.from({ length: count }, (_, i) => {
    const dist = i - center;
    if (!open) {
      // A loose deck: a hair of rotation and offset so it reads as a pile.
      return { rotate: dist * 1.5, x: 0, y: -i * 1.5, scale: 1, zIndex: i };
    }
    const isSelected = selected === i;
    return {
      rotate: isSelected ? 0 : dist * degStep,
      x: dist * pxStep,
      y: dist * dist * CURVE_PX - (isSelected ? LIFT_PX : 0),
      scale: isSelected ? 1.08 : 1,
      zIndex: isSelected ? count + 1 : i,
    };
  });
}
