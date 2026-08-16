import Database from "better-sqlite3";
import { expect, it } from "vitest";
import { createRecruitingWorkflow } from "@/features/recruiting-workflow/domain/workflow";
import {
  SqliteRecruitingWorkflowRepository,
  WorkflowVersionConflictError,
} from "@/features/recruiting-workflow/data/sqlite-recruiting-workflow-repository";

it("持久化招聘流程并拒绝过期版本覆盖", () => {
  const db = new Database(":memory:");
  const repository = new SqliteRecruitingWorkflowRepository(db);
  const now = "2026-08-01T00:00:00.000Z";
  db.prepare(`INSERT INTO roles (id, payload_json, version, agent_summary, active_question_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run("role-1", "{}", 1, null, null, now, now);

  const created = repository.create(
    createRecruitingWorkflow("role-1", ["a", "b", "c"]),
  );
  expect(repository.get("role-1")).toEqual(created);

  const updated = repository.update(
    {
      ...created,
      state: { ...created.state, criteriaVersion: 2 },
    },
    1,
    "criteria_updated",
  );
  expect(updated.version).toBe(2);
  expect(updated.state.criteriaVersion).toBe(2);

  expect(() => repository.update(created, 1, "stale_write")).toThrow(
    WorkflowVersionConflictError,
  );
  expect(db.prepare("SELECT COUNT(*) AS count FROM workflow_events").get()).toEqual({ count: 2 });
});
