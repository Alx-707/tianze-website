---
name: integrated-workflow
description: 启动 Planning-with-Files + Superpowers 整合工作流，支持持久化、TDD、子代理执行、无人值守
user-invocable: true
---

# 整合工作流

请告诉我：

1. **任务描述**：你要完成什么？

2. **执行模式**：
   - `正常` - 会在关键节点询问确认
   - `挂机` - 无人值守，自主决策，遇阻标记 suspended

---

收到你的输入后，我会：

## 初始化
- 执行 /planning-with-files 创建/恢复状态文件
- 检测是否有之前的会话需要恢复

## 设计（新任务）
- 快速确认目标和方案（1-2 个问题）
- 输出到 findings.md

## 计划
- 使用 TDD 格式拆分任务
- 每个任务 5-15 分钟可完成
- 输出到 task_plan.md

## 执行
- 每个任务派发子代理
- 子代理必须遵循 TDD（先写测试）
- 完成后更新 progress.md 和 task_plan.md
- 循环直到全部完成

## 挂机模式附加规则
- 不询问用户
- 自主决策并记录理由
- 遇阻标记 suspended，继续其他任务
- 最后输出总结报告

---

**会话恢复**：如果 /clear 后，发送 `/user:integrated-workflow` 即可自动恢复。

---

现在请告诉我任务描述和执行模式。
