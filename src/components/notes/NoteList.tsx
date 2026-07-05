"use client";

import { useState, useEffect } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Plus, Map, Users } from "lucide-react";
import type { NoteEntry } from "@/lib/types";

export function NoteList({
  section,
  title,
  initialOpenId,
}: {
  section: "world" | "npcs";
  title: string;
  initialOpenId?: string;
}) {
  const { character, addNote, updateNote, removeNote } =
    useCharacterContext();
  const { density } = useThemeContext();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    fields: {} as Record<string, string>,
  });
  const [newFieldKey, setNewFieldKey] = useState("");
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

  useEffect(() => {
    if (!character || !initialOpenId) return;
    const note = character.notes[section].find((n) => n.id === initialOpenId);
    if (note) openEdit(note);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOpenId]);

  if (!character) return null;

  const notes = character.notes[section];

  function openNew() {
    setForm({ title: "", content: "", tags: "", fields: {} });
    setEditingId(null);
    setFormOpen(true);
  }

  function openEdit(note: NoteEntry) {
    setForm({
      title: note.title,
      content: note.content,
      tags: note.tags.join(", "),
      fields: note.fields || {},
    });
    setEditingId(note.id);
    setFormOpen(true);
  }

  function handleSave() {
    if (!form.title.trim()) return;
    const now = new Date().toISOString();
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const fields =
      Object.keys(form.fields).length > 0 ? form.fields : undefined;

    if (editingId) {
      updateNote(section, editingId, {
        title: form.title.trim(),
        content: form.content,
        tags,
        fields,
        updatedAt: now,
      });
    } else {
      addNote(section, {
        id: crypto.randomUUID(),
        title: form.title.trim(),
        content: form.content,
        tags,
        fields,
        createdAt: now,
        updatedAt: now,
      });
    }
    setFormOpen(false);
  }

  function addField() {
    if (newFieldKey.trim()) {
      setForm({
        ...form,
        fields: { ...form.fields, [newFieldKey.trim()]: "" },
      });
      setNewFieldKey("");
    }
  }

  const suggestedFields =
    section === "npcs"
      ? ["Raza", "Ubicación", "Relación"]
      : ["Región", "Tipo"];

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div
          key={note.id}
          onClick={() => openEdit(note)}
          className={`stone-card rounded-lg cursor-pointer active:scale-[0.99] transition-transform ${density === "compact" ? "p-2" : "p-3"}`}
        >
          <h4 className="font-heading text-accent text-sm">{note.title}</h4>
          {note.content && (
            <>
              <p
                className={`text-xs text-foreground/80 mt-1 ${expandedPreviews.has(note.id) ? "" : "line-clamp-2"}`}
              >
                {note.content}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePreview(note.id);
                }}
                className="text-[0.65rem] text-accent mt-0.5"
              >
                {expandedPreviews.has(note.id) ? "ver menos" : "ver más"}
              </button>
            </>
          )}
          {note.fields &&
            Object.entries(note.fields).some(([, v]) => v) && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(note.fields)
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <span
                      key={k}
                      className="text-[0.6rem] px-1.5 py-0.5 bg-accent/10 text-accent rounded"
                    >
                      {k}: {v}
                    </span>
                  ))}
              </div>
            )}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {note.tags.map((t) => (
                <span
                  key={t}
                  className="text-[0.6rem] px-1.5 py-0.5 bg-background text-muted rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}

      {notes.length === 0 && (
        <EmptyState
          icon={section === "world" ? Map : Users}
          message={`Sin notas de ${title.toLowerCase()}. Toca + para agregar.`}
        />
      )}

      {/* Add FAB */}
      <button
        onClick={openNew}
        className="fixed right-4 bottom-safe-fab w-12 h-12 rounded-full bg-accent text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus size={24} />
      </button>

      {/* Note Form Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? "Editar nota" : `Nueva nota — ${title}`}
      >
        <div className="space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Título"
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            autoFocus
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Contenido"
            rows={4}
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
          />
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="Tags (separados por coma)"
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />

          {/* Structured fields */}
          {Object.entries(form.fields).map(([key, val]) => (
            <div key={key} className="flex gap-2">
              <span className="text-xs text-muted py-2 w-20 shrink-0">
                {key}
              </span>
              <input
                value={val}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fields: { ...form.fields, [key]: e.target.value },
                  })
                }
                className="flex-1 bg-background border border-border rounded-lg px-2 py-1 text-sm text-foreground"
              />
            </div>
          ))}

          <div className="flex gap-2 items-center">
            <input
              value={newFieldKey}
              onChange={(e) => setNewFieldKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addField()}
              placeholder="Agregar campo"
              className="flex-1 bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground"
            />
            <button
              onClick={addField}
              className="text-xs text-accent hover:underline"
            >
              +
            </button>
          </div>
          {suggestedFields.some((f) => !(f in form.fields)) && (
            <div className="flex gap-1 flex-wrap">
              {suggestedFields
                .filter((f) => !(f in form.fields))
                .map((f) => (
                  <button
                    key={f}
                    onClick={() =>
                      setForm({
                        ...form,
                        fields: { ...form.fields, [f]: "" },
                      })
                    }
                    className="text-[0.6rem] px-2 py-0.5 border border-border rounded text-muted hover:border-accent hover:text-accent"
                  >
                    + {f}
                  </button>
                ))}
            </div>
          )}

          <div className="flex gap-2">
            {editingId && (
              <button
                onClick={() => {
                  removeNote(section, editingId);
                  setFormOpen(false);
                }}
                className="px-4 py-2 text-sm text-danger border border-danger/30 rounded-lg hover:bg-danger/10"
              >
                Eliminar
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
            >
              {editingId ? "Guardar" : "Agregar"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
