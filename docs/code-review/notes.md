# Notes: 全面代码审查（tianze-website）

> 说明：这里存放“证据/中间发现/命令输出摘要”。最终可执行的待办条目汇总到 `docs/code-review/issues.md`。

## 基线信息（2026-03-05）

### 技术栈与工程化
- Next.js 16.1.6 + React 19.2.3 + TypeScript 5.9.3（见 `README.md`、`package.json`）。
- 质量门禁：`scripts/quality-gate.js`（覆盖率/安全/代码质量阈值单一权威源）。
- 本地 CI 脚本：`scripts/ci-local.sh`（quick/完整模式）。
- 静态分析：
  - ESLint（Flat config，含 security plugins）
  - Semgrep（`semgrep.yml`）
  - dependency-cruiser（`.dependency-cruiser.js`）
  - knip（`knip.jsonc`）

### 运行结果摘要
- `pnpm ci:local:quick` 全部通过。
- 覆盖率（全量）：
  - lines 79.42%
  - statements 78.61%
  - functions 74.89%
  - branches 71.9%

### 构建/路由形态（Next build）
- 页面多数为 PPR（◐），API routes 多为动态（ƒ），符合 Cache Components 预期。
- middleware 存在（Next 输出 `ƒ Proxy (Middleware)`），安全头部由 middleware 注入 nonce。

## 重要发现（待转成问题清单）

## Phase 3：API 写接口深审（src/app/api/**）

### 范围与目标
- 范围：`src/app/api/**` 下所有“写接口”（POST）及其抗滥用/校验/错误处理链路；同时补看少量与写接口紧密相关的管理/安全端点（例如 contact stats、Turnstile 验证）。
- 目标：明确每个端点的“安全闸门顺序”（rate limit / Turnstile / API key / signature / body size / schema），并把可落地问题转成 `docs/code-review/issues.md` 条目（含验收命令）。

### 结论摘要（本轮新增问题条目）
- CR-007：`/api/inquiry` 允许 body 覆盖 `type`，端点语义可被改写（建议 route 层白名单 pick + 强制 `type` 置后）。
- CR-008：CORS 仅处理预检（OPTIONS），实际响应未统一回写 CORS header（未来跨域调用会出现“预检过但响应被拦截”）。
- CR-009：`/api/csp-report` 无 body size 限制，`request.text()` 可被滥用造成资源消耗。
- CR-010：`/api/whatsapp/webhook` 使用字符长度做 size gate（`rawBody.length`），可能低估 UTF-8 字节数。
- CR-011：`/api/subscribe` 幂等键不强制 + store 为内存实现，生产环境幂等效果可能不稳定。
- CR-012：`/api/cache/invalidate` secret 未配置时仍返回 401，易掩盖“服务未配置”。
- CR-013：`/api/contact` 管理统计 GET 无 rate limit，存在暴力枚举/打点噪声风险。
- CR-014：`/api/whatsapp/send` 限流为 IP 粒度（默认 keyStrategy），建议补 post-auth per-API-key 限流。

### 端点清单（第一轮摸底）

