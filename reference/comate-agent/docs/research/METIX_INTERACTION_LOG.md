# Metix 交互取证日志

> 目的：基于已登录产品界面的可见行为，逐步沉淀可复刻的页面、路由、状态和验收标准。除明确标注为“推断”的内容外，均以页面观察为准。
>
> 安全约束：仅观察；不提交职位、不发送候选人消息、不创建日历邀约、不触发支付或账户设置变更。

## 捕获 001：招聘工作台首页

> 实际已登录 Chrome 页面取证：`https://www.metix.ai/hire`。

### 已确认的页面地址与导航

- 当前页面：`/hire`（New Role，左侧导航高亮）。
- `Job Brief`：`/hire/jobbrief`。
- `Interview`：`/hire/calendar`。
- 已有职位采用独立详情地址：`/hire/role/{roleId}`；当前列表至少包含 `AI Product Manager` 与 `AI Gaming Assistant Product & Engineering Hybrid`。

### 可见页面结构

- 左侧全局导航：`New Role`、`Job Brief`、`Interview`。
- 左侧职位上下文：`All Roles` 下显示 `AI Product Manager` 与 `AI Gaming Assistant Product & Engineering Hybrid` 两个已有职位条目，并各带 `Session actions` 按钮。
- 主工作区欢迎语：提示招聘者开始寻找下一位候选人。
- 职位输入入口：可访问名称为 `Paste a job description, or tell Mira what you're hiring for in your own words` 的自由文本框，旁带 `Upload Job Details File`、`Upload Similar Profile`、`Linkedin Url`、`Job Url` 四类补充上下文入口；提交按钮在空输入时禁用。
- 左侧底部账户区：试用状态、账单入口、升级入口、当前用户菜单。
- 右上角有 `Refer & Earn` 按钮。

### 初步功能判断

| 能力 | 可见证据 | 复刻约束 |
| --- | --- | --- |
| 新建职位 | `New Role` 与主输入框同时存在 | 支持自由文本职位描述与草稿保存。 |
| 多源职位上下文 | 文件、相似档案、LinkedIn、职位 URL 入口 | 首版可使用本地模拟导入，保留来源类型与原始引用。 |
| 招聘资产导航 | `Job Brief`、`Interview` 和职位列表 | 采用真实 URL 路由与可恢复页面状态，不做单页面步骤切换。 |
| 职位工作区 | 每个职位有独立 `/hire/role/{roleId}` 地址 | 本地复刻必须让刷新、返回、侧栏切换和深链进入保持同一职位上下文。 |
| 订阅边界 | 试用、账单、升级入口 | 首版只展示，不接真实支付；每次操作必须显示演示提示。 |

### 待观察

- 提交职位描述后的 AI 澄清、结构化简报与页面跳转。
- 已有职位进入后的候选人、审核、外联、回复、面试等工作流。
- `Job Brief` 与 `Interview` 页面中的字段、筛选、动作与返回路径。

## 捕获 002：职位详情中的 Agent 澄清

**路由**：`/hire/role/{roleId}`（本次为 AI Product Manager 职位）。

### 已验证的页面与交互

- 页面标题为职位名称，旁有 `Edit role name`，说明职位名可在会话过程中修订。
- 中央区域保留原始职位描述，并以对话时间线展示 Agent 的解析、提问和用户答案。
- Agent 先从自由文本提取职位标题；在当前场景中把**地点**标为 mandatory gate，未取得地点前不继续进入完整检索标准。
- 已回答地点后，Agent 显示一个包含三题的澄清向导；当前题为 `What work model is this role?`。
- 单选题提供 `On-site`、`Hybrid`、`Remote`，并提供数字快捷键、`Add your own`、`Skip`、`Previous question`、`Next question` 和 `Next`。
- 首题时 `Previous question` 禁用；未作答时 `Next` 禁用。题目计数显示为 `1/3`。
- 每轮 Agent 处理后出现 `Thought for {duration}` 与 `Thought process` 控件。复刻版应表现为可展开的**简短决策说明/缺失字段提示**，而不是依赖不可控的长推理文本。
- 右侧 `Search Criteria` 随对话逐步更新：角色基础信息（标题、地点）与 must-have（AI 产品需求分析、方案设计、PRD 撰写、功能落地执行）。
- 右侧 `Progress` 固定显示四阶段：Describe the role → Review Samples → Find and Contact → Completed。

