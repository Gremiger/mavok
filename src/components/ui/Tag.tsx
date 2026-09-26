"use client";

import { X } from "lucide-react";

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
    default: "",
    success: "!text-success !border-success/50",
    danger: "!text-danger !border-danger/50",
  };

  return (
    <span className={`ink-stamp gap-1 ${colors[variant]}`}>
      <span onClick={onClick} className={onClick ? "cursor-pointer" : undefined}>
        {label}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar ${label}`}
          className="opacity-60 hover:opacity-100 -mr-1 p-0.5"
        >
          <X size={12} strokeWidth={1.5} />
        </button>
      )}
    </span>
  );
}
