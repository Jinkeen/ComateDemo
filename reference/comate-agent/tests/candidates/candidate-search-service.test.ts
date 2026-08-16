import { expect, it } from "vitest";
import { createRoleDraft } from "@/features/role-brief/domain/workflow";
import { searchCandidates } from "@/features/candidates/application/candidate-search-service";

it("filters synthetic candidates by must-haves and ranks them deterministically", () => {
  const role = { ...createRoleDraft("招聘一名负责企业级大模型产品的 AI 产品经理，能够从 0 到 1 推动产品落地。"), mustHaves: ["AI 产品设计", "大模型应用"], location: "远程优先", workModel: "完全远程", seniority: "高级" };
  const results = searchCandidates(role);
  expect(results.length).toBeGreaterThan(0);
  expect(results.every((item) => item.reasons.some((reason) => reason.includes("AI 产品设计")))).toBe(true);
  expect(results[0].score).toBeGreaterThanOrEqual(results.at(-1)?.score || 0);
});
