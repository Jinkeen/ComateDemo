# AI 招聘智能体复刻 PRD

版本：v1.0  
状态：可进入开发规划  
产品形态：单组织、多招聘者、模块化单体、本地持久化的招聘工作台  
参考：已观察 Metix AI 招聘流程；交互证据见 docs/research/METIX_INTERACTION_LOG.md。

## 1. 问题陈述

招聘人员需要把零散职位描述转为可执行的候选人筛选条件，并通过样本反馈不断校准筛选口径。传统 ATS 把职位、候选人、外联和面试割裂，且缺少对“为什么这样筛选”的过程解释。

本项目复刻这一 AI 招聘工作台的核心交互：从职位描述、Agent 澄清、样本校准、模拟检索策略、候选人审批，到模拟联系和面试流程。它是一个可本地运行、可审计的演示系统，不是真实招聘服务。

## 2. 目标、范围与硬边界

### 2.1 目标

1. 复刻完整的招聘主流程及页面跳转，而非只复刻单一仪表盘。
2. 让招聘者能看见 Agent 为什么提问、条件如何变化、候选人为何进入队列。
3. 以虚构候选人和本地状态机模拟所有搜索、批准、联系和跟进。
4. 保持工程化边界：领域状态可测试、页面可恢复、每次规则变化可审计。

### 2.2 明确不做

- 不发布真实职位，不抓取或检索真实候选人。
- 不发送邮件、短信、站内信、邀约或自动跟进。
- 不接入支付、订阅、日历、外部认证、追踪像素或第三方 API。
- 不使用或复制源站中的姓名、雇主、头像、履历、邮箱、地点或联系方式。
- 不展示模型原始长推理；只展示模板化、可读、可审计的简短理由。

## 3. 用户与权限

| 角色 | 能做什么 | 不能做什么 |
| --- | --- | --- |
| 招聘者 | 创建角色、回答 Agent 问题、审核候选人、查看模拟流程 | 产生任何外部招聘动作 |
| 招聘团队成员 | 在同一组织下查看角色和模拟队列 | 访问其他组织的本地数据 |
| 演示 Agent | 生成问题、策略建议、匹配解释和模拟状态 | 访问外部数据或自行发送联系 |

首版采用单组织、多招聘者模型；权限只在本地数据作用域内生效。

## 4. 信息架构与路由

| 页面 | 路由 | 目的 |
| --- | --- | --- |
| 新建职位 | /hire | 输入职位描述，创建角色草稿 |
| 角色工作台 | /hire/role/:roleId | 对话、样本校准、检索、审批、联系等主流程 |
| 职位简报 | /hire/jobbrief | 聚合职位简报；具体细节待后续取证 |
| 面试 | /hire/calendar | 面试工作台入口；具体细节待后续取证 |
| 账户设置 | /hire/settings/account | 本地资料、安全占位和本地演示数据重置 |
| 计费设置 | /hire/settings/billing | 仅显示演示计划，不能支付或变更订阅 |

全局侧栏包含品牌入口、New Role、Job Brief、Interview、All Roles、角色级 Session actions 和演示计划信息。

## 5. 端到端功能流程

### 流程 A：从职位描述到可搜索 Brief

招聘者输入职位描述  
→ 系统创建 RoleDraft 并抽取职位名  
→ 若缺少地点，先进入地点必填关口  
→ Agent 按批次询问工作模式、资历、必备能力  
→ 询问学历、行业背景与排除条件  
→ 收集公司背景、保密策略、目标人才公司  
→ 收集薪酬、签证、可选面试流程  
→ 生成匿名化的 Brief 摘要  
→ 招聘者确认或返回对话调整  
→ 创建本地 SimulatedSearchRun。

规则：

- 空输入不能提交。
- 首个问题不能后退；未选择有效答案不能继续。
- 地点是已验证的必填关口，未完成时不能启动搜索。
- 公司名称如果只表达行业线索，必须保留原始回答并归类为行业，不得伪造公司实体。
- 选择公司保密后，候选人视图只能使用匿名公司画像。

### 流程 B：样本校准

SimulatedSearchRun 启动  
→ 召回本地样本池  
→ 按评分展示 3 位虚构样本  
→ 招聘者选择 Good fit / Maybe / Not a fit  
→ Agent 进入对应原因分支  
→ 将结构化反馈编译为新的 SearchCriteriaVersion  
→ 三个样本完成  
→ 显示全部标签  
→ 招聘者选择 Manual review 或 Automatic。

分支规则：

| 选择 | 后续交互 | 产生的数据 |
| --- | --- | --- |
| Good fit | 是否寻找相似候选人；可选择相似公司背景等扩展轴 | PositiveCalibrationFeedback、SearchExpansionRequest |
| Maybe | 不确定原因、证据渠道、是否必须档案明示 | CalibrationFeedback、EvidenceRequirement |
| Not a fit | 主因、关键能力缺口、证据强度 | CalibrationFeedback、ExclusionRule |

