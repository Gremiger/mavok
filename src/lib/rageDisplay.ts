// Barbarian rages progress 2→3→4→5→6 across levels 1-20 (src/data/barbarian-progression.ts,
// XPHB — there is no "unlimited" tier in this ruleset). Individual pips read fine up to 4;
// beyond that they'd cram too many small circles into the vitals header, so they collapse
// into a single numeral badge instead.
export function shouldUseRageBadge(total: number): boolean {
  return total > 4;
}
