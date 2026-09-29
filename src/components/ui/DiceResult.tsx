"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { isD20Crit, isD20Fumble, type DiceRoll } from "@/lib/dice";
import { useEffects } from "@/components/effects/EffectsProvider";

export function DiceResult({
  roll,
  label,
  onClear,
  autoCloseMs = 4000,
}: {
  roll: DiceRoll;
  label?: string;
  onClear: () => void;
  autoCloseMs?: number;
}) {
  useEffect(() => {
    const timer = setTimeout(onClear, autoCloseMs);
    return () => clearTimeout(timer);
  }, [roll.timestamp, onClear, autoCloseMs]);

  const { play, flashy } = useEffects();
  const rootRef = useRef<HTMLDivElement>(null);

  // Crits get the full-screen flashy burst; the id keeps one roll from
  // ever playing it twice.
  useEffect(() => {
    if (!isD20Crit(roll)) return;
    const r = rootRef.current?.getBoundingClientRect();
    play("crit", {
      id: `crit-${roll.timestamp}`,
      origin: r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined,
    });
  }, [roll, play]);

  const isCrit = isD20Crit(roll);
  const isFumble = isD20Fumble(roll);
  const flashyFumble = flashy && isFumble;

  return (
    <motion.div
      ref={rootRef}
      key={roll.timestamp}
      initial={
        isCrit
          ? { scale: 1.15, boxShadow: "0 0 0 4px rgba(234,179,8,0.5)" }
          : isFumble
            ? { scale: 1.15, boxShadow: "0 0 0 4px rgba(220,38,38,0.5)" }
            : { scale: 1, boxShadow: "0 0 0 0 rgba(0,0,0,0)" }
      }
      animate={{ scale: 1, boxShadow: "0 0 0 0 rgba(0,0,0,0)" }}
      transition={{ duration: 0.4 }}
      className={`relative flex items-center gap-2 px-2 py-1 bg-accent/10 rounded text-sm animate-in fade-in${
        flashyFumble ? " roll-fumble" : ""
      }`}
    >
      {flashyFumble && (
        <>
          <svg className="roll-crack" viewBox="0 0 272 32" preserveAspectRatio="none" aria-hidden="true">
            <path d="M40 0 L52 12 L46 17 L64 32 M52 12 L70 8" />
          </svg>
          <i className="roll-drip" aria-hidden="true" />
        </>
      )}
      {label && <span className="text-muted text-xs">{label}:</span>}
      <span className="text-foreground">
        [{roll.rolls.join(", ")}]
        {roll.modifier !== 0 &&
          ` ${roll.modifier >= 0 ? "+" : ""}${roll.modifier}`}
      </span>
      <span className="font-numeric font-semibold text-accent">= {roll.total}</span>
      {isCrit && (
        <span className="text-success font-heading text-xs">¡CRIT!</span>
      )}
      {isFumble && (
        <span className="text-danger font-heading text-xs">Pifia</span>
      )}
      <button
        onClick={onClear}
        className="ml-auto text-muted hover:text-foreground text-xs leading-none"
      >
        ✕
      </button>
    </motion.div>
  );
}
