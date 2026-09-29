"use client";

import type { CSSProperties } from "react";
import { particleSpread, type ActiveEffect } from "@/lib/motion";

// Full-screen "Llamativas" effects, one view per effect name. Markup and
// timings follow docs/superpowers/specs/assets/2026-09-29-flashy-effects-lab.html;
// the CSS lives in src/app/effects.css.

type Vars = CSSProperties & Record<`--${string}`, string | number>;

function origin(fx: ActiveEffect): { x: string; y: string } {
  return fx.origin
    ? { x: `${fx.origin.x}px`, y: `${fx.origin.y}px` }
    : { x: "50%", y: "40%" };
}

function Burst({
  seed,
  n,
  x,
  y,
  dist,
  color,
  size = 4,
  ms = 900,
}: {
  seed: string;
  n: number;
  x: string;
  y: string;
  dist: number;
  color: string;
  size?: number;
  ms?: number;
}) {
  return (
    <>
      {particleSpread(seed, n).map((p, i) => {
        const angle = p.a * Math.PI * 2;
        const r = dist * (0.5 + p.b * 0.7);
        const style: Vars = {
          left: x,
          top: y,
          width: size,
          height: size,
          background: color,
          boxShadow: `0 0 6px ${color}`,
          "--dx": `${Math.cos(angle) * r}px`,
          "--dy": `${Math.sin(angle) * r}px`,
          "--t": `${ms}ms`,
        };
        return <i key={i} className="fx-p" style={style} />;
      })}
    </>
  );
}

function RageIgnite({ fx }: { fx: ActiveEffect }) {
  const o = origin(fx);
  return (
    <div data-effect="rage-ignite" className="fx-root">
      <div className="fx-vignette fx-pulse" />
      <div className="fx-ring" style={{ left: o.x, top: o.y }} />
      <Burst seed={fx.id} n={22} x={o.x} y={o.y} dist={120} color="#ff8a5a" />
      <div className="fx-stamp fx-stamp-red">¡FURIA!</div>
    </div>
  );
}

function RageEnd({ fx }: { fx: ActiveEffect }) {
  const { x = 0, y = 0, w = 0, h = 0 } = (fx.data ?? {}) as Record<string, number>;
  return (
    <div data-effect="rage-end" className="fx-root">
      {particleSpread(fx.id, 18).map((p, i) => {
        const style: Vars = {
          left: x + p.a * w,
          top: y + p.b * h * 0.6,
          animationDelay: `${Math.round(p.c * 300)}ms`,
          "--dx": `${p.d * 40 - 20}px`,
        };
        return <i key={i} className="fx-ash" style={style} />;
      })}
    </div>
  );
}

function Crit({ fx }: { fx: ActiveEffect }) {
  const o = origin(fx);
  return (
    <div data-effect="crit" className="fx-root">
      <div className="fx-burst" style={{ left: o.x, top: o.y }} />
      <Burst seed={fx.id} n={26} x={o.x} y={o.y} dist={150} color="#ffd27a" ms={1000} />
      <div className="fx-stamp fx-stamp-gold">¡CRÍTICO!</div>
    </div>
  );
}

function LevelUp({ fx }: { fx: ActiveEffect }) {
  return (
    <div data-effect="level-up" className="fx-root">
      <div className="fx-dim" />
      <div className="fx-rays" />
      <Burst seed={fx.id} n={30} x="50%" y="40%" dist={180} color="#ffb070" ms={1200} />
      <div className="fx-stamp fx-stamp-seal">
        <span>
          Nivel
          <br />
          {fx.data?.level ?? ""}
        </span>
      </div>
    </div>
  );
}

function LongRest({ fx }: { fx: ActiveEffect }) {
  return (
    <div data-effect="long-rest" className="fx-root">
      <div className="fx-night" />
      <div className="fx-moon" />
      {particleSpread(fx.id, 18).map((p, i) => (
        <i
          key={i}
          className="fx-star"
          style={{ left: `${p.a * 100}%`, top: `${p.b * 55}%`, animationDelay: `${Math.round(p.c * 200)}ms` }}
        />
      ))}
      <div className="fx-dawn" />
    </div>
  );
}

function ShortRest({ fx }: { fx: ActiveEffect }) {
  return (
    <div data-effect="short-rest" className="fx-root">
      <div className="fx-fire" />
      {particleSpread(fx.id, 16).map((p, i) => {
        const style: Vars = {
          left: `${20 + p.a * 60}%`,
          bottom: 60,
          animationDelay: `${Math.round(p.b * 700)}ms`,
          "--dx": `${p.c * 50 - 25}px`,
        };
        return <i key={i} className="fx-spark" style={style} />;
      })}
    </div>
  );
}

function Inspiration({ fx }: { fx: ActiveEffect }) {
  const o = origin(fx);
  return (
    <div data-effect="inspiration" className="fx-root">
      <Burst seed={fx.id} n={16} x={o.x} y={o.y} dist={60} color="#ffe39a" size={3} ms={700} />
    </div>
  );
}

export function EffectView({ fx }: { fx: ActiveEffect }) {
  switch (fx.name) {
    case "rage-ignite":
      return <RageIgnite fx={fx} />;
    case "rage-end":
      return <RageEnd fx={fx} />;
    case "crit":
      return <Crit fx={fx} />;
    case "level-up":
      return <LevelUp fx={fx} />;
    case "long-rest":
      return <LongRest fx={fx} />;
    case "short-rest":
      return <ShortRest fx={fx} />;
    case "inspiration":
      return <Inspiration fx={fx} />;
  }
}

export function RageGlow() {
  return <div data-effect="rage-glow" className="fx-vignette fx-breath" />;
}
