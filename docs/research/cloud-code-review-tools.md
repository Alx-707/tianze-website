# 云端 AI 代码审查工具对比分析

| 字段 | 内容 |
|------|------|
| 调研时间 | 2026-03-01 |
| 模式 | standard |
| 综合置信度 | 0.88 |
| 搜索轮次 | 6 |
| Hop 深度 | 3（官方文档 + 官方博客 + 第三方综述） |

---

## 执行摘要

六款工具覆盖三种使用场景：**云端 PR 集成**（Gemini / CodeRabbit / Ellipsis / Codacy）、**开源自托管**（Qodo Merge / PR-Agent）、**本地 commit 前拦截**（git-lrc）。对于独立开发者的 Next.js/TypeScript 项目，Gemini Code Assist（免费，无代码限制）是零成本起点；CodeRabbit Pro 是功能最全的云端方案；Qodo Merge 是开源可控的中间路线；git-lrc 是唯一在 PR 之前介入的本地工具。

---

## 工具详情

### 1. Gemini Code Assist（Google）

**定位**：Google 官方 GitHub PR 集成，Gemini 模型驱动，完全免费（个人版）。

#### 触发方式

- **自动**：PR 创建后 5 分钟内，`gemini-code-assist[bot]` 自动加为 reviewer
- **手动**：PR 评论中 `@gemini-code-assist` 或 `/gemini <command>`（如 `/gemini review`、`/gemini summary`）
- 无 GitHub Actions 配置需求，安装即激活

#### 审查维度

Gemini 默认覆盖五个维度，每条评论带严重级别（Critical / High / Medium / Low）：

| 维度 | 内容 |
|------|------|
| Correctness | 逻辑错误、竞态条件、边界情况、API 误用 |
| Efficiency | 内存泄漏、低效循环、冗余计算 |
| Maintainability | 可读性、命名、模块化、文档、Magic Numbers |
| Security | 注入攻击、不安全数据处理、权限控制不足 |
| Miscellaneous | 测试、可扩展性、错误日志 |

#### 自定义规则支持

在仓库根目录创建 `.gemini/` 文件夹，支持两个文件：

- `.gemini/config.yaml`：行为配置（评论数量上限、最低严重级别阈值、忽略文件模式）
- `.gemini/styleguide.md`：自然语言描述的编码规范，Gemini 会在审查时主动应用并引用

```yaml
# .gemini/config.yaml 示例
code_review:
  comment_severity_threshold: MEDIUM
  max_review_comments: 10
  pull_request_opened:
    summary: true
    code_review: true
```

对本项目的意义：可将 CLAUDE.md 中的项目规则翻译为 `styleguide.md`，让 Gemini 在 PR 审查时执行项目约定。

#### Auto-fix

支持 — 每条评论可附带"可直接 commit 的代码建议"，开发者在 PR 页面一键 commit，无需本地修改。

#### 定价

| 版本 | 价格 | 配额 |
|------|------|------|
| 消费者版（个人） | **免费，无需信用卡** | 33 个 PR/天 |
| 企业版（Google Cloud） | 预览期免费（需开启计费账户） | 100+ PR/天 |

#### GitHub Actions 集成