### 复刻影响

1. Agent 对话必须与结构化 `RoleBrief` 同步；每次回答产生可追溯的字段更新。
2. 必填关口由规则驱动（本例为地点），而不是仅靠前端文案。
3. 单选、自定义输入、跳过、前后题导航和禁用状态必须是真实可交互状态。
4. `SearchCriteria` 为派生结果，需随已确认字段实时展示，而非仅在流程结束后一次性生成。

## 捕获 003：分批澄清与条件标准化

### 已验证的状态推进

- 用户完成第一组问题后，时间线保留每一轮 `Q` / `A`：
  - 工作模式：On-site。
  - 资历：Junior（0–2 yrs）。
  - 必备能力：PRD writing & requirements analysis、Data analysis & SQL。
- Agent 在收到这一组答案后再次显示处理状态，并说明下一组要补充的信息类别：教育背景、行业/领域、排除条件，再进入公司信息阶段。
- 新一组再次显示为 `1/3` 的向导，首题为最低教育要求；选项为 Bachelor's degree、Master's degree、No requirement，仍保留自定义、跳过与禁用继续按钮。
- `Search Criteria` 将回答标准化后实时合并：
  - Role basics：AI Product Manager、Junior（0–2 yrs）、Hong Kong / Taiwan、Onsite。
  - Must-haves：既有能力与新增的 Data analysis、SQL。

### 复刻影响

1. 澄清不是固定的一次性表单，而是按领域分组的多轮问答；每组完成后可产生下一组问题。
2. 对话历史必须保留用户原始答案；搜索条件可保存归一化值（例如 `On-site` → `Onsite`，复合技能 → 独立技能标签）。
3. 每轮 Agent 需要声明下一步要补齐的字段类别，形成可解释的阶段性反馈。

## 捕获 004：公司信息阶段与自由文本追问

### 已验证的状态推进

- 第二组问答完成：
  - 最低教育：Bachelor's degree。
  - 行业/领域：SaaS / Enterprise software。
  - 排除条件：No experience writing PRDs。
- Agent 处理后明确进入 company info phase，并将下一题切换为独立的自由文本问题：`Which company is hiring for this role?`。
- 选项式向导在该阶段消失，替换为 `Message Mira` 文本框；空值时 `Send` 禁用。
- 搜索条件新增：Bachelor's degree、SaaS / Enterprise software exp，以及归一化的排除项 `No candidates without PRD writing experience`。

### 复刻影响

1. 题型由字段配置决定，不能强制所有澄清都使用选项向导；同一会话需支持单选题与自由文本题切换。
2. 搜索条件模型需支持正向条件和排除条件，并在 UI 中可解释地呈现。
3. Agent 阶段转换（能力要求 → 公司信息）应作为显式会话状态保存，便于恢复和测试。

## 捕获 005：自由文本语义归类与公司规模问答

### 已验证的状态推进

- 用户在公司名称自由文本题中输入 `AI company`。
- Agent 未将该答案视为具体公司名，而是解释为“招聘公司处于 AI 行业”，并用可见的处理说明说明这一语义归类。
- 随后 Agent 进入新的两题公司背景问题组，当前问题为 `What stage or scale is the company at?`，计数为 `1/2`。
- 该题提供 Early-stage / Startup、Series A / B、Series C / Pre-IPO、Established / Public 四个单选项，保留自定义、跳过、前后题导航和空答案禁用状态。

### 复刻影响

