# Google Drive Backup/Restore — Design Spec

## Context

Mavok is a static-export PWA with no backend — all data lives in a single browser's LocalStorage. The only existing backup mechanisms are a manual local JSON download (`exportCharacterJSON` in `src/lib/export.ts`) and automatic pre-migration snapshots kept in LocalStorage itself (`getBackups`/`restoreBackup` in `src/lib/migrations.ts`) — neither survives losing the device or clearing browser storage. This adds an optional, manually-triggered cloud backup to Google Drive, reusing the existing JSON export shape and the existing import-preview UI pattern.

## Scope

- Adds a "Conectar con Google Drive" flow using Google Identity Services (GIS), entirely client-side — no backend, no server-held secrets, consistent with `output: 'export'`.
- Adds a manual "Subir a Google Drive" backup button and a "Restaurar desde Google Drive" list, both in Ajustes.
- Out of scope: automatic/background backup, two-way sync, conflict resolution, any change to the `Character` schema or data version.

## Prerequisite: Google Cloud OAuth setup (user action, one-time)

Before implementation can be tested end-to-end, the user creates an OAuth Client ID in Google Cloud Console (walked through step-by-step during implementation): new project → configure OAuth consent screen as "Testing" with their own Gmail as a test user → create a "Web application" OAuth Client ID → add `http://localhost:3000` and the production Vercel domain as Authorized JavaScript origins (no redirect URIs needed — GIS's token-client flow uses a popup, not a redirect). The resulting Client ID is not sensitive and is added as `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `next.config.ts`'s `env` block, alongside the existing `NEXT_PUBLIC_COMMIT_SHA`.

## Auth Flow

- GIS's script (`https://accounts.google.com/gsi/client`) is lazy-loaded via Next's `<Script>` component — not render-blocking.
- Scope: `https://www.googleapis.com/auth/drive.file` — restricted to files/folders this app creates; it can never see the rest of the user's Drive.
- "Conectar con Google Drive" button (shown when not connected) opens `google.accounts.oauth2.initTokenClient(...).requestAccessToken()`, a popup-based flow. On success, the access token (~1 hour lifetime) is held only in React state — never written to LocalStorage, since it's a live credential, not app data.
- No refresh-token persistence: reconnecting is required after every app reload/reopen. This is acceptable because backup/restore are already deliberate, manual, infrequent actions, not background ones.
- When a Drive call fails with 401 (expired token), the UI falls back to showing "Conectar con Google Drive" again rather than silently retrying.
- Once connected, the button is replaced by "Google Drive conectado" plus the backup/restore controls below.

## Backup Flow

New module `src/lib/googleDrive.ts` wraps Drive REST API v3 calls (`fetch` with the access token as a Bearer header — no SDK dependency). "Subir a Google Drive" triggers:

1. Find a folder literally named `Mavok Backups` under Drive root (`files.list` with a name+mimeType query, `trashed = false`); create it (`files.create`) if not found.
2. Upload the current character JSON (identical shape to the existing local export) as a new file named `mavok-backup-<timestamp>.json` inside that folder, where `<timestamp>` is `YYYY-MM-DDTHH-mm-ss` (colons replaced with hyphens — filesystem/URL-safe, matches what you'd get if you ever downloaded the file locally too).
3. List files in the folder whose name matches the `mavok-backup-*.json` pattern (see "Rotation safety" below), sorted by creation time descending. If more than 5 remain, delete the oldest beyond 5 (`files.delete`).
4. Toast confirms success or failure, matching the existing toast style used elsewhere in Ajustes (e.g. `toast.error("Error al restaurar backup")`).

**Rotation safety**: the `Mavok Backups` folder is visible in the user's normal Drive, so they could manually add unrelated files to it. Both the rotation-delete step and the restore list (below) filter to the `mavok-backup-*.json` naming pattern first, so a manually-added file is never touched or mistaken for a character backup.

If step 3's delete call fails (e.g. transient network error), the folder is simply left with 6 files instead of 5 — not a correctness problem, and it self-corrects on the next backup.

## Restore Flow

An expandable "Restaurar desde Google Drive" section in Ajustes, next to the existing local-backup list:

- Lists the up-to-5 `mavok-backup-*.json` files in the folder (display name + parsed timestamp, newest first).
- If the folder doesn't exist yet or contains no matching files, shows "No hay backups en Google Drive todavía" instead of an empty list or an error.
- Tapping an entry fetches its content (`files.get?alt=media`), parses it, and feeds it into the **same** `importPreview` state / preview-then-confirm modal that local JSON import already uses in `SettingsTab.tsx` — no new confirmation UI.
- Since `importCharacterJSON` currently takes a `File` (via `FileReader`), a new `parseCharacterJSON(text: string): Character` helper is added to `src/lib/export.ts`, extracting the shared JSON-parsing logic so both the file-based and Drive-fetched-text paths use the same parser.

## Error Handling

Every failure path — popup dismissed/blocked, expired token, offline, Drive API error (quota, 4xx/5xx) — surfaces as a toast with a short Spanish message. No retries, no request queuing, consistent with the manual-trigger simplicity of the rest of this feature.

## Data Model

No changes to the `Character` interface, no `CURRENT_DATA_VERSION` bump, no migration — this feature only moves existing JSON around, it doesn't add fields to it.

New files/changes:
- `src/lib/googleDrive.ts` (new): auth token helper, folder lookup/create, upload, list+filter+rotate, get, delete.
- `src/lib/export.ts`: adds `parseCharacterJSON(text: string): Character`, refactors `importCharacterJSON` to use it internally.
- `src/components/tabs/SettingsTab.tsx`: adds the connect button, backup button, and restore list, wired to `googleDrive.ts` and the existing `importPreview` flow.
- `next.config.ts`: adds `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to the `env` block.

## Testing

Pure logic in `googleDrive.ts` gets unit tests with `fetch` mocked: filename generation (timestamp formatting), filename-pattern filtering (ignoring non-matching files), and rotation selection (given a list of matching files, which ones get deleted once there are more than 5). `parseCharacterJSON` gets a test for valid and invalid JSON input. The OAuth popup and live Drive calls aren't testable in Vitest and are verified by hand in a browser during implementation, using a real Google account. Standard `npx tsc --noEmit && npm run build && npm run lint && npm test` gate applies before commit.
