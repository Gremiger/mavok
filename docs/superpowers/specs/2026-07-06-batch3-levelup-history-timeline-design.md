# Batch 3: Level-Up History Timeline — Design

Part of the same brainstorm of app improvements as Batches 1-2. This spec covers Batch 3: upgrading the existing level-up history from a flat Settings list into a richer timeline popup.

## Existing state (discovered during design, not previously known)

`SettingsTab.tsx:349-379` already renders `character.levelUpHistory` as a reverse-chronological flat list (level, date, ASI choice, feat chosen). `LevelUpHistoryEntry` (`types.ts`) only stores `{ level, date, asiChoice?, featChosen? }`. `LevelUpFlow.tsx` computes an HP increase per level-up (`hpIncrease`, `LevelUpFlow.tsx:123`) and applies it to `combat.maxHp`/`currentHp` (`LevelUpFlow.tsx:193-195`), but never saves that value into the history entry. Separately, `character.features` already tags every feature with the level it was gained at (`Feature.level`), so which class/subclass features were unlocked at any given level is fully derivable today — it's just never cross-referenced against the history entries. This batch surfaces both of those already-available-but-unsurfaced facts (HP gained, features gained) and restyles the presentation as a connected vertical timeline shown in a popup instead of an inline Settings list.

## Data model change

One migration bump (v6 → v7, `CURRENT_DATA_VERSION` in `src/lib/types.ts`):

```ts
export interface LevelUpHistoryEntry {
  level: number;
  date: string;
  asiChoice?: string;
  featChosen?: string;
  hpIncrease?: number;
}
```

`hpIncrease` is optional and populated only going forward — there is no way to recover the HP roll for level-ups that already happened, so old/migrated entries simply omit it (the UI treats its absence as "no data recorded for this entry", not an error). The v7 migration itself does nothing beyond bumping `_version` — there's no data to backfill.

`LevelUpFlow.tsx`'s existing history-push (`LevelUpFlow.tsx:292-300`) gains one field:

```ts
updated.levelUpHistory = [
  ...updated.levelUpHistory,
  {
    level: newLevel,
    date: new Date().toISOString(),
    asiChoice,
    featChosen: changes.feat?.name,
    hpIncrease: changes.hpIncrease,
  },
];
```

## Timeline popup component

New `src/components/settings/LevelUpHistoryModal.tsx`, a `Modal` (reusing `src/components/ui/Modal.tsx`) opened from Settings. Renders a vertical connected timeline (a line with a dot per level), in **chronological** order (level 1 → current) — the reverse of today's list, since a timeline reads naturally as forward progression.

**Level 1 node** is synthesized, not read from `levelUpHistory` (which only logs level-up *transitions*, never the starting level): shows Mavok's starting features via `character.features.filter(f => f.level === 1)`. No ASI/feat/HP line for this node — there's nothing to show for character creation.

**Each subsequent node** (one per `levelUpHistory` entry, in array order): a level badge and formatted date; `+{hpIncrease} HP` only when `hpIncrease !== undefined` (omitted entirely for older entries with no recorded value, not shown as "+undefined" or "—"); the existing ASI-or-feat-chosen line (`[entry.asiChoice, entry.featChosen].filter(Boolean).join(" · ") || "—"`, unchanged from today's logic); and a "Features gained" list built from `character.features.filter(f => f.level === entry.level)` — this naturally includes barbarian class features, subclass features, and the full feat entry (name + description) if a feat was chosen that level, with no duplication against the ASI/feat line above (that line shows the choice name for a quick scan; the features list shows the full description for whoever taps in).

Each item in the "Features gained" list is tappable: tapping expands that feature's description inline beneath it (reusing the exact tap-to-expand pattern Batch 1 introduced for conditions in `CombatTab.tsx` — same interaction, no new pattern to learn), tapping again collapses it.

## Settings integration

The existing `CollapsibleSection title="Historial de niveles"` block (`SettingsTab.tsx:349-379`) is replaced with a single button, "Ver historial completo", that opens `LevelUpHistoryModal`. No list is rendered inline in Settings anymore — the section becomes a one-line launcher, consistent with the ask to not have the (now richer, taller) history content take up permanent space on the Settings screen.

## Out of scope

- Any other batch's work (Combat rules accuracy, Technical hardening)
- Backfilling `hpIncrease` for historical entries (impossible — the data was never recorded)
- Changes to the level-up wizard flow itself beyond the one added field
