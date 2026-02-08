# 三层自主开发工作流 — 完整使用指南

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Kiro Spec (cc-sdd)  — 规划层                   │
│  结构化需求(EARS) → 技术设计 → 实现任务                    │
│  输出: .kiro/specs/<name>/{requirements,design,tasks}.md │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Ralph (/prd + /ralph)  — 桥接层                │
│  Spec 任务 → prd.json 可执行格式                          │
│  输出: scripts/ralph/prd.json                            │
├─────────────────────────────────────────────────────────┤
│  Layer 3: 执行层  — 两种模式                              │
│  A) Agent Team — 在线并行（交互式监督）                    │
│  B) ralph.sh  — AFK 串行（无人值守循环）                   │
└─────────────────────────────────────────────────────────┘
```

### 核心原则

- **Layer 1 决定做什么**（WHAT）— 需求用 EARS 格式，确保可测试
- **Layer 1 还决定怎么做**（HOW）— 设计文档定义架构和接口
- **Layer 2 翻译成执行单元** — 每个 Story 必须在一个上下文窗口内完成
- **Layer 3 负责执行** — Agent 无记忆，靠 git + prd.json + progress.txt 传递状态

---

## Layer 1: Kiro Spec-Driven Development（规划层）

### 1.0 前置：Steering（项目知识库）

Steering 是项目持久记忆，所有 Spec 生成都会加载它作为上下文。**建议在任何 Spec 之前先建立 Steering。**

```bash
# 首次：自动扫描项目，生成核心 steering 文件
/kiro:steering

