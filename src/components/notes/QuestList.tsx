"use client";

import { useState } from "react";
import { useCharacterContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { Tag } from "@/components/ui/Tag";
import { Plus } from "lucide-react";
import type { QuestEntry } from "@/lib/types";

const STATUS_CONFIG = {
  active: { label: "Activa", variant: "default" as const },
  completed: { label: "Completada", variant: "success" as const },
  failed: { label: "Fallida", variant: "danger" as const },
};

type StatusFilter = "all" | QuestEntry["status"];

export function QuestList() {
  const { character, addQuest, updateQuest, removeQuest } =
    useCharacterContext();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    givenBy: "",
    status: "active" as QuestEntry["status"],
  });

  if (!character) return null;

  const quests = character.notes.quests.filter(
    (q) => filter === "all" || q.status === filter
  );

  function openNew() {
    setForm({ title: "", content: "", givenBy: "", status: "active" });
    setEditingId(null);
    setFormOpen(true);
  }

  function openEdit(quest: QuestEntry) {
    setForm({
      title: quest.title,
      content: quest.content,
      givenBy: quest.givenBy,
      status: quest.status,
    });
    setEditingId(quest.id);
    setFormOpen(true);
  }

  function handleSave() {
    if (!form.title.trim()) return;
    const now = new Date().toISOString();

    if (editingId) {
      updateQuest(editingId, {
        title: form.title.trim(),
        content: form.content,
        givenBy: form.givenBy,
        status: form.status,
        updatedAt: now,
      });
    } else {
      addQuest({
        id: crypto.randomUUID(),
        title: form.title.trim(),
        content: form.content,
        tags: [],
        givenBy: form.givenBy,
        status: form.status,
        createdAt: now,
        updatedAt: now,
      });
    }
    setFormOpen(false);
  }

  function cycleStatus(questId: string, current: QuestEntry["status"]) {
    const next =
      current === "active"
        ? "completed"
        : current === "completed"
          ? "failed"
          : "active";
    updateQuest(questId, { status: next });
  }

  return (
    <div className="space-y-3">
      {/* Filter */}
      <div className="flex gap-1">
        {(["all", "active", "completed", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs ${
              filter === f
                ? "bg-accent text-white"
                : "bg-card border border-border text-muted"
            }`}
          >
            {f === "all" ? "Todas" : STATUS_CONFIG[f].label}
          </button>
        ))}
      </div>

      {/* Quest list */}
      {quests.map((quest) => (
        <div
          key={quest.id}
          onClick={() => openEdit(quest)}
          className="stone-card rounded-lg p-3 cursor-pointer active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-2">
            <h4 className="font-heading text-accent text-sm flex-1">
              {quest.title}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                cycleStatus(quest.id, quest.status);
              }}
            >
              <Tag
                label={STATUS_CONFIG[quest.status].label}
                variant={STATUS_CONFIG[quest.status].variant}
              />
            </button>
          </div>
          {quest.givenBy && (
            <p className="text-xs text-muted mt-1">De: {quest.givenBy}</p>
          )}
          {quest.content && (
            <p className="text-xs text-foreground/80 mt-1 line-clamp-2">
              {quest.content}
            </p>
          )}
        </div>
      ))}

      {quests.length === 0 && (
        <p className="text-muted text-sm text-center py-8">
          Sin misiones{filter !== "all" ? ` ${STATUS_CONFIG[filter].label.toLowerCase()}s` : ""}. Toca + para agregar.
        </p>
      )}

      <button
        onClick={openNew}
        className="fixed right-4 bottom-safe-fab w-12 h-12 rounded-full bg-accent text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus size={24} />
      </button>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? "Editar misión" : "Nueva misión"}
      >
        <div className="space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Título de la misión"
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
            autoFocus
          />
          <input
            value={form.givenBy}
            onChange={(e) => setForm({ ...form, givenBy: e.target.value })}
            placeholder="Dada por..."
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Detalles"
            rows={4}
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
          />
          <select
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as QuestEntry["status"],
              })
            }
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          >
            <option value="active">Activa</option>
            <option value="completed">Completada</option>
            <option value="failed">Fallida</option>
          </select>

          <div className="flex gap-2">
            {editingId && (
              <button
                onClick={() => {
                  removeQuest(editingId);
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
