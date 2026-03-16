# B2B Web Template

现代化 B2B 企业网站模板，采用 Next.js 16.1.6、React 19、TypeScript 5.9 和 Tailwind CSS 4，内置英中双语国际化、MDX 内容管理、质量门禁，以及 Vercel / Cloudflare 双部署路径。

## ✨ 特性

- 🎯 **现代技术栈**: Next.js 16.1.6 + React 19.2.3 + TypeScript 5.9.3
- 🎨 **现代化UI**: Tailwind CSS 4.1.18 + 响应式设计
- 📝 **内容管理**: MDX + Git-based 工作流
- 🌍 **国际化支持**: 英中双语切换 + next-intl
- 🎭 **主题系统**: 明亮/暗黑/系统主题
- ☁️ **双部署目标**: 默认 Next.js / Vercel 构建 + Cloudflare OpenNext 构建链路
- 🔒 **企业级安全**: ESLint 9生态 + 安全扫描
- ⚡ **性能优化**: 包大小控制 + 性能预算
- 🏗️ **架构检查**: 循环依赖检测 + 架构一致性

## 🌐 翻译定制

本项目使用**分层翻译架构**，将翻译文件拆分为首屏必需（critical）和延迟加载（deferred）两部分，既优化了性能，又便于企业快速定制。

### 文件结构

```
messages/
├── en/
│   ├── critical.json    # 首屏必需翻译（Header、Footer、Hero）
│   └── deferred.json    # 延迟加载翻译（其他所有内容）
└── zh/
    ├── critical.json
    └── deferred.json
```
> 注: `messages/en.json` 和 `messages/zh.json` 仅用于 Vitest 测试与翻译形状校验, 运行时代码不会直接从这些文件加载翻译。



### 快速定制

**修改品牌信息**：编辑 `messages/[locale]/critical.json`
```json
{
  "home": {
    "hero": {
      "title": {
        "line1": "Your Company Name",    // ← 修改公司名称
        "line2": "Professional Slogan"   // ← 修改 Slogan
      }
    }
  },
  "seo": {
    "siteName": "Your Company"  // ← 修改站点名称
  }
}
```

**验证翻译完整性**：
```bash
pnpm validate:translations
```

## 🛠️ 环境要求

- **Node.js**: 20.x（与 CI/Vercel 一致，已在 `.nvmrc` 固定为 20）
- **包管理器**: pnpm 10.13.1（已在 `.npmrc` 与 CI 固定）
- **操作系统**: macOS, Linux, Windows

> 提示：使用 nvm/fnm/asdf 进入仓库目录后自动切到 Node 20；若不生效，请执行 `nvm use`。

### 🔐 Turnstile 配置

本地或部署环境需要在 `.env.local`（或对应的环境变量管理服务）中提供 Cloudflare Turnstile 凭证：

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=你的站点公钥
TURNSTILE_SECRET_KEY=你的服务端私钥
```

> ⚠️ 请勿将真实密钥提交到版本库。请在本地 `.env.local` 或部署平台的环境变量管理中注入真实值。

针对额外安全策略（如限制域名、Action 值）可使用：`TURNSTILE_ALLOWED_HOSTS`、`TURNSTILE_EXPECTED_ACTION`、`NEXT_PUBLIC_TURNSTILE_ACTION`。

## ⚙️ 配置驱动特性

- **联系表单配置**：`src/config/contact-form-config.ts` 提供字段顺序、启用状态以及校验配置，并通过 `buildFormFieldsFromConfig` 与 `createContactFormSchemaFromConfig` 同步前后端字段定义。
- **WhatsApp 支持**：`FEATURE_FLAGS.ENABLE_WHATSAPP_CHAT`（可通过 `ENABLE_WHATSAPP_CHAT` 环境变量关闭）配合 `SITE_CONFIG.contact.whatsappNumber`（可通过 `NEXT_PUBLIC_WHATSAPP_NUMBER` 覆盖）自动在右下角注入 `WhatsAppFloatingButton`。
- **主题与变量**：`src/app/globals.css` 定义品牌色、布局与 CSS 变量，通过 Tailwind CSS 4 的 `@theme inline` 和 `:root/.dark` 实现明暗主题切换。

## 🔧 二次开发要点

- **品牌与站点信息**：优先修改 `src/config/paths/site-config.ts`、`messages/[locale]/critical.json`、`src/app/globals.css`
- **路由与页面**：新增页面时，同时更新 `src/i18n/routing.ts` 与 `src/app/sitemap.ts`
- **翻译约束**：所有用户可见文本必须走 `next-intl`；修改翻译后执行 `pnpm validate:translations`
- **表单配置**：联系表单字段和必填规则集中在 `src/config/contact-form-config.ts`
- **质量门禁**：提交前至少跑一次 `pnpm lint:check`、`pnpm type-check`、`pnpm test`，必要时补 `pnpm build` 和 `pnpm build:cf`
  - `pnpm build` 和 `pnpm build:cf` 是两条独立门禁，前者通过不代表后者通过

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd b2b-web-template
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm dev          # 开发服务器（默认 Turbopack）
# 或使用 Webpack 回退
pnpm dev:webpack
```