一旦提交 verdict，当前样本锁定；自由文本反馈为可选，不能阻塞进入下一个样本。第 3 位样本完成后显示 Complete Review。

### 流程 C：全量匹配与市场策略

选择执行模式  
→ 创建 SourcingRun  
→ 生成若干 SearchStrategyAttempt  
→ 在本地虚构池中测试策略  
→ 追加候选人并去重  
→ 分批评分  
→ 更新 Screen / Match 漏斗  
→ 根据产出生成 market signal  
→ 继续、切换策略、或请求地域授权  
→ 进入等待审批的候选人队列。

市场信号：

| 信号 | 含义 | Agent 行为 |
| --- | --- | --- |
| productive | 仍有稳定合格产出 | 继续当前策略和评分批次 |
| low_yield | 产出下降但仍有未评分候选人 | 先完成现有批次，再测试新角度 |
| exhausting | 多轮角度产出很低 | 提示候选池临近耗尽并准备决策 |
| exhausted | 已授权市场基本无新增价值 | 请求招聘者选择市场扩展或使用当前候选池 |

允许尝试不同职位名、技能措辞、经验范围、公司背景和过滤强度。新增地点永远不能自动运行，必须先出现地域扩展决策卡。

地域扩展决策：

招聘者选择相邻市场  
→ 更新本地 permittedLocations  
→ 创建新的 SearchStrategyAttempt。

招聘者选择使用当前候选池  
→ SourcingRun 完成  
→ 进入 Candidate List Waiting Approval。

未选择决策项时 Submit 禁用。

### 流程 D：人工审批队列

SourcingRun 完成  
→ Candidate List Waiting Approval  
→ 查看候选卡或打开本地详情  
→ 单项选择、全选、跨页选择或 Clear  
→ 批量批准  
→ 创建 SimulatedContactPlan  
→ 候选人流转到 Contact 阶段。

队列规则：

- 候选卡显示虚构姓名、匹配等级、未联系状态、职位/地点摘要和少量技能标签。
- SelectionSet 属于整个角色的 waiting-approval 队列，不属于当前页。
- Select all 指所有待审核候选人；Clear 清空整个集合。
- 选择数为 0 时，批准按钮禁用。
- 列表支持分页、上一页/下一页禁用状态及本地详情抽屉。
- 批量动作文案可保留目标结构，但必须明确为“批准并模拟联系”；只写本地事件。

### 流程 E：模拟联系与后续阶段

已批准候选人  
→ SimulatedContactPlan  
→ simulated_sent  
→ simulated_unread / simulated_opened / failed  
→ simulated_interested  
→ simulated_interview。

Contact 工作台展示模拟发送数量、档案查看数量和每张候选卡的状态。失败必须可见，并提供模拟重试计划预览；不会发送邮件或创建日历事件。

### 流程 F：账户与工作区

招聘者打开侧栏  
→ 在 All Roles 中切换角色会话  
→ 可进入 New Role、Job Brief、Interview 或 Settings。  

Account 页面支持本地资料字段、长度提示、只读邮箱和头像占位。Set password 仅显示安全说明；Delete account 只会重置或软删除本地演示工作区，且需二次确认。

## 6. 页面与交互规格

### 6.1 新建职位页

- 输入：职位描述自由文本。
- 补充入口：上传职位文件、相似档案、LinkedIn URL、职位 URL。
- 约束：所有补充入口仅产生本地模拟反馈，不上传、不抓取。
- 成功：保存草稿并进入角色工作台。

### 6.2 角色对话与 Search Criteria

- 左侧：角色标题、对话时间线、问题卡、可展开的简短 Agent 理由。
- 右侧：由 RoleBrief 派生的 Search Criteria，分为角色基础信息、必备能力、排除条件。
- 运行中：显示 Thinking 或进度消息，禁用不应同时编辑的输入。
- 不显示：任何原始 chain-of-thought、提示词或内部工具调用。

### 6.3 样本候选人页

- 主区：进度、匹配解释、Good fit / Maybe / Not a fit。
- 侧栏：摘要与详情两层，经历和技能支持渐进展开。
- 安全：所有候选人使用虚构种子数据和掩码联系方式。

### 6.4 搜索运行页

- 顶部漏斗：Screen、Match、Contact、Interested、Interview。
- 主区：策略时间线、当前批次、简短市场解释。
- 指标定义：Screen 为去重后的已召回数；Match 为已评分且达到门槛数；各阶段不可互相覆盖。

### 6.5 候选人审批页

- 顶部：选择数、全选/清空、模拟批准按钮。
- 主区：候选卡列表与分页。
- 详情：本地候选人档案抽屉。
- 状态：是否可批准完全由 SelectionSet 派生。

### 6.6 模拟联系页

- 顶部：模拟发送数、模拟查看数。
- 主区：联系状态列表和详情抽屉。
- 状态：未读、已打开、失败等只来自本地状态机。

## 7. 功能需求与验收标准

### FR-01 职位澄清

系统必须把自由文本和问答保存为 RoleBrief；每个字段保留 rawAnswer、normalizedValue、source 和确认状态。

