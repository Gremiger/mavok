"use client";

import { useState } from "react";
import { useCharacterContext } from "@/lib/context";
import { Modal } from "@/components/ui/Modal";
import { WEAPONS } from "@/data/weapons";
import { MASTERY_PROPERTIES } from "@/data/mastery";
import { BARBARIAN_LEVELS } from "@/data/barbarian-progression";
import { computeMasterySaveDC } from "@/lib/masteryDC";
import { baseWeaponName } from "@/lib/weaponMatch";
import { toast } from "sonner";

export function WeaponMasteryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { character, updateAttack } = useCharacterContext();
  const [deactivate, setDeactivate] = useState<string | null>(null);

  if (!character) return null;

  const weaponMasteries =
    BARBARIAN_LEVELS.find((l) => l.level === character.meta.level)
      ?.weaponMasteries ?? 2;

  const activeWeaponNames = Array.from(
    new Set(
      character.attacks
        .filter((a) => a.mastery !== null)
        .map((a) => baseWeaponName(a.name))
        .filter((n): n is string => n !== null)
    )
  );

  const inactiveWeaponNames = Array.from(
    new Set(
      character.attacks
        .filter((a) => a.mastery === null)
        .map((a) => baseWeaponName(a.name))
        .filter((n): n is string => n !== null)
    )
  ).filter((name) => {
    const w = WEAPONS.find((w) => w.name === name);
    return w && w.mastery !== null;
  });

  function reset() {
    setDeactivate(null);
  }

  function performSwap(deactivateName: string, activateName: string) {
    character!.attacks
      .filter((a) => baseWeaponName(a.name) === deactivateName)
      .forEach((a) =>
        updateAttack(a.id, {
          mastery: null,
          masteryEffect: null,
          masterySaveDC: null,
        })
      );

    const weapon = WEAPONS.find((w) => w.name === activateName);
    if (!weapon || !weapon.mastery) return;
    const masteryData = MASTERY_PROPERTIES.find(
      (m) => m.name === weapon.mastery
    );
    const dc = computeMasterySaveDC(
      weapon.mastery,
      weapon.properties,
      character!.meta.proficiencyBonus,
      character!.attributes
    );
    character!.attacks
      .filter((a) => baseWeaponName(a.name) === activateName)
      .forEach((a) =>
        updateAttack(a.id, {
          mastery: weapon.mastery,
          masteryEffect: masteryData?.description ?? null,
          masterySaveDC: dc,
        })
      );

    toast.success(`Mastery cambiada: ${deactivateName} → ${activateName}`);
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Practicar con armas"
    >
      <p className="text-xs text-muted mb-3">
        Maestrías activas: {activeWeaponNames.length}/{weaponMasteries}
      </p>
      {!deactivate ? (
        <div className="space-y-3">
          <p className="text-sm">
            Elige qué maestría de arma dejas de usar:
          </p>
          {activeWeaponNames.length === 0 ? (
            <p className="text-muted text-sm text-center py-4">
              No tienes maestrías activas.
            </p>
          ) : (
            <div className="space-y-1">
              {activeWeaponNames.map((name) => {
                const w = WEAPONS.find((w) => w.name === name);
                return (
                  <button
                    key={name}
                    onClick={() => setDeactivate(name)}
                    className="w-full p-3 bg-card border border-border rounded-lg text-left active:scale-[0.99] transition-transform"
                  >
                    <span className="font-heading text-accent text-sm">
                      {name}
                    </span>
                    <span className="text-xs text-muted ml-2">
                      ({w?.mastery})
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm">
            Dejando <strong>{deactivate}</strong> (
            {WEAPONS.find((w) => w.name === deactivate)?.mastery}). Elige el
            arma a activar:
          </p>
          {inactiveWeaponNames.length === 0 ? (
            <p className="text-muted text-sm text-center py-4">
              No tienes otras armas disponibles para activar.
            </p>
          ) : (
            <div className="space-y-1">
              {inactiveWeaponNames.map((name) => {
                const w = WEAPONS.find((w) => w.name === name);
                return (
                  <button
                    key={name}
                    onClick={() => performSwap(deactivate, name)}
                    className="w-full p-3 bg-card border border-border rounded-lg text-left active:scale-[0.99] transition-transform"
                  >
                    <span className="font-heading text-accent text-sm">
                      {name}
                    </span>
                    <span className="text-xs text-muted ml-2">
                      ({w?.mastery})
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <button
            onClick={reset}
            className="w-full py-2 text-sm text-muted border border-border rounded-lg"
          >
            Atrás
          </button>
        </div>
      )}
    </Modal>
  );
}
