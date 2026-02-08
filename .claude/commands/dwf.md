---
name: dwf
description: Design Workflow - 设计系统规范 → HTML 原型 → 迭代评审 → 开发交接文档
user-invocable: true
---

# Design Workflow (D-WF)

## 概述

从设计方向到 HTML 原型确认，生成开发交接文档。

```
dwf = 设计编排器
├── ui-ux-pro-max → 设计系统规范
├── frontend-design → HTML 原型
├── 用户评审 → 迭代循环
└── HANDOFF.md → 开发交接
```

**不包含**：组件开发（由开发者根据 HANDOFF.md 执行）

---

## 输入参数

### 固定（自动获取）

| 参数 | 来源 |
|------|------|
| **项目文档** | `docs/content/PROJECT-BRIEF.md`（唯一基础输入） |
| **项目名称** | 自动生成 `tianze-{页面}-v{版本}` |

### 用户输入

| 参数 | 必填 | 说明 |
|------|------|------|
| **页面** | ✓ | 对应 `docs/content/` 下的目录 |
| **文案版本** | ✓ | 对应 `docs/content/{页面}/` 下的文案文件 |
| **视觉风格** | 可选 | 不填则 AI 自由发挥 |
| **考虑现有 token** | 可选 | 默认「忽略」 |

---

## 输出结构

```
docs/design/
├── system/                       # 全局设计系统
│   ├── MASTER.md                 # 最终设计规范
│   └── v{N}.md                   # 规范版本历史
│
├── {page}/                       # 按页面组织（如 homepage/）
│   ├── stitch/                   # Stitch 输出
│   │   ├── prompt/               # 输入 prompt
│   │   │   └── v{N}.md
│   │   └── output/               # 生成结果
│   │       └── v{N}/
│   │           ├── screenshot/
│   │           └── code/
│   ├── prototype/                # dwf HTML 原型
│   │   ├── v{N}/
│   │   │   ├── index.html
│   │   │   └── feedback.md
│   │   └── final/
│   ├── HANDOFF.md                # 开发交接文档
│   └── README.md                 # 页面设计概述
│
└── _templates/                   # Stitch 通用模板
    └── stitch/
```

---

## 执行协议

### Phase 0: 初始化

```
1. 询问用户输入 [AskUserQuestion]
   - 页面类型？ (列出 docs/content/ 下的目录)
   - 文案版本？ (列出对应目录下的文件)
   - 视觉风格？ (可选，自由文本)
   - 考虑现有设计 token？ (忽略 | 参考 | 约束，默认忽略)

2. 自动处理
   - 读取 PROJECT-BRIEF.md
   - 检测已有版本 → 生成项目名称 (tianze-{页面}-v{N})
   - 创建输出目录结构
```

**品牌基础提取**（从 PROJECT-BRIEF.md）：

```
- 公司类型: Manufacturer + Trader (工贸一体)
- 行业: PVC pipe fittings manufacturer
- 规模: 60 employees, 100+ countries
- 核心差异化: Not just a pipe seller — upstream bending machine manufacturer
- 关键优势: 系统弯管能力、设备研发、非标定制、气动管服务、一体化生产
```

---

### Phase 1: 设计系统规范

**调用**: `ui-ux-pro-max` skill

```bash
# 1. 生成设计系统（skill 位于用户主目录）
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py \
  "{品牌基础关键词} {用户视觉风格}" \
  --design-system -p "{项目名称}"

# 2. 移动输出到正确位置（skill 默认输出到当前目录 design-system/）
mkdir -p docs/design/system/
mv design-system/MASTER.md docs/design/system/v{N}.md
rm -rf design-system/  # 清理临时目录
```

**输出**: `docs/design/system/v{N}.md`

**如果用户选择「参考」或「约束」现有 token**：
- 读取 `src/app/globals.css` 中的设计变量
- 作为额外上下文传递给 ui-ux-pro-max（在 prompt 中附加）

**注意**：所有品牌、产品、受众信息均来自 PROJECT-BRIEF.md，无需读取其他文件。

---

### Phase 2: HTML 原型生成

**调用**: `frontend-design`

**Prompt 结构**：

```
## 品牌上下文
{Phase 0 提取的品牌基础}

## 设计规范
{Phase 1 生成的设计系统摘要}

## 文案内容
{用户指定的文案文件内容}

## 视觉风格
{用户指定的风格关键词，或 "自由发挥，基于品牌基础探索"}

## 输出要求
- 单个 HTML 文件，包含内联 CSS
- 桌面优先，但考虑响应式结构
- 保持文案的区块结构
```

