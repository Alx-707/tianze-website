# 衍生项目替换清单

## 目的

这份文档定义：当这个仓库被拿去做未来类似项目 baseline 时，**默认应该先替换什么，后替换什么**。

它不是多站运行时文档。  
它是一个 **single-site derivative-project checklist**。

它主要回答三件事：

- 先替换哪一层
- 哪些底层先别动
- 替换后最少要保住哪些 proof

## One-line rule

未来的 derivative project，应该先替换**站点身份输入层**和**页面表达输入层**，同时尽量保持当前 runtime、Cloudflare、i18n、安全和 proof baseline 不动。

## Replace first

下面这些是第一波应该替换的面。

### 1. 站点身份输入层

优先替换：

- `src/config/single-site.ts`
- `src/config/single-site-product-catalog.ts`
- `src/config/single-site-seo.ts`

通常包括：

- brand name
- company facts
- contact details
- social links
- 默认 SEO 值
- product catalog / market structure
- navigation / footer 输入
- public sitemap / robots 默认值

### 2. 页面表达输入层

优先替换：

- `src/config/single-site-page-expression.ts`

通常包括：

- 首页 section 顺序与分组
- 首页 CTA targets
- 首页 proof / trust 项顺序
- contact FAQ 选项
- contact fallback copy
- about FAQ 选项
- about stats 顺序
- product hub 分组 / specialty market 切分
- 默认 equipment-card 表达输入
- capability / OEM CTA targets

Stop line：

- 不要把 `MERGED_MESSAGES` 搬进替换层
- 不要把 `SPECS_BY_MARKET` 当成第一波 authoring seam
- 不要继续把 heading-prefix 常量、slugify/parser、JSON-LD literals 塞进 `src/config/single-site-page-expression.ts`

### 3. 内容和消息资产

替换位置：

- `messages/{locale}/{critical,deferred}.json`
- `content/pages/**`
- `content/posts/**`

这层主要负责：

- site-specific prose
- CTAs
- FAQ wording
- legal / about copy
- 内容驱动的 SEO wording

### 4. 静态公共资产

替换位置：

- `public/**`

主要包括：

- logos
- social images
- product illustrations / photos
- brand-specific 下载物

## Do not replace first

下面这些是 baseline，不到有明确证据时先别碰：

- `src/middleware.ts`
- `src/lib/load-messages.ts`
- `src/i18n/**` runtime semantics
- contact / inquiry / subscribe protection chain
- 页面实现层常量，比如 `MERGED_MESSAGES`、`SPECS_BY_MARKET`
- Turnstile / rate limit / idempotency
- `open-next.config.ts`
- `wrangler.jsonc`
- Cloudflare build / preview / deploy proof model
- `scripts/release-proof.sh`
- quality-gate / truth-check / translation validation scripts

## 在动 baseline logic 之前

只有当 derivative project 有真实、已验证的需求时，才往替换面之外继续深入，比如：

- runtime / platform 约束真的不同
- abuse-protection 要求真的不同
- form processing contract 真的不同
- deployment proof 要求真的不同
- information architecture 真的不同，而不只是换品牌

## Minimum proof after replacement

正常第一轮 derivative replacement，至少保住这些命令是绿的：

```bash
pnpm review:docs-truth
pnpm review:cf:official-compare
pnpm review:derivative-readiness
pnpm truth:check
pnpm review:translation-quartet
pnpm review:translate-compat
pnpm clean:next-artifacts
pnpm build
```

如果替换碰到 metadata、站点身份、runtime-facing content 或 Cloudflare-sensitive path，再补：

```bash
pnpm build:cf
```

## Anti-patterns

第一波 derivative work 里，别做这些事：

- 把品牌 / 联系方式 / SEO 默认值重新打散回页面里
- 在 wrapper 层再发明第二套真相层
- 没有明确结构决策就重新引入 `src/sites/**` 或 per-site runtime overlays
- 因为“这只是模板分叉”就放松 proof
- 在身份层和页面表达层还没替够之前，先去改 security / platform 行为
