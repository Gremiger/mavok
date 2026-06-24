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
      className={`flex flex-col items-center px-2 py-1 rounded-lg text-xs min-w-[3rem] ${
        highlight ? "bg-accent/20 text-accent" : "bg-card"
      } ${onClick ? "active:scale-95 transition-transform" : ""}`}
    >
      <span className="font-heading text-base leading-tight">{value}</span>
      <span className="text-muted text-[0.65rem]">{label}</span>
    </Component>
  );
}
