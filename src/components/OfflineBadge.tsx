"use client";

import { useState, useEffect } from "react";

export function OfflineBadge() {
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
    }
    function handleOffline() {
      setIsOffline(true);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-3 py-1 bg-card border border-border rounded-full text-xs text-muted shadow-lg">
      Sin conexión
    </div>
  );
}
