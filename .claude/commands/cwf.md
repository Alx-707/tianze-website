---
name: cwf
description: Copywriting Workflow - 策略规划 → 文案生成 → 多维审查 → 定稿
user-invocable: true
---

# Copywriting Workflow (C-WF) v3

## 概述

从策略规划到文案定稿的完整流程，支持 Standard/Deep 两种模式，可选并行变体生成和 Agent Teams 审查。

```
cwf = 文案编排器
├── Phase 0: 初始化 (选择执行模式)
├── Phase 1: 策略规划 (positioning-messaging + 心理学框架)
├── Phase 2: 文案生成 (copywriting / product-description-writer)
│   └── --variants=N: 并行生成 N 个方案 (subagent)
├── Phase 3: 多维审查
│   ├── sequential 模式 (默认): 3a → 3b → 3c 串行
│   └── team 模式: 四维并行审查 + 冲突辩论 (Agent Teams)
│       ├── 语言审查员 (copy-editing)
│       ├── 品牌审查员 (brand-voice-coach)
│       ├── 心理学审查员 (marketing-psychology)
│       └── SEO 审查员 (seo-geo)
├── Phase 4: 本地化 (可选, translation-assistant)
└── Phase 5: 用户评审 → 迭代或定稿
```

**输出**：`docs/content/{page}/v{N}.md` + 可选 i18n JSON

---

## 执行模式

| 模式 | 适用场景 | Phase 2 | Phase 3 审查 | 成本 |
|------|----------|---------|-------------|------|
| **Standard** | 普通页面、快速迭代 | 单方案 | sequential: 3a → 3c | 低 |
| **Deep** | 首页、关键 Landing Page | 可选多方案 | sequential: 3a → 3b → [优化轮] → 3c | 中 |
| **Deep + Team** | 首页 + 高质量要求 | 可选多方案 | team: 四维并行 + 冲突辩论 | 高 |

**Deep 模式特点**：
- Phase 3b 心理学审查后，如评分 < 7/10，触发优化轮回到 Phase 2
- 确保文案说服力经过验证

**Team 审查特点**（需启用 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`）：
- 四个审查维度并行独立评审，避免后序审查覆盖前序优化
- 审查完成后队长主持冲突解决（如 SEO vs 说服力、品牌克制 vs 心理学激进度）
- 比串行更贵（4 个独立 Claude 实例），但审查质量更高

---

## 输入参数

### 固定（自动读取）

| 参数 | 来源 |
|------|------|
| **项目文档** | `docs/content/PROJECT-BRIEF.md`（唯一输入） |

### 用户输入

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| **页面类型** | ✓ | 对应网站页面 | homepage, products, about, contact, faq, cases |
| **执行模式** | ✓ | Standard / Deep | Deep (首页推荐) |
| **目标受众** | 可选 | 侧重的客户群 | 承包商 / 系统集成商 / 批发商 / OEM |
| **转化目标** | 可选 | 主要 CTA | 询盘 / 样品 / 了解更多 |
| **参考版本** | 可选 | 基于已有版本迭代 | v3 |
| **variants** | 可选 | 并行生成方案数（subagent） | 1 (默认) / 2 / 3 |
| **审查模式** | 可选 | Phase 3 审查策略 | sequential (默认) / team |

---

## 输出结构

```
docs/content/{page}/
├── v1.md                 # 版本 1
├── v2.md                 # 版本 2
├── v{N}-final.md         # 定稿版本
└── .working/             # 工作目录（可选）
    ├── strategy.md       # 策略文档
    └── psychology.md     # 心理学框架

# 可选：i18n JSON
messages/
├── en/{page}.json
└── zh/{page}.json
```

---

## 执行协议

### Phase 0: 初始化

```
1. 读取基础文档
   - docs/content/PROJECT-BRIEF.md（唯一输入）

2. 询问用户输入 [AskUserQuestion]
   - 页面类型？ (homepage / products / about / contact / faq / cases)
   - 执行模式？ (Standard / Deep，首页推荐 Deep)
   - 目标受众侧重？ (全部 / 承包商 / 系统集成商 / 批发商 / OEM)
   - 主要转化目标？ (询盘 / 样品 / 了解更多)
   - 基于已有版本？ (新建 / 选择已有版本)
   - 并行方案数？ (1 默认 / 2 / 3，多方案用 subagent 并行生成)
   - 审查模式？ (sequential 默认 / team，team 需启用 Agent Teams)

