import type Database from "better-sqlite3";

export function migrateDatabase(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      payload_json TEXT NOT NULL,
      version INTEGER NOT NULL,
      agent_summary TEXT,
      active_question_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS agent_turns (
      id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL,
      summary TEXT NOT NULL,
      question_json TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL,
      action TEXT NOT NULL,
      question_id TEXT,
      payload_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS recruiting_workflows (
      role_id TEXT PRIMARY KEY,
      payload_json TEXT NOT NULL,
      version INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS workflow_events (
      id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL,
      action TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE
    );
  `);
}
