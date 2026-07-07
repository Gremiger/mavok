"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLongPress } from "@/hooks/useLongPress";
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
  const [pulseKey, setPulseKey] = useState(0);
  const { charges } = grantedAction;

  const longPress = useLongPress(() => setEditing(true));

  function handleUse() {
    if (!charges || charges.remaining <= 0) return;
    onUse();
    setPulseKey((k) => k + 1);
  }

  return (
    <motion.div
      key={pulseKey}
      initial={{ scale: 1.03 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`p-3 rounded-lg border ${
        !charges || charges.remaining > 0
          ? "border-border bg-card"
          : "border-border bg-card opacity-50"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-heading text-accent">{grantedAction.name}</span>
        {charges &&
          (editing ? (
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
                onClick={() =>
                  onAdjust(Math.min(charges.total, charges.remaining + 1))
                }
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
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted font-heading">
                {charges.remaining}/{charges.total}
              </span>
              <button
                {...longPress.handlers}
                onClick={() => {
                  if (longPress.wasLongPress()) return;
                  handleUse();
                }}
                className={`text-xs px-2 py-0.5 border rounded transition-colors select-none [-webkit-touch-callout:none] ${
                  charges.remaining <= 0
                    ? "border-border text-muted opacity-40 cursor-not-allowed"
                    : "border-border hover:border-accent hover:text-accent"
                }`}
              >
                Usar
              </button>
            </div>
          ))}
      </div>
      <p className="text-xs text-muted/60">— {itemName}</p>
      <p className="text-xs text-muted mt-0.5">{grantedAction.description}</p>
    </motion.div>
  );
}