| Endpoint | Methods | 主要用途 | 认证/校验闸门（按执行顺序） | 备注 |
|---|---|---|---|---|
| `/api/contact` | `POST/GET/OPTIONS` | 联系表单提交 + 管理统计（GET） | `withRateLimit(contact)` → `safeParseJson` → `validateFormData`（Zod + submittedAt + honeypot + Turnstile）→ `processFormSubmission` | `GET` 为管理员统计：仅 Bearer token 校验，无 rate limit（见 CR-013） |
| `/api/inquiry` | `POST/OPTIONS` | 产品页询盘（drawer） | `withRateLimit(inquiry)` → `safeParseJson` → Turnstile → `processLead` | `processLead` 入参使用 spread，存在 `type` 被 body 覆盖的风险（见 CR-007） |
| `/api/subscribe` | `POST/OPTIONS` | Newsletter 订阅 | `withRateLimit(subscribe)` → `withIdempotency`（可选）→ `safeParseJson` → Turnstile → `processLead` | 幂等键不强制；且 store 当前为内存实现（跨实例不保证） |
| `/api/verify-turnstile` | `POST/GET/OPTIONS` | Turnstile token 服务端验证（供客户端调用） | 配置检查 → 分布式 rate limit（fail-closed）→ `safeParseJson` → server-derived IP → `verifyTurnstileDetailed` | 对上游网络错误返回 `503`（而不是混同为 `400`） |
| `/api/csp-report` | `POST/GET/OPTIONS` | 接收 CSP violation report | `withRateLimit(csp)` → content-type check → `request.text()` → JSON.parse → Zod 校验 → log | 当前未做 body size 上限（见 CR-009） |
| `/api/cache/invalidate` | `POST/GET` | 触发缓存失效（内部工具） | pre-auth IP rate limit（fail-closed）→ API key → post-auth API-key rate limit（fail-closed）→ JSON.parse → Zod strict | secret 未配置时会走 401（更像“未授权”而非“服务未配置”，见 CR-012） |
| `/api/whatsapp/send` | `POST/GET` | 服务端发送 WhatsApp 消息（内部） | `withRateLimit(whatsapp)` → API key → `safeParseJson` → Zod 校验 → send（含 retry） | rate limit 当前基于 IP（wrapper 默认 keyStrategy），无 post-auth per-api-key 限流（见 CR-014） |
| `/api/whatsapp/webhook` | `POST/GET` | Meta webhook 验证（GET）+ 消息接收（POST） | content-length 上限 → 分布式 rate limit → `request.text()` → signature verify → JSON.parse → handle | `rawBody.length` 为字符长度非字节长度，可能低估实际 payload（见 CR-010） |

### 统一观察点（本轮发现的“链路断点”）
- **CORS：仅预检返回 CORS header，但实际响应未统一 apply**：`applyCorsHeaders` 目前未在任何 API route 使用；一旦有跨域调用需求（允许 origin），浏览器侧会出现“预检通过但响应被拦截/不可读”的现象（见 CR-008）。
- **入参 schema 与业务语义耦合点**：`processLead` 使用 `leadSchema.safeParse`（discriminated union）作为统一入口；如果上游 route 传入对象允许覆盖 `type`，会导致“端点语义被 body 决定”（见 CR-007）。
- **可用性型 DoS 风险**：部分端点对 body size 的防护不一致（例如 webhook 有上限，csp-report 无上限），且若 rate limit store 在 fail-open preset 下进入 degraded，会进一步放大资源消耗面（见 CR-009/CR-010）。

### 下一步建议（承接 Phase 3.2）
- 先定位 Lighthouse `total-byte-weight` 的构成（HTML/JS/CSS/font/image/3rd-party），把“最大贡献者”拉清单，然后再决定是调预算还是做瘦身改造。

## Phase 2：全量扫描结果（2026-03-05）

### `pnpm ci:local`（完整模式）
- 结论：通过（含 Playwright E2E + Lighthouse CI）
- 耗时：约 392s
- E2E：109 tests，106 passed，3 skipped
- Lighthouse CI：
  - `/en`：`total-byte-weight` 预算 490000，实测最小约 533265（warning）
  - `/zh`：`total-byte-weight` 预算 490000，实测约 534789（warning）
  - 备注：warning 不阻断，但说明当前“总传输体积”超预算

#### 更新：Round 2（PR-04/PR-05/PR-06 后）的 Lighthouse 现状（2026-03-05）
- 数据来源：`.lighthouseci/assertion-results.json`
- `/en`：budget 490000，当前最小值约 **627998**（warning）
- `/zh`：budget 490000，当前最小值约 **621587**（warning）
- Top transferSize（从 `.lighthouseci/lhr-1772693730471.json` `/en` 与 `.lighthouseci/lhr-1772693769403.json` `/zh` 的 `network-requests` 汇总）：
  - Document：`/en` ≈146,997 bytes；`/zh` ≈140,527 bytes
  - Script：`/_next/static/chunks/788cb74cdca664a9.js` ≈70,741 bytes
  - Script：`/_next/static/chunks/3dd9e4d6313d8e73.js` ≈64,324 bytes
  - Script：`/_next/static/chunks/16558e32020a1ebb.js` ≈31,490 bytes
  - Font：两个 woff2 合计 ≈52,942 bytes；CSS ≈27,176 bytes
