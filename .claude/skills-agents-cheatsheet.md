# Skills & Agents 完整工作流

## 工作流全景图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 入口选择                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│   用户需求 ──┬──▶ /afk ──▶ 无人值守模式（自主决策，阻塞标记）                      │
│              ├──▶ /superpowers:brainstorming ──▶ 完整 BDD 流程                   │
│              └──▶ 直接执行 ──▶ 单个 skill/agent                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    阶段 1: Discovery — 探索与规格化                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│  /superpowers:brainstorming ──▶ 探索意图、输出 bdd-specs.md                      │
│         │                       (Given/When/Then 场景规格)                       │
│         ▼                                                                        │
│  /superpowers:writing-plans ──▶ 1 scenario = 2 tasks (Red + Green)              │
│         │                       生成 plan 目录 + task 文件                       │
│         └──▶ 领域 Skill 注入（/next-best-practices, /frontend-design 等）        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    阶段 2: Automation — BDD 执行                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  执行模式选择（executing-plans 自动决策）:                                        │
│  ┌───────────────────────────────┐  ┌─────────────────────────────┐             │
│  │ Agent Team（默认，≥3 并行流）  │  │ Subagent Parallel           │             │
│  │ 多代理协作 + 通信              │  │ 独立任务并行                  │             │
│  └───────────────────────────────┘  └─────────────────────────────┘             │
│  ┌───────────────────────────────┐                                              │
│  │ Linear（回退模式）             │                                              │
│  │ 逐 task 串行执行               │                                              │
│  └───────────────────────────────┘                                              │
│         │                                                                        │
│         ▼                                                                        │
│  behavior-driven-development (自动加载)                                          │
│         │                                                                        │
│         ├──▶ Red: 写失败测试（映射 bdd-specs.md 场景）                           │
│         ├──▶ Green: 最小实现使测试通过                                           │
│         └──▶ Refactor: 清理代码，测试保持绿色                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    阶段 3: Review — 代码审查                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│  /review:hierarchical ──▶ 多代理层级审查                                        │
│         │                                                                        │
│         ├── @tech-lead-reviewer (协调者，风险范围界定)                            │
│         ├── @code-reviewer (代码质量)                                            │
│         ├── @security-reviewer (安全，参考 review-checklist.md)                  │
│         └── @ux-reviewer (用户体验)                                              │
│                                                                                  │
│  /review:quick ──▶ 精简审查（tech-lead 按需选择专项代理）                        │
│                                                                                  │
│  辅助: ui-visual-validator ──▶ 截图分析验证 UI                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    阶段 4: Commit & Finish — 提交与完成                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│  git commit ──▶ Pre-commit Hooks 自动执行                                       │
│         │       format-check → type-check → quality-check                       │
│         │       → architecture-guard → i18n-sync → test-related                 │
│         │                                                                        │
│         │  提交格式: type(scope): desc (≤50 chars)                              │
│         │            body: 必须，bullet points                                   │
│         │            footer: Co-Authored-By 必须                                 │
│         ▼                                                                        │
│  /gitflow:finish-feature ──▶ 测试 + CHANGELOG + merge 到 develop               │
│         │                                                                        │
│         ▼                                                                        │
│  /pr ──▶ 推送远程 + 创建 PR (base=develop) + 自动合并                           │
│         │                                                                        │
│         ▼                                                                        │
│  Pre-push Hooks: build → translation → quality-gate → arch → security           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## GitFlow 分支模型

```
main (生产发布) ◄── release/* / hotfix/*
  │
develop (开发主分支) ◄── feature/*
  │
feature/* ──▶ gitflow:start-feature 创建
           ──▶ gitflow:finish-feature 合并回 develop
           ──▶ /pr 创建 PR (base=develop)
```

| 分支类型 | 从哪创建 | 合并到 | 命令 |
|----------|---------|--------|------|
| `feature/*` | develop | develop | `start-feature` / `finish-feature` |
| `hotfix/*` | main | main + develop | `start-hotfix` / `finish-hotfix` |
| `release/*` | develop | main + develop | `start-release` / `finish-release` |

