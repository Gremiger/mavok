"use client";

import { useState, useEffect, useRef } from "react";
import { NotebookPen } from "lucide-react";
import { useCharacterContext } from "@/lib/context";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";

export function QuickNotes() {
  const {
    character,
    addQuickNote,
    updateQuickNote,
    removeQuickNote,
    restoreQuickNote,
    addNote,
    addQuest,
  } = useCharacterContext();
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    }
    document.addEventListener("pointerdown", handleClickOutside);
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside);
  }, [menuOpen]);

  if (!character) return null;

  function handleAdd() {
    if (text.trim()) {
      addQuickNote(text.trim());
      setText("");
    }
  }

  function startEdit(noteId: string, currentText: string) {
    setEditingId(noteId);
    setEditText(currentText);
    setMenuOpen(null);
  }

  function saveEdit() {
    if (editingId && editText.trim()) {
      updateQuickNote(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText("");
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
            className="flex items-start gap-2 stone-card rounded-lg p-3"
          >
            <div className="flex-1 min-w-0">
              {editingId === note.id ? (
                <div className="flex gap-2">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    autoFocus
                    className="flex-1 bg-background border border-accent rounded px-2 py-1 text-sm text-foreground"
                  />
                  <button
                    onClick={saveEdit}
                    className="text-xs px-2 py-1 bg-accent text-white rounded"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs px-2 py-1 border border-border rounded text-muted"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm">{note.text}</p>
                  <p className="text-xs text-muted mt-1">
                    {new Date(note.createdAt).toLocaleString("es")}
                  </p>
                </>
              )}
            </div>
            <div
              className="relative"
              ref={menuOpen === note.id ? menuRef : undefined}
            >
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
                    onClick={() => startEdit(note.id, note.text)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-background"
                  >
                    Editar
                  </button>
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
                      toast("Nota eliminada", {
                        action: {
                          label: "Deshacer",
                          onClick: () => restoreQuickNote(note),
                        },
                      });
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
          <EmptyState
            icon={NotebookPen}
            message="Sin notas rápidas. Escribe algo arriba para empezar."
          />
        )}
      </div>
    </div>
  );
}
