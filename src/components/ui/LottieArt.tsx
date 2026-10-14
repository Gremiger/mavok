"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// The illustrations (LottieFiles, free under the Lottie Simple License).
// Each is its own chunk, as is the player: none of it loads until an
// illustration is actually on screen, and the service worker keeps the
// chunks for offline use like any other /_next/static file.
// `box` sizes each one so the drawing itself comes out about the same size:
// the quill sits small in the middle of a wide canvas, so its box is bigger
// and pulls in the empty margin around it.
const ART = {
  quill: { load: () => import("@/lottie/quill.json"), box: "w-56 h-40 -my-8" },
  chest: { load: () => import("@/lottie/chest.json"), box: "w-28 h-28" },
  book: { load: () => import("@/lottie/book.json"), box: "w-32 h-24" },
};

export type LottieArtName = keyof typeof ART;

// A small decorative animation. `loop` keeps it going; otherwise it plays
// once and rests on its last frame. With reduced motion it shows that last
// frame straight away. Pure black in the artwork is drawn in the theme's
// text colour (.lottie-art in globals.css) so outlines survive dark mode.
export function LottieArt({
  name,
  loop = false,
}: {
  name: LottieArtName;
  loop?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    let cancelled = false;
    let destroy = () => {};
    Promise.all([import("lottie-web/build/player/lottie_light"), ART[name].load()])
      .then(([{ default: lottie }, { default: data }]) => {
        if (cancelled || !ref.current) return;
        const anim = lottie.loadAnimation({
          container: ref.current,
          renderer: "svg",
          loop: loop && !reducedMotion,
          autoplay: !reducedMotion,
          // The player mutates the data it is given; hand it a copy.
          animationData: structuredClone(data),
          rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
        });
        if (reducedMotion) anim.addEventListener("DOMLoaded", () => anim.goToAndStop(anim.totalFrames - 1, true));
        destroy = () => anim.destroy();
      })
      .catch(() => {
        // A missing chunk offline just leaves the empty space.
      });
    return () => {
      cancelled = true;
      destroy();
    };
  }, [name, loop, reducedMotion]);

  return <div ref={ref} aria-hidden="true" data-lottie={name} className={`lottie-art ${ART[name].box}`} />;
}
