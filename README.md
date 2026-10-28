# CoMate

面向 AI 时代的双端人才匹配产品，让候选人的真实项目与能力被看见，也让招聘团队更容易找到适合一起做事的人。

本仓库是飞书黑客松项目的前端交互 Demo，使用原生 HTML、CSS 和 JavaScript 构建，围绕招聘工作台、人才名片与求职陪伴展示产品方案。无需安装前端依赖或配置 API Key，即可在本地体验。

[产品演示视频](https://drive.google.com/file/d/1JGVlZqmeagvyqS0Ayi3YiIlJQCxhrByn/view?usp=sharing)

## 产品思路

复合型人才的价值往往分散在项目经历、作品和协作方式中，传统简历很难完整呈现这些信息。与此同时，中小团队也需要更清楚地表达业务目标和用人需求。

CoMate 围绕这两端设计体验：候选人通过人才名片、项目成果和情境式对话逐步呈现自己的能力；招聘方通过岗位画像、筛选进度与候选人推荐了解匹配过程。产品希望让推荐依据能够回到具体经历与项目证据，并保留人的判断与确认。

## 当前可以体验什么

### 候选人端

| 页面 | 体验内容 |
| --- | --- |
| 人才名片 | 查看能力拼图、项目成果与数字足迹，切换个人介绍和项目经历，编辑已有项目的名称与成果，复制名片链接。 |
| 求职搭子 | 在人才名片右侧查看机会进展，通过快捷问题或文字输入体验预设的求职建议。 |
| AI 聊聊 | 选择聊天主题，进入模拟通话场景，推进示例问答，查看能力发现并体验确认反馈。 |
| 求职旅程 | 查看机会进度、待办与近期安排，筛选进行中的机会，打开测评准备提示。 |

### 招聘方端

提供创建岗位、简历筛选、候选人、面试安排和面试报告的导航框架。其中，简历筛选页展示 Mock Agent 协作进度，候选人页展示示例人才、能力标签与匹配分。创建岗位、面试安排和面试报告目前保留为模块开发入口。

## 快速开始

下载项目，或通过 Git 克隆：

```bash
git clone https://github.com/Jinkeen/ComateDemo.git
cd ComateDemo
```

在项目根目录启动静态服务：

```bash
python -m http.server 8080
```

浏览器打开 [http://localhost:8080](http://localhost:8080)，在首页选择「我是招聘方」或「我是候选人」。使用 Python 3 的环境也可以运行 `python3 -m http.server 8080`。

也可以使用 VS Code 的 Live Server 打开根目录下的 `index.html`，或直接用浏览器打开该文件。推荐使用本地静态服务，以便稳定访问各页面；复制名片链接等功能还取决于浏览器的剪贴板权限。

### 页面入口

以下地址以运行在 `localhost:8080` 的本地服务为例。

| 入口 | 地址 |
| --- | --- |
| 身份选择首页 | [首页](http://localhost:8080/index.html) |
| 招聘工作台 | [创建岗位](http://localhost:8080/index.html#recruiter/job) |
| Agent 筛选进度 | [简历筛选](http://localhost:8080/index.html#recruiter/screening) |
| 推荐候选人 | [候选人](http://localhost:8080/index.html#recruiter/candidates) |
| 人才名片与求职搭子 | [人才名片](http://localhost:8080/candidate/profile.html) |
| 模拟对话与能力发现 | [AI 聊聊](http://localhost:8080/candidate/chat.html) |
| 机会进展与待办 | [求职旅程](http://localhost:8080/candidate/journey.html) |

建议先从候选人端查看人才名片，编辑一段已有项目经历，再进入 AI 聊聊，通过「下一题」推进模拟对话，最后查看求职旅程中的机会与测评准备。随后返回首页，切换到招聘方，查看筛选进度和候选人推荐。

## 代码结构

```text
ComateDemo/
├── index.html                         # 首页与招聘方单页入口
├── candidate/
│   ├── profile.html                   # 人才名片与求职搭子
│   ├── chat.html                      # AI 聊聊与模拟通话
│   └── journey.html                   # 求职旅程
└── assets/
    ├── css/                           # 首页与候选人页面样式
    ├── images/candidate/              # 候选人端图片资源
    └── js/
        ├── app.js                     # 首页渲染与招聘端 Hash 路由
        ├── mock-data.js               # 岗位、候选人与 Agent 示例数据
        └── features/candidate/
            ├── profile-page.js        # 名片、项目编辑与预设问答
            ├── chat-page.js           # 模拟通话与能力确认反馈
            └── journey-page.js        # 机会筛选与任务提示
```

页面采用原生 DOM 交互。招聘方页面通过 Hash 路由切换，候选人端采用独立 HTML 页面。修改示例岗位、候选人和筛选事件可从 `assets/js/mock-data.js` 开始；候选人端的示例内容分布在对应 HTML 和页面脚本中。

## 演示范围与后续方向

当前版本用于产品方案展示与交互验证，使用静态示例数据和预设回复。页面中的人物经历、匹配分、机会进展与效果数字均为演示内容。真实模型调用、语音识别、简历解析、向量检索、登录鉴权与后端存储尚未接入。

项目编辑等变化仅保留在当前页面中，刷新后会恢复初始内容。「加入能力拼图」等操作展示确认反馈，尚未跨页面更新人才画像。部分入口按钮用于展示下一步交互提示。

后续可围绕真实模型对话、带证据的人才画像、招聘需求构建、可解释推荐与面试安排继续完善，并逐步接入持久化存储和用户权限控制。
