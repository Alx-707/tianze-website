# GSD (Get-Shit-Done) Agent Workflow 系统深度调研

**调研时间**: 2026-02-23
**模式**: deep
**置信度**: 0.92
**搜索轮次**: 8
**Hop 深度**: 3（README -> 源码 -> 参考文档）

---

## 执行摘要

GSD 是一个专为 Claude Code 设计的元提示词（meta-prompting）+ 上下文工程（context engineering）系统，核心创新是用**多智能体并行编排**解决 AI 编程的"上下文腐烂"问题。每个执行单元在独立的 200k token 上下文中运行，主会话始终保持在 30-40% 的上下文占用，使第 50 个任务的质量与第 1 个任务相同。

仓库地址：[gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done)

---

## 一、整体架构设计

### 1.1 核心设计理念

GSD 将复杂性封装在系统内部，对用户暴露简洁的命令界面：

```
用户看到：几个 /gsd:xxx 命令
系统内部：上下文工程 + XML 提示词格式化 + 子智能体编排 + 状态管理
```

三个关键机制：

- **Fresh Context Per Task**：每个执行子智能体获得全新的 200k token 上下文，避免上下文腐烂
- **XML Plan Format**：所有计划用结构化 XML 描述，包含 name/files/action/verify/done 五个必填节，充分利用 Claude 的指令跟随能力
- **Orchestrator-Thin Pattern**：编排器（Orchestrator）轻量，只做发现/分组/派发/收集；繁重的工作全部交给子智能体在新鲜上下文中完成

### 1.2 文件结构

```
get-shit-done/
├── agents/                  # 11 个专职 Agent 定义（.md 格式）
├── commands/gsd/            # 31 个用户命令（Claude Code slash commands）
├── get-shit-done/
│   ├── workflows/           # 32 个工作流定义（对应 commands/）
│   ├── templates/           # 25 个文档模板（STATE.md、PLAN.md 等）
│   └── references/         # 13 个参考规范（checkpoint、TDD、git 等）
├── hooks/                   # 3 个 Claude Code Hook 脚本（JS）
├── bin/                     # 安装器和 CLI 工具
├── scripts/                 # 自动化脚本
└── tests/                   # 测试套件

项目运行时产物（用户项目目录内）：
.planning/
├── config.json              # 工作流偏好配置
├── PROJECT.md               # 项目愿景（永久上下文）
├── REQUIREMENTS.md          # 需求（含阶段追溯）
├── ROADMAP.md               # 路线图 + 进度
├── STATE.md                 # 跨会话状态记忆（上限 100 行）
├── research/                # 项目研究文件
├── phases/{N}/              # 各阶段产物
│   ├── PLAN.md              # 执行计划（XML 结构）
│   ├── SUMMARY.md           # 执行摘要
│   └── VERIFICATION.md      # 验证报告
├── debug/                   # 调试会话状态
├── todos/                   # Pending 想法收集
└── quick/                   # 快速任务追踪
```

### 1.3 上下文质量曲线（核心洞察）

GSD 的架构设计基于对 Claude 上下文质量退化规律的观察：

| 上下文占用 | 质量状态 |
|------------|----------|
| 0 - 30%   | 峰值质量 |
| 30 - 50%  | 良好，执行主流程 |
| 50 - 70%  | 效率模式，开始压缩 |
| 70%+      | 差：幻觉、遗忘需求、drift |

对策：编排器主会话常驻 30-40%，重工作全部 offload 到子智能体的新鲜上下文。

---

## 二、Agent 定义与分类

### 2.1 Agent 完整清单（11 个）

所有 Agent 以 Markdown 文件形式定义，存于 `agents/` 目录。

#### 规划族（Planning Cluster）

