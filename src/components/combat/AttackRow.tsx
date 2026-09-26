"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Attack } from "@/lib/types";
import type { DiceRoll } from "@/lib/dice";
import { computeRageBonus, rollAttackHit, rollAttackDamage } from "@/lib/attackRoll";
import { exhaustionPenalty } from "@/lib/exhaustion";
import { formatModifier } from "@/lib/utils";
import { linkifyConditions } from "@/lib/linkifyConditions";
import { CONDITIONS } from "@/data/conditions";
import { DiceResult } from "@/components/ui/DiceResult";
import { Markdown } from "@/components/ui/Markdown";
import { Sword, Target, Hammer, MoreHorizontal } from "lucide-react";
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
  const { density, magicItemIndicator, diceRollMode } = useThemeContext();
  const [expanded, setExpanded] = useState(false);
  const [viewingMasteryCondition, setViewingMasteryCondition] = useState<
    string | null
  >(null);
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

  async function handleRollHit() {
    const result = await rollAttackHit(
      attack,
      { recklessActive, exhaustionLevel },
      diceRollMode
    );
    setLastRoll({ roll: result, type: "hit" });
  }

  async function handleRollDamage() {
    const result = await rollAttackDamage(
      attack,
      { rageActive, rageDamage },
      diceRollMode
    );
    setLastRoll({ roll: result, type: "damage" });
  }

  const clearRoll = useCallback(() => setLastRoll(null), []);

  return (
    <div className="stone-card rounded-lg mb-2">
      <div
        className={`flex items-center justify-between cursor-pointer ${density === "compact" ? "min-h-[40px] p-2" : "min-h-[44px] p-3"}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-heading text-[1.1875rem] leading-tight text-foreground truncate">
              {attack.name}
            </span>
            {attack.mastery && <span className="ink-stamp">{attack.mastery}</span>}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {DamageIcon && (
              <DamageIcon size={12} strokeWidth={1.5} className="inline-block mb-0.5 mr-1" />
            )}
            <span className="font-numeric">{formatModifier(effectiveAttackBonus)}</span> ·{" "}
            <span className="font-numeric">{displayDamage()}</span>{" "}
            {attack.damageType.slice(0, 4).toLowerCase()}. · {attack.range}
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
            className="btn-primary min-h-9 px-3 rounded-lg font-heading text-[0.95rem] active:scale-95 transition-transform duration-150"
          >
            Hit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRollDamage();
            }}
            className="btn-seal min-h-9 px-3 rounded-lg font-heading text-[0.95rem] active:scale-95 transition-transform duration-150"
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
                aria-label="Más opciones"
                className="text-muted hover:text-foreground w-8 h-9 flex items-center justify-center"
              >
                <MoreHorizontal size={18} strokeWidth={1.5} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 bg-card border border-border rounded-lg shadow-lg z-10 py-1 w-36">
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit();
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-background"
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
                      className="w-full text-left px-3 py-2 text-sm hover:bg-background"
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
                      className="w-full text-left px-3 py-2 text-sm hover:bg-background"
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
                      className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-background"
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
                {attack.masterySaveDC && <> (DC <span className="font-numeric">{attack.masterySaveDC}</span>)</>}:
              </span>{" "}
              <span className="text-foreground/80">
                {linkifyConditions(attack.masteryEffect, (name) =>
                  setViewingMasteryCondition((prev) =>
                    prev === name ? null : name
                  )
                )}
              </span>
              {viewingMasteryCondition && (
                <div className="text-foreground/70 mt-1 pl-2 border-l border-border">
                  <span className="text-accent font-heading">
                    {viewingMasteryCondition}:
                  </span>
                  <Markdown>
                    {CONDITIONS.find(
                      (c) => c.name === viewingMasteryCondition
                    )?.description ?? ""}
                  </Markdown>
                </div>
              )}
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
