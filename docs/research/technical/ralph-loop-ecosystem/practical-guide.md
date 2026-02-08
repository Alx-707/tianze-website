# Ralph Loop 实践指南

> 基于 snarktank/ralph，从 9 个项目的生态调研中提炼。
> 适用于任何项目。配套阅读：`report.md`（生态调研报告）

---

## 一、选型结论

**推荐 snarktank/ralph**，原因：

| 维度 | 结论 |
|------|------|
| 架构正确性 | 外部 Bash loop，每次迭代全新上下文窗口 |
| 状态管理 | prd.json（JSON）> markdown checkbox（正则解析脆弱） |
| 复杂度 | ~100 行 vs frankbria 3000+ 行——维护成本低一个数量级 |
| 完成检测 | `<promise>COMPLETE</promise>` 信号 + `MAX_ITERATIONS` 硬上限 |
| 哲学对齐 | 最接近 Geoff Huntley 的原始设计意图 |

**不选其他的原因：**

- **frankbria/ralph-claude-code**：3000 行 Bash 的复杂度本身制造 bug（changelog 证据：正则解析失败、checkbox 检测 bug、退出逻辑错误）
- **ralphy**：特性堆砌（7 引擎、并行、沙箱），偏离"dumb loop, smart prompt"哲学
- **官方插件**：单上下文窗口，长任务会上下文膨胀 + 幻觉风险升高
- **ralphx**：Python 全生命周期编排，复杂度过高

---

## 二、核心原则

### "Dumb loop, smart prompt"

循环脚本越简单越好。所有智能放在两个地方：

1. **PROMPT.md** — Agent 的操作手册
2. **反馈机制** — 测试、类型检查、lint 作为 Agent 每轮必须通过的关卡

循环脚本对 Agent 是透明的——Agent 不知道外面是 frankbria 的 3000 行还是一行 `while true`。Agent 只看到注入的 prompt 和磁盘上的文件。

### 上下文隔离是刚需

每次迭代必须是**全新进程**。这不是 Bash 的功劳，而是进程级隔离的功劳：

- 新进程 = 干净上下文窗口 = 无上下文膨胀 = 低幻觉风险
- 记忆通过文件系统传递（git commit、prd.json、progress.txt），不是上下文内隐式传递
- 任何语言（Bash/TS/Python）只要 `spawn` 新进程都能做到

Bash 只是最透明、最容易验证这一点的方式。

---

## 三、PROMPT.md 工程化

PROMPT.md 是 Ralph loop 最关键的组件。以下是从 Agent 视角（即被约束者视角）总结的要点。

### 必须包含的部分

```markdown
# PROMPT.md 结构

## 1. 项目上下文（简短）
- 技术栈、关键约束
- 指向 CLAUDE.md / AGENTS.md 等项目级规范

## 2. 当前任务
- 指向 prd.json："读取 prd.json，找到 passes: false 的 story，实现它"
- 或直接描述本轮目标

## 3. 反馈机制（强制执行）
- 每轮必须运行的命令：test、type-check、lint、build
- 明确：这些命令全部通过才能继续

## 4. 完成条件（精确定义）
- 什么条件下输出 <promise>COMPLETE</promise>
- 什么条件下不能输出（防止误报）

## 5. 行为约束
- 不要做什么（例：不要修改不相关的文件）
- 遇到阻塞怎么办（写入 progress.txt，继续下一个 story）
```

### 关键要点

**完成条件必须精确**

Issue #76 的教训：Agent 在 34/38 迭代时误报完成，4 个 story 还没做。原因是 PROMPT.md 对"完成"的定义不够严格。

```markdown
# 错误示范
当所有任务完成后，输出 <promise>COMPLETE</promise>

# 正确示范
完成条件——必须同时满足：
1. prd.json 中所有 story 的 passes 字段为 true
2. 运行 [测试命令] 全部通过
3. 运行 [类型检查命令] 无错误
只有以上三条同时满足，才输出 <promise>COMPLETE</promise>。
任何一条不满足，继续工作，不要输出 COMPLETE。
```

**上下文恢复要快**

每次迭代 Agent 完全失忆。PROMPT.md 必须让 Agent 在几秒内从"一无所知"恢复到"知道该做什么"：

- 指向 progress.txt（上轮做了什么）
- 指向 prd.json（哪些 story 还没完成）
- 不要塞无关元数据（断路器状态、速率限制信息是噪音）

**反馈机制 = 真正的约束**

断路器、速率限制这些外部机制对 Agent 不可见。真正约束 Agent 行为的是：

- 测试失败 → Agent 必须修复
- 类型检查报错 → Agent 必须修复
- lint 不通过 → Agent 必须修复

把这些写进 PROMPT.md，要求 Agent 每轮结束前必须运行。这比任何外部防护都有效。

---

## 四、PRD 编写规范

prd.json 是 Agent 的任务清单。写法直接影响 Agent 效率。

### 粒度原则

