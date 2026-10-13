"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sword, Target, Hammer, Swords } from "lucide-react";
import type { Attack } from "@/lib/types";
import { fanPoses } from "@/lib/cardFan";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const DAMAGE_TYPE_ICONS: Record<string, typeof Sword> = {
  Slashing: Sword,
  Piercing: Target,
  Bludgeoning: Hammer,
};

const SPRING = { type: "spring", stiffness: 180, damping: 20, mass: 0.8 } as const;

// The weapons as a hand of cards: a closed deck that fans out on touch.
// Picking a card only chooses the weapon — the caller renders its AttackRow,
// so rolling, rage and crits behave exactly as in the list view.
export function WeaponHand({
  attacks,
  selectedId,
  onSelect,
}: {
  attacks: Attack[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [opened, setOpened] = useState(false);
  const selectedIndex = attacks.findIndex((a) => a.id === selectedId);
  const open = opened || selectedIndex !== -1;
  const poses = fanPoses(attacks.length, {
    open,
    selected: selectedIndex === -1 ? null : selectedIndex,
  });

  function handleTap(a: Attack) {
    if (!open) {
      setOpened(true);
    } else if (a.id === selectedId) {
      onSelect(null);
    } else {
      onSelect(a.id);
    }
  }

  return (
    <div className="mb-2">
      <div
        data-fan={open ? "open" : "closed"}
        className="relative h-[14.5rem] flex justify-center"
      >
        {attacks.map((a, i) => {
          const DamageIcon = DAMAGE_TYPE_ICONS[a.damageType] ?? Swords;
          const pressed = open && a.id === selectedId;
          return (
            <motion.button
              key={a.id}
              type="button"
              aria-label={a.name}
              aria-pressed={open ? pressed : undefined}
              onClick={() => handleTap(a)}
              initial={false}
              animate={{
                rotate: poses[i].rotate,
                x: poses[i].x,
                y: poses[i].y,
                scale: poses[i].scale,
              }}
              transition={reducedMotion ? { duration: 0 } : SPRING}
              style={{ originX: 0.5, originY: 1, zIndex: poses[i].zIndex }}
              className={`stone-card absolute bottom-10 w-[7rem] h-[9.5rem] rounded-xl p-2 flex flex-col text-left ${
                pressed ? "outline-2 outline-accent" : ""
              }`}
            >
              <span className="font-heading text-foreground text-sm leading-tight line-clamp-2">
                {a.name}
              </span>
              {a.mastery && <span className="ink-stamp self-start mt-1 text-[0.65rem]">{a.mastery}</span>}
              <DamageIcon
                size={34}
                strokeWidth={1.25}
                className="m-auto text-accent/70"
                aria-hidden="true"
              />
              <span className="text-[0.65rem] italic text-muted text-center truncate">{a.range}</span>
            </motion.button>
          );
        })}
      </div>
      {!open && <p className="text-center text-xs italic text-muted">Toca el mazo para abrir tu mano</p>}
      {open && selectedIndex === -1 && (
        <p className="text-center text-xs italic text-muted">Elige un arma</p>
      )}
    </div>
  );
}
