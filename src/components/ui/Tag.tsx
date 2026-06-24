"use client";

export function Tag({
  label,
  onRemove,
  variant = "default",
}: {
  label: string;
  onRemove?: () => void;
  variant?: "default" | "success" | "danger";
}) {
  const colors = {
    default: "bg-accent/20 text-accent",
    success: "bg-success/20 text-success",
    danger: "bg-danger/20 text-danger",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${colors[variant]}`}
    >
      {label}
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
