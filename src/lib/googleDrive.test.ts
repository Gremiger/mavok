import { describe, it, expect, afterEach, vi } from "vitest";
import {
  backupFilename,
  isBackupFilename,
  parseBackupTimestamp,
  selectFilesToDeleteForRotation,
  isRunningAsStandalonePWA,
  MAX_BACKUPS,
  type DriveFile,
} from "./googleDrive";

describe("backupFilename", () => {
  it("formats a date into the mavok-backup-<timestamp>.json pattern with colons replaced", () => {
    const date = new Date("2026-07-08T15:42:03.000Z");
    expect(backupFilename(date)).toBe("mavok-backup-2026-07-08T15-42-03.json");
  });
});

describe("isBackupFilename", () => {
  it("matches a well-formed backup filename", () => {
    expect(isBackupFilename("mavok-backup-2026-07-08T15-42-03.json")).toBe(true);
  });

  it("rejects an unrelated filename a user might drop in the folder", () => {
    expect(isBackupFilename("vacation-photo.json")).toBe(false);
    expect(isBackupFilename("mavok-backup-2026-07-08.json")).toBe(false);
  });
});

describe("parseBackupTimestamp", () => {
  it("recovers the original Date from a backup filename", () => {
    const date = parseBackupTimestamp("mavok-backup-2026-07-08T15-42-03.json");
    expect(date?.toISOString()).toBe("2026-07-08T15:42:03.000Z");
  });

  it("returns null for a non-matching filename", () => {
    expect(parseBackupTimestamp("notes.txt")).toBeNull();
  });
});

describe("selectFilesToDeleteForRotation", () => {
  function makeFiles(count: number): DriveFile[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `id-${i}`,
      name: `mavok-backup-file-${i}.json`,
    }));
  }

  it("keeps the newest files and selects the rest (beyond MAX_BACKUPS) for deletion", () => {
    const files = makeFiles(7);
    const toDelete = selectFilesToDeleteForRotation(files);
    expect(toDelete).toEqual(files.slice(MAX_BACKUPS));
    expect(toDelete).toHaveLength(2);
  });

  it("selects nothing when at or under the limit", () => {
    expect(selectFilesToDeleteForRotation(makeFiles(5))).toHaveLength(0);
    expect(selectFilesToDeleteForRotation(makeFiles(3))).toHaveLength(0);
  });

  it("respects a custom keep count", () => {
    const files = makeFiles(4);
    expect(selectFilesToDeleteForRotation(files, 2)).toEqual(files.slice(2));
  });
});

describe("isRunningAsStandalonePWA", () => {
  function mockMatchMedia(matches: boolean) {
    window.matchMedia = vi.fn().mockReturnValue({ matches } as MediaQueryList);
  }

  afterEach(() => {
    // @ts-expect-error -- jsdom doesn't define matchMedia; clean up our stub
    delete window.matchMedia;
    Object.defineProperty(window.navigator, "standalone", {
      value: undefined,
      configurable: true,
    });
  });

  it("returns true when display-mode: standalone matches", () => {
    mockMatchMedia(true);
    expect(isRunningAsStandalonePWA()).toBe(true);
  });

  it("returns true when navigator.standalone is set (iOS Safari)", () => {
    mockMatchMedia(false);
    Object.defineProperty(window.navigator, "standalone", {
      value: true,
      configurable: true,
    });
    expect(isRunningAsStandalonePWA()).toBe(true);
  });

  it("returns false in a regular browser tab", () => {
    mockMatchMedia(false);
    expect(isRunningAsStandalonePWA()).toBe(false);
  });
});
