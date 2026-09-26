"use client";

export function GhostChip({
  children,
  onClick,
  disabled = false,
  solid = false,
  ...longPressHandlers
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  solid?: boolean;
} & Record<string, unknown>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {...longPressHandlers}
      className={`whitespace-nowrap text-xs italic px-2.5 py-1 rounded-md border transition-colors duration-150 select-none [-webkit-touch-callout:none] ${
        disabled
          ? "border-border/50 text-muted opacity-40 cursor-not-allowed"
          : solid
            ? "border-accent bg-accent/20 text-accent"
            : "border-border text-muted hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}