---

## BDD 可追溯链

```
bdd-specs.md (Given/When/Then)
       ↓
task 文件引用 scenario
       ↓
测试映射 scenario (Red)
       ↓
实现通过测试 (Green)
       ↓
重构保持绿色 (Refactor)
```

每一层都可追溯到上一层。测试不是凭空写的，而是从 BDD 规格派生。

---

## 关键路径

```
完整开发:
  gitflow:start-feature → brainstorming → bdd-specs.md → writing-plans → task 文件
       ↓
  executing-plans → BDD (Red-Green-Refactor) → commit
       ↓
  review:hierarchical → gitflow:finish-feature → /pr
```

---

## 触发规则

| 阶段 | 必用 | 按需 |
|------|------|------|
| **分支** | `gitflow:start-feature` | — |
| **探索** | `brainstorming` | — |
| **规划** | `writing-plans` | — |
| **执行** | `behavior-driven-development` (自动) | `agent-team-driven-development` |
| **调试** | — | `systematic-debugging` |
| **审查** | `review:hierarchical` | `review:quick`, `ui-visual-validator` |
| **完成** | `gitflow:finish-feature` | `/pr` |

---

## Skills 分类速查

### Superpowers 核心流程 (BDD)
| Skill | 作用 | 阶段 |
|-------|------|------|
| `brainstorming` | 需求探索，输出 bdd-specs.md | 探索 |
| `writing-plans` | 场景→任务映射 (1 scenario = 2 tasks) | 规划 |
| `executing-plans` | 批量执行 (Agent Team / Subagent / Linear) | 执行 |
| `behavior-driven-development` | Red-Green-Refactor 纪律 (自动加载) | 执行 |
| `agent-team-driven-development` | 多代理 Agent Team 协作 (自动加载) | 执行 |
| `systematic-debugging` | 4 阶段: 根因→模式→假设→修复 | 调试 |

### Review 插件
| Skill | 作用 | 阶段 |
|-------|------|------|
| `review:hierarchical` | 多代理层级审查 (tech-lead → code/security/ux) | 审查 |
| `review:quick` | 精简审查 (tech-lead 按需选择专项) | 审查 |

