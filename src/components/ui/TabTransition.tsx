"use client";

import { createContext, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { TAB_TRANSITION_MS, particleSpread, tabDirection } from "@/lib/motion";

export type TransitionMode = "normal" | "flashy" | "instant";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

// True inside the tab that is animating out (see TabFab).
export const TabLeavingContext = createContext(false);

interface Leaving {
  key: string;
  node: ReactNode;
  id: number;
  dir: 1 | -1;
  mode: "normal" | "flashy";
  origin: { x: number; y: number } | null;
  scrollOffset: number;
}

// Animates between tabs. The leaving tab stays mounted (same key, so its
// component state is kept) as an absolutely positioned overlay, frozen at
// the scroll offset it had, until its exit animation ends. A new change
// mid-transition drops the old overlay, so at most two tabs are ever shown.
export function TabTransition({
  tabKey,
  order,
  origin,
  mode,
  scrollOffset,
  children,
}: {
  tabKey: string;
  order: readonly string[];
  origin: { x: number; y: number } | null;
  mode: TransitionMode;
  scrollOffset: number;
  children: ReactNode;
}) {
  const [shown, setShown] = useState({ key: tabKey, node: children });
  const [leaving, setLeaving] = useState<Leaving | null>(null);

  if (tabKey !== shown.key) {
    setShown({ key: tabKey, node: children });
    setLeaving(
      mode === "instant"
        ? null
        : {
            key: shown.key,
            node: shown.node,
            id: (leaving?.id ?? 0) + 1,
            dir: tabDirection(order, shown.key, tabKey),
            mode,
            origin,
            scrollOffset,
          }
    );
  }

  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => setLeaving(null), TAB_TRANSITION_MS[leaving.mode]);
    return () => clearTimeout(timer);
  }, [leaving]);

  const stageStyle: Vars | undefined = leaving
    ? {
        "--dir": leaving.dir,
        "--ox": leaving.origin ? `${leaving.origin.x}px` : "50%",
        "--oy": leaving.origin ? `${leaving.origin.y}px` : "85%",
        "--scroll": `${leaving.scrollOffset}px`,
      }
    : undefined;

  const fx = leaving ? (leaving.mode === "flashy" ? "combo" : "normal") : null;

  return (
    <div className={`tab-stage${leaving ? " is-transitioning" : ""}`} style={stageStyle}>
      {leaving && (
        <div key={leaving.key} className={`tab-panel chapters tab-leaving fx-${fx}-out`} aria-hidden="true" inert>
          <TabLeavingContext.Provider value={true}>{leaving.node}</TabLeavingContext.Provider>
        </div>
      )}
      <div key={tabKey} className={`tab-panel chapters${fx ? ` fx-${fx}-in` : ""}`}>
        {/* Same wrapper shape as the leaving panel, so a tab keeps its state
            when it moves from current to leaving. */}
        <TabLeavingContext.Provider value={false}>{children}</TabLeavingContext.Provider>
      </div>
      {leaving?.mode === "flashy" && <InkSplash seed={`tab-${leaving.id}`} key={leaving.id} />}
    </div>
  );
}

function InkSplash({ seed }: { seed: string }) {
  return (
    <div className="tab-fx" aria-hidden="true">
      <svg className="tab-splat" viewBox="0 0 100 100">
        <path d="M52 8c7 10 2 18 12 20 11 2 14-9 22-3 8 7-4 14 1 22s16 6 14 16-15 5-18 13 8 15 0 20-13-6-21-2-6 17-17 16-6-13-15-16-16 6-20-3 10-12 6-20-15-9-11-18 14-2 19-9-3-18 5-22 11 7 18 1 0-18 5-15z" />
      </svg>
      {particleSpread(seed, 12).map((p, i) => {
        if (i < 7) {
          const angle = Math.PI * (1 + i / 6);
          const r = 60 + p.a * 80;
          const style: Vars = { "--dx": `${Math.cos(angle) * r}px`, "--dy": `${Math.sin(angle) * r}px` };
          return <i key={i} className="tab-drop" style={style} />;
        }
        const style: Vars = {
          left: `${10 + p.b * 80}%`,
          "--dx": `${p.c * 60 - 30}px`,
          animationDelay: `${Math.round(p.d * 300)}ms`,
        };
        return <i key={i} className="tab-ember" style={style} />;
      })}
    </div>
  );
}
