"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  requestGoogleDriveToken,
  backupToGoogleDrive,
  listGoogleDriveBackups,
  restoreFromGoogleDrive,
  DriveAuthError,
  type DriveFile,
} from "@/lib/googleDrive";
import type { Character } from "@/lib/types";

export function useGoogleDriveAuth() {
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [driveConnecting, setDriveConnecting] = useState(false);
  const [driveBackingUp, setDriveBackingUp] = useState(false);
  const [driveBackups, setDriveBackups] = useState<DriveFile[] | null>(null);
  const [driveBackupsLoading, setDriveBackupsLoading] = useState(false);
  const [driveRestoringId, setDriveRestoringId] = useState<string | null>(
    null
  );

  const handleDriveAuthError = useCallback((err: unknown, fallback: string) => {
    if (err instanceof DriveAuthError) {
      setDriveToken(null);
      toast.error("La sesión con Google Drive expiró — conectate de nuevo");
      return;
    }
    toast.error(err instanceof Error ? err.message : fallback);
  }, []);

  const connect = useCallback(async (googleClientId: string | undefined) => {
    if (!googleClientId) {
      toast.error("Falta configurar NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }
    setDriveConnecting(true);
    try {
      const token = await requestGoogleDriveToken();
      setDriveToken(token);
      setDriveBackups(null);
      toast.success("Conectado con Google Drive");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo conectar con Google Drive"
      );
    } finally {
      setDriveConnecting(false);
    }
  }, []);

  const backup = useCallback(
    async (character: Character) => {
      if (!driveToken) return;
      setDriveBackingUp(true);
      try {
        await backupToGoogleDrive(driveToken, character);
        toast.success("Backup subido a Google Drive");
        setDriveBackups(null);
      } catch (err) {
        handleDriveAuthError(err, "Error al subir el backup");
      } finally {
        setDriveBackingUp(false);
      }
    },
    [driveToken, handleDriveAuthError]
  );

  const loadBackups = useCallback(async () => {
    if (!driveToken) return;
    setDriveBackupsLoading(true);
    try {
      setDriveBackups(await listGoogleDriveBackups(driveToken));
    } catch (err) {
      handleDriveAuthError(err, "Error al cargar los backups");
    } finally {
      setDriveBackupsLoading(false);
    }
  }, [driveToken, handleDriveAuthError]);

  const restore = useCallback(
    async (file: DriveFile): Promise<Character | null> => {
      if (!driveToken) return null;
      setDriveRestoringId(file.id);
      try {
        return await restoreFromGoogleDrive(driveToken, file.id);
      } catch (err) {
        handleDriveAuthError(err, "Error al restaurar desde Google Drive");
        return null;
      } finally {
        setDriveRestoringId(null);
      }
    },
    [driveToken, handleDriveAuthError]
  );

  return {
    driveToken,
    driveConnecting,
    driveBackingUp,
    driveBackups,
    driveBackupsLoading,
    driveRestoringId,
    connect,
    backup,
    loadBackups,
    restore,
  };
}