```json
// 太粗 — Agent 一轮做不完，容易半途误报完成
{ "story": "实现用户认证系统", "passes": false }

// 太细 — 浪费迭代次数，每轮只推进一小步
{ "story": "创建 login 按钮组件", "passes": false }

// 合适 — 一轮可完成，有明确验收标准
{ "story": "实现邮箱密码登录，包含表单验证和错误提示", "passes": false }
```

**经验法则：一个 story 应该能在一次迭代内完成。**

### 顺序即依赖

prd.json 中 story 的排列顺序就是执行顺序。Agent 会从第一个 `passes: false` 的 story 开始。

```json
[
  { "story": "项目初始化和基础配置", "passes": true },
  { "story": "数据模型和类型定义", "passes": false },
  { "story": "API 路由实现", "passes": false },
  { "story": "前端页面和交互", "passes": false }
]
```

把有依赖关系的 story 按依赖顺序排列，不需要额外的依赖标注。

### 验收标准内嵌

```json
{
  "story": "实现产品列表页，支持分页，每页 12 项，包含 loading 状态",
  "passes": false
}
```

把可验证的细节写进 story 描述。Agent 没有你脑子里的隐含预期。

---

## 五、已知陷阱与对策

来自 snarktank/ralph 的 GitHub Issues 和生态调研。

### 陷阱 1：误报完成（#76）

**现象：** Agent 在任务未全部完成时输出 `<promise>COMPLETE</promise>`

**对策：**
- PROMPT.md 中精确定义完成条件（见第三节）
- 要求 Agent 输出 COMPLETE 前必须逐条检查 prd.json
- 要求运行测试套件作为客观验证

### 陷阱 2：Claude Code 周期性崩溃（#32）

**现象：** 每 4-5 次迭代 `No messages returned` 错误

**对策：**
- `MAX_ITERATIONS` 设高于实际需要（如需 15 轮，设 25）
- 容忍浪费几轮——崩溃后下一轮会从 progress.txt 恢复
- 关注 #45 PR（重试逻辑，尚未合并）

### 陷阱 3：速率限制（#82）

**现象：** 触发 API 限制后，迭代继续但每轮都失败，浪费次数

**对策：**
- 付费 API 基本不碰此问题
- 非付费用户：手动监控，触发后等待重置
- 关注 #82 PR（自动检测 + sleep，尚未合并）

### 陷阱 4：孤儿进程（#79，已修复）

**现象：** 循环结束后 Claude 进程残留，占 75-99% CPU

**对策：**
- 已在主分支修复
- 保险起见，循环结束后检查：`ps aux | grep claude`

### 陷阱 5：progress.txt 膨胀

**现象：** 追加式写入导致 progress.txt 越来越大，占据上下文窗口

**对策：**
- PROMPT.md 中要求 Agent 只写关键信息，不要写冗余日志
- 或在循环脚本中加一行：超过 N 行时截断保留最近部分

---

## 六、Geoff Huntley 方法论精要

来自 `ghuntley/how-to-ralph-wiggum`，是理解 Ralph 哲学的必读材料。

### 三阶段工作流

```
Phase 1: Requirements Definition（手动）
  → 写 PRD，定义 user stories

Phase 2: Planning Loop
  → PROMPT_plan.md → 生成 IMPLEMENTATION_PLAN.md
  → 循环直到计划完善

Phase 3: Building Loop
  → PROMPT_build.md → 按计划实现代码
  → 循环直到所有 story 通过
```

Planning 和 Building 用**不同的 PROMPT.md**。不要用同一个 prompt 既规划又实现。

### 子代理策略

- Sonnet 做搜索和文件读取（快、便宜）
- Opus 做复杂推理和架构决策（准确）

在 PROMPT.md 中可以指定：`对于搜索和简单查询使用 --model sonnet`

### AGENTS.md 的定位

Geoff 称 AGENTS.md 是"循环之心"：

- 是操作指南（Agent 该怎么做），不是日志
- 每个项目一份，跨迭代持久存在
- 类似于 CLAUDE.md 的角色

### "用 9 来编号 guardrails"

Prompt 技巧：用编号 9 开头的规则作为 guardrail（如 `9.1 不要修改测试配置`）。据 Geoff 说，大编号的规则在 Agent 注意力中权重更高。未经严格验证，但值得尝试。

---

## 七、快速启动清单

新项目使用 snarktank/ralph 的步骤：

```
□ 1. 克隆 snarktank/ralph 到项目中
□ 2. 编写 prd.json（按第四节规范）
□ 3. 编写 PROMPT.md（按第三节结构）
□ 4. 确保项目有可运行的测试/类型检查/lint
□ 5. 创建 progress.txt（空文件）
□ 6. 运行：./ralph.sh --tool claude 25
□ 7. 观察前 2-3 轮，确认 Agent 行为符合预期
□ 8. 放手，等循环结束后检查结果
```

---

*文档版本: 2026-02-08 | 基于 snarktank/ralph + 9 个项目生态调研*