3. 检测已有版本
   - 扫描 docs/content/{page}/ 目录
   - 确定新版本号 v{N}
   - 创建输出目录
```

---

### Phase 1: 策略规划

**调用**: `positioning-messaging` 或 `content-strategy`

**选择逻辑**：
- 首页、关于页 → `positioning-messaging`（侧重定位）
- 其他页面 → `content-strategy`（侧重内容结构）

**输入 Prompt**：

```markdown
## 项目背景
{PROJECT-BRIEF.md 摘要}

## 页面目标
- 页面: {页面类型}
- 受众: {目标受众}
- 转化: {转化目标}

## 品牌差异化
{PROJECT-BRIEF.md 品牌价值章节}

## 任务
为该页面制定内容策略：
1. 核心信息层级
2. 区块结构建议
3. 关键信息点
4. CTA 策略
5. **心理学框架选择**（AIDA / PAS / PASTOR / 4Ps）
6. **每个区块的心理学目标**
```

**心理学框架参考**：

| 框架 | 适用场景 | 结构 |
|------|----------|------|
| **AIDA** | 通用首页、产品页 | Attention → Interest → Desire → Action |
| **PAS** | 痛点驱动页面 | Problem → Agitation → Solution |
| **PASTOR** | 长文案、销售页 | Problem → Amplify → Story → Transformation → Offer → Response |
| **4Ps** | B2B 决策页 | Promise → Picture → Proof → Push |

**输出**:
- 策略摘要（保持在上下文中）
- 心理学框架 + 每个区块的心理学目标

---

### Phase 2: 文案生成

**Skill 选择矩阵**：

| 页面类型 | 主 Skill | 备用 |
|----------|----------|------|
| homepage | `copywriting` | - |
| products | `product-description-writer` | `copywriting` |
| about | `copywriting` | - |
| contact | `copywriting` | - |
| faq | `faq-builder` | `technical-writer` |
| cases | `case-study-writer` | `copywriting` |

**输入 Prompt**：

```markdown
## 内容策略
{Phase 1 输出摘要}

## 心理学框架
{Phase 1 选择的框架}

## 每个区块的心理学目标
{Phase 1 输出的区块目标}

## 品牌素材（来自 PROJECT-BRIEF.md）
### 价值主张
{三大 VP}

### 产品信息
{产品体系章节}

### 客户痛点
{目标受众 - 应用场景}

## 内容边界（来自 PROJECT-BRIEF.md）
### 可用
{可用素材}

### 避免
{避免使用}

## 输出要求
- 语言: English (默认)
- 语气: {PROJECT-BRIEF.md 品牌语气}
- 结构: 按区块组织，标注每个区块的心理学目标
- CTA: 明确标注 CTA 文案
```

**输出**: `docs/content/{page}/v{N}.md`（草稿状态）

#### Phase 2 多方案模式 (variants > 1)

当用户设置 `variants=2` 或 `variants=3` 时，使用 **subagent 并行**生成多个方案。

**执行方式**：使用 Task tool 并行派发 subagent，每个 subagent 独立调用对应 skill。

```
IF variants == 1:
  → 正常单方案流程（同上）

IF variants > 1:
  → 并行派发 N 个 subagent（Task tool, subagent_type=general-purpose）
  → 每个 subagent 收到相同的 Phase 1 策略，但 prompt 附加差异化指令：

  Subagent 1: "侧重技术专业度和工程数据，风格偏理性"
  Subagent 2: "侧重客户痛点和解决方案叙事，风格偏感性"
  Subagent 3: "侧重行业地位和社会证明，风格偏权威"（仅 variants=3）

  → 输出到:
    docs/content/{page}/v{N}-A.md
    docs/content/{page}/v{N}-B.md
    docs/content/{page}/v{N}-C.md (仅 variants=3)

  → 用户选择:
    [AskUserQuestion]
    "已生成 {N} 个方案，请评审后选择:"
    - 方案 A: {风格摘要 + 第一段预览}
    - 方案 B: {风格摘要 + 第一段预览}
    - 方案 C: {风格摘要 + 第一段预览} (仅 variants=3)
    - 合并: 取各方案优点合并

  → IF 选择单方案:
    mv v{N}-{X}.md → v{N}.md
    删除其他方案文件

  → IF 选择合并:
    基于用户指定的优点，生成合并版本 v{N}.md