- 初步线索（待 PR-06f 进一步确认 chunk→模块映射）：
  - `3dd9e4d6313d8e73.js` 内包含完整 `zod` 实现（在 chunk 内可直接检索到 `zod` 相关导出），说明 **`zod` 仍被打入 client bundle**。
  - 下一步优先检查 `zod` 是否被 client components（例如表单/配置）间接引用：`src/config/contact-form-config.ts`、`src/lib/form-schema/*`、`src/lib/validations.ts`、`src/lib/env.ts` 等（以 webpack analyzer 结果为准）。

#### 更新：PR-06f 收尾结果（2026-03-06）
- 验证命令：
  - `pnpm build:webpack`
  - `pnpm perf:lighthouse`
- 结果：
  - `.lighthouseci/assertion-results.json` 为空数组（critical URLs 无断言告警）
  - `/en`：`.lighthouseci/lhr-1772758720537.json` ~ `1772758783681.json` 落在 `484,523 ~ 486,344`
  - `/zh`：`.lighthouseci/lhr-1772758796325.json` ~ `1772758821199.json` 落在 `478,053 ~ 479,610`
- 资源摘要（取当前最新一轮结果的量级口径）：
  - `/en`：total 约 `485KB`，script 约 `262KB`，font `20,893`，stylesheet 约 `29KB`
  - `/zh`：total 约 `479KB`，script 约 `262KB`，font `20,893`，stylesheet 约 `29KB`
- 关键定位与修复：
  - 残余超额主要不是大 bundle 回退，而是**首页残余预取 + 第二个 font 请求**
  - 新增 `prefetch={false}` 到首页首屏 CTA/卡片链接后，requestCount 从 `39`/`39` 收敛到 `38`/`38`
  - `JetBrains_Mono` 取消 preload，且 homepage 移除 `font-mono` 后，font request 从 `2` 降到 `1`，font transferSize 从 `52,942` 降到 `20,893`
- 结论：
  - CR-005 已可关闭
  - 当前剩余性能关注点转为“长期优化项”而非门禁阻断：`document` 仍偏大（约 `144KB~149KB`），后续可继续评估 metadata / JSON-LD / RSC payload 精简

### Playwright 本地依赖
- 初次 E2E 失败原因：本地缺少 Playwright browsers（提示需运行 `pnpm exec playwright install`）
- 已执行：`pnpm exec playwright install`（Chromium/Firefox/Webkit 下载到 `~/Library/Caches/ms-playwright/*`）

### knip（未用依赖/文件）
- `pnpm unused:production` 当前失败：
  - Unlisted dependencies：`@react-grab/claude-code/server`（位置 `next.config.ts:9`，dev-only 动态 import）
  - 这会导致“生产未用扫描”无法作为稳定门禁/报告来源

### 架构度量
- `pnpm arch:metrics` 已生成报告：
  - `reports/architecture/metrics-1772673029777.json`
  - `reports/architecture/metrics-1772673029778.md`

### 构建产物体积（快速定位线索）
- `pnpm analyze:size`：
  - `.next/static` ≈ 7.9M
  - Top 5 JS：
    - `.next/static/chunks/3dd9e4d6313d8e73.js` ≈ 269K
    - `.next/static/chunks/788cb74cdca664a9.js` ≈ 218K
    - `.next/static/chunks/a6dad97d9634a72d.js` ≈ 110K
    - `.next/static/chunks/16558e32020a1ebb.js` ≈ 109K
    - `.next/static/chunks/9ab104911b7ac4b6.js` ≈ 54K

