"use client";

import { useEffect } from "react";
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

  const isCrit = roll.rolls.length === 1 && roll.rolls[0] === 20;
  const isFumble = roll.rolls.length === 1 && roll.rolls[0] === 1;

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-accent/10 rounded text-sm animate-in fade-in">
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
    </div>
  );
}
