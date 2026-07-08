# Currency Auto-Simplify, Encyclopedia Cross-Links, Last-Saved Indicator — Design Spec

## Context

Three small, independent quality-of-life features from a brainstorming round:
1. Currency management currently requires manually retyping cp/sp/ep/gp fields to consolidate loose change.
2. Weapon Mastery effect text (e.g. Topple's "...queda Prone.") mentions condition names as plain text, with no link to their full rules description, even though the Combat tab already has a condition-description viewer for the character's own active conditions.
3. This app is LocalStorage-only with silent auto-save on every change (per `useCharacter.ts`); there's no visible confirmation that a save actually happened, which matters for a data store with no backup/cloud by default.

A fourth idea (Google Drive backup/sync) was raised and explicitly parked as its own separate decision — it requires OAuth setup and external Google Cloud configuration outside this codebase, and is out of scope for this spec.

## Scope

- Adds a pure `simplifyCurrency` function and a UI button to consolidate loose coinage.
- Adds a small, standalone condition-name linkifier applied to Weapon Mastery effect text only (deliberately built as a reusable utility, not hardcoded to one call site, so extending it to other text fields later doesn't require a rewrite — but that extension itself is out of scope now).
- Adds a last-saved timestamp display in the Settings tab.
- Out of scope: Google Drive sync (separate future decision), extending condition linkification beyond mastery effects, a live-ticking "saved Xs ago" display (an absolute timestamp is simpler and sufficient).

## Part 1: Currency Auto-Simplify

`src/lib/utils.ts` gains:

```ts
export function simplifyCurrency(currency: Currency): Currency {
  const totalCopper = currency.cp + currency.sp * 10 + currency.ep * 50 + currency.gp * 100;
  const gp = Math.floor(totalCopper / 100);
  const remainder = totalCopper % 100;
  const sp = Math.floor(remainder / 10);
  const cp = remainder % 10;
  return { cp, sp, ep: 0, gp, pp: currency.pp };
}
```

`pp` is left untouched entirely (never folded in, never converted up into). `ep` is always zeroed — its value is folded into the cp/sp/gp total rather than kept as an output denomination, matching the "up to gold only" decision and electrum's rarity at most tables.

`InventoryTab.tsx`'s currency bar gets a "Simplificar" button calling `updateCurrency(simplifyCurrency(currency))`.

## Part 2: Encyclopedia Cross-Links (Mastery Effects)

New file `src/lib/linkifyConditions.tsx`:

```ts
export function linkifyConditions(
  text: string,
  onConditionClick: (name: string) => void
): ReactNode[]
```

Builds a word-boundary regex from every `CONDITIONS` name (from `@/data/conditions`), splits `text` on matches, and returns an array where matched condition names become `<button>` elements (calling `onConditionClick`) and everything else stays as plain text nodes.

`AttackRow.tsx` (where `masteryEffect` text is already rendered) gets a new local state `viewingMasteryCondition: string | null`, deliberately separate from `CombatTab`'s existing `viewingCondition` (which is scoped to the character's *currently active* conditions list and hides itself if that condition is removed — a mastery-effect mention like "Prone" must show info even when the character isn't currently Prone, so it can't reuse that gating). Tapping a linked name toggles an inline description block directly below the mastery effect text, visually consistent with the existing condition-tag popover style but functionally independent.

## Part 3: Last-Saved Indicator

No new `useEffect`. `SettingsTab.tsx` uses the same render-time state-adjustment pattern already established in `AttackFormModal.tsx` (comparing a value against a previous-value state and updating other state directly in the render body when it differs, instead of in an effect):

```ts
const [lastSaved, setLastSaved] = useState<number | null>(null);
const [lastCharacterSeen, setLastCharacterSeen] = useState(character);
if (character !== lastCharacterSeen) {
  setLastCharacterSeen(character);
  setLastSaved(Date.now());
}
```

Since `useCharacter.ts`'s save effect runs essentially immediately after any character state change commits, treating "the `character` reference changed" as "it was just saved" is accurate for a human-facing reassurance display. Rendered as "Guardado: HH:MM:SS" (via `toLocaleTimeString()`) next to the existing `Data v{CURRENT_DATA_VERSION}` line in the About footer section — no ticking interval, no new effect, no lint suppression needed.

## Testing

`simplifyCurrency` gets pure-function unit tests in `utils.test.ts`: basic consolidation (e.g. 25cp/13sp/2gp → correct cp/sp/gp), `pp` left untouched, `ep` zeroed and folded into the total, all-zero input stays zero. `linkifyConditions` gets unit tests in a new `linkifyConditions.test.ts`: a condition name embedded mid-sentence becomes a clickable segment, plain text with no condition mentions returns unchanged, multiple distinct condition mentions in one string all become separate clickable segments, and word-boundary matching doesn't false-positive on a condition name that's a substring of a longer unrelated word. The last-saved indicator and the mastery-effect popover UI are interaction, not pure logic — verify by hand in a browser. Standard `npx tsc --noEmit && npm run build && npm run lint && npm test` gate applies.