### Maintainability：dependency-cruiser warnings（不阻断但应治理）
- `no-orphans`：
  - `src/components/sections/site-footer.tsx`
  - `src/components/products/grid-utils.ts`
  - `src/components/i18n/translations-boundary.tsx`
  -（某次输出还包含 `src/app/[locale]/head.tsx`）
- `no-barrel-export-dependencies`：
  - `src/lib/resend-core.tsx → src/emails/index.ts`
  - `src/lib/contact-form-processing.ts → src/lib/lead-pipeline/index.ts`

### Security/Stability：CSP 与 JSON-LD
- CSP 与安全头部：
- middleware 注入 nonce 与安全头（`src/middleware.ts` 调 `getSecurityHeaders(nonce)`）
  - `next.config.ts` 的 `headers()` 刻意过滤掉 `Content-Security-Policy`，避免与 middleware 重复/冲突
- JSON-LD 使用 `dangerouslySetInnerHTML`：
  - `src/app/[locale]/layout.tsx` 内生成 `application/ld+json`
  - 需确认：数据来源是否始终可信、以及 CSP 策略是否会对 JSON-LD 的 inline script 做阻断（项目注释认为不需要 nonce）

### 环境一致性（CI vs 本地）
- CI workflows 固定 Node 20 + pnpm 10.13.1；本机当前 Node v22。
- 建议形成明确的“审查执行环境”约束（至少在审查阶段对齐 Node 20 复跑一次完整检查）。

## Phase 3.2：性能深审（Lighthouse `total-byte-weight` 定位）

### 结论摘要（先给结论）
- 本轮 `total-byte-weight` 超预算（490KB）的“主要增量”来自 **Next.js App Router 的 RSC 预取（`?_rsc=` Fetch）**：
  - `/en`：`Fetch` 17 次，合计约 **42.3KB**（`lhr-1772672923402.json`）
  - `/zh`：`Fetch` 17 次，合计约 **42.5KB**（`lhr-1772672988118.json`）
  - 两个路由的 `total-byte-weight` 超预算分别为 **+43.3KB / +44.8KB**，量级几乎等同于预取 Fetch 的总和。
- `script` 传输体积依然偏大（两端点一致：约 **364.6KB**），其中可疑点是 **`radix-ui` 统一包**导致共享 chunk 引入大量 Radix 子包（见“Bundle 分析与根因线索”）。

### Lighthouse 证据（最佳 run）
> 来源：`.lighthouseci/lhr-1772672923402.json`（/en best）与 `.lighthouseci/lhr-1772672988118.json`（/zh best）。

#### `/en`（best）
- `total-byte-weight`：533,265（预算 490,000，超出 +43,265）
- `resource-summary.transferSize(bytes)`：
  - `script` 364,558
  - `font` 52,942（2 个 woff2）
  - `stylesheet` 29,051
  - `document` 36,970
  - `fetch + other` 48,245（其中 Fetch ≈ 42,304）

#### `/zh`（best）
- `total-byte-weight`：534,789（预算 490,000，超出 +44,789）
- 结构与 `/en` 基本一致（document 略大：38,344；Fetch ≈ 42,454）

### 关键构成（用于“怎么减”）

#### 1) RSC 预取（`Fetch`）是超预算的主要增量
- Lighthouse 记录到多个 `?_rsc=` 请求（典型为 header/nav 可见的 `Link` 触发 prefetch）：
  - 例如：`/en/contact?_rsc=...`、`/en/products?_rsc=...`、`/en/privacy?_rsc=...` 等
- /en 的 Fetch top（按 transferSize）：
  - `http://localhost:3000/en/contact?_rsc=...` ≈ 3.3KB
  - `http://localhost:3000/en?_rsc=...` ≈ 2.9~3.0KB（多次）
  - 多个路由累计约 42KB

补充（避免误判）：App Router 下 `Link` 默认 `prefetch="auto"`（进入 viewport 才触发）。当前 Lighthouse 观测到 17 次 Fetch，意味着“首屏 viewport 内确实有大量链接”，或 Lighthouse 的滚动/交互导致更多链接进入 viewport；两者需要在落地（CR-015）时用 trace/复现实验确认。

