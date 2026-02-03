# Google Stitch 调研报告

**调研时间**: 2026-02-02
**调研模式**: Deep
**置信度**: 0.88
**搜索轮次**: 7
**Hop 深度**: 3（官方文档 → 社区讨论 → MCP 实现）

---

## 执行摘要

Google Stitch 是 Google Labs 于 2025 年 Google I/O 大会推出的 AI 驱动 UI 设计工具，基于 Gemini 2.5 Pro/Flash 模型，通过自然语言提示或手绘草图生成响应式 UI 设计和前端代码。**核心价值在于弥合设计与开发的鸿沟**，将传统需要多轮迭代的设计-开发流程压缩至分钟级。

**关键特性**:
- 文本/图片转 UI（Text-to-UI / Sketch-to-UI）
- 导出至 Figma 或代码（HTML/Tailwind CSS/React）
- 2026 新增 **Agent Skills** 框架，支持可编程工作流自动化
- 完整 MCP (Model Context Protocol) 服务器支持，可被外部 AI Agent 调用

**适用场景**: MVP 原型、初创团队快速迭代、设计系统文档生成；**不适用**: 需高度定制化或复杂交互的企业级应用。

---

## 1. 产品定位与核心问题

### 1.1 Stitch 是什么

Google Stitch 是一个 **实验性 AI UI 设计工具**（Google Labs 项目），通过 Gemini 2.5 系列模型的多模态能力，将设计概念（文字描述/草图/截图）转化为可视化 UI 界面和可执行前端代码。

**技术栈**:
- **AI 引擎**: Gemini 2.5 Pro（实验模式）/ Gemini 2.5 Flash（标准模式）
- **代码生成**: HTML/CSS、Tailwind CSS、React/JSX
- **协作集成**: Figma（粘贴导入）、MCP 服务器（AI Agent 互操作）

### 1.2 解决的核心问题

传统设计到开发流程痛点：
1. **设计师交付物**: Figma 设计稿 → 开发者手动实现 → 视觉还原差异 → 多轮返工
2. **原型成本高**: 简单的落地页或仪表盘需要 2-5 天人力
3. **文档缺失**: 设计系统规范（颜色、字体、间距）未系统化记录

Stitch 的解决方案：
- **自动化代码生成**: 设计稿直接输出语义化、可维护的代码（非低代码拖拽，而是纯代码）
- **设计一致性**: 通过 `extract_design_context` 工具提取"设计 DNA"（颜色、字体、布局模式），新生成屏幕自动继承
- **文档自动化**: Agent Skills 中的 `design-md` 技能可从视觉画布生成完整 Markdown 设计系统文档

---

## 2. 使用方法

### 2.1 Web 界面（基础用户）

#### 访问与启动
```
URL: https://stitch.withgoogle.com
前置条件: Google 账号登录
配额限制:
  - 标准模式（Gemini 2.5 Flash）: 350 次生成/月
  - 实验模式（Gemini 2.5 Pro）: 50 次生成/月
```

#### 标准模式工作流（Text-to-UI）
```
1. 选择平台: Mobile / Web
2. 输入提示词（Prompt）
   示例: "设计一个深色主题的加密货币仪表盘，包含投资组合卡片、
          饼图、趋势币种列表、价格走势图、新闻推送和底部导航栏"
3. 生成设计 → 迭代优化
   - 调整颜色: "将主色调改为森林绿"
   - 修改布局: "将 CTA 按钮放大并移至页面顶部"
   - 添加组件: "在头部添加搜索栏"
4. 导出选项:
   - 复制到 Figma（仅标准模式支持）
   - 下载代码（HTML/Tailwind CSS）
```

#### 实验模式工作流（Sketch-to-UI）
```
1. 上传草图/线框图（手绘照片或数字线框）
2. 提供文字描述补充细节
3. 生成设计 → 迭代
4. 导出代码（不支持 Figma）
```

### 2.2 CLI 交互（Gemini CLI 扩展）

#### 安装
```bash
gemini extensions install https://github.com/gemini-cli-extensions/stitch --auto-update
```

#### 认证配置
**方式 1: API Key（推荐个人使用）**
```bash
# 1. 在 Stitch 网页端生成 API Key:
#    个人头像 → Stitch Settings → API Keys → Create Key
# 2. 配置环境变量
export API_KEY="your-api-key"
sed "s/YOUR_API_KEY/$API_KEY/g" \
  ~/.gemini/extensions/Stitch/gemini-extension-apikey.json > \
  ~/.gemini/extensions/Stitch/gemini-extension.json
```

