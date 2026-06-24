"use client";

import { useState, useCallback } from "react";
import { useCharacter } from "@/hooks/useCharacter";
import { useTheme } from "@/hooks/useTheme";
import { CharacterContext, ThemeContext } from "@/lib/context";
import { SheetTab } from "@/components/tabs/SheetTab";
import { CombatTab } from "@/components/tabs/CombatTab";
import { InventoryTab } from "@/components/tabs/InventoryTab";
import { NotesTab } from "@/components/tabs/NotesTab";
import { SettingsTab } from "@/components/tabs/SettingsTab";
import { Toaster } from "sonner";
import { Shield, Swords, Backpack, BookOpen, Settings } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import type { ReactNode } from "react";

type Tab = "ficha" | "combate" | "inventario" | "notas" | "ajustes";

const TAB_ORDER: Tab[] = ["ficha", "combate", "inventario", "notas", "ajustes"];

const TAB_META: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "ficha", label: "Ficha", icon: <Shield size={20} /> },
  { id: "combate", label: "Combate", icon: <Swords size={20} /> },
  { id: "inventario", label: "Inventario", icon: <Backpack size={20} /> },
  { id: "notas", label: "Notas", icon: <BookOpen size={20} /> },
  { id: "ajustes", label: "Ajustes", icon: <Settings size={20} /> },
];

const SWIPE_THRESHOLD = 50;

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("ficha");
  const charState = useCharacter();
  const themeState = useTheme();
  const dragX = useMotionValue(0);
  const dragOpacity = useTransform(dragX, [-150, 0, 150], [0.5, 1, 0.5]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const idx = TAB_ORDER.indexOf(activeTab);
      const swipe =
        Math.abs(info.offset.x) > SWIPE_THRESHOLD ||
        Math.abs(info.velocity.x) > 300;

      if (swipe && info.offset.x < 0 && idx < TAB_ORDER.length - 1) {
        setActiveTab(TAB_ORDER[idx + 1]);
      } else if (swipe && info.offset.x > 0 && idx > 0) {
        setActiveTab(TAB_ORDER[idx - 1]);
      }
      animate(dragX, 0, { type: "spring", stiffness: 300, damping: 30 });
    },
    [activeTab, dragX]
  );

  if (!charState.character) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <div className="text-accent font-heading text-xl animate-pulse">
          Mavok
        </div>
      </div>
    );
  }

  const tabContent: Record<Tab, ReactNode> = {
    ficha: <SheetTab />,
    combate: <CombatTab />,
    inventario: <InventoryTab />,
    notas: <NotesTab />,
    ajustes: <SettingsTab />,
  };

  return (
    <CharacterContext.Provider value={charState}>
      <ThemeContext.Provider value={themeState}>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--card)",
              color: "var(--fg)",
              border: "1px solid var(--border-color)",
              fontFamily: "var(--font-inter)",
            },
          }}
        />
        <div className="flex flex-col min-h-dvh">
          <motion.main
            className="flex-1 overflow-y-auto pb-safe-nav touch-pan-y"
            style={{ x: dragX, opacity: dragOpacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {tabContent[activeTab]}
          </motion.main>

          <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 nav-island-bottom">
            <div
              className="mx-auto max-w-md flex items-center justify-around h-14 rounded-2xl border border-border/60"
              style={{
                background: "rgba(26,25,23,0.92)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              {TAB_META.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 text-[0.65rem] flex-1 h-full transition-colors ${
                    activeTab === tab.id ? "text-accent" : "text-muted"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute -bottom-0.5 left-3 right-3 h-0.5 bg-accent rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </ThemeContext.Provider>
    </CharacterContext.Provider>
  );
}
