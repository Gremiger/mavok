"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";

export function HpModal({
  open,
  onClose,
  currentHp,
  maxHp,
  tempHp,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  onApply: (newHp: number, newTempHp: number) => void;
}) {
  const [mode, setMode] = useState<"damage" | "heal" | "temp">("damage");
  const [amount, setAmount] = useState("");

  function apply() {
    const signMatch = amount.match(/^([+-])(\d+)$/);
    const effectiveMode = signMatch
      ? signMatch[1] === "-"
        ? "damage"
        : "heal"
      : mode;
    const val = signMatch ? parseInt(signMatch[2]) : parseInt(amount);
    if (isNaN(val) || val <= 0) return;

    if (effectiveMode === "temp") {
      onApply(currentHp, Math.max(tempHp, val));
    } else if (effectiveMode === "heal") {
      onApply(Math.min(currentHp + val, maxHp), tempHp);
    } else {
      let remaining = val;
      let newTemp = tempHp;
      let newHp = currentHp;
      if (newTemp > 0) {
        const absorbed = Math.min(newTemp, remaining);
        newTemp -= absorbed;
        remaining -= absorbed;
      }
      newHp = Math.max(0, newHp - remaining);
      onApply(newHp, newTemp);
    }
    if (effectiveMode === "damage") toast(`-${val} HP`, { icon: "💥" });
    else if (effectiveMode === "heal") toast(`+${val} HP`, { icon: "💚" });
    else toast(`Temp HP: ${Math.max(tempHp, val)}`, { icon: "🛡️" });
    setAmount("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Puntos de golpe">
      <div className="space-y-4">
        <div className="flex gap-2">
          {(["damage", "heal", "temp"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-full text-sm font-heading transition-colors ${
                mode === m
                  ? m === "damage"
                    ? "bg-danger text-white"
                    : m === "heal"
                      ? "bg-success text-white"
                      : "bg-accent text-white"
                  : "bg-card border border-border text-muted"
              }`}
            >
              {m === "damage" ? "Daño" : m === "heal" ? "Curar" : "Temp HP"}
            </button>
          ))}
        </div>

        <input
          type="text"
          inputMode="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Cantidad (o +5 / -8)"
          className="w-full bg-background border border-border rounded-lg p-3 text-center text-2xl font-heading text-foreground"
          autoFocus
        />

        <div className="flex gap-2">
          {[1, 5, 10].map((n) => (
            <button
              key={n}
              onClick={() =>
                setAmount((prev) =>
                  String((parseInt(prev) || 0) + n)
                )
              }
              className="flex-1 py-2 bg-card border border-border rounded-full text-sm text-foreground active:scale-95 transition-transform"
            >
              +{n}
            </button>
          ))}
        </div>

        <button
          onClick={apply}
          className="w-full py-3 bg-accent text-white rounded-lg font-heading active:scale-95 transition-transform"
        >
          Aplicar
        </button>
      </div>
    </Modal>
  );
}
