# Metix AI 招聘工作流：架构复核

> 取证范围：2026-07-16 通过公开的 `https://metix.ai/`、`https://metix.ai/demo` 与 `https://www.metix.ai/hire` 的可见页面及交互完成。未登录、未提交职位、未发出候选人邀约、未触发付费。本文将“可观察事实”和“工程实现建议”分开，避免把演示页状态误判为生产后端能力。

## 已验证的产品边界

| 层级 | 可观察结论 | 置信度 |
| --- | --- | --- |
| 营销站 | `metix.ai` 是公开营销站，页面说明平台将 role brief 转为 interview-ready candidates；其静态资源位于 `static.openjobs-ai.com/homepage/_next/...`。 | 高 |
| 真实产品入口 | `/hire` 重定向到 `/hire/signin?redirectUrl=...`，真实产品操作受身份认证保护。 | 高 |
| 公开演示 | `/demo` 明示“无需注册、所有数据均为模拟”，可完整演示招聘流程。 | 高 |
| 前端框架线索 | Demo 产物采用 Next.js 的 `_next/static/chunks`、Turbopack chunk 命名和 React 式交互。真实招聘端的静态资源位于独立的 `static.openjobs-ai.com/hire/_next/...` 路径。 | 高 |
| 系统分层 | 至少存在营销站、认证后的招聘应用、公开演示三个独立前端表面；它们很可能共享品牌与数据契约，但并非一个单一页面应用。 | 中高 |

## 已验证的招聘状态机

公开 Demo 中的流程由四个明确阶段组成：

```text
Describe role
  -> Review samples
  -> Find and contact
  -> Completed
```

更细化的业务状态为：

```text
Role draft
  -> brief extraction / clarification
  -> structured search criteria
  -> sample-candidate calibration (good fit | maybe | not a fit)
  -> review mode selection (manual | automatic)
  -> sourcing / matching
  -> candidate approval
  -> outreach
  -> interested reply
  -> interview scheduling
  -> completed
```

Demo 的顶层漏斗还暴露了 `Match -> Contact -> Interested -> Interview`。这表明“匹配”“触达”“意向”和“面试”应是可独立统计、可追溯的领域状态，而不是仅用一个候选人列表字段表示。

## 可见能力与工程含义

| 能力 | 已见界面证据 | 复刻时应有的领域能力 |
| --- | --- | --- |
| 职位输入 | 自由文本输入，支持 JD 文件、相似简历、LinkedIn URL、职位 URL。 | `RoleBriefIngestion`：多来源归一化、来源保留、输入校验。 |
| 需求澄清 | Agent 把自由文本拆为 title、地点、公司保密、目标公司、薪资、签证、排除项。 | `BriefExtraction` + `ClarificationSession`，结构化 JSON 与人工确认版本。 |
| 搜索准则 | Must-have / Nice-to-have / Looking for 以及右侧 Search Criteria。 | 可版本化的 `SearchCriteria`，每次改写都记录理由与来源。 |
| 标定 | 3 个样本候选人，通过 Good fit / Maybe / Not a fit 收集偏好。 | `CalibrationFeedback`，以弱监督信号校正排序，不应直接覆盖原始候选人事实。 |
| 候选人档案 | 职位、地点、薪资、LinkedIn、推荐理由、联系信息、经历、教育、技能。 | `CandidateProfile`、`Experience`、`Skill`、`CandidateEvidence` 分表/分对象，显示来源与更新时间。 |
| 人工或自动 | Manual：用户审批后才触达；Automatic：Mira 审批并触达。 | 明确的 `ApprovalPolicy` 和权限边界；自动模式仍需预算、合规与审计护栏。 |
| 搜索进度 | 运行中/完成、匹配计数、候选卡、强匹配标签。 | 异步 `SearchRun`、可恢复进度事件、幂等候选写入。 |
| 触达与面试 | 流程将触达、非回应 follow-up、意向回复、排期分开。 | `OutreachCampaign`、`Conversation`、`FollowUpPolicy`、`InterviewEvent`，不能只在前端串联。 |

## 推荐的工程化架构

```text
Web client (Next.js)
  ├─ role brief / chat workspace
  ├─ calibration & candidate review
  ├─ candidate pipeline / scheduling views
  └─ local simulation adapter (本项目默认)

Application API
  ├─ role & criteria service
  ├─ candidate search / ranking service
  ├─ approval-policy service
  ├─ outreach orchestration service
  ├─ interview scheduling service
  └─ audit / notification service

Async workers
  ├─ profile enrichment & deduplication
  ├─ search-provider fan-out
  ├─ ranking / calibration update
  ├─ outreach & follow-up execution
  └─ reply classification / scheduling sync

Data & controls
  ├─ relational system of record
  ├─ search/vector index for retrieval
  ├─ queue + outbox for external actions
  ├─ encrypted secrets / provider credentials
  └─ immutable action audit log
```

### 关键设计判断

1. **Agent 不是工作流本身。** LLM 负责抽取、解释、提问和推荐；状态推进、审批、预算、触达和排期应由确定性的工作流引擎负责。
2. **外联必须以 outbox + 幂等键执行。** “Approve & contact”应创建待执行动作，只有 worker 在策略、配额、同意和去重检查都通过后才发送；网络重试不可重复联系同一人。
3. **Manual/Automatic 是策略，不是两套代码。** 两种模式应共享 `SearchRun`、评分和候选人管道，仅在 `ApprovalPolicy` 上不同。
4. **演示数据与生产数据强隔离。** Demo 使用独立 seed、模拟时钟和 `simulation=true` 适配器；生产数据库、邮箱、CRM、日历、支付和分析密钥均不可加载。
5. **排名必须可解释。** 每个“Strong Match”至少保存技能/经历证据、匹配版本、模型版本、标定反馈和人工覆盖记录。

## 本地复刻的准确范围

本项目应高保真复刻下列**可见交互**：侧栏、四步进度、自由职位输入、brief 总结、样本评分、Manual/Automatic 比较、候选卡/档案、筛选审批、管道统计和完成态。

以下功能必须显示为演示模拟，且不可调用外部服务：创建真实职位、候选人邮箱/LinkedIn 触达、追踪、日历邀请、支付、认证和个人资料写入。所有“联系”“邀约”“支付”控件应转为本地 toast/日志，例如“演示模式：未发送任何消息”。

## 待生产接入时的复核清单

- RBAC：职位、候选人联系方式、审批和发送权限按组织/角色隔离。
- 隐私：候选人数据来源、用途、保留期、删除/访问请求与地域合规。
- 反骚扰：同意、频率上限、退订、跨 campaign 去重、黑名单。
- 成本：每次检索、LLM 调用、数据源调用、外联与日历操作要可计量和限额。
- 可靠性：队列死信、失败重放、幂等、人工接管、SLO 与审计查询。
- 评估：检索召回、排序质量、样本标定增益、外联回复率、面试转化率和偏差监控。
