# DeepSeek 招聘 Agent 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把当前浏览器 localStorage 演示升级为由 DeepSeek 驱动、SQLite 持久化、可检索虚构简历库的本地招聘 Agent。

**Architecture:** Route Handler 调用 application service；application service 通过 SQLite repository 事务保存 Role、Answer、CriteriaVersion、AgentTurn 和 AuditEvent；DeepSeek adapter 只输出经 Zod 校验的 JSON。候选人检索与模型解耦：模型生成受限检索意图，本地 repository 以可解释权重筛选与排序。

**Tech Stack:** Next.js 16 App Router、React 19、TypeScript strict、SQLite（better-sqlite3）、Zod、Vitest。

---

## 文件边界

- `src/server/db/*`：连接、迁移和 SQL 数据访问；不导入 React。
- `src/features/recruiting-agent/domain/*`：问题、条件、评分与状态转换；纯函数。
- `src/features/recruiting-agent/application/*`：事务、DeepSeek 调用编排、查询模型。
- `src/features/recruiting-agent/infra/*`：DeepSeek HTTP adapter、虚构候选人仓储。
- `src/app/api/*`：身份无关的 HTTP 输入/输出适配层。
- `src/features/role-brief/components/*`：只调用 API、渲染查询模型，不保存业务真相。

### Task 1: 建立服务端依赖与配置保护

**Files:**
- Modify: `D:/招聘助手/comate/package.json`
- Create: `D:/招聘助手/comate/.env.example`
- Modify: `D:/招聘助手/comate/.gitignore`
- Test: `D:/招聘助手/comate/tests/server/env.test.ts`

- [ ] **Step 1: 写失败测试，缺少服务端密钥时返回可读配置错误。**

```ts
import { expect, it } from "vitest";
import { readDeepSeekConfig } from "@/server/env";

it("rejects a missing DeepSeek key without echoing a secret", () => {
  expect(() => readDeepSeekConfig({})).toThrow("DEEPSEEK_API_KEY 未配置");
});
```

- [ ] **Step 2: 运行失败测试。**

Run: `npm.cmd run test -- tests/server/env.test.ts`
Expected: FAIL，模块尚不存在。

- [ ] **Step 3: 安装最小后端依赖并实现环境读取。**

Run: `npm.cmd install better-sqlite3 zod && npm.cmd install -D @types/better-sqlite3`

```ts
// src/server/env.ts
export function readDeepSeekConfig(env = process.env) {
  const apiKey = env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY 未配置");
  return {
    apiKey,
    baseUrl: env.DEEPSEEK_BASE_URL?.trim() || "https://api.deepseek.com",
    model: env.DEEPSEEK_MODEL?.trim() || "deepseek-chat",
  };
}
```

`.env.example` 只列出键名；`.gitignore` 必须保留 `.env.local`。

- [ ] **Step 4: 运行测试与类型检查。**

Run: `npm.cmd run test -- tests/server/env.test.ts && npm.cmd run typecheck`
Expected: PASS。

- [ ] **Step 5: 提交。**

```bash
git add package.json package-lock.json .env.example .gitignore src/server/env.ts tests/server/env.test.ts
git commit -m "Add server environment guard"
```

### Task 2: SQLite 迁移与招聘会话仓储

**Files:**
- Create: `D:/招聘助手/comate/src/server/db/connection.ts`
- Create: `D:/招聘助手/comate/src/server/db/migrate.ts`
- Create: `D:/招聘助手/comate/src/features/recruiting-agent/data/sqlite-role-repository.ts`
- Create: `D:/招聘助手/comate/tests/recruiting-agent/sqlite-role-repository.test.ts`

- [ ] **Step 1: 写失败测试，创建 Role 后可以重新读取答案和版本。**

