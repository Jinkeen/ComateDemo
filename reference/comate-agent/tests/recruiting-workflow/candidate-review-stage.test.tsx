import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CandidateReviewStage } from "@/features/recruiting-workflow/components/CandidateReviewStage";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

afterEach(() => {
  cleanup();
  replace.mockClear();
});

describe("候选人样本评审工作区", () => {
  it("默认展示林澈简历并在判断后自动进入下一位", async () => {
    const user = userEvent.setup();
    render(<CandidateReviewStage candidateId="synthetic-1" roleId="role-123" />);

    expect(screen.getByRole("heading", { name: "林澈" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "评审样本 1 / 3" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "适合：符合当前候选人画像" }));

    expect(screen.getByRole("heading", { name: "评审样本 2 / 3" })).toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith(
      "/hire/role/role-123?view=screening&mode=review&candidate=synthetic-2",
      { scroll: false },
    );
  });

  it("完成样本判断后直接返回职位交互界面", async () => {
    const user = userEvent.setup();
    const onFeedbackChange = vi.fn();
    render(
      <CandidateReviewStage
        candidateId="synthetic-1"
        onFeedbackChange={onFeedbackChange}
        roleId="role-123"
      />,
    );

    await user.type(screen.getByLabelText("补充候选人判断原因"), "更看重 B 端产品经验");
    await user.click(screen.getByRole("button", { name: "适合：符合当前候选人画像" }));
    await user.click(screen.getByRole("button", { name: "待确认：部分条件需要进一步核实" }));
    await user.click(screen.getByRole("button", { name: "不适合：不符合岗位关键要求" }));

    expect(onFeedbackChange).toHaveBeenLastCalledWith([
      { candidateId: "synthetic-1", verdict: "good_fit", evidence: "更看重 B 端产品经验" },
      { candidateId: "synthetic-2", verdict: "maybe", evidence: "部分条件需要进一步核实" },
      { candidateId: "synthetic-3", verdict: "not_a_fit", evidence: "不符合岗位关键要求" },
    ]);
    expect(screen.queryByText("样本评审完成")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "评审样本 3 / 3" })).toBeInTheDocument();
    expect(replace).toHaveBeenLastCalledWith("/hire/role/role-123?view=create", { scroll: false });
  });
});