验收：刷新页面后可恢复已答问题和 Search Criteria；地点缺失时不能启动样本搜索。

### FR-02 条件版本化

任何样本反馈、策略放宽或地域授权都必须创建 SearchCriteriaVersion，不得静默覆盖基础 Brief。

验收：可查看某次策略使用的条件版本和变更原因。

### FR-03 模拟搜索状态机

SourcingRun 至少包含 queued、searching、scoring、awaiting_review、completed、exhausted、failed。

验收：状态可刷新恢复；失败、取消和恢复均产生审计事件。

### FR-04 策略尝试与候选池

每次 SearchStrategyAttempt 保存策略维度、理由、来源池大小、评分数、合格数、产出率、状态和停止原因。

验收：同一虚构候选人来自多策略时去重；Screen 计数不重复。

### FR-05 样本校准

系统必须支持三态 verdict 及其独立的原因树，并将结果转化为证据规则、偏好或排除规则。

验收：verdict 提交后锁定；Good fit、Maybe、Not a fit 的分支均可独立完成。

### FR-06 候选人审核

系统必须提供跨页 SelectionSet、分页、全选、清空、详情打开与批量模拟批准。

验收：翻页和刷新不丢失选择；0 选中时批准按钮禁用。

### FR-07 模拟联系

系统必须将批准动作转化为 SimulatedContactPlan，并以本地事件驱动卡片状态。

验收：不存在邮件服务、追踪像素、网络发送或日历 API；失败状态可见。

### FR-08 工作区与账户

系统必须提供角色会话导航、本地资料和演示计划信息。

验收：账单、升级、密码和删除账户均不可产生外部副作用；本地重置需二次确认。

## 8. 数据模型

| 实体 | 核心职责 |
| --- | --- |
| Organization | 本地组织作用域 |
| RecruiterProfile | 本地演示用户资料 |
| RoleBrief | 职位的原始输入与已确认结构化条件 |
| SearchCriteriaVersion | 可追溯的筛选条件快照 |
| CalibrationFeedback | 样本 verdict、结构化原因与可选文字 |
| EvidenceRequirement | 某项能力需满足的证据渠道和强度 |
| SearchStrategyAttempt | 每次策略测试及其产出 |
| SourcingRun | 一次完整模拟检索运行 |
| CandidateProfile | 虚构候选人种子档案 |
| CandidatePoolEntry | 候选人与策略来源、分数和漏斗状态 |
| SelectionSet | 角色级待审核选择集合 |
| CandidateApproval | 招聘者的本地批准或拒绝事件 |
| SimulatedContactPlan | 无外部副作用的联系计划 |
| MarketExpansionDecision | 地域授权或使用当前候选池的决定 |
| WorkflowAuditEvent | 任何状态变更的审计记录 |

## 9. 实现决策

- 架构采用模块化单体：UI 路由层、招聘领域层、模拟运行层、持久化层和审计层分离。
- Agent 输出使用规则化的本地模拟器和预设场景，不依赖外部模型或候选人 API。
- 所有外部能力通过 Simulation Adapter 抽象，并且只有 no-op / local 实现。
- 页面不能持有唯一业务真相；业务状态由领域模块持久化，UI 从查询模型恢复。
- 使用 TypeScript strict、Next.js App Router、React；本地持久化可选择 SQLite 或浏览器存储的受控适配器，具体实现由后续架构计划确定。

## 10. 测试决策

测试只验证外部可观察行为，不验证组件内部实现细节。

| 层级 | 必测行为 |
| --- | --- |
| 领域单元测试 | 状态转换、条件版本、地域授权、选择集、漏斗聚合 |
| 路由集成测试 | 新建职位、澄清、样本校准、运行恢复、审批、模拟联系 |
| UI 测试 | 禁用状态、分页、全选/清空、决策卡、错误与空态 |
| 端到端验收 | 流程 A 到 E 完整跑通，且网络层无外部副作用 |

质量闸门：TypeScript、Lint、Build、状态转换测试、路由测试和人工交互验收必须通过。

## 11. 非功能与安全

- 所有数据限定在当前本地组织作用域。
- 虚构候选人不使用真实个人可识别信息。
- 外部网络副作用必须被阻断；任何尝试写入 WorkflowAuditEvent。
- 关键流程可刷新恢复；每次 Agent 建议、用户选择与状态改变可追溯。
- 支持加载、空数据、失败、无权限和试用状态的明确 UI。

## 12. 待补充取证

以下入口已观察到，但具体交互尚未完整取证，不能在首轮开发中臆造：

- Job Brief 聚合页。
- Interview 日历、候选人兴趣回复后的排期流程。
- Session actions 菜单。
- Billing 页和 Refer & Earn 面板。

## 13. 相关文档

- 交互逐步证据：docs/research/METIX_INTERACTION_LOG.md
- 架构取证：docs/research/METIX_ARCHITECTURE_REVIEW.md
- 交互模式：docs/research/INTERACTION_PATTERNS.md
