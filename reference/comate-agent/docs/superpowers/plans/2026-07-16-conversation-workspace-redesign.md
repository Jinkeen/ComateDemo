# 对话式招聘工作台重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将第一期职位澄清界面重做为 Agent 选项对话流，同时不破坏已验证的原生表单状态机。

**Architecture:** 领域工作流、GET command 字段与本地仓储维持不变。新增纯展示的对话记录与进展投影，页面组件只根据 `RoleBrief` 和当前问题渲染；所有回答仍由原生 `<form method="get">` 提交给动态路由。

**Tech Stack:** Next.js 16 App Router、React 19、TypeScript strict、Tailwind CSS 4、现有 CSS token、Vitest、React Testing Library。

---

### Task 1: 建立对话工作台的只读视图模型与测试

**Files:**
- Create: `src/features/role-brief/domain/presentation.ts`
- Create: `tests/role-brief/presentation.test.ts`

- [ ] **Step 1: 写失败的展示投影测试**

```ts
import { describe, expect, it } from "vitest";
import { createRoleDraft, answerQuestion } from "@/features/role-brief/domain/workflow";
import { buildConversationTranscript, buildProgressItems } from "@/features/role-brief/domain/presentation";

it("把已回答条件投影为按问题顺序排列的 Q/A 对话", () => {
  const draft = createRoleDraft("招聘一位 AI 产品经理");
  const role = answerQuestion(draft, "location", "远程优先");

  expect(buildConversationTranscript(role)).toEqual([
    { question: "这个职位主要在哪个地区招聘？", answer: "远程优先" },
  ]);
});

it("将生命周期投影为四个招聘进度项", () => {
  const role = createRoleDraft("招聘一位 AI 产品经理");
  expect(buildProgressItems(role)[0]).toMatchObject({ label: "澄清职位", status: "current" });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm.cmd run test -- tests/role-brief/presentation.test.ts`

Expected: FAIL，模块 `presentation` 不存在。

- [ ] **Step 3: 实现最小展示投影**

```ts
export interface ConversationTurn { question: string; answer: string; }
export type ProgressStatus = "complete" | "current" | "upcoming";

export function buildConversationTranscript(role: RoleBrief): ConversationTurn[] {
  return clarificationQuestions
    .map((question) => ({ question, answer: role.answers.find((item) => item.questionId === question.id) }))
    .filter((item) => item.answer)
    .map((item) => ({ question: item.question.prompt, answer: item.answer!.rawValue || "暂时跳过" }));
}
```

实现 `buildProgressItems`，输出 `澄清职位 / 评测样本 / 寻找并联系 / 完工`，当前第一期只允许第一个状态为 `current` 或 `complete`。

- [ ] **Step 4: 运行测试确认通过**

Run: `npm.cmd run test -- tests/role-brief/presentation.test.ts`

Expected: PASS。

- [ ] **Step 5: 稳定节点**

Run: `npm.cmd run typecheck`

Expected: PASS。不要创建 Git 提交，用户已明确要求不提交。

### Task 2: 重构 Agent 对话记录与当前问题卡

**Files:**
- Create: `src/features/role-brief/components/ClarificationTranscript.tsx`
- Create: `src/features/role-brief/components/CurrentQuestionCard.tsx`
- Modify: `src/features/role-brief/components/AgentConversation.tsx`
- Create: `tests/role-brief/agent-conversation.test.tsx`

- [ ] **Step 1: 写组件结构失败测试**

```tsx
it("渲染已确认 Q/A、当前问题和原生单选提交表单", () => {
  render(<AgentConversation role={answeredRole} question={getQuestion("workModel")} />);

  expect(screen.getByText("Q: 这个职位主要在哪个地区招聘？")).toBeInTheDocument();
  expect(screen.getByText("A: 远程优先")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "希望候选人采用哪种工作方式？" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "完全远程" }).closest("form")).toHaveAttribute("method", "get");
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm.cmd run test -- tests/role-brief/agent-conversation.test.tsx`

Expected: FAIL，`Q:` / `A:` 回顾文本尚不存在。

- [ ] **Step 3: 建立两个纯展示组件**

`ClarificationTranscript` 接收 `ConversationTurn[]`，逐行渲染：

```tsx
<article className="rh-turn">
  <p><span>Q:</span> {turn.question}</p>
  <p><span>A:</span> {turn.answer}</p>
</article>
```

`CurrentQuestionCard` 接收 `role`、`question` 与 `actionPath`。将现有单选、多选、自由文本、跳过和返回的全部 hidden command fields 原样保留；每个操作继续使用 `<form action={actionPath} method="get">`。

- [ ] **Step 4: 组合对话页面**

