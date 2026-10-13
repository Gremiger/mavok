"use client";

// Two-way switch between a section's views (e.g. list vs. cards).
export function ViewToggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-border/70 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`px-2.5 py-0.5 rounded-full text-xs italic transition-colors ${
            value === o.value ? "bg-accent/20 text-accent" : "text-muted"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
