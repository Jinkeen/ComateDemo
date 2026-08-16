import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getReviewCandidates } from "@/features/candidates/data/candidate-match-factory";
import { CandidateApprovalStage } from "@/features/recruiting-workflow/components/CandidateApprovalStage";
import { CandidateResumeDetail } from "@/features/recruiting-workflow/components/CandidateResumeDetail";

afterEach(cleanup);

describe("林澈筛选详情", () => {
  it("卡片展示项目经验推荐标注，并默认打开项目经验", () => {
    render(
      <CandidateApprovalStage
        candidates={getReviewCandidates()}
        onApprove={vi.fn()}
      />,
    );

    expect(screen.getByText("项目经验丰富")).toBeInTheDocument();
    expect(screen.getByText(/林澈拥有卓越的项目经验/)).toBeInTheDocument();
    expect(screen.getByText("林澈_简历.pdf")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "项目经验" })).toHaveClass("is-current");
    expect(screen.getByText("langgenius/dify")).toBeInTheDocument();
  });
});

describe("周宁筛选详情", () => {
  it("卡片展示自媒体标注，默认打开自媒体账号并排在页签最前", async () => {
    const user = userEvent.setup();
    render(
      <CandidateApprovalStage
        candidates={getReviewCandidates()}
        onApprove={vi.fn()}
      />,
    );

    expect(screen.getByText("产品自媒体出色")).toBeInTheDocument();
    await user.click(screen.getAllByText("周宁")[0]);

    const socialTab = screen.getByRole("button", { name: "自媒体账号" });
    expect(socialTab).toHaveClass("is-current");
    expect(screen.getByRole("navigation").firstElementChild).toHaveTextContent("自媒体账号");
    expect(screen.getByRole("heading", { name: "智东西账号内容" })).toBeInTheDocument();
    expect(screen.getByText(/周宁的产品自媒体做得很好/)).toBeInTheDocument();
    expect(screen.getByText("周宁_简历.pdf")).toBeInTheDocument();
    expect(screen.queryByText("张晓雨_简历.pdf")).not.toBeInTheDocument();
  });

  it("单人简历详情同样默认打开自媒体账号", () => {
    const zhouNing = getReviewCandidates().find((match) => match.candidate.name.includes("周宁"));
    render(<CandidateResumeDetail match={zhouNing!} />);

    expect(screen.getByRole("button", { name: "自媒体账号" })).toHaveClass("is-current");
    expect(screen.getByRole("navigation").firstElementChild).toHaveTextContent("自媒体账号");
    expect(screen.getByRole("heading", { name: "智东西账号内容" })).toBeInTheDocument();
    expect(screen.getByText("周宁_简历.pdf")).toBeInTheDocument();
    expect(screen.getByText(/周宁的产品自媒体做得很好/)).toBeInTheDocument();
  });
});

describe("陈星筛选卡片", () => {
  it("新加坡地点右侧展示工作经历丰富标注", () => {
    render(
      <CandidateApprovalStage
        candidates={getReviewCandidates()}
        onApprove={vi.fn()}
      />,
    );

    const locationRow = screen.getByText("新加坡").closest("small");
    expect(locationRow).toHaveTextContent("新加坡");
    expect(locationRow).toHaveTextContent("工作经历丰富");
    expect(locationRow?.querySelector(".screening-recommend-note")).toHaveTextContent("工作经历丰富");
  });
});