1. 自由文本答案需要经过字段归类：当答案不满足“具体公司实体”的预期时，可转换为行业/公司背景线索，并向用户说明其理解。
2. 文本解析不得静默覆盖原始答案；需保存原文、归类结果、置信度/解释和人工可编辑入口。
3. 公司信息按独立的问题组继续补齐，至少支持公司规模/阶段和领域等字段。

## 捕获 006：保密性决策卡

### 已验证的状态推进

- 公司背景问题组完成：
  - 阶段/规模：Early-stage / Startup。
  - 核心 AI 领域：AI SaaS / Enterprise AI。
- Agent 随后将流程切换为独立的可见性决策卡，并说明在继续前需要确认保密性。
- 决策卡提问：`Should candidates see your company name?`。
- 仅提供两个单选项：`Yes, show my company (Recommended)` 与 `No, keep it confidential`；未提供跳过或自定义入口。
- `Submit` 在未选项时禁用；该卡不沿用上一轮的 `1/n` 问题导航。

### 复刻影响

1. 系统除普通澄清向导外，必须支持“强制策略决策卡”这一题型：固定选项、无跳过、必须显式确认。
2. 公司保密性应成为职位发布、候选人视图与外联模板均可读取的持久化策略字段。
3. UI 可标记推荐选项，但不得默认代替用户提交；确认按钮在用户选择前必须禁用。

## 捕获 007：保密策略、目标公司与物流阶段

### 已验证的状态推进

- 用户选择 `No, keep it confidential` 后，Agent 明确确认公司名称将保密，并将对外公司画像归纳为 `Early-stage AI SaaS`。
- Agent 明确区分：候选人可见职位详情，但不可见公司名称。
- 随后询问目标人才公司；用户给出 `Workday`，该答案保留在 Q/A 时间线。
- Agent 进入最终 logistics and process 阶段，说明后续将收集薪酬、签证支持与招聘/面试流程。
- 当前显示该组 `1/3`：薪酬范围；选项按已知地点给出多币种区间（HKD 与 TWD），仍支持自定义、跳过和禁用继续按钮。
- 右侧职位标题由 `AI Product Manager` 派生为 `Junior AI Product Manager`，表明已确认的资历会影响展示/检索标题。
- 本次 `Thought process` 为展开态，说明该控件具有可切换展开/收起状态。

### 复刻影响

1. 保密策略应驱动一个可对外使用的匿名公司画像；真实公司数据与候选人可见字段必须隔离。
2. 目标公司是候选人检索偏好的一类输入，需支持多个实体、来源记录和后续编辑；本地版仅用于模拟排序，不得执行真实挖角或外联。
3. 薪酬选项应根据地点/币种上下文动态生成，同时允许用户自定义或跳过。
4. 派生职位标题需有来源链：基础职位 + 已确认资历，而非覆盖原始职位名称。

## 捕获 008：完整 Brief 确认与检索前关口

### 已验证的状态推进

- 最终 logistics/process 问题组完成：
  - 薪酬：HKD 15k–20k / month。
  - 签证支持：Yes。
  - 面试流程（可选）：Recruiter call → Product case study → Hiring manager → Final interview。
- Agent 在处理后将 Brief 标记为 complete，并明确说明会以英文汇总关键条件；保密公司使用匿名画像 `Early-stage AI SaaS`。
- 页面进入 `Ready to search` 状态，显示一段可读的检索摘要，并提供 `Start searching` 主按钮。
- 同时保留 `Message Mira` 输入框，允许用户在启动检索前继续调整条件；空输入时 `Send` 仍禁用。
- 右侧 `Search Criteria` 持续显示角色和硬性条件，但当前观察中不展示薪酬、签证、面试流程或目标公司，说明展示层与完整 Brief 模型不完全相同。

### 复刻影响

1. `RoleBrief` 必须覆盖薪酬、签证、面试流程、目标公司和保密策略，即使右侧精简搜索条件不显示全部字段。
2. Brief 完成后必须提供可编辑的确认态：人类可继续对 Agent 发消息修改，或显式点击进入搜索。
3. Agent 的检索摘要需以候选人可见策略渲染；保密职位不得泄露真实公司字段。
4. `Start searching` 是产生候选人检索任务的状态转换入口。复刻版只创建本地模拟 `SearchRun` 和进度事件，绝不调用真实数据源或外联服务。

