"use client";

import { motion, type TargetAndTransition } from "framer-motion";
import { Shield, Swords, Backpack, BookOpen, Library, Settings, type LucideIcon } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export type TabId = "ficha" | "combate" | "inventario" | "notas" | "enciclopedia" | "ajustes";

// Each tab's icon has its own small gesture when it becomes the active tab:
// the shield is raised, the swords clash, the pack is hoisted, the book
// riffles, the shelf tips and the gear turns.
const ICONS: Record<TabId, { Icon: LucideIcon; gesture: TargetAndTransition }> = {
  ficha: { Icon: Shield, gesture: { y: [0, -4, 0], scale: [1, 1.12, 1] } },
  combate: { Icon: Swords, gesture: { rotate: [0, -14, 10, -5, 0], scale: [1, 1.1, 1] } },
  inventario: { Icon: Backpack, gesture: { y: [0, -5, 0, -2, 0] } },
  notas: { Icon: BookOpen, gesture: { scaleX: [1, 0.6, 1.08, 1] } },
  enciclopedia: { Icon: Library, gesture: { rotate: [0, -8, 4, 0] } },
  ajustes: { Icon: Settings, gesture: { rotate: [0, 120] } },
};

const REST = { y: 0, scale: 1, scaleX: 1, rotate: 0 };

export function TabIcon({ tab, active }: { tab: TabId; active: boolean }) {
  const reducedMotion = usePrefersReducedMotion();
  const { Icon, gesture } = ICONS[tab];
  return (
    <motion.span
      data-gesture={active ? "on" : "off"}
      className="inline-flex"
      initial={false}
      animate={active && !reducedMotion ? gesture : REST}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Icon size={20} strokeWidth={1.5} />
    </motion.span>
  );
}
