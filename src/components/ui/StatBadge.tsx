"use client";

export function StatBadge({
  label,
  value,
  onClick,
  highlight,
}: {
  label: string;
  value: string | number;
  onClick?: () => void;
  highlight?: boolean;
}) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      onClick={onClick}
      className={`flex flex-col items-center px-2.5 py-1.5 rounded-lg text-xs min-w-[3rem] stone-card ${
        highlight ? "!border-accent/50" : ""
      } ${onClick ? "active:scale-95 transition-transform" : ""}`}
    >
      <span className="font-heading text-lg leading-tight text-accent">{value}</span>
      <span className="text-muted text-[0.6rem] uppercase tracking-wider">{label}</span>
    </Component>
  );
}
