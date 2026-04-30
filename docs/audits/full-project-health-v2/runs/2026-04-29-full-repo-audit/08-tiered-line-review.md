# Tier-A/B/C Line Review Addendum

Run id: `2026-04-29-full-repo-audit`

Scope: repair wave 前的补充深审。只读业务代码，只写本审查产物。

Current HEAD reviewed: `0bf6db0b5345c02aaa3d5c3c23f7fccd0c666a78`

## 结论

本轮 Tier-A/B/C 逐行深审没有推翻前面 6 个 finding，反而把其中两个问题压得更实：

1. Contact SEO 重复标签的核心是 build/start/test 的 canonical base URL 合同不一致，不是 SEO 测试过严。
2. 公开占位不是单点问题，而是配置、消息包、Terms 内容、结构化数据测试、产品图片槽同时外露。

新增两条建议提升为正式 finding 的质量问题：

1. **[P2] 全站主内容 landmark 语义重复**：`src/app/[locale]/layout.tsx` 已经包了全站 `<main id="main-content">`，但多个页面/内容 shell 又返回 `<main>`，实际 DOM 会出现嵌套 main。当前测试只断言“存在 main”，没有断言“只有一个 main”。
2. **[P2] 生产配置验证漏掉真实占位模式**：`pnpm validate:config` 当前通过，但仍允许 `+86-518-0000-0000`、`sample-product.svg` 这类 buyer-facing 占位内容进入生产。现有 placeholder 检测只覆盖 `[PLACEHOLDER]` 形态，挡不住更真实的模板残留。

这两条都不是 P1 launch blocker 的独立根因；它们分别解释了为什么“门禁绿”没有挡住语义质量问题和公开占位问题。

## 覆盖模型

### Tier-A: 逐行深审关键链路

覆盖文件/链路：

- SEO/contact metadata:
  - `src/lib/seo-metadata.ts`
  - `src/app/[locale]/layout-metadata.ts`
  - `src/app/[locale]/contact/page.tsx`
  - `playwright.config.ts`
  - `tests/e2e/seo-validation.spec.ts`
- Layout/accessibility shell:
  - `src/app/[locale]/layout.tsx`
  - `src/app/[locale]/contact/page.tsx`
  - `src/app/[locale]/products/page.tsx`
  - `src/app/[locale]/products/[market]/page.tsx`
  - `src/components/content/about-page-shell.tsx`
  - `src/components/content/legal-page-shell.tsx`
  - `src/app/[locale]/oem-custom-manufacturing/page.tsx`
- Lead/security/API:
  - `src/app/api/inquiry/route.ts`
  - `src/app/api/subscribe/route.ts`
  - `src/app/api/verify-turnstile/route.ts`
  - `src/app/api/csp-report/route.ts`
  - `src/lib/api/lead-route-response.ts`
  - `src/lib/api/read-and-hash-body.ts`
  - `src/lib/api/with-rate-limit.ts`
  - `src/lib/idempotency.ts`
  - `src/lib/turnstile.ts`
- Product/content truth:
  - `src/config/single-site.ts`
  - `src/config/paths/site-config.ts`
  - `src/constants/product-specs/*.ts`
  - `public/images/products/sample-product.svg`
- Runtime/platform:
  - `src/middleware.ts`
  - `next.config.ts`
  - `open-next.config.ts`
  - `wrangler.jsonc`
  - `.claude/rules/cloudflare.md`

### Tier-B: 热点抽样逐行

热点来自 git churn 和前一轮 quality map：

- `package.json`
- `.github/workflows/ci.yml`
- `scripts/quality-gate.js`
- `src/app/[locale]/contact/page.tsx`
- `src/app/[locale]/products/[market]/page.tsx`
- `messages/en*.json`
- `messages/zh*.json`

重点不是重复跑门禁，而是查门禁是否真的代表质量。本轮结论：门禁基础强，但对 buyer-facing placeholder 和 landmark 唯一性这类质量问题覆盖不足。

