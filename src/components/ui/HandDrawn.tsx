"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { annotate } from "rough-notation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export type HandDrawnType = "strike-through" | "crossed-off" | "underline" | "circle";

// An ink mark drawn over text, as if by hand (rough-notation). The stroke
// is drawn in front of you only when `show` turns on while on screen; a mark
// that is already there on mount just appears, so opening a list of
// finished quests doesn't replay every stroke.
// `tone` colours the ink through CSS (see .hand-drawn in globals.css), so it
// follows theme changes without redrawing.
export function HandDrawn({
  show,
  type,
  tone = "muted",
  children,
}: {
  show: boolean;
  type: HandDrawnType;
  tone?: "muted" | "danger" | "accent";
  children: ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const mounted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    const firstRun = !mounted.current;
    mounted.current = true;
    if (!el || !show) return;
    const mark = annotate(el, {
      type,
      color: "currentColor",
      strokeWidth: type === "underline" ? 1.5 : 2,
      padding: type === "circle" ? 6 : 2,
      multiline: type !== "circle",
      animate: !firstRun && !reducedMotion,
      animationDuration: 600,
      iterations: 1,
    });
    mark.show();
    return () => mark.remove();
  }, [show, type, reducedMotion]);

  return (
    <span className="hand-drawn" data-tone={tone}>
      <span ref={ref}>{children}</span>
    </span>
  );
}
