# DeepSeek 招聘澄清与本地简历检索设计

**状态：** 已确认，等待实施计划  
**范围：** 第二期：真实 Agent 服务端、职位澄清持久化、虚构简历检索。  
**不在范围：** 真实职位发布、真实候选人导入、外联、支付、日历、第三方候选人数据抓取。

## 1. 用户结果

招聘者提交一段自然语言职位需求后，系统以 Metix 风格的单题追问卡逐步明确地点、工作方式、职级、核心能力、加分项、排除条件和公司画像。每次提交后，已答内容沉淀为 Q/A 气泡，Agent 给出一条简短的收缩说明，右侧进度与搜索条件同步更新。条件满足后，系统在本地虚构简历库中返回可解释、可复现的候选人排序结果。

## 2. 架构边界

采用模块化单体：Next.js App Router 提供页面和 Route Handler；SQLite 是唯一业务真相；React 客户端只读取 API 返回的查询模型。既有 `role-brief/domain` 保留为纯领域状态转换，新增服务端 application 层编排事务、审计与模型调用。

```text
浏览器 UI
  -> /api/roles /api/roles/:id/answers
  -> RoleBriefApplication（事务、状态机、审计）
  -> DeepSeekAgentAdapter（结构化追问）
  -> SQLite（Role / Answer / CriteriaVersion / AgentTurn）
  -> CandidateSearchService
  -> CandidateRepository（第一期：SeedCandidateRepository）
```

## 3. DeepSeek Agent 合同

DeepSeek 只服务 Agent，不直连浏览器、数据库或候选人仓储。服务端给模型的上下文仅含：原始职位描述、已确认的结构化条件、当前缺口、允许的字段枚举和最近的用户答案。服务端要求其返回受限 JSON：

```ts
type AgentResponse = {
  agentSummary: string;
  criteriaPatch: Array<{ field: CriteriaField; value: string | string[]; confidence: 'confirmed' | 'inferred' }>;
  nextQuestion: {
    id: QuestionId;
    prompt: string;
    type: 'single' | 'multi' | 'freeform';
    required: boolean;
    options: Array<{ label: string; value: string }>;
    allowCustom: boolean;
  } | null;
};
```

使用 Zod 在服务端校验 schema、字段白名单、选项数、文本长度和当前状态合法性。无效、超时或内容不安全时不写入任何答案；服务端记录失败审计事件，并回退到确定性的默认问题。模型的内部推理、系统提示、工具调用和原始长文本均不向前端展示。

## 4. 逐题提交流程

1. `POST /api/roles` 创建职位和首条 Agent 轮次。
2. 用户点击选项、提交多选或自定义输入，前端调用 `POST /api/roles/:id/answers`。
3. 服务端验证答案属于当前问题，在一个事务中写入 Answer、更新 RoleBrief、创建 CriteriaVersion 与 AuditEvent。
4. 服务端调用 DeepSeek 生成下一轮；通过校验后写入 AgentTurn 和待回答问题。
5. API 返回完整工作台查询模型：历史 Q/A、当前问题、进度、搜索条件、版本号。
6. 前端以返回数据重新渲染；禁止使用 URL 参数触发状态变更，也不再以 localStorage 作为业务真相。

请求使用 `expectedVersion` 做乐观并发控制：过期提交返回 409，并让前端刷新工作台，避免重复回答或覆盖。

## 5. 虚构简历库与检索

定义稳定的 `CandidateRepository` 接口：`search(query): CandidateSearchResult[]`。首期 `SeedCandidateRepository` 从受版本管理的虚构候选人数据集读取，不包含联系方式或真实个人信息；未来 `ImportedResumeRepository` 可在相同接口下接入受授权的导入数据。

条件完成后，DeepSeek 仅生成规范化 `CandidateSearchQuery`（技能、职级、地点、工作方式、行业偏好、排除项）；服务端校验后交给本地检索服务。评分可解释且可重算：必备条件不满足直接过滤；其余按技能、职级、地点/方式、行业、加分项和排除项加权。每条结果返回匹配分、命中条件、缺口和生成时间，不把模型主观判断作为唯一排序依据。

## 6. 数据模型与审计

- `Role`：原始描述、状态、当前问题、版本号。
- `Answer`：问题 ID、原始答案、规范化答案、来源、提交时间。
- `CriteriaVersion`：每次 Agent 或用户确认后形成的不可变条件快照及原因。
- `AgentTurn`：可展示摘要、当前问题、模型名称、耗时、状态；不存储密钥或原始推理。
- `AuditEvent`：创建、回答、跳过、Agent 成功/失败、搜索启动和检索完成。
- `CandidateProfile`：虚构履历、技能、经验、地点、工作方式、行业标签。
- `CandidateSearchRun` / `CandidateMatch`：检索条件版本、排序分与可解释命中。

所有表以本地组织作用域和 Role ID 隔离。未来导入真实简历时，将加上候选人来源、同意状态、删除请求和访问审计；在该能力实现前，导入端点不存在。

## 7. 安全与配置

- `DEEPSEEK_API_KEY` 与 `DEEPSEEK_BASE_URL` 仅出现在 `.env.local`，不提交 Git、不透传客户端。
- 通过服务端超时、重试上限、速率限制和请求体大小限制约束模型调用。
- 发送给模型的内容只包含当前职位数据与虚构简历搜索意图；第一期不把任何真实候选人数据发给模型。
- 所有外部副作用继续被禁止：没有发送、联系、邀约、支付和公开发布接口。

## 8. 验收标准

1. 同一 Role 可连续完成至少 6 道动态追问；每次刷新都恢复完整 Q/A、当前问题和右侧条件。
2. 每次提交只接受当前问题的一份有效答案；重复或过期提交不覆盖数据。
3. DeepSeek 不可用时显示可恢复错误，并以默认问题继续；现有答案不丢失。
4. 条件完整后可创建一次本地检索，并展示至少 10 名虚构候选人的排序、命中理由与缺口。
5. API Key 不出现在浏览器包、响应、日志、测试快照或 Git。
6. 单元测试覆盖 schema、状态转换和评分；路由测试覆盖提交、恢复、冲突、模型失败与检索；人工验收验证 Metix 风格的 Q/A 累积和条件实时更新。