### Tier-C: 扫描验证

执行过的扫描/验证：

```bash
rg -n "<main\\b" src/app src/components --glob '!**/__tests__/**'
rg -n "\\+86-518-0000-0000" src/config content/pages messages src/lib/__tests__ --glob '!src/lib/content-manifest.generated.ts'
rg -n "/images/products/sample-product\\.svg|Sample Product|Replace this image" src/constants/product-specs public/images/products --glob '!**/__tests__/**'
rg -n "getByRole\\(\"main\"\\)|toHaveCount\\(1\\).*main|main.*toHaveCount\\(1\\)" src tests --glob '*.{ts,tsx}'
node -e "const fs=require('fs'); const pkg=require('./package.json'); for (const [name,cmd] of Object.entries(pkg.scripts)) { const m=cmd.match(/(?:node|tsx|bash)\\s+([^\\s;&|]+)/); if(m && (m[1].startsWith('scripts/')||m[1].startsWith('./scripts/')) && !fs.existsSync(m[1].replace(/^\\.\\//,''))) console.log(name+' -> '+m[1]); }"
pnpm validate:config
pnpm exec vitest run src/config/paths/__tests__/site-config.test.ts
```

Relevant results:

- `pnpm validate:config` passed while public placeholder phone and product images still exist.
- `src/config/paths/__tests__/site-config.test.ts` passed: 25 tests.
- Missing script scan found only:
  - `review:mutation:critical -> scripts/review-mutation-critical.js`
- Runtime source has 11 `<main>` declarations outside tests, while layout already owns the global main wrapper.
- Tests found only “main exists” assertions, not “exactly one main landmark” assertions.

## Existing findings strengthened by line review

### FPH-001 Contact SEO duplicate tags

Evidence chain:

- `playwright.config.ts:153-154` injects both:
  - `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
  - `NEXT_PUBLIC_SITE_URL=https://tianze-pipe.com`
- `src/config/single-site.ts:33-40` gives `NEXT_PUBLIC_SITE_URL` priority over `NEXT_PUBLIC_BASE_URL`.
- `src/app/[locale]/layout-metadata.ts:23-26` sets `metadataBase` from `SITE_CONFIG.baseUrl`.
- `src/lib/seo-metadata.ts:56-80` builds canonical/hreflang from `SITE_CONFIG.baseUrl`.
- `src/app/[locale]/contact/page.tsx:42-50` calls `generateMetadataForPath`.
- Contact page also accepts async `searchParams` and renders form fallback/page data, so it is more likely than a fully static page to expose Next.js streamed metadata behavior.
- `tests/e2e/seo-validation.spec.ts:67-73` only checks that a canonical exists and is absolute; the failure comes from Playwright locator strictness when two canonical nodes exist. That strictness is useful here.

Line-review verdict:

- The right fix is to unify the canonical URL contract for build/start/E2E. Do not relax the SEO test.
- After repair, verify the browser DOM, not only initial HTML.

### FPH-002 Public placeholders

Static scan confirms the phone and product sample are replicated:

- `src/config/single-site.ts:51`
- `messages/en/critical.json:801`
- `messages/zh/critical.json:801`
- `messages/en/deferred.json:252`
- `messages/zh/deferred.json:252`
- `messages/en.json:801`
- `messages/en.json:1696`
- `messages/zh.json:801`
- `messages/zh.json:1696`
- `content/pages/en/terms.mdx:288`
- `content/pages/zh/terms.mdx:288`
- `src/lib/__tests__/structured-data.test.ts:65,92,148`
- `src/constants/product-specs/north-america.ts:73,114`
- `src/constants/product-specs/australia-new-zealand.ts:70,107,144`
- `src/constants/product-specs/mexico.ts:65,98`
- `src/constants/product-specs/europe.ts:72,118`
- `src/constants/product-specs/pneumatic-tube-systems.ts:71`
- `public/images/products/sample-product.svg:32,35`

