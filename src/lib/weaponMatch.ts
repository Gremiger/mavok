import { WEAPONS } from "@/data/weapons";
import type { Attack } from "./types";

export function baseWeaponName(attackName: string): string | null {
  const match = WEAPONS.find(
    (w) => attackName === w.name || attackName.startsWith(`${w.name} (`)
  );
  return match ? match.name : null;
}

export function describeWeaponMastery(attacks: Attack[]): string {
  const activeNames = Array.from(
    new Set(
      attacks
        .filter((a) => a.mastery !== null)
        .map((a) => baseWeaponName(a.name))
        .filter((n): n is string => n !== null)
    )
  );
  const parts = activeNames.map((name) => {
    const attack = attacks.find((a) => baseWeaponName(a.name) === name);
    return `${name} (${attack?.mastery})`;
  });
  const count = activeNames.length;
  return `Conoce las propiedades de maestría de ${count} arma${count === 1 ? "" : "s"}: ${parts.join(", ")}.`;
}
