"use client";

import { useRef, useState } from "react";
import { useLongPress } from "@/hooks/useLongPress";
import { motion } from "framer-motion";
import { useCharacterContext, useThemeContext } from "@/lib/context";
import { Tag } from "@/components/ui/Tag";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Modal } from "@/components/ui/Modal";
import { CombatVitals } from "@/components/combat/CombatVitals";
import { HpModal } from "@/components/combat/HpModal";
import { AttackRow } from "@/components/combat/AttackRow";
import { DiceRoller } from "@/components/combat/DiceRoller";
import { StandardActionsModal } from "@/components/combat/StandardActionsModal";
import { AttackFormModal } from "@/components/combat/AttackFormModal";
import { GrantedActionCard } from "@/components/combat/GrantedActionCard";
import { CONDITIONS } from "@/data/conditions";
import { CONDITION_GROUPS } from "@/data/condition-groups";
import { BARBARIAN_LEVELS } from "@/data/barbarian-progression";
import type { Attack, InventoryItem } from "@/lib/types";
import { formatModifier, getEquippedGrantedActions } from "@/lib/utils";
import { computeAttackMagicBonus, sumMagicBonus } from "@/lib/recalculate";
import { toggleVersatileDamage } from "@/lib/attackRoll";
import { toast } from "sonner";

function baseDice(damage: string): string {
  return damage.replace(/\s*[+-]\s*\d+\s*$/, "").trim();
}

