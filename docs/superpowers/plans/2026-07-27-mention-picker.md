# @mention Autocomplete Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an autocomplete dropdown that appears while typing `@` in a note's content textarea, showing matching Mundo/NPCs/Misiones/Diario titles to tap instead of typing them blind — fixing the practical unusability of `@mention`ing multi-word titles like "Bar de Nim".

**Architecture:** A new pure-logic module (`src/lib/mention-picker.ts`) detects the active `@query` at the caret and filters `LinkableNote[]` by prefix. A new UI component (`src/components/notes/MentionTextarea.tsx`) wraps a `<textarea>` with that logic plus a dropdown rendered directly below it. The three note-form files (`NoteList.tsx`, `QuestList.tsx`, `JournalList.tsx`) swap their plain `<textarea>` for `<MentionTextarea>` in their content fields (4 usages total — `JournalList.tsx` has two).

**Tech Stack:** React 19 (client components), TypeScript, Vitest, Tailwind CSS 4 — no new dependencies.

## Global Constraints

- No new npm dependencies — this is built entirely on existing `note-links.ts` types and vanilla React/DOM APIs.
- Verify every task with `npx tsc --noEmit && npm run build && npm run lint && npm test` — 0 lint errors required (per `CLAUDE.md`).
- Mentionable scope is unchanged from the shipped `@mention` feature: all four sections (Mundo, NPCs, Misiones, Diario), matching what `linkifyMentions` already resolves.
- The picker replaces only the query text after `@` — the `@` character itself must never be removed or altered, since `linkifyMentions` requires a literal `@` immediately followed by the title to link it.
- No keyboard navigation (arrows/Enter-to-select) and no floating/cursor-relative positioning — tap/click only, dropdown fixed directly below the textarea, per the approved design.
- Quick Notes (`QuickNotes.tsx`) is out of scope — do not touch it.

---

### Task 1: Pure mention-detection and filtering logic

**Files:**
- Create: `src/lib/mention-picker.ts`
- Test: `src/lib/mention-picker.test.ts`

**Interfaces:**
- Consumes: `LinkableNote` type from `src/lib/note-links.ts` (`{ id: string; section: "world" | "npcs" | "quests" | "journal"; title: string }`)
- Produces:
  - `findActiveMention(value: string, caretIndex: number): { start: number; query: string } | null`
  - `filterLinkables(linkables: LinkableNote[], query: string, limit?: number): LinkableNote[]` (default `limit = 5`)

- [ ] **Step 1: Write the failing tests**

Create `src/lib/mention-picker.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { findActiveMention, filterLinkables } from "./mention-picker";
import type { LinkableNote } from "./note-links";

describe("findActiveMention", () => {
  it("finds a simple mention at the caret", () => {
    const result = findActiveMention("hola @Ri", 8);
    expect(result).toEqual({ start: 5, query: "Ri" });
  });

  it("finds a multi-word query spanning spaces", () => {
    const value = "vive en @Bar de Nim";
    const result = findActiveMention(value, value.length);
    expect(result).toEqual({ start: 8, query: "Bar de Nim" });
  });

  it("does not trigger mid-word (no whitespace before @)", () => {
    const result = findActiveMention("email@domain", 12);
    expect(result).toBeNull();
  });

  it("treats start-of-string as a valid boundary", () => {
    const result = findActiveMention("@Riti", 5);
    expect(result).toEqual({ start: 0, query: "Riti" });
  });

  it("invalidates a mention that crosses a newline", () => {
    const value = "@Bar\nde Nim";
    const result = findActiveMention(value, value.length);
    expect(result).toBeNull();
  });

  it("resolves the query relative to the caret, not the end of string", () => {
    const value = "@Bar de Nim resto del texto";
    const result = findActiveMention(value, 4);
    expect(result).toEqual({ start: 0, query: "Bar" });
  });

  it("returns null when there is no @ before the caret", () => {
    const result = findActiveMention("sin mencion aqui", 5);
    expect(result).toBeNull();
  });
});

describe("filterLinkables", () => {
  const linkables: LinkableNote[] = [
    { id: "1", section: "npcs", title: "Riti" },
    { id: "2", section: "world", title: "Bar de Nim" },
    { id: "3", section: "world", title: "Bar del Puerto" },
    { id: "4", section: "quests", title: "Rescatar a Riti" },
  ];

  it("matches case-insensitively by prefix", () => {
    const result = filterLinkables(linkables, "riti");
    expect(result.map((l) => l.title)).toEqual(["Riti"]);
  });

  it("returns the first N linkables for an empty query", () => {
    const result = filterLinkables(linkables, "", 2);
    expect(result).toEqual(linkables.slice(0, 2));
  });

  it("respects the limit", () => {
    const result = filterLinkables(linkables, "bar", 1);
    expect(result.length).toBe(1);
  });

  it("returns an empty array when nothing matches", () => {
    const result = filterLinkables(linkables, "zzz");
    expect(result).toEqual([]);
  });

  it("does not match mid-title substrings, only prefixes", () => {
    const result = filterLinkables(linkables, "riti");
    expect(result.map((l) => l.title)).not.toContain("Rescatar a Riti");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/mention-picker.test.ts`