#### 2) JS 体积与启动时间：最大可疑点是 `radix-ui`
- `unused-javascript`（/en best）显示主要浪费集中在两个最大 chunk：
  - `.../static/chunks/3dd9e4d6313d8e73.js`：wasted ≈ 59,499（total ≈ 59,537）
  - `.../static/chunks/788cb74cdca664a9.js`：wasted ≈ 21,277（total ≈ 69,952）
- `bootup-time`（/en best）中，最大 chunk 的脚本执行时间占比明显偏高（见 `.lighthouseci/lhr-1772672923402.json`）。

### Bundle 分析与根因线索（webpack analyzer）
> 说明：为定位“脚本为什么大”，本轮额外执行了 `pnpm build:analyze:webpack`，产物在 `.next/analyze/client.html`。

- 发现：项目直接依赖 `radix-ui`（统一包），并在多个 UI 组件中以 `import { X } from "radix-ui"` 使用。
  - 证据（依赖路径）：`pnpm why @radix-ui/react-one-time-password-field` 显示其由 `radix-ui@1.4.3` 引入（属于“统一包带来的大量子包依赖”）。
  - 证据（源码引用）：`src/components/ui/*.tsx`（例如 `dropdown-menu.tsx`、`sheet.tsx`、`tabs.tsx`、`navigation-menu.tsx`、`accordion.tsx`、`label.tsx`）直接从 `radix-ui` 导入 primitive。
- 在 `.next/analyze/client.html` 中，`app/[locale]/layout` 的初始 chunk 中包含大量 `@radix-ui/react-*` 子包（这通常意味着“树摇不彻底/统一包聚合过重”）。

### 下一步建议（转入问题清单）
- 优先做两件事（能最快把 `total-byte-weight` 拉回预算）：
  1) **控制 prefetch**：对 header/nav 的非关键 `Link` 显式 `prefetch={false}`（或仅保留少量关键路径 prefetch），减少 `?_rsc=` Fetch。
  2) **去掉 `radix-ui` 统一包**：改为按需引入 `@radix-ui/react-*`（shadcn 默认方式），避免把大量 Radix 组件打进共享 chunk。

落地前的一个小检查（避免走弯路）：
- `pnpm why radix-ui`：确认是否存在间接依赖（否则删 direct dep 也可能仍被引入）。

## Phase 3.3：可维护性深审（orphan/barrel/knip 治理）

### dependency-cruiser（`pnpm arch:check`）
- 当前告警（2026-03-05）：
  - `no-orphans`：
    - `src/components/sections/site-footer.tsx`
    - `src/components/products/grid-utils.ts`
    - `src/components/i18n/translations-boundary.tsx`
  - `no-barrel-export-dependencies`：
    - `src/lib/resend-core.tsx → src/emails/index.ts`
    - `src/lib/contact-form-processing.ts → src/lib/lead-pipeline/index.ts`

### orphan 文件的“真实引用”摸底（避免误删）
- `src/components/sections/site-footer.tsx`：目前仅在测试中引用（`src/components/sections/__tests__/site-footer.test.tsx`），生产代码未发现引用。
- `src/components/products/grid-utils.ts`：目前仅在测试中引用（`src/components/products/__tests__/grid-utils.test.ts`），生产代码未发现引用。
- `src/components/i18n/translations-boundary.tsx`：`src/` 内未发现引用（可能是旧方案残留或未来计划组件）。

### `grid-utils` 重复实现点（为什么建议“接回引用”而不是直接删）
- `src/components/products/product-grid.tsx`：本地定义 `getSmColumnClass/getMdColumnClass/getLgColumnClass/getGapClass`
- `src/components/products/product-card-skeleton.tsx`（`ProductGridSkeleton` 部分）：同样本地定义了同名 `get*Class`
- `src/components/products/grid-utils.ts`：已存在这些 util，且文件头注释也表明“计划被 ProductGrid/ProductGridSkeleton 复用”

