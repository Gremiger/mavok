"use client";

export function StatBadge({
  label,
  value,
  onClick,
  highlight,
  compact = false,
}: {
  label: string;
  value: string | number;
  onClick?: () => void;
  highlight?: boolean;
  compact?: boolean;
}) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      onClick={onClick}
      className={`flex flex-col items-center rounded-lg stone-card ${
        compact ? "px-2 py-1 min-w-[2.75rem]" : "px-2.5 py-1.5 min-w-[3rem]"
      } ${highlight ? "!border-accent/50" : ""} ${
        onClick ? "active:scale-[0.97] transition-transform duration-150" : ""
      }`}
    >
      <span
        className={`font-numeric font-semibold leading-tight text-accent ${compact ? "text-base" : "text-lg"}`}
      >
        {value}
      </span>
      <span className="text-muted text-xs italic">{label}</span>
    </Component>
  );
}
