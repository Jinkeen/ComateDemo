import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

declare global {
  var nexusHireDatabase: Database.Database | undefined;
}

export function getDatabase(): Database.Database {
  if (global.nexusHireDatabase) {
    return global.nexusHireDatabase;
  }

  const dataDirectory = path.join(process.cwd(), "data");
  mkdirSync(dataDirectory, { recursive: true });
  const database = new Database(path.join(dataDirectory, "nexus-hire.sqlite"));
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  global.nexusHireDatabase = database;
  return database;
}
