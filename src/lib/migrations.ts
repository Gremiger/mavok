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

  3: (data) => {
    const d = data as Record<string, unknown>;
    d._version = 3;

    // Add stoneEndurance tracker
    const meta = d.meta as Record<string, unknown> | undefined;
    const profBonus = (meta?.proficiencyBonus as number) || 2;
    const resources = d.resources as Record<string, unknown> | undefined;
    if (resources && !resources.stoneEndurance) {
      resources.stoneEndurance = { total: profBonus, remaining: profBonus };
    }

    // Patch features stored in LocalStorage
    const features = d.features as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(features)) {
      const rage = features.find(f => f.name === 'Rage');
      if (rage) {
        rage.description =
          "Bonus Action para entrar en Rage (no puedes llevar Heavy Armor). " +
          "2 usos — recuperas 1 uso tras descanso corto, todos tras descanso largo. " +
          "Mientras activo: +2 daño en ataques de Fuerza (arma o Unarmed Strike), " +
          "Resistencia a Bludgeoning/Piercing/Slashing, Ventaja en pruebas y salvaciones de FUE. " +
          "No puedes concentrarte ni lanzar hechizos. " +
          "La Rage termina al final de tu siguiente turno salvo que la extiendas atacando, " +
          "forzando una salvación o gastando una Bonus Action. " +
          "Máximo 10 minutos. Termina antes si equipas Heavy Armor o quedas Incapacitated.";
      }

      const giantAncestry = features.find(f => f.name === 'Giant Ancestry: Stone Giant');
      if (giantAncestry) {
        giantAncestry.description =
          "Descendiente de Stone Giants. Boon elegido: Stone's Endurance. " +
          "Usos iguales a tu Proficiency Bonus; se recuperan todos en un descanso largo.";
      }

      const largeForm = features.find(f => f.name === 'Large Form');
      if (largeForm) {
        largeForm.level = 5;
      }

      const hasStoneEndurance = features.some(f => f.name === "Stone's Endurance");
      if (!hasStoneEndurance) {
        features.push({
          name: "Stone's Endurance",
          source: "Goliath",
          description:
            `Reacción: cuando recibes daño, tira 1d12 y añade tu modificador de CON. ` +
            `Reduce el daño entrante por ese total. Usos: ${profBonus} por descanso largo.`,
          level: 1,
        });
      }
    }

    return d;
  },

  4: (data) => {
    const d = data as Record<string, unknown>;
    d._version = 4;

    const meta = d.meta as Record<string, unknown> | undefined;
    if (meta && meta.portraitDataUrl === undefined) {
      meta.portraitDataUrl = null;
    }

    if (d.levelUpHistory === undefined) {
      d.levelUpHistory = [];
    }

    return d;
  },

  5: (data) => {
    const d = data as Record<string, unknown>;
    d._version = 5;

    const inventory = d.inventory as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(inventory)) {
      for (const item of inventory) {
        if (item.value === undefined) {
          item.value = null;
        }
      }
    }

    return d;
  },

  6: (data) => {
    const d = data as Record<string, unknown>;
    d._version = 6;

    const combat = d.combat as Record<string, unknown> | undefined;
    if (combat && combat.recklessActive === undefined) {
      combat.recklessActive = false;
    }

    if (d.quickActions === undefined) {
      d.quickActions = [{ type: "rage" }, { type: "hpAdjust" }];
    }

    return d;
  },
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
