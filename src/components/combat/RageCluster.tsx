"use client";

import { useState } from "react";
import { shouldUseRageBadge } from "@/lib/rageDisplay";

const EMBER_WISP_OFFSETS = [25, 55, 75];
const EMBER_WISP_DELAYS = [0.2, 0.9, 1.6];
const EMBER_BURST_OFFSETS = [15, 30, 45, 60, 75, 90];
const EMBER_BURST_DELAYS = [0, 0.05, 0.1, 0.15, 0.2, 0.25];

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
  const [prevActive, setPrevActive] = useState(active);
  const [igniteKey, setIgniteKey] = useState(0);

  if (active !== prevActive) {
    setPrevActive(active);
    if (active) setIgniteKey((k) => k + 1);
  }
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
              onClick={() => {
                onToggleSlot(i);
                if (useBadge) setExpanded(false);
              }}
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
        className={`relative w-6 h-6 rounded-full flex items-center justify-center text-sm border transition-shadow ${
          active
            ? "border-cord bg-cord shadow-[0_0_8px_rgba(166,61,47,0.6)]"
            : canActivate
              ? "border-cord/50"
              : "border-border/40 opacity-40 cursor-not-allowed"
        }`}
        aria-label={active ? "Desactivar Rage" : "Activar Rage"}
      >
        <span key={`flame-${igniteKey}`} className={igniteKey > 0 ? "ignite-flash" : undefined}>
          🔥
        </span>
        {active &&
          EMBER_WISP_OFFSETS.map((left, i) => (
            <span
              key={`wisp-${i}`}
              className="ember-wisp"
              style={{ left: `${left}%`, animationDelay: `${EMBER_WISP_DELAYS[i]}s` }}
            />
          ))}
        {igniteKey > 0 &&
          EMBER_BURST_OFFSETS.map((left, i) => (
            <span
              key={`burst-${igniteKey}-${i}`}
              className="ember-burst"
              style={{ left: `${left}%`, animationDelay: `${EMBER_BURST_DELAYS[i]}s` }}
            />
          ))}
      </button>
    </div>
  );
}
