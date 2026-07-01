"use client";

import { useState } from "react";
import { useCharacterContext } from "@/lib/context";
import { QuickNotes } from "@/components/notes/QuickNotes";
import { NoteList } from "@/components/notes/NoteList";
import { QuestList } from "@/components/notes/QuestList";
import { JournalList } from "@/components/notes/JournalList";
import type { Notes } from "@/lib/types";

const SUB_TABS = [
  { id: "quick", label: "Rápidas" },
  { id: "world", label: "Mundo" },
  { id: "npcs", label: "NPCs" },
  { id: "quests", label: "Misiones" },
  { id: "journal", label: "Diario" },
] as const;

type SubTab = (typeof SUB_TABS)[number]["id"];

interface SearchResult {
  id: string;
  section: SubTab;
  typeLabel: string;
  title: string;
}

const TYPE_LABELS: Record<SubTab, string> = {
  quick: "Rápida",
  world: "Mundo",
  npcs: "NPC",
  quests: "Misión",
  journal: "Diario",
};

function computeSearchResults(notes: Notes, query: string): SearchResult[] {
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const n of notes.world) {
    if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
      results.push({ id: n.id, section: "world", typeLabel: TYPE_LABELS.world, title: n.title });
    }
  }
  for (const n of notes.npcs) {
    if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
      results.push({ id: n.id, section: "npcs", typeLabel: TYPE_LABELS.npcs, title: n.title });
    }
  }
  for (const quest of notes.quests) {
    if (quest.title.toLowerCase().includes(q) || quest.content.toLowerCase().includes(q)) {
      results.push({ id: quest.id, section: "quests", typeLabel: TYPE_LABELS.quests, title: quest.title });
    }
  }
  for (const entry of notes.journal) {
    if (entry.title.toLowerCase().includes(q) || entry.content.toLowerCase().includes(q)) {
      results.push({ id: entry.id, section: "journal", typeLabel: TYPE_LABELS.journal, title: entry.title });
    }
  }
  for (const quick of notes.quick) {
    if (quick.text.toLowerCase().includes(q)) {
      results.push({
        id: quick.id,
        section: "quick",
        typeLabel: TYPE_LABELS.quick,
        title: quick.text.length > 60 ? `${quick.text.slice(0, 60)}…` : quick.text,
      });
    }
  }

  return results;
}

export function NotesTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("quick");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingOpenId, setPendingOpenId] = useState<string | undefined>(
    undefined
  );
  const charCtx = useCharacterContext();

  if (!charCtx.character) return null;

  const results = searchQuery
    ? computeSearchResults(charCtx.character.notes, searchQuery)
    : [];

  function handleResultTap(result: SearchResult) {
    setActiveSubTab(result.section);
    setPendingOpenId(result.id);
    setSearchQuery("");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-2 border-b border-border bg-card shrink-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en notas..."
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
        />
      </div>

      {/* Sub-tab navigation (hidden while searching) */}
      {!searchQuery && (
        <div className="flex overflow-x-auto border-b border-border bg-card px-2 gap-1 shrink-0">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id);
                setPendingOpenId(undefined);
              }}
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
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {searchQuery ? (
          results.length > 0 ? (
            <div className="space-y-2">
              {results.map((r) => (
                <div
                  key={`${r.section}-${r.id}`}
                  onClick={() => handleResultTap(r)}
                  className="stone-card rounded-lg p-3 cursor-pointer active:scale-[0.99] transition-transform flex items-center gap-2"
                >
                  <span className="text-[0.6rem] px-1.5 py-0.5 bg-accent/20 text-accent rounded shrink-0">
                    {r.typeLabel}
                  </span>
                  <span className="text-sm truncate">{r.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm text-center py-8">
              Sin resultados para &quot;{searchQuery}&quot;.
            </p>
          )
        ) : (
          <>
            {activeSubTab === "quick" && <QuickNotes />}
            {activeSubTab === "world" && (
              <NoteList section="world" title="Mundo" initialOpenId={pendingOpenId} />
            )}
            {activeSubTab === "npcs" && (
              <NoteList section="npcs" title="NPCs" initialOpenId={pendingOpenId} />
            )}
            {activeSubTab === "quests" && (
              <QuestList initialOpenId={pendingOpenId} />
            )}
            {activeSubTab === "journal" && (
              <JournalList initialOpenId={pendingOpenId} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