| Agent | 文件 | 核心职责 | 可用工具 | 模型配置（Balanced Profile） |
|-------|------|---------|---------|------------------------------|
| gsd-planner | gsd-planner.md | 将阶段分解为 2-3 个原子计划，构建依赖图，最大化并行 | Read, Write, Bash, Glob, Grep, WebFetch, Context7 MCP | Opus |
| gsd-plan-checker | gsd-plan-checker.md | 执行前验证计划的完备性（8 个维度） | Read, Bash, Grep | Sonnet |
| gsd-roadmapper | gsd-roadmapper.md | 从需求推导阶段路线图，不允许凭空假设结构 | Read, Write | Sonnet |
| gsd-research-synthesizer | gsd-research-synthesizer.md | 综合 4 个并行 Researcher 的输出为统一 SUMMARY.md | Read, Write | Sonnet |

#### 研究族（Research Cluster）

| Agent | 核心职责 | 工具 |
|-------|---------|------|
| gsd-project-researcher | 项目启动时的领域生态调研，产出 STACK/FEATURES/ARCHITECTURE/PITFALLS.md | Context7, WebFetch, WebSearch |
| gsd-phase-researcher | 单阶段执行前的技术调研，回答"规划这个阶段需要了解什么" | Context7, WebFetch, WebSearch |
| gsd-codebase-mapper | 分析现有代码库（tech/arch/quality/concerns 四种 focus 模式） | Read, Bash, Grep, Glob |

#### 执行族（Execution Cluster）

| Agent | 核心职责 | 工具 |
|-------|---------|------|
| gsd-executor | 原子执行 PLAN.md，每个任务独立 commit，处理偏差，产出 SUMMARY.md | Read, Write, Edit, Bash, Grep, Glob |
| gsd-debugger | 科学方法调试，基于文件的会话持久化，可跨 /clear 恢复 | Read, Write, Bash, Grep |

#### 验证族（Verification Cluster）

| Agent | 核心职责 | 工具 |
|-------|---------|------|
| gsd-verifier | 阶段目标验证（目标后推法），检查真实实现而非 SUMMARY 声明 | Read, Bash, Grep, Glob |
| gsd-integration-checker | 跨阶段集成验证，"存在 != 集成"，追踪 export-import 链路 | Read, Bash, Grep, Glob |

### 2.2 协作方式

Agent 通过 Claude Code 的 `Task` 工具实例化：

```
命令（Command） → 工作流（Workflow） → 编排器逻辑（内联） → Task 工具派发 → Agent（新上下文）
```

Agent 之间不直接通信，通过**共享文件系统**传递结果：
- 规划产物写入 `.planning/phases/{N}/PLAN.md`
- 执行产物写入 `.planning/phases/{N}/SUMMARY.md`
- 状态持久化到 `STATE.md`（上限 100 行，设计为"读一遍就知道在哪"）

---

## 三、Skill 系统

### 3.1 设计形态

GSD 没有独立的"Skill 注册表"机制，取而代之的是**项目级 `.agents/skills/` 目录**约定：

```
.agents/
└── skills/
    ├── {skill-name}/
    │   ├── SKILL.md     # 轻量索引文件（~130 行），供 Agent 快速扫描
    │   └── AGENTS.md    # 完整实现细节（避免加载，上下文代价高）
```

### 3.2 调用机制

所有 Agent 定义中都包含相同的发现规则：

```
1. 加载 ./CLAUDE.md（项目规范）
2. 检查 .agents/skills/ 目录
3. 读取 SKILL.md 轻量索引（~130 行）
4. 仅在需要时读取完整 AGENTS.md
```

设计原则：用轻量 SKILL.md 代替完整文档，减少上下文消耗。SKILL.md 是目录，AGENTS.md 是书。

### 3.3 与 Agent 的关系

Skill 是项目特定的实现模式（patterns），Agent 是系统内置的角色（roles）。一个 gsd-planner Agent 可以通过读取不同 Skill 来适应不同技术栈，无需修改 Agent 定义本身。

---

## 四、Workflow 编排

### 4.1 整体主流程（Discuss → Plan → Execute → Verify）

