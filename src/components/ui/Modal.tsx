"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="fixed inset-0 m-auto stone-card text-foreground rounded-xl p-0 w-[90vw] max-w-md max-h-[85vh] overflow-y-auto drop-shadow-2xl"
      style={{ zIndex: 100 }}
    >
      <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-border bg-surface-hi z-10">
        <h2 className="font-heading text-foreground text-xl leading-tight">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="w-9 h-9 -mr-2 flex items-center justify-center rounded-lg text-muted hover:text-foreground transition-colors"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>
      <div className="p-4">{children}</div>
    </dialog>
  );
}
