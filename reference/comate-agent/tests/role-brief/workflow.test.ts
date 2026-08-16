import { describe, expect, it } from "vitest";
import {
  answerQuestion,
  createRoleDraft,
  getActiveQuestion,
  goToPreviousQuestion,
  reopenClarification,
  revisitQuestion,
} from "@/features/role-brief/domain/workflow";

describe("职位澄清状态机", () => {
  it("从有效职位描述创建地点澄清状态", () => {
    const role = createRoleDraft("招聘一位 AI 产品经理");

    expect(role.lifecycleState).toBe("clarification_location");
    expect(role.title).toBe("AI 产品经理");
  });

  it("地点未回答时不能推进或返回", () => {
    const role = createRoleDraft("招聘一位 AI 产品经理");

    expect(getActiveQuestion(role)?.id).toBe("location");
    expect(goToPreviousQuestion(role)).toEqual(role);
  });

  it("回答地点后进入核心条件问题组", () => {
    const role = createRoleDraft("招聘一位 AI 产品经理");
    const next = answerQuestion(role, "location", "香港 / 台湾");

    expect(next.lifecycleState).toBe("clarification_core");
    expect(getActiveQuestion(next)?.id).toBe("workModel");
  });

  it("可返回已回答步骤查看，且未改答案时保留后续回答", () => {
    let role = createRoleDraft("招聘一位 AI 产品经理");
    role = answerQuestion(role, "location", "香港 / 台湾");
    role = answerQuestion(role, "workModel", "混合办公");
    role = answerQuestion(role, "seniority", "高级");

    const revisited = revisitQuestion(role, "location");
    expect(getActiveQuestion(revisited)?.id).toBe("location");
    expect(revisited.answers).toHaveLength(3);

    const sameAnswer = answerQuestion(revisited, "location", "香港 / 台湾");
    expect(sameAnswer.answers).toHaveLength(3);
    expect(getActiveQuestion(sameAnswer)?.id).toBe("workModel");
  });

  it("修改已答步骤会截断后续回答", () => {
    let role = createRoleDraft("招聘一位 AI 产品经理");
    role = answerQuestion(role, "location", "香港 / 台湾");
    role = answerQuestion(role, "workModel", "混合办公");
    role = answerQuestion(role, "seniority", "高级");

    const revisited = revisitQuestion(role, "location");
    const changed = answerQuestion(revisited, "location", "北京");

    expect(changed.location).toBe("北京");
    expect(changed.answers).toHaveLength(1);
    expect(getActiveQuestion(changed)?.id).toBe("workModel");
  });

  it("确认后可重新打开澄清流程", () => {
    let role = createRoleDraft("招聘一位 AI 产品经理");
    role = answerQuestion(role, "location", "香港 / 台湾");
    role = {
      ...role,
      lifecycleState: "confirmed",
      activeQuestionId: null,
    };

    const reopened = reopenClarification(role);
    expect(reopened.lifecycleState).not.toBe("confirmed");
    expect(getActiveQuestion(reopened)?.id).toBe("location");
  });

  it("摘要状态可返回此前跳过的可选问题", () => {
    const role = {
      ...createRoleDraft("招聘一位 AI 产品经理"),
      lifecycleState: "brief_ready" as const,
      activeQuestionId: null,
    };

    const revisited = revisitQuestion(role, "companyCue");

    expect(getActiveQuestion(revisited)?.id).toBe("companyCue");
    expect(revisited.lifecycleState).toBe("clarification_company");
  });
});