```
/gsd:new-project
    ├── 配置问卷（config.json 生成）
    ├── [可选] gsd-project-researcher × 4 个并行（STACK/FEATURES/ARCH/PITFALLS）
    ├── gsd-research-synthesizer（综合 → SUMMARY.md）
    ├── 需求提取（→ REQUIREMENTS.md）
    └── gsd-roadmapper（→ ROADMAP.md + STATE.md）

/gsd:discuss-phase N
    └── 交互式决策采集（→ CONTEXT.md）

/gsd:plan-phase N
    ├── [可选] gsd-phase-researcher（→ RESEARCH.md）
    ├── gsd-planner（→ PLAN.md × N 个，含依赖图 + Wave 分组）
    └── gsd-plan-checker（验证循环，直到通过或达最大迭代次数）

/gsd:execute-phase N
    └── 按 Wave 顺序执行：
        Wave 1: [Plan-A, Plan-B, Plan-C] 并行 → gsd-executor × 3
        Wave 2: [Plan-D] 等待 Wave 1 完成后执行
        ...

/gsd:verify-work N
    ├── gsd-verifier（目标后推法验证，产出 VERIFICATION.md）
    └── [失败时] gsd-debugger → 诊断报告 → 重新规划修复计划
```

### 4.2 Wave 执行模型（DAG 实现）

Wave 是 GSD 的核心并行机制，本质是依赖图的拓扑分层：

```
依赖图分析：
- 无依赖的计划 → Wave 1（并行根节点）
- 仅依赖 Wave N-1 的计划 → Wave N
- 共享文件所有权的计划 → 强制顺序执行

最大并发智能体数：3（config.json 可配）
最小触发并行数：2 个计划
```

每个计划（Plan）包含 YAML 前置元数据：

```yaml
phase: 1
plan: "auth-api"
wave: 1
depends_on: []          # 依赖哪些 plan 先完成
files_modified: [...]   # 声明文件所有权，防止并发冲突
autonomous: true        # 是否自主执行
```

### 4.3 计划粒度控制（Nyquist 法则）

计划的任务数和大小受到严格限制：

| 维度 | 限制 | 触发分割条件 |
|------|------|-------------|
| 每计划任务数 | 2-3 个 | 超过 3 个 → 必须拆分 |
| 每任务修改文件数 | <5 个 | 超过 5 → 拆分 |
| 上下文预算 | ~50% | 超过 → 拆分 |
| 理想执行时长 | 15-60 分钟 | 超过 → 拆分 |

TDD 计划的上下文预算收紧到 40%（因 Red-Green-Refactor 循环消耗更多计算）。

### 4.4 三种执行模式（Pattern A/B/C）

根据计划中的 Checkpoint 类型，自动选择执行模式：

| 模式 | 触发条件 | 执行方式 |
|------|---------|---------|
| Pattern A（自主） | 无 Checkpoint | 派发子智能体，全程自动 |
| Pattern B（分段） | 仅含 human-verify | 子智能体执行段落，每个 verify checkpoint 暂停返主 |
| Pattern C（主上下文） | 含 decision checkpoint | 在主会话内执行，用户可实时决策 |

---

## 五、配置机制

### 5.1 主配置文件：`.planning/config.json`

```json
{
  "mode": "interactive",
  "depth": "standard",
  "workflow": {
    "research": true,         // 是否执行研究阶段
    "plan_check": true,       // 是否启用计划校验
    "verifier": true,         // 是否启用验证阶段
    "auto_advance": false,    // 是否自动推进（跳过人工门控）
    "nyquist_validation": false  // 是否强制任务级自动化验证
  },
  "planning": {
    "commit_docs": true,      // 是否 commit 规划文档
    "search_gitignored": false
  },
  "parallelization": {
    "enabled": true,
    "plan_level": true,
    "task_level": false,
    "skip_checkpoints": true,
    "max_concurrent_agents": 3,
    "min_plans_for_parallel": 2
  },
  "gates": {
    "confirm_project": true,
    "confirm_phases": true,
    "confirm_roadmap": true,
    "confirm_breakdown": true,
    "confirm_plan": true,
    "execute_next_plan": true,
    "issues_review": true,
    "confirm_transition": true
  },
  "safety": {
    "always_confirm_destructive": true,
    "always_confirm_external_services": true
  }
}
```

