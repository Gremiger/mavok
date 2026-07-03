"use client";

export function Tag({
  label,
  onRemove,
  onClick,
  variant = "default",
}: {
  label: string;
  onRemove?: () => void;
  onClick?: () => void;
  variant?: "default" | "success" | "danger";
}) {
  const colors = {
    default: "bg-accent/15 text-accent border border-accent/20",
    success: "bg-success/15 text-success border border-success/20",
    danger: "bg-danger/15 text-danger border border-danger/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded ${colors[variant]}`}
    >
      <span onClick={onClick} className={onClick ? "cursor-pointer" : undefined}>
        {label}
      </span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="opacity-60 hover:opacity-100 leading-none"
        >
          ✕
        </button>
      )}
    </span>
  );
}
