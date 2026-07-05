"use client";

import { useState } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Plus, BookOpen } from "lucide-react";
import type { JournalEntry } from "@/lib/types";

export function JournalList({
  initialOpenId,
}: {
  initialOpenId?: string;
} = {}) {
  const { character, addJournalEntry, updateJournalEntry, removeJournalEntry } =
    useCharacterContext();
  const { density } = useThemeContext();
  const [formOpen, setFormOpen] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    session: 1,
    title: "",
    content: "",
  });
  const [form, setForm] = useState({
    session: 1,
    title: "",
    content: "",
  });
  const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(
    new Set()
  );

  function togglePreview(id: string) {
    setExpandedPreviews((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const [prevInitialOpenId, setPrevInitialOpenId] = useState(initialOpenId);
  if (initialOpenId !== prevInitialOpenId) {
    setPrevInitialOpenId(initialOpenId);
    if (initialOpenId) setViewingId(initialOpenId);
  }

  if (!character) return null;

  const journal = character.notes.journal;
  const viewingEntry = journal.find((j) => j.id === viewingId);

  function openNew() {
    const nextSession =
      journal.length > 0
        ? Math.max(...journal.map((j) => j.session)) + 1
        : 1;
    setForm({
      session: nextSession,
      title: "",
      content: "",
    });
    setFormOpen(true);
  }

  function handleSave() {
    if (!form.title.trim()) return;
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      session: form.session,
      date: new Date().toISOString().slice(0, 10),
      title: form.title.trim(),
      content: form.content,
    };
    addJournalEntry(entry);
    setFormOpen(false);
  }

  function startEdit() {
    if (!viewingEntry) return;
    setEditForm({
      session: viewingEntry.session,
      title: viewingEntry.title,
      content: viewingEntry.content,
    });
    setEditing(true);
  }

  function saveEdit() {
    if (!viewingEntry || !editForm.title.trim()) return;
    updateJournalEntry(viewingEntry.id, {
      session: editForm.session,
      title: editForm.title.trim(),
      content: editForm.content,
    });
    setEditing(false);
  }

  return (
    <div className="space-y-3">
      {journal
        .slice()
        .reverse()
        .map((entry) => (
          <div
            key={entry.id}
            onClick={() => setViewingId(entry.id)}
            className={`stone-card rounded-lg cursor-pointer active:scale-[0.99] transition-transform ${density === "compact" ? "p-2" : "p-3"}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded font-heading">
                S{entry.session}
              </span>
              <h4 className="font-heading text-accent text-sm flex-1">
                {entry.title}
              </h4>
              <span className="text-xs text-muted">{entry.date}</span>
            </div>
            {entry.content && (
              <>
                <p
                  className={`text-xs text-foreground/80 mt-2 ${expandedPreviews.has(entry.id) ? "" : "line-clamp-3"}`}
                >
                  {entry.content}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePreview(entry.id);
                  }}
                  className="text-[0.65rem] text-accent mt-0.5"
                >
                  {expandedPreviews.has(entry.id) ? "ver menos" : "ver más"}
                </button>
              </>
            )}
          </div>
        ))}

      {journal.length === 0 && (
        <EmptyState
          icon={BookOpen}
          message="Sin entradas de diario. Toca + después de cada sesión."
        />
      )}

      <button
        onClick={openNew}
        className="fixed right-4 bottom-safe-fab w-12 h-12 rounded-full bg-accent text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus size={24} />
      </button>

      {/* New Entry Form */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Nueva entrada de diario"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="w-1/3">
              <label className="text-xs text-muted">Sesión</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.session}
                onChange={(e) =>
                  setForm({
                    ...form,
                    session: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted">Título</label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="¿Qué pasó?"
                className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground mt-1"
                autoFocus
              />
            </div>
          </div>
          <textarea
            value={form.content}
            onChange={(e) =>
              setForm({ ...form, content: e.target.value })
            }
            placeholder="Resumen de la sesión..."
            rows={6}
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
          />
          <button
            onClick={handleSave}
            className="w-full py-3 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
          >
            Guardar
          </button>
        </div>
      </Modal>

      {/* View/Edit Entry */}
      <Modal
        open={!!viewingEntry}
        onClose={() => {
          setViewingId(null);
          setEditing(false);
        }}
        title={viewingEntry ? `Sesión ${viewingEntry.session}` : ""}
      >
        {viewingEntry &&
          (editing ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="w-1/3">
                  <label className="text-xs text-muted">Sesión</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={editForm.session}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        session: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground mt-1"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted">Título</label>
                  <input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground mt-1"
                    autoFocus
                  />
                </div>
              </div>
              <textarea
                value={editForm.content}
                onChange={(e) =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
                rows={6}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2 text-sm border border-border rounded-lg text-muted"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 py-2 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
                >
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-heading text-accent">{viewingEntry.title}</h3>
              <p className="text-xs text-muted">{viewingEntry.date}</p>
              <p className="text-sm whitespace-pre-line">
                {viewingEntry.content}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={startEdit}
                  className="text-xs text-accent hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    removeJournalEntry(viewingEntry.id);
                    setViewingId(null);
                  }}
                  className="text-xs text-danger hover:underline"
                >
                  Eliminar entrada
                </button>
              </div>
            </div>
          ))}
      </Modal>
    </div>
  );
}
