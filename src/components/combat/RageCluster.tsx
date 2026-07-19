"use client";

import { useState } from "react";
import { shouldUseRageBadge } from "@/lib/rageDisplay";

export interface RageClusterProps {
  slots: boolean[];
  active: boolean;
  onToggleSlot: (index: number) => void;
  onToggleActive: () => void;
}

export function RageCluster({
  slots,
  active,
  onToggleSlot,
  onToggleActive,
}: RageClusterProps) {
  const [expanded, setExpanded] = useState(false);
  const total = slots.length;
  const remaining = slots.filter(Boolean).length;
  const useBadge = shouldUseRageBadge(total);
  const showPips = !useBadge || expanded;
  const canActivate = !active && remaining > 0;

  return (
    <div className="flex items-center gap-2">
      {showPips ? (
        <div className="flex gap-1">
          {slots.map((available, i) => (
            <button
              key={i}
              onClick={() => (useBadge ? setExpanded(false) : onToggleSlot(i))}
              onDoubleClick={() => useBadge && onToggleSlot(i)}
              className={`w-3.5 h-3.5 rounded-full border transition-colors ${
                available
                  ? "bg-cord border-cord"
                  : "bg-transparent border-cord/50"
              }`}
              aria-label={`Rage slot ${i + 1}: ${available ? "disponible" : "usado"}`}
            />
          ))}
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="bg-card border border-cord text-foreground text-xs font-bold px-2 py-0.5 rounded-full"
        >
          {remaining}/{total}
        </button>
      )}
      <button
        onClick={onToggleActive}
        disabled={!active && !canActivate}
        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm border transition-shadow ${
          active
            ? "border-cord bg-cord shadow-[0_0_8px_rgba(166,61,47,0.6)]"
            : canActivate
              ? "border-cord/50"
              : "border-border/40 opacity-40 cursor-not-allowed"
        }`}
        aria-label={active ? "Desactivar Rage" : "Activar Rage"}
      >
        🔥
      </button>
    </div>
  );
}
