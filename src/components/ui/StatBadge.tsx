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
        compact ? "px-1.5 py-1 text-[0.6875rem] min-w-[2.5rem]" : "px-2.5 py-1.5 text-xs min-w-[3rem]"
      } ${highlight ? "!border-accent/50" : ""} ${
        onClick ? "active:scale-95 transition-transform" : ""
      }`}
    >
      <span
        className={`font-heading leading-tight text-accent ${compact ? "text-sm" : "text-lg"}`}
      >
        {value}
      </span>
      <span className="text-muted text-[0.6rem] uppercase tracking-wider">{label}</span>
    </Component>
  );
}
