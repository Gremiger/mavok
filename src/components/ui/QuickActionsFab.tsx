"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Flame,
  Dices,
  HeartPulse,
  Heart,
  Shield,
  Sword,
  Swords,
  BookOpenCheck,
  Zap,
  X,
} from "lucide-react";
import { useCharacterContext } from "@/lib/context";
import { useLongPress } from "@/hooks/useLongPress";
import { Modal } from "@/components/ui/Modal";
import { HpModal } from "@/components/combat/HpModal";
import { QuickActionsPicker } from "@/components/ui/QuickActionsPicker";
import { pinnedActionKey, pinnedActionLabel } from "@/lib/quickActions";
import { rollAttackHit, rollAttackDamage } from "@/lib/attackRoll";
import { spendHitDie } from "@/lib/hitDice";
import { abilityModifier } from "@/lib/utils";
import { BARBARIAN_LEVELS } from "@/data/barbarian-progression";
import type { PinnedAction } from "@/lib/types";

function iconFor(action: PinnedAction) {
  switch (action.type) {
    case "rage":
      return Flame;
    case "hitDice":
      return Dices;
    case "hpAdjust":
      return HeartPulse;
    case "resource":
      return action.resource === "healerKit" ? Heart : Shield;
    case "attackRoll":
      return Sword;
    case "attackDamage":
      return Swords;
    case "attackDefinition":
      return BookOpenCheck;
  }
}

export function QuickActionsFab({ activeTab }: { activeTab: string }) {
  const { character, updateCombat, updateResources, updateQuickActions } =
    useCharacterContext();
  const [expanded, setExpanded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hpModalOpen, setHpModalOpen] = useState(false);
  const [definitionAction, setDefinitionAction] = useState<PinnedAction | null>(
    null
  );
  const [prevActiveTab, setPrevActiveTab] = useState(activeTab);
  const longPress = useLongPress(() => setPickerOpen(true));

  if (activeTab !== prevActiveTab) {
    setPrevActiveTab(activeTab);
    setExpanded(false);
  }

  if (!character) return null;

  const { combat, resources, meta, attacks, quickActions } = character;
  const rageActive = resources.rpiRages.active;
  const rageDamage =
    BARBARIAN_LEVELS.find((l) => l.level === meta.level)?.rageDamage ?? 2;
  const conMod = abilityModifier(character.attributes.con);

  function execute(action: PinnedAction) {
    switch (action.type) {
      case "rage": {
        const next = !rageActive;
        updateResources({ rpiRages: { ...resources.rpiRages, active: next } });
        toast(next ? "Rage activado" : "Rage desactivado", {
          icon: next ? "🔥" : "💨",
        });
        break;
      }
      case "hitDice": {
        const result = spendHitDie(combat, conMod);
        if (!result) break;
        updateCombat(result.combat);
        toast(`+${result.healing} HP curados`, { icon: "💚" });
        break;
      }
      case "hpAdjust":
        setHpModalOpen(true);
        break;
      case "resource": {
        const res = resources[action.resource];
        if (res.remaining <= 0) break;
        updateResources({
          [action.resource]: { ...res, remaining: res.remaining - 1 },
        });
        toast(
          action.resource === "healerKit"
            ? "Kit de sanador usado"
            : "Resistencia pétrea usada",
          { icon: "🩹" }
        );
        break;
      }
      case "attackRoll": {
        const attack = attacks.find((a) => a.id === action.attackId);
        if (!attack) break;
        const roll = rollAttackHit(attack, {
          recklessActive: combat.recklessActive,
        });
        toast(`${attack.name}: ${roll.total} (${roll.rolls.join(", ")})`, {
          icon: "🎲",
        });
        break;
      }
      case "attackDamage": {
        const attack = attacks.find((a) => a.id === action.attackId);
        if (!attack) break;
        const roll = rollAttackDamage(attack, { rageActive, rageDamage });
        toast(`${attack.name}: ${roll.total} daño`, { icon: "🎲" });
        break;
      }
      case "attackDefinition":
        setDefinitionAction(action);
        break;
    }
    setExpanded(false);
  }

  const definitionAttack =
    definitionAction?.type === "attackDefinition"
      ? attacks.find((a) => a.id === definitionAction.attackId)
      : undefined;

  return (
    <>
      <div className="fixed right-4 bottom-safe-fab z-40 flex flex-col items-end gap-2">
        {expanded &&
          quickActions.map((action) => {
            const Icon = iconFor(action);
            return (
              <button
                key={pinnedActionKey(action)}
                onClick={() => execute(action)}
                className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-card border border-border shadow-lg text-sm text-foreground active:scale-95 transition-transform"
              >
                <Icon size={16} className="text-accent" />
                {pinnedActionLabel(action, attacks)}
              </button>
            );
          })}
        <button
          {...longPress.handlers}
          onClick={() => {
            if (longPress.wasLongPress()) return;
            setExpanded((e) => !e);
          }}
          className="w-14 h-14 rounded-full bg-accent text-white shadow-xl flex items-center justify-center active:scale-95 transition-transform select-none [-webkit-touch-callout:none]"
          aria-label="Acciones rápidas"
        >
          {expanded ? <X size={24} /> : <Zap size={24} />}
        </button>
      </div>

      <HpModal
        open={hpModalOpen}
        onClose={() => setHpModalOpen(false)}
        currentHp={combat.currentHp}
        maxHp={combat.maxHp}
        tempHp={combat.tempHp}
        onApply={(hp, temp) => updateCombat({ currentHp: hp, tempHp: temp })}
      />

      <QuickActionsPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selected={quickActions}
        attacks={attacks}
        onSave={updateQuickActions}
      />

      <Modal
        open={definitionAction !== null}
        onClose={() => setDefinitionAction(null)}
        title={definitionAttack?.name ?? ""}
      >
        {definitionAttack && (
          <p className="text-sm text-foreground/80 leading-relaxed">
            <span className="font-heading text-accent">
              {definitionAttack.mastery}:
            </span>{" "}
            {definitionAttack.masteryEffect}
          </p>
        )}
      </Modal>
    </>
  );
}
