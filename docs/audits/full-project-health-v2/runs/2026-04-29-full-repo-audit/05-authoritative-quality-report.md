# Full Project Health Audit v2 - Authoritative Quality Report

Run id: `2026-04-29-full-repo-audit`

> Current-truth note (2026-05-05): This historical audit remains useful as
> evidence, but several findings have been superseded. In particular,
> idempotency wait now has a bounded timeout, pending logo assets use text
> fallback instead of rendering a broken header image, and test-file counts must
> include co-located `src/**/__tests__` files rather than only root `tests/`.

Scope of this second-stage review: repair wave 前深审，只做诊断、分流和修复准备，不改业务代码。

Current HEAD reviewed: `0bf6db0b5345c02aaa3d5c3c23f7fccd0c666a78`

## 结论

这份报告可以作为当前仓库的权威代码质量报告，但边界要说清楚：

- 对本地代码、构建、测试、E2E production-start、静态内容、脚本入口、审查适配器：结论可信。
- 对 Cloudflare preview / deployed runtime、Google Search Console、真实 Resend/Airtable 投递、真实 owner 素材：仍然不能越界宣称已证明。

仓库工程底座是健康的；真正挡 launch-ready 的不是 TypeScript、lint、unit test 这类基础门禁，而是：

1. Contact 页 SEO metadata 在 production-start 场景会被重复注入。
2. 买家可见的电话、条款内容、结构化数据和产品图仍带占位信息。
3. 页面 layout 语义存在一处仓库级模式问题：layout 已经拥有 `<main id="main-content">`，页面和 shell 又重复创建 `<main>`。
4. 后续审查工具链有三处假信号：v2 profile 过期、`review:mutation:critical` 入口断裂、`validate:config` 不能挡住 buyer-facing 占位。
5. `middleware -> proxy` 是 Next.js 官方迁移方向，但本仓库 Cloudflare/OpenNext 兼容性还没有被重新证明，不能和普通修复混在一起。

## 质量评分

| 维度 | 分数 | 说明 |
| --- | ---: | --- |
| 工程健康度 | 82/100 | 类型、lint、单测、构建、Cloudflare build、security audit、架构脚本整体过线。 |
| 代码质量稳定性 | 76/100 | 关键链路测试基座强，但 SEO/env 合同、main landmark 所有权、审查入口、server-only 标记一致性仍有流程债。 |
| Launch readiness | 68/100 | buyer-facing 占位内容和 Contact SEO 重复标签让公开上线不干净。 |
| Cloudflare migration readiness | 55/100 | 当前可构建，但 middleware/proxy 迁移缺少 preview/deploy proof。 |

## 本轮 5 阶段 + Tier-A/B/C 逐行深审结果

### 阶段 1：复核 6 个发现与边界

复核结论：6 个 finding 仍然成立，没有发现需要撤销的项。

证据摘要：

- `src/lib/seo-metadata.ts:216-230` 仍然由 `SITE_CONFIG.baseUrl` 生成 path-aware canonical/hreflang。
- `src/config/single-site.ts:50-52` 仍然是 `+86-518-0000-0000`。
- `public/images/products/sample-product.svg:31-35` 仍然显示 `Sample Product` 和替换提示。
- `.claude/rules/cloudflare.md:80-82` 仍然要求 `src/middleware.ts` 为 Cloudflare-compatible entry。
- `docs/audits/full-project-health-v2/project-profile.md:11-18` 仍然写 TypeScript 5.9、next-intl 4.8、`.next-docs/`。
- `package.json:161` 仍然指向不存在的 `scripts/review-mutation-critical.js`。
- `rg -n '^import "server-only"|server-only' src/app/api src/lib/lead-pipeline src/lib/security/stores` 当前只命中 `src/app/api/inquiry/route.ts:6`。

分类：

| Finding | 类型 | 是否 repair wave 可直接处理 |
| --- | --- | --- |
| FPH-001 Contact SEO 重复标签 | 代码/运行合同问题 | 是，优先修 |
| FPH-002 公开占位内容 | owner 输入 + 代码侧隐藏/替换 | 部分可修，真实资料需 owner |
| FPH-003 middleware/proxy 漂移 | 平台迁移 proof 问题 | 不直接修，单独 proof lane |
| FPH-004 v2 profile 过期 | 审查流程债 | 可直接修 |
| FPH-005 mutation critical 入口断裂 | 审查入口债 | 可直接修或删除 |
| FPH-006 server-only 不一致 | 安全边界 hardening | 可小修 |

### 阶段 2：Contact SEO 根因

结论：这是构建期 URL 合同和运行期 URL 合同不一致，被 Next.js streaming metadata 放大后的真实问题，不是测试太严。

