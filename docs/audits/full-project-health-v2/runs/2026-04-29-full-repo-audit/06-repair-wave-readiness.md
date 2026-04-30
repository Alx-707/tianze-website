# Repair Wave Readiness

Run id: `2026-04-29-full-repo-audit`

Purpose: 把 5 阶段深审结果转成 repair wave 的可执行边界。此文件不是修复记录，只是进入 repair 前的分流清单。

## 可以立刻进入 repair 的项

### R1 - Contact SEO duplicate metadata

Priority: P1

Write scope:

- `src/lib/seo-metadata.ts`
- `src/config/single-site.ts` 或 env/test config 的 URL 合同相关文件
- `playwright.config.ts` 如最终决定修 E2E env 合同
- 对应 SEO/unit/E2E 测试

Do:

- 统一 build/start/test 的 canonical base URL 来源。
- 保证 `/en/contact` 和 `/zh/contact` 最终 DOM 只有一套 canonical/hreflang/og:url。
- 保留严格 SEO 测试。

Do not:

- 不要只改测试期望。
- 不要只用 curl 初始 HTML 作为修复证明。

Minimum proof:

```bash
CI=1 pnpm exec playwright test tests/e2e/seo-validation.spec.ts --project=chromium --grep "Contact"
CI=1 pnpm exec playwright test tests/e2e/seo-validation.spec.ts --project=chromium
pnpm build
```

### R2 - Public placeholder contact/product assets

Priority: P1

Write scope:

- `src/config/single-site.ts`
- `messages/en*.json`
- `messages/zh*.json`
- `content/pages/en/terms.mdx`
- `content/pages/zh/terms.mdx`
- `src/constants/product-specs/*.ts`
- `public/images/products/*`
- tests that assert placeholders are allowed

Do:

- 如果 owner 给真实电话：替换所有公开电话副本，并更新结构化数据测试。
- 如果 owner 未给真实电话：隐藏页面电话和 structured data telephone，不继续展示假电话。
- 产品图至少移除直白 `Sample Product` / `Replace this image` 文案。

Do not:

- 不要只改 `single-site.ts`，因为消息包和 Terms 内容仍有副本。
- 不要让多个产品页继续指向显眼的 sample image。

Minimum proof:

```bash
rg -n "\\+86-518-0000-0000|Sample Product|Replace this image|/images/products/sample-product\\.svg" src content messages public
pnpm review:translation-quartet
pnpm test:translate-compat
pnpm build
```

### R3 - Public-launch placeholder guard

Priority: P2

Write scope:

- `src/config/paths/site-config.ts`
- `scripts/validate-production-config.ts`
- possible new release/public-launch guard script
- tests around site config and validation behavior

Do:

- Make the current public placeholder state fail an explicit production/public-launch check.
- Cover fake-looking phone patterns such as `0000-0000`.
- Cover `sample-product.svg`, `Sample Product`, `Replace this image`, and public Terms/contact copies.
- If owner data is unavailable, the passing state should be "intentionally hidden/suppressed", not "fake placeholder allowed".

Do not:

- Do not pretend `validate:config` proves launch content quality unless it actually checks launch content.
- Do not block local development on owner-only assets unless the guard is scoped to production/public-launch validation.

Minimum proof:

```bash
pnpm validate:config
rg -n "\\+86-518-0000-0000|Sample Product|Replace this image|/images/products/sample-product\\.svg" src content messages public
pnpm test
```

## 第二波处理项

### R4 - One-main-landmark cleanup

Priority: P2

Write scope:

- `src/app/[locale]/contact/page.tsx`
- `src/app/[locale]/products/page.tsx`
- `src/app/[locale]/products/[market]/page.tsx`
- `src/components/content/about-page-shell.tsx`
- `src/components/content/legal-page-shell.tsx`
- `src/app/[locale]/oem-custom-manufacturing/page.tsx`
- fallback skeletons in about/privacy/terms/OEM pages
- relevant accessibility or no-JS HTML tests

Do:

- Keep a single owner for the main landmark.
- Recommended low-risk path: keep `src/app/[locale]/layout.tsx` as the owner of `<main id="main-content">`.
- Convert nested page/shell `<main>` wrappers to `div`, `section`, or `article` containers.
- Add a regression check that key composed pages expose exactly one main landmark.

