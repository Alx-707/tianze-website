> 调研时间：2026-03-22
> 调研模式：standard
> 置信度：0.78
> 搜索轮次：12 | Hop 深度：3

# BDD 工具调研：与 obra/superpowers 的配合方案

## 核心结论（先读这里）

obra/superpowers 的 TDD skill **没有原生 BDD 规格层**。obra 本人在社区讨论中确认了这一点，并说"Maybe I'll make something simpler that does BDD without as many gyrations"。

这意味着存在真实的方法论缺口：brainstorming skill 生成设计文档，但格式是自由文本；TDD skill 直接跳到代码层测试。中间缺少 Given/When/Then 格式的行为规格作为衔接。

**最终推荐方案**：从 FradSer/dotclaude 提取 BDD SKILL.md，作为个人 skill 安装到 `~/.config/superpowers/skills/behavior-driven-development/`，配合 `@amiceli/vitest-cucumber` 作为 Gherkin 执行层。

---

## 候选方案全景

### 方案 A：swingerman/atdd（最完整的 BDD 层，但重量级）

**类型**：Claude Code 插件（独立，与 superpowers 并列）

**是什么**：Acceptance Test Driven Development 插件，实现 Uncle Bob（Robert C. Martin）的 empire-2025 方法论。提供完整的两流测试体系（Acceptance Tests + Unit Tests）。

**工作流**：
1. spec-writer agent 用 Given/When/Then 写接受测试规格（域语言，禁止出现类名/API 端点）
2. pipeline-builder agent 分析代码库，生成项目专属的 Parser→IR→Generator 三层测试管道
3. implementer agent 收到红色接受测试，用 TDD 写单元测试 + 代码，直到两流全绿
4. reviewer agent 审查规格泄漏（实现细节混入规格）

**规格格式示例**：
```
; User can register with email and password.
;===============================================================
GIVEN no registered users.
WHEN a user registers with email "bob@example.com" and password "secret123".
THEN there is 1 registered user.
THEN the user "bob@example.com" can log in.
```

**Golden Rule**：只描述外部可观察行为，不暴露实现细节。

**评估维度**：

| 维度 | 评分 | 说明 |
|------|------|------|
| BDD 方法论深度 | 5/5 | 最完整，方法论清晰，有哲学根基 |
| 与 obra/superpowers 兼容性 | 2/5 | 有职责重叠（brainstorming/planning），可能冲突 |
| 与 Vitest 匹配度 | 2/5 | 文档支持 Jest，未明确支持 Vitest [⚠️ 单一来源] |
| 安装集成方式 | 插件级 | `/plugin marketplace add swingerman/atdd` |
| 活跃度 | 中 | 85 stars，v0.4.0，MIT |
| 学习成本 | 高 | 需要理解 Parser/IR/Generator 流水线 |

**关键问题**：与 obra/superpowers 同时使用会有双重 brainstorming/planning 负担，需要手动协调两套方法论的边界。

---

### 方案 B：FradSer/dotclaude BDD Skill（轻量，最易整合）

**类型**：Claude Code skill（.md 文件，可安装为 superpowers 个人 skill）

**是什么**：FradSer 的 dotclaude 插件集中 superpowers 插件下的一个 BDD skill，遵循三阶段方法论：Discovery → Formulation → Automation。

**工作流**：
1. **Discovery**：Three Amigos（业务方+开发+测试）协作识别需求和边界情况
2. **Formulation**：将需求转化为 Gherkin 格式 Given/When/Then 规格，存储为 `.feature` 可执行规格文件
3. **Automation**：Red-Green-Refactor 循环实现（对接到 obra TDD skill）

**核心规则**：
- 每个场景只描述一个行为（One behavior per scenario）
- 场景存储在 `.feature` 文件，不是代码注释（可执行 + 非技术人员可读）
- 保持声明式语言，避免技术术语和 UI 细节
- "no production code without a failing test" Iron Law

**安装方式**（通过 LobeHub）：
```bash
npx -y @lobehub/market-cli register --name "YourName" --source open-claw
npx -y @lobehub/market-cli skills install fradser-dotclaude-behavior-driven-development
```

或直接从 GitHub 下载 SKILL.md 放入 `~/.config/superpowers/skills/behavior-driven-development/`。

**评估维度**：

| 维度 | 评分 | 说明 |
|------|------|------|
| BDD 方法论深度 | 4/5 | Discovery→Formulation→Automation 完整，有 Gherkin |
| 与 obra/superpowers 兼容性 | 5/5 | 设计为 superpowers skill，天然互补 |
| 与 Vitest 匹配度 | 3/5 | 不绑定测试框架，需配合 vitest-cucumber |
| 安装集成方式 | skill 级 | 复制到 personal skills 目录 |
| 活跃度 | 中 | FradSer dotclaude 项目整体健康，但该 skill 独立维护情况未知 [⚠️ 单一来源] |
| 学习成本 | 低 | 与 superpowers 工作流无缝衔接 |

