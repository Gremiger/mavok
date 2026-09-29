"use client";

import { useContext } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { TabLeavingContext } from "./TabTransition";

// A tab's floating "+" button. It is portaled to <body> because tab
// transitions transform the tab panels, and a transformed ancestor would
// re-anchor a position:fixed button to the panel for the animation. A tab
// that is animating out renders no button, so two never stack.
export function TabFab({ label, onClick }: { label: string; onClick: () => void }) {
  const leaving = useContext(TabLeavingContext);
  if (leaving || typeof document === "undefined") return null;
  return createPortal(
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="fixed right-4 bottom-safe-fab w-12 h-12 rounded-full btn-primary shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
    >
      <Plus size={24} strokeWidth={1.5} />
    </button>,
    document.body
  );
}
