import fs from "fs";
import path from "path";
import { DB } from "./types";

// Camada de persistencia simples baseada em arquivo JSON.
// Pensada para ser trocada por Postgres/MongoDB em producao: toda a
// leitura/escrita do "banco" passa por este modulo (repository pattern),
// entao trocar o storage nao exige mudar as rotas.

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function emptyDb(): DB {
  return { users: [], activities: [], presenceScans: [], connections: [] };
}

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(emptyDb(), null, 2));
  }
}

let cache: DB | null = null;

export function readDb(): DB {
  if (cache) return cache;
  ensureFile();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  cache = JSON.parse(raw) as DB;
  return cache;
}

export function writeDb(db: DB) {
  cache = db;
  ensureFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function mutate<T>(fn: (db: DB) => T): T {
  const db = readDb();
  const result = fn(db);
  writeDb(db);
  return result;
}