### `next.config.ts` 动态 import 的现状风险（与 knip 失败同源）
- 当前 `next.config.ts` 在 `NODE_ENV=development` 时无条件执行 `import("@react-grab/claude-code/server")...`：
  - 模块未安装：会导致 knip 报 Unlisted，同时在 `pnpm dev` 场景可能产生 unhandled rejection 噪声（取决于 Node/Next 的处理策略）
  - 模块已安装：会在 Next dev server 启动期间引入副作用（额外 server + 资源占用），且难以在 CI/本地保持一致

### knip（`pnpm unused:production`）
- 当前失败（2026-03-05）：
  - Unlisted dependency：`@react-grab/claude-code/server`（`next.config.ts:9:47`）
- 备注：该引用位于 `next.config.ts` 的 dev-only 动态 import；建议明确其“是否必须存在”的产品/开发意图，并决定：
  - 作为真正 devDependencies + 加 `.catch()`（避免未安装时噪声/崩溃），或
  - 迁移到可选脚本/显式环境变量 gate，避免成为默认路径的一部分。

## Phase 3.4：安全深审（CSP/nonce、Cache Components 隔离、XSS/注入面）

### 3.4.1 CSP/nonce：现状链路与“是否闭环”的快速验证

#### 现状（代码层）
- CSP 生成逻辑：`src/config/security.ts`
  - 生产环境（`NODE_ENV=production`）默认 **不**允许 `script-src 'unsafe-inline'`，仅允许 `nonce`（若提供）。
  - `report-uri` 默认指向 `/api/csp-report`（可被 `CSP_REPORT_URI` 覆盖）。
- CSP 注入方式：`src/middleware.ts`
  - 每次请求生成 `nonce = generateNonce()`，并通过 `getSecurityHeaders(nonce)` 将 `Content-Security-Policy` 写入响应头。
- Next config 侧的 header：`next.config.ts`
  - 明确 **移除 CSP**（仅保留其它安全头部），意图让 CSP 统一由 middleware 注入，避免重复/冲突。

#### 现状（运行时证据：strict CSP + middleware）
> 目的：验证“CSP header 与 HTML 内脚本 nonce 是否一致”，以及是否存在“无 nonce 的 inline script”会被 strict CSP 阻断。

- 构建：`pnpm build`（输出含 `ƒ Proxy (Middleware)`）
- 启动（显式 strict）：`PORT=3200 SECURITY_HEADERS_ENABLED=true NEXT_PUBLIC_SECURITY_MODE=strict pnpm start`
- 响应头（/en）：可观察到 `content-security-policy`，且包含 `nonce-<32 hex>`，同时 middleware 会写入 `NEXT_LOCALE` cookie：
  - `content-security-policy: ... script-src 'self' 'nonce-<...>' ... report-uri /api/csp-report ...`
  - `set-cookie: NEXT_LOCALE=en; ... HttpOnly; SameSite=lax`

#### 关键发现：HTML 中存在“未带 nonce 的 inline script”
在同一次响应中（同一个 CSP nonce），HTML 内脚本呈现出三类：
- ✅ Next 内部部分脚本会自动带上与 CSP 一致的 `nonce="<...>"`（说明 Next 能消费 CSP nonce 并透传给自身脚本）
- ⚠️ 但仍存在 **未带 nonce** 的 inline script（在 strict CSP 下会被浏览器阻断，并产生 CSP violation）：
  - Next 输出的性能时间戳脚本（示例）：`<script>requestAnimationFrame(function(){$RT=performance.now()});</script>`
  - `next-themes` 初始化主题脚本（示例：`<script>((a,b,c,d,e,f,g,h)=>{...})("class","theme","system",...)</script>`）
  - 两段 JSON-LD（`<script type="application/ld+json">...</script>`）当前也 **未带 nonce**（代码见 `src/app/[locale]/layout.tsx`）

