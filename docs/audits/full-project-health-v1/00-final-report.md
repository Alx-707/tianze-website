# Tianze Full Project Health Audit v1

## 0. Executive Summary

结论先说：**本地技术基线是绿的，但 Cloudflare preview 的联系页现在是红的；不能把当前 `origin/main` 当作“预览可完整跑通”或“正式公开上线已准备好”。**

这次审计证明了两件事要分开看：

- **工程能跑**：`pnpm type-check`、`pnpm lint:check`、`pnpm test`、`pnpm build`、`pnpm build:cf` 都通过。也就是说，本地 Next.js 构建和 Cloudflare/OpenNext 构建是可用的。
- **预览没有完整跑通**：Cloudflare workers.dev gateway 上 `/en/contact` 和 `/zh/contact` 返回 `500`，web worker tail 明确报 Next Cache Components `blocking-route`。
- **公开上线还不稳**：买家能看到的信任材料还有硬缺口：占位手机号、缺失的 ISO PDF、产品占位图、AS/NZS 标准说法不一致；同时产品询盘测试把关键校验 mock 掉了，测试绿不等于询盘保护链真的被证明。

当前质量 verdict：

```text
Local engineering baseline: Pass
Local Cloudflare build baseline: Pass
Cloudflare preview deployed smoke: Fail on /en/contact and /zh/contact
Public launch readiness: No-go until P1 items are fixed or explicitly removed from launch scope
Production/deployed truth: Preview workers.dev partially proved and currently failing; production domain still not proved
```

本轮没有确认 P0。P1 现在有 6 个：1 个是真实 preview runtime blocker，5 个是上线前必须处理的信任、转化或证明链问题。

## 1. Audit Scope and Baseline

- Run: Audit Run 1 - origin/main clean baseline
- Base: `origin/main`
- Audited commit: `3ea482b53ca8db35f534f495211450d94bee963a`
- Local HEAD: `3ea482b53ca8db35f534f495211450d94bee963a`
- Audit package commit: `a8f8ca0b83e0a267fcab7994fec5e24375dc2379`
- Launch-readiness dirty work: excluded
- Business-code diff relative to `origin/main`: zero
- Preflight evidence: `docs/audits/full-project-health-v1/evidence/preflight.md`

本轮只读审计。写入范围只限审计报告和 evidence。

## 2. Current Quality Verdict

### 2.1 本地工程状态

通过：

- `pnpm type-check`
- `pnpm lint:check`
- `pnpm test`：376 test files / 5208 tests
- `pnpm truth:check`
- `pnpm unused:check`
- `pnpm security:semgrep`：ERROR 0，WARNING 2
- `pnpm quality:gate:fast`
- `pnpm build`
- `pnpm build:cf`

这说明当前主线不是“构建坏了”的状态。

### 2.2 Cloudflare preview 运行态

新增 runtime proof 已经证明：

- preview phase6 三个 worker 可以部署成功。
- workers.dev gateway URL：`https://tianze-website-gateway-preview.kei-tang.workers.dev`
- `/en`、`/zh`、`/api/health`、`/en/products`、`/en/products/north-america` 返回 `200`。
- `/en/contact`、`/zh/contact` 返回 `500`。
- gateway worker tail 是 `Ok`，web worker tail 报 `Route "/[locale]/contact": Uncached data was accessed outside of <Suspense>`。
- 本地 `next dev` 和 `next start` 对照都能返回 `200`，所以这是 Cloudflare/OpenNext runtime 下的 contact-route 问题，不是普通 Next 页面在本地就坏了。

### 2.3 不能误读的地方

这些没有被证明：

- Cloudflare production 部署通过。
- production URL smoke 通过。
- Google 已索引、排名、Search Console 无问题。
- PageSpeed / CrUX / Lighthouse 真实分数。
- Resend / Airtable / Turnstile 真实生产链路。
- 全量 mutation score。

另外，preview 现在只能说“部分页面能跑”，不能说“完整 buyer flow 能跑”。联系页 500 已经挡住主询盘入口；即使联系页修好，当前 preview secrets 也只有 `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`，还没有 Resend / Airtable / Turnstile，真实外部投递链仍不能宣称通过。

## 3. P0 / P1 Findings

### P0

无确认 P0。

### P1