```

**注意**：每个 subagent 不需要互相沟通（只是各自生成），所以用 subagent 而非 Agent Teams。

---

### Phase 3: 多维审查

Phase 3 支持两种模式，由 Phase 0 用户选择决定。

---

#### 模式 A: Sequential（默认）

**审查顺序**：3a → 3b → 3c（Deep 模式）或 3a → 3c（Standard 模式）

每个审查员看到的是前一轮修改后的版本，串行执行。

##### 3a: 基础审查

**目标**：确保"写对了"（语言正确、品牌一致）

**3a.1 文案润色** — 调用 `copy-editing`

```markdown
## 任务
审查并润色以下文案：

{Phase 2 输出}

## 审查要点
- 语法、拼写
- 句式流畅性
- 信息清晰度
- 冗余删除
```

**3a.2 品牌语气检查** — 调用 `brand-voice-coach`

```markdown
## 品牌语气标准
{PROJECT-BRIEF.md 语言与语气章节}

## 任务
检查文案是否符合品牌语气：
- 专业、可信、技术导向、务实
- 无夸大宣传
- 无未经证实的声明

## 输入
{3a.1 输出}
```

**输出**: 更新 `v{N}.md`（基础审查完成）

##### 3b: 说服力审查 (Deep 模式)

**目标**：确保"写得有力"（心理学原则有效应用）

**调用**: `marketing-psychology`

```markdown
## 心理学框架
{Phase 1 选择的框架}

## 每个区块的心理学目标
{Phase 1 输出的区块目标}

## 任务
审查文案的心理学有效性：

1. **框架一致性**: 是否正确应用了选定的心理学框架？
2. **触发点有效性**: 每个区块是否达成了设定的心理学目标？
3. **说服力评分**: 1-10 分评估整体说服力
4. **具体改进建议**: 列出可优化的点

## 输入
{3a 输出}
```

**评分处理**：
- 评分 ≥ 7/10 → 继续 3c
- 评分 < 7/10 → **触发优化轮**：回到 Phase 2，针对性优化后重新进入 3a → 3b

##### 3c: 搜索审查

**目标**：确保"能被发现"（SEO + GEO 优化）

**调用**: `seo-geo`

```markdown
## 页面信息
- 页面: {页面类型}
- 目标市场: {地理分布}

## 任务
为以下文案进行 SEO/GEO 优化：
- 关键词自然融入评估
- 标题层级优化建议
- Meta description 建议
- Schema markup 建议 (FAQPage 等)

## 输入
{3b 输出 或 3a 输出 (Standard 模式)}
```

**注意**：SEO 放最后，避免 SEO 优化破坏说服力。如有冲突，说服力优先。

**输出**: 更新 `v{N}.md`（全部审查完成）

---

#### 模式 B: Team（Agent Teams 并行审查）

**前提**：需启用 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

**核心理念**：四个审查维度**同时**独立审查原始文案，避免串行中后序覆盖前序优化。审查完成后由队长主持冲突解决会议。

##### Team 组成

| 队友 | Skill | 审查维度 | 输出 |
|------|-------|---------|------|
| 语言审查员 | `copy-editing` | 语法、流畅、清晰 | 语言审查报告 |
| 品牌审查员 | `brand-voice-coach` | 品牌语气一致性 | 品牌审查报告 |
| 心理学审查员 | `marketing-psychology` | 说服力、框架一致性 | 心理学审查报告 + 评分 |
| SEO 审查员 | `seo-geo` | 关键词、Meta、Schema | SEO 审查报告 |

##### Team 执行流程

```
1. 队长创建 Agent Team
   → 创建 4 个队友，分别带有审查维度的 spawn prompt
   → 共享任务列表包含 4 个并行审查任务

2. 每个队友的 spawn prompt 结构:
   "你是 {角色} 审查员。审查以下文案，仅从 {维度} 角度出发。
    不要修改文案，只输出审查报告：问题列表 + 改进建议 + 评分(1-10)。

    ## 文案
    {Phase 2 输出的 v{N}.md 内容}

    ## 审查标准
    {对应 skill 的审查标准}

    ## 输出格式
    ### 问题列表
    | # | 位置 | 问题 | 严重度 | 建议修改 |

    ### 维度评分: X/10
    ### 关键改进建议 (最多 5 条)"

