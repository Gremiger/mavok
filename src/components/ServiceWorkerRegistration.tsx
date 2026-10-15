"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
    // Everything lives in LocalStorage: ask the browser not to evict it under
    // storage pressure. Best effort: browsers may refuse, and nothing changes then.
    navigator.storage?.persist?.().catch(() => {});
  }, []);
  return null;
}
