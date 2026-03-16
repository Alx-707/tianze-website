# Next.js -> vinext 迁移兼容性审计（阶段一）

> 审计时间：2026-02-26（本地仓库扫描 + 官方文档核验）
> 范围：仅阶段一（可行性审计），不执行迁移改动

## 审计摘要

- 项目：`b2b-web-template`（仓库目录：`/Users/Data/Warehouse/Focus/tianze-website`）
- Next.js 版本：`16.1.6`
- 路由模式：`App Router`
- 页面数量：
  - `page.tsx` 页面文件 11 个
  - `app/api/**/route.ts` API 路由 9 个
- 迁移可行性：🟡 中（可迁移，但需处理配置层与若干运行时差异）

## 项目概况扫描

### 1) 路由与目录
- `src/app` 存在，`src/pages` 不存在，未发现混用。
- 动态路由：`[locale]`、`[slug]`。
- 未发现：`[...catchAll]`、`[[...optional]]`、Parallel Routes（`@slot`）、Intercepting Routes（`(.)` 等）、Route Groups（`(group)`）。

### 2) CSS/样式方案
- Tailwind CSS v4（`src/app/globals.css` + `@tailwindcss/postcss`）。
- 未发现 CSS Modules（`*.module.css/scss`）。
- 未发现 `styled-components` / `emotion`。

### 3) Next 配置项（`next.config.ts`）
- `outputFileTracingExcludes`
- `cacheComponents: true`
- `turbopack`（含 alias）
- `pageExtensions`
- `productionBrowserSourceMaps`
- `images`（含 `remotePatterns`、cloudflare 分支 `unoptimized`）
- `compiler.removeConsole`
- `experimental.optimizePackageImports` / `inlineCss`
- `webpack` 自定义（alias + server externals）
- `headers()`

## 兼容性矩阵

| 特性 | 使用情况 | vinext 支持 | 风险 | 备注 |
|------|---------|------------|------|------|
| App Router（app/） | ✅ 使用 | ✅ | 低 | 主路由模式 |
| Pages Router（pages/） | ❌ 未使用 | ✅ | 无 | 无需迁移 |
| React Server Components | ✅ 使用 | ✅ | 低 | App Router 默认 |
| Client Components（`use client`） | ✅ 使用（82 文件） | ✅ | 低 | |
| Server Actions（`use server`） | ✅ 使用（`src/app/actions.ts`） | ✅ | 中 | 需实测 action + headers 行为 |
| Middleware（`middleware.ts`） | ✅ 使用 | ✅ | 中 | next-intl + 安全头策略需回归 |
| Route Handlers（`app/api/*/route.ts`） | ✅ 使用（9） | ✅ | 低 | |
| Dynamic Routes（`[slug]`） | ✅ 使用 | ✅ | 低 | |
| Catch-all / Optional catch-all | ❌ 未使用 | ✅ | 无 | |
| Parallel / Intercepting Routes | ❌ 未使用 | ✅ | 无 | |
| Route Groups（`(group)`） | ❌ 未使用 | ✅ | 无 | |
| `fetch()` + `next.revalidate/cache` | ✅ 使用 | ✅ | 中 | `src/lib/load-messages.ts` 等 |
| `generateStaticParams()` | ✅ 使用 | ✅ | 中 | 需确认静态导出策略与目标一致 |
| `generateMetadata()` | ✅ 使用 | ✅ | 低 | 多页面使用 |
| ISR / `revalidate` | ✅ 使用（`next/cache` 路径） | ✅ | 中 | 需在 Workers + KV 实测 |
| `unstable_cache / cacheLife / cacheTag` | ✅ 使用 | ✅ | 中 | 强依赖缓存语义，需回归 |
| `cookies()` / `headers()` | ✅（`headers()`） | ✅ | 中 | Server Action 中使用 |
| `next/image` | ✅ 使用（10） | 🟡 | 中 | vinext 为部分支持，无构建期图片优化 |
| `next/link` | ✅ 使用（5） | ✅ | 低 | |
| `next/font` | ✅ 使用（google） | 🟡 | 中 | 运行时加载/注入，不是 Next 原生构建期行为 |
| `next/script` | ✅ 使用（1） | ✅ | 低 | |
| `next/head` | ❌ 未使用 | ✅ | 无 | |
| `loading.tsx` | ❌ 未使用 | ✅ | 无 | |
| `error.tsx / global-error.tsx` | ✅ 使用 | ✅ | 低 | |
| `not-found.tsx` | ✅ 使用 | ✅ | 低 | |
| `layout.tsx` | ✅ 使用 | ✅ | 低 | |
| `template.tsx` | ❌ 未使用 | ✅ | 无 | |
| `rewrites / redirects / headers` | ✅（headers） | ✅ | 低 | rewrites/redirects 未使用 |
| i18n 配置（next.config.i18n） | ❌ 未使用 | 🟡 | 中 | 项目使用 `next-intl`，需按插件实测 |
| `output: standalone/export` | ❌ 未设置 | 🟡 | 低 | vinext 文档显示支持 `output: 'export'` |
| `transpilePackages` | ❌ 未使用 | 未验证 | 低 | 当前无需求 |
| `webpack` 自定义配置 | ✅ 使用 | ❌ | 高 | vinext 明确走 Vite，不支持 webpack/turbopack 配置 |
| `turbopack` 配置 | ✅ 使用 | ❌ | 高 | 需迁移为 Vite 等价配置 |
| `env/publicRuntimeConfig/serverRuntimeConfig` | ✅（process.env 大量使用） | 🟡 | 中 | 需确认变量注入与暴露边界 |
| `next-auth / auth.js` | ❌ 未使用 | - | 无 | |
| `next-intl` | ✅ 使用 | 🟡 | 中 | 需重点验证 middleware + locale 路由 |
| `@vercel/analytics` / `speed-insights` | ✅ 使用 | ❌（Vercel 特性） | 中 | 需改为 CF/GA4 方案 |
| `next-sitemap` | ❌ 未使用 | - | 无 | |
| `next-seo` | ❌ 未使用 | - | 无 | |
| 其他 `next-*` 包 | `next-themes`、`nextjs-toploader`、`@next/mdx` | 🟡 | 中 | 生态包需逐项 smoke test |

