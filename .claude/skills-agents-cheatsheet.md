# Skills & Agents 完整工作流

## 工作流全景图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 入口选择                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│   用户需求 ──┬──▶ /integrated-workflow ──▶ 完整流程（规划→执行→审查→提交）        │
│              ├──▶ /afk ──▶ 无人值守模式（自主决策，阻塞标记）                      │
│              └──▶ 直接执行 ──▶ 单个 skill/agent                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              阶段 1: 规划                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  /superpowers:brainstorming ──▶ 探索意图、澄清需求 ⚠️ 任何创作前必用              │
│         │                                                                        │
│         ▼                                                                        │
│  /superpowers:writing-plans ──▶ 生成 task_plan.md、拆分子任务                    │
│         │                                                                        │
│         ├──▶ /superpowers:using-git-worktrees ──▶ 创建隔离分支                   │
│         └──▶ 领域 Skill 注入（/next-best-practices, /frontend-design 等）        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              阶段 2: 执行                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  执行模式选择:                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────────┐    │
│  │ executing-plans     │  │ subagent-driven-    │  │ dispatching-parallel- │    │
│  │ 新会话 + 审查检查点   │  │ development 当前会话 │  │ agents 2+独立任务     │    │
│  └─────────────────────┘  └─────────────────────┘  └───────────────────────┘    │
│         │                                                                        │
│         ▼                                                                        │
│  /verification-first (自动) ──▶ 确定验证方式 → 建立基线 → 测试先行                │
│         │                       ⚠️ 无法验证 → 拒绝生成                           │
│         ▼                                                                        │
│  /evaluator-optimizer ──▶ Generate → Evaluate → Optimize (max 3 loops)          │
│         │                                                                        │
│         ├──▶ /superpowers:test-driven-development ──▶ 先测试后实现               │
│         └──▶ /superpowers:systematic-debugging ──▶ 遇 bug 时假设验证             │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              阶段 3: 提交                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  git commit 触发 Pre-commit Hooks:                                               │
│  code-simplifier (自动简化) → format-check → type-check → quality-check          │
│         → architecture-guard → i18n-sync → test-related                          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              阶段 4: 审查                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  /superpowers:requesting-code-review ──▶ 主动请求审查                            │
│         │                                                                        │
│         ▼                                                                        │
│  专项 Agents (按需):                                                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐  │
│  │ code-reviewer-  │ │ threat-modeler- │ │ frontend-       │ │ performance-  │  │
│  │ frontier-v2     │ │ frontier        │ │ security-coder  │ │ engineer      │  │
│  │ API/安全变更     │ │ 新增写操作       │ │ CSP/XSS         │ │ Lighthouse    │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ └───────────────┘  │
│                              │                                                   │
│                              ▼                                                   │
│                    ui-visual-validator ──▶ 截图分析验证 UI                       │
│         │                                                                        │
│         ▼                                                                        │
│  /superpowers:receiving-code-review ──▶ 响应反馈、技术验证、非盲从                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              阶段 5: 验证 & 完成                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  /superpowers:verification-before-completion ⚠️ 声称完成前必用                   │
│         │                                                                        │
│         ▼                                                                        │
│  /superpowers:finishing-a-development-branch ──▶ merge / PR / cleanup            │
│         │                                                                        │
│         ▼                                                                        │
│  /pr ──▶ 创建 PR、推送远程                                                       │
│         │                                                                        │
│         ▼                                                                        │
│  Pre-push Hooks: build → translation → quality-gate → arch → security           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 关键路径

```
完整开发:
  brainstorming → writing-plans → using-git-worktrees
       ↓
  verification-first → TDD/evaluator-optimizer → commit (code-simplifier)
       ↓
  requesting-code-review → [专项 agents] → receiving-code-review
       ↓
  verification-before-completion → finishing-a-development-branch → /pr
```

---

## 触发规则

| 阶段 | 必用 | 按需 |
|------|------|------|
| **规划** | `brainstorming` | `writing-plans`, `using-git-worktrees` |
| **执行** | `verification-first` (自动) | `TDD`, `evaluator-optimizer`, `debugging` |
| **提交** | `code-simplifier` (自动) | — |
| **审查** | `requesting-code-review` | 专项 agents |
| **完成** | `verification-before-completion` | `finishing-a-development-branch`, `/pr` |

---

## Skills 分类速查