```ts
it("persists a role, answers and immutable criteria versions", () => {
  const repository = createTestRoleRepository();
  repository.createRole({ id: "r1", description: "招聘 AI 产品经理" });
  repository.recordAnswer({ roleId: "r1", questionId: "location", rawValue: "远程", normalizedValue: ["remote"] });
  expect(repository.getWorkspace("r1")?.answers).toHaveLength(1);
  expect(repository.getWorkspace("r1")?.criteriaVersions).toHaveLength(1);
});
```

- [ ] **Step 2: 运行失败测试。**

Run: `npm.cmd run test -- tests/recruiting-agent/sqlite-role-repository.test.ts`
Expected: FAIL，仓储尚不存在。

- [ ] **Step 3: 实现迁移和事务仓储。**

建立 `roles`、`answers`、`criteria_versions`、`agent_turns`、`audit_events` 表。`roles` 保存 `version INTEGER NOT NULL` 和 `active_question_json TEXT`；`recordAnswer` 在一个 `db.transaction()` 内插入答案、条件版本和审计事件，并将 role version 加一。

```ts
const persistAnswer = db.transaction((input: PersistAnswerInput) => {
  answerStatement.run(input.answer);
  criteriaStatement.run(input.criteriaVersion);
  auditStatement.run(input.auditEvent);
  const updated = roleVersionStatement.run(input.roleId, input.expectedVersion);
  if (updated.changes !== 1) throw new RoleVersionConflictError(input.roleId);
});
```

- [ ] **Step 4: 运行仓储测试、类型检查。**

Run: `npm.cmd run test -- tests/recruiting-agent/sqlite-role-repository.test.ts && npm.cmd run typecheck`
Expected: PASS。

- [ ] **Step 5: 提交。**

```bash
git add src/server/db src/features/recruiting-agent/data tests/recruiting-agent/sqlite-role-repository.test.ts
git commit -m "Persist recruiting roles in SQLite"
```

### Task 3: DeepSeek 结构化追问适配器

**Files:**
- Create: `D:/招聘助手/comate/src/features/recruiting-agent/domain/agent-schema.ts`
- Create: `D:/招聘助手/comate/src/features/recruiting-agent/infra/deepseek-agent.ts`
- Create: `D:/招聘助手/comate/tests/recruiting-agent/deepseek-agent.test.ts`

- [ ] **Step 1: 写失败测试，拒绝不符合问题合同的模型 JSON。**

```ts
it("rejects an agent result with a non-whitelisted criteria field", () => {
  expect(() => parseAgentResponse({ agentSummary: "x", criteriaPatch: [{ field: "email", value: "x" }], nextQuestion: null }))
    .toThrow();
});
```

- [ ] **Step 2: 运行失败测试。**

Run: `npm.cmd run test -- tests/recruiting-agent/deepseek-agent.test.ts`
Expected: FAIL，schema 尚不存在。

- [ ] **Step 3: 实现 Zod 合同、HTTP client 和确定性回退问题。**

`DeepSeekAgent.ask(context)` 发送 `POST {baseUrl}/chat/completions`，使用 `response_format: { type: "json_object" }`，系统提示明确要求 JSON，并限制 `max_tokens` 与超时。只读取 `choices[0].message.content`，用 `parseAgentResponse` 校验。请求失败、空响应或 schema 不合法时返回 `fallbackQuestion(context.missingFields)`，并标记 agent turn 为 `fallback`；绝不记录 API key 或 reasoning 内容。

```ts
const response = await fetch(`${config.baseUrl}/chat/completions`, {
  method: "POST",
  headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model: config.model, temperature: 0.2, max_tokens: 900, response_format: { type: "json_object" }, messages }),
  signal: AbortSignal.timeout(15_000),
});
```

- [ ] **Step 4: 运行 adapter 测试。**

Run: `npm.cmd run test -- tests/recruiting-agent/deepseek-agent.test.ts`
Expected: PASS，mock fetch 证明请求不泄露密钥且错误会回退。

- [ ] **Step 5: 提交。**

