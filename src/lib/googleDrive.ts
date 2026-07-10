import { parseCharacterJSON } from "./export";
import type { Character } from "./types";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const BACKUP_FOLDER_NAME = "Mavok Backups";
const BACKUP_SCOPE = "https://www.googleapis.com/auth/drive.file";
export const MAX_BACKUPS = 5;

export interface DriveFile {
  id: string;
  name: string;
}

export class DriveAuthError extends Error {}

/**
 * A standalone-display PWA (added to the home screen) can't reliably use
 * popup-based OAuth: the popup's postMessage back to the opener breaks, GIS
 * falls back to a full top-level navigation, and the whole app reloads
 * fresh mid-flow, silently discarding the in-memory token. Detect this so
 * the UI can steer the user to a regular browser tab instead of repeating
 * the same broken flow.
 */
export function isRunningAsStandalonePWA(): boolean {
  if (typeof window === "undefined") return false;
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
    true;
  return window.matchMedia("(display-mode: standalone)").matches || iosStandalone;
}

const BACKUP_FILENAME_PATTERN =
  /^mavok-backup-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})\.json$/;

export function isBackupFilename(name: string): boolean {
  return BACKUP_FILENAME_PATTERN.test(name);
}

export function backupFilename(date: Date = new Date()): string {
  const iso = date.toISOString().slice(0, 19).replace(/:/g, "-");
  return `mavok-backup-${iso}.json`;
}

export function parseBackupTimestamp(name: string): Date | null {
  const match = name.match(BACKUP_FILENAME_PATTERN);
  if (!match) return null;
  const [datePart, timePart] = match[1].split("T");
  const date = new Date(`${datePart}T${timePart.replace(/-/g, ":")}Z`);
  return isNaN(date.getTime()) ? null : date;
}

/** `files` must already be sorted newest-first. */
export function selectFilesToDeleteForRotation(
  files: DriveFile[],
  keep: number = MAX_BACKUPS
): DriveFile[] {
  return files.slice(keep);
}

// --- Google Identity Services auth ---

interface TokenResponse {
  access_token?: string;
  error?: string;
}

interface TokenErrorResponse {
  type: string;
  message?: string;
}

interface TokenClient {
  callback: (response: TokenResponse) => void;
  error_callback: (error: TokenErrorResponse) => void;
  requestAccessToken: (overrides?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback: (error: TokenErrorResponse) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

let tokenClient: TokenClient | null = null;

// GIS doesn't reliably invoke callback/error_callback if the popup is closed
// before the user finishes — without this, the connect button hangs forever.
const AUTH_TIMEOUT_MS = 60_000;

export function initGoogleAuth(clientId: string): void {
  if (tokenClient || typeof window === "undefined" || !window.google) return;
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: BACKUP_SCOPE,
    callback: () => {},
    error_callback: () => {},
  });
}

export function requestGoogleDriveToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error("Google Identity Services no está listo todavía"));
      return;
    }
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("Tiempo de espera agotado — intentá de nuevo"));
    }, AUTH_TIMEOUT_MS);

    tokenClient.callback = (response) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      if (response.error || !response.access_token) {
        reject(new Error(response.error ?? "No se pudo conectar con Google"));
        return;
      }
      resolve(response.access_token);
    };
    tokenClient.error_callback = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      reject(
        new Error(
          error.type === "popup_closed"
            ? "Se cerró la ventana de Google antes de completar el acceso"
            : "No se pudo conectar con Google"
        )
      );
    };
    tokenClient.requestAccessToken({ prompt: "" });
  });
}

// --- Drive API calls ---

async function driveFetch(
  token: string,
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    throw new DriveAuthError("La sesión con Google Drive expiró");
  }
  if (!res.ok) {
    throw new Error(`Error de Google Drive (${res.status})`);
  }
  return res;
}

async function findBackupFolderId(token: string): Promise<string | null> {
  const q = encodeURIComponent(
    `name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const res = await driveFetch(token, `${DRIVE_API}/files?q=${q}&fields=files(id,name)`);
  const data: { files?: DriveFile[] } = await res.json();
  return data.files?.[0]?.id ?? null;
}

async function createBackupFolder(token: string): Promise<string> {
  const res = await driveFetch(token, `${DRIVE_API}/files`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: BACKUP_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });
  const data: { id: string } = await res.json();
  return data.id;
}

async function findOrCreateBackupFolderId(token: string): Promise<string> {
  return (await findBackupFolderId(token)) ?? (await createBackupFolder(token));
}

async function listFilesInFolder(
  token: string,
  folderId: string
): Promise<DriveFile[]> {
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const res = await driveFetch(
    token,
    `${DRIVE_API}/files?q=${q}&orderBy=createdTime desc&fields=files(id,name)`
  );
  const data: { files?: DriveFile[] } = await res.json();
  return (data.files ?? []).filter((f) => isBackupFilename(f.name));
}

async function uploadBackupFile(
  token: string,
  folderId: string,
  character: Character
): Promise<void> {
  const boundary = "mavok-backup-boundary";
  const metadata = { name: backupFilename(), parents: [folderId] };
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${JSON.stringify(character, null, 2)}\r\n` +
    `--${boundary}--`;

  await driveFetch(token, `${DRIVE_UPLOAD_API}/files?uploadType=multipart`, {
    method: "POST",
    headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
    body,
  });
}

async function deleteFile(token: string, fileId: string): Promise<void> {
  await driveFetch(token, `${DRIVE_API}/files/${fileId}`, { method: "DELETE" });
}

export async function backupToGoogleDrive(
  token: string,
  character: Character
): Promise<void> {
  const folderId = await findOrCreateBackupFolderId(token);
  await uploadBackupFile(token, folderId, character);
  const files = await listFilesInFolder(token, folderId);
  const toDelete = selectFilesToDeleteForRotation(files);
  await Promise.all(toDelete.map((f) => deleteFile(token, f.id)));
}

export async function listGoogleDriveBackups(token: string): Promise<DriveFile[]> {
  const folderId = await findBackupFolderId(token);
  if (!folderId) return [];
  return listFilesInFolder(token, folderId);
}

export async function restoreFromGoogleDrive(
  token: string,
  fileId: string
): Promise<Character> {
  const res = await driveFetch(token, `${DRIVE_API}/files/${fileId}?alt=media`);
  return parseCharacterJSON(await res.text());
}
