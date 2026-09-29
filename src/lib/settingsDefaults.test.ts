import { afterEach, expect, test } from "vitest";
import { loadSettings } from "./storage";

afterEach(() => localStorage.clear());

test("animations default to normal with no stored settings", () => {
  expect(loadSettings().motionStyle).toBe("normal");
});

test("old stored settings without the field load as normal and keep other values", () => {
  localStorage.setItem("mavok_settings", JSON.stringify({ theme: "pergamino" }));
  const s = loadSettings();
  expect(s.motionStyle).toBe("normal");
  expect(s.theme).toBe("pergamino");
});

test("a stored flashy choice is kept", () => {
  localStorage.setItem("mavok_settings", JSON.stringify({ motionStyle: "flashy" }));
  expect(loadSettings().motionStyle).toBe("flashy");
});
