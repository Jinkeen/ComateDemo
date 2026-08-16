import type Database from "better-sqlite3";
import { getDatabase } from "@/server/db/connection";
import { migrateDatabase } from "@/server/db/migrate";
import type { ClarificationQuestion, RoleBrief, WorkflowAuditEvent } from "@/features/role-brief/domain/types";

export interface StoredWorkspace {
  role: RoleBrief;
  version: number;
  agentSummary: string | null;
  activeQuestion: ClarificationQuestion | null;
}

interface RoleRow {
  id: string;
  payload_json: string;
  version: number;
  agent_summary: string | null;
  active_question_json: string | null;
}

function parseQuestion(value: string | null): ClarificationQuestion | null {
  return value ? (JSON.parse(value) as ClarificationQuestion) : null;
}

function asWorkspace(row: RoleRow): StoredWorkspace {
  return {
    role: JSON.parse(row.payload_json) as RoleBrief,
    version: row.version,
    agentSummary: row.agent_summary,
    activeQuestion: parseQuestion(row.active_question_json),
  };
}

function auditId(): string {
  return `audit-${crypto.randomUUID()}`;
}

export class RoleVersionConflictError extends Error {
  constructor() {
    super("该职位已在其他操作中更新，请刷新后再提交。");
  }
}

export class SqliteRoleRepository {
  private readonly db: Database.Database;

  constructor(database = getDatabase()) {
    this.db = database;
    migrateDatabase(database);
  }

  getWorkspace(roleId: string): StoredWorkspace | null {
    const row = this.db.prepare("SELECT id, payload_json, version, agent_summary, active_question_json FROM roles WHERE id = ?").get(roleId) as RoleRow | undefined;
    return row ? asWorkspace(row) : null;
  }

  createWorkspace(workspace: StoredWorkspace): void {
    const timestamp = new Date().toISOString();
    const insert = this.db.prepare(`INSERT INTO roles (id, payload_json, version, agent_summary, active_question_json, created_at, updated_at)
      VALUES (@id, @payload, @version, @summary, @question, @createdAt, @updatedAt)`);
    const audit = this.db.prepare("INSERT INTO audit_events (id, role_id, action, question_id, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?)");
    this.db.transaction(() => {
      insert.run({
        id: workspace.role.id,
        payload: JSON.stringify(workspace.role),
        version: workspace.version,
        summary: workspace.agentSummary,
        question: workspace.activeQuestion ? JSON.stringify(workspace.activeQuestion) : null,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      audit.run(auditId(), workspace.role.id, "created", workspace.role.activeQuestionId, JSON.stringify({ version: workspace.version }), timestamp);
    })();
  }

  updateWorkspace(input: { workspace: StoredWorkspace; expectedVersion: number; action: WorkflowAuditEvent["action"] | "agent_fallback" }): StoredWorkspace {
    const timestamp = new Date().toISOString();
    const update = this.db.prepare(`UPDATE roles SET payload_json = @payload, version = @nextVersion, agent_summary = @summary,
      active_question_json = @question, updated_at = @updatedAt WHERE id = @id AND version = @expectedVersion`);
    const audit = this.db.prepare("INSERT INTO audit_events (id, role_id, action, question_id, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?)");
    const turn = this.db.prepare("INSERT INTO agent_turns (id, role_id, summary, question_json, status, created_at) VALUES (?, ?, ?, ?, ?, ?)");
    const nextVersion = input.expectedVersion + 1;
    const persist = this.db.transaction(() => {
      const result = update.run({
        id: input.workspace.role.id,
        payload: JSON.stringify(input.workspace.role),
        nextVersion,
        summary: input.workspace.agentSummary,
        question: input.workspace.activeQuestion ? JSON.stringify(input.workspace.activeQuestion) : null,
        updatedAt: timestamp,
        expectedVersion: input.expectedVersion,
      });
      if (result.changes !== 1) {
        throw new RoleVersionConflictError();
      }
      audit.run(auditId(), input.workspace.role.id, input.action, input.workspace.role.activeQuestionId, JSON.stringify({ version: nextVersion }), timestamp);
      turn.run(`turn-${crypto.randomUUID()}`, input.workspace.role.id, input.workspace.agentSummary || "", input.workspace.activeQuestion ? JSON.stringify(input.workspace.activeQuestion) : null, input.action === "agent_fallback" ? "fallback" : "completed", timestamp);
    });
    persist();
    return { ...input.workspace, version: nextVersion };
  }
}