| ID | 问题 | 影响 | Linus Gate |
| --- | --- | --- | --- |
| FPH-000 | Cloudflare preview `/en/contact` 和 `/zh/contact` 返回 500 | 主询盘入口不可用 | Needs proof |
| FPH-001 | 联系手机号还是 `+86-518-0000-0000` | 买家信任受损 | Needs proof |
| FPH-002 | ISO 证书配置有 `/certs/iso9001.pdf`，但 public 文件不存在 | 证书可信度缺口 | Needs proof |
| FPH-003 | 多个 live 产品族还在用 `sample-product.svg` | 产品展示像未完成 | Needs proof |
| FPH-004 | AS/NZS 标准说法在公开文案和产品数据中冲突 | 合规表达不可信 | Simplify |
| FPH-005 | 产品询盘测试声称真实校验，但 mock 了关键 schema | 关键询盘保护链测试假绿 | Simplify |

这些 P1 里，FPH-000 是“预览运行态已经坏了”；其余 5 个不全是线上已经坏了，但共同点是：**如果现在公开给真实买家看，会直接伤害信任、询盘质量或上线前证明链。**

## 4. Architecture and Coupling Map

当前架构不是崩坏状态，`dep:check` 只有 1 个 warning。但变更成本偏高，集中在 5 个地方：

1. `src/app/[locale]/products/[market]/page.tsx` 把产品市场注册、spec wiring、SEO、JSON-LD、cache、render 都放在一个路由文件里。
2. locale 真相分散在 routing、path config、content defaults、message loader、contact page local imports。
3. `contact` copy 仍有 `underConstruction.pages.contact` fallback。
4. route truth 分散在 path config、next-intl pathnames、sitemap config、CTA literal。
5. cache tag 模块保留 product/content/SEO 未来抽象，但当前 launch 架构没有 runtime invalidation。

高成本模块：

- product market route
- locale/message system
- contact flow
- route/path/sitemap config
- env/cache/security proof scripts

## 5. Security and Trust Boundary Findings

安全 lane 没有确认 P0/P1。主要问题是 P2：

- `/api/subscribe` 在完整 email schema validation 前先花 Turnstile 外部验证成本。
- `/api/subscribe` 没有 route-level security regression tests。
- `script-src-elem` 仍有 `'unsafe-inline'`，但本轮没有运行 built-page CSP proof 来证明是否必须。
- CSP report log 接受多个浏览器上报字段，当前是日志边界硬化问题，不是已确认 PII 泄漏。

可信的正面证据：

- `pnpm security:audit` 通过。
- `pnpm security:semgrep` ERROR 0。
- client IP、rate limit key、distributed rate limit、idempotency store 等核心测试通过。
- contact / inquiry 比 subscribe 有更完整的 route/action security tests。

## 6. UI / Performance / Accessibility Findings

UI lane 没有确认 P0/P1。主要问题：

- 移动端可点击区域偏小，尤其 mobile nav、language links、product family sticky nav。
- Playwright axe helper 只调用 `analyze()`，没有 assert violations；contact smoke 里还有 `|| true` 的永真 ARIA 断言。
- Hero 首屏动画存在，但没有 Lighthouse/Web Vitals 证明它实际拖慢，所以只保留 P3。

本轮没有截图和 Lighthouse，因为 lane 没有可用 local server，且 build 由 Lane 00 专门串行执行。

## 7. SEO / Content / Conversion Findings

这是本轮最高风险区域。

本地 SEO implementation 基础是好的：

- sitemap / robots / metadata / canonical / hreflang / structured data 的 targeted tests 通过。
- ProductGroup、breadcrumb、FAQ JSON-LD 有本地实现证据。

但公开内容和买家信任材料有明显上线缺口：

- 电话号像占位。
- ISO PDF 路径不存在。
- 多个产品还显示 sample placeholder。
- AS/NZS 2053 / 61386 表达不一致。
- 产品页的询盘 CTA 仍是泛 `/contact`，没有保留产品上下文。

Google 侧事实全部 blocked：没有 Search Console、URL Inspection、CrUX、PageSpeed 数据。

## 8. Test Value and AI-Smell Findings

测试数量很多，基础命令也绿，但有几类“看起来有证明，实际证明不足”的问题：

- `/api/inquiry` 测试 mock 掉 `productLeadSchema.safeParse`，却声称 validation 是 real code。
- axe helper 不 assert。
- contact form smoke 有永真断言。
- Knip 配置把 `src/components/**` 和 `src/lib/**` 设得太宽，dead-code 检测容易假绿。
- mutation guard 会推荐不存在的 `pnpm test:mutation:lead-security`。
- UI primitive tests 数量偏膨胀，和 buyer-flow proof 的优先级不匹配。

正面证据也存在：schema、idempotency、rate-limit key、route parsing property tests 是有价值的。

## 9. Change-Cost Map