Line-review verdict:

- This is more than “电话配置忘改”。它已经成为多个生成/同步后的 public surface。
- Repair wave 不能只改 `src/config/single-site.ts`，必须扫消息包、Terms、结构化数据测试和产品图引用。

### FPH-005 Mutation review entry

Script existence scan found only one missing advertised script:

```text
review:mutation:critical -> scripts/review-mutation-critical.js
```

Line-review verdict:

- 这个 finding 仍成立。
- 它是审查入口质量问题，不影响正常 `pnpm test`，但会制造“有关键 mutation 门禁”的假印象。

## New proposed findings

### FPH-007 [P2] Layout already owns `<main>`, page shells add nested/multiple main landmarks

Evidence level: Confirmed by static evidence

Files:

- `src/app/[locale]/layout.tsx:111-113`
- `src/app/[locale]/contact/page.tsx:64-102`
- `src/app/[locale]/products/page.tsx:63-117`
- `src/app/[locale]/products/[market]/page.tsx:92-148`
- `src/components/content/about-page-shell.tsx:172-272`
- `src/components/content/legal-page-shell.tsx:48-98`
- `src/app/[locale]/oem-custom-manufacturing/page.tsx:248-285`
- fallback skeletons in:
  - `src/app/[locale]/about/page.tsx:61-71`
  - `src/app/[locale]/privacy/page.tsx:42-52`
  - `src/app/[locale]/terms/page.tsx:42-52`
  - `src/app/[locale]/oem-custom-manufacturing/page.tsx:291-301`

Evidence:

```text
rg -n "<main\\b" src/app src/components --glob '!**/__tests__/**'
```

returned 11 runtime declarations. The global layout already renders:

```tsx
<main id="main-content" className="flex-1">
  {children}
</main>
```

Pages and shells render additional `<main>` nodes inside that wrapper.

Why this matters:

- It creates nested or multiple `main` landmarks in real pages.
- It weakens the skip-link contract: `#main-content` points to the outer wrapper, while page-specific main content may be a nested landmark.
- Screen reader and accessibility tooling usually expect one main landmark per page. Even if axe does not fail every case, this is bad HTML structure.

Why current tests missed it:

- Tests assert `screen.getByRole("main")` exists in several places.
- E2E no-JS tests assert the HTML contains `id="main-content"`.
- No test asserts exactly one `main` landmark after the full layout + page composition.

Recommended fix:

- Keep one owner:
  - either layout owns `<main id="main-content">` and pages use `<div>` / `<section>` / `<article>`;
  - or layout owns only a wrapper and pages own `<main id="main-content">`.
- Given current skip-link is in layout, the lower-risk repair is: keep layout main, convert page/shell `<main>` to non-main containers.
- Add an E2E or integration test asserting one main landmark for key pages.

Suggested proof:

```bash
CI=1 pnpm test:release-smoke
CI=1 pnpm exec playwright test tests/e2e/no-js-html-contract.spec.ts --project=chromium
CI=1 pnpm exec playwright test tests/e2e/navigation.spec.ts --project=chromium --grep "landmark|skip"
```

### FPH-008 [P2] Production config validation does not catch buyer-facing placeholders

Evidence level: Confirmed by execution + static evidence

Files:

- `src/config/paths/site-config.ts:20-27`
- `src/config/paths/site-config.ts:46-90`
- `src/config/paths/site-config.ts:97-129`
- `scripts/validate-production-config.ts:179-192`
- `src/config/paths/__tests__/site-config.test.ts:48-160`

Execution evidence:

```text
pnpm validate:config
✅ Production configuration validated successfully.
```

At the same time, static scans still show:

- `+86-518-0000-0000` in public config, messages, Terms, and structured-data tests.
- `/images/products/sample-product.svg` in 10 product-family image slots.
- `Sample Product` / `Replace this image with your real product photo` inside a public SVG.

