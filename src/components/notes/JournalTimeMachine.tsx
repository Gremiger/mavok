"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { motion } from "framer-motion";
import type { JournalEntry } from "@/lib/types";
import { Markdown } from "@/components/ui/Markdown";
import { indexFromPointer, stackPose } from "@/lib/journalStack";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const SPRING = { type: "spring", stiffness: 250, damping: 25, mass: 0.8 } as const;
const SWIPE_PX = 40;
const SCRUBBER_TRACK_PX = 220;

// The journal as a "time machine": sessions stacked in depth, newest in
// front, with a timeline on the side to travel between them. Touching the
// front card opens it. `entries` come newest first.
export function JournalTimeMachine({
  entries,
  onOpen,
}: {
  entries: JournalEntry[];
  onOpen: (id: string) => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const swipeStartY = useRef<number | null>(null);
  const swiped = useRef(false);
  const last = entries.length - 1;
  // An entry deleted from under us must not leave the stack pointing past the end.
  const current = Math.min(active, last);

  function go(index: number) {
    setActive(Math.min(last, Math.max(0, index)));
  }

  function handleSliderKey(e: KeyboardEvent) {
    const next: Record<string, number> = {
      ArrowDown: current + 1,
      ArrowRight: current + 1,
      ArrowUp: current - 1,
      ArrowLeft: current - 1,
      Home: 0,
      End: last,
    };
    if (e.key in next) {
      e.preventDefault();
      go(next[e.key]);
    }
  }

  function scrubTo(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    go(indexFromPointer(e.clientY, r.top, r.height, entries.length));
  }

  const transition = reducedMotion ? { duration: 0 } : SPRING;
  // Ticks 6px apart, squeezed when a long campaign wouldn't fit the track.
  const pitch = Math.min(6, SCRUBBER_TRACK_PX / entries.length);
  const tickTop = (i: number) => `calc(50% + ${(i - last / 2) * pitch}px)`;

  return (
    <div className="flex items-stretch gap-3">
      <div
        className="relative flex-1 h-60 overflow-hidden"
        style={{ perspective: "800px", touchAction: "none" }}
        onPointerDown={(e) => {
          swipeStartY.current = e.clientY;
          swiped.current = false;
        }}
        onPointerUp={(e) => {
          if (swipeStartY.current === null) return;
          const dy = e.clientY - swipeStartY.current;
          swipeStartY.current = null;
          if (Math.abs(dy) < SWIPE_PX) return;
          swiped.current = true;
          // Swiping up digs into the past; down comes back toward today.
          go(dy < 0 ? current + 1 : current - 1);
        }}
      >
        {entries.map((entry, i) => {
          const pose = stackPose(i, current);
          if (pose.hidden) return null;
          const isFront = i === current;
          const cardClass =
            "stone-card absolute inset-x-0 mx-auto top-16 w-full max-w-[17rem] h-[10.5rem] rounded-xl p-3 text-left flex flex-col";
          const body = (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded font-numeric">
                  S{entry.session}
                </span>
                <span className="text-xs text-muted ml-auto">{entry.date}</span>
              </div>
              <h4 className="font-heading text-accent text-base leading-tight mt-1.5 line-clamp-2">
                {entry.title}
              </h4>
              {entry.content && (
                <Markdown className="text-xs text-foreground/80 mt-1 line-clamp-3">{entry.content}</Markdown>
              )}
            </>
          );
          const motionProps = {
            initial: false,
            animate: {
              y: pose.y,
              z: pose.z,
              rotateX: pose.rotateX,
              opacity: pose.opacity,
              scale: pose.scale,
            },
            transition,
            style: { zIndex: entries.length - i },
          } as const;
          return isFront ? (
            <motion.button
              key={entry.id}
              type="button"
              data-front
              onClick={() => {
                if (swiped.current) return;
                onOpen(entry.id);
              }}
              className={cardClass}
              {...motionProps}
            >
              {body}
            </motion.button>
          ) : (
            <motion.div key={entry.id} aria-hidden="true" className={`${cardClass} pointer-events-none`} {...motionProps}>
              {body}
            </motion.div>
          );
        })}
      </div>

      <div
        role="slider"
        tabIndex={0}
        aria-label="Línea de tiempo del diario"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={last}
        aria-valuenow={current}
        aria-valuetext={`Sesión ${entries[current]?.session}`}
        onKeyDown={handleSliderKey}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setScrubbing(true);
          scrubTo(e);
        }}
        onPointerMove={(e) => {
          if (scrubbing) scrubTo(e);
        }}
        onPointerUp={() => setScrubbing(false)}
        onPointerCancel={() => setScrubbing(false)}
        className="relative w-12 h-60 cursor-pointer"
        style={{ touchAction: "none" }}
      >
        {entries.map((entry, i) => (
          <motion.span
            key={entry.id}
            aria-hidden="true"
            className={`absolute right-0 w-6 rounded-full origin-right ${
              i === current ? "bg-accent" : "bg-muted/40"
            }`}
            style={{ top: tickTop(i), height: Math.max(1, Math.min(3, pitch / 2)) }}
            initial={false}
            animate={{ scaleX: i === current ? 1.4 : 1 }}
            transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 25 }}
          />
        ))}
        <span
          aria-hidden="true"
          className={`absolute right-10 font-numeric text-xs text-accent whitespace-nowrap transition-opacity ${
            scrubbing ? "opacity-100" : "opacity-0"
          }`}
          style={{ top: tickTop(current), transform: "translateY(-50%)" }}
        >
          S{entries[current]?.session}
        </span>
      </div>
    </div>
  );
}