---

### 方案 C：@amiceli/vitest-cucumber（Gherkin 执行层，工具而非方法论）

**类型**：npm 包（测试执行框架）

**是什么**：在 Vitest 生态中执行 Gherkin `.feature` 文件的工具，不是 Claude Code skill，而是配合 BDD skill 使用的执行层。

**核心特性**：
- 支持标准 Gherkin 语法（Feature/Scenario/Given/When/Then/And）
- `@amiceli/vitest-cucumber` 要求 Vitest >= 2.0.0（项目使用 Vitest，满足）
- 最新版本 v6.3.0（2026-03 发布），89 stars，52 次发布，维护积极
- 有 React 项目示例模板
- CLI 工具：从 `.feature` 文件自动生成 spec 文件骨架

**与项目技术栈匹配**：

```
Next.js 16 + React 19 + Vitest → vitest-cucumber v6.3.0 ✓
```

**使用模式**：
```typescript
// product.feature
Feature: Product inquiry
  Scenario: Buyer views product specs
    Given a buyer is on the product detail page
    When they look at the technical specifications
    Then they see pipe diameter, material, and certifications

// product.test.ts
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber'

const feature = await loadFeature('./product.feature')
describeFeature(feature, ({ Scenario }) => {
  Scenario('Buyer views product specs', ({ Given, When, Then }) => {
    Given('a buyer is on the product detail page', () => { ... })
    When('they look at the technical specifications', () => { ... })
    Then('they see pipe diameter, material, and certifications', () => { ... })
  })
})
```

**评估维度**：

| 维度 | 评分 | 说明 |
|------|------|------|
| BDD 方法论深度 | N/A | 工具层，不提供方法论 |
| 与 obra/superpowers 兼容性 | 4/5 | 执行 BDD skill 产出的 .feature 文件 |
| 与 Vitest 匹配度 | 5/5 | 专为 Vitest 设计 |
| 安装集成方式 | npm 包 | `pnpm add -D @amiceli/vitest-cucumber` |
| 活跃度 | 高 | v6.3.0，2026-03 更新，积极维护 |
| 学习成本 | 低 | Gherkin 语法，标准 BDD |

---

### 方案 D：obra/superpowers brainstorming skill（已有，但不够）

**是什么**：superpowers 内置的头脑风暴 skill，设计文档存储到 `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`。

**实际 BDD 能力**：brainstorming skill 的文档中**没有提及 BDD 或 Given/When/Then**。设计文档是自由格式，涵盖 architecture/components/data flow/error handling/testing，但没有结构化的行为规格层。

**结论**：可以用作 BDD 的上游（收集需求），但不能替代 BDD 规格层。

---

### 方案 E：nitzo/tdd-guard（TDD 强制执行，不是 BDD）

**类型**：Claude Code 插件

**是什么**：1.9k stars 的 TDD 强制执行工具，通过 hooks 阻止 Agent 在没有失败测试的情况下写代码。

**与 BDD 的关系**：无，纯 TDD 执行层。支持 Vitest。可以与 BDD skill 互补（BDD 产出规格 → TDD guard 强制测试先行）。

**评估**：与项目已有的 TDD Iron Law 重叠，如果 obra/superpowers 已足够强制，不需要额外安装。

---

### 方案 F：vitest-cucumber-plugin / quickpickle（替代 Gherkin 执行层）

**备选**，与方案 C 功能类似：

- **vitest-cucumber-plugin**（samuel-ziegler）：Vite 插件，需修改 vite.config；122 weekly downloads，维护较少
- **quickpickle**：从 vitest-cucumber-plugin fork 重写，支持 multi-environment，支持标签过滤

相比 `@amiceli/vitest-cucumber`，这两个项目维护活跃度较低或变化较大，暂不推荐为主选。

---

## 推荐方案及集成路径

### 推荐：方案 B + 方案 C 组合

**核心判断依据**：

1. **方法论层（Claude Code skill）**：FradSer BDD Skill（方案 B）
   - 天然设计为 superpowers skill，无冲突，直接互补
   - Discovery→Formulation→Automation 三阶段填补 brainstorming→TDD 之间的缺口
   - 轻量，可作为 personal skill 安装，不破坏现有 superpowers 工作流

2. **执行层（npm 包）**：@amiceli/vitest-cucumber（方案 C）
   - 专为 Vitest 设计，与项目栈完全匹配
   - v6.3.0 积极维护，有 React 项目示例
   - 让 `.feature` 文件变成可执行测试，实现"活文档"

**不推荐 swingerman/atdd 的原因**：
- 方法论重量级，与 obra/superpowers 的 brainstorming/planning/execution 有大量职责重叠
- 生成项目专属 Parser/IR/Generator 流水线，引入额外复杂度
- Vitest 支持未经明确验证

---

## 集成方案草案

### 完整开发流程（BDD 补全后）

