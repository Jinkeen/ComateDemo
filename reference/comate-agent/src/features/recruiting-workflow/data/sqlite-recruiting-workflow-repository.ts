import type Database from "better-sqlite3";
import { getDatabase } from "@/server/db/connection";
import { migrateDatabase } from "@/server/db/migrate";
import type { RecruitingWorkflowState } from "../domain/types";

export interface StoredRecruitingWorkflow {
  state: RecruitingWorkflowState;
  version: number;
}

export class WorkflowVersionConflictError extends Error {
  constructor() {
    super("招聘流程已在其他操作中更新，请刷新后重试。");
  }
}

export class SqliteRecruitingWorkflowRepository {
  constructor(private readonly db: Database.Database = getDatabase()) {
    migrateDatabase(this.db);
  }

  create(state: RecruitingWorkflowState): StoredRecruitingWorkflow {
    const createdAt = new Date().toISOString();
    const insert = this.db.prepare(`INSERT INTO recruiting_workflows
      (role_id, payload_json, version, created_at, updated_at)
      VALUES (?, ?, 1, ?, ?)`);
    const event = this.db.prepare(`INSERT INTO workflow_events
      (id, role_id, action, payload_json, created_at)
      VALUES (?, ?, ?, ?, ?)`);

    this.db.transaction(() => {
      insert.run(state.roleId, JSON.stringify(state), createdAt, createdAt);
      event.run(
        `workflow-event-${crypto.randomUUID()}`,
        state.roleId,
        "workflow_created",
        JSON.stringify({ version: 1 }),
        createdAt,
      );
    })();

    return { state, version: 1 };
  }

  get(roleId: string): StoredRecruitingWorkflow | null {
    const row = this.db
      .prepare("SELECT payload_json, version FROM recruiting_workflows WHERE role_id = ?")
      .get(roleId) as { payload_json: string; version: number } | undefined;

    return row
      ? {
          state: JSON.parse(row.payload_json) as RecruitingWorkflowState,
          version: row.version,
        }
      : null;
  }

  update(
    workflow: StoredRecruitingWorkflow,
    expectedVersion: number,
    action: string,
  ): StoredRecruitingWorkflow {
    const updatedAt = new Date().toISOString();
    const nextVersion = expectedVersion + 1;
    const update = this.db.prepare(`UPDATE recruiting_workflows
      SET payload_json = ?, version = ?, updated_at = ?
      WHERE role_id = ? AND version = ?`);
    const event = this.db.prepare(`INSERT INTO workflow_events
      (id, role_id, action, payload_json, created_at)
      VALUES (?, ?, ?, ?, ?)`);

    this.db.transaction(() => {
      const result = update.run(
        JSON.stringify(workflow.state),
        nextVersion,
        updatedAt,
        workflow.state.roleId,
        expectedVersion,
      );
      if (result.changes !== 1) {
        throw new WorkflowVersionConflictError();
      }
      event.run(
        `workflow-event-${crypto.randomUUID()}`,
        workflow.state.roleId,
        action,
        JSON.stringify({ version: nextVersion }),
        updatedAt,
      );
    })();

    return { state: workflow.state, version: nextVersion };
  }
}
