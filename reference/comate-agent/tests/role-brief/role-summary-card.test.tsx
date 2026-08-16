import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RoleBriefSummaryCard } from "@/features/role-brief/components/RoleBriefSummaryCard";
import { createRoleDraft } from "@/features/role-brief/domain/workflow";

describe("动态职位摘要卡片", () => {
  it("将原始需求与澄清结果收成准备搜索叙事，并允许开始搜索", () => {
    const role = {
      ...createRoleDraft("招聘一位 AI 产品经理，负责大模型产品从 0 到 1 落地"),
      lifecycleState: "brief_ready" as const,
      activeQuestionId: null,
      location: "中国大陆",
      workModel: "全职坐班",
      seniority: "中级",
      mustHaves: ["0-1 产品落地", "大模型应用", "跨团队协作"],
      education: "本科及以上",
      domain: "企业服务",
      exclusions: ["纯销售背景", "无产品交付经验"],
      companyStage: "早期创业",
      companyDomain: "AI / SaaS",
      companyCue: "1000人团队，大规模",
      companyVisibility: "visible" as const,
      compensation: "面议",
      visaPolicy: "不涉及",
      interviewProcess: "三轮面试",
    };
    const onBack = vi.fn();
    const onConfirm = vi.fn();

    render(
      <RoleBriefSummaryCard
        role={role}
        onBack={onBack}
        onConfirm={onConfirm}
        onEdit={() => undefined}
      />,
    );

    expect(screen.getByRole("heading", { name: "准备搜索" })).toBeInTheDocument();
    expect(screen.getByText(/我将搜索以下职位：中级 AI 产品经理，中国大陆，全职坐班/)).toBeInTheDocument();
    expect(screen.getByText(/须具备0-1 产品落地、大模型应用、跨团队协作/)).toBeInTheDocument();
    expect(screen.getByText(/候选人需负责大模型产品从 0 到 1 落地/)).toBeInTheDocument();
    expect(screen.queryByText(/招聘一位/)).not.toBeInTheDocument();
    expect(screen.queryByText(/早期创业/)).not.toBeInTheDocument();
    expect(screen.queryByText(/1000人团队/)).not.toBeInTheDocument();
    expect(screen.queryByText(/薪酬面议/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "返回修改" }));
    expect(onBack).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "开始搜索" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("提交期间禁用开始搜索并显示进度文案", () => {
    render(
      <RoleBriefSummaryCard
        isSubmitting
        role={createRoleDraft("招聘一位 AI 产品经理")}
        onBack={() => undefined}
        onConfirm={() => undefined}
        onEdit={() => undefined}
      />,
    );

    expect(screen.getByRole("button", { name: "搜索中…" })).toBeDisabled();
  });

  it("优先展示大模型归纳的候选人要求，不回退模板原文", () => {
    const role = {
      ...createRoleDraft("我需要招聘AI产品经理，需要会写PRD和会写PRD、会做竞品分析"),
      lifecycleState: "brief_ready" as const,
      activeQuestionId: null,
      searchNarrative:
        "我将搜索以下职位：中级 AI产品经理，中国大陆，全职坐班。候选人需会写PRD、做竞品分析，并具备0-1产品落地、大模型应用与跨团队协作能力。学历本科及以上，偏好企业服务经验，不考虑纯销售背景或无产品交付经验。",
      companyCue: "1000人团队，大规模",
      companyStage: "早期创业",
    };

    render(
      <RoleBriefSummaryCard
        role={role}
        onBack={() => undefined}
        onConfirm={() => undefined}
        onEdit={() => undefined}
      />,
    );

    expect(screen.getByText(/会写PRD、做竞品分析/)).toBeInTheDocument();
    expect(screen.queryByText(/需要会写PRD和会写PRD/)).not.toBeInTheDocument();
    expect(screen.queryByText(/1000人团队/)).not.toBeInTheDocument();
  });
});