## 捕获 009：样本检索与候选池扩展

### 已验证的状态推进

- 用户启动检索后，主按钮改为禁用的 `Search started`，对话输入与发送按钮同步禁用；页面显示 `Thinking...`。
- Agent 并未直接执行完整候选人搜索，而是先启动 sample check：先取约 3 位高质量样本候选人用于后续校准。
- Agent 先按 `Junior AI PM – Hong Kong` 策略进行样本检索；发现香港候选池仅 8 人后，基于已有地点范围扩展检索至台湾。
- 合并后候选池为 30 人，Agent 进入评分与分级流程，准备挑选 top 3 样本。
- 全过程通过多条可展开的处理说明和面向用户的进度文案表达；没有新的页面路由。

### 复刻影响

1. `SearchRun` 必须拥有显式异步状态（queued / running / sampling / scoring / awaiting-review / completed / failed），而不是单一 loading 布尔值。
2. 搜索策略可根据候选池稀疏度在已授权的地点范围内扩展；每次策略变更必须保存原因、原范围、扩展范围和候选计数。
3. 搜索期间锁定会改变搜索标准的输入，但仍应显示可理解的运行进度与后续动作。
4. 在完整搜索前必须支持 sample-candidate calibration 阶段；本地版使用固定虚构候选池和模拟进度事件。

## 捕获 010：样本候选人校准

### 已验证的页面与交互

- 搜索运行完成后，页面进入 `Review Samples 1 of 3`，带有 `Candidate Review 1 of 3` 进度条和 `Back to chat` 返回入口。
- 每个样本先显示一段 Agent 生成的匹配解释：列举与职位条件相符的经历/地点/年限证据，同时明确指出缺少显式技能证据等匹配缺口。
- 招聘者必须在 `Good fit`、`Maybe`、`Not a fit` 三档中做出判断；选择前，`Add feedback for Mira` 与 `Send feedback` 均禁用。
- 候选人侧栏档案包含摘要、地点、经历、教育、技能与掩码联系方式；长经历可通过 `More` 展开，技能可通过 `Show more` 展开。

### 隐私与复刻约束

- 观察到的候选人来自真实产品界面；复刻版不得复制其姓名、雇主、履历、邮箱或联系方式。
- 本地候选人必须使用虚构种子数据；联系方式仅可使用明显的占位/掩码字段。

### 复刻影响

1. `CalibrationFeedback` 至少包含候选人 ID、三态 verdict、可选文字反馈、操作者、时间戳和排序版本。
2. 评级操作解锁可选文本反馈；提交后推进至下一样本并更新进度条。
3. 候选人详情应支持摘要与深度档案两个密度层级，以及经历/技能的渐进展开。
4. Agent 匹配解释需同时呈现正向证据与缺失/风险证据，不能仅给出“强匹配”标签。

## 捕获 011：负向反馈的分层校准

### 已验证的状态推进

- 用户选择 `Not a fit` 后，三档 verdict 按钮锁定，所选 verdict 以 pressed 状态显示。
- 系统立即追问负向判断的主因；本次进入 `Skills don't match` 分支。
- 随后继续收集最关键能力缺口，并进一步区分“完全无证据”“能力层级过基础”“实际是需求分析而非 PRD 的缺口”等细粒度原因。
- `Review Next Candidate` 成为独立推进按钮；文字反馈框在已评级后可用，但未填写文字时 `Send feedback` 保持禁用。
- 候选人详情的技能区域可在 `Show more` / `Show less` 状态间切换。

### 复刻影响