### 5.2 模型配置：三种 Profile

用 `/gsd:set-profile <profile>` 或 `config.json` 中的 `model_profile` 切换：

| Agent | Quality Profile | Balanced Profile（默认） | Budget Profile |
|-------|----------------|--------------------------|----------------|
| gsd-planner | Opus | Opus | Sonnet |
| gsd-executor | Opus | Sonnet | Sonnet |
| gsd-phase-researcher | Opus | Sonnet | Haiku |
| gsd-verifier | Sonnet | Sonnet | Haiku |
| gsd-plan-checker | Sonnet | Sonnet | Haiku |

设计理由：规划（planner）做架构决策，代价最高，用 Opus；执行（executor）按计划行事，Sonnet 足够；验证需要推理能力，不能用 Haiku。

技术细节：Opus 级 Agent 在 Task 调用中解析为 `"inherit"`（而非硬编码 `"opus"`），兼容组织级别的模型访问策略。

### 5.3 Git 分支策略配置

```json
"branching_strategy": "none" | "phase" | "milestone"
```

| 策略 | 行为 |
|------|------|
| none（默认） | 全部提交到当前分支 |
| phase | 每个阶段创建独立分支，用户手动合并 |
| milestone | 一个分支覆盖所有阶段，里程碑完成时合并 |

---

## 六、与 Claude Code CLI 的集成

### 6.1 Slash Commands（核心集成点）

GSD 通过 Claude Code 的自定义命令（Custom Commands）机制接入，命令文件放在 `commands/gsd/` 目录：

```
/gsd:new-project [--auto]
/gsd:discuss-phase [N] [--auto]
/gsd:plan-phase [N] [--auto] [--research] [--skip-research] [--gaps]
/gsd:execute-phase <N> [--gaps-only]
/gsd:verify-work [N]
/gsd:quick
/gsd:progress
/gsd:debug
/gsd:map-codebase
/gsd:update
/gsd:set-profile <quality|balanced|budget>
...（共 31 个命令）
```

安装后，命令文件被放入 `~/.claude/commands/gsd/`（全局）或 `.claude/commands/gsd/`（项目级）。

### 6.2 Claude Code Hooks（3 个 PostToolUse Hook）

```
hooks/
├── gsd-context-monitor.js   # 上下文监控
├── gsd-statusline.js        # 状态栏渲染
└── gsd-check-update.js      # 版本更新检查
```

**gsd-context-monitor.js**（最关键）：
- 类型：PostToolUse Hook
- 作用：每次工具调用后，读取上下文使用率并注入警告到 `additionalContext`
- 阈值：≤35% 剩余 → WARNING；≤25% 剩余 → CRITICAL（强制停止）
- 防抖：两次警告之间最少间隔 5 次工具调用（但 WARNING→CRITICAL 升级不受此限）
- 特殊：80% 真实使用 = 100% 显示（因 Claude Code 强制限制在 80%）

**gsd-statusline.js**：
- 渲染实时状态栏（ANSI 颜色编码）
- 显示：模型名 + 当前任务 + 目录 + 上下文进度条 + 更新提示
- 上下文进度条：10 格，绿/黄/橙/红（骷髅+闪烁 @ 95%+）
- 将指标写入 `/tmp/claude-ctx-{session_id}.json` 供监控 Hook 读取

**gsd-check-update.js**：
- 后台进程（detached + unref），不阻塞主会话
- 查询 npm registry 对比版本
- 结果缓存到 `~/.claude/cache/gsd-update-check.json`

