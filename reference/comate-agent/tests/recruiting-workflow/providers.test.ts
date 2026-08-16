import { describe, expect, it } from "vitest";
import { createRoleDraft } from "@/features/role-brief/domain/workflow";
import { MockCandidateDataSource } from "@/features/recruiting-workflow/providers/mock-candidate-data-source";

describe("虚拟招聘 Provider", () => {
  it("返回三位不同且可解释的校准样本", async () => {
    const role = {
      ...createRoleDraft("招聘一位负责大模型应用的 AI 产品经理"),
      mustHaves: ["AI 产品设计", "大模型应用"],
    };

    const samples = await new MockCandidateDataSource().getCalibrationSamples(role, 3);

    expect(samples).toHaveLength(3);
    expect(new Set(samples.map((item) => item.candidate.id)).size).toBe(3);
    expect(samples.every((item) => item.reasons.length > 0)).toBe(true);
  });

  it("候选人分页返回稳定游标和虚拟数据标识", async () => {
    const role = createRoleDraft("招聘一位 AI 产品经理");
    const source = new MockCandidateDataSource();
    const first = await source.search(role, undefined, 2);
    const second = await source.search(role, first.nextCursor ?? undefined, 2);

    expect(first.source).toBe("synthetic");
    expect(first.items).toHaveLength(2);
    expect(second.items[0]?.candidate.id).not.toBe(first.items[0]?.candidate.id);
  });
});