Root cause:

- `isPlaceholder()` only detects bracket-style placeholders:

```ts
const PLACEHOLDER_PATTERN = /^\[.+\]$/;
```

- `getUnconfiguredPlaceholders()` only checks:
  - site name
  - SEO default title
  - title template containing `[PROJECT_NAME]`
  - social URLs
  - contact email
- It does not check:
  - placeholder-looking phone numbers such as `0000-0000`
  - public product image paths
  - placeholder file text
  - copied message bundles
  - Terms content copies

Why this matters:

- The repo has a command named “production configuration validation”, but it currently cannot block the exact public trust placeholder that would damage launch quality.
- This explains why the baseline gates can all be green while launch readiness is still no-go.

Recommended fix:

- Either rename/clarify the command as runtime-env validation only, or extend it to include public trust placeholders.
- Add a dedicated public-launch content guard that checks:
  - known fake phone patterns;
  - `sample-product.svg`;
  - SVG text like `Sample Product` / `Replace this image`;
  - public Terms/contact phone copies;
  - brand asset TODOs when APP_ENV is production.
- Keep owner-dependent assets configurable: if no real phone exists, the passing state should be “phone intentionally hidden”, not “fake phone allowed”.

Suggested proof:

```bash
pnpm validate:config
rg -n "\\+86-518-0000-0000|Sample Product|Replace this image|/images/products/sample-product\\.svg" src content messages public
pnpm review:translation-quartet
pnpm build
```

## Secondary notes not promoted

### Product family slugs repeat across markets

`src/config/single-site-product-catalog.ts` intentionally repeats slugs such as `couplings` and `conduit-pipes` across markets. On the market detail page this is currently safe because each page only renders one market and URLs include the market segment.

Do not promote as a bug now. Treat it as a design constraint:

- Any future cross-market page must scope anchors/keys/structured-data IDs by market.
- Existing market pages can keep family-local anchors like `#couplings`.

### CORS same-origin check ignores scheme

`src/config/cors.ts:117-131` compares Origin hostname with Host hostname. For same host but different scheme, it still treats it as same-origin for CORS helper purposes. In current deployment, same-host API usage and security headers make this low signal. Do not promote without runtime exploitability proof.

### API/lead pipeline line review

The API and lead path is better than average:

- JSON body size limit and stable body hash exist.
- Idempotency requires key on lead routes and fingerprints body hash.
- Turnstile network failures become 503 for lead routes.
- Rate-limit failure modes are preset-driven.

Known hardening remains FPH-006: server-only markers are inconsistent.

## Coverage not claimed

Not covered by this addendum:

- Full literal line-by-line reading of all 615 source TS/TSX files.
- Generated file semantic review, especially `src/lib/content-manifest.generated.ts`.
- Full mutation run.
- Cloudflare preview/deployed runtime behavior.
- Real Resend/Airtable delivery.
- Google Search Console / URL Inspection / CrUX.
- Owner truth verification for phone, images, certifications, customer/project claims.

## Impact on final quality report

If this addendum is folded into the final report:

- Engineering health stays roughly the same: 82/100.
- Code quality stability should drop slightly: from 78/100 to 76/100, because the layout semantic issue is a repo-wide pattern.
- Launch readiness stays blocked mainly by FPH-001 and FPH-002.
- Repair backlog should include FPH-007 and FPH-008 after the P1 launch blockers.

Updated recommended repair order:

1. FPH-001 Contact SEO duplicate metadata.
2. FPH-002 public placeholder contact/product assets.
3. FPH-008 production/public-launch placeholder guard.
4. FPH-007 one-main-landmark cleanup.
5. FPH-004 v2 profile update.
6. FPH-005 mutation critical entry.
7. FPH-006 server-only markers.
8. FPH-003 middleware/proxy proof lane, still parked separately.
