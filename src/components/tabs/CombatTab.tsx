"use client";

import { useState } from "react";
import { useLongPress } from "@/hooks/useLongPress";
import { useCharacterContext } from "@/lib/context";
import { StatBadge } from "@/components/ui/StatBadge";
import { Tag } from "@/components/ui/Tag";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Modal } from "@/components/ui/Modal";
import { HpModal } from "@/components/combat/HpModal";
import { DeathSaves } from "@/components/combat/DeathSaves";
import { AttackRow } from "@/components/combat/AttackRow";
import { DiceRoller } from "@/components/combat/DiceRoller";
import { RageTracker } from "@/components/combat/RageTracker";
import { StandardActionsModal } from "@/components/combat/StandardActionsModal";
import { CONDITIONS } from "@/data/conditions";
import { BARBARIAN_LEVELS } from "@/data/barbarian-progression";
import { formatModifier } from "@/lib/utils";
import { toast } from "sonner";

function baseDice(damage: string): string {
  return damage.replace(/\s*[+-]\s*\d+\s*$/, "").trim();
}

export function CombatTab() {
  const { character, updateCombat, updateResources, updateMeta } =
    useCharacterContext();
  const [hpModalOpen, setHpModalOpen] = useState(false);
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [tempHpInput, setTempHpInput] = useState(false);
  const [tempAcMod, setTempAcMod] = useState(0);
  const [acModalOpen, setAcModalOpen] = useState(false);
  const [standardActionsOpen, setStandardActionsOpen] = useState<"actions" | "bonus" | "reactions" | null>(null);
  const [stoneEnduranceEditing, setStoneEnduranceEditing] = useState(false);
  const [healerKitEditing, setHealerKitEditing] = useState(false);
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
  }

  function spendStoneEndurance() {
    if (resources.stoneEndurance.remaining <= 0) return;
    updateResources({
      stoneEndurance: {
        ...resources.stoneEndurance,
        remaining: resources.stoneEndurance.remaining - 1,
      },
    });
  }

  function toggleRageActive() {
    const next = !rageActive;
    updateResources({
      rpiRages: { ...resources.rpiRages, active: next },
    });
    if (next) toast("Rage activado", { icon: "🔥" });
    else toast("Rage desactivado", { icon: "💨" });
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

  function toggleInspiration() {
    updateMeta({ inspiration: !meta.inspiration });
  }

  const isDying = combat.currentHp === 0;
  const displayAc = combat.armorClass + tempAcMod;

  return (
    <div className="p-4 space-y-3">
      {/* Top Bar */}
      <div
        className={`stone-card rounded-lg p-3 transition-all ${
          rageActive
            ? "!border-cord/50 shadow-[0_0_16px_rgba(166,61,47,0.3)]"
            : ""
        }`}
      >
        {isDying ? (
          <DeathSaves
            successes={combat.deathSaves.successes}
            failures={combat.deathSaves.failures}
            onChange={(s, f) =>
              updateCombat({ deathSaves: { successes: s, failures: f } })
            }
          />
        ) : (
          <div className="flex items-center justify-around flex-wrap gap-2">
            <StatBadge
              label="HP"
              value={`${combat.currentHp}/${combat.maxHp}`}
              onClick={() => setHpModalOpen(true)}
              highlight={combat.currentHp < combat.maxHp}
            />
            <StatBadge
              label="Temp"
              value={`+${combat.tempHp}`}
              onClick={() => setTempHpInput(true)}
              highlight={combat.tempHp > 0}
            />
            <StatBadge
              label="AC"
              value={tempAcMod !== 0 ? `${displayAc} (${formatModifier(tempAcMod)})` : displayAc}
              onClick={() => setAcModalOpen(true)}
              highlight={tempAcMod !== 0}
            />
            <StatBadge
              label="Init"
              value={formatModifier(combat.initiative)}
            />
            <StatBadge
              label="Insp"
              value={meta.inspiration ? "★" : "☆"}
              onClick={toggleInspiration}
              highlight={meta.inspiration}
            />
          </div>
        )}

        {/* Rage */}
        <RageTracker
          slots={slots}
          active={rageActive}
          onToggleSlot={toggleRageSlot}
          onToggleActive={toggleRageActive}
        />
      </div>

      <div className="crack-divider" />

      {/* Conditions */}
      <div className="flex flex-wrap items-center gap-1.5">
        {combat.conditions.map((c) => (
          <Tag key={c} label={c} onRemove={() => removeCondition(c)} />
        ))}
        <button
          onClick={() => setConditionModalOpen(true)}
          className="w-6 h-6 rounded-full border border-border text-muted text-sm flex items-center justify-center hover:border-accent hover:text-accent"
        >
          +
        </button>
      </div>

      {/* Actions */}
      <CollapsibleSection title="Acciones" defaultOpen>
        {attacks.map((a) => (
          <AttackRow
            key={a.id}
            attack={a}
            rageActive={rageActive}
            rageDamage={rageDamage}
          />
        ))}
        <div
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
        </div>
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

      {/* Bonus Actions */}
      <CollapsibleSection title="Acciones adicionales">
        <div className="space-y-2 text-sm">
          <button
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
          </button>
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
          <div
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
          </div>

          {/* Opportunity Attack */}
          <div className="p-3 rounded-lg border border-border bg-card">
            <span className="font-heading text-accent">Opportunity Attack</span>
            <span className="text-muted text-xs ml-2">
              Mismas armas que Acciones
            </span>
          </div>

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
      <CollapsibleSection title="Dados">
        <DiceRoller />
      </CollapsibleSection>

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
        onClose={() => setConditionModalOpen(false)}
        title="Agregar condición"
      >
        <div className="grid grid-cols-2 gap-2">
          {CONDITIONS.map((c) => (
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
          ))}
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
    </div>
  );
}
