"use client";

import { useThemeContext } from "@/lib/context";

export interface CompactRowProps {
  name: React.ReactNode;
  meta?: React.ReactNode;
  right: React.ReactNode;
  dim?: boolean;
  conditional?: boolean;
  onClick?: () => void;
}

export function CompactRow({
  name,
  meta,
  right,
  dim = false,
  conditional = false,
  onClick,
}: CompactRowProps) {
  const { density } = useThemeContext();

  // Always a <div>, never a <button> — `right` frequently contains its own
  // buttons (GhostChip, +/- controls), and a <button> can't validly contain
  // another <button> in HTML. Clickable rows get button semantics via
  // role/tabIndex/onKeyDown instead of the element type.
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`w-full flex items-center justify-between gap-2 rounded-lg bg-card/60 border ${
        conditional ? "border-dashed border-border/70" : "border-border/50"
      } ${density === "compact" ? "min-h-[40px] px-2.5 py-1.5" : "min-h-[44px] px-3 py-2"} ${
        dim ? "opacity-50" : ""
      } ${onClick ? "text-left cursor-pointer active:scale-[0.99] transition-transform" : ""} mb-1.5`}
    >
      <span className="flex-1 min-w-0">
        <span className="block text-[0.8125rem] text-foreground truncate">{name}</span>
        {meta && (
          <span className="block text-[0.6875rem] text-muted mt-0.5 leading-snug">
            {meta}
          </span>
        )}
      </span>
      <span className="shrink-0">{right}</span>
    </div>
  );
}