### 6.3 MCP 集成

gsd-planner 和 gsd-phase-researcher 在 Tools 权限中包含 `mcp__context7__*`，即直接调用 Context7 MCP 服务器获取准确的库文档（避免幻觉版本）。

### 6.4 推荐运行参数

官方建议使用 `--dangerously-skip-permissions` 启动 Claude Code，避免在 git/date/echo 等实用命令上触发审批弹窗，保持自动化流畅。

---

## 七、独特设计理念

### 7.1 "上下文腐烂"是一等公民问题

GSD 是目前少数将"上下文质量退化"作为核心架构约束的系统。其他框架（BMAD、SpecKit、Taskmaster）在单一上下文中执行全生命周期，GSD 将其拆分成独立会话。

### 7.2 编排器 - 子智能体资源分配

```
编排器主会话：~15% 上下文（协调）
每个子智能体：100% 新鲜上下文（执行）
```

这种分配使"第 50 个任务的质量 = 第 1 个任务的质量"成为可能。

### 7.3 "目标后推法"（Goal-Backward）贯穿全系统

GSD 在三个层面都用 Goal-Backward 替代传统的 Task-Forward 思维：

- **Roadmapper**：从用户可观察行为 → 必要交付物，而不是先列任务
- **Planner**：Must-Haves 四步法（观察真相 → 必要产物 → 必要接线 → 关键断点）
- **Verifier**：检验"阶段是否真正交付了承诺的结果"，而非"任务是否打勾"

### 7.4 文件即状态（File-as-State）

GSD 通过文件系统实现跨会话持久性：
- STATE.md：整个项目的记忆（≤100 行约束确保可读）
- `.planning/debug/` 中的 Debug 文件：调试会话的"大脑"，用不可变 + 追加 + 覆盖三种写入模式维护认知一致性
- agent-history.json：Agent 执行历史（最多 50 条，FIFO 淘汰）

### 7.5 偏差处理的 4 规则

执行时遇到计划外情况，Executor 遵循严格规则而非随意发挥：

| 规则 | 触发条件 | 处理方式 |
|------|---------|---------|
| Rule 1 | 损坏行为/错误/错误输出 | 自动修复 |
| Rule 2 | 缺失的关键功能（验证、安全） | 自动补充 |
| Rule 3 | 阻塞当前任务的问题 | 自动修复 |
| Rule 4 | 需要结构性修改的问题 | 停止，返回 Checkpoint |

连续 3 次自动修复失败 → 停止，记录文档，不再尝试。

### 7.6 原子提交哲学

"提交成果，不提交过程"：
- PLAN.md、RESEARCH.md、DISCOVERY.md：不提交（中间产物）
- 每个任务完成：单独 commit（`feat(1-auth): add login endpoint`）
- 每个计划完成：元数据 commit（SUMMARY.md + STATE.md）

好处：Git history 即变更日志，`git bisect` 精确定位失败任务，每个任务独立可回滚。

### 7.7 Solo Developer + Claude 的设计哲学

GSD 明确面向"solo developer + AI 助手"的工作模式，彻底移除了企业项目管理痕迹：

> "从不包含团队协调、干系人管理、Sprint 仪式、文档表演的阶段"（来自 gsd-roadmapper 定义）

这也体现在 Checkpoint 设计上——99% 的工作应该可以自动化，Checkpoint 只用于：人工验证（90%）、方向决策（9%）、无法绕过的手动操作（1%，如短信验证码）。

---

## 八、与其他框架的对比定位

