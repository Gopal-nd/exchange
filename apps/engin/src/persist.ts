import fs from "fs";
import path from "path";

const DIR = path.join(import.meta.dir, "..", "data");
const SNAPSHOT = path.join(DIR, "snapshot.json");
const EVENTS = path.join(DIR, "events.jsonl");

function ensureDir() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
}

export function loadSnapshot() {
  if (!fs.existsSync(SNAPSHOT)) return null;
  const raw = fs.readFileSync(SNAPSHOT, "utf8").trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    console.warn("snapshot.json corrupt/empty — starting fresh");
    return null;
  }
}

export function saveSnapshot(book: unknown) {
  ensureDir();
  fs.writeFileSync(SNAPSHOT, JSON.stringify(book));
}

// save each event to the events.jsonl file
export function appendEvent(event: { type: string; data: unknown }) {
  ensureDir();
  fs.appendFileSync(EVENTS, JSON.stringify(event) + "\n");
}

// load all events from the events.jsonl file
export function loadEvents(): { type: string; data: any }[] {
  if (!fs.existsSync(EVENTS)) return [];
  const raw = fs.readFileSync(EVENTS, "utf8").trim();
  if (!raw) return [];
  return raw
    .split("\n")
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch {
        console.warn("skipping bad event line");
        return [];
      }
    });
}

// clear the events.jsonl file once the snapshot is saved
export function clearEvents() {
  ensureDir();
  fs.writeFileSync(EVENTS, "");
}
