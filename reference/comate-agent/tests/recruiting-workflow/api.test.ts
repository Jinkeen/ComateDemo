import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { createRoleDraft } from "@/features/role-brief/domain/workflow";
import { RecruitingWorkflowService } from "@/features/recruiting-workflow/application/recruiting-workflow-service";
import { SqliteRecruitingWorkflowRepository } from "@/features/recruiting-workflow/data/sqlite-recruiting-workflow-repository";
import { MockCandidateDataSource } from "@/features/recruiting-workflow/providers/mock-candidate-data-source";

function createService() {
  const db = new Database(":memory:");
  const repository = new SqliteRecruitingWorkflowRepository(db);
  const role = {
    ...createRoleDraft("招聘一位负责大模型产品落地的 AI 产品经理"),
    id: "role-1",
    mustHaves: ["AI 产品设计", "大模型应用"],
    lifecycleState: "confirmed" as const,
  };
  const now = "2026-08-01T00:00:00.000Z";
  db.prepare(`INSERT INTO roles (id, payload_json, version, agent_summary, active_question_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(role.id, JSON.stringify(role), 1, null, null, now, now);

  return {
    role,
    service: new RecruitingWorkflowService(repository, new MockCandidateDataSource()),
  };
}

describe("招聘流程应用服务", () => {
  it("从校准推进到候选人确认完成", async () => {
    const { role, service } = createService();
    let stored = await service.initialize(role);

    for (const [index, candidateId] of stored.state.calibration.sampleIds.entries()) {
      stored = service.calibrate(role.id, stored.version, {
        candidateId,
        verdict: index === 0 ? "good_fit" : index === 1 ? "maybe" : "not_a_fit",
        evidence: `样本 ${index + 1} 的结构化判断`,
      });
    }

    stored = service.chooseMode(role.id, stored.version, "manual");
    stored = await service.runSearch(role, stored.version);
    const approvedId = stored.state.sourcing.candidateIds[0];
    stored = service.approve(role.id, stored.version, [approvedId]);

    expect(stored.state.stage).toBe("completed");
    expect(stored.state.selection.approvedIds).toContain(approvedId);
    expect(stored.version).toBe(7);
  });

  it("重复初始化返回原工作流而不是新建", async () => {
    const { role, service } = createService();
    const first = await service.initialize(role);
    const second = await service.initialize(role);

    expect(second).toEqual(first);
  });
});

it("工作流路由拒绝缺少版本号的操作", async () => {
  const request = new Request("http://localhost/api/roles/role-1/workflow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "calibrate" }),
  });
  const { POST } = await import("@/app/api/roles/[roleId]/workflow/route");
  const response = await POST(request, {
    params: Promise.resolve({ roleId: "role-1" }),
  });

  expect(response.status).toBe(400);
});