### 4. 访问应用

- **主站**: [http://localhost:3000](http://localhost:3000)

### 5. 构建生产版本

```bash
pnpm build
pnpm start
```

## 📁 项目结构

```
src/__tests__/    # 仓库级测试
src/
├── app/          # Next.js App Router 入口、布局、路由
├── components/   # 共享 UI 组件
├── config/       # 配置与常量（feature flags、主题等）
├── constants/    # 常量定义
├── emails/       # React Email 模板
├── hooks/        # 自定义 hooks
├── i18n/         # 国际化辅助
├── lib/          # 工具函数与通用逻辑
├── services/     # 后端/第三方集成
├── styles/       # 全局样式与 tokens
├── templates/    # 模板片段
├── test/         # 测试辅助
├── testing/      # 测试基建
└── types/        # TypeScript 类型

content/          # MDX 内容文件
├── config/       # 内容清单与配置
├── posts/        # 博客文章
│   ├── en/       # 英文博客
│   └── zh/       # 中文博客
├── products/     # 产品目录
│   ├── en/       # 英文产品
│   └── zh/       # 中文产品
└── pages/        # 静态页面（FAQ、隐私政策等）
    ├── en/
    └── zh/

messages/         # 国际化翻译文件
├── en/
│   ├── critical.json   # 首屏必需翻译
│   └── deferred.json   # 延迟加载翻译
└── zh/
    ├── critical.json
    └── deferred.json
```

## 🔧 可用脚本

### 开发相关

```bash
pnpm dev               # 启动开发服务器（默认 Turbopack）
pnpm dev:webpack       # 使用 Webpack 启动开发服务器
pnpm build             # 构建生产版本（默认 Turbopack）
pnpm build:webpack     # 使用 Webpack 构建（回退/对比）
pnpm build:analyze     # 生成 Turbopack 构建分析
pnpm start             # 启动生产服务器
```

### 代码质量

```bash
pnpm lint:check        # ESLint 检查
pnpm lint:fix          # 自动修复 ESLint 问题
pnpm format:check      # Prettier 格式检查
pnpm format:write      # 自动格式化
pnpm type-check        # TypeScript 类型检查
pnpm type-check:tests   # 测试相关类型检查
pnpm validate:translations # 翻译完整性校验
```

### 质量与安全

```bash
pnpm quality:monitor        # 本地质量监控
pnpm quality:report:local   # 生成质量报告
pnpm quality:gate           # 类型+lint+质量关卡
pnpm quality:quick:staged   # 暂存区快速质量检查
pnpm arch:check             # 依赖与架构检查
pnpm circular:check         # 循环依赖检测
pnpm security:check         # 安全扫描（npm audit + semgrep）
pnpm config:check           # 配置一致性检查
pnpm unused:check           # 未使用代码检查（knip）
```

> 推荐流程：
> - **提交 PR 前** 本地至少执行一次 `pnpm security:check`，确保依赖审计和 Semgrep 均通过；
> - 对于 Semgrep 报警：
>   - 优先 **改代码消除真实风险**（尤其是 `object-injection-sink-*` / `nextjs-unsafe-*` 规则）；
>   - 若确认是受控例外（仅操作受控配置或测试辅助代码），请：
>     1. 在代码附近补充安全说明注释；
>     2. 使用 `// nosemgrep: <rule-id>` 标注具体规则；
>   - 严禁简单在 `semgrep.yml` 全局禁用规则，除非在安全评审中已有明确结论。

### 测试相关

```bash
pnpm test             # 运行测试
pnpm test:coverage    # 测试覆盖率报告
pnpm test:e2e         # Playwright E2E 测试
pnpm test:e2e:no-reuse # Playwright E2E（隔离上下文）
pnpm perf:lighthouse  # Lighthouse CI（性能）
```

> 覆盖率、关键组件清单请以最新 `pnpm test:coverage` 输出为准。
>
> 首次运行 `pnpm test:e2e` 或 `pnpm ci:local` 前，请先安装 Playwright browsers：
>
> ```bash
> pnpm exec playwright install
> ```

### Cloudflare 相关

```bash
pnpm build:cf                 # Cloudflare OpenNext 构建
pnpm preview:cf               # 本地预览 Cloudflare 构建
pnpm deploy:cf                # 标准 Cloudflare 部署
pnpm build:cf:phase6          # Phase 6 多 Worker 构建
pnpm deploy:cf:phase6:dry-run # Phase 6 dry-run
```

> 当前 Cloudflare 兼容路径仍以 `src/middleware.ts` 为准；`src/proxy.ts` 虽能通过 `pnpm build`，但不应视为已通过 `pnpm build:cf` 验证。

## 📝 内容管理系统

本模板使用基于文件系统的 MDX 内容管理，支持产品目录、博客文章和静态页面。

### 产品内容 (`content/products/`)

产品文件支持 B2B 外贸特有的字段：

```yaml
---
locale: 'en'
title: 'Product Name'
slug: 'product-slug'           # 英中版本必须使用相同 slug
publishedAt: '2024-01-15'
draft: false
description: 'Product description'
coverImage: '/images/products/cover.jpg'
images:
  - '/images/products/image1.jpg'
  - '/images/products/image2.jpg'
category: 'Industrial Equipment'
tags: ['tag1', 'tag2']
featured: true
moq: '10 Units'                # 最小起订量
leadTime: '15-20 Days'         # 交货期
supplyCapacity: '5000 Units/Month'
certifications: ['CE', 'ISO 9001']
packaging: 'Wooden Crate'
portOfLoading: 'Shanghai Port'
specs:
  Power: '7.5kW'
  Voltage: '380V AC'
relatedProducts: ['related-product-slug']
seo:
  title: 'SEO Title'
  description: 'SEO Description'
  keywords: ['keyword1', 'keyword2']
---

Product detailed description in MDX format...
```

### 博客文章 (`content/posts/`)

```yaml
---
locale: 'en'
title: 'Article Title'
slug: 'article-slug'
description: 'Article summary'
publishedAt: '2024-01-15'
author: 'Author Name'
tags: ['Trade', 'Export']
categories: ['Industry Insights']
featured: false
readingTime: 8
coverImage: '/images/blog/cover.jpg'
seo:
  title: 'SEO Title'
  description: 'SEO Description'
---

Article content in MDX format...
```

### 静态页面 (`content/pages/`)

适用于 FAQ、隐私政策、关于我们等页面：

```yaml
---
locale: 'en'
title: 'Page Title'
slug: 'page-slug'
description: 'Page description'
publishedAt: '2024-01-01'
updatedAt: '2024-04-01'
author: 'Team Name'
layout: 'default'
showToc: true
draft: false
seo:
  title: 'SEO Title'
  description: 'SEO Description'
  keywords: ['keyword1', 'keyword2']
---

Page content in MDX format...
```

### 内容国际化规则

1. **Slug 必须一致**：英文和中文版本必须使用相同的 `slug`，以确保 i18n 路由正确工作
2. **文件命名**：建议使用 slug 作为文件名，如 `variable-frequency-drive.mdx`
3. **locale 字段**：必须与所在目录匹配（`en` 或 `zh`）

## 🏗️ 技术栈详情

### 核心框架

- **Next.js 16.1.6** - React 全栈框架，App Router 架构
- **React 19.2.3** - 用户界面库，支持服务器组件
- **TypeScript 5.9.3** - 类型安全的 JavaScript 超集

### 样式和UI

- **Tailwind CSS 4.1.18** - 原子化CSS框架，CSS-first配置
- **Geist字体** - Vercel设计的现代字体系列

### 内容管理

- **MDX** - Markdown + React 组件支持，基于文件系统的内容管理
- **next-intl** - 多语言国际化解决方案
- **Gray Matter** - Front Matter 解析和元数据处理

### 开发工具

- **ESLint 9** - 代码质量检查 (9个插件)
- **Prettier** - 代码格式化
- **TypeScript 严格模式** - 最严格的类型检查
- **React Scan** - React 组件性能监控和渲染分析

### 质量保障

- **dependency-cruiser** - 架构一致性检查
- **eslint-plugin-security / semgrep** - 安全扫描
- **npm audit** - 依赖安全基线
- **Lefthook + quality gate** - 本地提交与推送前检查

## 📚 学习资源

- [Next.js 16 文档](https://nextjs.org/docs) - 了解最新特性
- [React 19 文档](https://react.dev) - React最新功能
- [TypeScript 手册](https://www.typescriptlang.org/docs/) - TypeScript指南
- [Tailwind CSS 文档](https://tailwindcss.com/docs) - 样式框架指南

## 🚀 部署

仓库当前支持两条部署链路：

```bash
# Vercel / 标准 Next.js 构建
pnpm build

# Cloudflare OpenNext 构建
pnpm build:cf
pnpm preview:cf
```

`pnpm build` 和 `pnpm build:cf` 不能互相替代。前者代表标准 Next.js 构建通过，后者代表 OpenNext Cloudflare 适配链路通过。

### Vercel

```bash
# 使用 Vercel CLI 部署
npx vercel

# 或连接 GitHub 自动部署
# 1. 推送代码到 GitHub
# 2. 在 Vercel 导入项目
# 3. 自动部署和CI/CD
```

### Cloudflare

```bash
pnpm deploy:cf

# 如需 Phase 6 多 Worker dry-run
pnpm deploy:cf:phase6:dry-run
```

### 生产环境 Rate Limiting

生产环境需要配置 Upstash Redis 或 Vercel KV 以实现跨 serverless 实例的分布式限流。未配置时将回退到内存存储（仅适用于开发环境）。

```bash
# Upstash Redis (推荐)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# 或 Vercel KV
KV_REST_API_URL=https://your-kv.vercel-storage.com
KV_REST_API_TOKEN=your_token
```

查看
[Next.js部署文档](https://nextjs.org/docs/app/building-your-application/deploying)
了解更多部署选项。

<!-- auto-deploy test:  -->
<!-- auto-deploy test: 2025-10-31T05:58:07Z -->
