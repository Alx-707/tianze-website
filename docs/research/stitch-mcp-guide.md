# Google Stitch MCP 使用指南

> 本文档为 LLM Agent 设计，旨在帮助理解和使用 Google Stitch 进行 UI 设计生成。

## 概述

**Stitch** 是 Google Labs 推出的 AI 驱动设计工具（Beta），能够将文字描述转换为移动端和 Web 应用的 UI 设计。基于 Gemini 模型，目前免费使用。

- **官网**: https://stitch.withgoogle.com
- **文档**: https://stitch.withgoogle.com/docs/
- **MCP 端点**: `https://stitch.googleapis.com/mcp`

---

## 核心能力

| 能力 | 描述 |
|------|------|
| **设计生成** | 从文字提示生成完整 UI 设计 |
| **迭代编辑** | 通过对话式提示修改设计 |
| **主题编辑** | 快速调整配色、字体、圆角、明暗模式 |
| **原型预览** | 生成可滚动、可交互的原型 |
| **代码导出** | 导出 HTML + Tailwind CSS 代码 |
| **图片导出** | 导出设计截图 (PNG) |
| **Figma 导出** | 支持导出到 Figma 继续编辑 |

---

## MCP 集成配置

### 认证方式

Stitch 是**远程 MCP 服务器**，支持两种认证：

| 方式 | 适用场景 | 特点 |
|------|----------|------|
| **API Key** | 私人机器、持久连接 | 简单快速，密钥永久有效直到手动删除 |
| **OAuth** | 零信任环境、会话控制 | 短期 token (1小时)，可即时撤销 |

### Claude Code 配置

**API Key 方式（推荐）**:

```bash
claude mcp add stitch --transport http https://stitch.googleapis.com/mcp --header "X-Goog-Api-Key: YOUR-API-KEY" -s user
```

**OAuth 方式**:

```bash
# 1. 安装 gcloud CLI
brew install --cask google-cloud-sdk

# 2. 双层认证
gcloud auth login
gcloud auth application-default login

# 3. 配置项目
PROJECT_ID="YOUR_PROJECT_ID"
gcloud config set project "$PROJECT_ID"
gcloud beta services mcp enable stitch.googleapis.com --project="$PROJECT_ID"

# 4. 获取 token
TOKEN=$(gcloud auth application-default print-access-token)

# 5. 添加 MCP 服务器
claude mcp add stitch \
  --transport http https://stitch.googleapis.com/mcp \
  --header "Authorization: Bearer $TOKEN" \
  --header "X-Goog-User-Project: $PROJECT_ID" \
  -s user
```

> **注意**: OAuth token 有效期 1 小时，过期后需重新获取。

### 其他客户端配置

