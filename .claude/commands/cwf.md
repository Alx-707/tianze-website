---
name: cwf
description: Copywriting Workflow - 策略规划 → 文案生成 → 审查 → 定稿
user-invocable: true
---

# Copywriting Workflow (C-WF)

从策略规划到文案定稿的完整流程。

```
cwf = 文案编排器
├── Phase 0: 初始化
├── Phase 1: 策略规划（positioning-messaging / content-strategy）
├── Phase 2: 文案生成（copywriting skill）
├── Phase 3: 多维审查（copy-editing + SEO skills）
├── Phase 4: 用户评审 → 迭代或定稿
└── 衔接: /dwf 进入设计流程
```

**输出**：`docs/cwf/{page}/v{N}.md` + 可选 i18n JSON

---

## Phase 0: 初始化

**自动读取：** `docs/cwf/context/project-brief.md`

**询问用户：**

1. 页面类型？（homepage / products / about / contact / faq / cases）
2. 目标受众侧重？（全部 / 承包商 / 系统集成商 / 批发商 / OEM）
3. 主要转化目标？（询盘 / 样品 / 了解更多）
4. 基于已有版本？（新建 / 选择已有版本）

**自动处理：** 扫描 `docs/cwf/{page}/` → 确定版本号 v{N}。

---

## Phase 1: 策略规划

**Skill 选择：**
- 首页、关于页 → `positioning-messaging`（侧重定位）
- 其他页面 → `content-strategy`（侧重内容结构）

**输出：** 核心信息层级、区块结构、CTA 策略、心理学框架（AIDA / PAS / 4Ps）。

心理学框架参考：

| 框架 | 适用 |
|------|------|
| AIDA | 通用首页、产品页 |
| PAS | 痛点驱动页面 |
| 4Ps | B2B 决策页 |

---

## Phase 2: 文案生成

**调用 skill**: `copywriting`

输入 Phase 1 策略 + PROJECT-BRIEF.md 品牌素材（价值主张、产品信息、客户痛点、内容边界）。

**输出**: `docs/cwf/{page}/v{N}.md`

---

## Phase 3: 多维审查

### 3a: 文案润色

**调用 skill**: `copy-editing`

审查语法、流畅性、清晰度、冗余。品牌语气对照 PROJECT-BRIEF.md 语气标准（专业、可信、技术导向、无夸大）。

### 3b: SEO 审查

**调用 skill**: `seo-content`（文案内容优化）+ `seo-page`（页面级 SEO）

关键词自然融入、标题层级、Meta description、Schema markup 建议。

SEO 放最后，避免 SEO 优化破坏说服力。有冲突时说服力优先。

**输出**: 更新 `v{N}.md`

---

## Phase 4: 用户评审

展示文案，收集反馈：

| 反馈类型 | 处理 |
|----------|------|
| 策略方向不对 | 回 Phase 1 |
| 文案内容问题 | 回 Phase 2 |
| 语言/SEO 问题 | 回 Phase 3 |
| 满意 | 定稿 |

**定稿**：重命名 `v{N}.md` → `v{N}-final.md`，生成 i18n JSON（如需要）。

---

## 输出结构

```
docs/cwf/{page}/
├── v1.md
├── v{N}-final.md       # 定稿
messages/                # 可选
├── en/{page}.json
└── zh/{page}.json
```

## 完成提示

```
文案定稿完成: docs/cwf/{page}/v{N}-final.md
下一步: /dwf → 读取定稿进入设计流程
```

## 会话恢复

检测到 `docs/cwf/{page}/` 存在 → 显示当前状态 → 询问：继续 / 新版本。