**方式 2: ADC（企业/生产环境）**
```bash
gcloud auth login
gcloud config set project $PROJECT_ID
gcloud auth application-default login
# 使用 gemini-extension-adc.json 配置文件
```

#### 核心命令
```bash
# 项目管理
/stitch What Stitch projects do I have?
/stitch Tell me details about my project [PROJECT_ID]

# 屏幕检索
/stitch Give me all screens of project [PROJECT_ID]
/stitch Download the image of screen [SCREEN_ID]
/stitch Download the HTML of screen [SCREEN_ID]

# 屏幕生成
/stitch Design a mobile app for skiing, using Gemini 3 Pro

# 提示词优化
/stitch Enhance this prompt: "一个电商落地页"
```

### 2.3 MCP 服务器集成（高级 AI Agent）

#### 什么是 MCP
Model Context Protocol（模型上下文协议）是 Anthropic 提出的标准化协议，用于 AI Agent 之间或 AI Agent 与工具之间的互操作。Stitch 提供官方 MCP 服务器，使外部 Agent（Claude、Cursor、Cline 等）能编程式访问设计项目。

#### 核心 MCP 工具（9 个）

| 工具名称 | 功能描述 | 典型用例 |
|---------|---------|---------|
| `extract_design_context` | 提取设计 DNA（颜色、字体、布局） | 新屏幕继承现有设计风格 |
| `generate_screen_from_text` | 基于文本+设计上下文生成屏幕 | AI Agent 自动生成一致风格的界面 |
| `fetch_screen_code` | 获取屏幕的 HTML/前端代码 | 导出实现代码 |
| `fetch_screen_image` | 下载高清屏幕截图 | 文档/演示素材 |
| `create_project` | 创建新项目容器 | 初始化工作空间 |
| `list_projects` | 列出所有可用项目 | 项目管理 |
| `list_screens` | 列出项目内所有屏幕 | 屏幕导航 |
| `get_project` | 获取项目元数据 | 项目详情查询 |
| `get_screen` | 获取屏幕详细信息 | 屏幕属性查询 |

#### 配置示例（Cursor/Claude Desktop）
```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "stitch-mcp"],
      "env": {
        "GOOGLE_CLOUD_PROJECT": "your-project-id"
      }
    }
  }
}
```

#### "Designer Flow" 最佳实践
```
1. 提取参考设计上下文
   extract_design_context(screen_id="reference-screen-123")
   → 返回: { colors: ["#1a1a1a", "#00ff88"], fonts: ["Inter"], ... }

2. 生成新屏幕（自动继承风格）
   generate_screen_from_text(
     prompt="用户个人资料页面，包含头像、统计数据和设置入口",
     design_context=<上一步返回的上下文>
   )
   → 新屏幕自动匹配颜色/字体/布局模式

3. 导出代码
   fetch_screen_code(screen_id="new-screen-456")
   → 返回 HTML/Tailwind CSS 代码
```

---

## 3. 工作机制与技术原理

### 3.1 核心架构

```
用户输入（文本/图片）
    ↓
Gemini 2.5 Pro/Flash（多模态理解）
    ↓
布局智能分析：
  - 语义解析（将"导航栏"映射为 <nav> 组件）
  - 元素关系推理（理解"登录按钮在头部右侧"的空间关系）
  - 设计 Token 映射（颜色 → Tailwind 变量，间距 → 8px 网格）
    ↓
组件树生成（React/HTML 结构）
    ↓
样式系统（Tailwind CSS / CSS 变量）
    ↓
代码输出 + 视觉预览
```

### 3.2 Gemini 2.5 技术特性

**多模态融合**:
- **原生训练**: 文本、图片、音频、视频同时训练（非后期拼接）
- **上下文窗口**: 32K 标准 / 100 万 token 扩展（支持超长设计稿分析）
- **推理能力**: Gemini 2.5 Pro 是首个内置"思维"能力的模型，擅长复杂布局推理

**Sparse MoE 架构**:
- 混合专家模型（Mixture of Experts）
- 每个 token 仅激活部分参数（专家），降低延迟
- TPU V5P 硬件加速

**布局智能**:
- 元素关系理解（父子、兄弟、Z-index）
- 层级组件树构建
- 响应式断点推理（虽然当前输出仍为静态布局）

### 3.3 Agent Skills 框架（2026 新增）

**概念**: 从单次提示交互升级为 **可编程工作流**