1. `Not a fit` 不是终点，而是触发条件化的 `CalibrationReason` 子流程；原因树应可扩展且按 verdict 分支。
2. verdict、原因标签与可选文字反馈必须分开持久化，避免将自由文本替代结构化训练信号。
3. 评分完成后需锁定当前 verdict，防止不透明的重复提交；若支持修改，必须显式提供撤销/编辑动作并保留审计记录。
4. 下一样本的推进不依赖可选文字反馈；反馈文本只在非空后才允许单独发送。

## 捕获 012：校准规则落地与候选人反馈完成态

### 已验证的状态推进

- 在选择“无 PRD 写作证据”后，系统继续追问证据阈值：必须显式列出 PRD 写作，还是可以接受有文档化交付成果的间接证明。
- 用户确认：两种证据都可接受，但 PRD 写作必须是核心职责。
- Agent 将该答案转化为明确的检索收紧规则：排除仅暗示 PRD 能力、未将其作为核心责任的候选人。
- 规则确认后，当前候选人的反馈进入 complete 状态：文字框禁用且提示反馈已完成；保留 `Review Next Candidate` 作为唯一推进动作。

### 复刻影响

1. 校准树可继续追问“证据标准”，并把最终答案编译成可执行的 `SearchCriterion`，包括字段、证据类型、最小强度和排除规则。
2. `CalibrationFeedback` 必须拥有 completed 状态；完成后冻结当前候选人的评分、结构化原因与附加文本输入。
3. 检索条件变更应产生版本记录，以便解释后续样本/候选人排序为何变化。

## 捕获 013：Maybe 分支与证据渠道要求

### 已验证的状态推进

- 第二位样本候选人被标为 `Maybe`；该 verdict 同样锁定后进入条件化追问。
- 系统先询问不确定的来源（例如 PRD 证据缺失、SQL 未确认或其他），再区分“档案中完全未提及”与“已有作品但质量不足”。
- 继续追问该证据是否可在后续筛选电话中补齐，还是候选人档案必须已存在文档化证据。
- 用户确认档案内文档化证据为硬性要求后，Agent 将规则收紧为：候选人资料中必须明确展示 PRD 写作经历，并举例可接受的证据渠道（职位描述、作品集链接、认证）。

### 复刻影响

1. `Maybe` 需要独立的原因树，不能等同于 `Not a fit`；其结果可将软性疑虑升级为硬过滤条件。
2. 证据要求至少应区分：资料明示、作品/附件、外部筛选补充、仅隐含经历。
3. 每个证据规则必须支持 `required` / `preferred` 等强度，以驱动后续排序和剔除。
## Capture 014 — 正向样本反馈与扩展搜索（已观察）

状态：`Review Samples 3 of 3`。第三位样本被标记为 **Good fit** 后，三个评价按钮随即锁定，页面进入正向校准分支。

- Agent 询问是否要寻找更多与该样本相似的候选人。
- 已观察的正向路径：选择“扩展搜索” → 选择“相似公司背景（早期创业公司或 SaaS）” → Agent 用一句确认语说明将扩大该背景的人才范围。
- 该路径完成后，出现 `Complete Review`；自由反馈输入框与发送按钮保持禁用，并提示候选人评审已完成。
- 结论：第 3 个样本是校准阶段的结束关口；完成评审应从 `calibrating` 迁移到 `post_review` / `ready_for_full_search`，而不是直接执行外部搜索或联络。
本地复刻要求：

- 抽象 `PositiveCalibrationFeedback` 与 `SearchExpansionRequest`；当前仅确认 `company_background` 这一扩展维度，勿假定其他维度。
- 保存“好评 → 是否扩展 → 扩展维度 → 完成评审”的审计轨迹和搜索条件版本。
- 仅用虚构、脱敏的样本档案和本地模拟搜索结果；不得接入真实候选人、发送邀约或外部检索。

## Capture 015 — 校准完成后的执行模式选择（已观察）

在三名样本的评价都完成后，页面回到角色对话总览并展开 `Review Samples`：每张样本卡展示其最终标签（Not a fit / Maybe / Good fit）。随后 Agent 强制用户选择后续候选人处理模式。

