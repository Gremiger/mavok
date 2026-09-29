"use client";

import { useRef, useState } from "react";
import { Flame } from "lucide-react";
import { shouldUseRageBadge } from "@/lib/rageDisplay";
import { useEffects } from "@/components/effects/EffectsProvider";

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
  const [slashed, setSlashed] = useState<number | null>(null);
  const flameRef = useRef<HTMLButtonElement>(null);
  const { play, flashy } = useEffects();

  function toggleActive() {
    const flame = flameRef.current;
    const r = flame?.getBoundingClientRect();
    const card = flame?.closest("[data-vitals]")?.getBoundingClientRect();
    onToggleActive();
    play(active ? "rage-end" : "rage-ignite", {
      origin: r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined,
      data: card ? { x: card.left, y: card.top, w: card.width, h: card.height } : undefined,
    });
  }

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
    <div className="flex items-center gap-1">
      <span className="font-heading italic text-sm text-muted mr-1">Furias</span>
      {showPips ? (
        <div className="flex">
          {slots.map((available, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onToggleSlot(i);
                setSlashed(available ? i : null);
                if (useBadge) setExpanded(false);
              }}
              className="relative w-8 h-8 flex items-center justify-center"
              aria-label={`Rage slot ${i + 1}: ${available ? "disponible" : "usado"}`}
            >
              <span className={`tally-mark ${available ? "" : "is-used"}`} />
              {flashy && !available && slashed === i && (
                <svg className="tally-slash" viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M4 22 L28 10" />
                </svg>
              )}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="ink-stamp !not-italic !font-numeric !text-foreground !border-cord"
        >
          {remaining}/{total}
        </button>
      )}
      <button
        ref={flameRef}
        type="button"
        onClick={toggleActive}
        disabled={!active && !canActivate}
        className={`relative ml-auto w-9 h-9 rounded-full flex items-center justify-center border transition-shadow duration-200 ${
          active
            ? "border-cord bg-cord text-[#f7e6d8] shadow-[0_0_10px_color-mix(in_srgb,var(--cord)_60%,transparent)]"
            : canActivate
              ? "border-cord/60 text-cord"
              : "border-border/40 text-muted opacity-40 cursor-not-allowed"
        }`}
        aria-label={active ? "Desactivar Rage" : "Activar Rage"}
      >
        <span key={`flame-${igniteKey}`} className={igniteKey > 0 ? "ignite-flash" : undefined}>
          <Flame size={18} strokeWidth={1.5} />
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
