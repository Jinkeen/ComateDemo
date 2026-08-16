import { describe, expect, it } from "vitest";
import { companyDisplayForBrief, projectSearchCriteria } from "@/features/role-brief/domain/criteria";
import { answerQuestion, createRoleDraft } from "@/features/role-brief/domain/workflow";

describe("匿名公司与搜索条件投影", () => {
  it("保密时只显示抽象的公司画像，不展示公司线索", () => {
    let role = createRoleDraft("招聘一位 AI 产品经理");
    role = answerQuestion(role, "location", "香港 / 台湾");
    role = answerQuestion(role, "workModel", "混合办公");
    role = answerQuestion(role, "seniority", "高级");
    role = answerQuestion(role, "mustHaves", "AI 产品设计");
    role = answerQuestion(role, "education", "不限");
    role = answerQuestion(role, "domain", "AI / SaaS");
    role = answerQuestion(role, "exclusions", "");
    role = answerQuestion(role, "companyCue", "星河智能");
    role = answerQuestion(role, "companyStage", "成长期");
    role = answerQuestion(role, "companyDomain", "AI / SaaS");
    role = answerQuestion(role, "companyVisibility", "保持保密");

    expect(companyDisplayForBrief(role)).toBe("一家专注AI / SaaS的成长期团队");
    expect(companyDisplayForBrief(role)).not.toContain("星河智能");
  });

  it("把职位状态投影为右侧可读的搜索条件", () => {
    const role = createRoleDraft("招聘一位 AI 产品经理");
    const criteria = projectSearchCriteria(role);

    expect(criteria.find((item) => item.id === "location")?.value).toBe("等待补充");
    expect(criteria).toHaveLength(4);
  });
});