- `Manual review`：先由 Agent 查找、评分、排序；招聘方逐一审核并批准候选人；其后才由 Agent 执行联系与跟进。
- `Automatic`：Agent 查找、评分、排序并自行批准匹配人选，再联系与跟进。
- 未选择模式前，底部 `Message Mira` 输入框和发送按钮禁用；其提示明确说明必须先选择推进方式。
- 右侧进度改为：Describe the role → Review Samples → Find and Contact → Completed；右侧继续展示结构化 Search Criteria。

安全边界：原网站的两个模式都包含候选人邮件与自动跟进。复刻产品只实现**本地模拟的联系计划、审批队列、状态变化和审计记录**；不得发送邮件、邀约、自动跟进或请求真实外部候选人数据。

## Capture 016 — 人工审核模式确认与全量匹配运行（已观察）

用户确认 Manual review 后，模式卡转为 Confirmed，并立即进入 Sourcing candidates 的异步运行状态。

- 顶部漏斗显示阶段与实时计数：Screen、Match、Contact、Interested、Interview；本次只有 Screen / Match 有数值，后续联系和面试阶段均为 0。
- 匹配阶段可显示增量标记（例如 Match +20），而 Contact、Interested、Interview 在当前阶段禁用。候选人区先显示“完成 sourcing 后出现候选人”的占位，再以候选卡流式填充。
- Agent 会把校准信号合并到全量检索：PRD 经历要被档案明确证明、优先早期创业/SaaS 背景；这些变化进入后续搜索的理由说明。
- 当严格条件下市场候选池耗尽时，Agent 显示证据与估算数量，提出放宽部分筛选条件再继续评分；运行中 Agent 消息输入保持禁用。

本地复刻要求：

1. 将 SourcingRun 设计为可恢复的模拟异步状态机，至少区分 queued / searching / scoring / awaiting_review / completed / exhausted / failed。
2. 顶部漏斗计数必须源自本地候选人状态聚合；候选卡仅使用虚构的脱敏数据。
3. “条件放宽”必须创建明确的建议和 CriteriaVersion。源站会自动执行这类策略变化；复刻版应将其作为可配置的模拟策略，完整保留原因、前后条件与可回退能力。
4. Manual review 下，候选人只能进入本地 awaiting_reviewer_decision；绝不发送邮件、消息、邀约或自动跟进。

## Capture 017 — 低产出信号与 Agent 自主扩展检索策略（已观察）

全量池完成评分后，Match 数继续上升。Agent 在页面内持续发布可展开的进度解释，并以低产出/候选池不足作为触发信号打开新的检索角度。

- 先完成现有池的评分；产出率下降时，Agent 不立即终止，而是标记为 low yield 并说明仍有待评分候选人。
- 当前池耗尽但并未完全 exhausted 后，Agent 生成替代策略：不同职位名、不同技能措辞、不同公司背景和更宽的经验范围。
- 之后自动进行小规模测试检索，依据返回池大小选择更宽的查询，例如将某些硬技能或年限约束降级为偏好、拓宽标题或取消行业过滤。
- 原始 Search Criteria 摘要保持展示；实际运行的策略变化则体现在 Agent 时间线里，形成“基线 brief + 派生检索策略”的双层信息结构。

本地复刻要求：

1. 模拟策略引擎需维护 SearchStrategyAttempt（查询维度、变更原因、候选池大小、产出率、状态），不可只覆盖 RoleBrief。
2. 将 market signal 建模为 normal / low_yield / exhausted；每次策略变化必须有可见的简短理由和审计记录。
3. 保留源站“自主开新角度”的交互节奏，但在本地仅运行虚构数据集；可提供策略回退/暂停入口，且不产生任何外部访问或联系。

## Capture 018 — 多策略候选池合并与分批评分（已观察）

新角度测试成功后，Screen 总数显著增长，而 Match 数暂时保持不变；页面继续处于 Match in progress，并显示“仍有大量未评分候选人，将分批评分”的 Agent 状态。

