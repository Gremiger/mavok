// Keeps the browser/OS chrome color (theme-color meta) in step with the
// active theme's background.
export function applyThemeColor(doc: Document, bg: string | undefined): void {
  if (!bg) return;
  doc.querySelector('meta[name="theme-color"]')?.setAttribute("content", bg);
}
