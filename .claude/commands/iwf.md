---
name: iwf
description: Integrated Workflow - planning-with-files 持久化 + superpowers 流程纪律 + CI 循环
user-invocable: true
---

# Integrated Workflow (I-WF)

## 架构

```
iwf = 编排器
├── planning-with-files → 状态持久化（可跨会话恢复）
├── superpowers → 流程纪律（不重复造轮子）
└── CI 循环 → iwf 独有
```

**核心原则**：iwf 只做编排，流程细节交给 superpowers。

---

## 执行协议

### Phase 1: 初始化

**状态文件位置**: `docs/plans/`

```
1. 检查状态文件
   - docs/plans/task_plan.md 存在 → 显示恢复报告，确认继续点
   - 不存在 → 创建 docs/plans/{task_plan.md, findings.md, progress.md}

2. 确定执行模式
   - 正常：关键节点询问
   - 挂机：自主决策，阻塞标记 suspended
```

**状态文件格式**：

```markdown
# task_plan.md
## 状态
- 当前: Task N
- 进度: X/Y
- 模式: 正常 | 挂机

## Tasks
### Task 1: [标题]
- 状态: pending | in_progress | completed | blocked
- 文件: [路径]

## 阻塞记录
| Task | 原因 | 待解决 |

## 自主决策（挂机模式）
| 决策 | 理由 | Task |
```

---

### Phase 2: 设计

**调用**: `superpowers:brainstorming`

按 brainstorming 流程执行，完成后：
1. superpowers 输出到 `docs/plans/YYYY-MM-DD-<topic>-design.md`
2. **iwf 后处理**：复制到固定位置用于会话恢复
   ```bash
   cp docs/plans/*-design.md docs/plans/findings.md
   ```
3. 跳过 worktree 创建（iwf 不强制 worktree）

---

### Phase 3: 规划

**调用**: `superpowers:writing-plans`

按 writing-plans 流程执行，完成后：
1. superpowers 输出到 `docs/plans/YYYY-MM-DD-<feature>-plan.md`
2. **iwf 后处理**：复制到固定位置用于会话恢复
   ```bash
   cp docs/plans/*-plan.md docs/plans/task_plan.md
   ```
3. 保持 TDD 格式、bite-sized 任务粒度

---

### Phase 4: 执行

**调用**: `superpowers:subagent-driven-development`

使用 superpowers 的完整流程：
1. 派发 implementer 子代理（用 superpowers prompt 模板）
2. spec-reviewer 审查（spec 合规）
3. code-quality-reviewer 审查（代码质量）
4. 循环直到通过

**iwf 附加**：每个 Task 完成后，更新 planning-with-files 状态：
- 更新 `docs/plans/task_plan.md` 状态
- 追加 `docs/plans/progress.md` 执行日志

```markdown
# progress.md 格式

## [时间戳] Task N: [标题]
状态: completed | blocked
审查: spec ✅ | quality ✅

### 执行内容
[implementer 报告]

### 审查结果
[reviewer 反馈摘要]
```

---

### Phase 4.5: 语义审查（iwf 独有）

**目的**：自动化工具（type-check、lint、test）无法捕获的语义问题，需要对抗性审查。

**触发**：Phase 4 全部 Task 完成后，Phase 5 之前。

#### 调用策略

Codex 速度慢（单次审查 3-5 分钟），不能频繁调用。按变更规模分级：

| 条件 | 审查方式 | 理由 |
|------|----------|------|
| `src/` 变更 ≥50 行 | **Codex**（固定 prompt） | 变更量大，语义盲区概率高 |
| `src/` 变更 <50 行 | `superpowers:requesting-code-review` | 变更量小，Claude 自审即够 |
| 仅 docs/config/test 变更 | **跳过** Phase 4.5 | 无语义审查价值 |

**判断命令**：
```bash
# 统计 src/ 目录变更行数
git diff origin/main...HEAD --stat -- 'src/' | tail -1
# 输出示例: 15 files changed, 342 insertions(+), 87 deletions(-)
```

#### Codex 审查（≥50 行）

**固定 Prompt 位置**：`.claude/prompts/codex-semantic-review.md`

**调用**：
```bash
# 提取 --- 之间的 prompt 内容，传给 Codex
PROMPT=$(sed -n '/^---$/,/^---$/{ /^---$/d; p }' .claude/prompts/codex-semantic-review.md)
python scripts/codex_bridge.py \
  --cd "$(pwd)" \
  --PROMPT "$PROMPT" \
  --return-all-messages
```

**审查维度**（定义在固定 prompt 中）：
1. 功能完整性（CTA 是否有行为、链接是否 404）
2. 项目规范（i18n Link、eslint-disable 纪律）
3. 架构合规（Server Components first、复杂度限制）

**Prompt 维护**：当项目约束变化时（如新增 ESLint 规则），同步更新固定 prompt。

#### 轻量审查（<50 行）

使用 `superpowers:requesting-code-review`，审查范围同上。

#### 结果处理

1. **critical** 问题 → 创建修复 Task → 回到 Phase 4 执行
2. **warning** 问题 → 创建修复 Task（优先级次于 critical）
3. **suggestion** 问题 → 降级为 known-issue 或忽略
4. 零问题 → 进入 Phase 5

**progress.md 记录**：

