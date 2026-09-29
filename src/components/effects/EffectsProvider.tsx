"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  EFFECT_DURATIONS,
  addEffect,
  shouldAnimate,
  type ActiveEffect,
  type EffectName,
  type MotionStyle,
} from "@/lib/motion";
import { EffectView, RageGlow } from "./effectViews";

export interface PlayOptions {
  id?: string;
  origin?: { x: number; y: number };
  data?: Record<string, string | number>;
}

interface EffectsApi {
  play: (name: EffectName, opts?: PlayOptions) => void;
  flashy: boolean;
  shake: () => void;
}

const EffectsContext = createContext<EffectsApi>({
  play: () => {},
  flashy: false,
  shake: () => {},
});

export function useEffects(): EffectsApi {
  return useContext(EffectsContext);
}

const SHAKING: EffectName[] = ["rage-ignite"];

export function EffectsProvider({
  motionStyle,
  reducedMotion,
  rageActive,
  shakeTarget,
  children,
}: {
  motionStyle: MotionStyle;
  reducedMotion: boolean;
  rageActive: boolean;
  shakeTarget?: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  const flashy = shouldAnimate(motionStyle, reducedMotion);
  const [effects, setEffects] = useState<ActiveEffect[]>([]);
  // Ids that have played, kept after the effect ends so a re-mounted source
  // (e.g. a roll result in a collapsed-and-reopened section) never replays.
  const playedIds = useRef(new Set<string>());
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const shake = useCallback(() => {
    if (!shakeTarget) return;
    const el = shakeTarget.current;
    if (!el) return;
    el.classList.remove("app-shake");
    void el.offsetWidth; // restart the animation
    el.classList.add("app-shake");
  }, [shakeTarget]);

  const play = useCallback(
    (name: EffectName, opts: PlayOptions = {}) => {
      if (!flashy) return;
      const id = opts.id ?? `${name}-${Date.now()}`;
      const played = playedIds.current;
      if (played.has(id)) return;
      played.add(id);
      if (played.size > 100) played.delete(played.values().next().value as string);
      const fx: ActiveEffect = { id, name, startedAt: Date.now(), origin: opts.origin, data: opts.data };
      setEffects((list) => addEffect(list, fx));
      if (SHAKING.includes(name)) shake();
      const timer = setTimeout(() => {
        timers.current.delete(timer);
        setEffects((list) => list.filter((e) => e.id !== id));
      }, EFFECT_DURATIONS[name]);
      timers.current.add(timer);
    },
    [flashy, shake]
  );

  const showGlow = flashy && rageActive;
  const latestId = effects.length ? effects[effects.length - 1].id : "";

  // Keep the layer in the browser's top layer (above open <dialog>s) while
  // anything is showing. Re-showing moves it above a dialog opened later.
  useEffect(() => {
    const el = layerRef.current;
    if (!el || typeof el.showPopover !== "function") return;
    try {
      if (el.matches(":popover-open")) el.hidePopover();
      if (latestId || showGlow) el.showPopover();
    } catch {
      // Popover not supported: the layer stays a fixed, high z-index overlay.
    }
  }, [latestId, showGlow]);

  const api = useMemo(() => ({ play, flashy, shake }), [play, flashy, shake]);

  return (
    <EffectsContext.Provider value={api}>
      {children}
      <div ref={layerRef} popover="manual" data-effects-layer className="effects-layer" aria-hidden="true">
        {showGlow && <RageGlow />}
        {effects.map((fx) => (
          <EffectView key={fx.id} fx={fx} />
        ))}
      </div>
    </EffectsContext.Provider>
  );
}
