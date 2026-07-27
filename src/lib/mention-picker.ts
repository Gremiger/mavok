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
