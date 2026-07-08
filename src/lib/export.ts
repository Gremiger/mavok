import type { Character, InventoryItem, QuickNote } from "./types";

export function exportCharacterJSON(character: Character): void {
  const blob = new Blob([JSON.stringify(character, null, 2)], {
    type: "application/json",
  });
  downloadBlob(
    blob,
    `mavok-backup-${new Date().toISOString().slice(0, 10)}.json`
  );
}

export function exportInventoryCSV(inventory: InventoryItem[]): void {
  const header = "Nombre,Cantidad,Peso,Categoría,Equipado,Descripción";
  const rows = inventory.map(
    (i) =>
      `"${i.name}",${i.quantity},${i.weight ?? ""},${i.category},${i.equipped},"${i.description.replace(/"/g, '""')}"`
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  downloadBlob(
    blob,
    `mavok-inventario-${new Date().toISOString().slice(0, 10)}.csv`
  );
}

export function exportQuickNotes(notes: QuickNote[]): void {
  const text = notes
    .map((n) => `[${new Date(n.createdAt).toLocaleString()}] ${n.text}`)
    .join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  downloadBlob(
    blob,
    `mavok-notas-${new Date().toISOString().slice(0, 10)}.txt`
  );
}

export function parseCharacterJSON(text: string): Character {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Archivo JSON inválido");
  }
}

export function importCharacterJSON(file: File): Promise<Character> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(parseCharacterJSON(reader.result as string));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
