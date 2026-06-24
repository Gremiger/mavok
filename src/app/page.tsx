"use client";

import { useState } from "react";
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
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

type Tab = "ficha" | "combate" | "inventario" | "notas" | "ajustes";

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "ficha", label: "Ficha", icon: <Shield size={20} /> },
  { id: "combate", label: "Combate", icon: <Swords size={20} /> },
  { id: "inventario", label: "Inventario", icon: <Backpack size={20} /> },
  { id: "notas", label: "Notas", icon: <BookOpen size={20} /> },
  { id: "ajustes", label: "Ajustes", icon: <Settings size={20} /> },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("ficha");
  const charState = useCharacter();
  const themeState = useTheme();

  if (!charState.character) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <div className="text-accent font-heading text-xl animate-pulse">Mavok</div>
      </div>
    );
  }

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
          <main className="flex-1 overflow-y-auto pb-16">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                {activeTab === "ficha" && <SheetTab />}
                {activeTab === "combate" && <CombatTab />}
                {activeTab === "inventario" && <InventoryTab />}
                {activeTab === "notas" && <NotesTab />}
                {activeTab === "ajustes" && <SettingsTab />}
              </motion.div>
            </AnimatePresence>
          </main>

          <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around z-50 safe-area-pb">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-0.5 text-xs w-16 h-full transition-colors ${
                  activeTab === tab.id ? "text-accent" : "text-muted"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute top-0 left-2 right-2 h-0.5 bg-accent rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </ThemeContext.Provider>
    </CharacterContext.Provider>
  );
}
