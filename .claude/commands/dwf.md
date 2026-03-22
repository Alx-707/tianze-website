---
name: dwf
description: Design Workflow - 设计系统规范 → HTML 原型 → 迭代评审 → 开发交接文档
user-invocable: true
---

# Design Workflow (D-WF) — Impeccable Edition

## 概述

从文案定稿到 HTML 原型确认，生成开发交接文档。设计智能委托 Impeccable skills。

```
dwf = 设计编排器 (Impeccable Edition)
├── Phase 0: 初始化 + 上下文检查
│   └── CLAUDE.md 有 Design Context？→ 否 → teach-impeccable
├── Phase 1: 设计生成
│   └── frontend-design skill + token/motion/grid 约束 + 文案
├── Phase 2: 自动质量审计
│   └── audit skill → 五维报告
├── Phase 3: 用户评审 + 精准迭代
│   └── 中文反馈 → 映射 Impeccable 命令 → 执行 → 重审计 → 循环
├── Phase 4: 生产加固
│   └── harden → polish → optimize
└── Phase 5: 定稿 + 交接
    └── extract（可选）→ HANDOFF.md → README.md
```

**不包含**：组件开发（由开发者根据 HANDOFF.md 执行）

---

## 输入参数

### 固定（自动获取）

| 参数 | 来源 |
|------|------|
| **项目文档** | `docs/content/PROJECT-BRIEF.md` |
| **生产 Token（权威）** | `src/app/globals.css` |
| **Token 规范** | `docs/design/system/TIANZE-DESIGN-TOKENS.md` |
| **动效约束** | `docs/design/system/MOTION-PRINCIPLES.md` |
| **栅格系统** | `docs/design/system/GRID-SYSTEM.md` |

### 用户输入

| 参数 | 必填 | 说明 |
|------|------|------|
| **页面** | ✓ | 对应 `docs/content/` 下的目录 |
| **文案版本** | ✓ | 对应 `docs/content/{页面}/` 下的定稿文件 |
| **风格备注** | 可选 | 不填则沿用设计系统 |
| **Token 约束级别** | 可选 | 参考（默认）/ 约束（严格匹配） |

---

## 输出结构

```
docs/design/
├── system/                       # 全局设计系统（已有）
│
├── {page}/                       # 按页面组织（如 homepage/）
│   ├── prototype/                # dwf HTML 原型
│   │   ├── v{N}/
│   │   │   ├── index.html
│   │   │   ├── audit-report.md   # Phase 2 审计报告
│   │   │   └── feedback.md       # Phase 3 用户反馈
│   │   └── final/
│   ├── HANDOFF.md                # 开发交接文档
│   └── README.md                 # 页面设计概述
│
└── archive/                      # 归档旧文件
```

---

## 执行协议

### Phase 0: 初始化

```
1. 上下文检查
   - 读取 CLAUDE.md，检查是否含 "## Design Context"
   - IF 不存在 → 先运行 teach-impeccable skill
     → 它会扫描代码库并写入 Design Context 区块
   - IF 存在 → 继续

2. 询问用户输入 [AskUserQuestion]
   - 页面类型？ (列出 docs/content/ 下的目录)
   - 文案版本？ (列出对应目录下的文件)
   - 风格备注？ (可选，自由文本)
   - Token 约束级别？ (参考 | 约束，默认参考)

3. 自动处理
   - 读取 PROJECT-BRIEF.md
   - 读取 globals.css（生产 Token，权威来源）
   - 读取 TIANZE-DESIGN-TOKENS.md（Token 规范参考）
   - 读取 MOTION-PRINCIPLES.md
   - 读取 GRID-SYSTEM.md
   - 读取用户指定的文案文件
   - 检测已有版本 → 生成项目名称 (tianze-{页面}-v{N})
   - 创建输出目录结构
```

**品牌基础提取**（从 PROJECT-BRIEF.md）：

```
- 公司类型: Manufacturer + Trader (工贸一体)
- 行业: PVC pipe fittings manufacturer
- 规模: 60 employees, 20+ countries
- 核心差异化: Not just a pipe seller — upstream bending machine manufacturer
- 关键优势: 系统弯管能力、设备研发、非标定制、气动管服务、一体化生产
```

---

### Phase 1: 设计生成

**调用**: `frontend-design` skill

**Prompt 结构**：

