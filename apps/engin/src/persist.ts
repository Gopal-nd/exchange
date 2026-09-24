import fs from "fs";
import path from "path";

const FILE = path.join(import.meta.dir, "..", "data", "snapshot.json");

export function loadSnapshot() {
  if (!fs.existsSync(FILE)) return null;
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

export function saveSnapshot(book: unknown) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(book));
}