- 漏斗的 Screen 数是跨策略召回后的聚合计数；Match 数只在评分并通过后增长。
- 多轮策略可向同一运行补充候选池，运行不会因前一轮池耗尽而重新开始。
- 当前处于中间态时，Contact / Interested / Interview 仍保持禁用和 0；候选人尚未进入人工逐一审核。

本地复刻要求：

1. CandidatePoolEntry 需要关联来源 SearchStrategyAttempt，并通过本地去重键避免同一虚构候选人因多策略重复计数。
2. 漏斗指标采用事件或状态聚合计算；Screen、scored、matched、pending_review 等计数不能互相覆盖。
3. 分批评分必须支持取消、恢复和确定性重放，保证刷新后进度与原因可复现。

## Capture 019 — 策略效果比较与地域授权边界（已观察）

分批评分继续后，Match 数增长，Agent 会比较不同策略、不同地区的产出率，并据此优先继续高产出的策略。它同时将市场信号区分为 productive、exhausting、exhausted 等不同阶段。

- Agent 在时间线中展示策略级的候选数和合格产出，以说明为什么继续或停止某个检索方向。
- 当考虑扩展到未授权的新地区时，Agent 明确停止该想法：用户只给出了既定地区，因此不能自行扩大地域。
- 在已有地区内，Agent 会转向相邻职位名或技能组合继续尝试。

本地复刻要求：

1. RoleBrief 的 permittedLocations 必须与 SearchStrategyAttempt 的实际查询范围分离校验；任何超出授权地区的策略必须进入 awaiting_location_authorization，而不能直接运行。
2. 策略比较需存储池大小、已评分数、合格数、产出率与终止原因，供 UI 输出简短解释。
3. 市场信号应由规则/模拟数据计算，不以模型文本为唯一事实来源。

## Capture 020 — 市场接近耗尽时的地域扩展决策卡（已观察）

在多轮相邻职位与技能优先策略仍持续低产出后，Agent 不再自动越过地点边界，而是汇总本轮覆盖范围、低产出证据与当前合格候选人规模，然后展示一个必须回答的决策卡。

- 决策卡的问题是：在当前两个已授权市场基本耗尽后，如何获得更多候选人。
- 已观察选项：扩展至新加坡、扩展至更广的亚太地区、使用当前已找到的合格候选人。
- 选项为单选 radio；未选择时 Submit 禁用。
- 此时仍未转入 Contact 阶段，说明地域扩展决定属于检索策略的人工授权关口。

本地复刻要求：

1. 当 market signal 到达 exhausting / exhausted 且满足策略尝试阈值时，生成 MarketExpansionDecision，附带本地可解释摘要。
2. 决策卡必须记录选择、操作者、时间、所依据的策略版本；拒绝扩展应进入 finalize_current_pool，而不是报错。
3. 不复刻或展示模型原始长推理；仅展示经过模板化和审核的“候选池、产出、边界与可选方案”说明。

## Capture 021 — 候选人审批列表与批量操作（已观察）

用户进入后续阶段后，页面切换到 Candidate List Waiting Approval，而不是继续留在对话时间线。该列表是人工审核模式的候选人工作台。

- 顶部显示已选 / 未选数量，提供全选复选框、Clear 与批量 Approve & contact 按钮。
- 列表卡展示候选人的匹配等级（例如强匹配、值得沟通）、联系状态（未联系）、职位/地点摘要与少量技能标签；点击卡可打开候选人档案。
- 本次列表默认所有候选人已选；支持分页，页面显示当前区间、页码、上一页（首屏禁用）与下一页。
- 该阶段仍有顶层漏斗，Contact 数尚为 0。源站的批量批准按钮会进入真实联系能力，故未点击。

安全与复刻要求：

