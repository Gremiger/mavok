"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Character,
  InventoryItem,
  NoteEntry,
  QuestEntry,
  JournalEntry,
} from "@/lib/types";
import { loadCharacter, saveCharacter } from "@/lib/storage";
import { MAVOK_DEFAULT } from "@/data/mavok-default";

export function useCharacter(id: string = "mavok-1") {
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    const loaded = loadCharacter(id);
    setCharacter(loaded ?? MAVOK_DEFAULT);
  }, [id]);

  useEffect(() => {
    if (character) saveCharacter(character);
  }, [character]);

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
    addQuickNote,
    removeQuickNote,
    addNote,
    updateNote,
    removeNote,
    addQuest,
    updateQuest,
    removeQuest,
    addJournalEntry,
    removeJournalEntry,
  };
}
