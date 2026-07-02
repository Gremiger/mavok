"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import type { DiceRoll } from "@/lib/dice";

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

  const isD20 = roll.expression.startsWith("1d20");
  const isCrit = isD20 && roll.rolls.some((r) => r === 20);
  const isFumble =
    isD20 && roll.rolls.length > 0 && roll.rolls.every((r) => r === 1);

  return (
    <motion.div
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
      className="flex items-center gap-2 px-2 py-1 bg-accent/10 rounded text-sm animate-in fade-in"
    >
      {label && <span className="text-muted text-xs">{label}:</span>}
      <span className="text-foreground">
        [{roll.rolls.join(", ")}]
        {roll.modifier !== 0 &&
          ` ${roll.modifier >= 0 ? "+" : ""}${roll.modifier}`}
      </span>
      <span className="font-heading text-accent">= {roll.total}</span>
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
