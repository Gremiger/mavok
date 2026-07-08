"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Attack } from "@/lib/types";
import type { DiceRoll } from "@/lib/dice";
import { computeRageBonus, rollAttackHit, rollAttackDamage } from "@/lib/attackRoll";
import { exhaustionPenalty } from "@/lib/exhaustion";
import { formatModifier } from "@/lib/utils";
import { DiceResult } from "@/components/ui/DiceResult";
import { Sword, Target, Hammer } from "lucide-react";
import { useThemeContext } from "@/lib/context";

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
  exhaustionLevel,
  attackMagicBonus = 0,
  damageMagicBonus = 0,
  onToggleVersatile,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  attack: Attack;
  rageActive: boolean;
  rageDamage: number;
  recklessActive: boolean;
  exhaustionLevel: number;
  attackMagicBonus?: number;
  damageMagicBonus?: number;
  onToggleVersatile?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const { density, magicItemIndicator } = useThemeContext();
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

  const rageBonus = computeRageBonus(attack, rageActive, rageDamage);
  const effectiveAttackBonus = attack.attackBonus + exhaustionPenalty(exhaustionLevel);
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
    const result = rollAttackHit(attack, { recklessActive, exhaustionLevel });
    setLastRoll({ roll: result, type: "hit" });
  }

  function handleRollDamage() {
    const result = rollAttackDamage(attack, { rageActive, rageDamage });
    setLastRoll({ roll: result, type: "damage" });
  }

  const clearRoll = useCallback(() => setLastRoll(null), []);

  return (
    <div className="stone-card rounded-lg mb-2">
      <div
        className={`flex items-center justify-between cursor-pointer ${density === "compact" ? "p-2" : "p-3"}`}
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
            {formatModifier(effectiveAttackBonus)} · {displayDamage()} {attack.damageType.slice(0, 4).toLowerCase()}. · {attack.range}
            {magicItemIndicator === "explicit-tag" &&
              (attackMagicBonus !== 0 || damageMagicBonus !== 0) &&
              (attackMagicBonus === damageMagicBonus ? (
                <span className="text-accent ml-1">
                  ✦{formatModifier(attackMagicBonus)}
                </span>
              ) : (
                <span className="text-accent ml-1">
                  ✦atq{formatModifier(attackMagicBonus)}/dañ
                  {formatModifier(damageMagicBonus)}
                </span>
              ))}
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
          {(onEdit || onDelete || onMoveUp || onMoveDown) && (
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
                <div className="absolute right-0 top-6 bg-card border border-border rounded-lg shadow-lg z-10 py-1 w-36">
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
                  {onMoveUp && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onMoveUp();
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-background"
                    >
                      Mover arriba
                    </button>
                  )}
                  {onMoveDown && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onMoveDown();
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-background"
                    >
                      Mover abajo
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
            Propiedades:{" "}
            {attack.properties.map((prop, i) => (
              <span key={prop}>
                {i > 0 && ", "}
                {prop === "Versatile" && attack.versatileDamage ? (
                  <button
                    onClick={onToggleVersatile}
                    className="underline decoration-dotted text-accent"
                  >
                    {prop}
                  </button>
                ) : (
                  prop
                )}
              </span>
            ))}
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
