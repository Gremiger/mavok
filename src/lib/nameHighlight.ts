// Splits a character name so the header can ink the second name word
// (up to its first hyphen) in seal red: "Mavok [Toro]-de-casa Toduk-Rojum".
export function splitNameHighlight(name: string): {
  before: string;
  highlight: string;
  after: string;
} {
  const trimmed = name.trim();
  const m = /^(\S+\s+)([^\s-]+)(.*)$/.exec(trimmed);
  if (!m) return { before: trimmed, highlight: "", after: "" };
  return { before: m[1], highlight: m[2], after: m[3] };
}