**Cursor** (`.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "stitch": {
      "url": "https://stitch.googleapis.com/mcp",
      "headers": {
        "X-Goog-Api-Key": "YOUR-API-KEY"
      }
    }
  }
}
```

**VSCode** (`mcp.json`):
```json
{
  "servers": {
    "stitch": {
      "url": "https://stitch.googleapis.com/mcp",
      "type": "http",
      "headers": {
        "Accept": "application/json",
        "X-Goog-Api-Key": "YOUR-API-KEY"
      }
    }
  }
}
```

**Gemini CLI**:
```bash
gemini extensions install https://github.com/gemini-cli-extensions/stitch
```

---

## MCP 工具参考

### 项目管理

#### `create_project`
创建新的 Stitch 项目。

```json
{
  "title": "string (可选) - 项目标题"
}
```

#### `list_projects`
列出所有可访问的项目。

```json
{
  "filter": "string (可选) - 'view=owned' 或 'view=shared'，默认 'view=owned'"
}
```

#### `get_project`
获取特定项目详情。

```json
{
  "name": "string (必需) - 格式: projects/{project_id}"
}
```

### 屏幕管理

#### `list_screens`
列出项目中的所有屏幕。

```json
{
  "projectId": "string (必需) - 项目 ID"
}
```

#### `get_screen`
获取特定屏幕详情（包含代码和图片 URL）。

```json
{
  "projectId": "string (必需) - 项目 ID",
  "screenId": "string (必需) - 屏幕 ID"
}
```

### 设计生成

#### `generate_screen_from_text`
从文字提示生成新设计。

```json
{
  "projectId": "string (必需) - 项目 ID",
  "prompt": "string (必需) - 设计描述提示词",
  "deviceType": "enum (可选) - MOBILE | DESKTOP | TABLET | AGNOSTIC，默认 MOBILE",
  "modelId": "enum (可选) - GEMINI_3_PRO | GEMINI_3_FLASH，默认 GEMINI_3_FLASH"
}
```

---

## 提示词工程

### 初始提示公式

```
Idea: [这是什么]
Theme: [核心主题/风格]
Content: [具体内容]
Image: [可选参考图]
```

**示例**:
```
Idea: A landing page for a running podcast named "The Pacing Project".
Theme: Modern, edgy, high contrast. Use black and white with hard angles.
Content: Hero section with "Stories and lessons about racing and proper pacing" and links to podcast platforms.
```

### 迭代提示公式

每次只改一个方面，使用具体的 UI/UX 关键词：

```
[目标组件] + [具体视觉指令] + [UI/UX 关键词]
```

**示例**:
```
Update the pricing table to emphasize the middle card. Increase its container height and add a drop shadow. Reduce the scale of the sibling cards to create a clear visual hierarchy.
```

### 常用 UI/UX 关键词

| 类别 | 关键词 |
|------|--------|
| 布局 | visual hierarchy, grid, spacing, alignment, whitespace |
| 强调 | drop shadow, border, scale, contrast, accent color |
| 组件 | card, hero section, navbar, pricing table, CTA button |
| 样式 | rounded corners, gradient, glassmorphism, minimalist |
| 交互 | hover state, active state, disabled state |

---

## 设备类型选择

| 类型 | 适用场景 |
|------|----------|
| `MOBILE` | 移动端 App、响应式移动优先设计 |
| `DESKTOP` | 桌面端 Web 应用、管理后台 |
| `TABLET` | 平板应用、中等屏幕适配 |
| `AGNOSTIC` | 通用设计、组件库 |

> **建议**: 不必纠结初始选择，Stitch 支持在设计模式之间转换。

---

## 模型选择

| 模型 | 特点 | 适用场景 |
|------|------|----------|
| `GEMINI_3_FLASH` | 快速、低延迟 | 快速迭代、探索阶段（默认） |
| `GEMINI_3_PRO` | 高质量、更精细 | 最终版本、复杂设计 |

---

## Agent Skills

通过 `add-skill` 安装预置技能，增强 Agent 能力：

```bash
# 查看可用技能
npx add-skill google-labs-code/stitch-skills --list

# 安装技能
npx add-skill google-labs-code/stitch-skills --skill [skill-name] --global
```

### 可用技能

| 技能 | 功能 |
|------|------|
| `design-md` | 分析 Stitch 项目，生成 `DESIGN.md` 设计系统文档 |
| `react:components` | 将 Stitch 屏幕转换为 React 组件系统 |
| `stitch-loop` | 从单个提示生成完整多页网站 |
| `enhance-prompt` | 优化模糊提示，注入设计系统上下文 |

### 典型工作流

```bash
# 1. 安装 React 组件技能
npx add-skill google-labs-code/stitch-skills --skill react:components --global

# 2. 在 Agent 中触发
# "Convert the Landing Page screen in the Podcast Project."
```

---

## 最佳实践

### Vibe Design 原则

来自 Stitch 官方推文的核心理念：

1. **选择胜于意见** - 生成多个方案让人选择，而不是辩论单一方案
2. **并行处理优于长线程** - 同时探索多个方向
3. **氛围设计优先** - 先确定整体感觉，再细化

### 高效迭代技巧

| 原则 | 做法 |
|------|------|
| 不问"这样好吗？" | 问"这三个哪个最好？" |
| 不在会议上辩论 | 辩论应该在设计探索中进行 |
| 每次改一处 | 单一变量便于评估效果 |
| 善用主题编辑 | 配色/字体/圆角等用 Edit Theme 更高效 |

### 代码导出流程

1. 选择屏幕 → Download → 获取 HTML + 图片
2. HTML 是完整的 `<html>` 文档，包含 Tailwind CSS
3. **LLM 擅长将 HTML 转换为**:
   - React / Vue / Angular
   - Flutter / SwiftUI / Jetpack Compose
   - 其他 UI 框架

**提示**: 导出时同时下载图片作为参考，帮助 LLM 理解设计意图。

---

## 常见工作流示例

### 1. 查看项目列表

```
Prompt: Show me my Stitch projects. List out each screen under each project and its screen id.
```

### 2. 下载屏幕代码

```
Prompt: Download the HTML code for the Full Menu screen in the Raffinato project.
Use curl -L to download.
Create a file named ./tmp/${screen-name}.html with the HTML code.
```

### 3. 生成新设计

```
Prompt: Create a new screen in the "Podcast App" project.
Design a subscription pricing page with three tiers: Free, Pro, and Enterprise.
Use a modern dark theme with purple accents.
Device type: DESKTOP
```

### 4. 转换为 React

```
Prompt: Convert the Landing Page screen in the Podcast Project to React components.
```

---

## 快捷键参考 (Stitch Web Editor)

| 操作 | 快捷键 |
|------|--------|
| 选择工具 | `V` |
| 平移工具 | `H` |
| 跳转到最近屏幕 | `⌘←` / `Ctrl+←` |
| 循环切换屏幕 | `⌘→` / `Ctrl+→` |
| 查看所有快捷键 | `?` |

---

## 限制与注意事项

1. **月度限制**: 免费使用有生成次数限制，超出后需等待下月重置
2. **可用地区**: 目前仅在部分地区可用
3. **商业使用**: 生成的设计可用于商业目的
4. **OAuth Token**: 有效期 1 小时，过期需重新获取
5. **非 Google 官方产品**: Stitch 来自 Google Labs，不属于 Google 开源漏洞奖励计划

---

## 相关资源

- [Stitch 官方文档](https://stitch.withgoogle.com/docs/)
- [Stitch MCP 设置指南](https://stitch.withgoogle.com/docs/mcp/setup/)
- [Stitch Agent Skills (GitHub)](https://github.com/google-labs-code/stitch-skills)
- [Stitch Twitter/X](https://x.com/stitchbygoogle)
- [Agent Skills Open Standard](https://agentskills.io/home)
