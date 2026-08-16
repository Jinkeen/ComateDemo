import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RecruitingAppShell } from "@/features/recruiting-workflow/components/RecruitingAppShell";
import { CalibrationStage } from "@/features/recruiting-workflow/components/CalibrationStage";
import { SourcingRunStage } from "@/features/recruiting-workflow/components/SourcingRunStage";
import { CandidateApprovalStage } from "@/features/recruiting-workflow/components/CandidateApprovalStage";
import { createRoleDraft } from "@/features/role-brief/domain/workflow";
import type { CandidateMatch } from "@/features/candidates/domain/types";

const candidates: CandidateMatch[] = ["林舟", "周宁", "陈星"].map((name, index) => ({
  candidate: {
    id: `candidate-${index + 1}`,
    name,
    title: "AI 产品经理",
    seniority: "高级",
    location: "上海",
    workModels: ["混合办公"],
    skills: ["大模型产品", "B 端产品"],
    domains: ["企业服务"],
    yearsOfExperience: 6,
    summary: "负责过智能招聘产品从 0 到 1 落地。",
  },
  score: 92 - index,
  reasons: ["产品经验匹配", "领域经验匹配"],
  gaps: index ? ["团队规模待确认"] : [],
}));

describe("飞书招聘工作台框架", () => {
  it("呈现流程阶段、对话侧栏和中央工作区", () => {
    const role = {
      ...createRoleDraft("招聘一位 AI 产品经理，负责智能招聘产品"),
      title: "AI 产品经理",
      location: "上海",
      seniority: "5-8 年",
      mustHaves: ["大模型产品经验", "B 端产品经验"],
    };

    render(
      <RecruitingAppShell role={role} currentStep={4} activeView="create">
        <div>中央任务内容</div>
      </RecruitingAppShell>,
    );

    expect(screen.getByRole("navigation", { name: "主要功能" })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "对话记录" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: new RegExp(role.title) })).toHaveAttribute("href", `/hire/role/${role.id}?view=create`);
    expect(screen.getByRole("link", { name: "岗位创建" })).toHaveAttribute("href", `/hire/role/${role.id}?view=create`);
    expect(screen.getByRole("link", { name: "简历筛选" })).toHaveAttribute("href", `/hire/role/${role.id}?view=screening`);
    expect(screen.getByRole("link", { name: "候选人触达" })).toHaveAttribute("href", `/hire/role/${role.id}?view=outreach`);
    expect(screen.getByRole("link", { name: "面试日程" })).toHaveAttribute("href", `/hire/role/${role.id}?view=schedule`);
    expect(screen.getByRole("link", { name: "面试报告" })).toHaveAttribute("href", `/hire/role/${role.id}?view=report`);
    expect(screen.getByRole("list", { name: "招聘流程" }).children).toHaveLength(11);
    expect(screen.getByText("职位简报与任务承接")).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("complementary", { name: "招聘进展与搜索标准" })).toHaveClass("nw-context-rail");
    expect(screen.getByText("上海")).toBeInTheDocument();
    expect(screen.getByText("中央任务内容")).toBeInTheDocument();
  });

  it("选择样本判断后仍要求填写判断依据", async () => {
    const user = userEvent.setup();
    render(<CalibrationStage candidate={candidates[0]} index={0} total={3} onSubmit={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Maybe" }));
    expect(screen.getByLabelText("判断依据")).toBeRequired();
    expect(screen.getByRole("button", { name: "提交判断" })).toBeDisabled();
  });

  it("呈现完整搜索漏斗和人工审批状态", () => {
    render(<SourcingRunStage sourcing={{ status: "awaiting_review", screen: 100, match: 25, candidateIds: ["a", "b"], error: null }} onRun={vi.fn()} />);
    expect(screen.getByText("100", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("25", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("等待人工审批")).toBeInTheDocument();
  });

  it("跨分页保留候选人选择且空选择不可批准", async () => {
    const user = userEvent.setup();
    render(<CandidateApprovalStage candidates={candidates} pageSize={2} onApprove={vi.fn()} />);
    expect(screen.getByRole("button", { name: "确认候选人" })).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: "选择候选人 林舟" }));
    await user.click(screen.getByRole("button", { name: "下一页" }));
    expect(screen.getByText("已选择 1 位候选人")).toBeInTheDocument();
  });
});