```bash
git add src/features/recruiting-agent/domain src/features/recruiting-agent/infra tests/recruiting-agent/deepseek-agent.test.ts
git commit -m "Add DeepSeek structured recruiting agent"
```

### Task 4: 职位创建、连续回答与恢复 API

**Files:**
- Create: `D:/招聘助手/comate/src/features/recruiting-agent/application/role-workspace-service.ts`
- Create: `D:/招聘助手/comate/src/app/api/roles/route.ts`
- Create: `D:/招聘助手/comate/src/app/api/roles/[roleId]/route.ts`
- Create: `D:/招聘助手/comate/src/app/api/roles/[roleId]/answers/route.ts`
- Create: `D:/招聘助手/comate/tests/recruiting-agent/role-api.test.ts`

- [ ] **Step 1: 写失败测试：连续提交时历史增加、当前题变化、过期版本返回 409。**

```ts
it("returns a new workspace snapshot after an answer and rejects a stale version", async () => {
  const created = await createRole({ description: "招聘 AI 产品经理" });
  const next = await submitAnswer(created.id, created.version, created.currentQuestion.id, "远程");
  expect(next.history).toHaveLength(1);
  await expect(submitAnswer(created.id, created.version, created.currentQuestion.id, "远程")).rejects.toMatchObject({ status: 409 });
});
```

- [ ] **Step 2: 运行失败测试。**

Run: `npm.cmd run test -- tests/recruiting-agent/role-api.test.ts`
Expected: FAIL，API 不存在。

- [ ] **Step 3: 实现 application service 与路由。**

`POST /api/roles` 验证 `description` 为 20–5000 字符，创建 role 并请求首题；`POST /api/roles/:id/answers` 验证 `expectedVersion`、当前 `questionId` 和答案类型，然后先持久化答案，再请求 DeepSeek，最后保存下一题。`GET /api/roles/:id` 返回单一 WorkspaceSnapshot，包含 `history`、`currentQuestion`、`criteria`、`progress`、`version`。错误使用 `{ code, message }`，冲突用 HTTP 409，模型故障仍返回可继续的 fallback 状态。

- [ ] **Step 4: 运行 API 测试、lint、typecheck。**

Run: `npm.cmd run test -- tests/recruiting-agent/role-api.test.ts && npm.cmd run lint && npm.cmd run typecheck`
Expected: PASS。

- [ ] **Step 5: 提交。**

```bash
git add src/features/recruiting-agent/application src/app/api/roles tests/recruiting-agent/role-api.test.ts
git commit -m "Add persistent role clarification API"
```

### Task 5: 虚构简历库与可解释检索

**Files:**
- Create: `D:/招聘助手/comate/src/features/candidates/domain/types.ts`
- Create: `D:/招聘助手/comate/src/features/candidates/data/seed-candidates.ts`
- Create: `D:/招聘助手/comate/src/features/candidates/application/candidate-search-service.ts`
- Create: `D:/招聘助手/comate/src/app/api/roles/[roleId]/candidates/route.ts`
- Create: `D:/招聘助手/comate/tests/candidates/candidate-search-service.test.ts`

- [ ] **Step 1: 写失败测试：必备条件过滤，结果按可解释评分降序。**

