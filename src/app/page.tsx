"use client";

import { useState } from "react";
import { useCharacter } from "@/hooks/useCharacter";
import { useTheme } from "@/hooks/useTheme";
import { CharacterContext, ThemeContext } from "@/lib/context";
import { SheetTab } from "@/components/tabs/SheetTab";
import { CombatTab } from "@/components/tabs/CombatTab";
import { InventoryTab } from "@/components/tabs/InventoryTab";

type Tab = "ficha" | "combate" | "inventario" | "notas" | "ajustes";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "ficha", label: "Ficha", icon: "🛡️" },
  { id: "combate", label: "Combate", icon: "⚔️" },
  { id: "inventario", label: "Inventario", icon: "🎒" },
  { id: "notas", label: "Notas", icon: "📖" },
  { id: "ajustes", label: "Ajustes", icon: "⚙️" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("ficha");
  const charState = useCharacter();
  const themeState = useTheme();

  return (
    <CharacterContext.Provider value={charState}>
      <ThemeContext.Provider value={themeState}>
        <div className="flex flex-col min-h-dvh">
          <main className="flex-1 overflow-y-auto pb-16">
            {activeTab === "ficha" && <SheetTab />}
            {activeTab === "combate" && <CombatTab />}
            {activeTab === "inventario" && <InventoryTab />}
            {activeTab === "notas" && (
              <div className="p-4 text-muted">Notas — próximamente</div>
            )}
            {activeTab === "ajustes" && (
              <div className="p-4 text-muted">Ajustes — próximamente</div>
            )}
          </main>

          <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around z-50 safe-area-pb">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-0.5 text-xs w-16 h-full transition-colors ${
                  activeTab === tab.id ? "text-accent" : "text-muted"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </ThemeContext.Provider>
    </CharacterContext.Provider>
  );
}
