"use client";

import { useState } from "react";
import { useCharacterContext } from "@/lib/context";
import { QuickNotes } from "@/components/notes/QuickNotes";
import { NoteList } from "@/components/notes/NoteList";
import { QuestList } from "@/components/notes/QuestList";
import { JournalList } from "@/components/notes/JournalList";

const SUB_TABS = [
  { id: "quick", label: "Rápidas" },
  { id: "world", label: "Mundo" },
  { id: "npcs", label: "NPCs" },
  { id: "quests", label: "Misiones" },
  { id: "journal", label: "Diario" },
] as const;

type SubTab = (typeof SUB_TABS)[number]["id"];

export function NotesTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("quick");
  const charCtx = useCharacterContext();

  if (!charCtx.character) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tab navigation */}
      <div className="flex overflow-x-auto border-b border-border bg-card px-2 gap-1 shrink-0">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-3 py-2.5 text-xs whitespace-nowrap transition-colors border-b-2 ${
              activeSubTab === tab.id
                ? "text-accent border-accent"
                : "text-muted border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeSubTab === "quick" && <QuickNotes />}
        {activeSubTab === "world" && <NoteList section="world" title="Mundo" />}
        {activeSubTab === "npcs" && <NoteList section="npcs" title="NPCs" />}
        {activeSubTab === "quests" && <QuestList />}
        {activeSubTab === "journal" && <JournalList />}
      </div>
    </div>
  );
}
