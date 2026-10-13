"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "@/lib/storage";
import type { AppSettings } from "@/lib/types";

type ViewKey = "attacksView" | "journalView";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

// A section's remembered view (list vs. cards). Read through
// useSyncExternalStore so the prerender and hydration use the default and the
// client then reads localStorage without a setState-in-effect.
export function useViewPref<K extends ViewKey>(key: K): [AppSettings[K], (next: AppSettings[K]) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => loadSettings()[key],
    () => DEFAULT_SETTINGS[key]
  );
  const setValue = useCallback(
    (next: AppSettings[K]) => {
      saveSettings({ ...loadSettings(), [key]: next });
      listeners.forEach((l) => l());
    },
    [key]
  );
  return [value, setValue];
}
