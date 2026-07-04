"use client";

import { useCallback } from "react";
import { useMotionValue, useTransform, animate } from "framer-motion";

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 500;

export function useSwipeNavigation<T extends string>(
  items: readonly T[],
  active: T,
  onChange: (next: T) => void
) {
  const dragX = useMotionValue(0);
  const dragOpacity = useTransform(dragX, [-150, 0, 150], [0.5, 1, 0.5]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const idx = items.indexOf(active);
      const swipe =
        Math.abs(info.offset.x) > SWIPE_THRESHOLD ||
        Math.abs(info.velocity.x) > SWIPE_VELOCITY_THRESHOLD;

      if (swipe && info.offset.x < 0 && idx < items.length - 1) {
        onChange(items[idx + 1]);
      } else if (swipe && info.offset.x > 0 && idx > 0) {
        onChange(items[idx - 1]);
      }
      animate(dragX, 0, { type: "spring", stiffness: 300, damping: 30 });
    },
    [items, active, onChange, dragX]
  );

  return { dragX, dragOpacity, handleDragEnd };
}
