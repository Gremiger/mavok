"use client";

import { useState } from "react";

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

  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1 overflow-y-auto pb-16">
        {activeTab === "ficha" && (
          <div className="p-4">
            <h1 className="font-heading text-2xl text-accent">Mavok</h1>
            <p className="text-muted mt-2">Toro-de-casa Toduk-Rojum</p>
            <p className="text-foreground mt-4">Bárbaro Goliath — Nivel 1</p>
          </div>
        )}
        {activeTab === "combate" && (
          <div className="p-4 text-muted">Combate — próximamente</div>
        )}
        {activeTab === "inventario" && (
          <div className="p-4 text-muted">Inventario — próximamente</div>
        )}
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
  );
}
