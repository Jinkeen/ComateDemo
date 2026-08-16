# 职位澄清与 Brief 确认实施计划

> **给执行型智能体：** 必须按任务顺序实施；每一步使用复选框跟踪。当前用户明确要求不创建 Git 提交，因此所有“稳定节点”只执行测试与记录，不提交。

**目标：** 在 Next.js 项目中完成“新建职位 → Agent 澄清 → 搜索标准实时更新 → 匿名 Brief 确认”的本地高保真招聘工作台。

**架构：** 用纯 TypeScript 领域模块管理职位、问题和状态机；React 页面只渲染查询模型并派发领域动作。浏览器本地存储只通过一个仓储适配器访问，所有流转同时追加审计事件。候选人、搜索、外联和支付均不在第一期实现。

**技术栈：** Next.js 16 App Router、React 19、TypeScript strict、Tailwind CSS 4、Lucide React、Vitest、React Testing Library、jsdom。

---

## 范围护栏

- 只改 D:/招聘助手/comate 内的文件。
- 不修改现有 recruiting-demo 目录中的旧演示组件；新流程使用独立的 role-brief 功能目录。
- 不复制 Metix 的 Logo、文案、候选人档案、头像或联系信息。
- 不写任何 fetch、第三方 API、上传、邮箱、支付、认证或日历调用。
- 所有示例职位、公司和用户资料均为虚构值。
- 开始代码任务前，阅读 node_modules/next/dist/docs 中与 App Router 动态路由、客户端组件和重定向相关的 Next.js 16 文档，遵守项目 AGENTS.md 的版本约束。

## 目标文件结构

