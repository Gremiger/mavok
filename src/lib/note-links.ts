import type { Notes } from "./types";

export interface LinkableNote {
  id: string;
  section: "world" | "npcs" | "quests" | "journal";
  title: string;
}

export function buildLinkableNotes(notes: Notes): LinkableNote[] {
  return [
    ...notes.npcs.map((n) => ({
      id: n.id,
      section: "npcs" as const,
      title: n.title,
    })),
    ...notes.world.map((n) => ({
      id: n.id,
      section: "world" as const,
      title: n.title,
    })),
    ...notes.quests.map((q) => ({
      id: q.id,
      section: "quests" as const,
      title: q.title,
    })),
    ...notes.journal.map((j) => ({
      id: j.id,
      section: "journal" as const,
      title: j.title,
    })),
  ];
}

export function linkifyMentions(
  content: string,
  linkables: LinkableNote[]
): string {
  if (!content.includes("@") || linkables.length === 0) return content;

  const sorted = [...linkables].sort(
    (a, b) => b.title.length - a.title.length
  );
  let result = "";
  let i = 0;
  while (i < content.length) {
    if (content[i] === "@") {
      const rest = content.slice(i + 1);
      const match = sorted.find((l) => {
        if (l.title.length === 0) return false;
        if (!rest.toLowerCase().startsWith(l.title.toLowerCase())) {
          return false;
        }
        const nextChar = rest[l.title.length];
        return nextChar === undefined || !/[a-zA-Z0-9]/.test(nextChar);
      });
      if (match) {
        const matchedText = rest.slice(0, match.title.length);
        result += `[${matchedText}](mavok-note://${match.section}/${match.id})`;
        i += 1 + match.title.length;
        continue;
      }
    }
    result += content[i];
    i++;
  }
  return result;
}

export function parseNoteLink(
  href: string
): { section: LinkableNote["section"]; id: string } | null {
  const match = href.match(
    /^mavok-note:\/\/(world|npcs|quests|journal)\/(.+)$/
  );
  if (!match) return null;
  return { section: match[1] as LinkableNote["section"], id: match[2] };
}