## Node.js API 依赖扫描（server-side）

### 发现的 API 与文件
- `fs/path`：
  - `src/lib/content-parser.ts`
  - `src/lib/content-utils.ts`
  - `src/lib/content/products-source.ts`
  - `src/lib/load-messages.ts`
  - `src/app/[locale]/head.tsx`（`node:fs`, `node:path`）
- `crypto`：
  - `src/lib/whatsapp-service.ts`
  - `src/lib/security/rate-limit-key-strategies.ts`
  - `src/lib/lead-pipeline/utils.ts`
- `net`：`src/lib/security/client-ip.ts`
- `Buffer`：WhatsApp 相关、图片占位符工具

### `node:` 前缀 import
- 业务运行时代码：`src/app/[locale]/head.tsx`
- 构建脚本：`scripts/cloudflare/*.mjs`

### Workers 可用性判断（基于官方 Node compatibility 文档）
- `fs/path/crypto/net/process/buffer`：文档标记为支持（`nodejs_compat` 下）。
- 结论：当前项目 Node API 依赖不是硬阻塞，但需实测关键链路（content 读取、webhook 签名、IP 提取）。

## Cloudflare Workers 运行时兼容性

- 已具备 `wrangler.jsonc` 且启用 `nodejs_compat`，说明项目已有 Workers 适配基础。
- 未发现明显超出 Workers 场景的重型任务：
  - 未发现大文件流式处理/本地写盘等强阻塞行为。
  - `api/whatsapp/send` 含重试等待（`setTimeout` 级别秒级），在高并发下可能抬高请求时延。
- 环境变量当前以 `process.env` 为主，vinext/Workers 下可运行，但仍建议将平台关键变量（如 KV/R2/DO）统一走 bindings 入口。

## 阻塞项（必须解决）

1. `next.config.ts` 中 `webpack` 自定义配置需要迁移（vinext 不支持 webpack/turbopack 配置通道）。
2. `next.config.ts` 中 `turbopack` 配置在 vinext 下无效，需要转为 Vite 配置或移除。
3. `@vercel/analytics` 与 `@vercel/speed-insights` 为 Vercel 特性，需要替代实现。

## 风险项（可能需要适配）

1. `next/font` 与 `next/image` 在 vinext 为部分支持，渲染和性能行为会与 Next 原生存在差异。
2. `next-intl`（含 middleware、locale cookie、路径前缀）需重点回归测试。
3. 大量 `next/cache`（`cacheLife/cacheTag/revalidateTag`）依赖缓存语义，需在 vinext + Workers 下验证一致性。
4. 内容系统使用 `fs` 读取（content/messages），虽官方标注支持，但应做端到端验证。
5. `process.env` 使用面很广（含 Vercel 相关变量），建议在迁移中统一梳理为 CF 绑定与平台中立变量。

## 无风险项

1. 当前仅使用 App Router，无 Pages Router 混用复杂度。
2. API 路由规模可控（9 个），路由结构清晰。
3. 动态路由形态较简单（无并行/拦截/可选 catch-all 等复杂路由特性）。

## 迁移建议

1. 先做最小 POC：仅替换脚本到 `vinext dev/build/start`，不改业务代码，验证路由与 API 基线可运行。
2. 第二步处理阻塞项：
   - 移除/改写 `webpack`、`turbopack` 配置；
   - 保留 `next.config.ts` 中通用配置（如 `headers/images/pageExtensions`）；
   - 新建 `vite.config.ts` 承接原 alias 与必要插件。
3. 第三步处理平台差异：
   - 替换 Vercel Analytics/Speed Insights；
   - 梳理 `process.env` -> CF bindings（至少对缓存与平台识别变量）；
   - 验证 `next/font`/`next/image` 的视觉与性能回归。
4. 第四步做验收矩阵：
   - 全部路由可访问；
   - Server Actions、middleware、API、缓存失效流程通过；
   - 对比构建时间与 bundle 体积。

## 时效性说明（关键）

- 你提供的背景中提到“vinext 暂不支持 build-time SSG”。
- 根据 2026-02-26 读取的 vinext 官方 README：`output: 'export'` 已列为支持（静态导出能力存在），但 vinext 默认路径更偏向 SSR，且与 Next 的构建期优化策略不完全等价。

## 参考资料

- vinext README：<https://github.com/cloudflare/vinext>
- vinext 原始 README（当前主分支）：<https://raw.githubusercontent.com/cloudflare/vinext/main/README.md>
- Cloudflare Workers Node.js 兼容性：<https://developers.cloudflare.com/workers/runtime-apis/nodejs/>
- Cloudflare Workers Node.js 兼容性（Markdown 原文）：<https://developers.cloudflare.com/workers/runtime-apis/nodejs/index.md>

---

**阶段一已完成。按你的要求，此处暂停，等待你确认后再进入阶段二执行迁移。**