```
1. obra brainstorming
   └─ 自由探索需求，生成设计文档
   └─ 输出：docs/superpowers/specs/YYYY-MM-DD-topic-design.md

2. BDD Formulation（新增）
   └─ 触发：设计文档审批后，进入实现前
   └─ 工具：FradSer BDD skill（Three Amigos + Gherkin 规格）
   └─ 输出：features/TOPIC.feature（Given/When/Then 场景）

3. obra writing-plans
   └─ 基于设计文档 + .feature 规格制定实现计划
   └─ 每个任务对应一个或多个 Gherkin Scenario

4. obra TDD（Red-Green-Refactor）
   └─ 工具：obra TDD skill + @amiceli/vitest-cucumber
   └─ 流程：
      a. 加载 .feature 文件
      b. 写 Vitest 步骤定义（红，失败）
      c. 实现代码（绿，通过）
      d. 重构

5. obra subagent-driven / executing-plans
   └─ 平行执行多个 Scenario 的实现
```

### 安装步骤

**Step 1：安装 BDD skill 到个人 skills 目录**

```bash
# 创建 personal skills 目录（如未存在）
mkdir -p ~/.config/superpowers/skills/behavior-driven-development

# 从 FradSer 仓库获取 SKILL.md
# 方式 A：通过 LobeHub CLI
npx -y @lobehub/market-cli register --name "YourName" --source open-claw
npx -y @lobehub/market-cli skills install fradser-dotclaude-behavior-driven-development

# 方式 B：直接从 GitHub 下载（更直接）
curl -o ~/.config/superpowers/skills/behavior-driven-development/SKILL.md \
  https://raw.githubusercontent.com/FradSer/dotclaude/main/plugins/superpowers/skills/behavior-driven-development/SKILL.md
```

**Step 2：安装 Gherkin 执行层**

```bash
pnpm add -D @amiceli/vitest-cucumber
```

**Step 3：在项目中建立 features/ 目录约定**

```
tianze-website/
├── features/                    # BDD .feature 文件
│   ├── hero-section.feature
│   ├── products-section.feature
│   └── contact-form.feature
├── src/
│   └── components/sections/
│       └── __tests__/
│           └── hero-section.test.ts  # Gherkin 步骤绑定
```

**Step 4：vite.config.ts 无需修改**（@amiceli/vitest-cucumber 是工具库，非 Vite 插件）

---

## 信息缺口与局限

**未能确认**：
- FradSer BDD SKILL.md 的实际文件内容（GitHub 404，可能路径已变更）——建议通过 LobeHub 安装后查看本地文件内容
- @amiceli/vitest-cucumber 与 Next.js 16 Server Components 测试环境的具体兼容性——官方只提供 React 示例，Next.js 项目需实测

**调研局限**：
- FradSer 的 BDD skill 具体内容无法直接获取（404），主要通过 LobeHub 描述页面和第三方信息判断
- obra/superpowers 个人 skills 目录的 shadowing 机制未实测，推断可行

**建议后续调研**：
- 安装 FradSer BDD skill 后，读取 SKILL.md 实际内容，确认与项目工作流的契合度
- 在一个简单功能（如 contact form 提交）上跑一遍 BDD→TDD 完整流程，验证可行性

---

## 来源

### Tier 1（高可信度）
- [obra/superpowers GitHub](https://github.com/obra/superpowers)
- [obra/superpowers brainstorming SKILL.md](https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md)
- [obra/superpowers TDD SKILL.md](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md)
- [swingerman/atdd GitHub](https://github.com/swingerman/atdd)
- [amiceli/vitest-cucumber GitHub](https://github.com/amiceli/vitest-cucumber)
- [@amiceli/vitest-cucumber npm](https://www.npmjs.com/package/@amiceli/vitest-cucumber)

### Tier 2（中高可信度）
- [FradSer/dotclaude GitHub](https://github.com/FradSer/dotclaude)
- [FradSer BDD Skill — LobeHub](https://lobehub.com/skills/fradser-dotclaude-behavior-driven-development)
- [nizos/tdd-guard GitHub](https://github.com/nizos/tdd-guard)
- [BDD Skill for Claude Code — MCPMarket](https://mcpmarket.com/tools/skills/behavior-driven-development-bdd)
- [Cucumber Best Practices for Claude Code — MCPMarket](https://mcpmarket.com/tools/skills/cucumber-best-practices-for-claude-code)

### Tier 3（参考）
- [Superpowers for Claude Code: Complete Guide 2026](https://pasqualepillitteri.it/en/news/215/superpowers-claude-code-complete-guide)
- [obra/superpowers — Threads 社区讨论（obra 本人回复）](https://www.threads.com/@sung.kim.mw/post/DUzEQeWkog_/)
- [10 top Claude Code plugins 2026 — Composio](https://composio.dev/content/top-claude-code-plugins)
- [vitest-dev/vitest Discussion #3233 — Cucumber/Gherkin plugin](https://github.com/vitest-dev/vitest/discussions/3233)
- [quickpickle npm](https://www.npmjs.com/package/quickpickle)
