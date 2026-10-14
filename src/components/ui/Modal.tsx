"use client";

import { Drawer } from "vaul";
import { X } from "lucide-react";

// Every modal is a bottom sheet: it rises from the thumb's side of the
// screen and drags down to close, like iOS sheets. Vaul brings the focus
// trap, Escape, scroll lock and the exit animation.
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
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/55" style={{ zIndex: 100 }} />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 mx-auto flex flex-col stone-card text-foreground rounded-t-2xl rounded-b-none w-full max-w-md max-h-[88dvh] drop-shadow-2xl outline-none"
          style={{ zIndex: 100 }}
        >
          <div aria-hidden="true" className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-muted/40" />
          <div className="flex items-center justify-between px-4 pt-1 pb-3 border-b border-border">
            <Drawer.Title className="font-heading text-foreground text-xl leading-tight">{title}</Drawer.Title>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="w-9 h-9 -mr-2 flex items-center justify-center rounded-lg text-muted hover:text-foreground transition-colors"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
          <div className="overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