> 结论：如果线上要启用 **enforced strict CSP（非 report-only）**，当前实现很可能出现：
> 1) 主题初始化脚本被阻断（可能引发 FOUC/水合警告/暗黑模式闪烁）；2) CSP report 噪声；3) JSON-LD 是否触发 violation 取决于浏览器实现（建议仍按“需要 nonce”收敛以避免不确定性）。

### 3.4.2 Cache Components：缓存隔离风险点清单（本轮摸底）
- 项目启用 `cacheComponents: true`（见 `next.config.ts`）。
- 当前 `use cache`/`unstable_cache` 主要用于“内容/翻译”加载（低风险）：
  - `src/lib/content/*`（blog/products）：以 `locale/slug` 显式入参 + `cacheTag` 绑定 tag。
  - `src/lib/contact/getContactCopy.ts`：明确注释约束“不允许调用 headers()/cookies() 等 request-scoped API”，以避免跨用户缓存污染。
  - `src/lib/load-messages.ts`：`unstable_cache` 缓存翻译 JSON（key/tag 均包含 `locale/type`），且内部 `fetch` 使用 `cache: "no-store"` 避免双层缓存。
- 本轮未发现“把用户态数据（cookie/session/userId）放进 `use cache` 数据函数”的直接证据；但 **CSP nonce 传递** 与 **Cache Components 静态化** 之间存在显著张力（见 3.4.1）。

#### 额外证据：request-scoped API 使用点极少
- 全仓在生产代码中导入 `next/headers` 的位置（用于 request-scoped API）目前仅见：
  - `src/lib/actions/contact.ts`（Server Action 读取 `headers()` 以做 IP 侧的 rate limit / Turnstile 验证）
- `use cache` 覆盖的模块（blog/products/contact copy）均在文件头注释中显式声明“不使用 headers/cookies”，且其底层数据源为本地文件系统（`fs/promises`）或受控的本地 JSON（messages），因此跨用户缓存污染风险偏低。

### 3.4.3 XSS/注入面：`dangerouslySetInnerHTML` 盘点
- 全仓 `dangerouslySetInnerHTML` 主要集中在 JSON-LD（生产代码）：
  - `src/app/[locale]/layout.tsx`：两段 JSON-LD 直接写入
  - `src/components/seo/json-ld-script.tsx`：封装后的 JSON-LD Script（内部使用 `generateJSONLD()`，并在注释中强调用 `<` → `\\u003c` 防止 `</script>` 注入）
- `generateJSONLD()` 的实现（`src/lib/structured-data.ts`）会将 `<` 统一替换为 `\\u003c`，对抗 `</script>` 截断注入风险（符合 Next.js 官方建议）。
- 风险仍主要来自 **未来数据源变更**（例如结构化数据引入可被用户影响的字段），建议用“集中封装 + 类型约束 + 回归测试”锁住数据来源与输出策略。

#### 其它注入/浏览器侧安全点（本轮快速盘点）
- `target="_blank"` 链接：大多数组件已正确设置 `rel="noopener noreferrer"`（或同义组合）。
  - 发现 1 处不一致：`src/components/products/product-actions.tsx` 中 PDF 下载链接使用 `rel="noreferrer"`（缺少 `noopener`），存在 tabnabbing 风险面（已转为问题条目，见 issues）。

#### SSRF/外部请求面：对“动态 URL fetch”保持警惕
- 本轮对 server-side `fetch(...)` 做了快速抽样（`src/lib/**`、`src/app/api/**`）：
  - Turnstile 校验、rate limit store、WhatsApp Graph API 调用均使用固定 baseUrl（低风险）。
  - `src/lib/whatsapp-media.ts` 的 `downloadMedia()` 会对 `getMediaUrl()` 返回的 `data.url` 做二次 `fetch(mediaUrl)`（该 URL 为第三方返回值，而非代码内固定常量）。
- 目前仓库内暂未发现生产链路调用 `downloadMedia()`，但这是一个典型“未来接入媒体下载时容易引入 SSRF”的点，建议在实现前先加 URL allowlist 校验（见 issues）。
