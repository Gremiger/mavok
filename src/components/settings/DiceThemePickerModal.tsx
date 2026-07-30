"use client";

import { Modal } from "@/components/ui/Modal";
import { CompactRow } from "@/components/ui/CompactRow";
import { DICE_THEMES, type DiceThemeId } from "@/data/dice-themes";

export function DiceThemePickerModal({
  open,
  onClose,
  diceTheme,
  setDiceTheme,
}: {
  open: boolean;
  onClose: () => void;
  diceTheme: DiceThemeId;
  setDiceTheme: (theme: DiceThemeId) => void;
}) {
  const normales = DICE_THEMES.filter((t) => t.category === "normal");
  const especiales = DICE_THEMES.filter((t) => t.category === "especial");
  const mistborn = DICE_THEMES.filter((t) => t.category === "mistborn");

  function renderRow(t: (typeof DICE_THEMES)[number]) {
    return (
      <CompactRow
        key={t.systemName}
        onClick={() => {
          setDiceTheme(t.systemName);
          onClose();
        }}
        name={
          <span className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full border border-border/60 shrink-0"
              style={{ backgroundColor: t.swatch }}
            />
            {t.label}
          </span>
        }
        right={
          diceTheme === t.systemName ? (
            <span className="w-5 h-5 rounded border-2 border-accent bg-accent text-white flex items-center justify-center text-xs">
              ✓
            </span>
          ) : (
            <span className="text-xs text-muted">Tap para cambiar</span>
          )
        }
      />
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Tema de dados">
      <div className="space-y-4">
        <div>
          <p className="text-xs text-muted uppercase tracking-wide mb-2">
            Normales
          </p>
          <div className="space-y-1">{normales.map(renderRow)}</div>
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wide mb-2">
            Especiales
          </p>
          <div className="space-y-1">{especiales.map(renderRow)}</div>
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wide mb-2">
            Mistborn
          </p>
          <div className="space-y-1">{mistborn.map(renderRow)}</div>
        </div>
      </div>
    </Modal>
  );
}
