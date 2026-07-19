"use client";

import { useState } from "react";
import { useLongPress } from "@/hooks/useLongPress";
import { CompactRow } from "@/components/ui/CompactRow";
import { GhostChip } from "@/components/ui/GhostChip";
import type { GrantedAction } from "@/lib/types";

export function GrantedActionCard({
  itemName,
  grantedAction,
  onUse,
  onAdjust,
}: {
  itemName: string;
  grantedAction: GrantedAction;
  onUse: () => void;
  onAdjust: (remaining: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const { charges } = grantedAction;
  const longPress = useLongPress(() => setEditing(true));

  function handleUse() {
    if (!charges || charges.remaining <= 0) return;
    onUse();
  }

  const meta = `⚡ ${grantedAction.description} — ${itemName}`;

  if (!charges) {
    return <CompactRow name={grantedAction.name} meta={meta} right={null} />;
  }

  if (editing) {
    return (
      <CompactRow
        name={grantedAction.name}
        meta={meta}
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAdjust(Math.max(0, charges.remaining - 1))}
              disabled={charges.remaining <= 0}
              className="w-6 h-6 rounded bg-background border border-border text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="text-xs text-muted font-heading w-6 text-center">
              {charges.remaining}
            </span>
            <button
              onClick={() => onAdjust(Math.min(charges.total, charges.remaining + 1))}
              disabled={charges.remaining >= charges.total}
              className="w-6 h-6 rounded bg-background border border-border text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-xs px-2 py-0.5 border border-accent text-accent rounded"
            >
              ✓
            </button>
          </div>
        }
      />
    );
  }

  return (
    <CompactRow
      name={grantedAction.name}
      meta={meta}
      dim={charges.remaining <= 0}
      right={
        <GhostChip
          disabled={charges.remaining <= 0}
          onClick={() => {
            if (longPress.wasLongPress()) return;
            handleUse();
          }}
          {...longPress.handlers}
        >
          ⚡ {charges.remaining}/{charges.total}
        </GhostChip>
      }
    />
  );
}
