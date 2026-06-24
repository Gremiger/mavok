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
import { CONDITIONS } from "@/data/conditions";
import { formatModifier } from "@/lib/utils";

export function CombatTab() {
  const { character, updateCombat, updateResources, updateMeta } =
    useCharacterContext();
  const [hpModalOpen, setHpModalOpen] = useState(false);
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [tempHpInput, setTempHpInput] = useState(false);

  if (!character) return null;

  const { combat, resources, meta, attacks } = character;
  const rageActive = resources.rpiRages.active;
  const rageDamage = 2; // Level 1-8, will be dynamic via progression data

  function toggleRage() {
    if (rageActive) {
      updateResources({
        rpiRages: { ...resources.rpiRages, active: false },
      });
    } else if (resources.rpiRages.remaining > 0) {
      updateResources({
        rpiRages: {
          ...resources.rpiRages,
          active: true,
          remaining: resources.rpiRages.remaining - 1,
        },
      });
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

  function toggleInspiration() {
    updateMeta({ inspiration: !meta.inspiration });
  }

  const isDying = combat.currentHp === 0;

  return (
    <div className="p-4 space-y-3">
      {/* Top Bar */}
      <div
        className={`rounded-lg p-3 border transition-all ${
          rageActive
            ? "border-rage bg-rage/10 shadow-[0_0_12px_rgba(139,45,45,0.3)]"
            : "border-border bg-card"
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
            <StatBadge label="AC" value={combat.armorClass} />
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
            <StatBadge
              label="Rage"
              value={`${resources.rpiRages.remaining}/${resources.rpiRages.total}`}
              onClick={toggleRage}
              highlight={rageActive}
            />
          </div>
        )}

        {rageActive && (
          <div className="text-center mt-2">
            <span className="text-xs text-rage font-heading animate-pulse">
              ⚡ RAGE ACTIVO ⚡
            </span>
          </div>
        )}
      </div>

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
            onClick={toggleRage}
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
    </div>
  );
}
