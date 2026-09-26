"use client";

import { useState } from "react";

export function CollapsibleSection({
  title,
  defaultOpen = false,
  forceOpenKey,
  count,
  aside,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  forceOpenKey?: number;
  count?: number | string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [prevForceOpenKey, setPrevForceOpenKey] = useState(forceOpenKey);

  if (forceOpenKey !== undefined && forceOpenKey !== prevForceOpenKey) {
    setPrevForceOpenKey(forceOpenKey);
    setOpen(true);
  }

  return (
    <section className="chapter mb-2">
      {/* Header is a div, not a button: `aside` may hold its own buttons. */}
      <div className="flex items-baseline gap-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex-1 min-w-0 flex items-baseline gap-2.5 py-2.5 text-left"
        >
          <span className="chapter-num font-heading text-cord text-[1.15rem] leading-none" aria-hidden="true" />
          <span className="font-heading text-foreground text-[1.3rem] leading-tight">
            {title}
          </span>
          {!open && (
            <>
              <span className="chapter-leader flex-1" aria-hidden="true" />
              {count !== undefined && (
                <span className="font-numeric italic text-sm text-muted">{count}</span>
              )}
            </>
          )}
        </button>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      {open && (
        <>
          <div className="rule-line mb-3" />
          <div>{children}</div>
        </>
      )}
    </section>
  );
}