**架构**:
```
Agent Skills Framework
    ↓
模块化技能库（GitHub 开源）
  - design-md: 设计系统文档生成
  - react-components: React 组件代码生成
  - （社区可扩展更多技能）
    ↓
MCP 服务器（双向通信）
  - AI Agent 读取设计
  - AI Agent 修改设计
    ↓
CI/CD 集成（自动化管线）
```

**示例工作流**:
```yaml
# 伪代码示例
workflow: design-to-production
steps:
  1. 设计师在 Stitch 创建 UI
  2. Agent 触发 design-md 技能 → 生成 design-system.md
  3. Agent 触发 react-components → 生成组件代码
  4. 自动提交 PR 到代码仓库
  5. CI 运行视觉回归测试
```

---

## 4. 最佳实践与提示词工程

### 4.1 提示词原则

#### 核心策略
1. **简单起步，渐进细化**
   - 复杂应用: 先建立高层结构，再逐个屏幕细化
   - 简单界面: 一次性详细描述所有细节

2. **设置视觉基调**
   - ✅ "充满活力和鼓励的健身追踪应用"
   - ✅ "极简主义的冥想应用"
   - ❌ "一个应用"

3. **增量式修改**（每次提示仅修改 1-2 处）
   - ✅ "将主页头部的搜索栏字体放大"
   - ❌ "改颜色、调布局、加动画、换字体"（多个变更混杂）

4. **位置具体化**
   - ✅ "在登录页面将主 CTA 按钮放大"
   - ❌ "把按钮改大一点"（未指明哪个按钮、哪个页面）

#### 主题控制技巧
```
颜色:
  - 具体色: "森林绿 (#228B22)"
  - 情绪色: "温暖而吸引人的色调"

字体:
  - "使用俏皮的无衬线字体"
  - "采用 Inter 字体家族"

圆角:
  - "所有按钮完全圆角（border-radius: 9999px）"

图片修改:
  - 明确指出目标图片
  - 与主题更新同步（避免颜色不匹配）
```

### 4.2 避免的反模式

| 反模式 | 问题 | 正确做法 |
|--------|------|---------|
| 超长提示词 | AI 难以聚焦关键点 | 拆分为多次迭代 |
| 模糊位置 | "添加一个按钮" | "在导航栏右侧添加登录按钮" |
| 多重修改 | 一次改颜色+布局+字体 | 每次仅改一类属性 |
| 缺乏上下文 | "设计一个仪表盘" | "为马拉松跑者设计训练数据仪表盘" |

### 4.3 实战示例

#### 示例 1: 加密货币仪表盘
```
提示词（初始）:
"设计一个深色主题的加密货币跟踪应用，包含：
 1. 顶部：投资组合总值卡片（显示美元金额和 24h 涨跌百分比）
 2. 中部：持仓饼图（各币种占比）
 3. 下方：趋势币种列表（币名、图标、当前价格、涨跌用绿/红标注）
 4. 底部：价格走势图（折线图）
 5. 导航栏：首页、市场、资产、设置四个 Tab
颜色方案：深灰背景（#1a1a1a），霓虹绿强调色（#00ff88）"

迭代修改（第 2 轮）:
"将趋势币种列表的字体放大 20%，并为每个币种添加 Logo 占位符"

迭代修改（第 3 轮）:
"将投资组合总值卡片移至屏幕中心，增加阴影效果"
```

#### 示例 2: 健身追踪应用
```
提示词（高层概念）:
"一款为马拉松跑者设计的健身追踪应用，用于社区互动、寻找跑步伙伴、
 获取训练建议、查找附近比赛"

AI 自动扩展为:
  - 首页: 每日步数、卡路里、训练历史
  - 社区: 附近跑者列表、活动推荐
  - 训练: AI 教练建议、训练计划
  - 比赛: 地图视图展示附近赛事
```

### 4.4 导出后优化建议

**代码质量**:
- ✅ 语义化 HTML（`<nav>`, `<header>`, `<section>`）
- ✅ Tailwind CSS 变量（非硬编码颜色）
- ✅ 响应式断点（虽然初始生成为静态，可手动扩展）
- ⚠️ 需手动添加: 动画、状态管理、API 集成

**Figma 优化**:
- 导入后调整组件命名（AI 生成的默认命名较通用）
- 建立 Auto Layout 约束
- 替换占位图片为真实素材

---

## 5. LLM 如何有效使用 Stitch

### 5.1 MCP 集成模式（推荐）

**场景**: Claude/GPT/Gemini 等 AI Agent 通过 MCP 协议访问 Stitch

