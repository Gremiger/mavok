import { useRef } from "react";

export function useLongPress(onLongPress: () => void, delay = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const firedRef = useRef(false);

  function start() {
    firedRef.current = false;
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      onLongPress();
    }, delay);
  }

  function clear() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  return {
    handlers: {
      onPointerDown: start,
      onPointerUp: clear,
      onPointerLeave: clear,
      onPointerCancel: clear,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    },
    wasLongPress: () => firedRef.current,
  };
}