3. 四个队友并行审查
   → 各自输出审查报告到 docs/content/{page}/.working/review-{维度}.md

4. 队长汇总 + 冲突解决
   → 收集 4 份报告
   → 识别冲突（常见冲突见下表）
   → 按优先级规则解决冲突
   → 生成统一修改清单

5. 队长应用修改
   → 基于修改清单更新 v{N}.md
   → 记录冲突解决决策到 .working/conflict-resolution.md
```

##### 常见冲突及解决规则

| 冲突类型 | 例子 | 解决规则 |
|----------|------|---------|
| SEO vs 说服力 | SEO 要求关键词密度，心理学要求自然流畅 | **说服力优先**，关键词仅在不破坏阅读体验时融入 |
| 品牌克制 vs 心理学激进 | 品牌要求"专业务实"，心理学建议"痛点放大" | **品牌基调优先**，在品牌框架内寻找心理学表达 |
| 语言简洁 vs SEO 完整 | 语言审查删冗余，SEO 要求信息完整 | **按区块判断**：Hero 简洁优先，正文 SEO 优先 |
| 品牌一致 vs 语言优化 | 品牌要求固定术语，语言审查建议替换 | **品牌术语不变**，仅优化非品牌表达 |

##### 说服力评分处理（Team 模式）

心理学审查员的评分仍然触发优化轮：
- 评分 ≥ 7/10 → 队长完成冲突解决，输出最终 v{N}.md
- 评分 < 7/10 → 队长清理团队，回到 Phase 2 优化轮，优化后重新组建 Team 审查

##### Team 模式输出

```
docs/content/{page}/.working/
├── review-language.md           # 语言审查报告
├── review-brand.md              # 品牌审查报告
├── review-psychology.md         # 心理学审查报告
├── review-seo.md                # SEO 审查报告
└── conflict-resolution.md       # 冲突解决记录
```

**输出**: 更新 `v{N}.md`（Team 审查完成）

---

### Phase 4: 本地化 (可选)

**触发条件**：用户明确要求多语言版本

**调用**: `translation-assistant`

```markdown
## 源语言
English

## 目标语言
简体中文

## 翻译要求
- 保持品牌语气
- 技术术语参考 PROJECT-BRIEF.md 术语表
- 不直译，保持自然流畅

## 术语表
{PROJECT-BRIEF.md 附录：术语表}

## 输入
{Phase 3 输出}
```

**输出**: 更新 `v{N}.md`（添加中文翻译）或生成 i18n JSON

---

### Phase 5: 用户评审

**调用**: `AskUserQuestion`

```
评审文案 docs/content/{page}/v{N}.md

1. 整体满意度？
   - 满意，定稿
   - 需要调整

2. 满意的部分？ (多选)
   - 信息层级
   - 语气调性
   - 说服力
   - CTA 设计
   - SEO 优化
   - 其他: [自由填写]

3. 不满意的部分？ (多选)
   - 信息层级
   - 语气调性
   - 说服力
   - CTA 设计
   - SEO 优化
   - 其他: [自由填写]

4. 具体反馈？ (自由文本)
```

---

### Phase 6: 迭代或定稿

**IF 需要调整**:

```
1. 分析反馈
   - 策略层面问题 → 回到 Phase 1
   - 文案层面问题 → 回到 Phase 2
   - 审查层面问题 → 回到 Phase 3 对应子阶段
   - 翻译问题 → 回到 Phase 4

2. 版本递增
   - 生成 v{N+1} 系列文件

3. 继续 Phase 5
```

**IF 满意**:

```
1. 重命名定稿
   - mv v{N}.md → v{N}-final.md

2. 生成 i18n JSON（如需要）
   - messages/en/{page}.json
   - messages/zh/{page}.json

3. 提示下一步
   - "文案定稿完成，可运行 /dwf 进入设计流程"
```

---

## 质量维度

| 维度 | Sequential 对应 | Team 对应 | 目标 |
|------|----------------|-----------|------|
| **语言质量** | 3a.1 copy-editing | 语言审查员 | 语法正确、表达流畅 |
| **品牌一致** | 3a.2 brand-voice-coach | 品牌审查员 | 符合品牌语气 |
| **说服力** | 3b marketing-psychology | 心理学审查员 | 心理学原则有效应用 |
| **搜索可见** | 3c seo-geo | SEO 审查员 | SEO/GEO 优化 |

---

## 页面文案模板

### 输出格式

```markdown
# {页面名称} - v{N}