将 `AgentConversation` 改为：顶部职位原始描述气泡 → `ClarificationTranscript` → 一句固定 Agent 过渡文案 → `CurrentQuestionCard`。删除旧的单独回答历史区，避免重复显示。

- [ ] **Step 5: 运行组件和领域测试**

Run: `npm.cmd run test`

Expected: 所有领域与组件测试 PASS。

### Task 3: 重做右侧进展与搜索标准面板

**Files:**
- Create: `src/features/role-brief/components/ProgressRail.tsx`
- Modify: `src/features/role-brief/components/SearchCriteriaPanel.tsx`
- Modify: `src/features/role-brief/components/RoleBriefWorkspace.tsx`

- [ ] **Step 1: 创建进展轨组件**

```tsx
export function ProgressRail({ items }: { items: ProgressItem[] }) {
  return <section className="rh-progress" aria-label="招聘进展">
    <h2>进展</h2>
    <ol>{items.map((item) => <li className={"is-" + item.status} key={item.id}>{item.label}</li>)}</ol>
  </section>;
}
```

- [ ] **Step 2: 将搜索条件改为分组清单**

使用 `projectSearchCriteria(role)` 输出“角色基础、必备内容、偏好与限制”三组，而不是旧的深色状态卡。未完成字段只显示在“待补充”一行；必备能力使用自然换行的浅灰标签。

- [ ] **Step 3: 在工作台挂载右侧轨道**

在 `RoleBriefWorkspace` 的右列中，按 `ProgressRail`、`SearchCriteriaPanel`、`LocalModeNotice` 的顺序渲染。保留 `BriefReview` 的确认流程。

- [ ] **Step 4: 类型与可访问性检查**

Run: `npm.cmd run typecheck; npm.cmd run lint`

Expected: PASS；每个侧栏区块有可读标题或 `aria-label`。

### Task 4: 更新页面骨架、导航和全局排版令牌

**Files:**
- Modify: `src/features/role-brief/components/RoleSidebar.tsx`
- Modify: `src/features/role-brief/components/NewRoleLanding.tsx`
- Modify: `src/features/role-brief/components/WorkflowStepper.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: 替换视觉令牌**

在 `globals.css` 增加：

```css
:root {
  --rh-ink: #1e1e24;
  --rh-muted: #77737d;
  --rh-canvas: #fcfbf8;
  --rh-rail: #f4f2ec;
  --rh-line: #e7e3dc;
  --rh-primary: #4f36b8;
  --rh-success: #e7f6ec;
}
```

为 `.rolebrief-*` 新增或替换规则：224px 左导航、320px 右列、主内容最大 760px；正文 `14px/1.6`，问题标题 `clamp(20px, 2vw, 24px)/1.25`，禁止渐变与 emoji 图形。

- [ ] **Step 2: 改造导航与顶部上下文**

`RoleSidebar` 用文字导航与安装好的线性图标替换 `＋`、`⌁`、头像文字图形；保留 `/hire` 链接和当前职位名称。`WorkflowStepper` 改为紧凑面包屑/步骤文字，不再占用一整条粗大的进度栏。

- [ ] **Step 3: 统一入口页视觉**

`NewRoleLanding` 改为与工作台一致的三栏骨架：左导航、中央文档式职位描述表单、右侧三条写作提示。保留原生 `method="get"` 与 `description` 字段。

- [ ] **Step 4: 响应式规则**

在 900px 将右侧信息列移动到主列之后；在 680px 隐藏导航细节但保留新建职位入口，表单、选项和按钮均为 100% 可用宽度。

- [ ] **Step 5: 运行完整质量闸门**

Run: `npm.cmd run test; npm.cmd run typecheck; npm.cmd run lint; npm.cmd run build`

Expected: 全部 PASS。

### Task 5: 浏览器设计 QA 与安全回归

**Files:**
- Create: `design-qa.md`

- [ ] **Step 1: 启动并检查本地页面**

Run: `npm.cmd run dev`

在内置浏览器打开 `http://127.0.0.1:3000/hire`，确认三栏排版、14px 以上正文、无渐变球、无 emoji。

- [ ] **Step 2: 验证核心流程**

输入 AI 产品经理职位描述，提交后选择“远程优先”。确认当前问题进入“工作方式”，中列出现地点 Q/A 回顾，右侧地点改为“远程优先”。

- [ ] **Step 3: 写设计 QA 报告**

`design-qa.md` 必须包含：参考图片路径、验证视口、排版检查、交互检查、安全检查、遗留 P3 和最后一行：

```md
final result: passed
```

- [ ] **Step 4: 稳定节点**

再次运行 `npm.cmd run build`。不要创建 Git 提交，用户已明确要求不提交。
