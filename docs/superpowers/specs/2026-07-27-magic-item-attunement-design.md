# Magic Item Attunement Tracking + Quick-Pick — Design

## Problem

`MAGIC_ITEMS` (`src/data/magic-items.ts`) carries `requiresAttunement` per
catalog entry, and it's already surfaced read-only in Enciclopedia
(`EncyclopediaTab.tsx:213`). But `InventoryItem` (`src/lib/types.ts:125`)
has no attunement state at all, and `ItemFormModal.tsx` has quick-pick
dropdowns for Arma/Armadura/Equipo (`prefillFromWeapon/Armor/Gear`,
lines 153-193 and 202-260) but none for magic items — creating a magic
item today means typing everything from scratch, including its magic
bonuses, by hand.

This design adds two related things:
1. **Attunement tracking**: mark which inventory items are attuned,
   with an informational counter/warning if you pass 3 (the D&D cap).
2. **Magic item quick-pick**: a fourth dropdown in `ItemFormModal`,
   listing `MAGIC_ITEMS`, that prefills name/description/category and
   the new "requires attunement" checkbox from the catalog — same
   convenience the existing three pickers already give for mundane
   gear.

## Scope Decision: Informational, Not Enforced

Per discussion, magic bonus application stays exactly as it is today —
gated only on `equipped` (`recalculate.ts`). Attunement does **not**
gate whether a bonus counts. Mavok is a single-player self-maintained
sheet where bonuses are already hand-entered and trusted; enforcing the
attunement rule would mean editing `recalculate.ts`'s bonus-summing
logic for comparatively low value, and risks silently dropping a bonus
the player forgot to flag as attuned (a confusing AC/attack swing with
no on-screen explanation). The counter is purely a reminder.

## Data Model

Add two fields to `InventoryItem` (`src/lib/types.ts:125`):

```typescript
requiresAttunement: boolean;
attuned: boolean;
```

Both default `false`. This needs:
- `CURRENT_DATA_VERSION` bumped from 12 to 13 (`src/lib/types.ts:3`)
- A new migration `13` in `src/lib/migrations.ts` (following the
  pattern of migration `12` at line 219) that backfills every inventory
  item with `requiresAttunement: false, attuned: false` if either field
  is undefined
- `src/data/mavok-default.ts`'s 16 existing inventory entries updated to
  include both new fields (`requiresAttunement: false, attuned: false`),
  matching the existing inline-object-literal style already used there

Both fields are manually toggled per item (like `equipped` already is)
— not derived by matching the item's `name` against `MAGIC_ITEMS` at
render time. The quick-pick (below) is the one place the catalog's
`requiresAttunement` value gets copied in, as a one-time prefill the
user can still edit afterward — consistent with how the existing
weapon/armor/gear pickers prefill `description` today.

## ItemFormModal Changes

**New quick-pick** ("Objeto mágico rápido"), added alongside the
existing Arma/Armadura/Equipo pickers (inside the `!item &&` block,
`ItemFormModal.tsx:202-260` — quick-picks only show when adding a new
item, not editing):

```tsx
<div>
  <label className="text-xs text-muted">Objeto mágico rápido</label>
  <select
    onChange={(e) => {
      if (e.target.value) prefillFromMagicItem(e.target.value);
      e.target.value = "";
    }}
    className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground mt-1"
    defaultValue=""
  >
    <option value="">Elegir objeto mágico...</option>
    {MAGIC_ITEMS.map((m) => (
      <option key={m.name} value={m.name}>
        {m.name} ({m.rarity})
      </option>
    ))}
  </select>
</div>
```

```typescript
function prefillFromMagicItem(itemName: string) {
  const m = MAGIC_ITEMS.find((mi) => mi.name === itemName);
  if (m) {
    setForm({
      ...form,
      name: m.name,
      category:
        m.itemType === "weapon"
          ? "weapon"
          : m.itemType === "armor"
            ? "armor"
            : "gear",
      description: m.description,
      requiresAttunement: m.requiresAttunement,
      attuned: false,
    });
  }
}
```

