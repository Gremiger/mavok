"use client";

import { useEffect, useRef } from "react";

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
      <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-card z-10">
        <h2 className="font-heading text-accent text-lg">{title}</h2>
        <button
          onClick={onClose}
          className="text-muted text-xl leading-none hover:text-foreground"
        >
          ✕
        </button>
      </div>
      <div className="p-4">{children}</div>
    </dialog>
  );
}
