"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Character,
  InventoryItem,
  NoteEntry,
  QuestEntry,
  JournalEntry,
  Attack,
} from "@/lib/types";
import { loadCharacter, saveCharacter } from "@/lib/storage";
import { MAVOK_DEFAULT } from "@/data/mavok-default";

export function useCharacter(id: string = "mavok-1") {
  const [character, setCharacter] = useState<Character | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const data = loadCharacter(id);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: localStorage is unavailable during the static-export build's prerender pass (see storage.ts's `typeof window === "undefined"` guards), so this read must be deferred to after client mount, not computed during render.
    setCharacter(data ?? MAVOK_DEFAULT);
    setReady(true);
  }, [id]);

  useEffect(() => {
    if (ready && character) saveCharacter(character);
  }, [character, ready]);

  const update = useCallback(
    (updater: (prev: Character) => Character) => {
      setCharacter((prev) => (prev ? updater(prev) : prev));
    },
    []
  );

  const updateMeta = useCallback(
    (patch: Partial<Character["meta"]>) =>
      update((c) => ({ ...c, meta: { ...c.meta, ...patch } })),
    [update]
  );

  const updateCombat = useCallback(
    (patch: Partial<Character["combat"]>) =>
      update((c) => ({ ...c, combat: { ...c.combat, ...patch } })),
    [update]
  );

  const updateResources = useCallback(
    (patch: Partial<Character["resources"]>) =>
      update((c) => ({ ...c, resources: { ...c.resources, ...patch } })),
    [update]
  );

  const updateCurrency = useCallback(
    (patch: Partial<Character["currency"]>) =>
      update((c) => ({ ...c, currency: { ...c.currency, ...patch } })),
    [update]
  );

  const updateAttributes = useCallback(
    (patch: Partial<Character["attributes"]>) =>
      update((c) => ({ ...c, attributes: { ...c.attributes, ...patch } })),
    [update]
  );

  const addInventoryItem = useCallback(
    (item: InventoryItem) =>
      update((c) => ({ ...c, inventory: [...c.inventory, item] })),
    [update]
  );

  const removeInventoryItem = useCallback(
    (itemId: string) =>
      update((c) => ({
        ...c,
        inventory: c.inventory.filter((i) => i.id !== itemId),
      })),
    [update]
  );

  const updateInventoryItem = useCallback(
    (itemId: string, patch: Partial<InventoryItem>) =>
      update((c) => ({
        ...c,
        inventory: c.inventory.map((i) =>
          i.id === itemId ? { ...i, ...patch } : i
        ),
      })),
    [update]
  );

  const addAttack = useCallback(
    (attack: Attack) =>
      update((c) => ({ ...c, attacks: [...c.attacks, attack] })),
    [update]
  );

  const updateAttack = useCallback(
    (attackId: string, patch: Partial<Attack>) =>
      update((c) => ({
        ...c,
        attacks: c.attacks.map((a) =>
          a.id === attackId ? { ...a, ...patch } : a
        ),
      })),
    [update]
  );

  const removeAttack = useCallback(
    (attackId: string) =>
      update((c) => ({
        ...c,
        attacks: c.attacks.filter((a) => a.id !== attackId),
      })),
    [update]
  );

  const addQuickNote = useCallback(
    (text: string) =>
      update((c) => ({
        ...c,
        notes: {
          ...c.notes,
          quick: [
            {
              id: crypto.randomUUID(),
              text,
              createdAt: new Date().toISOString(),
            },
            ...c.notes.quick,
          ],
        },
      })),
    [update]
  );

  const updateQuickNote = useCallback(
    (noteId: string, text: string) =>
      update((c) => ({
        ...c,
        notes: {
          ...c.notes,
          quick: c.notes.quick.map((n) =>
            n.id === noteId ? { ...n, text } : n
          ),
        },
      })),
    [update]
  );

  const removeQuickNote = useCallback(
    (noteId: string) =>
      update((c) => ({
        ...c,
        notes: {
          ...c.notes,
          quick: c.notes.quick.filter((n) => n.id !== noteId),
        },
      })),
    [update]
  );

  const addNote = useCallback(
    (section: "world" | "npcs", note: NoteEntry) =>
      update((c) => ({
        ...c,
        notes: { ...c.notes, [section]: [...c.notes[section], note] },
      })),
    [update]
  );

  const updateNote = useCallback(
    (section: "world" | "npcs", noteId: string, patch: Partial<NoteEntry>) =>
      update((c) => ({
        ...c,
        notes: {
          ...c.notes,
          [section]: c.notes[section].map((n) =>
            n.id === noteId ? { ...n, ...patch } : n
          ),
        },
      })),
    [update]
  );

  const removeNote = useCallback(
    (section: "world" | "npcs", noteId: string) =>
      update((c) => ({
        ...c,
        notes: {
          ...c.notes,
          [section]: c.notes[section].filter((n) => n.id !== noteId),
        },
      })),
    [update]
  );

  const addQuest = useCallback(
    (quest: QuestEntry) =>
      update((c) => ({
        ...c,
        notes: { ...c.notes, quests: [...c.notes.quests, quest] },
      })),
    [update]
  );

  const updateQuest = useCallback(
    (questId: string, patch: Partial<QuestEntry>) =>
      update((c) => ({
        ...c,
        notes: {
          ...c.notes,
          quests: c.notes.quests.map((q) =>
            q.id === questId ? { ...q, ...patch } : q
          ),
        },
      })),
    [update]
  );

  const removeQuest = useCallback(
    (questId: string) =>
      update((c) => ({
        ...c,
        notes: {
          ...c.notes,
          quests: c.notes.quests.filter((q) => q.id !== questId),
        },
      })),
    [update]
  );

  const addJournalEntry = useCallback(
    (entry: JournalEntry) =>
      update((c) => ({
        ...c,
        notes: { ...c.notes, journal: [...c.notes.journal, entry] },
      })),
    [update]
  );

  const updateJournalEntry = useCallback(
    (entryId: string, patch: Partial<JournalEntry>) =>
      update((c) => ({
        ...c,
        notes: {
          ...c.notes,
          journal: c.notes.journal.map((j) =>
            j.id === entryId ? { ...j, ...patch } : j
          ),
        },
      })),
    [update]
  );

  const removeJournalEntry = useCallback(
    (entryId: string) =>
      update((c) => ({
        ...c,
        notes: {
          ...c.notes,
          journal: c.notes.journal.filter((j) => j.id !== entryId),
        },
      })),
    [update]
  );

  return {
    character,
    update,
    updateMeta,
    updateCombat,
    updateResources,
    updateCurrency,
    updateAttributes,
    addInventoryItem,
    removeInventoryItem,
    updateInventoryItem,
    addAttack,
    updateAttack,
    removeAttack,
    addQuickNote,
    updateQuickNote,
    removeQuickNote,
    addNote,
    updateNote,
    removeNote,
    addQuest,
    updateQuest,
    removeQuest,
    addJournalEntry,
    updateJournalEntry,
    removeJournalEntry,
  };
}
