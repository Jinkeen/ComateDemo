# Git 协作规范

## 分支安排

`main` 始终保存可以正常演示的版本。每位成员从最新的 `main` 创建自己的功能分支：

```text
feature/recruiter-screening
feature/interview-flow
feature/candidate-experience
```

成员 A 负责协调公共页面路由和 Mock 数据修改。成员 C 负责检查整体视觉一致性。

## 每日开发流程

1. 开始开发前拉取最新 `main`。
2. 查看自己负责的 Trellis 任务。
3. 每完成一个独立功能进行一次提交。
4. 将功能分支推送到 GitHub 并创建 Pull Request。
5. 使用 VS Code Live Server 打开 `index.html`，检查两个身份入口和自己负责的流程。
6. 每天至少合并一次，尽早发现页面与数据冲突。

提交信息示例：

```text
feat: 增加简历筛选页面
feat: 增加候选人语音测评流程
fix: 修复身份切换导航
docs: 更新UI视觉规范
```

## 公共文件

以下文件容易发生冲突，修改前需要在团队群里说明：

```text
index.html
assets/js/app.js
assets/js/mock-data.js
assets/css/styles.css
```

功能独立后，可以将相关 JavaScript 放入 `assets/js/features/`，减少所有人同时修改 `app.js` 的情况。

## 禁止提交

以下内容不能提交到 Git：

```text
.trellis/.developer
.trellis/.runtime
账号密码和密钥
本地编辑器配置
临时文件
```

## 合并检查

提交 Pull Request 前确认：

页面可以从身份入口进入，核心按钮可以点击，Mock 数据稳定，视觉样式统一，浏览器控制台没有报错，手机尺寸下没有明显布局问题。