现象复核：

- 现有 `.next/server/app/en/contact.html` 初始 HTML 里 `<head>` 只有 localhost 这套：
  - `http://localhost:3000/en/contact`
  - `http://localhost:3000/zh/contact`
- 用 E2E-like `pnpm start` 运行，并同时设置：
  - `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
  - `NEXT_PUBLIC_SITE_URL=https://tianze-pipe.com`
- 浏览器最终 DOM 里 `/en/contact` 变成两套：
  - canonical: `http://localhost:3000/en/contact`
  - canonical: `https://tianze-pipe.com/en/contact`
  - hreflang: localhost en/zh/x-default
  - hreflang: production en/zh/x-default
- 去掉运行期 `NEXT_PUBLIC_SITE_URL` 后，同一构建产物下 `/en/contact` 最终 DOM 只剩 localhost 一套。

关键代码路径：

- `playwright.config.ts:149-155` 在 E2E webServer env 同时注入 `NEXT_PUBLIC_BASE_URL` 和 `NEXT_PUBLIC_SITE_URL`。
- `src/config/single-site.ts:33-40` 的优先级是 `NEXT_PUBLIC_SITE_URL` 高于 `NEXT_PUBLIC_BASE_URL`。
- `src/app/[locale]/contact/page.tsx:24-27` 接收 `searchParams`。
- `src/app/[locale]/contact/contact-page-sections.tsx:155-208` 在 Suspense 内异步解析 `searchParams`。
- `src/lib/seo-metadata.ts:216-230` 运行时再按 `SITE_CONFIG.baseUrl` 生成 canonical/hreflang。

Next.js 官方文档依据：

- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` 说明：如果 `generateMetadata` 不能随初始 HTML 一起完成，metadata 可被 streaming，并追加到 body。
- 同一文档说明 Cache Components 下，如果 metadata 访问 runtime data 或动态输入，会进入 request-time/streaming 语义。

最小修复方向：

1. 先统一 E2E production-start 的 canonical base URL 合同，不要让 build 阶段和 start 阶段拿不同 canonical host。
2. Contact 页修复后必须验证最终浏览器 DOM，而不只验证 curl 初始 HTML。
3. 不要放宽 SEO E2E；这个测试抓到的是用户/爬虫最终 DOM 的真实重复。

推荐验证：

```bash
CI=1 pnpm exec playwright test tests/e2e/seo-validation.spec.ts --project=chromium --grep "Contact"
CI=1 pnpm exec playwright test tests/e2e/seo-validation.spec.ts --project=chromium
pnpm build
```

如果修复触及 Cloudflare runtime/env 合同，再追加：

```bash
pnpm build:cf
pnpm preview:cf
pnpm smoke:cf:preview
```

### 阶段 3：公开占位与业务输入阻塞

结论：占位问题不只是 `single-site.ts` 一行电话，而是多条 buyer-facing 输出链同时外露。

确认外露面：

- `src/config/single-site.ts:50-52`
  - 电话：`+86-518-0000-0000`
- `messages/en/critical.json`
- `messages/zh/critical.json`
- `messages/en/deferred.json`
- `messages/zh/deferred.json`
- `messages/en.json`
- `messages/zh.json`
  - 多处消息包仍包含同一电话。
- `content/pages/en/terms.mdx:288`
- `content/pages/zh/terms.mdx:288`
  - 条款页公开展示同一占位电话。
- `src/lib/structured-data-generators.ts:95-100`
  - Organization structured data 的 `telephone` 会从翻译或 `SITE_CONFIG.contact.phone` 取值。
- `src/constants/product-specs/*.ts`
  - 10 个产品规格图片槽仍引用 `/images/products/sample-product.svg`。
- `public/images/products/sample-product.svg:31-35`
  - 图片本身写着 `Sample Product` 和替换提示。

还发现一层相关风险：

- `public/images/hero/*.svg` 的 aria-label 仍带 `placeholder` 字样。
- `public/images/README.md:43-47` 仍说 Apple Touch Icon 待创建，但当前 root 下已有 icon 类文件需要另行核验命名与引用。
- `next.config.ts:98-102` 仍允许 `via.placeholder.com` 作为图片远程源；这更像开发遗留，不是当前 P1，但 launch 前应删除或写明业务理由。

修复分流：

| 项 | 建议处理 |
| --- | --- |
| 真实公开电话 | owner 必须确认；确认前建议隐藏页面电话和 structured data telephone，而不是继续展示假电话 |
| Terms 页电话 | 与主配置同源化或移除，避免内容副本漂移 |
| i18n 消息包电话 | 不应手工散落维护；修复时要统一生成/同步 |
| sample-product.svg | 不能公开上线；要么换真实图，要么改为不带 Sample/Replace 字样的 neutral product illustration |
| 产品规格引用 | 如果真实图未到，至少不要让多个 SKU 指向同一个显眼 Sample 图 |
| placeholder hero aria-label | launch polish 项，避免无障碍树暴露“placeholder” |

### 阶段 4：测试入口与 audit adapter 流程债

结论：这里不是业务功能 bug，但会让未来审查产生假信号。

#### v2 profile 过期

当前真实依赖：

- Next.js `16.2.4`
- React `19.2.5`
- TypeScript `^6.0.3`
- Tailwind CSS `^4.2.4`
- next-intl `^4.11.0`
- @opennextjs/cloudflare `1.19.4`
- Node `>=24 <25`
- pnpm `10.13.1`

当前 profile 错误：

- TypeScript 5.9
- next-intl 4.8
- `.next-docs/`

命令复核：

- `test -d .next-docs` 返回不存在。
- `test -d node_modules/next/dist/docs` 返回存在。
- `PYTHONDONTWRITEBYTECODE=1 python3 /Users/Data/.codex/skills/repo-health-audit/scripts/validate_audit_config.py docs/audits/full-project-health-v2/audit.config.json` 通过。

处理建议：

- 更新 `project-profile.md`，以 `package.json` 和 `AGENTS.md` 为真相源。
- 保留 `audit.config.json`，它结构有效。

#### `review:mutation:critical` 入口断裂

命令复核：

```bash
pnpm review:mutation:critical
```

结果：

```text
Error: Cannot find module '/Users/Data/Warehouse/Pipe/tianze-website/scripts/review-mutation-critical.js'
```

现有相关脚本：

- `scripts/check-mutation-required.js`
- `test:mutation`
- `test:mutation:idempotency`
- `test:mutation:security`
- `test:mutation:lead`
- `test:mutation:lead-security`
- `test:mutation:form-schema`

处理建议：

- 如果 `review:mutation:critical` 的本意是“根据改动判断是否需要 mutation 报告”，就应改为真实入口或恢复 wrapper。
- 如果没有稳定维护价值，就删除这个 package script，避免审查人员误以为它是可用门禁。

### 阶段 5：server-only 与 middleware/proxy 分流

#### server-only

结论：这是 P2 hardening，可在 repair wave 小修，不是当前 P1 launch blocker。

原因：

- API route 本身已经是框架服务端边界。
- 但仓库规则 `.claude/rules/security.md:39-44` 明确要求敏感 server 文件加 `import "server-only"`。
- 当前只有 `src/app/api/inquiry/route.ts:6` 命中。

优先添加候选：

- `src/app/api/subscribe/route.ts`
- `src/app/api/csp-report/route.ts`
- `src/app/api/verify-turnstile/route.ts`
- `src/lib/lead-pipeline/process-lead.ts`
- `src/lib/security/stores/idempotency-store.ts`
- 可顺手评估 `src/lib/security/stores/rate-limit-store.ts`、`src/lib/actions/contact.ts`、lead processors。

验证：

```bash
pnpm type-check
pnpm lint:check
pnpm test:lead-family
pnpm test:locale-runtime
pnpm build
```

#### middleware/proxy

结论：用户判断是对的。官方建议迁移，但本仓库不能直接迁。

官方证据：

- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` 明确说 `middleware` convention deprecated and renamed to `proxy`。

仓库现实：

- `src/proxy.ts` 当前不存在。
- `src/middleware.ts` 当前承担 locale redirect、CSP nonce、安全头、health short-circuit、trusted client IP internal header 等关键逻辑。
- `.claude/rules/cloudflare.md:80-82` 明确写：`src/proxy.ts` 过去能过 `next build`，但会阻塞 `pnpm build:cf`。
- `docs/guides/QUALITY-PROOF-LEVELS.md:197-200` 仍写当前 Cloudflare 兼容链里 `src/middleware.ts` 是优先入口。
- `docs/technical/deployment-notes.md:150-156` 也写当前运行时入口仍是 `src/middleware.ts`。
- `docs/superpowers/plans/2026-04-27-health-audit-repair-plan.md:1575-1584` 明确把 middleware deprecation parked，不要现在 rename。

处理建议：

- 不进入本次普通 repair wave。
- 单独建 proof branch。
- 只在 proof lane 证明 `pnpm build`、`pnpm build:cf`、`pnpm preview:cf`、`pnpm smoke:cf:preview`、关键 locale/header/cookie/IP 行为都通过后，再改 `.claude/rules/cloudflare.md`。

### Tier-A/B/C 逐行深审补充：layout 语义与验证盲区

结论：补充逐行深审没有推翻前 6 个 finding，但新增两条 P2 级质量问题。

#### FPH-007：layout 和页面重复拥有 `<main>`

证据：

- `src/app/[locale]/layout.tsx:111-113` 已经渲染全站 `<main id="main-content">`。
- `rg -n "<main\\b" src/app src/components --glob '!**/__tests__/**'` 当前返回 11 个运行态声明。
- 重复声明出现在 contact、products、market product、about shell、legal shell、OEM 页面和多个 fallback skeleton。
- 当前测试只看到：
  - `screen.getByRole("main")`
  - no-JS HTML 包含 `id="main-content"`
  - 没有检查“完整 layout + page 组合后只有一个 main landmark”。

裁决：

- 这是 accessibility / HTML semantics 问题，不是视觉 P1。
- repair wave 应选择一个 owner。按当前 skip-link 设计，低风险方向是保留 layout 的 `<main id="main-content">`，把页面/shell 内层 `<main>` 改为 `div` / `section` / `article`。

#### FPH-008：production config validation 没挡住 public placeholders

证据：

- `pnpm validate:config` 输出 `Production configuration validated successfully.`
- 同时当前静态扫描仍命中：
  - `+86-518-0000-0000`
  - `/images/products/sample-product.svg`
  - `Sample Product`
  - `Replace this image with your real product photo`
- `src/config/paths/site-config.ts:20-27` 的 `isPlaceholder()` 只识别 `[PLACEHOLDER]` 形态。
- `getUnconfiguredPlaceholders()` 只检查少量 SITE_CONFIG 字段，不查 fake phone pattern、产品图路径、SVG 文案、Terms/contact 副本、消息包副本。

裁决：

- 这解释了为什么门禁能绿但 launch readiness 仍然 no-go。
- repair wave 应把 public-launch placeholder guard 加到正式质量链路，或至少明确 `validate:config` 不是 public launch content guard。

## 最终 findings 裁决

| ID | Severity | 当前裁决 | Repair lane |
| --- | --- | --- | --- |
| FPH-001 | P1 | 保持 P1；真实运行问题 | Repair wave 1 |
| FPH-002 | P1 | 保持 P1；buyer-facing launch blocker | Repair wave 1 + owner input |
| FPH-003 | P2 | 保持 P2；parked proof lane | 独立 Cloudflare proof |
| FPH-004 | P2 | 保持 P2；流程债 | Repair wave 2 |
| FPH-005 | P2 | 保持 P2；假门禁 | Repair wave 2 |
| FPH-006 | P2 | 保持 P2；hardening | Repair wave 2 |
| FPH-007 | P2 | 新增；main landmark 语义重复 | Repair wave 2 |
| FPH-008 | P2 | 新增；生产验证漏挡 public placeholders | Repair wave 1.5 |

## 推荐 repair wave 顺序

### Wave 1：launch blocker

1. 修 Contact SEO URL 合同。
   - 不放宽测试。
   - 以浏览器最终 DOM 为准。
2. 处理公开占位电话与产品图。
   - owner 未给真实电话时，隐藏页面电话和 structured data telephone。
   - owner 未给真实产品图时，至少移除 `Sample Product` / `Replace this image` 这类直白占位文本。
3. 补 public-launch placeholder guard。
   - 当前 placeholder 状态不应继续通过生产配置/发布前检查。

### Wave 2：审查链与安全边界

4. 清理 one-main-landmark 所有权。
5. 更新 `docs/audits/full-project-health-v2/project-profile.md`。
6. 修复或删除 `review:mutation:critical`。
7. 添加合理的 `import "server-only"` 标记。

### Wave 3：平台迁移 proof

8. 单独验证 `middleware.ts -> proxy.ts`。
   - 只 proof，不和 SEO/内容修复混 PR。
   - Cloudflare/OpenNext 过线前不要改规则。

## 不建议做的事

- 不要把门禁绿当作 launch-ready。
- 不要为了让 E2E 绿而放松 canonical/hreflang 断言。
- 不要在未确认 Cloudflare/OpenNext 兼容前把 `src/middleware.ts` 直接改成 `src/proxy.ts`。
- 不要继续让真实买家看到 `+86-518-0000-0000` 或 `Sample Product`。
- 不要在 repair wave 里同时混入 SEO、业务素材、mutation、server-only、Cloudflare migration；这会让回归归因变差。

## 最终判断

工程上：可以继续开发。

公开上线：当前不建议。

进入 repair wave：可以，但必须按上面的分流顺序执行；尤其 `middleware/proxy` 先 parked，不要和 launch blocker 混在一起。
