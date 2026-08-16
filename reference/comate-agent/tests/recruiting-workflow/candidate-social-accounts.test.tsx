import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getReviewCandidates } from "@/features/candidates/data/candidate-match-factory";
import { CandidateApprovalStage } from "@/features/recruiting-workflow/components/CandidateApprovalStage";
import { CandidateResumeDetail } from "@/features/recruiting-workflow/components/CandidateResumeDetail";
import { CandidateSocialAccounts } from "@/features/recruiting-workflow/components/CandidateSocialAccounts";

afterEach(cleanup);

describe("候选人自媒体账号", () => {
  it("展示八个账号并默认展开智东西内容", () => {
    render(<CandidateSocialAccounts />);

    expect(screen.getAllByRole("button", { name: /账号详情/ })).toHaveLength(8);
    expect(screen.getByRole("heading", { name: "智东西账号内容" })).toBeInTheDocument();
    expect(screen.getByText("2.4 万粉丝")).toBeInTheDocument();
    expect(screen.getByText("703 个视频")).toBeInTheDocument();
    expect(screen.getAllByTestId("social-video-card")).toHaveLength(3);
  });

  it("点击账号卡片可切换并收起内联详情", async () => {
    const user = userEvent.setup();
    render(<CandidateSocialAccounts />);

    const aiDouyinButton = screen.getByRole("button", { name: "查看 AI抖音 账号详情" });
    await user.click(aiDouyinButton);
    expect(screen.getByRole("heading", { name: "AI抖音账号内容" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "智东西账号内容" })).not.toBeInTheDocument();

    await user.click(aiDouyinButton);
    expect(screen.queryByRole("heading", { name: "AI抖音账号内容" })).not.toBeInTheDocument();
  });

  it("在简历筛选详情中展示共享账号内容", async () => {
    const user = userEvent.setup();
    render(
      <CandidateApprovalStage
        candidates={getReviewCandidates()}
        onApprove={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "自媒体账号" }));

    expect(screen.getAllByRole("button", { name: /账号详情/ })).toHaveLength(8);
    expect(screen.getByRole("heading", { name: "智东西账号内容" })).toBeInTheDocument();
  });

  it("在单人简历详情中展示相同账号内容", async () => {
    const user = userEvent.setup();
    render(<CandidateResumeDetail match={getReviewCandidates()[0]} />);

    await user.click(screen.getByRole("button", { name: "自媒体账号" }));

    expect(screen.getAllByRole("button", { name: /账号详情/ })).toHaveLength(8);
    expect(screen.getByRole("heading", { name: "智东西账号内容" })).toBeInTheDocument();
  });
});
