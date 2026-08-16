import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getReviewCandidates } from "@/features/candidates/data/candidate-match-factory";
import { CandidateApprovalStage } from "@/features/recruiting-workflow/components/CandidateApprovalStage";
import { CandidateProjectExperience } from "@/features/recruiting-workflow/components/CandidateProjectExperience";
import { CandidateResumeDetail } from "@/features/recruiting-workflow/components/CandidateResumeDetail";

afterEach(cleanup);

describe("候选人项目经验", () => {
  it("按开源和商业项目分组展示完整项目卡片", () => {
    render(<CandidateProjectExperience />);

    expect(screen.getByRole("heading", { name: "开源项目 2" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "商业项目 1" })).toBeInTheDocument();
    expect(screen.getByText("langgenius/dify")).toBeInTheDocument();
    expect(screen.getByText("langgenius/langgenius")).toBeInTheDocument();
    expect(screen.getByText("星河智能客服平台")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dify GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/langgenius/dify",
    );
    expect(screen.getByRole("link", { name: "Dify 官网" })).toHaveAttribute(
      "href",
      "https://dify.ai",
    );
  });

  it("在简历筛选详情中展示共享项目卡片", async () => {
    const user = userEvent.setup();
    render(
      <CandidateApprovalStage
        candidates={getReviewCandidates()}
        onApprove={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "项目经验" }));

    expect(screen.getByText("langgenius/dify")).toBeInTheDocument();
    expect(screen.getByText("langgenius/langgenius")).toBeInTheDocument();
    expect(screen.getByText("星河智能客服平台")).toBeInTheDocument();
  });

  it("在单人简历评审详情中展示同一组项目卡片", async () => {
    const user = userEvent.setup();
    render(<CandidateResumeDetail match={getReviewCandidates()[0]} />);

    await user.click(screen.getByRole("button", { name: "项目经验" }));

    expect(screen.getByText("langgenius/dify")).toBeInTheDocument();
    expect(screen.getByText("langgenius/langgenius")).toBeInTheDocument();
    expect(screen.getByText("星河智能客服平台")).toBeInTheDocument();
  });
});
