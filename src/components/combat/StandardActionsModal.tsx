"use client";

import { Modal } from "@/components/ui/Modal";

type ActionCategory = "actions" | "bonus" | "reactions";

interface StandardAction {
  name: string;
  description: string;
  subItems?: { name: string; description: string }[];
}

const STANDARD_ACTIONS: StandardAction[] = [
  {
    name: "Ataque (Attack)",
    description: "Realiza una tirada de ataque con un arma o Unarmed Strike.",
    subItems: [
      {
        name: "Grapple (Unarmed Strike)",
        description:
          "Athletics vs Athletics/Acrobatics del objetivo (elige el objetivo). Éxito: aplica condición Grappled. El objetivo no puede ser más de una categoría de tamaño mayor que tú.",
      },
      {
        name: "Shove (Unarmed Strike)",
        description:
          "Athletics vs Athletics/Acrobatics del objetivo. Éxito: empuja 5 ft. en dirección que elijas o derriba (condición Prone).",
      },
    ],
  },
  {
    name: "Carrera (Dash)",
    description:
      "Gana movimiento extra igual a tu Velocidad este turno (con modificadores incluidos).",
  },
  {
    name: "Repliegue (Disengage)",
    description:
      "Tus movimientos no provocan Ataques de Oportunidad durante el resto del turno.",
  },
  {
    name: "Esquiva (Dodge)",
    description:
      "Ataques contra ti tienen Desventaja (si puedes ver al atacante). Ventaja en salvaciones de DES. Se pierde si quedas Incapacitated o tu Velocidad es 0.",
  },
  {
    name: "Ayuda (Help)",
    description:
      "Asiste a un aliado en una prueba de habilidad (le concedes Ventaja) o en su próximo ataque contra un enemigo adyacente a ti.",
  },
  {
    name: "Esconderse (Hide)",
    description:
      "Prueba DES (Sigilo) DC 15 mientras estás Heavily Obscured o con Three-Quarters/Total Cover, fuera de la línea de visión de enemigos. Con éxito: condición Invisible hasta que te muevas, hagas ruido, ataques o lances un hechizo.",
  },
  {
    name: "Influir (Influence)",
    description:
      "Convence a un monstruo mediante roleplay (persuasión, engaño, intimidación…). El DM determina si se requiere prueba de habilidad.",
  },
  {
    name: "Preparar (Ready)",
    description:
      "Define un trigger perceptible y una acción/movimiento de Reacción. Cuando ocurre el trigger, puedes ejecutar la Reacción antes de tu próximo turno.",
  },
  {
    name: "Buscar (Search)",
    description:
      "Prueba de SAB para detectar algo no obvio: Perception (criaturas), Insight (estado mental), Medicine (criatura viva/muerta); o INT Investigation (rastrear/examinar).",
  },
  {
    name: "Estudiar (Study)",
    description:
      "Prueba de INT para recordar información: Arcana, History, Nature, Religion, Medicine, Investigation según el tema.",
  },
  {
    name: "Utilizar (Utilize)",
    description:
      "Usa un objeto que requiere una acción para activarse.",
  },
];

const STANDARD_BONUS_ACTIONS: StandardAction[] = [
  {
    name: "Two-Weapon Fighting",
    description:
      "Tras atacar con un arma Light como parte de tu Attack action, puedes atacar con otra arma Light diferente como Bonus Action. No añades tu modificador de habilidad al daño (salvo que sea negativo).",
  },
];

const STANDARD_REACTIONS: StandardAction[] = [
  {
    name: "Ataque de Oportunidad (Opportunity Attack)",
    description:
      "Cuando una criatura que puedes ver abandona tu alcance usando su acción, Bonus Action, Reacción o velocidad: usa tu Reacción para hacer un ataque cuerpo a cuerpo. El ataque ocurre justo antes de que salga de tu alcance.",
  },
];

const DATA: Record<ActionCategory, { title: string; actions: StandardAction[] }> = {
  actions: { title: "Acciones estándar", actions: STANDARD_ACTIONS },
  bonus: { title: "Bonus Actions estándar", actions: STANDARD_BONUS_ACTIONS },
  reactions: { title: "Reacciones estándar", actions: STANDARD_REACTIONS },
};

interface Props {
  open: boolean;
  onClose: () => void;
  filter: ActionCategory;
}

export function StandardActionsModal({ open, onClose, filter }: Props) {
  const { title, actions } = DATA[filter];
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {actions.map((action) => (
          <div key={action.name} className="stone-card rounded-lg p-3">
            <p className="font-heading text-accent text-sm font-semibold mb-1">
              {action.name}
            </p>
            <p className="text-xs text-foreground/70 leading-relaxed">
              {action.description}
            </p>
            {action.subItems && (
              <div className="mt-2 space-y-1.5 pl-2 border-l border-border">
                {action.subItems.map((sub) => (
                  <div key={sub.name}>
                    <p className="text-xs text-accent/80 font-semibold">{sub.name}</p>
                    <p className="text-xs text-muted leading-relaxed">{sub.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}
