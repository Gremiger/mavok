import { CURRENT_DATA_VERSION } from "./types";

type MigrationFn = (data: Record<string, unknown>) => Record<string, unknown>;

const MIGRATIONS: Record<number, MigrationFn> = {
  // v0/v1 → v2: add _version, add rage slots array
  2: (data) => {
    const d = data as Record<string, unknown>;
    d._version = 2;

    const resources = d.resources as Record<string, unknown> | undefined;
    if (resources) {
      const rages = resources.rpiRages as Record<string, unknown> | undefined;
      if (rages) {
        const total = (rages.total as number) || 2;
        const remaining = (rages.remaining as number) || total;
        if (!Array.isArray(rages.slots) || (rages.slots as unknown[]).length !== total) {
          rages.slots = Array.from({ length: total }, (_, i) => i < remaining);
        }
      }
    }

    return d;
  },

  // Future migrations go here:
  // 3: (data) => { ... return data; },
};

const BACKUP_PREFIX = "mavok_backup_pre_migration_";

export function migrateCharacterData(raw: string): { data: string; migrated: boolean } {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { data: raw, migrated: false };
  }

  const currentVersion = (parsed._version as number) || 1;

  if (currentVersion >= CURRENT_DATA_VERSION) {
    return { data: raw, migrated: false };
  }

  // Auto-backup before any migration
  try {
    const backupKey = `${BACKUP_PREFIX}v${currentVersion}_${Date.now()}`;
    localStorage.setItem(backupKey, raw);
    pruneOldBackups();
  } catch {
    // Storage full — proceed anyway, the migration is more important
  }

  try {
    let data = parsed;
    for (let v = currentVersion + 1; v <= CURRENT_DATA_VERSION; v++) {
      const migrate = MIGRATIONS[v];
      if (migrate) {
        data = migrate(data);
      }
      data._version = v;
    }
    return { data: JSON.stringify(data), migrated: true };
  } catch {
    // Migration failed — return original data untouched
    return { data: raw, migrated: false };
  }
}

function pruneOldBackups() {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(BACKUP_PREFIX));
  if (keys.length > 5) {
    keys.sort();
    for (const key of keys.slice(0, keys.length - 5)) {
      localStorage.removeItem(key);
    }
  }
}

export function getBackups(): { key: string; version: number; date: Date }[] {
  return Object.keys(localStorage)
    .filter((k) => k.startsWith(BACKUP_PREFIX))
    .map((key) => {
      const match = key.match(/v(\d+)_(\d+)$/);
      return {
        key,
        version: match ? parseInt(match[1]) : 0,
        date: match ? new Date(parseInt(match[2])) : new Date(),
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function restoreBackup(key: string, characterKey: string): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      localStorage.setItem(characterKey, raw);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
