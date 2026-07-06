# Rage Continuation Reminder — Design Spec

## Context

`resources.rpiRages` in `CombatTab.tsx` is a bare on/off toggle (`active: boolean`) with no logic around Rage's actual duration rule. Per `5etools-src/data/class/class-barbarian.json`:

> "Your rage lasts for 1 minute. It ends early if you are knocked unconscious or if your turn ends and you haven't attacked a hostile creature since your last turn or taken damage since then. You can also end your rage on your turn as a bonus action."

Nothing in the app currently reminds the player of this end condition, so it's easy to forget to turn Rage off when it should have ended, and Mavok keeps silently benefiting from Rage effects (extra damage, resistance) past when the rules allow.

The player brainstormed this together with a manual advantage/disadvantage-on-rolls idea, which was dropped: the player rolls physical dice at the table and only uses the app's roller as a rare fallback, so anything about in-app rolling has low value. This app is used primarily for state/bonus tracking, not rolling — which is why a rules reminder tied to existing state (Rage active/inactive) is the right shape of feature, not a new automated turn/round tracker.

## Scope

Out of scope: automatic turn/round tracking, auto-ending Rage, hooking into attack rolls or HP changes to infer whether the condition was met. The app has no notion of "turn" today and this feature does not introduce one. This is a **passive, static reminder** — the player still decides when to toggle Rage off.

## Design

In `src/components/tabs/CombatTab.tsx`, inside the existing Rage bonus-action button (`Acciones adicionales` section), add a hint line matching the existing precedent set by the Reckless Attack hint immediately below it in the same section:

```tsx
{hasRecklessAttack && (
  <button ...>
    ...
    <p className="text-muted/60 text-[0.6rem] mt-0.5">
      Atacantes contra ti tienen ventaja hasta tu próximo turno.
    </p>
  </button>
)}
```

The Rage button gets the same style of line, but conditionally rendered — **only while `rageActive` is true** (unlike the Reckless Attack hint, which is always visible):

```tsx
{rageActive && (
  <p className="text-muted/60 text-[0.6rem] mt-0.5">
    Termina si no atacas a un enemigo ni recibes daño desde tu último turno (o si quedas inconsciente).
  </p>
)}
```

No new state, no new field on `Character`, no migration needed. Purely a conditional render inside the existing Rage button in `CombatTab.tsx`.

## Testing

No new logic to unit test (pure JSX conditional render). Verify visually: dev server, toggle Rage on → hint appears under the button; toggle off → hint disappears. Standard `npx tsc --noEmit && npm run build && npm run lint && npm test` gate applies since it touches a `.tsx` file.
