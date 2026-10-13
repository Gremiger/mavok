import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { JournalTimeMachine } from "./JournalTimeMachine";
import type { JournalEntry } from "@/lib/types";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const entry = (session: number, title: string): JournalEntry => ({
  id: `j${session}`, session, date: `2026-0${session}-01`, title, content: `Pasó algo en ${title}`,
});
// Newest first, as the journal hands them over.
const entries = [entry(3, "El puente"), entry(2, "La cripta"), entry(1, "La taberna")];

const front = () => container.querySelector<HTMLButtonElement>("[data-front]")!;
const slider = () => container.querySelector<HTMLElement>('[role="slider"]')!;
const key = (k: string) =>
  act(() => slider().dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true })));

describe("JournalTimeMachine", () => {
  test("the newest session is the front card", () => {
    act(() => root.render(<JournalTimeMachine entries={entries} onOpen={() => {}} />));
    expect(front().textContent).toContain("El puente");
    expect(slider().getAttribute("aria-valuetext")).toBe("Sesión 3");
  });

  test("arrow keys on the timeline travel back and forth, clamped at the ends", () => {
    act(() => root.render(<JournalTimeMachine entries={entries} onOpen={() => {}} />));
    key("ArrowUp");
    expect(front().textContent).toContain("El puente");
    key("ArrowDown");
    key("ArrowDown");
    expect(front().textContent).toContain("La taberna");
    key("ArrowDown");
    expect(front().textContent).toContain("La taberna");
    key("Home");
    expect(front().textContent).toContain("El puente");
  });

  test("touching the front card opens that session", () => {
    const onOpen = vi.fn();
    act(() => root.render(<JournalTimeMachine entries={entries} onOpen={onOpen} />));
    key("ArrowDown");
    act(() => front().click());
    expect(onOpen).toHaveBeenCalledWith("j2");
  });

  test("cards behind the front can't be focused or touched", () => {
    act(() => root.render(<JournalTimeMachine entries={entries} onOpen={() => {}} />));
    expect(container.querySelectorAll("button")).toHaveLength(1);
  });
});