## Meta
- Title: {SEO 标题}
- Description: {Meta description}
- Keywords: {关键词}

## 心理学框架
- 框架: {AIDA / PAS / PASTOR / 4Ps}
- 说服力评分: {X}/10 (Deep 模式)

---

## Section 1: {区块名称}
**心理学目标**: {目标}

### Headline
{标题}

### Body
{正文}

### CTA
{行动号召}

---

## Section N: ...
```

---

## 会话恢复

如果 cwf 中断后恢复：

```
/cwf

→ 检测到 docs/content/{page}/ 存在
→ 显示当前状态 (Phase N, 版本 vN, 模式)
→ 询问: 继续当前版本 / 开始新版本
```

---

## 示例执行

### 示例 1: Deep + Sequential（经典模式）

```
用户: /cwf

Agent: [AskUserQuestion]
  页面类型？ → homepage
  执行模式？ → Deep
  目标受众？ → 全部
  转化目标？ → 询盘
  基于已有版本？ → 新建
  并行方案数？ → 1
  审查模式？ → sequential

Agent:
  → 读取 PROJECT-BRIEF.md
  → Phase 1: 调用 positioning-messaging + 选择心理学框架 (AIDA)
  → Phase 2: 调用 copywriting (单方案)
  → Phase 3a: copy-editing → brand-voice-coach
  → Phase 3b: marketing-psychology → 评分 6/10，触发优化轮
  → Phase 2 (优化轮): 针对性优化 CTA 和社会证明
  → Phase 3a: 重新审查
  → Phase 3b: 评分 8/10，通过
  → Phase 3c: seo-geo
  → Phase 5: 请评审 docs/content/homepage/v5.md

用户: 满意

Agent:
  → 重命名为 v5-final.md
  → 完成，提示可运行 /dwf
```

### 示例 2: Deep + Variants + Team（全功能模式）

```
用户: /cwf

Agent: [AskUserQuestion]
  页面类型？ → homepage
  执行模式？ → Deep
  目标受众？ → 全部
  转化目标？ → 询盘
  基于已有版本？ → 新建
  并行方案数？ → 3
  审查模式？ → team

Agent:
  → 读取 PROJECT-BRIEF.md
  → Phase 1: 调用 positioning-messaging + 选择心理学框架 (AIDA)
  → Phase 2: 并行派发 3 个 subagent
    → Subagent A: 技术理性风格 → v1-A.md
    → Subagent B: 痛点叙事风格 → v1-B.md
    → Subagent C: 权威证明风格 → v1-C.md
  → [AskUserQuestion] 请选择方案

用户: A 的开头很好，B 的中间说服力强，合并

Agent:
  → 合并 A 开头 + B 中段 → v1.md
  → Phase 3 (Team 模式): 创建 Agent Team
    → 语言审查员: review-language.md
    → 品牌审查员: review-brand.md
    → 心理学审查员: review-psychology.md (评分 8/10)
    → SEO 审查员: review-seo.md
  → 队长汇总: SEO 建议的关键词插入与品牌审查冲突
    → 解决: 品牌术语保留，仅在非品牌表达中融入关键词
  → 应用修改 → v1.md 更新
  → 清理 Agent Team
  → Phase 5: 请评审 docs/content/homepage/v1.md

用户: 满意

Agent:
  → 重命名为 v1-final.md
  → 完成，提示可运行 /dwf
```

---

## 与其他 Workflow 的衔接

```
cwf 完成
    ↓
提示: "文案定稿，可运行 /dwf 进入设计流程"
    ↓
dwf 读取 docs/content/{page}/v{N}-final.md
    ↓
dwf 完成
    ↓
提示: "设计定稿，可运行 /iwf 进入开发流程"
```

---

现在告诉我：

1. **页面类型**？
2. **执行模式**？（Standard / Deep）
3. **目标受众侧重**？（可选）
4. **主要转化目标**？（可选）
5. **基于已有版本**？（可选）
6. **并行方案数**？（1 / 2 / 3，默认 1）
7. **审查模式**？（sequential / team，默认 sequential）
