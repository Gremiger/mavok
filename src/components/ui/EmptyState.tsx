"use client";

import type { LucideIcon } from "lucide-react";
import { LottieArt, type LottieArtName } from "@/components/ui/LottieArt";

// `art` swaps the icon for an animated illustration where an empty screen
// is worth some life (a blank journal, an empty chest).
export function EmptyState({
  icon: Icon,
  message,
  art,
  loopArt = false,
}: {
  icon: LucideIcon;
  message: string;
  art?: LottieArtName;
  loopArt?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      {art ? (
        <LottieArt name={art} loop={loopArt} />
      ) : (
        <div className="w-10 h-10 rotate-45 rounded-md border border-border flex items-center justify-center">
          <Icon className="-rotate-45 w-5 h-5 text-muted" strokeWidth={1.5} />
        </div>
      )}
      <p className="text-muted text-sm italic max-w-[240px] [text-wrap:balance]">{message}</p>
    </div>
  );
}
