# Nexus Hire 完整招聘流程网页升级设计

日期：2026-08-01

状态：已完成交互式设计确认，等待用户审阅书面规格

参考：飞书《Metix AI 招聘功能流程向上汇报表》
参考地址：https://my.feishu.cn/wiki/S4xTwzcaJi22gCkOHXPcEZivngd?fromScene=spaceOverview&sheet=CGEEyg

## 1. 目标

直接升级现有 `/hire` 与 `/hire/role/[roleId]` 网页，将当前“岗位输入、AI 澄清、Brief 确认、基础候选人列表”扩展为覆盖飞书参考流程的完整 11 阶段招聘工作台。

首版使用虚拟候选人、模拟联系状态和模拟面试日历，但必须通过稳定的 Provider 接口提供数据。后期接入真实候选人库、外联系统和日历时，不重写页面流程、领域状态或前端组件。

## 2. 已确认的产品边界

- 保留 `Nexus Hire` 品牌，不复制 Metix Logo、第三方商标或真实候选人资料。
- 页面结构、模块比例、留白、卡片密度、对齐轴和交互位置严格参照飞书截图；不进行独立视觉风格改造。
- 这是桌面网页工作台，不按移动应用或大屏看板设计。
- 首版覆盖从岗位输入到模拟面试排期的完整闭环。
- 首版不真实联系候选人、不发送邮件、不创建真实日历事件。
- 所有外部写操作在真实 Provider 接入后仍需要显式人工审批。

## 3. 当前实现与升级范围

### 3.1 现有能力

- `/hire` 提供岗位描述输入并创建本地角色。
- `/hire/role/[roleId]` 提供多轮澄清、问答历史、Brief 确认和条件摘要。
- DeepSeek 在服务端生成结构化澄清问题；失败时存在确定性问题模板。
- SQLite 持久化岗位、答案、Agent 轮次和审计事件。
- 已有虚拟候选人检索、匹配分数、命中理由和待确认缺口。

### 3.2 需要补齐

- 三位代表样本的校准流程。
- Good fit、Maybe、Not a fit 的结构化反馈分支。
- 反馈驱动的条件版本与偏好学习。
- 搜索模式选择、搜索策略尝试和实时漏斗。
- 候选人详情、分页、跨页选择和人工审批。
- 模拟联系、模拟回复和模拟面试排期。
- 所有阶段的刷新恢复、失败恢复和审计记录。

## 4. 页面布局与视觉规范

### 4.1 固定三栏工作台

在桌面宽度下使用同一应用框架：

| 区域 | 基准宽度 | 职责 |
| --- | ---: | --- |
| 左侧导航 | 208px | 品牌、全局模块、所有角色、设置和虚拟模式标识 |
| 中央任务区 | 自适应，1440px 视口下约 1056px | 当前阶段的主要任务、表单、候选人和审批内容 |
| 右侧状态轨 | 176px | 简短进度、三行搜索条件摘要、安全状态和详情抽屉入口 |

右侧状态轨不得展示大段正文或完整条件表。完整条件通过抽屉打开，关闭后恢复 176px 固定宽度。

### 4.2 间距与对齐

- 使用 8px 基础栅格。
- 中央标题栏左右内边距为 28px。
- 中央任务内容左右留白以 40px 为基准，并在较宽屏幕保持内容最大阅读宽度。
- 主要纵向间距使用 24px 或 32px。
- 标题、阶段步骤条、任务卡和右侧状态轨沿固定横向基线排列。
- 阶段切换只替换中央内容，不改变左栏、右栏或标题栏宽度。
- 加载、空数据和错误状态只能纵向扩展，不得造成横向跳动。

### 4.3 响应范围

- 主要验收宽度：1440px、1600px、1920px。
- 低于桌面最低宽度时允许出现横向最小宽度保护，不在首版重新排列为移动端布局。
- 所有视觉验收图严格按照飞书截图的模块层级、比例、间距和对齐进行对照，只替换品牌与虚拟业务数据。

## 5. 信息架构

- `/hire`：新建岗位，支持自然语言 JD 和预留资料输入入口。
- `/hire/role/[roleId]`：统一角色工作台，根据持久化状态渲染 11 个阶段。
- 左栏：新角色、职位简报、候选人、采访、所有角色、设置。
- 顶部：岗位名称、保存状态、条件版本。
- 中央顶部：11 阶段步骤条。
- 中央主体：当前阶段专属组件。
- 右栏：简短业务进度、搜索标准摘要、虚拟或真实数据模式。
- 抽屉：完整搜索标准、候选人详情、匹配证据、条件版本历史。

## 6. 11 阶段交互流程

### 01 岗位输入与语义解析

用户粘贴 JD、输入自然语言或使用预留的文件和 URL 入口。系统提取岗位名称、地点、技能、资历和已知约束，创建 `RoleDraft v1`。

### 02 AI 多轮需求澄清

