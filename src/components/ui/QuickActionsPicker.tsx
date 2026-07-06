"use client";

import { useState } from "react";
import type { Attack, PinnedAction } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import {
  MAX_PINNED_ACTIONS,
  pinnedActionKey,
  pinnedActionLabel,
} from "@/lib/quickActions";

function buildOptions(attacks: Attack[]): PinnedAction[] {
  const fixed: PinnedAction[] = [
    { type: "rage" },
    { type: "hitDice" },
    { type: "hpAdjust" },
    { type: "resource", resource: "healerKit" },
    { type: "resource", resource: "stoneEndurance" },
  ];
  const perAttack: PinnedAction[] = attacks.flatMap((a) => {
    const opts: PinnedAction[] = [
      { type: "attackRoll", attackId: a.id },
      { type: "attackDamage", attackId: a.id },
    ];
    if (a.mastery) opts.push({ type: "attackDefinition", attackId: a.id });
    return opts;
  });
  return [...fixed, ...perAttack];
}

export function QuickActionsPicker({
  open,
  onClose,
  selected,
  attacks,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  selected: PinnedAction[];
  attacks: Attack[];
  onSave: (actions: PinnedAction[]) => void;
}) {
  const [working, setWorking] = useState<PinnedAction[]>(selected);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setWorking(selected);
  }

  const options = buildOptions(attacks);
  const workingKeys = new Set(working.map(pinnedActionKey));

  function toggle(action: PinnedAction) {
    const key = pinnedActionKey(action);
    if (workingKeys.has(key)) {
      setWorking(working.filter((a) => pinnedActionKey(a) !== key));
    } else if (working.length < MAX_PINNED_ACTIONS) {
      setWorking([...working, action]);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Acciones rápidas">
      <p className="text-xs text-muted mb-3">
        Elegí hasta {MAX_PINNED_ACTIONS} acciones ({working.length}/
        {MAX_PINNED_ACTIONS}).
      </p>
      <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto">
        {options.map((action) => {
          const key = pinnedActionKey(action);
          const isSelected = workingKeys.has(key);
          const atCap = working.length >= MAX_PINNED_ACTIONS;
          return (
            <button
              key={key}
              onClick={() => toggle(action)}
              disabled={!isSelected && atCap}
              className={`p-2 rounded-lg border text-left text-sm ${
                isSelected
                  ? "border-accent bg-accent/10 text-accent"
                  : !isSelected && atCap
                    ? "border-border bg-card/50 text-muted opacity-50"
                    : "border-border bg-card text-foreground hover:border-accent"
              }`}
            >
              {pinnedActionLabel(action, attacks)}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => {
          onSave(working);
          onClose();
        }}
        className="w-full mt-4 py-3 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
      >
        Guardar
      </button>
    </Modal>
  );
}