**输出**: `docs/design/{page}/prototype/v{N}/index.html`

---

### Phase 3: 用户评审

**调用**: `AskUserQuestion`

```
评审原型 docs/design/{page}/prototype/v{N}/index.html

1. 整体感觉？
   - 满意，继续
   - 需要调整

2. 满意的元素？ (多选)
   - 配色方案
   - 排版布局
   - 字体选择
   - 视觉层次
   - 动效/交互
   - 其他: [自由填写]

3. 不满意的元素？ (多选)
   - 配色方案
   - 排版布局
   - 字体选择
   - 视觉层次
   - 动效/交互
   - 其他: [自由填写]

4. 具体反馈？ (自由文本)
```

**记录**: 保存到 `docs/design/{page}/prototype/v{N}/feedback.md`

---

### Phase 4: 迭代或确认

**IF 需要调整**:

```
1. 分析反馈
   - 如果是设计系统层面 (配色、字体) → 回到 Phase 1
   - 如果是原型层面 (布局、细节) → 回到 Phase 2

2. 版本递增
   - 生成新的 docs/design/system/v{N+1}.md 或 docs/design/{page}/prototype/v{N+1}/

3. 继续 Phase 3
```

**IF 满意**:

```
1. 复制最终版本
   - cp docs/design/system/v{最终}.md → docs/design/system/MASTER.md
   - cp -r docs/design/{page}/prototype/v{最终}/ → docs/design/{page}/prototype/final/

2. 进入 Phase 5
```

---

### Phase 5: 生成开发交接文档

**输出**: `docs/design/{page}/HANDOFF.md`

```markdown
# {项目名称} 开发交接文档

## 设计概述
- 视觉风格: {确认的风格描述}
- 迭代次数: {N}
- 最终版本: v{N}

## 设计系统摘要
{从 MASTER.md 提取关键信息}

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

## 原型文件
- HTML 原型: docs/design/{page}/prototype/final/index.html
- 设计规范: docs/design/system/MASTER.md

## 迭代历史
| 版本 | 日期 | 变更摘要 |
|------|------|---------|
```

---

### Phase 6: 生成项目 README

**输出**: `docs/design/{page}/README.md`

```markdown
# {项目名称}

## 状态
✅ 设计确认，待开发

## 概述
- 页面: {页面类型}
- 文案版本: {版本}
- 视觉风格: {风格描述}

## 文件结构
- `docs/design/system/MASTER.md` - 最终设计规范
- `docs/design/{page}/prototype/final/index.html` - 最终 HTML 原型
- `docs/design/{page}/HANDOFF.md` - 开发交接文档

## 迭代记录
| 版本 | 状态 | 反馈摘要 |
|------|------|---------|

## 下一步
使用 HANDOFF.md 指导组件开发，运行 `/iwf` 进入开发流程
```

---

## 完成提示

dwf 完成后，输出：

```
✅ 设计定稿完成

产物:
- 设计规范: docs/design/system/MASTER.md
- HTML 原型: docs/design/{page}/prototype/final/index.html
- 交接文档: docs/design/{page}/HANDOFF.md

下一步:
- 运行 /iwf 进入开发流程
- iwf 将读取 HANDOFF.md 作为开发规范
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

Agent: [AskUserQuestion]
  页面类型？ → homepage
  文案版本？ → v4.1-final
  视觉风格？ → 工业质感，蓝图美学，精密工程感
  考虑现有 token？ → 忽略

Agent:
  → 页面: homepage
  → 输出目录: docs/design/homepage/
  → Phase 1: 生成设计系统规范
  → Phase 2: 生成 HTML 原型
  → Phase 3: 请评审 docs/design/homepage/prototype/v1/index.html

用户: 配色满意，但布局太拥挤

Agent:
  → 记录反馈到 feedback.md
  → Phase 2: 生成 docs/design/homepage/prototype/v2/
  → Phase 3: 请评审

用户: 满意

Agent:
  → Phase 5: 生成 HANDOFF.md
  → Phase 6: 生成 README.md
  → 完成
```

---

现在告诉我：

1. **页面类型**？
2. **文案版本**？
3. **视觉风格**？（可选）
4. **考虑现有设计 token**？（默认忽略）
