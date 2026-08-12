# 数据规范

## 数据位置

当前 Demo 的共享数据放在：

```text
assets/js/mock-data.js
```

数据通过 `window.COMATE_MOCK` 提供给页面。页面渲染和交互逻辑位于 `assets/js/app.js`。

以后接入后端时，在 `assets/js/services/` 中增加异步请求方法，再逐步替换页面对 Mock 数据的直接读取。

## 核心数据

岗位 Job：

```text
id
title
summary
mustHave
```

候选人 Candidate：

```text
id
name
title
tags
score
priority
```

面试 Interview：

```text
id
candidateId
scheduledAt
status
```

Agent 事件 AgentEvent：

```text
agent
action
status
```

候选人测评 Assessment：

```text
id
candidateId
dimensions
summary
completedAt
```

## 数据约定

每条业务数据使用稳定的字符串 ID。时间统一使用包含时区的 ISO 8601 格式。

候选人优先级、面试状态和 Agent 状态需要使用团队约定的固定文案，避免同一状态出现多个名称。

## 修改规则

修改共享数据结构前需要在团队内简单确认。只有真实页面需要时再增加字段。

避免在多个文件重复维护同一个候选人对象，避免使用数组序号作为 ID，避免页面之间使用不同的状态名称。
