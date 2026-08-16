import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { CandidateRecommendationStage } from "@/features/recruiting-workflow/components/CandidateRecommendationStage";

afterEach(cleanup);

describe("候选人推荐卡", () => {
  it("展示三位候选人并分别链接到评审页", () => {
    render(<CandidateRecommendationStage roleId="role-123" variant="inline" />);

    expect(screen.getByRole("article", { name: "候选人推荐 林澈" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "候选人推荐 周宁" })).toBeInTheDocument();
    expect(screen.getByText("深度参与 Dify 与 LangGenius 开源产品")).toBeInTheDocument();
    expect(screen.getByText("擅长把复杂 AI 产品讲清楚并持续产出")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "推荐候选人" })).toBeInTheDocument();
    expect(screen.getAllByRole("article", { name: /候选人推荐/ })).toHaveLength(3);
    expect(screen.queryByRole("link", { name: "全部简历" })).not.toBeInTheDocument();

    const resumeLinks = screen.getAllByRole("link", { name: /查看简历/ });
    expect(resumeLinks).toHaveLength(3);
    expect(resumeLinks[0]).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/hire\/role\/role-123\?view=screening&mode=review&candidate=/),
    );
  });

  it("在当前卡片内切换下一批候选人", async () => {
    const user = userEvent.setup();
    render(<CandidateRecommendationStage roleId="role-123" variant="inline" />);

    const firstBatchLink = screen.getAllByRole("link", { name: /查看简历/ })[0];
    const firstHref = firstBatchLink.getAttribute("href");

    await user.click(screen.getByRole("button", { name: "换一批候选人" }));

    expect(screen.getAllByRole("link", { name: /查看简历/ })[0]).not.toHaveAttribute("href", firstHref);
  });
});