| 路径 | 职责 |
| --- | --- |
| src/features/role-brief/domain/types.ts | 领域类型和不可变状态定义 |
| src/features/role-brief/domain/questions.ts | 固定问题组和选项 |
| src/features/role-brief/domain/workflow.ts | 状态机、命令和守卫 |
| src/features/role-brief/domain/criteria.ts | RoleBrief 到右侧搜索标准的只读投影 |
| src/features/role-brief/domain/anonymous-company.ts | 公司保密策略与匿名画像 |
| src/features/role-brief/data/local-role-repository.ts | localStorage 仓储与审计保存 |
| src/features/role-brief/hooks/useRoleBrief.ts | 将领域命令接入 React 的客户端 Hook |
| src/features/role-brief/components/*.tsx | 第一期开发表的专用视觉组件 |
| src/app/hire/page.tsx | 新建职位页面 |
| src/app/hire/role/[roleId]/page.tsx | 动态角色路由的服务端页面壳 |
| src/app/hire/role/[roleId]/RoleWorkspaceClient.tsx | 客户端工作台加载与交互 |
| src/app/page.tsx | 重定向到 /hire |
| src/app/globals.css | 全局色彩令牌、字体基础和不适合 Tailwind 的细节 |
| src/test/setup.ts | 测试环境初始化 |
| vitest.config.ts | Vitest 配置 |
| tests/role-brief/*.test.ts | 领域、持久化和界面测试 |

## 任务 1：建立测试基线和第一期路由骨架

**文件：**

- 修改：package.json
- 新建：vitest.config.ts
- 新建：src/test/setup.ts
- 修改：src/app/page.tsx
- 新建：src/app/hire/page.tsx
- 新建：src/app/hire/role/[roleId]/page.tsx

- [ ] **步骤 1：阅读当前 Next.js 16 文档**

运行：

~~~powershell
Get-ChildItem -Path node_modules/next/dist/docs -Recurse -File |
  Select-String -Pattern "dynamic route|use client|redirect" -CaseSensitive:$false |
  Select-Object -First 30
~~~

预期：找到与动态路由、客户端组件和 redirect 相关的版本内文档；将读取结果作为实现约束。

- [ ] **步骤 2：安装并配置测试依赖**

在 package.json 的 scripts 中增加：

~~~json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
~~~

在 devDependencies 增加 Vitest、jsdom、@testing-library/react、@testing-library/jest-dom 和 @vitejs/plugin-react 的兼容版本。创建 vitest.config.ts：

~~~ts
import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
~~~

创建 src/test/setup.ts：

~~~ts
import "@testing-library/jest-dom/vitest";
~~~

- [ ] **步骤 3：建立路由壳**

将 src/app/page.tsx 改为：

~~~ts
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/hire");
}
~~~

创建 src/app/hire/page.tsx，输出一个有标题的 New Role 页面。创建 src/app/hire/role/[roleId]/page.tsx，接收 params 中的 roleId 并渲染“正在加载职位工作台”的静态服务端占位页面；任务 4 才接入客户端状态。

- [ ] **步骤 4：运行路由和类型检查**

运行：

~~~powershell
npm run typecheck
~~~

预期：类型检查通过；/ 根路由跳转至 /hire，/hire 与动态角色壳均可编译。

- [ ] **步骤 5：稳定节点**

记录：当前只完成测试和路由骨架，不提交 Git。

## 任务 2：实现职位领域模型、问题组和状态机

**文件：**

- 新建：src/features/role-brief/domain/types.ts
- 新建：src/features/role-brief/domain/questions.ts
- 新建：src/features/role-brief/domain/workflow.ts
- 新建：tests/role-brief/workflow.test.ts
- 新建：tests/role-brief/fixtures.ts

- [ ] **步骤 1：写状态机失败测试**

创建 tests/role-brief/workflow.test.ts：

~~~ts
import { describe, expect, it } from "vitest";
import {
  answerQuestion,
  createRoleDraft,
  getActiveQuestion,
  goToPreviousQuestion,
} from "@/features/role-brief/domain/workflow";

describe("职位澄清状态机", () => {
  it("地点未回答时不能推进", () => {
    const role = createRoleDraft("招聘一位 AI 产品经理");

    expect(getActiveQuestion(role)?.id).toBe("location");
    expect(goToPreviousQuestion(role)).toEqual(role);
  });

  it("回答地点后进入核心条件问题组", () => {
    const role = createRoleDraft("招聘一位 AI 产品经理");
    const next = answerQuestion(role, "location", "香港 / 台湾");

    expect(next.lifecycleState).toBe("clarification_core");
    expect(getActiveQuestion(next)?.id).toBe("workModel");
  });
});
~~~

- [ ] **步骤 2：运行测试，确认它失败**

运行：

~~~powershell
npm run test -- tests/role-brief/workflow.test.ts
~~~

预期：失败，因为状态机命令尚未实现。

- [ ] **步骤 3：定义强类型领域模型**

在 types.ts 定义：

~~~ts
export type RoleLifecycleState =
  | "clarification_location"
  | "clarification_core"
  | "clarification_background"
  | "company_context"
  | "confidentiality"
  | "logistics"
  | "brief_ready"
  | "brief_confirmed";

export interface ClarificationAnswer {
  questionId: string;
  rawValue: string;
  normalizedValue: string;
  required: boolean;
  answeredAt: string;
}

export interface RoleBrief {
  id: string;
  title: string;
  originalDescription: string;
  lifecycleState: RoleLifecycleState;
  activeQuestionId: string;
  answers: readonly ClarificationAnswer[];
  location?: string;
  workModel?: string;
  seniority?: string;
  mustHaves: readonly string[];
  education?: string;
  domain?: string;
  exclusions: readonly string[];
  companyCue?: string;
  companyStage?: string;
  companyDomain?: string;
  companyVisibility?: "visible" | "confidential";
  anonymousCompanyProfile?: string;
  compensation?: string;
  visaPolicy?: string;
  interviewProcess?: string;
  criteriaVersion: number;
  createdAt: string;
  updatedAt: string;
}
~~~

- [ ] **步骤 4：定义固定问题组**

在 questions.ts 定义 location、workModel、seniority、mustHaves、education、domain、exclusions、companyCue、companyStage、companyDomain、companyVisibility、compensation、visaPolicy、interviewProcess。每题包含 id、分组、标签、是否必答、选项和是否允许自定义文本。

地点题必须是第一个问题；薪酬、签证与面试流程放在 logistics；面试流程设为可跳过。

- [ ] **步骤 5：实现纯状态机**

在 workflow.ts 实现 createRoleDraft、getActiveQuestion、answerQuestion、goToPreviousQuestion、skipOptionalQuestion、confirmBrief 和 createAuditEvent。

关键规则：

~~~ts
export function canAdvance(role: RoleBrief): boolean {
  const activeQuestion = getActiveQuestion(role);
  if (!activeQuestion) return role.lifecycleState === "brief_ready";

  return !activeQuestion.required || hasAnswer(role, activeQuestion.id);
}
~~~

回答写入新的 ClarificationAnswer，不修改旧对象；完成当前组后跳到下一组；公司可见性选择“保密”时把匿名画像数据写入角色扩展字段。createAuditEvent 接收 roleId、eventType、previousState、nextState 和 payloadSummary，返回带时间戳与随机 ID 的 WorkflowAuditEvent。

- [ ] **步骤 6：创建跨测试共享夹具**

创建 tests/role-brief/fixtures.ts，提供 createCompletedRequiredRole 和 createConfidentialRole。两个函数必须从 createRoleDraft 开始，使用 answerQuestion 和 skipOptionalQuestion 逐题构造，不允许直接伪造 lifecycleState 或 answers。

- [ ] **步骤 7：补齐边界测试**

在 workflow.test.ts 增加：

~~~ts
it("可选面试流程可以跳过并进入 Brief 待确认", () => {
  const role = createCompletedRequiredRole();
  const next = skipOptionalQuestion(role);

  expect(next.lifecycleState).toBe("brief_ready");
});

it("未完成必填项不能确认 Brief", () => {
  const role = createRoleDraft("招聘一位 AI 产品经理");

  expect(() => confirmBrief(role)).toThrow("必填职位信息尚未完成");
});
~~~

createCompletedRequiredRole 从 tests/role-brief/fixtures.ts 导入，并通过真实领域命令依次构造。

- [ ] **步骤 8：运行领域测试**

运行：

~~~powershell
npm run test -- tests/role-brief/workflow.test.ts
npm run typecheck
~~~

预期：全部通过。

## 任务 3：实现搜索标准投影、匿名公司画像和本地仓储

**文件：**

- 新建：src/features/role-brief/domain/criteria.ts
- 新建：src/features/role-brief/domain/anonymous-company.ts
- 新建：src/features/role-brief/data/local-role-repository.ts
- 新建：tests/role-brief/criteria.test.ts
- 新建：tests/role-brief/local-role-repository.test.ts

- [ ] **步骤 1：写投影与匿名化失败测试**

创建 tests/role-brief/criteria.test.ts：

~~~ts
import { describe, expect, it } from "vitest";
import { toSearchCriteriaSections } from "@/features/role-brief/domain/criteria";
import { createConfidentialRole } from "./fixtures";

describe("搜索标准投影", () => {
  it("将已确认回答分成角色基础和必备条件", () => {
    const sections = toSearchCriteriaSections(createConfidentialRole());

    expect(sections[0]?.title).toBe("角色基础");
    expect(sections.flatMap((section) => section.items)).toContain("AI 产品经理");
  });
});
~~~

在匿名公司测试中验证公司保密后只出现“早期 AI SaaS 公司”一类的匿名画像，不出现原始公司输入。

- [ ] **步骤 2：运行测试，确认它失败**

运行：

~~~powershell
npm run test -- tests/role-brief/criteria.test.ts
~~~

预期：失败，因为 criteria 和匿名化模块不存在。

- [ ] **步骤 3：实现只读投影**

criteria.ts 导出：

~~~ts
export interface CriteriaSection {
  title: string;
  items: readonly string[];
}

export function toSearchCriteriaSections(role: RoleBrief): readonly CriteriaSection[] {
  return [
    { title: "角色基础", items: roleBasics(role) },
    { title: "必备条件", items: mustHaveCriteria(role) },
    { title: "排除条件", items: exclusionCriteria(role) },
  ].filter((section) => section.items.length > 0);
}
~~~

该模块不读取 localStorage，不修改 RoleBrief。

- [ ] **步骤 4：实现本地仓储接口**

local-role-repository.ts 定义接口：

~~~ts
export interface LocalRoleRepository {
  load(roleId: string): RoleBrief | null;
  save(role: RoleBrief): void;
  list(): readonly RoleBrief[];
  appendAudit(event: WorkflowAuditEvent): void;
  listAudit(roleId: string): readonly WorkflowAuditEvent[];
}
~~~

提供 createBrowserRoleRepository(storage: Storage) 实现；存储键使用固定前缀 comate.role-brief.v1。解析失败时返回 null，不抛出未处理异常。

- [ ] **步骤 5：写仓储恢复测试**

创建 tests/role-brief/local-role-repository.test.ts：

~~~ts
it("保存后可以恢复角色和审计事件", () => {
  const repository = createBrowserRoleRepository(window.localStorage);
  const role = createRoleDraft("招聘一位 AI 产品经理");

  repository.save(role);
  repository.appendAudit(createAuditEvent(role.id, "role_created"));

  expect(repository.load(role.id)?.title).toBe("AI 产品经理");
  expect(repository.listAudit(role.id)).toHaveLength(1);
});
~~~

- [ ] **步骤 6：运行测试**

运行：

~~~powershell
npm run test -- tests/role-brief/criteria.test.ts tests/role-brief/local-role-repository.test.ts
npm run typecheck
~~~

预期：全部通过。

## 任务 4：接入客户端 Hook 和动态角色路由

**文件：**

- 新建：src/features/role-brief/hooks/useRoleBrief.ts
- 新建：src/app/hire/role/[roleId]/RoleWorkspaceClient.tsx
- 修改：src/app/hire/role/[roleId]/page.tsx
- 修改：src/app/hire/page.tsx
- 新建：tests/role-brief/role-route.test.tsx

- [ ] **步骤 1：写路由失败测试**

创建 tests/role-brief/role-route.test.tsx：

~~~tsx
import { render, screen } from "@testing-library/react";
import { RoleWorkspaceClient } from "@/app/hire/role/[roleId]/RoleWorkspaceClient";

it("找不到本地职位时显示可恢复提示", () => {
  render(<RoleWorkspaceClient roleId="missing-role" />);

  expect(screen.getByText("未找到本地职位")).toBeInTheDocument();
});
~~~

- [ ] **步骤 2：运行测试，确认它失败**

运行：

~~~powershell
npm run test -- tests/role-brief/role-route.test.tsx
~~~

预期：失败，因为客户端工作台组件不存在。

- [ ] **步骤 3：实现 useRoleBrief**

Hook 负责：

- 首次加载仓储中的角色。
- 把领域命令包装成 React 回调。
- 每次成功流转后依次保存角色和追加审计事件。
- localStorage 不可用时保留内存状态并暴露 persistenceWarning。

Hook 不直接处理任何布局、颜色或文案。

- [ ] **步骤 4：实现新建职位页提交**

src/app/hire/page.tsx 使用客户端表单：

~~~tsx
const [description, setDescription] = useState("");
const canSubmit = description.trim().length >= 10;

function submitRole() {
  const role = createRoleDraft(description);
  repository.save(role);
  router.push("/hire/role/" + role.id);
}
~~~

按钮在 canSubmit 为 false 时禁用。上传、LinkedIn URL 和 Job URL 只显示“第一期为本地演示，不会上传或抓取”的反馈。

- [ ] **步骤 5：实现动态角色页**

服务端 page.tsx 只读取 params 并传给 RoleWorkspaceClient。RoleWorkspaceClient 是客户端组件，加载角色并区分 loading、missing、persistenceWarning 和正常工作台状态。

- [ ] **步骤 6：运行路由测试**

运行：

~~~powershell
npm run test -- tests/role-brief/role-route.test.tsx
npm run typecheck
~~~

预期：找不到角色时可恢复；有效角色由后续界面任务覆盖。

## 任务 5：实现三栏工作台和 Metix 风格视觉基础

**文件：**

- 新建：src/features/role-brief/components/RecruitingSidebar.tsx
- 新建：src/features/role-brief/components/RoleWorkspace.tsx
- 新建：src/features/role-brief/components/ConversationTimeline.tsx
- 新建：src/features/role-brief/components/ProgressPanel.tsx
- 新建：src/features/role-brief/components/SearchCriteriaPanel.tsx
- 修改：src/app/globals.css
- 修改：src/app/hire/role/[roleId]/RoleWorkspaceClient.tsx
- 新建：tests/role-brief/workspace-layout.test.tsx

- [ ] **步骤 1：写三栏结构失败测试**

创建 tests/role-brief/workspace-layout.test.tsx：

~~~tsx
import { render, screen } from "@testing-library/react";
import { RoleWorkspace } from "@/features/role-brief/components/RoleWorkspace";
import { createRoleDraft } from "@/features/role-brief/domain/workflow";

it("显示左侧导航、中央对话和右侧搜索标准", () => {
  render(<RoleWorkspace role={createRoleDraft("招聘一位 AI 产品经理")} onCommand={() => undefined} />);

  expect(screen.getByLabelText("招聘工作台导航")).toBeInTheDocument();
  expect(screen.getByLabelText("职位对话")).toBeInTheDocument();
  expect(screen.getByLabelText("搜索标准")).toBeInTheDocument();
});
~~~

- [ ] **步骤 2：运行测试，确认它失败**

运行：

~~~powershell
npm run test -- tests/role-brief/workspace-layout.test.tsx
~~~

预期：失败，因为工作台组件未实现。

- [ ] **步骤 3：实现布局语义**

RoleWorkspace 使用 Tailwind 栅格：

~~~tsx
<main className="min-h-screen bg-[#fcfcfd] text-slate-950">
  <div className="grid min-h-screen grid-cols-[280px_minmax(0,1fr)_300px]">
    <RecruitingSidebar />
    <ConversationTimeline />
    <aside aria-label="搜索标准"><ProgressPanel /><SearchCriteriaPanel /></aside>
  </div>
</main>
~~~

窄屏下改为单列；第一期优先保证 1440px 以上桌面效果。

- [ ] **步骤 4：实现视觉令牌**

在 globals.css 增加统一令牌：

~~~css
:root {
  --recruiting-canvas: #fcfcfd;
  --recruiting-sidebar: #f6f6f7;
  --recruiting-border: #e9e9ee;
  --recruiting-muted: #72727d;
  --recruiting-purple: #7c3aed;
  --recruiting-card: #ffffff;
}
~~~

组件优先使用 Tailwind 工具类和这些令牌。不要复制 Metix 的文字、Logo 或真实候选人内容。

- [ ] **步骤 5：实现左侧导航与右侧栏**

左侧导航显示独立产品名、New Role、Job Brief、Interview、虚构角色列表、演示计划卡和不可执行升级按钮。右侧 Progress 显示四步流程，Search Criteria 从 toSearchCriteriaSections(role) 渲染。

- [ ] **步骤 6：运行布局测试和本地预览**

运行：

~~~powershell
npm run test -- tests/role-brief/workspace-layout.test.tsx
npm run dev
~~~

预期：测试通过；在 http://127.0.0.1:3000/hire 创建职位后能进入三栏页面。

## 任务 6：实现澄清问题卡、回答历史和实时条件更新

**文件：**

- 新建：src/features/role-brief/components/ClarificationCard.tsx
- 新建：src/features/role-brief/components/AnswerHistory.tsx
- 修改：src/features/role-brief/components/ConversationTimeline.tsx
- 修改：src/features/role-brief/components/ProgressPanel.tsx
- 新建：tests/role-brief/clarification-card.test.tsx

- [ ] **步骤 1：写问题卡失败测试**

创建 tests/role-brief/clarification-card.test.tsx：

~~~tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { ClarificationCard } from "@/features/role-brief/components/ClarificationCard";
import { locationQuestion } from "@/features/role-brief/domain/questions";

it("未选择地点时下一步按钮禁用", () => {
  render(<ClarificationCard question={locationQuestion} value="" onBack={() => undefined} onNext={() => undefined} onValueChange={() => undefined} />);

  expect(screen.getByRole("button", { name: "下一步" })).toBeDisabled();
});

it("选择地点后允许提交", () => {
  function Harness() {
    const [value, setValue] = useState("");

    return <ClarificationCard question={locationQuestion} value={value} onBack={() => undefined} onNext={() => undefined} onValueChange={setValue} />;
  }

  render(<Harness />);

  fireEvent.click(screen.getByLabelText("香港 / 台湾"));
  expect(screen.getByRole("button", { name: "下一步" })).toBeEnabled();
});
~~~

- [ ] **步骤 2：运行测试，确认它失败**

运行：

~~~powershell
npm run test -- tests/role-brief/clarification-card.test.tsx
~~~

预期：失败，因为问题卡组件不存在。

- [ ] **步骤 3：实现单选、自定义和导航**

ClarificationCard：

- 为每个选项提供可访问的 radio 标签。
- 当 question.allowCustom 为 true 时显示自定义文本输入。
- 对必答题，value.trim() 为空时禁用下一步。
- 首题的上一题按钮禁用。
- 可选题显示“跳过”按钮；跳过调用 skipOptionalQuestion。

- [ ] **步骤 4：接入回答历史和 Agent 简短理由**

ConversationTimeline 按时间渲染：

1. 原始职位描述。
2. Agent 简短理由，例如“还需要确认工作地点，才能缩小候选范围”。
3. 已完成的问答行。
4. 当前 ClarificationCard。

禁止渲染内部长推理、提示词或工具调用文本。

- [ ] **步骤 5：验证实时投影**

在测试中从地点题开始回答，再断言 SearchCriteriaPanel 同步出现“香港 / 台湾”：

~~~tsx
expect(screen.getByLabelText("搜索标准")).toHaveTextContent("香港 / 台湾");
~~~

- [ ] **步骤 6：运行组件测试**

运行：

~~~powershell
npm run test -- tests/role-brief/clarification-card.test.tsx tests/role-brief/workflow.test.ts
npm run typecheck
~~~

预期：全部通过。

## 任务 7：实现公司保密决策、物流问题和最终 Brief

**文件：**

- 新建：src/features/role-brief/components/ConfidentialityCard.tsx
- 新建：src/features/role-brief/components/RoleBriefSummary.tsx
- 修改：src/features/role-brief/components/ConversationTimeline.tsx
- 修改：src/features/role-brief/domain/anonymous-company.ts
- 修改：src/features/role-brief/domain/workflow.ts
- 新建：tests/role-brief/brief-summary.test.tsx

- [ ] **步骤 1：写最终 Brief 失败测试**

创建 tests/role-brief/brief-summary.test.tsx：

~~~tsx
import { render, screen } from "@testing-library/react";
import { RoleBriefSummary } from "@/features/role-brief/components/RoleBriefSummary";
import { createConfidentialRole } from "./fixtures";

it("保密职位只展示匿名公司画像", () => {
  render(<RoleBriefSummary role={createConfidentialRole()} onConfirm={() => undefined} />);

  expect(screen.getByText("早期 AI SaaS 公司")).toBeInTheDocument();
  expect(screen.queryByText("星云智创有限公司")).not.toBeInTheDocument();
});
~~~

- [ ] **步骤 2：运行测试，确认它失败**

运行：

~~~powershell
npm run test -- tests/role-brief/brief-summary.test.tsx
~~~

预期：失败，因为保密卡和 Brief 摘要尚未实现。

- [ ] **步骤 3：实现保密决策**

ConfidentialityCard 必须提供两个明确选项：“候选人可见公司名”和“保持保密”。未选择时提交按钮禁用。选择保密后调用匿名公司模块，生成如“早期 AI SaaS 公司”的画像；原始公司线索仅在本地 RoleBrief 内保留。

- [ ] **步骤 4：实现最终 Brief**

RoleBriefSummary 显示英文摘要，至少包含职位名、地点、资历、必备能力、公司匿名画像、行业和排除条件。只有 lifecycleState 为 brief_ready 时显示 Confirm Brief。

确认动作：

~~~ts
const confirmedRole = confirmBrief(role);
repository.save(confirmedRole);
repository.appendAudit(createAuditEvent(role.id, "brief_confirmed"));
~~~

确认后显示“第一期已完成；候选人搜索将在下一切片开放”的只读提示。

- [ ] **步骤 5：补充验收测试**

增加：

~~~tsx
it("必填信息完整时允许确认 Brief", () => {
  render(<RoleBriefSummary role={createCompletedRequiredRole()} onConfirm={() => undefined} />);

  expect(screen.getByRole("button", { name: "确认 Brief" })).toBeEnabled();
});
~~~

- [ ] **步骤 6：运行测试**

运行：

~~~powershell
npm run test -- tests/role-brief/brief-summary.test.tsx tests/role-brief/workflow.test.ts
npm run typecheck
~~~

预期：全部通过。

## 任务 8：端到端验收、视觉 QA 与安全检查

**文件：**

- 修改：docs/research/design-qa.md
- 新建：tests/role-brief/role-brief-flow.test.tsx
- 可选新建：screenshots/role-brief-mvp.png

- [ ] **步骤 1：写完整流程集成测试**

创建 tests/role-brief/role-brief-flow.test.tsx，按真实用户顺序驱动：

~~~tsx
it("从创建职位完成到确认匿名 Brief", async () => {
  render(<NewRoleAndWorkspaceHarness />);

  await user.type(screen.getByLabelText("职位描述"), "招聘一位 AI 产品经理，负责需求分析与 PRD 撰写。");
  await user.click(screen.getByRole("button", { name: "开始澄清" }));
  await user.click(screen.getByLabelText("香港 / 台湾"));
  await user.click(screen.getByRole("button", { name: "下一步" }));

  await completeRemainingRequiredQuestions(user);

  expect(screen.getByRole("button", { name: "确认 Brief" })).toBeEnabled();
});
~~~

completeRemainingRequiredQuestions 是测试文件内的明确辅助函数，逐题选择预定义值，不绕过界面逻辑。

- [ ] **步骤 2：运行完整测试套件**

运行：

~~~powershell
npm run test
npm run lint
npm run typecheck
npm run build
~~~

预期：全部通过；若任一命令失败，先保存失败输出、写最小复现测试，再修复。连续两次无法基于证据修复时停止并向用户报告。

- [ ] **步骤 3：生成桌面视觉截图**

启动本地服务并在 1440px 宽度截图：

~~~powershell
npm run dev
~~~

用本地浏览器访问 /hire，完成虚构职位至澄清页和 Brief 页。将截图与 01_role_clarification.png、02_ai_clarification_questions.png、03_search_ready_safety_boundary.png 对照，记录三栏宽度、间距、色彩、卡片圆角、紫色激活状态和右侧条件密度。

- [ ] **步骤 4：更新视觉 QA 记录**

在 docs/research/design-qa.md 增加：

| 检查项 | 结果 | 证据 |
| --- | --- | --- |
| 三栏桌面层级 | 通过或待修正 | 本地截图路径 |
| 地点必填禁用状态 | 通过或待修正 | 测试名称 |
| 右侧条件实时更新 | 通过或待修正 | 测试名称 |
| 公司匿名化 | 通过或待修正 | 测试名称 |
| 无外部副作用 | 通过或待修正 | 网络面板与代码检查 |

- [ ] **步骤 5：稳定节点**

向用户报告通过的命令、未实现范围和本地预览地址。不要提交 Git；等待用户验收后再开始第二期样本校准。

## 自检结果

- 设计覆盖：PRD 第一阶段的路由、状态机、视觉、持久化、匿名化、测试和安全边界均映射到具体任务。
- 范围控制：候选人搜索、联系、日历和账单未进入本计划。
- 无占位：每个任务都含目标文件、实现方式、测试和运行命令。
- 类型一致：RoleBrief 是领域主实体；ClarificationAnswer、WorkflowAuditEvent、CriteriaSection 和 LocalRoleRepository 在计划中的调用均通过已定义接口完成。