1. 仅用虚构、脱敏的 CandidateCard 数据；不复制源站人名、雇主、地点、头像、联系方式或技能组合。
2. 实现 SelectionSet、分页、清空、打开本地详情和匹配等级筛选/排序等交互；初始是否全选应成为可配置的本地策略。
3. 将批量按钮改为“批准并模拟联系”或保留视觉文案但清晰标注模拟；只创建 SimulatedContactPlan / WorkflowAuditEvent，禁止真正发送。

## Capture 022 — 清空全局选择与跨页审批状态（已观察）

在列表中清空选择并翻到下一页后，顶部由“已选数量 + Clear”切换为未勾选的 Select all waiting candidates；批量 Approve & contact 随之禁用。新页的每张候选卡也均未选择。

- 选择不是当前页的临时 UI 状态，而是作用于整个 waiting-approval 候选集合。
- 分页更新为新的显示范围和页码；上一页在非第一页可用，下一页保持可用。
- 选择为 0 时，不显示可执行的批准动作状态。

本地复刻要求：

1. SelectionSet 必须由 role / review queue 作用域持久化，而非组件局部数组；翻页、刷新和返回列表均保持正确状态。
2. 全选语义应明确为“所有待审核候选人”，而不是仅当前页；Clear 清空整个集合。
3. 批量批准按钮必须由 selectionCount > 0 派生禁用状态，并在模拟审计中记录作用范围。

## Capture 023 — 已联系候选人阶段与投递状态列表（已观察）

观察到另一个角色会话已进入 Contact 阶段。页面从“待审批”切换为 Contacted Candidates，并在顶部漏斗显示 Contact 数量。

- 页面提供汇总指标：已发送邮件数、已检查档案数。
- 每张候选卡显示联系投递状态（例如未读、已打开、失败），并可打开档案；仍保留职位、地点和技能摘要信息。
- 失败被作为独立的可见状态，而不是静默消失，说明外联阶段存在可追踪的投递结果。

安全与复刻要求：

1. 本地只模拟投递状态时间线：planned → simulated_sent → simulated_opened / simulated_unread / failed；不得使用邮件服务、跟踪像素、外部通信或真实个人数据。
2. 汇总指标由本地 SimulatedContactPlan 聚合而来，并能下钻至每张虚构候选卡的状态与审计事件。
3. 失败状态应支持展示模拟失败原因与重试计划预览，但重试不得执行任何真实发送。

## Capture 024 — 全局角色导航与试用账户状态（已观察）

展开侧栏后可见全局工作区结构：

- 品牌入口返回 New Role；主导航包含 New Role、Job Brief、Interview。
- All Roles 区列出多个角色会话，每个会话有独立 Session actions 入口，用于角色级操作。
- 侧栏底部显示当前试用计划、剩余试用时间、Manage billing 与 Upgrade Now。

安全与复刻要求：

1. 实现本地路由和会话列表，但角色数据只限当前组织的虚构演示数据。
2. 可展示“演示计划 / 本地模式”信息；Manage billing / Upgrade 必须为不可执行的占位说明，不接入支付、订阅或账户变更。
3. Session actions 采用菜单组件，并在后续观察中再补充其项目和状态规则。

## Capture 025 — 账户资料、安全与删除账户设置（已观察）

账户设置页包含 Account / Billing 两个导航项；Account 下分为 Profile、Security 和 Delete account。

- Profile 支持头像变更、名字、姓氏、公司、职位；邮箱字段只读。公司与职位字段显示长度计数。
- Security 在未设置密码时说明可添加邮箱登录密码作为第三方登录的替代，并提供 Set password。
- Delete account 明确提示将永久删除账号、角色、候选人和面试记录，且不可撤销。

本地复刻要求：

1. Profile 只保存本地演示资料，字段长度、可编辑/只读状态和保存反馈可复刻；不得写入真实身份信息或调用身份提供商。
2. 密码设置仅显示不可执行的安全占位说明，不能收集或存储密码。
3. 删除账户采用演示确认流程：仅软删除本地演示工作区或重置浏览器存储，并提供撤销窗口；不得删除用户文件、系统账户或任何外部数据。
