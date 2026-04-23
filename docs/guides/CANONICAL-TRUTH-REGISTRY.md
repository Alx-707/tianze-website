# 当前仓库真相登记表

## 目的

这份文档记录**仓库当前真实在跑的结构**。  
当多个文件都像“主配置”时，用它来判断谁才是真正的 authoring source、runtime source 和 proof source。

如果别的文档和这里冲突，以这里加上它引用的 canonical source 为准。

## 项目身份

- 当前业务项目：**Tianze Website**
- 仓库目录名：`tianze-website`
- 历史 package 名：`b2b-web-template`

规则：

- 做文档、审查、部署判断时，一律按 Tianze Website 理解
- 不要把历史 package 名误当成当前产品身份

## 站点身份真相层

### Canonical authoring sources

- [`src/config/single-site.ts`](../../src/config/single-site.ts)
- [`src/config/single-site-product-catalog.ts`](../../src/config/single-site-product-catalog.ts)
- [`src/config/single-site-page-expression.ts`](../../src/config/single-site-page-expression.ts)
- [`src/config/single-site-seo.ts`](../../src/config/single-site-seo.ts)
- [`src/config/site-types.ts`](../../src/config/site-types.ts)

### 兼容包装层

下面这些文件还在用，但它们不是新真相应该诞生的地方：

- [`src/config/paths/site-config.ts`](../../src/config/paths/site-config.ts)
- [`src/config/site-facts.ts`](../../src/config/site-facts.ts)
- [`src/constants/product-catalog.ts`](../../src/constants/product-catalog.ts)
- [`src/config/footer-links.ts`](../../src/config/footer-links.ts)
- [`src/lib/navigation.ts`](../../src/lib/navigation.ts)

规则：

- 改品牌、公司事实、联系方式、默认 SEO、导航、footer、市场结构，先改 `src/config/single-site.ts`
- 改首页 / contact / products / about / privacy / terms 这些可复用页面表达输入，优先改 `src/config/single-site-page-expression.ts`
- 改 sitemap / robots / public-page SEO 默认值，优先改 `src/config/single-site-seo.ts`
- 不要把实现细节硬搬进页面表达层；像 `MERGED_MESSAGES`、`SPECS_BY_MARKET`、heading-prefix 常量、slugify/parser、JSON-LD 对象字面量，仍留在实现层
- 当前仓库**没有** active runtime `src/sites/**` registry，也没有 per-site message overlays
- `NEXT_PUBLIC_SITE_KEY` 和 `build:site:equipment` 目前只是 future derivative seam，不代表已经是多站运行时

## Runtime Entrypoints

### Web request 入口

- Canonical file：[`src/middleware.ts`](../../src/middleware.ts)

原因：

- 当前 locale redirect、安全头、Cloudflare client IP 推导都在这里
- 当前 Cloudflare 构建链依赖 `middleware.ts`，不是 `src/proxy.ts`

### 根布局真相

- Canonical file：[`src/app/[locale]/layout.tsx`](../../src/app/[locale]/layout.tsx)

原因：

- SSR locale 和 `<html lang>` 真相在这里
- 不要把客户端补丁后的 `document.documentElement.lang` 当成真正 runtime truth

## i18n Runtime Truth

- Canonical loader：[`src/lib/load-messages.ts`](../../src/lib/load-messages.ts)

### 当前 runtime 真正读取的消息源

- [`messages/en/critical.json`](../../messages/en/critical.json)
- [`messages/en/deferred.json`](../../messages/en/deferred.json)
- [`messages/zh/critical.json`](../../messages/zh/critical.json)
- [`messages/zh/deferred.json`](../../messages/zh/deferred.json)

### Important non-truth sources

- `messages/en.json`
- `messages/zh.json`

规则：

- flat 文件主要给测试和校验用
- runtime 不直接把它们当主加载源
- 当前运行时真相是 split bundles
- per-site overlays 仍然只是未来概念，不是现行结构

## About 页面真相

### 当前 runtime 页面

- [`src/app/[locale]/about/page.tsx`](../../src/app/[locale]/about/page.tsx)

### 补充内容资产

- [`content/pages/en/about.mdx`](../../content/pages/en/about.mdx)
- [`content/pages/zh/about.mdx`](../../content/pages/zh/about.mdx)

规则：

- 当前 `/about` 最终输出仍由 route component + translation bundles 决定
- MDX 现在更像内容资产和草稿层，不是当前 route renderer 真相

## 主线索路径

- Canonical production path：**Contact page Server Action**

Canonical files：

- [`src/app/[locale]/contact/page.tsx`](../../src/app/[locale]/contact/page.tsx)
- [`src/lib/actions/contact.ts`](../../src/lib/actions/contact.ts)

Supporting security path：

- [`src/lib/security/client-ip.ts`](../../src/lib/security/client-ip.ts)
- [`src/lib/security/client-ip-headers.ts`](../../src/lib/security/client-ip-headers.ts)

规则：

- 没有 fresh reachability evidence 时，不要把 `/api/inquiry` 或 `/api/subscribe` 说成默认主转化面

## Cloudflare Build 和 Proof Model

### Canonical build path

- `pnpm build:cf`
- 背后脚本：[`scripts/cloudflare/build-webpack.mjs`](../../scripts/cloudflare/build-webpack.mjs)

### 对照链

- `pnpm build:cf:turbo`

只用于：

- 上游兼容性对照
- Cloudflare / OpenNext 工具链差异排查

### Proof boundary

- 本地页面 / header / cookie / redirect proof：
  - `pnpm smoke:cf:preview`
- 更严格的本地诊断：
  - `pnpm smoke:cf:preview:strict`
- 更强的本地 split-worker proof：
  - `pnpm deploy:cf:phase6:dry-run`
- 更强的真实 preview 发布链：
  - `pnpm deploy:cf:phase6:preview`
- 最终 deployed Cloudflare proof：
  - `pnpm smoke:cf:deploy -- --base-url <url>`

规则：

- stock local preview 有用，但有边界
- stock local preview 不等于 split-worker proof
- phase6 dry-run 才是当前更强的本地 Cloudflare proof
- deployed smoke 才是 Cloudflare API 行为的最后证明

## 发布门禁真相

- Canonical release command：`pnpm release:verify`
- Canonical script：[`scripts/release-proof.sh`](../../scripts/release-proof.sh)

规则：

- 这是统一技术发布门禁
- release signoff 仍然是独立的人类决策，不会被脚本自动替代

## 生产配置真相

- Canonical validation script：
  - [`scripts/validate-production-config.ts`](../../scripts/validate-production-config.ts)

当前 production-critical env families：

- Cloudflare 部署凭据
- Contact / Turnstile / Server Actions secrets
- Airtable / Resend integration secrets
- 明确的 degraded override，比如 `ALLOW_MEMORY_RATE_LIMIT`、`ALLOW_MEMORY_IDEMPOTENCY`

## Test-Only / Tooling-Only Surfaces

- `messages/en.json`
- `messages/zh.json`
- 只保存在 git 历史或 Trash 的 retired docs
- `.claude/worktrees/**` 下的生成工作副本

## 当前配套 canonical docs

- [`POLICY-SOURCE-OF-TRUTH.md`](../../docs/guides/POLICY-SOURCE-OF-TRUTH.md)
- [`QUALITY-PROOF-LEVELS.md`](../../docs/guides/QUALITY-PROOF-LEVELS.md)
- [`RELEASE-PROOF-RUNBOOK.md`](../../docs/guides/RELEASE-PROOF-RUNBOOK.md)
- [`.claude/rules/conventions.md`](../../.claude/rules/conventions.md)