系统根据缺失字段动态生成单选、多选和自由输入问题。必填问题不可跳过，非必填问题可跳过。每次回答更新结构化字段、条件版本和审计记录。

### 03 画像汇总与搜索前确认

系统展示岗位、地点、职级、必备能力、偏好和排除条件。用户可确认或返回对话修改。修改必须生成新条件版本，不覆盖历史值。

### 04 职位简报与任务承接

系统生成可审核的职位 Brief 和招聘任务卡，作为校准、搜索、审批和面试的统一入口。

### 05 候选人推进与面试日历

任务页显示各阶段数量、最近动作和模拟面试日期，为后续流程提供管理入口。首版不创建真实日历事件。

### 06 分层召回、评分与样本生成

系统通过 `CandidateDataSource` 召回虚拟候选人，分层评分后选择三位具有代表性的校准样本。样本应覆盖高匹配、边界匹配和典型缺口。

### 07 候选人详情与可解释匹配

候选人详情展示履历摘要、技能证据、匹配原因、缺口和数据来源标识。页面只展示可读的匹配依据，不显示模型原始思维链或内部工具调用。

### 08 结构化反馈与递归偏好学习

用户必须选择 Good fit、Maybe 或 Not a fit：

- Good fit：询问是否寻找相似候选人，并将有效信号写入偏好规则。
- Maybe：询问缺失证据、证据渠道和是否必须显式呈现。
- Not a fit：询问主要原因、关键能力缺口和证据强度，生成排除规则。

每次反馈创建新的 `SearchCriteriaVersion`。三位样本完成后进入搜索模式选择。

### 09 搜索模式选择

用户选择人工审核模式或自动模拟模式。默认推荐人工审核模式。未选择模式时不得启动完整搜索。

### 10 完整搜索与实时漏斗

系统创建 `SourcingRun`，按策略批次召回、去重和评分，展示 Screen、Match、Contact、Interested、Interview 指标以及当前策略状态。地点扩展等重大条件变化必须由用户批准。

### 11 候选名单人工审批与批量触达前确认

系统展示等待审批的候选人队列，支持：

- 分页。
- 单项选择。
- 跨页选择。
- 全选全部待审批候选人。
- 清空选择。
- 候选人详情抽屉。
- 批量批准或拒绝。

选择数量为 0 时，批准按钮禁用。批准后创建 `CandidateApproval` 和模拟联系计划。

### 审批后的模拟推进

模拟状态链为：

`waiting_contact → simulated_sent → simulated_unread | simulated_opened | failed → simulated_interested → simulated_interview`

失败状态必须可见，并提供模拟重试计划。所有状态只写入本地数据库和审计记录。

## 7. 主要组件边界

- `RecruitingAppShell`：固定三栏框架。
- `RoleHeader`：岗位名称、保存状态和条件版本。
- `RecruitingStageStepper`：11 阶段进度与已完成状态。
- `RecruitingStageRouter`：根据领域状态选择中央阶段组件。
- `RecruitingContextRail`：176px 状态轨。
- `SearchCriteriaDrawer`：完整条件与版本历史。
- `RoleIntakeStage`：岗位输入。
- `ClarificationStage`：多轮澄清。
- `BriefConfirmationStage`：画像和 Brief 确认。
- `CalibrationStage`：三位样本与反馈分支。
- `CandidateDetailDrawer`：候选人详情和匹配证据。
- `ExecutionModeStage`：搜索模式选择。
- `SourcingRunStage`：策略时间线与漏斗。
- `CandidateApprovalStage`：分页、选择和批量审批。
- `OutreachStage`：模拟联系状态。
- `InterviewStage`：模拟面试排期。

每个阶段组件只负责展示和用户输入，业务状态转换由应用服务和领域模块完成。

## 8. 数据接口架构

页面组件只调用招聘流程 API，不直接调用外部数据源。

```text
页面组件
  → 招聘流程 API / Application Service
    → CandidateDataSource
    → RecruitingAIProvider
    → OutreachProvider
    → CalendarProvider
```

### 8.1 CandidateDataSource

```ts
interface CandidateDataSource {
  search(criteria: SearchCriteriaSnapshot, cursor?: string): Promise<CandidatePage>;
  getById(candidateId: string): Promise<CandidateProfile | null>;
  getCalibrationSamples(criteria: SearchCriteriaSnapshot, count: number): Promise<CandidateProfile[]>;
}
```

首版使用 `MockCandidateDataSource`。真实数据源必须转换为统一的 `CandidateProfile` 和 `CandidatePage`，不得把第三方字段直接传播到页面。

### 8.2 RecruitingAIProvider

```ts
interface RecruitingAIProvider {
  parseRole(input: RoleInput): Promise<ParsedRoleInput>;
  generateClarification(context: RoleContext): Promise<ClarificationTurn>;
  explainMatch(input: MatchExplanationInput): Promise<MatchExplanation>;
  compileFeedback(input: CalibrationFeedbackInput): Promise<SearchCriteriaChangeSet>;
}
```