Expected: FAIL with "Cannot find module './mention-picker'" (the file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `src/lib/mention-picker.ts`:

```typescript
import type { LinkableNote } from "./note-links";

export function findActiveMention(
  value: string,
  caretIndex: number
): { start: number; query: string } | null {
  const before = value.slice(0, caretIndex);
  const atIndex = before.lastIndexOf("@");
  if (atIndex === -1) return null;

  const between = before.slice(atIndex + 1);
  if (between.includes("\n")) return null;

  const charBefore = atIndex > 0 ? before[atIndex - 1] : undefined;
  if (charBefore !== undefined && !/\s/.test(charBefore)) return null;

  return { start: atIndex, query: between };
}

export function filterLinkables(
  linkables: LinkableNote[],
  query: string,
  limit = 5
): LinkableNote[] {
  const q = query.toLowerCase();
  return linkables
    .filter((l) => l.title.toLowerCase().startsWith(q))
    .slice(0, limit);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/mention-picker.test.ts`
Expected: PASS, 12 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mention-picker.ts src/lib/mention-picker.test.ts
git commit -m "feat: add pure mention-detection and filtering logic"
```

---

### Task 2: MentionTextarea component

**Files:**
- Create: `src/components/notes/MentionTextarea.tsx`

**Interfaces:**
- Consumes:
  - `findActiveMention(value, caretIndex)` and `filterLinkables(linkables, query, limit?)` from Task 1 (`@/lib/mention-picker`)
  - `LinkableNote` type from `@/lib/note-links`
- Produces: `MentionTextarea` component with props:
  ```typescript
  {
    value: string;
    onChange: (value: string) => void;
    linkables: LinkableNote[];
    placeholder?: string;
    rows?: number;
    className?: string;
    autoFocus?: boolean;
  }
  ```

This is a UI component with no unit test, consistent with the project's existing scope (`CLAUDE.md`: "No component/UI tests yet"). Verification for this task is `tsc`/`build`/`lint` passing plus the manual walkthrough in Task 4.

- [ ] **Step 1: Write the component**

Create `src/components/notes/MentionTextarea.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors (this file isn't imported anywhere yet, but it must still type-check standalone).

- [ ] **Step 3: Commit**

```bash
git add src/components/notes/MentionTextarea.tsx
git commit -m "feat: add MentionTextarea component with tap-to-insert dropdown"
```

---

### Task 3: Wire MentionTextarea into the note/quest/journal forms

**Files:**
- Modify: `src/components/notes/NoteList.tsx:193-199`
- Modify: `src/components/notes/QuestList.tsx:222-227`
- Modify: `src/components/notes/JournalList.tsx:206-214` and `src/components/notes/JournalList.tsx:264-271`

**Interfaces:**
- Consumes: `MentionTextarea` from Task 2 (`@/components/notes/MentionTextarea`), `buildLinkableNotes` from `@/lib/note-links` (already imported in all three files from the prior `@mention` linking plan)

- [ ] **Step 1: Wire NoteList.tsx**

Add the import near the top of `src/components/notes/NoteList.tsx`, alongside the existing `note-links` import:

```typescript
import { MentionTextarea } from "@/components/notes/MentionTextarea";
```

Replace the content textarea (currently at lines 193-199):

```tsx
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Contenido"
            rows={4}
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
          />
```

with:

```tsx
          <MentionTextarea
            value={form.content}
            onChange={(v) => setForm({ ...form, content: v })}
            linkables={buildLinkableNotes(character.notes)}
            placeholder="Contenido"
            rows={4}
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
          />
```

- [ ] **Step 2: Wire QuestList.tsx**

Add the same import to `src/components/notes/QuestList.tsx`:

```typescript
import { MentionTextarea } from "@/components/notes/MentionTextarea";
```

Replace the content textarea (currently at lines 222-227):

```tsx
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Detalles"
            rows={4}
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
          />
```

with:

```tsx
          <MentionTextarea
            value={form.content}
            onChange={(v) => setForm({ ...form, content: v })}
            linkables={buildLinkableNotes(character.notes)}
            placeholder="Detalles"
            rows={4}
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
          />
```

- [ ] **Step 3: Wire JournalList.tsx (new-entry form)**

Add the same import to `src/components/notes/JournalList.tsx`:

```typescript
import { MentionTextarea } from "@/components/notes/MentionTextarea";
```

Replace the new-entry content textarea (currently at lines 206-214):

```tsx
          <textarea
            value={form.content}
            onChange={(e) =>
              setForm({ ...form, content: e.target.value })
            }
            placeholder="Resumen de la sesión..."
            rows={6}
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
          />
```

with:

```tsx
          <MentionTextarea
            value={form.content}
            onChange={(v) => setForm({ ...form, content: v })}
            linkables={buildLinkableNotes(character.notes)}
            placeholder="Resumen de la sesión..."
            rows={6}
            className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
          />
```

- [ ] **Step 4: Wire JournalList.tsx (edit-entry form)**

Replace the edit-entry content textarea (currently at lines 264-271):

```tsx
              <textarea
                value={editForm.content}
                onChange={(e) =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
                rows={6}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
              />
```

with:

```tsx
              <MentionTextarea
                value={editForm.content}
                onChange={(v) => setEditForm({ ...editForm, content: v })}
                linkables={buildLinkableNotes(character.notes)}
                rows={6}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground resize-none"
              />
```

- [ ] **Step 5: Run full verification**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: `tsc` clean, build succeeds, lint 0 errors (the 2 pre-existing `<img>` warnings in `SettingsTab.tsx`/`SheetTab.tsx` are fine), all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/notes/NoteList.tsx src/components/notes/QuestList.tsx src/components/notes/JournalList.tsx
git commit -m "feat: wire MentionTextarea into Notas, Misiones, and Diario forms"
```

---

### Task 4: Full verification pass

This task produces no code changes on its own — it's a verification gate. If the walkthrough surfaces a real defect, fix it as part of this task and commit the fix; otherwise this task produces no commit.

- [ ] **Step 1: Run the full check suite**

Run: `npx tsc --noEmit && npm run build && npm run lint && npm test`
Expected: 0 lint errors, all tests passing (Task 1's 12 new tests plus the existing 122 = 134 total).

- [ ] **Step 2: Verify `findActiveMention`/`filterLinkables` against the real motivating scenario**

Run: `npx tsx -e '
import { findActiveMention, filterLinkables } from "./src/lib/mention-picker";
import { buildLinkableNotes } from "./src/lib/note-links";

const notes = {
  world: [{ id: "w1", title: "Bar de Nim", content: "", tags: [], createdAt: "", updatedAt: "" }],
  npcs: [{ id: "n1", title: "Riti", content: "", tags: [], createdAt: "", updatedAt: "" }],
  quests: [], journal: [], quick: [],
};
const linkables = buildLinkableNotes(notes as any);

const typed = "vive en el @Bar de N";
const mention = findActiveMention(typed, typed.length);
console.log("mention:", mention);
console.log("suggestions:", filterLinkables(linkables, mention.query));
'`

Expected output: `mention: { start: 11, query: "Bar de N" }` and `suggestions` containing the "Bar de Nim" linkable (and not "Riti", since it doesn't start with "Bar de N").

- [ ] **Step 3: Verify insertion produces linkable content**

Run: `npx tsx -e '
import { linkifyMentions, buildLinkableNotes } from "./src/lib/note-links";

const notes = {
  world: [{ id: "w1", title: "Bar de Nim", content: "", tags: [], createdAt: "", updatedAt: "" }],
  npcs: [], quests: [], journal: [], quick: [],
};
const linkables = buildLinkableNotes(notes as any);

// Simulates what selectSuggestion produces: "@" kept, query replaced with title + space
const afterInsertion = "vive en el @Bar de Nim y trabaja ahi";
console.log(linkifyMentions(afterInsertion, linkables));
'`

Expected output contains `[Bar de Nim](mavok-note://world/w1)` — confirming the insertion format (`@` preserved, title + trailing space) round-trips correctly through the existing `linkifyMentions`.

- [ ] **Step 4: Confirm no stray symlinks or worktree pollution**

Run: `find <repo-root> -maxdepth 3 -type l 2>/dev/null | grep -v node_modules`
Expected: no output.

- [ ] **Step 5: Manual dev-server smoke check**

Start `npm run dev`, `curl -s -o /dev/null -w "http:%{http_code}\n" http://localhost:3000` and expect `http:200`, then stop the dev server. (Chrome DevTools MCP browser tooling is unavailable this session — this substitutes for a live click-through, consistent with how the prior `@mention` linking plan was verified.)

If any step surfaces a real defect, fix it, re-run the full check suite, and commit. If everything passes cleanly, this task produces no commit.