```markdown
## [时间戳] Phase 4.5: 语义审查
审查方式: Codex (固定 prompt) | superpowers:requesting-code-review | 跳过
变更规模: N 行 (src/)
发现问题: N 个 (critical: X, warning: Y, suggestion: Z)
- Issue 1: [描述] → Task X
- Issue 2: [描述] → 降级为 known-issue
```

### [2026-02-08] 来源 — Codex 审查发现 7 个语义问题（CTA 无行为、链接 404、未走 i18n Link、条件 Hook、全 Client Component、测试盲区），均为自动化工具无法捕获的类型。

---

### Phase 5: 验证

**调用**: `superpowers:verification-before-completion`

严格遵守：
- 运行完整测试套件
- 类型检查
- Lint
- **必须有验证证据才能声明完成**

---

### Phase 6: CI 循环（iwf 独有）

**触发条件**：Phase 5 通过后，询问是否提交（挂机模式自动执行）

```
LOOP (最多 5 次):

  1. 提交并推送
     # 安全添加：仅添加 src/, docs/, tests/ 等代码目录
     # 排除敏感文件：.env*, credentials*, *.key, *.pem
     git add src/ docs/ tests/ public/ messages/
     git add package.json pnpm-lock.yaml tsconfig.json
     # 检查暂存内容，确认无敏感文件
     git diff --cached --name-only
     git commit -m "feat(scope): 描述"
     git push origin [branch] -u

  2. 监控 CI
     gh run watch --exit-status

  3. 结果处理

     IF 全绿:
        → 记录到 progress.md
        → 提示运行 /git-sync
        → 结束

     IF 失败:
        → gh run view [run-id] --log-failed
        → 分析失败原因
        → 修复
        → 继续循环

  4. 超过 5 次 → 标记 blocked，需人工介入
```

**progress.md 记录**：

```markdown
## [时间戳] CI 循环

### 推送 #1
- Commit: [hash]
- 结果: failed
- 失败: [job] - [错误摘要]

### 修复
- 文件: [改动]
- 原因: [分析]

### 推送 #2
- Commit: [hash]
- 结果: passed ✅
```

---

### Phase 7: 收尾

**调用**: `superpowers:finishing-a-development-branch`

按 superpowers 流程提供 4 个选项：
1. Merge locally
2. Create PR
3. Keep as-is
4. Discard

**归档（Merge/PR 成功后执行）**:

```bash
# 提取任务名称（从 task_plan.md 第一个 Task 标题）
TASK_NAME=$(grep -m1 "^### Task 1:" docs/plans/task_plan.md | sed 's/### Task 1: //' | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
DATE=$(date +%Y-%m-%d)
ARCHIVE_DIR="docs/plans/archive/${DATE}-${TASK_NAME}"

# 归档
mkdir -p "$ARCHIVE_DIR"
mv docs/plans/task_plan.md "$ARCHIVE_DIR/"
mv docs/plans/findings.md "$ARCHIVE_DIR/"
mv docs/plans/progress.md "$ARCHIVE_DIR/"
```

**归档结构**:
```
docs/plans/archive/
└── 2026-02-05-homepage-redesign/
    ├── task_plan.md
    ├── findings.md
    └── progress.md
```

---

## 执行模式

### 正常模式
- Phase 2 brainstorming 时一次一问
- Phase 6 CI 循环前询问确认
- 关键决策询问

### 挂机模式
- 不使用 AskUserQuestion
- 自主决策，记录到 `docs/plans/task_plan.md`
- 阻塞任务标记 blocked，继续其他任务
- 最后输出总结报告

---

## 会话恢复

上下文满了 /clear 后：

```
/iwf

→ 检测到 docs/plans/task_plan.md
→ 显示恢复报告
→ 从未完成的 Task 继续
```

---

## Superpowers 引用

| Phase | Superpowers Skill | 用途 |
|-------|-------------------|------|
| 2 | `superpowers:brainstorming` | 设计发散 |
| 3 | `superpowers:writing-plans` | TDD 格式规划 |
| 4 | `superpowers:subagent-driven-development` | 子代理执行 + 双阶段审查 |
| 4.5 | Codex（≥50 行，固定 prompt）/ `superpowers:requesting-code-review`（<50 行） | 语义审查（功能、规范、架构） |
| 5 | `superpowers:verification-before-completion` | 完成前验证 |
| 7 | `superpowers:finishing-a-development-branch` | 分支收尾 |

**子代理 Prompt 模板**（Phase 4 使用）：
- `implementer-prompt.md`
- `spec-reviewer-prompt.md`
- `code-quality-reviewer-prompt.md`

位置：`~/.claude/plugins/cache/superpowers-marketplace/superpowers/*/skills/subagent-driven-development/`

---

## iwf 独有价值

| 能力 | superpowers | iwf |
|------|-------------|-----|
| 跨会话恢复 | ❌ TodoWrite 内存级 | ✅ 文件级持久化 |
| CI 自动修复 | ❌ | ✅ Phase 6 |
| 挂机模式 | ❌ | ✅ 自主决策 + suspended |
| 状态文件 | docs/plans/设计文档 | docs/plans/{task_plan,findings,progress}.md |
| 归档机制 | ❌ | ✅ 完成后归档到 docs/plans/archive/ |
| Codex 语义审查 | ❌ | ✅ 固定 prompt + 变更规模分级触发 |

---

现在告诉我：

1. **任务描述**：你要完成什么？
2. **执行模式**：正常 / 挂机
