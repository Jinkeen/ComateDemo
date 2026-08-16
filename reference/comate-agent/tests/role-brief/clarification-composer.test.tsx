import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClarificationComposer } from "@/features/role-brief/components/ClarificationComposer";

afterEach(cleanup);

describe("ClarificationComposer", () => {
  it("展示补充资料占位文案与发送按钮", () => {
    render(<ClarificationComposer />);

    expect(
      screen.getByPlaceholderText("请补充足够的资料以帮助筛选候选人"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "发送补充资料" })).toBeDisabled();
  });

  it("输入内容后可提交", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ClarificationComposer onSubmit={onSubmit} />);

    await user.type(
      screen.getByPlaceholderText("请补充足够的资料以帮助筛选候选人"),
      "需要熟悉 B 端 SaaS",
    );
    await user.click(screen.getByRole("button", { name: "发送补充资料" }));

    expect(onSubmit).toHaveBeenCalledWith("需要熟悉 B 端 SaaS");
    expect(screen.getByPlaceholderText("请补充足够的资料以帮助筛选候选人")).toHaveValue("");
  });
});
