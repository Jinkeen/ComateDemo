import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getReviewCandidates } from "@/features/candidates/data/candidate-match-factory";
import { CandidateApprovalStage } from "@/features/recruiting-workflow/components/CandidateApprovalStage";
import { CandidateResumeDetail } from "@/features/recruiting-workflow/components/CandidateResumeDetail";

afterEach(cleanup);

describe("简历教育背景合并技能", () => {
  it("筛选详情不再展示技能标签页签，教育背景包含专业技能", async () => {
    const user = userEvent.setup();
    render(
      <CandidateApprovalStage
        candidates={getReviewCandidates()}
        onApprove={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "技能标签" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "教育背景" }));

    expect(screen.getByText("浙江大学")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "专业技能" })).toBeInTheDocument();
    expect(screen.getByText("后端能力")).toBeInTheDocument();
  });

  it("单人简历详情同样将技能并入教育背景", async () => {
    const user = userEvent.setup();
    render(<CandidateResumeDetail match={getReviewCandidates()[0]} />);

    expect(screen.queryByRole("button", { name: "技能标签" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "教育背景" }));

    expect(screen.getByText("浙江大学")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "专业技能" })).toBeInTheDocument();
    expect(screen.getByText("核心能力")).toBeInTheDocument();
  });
});
