"use client";

import { useState } from "react";
import { useCharacterContext, useThemeContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { Tag } from "@/components/ui/Tag";
import { EmptyState } from "@/components/ui/EmptyState";
import { GhostChip } from "@/components/ui/GhostChip";
import { Markdown } from "@/components/ui/Markdown";
import { MentionTextarea } from "@/components/notes/MentionTextarea";
import { Plus, ScrollText } from "lucide-react";
import type { QuestEntry } from "@/lib/types";
import { toast } from "sonner";
import {
  buildLinkableNotes,
  linkifyMentions,
  parseNoteLink,
} from "@/lib/note-links";

const STATUS_CONFIG = {
  active: { label: "Activa", variant: "default" as const },
  completed: { label: "Completada", variant: "success" as const },
  failed: { label: "Fallida", variant: "danger" as const },
};

type StatusFilter = "all" | QuestEntry["status"];

export function QuestList({
  initialOpenId,
  onNavigate,
}: {
  initialOpenId?: string;
  onNavigate?: (
    section: "world" | "npcs" | "quests" | "journal",
    id: string
  ) => void;
} = {}) {
  const { character, addQuest, updateQuest, removeQuest } =
    useCharacterContext();
  const { density } = useThemeContext();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(
    initialOpenId ?? null
  );
  const [form, setForm] = useState({
    title: "",
    content: "",
    givenBy: "",
    tags: "",
    status: "active" as QuestEntry["status"],
  });

  const [prevInitialOpenId, setPrevInitialOpenId] = useState(initialOpenId);
  if (initialOpenId !== prevInitialOpenId) {
    setPrevInitialOpenId(initialOpenId);
    if (initialOpenId) setViewingId(initialOpenId);
  }

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
          <GhostChip key={f} onClick={() => setFilter(f)} solid={filter === f}>
            {f === "all" ? "Todas" : STATUS_CONFIG[f].label}
          </GhostChip>
        ))}
      </div>

      {/* Quest list */}
      {quests.map((quest) => (
        <div
          key={quest.id}
          onClick={() => setViewingId(quest.id)}
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
            <Markdown className="text-xs text-foreground/80 mt-1 line-clamp-2">
              {quest.content}
            </Markdown>
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
        <EmptyState
          icon={ScrollText}
          message={`Sin misiones${filter !== "all" ? ` ${STATUS_CONFIG[filter].label.toLowerCase()}s` : ""}. Toca + para agregar.`}
        />
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
          <MentionTextarea
            value={form.content}
            onChange={(v) => setForm({ ...form, content: v })}
            linkables={buildLinkableNotes(character.notes)}
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
                  const quest = character.notes.quests.find(
                    (q) => q.id === editingId
                  );
                  removeQuest(editingId);
                  setFormOpen(false);
                  if (quest) {
                    toast(`${quest.title} eliminada`, {
                      action: {
                        label: "Deshacer",
                        onClick: () => addQuest(quest),
                      },
                    });
                  }
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

      {/* Quest View Modal */}
      <Modal
        open={!!viewingId && !formOpen}
        onClose={() => setViewingId(null)}
        title={character.notes.quests.find((q) => q.id === viewingId)?.title ?? ""}
      >
        {(() => {
          const quest = character.notes.quests.find((q) => q.id === viewingId);
          if (!quest) return null;
          return (
            <div className="space-y-3">
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
              {quest.givenBy && (
                <p className="text-xs text-muted">De: {quest.givenBy}</p>
              )}
              {quest.content && (
                <Markdown
                  className="text-sm"
                  onInternalLink={(href) => {
                    const link = parseNoteLink(href);
                    if (link) onNavigate?.(link.section, link.id);
                  }}
                >
                  {linkifyMentions(
                    quest.content,
                    buildLinkableNotes(character.notes)
                  )}
                </Markdown>
              )}
              {quest.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
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
              <button
                onClick={() => {
                  openEdit(quest);
                  setViewingId(null);
                }}
                className="text-xs text-accent hover:underline"
              >
                Editar
              </button>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