```markdown
## 品牌上下文
{Phase 0 提取的品牌基础}

## 设计 Token 约束
{globals.css 中的语义 Token + TIANZE-DESIGN-TOKENS.md 规范}

约束级别: {参考 | 约束}
- 参考: Token 作为指导方向，允许合理变化
- 约束: 严格匹配 globals.css 中定义的颜色、间距、字体

## 动效约束
{MOTION-PRINCIPLES.md 关键规则}

## 栅格系统
{GRID-SYSTEM.md 关键规则}

## 文案内容
{用户指定的定稿文案文件内容}

## 视觉风格
{用户的风格备注，或 "沿用设计系统"}

## 技术上下文
- 框架: Next.js 16 + React 19 + Tailwind CSS 4
- 字体: Figtree (sans) + JetBrains Mono (mono)
- 图标: Lucide Icons

## 硬约束
- 主色调: Steel Blue #004d9e
- 圆角: 8px base (0.5rem)，按钮 6px
- 动画: ease-out 默认，hero 入场可用 spring easing
- Shadow-border 技术: 用 box-shadow 模拟边框实现平滑过渡 (Vercel 技法)
- 杜绝: AI slop（渐变滥用、过度光效、通用插图、空洞标题）
- 杜绝: 过度 SaaS 模板感（彩色渐变背景、过度圆润）
```

**输出**: `docs/design/{page}/prototype/v{N}/index.html`

---

### Phase 2: 自动质量审计

**调用**: `audit` skill

对 Phase 1 生成的原型进行五维检查：

| 维度 | 检查内容 |
|------|---------|
| **Accessibility** | 颜色对比度、语义 HTML、ARIA 标签、键盘导航 |
| **Performance** | 图片优化建议、CSS 复杂度、动画性能 |
| **Theming** | 与 globals.css Token 一致性、设计系统合规 |
| **Responsive** | 断点适配、触控目标尺寸、内容溢出 |
| **Anti-patterns** | AI slop 检测、SaaS 模板感、品牌一致性 |

**输出**: `docs/design/{page}/prototype/v{N}/audit-report.md`

**自动修复**：如审计发现严重问题（Critical/High），自动修复后重新审计，不进入用户评审。

---

### Phase 3: 用户评审 + 精准迭代

**调用**: `AskUserQuestion`

```
评审原型 docs/design/{page}/prototype/v{N}/index.html

审计结果摘要:
{audit-report.md 的评分和关键发现}

请提供反馈（中文即可，我会映射到精确的设计命令）:
```

**反馈→命令映射**：

| 用户反馈关键词 | Impeccable 命令 | 说明 |
|---------------|----------------|------|
| 配色不对/颜色 | `colorize` | 调整色彩方案 |
| 颜色太杂/不统一 | `normalize` | 统一配色到 globals.css Token |
| 太素/太简单/没特色 | `bolder` | 增加视觉冲击力 |
| 太花/太复杂/太闹 | `quieter` | 降低视觉噪音 |
| 太花 + 信息密度低 | `distill` | 蒸馏核心，去除冗余 |
| 布局问题/间距 | `adapt` + `normalize` | 调整布局和统一间距 |
| 字体/排版 | `normalize`（排版聚焦） | 统一排版规范 |
| 动效/交互 | `animate` | 添加或调整动效 |
| 微文案/按钮文字 | `clarify` | 优化界面文案 |
| 像 AI 生成的 | `critique` → `bolder` | 先诊断后增强差异化 |
| 响应式/手机端 | `adapt` | 适配不同屏幕 |
| 整体打磨 | `polish` | 全面细节提升 |
| 让人愉悦/惊喜 | `delight` | 添加愉悦感细节 |
| 满意，继续 | → Phase 4 | 进入生产加固 |

**执行流程**：

```
1. 解析用户反馈 → 映射到 Impeccable 命令
2. 告知用户即将执行的命令（透明化）
3. 执行命令 → 生成 v{N+1}
4. 记录反馈到 feedback.md
5. 重新 audit → 生成新的 audit-report.md
6. 回到用户评审 → 循环直到满意
```

---

### Phase 4: 生产加固

用户确认满意后，自动执行三步加固：

```
1. harden  → 边界情况防护（极长文本、空状态、RTL、高对比模式）
2. polish  → 像素级细节打磨（对齐、间距微调、过渡曲线）
3. optimize → 性能优化（CSS 精简、动画性能、加载策略）
```

**输出**: `docs/design/{page}/prototype/v{N+1}/index.html`（加固版本）

---

### Phase 5: 定稿 + 交接

```
1. 复制最终版本
   - cp -r docs/design/{page}/prototype/v{最终}/ → docs/design/{page}/prototype/final/

2. 可选: extract
   - 如果设计系统需要更新，运行 extract 提取新的 Token
   - 更新 docs/design/system/ 相关文件

3. 生成 HANDOFF.md
4. 生成 README.md
```