This does not prefill `magicBonus`/`magicAttackBonus`/`magicDamageBonus`
— the catalog only has descriptive text for these, not structured
numbers, so those three fields stay manual entry exactly as they are
today for every item type.

**New checkboxes**, placed near the magic bonus section
(`ItemFormModal.tsx:323-355`, after the `magicBonus` input):

```tsx
<label className="flex items-center gap-1.5 text-xs text-foreground">
  <input
    type="checkbox"
    checked={form.requiresAttunement}
    onChange={(e) =>
      setForm({
        ...form,
        requiresAttunement: e.target.checked,
        attuned: e.target.checked ? form.attuned : false,
      })
    }
  />
  Requiere sintonía
</label>

{form.requiresAttunement && (
  <label className="flex items-center gap-1.5 text-xs text-foreground">
    <input
      type="checkbox"
      checked={form.attuned}
      onChange={(e) => setForm({ ...form, attuned: e.target.checked })}
    />
    Sintonizado
  </label>
)}
```

Unchecking "Requiere sintonía" also clears `attuned` (an item that
doesn't require attunement can't be "attuned"), mirroring the same
defensive pattern the existing `magicBonus`/`magicBonusTargets` pair
already uses (clearing targets when the bonus is cleared,
`ItemFormModal.tsx:133-134`).

Both `EMPTY_FORM` (`ItemFormModal.tsx:19-36`) and `formFromItem()`
(`ItemFormModal.tsx:38-...`) need `requiresAttunement: false` and
`attuned: false` added — `EMPTY_FORM` as static defaults, `formFromItem`
as `item.requiresAttunement`/`item.attuned` copies, the same way every
other field already does in both places. `handleSave()`'s `saved`
object (`ItemFormModal.tsx:124-139`) needs
`requiresAttunement: form.requiresAttunement, attuned: form.attuned,`
added alongside the other copied fields.

## InventoryTab Changes

**Counter above the list** (after the Search/Sort/Filter block,
`InventoryTab.tsx:292`, before the `{/* Inventory List */}` comment):

```tsx
{(() => {
  const attunedCount = inventory.filter((i) => i.attuned).length;
  if (attunedCount === 0) return null;
  return (
    <p
      className={`text-xs ${attunedCount > 3 ? "text-danger" : "text-muted"}`}
    >
      Sintonizados: {attunedCount}/3
    </p>
  );
})()}
```

Only rendered when at least one item is attuned (no need to show
"Sintonizados: 0/3" on a fresh inventory).

**Per-item chip**: in the item row (`InventoryTab.tsx:328-349`,
alongside the existing magic-bonus indicator span), add:

```tsx
{item.attuned && (
  <span className="text-[0.6rem] px-1.5 py-0.5 bg-accent/20 text-accent rounded ml-1">
    Sintonizado
  </span>
)}
```

## Testing

No new pure-logic module is introduced — the attunement count and the
`>3` check are trivial inline expressions in a UI file, consistent with
how the existing weight-footer math is untested inline JSX today
(`CLAUDE.md`: "No component/UI tests yet"). `migrations.test.ts` gets a
new case for migration `13`, following the existing pattern for prior
version migrations in that file — verifying an old-format inventory
item (missing `requiresAttunement`/`attuned`) backfills both to `false`,
and that an item already having both fields is left untouched.

## Out of Scope

- Enforcing the attunement rule in `recalculate.ts` (explicitly declined)
- Auto-detecting `requiresAttunement` by matching an item's `name`
  against `MAGIC_ITEMS` at render/recalculate time — the quick-pick is
  the only place catalog data flows in, and only as a one-time prefill
- Any change to `MAGIC_ITEMS`/`magic-items.ts` itself — the catalog data
  is untouched
