// Poses for the journal's "time machine" stack. The perspective stack and
// scrubber come from Amicro's CardTimeMachine
// (github.com/Subhan-code/Amicro--Micro-transitions-), adapted for touch.

export interface StackPose {
  y: number;
  z: number;
  rotateX: number;
  opacity: number;
  scale: number;
  hidden: boolean;
}

/** Cards drawn behind the front one; the rest of the stack isn't rendered. */
export const VISIBLE_BEHIND = 3;

export function stackPose(index: number, active: number): StackPose {
  const offset = index - active;
  if (offset < 0) {
    // Already passed: flies toward the viewer and fades out. Only the one
    // just passed stays mounted so it can animate away.
    return { y: 260, z: 200, rotateX: -20, opacity: 0, scale: 1.3, hidden: offset < -1 };
  }
  return {
    y: offset === 0 ? 0 : -offset * 20,
    z: offset === 0 ? 0 : -offset * 60,
    rotateX: offset * 2,
    opacity: Math.max(0, 1 - offset * 0.15),
    scale: 1,
    hidden: offset > VISIBLE_BEHIND,
  };
}

/** Which of `count` entries a pointer at `clientY` points to on a scrubber. */
export function indexFromPointer(clientY: number, top: number, height: number, count: number): number {
  const ratio = (clientY - top) / height;
  return Math.min(count - 1, Math.max(0, Math.floor(ratio * count)));
}