无需 Actions 配置。通过 GitHub App 安装（[GitHub Marketplace](https://github.com/marketplace/gemini-code-assist)），Webhook 自动处理。

#### Next.js / TypeScript 支持

语言无关（LLM 驱动），对 TypeScript 项目理解良好。`styleguide.md` 可指定框架特定规范。

#### 局限性

- 每天 33 PR（个人版），高频开发可能触及上限
- 企业版需要 Google Cloud 项目并开启计费
- 不支持 merge gate（无法阻止 PR 合并）
- `styleguide.md` 为非结构化自然语言，执行力依赖模型理解

---

### 2. CodeRabbit

**定位**：GitHub/GitLab/Bitbucket/Azure DevOps 全平台支持，GitHub 上安装量最大的 AI 审查工具（200 万+ 仓库），商业产品。

#### 触发方式

- **自动**：PR 创建/更新时自动触发，增量 commit 也会单独审查
- **手动**：PR 评论中 `@coderabbitai review`
- **自定义**：可配置触发条件（如仅 review_requested 才触发）

#### 审查维度

- 代码质量与逻辑问题
- 安全漏洞（集成 40+ linter 和 SAST 工具，LLM 过滤噪声）
- 性能问题
- 架构和模式一致性
- PR 摘要自动生成
- Release Notes / Sprint 报告自动生成
- （Pro）Jira/Linear issue 验证

#### 自定义规则支持

**最强的自定义支持之一**：

1. **自动读取 CLAUDE.md**：CodeRabbit 原生扫描 `**/CLAUDE.md`、`.cursorrules`、`.github/copilot-instructions.md`、`.windsurfrules` 等文件，自动将其中的规则应用到审查
2. **`.coderabbit.yaml`**：仓库根目录的配置文件，控制所有审查行为
3. **自定义文件模式**：可指定任意路径（如 `docs/STANDARDS.md`）让 CodeRabbit 读取

对本项目的意义：CLAUDE.md 和 `.claude/rules/*.md` 会被 CodeRabbit 自动读取并应用，**无需重复配置**。

#### Auto-fix

支持 — 提供一键可应用的代码补丁（inline suggestion），可直接从 PR 页面 commit。

#### 定价

| 计划 | 价格 | 说明 |
|------|------|------|
| Free | $0 | 公开仓库永久免费；私有仓库包含 14 天 Pro 试用 |
| Pro | $24/用户/月（年付）或 $30/月 | 含 Jira/Linear 集成、SAST、自定义报告 |
| Enterprise | 定制 | 自托管、多组织、SLA、API 访问 |

注：**仅对创建 PR 的开发者计费**，非所有席位。

#### GitHub Actions 集成

通过 GitHub App 安装，**无需手写 Actions workflow**，自动 Webhook 驱动。Pro 版有 GitHub Actions 专用集成。

#### Next.js / TypeScript 支持

语言无关，TypeScript/Next.js 项目通过自定义规则文件可获得框架级别的审查精度。

#### 局限性

- 免费版私有仓库需付费
- 无法 block merge（无 merge gate 功能）
- 定价对独立开发者相对较高

---

### 3. git-lrc（Hexmos）

**定位**：唯一的**本地 pre-commit 级别**工具，在 commit 发生前拦截，而非 PR 阶段。完全免费，自带 API key。

#### 触发方式

与其他工具根本不同：

- **commit 时触发**（非 PR 时），两种模式：
  - **Option A（自动）**：`git commit` 时自动打开浏览器 UI
  - **Option B（手动）**：`git lrc review` 显式触发
- `git lrc review --vouch`：跳过 AI，由开发者亲自背书
- `git lrc review --skip`：完全跳过，仅记录"已跳过"

#### 审查维度

- 敏感信息泄露（credentials、API keys）
- 高成本云操作
- 敏感数据进日志
- AI 代码静默删除逻辑
- 行为变更（功能被悄悄修改）
- 基于 diff 的 inline 行级评论 + 摘要

#### 自定义规则支持

**无**（截至 2026-03）。无配置文件机制，无自定义 prompt 支持。团队版 LiveReview 有组织级策略，但文档未提及规则自定义细节。

#### Auto-fix

**不支持**。仅报告问题，修复需手动或借助 AI agent（工具提供"复制问题到 AI agent"按钮）。

#### 定价

| 版本 | 价格 |
|------|------|
| git-lrc（个人） | **完全免费**，用户自备 Gemini API key |
| LiveReview（团队版） | 需联系 Hexmos |

依赖 Google Gemini 免费层，无中间商收费。

#### GitHub Actions 集成

**无**。这是一个本地工具，不集成 GitHub Actions，也不在 PR 阶段运行。

#### Next.js / TypeScript 支持

语言无关（分析 diff），无框架特定支持文档。

#### 局限性

- **无自定义规则**，无法注入项目约定
- 仅分析 staged diff，无仓库上下文
- 无 PR 级别集成，团队成员各自安装
- 许可证为 Sustainable Use License（不可二次销售）
- **适合个人、不适合团队强制执行**

[⚠️ 建议实测验证] 自定义规则支持情况，LiveReview 团队版可能有更多选项

---

### 4. Ellipsis

**定位**：YC W24，提供 AI 代码审查 + 实际 bug 修复（可生成 side-PR），定位"AI 队友"而非仅审查者。

#### 触发方式

- **自动**：每个 commit、每个 PR 自动触发，2 分钟内出结果
- **手动**：在 GitHub 评论中 `@ellipsis-dev` 发起任务

#### 审查维度

- 逻辑 bug 检测（不仅是 style/lint）
- 安全问题
- 反模式（anti-patterns）
- 自定义 Style Guide 执行
- PR 描述/Release Notes 自动生成
- 历史 PR 探索（"谁最后动过这段代码？"）

#### 自定义规则支持

支持 — 可通过 Style Guide 文件告知 Ellipsis 团队编码规范，LLM agent 据此检查违规。具体配置方式文档中未详细说明。

#### Auto-fix

**支持，且是核心差异化特性**：
- 检测到 bug 后可生成 side-PR（独立分支），开发者明确授权后合并
- **永不在未经许可的情况下 commit 代码**
- 可被指派完整开发任务（"写这个功能并提 PR"）

#### 定价

| 计划 | 价格 |
|------|------|
| 公开仓库 | **永久免费** |
| 付费席位 | $20/用户/月，无限制使用 |
| 试用 | 7 天免费 |

#### GitHub Actions 集成

通过 GitHub App 安装，无需手写 Actions workflow。

#### Next.js / TypeScript 支持

文档列出 TypeScript 为支持语言，React 相关文档（React Workflows）存在，说明前端框架支持良好。

#### 局限性

- 主要面向 25-100 人团队，个人开发者使用性价比存疑
- 对冷门语言（Golang、Rust）效果较弱（与 TypeScript 无关）
- 需要 Admin 级别 GitHub 权限安装
- 定价对独立开发者偏高（$20/月 vs Gemini 免费）

---

### 5. Codacy

**定位**：DevSecOps 平台，定规则的静态分析 + AI 审查的组合，侧重安全合规与代码质量量化。

#### 触发方式

- **opt-in，非默认自动**：管理员在组织或仓库级别手动开启
- 开启后：每个 commit 和 PR 自动扫描（云端，无需 CI pipeline）
- AI Reviewer 可通过 PR 摘要中的"Run Reviewer"按钮手动触发，或通过公开 API 调用

#### 审查维度

| 层次 | 内容 |
|------|------|
| 静态分析 | 代码质量、复杂度、重复代码、技术债务 |
| 安全扫描 | SAST、硬编码 secrets、不安全依赖、License 违规 |
| AI Reviewer | 业务意图 vs 技术实现一致性、逻辑漏洞、误报识别 |
| 高级安全 | DAST、渗透测试发现（Business 版） |

支持 49 种语言和框架，包括 TypeScript。

#### 自定义规则支持

- 通过 `.codacy/instructions/review.md` 文件提供给 AI Reviewer 的自定义指令
- 可描述项目架构、测试期望、代码风格约定
- 标准化的"质量门禁"（merge gate）支持

#### Auto-fix

文档中未提及自动修复功能。提供 one-click fix suggestions。

#### 定价

| 计划 | 价格 | 说明 |
|------|------|------|
| Open Source | 免费 | 仅公开仓库 |
| Team/Pro | $15–$18/用户/月 | AI Reviewer 需 Team 及以上 |
| Business | 约 $40/用户/月 | Smart False Positive Triage |
| Enterprise（本地部署） | 定制（约 2.5x 云端价格） | |

注：不同数据源价格有差异，建议以官网为准。

#### GitHub Actions 集成

有 GitHub Actions 专用文档，但核心扫描无需 Actions（云端 Webhook 驱动）。

#### Next.js / TypeScript 支持

原生支持 TypeScript（40+ 语言）。AI Reviewer 依赖 Google Gemini 模型。

#### 局限性

- AI Reviewer 仅限 Team/Business 计划（非免费功能）
- AI Reviewer 仅在 GitHub 上可用（非 GitLab/Bitbucket）
- 定价在所调研工具中最复杂，按功能层层收费
- 企业本地部署费用明显高于 SaaS

---

### 6. Qodo Merge（前身 PR-Agent）

**定位**：开源 PR-Agent 的托管商业版，最灵活的配置系统，原生读取 CLAUDE.md，支持多 AI 模型。

#### 触发方式

- **自动**：PR 创建/重新打开/标记为 ready 时自动触发（可配置）
- **手动**：PR 评论中 `/review`、`/improve`、`/describe`
- **GitHub Actions**：完整 workflow YAML 配置

```yaml
# .github/workflows/pr_agent.yml 核心配置
env:
  OPENAI_KEY: ${{ secrets.OPENAI_KEY }}
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  github_action_config.auto_review: "true"
  github_action_config.auto_describe: "true"
  github_action_config.auto_improve: "true"
  github_action_config.pr_actions: '["opened", "reopened", "ready_for_review", "review_requested"]'
```

#### 审查维度

- 代码质量与 bug
- 安全漏洞
- 性能问题
- PR 描述自动生成
- 代码建议（`/improve`）
- 测试覆盖建议
- 合规性（自定义 best_practices.md）

#### 自定义规则支持

**最强的结构化自定义系统**：

1. **原生读取 CLAUDE.MD**：默认扫描 `CLAUDE.MD`、`QODO.MD`、`AGENTS.MD`，可配置添加任意文件
2. **`.pr_agent.toml`**：仓库根目录配置，支持组织级全局配置（`pr-agent-settings` 仓库）
3. **`extra_instructions`**：per-tool 的 prompt 级指令（如"不要建议添加 try-catch"）
4. **`best_practices.md`**：仓库级编码规范，违反时标注"Organization best practice"标签
5. **Wiki 配置**：无需 commit 即可修改配置（wiki 页面 `.pr_agent.toml`）

```toml
# .pr_agent.toml 示例（适配本项目）
[pr_code_suggestions]
extra_instructions="""\
(1) Follow TypeScript strict mode — no any types
(2) All user-facing text must use i18n translation keys, never hardcode strings
(3) Server Components first — only use 'use client' for interactivity
(4) Function max 120 lines, file max 500 lines
"""

[config]
add_repo_metadata_file_list= ["CLAUDE.md", ".claude/rules/coding-standards.md"]
```

#### Auto-fix

支持（`/improve` 工具）— 提供可应用的代码补丁，但需开发者手动确认。

#### 定价

| 计划 | 价格 | 说明 |
|------|------|------|
| 开源自托管（PR-Agent） | **免费**，自备 API key | 功能完整，需自行维护 |
| Qodo Merge 免费层 | $0 | 75 PR/月，250 LLM 积分/月 |
| Teams | $30/用户/月 | 2,500 积分/月，支持 GPT-4o/Claude |
| Enterprise | 定制 | 自托管、VPC、air-gapped |

#### GitHub Actions 集成

**最灵活的集成方式**：支持 GitHub Actions（Docker 镜像）、GitHub App、CLI、自托管 Webhook，可自由选择。

#### Next.js / TypeScript 支持

语言无关（LLM 驱动），TypeScript 项目通过 `best_practices.md` 和 `extra_instructions` 可获得精确的项目级审查。

#### 局限性

- 开源版需自备 OpenAI/Anthropic/Gemini API key，有 token 费用
- 免费托管版 75 PR/月上限
- 配置学习曲线较陡（多层配置系统）
- 不支持 Bitbucket Server（仅 Cloud）

---

## 对比矩阵

| 维度 | Gemini | CodeRabbit | git-lrc | Ellipsis | Codacy | Qodo Merge |
|------|--------|------------|---------|----------|--------|------------|
| **触发** | 自动（PR创建） | 自动（PR创建/更新） | 手动/commit时 | 自动（每PR/commit） | opt-in，手动开启后自动 | 自动/手动/Actions |
| **安全审查** | ✓ | ✓（SAST集成） | 部分（secrets检测） | ✓ | ✓✓（最强） | ✓ |
| **性能审查** | ✓ | ✓ | 部分 | ✓ | ✓ | ✓ |
| **代码质量** | ✓ | ✓ | ✓ | ✓ | ✓✓ | ✓ |
| **架构审查** | 部分 | 部分（Code Graph） | ✗ | 部分 | 部分 | 部分 |
| **自定义规则** | styleguide.md | 原生读CLAUDE.md | ✗ | Style Guide | review.md | best_practices.md + CLAUDE.md |
| **Auto-fix** | 建议+一键commit | 建议+一键commit | ✗ | Side-PR生成 | 建议（无auto-apply） | 建议+手动apply |
| **merge gate** | ✗ | ✗ | ✗ | ✗ | ✓ | 部分 |
| **GitHub Actions** | 无需（App） | 无需（App） | ✗ | 无需（App） | 支持+App | 支持（最灵活） |
| **TypeScript** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **免费额度** | 33 PR/天 | 公开仓库免费 | 完全免费 | 公开仓库免费 | 仅公开仓库 | 75 PR/月 |
| **私有仓库最低费用** | 免费 | $24/用户/月 | 免费 | $20/用户/月 | $15+/用户/月 | $0（自托管）/$30（托管） |
| **本地运行** | ✗ | ✗ | ✓ | ✗ | ✗ | ✓（自托管） |

---

## 针对本项目的推荐方案

本项目为独立开发者（solo dev），Next.js + TypeScript，已有完整 CLAUDE.md 和 `.claude/rules/` 规则文件。

### 最优组合：Gemini Code Assist + Qodo Merge（开源自托管）

**理由：**

1. **Gemini Code Assist**（零成本起点）
   - 完全免费，无私有仓库限制
   - 33 PR/天对独立开发者够用
   - `.gemini/styleguide.md` 可直接引用 CLAUDE.md 规则
   - 5 分钟内自动出审查结果

2. **Qodo Merge 开源版**（作为 Gemini 的补充）
   - 原生读取 `CLAUDE.md`，无需重新配置规则
   - 通过 GitHub Actions 集成，自备 Gemini API key（免费）
   - `best_practices.md` + `extra_instructions` 可精确表达本项目约定

**次选**：如果不想维护自托管，Gemini Code Assist 单独使用已能覆盖大多数场景。

### 不推荐工具说明

- **CodeRabbit**：功能最全，但 $24/月 对独立开发者性价比存疑
- **Ellipsis**：$20/月，面向团队，Side-PR auto-fix 对独立开发者价值有限
- **Codacy**：定价复杂，AI Reviewer 需付费计划，适合有合规要求的团队
- **git-lrc**：无自定义规则，无法执行项目约定，不适合主力工具定位

---

## 信息缺口

| 缺口 | 影响 |
|------|------|
| git-lrc 是否支持自定义 prompt/规则（LiveReview 版） | 低（已标注验证建议） |
| Codacy 确切定价（官网未公示明细） | 中（第三方数据不一致） |
| Qodo Merge 开源版实际 token 成本（按 Gemini free tier） | 低 |
| Ellipsis Style Guide 配置的具体文件格式 | 低 |

---

## 来源分级

### Tier 1（官方文档/发布说明）

- [Gemini Code Assist — Review GitHub Code](https://developers.google.com/gemini-code-assist/docs/review-github-code)
- [Gemini Code Assist — Customize Behavior](https://developers.google.com/gemini-code-assist/docs/customize-gemini-behavior-github)
- [CodeRabbit — Code Guidelines Blog](https://www.coderabbit.ai/blog/code-guidelines-bring-your-coding-rules-to-coderabbit)
- [CodeRabbit — Pricing](https://www.coderabbit.ai/pricing)
- [CodeRabbit — Documentation](https://docs.coderabbit.ai/)
- [Qodo Merge — Overview](https://qodo-merge-docs.qodo.ai/)
- [Qodo Merge — Automations & Usage](https://qodo-merge-docs.qodo.ai/usage-guide/automations_and_usage/)
- [Qodo Merge — Configuration Options](https://qodo-merge-docs.qodo.ai/usage-guide/configuration_options/)
- [PR-Agent — GitHub](https://github.com/qodo-ai/pr-agent)
- [git-lrc — GitHub](https://github.com/HexmosTech/git-lrc)
- [git-lrc — Hexmos Landing](https://hexmos.com/livereview/git-lrc/)
- [Codacy AI Docs](https://docs.codacy.com/codacy-ai/codacy-ai/)
- [Ellipsis — Docs](https://docs.ellipsis.dev/features/code-review)

### Tier 2（权威社区/分析文章）

- [CodeRabbit Review 2026 — UCStrategies](https://ucstrategies.com/news/coderabbit-review-2026-fast-ai-code-reviews-but-a-critical-gap-enterprises-cant-ignore/)
- [Best AI Code Review Tools 2026 — DEV Community](https://dev.to/heraldofsolace/the-best-ai-code-review-tools-of-2026-2mb3)
- [Gemini Code Assist — Google Cloud Blog](https://cloud.google.com/blog/products/ai-machine-learning/gemini-code-assist-and-github-ai-code-reviews)
- [Ellipsis YC Profile](https://www.ycombinator.com/companies/ellipsis)

### Tier 3（第三方综述/价格聚合）

- [Codacy Pricing — G2](https://www.g2.com/products/codacy/pricing)
- [Ellipsis Review — AIBox100](https://aibox100.com/tools/ellipsis)
- [Codacy — Capterra](https://www.capterra.com/p/144689/Codacy/)
