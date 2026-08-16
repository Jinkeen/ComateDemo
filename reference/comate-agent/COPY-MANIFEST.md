# Agent 参考实现复制清单

来源：`d:\招聘助手\comate`  
目标：`ComateDemo/reference/comate-agent/`  
说明：**未复制源仓库 `.git`**，ComateDemo 保留独立 Git 绑定。

## 已复制（成员 A 范围）

- 岗位创建 + AI 澄清：`src/features/role-brief/`、`src/features/recruiting-agent/`
- 简历筛选 / 校准 / 搜索：`src/features/recruiting-workflow/`、`src/features/candidates/`
- Agent API + SQLite：`src/app/api/roles/`、`src/server/`
- UI 壳层：`src/components/comate/`
- 设计文档：`PRD.md`、`docs/research/`、`docs/superpowers/` 等
- 测试：`tests/`

## 已排除

- `.git`、`.next`、`node_modules`、`.env.local`
- 视频文件（源目录无本地视频）
- `talent-evidence`、`recruiting-demo`、`evidence-profile`
- 面试安排 / 模拟外联组件与 Provider
- Agent 模板目录、构建缓存

## 本地裁剪

- 候选人确认后流程直接 `completed`
- 顶部导航仅保留：岗位创建、职位简报、候选人
- 侧边栏去掉「面试日程」

## 运行

```bash
cd reference/comate-agent
cp .env.example .env.local   # 填入 DEEPSEEK_API_KEY
npm install
npm run dev
```

访问 `http://localhost:3000/hire`

## 与黑客松 Demo 关系

| 路径 | 用途 |
|------|------|
| `index.html` + `assets/` | Trellis 规范下的 vanilla Demo |
| `reference/comate-agent/` | 完整 Agent 参考，独立运行 |
