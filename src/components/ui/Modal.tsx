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

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="bg-card text-foreground rounded-xl p-0 w-[90vw] max-w-md backdrop:bg-black/60 border border-border"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
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