| 区域 | 当前成本 | 原因 |
| --- | --- | --- |
| Product market | 高 | route、catalog、spec、messages、SEO、sitemap、tests 多点编辑 |
| Locale/i18n | 高 | en/zh truth 多处硬编码 |
| Contact/inquiry | 高 | copy、form、server action/API、lead pipeline、external services、tests 交织 |
| Route/SEO config | 中高 | routes、pathnames、sitemap、CTA literal 多处重复 |
| Security proof | 中 | contact/inquiry 证明较强，subscribe 较弱 |
| UI/accessibility proof | 中 | component tests 多，但 browser a11y gate 假绿 |
| Cache tags | 低中 | 当前不坏，但未来抽象残留会误导 |

## 10. Delete-First Repair Plan

优先删或收紧这些“假安全感”：

1. 删除 `underConstruction.pages.contact` production fallback，或把它移到 test fixture。
2. 删除/替换 `sample-product.svg` 的 live product references。
3. 删除或修正 `/certs/iso9001.pdf` 这种没有资产的 proof path。
4. 删除永真 ARIA 断言，修 axe helper，不要保留假测试。
5. 删除 unused content/product/SEO cache tag families，除非能证明当前 production 用得到。
6. 删除或收敛过宽 Knip entry，不要让 dead-code check 假绿。

## 11. Recommended Repair Sequence

### Phase 1 - P1 launch trust and proof chain

1. 修 Cloudflare preview contact 500：先保留 deployed smoke 作为失败复现，再隔离 contact route 的 Cache Components / Suspense / Server Action 边界。
2. 确认真实 phone：替换或从公开页面移除。
3. ISO proof：要么放真实 PDF，要么删公开 file path。
4. 产品图片：把 live product specs 里的 sample placeholder 清零。
5. AS/NZS：确定唯一批准说法，统一 translations、MDX、catalog、specs。
6. `/api/inquiry` tests：移除 schema mock，证明 route-level validation 真实执行。

### Phase 2 - P2 proof and conversion cleanup

7. Subscribe route：pre-Turnstile schema + route tests。
8. Accessibility proof：修 axe helper 和 contact ARIA smoke。
9. Product CTA：接入 product-specific inquiry，或删除未使用 drawer。
10. Product market route：抽出 page model / spec registry。
11. Locale / route truth：减少重复 truth sources。

### Phase 3 - Simplify / delete backlog

12. Knip strict production reachability。
13. mutation guard missing script。
14. cache tag unused families。
15. barrel import warning。
16. CSP runtime proof and possible `unsafe-inline` reduction。

## 12. What We Could Not Prove

| Claim | Status | Why |
| --- | --- | --- |
| Cloudflare preview deploy/auth truth | Partially proved | workers.dev preview deploy passed with explicit env file |
| Preview contact page runtime | Confirmed failing | `/en/contact` and `/zh/contact` return 500 on workers.dev gateway |
| Cloudflare production deploy/auth truth | Blocked | production deploy not run |
| Production post-deploy smoke truth | Blocked | production URL smoke not run |
| Search Console / URL Inspection | Blocked | No Google credentials/export |
| CrUX / PageSpeed field data | Blocked | No external data/API output |
| Lighthouse scores | Blocked | No approved built server/LHCI run in UI/SEO lanes |
| Real Turnstile/Resend/Airtable delivery | Blocked | No safe staging credentials and production writes forbidden |
| Full mutation score | Blocked | Full mutation explicitly not auto-run |
| Runtime CSP inline-script necessity | Needs proof | Static config seen; runtime CSP check needs built app proof |

Blocked 不能写成 confirmed。本报告没有把这些当成已通过。

## 13. Process Retro

详见 `docs/audits/full-project-health-v1/04-process-retro.md`。

简短结论：

- 6-lane 模式有效，能把工程基线、架构、安全、UI、SEO、测试拆开。
- 最有信号的是 Lane 00、04、05。
- Lane 01/02/03 也有价值，但部分 finding 需要 orchestrator 降级，避免把静态风险夸成 launch blocker。
- 下次要提前规定 build artifact / local server / screenshot / CSP check 的交接方式，否则 UI、SEO、CSP 运行态 proof 会被反复 blocked。

## Appendix A: Evidence Log

详见 `docs/audits/full-project-health-v1/03-evidence-log.md`。

## Appendix B: Full Findings JSON

详见 `docs/audits/full-project-health-v1/02-findings.json`。该文件是 JSON array，并需要通过 `jq . docs/audits/full-project-health-v1/02-findings.json`。