#### 典型工作流
```python
# 伪代码示例（基于 MCP 工具调用）

# 1. LLM 接收用户需求
user_request = "为我的 SaaS 产品生成一套设计系统"

# 2. 创建 Stitch 项目
project = mcp.call_tool("create_project", {
    "name": "SaaS Design System"
})

# 3. 生成关键屏幕
screens = []
for screen_type in ["登录页", "仪表盘", "设置页"]:
    screen = mcp.call_tool("generate_screen_from_text", {
        "prompt": f"{screen_type}，采用深色模式，主色调为靛蓝色",
        "model": "gemini-2-5-pro"
    })
    screens.append(screen)

# 4. 提取设计 DNA
design_dna = mcp.call_tool("extract_design_context", {
    "screen_id": screens[0]["id"]
})

# 5. 生成设计文档（调用 Agent Skill）
doc = mcp.call_tool("design-md", {
    "project_id": project["id"],
    "design_context": design_dna
})

# 6. 导出代码
for screen in screens:
    code = mcp.call_tool("fetch_screen_code", {
        "screen_id": screen["id"]
    })
    save_to_repo(code, f"{screen['name']}.tsx")
```

### 5.2 提示词增强策略

**LLM 应如何构建 Stitch 提示**:

```python
def generate_stitch_prompt(user_input):
    """
    将用户模糊需求转化为结构化 Stitch 提示
    """
    # 1. 提取核心需求
    components = extract_components(user_input)  # 按钮、卡片、图表...
    layout = infer_layout(user_input)            # 网格、堆叠、侧边栏...
    theme = extract_theme(user_input)            # 颜色、字体、情绪

    # 2. 构建分层提示
    prompt = f"""
    屏幕类型: {components['screen_type']}
    布局结构: {layout['structure']}

    核心组件:
    {format_components(components['list'])}

    视觉风格:
    - 色彩方案: {theme['colors']}
    - 字体: {theme['fonts']}
    - 圆角: {theme['border_radius']}
    - 阴影: {theme['shadows']}

    内容示例:
    {generate_placeholder_content()}
    """

    return prompt

# 示例输出
user_input = "我需要一个产品展示页"
stitch_prompt = generate_stitch_prompt(user_input)
# → "屏幕类型: 产品落地页
#    布局结构: 英雄区 + 3 列特性网格 + CTA 区域
#    核心组件:
#      - 导航栏（Logo + 菜单 + 登录按钮）
#      - 英雄区（标题 + 副标题 + 产品图 + 主 CTA）
#      - 特性卡片（图标 + 标题 + 描述）
#      - 页脚（链接 + 社交媒体图标）
#    视觉风格:
#      - 色彩方案: 现代渐变（#667eea → #764ba2）
#      - 字体: 无衬线（Inter）
#      - 圆角: 中等（12px）
#      - 阴影: 柔和提升效果
#    内容示例: [产品名称]、[关键特性]、[CTA 文案]"
```

### 5.3 多轮对话优化

**LLM 应实现的迭代逻辑**:

```
第 1 轮: 生成初始设计
  ↓
第 2 轮: 分析生成结果，识别不足
  - 调用 fetch_screen_image 获取预览
  - 通过视觉理解评估布局/颜色/层级
  ↓
第 3 轮: 发送精确修改指令
  - "将导航栏固定在顶部"
  - "增大 CTA 按钮 40%"
  ↓
第 4 轮: 验证修改
  - 再次获取预览
  - 若满足要求 → 导出代码
  - 若仍有问题 → 继续迭代
```

### 5.4 设计一致性保障

**LLM 关键职责**: 确保多屏幕设计风格统一

```python
# 推荐工作流
def ensure_design_consistency(project_id):
    # 1. 选择参考屏幕（通常是首页或核心页面）
    reference_screen = get_first_screen(project_id)

    # 2. 提取设计 DNA
    design_dna = extract_design_context(reference_screen)

    # 3. 后续所有屏幕强制继承
    for new_screen_prompt in remaining_screens:
        generate_screen_from_text(
            prompt=new_screen_prompt,
            design_context=design_dna  # 关键参数
        )

    # 4. 验证一致性
    all_screens = list_screens(project_id)
    for screen in all_screens:
        verify_colors_match(screen, design_dna['colors'])
        verify_fonts_match(screen, design_dna['fonts'])
```

### 5.5 局限性识别与规避

**LLM 应主动告知用户的限制**:

