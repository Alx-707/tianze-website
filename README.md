# Tianze Website

[![Test Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)](./reports/coverage/)
[![CI/CD](https://github.com/rock-909/tianze-website/actions/workflows/ci.yml/badge.svg)](https://github.com/rock-909/tianze-website/actions/workflows/ci.yml)

天泽管业海外站点仓库，采用 Next.js 16 + React 19 + TypeScript 5.9 + Tailwind CSS 4 技术栈，支持英中双语、Cloudflare 主部署链路、Contact 询盘主转化路径，以及当前仓库约定的发布门禁与部署验证流程。

> 说明：`package.json` 当前包名已经与项目身份统一为 `tianze-website`；当前业务站点和文档默认都以 Tianze Website 为准。

## ✨ 特性

- 🎯 **现代技术栈**: Next.js 16.2.3 + React 19.2.5 + TypeScript 5.9.3
- 🎨 **现代化UI**: Tailwind CSS 4.2.2 + 响应式设计
- 📝 **内容管理**: MDX + Git-based 工作流
- 🌍 **国际化支持**: 英中双语切换 + next-intl
- 🎭 **主题系统**: 明亮/暗黑/系统主题
- 📊 **错误监控（可选）**: 默认不启用客户端 Sentry；支持“服务端/边缘优先”的可选接入，兼顾性能与可观测性
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

- **Node.js**: 20.19.x（默认开发版本与 CI 基线；项目声明支持 `>=20.19 <23`）
- **包管理器**: pnpm 10.13.1（已在 `.npmrc` 与 CI 固定）
- **操作系统**: macOS, Linux, Windows

> 提示：使用 nvm/fnm/asdf 进入仓库目录后自动切到 Node 20；若不生效，请执行 `nvm use`。

### 🔐 Turnstile 配置

本地或部署环境需要在 `.env.local`（或对应的环境变量管理服务）中提供 Cloudflare Turnstile 凭证：

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=你的站点公钥
TURNSTILE_SECRET_KEY=你的服务端私钥
```

> ⚠️ 请勿将真实密钥提交到版本库。当前仓库不提交可用示例密钥文件，真实值请通过本地环境变量或部署平台的 Secret 管理注入。

针对额外安全策略（如限制域名、Action 值）可使用：`TURNSTILE_ALLOWED_HOSTS`、`TURNSTILE_EXPECTED_ACTION`、`NEXT_PUBLIC_TURNSTILE_ACTION`。

## ⚙️ 配置驱动特性

- **联系表单配置**：`src/config/contact-form-config.ts` 提供字段顺序、启用状态以及校验配置，并通过 `buildFormFieldsFromConfig` 与 `createContactFormSchemaFromConfig` 同步前后端字段定义。
- **WhatsApp 支持**：`FEATURE_FLAGS.ENABLE_WHATSAPP_CHAT`（可通过 `ENABLE_WHATSAPP_CHAT` 环境变量关闭）配合 `SITE_CONFIG.contact.whatsappNumber`（可通过 `NEXT_PUBLIC_WHATSAPP_NUMBER` 覆盖）自动在右下角注入 `WhatsAppFloatingButton`。
- **主题与变量**：`src/app/globals.css` 定义品牌色、布局与 CSS 变量，通过 Tailwind CSS 4 的 `@theme inline` 和 `:root/.dark` 实现明暗主题切换。

## 🔧 维护与扩展

当前仓库的活跃维护文档集中在 `docs/guides/`：

- **[tech-stack.md](./docs/guides/tech-stack.md)** - 当前技术栈、构建链路和关键依赖
- **[RELEASE-PROOF-RUNBOOK.md](./docs/guides/RELEASE-PROOF-RUNBOOK.md)** - 发布前验证与发布门禁执行顺序
- **[QUALITY-PROOF-LEVELS.md](./docs/guides/QUALITY-PROOF-LEVELS.md)** - 不同级别检查各自证明什么
- **[POLICY-SOURCE-OF-TRUTH.md](./docs/guides/POLICY-SOURCE-OF-TRUTH.md)** - 当前规则和政策以哪些文件为准
- **[CANONICAL-TRUTH-REGISTRY.md](./docs/guides/CANONICAL-TRUTH-REGISTRY.md)** - 当前运行时、i18n、Contact、Cloudflare 证明边界的正式真相表

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd tianze-website
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm dev          # 开发服务器（默认 Turbopack）
```

### 4. 访问应用

- **主站**: [http://localhost:3000](http://localhost:3000)

### 5. 构建生产版本

```bash
pnpm build
pnpm start
```

### 6. Cloudflare 与发布验证

```bash
pnpm build:cf
pnpm preview:cf
pnpm deploy:cf:preview
pnpm release:verify
pnpm smoke:cf:preview
pnpm smoke:cf:deploy -- --base-url <deployed-url>
```

说明：
- `pnpm build:cf` 是当前正式 Cloudflare 构建脚本；Route B 下默认走 stock `opennextjs-cloudflare build`
- 旧的 `build:cf:turbo` 已降为仓库内部历史/诊断材料，不再作为日常可用脚本暴露
- 当前本地 Cloudflare 页面预览证明模式是 `pnpm preview:cf` + `pnpm smoke:cf:preview`，主要验证页面、跳转、cookie 和 header
- Cloudflare API 的最终证明依赖真实部署后的 `smoke:cf:deploy`
- `pnpm deploy:cf:preview` 是当前 Route B 下的真实 preview 发布路径

## 📁 项目结构

```
src/
├── app/          # Next.js App Router 入口、布局、路由
├── components/   # 共享 UI 组件
├── config/       # 配置与常量（feature flags、主题等）
├── constants/    # 常量定义
├── hooks/        # 自定义 hooks
├── i18n/         # 国际化辅助
├── lib/          # 工具函数与通用逻辑
├── services/     # 后端/第三方集成
├── shared/       # 共享类型与工具
├── templates/    # 模板片段
├── test/         # 测试辅助
├── testing/      # 测试基建
└── types/        # TypeScript 类型

content/          # MDX 内容文件
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
pnpm build             # 构建生产版本（默认 Turbopack）
pnpm build:webpack     # 使用 Webpack 构建（回退/对比）
pnpm build:analyze     # 生成 Turbopack 构建分析
pnpm start             # 启动生产服务器
pnpm build:cf          # 当前正式 Cloudflare 构建脚本（Route B：stock OpenNext Cloudflare build）
 pnpm preview:cf        # 本地 Cloudflare preview 脚本（Route B stock preview）
pnpm deploy:cf         # Cloudflare 正式部署
pnpm deploy:cf:preview # Cloudflare preview 部署
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
pnpm release:verify         # 当前统一发布门禁
pnpm smoke:cf:preview       # Cloudflare 本地页面/跳转/cookie/header smoke
pnpm smoke:cf:preview:strict # 诊断用本地严格 smoke（含 /api/health）
pnpm smoke:cf:deploy -- --base-url <url> # 真实部署后的最终 Cloudflare smoke
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

## 🔐 当前生产配置要点

当前生产链路最关键的环境变量分为三类：

### 1. Cloudflare 部署

```bash
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
```

### 2. Contact / 反滥用 / Server Actions

```bash
RATE_LIMIT_PEPPER=
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

### 3. 询盘写入与通知

```bash
RESEND_API_KEY=
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
```

可选但常用的补充项包括：
- `AIRTABLE_TABLE_NAME`
- `EMAIL_FROM`
- `EMAIL_REPLY_TO`
- `CACHE_INVALIDATION_SECRET`
- `ADMIN_API_TOKEN`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`
- `GOOGLE_SITE_VERIFICATION`

关于哪些文件才是真正的当前规则，请优先看：
- [POLICY-SOURCE-OF-TRUTH.md](./docs/guides/POLICY-SOURCE-OF-TRUTH.md)
- [CANONICAL-TRUTH-REGISTRY.md](./docs/guides/CANONICAL-TRUTH-REGISTRY.md)

### 测试相关

```bash
pnpm test             # 运行测试
pnpm test:coverage    # 测试覆盖率报告
pnpm test:e2e         # Playwright E2E 测试
pnpm test:e2e:no-reuse # Playwright E2E（隔离上下文）
pnpm perf:lighthouse  # Lighthouse CI（性能）
```

> 覆盖率、关键组件清单请以最新 `pnpm test:coverage` 输出为准。

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

- **Next.js 16.2.3** - React全栈框架，App Router架构
- **React 19.2.5** - 用户界面库，支持服务器组件
- **TypeScript 5.9.3** - 类型安全的JavaScript超集

### 样式和UI

- **Tailwind CSS 4.2.2** - 原子化CSS框架，CSS-first配置
- **Geist字体** - Vercel设计的现代字体系列

### 内容管理

- **MDX** - Markdown + React 组件支持，基于文件系统的内容管理
- **next-intl** - 多语言国际化解决方案
- **Gray Matter** - Front Matter 解析和元数据处理

### 开发工具

- **ESLint 9** - 代码质量检查 (9个插件)
- **Prettier** - 代码格式化
- **TypeScript严格模式** - 最严格的类型检查
- **React Scan** - React 组件性能监控和渲染分析

### 质量保障

- **dependency-cruiser** - 架构一致性检查
- **eslint-plugin-security / semgrep** - 安全扫描
- **npm audit** - 依赖安全基线
- **Sentry（可选）** - 默认禁用客户端；服务端/边缘可按需启用

## ✅ 架构重构成果

项目已完成系统性架构重构，显著提升了代码质量、构建性能和开发体验：

### 重构成果
- **Export * 数量**: 97个 → 7个 ✅（减少 93%）
- **TypeScript错误**: 3093个 → 0个 ✅（100% 解决）
- **ESLint 问题**: 2075个 → 2个 ✅（减少 99.9%）
- **文件总数**: 786个 → 719个（减少 8.5%，持续优化中）

## 📚 学习资源

- [Next.js 16 文档](https://nextjs.org/docs) - 了解最新特性
- [React 19 文档](https://react.dev) - React最新功能
- [TypeScript 手册](https://www.typescriptlang.org/docs/) - TypeScript指南
- [Tailwind CSS 文档](https://tailwindcss.com/docs) - 样式框架指南

## 🚀 部署

**主力平台：Cloudflare**（通过 OpenNext 适配）

```bash
pnpm build:cf              # 正式 Cloudflare 构建
pnpm deploy:cf             # 部署到 Cloudflare
pnpm smoke:cf:deploy -- --base-url <url>  # 部署后验证
```

Vercel 作为备用/对照平台，CI 中自动部署 preview。

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

## 🧭 错误监控策略（Sentry）

本模板以“内容/营销站点”为默认定位，强调性能与首屏体验：

- 默认不启用客户端 Sentry，避免增加 vendors 包与 CWV 风险。
- 支持“服务端/边缘优先”的可选接入，用于 API/Server Actions/Edge 的异常上报与发布健康。
- 通过环境变量门控可快速开启/关闭：

```bash
# 关闭 Sentry 打包与客户端使用（默认建议）
DISABLE_SENTRY_BUNDLE=1
NEXT_PUBLIC_DISABLE_SENTRY=1

# 如需启用（建议仅在生产且有清晰告警流程时）
unset DISABLE_SENTRY_BUNDLE
unset NEXT_PUBLIC_DISABLE_SENTRY

# 并配置必要的凭据
SENTRY_DSN=...
SENTRY_ORG=...
SENTRY_PROJECT=...
```

启用时建议采用“最小化”策略：仅服务端/边缘，客户端按需动态加载、低采样、禁用 Replay/Feedback/Tracing 等重功能，并受同意（Consent）管理控制。

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

<!-- auto-deploy test:  -->
<!-- auto-deploy test: 2025-10-31T05:58:07Z -->
