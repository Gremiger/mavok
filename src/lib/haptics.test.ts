import { afterEach, describe, expect, it, vi } from "vitest"
import { tapHaptic } from "./haptics"

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 26_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1"

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ""
})

function button(onClick = vi.fn()) {
  const b = document.createElement("button")
  b.addEventListener("click", onClick)
  document.body.append(b)
  return { b, onClick }
}

describe("tapHaptic", () => {
  it("does nothing off iOS", () => {
    const { b } = button()
    tapHaptic(b)
    expect(b.children).toHaveLength(0)
  })

  it("on iOS, covers the button with a label wired to a switch, once", () => {
    vi.stubGlobal("navigator", { ...navigator, userAgent: IPHONE })
    const { b } = button()
    tapHaptic(b)
    tapHaptic(b)
    const labels = b.querySelectorAll("label[data-haptic-trigger]")
    expect(labels).toHaveLength(1)
    expect(labels[0].querySelector('input[type="checkbox"][switch]')).not.toBeNull()
    expect(b.style.position).toBe("relative")
  })

  it("a tap toggles the switch and reaches the button exactly once", () => {
    vi.stubGlobal("navigator", { ...navigator, userAgent: IPHONE })
    const { b, onClick } = button()
    tapHaptic(b)
    const label = b.querySelector("label")!
    label.click()
    expect(label.querySelector("input")!.checked).toBe(true)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