```ts
it("filters missing must-haves and returns ordered match reasons", () => {
  const result = searchCandidates(criteriaWithClaudeCodeRequired);
  expect(result.every((candidate) => candidate.matchedMustHaves.includes("Claude Code"))).toBe(true);
  expect(result[0].score).toBeGreaterThanOrEqual(result[1].score);
  expect(result[0].reasons.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: 运行失败测试。**

Run: `npm.cmd run test -- tests/candidates/candidate-search-service.test.ts`
Expected: FAIL，检索服务不存在。

- [ ] **Step 3: 实现种子数据与评分服务。**

提供至少 24 名虚构候选人，不包含邮箱、电话、真实头像或真实公司。`CandidateRepository.search` 接受 `CandidateSearchQuery`；评分为 `skills 45 + seniority 20 + locationAndWorkModel 15 + industry 10 + niceToHave 10 - exclusions`，且任一必备项不满足即不返回。API 仅在角色完成必填条件后运行，返回前 20 条和每条 `reasons` / `gaps`。

- [ ] **Step 4: 运行检索测试。**

Run: `npm.cmd run test -- tests/candidates/candidate-search-service.test.ts`
Expected: PASS。

- [ ] **Step 5: 提交。**

```bash
git add src/features/candidates src/app/api/roles/[roleId]/candidates tests/candidates/candidate-search-service.test.ts
git commit -m "Add explainable synthetic candidate search"
```

### Task 6: 将现有 Metix 风格工作台切换到 API 查询模型

**Files:**
- Modify: `D:/招聘助手/comate/src/features/role-brief/hooks/useRoleBrief.ts`
- Modify: `D:/招聘助手/comate/src/features/role-brief/components/RoleBriefWorkspace.tsx`
- Modify: `D:/招聘助手/comate/src/features/role-brief/components/AgentConversation.tsx`
- Modify: `D:/招聘助手/comate/src/features/role-brief/components/CurrentQuestionCard.tsx`
- Create: `D:/招聘助手/comate/src/features/candidates/components/CandidateResultsPanel.tsx`
- Test: `D:/招聘助手/comate/tests/role-brief/agent-conversation.test.tsx`

- [ ] **Step 1: 写失败 UI 测试：点击选项调用 API 并用返回快照累积 Q/A。**

```ts
await user.click(screen.getByRole("button", { name: "远程（全球） 4" }));
await waitFor(() => expect(screen.getByText("A: 远程（全球）")).toBeInTheDocument());
expect(screen.getByRole("heading", { name: /下一题/ })).toBeInTheDocument();
```

- [ ] **Step 2: 运行失败测试。**

Run: `npm.cmd run test -- tests/role-brief/agent-conversation.test.tsx`
Expected: FAIL，hook 仍依赖 localStorage。

- [ ] **Step 3: 用 API hook 替换浏览器业务存储。**

保留现有三栏布局、对齐尺寸、Q/A 气泡与右侧 Search Criteria。`useRoleBrief` 通过 `fetch` 创建、读取和提交，不再解析用于写状态的 URL 参数，不再调用 `local-role-repository`。提交期间禁用当前题并显示短暂“正在收缩条件”；409 时重取快照；条件完成后显示 `CandidateResultsPanel`，其查询 `/api/roles/:id/candidates`，展示候选人、分数、命中理由和缺口。

- [ ] **Step 4: 运行前端测试与全量质量闸门。**

Run: `npm.cmd run test && npm.cmd run lint && npm.cmd run typecheck && npm.cmd run build`
Expected: PASS。

- [ ] **Step 5: 手动验收与提交。**

在 `http://127.0.0.1:3000/hire` 创建职位，连续完成至少 6 题，刷新工作台，确认 Q/A、条件、当前题和候选列表都恢复；检查浏览器 Network 不出现 API key。然后：

```bash
git add src/features/role-brief src/features/candidates/components tests/role-brief/agent-conversation.test.tsx
git commit -m "Connect hiring workspace to recruiting agent API"
```

## 计划自检

- Spec 覆盖：DeepSeek 结构化输出（Task 3）、SQLite 与审计（Task 2）、连续问答与恢复（Task 4、6）、虚构简历检索（Task 5）、密钥和失败回退（Task 1、3、4）。
- 无占位、无真实候选人导入端点、无外联或支付任务。
- 类型一致性：`WorkspaceSnapshot` 是 API 与 UI 的唯一读取模型；`expectedVersion` 用于所有答案提交；`CandidateSearchQuery` 只由服务端生成并验证。
