import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getReviewCandidates } from "@/features/candidates/data/candidate-match-factory";
import { CandidateReviewPanel } from "@/features/recruiting-workflow/components/CandidateReviewPanel";

afterEach(cleanup);

describe("候选人中文评审栏", () => {
  it("展示中文判断按钮和原因提示", () => {
    render(
      <CandidateReviewPanel
        index={0}
        match={getReviewCandidates()[0]}
        onVerdict={vi.fn()}
        total={3}
      />,
    );

    expect(screen.getByRole("heading", { name: "评审样本 1 / 3" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "适合：符合当前候选人画像" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "待确认：部分条件需要进一步核实" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "不适合：不符合岗位关键要求" })).toBeInTheDocument();
    expect(screen.getByText("AI 会据此调整后续候选人的筛选偏好。")).toBeInTheDocument();
  });

  it("提交判断原因后替换默认提示文案", async () => {
    const user = userEvent.setup();

    render(
      <CandidateReviewPanel
        index={0}
        match={getReviewCandidates()[0]}
        onVerdict={vi.fn()}
        total={3}
      />,
    );

    await user.type(screen.getByLabelText("补充候选人判断原因"), "更看重 B 端产品经验");
    await user.click(screen.getByRole("button", { name: "保存判断原因" }));

    expect(screen.queryByText("AI 会据此调整后续候选人的筛选偏好。")).not.toBeInTheDocument();
    expect(screen.getByText("更看重 B 端产品经验")).toBeInTheDocument();
    expect(screen.getByLabelText("补充候选人判断原因")).toHaveValue("");
  });

  it("未提交时点击判断会使用输入框中的内容", async () => {
    const user = userEvent.setup();
    const onVerdict = vi.fn();
    const candidate = getReviewCandidates()[0];

    render(
      <CandidateReviewPanel
        index={0}
        match={candidate}
        onVerdict={onVerdict}
        total={3}
      />,
    );

    await user.type(screen.getByLabelText("补充候选人判断原因"), "产品落地经验完整");
    await user.click(screen.getByRole("button", { name: "适合：符合当前候选人画像" }));

    expect(onVerdict).toHaveBeenCalledWith({
      candidateId: candidate.candidate.id,
      verdict: "good_fit",
      evidence: "产品落地经验完整",
    });
  });

  it("提交判断原因后点击 verdict 会使用已提交内容", async () => {
    const user = userEvent.setup();
    const onVerdict = vi.fn();
    const candidate = getReviewCandidates()[0];

    render(
      <CandidateReviewPanel
        index={0}
        match={candidate}
        onVerdict={onVerdict}
        total={3}
      />,
    );

    await user.type(screen.getByLabelText("补充候选人判断原因"), "更看重 B 端产品经验");
    await user.click(screen.getByRole("button", { name: "保存判断原因" }));
    await user.click(screen.getByRole("button", { name: "适合：符合当前候选人画像" }));

    expect(onVerdict).toHaveBeenCalledWith({
      candidateId: candidate.candidate.id,
      verdict: "good_fit",
      evidence: "更看重 B 端产品经验",
    });
  });
});
