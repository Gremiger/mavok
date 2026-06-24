"use client";

import { useState } from "react";
import { rollDice, type DiceRoll } from "@/lib/dice";

const QUICK_DICE = ["1d4", "1d6", "1d8", "1d10", "1d12", "1d20"];

export function DiceRoller() {
  const [history, setHistory] = useState<DiceRoll[]>([]);
  const [custom, setCustom] = useState("");

  function roll(expression: string) {
    try {
      const result = rollDice(expression);
      setHistory((prev) => [result, ...prev].slice(0, 5));
    } catch {
      // invalid expression, ignore
    }
  }

  function handleCustomRoll() {
    if (custom.trim()) {
      roll(custom.trim());
      setCustom("");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {QUICK_DICE.map((d) => (
          <button
            key={d}
            onClick={() => roll(d)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm font-heading text-accent active:scale-95 transition-transform"
          >
            {d}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCustomRoll()}
          placeholder="2d6+5"
          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
        />
        <button
          onClick={handleCustomRoll}
          className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-heading active:scale-95 transition-transform"
        >
          Tirar
        </button>
      </div>

      {history.length > 0 && (
        <div className="space-y-1">
          {history.map((r, i) => (
            <div
              key={r.timestamp}
              className={`flex items-center justify-between text-sm py-1 ${
                i === 0 ? "text-foreground" : "text-muted"
              }`}
            >
              <span>
                {r.expression}: [{r.rolls.join(", ")}]
                {r.modifier !== 0 &&
                  ` ${r.modifier >= 0 ? "+" : ""}${r.modifier}`}
              </span>
              <span className={`font-heading ${i === 0 ? "text-accent" : ""}`}>
                = {r.total}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
