// Vibration patterns for Android (navigator.vibrate). iOS has no such API;
// there only a button wired with tapHaptic buzzes, on the tap itself.
const vibe = (pattern: number | number[]) => {
  if (typeof navigator !== "undefined") navigator.vibrate?.(pattern);
};

export const haptics = {
  damage: () => vibe([20, 40, 30]),
  down: () => vibe([40, 60, 40, 60, 120]),
  heal: () => vibe([10, 30, 10]),
  rage: () => vibe([30, 30, 70]),
  crit: () => vibe([10, 30, 10, 30, 50]),
  fumble: () => vibe(80),
};

// Since iOS 26.5 Safari only fires its haptic when the user's own tap toggles
// an <input switch>, so on iOS this ref lays a transparent <label> over the
// button, wired to a hidden switch.
// The button's click handler must not preventDefault: that cancels the toggle.
// Adapted from ios-haptics (MIT, tijnjh) at its scroll fix (#13), which npm
// 3.2.0 doesn't ship yet.
const isIos = () =>
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

export function tapHaptic(el: HTMLElement | null) {
  if (!el || !isIos() || el.querySelector(":scope > [data-haptic-trigger]")) return;
  const label = document.createElement("label");
  label.setAttribute("data-haptic-trigger", "");
  label.setAttribute("aria-hidden", "true");
  Object.assign(label.style, { position: "absolute", inset: "0", touchAction: "manipulation" });
  label.style.setProperty("-webkit-tap-highlight-color", "transparent");
  const sw = document.createElement("input");
  sw.type = "checkbox";
  sw.setAttribute("switch", "");
  sw.tabIndex = -1;
  // Never under the finger: WebKit swallows a touchstart on a switch, which kills scrolling.
  Object.assign(sw.style, { position: "absolute", width: "1px", height: "1px", margin: "0", visibility: "hidden" });
  // The label re-dispatches its click to the switch; don't let that copy reach the button again.
  sw.addEventListener("click", (e) => e.stopPropagation());
  label.append(sw);
  if (getComputedStyle(el).position === "static") el.style.position = "relative";
  el.append(label);
}