Do not:

- Do not remove `id="main-content"` without also updating skip-link behavior.
- Do not only change tests; the rendered HTML ownership model should be simplified.

Proof:

```bash
rg -n "<main\\b" src/app src/components --glob '!**/__tests__/**'
CI=1 pnpm exec playwright test tests/e2e/no-js-html-contract.spec.ts --project=chromium
CI=1 pnpm test:release-smoke
```

### R5 - Update v2 audit project profile

Priority: P2

Write scope:

- `docs/audits/full-project-health-v2/project-profile.md`

Do:

- 更新 Next/React/TypeScript/Tailwind/next-intl/OpenNext/Node/pnpm 版本。
- 把 Next docs 路径改成 `node_modules/next/dist/docs/`。
- 删除 `.next-docs/` 作为当前 truth source。

Proof:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 /Users/Data/.codex/skills/repo-health-audit/scripts/validate_audit_config.py docs/audits/full-project-health-v2/audit.config.json
rg -n "TypeScript 5\\.9|next-intl 4\\.8|\\.next-docs" docs/audits/full-project-health-v2/project-profile.md
```

### R6 - Repair or delete review:mutation:critical

Priority: P2

Write scope:

- `package.json`
- possible wrapper under `scripts/`
- tests for review/mutation script if wrapper is restored

Decision:

- Restore if the repo wants a single critical mutation review command.
- Delete if existing `test:mutation:*` commands and `scripts/check-mutation-required.js` are enough.

Proof:

```bash
pnpm review:mutation:critical
```

or, if deleted:

```bash
pnpm run | rg "mutation"
```

### R7 - Add server-only markers to sensitive server files

Priority: P2

Write scope:

- `src/app/api/subscribe/route.ts`
- `src/app/api/csp-report/route.ts`
- `src/app/api/verify-turnstile/route.ts`
- `src/lib/lead-pipeline/process-lead.ts`
- `src/lib/security/stores/idempotency-store.ts`
- possible related stores/actions/processors after compatibility check

Do:

- Add `import "server-only"` only where the module is truly server-only.
- Keep framework route boundaries and tests intact.

Proof:

```bash
pnpm type-check
pnpm lint:check
pnpm test:lead-family
pnpm build
```

## Parked proof lane

### R8 - middleware.ts to proxy.ts

Priority: P2, parked

Reason:

- Next.js 16.2.4 官方文档建议迁移。
- 但本仓库 Cloudflare/OpenNext 规则和历史记录都显示不能直接 rename。

Do not include in normal repair wave.

Required proof branch steps:

```bash
rg -n "middleware|proxy" src .claude next.config.ts open-next.config.ts wrangler.jsonc docs package.json
pnpm build
pnpm build:cf
pnpm preview:cf
pnpm smoke:cf:preview
pnpm exec vitest run src/__tests__/middleware-locale-cookie.test.ts src/lib/security/__tests__/client-ip.test.ts src/app/__tests__/actions.test.ts
```

Exit criteria:

- `src/proxy.ts` or migrated entry is actually recognized by Next build.
- Cloudflare/OpenNext build passes.
- Preview page rendering works.
- locale redirect, locale cookie, CSP/security headers, `/api/health`, trusted internal client IP header behavior remain correct.
- Only after that update `.claude/rules/cloudflare.md`.

## Recommended execution order

1. R1 Contact SEO.
2. R2 public placeholders.
3. R3 public-launch placeholder guard.
4. R4 one-main-landmark cleanup.
5. R5 profile update.
6. R6 mutation critical entry.
7. R7 server-only markers.
8. R8 middleware/proxy proof branch.

## Stop lines

- If Contact SEO fix needs changing Cloudflare middleware behavior, pause and widen proof to Cloudflare.
- If owner cannot provide real phone/images, implement hide/suppress path rather than inventing content.
- If `server-only` breaks client import assumptions, treat it as a useful boundary discovery and fix the import direction, not by removing the marker blindly.
- If `proxy.ts` passes `pnpm build` but fails `pnpm build:cf`, keep `middleware.ts` and document the proof result.
