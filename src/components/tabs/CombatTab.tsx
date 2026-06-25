"use client";

import { useState } from "react";
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
import { CONDITIONS } from "@/data/conditions";
import { formatModifier } from "@/lib/utils";
import { toast } from "sonner";

export function CombatTab() {
  const { character, updateCombat, updateResources, updateMeta } =
    useCharacterContext();
  const [hpModalOpen, setHpModalOpen] = useState(false);
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [tempHpInput, setTempHpInput] = useState(false);
  const [tempAcMod, setTempAcMod] = useState(0);
  const [acModalOpen, setAcModalOpen] = useState(false);

  if (!character) return null;

  const { combat, resources, meta, attacks } = character;
  const rageActive = resources.rpiRages.active;
  const rageDamage = 2;

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
          <div className="p-3 rounded-lg border border-border bg-card">
            <span className="font-heading text-accent text-sm">
              Offhand Attack
            </span>
            <span className="text-muted text-xs ml-2">
              Handaxe · 1d6 slashing (sin mod STR)
            </span>
          </div>
        </div>
      </CollapsibleSection>

      {/* Reactions */}
      <CollapsibleSection title="Reacciones">
        <div className="p-3 rounded-lg border border-border bg-card text-sm">
          <span className="font-heading text-accent">Opportunity Attack</span>
          <span className="text-muted text-xs ml-2">
            Mismas armas que Acciones
          </span>
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
    </div>
  );
}
