"use client";

import { useState } from "react";

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="cord-line pl-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="relative cord-knot w-full flex items-center justify-between py-2 font-heading text-sm text-accent tracking-wide uppercase"
      >
        {title}
        <span
          className={`transition-transform duration-200 text-muted text-xs ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <>
          <div className="crack-divider mb-3" />
          <div>{children}</div>
        </>
      )}
    </section>
  );
}
