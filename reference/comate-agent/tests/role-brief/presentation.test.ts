import { describe, expect, it } from "vitest";
import {
  buildConversationItems,
  buildConversationTranscript,
  buildProgressItems,
  buildRoleSummary,
  buildSearchNarrative,
  extractOriginalCandidateRequirements,
  resolveClarificationTransition,
  resolveSearchNarrative,
} from "@/features/role-brief/domain/presentation";
import { categoryTransitions, getQuestion } from "@/features/role-brief/domain/questions";
import { answerQuestion, createRoleDraft, revisitQuestion, skipOptionalQuestion } from "@/features/role-brief/domain/workflow";

describe("职位澄清展示投影", () => {
  it("按问题定义顺序生成已回答的 Q/A 对话", () => {
    const draft = createRoleDraft("招聘一位 AI 产品经理");
    const role = answerQuestion(draft, "location", "远程优先");

    expect(buildConversationTranscript(role)).toEqual([
      {
        questionId: "location",
        question: "这个职位主要在哪个地区招聘？",
        answer: "远程优先",
      },
    ]);
  });

  it("将澄清中的职位投影为当前进展", () => {
    const role = createRoleDraft("招聘一位 AI 产品经理");
    const progress = buildProgressItems(role);

    expect(progress[0]).toMatchObject({ label: "澄清职位", status: "current" });
    expect(progress).toHaveLength(4);
  });

  it("根据不同回答生成动态职位摘要", () => {
    const role = {
      ...createRoleDraft("招聘一位 AI 产品经理"),
      location: "中国大陆",
      workModel: "混合办公",
      seniority: "初级",
      mustHaves: ["AI 产品设计", "大模型应用"],
      education: "本科及以上",
      domain: "AI / SaaS",
      companyStage: "早期创业",
      companyDomain: "AI / SaaS",
      companyVisibility: "confidential" as const,
      compensation: "¥10,000–20,000",
      visaPolicy: "可协助",
      interviewProcess: "三轮面试",
      answers: [
        {
          questionId: "location" as const,
          rawValue: "中国大陆",
          normalizedValue: "中国大陆",
          required: true,
          source: "option" as const,
          answeredAt: "2026-08-15T00:00:00.000Z",
        },
        {
          questionId: "workModel" as const,
          rawValue: "混合办公",
          normalizedValue: "混合办公",
          required: true,
          source: "option" as const,
          answeredAt: "2026-08-15T00:00:00.000Z",
        },
      ],
    };

    const summary = buildRoleSummary(role);

    expect(summary.meta).toEqual(["初级", "中国大陆", "混合办公"]);
    expect(summary.compensation.value).toBe("¥10,000–20,000");
    expect(summary.company[2].value).toBe("候选人侧保密");
    expect(summary.interviewSteps).toEqual(["业务面", "专业面", "终面"]);
    expect(summary).toMatchObject({ answeredCount: 2, totalCount: 14, completeness: 14 });
  });

  it("保留固定摘要结构并为跳过项显示待确认", () => {
    const role = {
      ...createRoleDraft("招聘一位 AI 产品经理"),
      compensation: "填写范围",
      interviewProcess: "待确认",
    };

    const summary = buildRoleSummary(role);

    expect(summary.compensation.value).toBe("待确认具体范围");
    expect(summary.candidate).toHaveLength(4);
    expect(summary.company).toHaveLength(4);
    expect(summary.company[0]).toMatchObject({ value: "待确认", pending: true });
    expect(summary.interviewSteps).toEqual(["待确认"]);
  });

  it("只在每类第一题显示阶段开场，组内不插过渡句", () => {
    const draft = createRoleDraft("招聘一位 AI 产品经理");

    expect(resolveClarificationTransition(draft, getQuestion("location"))).toBe(
      categoryTransitions.arrangement,
    );

    const afterLocation = answerQuestion(draft, "location", "远程优先");
    expect(resolveClarificationTransition(afterLocation, getQuestion("workModel"))).toBeNull();

    const afterWorkModel = answerQuestion(afterLocation, "workModel", "混合办公");
    expect(resolveClarificationTransition(afterWorkModel, getQuestion("seniority"))).toBe(
      categoryTransitions.profile,
    );
    expect(resolveClarificationTransition(afterWorkModel, getQuestion("mustHaves"))).toBeNull();

    let afterProfile = answerQuestion(afterWorkModel, "seniority", "中级");
    afterProfile = answerQuestion(afterProfile, "mustHaves", "AI 产品设计");
    afterProfile = skipOptionalQuestion(afterProfile);
    afterProfile = skipOptionalQuestion(afterProfile);
    afterProfile = skipOptionalQuestion(afterProfile);
    expect(resolveClarificationTransition(afterProfile, getQuestion("companyCue"))).toBe(
      categoryTransitions.company,
    );
    expect(resolveClarificationTransition(afterProfile, getQuestion("companyStage"))).toBeNull();

    let afterCompany = skipOptionalQuestion(afterProfile);
    afterCompany = skipOptionalQuestion(afterCompany);
    afterCompany = skipOptionalQuestion(afterCompany);
    afterCompany = answerQuestion(afterCompany, "companyVisibility", "展示公司信息");
    expect(resolveClarificationTransition(afterCompany, getQuestion("compensation"))).toBe(
      categoryTransitions.process,
    );
    expect(resolveClarificationTransition(afterCompany, getQuestion("visaPolicy"))).toBeNull();
  });

  it("回看已答题时使用回看句，不重播类开场", () => {
    let role = createRoleDraft("招聘一位 AI 产品经理");
    role = answerQuestion(role, "location", "远程优先");
    role = answerQuestion(role, "workModel", "混合办公");
    const revisited = revisitQuestion(role, "location");

    expect(resolveClarificationTransition(revisited, getQuestion("location"))).toBe(
      "正在回看「地点」，可直接修改后继续。",
    );
  });

  it("在已答类别前插入阶段开场，并保留后续 Q/A", () => {
    let role = createRoleDraft("招聘一位 AI 产品经理");
    role = answerQuestion(role, "location", "远程优先");
    role = answerQuestion(role, "workModel", "混合办公");
    role = answerQuestion(role, "seniority", "中级");

    expect(buildConversationItems(role, "seniority")).toEqual([
      {
        kind: "transition",
        category: "arrangement",
        text: categoryTransitions.arrangement,
      },
      {
        kind: "group",
        category: "arrangement",
        turns: [
          {
            questionId: "location",
            question: "这个职位主要在哪个地区招聘？",
            answer: "远程优先",
          },
          {
            questionId: "workModel",
            question: "希望候选人采用哪种工作方式？",
            answer: "混合办公",
          },
        ],
      },
    ]);
  });

  it("把原始需求与澄清结果收成候选人要求叙事，不含公司介绍", () => {
    const role = {
      ...createRoleDraft("招聘一位 AI 产品经理，负责大模型产品从 0 到 1 落地"),
      seniority: "中级",
      location: "中国大陆",
      workModel: "全职坐班",
      mustHaves: ["0-1 产品落地", "大模型应用"],
      education: "本科及以上",
      domain: "企业服务",
      exclusions: ["纯销售背景"],
      companyStage: "早期创业",
      companyDomain: "AI / SaaS",
      companyCue: "1000人团队，大规模",
      companyVisibility: "visible" as const,
      compensation: "面议",
      visaPolicy: "不涉及",
      interviewProcess: "三轮面试",
    };

    const narrative = buildSearchNarrative(role);
    expect(narrative).toContain("我将搜索以下职位：中级 AI 产品经理，中国大陆，全职坐班");
    expect(narrative).toContain("候选人需负责大模型产品从 0 到 1 落地");
    expect(narrative).toContain("须具备0-1 产品落地、大模型应用");
    expect(narrative).not.toContain("招聘一位");
    expect(narrative).not.toContain("早期创业");
    expect(narrative).not.toContain("1000人团队");
    expect(narrative).not.toContain("展示公司信息");
    expect(narrative).not.toContain("薪酬");
    expect(narrative).not.toContain("签证");
    expect(narrative).not.toContain("三轮面试");
  });

  it("只从原始需求提取对候选人的能力要求，并去掉重复与招聘套话", () => {
    expect(
      extractOriginalCandidateRequirements("我需要招聘AI产品经理，需要会写PRD和会写PRD、会做竞品分析", {
        title: "AI 产品经理",
      }),
    ).toEqual(["会写PRD", "会做竞品分析"]);

    const role = {
      ...createRoleDraft("我需要招聘AI产品经理，需要会写PRD和会写PRD、会做竞品分析"),
      seniority: "中级",
      location: "中国大陆",
      workModel: "全职坐班",
      mustHaves: ["0-1 产品落地", "大模型应用", "跨团队协作"],
      education: "本科及以上",
      domain: "企业服务",
      exclusions: ["纯销售背景", "无产品交付经验"],
    };

    const narrative = buildSearchNarrative(role);
    expect(narrative).toContain("候选人需会写PRD、会做竞品分析");
    expect(narrative).not.toContain("我需要招聘");
    expect(narrative).not.toContain("会写PRD和会写PRD");
  });

  it("若已存摘要原样粘贴了原始需求，则回退到提取后的候选人要求", () => {
    const original = "我需要招聘AI产品经理，需要会写PRD和会写PRD、会做竞品分析";
    const role = {
      ...createRoleDraft(original),
      seniority: "中级",
      location: "中国大陆",
      workModel: "全职坐班",
      searchNarrative: `我将搜索以下职位：中级 AI产品经理。候选人需满足「${original}」中的核心能力要求。`,
    };

    expect(resolveSearchNarrative(role)).toContain("候选人需会写PRD、会做竞品分析");
    expect(resolveSearchNarrative(role)).not.toContain("我需要招聘");
  });
});