# 生成自定义 steering（可选，按需创建）
/kiro:steering-custom api-standards
/kiro:steering-custom testing
/kiro:steering-custom security
```

**Steering 做什么：**
- **Bootstrap 模式**（首次运行）：扫描代码库，生成三个核心文件：
  - `product.md` — 产品目标、核心能力、用户类型
  - `tech.md` — 技术栈、框架版本、约定
  - `structure.md` — 项目结构、命名、导入模式
- **Sync 模式**（后续运行）：检测代码与 steering 的漂移，增量更新

**Steering 原则：**
- 记录**模式**而非清单（不要列出每个文件，描述组织模式）
- 如果新代码遵循现有模式，steering 不需要更新
- 每个 steering 文件控制在 100-200 行

**自定义 Steering 可用模板：**

| 模板 | 用途 |
|------|------|
| `api-standards` | REST/GraphQL 约定、错误处理 |
| `testing` | 测试组织、mock 策略、覆盖率 |
| `security` | 认证模式、输入验证 |
| `database` | Schema 设计、迁移、查询模式 |
| `error-handling` | 错误类型、日志、重试策略 |
| `authentication` | 认证流程、权限、会话管理 |
| `deployment` | CI/CD、环境、回滚 |

**输出位置：** `.kiro/steering/*.md`

---

### 1.1 初始化 Spec

```bash
/kiro:spec-init 添加产品筛选功能
```

**做什么：**
- 从描述生成 feature 名称（kebab-case）
- 创建目录 `.kiro/specs/<feature-name>/`
- 初始化 `spec.json`（元数据：语言、阶段、时间戳）
- 创建 `requirements.md` 骨架（含项目描述）
- **不会**生成需求、设计或任务

**输出示例：**
```
.kiro/specs/product-filter/
├── spec.json          # {"language":"zh","phase":"initialized",...}
└── requirements.md    # 含项目描述的骨架
```

**冲突处理：** 如果 feature 名已存在，自动追加数字后缀（如 `product-filter-2`）

**下一步提示：**
```bash
/kiro:spec-requirements product-filter
```

---

### 1.2 生成需求

```bash
/kiro:spec-requirements product-filter
```

**做什么：**
1. 加载 spec.json + requirements.md 中的项目描述
2. 加载**全部** `.kiro/steering/` 目录作为上下文
3. 读取 EARS 格式规则（`.kiro/settings/rules/ears-format.md`）
4. 生成完整需求文档
5. 更新 spec.json 的 phase 为 `requirements-generated`

**EARS 格式（核心）：**

需求的验收标准必须使用 EARS 五种模式之一：

| 模式 | 句法 | 用途 |
|------|------|------|
| 事件驱动 | When [事件], the [系统] shall [动作] | 响应特定事件 |
| 状态驱动 | While [前置条件], the [系统] shall [动作] | 依赖系统状态 |
| 异常处理 | If [触发], the [系统] shall [动作] | 错误和异常行为 |
| 可选功能 | Where [功能包含], the [系统] shall [动作] | 条件功能 |
| 普适需求 | The [系统] shall [动作] | 始终有效的基础属性 |

**语言规则：** EARS 关键词（When, While, If, Where, shall）保持英文，变量部分使用 spec.json 指定的目标语言。

**示例（中文 + EARS）：**
```markdown
### 需求 1: 产品筛选

**验收标准：**
1. When 用户选择材质筛选项, the 产品列表 shall 仅显示匹配材质的产品
2. When 用户清除所有筛选, the 产品列表 shall 恢复显示全部产品
3. While 筛选加载中, the 筛选面板 shall 显示加载状态指示器
4. If 无产品匹配筛选条件, the 产品列表 shall 显示"暂无匹配产品"空状态
```

**关键约束：**
- 需求 ID 必须使用**数字**（Requirement 1, 2, 3...），禁止字母 ID
- 关注 WHAT 而非 HOW（不含实现细节）
- 先生成初版，再根据反馈迭代（不会预先问大量问题）

**需求审批后的下一步：**
```bash
# 可选：对已有项目做差距分析
/kiro:validate-gap product-filter

# 进入设计阶段（-y 自动批准需求）
/kiro:spec-design product-filter -y
```

---

### 1.3 差距分析（可选，推荐用于已有项目）

```bash
/kiro:validate-gap product-filter
```

**做什么：**
- 分析需求与现有代码的差距
- 识别已有组件、集成点
- 评估多种实现策略（扩展 / 新建 / 混合）
- 标记需要进一步研究的领域

**适用场景：**
- 在已有项目上添加功能（brownfield）
- 需要理解现有代码如何影响设计决策
- **新项目（greenfield）可跳过此步**

---

### 1.4 生成技术设计

```bash
/kiro:spec-design product-filter -y    # -y 自动批准需求
/kiro:spec-design product-filter       # 需要需求已手动批准
```

**做什么：**
1. 加载需求 + steering + 设计模板和原则
2. **分类功能类型并执行对应的 Discovery 流程：**

| 类型 | Discovery 流程 | 适用场景 |
|------|---------------|---------|
| 新功能（greenfield） | Full Discovery | 全面研究 |
| 扩展（extension） | Light Discovery | 关注集成点 |
| 简单增删改查 | 最小化 | 快速模式检查 |
| 复杂集成 | 全面分析 | 综合研究 |

3. **Full Discovery 包括：**
   - WebSearch/WebFetch 研究最新架构模式
   - 外部依赖验证（API、库版本、兼容性）
   - 性能基准和安全考量
   - 将发现记录到 `research.md`

4. 生成设计文档，包含：
   - 架构模式和边界图
   - 技术栈对齐分析
   - 组件和接口契约（类型安全，TypeScript 禁止 `any`）
   - 需求到组件的追溯映射

**输出：**
```
.kiro/specs/product-filter/
├── spec.json
├── requirements.md
├── design.md          # 技术设计文档
└── research.md        # Discovery 研究日志
```

---

### 1.5 验证设计质量（可选但推荐）

```bash
/kiro:validate-design product-filter
```

**做什么：**
- 交互式设计质量审查
- 最多提出 **3 个**最关键问题（聚焦而非面面俱到）
- 平衡评估：同时认可优势和不足
- 给出 **GO / NO-GO** 决策和理由
- 所有建议必须可操作

**GO → 继续：** `/kiro:spec-tasks product-filter -y`
**NO-GO → 修改后重新生成：** `/kiro:spec-design product-filter`

---

### 1.6 生成实现任务

```bash
/kiro:spec-tasks product-filter -y         # -y 自动批准需求和设计
/kiro:spec-tasks product-filter --sequential  # 强制串行模式（不标记并行任务）
```

**做什么：**
1. 加载需求 + 设计 + steering + 任务生成规则
2. 将所有需求映射为实现任务
3. 标记可并行执行的任务（`(P)` 标记）
4. 验证需求 100% 覆盖

**任务格式规则：**

```markdown
- [ ] 1. 主任务描述
- [ ] 1.1 子任务描述
  - 功能细节 1
  - 功能细节 2
  - _Requirements: 1.1, 1.2_

- [ ] 1.2 (P) 可并行的子任务
  - 功能细节
  - _Requirements: 2.1_

- [ ] 2. 下一个主任务
```

**核心原则：**
- **自然语言**描述功能和结果，不包含文件路径、函数名等实现细节
- **最多两级**：主任务 + 子任务，禁止更深嵌套
- **子任务粒度**：每个 1-3 小时工作量
- **需求映射**：每个任务末尾标注 `_Requirements: X.X_`
- **并行标记 `(P)`**：仅当无数据依赖、无共享文件冲突、无前置审批时
- **可选测试 `- [ ]*`**：仅用于可延迟到 MVP 后的辅助测试覆盖

**并行任务判定标准：**
1. 无数据依赖
2. 无共享文件/资源冲突
3. 无前置审批要求
4. 环境/设置工作已满足

---

### 1.7 查看 Spec 状态

```bash
/kiro:spec-status product-filter
```

显示各阶段完成度、任务进度（X/Y 完成）、下一步操作。

---

### 1.8 直接实现（跳过 Layer 2-3，仅 Kiro 内部）

如果不需要 Ralph 循环，可以直接用 Kiro 的 TDD 实现命令：

```bash
# 执行单个任务
/kiro:spec-impl product-filter 1.1

# 执行多个任务
/kiro:spec-impl product-filter 1.1,1.2

# 执行所有待完成任务（不推荐，上下文膨胀）
/kiro:spec-impl product-filter
```

**TDD 流程：** RED（写失败测试）→ GREEN（最小实现）→ REFACTOR（重构）→ VERIFY（全部测试通过）→ 标记完成

**验证实现：**
```bash
/kiro:validate-impl product-filter 1.1,1.2
```

检查任务完成状态、测试覆盖、需求追溯、设计对齐、回归。

---

## Layer 2: Ralph 格式桥接

将 Layer 1 的 Spec 任务转换为 Ralph 可执行的 `prd.json` 格式。

### 2.1 为什么需要桥接层？

| Kiro tasks.md | Ralph prd.json |
|---------------|----------------|
| 细粒度子任务（1.1, 1.2...） | 粗粒度 User Story（US-001） |
| 描述功能和能力 | 描述用户价值（As a... I want...） |
| 用于交互式实现 | 用于无人值守循环 |
| 有并行标记 `(P)` | 按 priority 串行执行 |
| 用 checkbox `[x]` 跟踪 | 用 `passes: true/false` 跟踪 |

**核心差异：** Ralph 每次迭代是全新上下文（无记忆），所以每个 Story 必须**完全自包含**，能在一个上下文窗口内完成。

### 2.2 转换方式

#### 方式 A：从 Kiro tasks.md 转换（推荐）

```bash
# 在 Claude Code 中
# 1. 打开包含 tasks.md 的 Spec
# 2. 调用 Ralph 转换器
/ralph
```

转换器会：
1. 读取 tasks.md
2. 将相关子任务合并为适当大小的 User Story
3. 按依赖排序设置 priority
4. 为每个 Story 添加 `"Typecheck passes"`
5. 为 UI Story 添加 `"Verify in browser using dev-browser skill"`
6. 输出到 `scripts/ralph/prd.json`

#### 方式 B：先生成 PRD 再转换

```bash
# 1. 用 /prd 生成 markdown PRD（会问 3-5 个澄清问题）
/prd

# 2. 转换为 prd.json
/ralph
```

`/prd` 的交互流程：
1. 接收功能描述
2. 提出 3-5 个选择题（格式：1A, 2C, 3B 快速回答）
3. 基于答案生成 PRD（含 User Stories、功能需求、非目标等）
4. 保存到 `tasks/prd-[feature-name].md`

### 2.3 Story 大小规则（最重要）

**每个 Story 必须在一个 Ralph 迭代（一个上下文窗口）内完成。**

| 合适大小 | 需要拆分 |
|---------|---------|
| 添加一个数据库列和迁移 | "构建整个仪表盘" |
| 添加一个 UI 组件到现有页面 | "添加认证系统" |
| 更新一个 server action 逻辑 | "重构 API" |
| 添加一个筛选下拉框 | "实现完整搜索功能" |

**判断标准：** 如果不能用 2-3 句话描述变更，就太大了。

### 2.4 Story 排序规则

按依赖顺序排列 priority：

```
1. Schema / 数据库变更（迁移）      ← priority: 1
2. Server actions / 后端逻辑        ← priority: 2
3. 使用后端的 UI 组件               ← priority: 3
4. 聚合数据的仪表盘/总览视图         ← priority: 4
```

**错误示例：** UI 组件（priority: 1）依赖尚不存在的 schema（priority: 2）

### 2.5 验收标准规则

每条标准必须是 Ralph 可以**验证**的，不能含糊。

| 好（可验证） | 坏（含糊） |
|-------------|-----------|
| 添加 `status` 列，默认值 `'pending'` | "工作正常" |
| 筛选下拉有选项：全部、活跃、已完成 | "用户能方便地筛选" |
| 点击删除后显示确认对话框 | "良好的 UX" |
| Typecheck passes | "处理边界情况" |

**必须包含的标准：**
- **所有 Story：** `"Typecheck passes"`
- **有测试逻辑的 Story：** `"Tests pass"`
- **UI Story：** `"Verify in browser using dev-browser skill"`

### 2.6 prd.json 完整格式

```json
{
  "project": "Tianze",
  "branchName": "ralph/product-filter",
  "description": "产品筛选功能 — 按材质、规格筛选产品列表",
  "userStories": [
    {
      "id": "US-001",
      "title": "添加筛选条件数据结构",
      "description": "As a developer, I need filter data structures so that the UI can consume structured filter options.",
      "acceptanceCriteria": [
        "创建 FilterOption 接口: id, label, category",
        "在 products 数据中添加可筛选属性",
        "导出类型供 UI 组件使用",
        "Typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-002",
      "title": "实现筛选面板 UI 组件",
      "description": "As a buyer, I want to filter products by material so that I find relevant products faster.",
      "acceptanceCriteria": [
        "筛选面板显示材质、规格分类",
        "每个选项显示 checkbox",
        "选中后即时筛选产品列表",
        "Typecheck passes",
        "Verify in browser using dev-browser skill"
      ],
      "priority": 2,
      "passes": false,
      "notes": ""
    }
  ]
}
```

### 2.7 归档机制

当 `prd.json` 的 `branchName` 变更时，`ralph.sh` 自动归档旧的运行记录：

```
scripts/ralph/archive/
└── 2026-02-08-product-filter/
    ├── prd.json
    └── progress.txt
```

手动更新 prd.json 时也应先归档（`/ralph` 转换器会检查并处理）。

---

## Layer 3: 执行层

### 3.1 模式 A: ralph.sh（AFK 串行循环）

**适用场景：** 离开电脑、过夜执行、Story 间有强依赖

#### 运行方式

```bash
# 默认：claude 工具，10 次迭代
./scripts/ralph/ralph.sh

# 指定迭代次数
./scripts/ralph/ralph.sh 20

# 使用 amp 而非 claude
./scripts/ralph/ralph.sh --tool amp 15
```

#### 工作原理

每次迭代 ralph.sh 做以下事情：

```
1. 启动全新 Claude Code 实例（无上下文记忆）
   └── claude --dangerously-skip-permissions --print < CLAUDE.md

2. CLAUDE.md 指导 Agent：
   ├── 读取 prd.json → 找到最高 priority 且 passes: false 的 Story
   ├── 读取 progress.txt → 了解之前迭代的模式和经验
   ├── 检查/切换到正确的 git 分支
   ├── 实现这一个 Story
   ├── 运行质量检查（type-check, lint, test）
   ├── 如果通过 → commit + 设置 passes: true
   ├── 追加日志到 progress.txt
   └── 如果全部 Story 完成 → 输出 <promise>COMPLETE</promise>

3. ralph.sh 检测输出：
   ├── 包含 COMPLETE → 退出循环，成功
   └── 不包含 → sleep 2s → 下一次迭代
```

#### 状态传递机制

Ralph Agent 是无记忆的，通过以下文件传递状态：

| 文件 | 角色 |
|------|------|
| `prd.json` | 任务清单：`passes` 字段记录完成状态 |
| `progress.txt` | 经验日志：包含 Codebase Patterns 和每次迭代的 learnings |
| `git history` | 代码状态：每个 Story 一次 commit |

#### progress.txt 格式

```markdown
## Codebase Patterns
- 使用 `getAllProductsCached()` 获取产品数据
- 所有用户文本必须通过 i18n 翻译键
- Server Components 优先，仅交互需要 `"use client"`

---

## 2026-02-08 14:30 - US-001
- 实现了筛选数据结构
- 修改文件: src/types/filter.ts, src/lib/content/products.ts
- **Learnings for future iterations:**
  - 产品数据在 src/lib/content/ 目录
  - 类型需要从 @/types/ 导出
---

## 2026-02-08 14:45 - US-002
- 实现了筛选面板 UI
- 修改文件: src/components/products/filter-panel.tsx
- **Learnings for future iterations:**
  - shadcn/ui 的 Checkbox 组件在 @/components/ui/checkbox
  - 需要 "use client" 因为有交互逻辑
---
```

#### 质量检查（项目特定）

`scripts/ralph/CLAUDE.md` 中配置了项目特定的质量命令：

- **tianze-website:** `pnpm type-check && pnpm lint && pnpm test`
- **dormee:** `pnpm type-check && pnpm lint && pnpm test`（待项目初始化后确认）

---

### 3.2 模式 B: Agent Team（在线并行）

**适用场景：** 在线监督、Story 独立可并行、需要人工决策

#### 前置条件

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

#### 工作流程

```
1. 读取 prd.json 中的 User Stories
2. 创建 Team:
   TeamCreate → team-name: "ralph-feature-x"
3. 为每个 Story 创建 Task:
   TaskCreate → subject: "US-001: ..."
4. Spawn teammates:
   Task tool → subagent_type: "general-purpose"
              → team_name: "ralph-feature-x"
5. 分配 Task:
   TaskUpdate → owner: teammate-name
6. 协调执行:
   SendMessage → 通报进度
   TaskUpdate → 标记完成
7. 完成后清理:
   SendMessage type: "shutdown_request"
   TeamDelete
```

#### 并行执行策略

基于 Kiro tasks.md 中的 `(P)` 标记决定哪些 Story 可以并行：

```
US-001 (schema)        → Agent-1  ──┐
                                     ├──→ US-003 (UI, 依赖 001+002) → Agent-1
US-002 (P) (backend)   → Agent-2  ──┘
US-004 (P) (独立功能)  → Agent-3  ────→ 独立完成
```

---

### 3.3 模式选择决策表

| 条件 | 推荐模式 |
|------|----------|
| 离开电脑 / 过夜 | ralph.sh |
| 在线监督 | Agent Team |
| Story 间有强依赖链 | ralph.sh（串行更安全） |
| Story 间独立、标记 `(P)` | Agent Team |
| 需要人工审查决策 | Agent Team |
| 上下文窗口限制内的简单功能 | `/kiro:spec-impl`（直接 Kiro 实现） |
| 大型功能、16+ Stories | ralph.sh（Anthropic 验证过的规模） |

---

## 完整工作流操作手册

### 场景一：新功能开发（完整流程）

```bash
# ─── Phase 0: 项目知识 ───
/kiro:steering                           # 首次运行建立项目记忆

# ─── Phase 1: 规划 ───
/kiro:spec-init 添加产品筛选和排序功能     # 初始化 Spec
/kiro:spec-requirements product-filter    # 生成 EARS 需求
# → 审阅 .kiro/specs/product-filter/requirements.md
# → 满意则继续，不满意则修改后重新运行

/kiro:validate-gap product-filter         # [可选] 差距分析
/kiro:spec-design product-filter -y       # 生成技术设计
# → 审阅 .kiro/specs/product-filter/design.md

/kiro:validate-design product-filter      # [推荐] 设计质量验证
# → GO: 继续  |  NO-GO: 修改后重新生成

/kiro:spec-tasks product-filter -y        # 生成实现任务
# → 审阅 .kiro/specs/product-filter/tasks.md

# ─── Phase 2: 桥接 ───
/ralph                                    # Kiro tasks → prd.json
# → 审阅 scripts/ralph/prd.json
# → 确认每个 Story 大小合适、依赖正确

# ─── Phase 3: 执行（选其一） ───
# 方式 A: AFK 串行
./scripts/ralph/ralph.sh 20

# 方式 B: Agent Team 并行
# 在 Claude Code 中交互式创建 Team 和分配任务

# ─── Phase 4: 验证 ───
/kiro:validate-impl product-filter        # 验证实现与 Spec 对齐
/kiro:spec-status product-filter          # 查看完成状态
```

### 场景二：快速功能（跳过 Ralph）

适合小功能，直接用 Kiro 的 TDD 实现：

```bash
/kiro:spec-init 修复产品卡片hover效果
/kiro:spec-requirements fix-product-hover
/kiro:spec-design fix-product-hover -y
/kiro:spec-tasks fix-product-hover -y
/kiro:spec-impl fix-product-hover 1.1     # 直接 TDD 实现
/kiro:validate-impl fix-product-hover
```

### 场景三：仅 Ralph（无 Kiro Spec）

适合已有明确需求、不需要 EARS 结构化：

```bash
/prd                    # 回答问题后生成 PRD markdown
/ralph                  # 转换为 prd.json
./scripts/ralph/ralph.sh
```

---

## 文件结构全景

```
project/
├── .claude/
│   └── commands/kiro/              # Layer 1: 11 个 Spec 命令
│       ├── spec-init.md
│       ├── spec-requirements.md
│       ├── spec-design.md
│       ├── spec-tasks.md
│       ├── spec-impl.md
│       ├── spec-status.md
│       ├── steering.md
│       ├── steering-custom.md
│       ├── validate-design.md
│       ├── validate-gap.md
│       └── validate-impl.md
│
├── .kiro/
│   ├── settings/
│   │   ├── templates/              # Spec 和 Steering 模板
│   │   │   ├── specs/              # requirements.md, design.md, tasks.md 模板
│   │   │   ├── steering/           # product.md, tech.md, structure.md 模板
│   │   │   └── steering-custom/    # 自定义 steering 模板
│   │   └── rules/                  # 9 个规则文件
│   │       ├── ears-format.md      # EARS 需求语法
│   │       ├── design-principles.md
│   │       ├── design-discovery-full.md
│   │       ├── design-discovery-light.md
│   │       ├── design-review.md
│   │       ├── gap-analysis.md
│   │       ├── steering-principles.md
│   │       ├── tasks-generation.md
│   │       └── tasks-parallel-analysis.md
│   ├── steering/                   # 项目知识（持久记忆）
│   │   ├── product.md
│   │   ├── tech.md
│   │   └── structure.md
│   └── specs/                      # Spec 输出
│       └── <feature-name>/
│           ├── spec.json
│           ├── requirements.md
│           ├── design.md
│           ├── research.md
│           └── tasks.md
│
├── scripts/ralph/                  # Layer 2-3: Ralph 执行
│   ├── ralph.sh                    # AFK 循环脚本
│   ├── CLAUDE.md                   # Ralph Agent 指令（项目定制）
│   ├── prd.json                    # 当前执行计划
│   ├── progress.txt                # 执行日志 + Codebase Patterns
│   └── archive/                    # 历史运行归档
│       └── YYYY-MM-DD-feature/
│
└── tasks/                          # /prd 输出位置（可选）
    └── prd-feature-name.md
```

---

## 故障排查

### Layer 1 问题

| 问题 | 解决 |
|------|------|
| `/kiro:spec-requirements` 报 "missing project description" | 确保先运行 `/kiro:spec-init` |
| 需求 ID 使用了字母 | 必须使用数字 ID（Requirement 1, 2...） |
| 设计阶段报 "requirements not approved" | 使用 `-y` 标志自动批准，或手动批准 |
| Steering 为空 | 先运行 `/kiro:steering` |

### Layer 2 问题

| 问题 | 解决 |
|------|------|
| Story 太大，Ralph 迭代超时 | 拆分到 2-3 句话可描述的粒度 |
| Story 依赖顺序错误 | 确保 schema → backend → UI |
| 验收标准含糊 | 改为可验证的具体条件 |

### Layer 3 问题

| 问题 | 解决 |
|------|------|
| ralph.sh 报 `jq: command not found` | 安装 jq: `brew install jq` |
| Ralph 每次迭代都做同一个 Story | 检查是否成功将 `passes` 设为 `true` |
| Ralph 提交了不通过的代码 | 检查 CLAUDE.md 中的质量命令是否正确 |
| Agent Team 不可用 | 设置环境变量 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` |
| 达到最大迭代仍未完成 | 增加迭代次数或检查 Story 是否太大 |