### Superpowers 核心流程
| Skill | 作用 | 阶段 |
|-------|------|------|
| `brainstorming` | 需求探索 ⚠️ 创作前必用 | 规划 |
| `writing-plans` | 写实现计划 | 规划 |
| `executing-plans` | 执行计划（新会话） | 执行 |
| `subagent-driven-development` | 子代理驱动（当前会话） | 执行 |
| `dispatching-parallel-agents` | 并行任务分发 | 执行 |
| `test-driven-development` | TDD 先写测试 | 执行 |
| `systematic-debugging` | 系统化调试 | 执行 |
| `requesting-code-review` | 请求审查 | 审查 |
| `receiving-code-review` | 响应审查反馈 | 审查 |
| `verification-before-completion` | 完成前验证 ⚠️ 必用 | 验证 |
| `using-git-worktrees` | 隔离开发环境 | 分支 |
| `finishing-a-development-branch` | 完成分支决策 | 分支 |

### 项目本地
| 名称 | 类型 | 作用 | 阶段 |
|------|------|------|------|
| `verification-first` | Skill | 验证优先代码生成 | 执行 |
| `evaluator-optimizer` | Skill | 生成-评估-迭代 | 执行 |
| `code-simplifier` | Hook | 自动简化代码 | 提交 |
| `integrated-workflow` | Skill | 整合工作流启动 | 入口 |
| `afk` | Skill | 无人值守模式 | 入口 |
| `pr` | Skill | 创建 PR | 提交 |

### 领域 Skills
| 类别 | Skills |
|------|--------|
| 设计 | `frontend-design`, `landing-page-designer`, `ui-ux-pro-max`, `Layout Designer` |
| 文案 | `copywriting`, `page-cro`, `product-marketing-context` |
| Next.js | `next-best-practices`, `next-cache-components`, `next-upgrade` |
| React | `vercel-react-best-practices`, `vercel-composition-patterns` |
| 样式 | `tailwind-v4-shadcn`, `tailwindcss-animations` |
| 文档 | `pdf`, `docx`, `pptx`, `xlsx` |
| 其他 | `find-skills`, `terminal-title`, `web-design-guidelines` |

---

## Agents 分类速查

### 系统内置
| Agent | 作用 | 触发场景 |
|-------|------|----------|
| `Explore` | 代码库探索 | 搜索代码/理解结构 |
| `Plan` | 架构规划 | 设计实现方案 |
| `general-purpose` | 通用任务 | 复杂多步骤 |
| `claude-code-guide` | Claude Code 帮助 | 问功能用法 |

### PR Review Toolkit
| Agent | 作用 | 触发场景 |
|-------|------|----------|
| `code-reviewer` | 规范/风格检查 | PR 审查 |
| `code-simplifier` | 代码简化 | 重构 |
| `comment-analyzer` | 注释准确性 | 审查文档注释 |
| `pr-test-analyzer` | 测试覆盖 | PR 测试审查 |
| `silent-failure-hunter` | 静默失败检测 | 错误处理审查 |
| `type-design-analyzer` | 类型设计 | 新增类型时 |

### 项目自定义
| Agent | 作用 | 触发场景 |
|-------|------|----------|
| `code-reviewer-frontier-v2` | 生产安全审查 | API/安全变更 |
| `frontend-security-coder-frontier` | XSS/CSP 落地 | 安全头/脚本变更 |
| `performance-engineer-frontier` | 性能工程 | Lighthouse 回归 |
| `threat-modeler-frontier` | 威胁建模 | 新增写操作 API |
| `ui-visual-validator` | UI 视觉验证 | UI 变更 |

---

## 高频场景速查

| 场景 | 推荐路径 |
|------|----------|
| 写新页面/组件 | `brainstorming` → `frontend-design` → `verification-first` |
| 落地页 | `brainstorming` → `landing-page-designer` |
| 调 bug | `systematic-debugging` → `verification-before-completion` |
| 写功能 | `brainstorming` → `writing-plans` → `TDD` |
| 改 Next.js | `next-best-practices` → `verification-first` |
| 升级 Next.js | `next-upgrade` |
| 样式问题 | `tailwind-v4-shadcn` |
| 提 PR | `verification-before-completion` → `finishing-a-development-branch` → `/pr` |
| 复杂任务 | `/integrated-workflow` 或 `writing-plans` |
| 离开执行 | `/afk` |
| 不知道用啥 | `/find-skills` |

---

## 反馈循环

```
Agent 犯错 → 记录到 CLAUDE.md Error-Driven Rules
                    ↓
             下次执行时检查规则
                    ↓
         verification-first 验证是否违反
                    ↓
         evaluator-optimizer 迭代修复
```

规则格式：`[日期] 规则 —— 来源`

示例：
```markdown
### TypeScript
- [2026-02-01] 禁止嵌套三元表达式 —— ProductCard 审查
```
