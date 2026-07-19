"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useCharacterContext } from "@/lib/context";
import { QuickNotes } from "@/components/notes/QuickNotes";
import { NoteList } from "@/components/notes/NoteList";
import { QuestList } from "@/components/notes/QuestList";
import { JournalList } from "@/components/notes/JournalList";
import { EmptyState } from "@/components/ui/EmptyState";
import { CompactRow } from "@/components/ui/CompactRow";
import type { Notes } from "@/lib/types";

const SUB_TABS = [
  { id: "quick", label: "Rápidas" },
  { id: "world", label: "Mundo" },
  { id: "npcs", label: "NPCs" },
  { id: "quests", label: "Misiones" },
  { id: "journal", label: "Diario" },
] as const;

type SubTab = (typeof SUB_TABS)[number]["id"];

const SUB_TAB_IDS = SUB_TABS.map((t) => t.id);

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
    const fieldsMatch = Object.values(n.fields ?? {}).some((v) =>
      v.toLowerCase().includes(q)
    );
    if (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      fieldsMatch
    ) {
      results.push({ id: n.id, section: "world", typeLabel: TYPE_LABELS.world, title: n.title });
    }
  }
  for (const n of notes.npcs) {
    const fieldsMatch = Object.values(n.fields ?? {}).some((v) =>
      v.toLowerCase().includes(q)
    );
    if (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      fieldsMatch
    ) {
      results.push({ id: n.id, section: "npcs", typeLabel: TYPE_LABELS.npcs, title: n.title });
    }
  }
  for (const quest of notes.quests) {
    const tagsMatch = quest.tags.join(" ").toLowerCase().includes(q);
    const givenByMatch = quest.givenBy.toLowerCase().includes(q);
    if (
      quest.title.toLowerCase().includes(q) ||
      quest.content.toLowerCase().includes(q) ||
      tagsMatch ||
      givenByMatch
    ) {
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
  const [searchScope, setSearchScope] = useState<"current" | "global">(
    "global"
  );
  const [pendingOpenId, setPendingOpenId] = useState<string | undefined>(
    undefined
  );
  const { dragX, dragOpacity, handleDragEnd } = useSwipeNavigation(
    SUB_TAB_IDS,
    activeSubTab,
    setActiveSubTab
  );
  const charCtx = useCharacterContext();

  if (!charCtx.character) return null;

  const rawResults = searchQuery
    ? computeSearchResults(charCtx.character.notes, searchQuery)
    : [];
  const results =
    searchScope === "current"
      ? rawResults.filter((r) => r.section === activeSubTab)
      : rawResults;

  function handleResultTap(result: SearchResult) {
    setActiveSubTab(result.section);
    setPendingOpenId(result.id);
    setSearchQuery("");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-2 border-b border-border bg-card shrink-0 flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en notas..."
          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
        />
        <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
          <button
            onClick={() => setSearchScope("current")}
            className={`px-2.5 py-2 text-xs font-heading transition-colors ${
              searchScope === "current"
                ? "bg-accent text-white"
                : "bg-card text-muted"
            }`}
          >
            Aquí
          </button>
          <button
            onClick={() => setSearchScope("global")}
            className={`px-2.5 py-2 text-xs font-heading transition-colors ${
              searchScope === "global"
                ? "bg-accent text-white"
                : "bg-card text-muted"
            }`}
          >
            Todo
          </button>
        </div>
      </div>

      {/* Sub-tab navigation (hidden during global search) */}
      {(!searchQuery || searchScope === "current") && (
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

      <motion.div
        className="flex-1 overflow-y-auto p-4"
        style={{ x: dragX, opacity: dragOpacity, touchAction: "pan-y pinch-zoom" }}
        drag={searchQuery && searchScope === "global" ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        {searchQuery ? (
          results.length > 0 ? (
            <div className="space-y-2">
              {results.map((r) => (
                <CompactRow
                  key={`${r.section}-${r.id}`}
                  onClick={() => handleResultTap(r)}
                  name={
                    <>
                      <span className="text-[0.6rem] px-1.5 py-0.5 bg-accent/20 text-accent rounded mr-1.5">
                        {r.typeLabel}
                      </span>
                      {r.title}
                    </>
                  }
                  right={null}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={SearchX}
              message={`Sin resultados para "${searchQuery}".`}
            />
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
      </motion.div>
    </div>
  );
}
