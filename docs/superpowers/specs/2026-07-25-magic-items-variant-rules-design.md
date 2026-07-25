# Named magic items and rules glossary in Enciclopedia

## Problem

Exploring `../dnd/5etools-src/data` against what `scripts/extract-5etools.ts`
currently extracts turned up two whole categories of 2024-rules reference data
that the app never surfaces anywhere:

1. **Named magic items.** `InventoryItem` already supports generic numeric
   magic bonuses (`magicBonus`, `magicAttackBonus`, `magicDamageBonus`) and,
   as of a recent change, `resolveItemDescription()` falls back to the
   `WEAPONS`/`ARMOR`/`GEAR` catalogs when an item's own `description` is
   empty. But there's no catalog at all for actual named magic items (e.g.
   "Axe of the Dwarvish Lords") — if Mavok finds one, there's no reference
   text to fall back to, and no way to look one up in Enciclopedia.
2. **Rules glossary.** `variantrules.json` sounds like it holds optional/DMG
   variant subsystems, but for the `XPHB` source it's actually the entire
   2024 Player's Handbook rules glossary appendix — 114 entries like
   "Advantage," "Bonus Action," "Cover," "Opportunity Attack." Enciclopedia
   has no rules-reference category at all today.

## Approach

### Data source scoping

- **Magic items**: `../dnd/5etools-src/data/items.json`, filtered to
  `source === "XDMG"` (the 2024 Dungeon Master's Guide — the PHB has no
  magic item catalog, so this is the only real 2024-rules source for this
  data) **and** `rarity` present and not `"none"`/`"unknown"`. This yields
  435 items across common (47), uncommon (111), rare (127), very rare (88),
  legendary (50), and artifact (12). This is a scope expansion beyond the
  project's prior "XPHB-only" extraction precedent — confirmed acceptable:
  XDMG is still official 2024 rules, just from the companion DM-facing book
  rather than the player-facing one.
- Deliberately **out of scope**: `magicvariants.json` (generic combinable
  variants like "+1 Weapon" that get merged with a base item at generation
  time by the 5etools tooling — no `source` field of their own, and the
  numeric-bonus case they mostly cover is already handled by
  `InventoryItem.magicBonus`/`magicAttackBonus`/`magicDamageBonus`). Only
  items.json's standalone named XDMG entries are extracted.
- **Rules glossary**: `../dnd/5etools-src/data/variantrules.json`, filtered
  to `source === "XPHB"` — 114 entries, all tagged `ruleType: "C"` (core),
  confirming there's no separate "true variant rule" subset to split out for
  this source.

### `flattenEntries` gap: nested lists are silently dropped

`scripts/extract-5etools.ts`'s shared `flattenEntries` helper (used by every
existing extraction — conditions, actions, gear, feats, spells) recurses
into an object's `.entries` array and prefixes a named sub-section with
`**Name:**`, but 5etools' `{"type": "list", "items": [...]}` nodes use
`.items`, not `.entries` — so `flattenEntries` silently drops them entirely
today. This has had no visible effect so far because none of the currently
extracted categories happen to use nested lists in their source entries, but
26 of the 435 XDMG magic items (~6%) do — e.g. "Axe of the Dwarvish Lords"
has a "Blessings of Moradin" section listing 5 named benefits
(Darkvision, Fortitude of Stone, Gifts of the Creator, One with the Forge,
Sunder) entirely inside a `type: "list"` node.

**Fix**: extend `flattenEntries` to also recurse into `obj.items` when
present, treating each list item exactly like a named sub-section
(`**ItemName:** flattened item text`, or just the flattened text if the
list item has no `name`). This keeps the existing "collapse everything into
one flowing paragraph" convention every other category already relies on
(no real bullet points, no preserved newlines) — a minimal, low-risk fix
scoped to not silently lose data, not a rendering/UX change. Fixing it in
the shared helper benefits any future extraction that hits the same shape,
not just magic items.

### New data files

`src/data/magic-items.ts`:
```ts
export interface MagicItemData {
  name: string;
  rarity: string;
  itemType: "weapon" | "armor" | "wondrous";
  requiresAttunement: boolean;
  description: string;
}
export const MAGIC_ITEMS: MagicItemData[] = [...];
```
`itemType` derives from the source item's `type` field (`M|...`/`R|...` →
`"weapon"`, `LA|.../MA|.../HA|.../S|...` → `"armor"`, otherwise
`wondrous: true` or no type at all → `"wondrous"`).

`src/data/variant-rules.ts`:
```ts
export interface VariantRuleData {
  name: string;
  description: string;
}
export const VARIANT_RULES: VariantRuleData[] = [...];
```

### Enciclopedia wiring

Two new entries in `EncyclopediaTab.tsx`'s `CATEGORIES` array (`magicItems` →
"Objetos mágicos", `rules` → "Reglas") and two new `buildXItems()` functions
following the existing `mapItems` pattern exactly (see `buildWeaponItems`/
`buildFeatItems` for the shape). Magic items get a stat block: Rareza
(translated: común/poco común/raro/muy raro/legendario/artefacto), Tipo
(Arma/Armadura/Maravilloso), and Sintonización ("Sí", only shown when
`requiresAttunement` is true — omitted otherwise, same `.filter(Boolean)`
pattern already used for optional stat-block rows elsewhere in this file).
Rules get no stat block (same as Condiciones/Acciones — just a description).
Neither category has a Spanish translation entry in `TRANSLATIONS` — that's
consistent with Armas/Armaduras/Equipo/Dotes, none of which have one either.

### `resolveItemDescription` wiring

`src/lib/inventory.ts` gains a fourth link in the existing fallback chain,
after `GEAR`:
```ts
const magicItem = MAGIC_ITEMS.find((m) => m.name === item.name);
return magicItem?.description ?? "";
```
placed last so a mundane item's name (e.g. a custom "Rope") never loses to
an obscure magic item that happens to share the name — weapons/armor/gear
are checked first, magic items are the final, most-specific-but-least-likely
fallback.

## Data model / migrations

No `Character` or `InventoryItem` schema changes, no migration —
`MagicItemData`/`VariantRuleData` are generated reference data files, exactly
like every other file in `src/data/`.

## Testing

- Extend `src/lib/inventory.test.ts` with a fifth case: an item whose name
  matches a known, stable `MAGIC_ITEMS` entry and has an empty
  `description`, asserting `resolveItemDescription` returns the real magic
  item text.
- No test file exists yet for `scripts/extract-5etools.ts` (confirmed: no
  `scripts/*.test.ts` in the repo). Create
  `scripts/extract-5etools.test.ts`, the first test for this script,
  covering just the `flattenEntries` list-node fix: a synthetic
  `{"type": "list", "items": [{"type": "item", "name": "X", "entries":
  ["Y"]}]}` input should produce output containing both "X" and "Y", where
  today it would produce neither. `flattenEntries` is not currently
  exported — export it for this test (a one-line change, no behavior
  change).
- Manual verification per `CLAUDE.md`: run the dev server, open Enciclopedia,
  confirm "Objetos mágicos" and "Reglas" appear as new tabs, open "Axe of the
  Dwarvish Lords" specifically and confirm all 5 "Blessings of Moradin"
  benefits appear in the text (this is the concrete, real-data proof the
  `flattenEntries` fix works, not just a synthetic test).
- `npx tsc --noEmit && npm run build && npm run lint && npm test` must all
  pass.