### Gitflow 插件
| Skill | 作用 | 阶段 |
|-------|------|------|
| `gitflow:start-feature` | 从 develop 创建 feature/* 分支 | 分支 |
| `gitflow:finish-feature` | 测试 + CHANGELOG + merge 到 develop | 完成 |
| `gitflow:start-hotfix` | 从 main 创建 hotfix/* 分支 | 分支 |
| `gitflow:finish-hotfix` | merge 到 main + develop | 完成 |
| `gitflow:start-release` | 从 develop 创建 release/* 分支 | 分支 |
| `gitflow:finish-release` | merge 到 main + develop | 完成 |

### 项目本地
| 名称 | 类型 | 作用 | 阶段 |
|------|------|------|------|
| `afk` | Command | 无人值守模式 | 入口 |
| `pr` | Command | 创建 PR (base=develop) | 提交 |
| `cwf` | Command | 文案工作流 | 入口 |
| `dwf` | Command | 设计工作流 | 入口 |

### 领域 Skills
| 类别 | Skills |
|------|--------|
| 设计 | `frontend-design`, `landing-page-designer`, `ui-ux-pro-max`, `design-motion-principles` |
| 文案 | `copywriting`, `page-cro`, `product-marketing-context` |
| Next.js | `next-best-practices`, `next-cache-components`, `next-upgrade` |
| React | `vercel-react-best-practices`, `vercel-composition-patterns` |
| 样式 | `tailwind-v4-shadcn`, `tailwindcss-animations`, `shadcn-ui` |
| SEO | `seo-audit`, `seo-geo`, `schema-markup` |
| 文档 | `pdf`, `docx`, `pptx`, `xlsx` |
| 其他 | `find-skills`, `web-design-guidelines` |

---

## Agents 分类速查

### Review 插件代理 (FradSer)
| Agent | 作用 | 模型 |
|-------|------|------|
| `tech-lead-reviewer` | 风险范围界定 + 协调 | Sonnet |
| `code-reviewer` | 代码质量审查 | Sonnet |
| `security-reviewer` | 安全审查 (参考 review-checklist.md) | Sonnet |
| `ux-reviewer` | 用户体验审查 | Sonnet |

### 项目自定义
| Agent | 作用 | 触发场景 |
|-------|------|----------|
| `ui-visual-validator` | UI 视觉验证 (截图分析) | UI 变更 |

### 系统内置
| Agent | 作用 | 触发场景 |
|-------|------|----------|
| `Explore` | 代码库探索 | 搜索代码/理解结构 |
| `Plan` | 架构规划 | 设计实现方案 |
| `general-purpose` | 通用任务 | 复杂多步骤 |
| `claude-code-guide` | Claude Code 帮助 | 问功能用法 |

### PR Review Toolkit (内置插件)
| Agent | 作用 | 触发场景 |
|-------|------|----------|
| `code-reviewer` | 规范/风格检查 | PR 审查 |
| `code-simplifier` | 代码简化 | 重构 |
| `comment-analyzer` | 注释准确性 | 审查文档注释 |
| `pr-test-analyzer` | 测试覆盖 | PR 测试审查 |
| `silent-failure-hunter` | 静默失败检测 | 错误处理审查 |
| `type-design-analyzer` | 类型设计 | 新增类型时 |

---

## 高频场景速查

| 场景 | 推荐路径 |
|------|----------|
| 开始新功能 | `gitflow:start-feature` → `brainstorming` → `writing-plans` → `executing-plans` |
| 写新页面/组件 | `brainstorming` → `frontend-design` → BDD 执行 |
| 落地页 | `brainstorming` → `landing-page-designer` → BDD 执行 |
| 调 bug | `systematic-debugging` (4 阶段) → 写失败测试 → 修复 → 绿色 |
| 改 Next.js | `next-best-practices` → BDD 执行 |
| 升级 Next.js | `next-upgrade` |
| 样式问题 | `tailwind-v4-shadcn` |
| 代码审查 | `review:hierarchical` 或 `review:quick` |
| 提 PR | `gitflow:finish-feature` → `/pr` |
| 紧急修复 | `gitflow:start-hotfix` → 修复 → `gitflow:finish-hotfix` |
| 复杂多人 | `agent-team-driven-development` |
| 离开执行 | `/afk` |
| 不知道用啥 | `/find-skills` |

---

## 提交规范

```
<type>(<scope>): <description>         ≤50 chars, lowercase, imperative

- Bullet point 1                       body 必须, ≤72 chars/line
- Bullet point 2

Co-Authored-By: <Model Name> <noreply@anthropic.com>    footer 必须
```

Types: `feat` | `fix` | `refactor` | `docs` | `test` | `chore` | `perf` | `build` | `ci` | `style`
Breaking: `feat(api)!: description`

---

## 质量保障层次

```
BDD 链 (brainstorming → specs → tests → implementation)
    ↓  确保每个功能都有对应测试
Pre-commit Hooks (format + type-check + quality + arch + i18n)
    ↓  确保代码质量门禁
review:hierarchical (tech-lead + code + security + ux)
    ↓  确保多维度审查 (参考 review-checklist.md)
Pre-push Hooks (build + translation + quality-gate + security)
    ↓  确保可部署
pnpm ci:local (手动全量验证)
    ↓  PR 前最终确认
```

BDD 链 + Git Hooks + Review 插件构成三层质量保障，不需要额外的 CI 循环命令。

---

## 反馈循环

```
Agent 犯错 → 记录到 CLAUDE.md Error-Driven Rules
                    ↓
             下次执行时检查规则
                    ↓
         BDD specs 包含边界场景
                    ↓
         测试覆盖防止回归
```

规则格式：`[日期] 规则 —— 来源`