```
当用户需求包含以下内容时，LLM 应警告:

✗ 复杂动画（"添加页面切换动画"）
  → 建议: 在代码导出后手动添加 Framer Motion

✗ 高级交互（"实现拖拽排序"）
  → 建议: Stitch 生成静态布局，交互需开发者实现

✗ 响应式布局（"适配 iPad 和桌面端"）
  → 建议: 当前生成单一断点，需手动添加媒体查询

✗ 无障碍访问（"符合 WCAG AA 标准"）
  → 警告: 生成设计常有对比度不足问题，需人工审核

✗ 定制化组件（"设计一个 3D 卡片翻转效果"）
  → 建议: Stitch 适合常规 UI 模式，非常规效果需纯手工
```

---

## 6. 局限性与已知问题

### 6.1 设计质量限制

#### 无障碍问题（高优先级）
- **色彩对比度**: 生成设计常不符合 WCAG AA 标准（对比度 < 4.5:1）
- **触摸目标**: 按钮尺寸可能小于 44×44px（iOS 标准）
- **键盘导航**: 不生成 Tab 顺序或焦点样式
- **屏幕阅读器**: 缺少 ARIA 标签

**建议**: 导出后使用 axe DevTools 或 Lighthouse 审计

#### 设计同质化
- 倾向于"安全"的布局模式（卡片网格、侧边栏、顶部导航）
- 多个项目生成的设计视觉相似
- 缺乏创意性或品牌独特性

**适用场景**: 标准 B2B SaaS、仪表盘、管理后台
**不适用**: 品牌驱动的营销网站、艺术性作品集

### 6.2 技术限制

#### 响应式设计
- **当前状态**: 生成静态单断点布局
- **缺失**: 媒体查询、流式布局、容器查询
- **影响**: 桌面/移动端需分别生成

#### 交互与动画
- **静态输出**: 无状态管理、无事件处理
- **缺失**:
  - CSS 过渡/动画
  - JavaScript 交互逻辑
  - 表单验证
  - API 集成

**代码示例（当前输出 vs 实际需求）**:
```html
<!-- Stitch 输出（静态） -->
<button class="bg-blue-500 text-white px-4 py-2 rounded">
  提交
</button>

<!-- 实际需求（需手动添加） -->
<button
  class="bg-blue-500 hover:bg-blue-600 active:scale-95
         transition-all disabled:opacity-50"
  onClick={handleSubmit}
  disabled={isLoading}
>
  {isLoading ? <Spinner /> : '提交'}
</button>
```

### 6.3 平台与集成限制

#### Figma 导出限制
- **仅限标准模式**: 实验模式（Gemini 2.5 Pro）生成的设计不可导出至 Figma
- **单向同步**: 无法从 Figma 回传修改至 Stitch

#### 代码质量
- **优势**: 语义化 HTML、现代 CSS（Grid/Flexbox）、Tailwind 变量
- **劣势**:
  - 无组件化（React 导出仍为单一大文件）
  - 硬编码内容（需手动替换为动态数据）
  - 缺少类型定义（TypeScript 接口需自行添加）

#### 项目规模限制
- **配额**: 标准模式 350 次/月、实验模式 50 次/月
- **适用**: 1-3 人小团队、原型阶段
- **不适用**: 大型团队日常设计工作

### 6.4 与竞品对比的差距

| 对比维度 | Google Stitch | v0 (Vercel) | Bolt.new |
|---------|--------------|-------------|----------|
| **代码范围** | 前端 UI（HTML/React） | 前端 + 部分全栈 | 完整全栈 + 部署 |
| **交互支持** | 无 | 中等（表单/路由） | 高（数据库/认证） |
| **成熟度** | 实验阶段 | 生产就绪 | 生产就绪 |
| **定价** | 免费（有配额） | 按 token 计费 | 按 token 计费 |
| **最佳用途** | UI 原型/设计系统 | React 组件库 | MVP 快速上线 |

---

## 7. 实际应用场景

### 7.1 推荐场景（置信度 0.9+）

#### ✅ MVP 原型验证
```
用户故事: 创业团队需在 48 小时内向投资人展示产品概念
工作流:
  1. PM 撰写 3-5 个核心屏幕的文字描述
  2. LLM Agent 通过 Stitch MCP 批量生成
  3. 设计师在 Figma 微调品牌色
  4. 导出代码 → Vercel 部署静态 Demo
时间节省: 传统 5 天 → Stitch 方案 8 小时
```

