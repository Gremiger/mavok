export function stripMarkup(text: string): string {
  let prev: string;
  do {
    prev = text;
    text = text
      .replace(/\{@\w+\s+([^|}]+?)(?:\|[^}]*)?\}/g, "$1")
      .replace(/\{@dc\s+(\d+)\}/g, "DC $1");
  } while (text !== prev);
  return text;
}

export function flattenEntries(entries: unknown[]): string {
  const parts: string[] = [];
  for (const e of entries) {
    if (typeof e === "string") {
      parts.push(stripMarkup(e));
    } else if (typeof e === "object" && e !== null) {
      const obj = e as Record<string, unknown>;
      if (obj.name) parts.push(`**${obj.name}:** `);
      if (Array.isArray(obj.entries)) {
        parts.push(flattenEntries(obj.entries));
      }
      if (Array.isArray(obj.items)) {
        parts.push(flattenEntries(obj.items));
      }
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