export function CombatTab() {
  const {
    character,
    update,
    updateCombat,
    updateResources,
    updateMeta,
    addAttack,
    updateAttack,
    removeAttack,
    moveAttack,
    updateInventoryItem,
  } = useCharacterContext();
  const { magicItemIndicator } = useThemeContext();
  const [hpModalOpen, setHpModalOpen] = useState(false);
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [viewingCondition, setViewingCondition] = useState<string | null>(
    null
  );
  const [conditionFilter, setConditionFilter] = useState("");
  const [exhaustionExpanded, setExhaustionExpanded] = useState(false);
  const [tempHpInput, setTempHpInput] = useState(false);
  const [tempAcMod, setTempAcMod] = useState(0);
  const [acModalOpen, setAcModalOpen] = useState(false);
  const [standardActionsOpen, setStandardActionsOpen] = useState<"actions" | "bonus" | "reactions" | null>(null);
  const [stoneEnduranceEditing, setStoneEnduranceEditing] = useState(false);
  const [healerKitEditing, setHealerKitEditing] = useState(false);
  const [attackModalState, setAttackModalState] = useState<
    "add" | Attack | null
  >(null);
  const [ragePulseKey, setRagePulseKey] = useState(0);
  const [stoneEndurancePulseKey, setStoneEndurancePulseKey] = useState(0);
  const [healerKitPulseKey, setHealerKitPulseKey] = useState(0);
  const [attacksForceOpenKey, setAttacksForceOpenKey] = useState(0);
  const [dadosForceOpenKey, setDadosForceOpenKey] = useState(0);
  const attacksSectionRef = useRef<HTMLDivElement>(null);
  const dadosSectionRef = useRef<HTMLDivElement>(null);
  const stoneEnduranceLongPress = useLongPress(() =>
    setStoneEnduranceEditing(true)
  );
  const healerKitLongPress = useLongPress(() => setHealerKitEditing(true));

  if (!character) return null;

  const { combat, resources, meta, attacks } = character;
  const { stoneEndurance, healerKit } = resources;
  const rageActive = resources.rpiRages.active;
  const rageDamage =
    BARBARIAN_LEVELS.find((l) => l.level === meta.level)?.rageDamage ?? 2;
  const offhandAttack = attacks.find((a) => a.properties.includes("Light"));
  const hasRecklessAttack = character.features.some(
    (f) => f.name === "Reckless Attack"
  );

  const slots = resources.rpiRages.slots?.length === resources.rpiRages.total
    ? resources.rpiRages.slots
    : Array.from({ length: resources.rpiRages.total }, (_, i) => i < resources.rpiRages.remaining);

  function toggleRageSlot(index: number) {
    const newSlots = [...slots];
    newSlots[index] = !newSlots[index];
    const newRemaining = newSlots.filter(Boolean).length;
    updateResources({
      rpiRages: { ...resources.rpiRages, remaining: newRemaining, slots: newSlots },
    });
  }

  function spendHealerKit() {
    if (resources.healerKit.remaining <= 0) return;
    updateResources({
      healerKit: {
        ...resources.healerKit,
        remaining: resources.healerKit.remaining - 1,
      },
    });
    setHealerKitPulseKey((k) => k + 1);
  }

  function adjustGrantedActionCharges(item: InventoryItem, remaining: number) {
    const grantedAction = item.grantedAction;
    if (!grantedAction?.charges) return;
    updateInventoryItem(item.id, {
      grantedAction: {
        ...grantedAction,
        charges: { ...grantedAction.charges, remaining },
      },
    });
  }

  function spendStoneEndurance() {
    if (resources.stoneEndurance.remaining <= 0) return;
    updateResources({
      stoneEndurance: {
        ...resources.stoneEndurance,
        remaining: resources.stoneEndurance.remaining - 1,
      },
    });
    setStoneEndurancePulseKey((k) => k + 1);
  }

  function toggleRageActive() {
    const next = !rageActive;
    updateResources({
      rpiRages: { ...resources.rpiRages, active: next },
    });
    if (next) {
      toast("Rage activado", { icon: "🔥" });
      setRagePulseKey((k) => k + 1);
    } else {
      toast("Rage desactivado", { icon: "💨" });
    }
  }

  function addCondition(name: string) {
    if (!combat.conditions.includes(name)) {
      updateCombat({ conditions: [...combat.conditions, name] });
    }
    setConditionModalOpen(false);
  }

  function removeCondition(name: string) {
    updateCombat({
      conditions: combat.conditions.filter((c) => c !== name),
    });
  }

  function setExhaustionLevel(next: number) {
    updateCombat({ exhaustionLevel: Math.max(0, Math.min(6, next)) });
    if (next >= 6) {
      toast("Nivel de Exhaustion 6 — tu personaje muere", { icon: "💀" });
    }
  }

  function toggleInspiration() {
    updateMeta({ inspiration: !meta.inspiration });
  }

  const isDying = combat.currentHp === 0;
  const displayAc = combat.armorClass + tempAcMod;
  const magicAcBonus = sumMagicBonus(character, "ac");
  const speedReduction = 5 * combat.exhaustionLevel;
  const effectiveSpeed = Math.max(0, combat.speed - speedReduction);

  return (
    <div className="p-4 space-y-3">
      {/* Top Bar */}
      <CombatVitals
        isDying={isDying}
        currentHp={combat.currentHp}
        maxHp={combat.maxHp}
        tempHp={combat.tempHp}
        displayAc={displayAc}
        tempAcMod={tempAcMod}
        magicAcBonus={magicAcBonus}
        showExplicitMagicTag={magicItemIndicator === "explicit-tag"}
        initiative={combat.initiative}
        inspiration={meta.inspiration}
        effectiveSpeed={effectiveSpeed}
        speedReduction={speedReduction}
        rage={{
          slots,
          active: rageActive,
          onToggleSlot: toggleRageSlot,
          onToggleActive: toggleRageActive,
        }}
        deathSaves={combat.deathSaves}
        onOpenHp={() => setHpModalOpen(true)}
        onOpenTempHp={() => setTempHpInput(true)}
        onOpenAc={() => setAcModalOpen(true)}
        onToggleInspiration={toggleInspiration}
        onDeathSavesChange={(s, f) => updateCombat({ deathSaves: { successes: s, failures: f } })}
        onRegainConsciousness={() =>
          updateCombat({ currentHp: 1, deathSaves: { successes: 0, failures: 0 } })
        }
      />

      {attacks.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setAttacksForceOpenKey((k) => k + 1);
              attacksSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="stone-card rounded-lg py-2 text-center text-xs font-heading text-accent active:scale-95 transition-transform"
          >
            ⚔ Atacar
          </button>
          <button
            onClick={() => {
              setDadosForceOpenKey((k) => k + 1);
              dadosSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="stone-card rounded-lg py-2 text-center text-xs font-heading text-accent active:scale-95 transition-transform"
          >
            🎲 Roll rápido
          </button>
        </div>
      )}

      <div className="crack-divider" />

      {/* Conditions */}
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {combat.conditions.map((c) => (
            <Tag
              key={c}
              label={c}
              onClick={() =>
                setViewingCondition(viewingCondition === c ? null : c)
              }
              onRemove={() => {
                removeCondition(c);
                toast(`${c} eliminada`, {
                  action: {
                    label: "Deshacer",
                    onClick: () => addCondition(c),
                  },
                });
              }}
            />
          ))}
          <button
            onClick={() => setConditionModalOpen(true)}
            className="w-6 h-6 rounded-full border border-border text-muted text-sm flex items-center justify-center hover:border-accent hover:text-accent"
          >
            +
          </button>
        </div>
        {viewingCondition && combat.conditions.includes(viewingCondition) && (
          <div className="text-xs text-foreground/80 leading-relaxed bg-card/50 border border-border rounded-lg p-2">
            <span className="font-heading text-accent">
              {viewingCondition}:
            </span>{" "}
            {CONDITIONS.find((c) => c.name === viewingCondition)?.description}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between stone-card rounded-lg p-2">
        <button
          onClick={() => setExhaustionExpanded((e) => !e)}
          className="text-sm font-heading text-accent"
        >
          Exhaustion: {combat.exhaustionLevel}/6
        </button>
        <div className="flex gap-1.5">
          <button
            onClick={() => setExhaustionLevel(combat.exhaustionLevel - 1)}
            className="w-7 h-7 rounded-full border border-border text-muted flex items-center justify-center hover:border-accent hover:text-accent"
          >
            −
          </button>
          <button
            onClick={() => setExhaustionLevel(combat.exhaustionLevel + 1)}
            className="w-7 h-7 rounded-full border border-border text-muted flex items-center justify-center hover:border-accent hover:text-accent"
          >
            +
          </button>
        </div>
      </div>
      {exhaustionExpanded && (
        <div className="text-xs text-foreground/80 leading-relaxed bg-card/50 border border-border rounded-lg p-2">
          {CONDITIONS.find((c) => c.name === "Exhaustion")?.description}
        </div>
      )}

      {/* Actions */}
      <div ref={attacksSectionRef}>
      <CollapsibleSection title="Acciones" defaultOpen forceOpenKey={attacksForceOpenKey}>
        {attacks.map((a, i) => (
          <AttackRow
            key={a.id}
            attack={a}
            rageActive={rageActive}
            rageDamage={rageDamage}
            recklessActive={combat.recklessActive}
            exhaustionLevel={combat.exhaustionLevel}
            attackMagicBonus={computeAttackMagicBonus(character, a, "attack")}
            damageMagicBonus={computeAttackMagicBonus(character, a, "damage")}
            onToggleVersatile={() =>
              updateAttack(a.id, toggleVersatileDamage(a))
            }
            onEdit={() => setAttackModalState(a)}
            onDelete={() => {
              const index = attacks.findIndex((x) => x.id === a.id);
              removeAttack(a.id);
              toast(`${a.name} eliminado`, {
                action: {
                  label: "Deshacer",
                  onClick: () =>
                    update((c) => {
                      const next = [...c.attacks];
                      next.splice(index, 0, a);
                      return { ...c, attacks: next };
                    }),
                },
              });
            }}
            onMoveUp={i > 0 ? () => moveAttack(a.id, "up") : undefined}
            onMoveDown={
              i < attacks.length - 1 ? () => moveAttack(a.id, "down") : undefined
            }
          />
        ))}
        <button
          onClick={() => setAttackModalState("add")}
          className="w-full mt-2 p-2 rounded-lg border border-border/50 bg-card/50 text-left"
        >
          <span className="font-heading text-muted text-xs">
            + Agregar ataque
          </span>
        </button>
        <motion.div
          key={healerKitPulseKey}
          initial={{ scale: 1.03 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.25 }}
          className={`p-3 rounded-lg border mt-2 ${
            healerKit.remaining > 0
              ? "border-border bg-card"
              : "border-border bg-card opacity-50"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-heading text-accent">Healer&apos;s Kit</span>
            {healerKitEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateResources({
                      healerKit: {
                        ...healerKit,
                        remaining: Math.max(0, healerKit.remaining - 1),
                      },
                    })
                  }
                  disabled={healerKit.remaining <= 0}
                  className="w-6 h-6 rounded bg-background border border-border text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="text-xs text-muted font-heading w-6 text-center">
                  {healerKit.remaining}
                </span>
                <button
                  onClick={() =>
                    updateResources({
                      healerKit: {
                        ...healerKit,
                        remaining: Math.min(
                          healerKit.total,
                          healerKit.remaining + 1
                        ),
                      },
                    })
                  }
                  disabled={healerKit.remaining >= healerKit.total}
                  className="w-6 h-6 rounded bg-background border border-border text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
                <button
                  onClick={() => setHealerKitEditing(false)}
                  className="text-xs px-2 py-0.5 border border-accent text-accent rounded"
                >
                  ✓
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted font-heading">
                  {healerKit.remaining}/{healerKit.total}
                </span>
                <button
                  {...healerKitLongPress.handlers}
                  onClick={() => {
                    if (healerKitLongPress.wasLongPress()) return;
                    spendHealerKit();
                  }}
                  className={`text-xs px-2 py-0.5 border rounded transition-colors select-none [-webkit-touch-callout:none] ${
                    healerKit.remaining <= 0
                      ? "border-border text-muted opacity-40 cursor-not-allowed"
                      : "border-border hover:border-accent hover:text-accent"
                  }`}
                >
                  Usar
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-muted">
            Acción · estabiliza o cura 1d6+4 HP a una criatura · usos no se recuperan con descansos
          </p>
        </motion.div>
        {getEquippedGrantedActions(character, "action").map((item) => (
          <div key={item.id} className="mt-2">
            <GrantedActionCard
              itemName={item.name}
              grantedAction={item.grantedAction!}
              onUse={() =>
                adjustGrantedActionCharges(
                  item,
                  Math.max(0, item.grantedAction!.charges!.remaining - 1)
                )
              }
              onAdjust={(remaining) => adjustGrantedActionCharges(item, remaining)}
            />
          </div>
        ))}
        <button
          onClick={() => setStandardActionsOpen("actions")}
          className="w-full mt-2 p-2 rounded-lg border border-border/50 bg-card/50 text-left"
        >
          <span className="font-heading text-muted text-xs">Acciones estándar</span>
          <p className="text-muted/60 text-[0.6rem] mt-0.5 leading-relaxed">
            Attack (Grapple · Shove) · Dash · Disengage · Dodge · Help · Hide · Influence · Ready · Search · Study · Utilize
          </p>
        </button>
      </CollapsibleSection>
      </div>

      {/* Bonus Actions */}
      <CollapsibleSection title="Acciones adicionales">
        <div className="space-y-2 text-sm">
          <motion.button
            key={ragePulseKey}
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.25 }}
            onClick={toggleRageActive}
            className={`w-full p-3 rounded-lg border text-left ${
              rageActive
                ? "border-rage bg-rage/10 text-rage"
                : resources.rpiRages.remaining > 0
                  ? "border-border bg-card text-foreground"
                  : "border-border bg-card text-muted opacity-50"
            }`}
          >
            <span className="font-heading text-accent">Rage</span>
            <span className="text-muted ml-2">
              {rageActive
                ? "(activo — tap para desactivar)"
                : `(${resources.rpiRages.remaining} usos restantes)`}
            </span>
            {rageActive && (
              <p className="text-muted/60 text-[0.6rem] mt-0.5">
                Termina si no atacas a un enemigo ni recibes daño desde tu último turno (o si quedas inconsciente).
              </p>
            )}
          </motion.button>
          {hasRecklessAttack && (
            <button
              onClick={() =>
                updateCombat({ recklessActive: !combat.recklessActive })
              }
              className={`w-full p-3 rounded-lg border text-left ${
                combat.recklessActive
                  ? "border-danger bg-danger/10 text-danger"
                  : "border-border bg-card text-foreground"
              }`}
            >
              <span className="font-heading text-accent">
                Reckless Attack
              </span>
              <span className="text-muted ml-2">
                {combat.recklessActive
                  ? "(activo — tap para desactivar)"
                  : "(tap para activar)"}
              </span>
              <p className="text-muted/60 text-[0.6rem] mt-0.5">
                Atacantes contra ti tienen ventaja hasta tu próximo turno.
              </p>
            </button>
          )}
          {offhandAttack && (
            <div className="p-3 rounded-lg border border-border bg-card">
              <span className="font-heading text-accent text-sm">
                Offhand Attack
              </span>
              <span className="text-muted text-xs ml-2">
                {offhandAttack.name} · {baseDice(offhandAttack.damage)}{" "}
                {offhandAttack.damageType} (sin mod de característica)
              </span>
            </div>
          )}
          {getEquippedGrantedActions(character, "bonus").map((item) => (
            <GrantedActionCard
              key={item.id}
              itemName={item.name}
              grantedAction={item.grantedAction!}
              onUse={() =>
                adjustGrantedActionCharges(
                  item,
                  Math.max(0, item.grantedAction!.charges!.remaining - 1)
                )
              }
              onAdjust={(remaining) => adjustGrantedActionCharges(item, remaining)}
            />
          ))}
          <button
            onClick={() => setStandardActionsOpen("bonus")}
            className="w-full mt-1 p-2 rounded-lg border border-border/50 bg-card/50 text-left"
          >
            <span className="font-heading text-muted text-xs">Bonus Actions estándar</span>
            <span className="text-muted/60 text-[0.6rem] ml-2">Two-Weapon Fighting</span>
          </button>
        </div>
      </CollapsibleSection>

      {/* Reactions */}
      <CollapsibleSection title="Reacciones">
        <div className="space-y-2 text-sm">
          {/* Stone's Endurance */}
          <motion.div
            key={stoneEndurancePulseKey}
            initial={{ scale: 1.03 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.25 }}
            className={`p-3 rounded-lg border ${
              stoneEndurance.remaining > 0
                ? "border-border bg-card"
                : "border-border bg-card opacity-50"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-heading text-accent">Stone&apos;s Endurance</span>
              {stoneEnduranceEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateResources({
                        stoneEndurance: {
                          ...stoneEndurance,
                          remaining: Math.max(0, stoneEndurance.remaining - 1),
                        },
                      })
                    }
                    disabled={stoneEndurance.remaining <= 0}
                    className="w-6 h-6 rounded bg-background border border-border text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-xs text-muted font-heading w-6 text-center">
                    {stoneEndurance.remaining}
                  </span>
                  <button
                    onClick={() =>
                      updateResources({
                        stoneEndurance: {
                          ...stoneEndurance,
                          remaining: Math.min(
                            stoneEndurance.total,
                            stoneEndurance.remaining + 1
                          ),
                        },
                      })
                    }
                    disabled={stoneEndurance.remaining >= stoneEndurance.total}
                    className="w-6 h-6 rounded bg-background border border-border text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setStoneEnduranceEditing(false)}
                    className="text-xs px-2 py-0.5 border border-accent text-accent rounded"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted font-heading">
                    {stoneEndurance.remaining}/{stoneEndurance.total}
                  </span>
                  <button
                    {...stoneEnduranceLongPress.handlers}
                    onClick={() => {
                      if (stoneEnduranceLongPress.wasLongPress()) return;
                      spendStoneEndurance();
                    }}
                    className={`text-xs px-2 py-0.5 border rounded transition-colors select-none [-webkit-touch-callout:none] ${
                      stoneEndurance.remaining <= 0
                        ? "border-border text-muted opacity-40 cursor-not-allowed"
                        : "border-border hover:border-accent hover:text-accent"
                    }`}
                  >
                    Usar
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted">
              Reacción · tira 1d12 + CON mod · reduce el daño entrante por ese total
            </p>
          </motion.div>

          {/* Opportunity Attack */}
          <div className="p-3 rounded-lg border border-border bg-card">
            <span className="font-heading text-accent">Opportunity Attack</span>
            <span className="text-muted text-xs ml-2">
              Mismas armas que Acciones
            </span>
          </div>

          {getEquippedGrantedActions(character, "reaction").map((item) => (
            <GrantedActionCard
              key={item.id}
              itemName={item.name}
              grantedAction={item.grantedAction!}
              onUse={() =>
                adjustGrantedActionCharges(
                  item,
                  Math.max(0, item.grantedAction!.charges!.remaining - 1)
                )
              }
              onAdjust={(remaining) => adjustGrantedActionCharges(item, remaining)}
            />
          ))}

          {/* Standard reactions compact card */}
          <button
            onClick={() => setStandardActionsOpen("reactions")}
            className="w-full p-2 rounded-lg border border-border/50 bg-card/50 text-left"
          >
            <span className="font-heading text-muted text-xs">Reacciones estándar</span>
            <span className="text-muted/60 text-[0.6rem] ml-2">Opportunity Attack</span>
          </button>
        </div>
      </CollapsibleSection>

      {/* Dice Roller */}
      <div ref={dadosSectionRef}>
      <CollapsibleSection title="Dados" forceOpenKey={dadosForceOpenKey}>
        <DiceRoller />
      </CollapsibleSection>
      </div>

      {/* HP Modal */}
      <HpModal
        open={hpModalOpen}
        onClose={() => setHpModalOpen(false)}
        currentHp={combat.currentHp}
        maxHp={combat.maxHp}
        tempHp={combat.tempHp}
        onApply={(hp, temp) =>
          updateCombat({ currentHp: hp, tempHp: temp })
        }
      />

      {/* Condition Selection Modal */}
      <Modal
        open={conditionModalOpen}
        onClose={() => {
          setConditionModalOpen(false);
          setConditionFilter("");
        }}
        title="Agregar condición"
      >
        <input
          type="text"
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          placeholder="Buscar condición..."
          className="w-full bg-background border border-border rounded-lg p-2 mb-3 text-sm text-foreground"
          autoFocus
        />
        <div className="space-y-4">
          {CONDITION_GROUPS.map((group) => {
            const matches = group.conditions.filter((name) =>
              name.toLowerCase().includes(conditionFilter.trim().toLowerCase())
            );
            if (matches.length === 0) return null;
            return (
              <div key={group.name}>
                <p className="text-xs font-heading text-muted uppercase tracking-wide mb-1.5">
                  {group.name}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {matches.map((name) => {
                    const c = CONDITIONS.find((cond) => cond.name === name);
                    if (!c) return null;
                    return (
                      <button
                        key={c.name}
                        onClick={() => addCondition(c.name)}
                        disabled={combat.conditions.includes(c.name)}
                        className={`p-2 rounded-lg border text-left text-sm ${
                          combat.conditions.includes(c.name)
                            ? "border-border bg-card/50 text-muted opacity-50"
                            : "border-border bg-card text-foreground hover:border-accent"
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Temp HP Input Modal */}
      <Modal
        open={tempHpInput}
        onClose={() => setTempHpInput(false)}
        title="Temp HP"
      >
        <div className="space-y-3">
          <input
            type="number"
            inputMode="numeric"
            defaultValue={combat.tempHp}
            className="w-full bg-background border border-border rounded-lg p-3 text-center text-2xl font-heading text-foreground"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = parseInt((e.target as HTMLInputElement).value);
                if (!isNaN(val) && val >= 0) {
                  updateCombat({ tempHp: val });
                  setTempHpInput(false);
                }
              }
            }}
          />
          <p className="text-xs text-muted text-center">
            Los Temp HP no se acumulan — se usa el valor más alto
          </p>
        </div>
      </Modal>

      {/* AC Temp Modifier Modal */}
      <Modal
        open={acModalOpen}
        onClose={() => setAcModalOpen(false)}
        title="Modificador temporal de AC"
      >
        <div className="space-y-3">
          <p className="text-xs text-muted text-center">
            AC base: {combat.armorClass} · Temporal: {formatModifier(tempAcMod)} · Total: {displayAc}
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setTempAcMod((p) => p - 1)}
              className="w-12 h-12 rounded-lg bg-card border border-border text-xl font-heading text-foreground active:scale-95 transition-transform"
            >
              -
            </button>
            <span className="font-heading text-3xl text-accent w-16 text-center">
              {formatModifier(tempAcMod)}
            </span>
            <button
              onClick={() => setTempAcMod((p) => p + 1)}
              className="w-12 h-12 rounded-lg bg-card border border-border text-xl font-heading text-foreground active:scale-95 transition-transform"
            >
              +
            </button>
          </div>
          <button
            onClick={() => {
              setTempAcMod(0);
              setAcModalOpen(false);
            }}
            className="w-full py-2 text-sm text-muted border border-border rounded-lg"
          >
            Resetear a 0
          </button>
        </div>
      </Modal>

      <StandardActionsModal
        open={standardActionsOpen !== null}
        onClose={() => setStandardActionsOpen(null)}
        filter={standardActionsOpen ?? "actions"}
      />

      <AttackFormModal
        open={attackModalState !== null}
        onClose={() => setAttackModalState(null)}
        onSave={(attack) => {
          if (attackModalState && attackModalState !== "add") {
            updateAttack(attack.id, attack);
          } else {
            addAttack(attack);
          }
        }}
        existingAttack={
          attackModalState && attackModalState !== "add"
            ? attackModalState
            : undefined
        }
      />
    </div>
  );
}
