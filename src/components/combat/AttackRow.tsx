"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Attack } from "@/lib/types";
import { rollD20, rollD20WithAdvantage, rollDice, type DiceRoll } from "@/lib/dice";
import { DiceResult } from "@/components/ui/DiceResult";
import { Sword, Target, Hammer } from "lucide-react";

const DAMAGE_TYPE_ICONS: Record<string, typeof Sword> = {
  Slashing: Sword,
  Piercing: Target,
  Bludgeoning: Hammer,
};

export function AttackRow({
  attack,
  rageActive,
  rageDamage,
  recklessActive,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  attack: Attack;
  rageActive: boolean;
  rageDamage: number;
  recklessActive: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [lastRoll, setLastRoll] = useState<{ roll: DiceRoll; type: "hit" | "damage" } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleClickOutside);
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside);
  }, [menuOpen]);

  const isStrBased = !attack.properties.includes("Finesse");
  const rageBonus = rageActive && isStrBased ? rageDamage : 0;
  const DamageIcon = DAMAGE_TYPE_ICONS[attack.damageType];

  function displayDamage() {
    if (rageBonus > 0) {
      const match = attack.damage.match(/^(.+?)([+-]\d+)$/);
      if (match) {
        const base = parseInt(match[2]) + rageBonus;
        return `${match[1]}${base >= 0 ? "+" : ""}${base}`;
      }
      return `${attack.damage}+${rageBonus}`;
    }
    return attack.damage;
  }

  function handleRollHit() {
    const result =
      recklessActive && isStrBased
        ? rollD20WithAdvantage(attack.attackBonus)
        : rollD20(attack.attackBonus);
    setLastRoll({ roll: result, type: "hit" });
  }

  function handleRollDamage() {
    const dmgExpr = attack.damage.replace(/\s/g, "");
    let expr = dmgExpr;
    if (rageBonus > 0) {
      const match = expr.match(/^(.+?)([+-]\d+)$/);
      if (match) {
        const newMod = parseInt(match[2]) + rageBonus;
        expr = `${match[1]}${newMod >= 0 ? "+" : ""}${newMod}`;
      } else {
        expr = `${expr}+${rageBonus}`;
      }
    }
    const result = rollDice(expr);
    setLastRoll({ roll: result, type: "damage" });
  }

  const clearRoll = useCallback(() => setLastRoll(null), []);

  return (
    <div className="stone-card rounded-lg overflow-hidden mb-2">
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-heading text-sm text-accent truncate">
              {attack.name}
            </span>
            {attack.mastery && (
              <span className="text-[0.6rem] px-1.5 py-0.5 bg-accent/20 text-accent rounded">
                {attack.mastery}
              </span>
            )}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {DamageIcon && (
              <DamageIcon size={11} className="inline-block mb-0.5 mr-1" />
            )}
            +{attack.attackBonus} · {displayDamage()} {attack.damageType.slice(0, 4).toLowerCase()}. · {attack.range}
          </div>
        </div>
        <div className="flex gap-1.5 ml-2 items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRollHit();
            }}
            className="px-2.5 py-1.5 bg-accent/20 text-accent rounded text-xs font-heading active:scale-95 transition-transform"
          >
            Hit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRollDamage();
            }}
            className="px-2.5 py-1.5 bg-danger/20 text-danger rounded text-xs font-heading active:scale-95 transition-transform"
          >
            Dmg
          </button>
          {(onMoveUp || onMoveDown) && (
            <div className="flex flex-col gap-0.5">
              {onMoveUp && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp();
                  }}
                  className="text-muted hover:text-accent text-xs leading-none px-1"
                >
                  ▲
                </button>
              )}
              {onMoveDown && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown();
                  }}
                  className="text-muted hover:text-accent text-xs leading-none px-1"
                >
                  ▼
                </button>
              )}
            </div>
          )}
          {(onEdit || onDelete) && (
            <div
              className="relative"
              ref={menuOpen ? menuRef : undefined}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((m) => !m);
                }}
                className="text-muted hover:text-foreground text-sm px-1"
              >
                ⋯
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-6 bg-card border border-border rounded-lg shadow-lg z-10 py-1 w-32">
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit();
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-background"
                    >
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-danger hover:bg-background"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {lastRoll && (
        <div className="px-3 py-1 border-t border-border">
          <DiceResult
            roll={lastRoll.roll}
            label={lastRoll.type === "hit" ? "Hit" : "Dmg"}
            onClear={clearRoll}
          />
        </div>
      )}

      {expanded && (
        <div className="px-3 py-2 border-t border-border text-xs space-y-1">
          <div className="text-muted">
            Propiedades: {attack.properties.join(", ")}
          </div>
          {attack.mastery && attack.masteryEffect && (
            <div>
              <span className="text-accent font-heading">
                {attack.mastery}
                {attack.masterySaveDC && ` (DC ${attack.masterySaveDC})`}:
              </span>{" "}
              <span className="text-foreground/80">
                {attack.masteryEffect}
              </span>
            </div>
          )}
          {rageActive && rageBonus > 0 && (
            <div className="text-danger">
              Rage: +{rageDamage} daño incluido
            </div>
          )}
        </div>
      )}
    </div>
  );
}