#### ✅ 设计系统文档自动化
```
用户故事: 设计团队已创建 Stitch 设计，需生成组件库文档
工作流:
  1. 调用 design-md Agent Skill
  2. 生成 Markdown 文档（颜色变量、字体规范、间距系统）
  3. 提交至 Git → 触发 Storybook 构建
  4. 开发者参考文档实现 React 组件
优势: 消除设计-开发文档同步问题
```

#### ✅ 快速 A/B 测试变体
```
用户故事: 增长团队需测试 3 种落地页布局
工作流:
  1. 基础提示词: "SaaS 产品落地页"
  2. 变体 A: "英雄区左对齐 + 产品截图右侧"
  3. 变体 B: "居中布局 + 视频背景"
  4. 变体 C: "分屏设计 + 动画插图"
  5. 导出代码 → A/B 测试平台
时间节省: 传统 2 周 → Stitch 方案 2 天
```

### 7.2 谨慎使用场景（置信度 0.5-0.7）

#### ⚠️ 企业级设计系统
**限制**:
- 缺乏深度定制（品牌独特性）
- 无组件变体系统（Button 的 primary/secondary/danger）
- 无主题切换支持（Light/Dark Mode 需手动实现）

**建议**: 仅用于初期 kickstart，后续迁移至 Figma 精细化

#### ⚠️ 高交互应用（如数据可视化仪表盘）
**限制**:
- 无图表库集成（需手动引入 Chart.js/D3.js）
- 无实时数据绑定
- 无过滤/排序/分页逻辑

**建议**: Stitch 生成静态布局 → 开发者添加 echarts/recharts

### 7.3 不推荐场景（置信度 < 0.4）

#### ❌ 品牌驱动的营销网站
- Stitch 输出偏"工具化"（SaaS 风格）
- 缺乏艺术性/创意性表达
- 无自定义动画/滚动特效

#### ❌ 复杂表单系统
- 无表单验证逻辑
- 无多步骤流程管理
- 无条件显示/隐藏字段

#### ❌ 移动原生应用
- 输出为 Web 技术（HTML/CSS）
- 非 React Native/Swift/Kotlin
- 无原生组件（如 iOS Picker）

---

## 8. 与其他 AI 工具的协作

### 8.1 Claude + Stitch（推荐组合）

**场景**: 利用 Claude 的代码能力补全 Stitch 的交互缺失

```
工作流:
1. Stitch 生成静态 UI（HTML/Tailwind）
   ↓
2. Claude 分析代码结构
   ↓
3. Claude 添加:
   - React 状态管理（useState/useReducer）
   - 表单验证（React Hook Form + Zod）
   - API 集成（fetch/axios）
   - 路由（Next.js App Router）
   ↓
4. 完整可交互应用
```

**实际示例**:
```typescript
// Stitch 输出（简化）
function LoginForm() {
  return (
    <form>
      <input type="email" placeholder="邮箱" />
      <input type="password" placeholder="密码" />
      <button>登录</button>
    </form>
  );
}

// Claude 增强后
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('无效邮箱'),
  password: z.string().min(8, '密码至少 8 位')
});

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.ok) router.push('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}

      <input type="password" {...register('password')} />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit">登录</button>
    </form>
  );
}
```

### 8.2 Stitch + v0 (Vercel)

**策略**: 分工协作（Stitch 做布局，v0 做组件）

```
场景: 电商平台开发
  ├─ Stitch 负责: 整体页面布局（导航栏、页脚、网格系统）
  └─ v0 负责: 交互组件（商品卡片、购物车、结账流程）

原因:
  - Stitch 擅长全局布局设计
  - v0 擅长可交互 React 组件生成
```

### 8.3 Stitch + GitHub Copilot

**场景**: 代码重构与优化

```
1. Stitch 导出初始代码
   ↓
2. Copilot 辅助:
   - 提取可复用组件
   - 添加 TypeScript 类型
   - 重构为 React Server Components
   - 添加单元测试
```

---

## 9. 总结与建议

### 9.1 关键结论（3 个核心声明）

