import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NewRoleLanding } from "@/features/role-brief/components/NewRoleLanding";

describe("职位创建首页", () => {
  it("提供本地模拟的职位描述入口", () => {
    render(<NewRoleLanding />);

    expect(screen.getByRole("heading", { name: "你好，准备开始招聘了吗？" })).toBeInTheDocument();
    expect(screen.getByLabelText("职位描述")).toHaveAttribute("name", "description");
    expect(screen.getByRole("button", { name: "上传职位详情文件" })).toHaveAttribute("type", "button");
    expect(screen.getByRole("button", { name: "上传相似岗位资料" })).toHaveAttribute("type", "button");
    expect(screen.getByRole("button", { name: "LinkedIn 链接" })).toHaveAttribute("type", "button");
    expect(screen.getByRole("button", { name: "职位链接" })).toHaveAttribute("type", "button");
    expect(screen.getByRole("button", { name: "开始职位澄清" })).toHaveAttribute("type", "submit");
  });
});