**HANDOFF.md 模板**:

```markdown
# {项目名称} 开发交接文档

## 设计概述
- 视觉风格: {确认的风格描述}
- 迭代次数: {N}
- 最终版本: v{N}

## 设计系统参考
- 生产 Token: src/app/globals.css (权威)
- Token 规范: docs/design/system/TIANZE-DESIGN-TOKENS.md
- 动效规范: docs/design/system/MOTION-PRINCIPLES.md
- 栅格系统: docs/design/system/GRID-SYSTEM.md

### 配色
| Token | 值 | 用途 |
|-------|----|----|

### 字体
| 类型 | 字体 | 大小 |
|------|-----|------|

### 间距
| Token | 值 |
|-------|-----|

## 组件拆分建议
基于 HTML 原型结构，建议拆分为以下组件:

1. **Hero**: {描述}
2. **ProductLines**: {描述}
3. ...

## 技术注意事项

### i18n
- 所有文案需通过 next-intl 管理
- 翻译文件位置: messages/{locale}/

### 响应式
- 原型为桌面优先
- 需补充移动端适配 (断点: 768px, 1024px)

### 现有组件复用
- 检查 src/components/ 是否有可复用组件
- 优先复用 shadcn/ui 组件

## 审计报告
{最终版本的 audit-report.md 摘要}

## 原型文件
- HTML 原型: docs/design/{page}/prototype/final/index.html
- 设计规范: docs/design/system/TIANZE-DESIGN-TOKENS.md

## 迭代历史
| 版本 | 日期 | 变更摘要 |
|------|------|---------|
```

**README.md 模板**:

```markdown
# {项目名称}

## 状态
设计确认，待开发

## 概述
- 页面: {页面类型}
- 文案版本: {版本}
- 视觉风格: {风格描述}

## 文件结构
- `src/app/globals.css` - 生产 Token (权威)
- `docs/design/system/TIANZE-DESIGN-TOKENS.md` - Token 规范
- `docs/design/{page}/prototype/final/index.html` - 最终 HTML 原型
- `docs/design/{page}/HANDOFF.md` - 开发交接文档

## 迭代记录
| 版本 | 状态 | 反馈摘要 |
|------|------|---------|

## 下一步
使用 HANDOFF.md 指导组件开发，运行 `/superpowers:brainstorming` 进入 BDD 开发流程
```

---

## 完成提示

dwf 完成后，输出：

```
设计定稿完成

产物:
- 设计 Token: src/app/globals.css (生产) + docs/design/system/TIANZE-DESIGN-TOKENS.md (规范)
- HTML 原型: docs/design/{page}/prototype/final/index.html
- 审计报告: docs/design/{page}/prototype/final/audit-report.md
- 交接文档: docs/design/{page}/HANDOFF.md

下一步:
- 运行 /superpowers:brainstorming 进入 BDD 开发流程
- brainstorming 将读取 HANDOFF.md 作为开发规范
```

---

## 会话恢复

如果 dwf 中断后恢复：

```
/dwf

→ 检测到 docs/design/{page}/ 存在
→ 显示当前状态 (Phase N, 版本 vN)
→ 询问: 继续当前项目 / 开始新版本 / 开始新项目
```

---

## 示例执行

```
用户: /dwf

Agent: [检查 CLAUDE.md → Design Context 存在]
Agent: [AskUserQuestion]
  页面类型？ → products
  文案版本？ → v2-final
  风格备注？ → 产品目录感，清晰的分类导航
  Token 约束级别？ → 参考

Agent:
  → 读取 PROJECT-BRIEF.md + globals.css Token + 文案
  → Phase 1: frontend-design → 生成 prototype/v1/index.html
  → Phase 2: audit → 生成 audit-report.md (Score: 82/100)
  → Phase 3: 请评审

用户: 配色满意，但布局太拥挤，CTA 按钮文字不够明确

Agent:
  → 映射: adapt (布局) + clarify (微文案)
  → 执行 → v2/index.html
  → 重新 audit → audit-report.md (Score: 89/100)
  → Phase 3: 请评审

用户: 满意

Agent:
  → Phase 4: harden → polish → optimize → v3/index.html
  → Phase 5: 复制到 final/ → 生成 HANDOFF.md + README.md
  → 完成
```

---

现在告诉我：

1. **页面类型**？
2. **文案版本**？
3. **风格备注**？（可选）
4. **Token 约束级别**？（参考 / 约束，默认参考）
