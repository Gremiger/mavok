"use client";

import { useState } from "react";
import { useCharacterContext } from "@/lib/context";

export function QuickNotes() {
  const { character, addQuickNote, removeQuickNote, addNote, addQuest } =
    useCharacterContext();
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  if (!character) return null;

  function handleAdd() {
    if (text.trim()) {
      addQuickNote(text.trim());
      setText("");
    }
  }

  function promoteNote(noteId: string, target: "world" | "npcs" | "quests") {
    const note = character!.notes.quick.find((n) => n.id === noteId);
    if (!note) return;

    const now = new Date().toISOString();
    if (target === "quests") {
      addQuest({
        id: crypto.randomUUID(),
        title: note.text,
        content: "",
        tags: [],
        createdAt: now,
        updatedAt: now,
        status: "active",
        givenBy: "",
      });
    } else {
      addNote(target, {
        id: crypto.randomUUID(),
        title: note.text,
        content: "",
        tags: [],
        createdAt: now,
        updatedAt: now,
      });
    }
    removeQuickNote(noteId);
    setMenuOpen(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Nota rápida..."
          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-heading active:scale-95 transition-transform"
        >
          +
        </button>
      </div>

      <div className="space-y-1">
        {character.notes.quick.map((note) => (
          <div
            key={note.id}
            className="flex items-start gap-2 bg-card rounded-lg border border-border p-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm">{note.text}</p>
              <p className="text-xs text-muted mt-1">
                {new Date(note.createdAt).toLocaleString("es")}
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() =>
                  setMenuOpen(menuOpen === note.id ? null : note.id)
                }
                className="text-muted hover:text-foreground text-sm px-1"
              >
                ⋯
              </button>
              {menuOpen === note.id && (
                <div className="absolute right-0 top-6 bg-card border border-border rounded-lg shadow-lg z-10 py-1 w-40">
                  <button
                    onClick={() => promoteNote(note.id, "world")}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-background"
                  >
                    Mover a Mundo
                  </button>
                  <button
                    onClick={() => promoteNote(note.id, "npcs")}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-background"
                  >
                    Mover a NPCs
                  </button>
                  <button
                    onClick={() => promoteNote(note.id, "quests")}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-background"
                  >
                    Mover a Misiones
                  </button>
                  <button
                    onClick={() => {
                      removeQuickNote(note.id);
                      setMenuOpen(null);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-danger hover:bg-background"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {character.notes.quick.length === 0 && (
          <p className="text-muted text-sm text-center py-8">
            Sin notas rápidas. Escribe algo arriba para empezar.
          </p>
        )}
      </div>
    </div>
  );
}