| 维度 | GSD | BMAD/SpecKit | Taskmaster |
|------|-----|-------------|------------|
| 上下文策略 | 多 Agent，各自新鲜上下文 | 单上下文全程 | 单上下文 |
| 任务粒度 | 极细（2-3 任务/计划） | 粗 | 中等 |
| 并行执行 | Wave 级并行（最多 3 并发） | 无 | 有限 |
| 人工门控 | 精细可配（8 个 Gate） | 较少 | 较少 |
| 复杂度感知 | 在系统中 | 在用户流程中 | 混合 |
| 面向用户 | Solo dev / 初创 | 企业团队 | 个人 |
| 运行时支持 | Claude Code + OpenCode + Gemini CLI | Claude Code | Claude Code |

---

## 九、信息缺口

以下内容在公开源码中未完全暴露，标注为待验证：

1. **`gsd-tools` CLI**：多处引用 `gsd-tools init`、`gsd-tools commit` 等命令，但未在仓库中找到完整实现。可能是独立包或在 `bin/` 中。[⚠️ 建议实测验证]
2. **Nyquist Validation 的具体实现**：文档提及"每个任务必须有 `<automated>` 验证元素"，但启用/禁用的实际行为未完全明确。[⚠️ 建议实测验证]
3. **OpenCode / Gemini CLI 的适配差异**：README 提及支持三种运行时，但具体适配文件未见。

---

## 来源分级汇总

### Tier 1（一手官方）

- [GitHub 仓库 gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) — README、源码
- [agents/gsd-executor.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/agents/gsd-executor.md)
- [agents/gsd-planner.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/agents/gsd-planner.md)
- [agents/gsd-verifier.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/agents/gsd-verifier.md)
- [agents/gsd-debugger.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/agents/gsd-debugger.md)
- [agents/gsd-phase-researcher.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/agents/gsd-phase-researcher.md)
- [agents/gsd-plan-checker.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/agents/gsd-plan-checker.md)
- [agents/gsd-roadmapper.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/agents/gsd-roadmapper.md)
- [agents/gsd-research-synthesizer.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/agents/gsd-research-synthesizer.md)
- [agents/gsd-codebase-mapper.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/agents/gsd-codebase-mapper.md)
- [agents/gsd-integration-checker.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/agents/gsd-integration-checker.md)
- [agents/gsd-project-researcher.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/agents/gsd-project-researcher.md)
- [get-shit-done/templates/config.json](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/get-shit-done/templates/config.json)
- [get-shit-done/references/model-profiles.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/get-shit-done/references/model-profiles.md)
- [get-shit-done/references/checkpoints.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/get-shit-done/references/checkpoints.md)
- [get-shit-done/references/tdd.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/get-shit-done/references/tdd.md)
- [get-shit-done/references/git-integration.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/get-shit-done/references/git-integration.md)
- [get-shit-done/references/planning-config.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/get-shit-done/references/planning-config.md)
- [get-shit-done/references/verification-patterns.md](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/get-shit-done/references/verification-patterns.md)
- [hooks/gsd-context-monitor.js](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/hooks/gsd-context-monitor.js)
- [hooks/gsd-statusline.js](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/hooks/gsd-statusline.js)
- [hooks/gsd-check-update.js](https://raw.githubusercontent.com/gsd-build/get-shit-done/main/hooks/gsd-check-update.js)

### Tier 2（权威评论/技术媒体）

- [Beating context rot in Claude Code with GSD - The New Stack](https://thenewstack.io/beating-the-rot-and-getting-stuff-done/)
- [GSD Framework: Spec-Driven Development for Claude Code - ccforeveryone.com](https://ccforeveryone.com/gsd)
- [GSD Framework: The System Revolutionizing Development - pasqualepillitteri.it](https://pasqualepillitteri.it/en/news/169/gsd-framework-claude-code-ai-development)

### Tier 3（社区/博客）

- [I Tested GSD Claude Code - Medium](https://medium.com/@joe.njenga/i-tested-gsd-claude-code-meta-prompting-that-ships-faster-no-agile-bs-ca62aff18c04)
- [The Rise of "Get-Shit-Done" AI Product Frameworks - Neon Nook](https://neonnook.substack.com/p/the-rise-of-get-shit-done-ai-product)