#### 声明 1: Stitch 是设计-开发桥梁工具，非完整解决方案
**证据**:
- [Google 官方博客](https://developers.googleblog.com/stitch-a-new-way-to-design-uis/) 明确定位为"实验性工具"
- [LogRocket 实测](https://blog.logrocket.com/ux-design/i-tried-google-stitch-heres-what-i-loved-hated/) 指出"输出需大量手动优化"
- [CodeCademy 教程](https://www.codecademy.com/article/google-stitch-tutorial-ai-powered-ui-design-tool) 强调"作为起点而非成品"

**置信度**: 0.95（多个独立来源一致结论）

#### 声明 2: MCP 集成是 LLM 使用 Stitch 的核心能力
**证据**:
- [官方 Gemini CLI 扩展](https://github.com/gemini-cli-extensions/stitch) 提供 9 个 MCP 工具
- [社区 MCP 服务器](https://github.com/Kargatharaakash/stitch-mcp) 实现完整 CRUD 操作
- [AI Buzz](https://www.ai-buzz.com/google-stitch-agent-skills-update-automates-design-to-code) 报道 Agent Skills 需 MCP 支持

**置信度**: 0.92（官方实现 + 社区验证）

#### 声明 3: 当前阶段适合原型，不适合生产级应用
**证据**:
- [Index.dev 评测](https://www.index.dev/blog/google-stitch-ai-review-for-ui-designers) 指出"仅推荐用于原型"
- [Medium 实测](https://medium.com/@azattulegenov/google-stitch-beta-how-you-can-generate-production-ui-code-in-15-minutes-and-what-this-means-for-101bfa3c590b) 列出无障碍、响应式、交互等缺失
- [SlashDot 对比](https://slashdot.org/software/comparison/Google-Stitch-vs-v0/) 显示 Stitch 成熟度低于 v0/Bolt

**置信度**: 0.88（实测证据充分，但未来可能改进）

### 9.2 LLM 集成建议（行动指南）

#### 优先级 1: 实现 MCP 工具调用
```python
# 必须实现的核心能力
required_tools = [
    "extract_design_context",  # 设计一致性保障
    "generate_screen_from_text",  # 屏幕生成
    "fetch_screen_code"  # 代码导出
]
```

#### 优先级 2: 提示词模板库
```python
# 为常见场景预置模板
templates = {
    "dashboard": "...",
    "landing_page": "...",
    "login_form": "...",
    "settings_page": "..."
}
```

#### 优先级 3: 质量检查流程
```python
def validate_stitch_output(screen_id):
    """
    LLM 应在导出前执行的检查
    """
    # 1. 获取预览图
    image = fetch_screen_image(screen_id)

    # 2. 视觉分析（通过 LLM 多模态能力）
    issues = analyze_design_issues(image)
    # 检查: 对比度、按钮尺寸、文字可读性

    # 3. 代码分析
    code = fetch_screen_code(screen_id)
    code_issues = check_semantic_html(code)

    # 4. 生成改进建议
    if issues or code_issues:
        return suggest_improvements(issues + code_issues)
```

### 9.3 未来展望

**短期（3-6 个月）预期改进**:
- ✅ 响应式布局支持（基于 Gemini 2.5 的推理能力）
- ✅ 更多 Agent Skills（社区贡献）
- ⚠️ 无障碍自动修复（需 Google 优先级支持）

**长期（6-12 个月）可能性**:
- 与 Firebase/Supabase 集成（后端数据绑定）
- 实时协作编辑（多 Agent 协同设计）
- 视觉回归测试集成（Chromatic/Percy）

---

## 10. 信息来源与置信度评估

### Tier 1 来源（官方/一手）

| 来源 | 类型 | 关键信息 |
|-----|------|---------|
| [Google Developers Blog](https://developers.googleblog.com/stitch-a-new-way-to-design-uis/) | 官方公告 | 产品定位、核心功能 |
| [Stitch 官方文档](https://stitch.withgoogle.com/docs/) | 官方文档 | 使用方法（注: 实际页面为 JS 应用，文档内容有限） |
| [Gemini CLI 扩展](https://github.com/gemini-cli-extensions/stitch) | 官方仓库 | MCP 集成方法、认证流程 |
| [Gemini 2.5 Model Card](https://modelcards.withgoogle.com/assets/documents/gemini-2.5-pro.pdf) | 官方技术文档 | 模型架构、多模态能力 |

### Tier 2 来源（权威社区/深度评测）

| 来源 | 类型 | 关键信息 |
|-----|------|---------|
| [LogRocket 实测](https://blog.logrocket.com/ux-design/i-tried-google-stitch-heres-what-i-loved-hated/) | 专业评测 | 优缺点、实际使用体验 |
| [CodeCademy 教程](https://www.codecademy.com/article/google-stitch-tutorial-ai-powered-ui-design-tool) | 教学内容 | 详细操作步骤、最佳实践 |
| [AI Buzz](https://www.ai-buzz.com/google-stitch-agent-skills-update-automates-design-to-code) | 行业新闻 | Agent Skills 更新详情 |
| [stitch-mcp 仓库](https://github.com/Kargatharaakash/stitch-mcp) | 社区实现 | MCP 服务器技术细节 |

### Tier 3 来源（综合评测/对比分析）

| 来源 | 类型 | 关键信息 |
|-----|------|---------|
| [Index.dev 评测](https://www.index.dev/blog/google-stitch-ai-review-for-ui-designers) | 专业评测 | 与竞品对比 |
| [SlashDot 对比](https://slashdot.org/software/comparison/Google-Stitch-vs-v0/) | 工具对比 | Stitch vs v0 功能差异 |
| [Medium 实测](https://medium.com/@azattulegenov/google-stitch-beta-how-you-can-generate-production-ui-code-in-15-minutes-and-what-this-means-for-101bfa3c590b) | 用户分享 | 实际项目应用案例 |

### 信息缺口

以下信息未能通过公开渠道验证：
1. **精确的 API 限流策略**: 官方仅公布月配额（350/50 次），未说明每小时/每秒限制
2. **Agent Skills 的完整 API 文档**: GitHub 仓库仅提供示例，缺乏详细参数说明
3. **企业版计划**: 未找到付费版本或企业 SLA 信息
4. **数据隐私政策**: 用户上传的设计是否用于模型训练（未明确声明）

**[⚠️ 建议实测验证]**:
- 对于"Stitch 是否支持导出 Vue/Svelte 代码"→ 官方文档仅提及 React/HTML，但未明确说明不支持其他框架
- 对于"生成的代码是否符合 WCAG AA 标准"→ 多个评测指出常失败，但缺乏大规模统计数据

---

## 附录 A: 快速参考手册

### 常用 MCP 工具速查

```typescript
// 1. 创建项目
create_project({ name: string })

// 2. 生成屏幕（核心）
generate_screen_from_text({
  prompt: string,
  model: "gemini-2-5-pro" | "gemini-2-5-flash",
  design_context?: DesignDNA  // 可选，用于保持一致性
})

// 3. 提取设计 DNA
extract_design_context({ screen_id: string })
// 返回: { colors: string[], fonts: string[], layout_patterns: object }

// 4. 获取代码
fetch_screen_code({ screen_id: string })
// 返回: { html: string, css: string }

// 5. 列出资源
list_projects()
list_screens({ project_id: string })
```

### 提示词公式

```
[屏幕类型] + [核心组件] + [布局方式] + [视觉风格] + [内容示例]

示例:
"设计一个 [产品落地页]，包含 [导航栏、英雄区、3 列特性网格、客户评价、CTA 区域]，
 采用 [垂直堆叠布局，移动端优先]，视觉风格为 [现代渐变，深色模式，霓虹蓝强调色]，
 内容示例: [产品名称: AI 设计助手 | 核心特性: 快速生成/多平台导出/团队协作]"
```

### 错误处理

| 错误类型 | 可能原因 | 解决方案 |
|---------|---------|---------|
| `401 Unauthorized` | API Key 过期或无效 | 重新生成 API Key |
| `403 Forbidden` | 权限不足 | 检查 IAM 角色（需 `serviceUsageConsumer`） |
| `429 Rate Limit` | 超过月配额 | 等待下月重置或切换账号 |
| `500 Server Error` | Gemini 服务故障 | 重试或切换模型（Pro → Flash） |
| 生成结果与预期不符 | 提示词模糊 | 增加具体细节、使用 UI 术语 |

---

## 附录 B: 相关资源链接

### 官方资源
- [Stitch 主页](https://stitch.withgoogle.com)
- [Google AI Forum - Stitch 分区](https://discuss.ai.google.dev/c/stitch)
- [Gemini API 文档](https://ai.google.dev/docs)

### 社区工具
- [stitch-mcp (Universal MCP Server)](https://github.com/Kargatharaakash/stitch-mcp)
- [Gemini CLI 扩展](https://github.com/gemini-cli-extensions/stitch)
- [@_davideast/stitch-mcp (Setup Helper)](https://github.com/davideast/stitch-mcp)

### 教程与评测
- [CodeCademy 完整教程](https://www.codecademy.com/article/google-stitch-tutorial-ai-powered-ui-design-tool)
- [LogRocket 深度评测](https://blog.logrocket.com/ux-design/i-tried-google-stitch-heres-what-i-loved-hated/)
- [v0 vs Bolt vs Stitch 对比](https://slashdot.org/software/comparison/Google-Stitch-vs-v0/)

---

**最后更新**: 2026-02-02
**下次审查建议**: 2026-05（Agent Skills 新版本发布后）
