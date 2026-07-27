"use client";

import { useEffect, useRef, useState } from "react";
import { findActiveMention, filterLinkables } from "@/lib/mention-picker";
import type { LinkableNote } from "@/lib/note-links";

const SECTION_LABELS: Record<LinkableNote["section"], string> = {
  world: "Mundo",
  npcs: "NPC",
  quests: "Misión",
  journal: "Diario",
};

interface Mention {
  start: number;
  query: string;
}

export function MentionTextarea({
  value,
  onChange,
  linkables,
  placeholder,
  rows,
  className,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  linkables: LinkableNote[];
  placeholder?: string;
  rows?: number;
  className?: string;
  autoFocus?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mention, setMention] = useState<Mention | null>(null);

  function updateMention(target: HTMLTextAreaElement) {
    if (linkables.length === 0) {
      setMention(null);
      return;
    }
    setMention(findActiveMention(target.value, target.selectionStart));
  }

  useEffect(() => {
    if (!mention) return;
    function handlePointerDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setMention(null);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [mention]);

  const suggestions = mention ? filterLinkables(linkables, mention.query) : [];

  function selectSuggestion(linkable: LinkableNote) {
    if (!mention) return;
    const insertion = `${linkable.title} `;
    const mentionTextStart = mention.start + 1;
    const mentionTextEnd = mentionTextStart + mention.query.length;
    const newValue =
      value.slice(0, mentionTextStart) + insertion + value.slice(mentionTextEnd);
    const caretPos = mentionTextStart + insertion.length;

    onChange(newValue);
    setMention(null);

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      textarea?.focus();
      textarea?.setSelectionRange(caretPos, caretPos);
    });
  }

  return (
    <div ref={containerRef}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          updateMention(e.target);
        }}
        onClick={(e) => updateMention(e.currentTarget)}
        onKeyUp={(e) => updateMention(e.currentTarget)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && mention) {
            e.preventDefault();
            setMention(null);
          }
        }}
        placeholder={placeholder}
        rows={rows}
        className={className}
        autoFocus={autoFocus}
      />
      {mention && (
        <div className="mt-1 rounded-lg border border-border bg-card overflow-hidden">
          {suggestions.length > 0 ? (
            suggestions.map((s) => (
              <button
                key={`${s.section}-${s.id}`}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(s)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-background"
              >
                <span className="text-foreground">{s.title}</span>
                <span className="text-[0.6rem] px-1.5 py-0.5 bg-accent/20 text-accent rounded shrink-0">
                  {SECTION_LABELS[s.section]}
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted">Sin resultados</div>
          )}
        </div>
      )}
    </div>
  );
}
