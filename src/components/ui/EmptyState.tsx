"use client";

import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  message,
}: {
  icon: LucideIcon;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="w-14 h-14 rounded-full border border-border flex items-center justify-center">
        <Icon className="w-6 h-6 text-muted" strokeWidth={1.5} />
      </div>
      <p className="text-muted text-sm max-w-[240px]">{message}</p>
    </div>
  );
}