首版复用服务端 DeepSeek 实现，并保留确定性降级实现。

### 8.3 OutreachProvider

```ts
interface OutreachProvider {
  createPlan(input: OutreachPlanInput): Promise<OutreachPlan>;
  execute(planId: string): Promise<OutreachExecutionResult>;
  getStatus(planId: string): Promise<OutreachStatus>;
}
```

首版使用 `SimulatedOutreachProvider`，不得产生网络外联副作用。

### 8.4 CalendarProvider

```ts
interface CalendarProvider {
  listAvailability(input: AvailabilityQuery): Promise<AvailabilitySlot[]>;
  schedule(input: InterviewScheduleInput): Promise<InterviewScheduleResult>;
}
```

首版使用 `SimulatedCalendarProvider`，不得创建真实日历事件。

### 8.5 Provider 切换

- Provider 由服务端配置选择。
- 前端永远只消费统一 DTO。
- 页面显示当前为“虚拟数据”或“真实数据”模式。
- 未配置真实 Provider 时必须显式保持虚拟模式，不得静默调用外部系统。

## 9. 领域状态与持久化

新增或扩展以下实体：

- `RoleBrief`
- `SearchCriteriaVersion`
- `CalibrationFeedback`
- `EvidenceRequirement`
- `SourcingRun`
- `SearchStrategyAttempt`
- `CandidateProfile`
- `CandidatePoolEntry`
- `SelectionSet`
- `CandidateApproval`
- `OutreachPlan`
- `InterviewSchedule`
- `WorkflowAuditEvent`

所有 11 个阶段必须持久化当前状态、条件版本和操作记录。页面刷新后应恢复到当前阶段。返回修改时生成新版本，不覆盖旧版本。

## 10. 错误处理与恢复

- AI 解析失败时使用确定性问题模板降级，不中断主流程。
- 候选人数据源失败时保留上次成功结果，提供“重试”和“查看上次成功结果”。
- `SourcingRun` 使用 `queued → searching → scoring → awaiting_review → completed | failed` 状态机。
- 批量审批、模拟联系和模拟排期均使用幂等操作，避免重复点击生成重复记录。
- 错误在对应模块内显示，三栏宽度和对齐保持不变。
- 不向页面展示内部提示词、原始思维链、数据库异常细节或外部凭据。

## 11. 安全与人工门禁

- 搜索条件扩展、批量批准、模拟联系和模拟排期必须由用户明确操作。
- 首版所有候选人使用虚构姓名、虚构履历和脱敏联系方式。
- 虚拟 Provider 不得发送邮件、调用消息平台或写入真实日历。
- 后期真实 Provider 接入时，外部写操作必须保留人工确认、幂等键和审计事件。

## 12. 验收与测试

### 12.1 单元测试

- 11 阶段状态转换。
- 条件版本生成与历史保留。
- Good fit、Maybe、Not a fit 分支。
- 搜索漏斗计数与候选人去重。
- 跨页选择、全选和清空。
- Provider 接口契约。

### 12.2 API 测试

- 岗位创建和读取。
- 澄清问题回答、跳过和回退。
- Brief 确认。
- 样本校准和条件版本更新。
- 搜索运行和失败恢复。
- 候选人审批。
- 模拟联系和模拟排期。

### 12.3 端到端测试

从输入 JD 开始，完整推进到模拟面试排期。关键阶段刷新页面后必须恢复，返回修改后必须产生新版本。

### 12.4 安全测试

验证虚拟模式不会发送邮件、联系候选人、调用外部消息系统或创建真实日历事件。

### 12.5 视觉与浏览器验收

- 以飞书截图为基准，在 1440px、1600px 和 1920px 宽度分别截图对比。
- 右侧状态轨保持 176px，左侧导航保持 208px。
- 标题、步骤条、中央任务卡和右侧状态轨保持统一基线。
- 加载、空数据和错误状态不得改变三栏宽度。
- 页面必须有实际内容，无 Next.js 错误覆盖层和控制台错误。
- 验证导航、关键按钮、业务 API、状态持久化和完整交互链路。

## 13. 非目标

- 不实现真实职位发布。
- 不抓取真实候选人资料。
- 不实现真实邮件、短信或站内信发送。
- 不创建真实面试日历事件。
- 不实现移动端重排。
- 不复制 Metix 品牌、Logo 或真实候选人信息。

## 14. 完成定义

当以下条件全部满足时，本次升级完成：

1. 现有路由直接升级为完整 11 阶段工作台。
2. 页面结构、间距、密度和对齐严格参照飞书截图。
3. 1440px、1600px 和 1920px 下视觉验收通过。
4. 虚拟数据端到端流程可从岗位输入运行到模拟面试排期。
5. Provider 接口可替换，页面不依赖虚拟实现细节。
6. 刷新恢复、错误恢复、人工门禁和审计记录工作正常。
7. 单元测试、API 测试、端到端测试、类型检查、Lint、构建和浏览器验收通过。
