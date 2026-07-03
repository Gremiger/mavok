"use client";

import { useState, useEffect } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
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

export function QuestList({
  initialOpenId,
}: {
  initialOpenId?: string;
} = {}) {
  const { character, addQuest, updateQuest, removeQuest } =
    useCharacterContext();
  const { density } = useThemeContext();
  const [filter, setFilter] = useState<StatusFilter>("all");
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
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    givenBy: "",
    tags: "",
    status: "active" as QuestEntry["status"],
  });

  useEffect(() => {
    if (!character || !initialOpenId) return;
    const quest = character.notes.quests.find((q) => q.id === initialOpenId);
    if (quest) openEdit(quest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOpenId]);

  if (!character) return null;

  const quests = character.notes.quests.filter(
    (q) => filter === "all" || q.status === filter
  );

  function openNew() {
    setForm({ title: "", content: "", givenBy: "", tags: "", status: "active" });
    setEditingId(null);
    setFormOpen(true);
  }

  function openEdit(quest: QuestEntry) {
    setForm({
      title: quest.title,
      content: quest.content,
      givenBy: quest.givenBy,
      tags: quest.tags.join(", "),
      status: quest.status,
    });
    setEditingId(quest.id);
    setFormOpen(true);
  }

  function handleSave() {
    if (!form.title.trim()) return;
    const now = new Date().toISOString();
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingId) {
      updateQuest(editingId, {
        title: form.title.trim(),
        content: form.content,
        givenBy: form.givenBy,
        tags,
        status: form.status,
        updatedAt: now,
      });
    } else {
      addQuest({
        id: crypto.randomUUID(),
        title: form.title.trim(),
        content: form.content,
        tags,
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
          className={`stone-card rounded-lg cursor-pointer active:scale-[0.99] transition-transform ${density === "compact" ? "p-2" : "p-3"}`}
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
            <>
              <p
                className={`text-xs text-foreground/80 mt-1 ${expandedPreviews.has(quest.id) ? "" : "line-clamp-2"}`}
              >
                {quest.content}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePreview(quest.id);
                }}
                className="text-[0.65rem] text-accent mt-0.5"
              >
                {expandedPreviews.has(quest.id) ? "ver menos" : "ver más"}
              </button>
            </>
          )}
          {quest.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {quest.tags.map((t) => (
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
            list="npc-names"
            value={form.givenBy}
            onChange={(e) => setForm({ ...form, givenBy: e.target.value })}
            placeholder="Dada por..."
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
          />
          <datalist id="npc-names">
            {character.notes.npcs.map((n) => (
              <option key={n.id} value={n.title} />
            ))}
          </datalist>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Detalles"
            rows={4}
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
          />
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="Tags (separados por coma)"
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
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
