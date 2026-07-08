import type { ReactNode } from "react";
import { CONDITIONS } from "../data/conditions";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const CONDITION_NAMES = CONDITIONS.map((c) => c.name).sort(
  (a, b) => b.length - a.length
);
const CONDITION_PATTERN = new RegExp(
  `\\b(${CONDITION_NAMES.map(escapeRegExp).join("|")})\\b`
);

export function linkifyConditions(
  text: string,
  onConditionClick: (name: string) => void
): ReactNode[] {
  if (CONDITION_NAMES.length === 0) return [text];

  return text.split(CONDITION_PATTERN).map((part, i) =>
    CONDITION_NAMES.includes(part) ? (
      <button
        key={i}
        onClick={() => onConditionClick(part)}
        className="underline decoration-dotted text-accent"
      >
        {part}
      </button>
    ) : (
      part
    )
  );
}
