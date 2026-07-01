"use client";

import { useCharacter } from "@/hooks/useCharacter";
import type { AbilityScore } from "@/lib/types";
import {
  abilityModifier,
  formatModifier,
  abilityLabel,
  skillLabel,
  skillTotal,
  saveTotal,
} from "@/lib/utils";

const ABILITIES: AbilityScore[] = ["str", "dex", "con", "int", "wis", "cha"];

export default function PrintPage() {
  const { character } = useCharacter();

  if (!character) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  const {
    meta,
    attributes,
    skills,
    savingThrows,
    proficiencies,
    features,
    attacks,
    inventory,
    currency,
  } = character;

  return (
    <div className="print-sheet max-w-3xl mx-auto p-8 text-black bg-white">
      <header className="mb-6 border-b-2 border-black pb-3">
        <h1 className="text-3xl font-bold">{meta.name}</h1>
        <p className="text-sm">
          {meta.class} {meta.subclass ? `· ${meta.subclass}` : ""} — Nivel{" "}
          {meta.level} · PB {formatModifier(meta.proficiencyBonus)}
        </p>
        <p className="text-xs">
          {meta.species} · {meta.giantAncestry} · {meta.background} ·{" "}
          {meta.origin}
        </p>
      </header>

      <section className="mb-6">
        <h2 className="text-lg font-bold mb-2 border-b border-black">
          Atributos
        </h2>
        <div className="grid grid-cols-6 gap-2 text-center text-sm">
          {ABILITIES.map((ab) => (
            <div key={ab} className="border border-black rounded p-1">
              <div className="text-xs uppercase">{abilityLabel(ab)}</div>
              <div className="font-bold text-lg">{attributes[ab]}</div>
              <div className="text-xs">
                {formatModifier(abilityModifier(attributes[ab]))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-bold mb-2 border-b border-black">
            Salvaciones
          </h2>
          <div className="text-sm space-y-0.5">
            {ABILITIES.map((ab) => (
              <div key={ab} className="flex justify-between">
                <span>
                  {savingThrows[ab]?.proficient ? "●" : "○"} {abilityLabel(ab)}
                </span>
                <span>{formatModifier(saveTotal(character, ab))}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold mb-2 border-b border-black">
            Habilidades
          </h2>
          <div className="text-sm space-y-0.5">
            {Object.entries(skills)
              .sort(([a], [b]) => skillLabel(a).localeCompare(skillLabel(b)))
              .map(([key, skill]) => (
                <div key={key} className="flex justify-between">
                  <span>
                    {skill.proficient ? "●" : "○"} {skillLabel(key)}
                  </span>
                  <span>{formatModifier(skillTotal(character, key))}</span>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-bold mb-2 border-b border-black">
          Competencias
        </h2>
        <div className="text-sm space-y-1">
          <p>
            <strong>Armaduras:</strong> {proficiencies.armor.join(", ")}
          </p>
          <p>
            <strong>Armas:</strong> {proficiencies.weapons.join(", ")}
          </p>
          <p>
            <strong>Herramientas:</strong> {proficiencies.tools.join(", ")}
          </p>
          <p>
            <strong>Idiomas:</strong> {proficiencies.languages.join(", ")}
          </p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-bold mb-2 border-b border-black">
          Rasgos, características y dotes
        </h2>
        <div className="text-sm space-y-2">
          {features
            .filter((f) => f.level <= meta.level)
            .map((f, i) => (
              <div key={i}>
                <p>
                  <strong>{f.name}</strong>{" "}
                  <span className="text-xs">({f.source})</span>
                </p>
                <p>{f.description}</p>
              </div>
            ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-bold mb-2 border-b border-black">
          Ataques
        </h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-black text-left">
              <th className="py-1">Arma</th>
              <th className="py-1">Bono</th>
              <th className="py-1">Daño</th>
              <th className="py-1">Alcance</th>
            </tr>
          </thead>
          <tbody>
            {attacks.map((a) => (
              <tr key={a.id} className="border-b border-black/20">
                <td className="py-1">{a.name}</td>
                <td className="py-1">{formatModifier(a.attackBonus)}</td>
                <td className="py-1">
                  {a.damage} {a.damageType}
                </td>
                <td className="py-1">{a.range}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-2 border-b border-black">
          Inventario
        </h2>
        <p className="text-sm mb-2">
          Monedas: {currency.pp}pp {currency.gp}gp {currency.ep}ep{" "}
          {currency.sp}sp {currency.cp}cp
        </p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-black text-left">
              <th className="py-1">Objeto</th>
              <th className="py-1">Cant.</th>
              <th className="py-1">Peso</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="border-b border-black/20">
                <td className="py-1">
                  {item.name}
                  {item.equipped ? " (equipado)" : ""}
                </td>
                <td className="py-1">{item.quantity}</td>
                <td className="py-1">
                  {item.weight !== null
                    ? `${item.weight * item.quantity} lb`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
