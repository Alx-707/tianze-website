# 全面代码审查问题清单（tianze-website）

> 说明：本文件用于持续跟踪“可执行问题清单”（不创建外部 Issue）。证据与背景请参见 `docs/code-review/notes.md`。
>
> 优先级：按「稳定性 > 性能 > 可维护性 > 安全」排序；每条包含验收命令，确保可回归验证。

## 状态
- 基线：`pnpm ci:local:quick` 已通过（2026-03-05，PR-06 后复测通过）。
- ✅ 已补齐：`pnpm ci:local`（完整模式：E2E + Lighthouse）（2026-03-06，PR-06f 收尾后复测通过；Lighthouse `total-byte-weight` 已回到 490KB budget 内，见 CR-005）。
- ✅ `pnpm unused:production`（knip）已恢复为可靠信号（2026-03-05，CR-003 已修复）。
- ✅ Phase 3.1：`src/app/api/**` 写接口深审已完成（2026-03-05），新增条目 CR-007~CR-014。
- ✅ Phase 3.2：性能深审（Lighthouse `total-byte-weight`）完成定位与拆解（2026-03-05），新增条目 CR-015/CR-016。
- ✅ Phase 3.3：可维护性深审（orphan/barrel/knip）已完成“落地方案”（2026-03-05），新增条目 CR-001~CR-003。
- ✅ Phase 3.4：安全深审（CSP/nonce、Cache Components、XSS/注入）已完成第一轮（2026-03-05），新增条目 CR-017~CR-021。
- ✅ Round 2：PR-01 ~ PR-06f 已完成（2026-03-06）；当前仅剩 CR-022（`middleware → proxy` 迁移）作为独立技术债。

## 建议落地顺序（优先处理 P1）
- P1：CR-007（接口语义可被改写 / 可被外部利用）、CR-009（公开端点 body 无上限 → 资源耗尽面）、CR-015（prefetch/RSC 预取字节）、CR-016（`radix-ui` 统一包过重）、CR-017（strict CSP 闭环策略）
- P1（可维护性门禁恢复）：CR-001/CR-002/CR-003（让 `arch:check`/knip 成为可靠信号）
- P2/P3：其余条目按业务风险与改动成本排期

## 问题清单（可执行）

### Stability（工程可复现性 / 本地 CI 一致性）

#### CR-007 `/api/inquiry` 允许请求体覆盖 `type`（端点语义可被 body 改写）
- 优先级：P1
- 标签：PROD
- 证据：`src/app/api/inquiry/route.ts` 内构造入参为 `processLead({ type: LEAD_TYPES.PRODUCT, ...leadData })`，其中 `leadData` 来源于用户请求体（除 `turnstileToken` 外几乎未筛选）。
- 影响：
  - 端点语义不再由路由决定，而可能由用户 body 决定（例如 `type: "newsletter"`），造成行为与日志/指标口径不一致。
  - 可绕过不同端点的限流档位与幂等策略（`/api/subscribe` 为 `subscribe` preset + 幂等包装；`/api/inquiry` 为 `inquiry` preset 且无幂等）。
- 建议修复（推荐组合）：
  - **主体防御：显式白名单 pick**（只提取允许字段构造 `ProductLeadInput`，例如 `fullName/productSlug/productName/quantity/requirements/email/company/marketingConsent`）。
  - **兜底：后置覆盖 `type`**：`processLead({ ...pickedLeadData, type: LEAD_TYPES.PRODUCT })`，避免未来重构时因 spread 顺序变化导致回归（单靠 spread 顺序过于脆弱）。
  - 为该回归场景补单测：当 body 带 `type` 时仍按 `product` 处理（或直接 400 拒绝）。
- 验收命令：`pnpm test -- src/app/api/inquiry/__tests__/route.test.ts`
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：route 层仅白名单字段入参 + `type` 后置覆盖兜底
  - 代码变更：`src/app/api/inquiry/route.ts`、`src/app/api/inquiry/__tests__/route.test.ts`、`src/app/api/inquiry/__tests__/inquiry-integration.test.ts`
  - 验收：`pnpm ci:local:quick`

#### CR-009 `/api/csp-report` 未限制请求体大小，`request.text()` 可能被滥用造成资源消耗
- 优先级：P1
- 标签：PROD
- 证据：`src/app/api/csp-report/route.ts` 直接 `await request.text()` 读取 body；无 `Content-Length` 上限或字节级阈值控制。
- 影响：在恶意请求或异常客户端情况下，可能造成单请求占用过大内存/CPU（尤其当 rate limit store 处于 fail-open/degraded 时风险放大），影响稳定性。
- 建议修复：
  - 参考 `src/app/api/whatsapp/webhook/route.ts`，增加 body size 上限（例如 16KB~64KB）：
    - 优先检查 `content-length` 并在超过阈值时直接拒绝；
    - 读取后用 `Buffer.byteLength(body, "utf8")`（或 `TextEncoder`）做字节级兜底校验。
  - 明确可接受的 `content-type`（必要时兼容 `application/json`，以覆盖不同浏览器/Report-To 行为）。
- 验收命令：`pnpm test -- src/app/api/csp-report/__tests__/route-post-security.test.ts`
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：增加 16KB 请求体上限（`content-length` 早拒绝 + stream 读取字节级兜底），并兼容 `application/json`
  - 代码变更：`src/app/api/csp-report/route.ts` + 对应测试更新
  - 验收：`pnpm ci:local:quick`

#### CR-004 `pnpm ci:local` 在本地缺少 Playwright browsers 时会失败
- 优先级：P2
- 标签：DEV/CI
- 证据：`pnpm test:e2e` 报错提示 Executable 不存在，要求运行 `pnpm exec playwright install`
- 影响：新环境/新同事/CI 镜像切换时，本地 CI 无法“一键跑通”，降低稳定性与可复现性。
- 建议修复（任选其一或组合）：
  - 在 `DEVELOPMENT.md`/README 的本地检查章节增加明确前置步骤
  - 在 `scripts/ci-local.sh` 的 E2E 步骤前做浏览器存在性检测，缺失时给出可操作提示（或自动执行安装，需权衡耗时/网络依赖）
- 验收命令：`pnpm ci:local`（在全新环境下验证）
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：
    - `scripts/ci-local.sh` 在执行 `pnpm test:e2e` 前检测 Playwright browsers（chromium）是否存在，缺失时给出可执行修复命令
    - `DEVELOPMENT.md` 补充 “Playwright browsers 安装” 说明
  - 验收：`pnpm ci:local`（在未安装 browsers 的新环境下应给出明确提示；安装后应可继续跑通）

#### CR-022 Next.js 对 `middleware` 的约定存在迁移告警（未来升级风险）
- 优先级：P3
- 标签：TECHDEBT/UPGRADE
- 证据：在 Round 2 的 `pnpm build` 过程中出现 Next.js 迁移告警：`middleware` 约定未来可能被废弃，建议迁移到 `proxy`（具体文案见构建输出）。
- 影响：
  - 短期不影响当前功能，但会在未来升级 Next.js 时变成“硬阻断”风险（或迁移窗口变窄）。
  - 若被动在升级期集中处理，会与其它变更耦合，增加回归风险。
- 建议修复/排期：
  - 将其作为“升级前置任务”排入技术债清单（建议与下一次 Next.js 升级绑在同一个波次）。
  - 收敛 middleware 的职责边界：尽量只做安全头部与 i18n redirect 等轻逻辑；复杂逻辑优先下沉到 route handlers / edge proxy 层。
- 验收命令：
  - `pnpm build`（观察告警是否仍存在；若 Next 仍保留告警，则至少在文档中记录迁移路线与触发条件）
- 状态：🟡 已记录（2026-03-05）

#### CR-008 API routes 仅在 `OPTIONS` 返回 CORS header，实际响应未统一 `applyCorsHeaders`
- 优先级：P2（若存在跨域调用需求则应视为 P1）
- 标签：PROD
- 证据：
  - `src/lib/api/cors-utils.ts` 提供 `applyCorsHeaders()`，但目前未在任何 `src/app/api/**` 路由中使用（仅测试覆盖）。
  - 多个路由实现了 `OPTIONS`（预检）但 `POST/GET` 的响应没有按 allowlist 回写 `Access-Control-Allow-Origin` 等 header。
- 影响：当出现“允许 origin 的跨域调用”时，浏览器侧会出现“预检通过但实际响应被 CORS 拦截/不可读”，导致线上偶发不可用（尤其是表单被嵌入第三方域名或多域部署时）。
- 建议修复：
  - 对需要支持跨域的 API：在 `POST/GET` 返回前统一调用 `applyCorsHeaders({ request, response })`。
  - 或者将 CORS 逻辑上提到更统一的层（例如封装 `createApiSuccessResponse/createApiErrorResponse` 的 CORS 版本），避免 route 漏用。
- 验收命令：
  - `pnpm dev`
  - 用带 `Origin` 的请求检查响应头（需配置到 allowlist）：`curl -sD- -o /dev/null -H 'Origin: https://<allowed-origin>' -H 'Content-Type: application/json' -X POST http://localhost:3000/api/subscribe --data '{\"email\":\"a@b.com\",\"turnstileToken\":\"x\"}' | rg -i 'access-control-allow-origin'`
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：对实现了 `OPTIONS` 的表单/验证类路由，在实际 `POST/GET` 响应统一补齐 CORS allowlist headers（通过“先 `withRateLimit` 再 `applyCorsHeaders`”的包裹方式，确保 429/503 等提前返回也包含 CORS headers）
  - 覆盖范围：`/api/inquiry`、`/api/contact`（POST/GET）、`/api/subscribe`、`/api/verify-turnstile`（POST/OPTIONS）
  - 代码变更：`src/app/api/inquiry/route.ts`、`src/app/api/inquiry/__tests__/route.test.ts`、`src/app/api/contact/route.ts`、`src/app/api/subscribe/route.ts`、`src/app/api/verify-turnstile/route.ts`
  - 验收：`pnpm ci:local:quick`

#### CR-010 `/api/whatsapp/webhook` 的 body size 校验使用 `rawBody.length`（字符长度），可能低估实际字节数
- 优先级：P2
- 标签：PROD
- 证据：`src/app/api/whatsapp/webhook/route.ts` 在读取后用 `if (rawBody.length > MAX_BODY_BYTES)` 判断；`length` 为字符/码元计数，不等于 UTF-8 字节数。
- 影响：包含多字节字符的 payload 可能绕过“1MB 上限”的保护，增加资源消耗面（可用性型安全风险）。
- 建议修复：
  - 改为字节级长度判断（Node runtime 可用 `Buffer.byteLength(rawBody, \"utf8\")`；或用 `TextEncoder().encode(rawBody).length` 以避免 runtime 差异）。
  - 为多字节场景补测试用例（例如大量 emoji/中文字符）。
- 验收命令：`pnpm test -- src/app/api/whatsapp/webhook/__tests__/route.test.ts`
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：读取 body 后改为 UTF-8 字节级判断（避免多字节字符绕过上限），并补回归用例覆盖“字符长度未超限但字节超限”的场景
  - 代码变更：`src/app/api/whatsapp/webhook/route.ts`、`src/app/api/whatsapp/webhook/__tests__/route.test.ts`
  - 验收：`pnpm ci:local:quick`

#### CR-011 `/api/subscribe` 的幂等保护在生产环境可能“名义存在但效果有限”
- 优先级：P2
- 标签：PROD
- 证据（修复前）：
  - `src/app/api/subscribe/route.ts` 使用 `withIdempotency`，但未强制 `Idempotency-Key`（`required` 默认为 false）。
  - `src/lib/idempotency.ts` 未通过 `createIdempotencyStore()` 工厂初始化 store，且未对 key 做 method/path 语义绑定。
- 影响：
  - 用户重复点击/网络重试可能导致重复订阅/重复线索（尤其 serverless 多实例或冷启动场景）。
  - 订阅类端点通常是“高频写入 + 低价值重复”，缺少强幂等会放大下游（邮件/CRM/表）成本。
- 建议修复（按侵入性从低到高）：
  - 要求客户端必须传 `Idempotency-Key`（后端 `required: true`），并在前端统一生成。
  - 将 idempotency store 抽象为可配置的分布式后端（KV/Redis/D1），并在 `idempotency.ts` 使用 `createIdempotencyStore()`。
  - 兜底：服务端增加“email + 时间窗”级别去重（避免极端情况下重复写入）。
- 验收命令：`pnpm test -- src/lib/__tests__/idempotency.test.ts`
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：
    - 服务端：`/api/subscribe` 强制 `Idempotency-Key`（`withIdempotency(..., { required: true })`）
    - 客户端：订阅表单提交补齐并复用 `Idempotency-Key`（同一次提交的重试/重复点击复用；成功后清空）
    - 幂等实现：`withIdempotency` 增加 TOCTOU 保护 + key 语义绑定（method/path）+ `createIdempotencyStore()` 工厂化（便于后续替换分布式 store）
  - 验收：
    - `pnpm test -- tests/integration/api/subscribe.test.ts`
    - `pnpm test -- src/components/blog/__tests__/blog-newsletter.test.tsx`
    - `pnpm test -- src/lib/__tests__/idempotency.test.ts`

#### CR-012 `/api/cache/invalidate` 在 secret 未配置时仍返回 401（易掩盖“服务未配置”问题）
- 优先级：P2
- 标签：PROD
- 证据：
  - `src/app/api/cache/invalidate/route.ts` 的 `validateApiKey()` 在 `CACHE_INVALIDATION_SECRET` 缺失时仅 `logger.error` 然后 `return false`。
  - 路由收到 `false` 后统一返回 `401`（`API_ERROR_CODES.UNAUTHORIZED`）。
- 影响：生产环境若漏配 secret，会表现为“未授权（401）”而不是“服务未配置/配置错误（5xx）”，容易导致排障绕远路；同时也会让监控/告警难以区分真实攻击与配置缺陷。
- 建议修复：
  - 将 `validateApiKey()` 改为返回“区分未配置 vs 未授权”的结果（例如：未配置 → `503/500`，未授权 → `401`），并在响应体 errorCode 上体现配置问题。
  - 参考 `src/app/api/whatsapp/send/route.ts` 的处理方式：API key 缺失会返回 `503`。
- 验收命令：`pnpm test -- src/app/api/cache/invalidate/__tests__/route.test.ts`
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：将鉴权从 boolean 改为结构化结果（区分“secret 未配置（503）”与“未授权（401）”），并补单测覆盖
  - 代码变更：`src/app/api/cache/invalidate/route.ts`、`src/app/api/cache/invalidate/__tests__/route.test.ts`
  - 验收：`pnpm ci:local:quick`

#### CR-013 `/api/contact` 管理统计接口（GET）缺少 rate limit（存在暴力枚举/打点噪声风险）
- 优先级：P2
- 标签：PROD
- 证据：`src/app/api/contact/route.ts` 的 `GET` 仅做 `validateAdminAccess()` 校验，无 `withRateLimit` 或其它限流/节流措施。
- 影响：
  - 该接口天然适合作为“token 猜测/暴力枚举”的打点目标；即使 token 足够强，也可能造成日志噪声、Airtable/后端统计查询压力。
  - 与项目其它安全敏感端点（如 `/api/verify-turnstile`、`/api/cache/invalidate`）的“先限流再鉴权”策略不一致，容易在未来重构时漏掉防护。
- 建议修复：
  - 为该 GET 增加 IP-based 限流（可复用 `withRateLimit` 增加一个 `adminStats` preset，建议 fail-closed 或至少 fail-open+告警）。
  - 或将管理接口迁移到更明确的私有路径/网络边界（例如仅内网/VPN 访问），减少暴露面。
- 验收命令：`pnpm test -- src/app/api/contact/__tests__/route.test.ts`
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：为 `/api/contact` GET 增加 pre-auth IP-based rate limit（新增 preset `contactAdminStats`），并补单测覆盖“超限时不进入鉴权/业务逻辑”
  - 代码变更：`src/lib/security/distributed-rate-limit.ts`、`src/app/api/contact/route.ts`、`src/app/api/contact/__tests__/route.test.ts`
  - 验收：`pnpm ci:local:quick`

#### CR-014 `/api/whatsapp/send` 的 rate limit 目前基于 IP（默认 keyStrategy），建议增加 post-auth 的 per-API-key 限流
- 优先级：P2
- 标签：PROD
- 证据：`src/app/api/whatsapp/send/route.ts` 使用 `withRateLimit(\"whatsapp\", handlePost)`（默认 keyStrategy 为 `getIPKey`）；鉴权在 handler 内执行。
- 影响：
  - 若真实调用方在 NAT 后（或多服务共用出口），IP-based 限流会导致误伤；反之攻击者可通过多出口 IP 分摊请求。
  - 与 `/api/cache/invalidate` 已采用的“pre-auth（IP）+ post-auth（API key）”双层策略不一致。
- 建议修复：
  - 参考 `/api/cache/invalidate`：增加 pre-auth IP 限流（粗粒度）+ post-auth per-api-key 限流（细粒度），并确保 post-auth keyStrategy 使用 `getApiKeyPriorityKey`。
  - 或者将 `withRateLimit` 的 keyStrategy 参数传入 `getApiKeyPriorityKey`（前提：确保限流发生在鉴权之后；否则会被随机 Bearer 绕过）。
- 验收命令：`pnpm test -- src/app/api/whatsapp/send/__tests__/route.test.ts`
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：保留 pre-auth IP 限流（`withRateLimit("whatsapp", ...)`），并在鉴权通过后追加 post-auth per-API-key 限流（`getApiKeyPriorityKey`），补单测覆盖
  - 代码变更：`src/app/api/whatsapp/send/route.ts`、`src/app/api/whatsapp/send/__tests__/route.test.ts`
  - 验收：`pnpm ci:local:quick`

### Performance

#### CR-005 Lighthouse CI `total-byte-weight` 超过预算（490KB）
- 优先级：P1
- 标签：PROD/CI
- 证据：
  - `/en`：found ≈ 533KB（warning）
  - `/zh`：found ≈ 535KB（warning）
  - 最新 `pnpm ci:local`（2026-03-05）：`/en` ≈ 628KB、`/zh` ≈ 622KB（仍为 warning；详见 `.lighthouseci/lhr-17726937*.json`）
  - 最新 `.lighthouseci`（2026-03-06，PR-06f 收尾后）：`/en` 为 `484,523 ~ 486,344` bytes（见 `.lighthouseci/lhr-1772758720537.json` ~ `.lighthouseci/lhr-1772758783681.json`），`/zh` 为 `478,053 ~ 479,610` bytes（见 `.lighthouseci/lhr-1772758796325.json` ~ `.lighthouseci/lhr-1772758821199.json`）；`.lighthouseci/assertion-results.json` 为空数组
  - 参考：`pnpm analyze:size` 显示 `.next/static` ≈ 7.9M（仅作初步线索，需结合 Lighthouse 具体网络 waterfall 定位）
- 影响：总传输体积超预算通常会拉低弱网/冷启动下的 LCP/FCP；虽然当前门禁为 warning，但这会持续侵蚀性能余量。
- 建议修复（已在 Phase 3.2 拆分为更可执行的子问题）：
  - CR-015：`Link` prefetch 触发 RSC 预取（`?_rsc=` Fetch）推高总字节
  - CR-016：`radix-ui` 统一包引入大量 Radix 子包，推高共享 chunk
- 验收命令：`pnpm perf:lighthouse`（确认 `total-byte-weight` 回到 ≤490KB 或调档有依据）
- 状态：✅ 已修复（2026-03-06，本地未提交/未开 PR）
  - 修复点（PR-06f）：
    - 继续关闭首页首屏 CTA/卡片中的非关键 `Link` 预取，消除残余 `?_rsc=` 请求
    - `JetBrains_Mono` 改为 `preload: false`
    - 首页首屏与主链路移除 `font-mono` 依赖，避免 homepage 为 monospace 额外下载第二个 font 文件
  - 回归结果（当前工作树里的最新 `.lighthouseci`）：
    - `/en`：`484,523 ~ 486,344` bytes（≤ `490,000`）
    - `/zh`：`478,053 ~ 479,610` bytes（≤ `490,000`）
    - `assertion-results.json` 为空数组，表示当前 critical URLs 已无 Lighthouse 断言告警
  - 结构变化（资源摘要）：
    - `font`：2 requests → 1 request，`52,942` → `20,893` bytes
    - `total-byte-weight`：`/en` 约 `628KB` → `485KB` 左右，`/zh` 约 `622KB` → `479KB` 左右
  - 代码变更：
    - `src/app/[locale]/layout-fonts.ts`
    - `src/components/layout/header.tsx`
    - `src/components/sections/hero-section.tsx`
    - `src/components/sections/sample-cta.tsx`
    - `src/components/sections/final-cta.tsx`
    - `src/components/sections/products-section.tsx`
    - `src/components/blocks/cta/cta-banner-block.tsx`
    - `src/components/sections/chain-section.tsx`

#### CR-015 首屏 `Link` prefetch 触发多路由 RSC 预取（`?_rsc=` Fetch），直接推高 `total-byte-weight`
- 优先级：P1
- 标签：PROD
- 证据：
  - `.lighthouseci/lhr-1772672923402.json`（/en best）：`Fetch` 17 次，合计约 **42,304 bytes**
  - `.lighthouseci/lhr-1772672988118.json`（/zh best）：`Fetch` 17 次，合计约 **42,454 bytes**
  - 这些 Fetch 请求集中在 `/<locale>/...?_rsc=...`（例如 `/en/contact`、`/en/products`、`/en/privacy` 等），与 header/nav 可见链接的默认预取行为高度一致。
  - 代码侧线索：导航与页脚大量使用 `Link`（来自 `src/i18n/routing.ts`，本质为 Next.js Link 的封装），默认会触发 prefetch：
    - `src/components/layout/vercel-navigation.tsx`（桌面主导航）
    - `src/components/layout/vercel-dropdown-content.tsx`（dropdown 内链接）
    - `src/components/footer/Footer.tsx`（页脚内链）
- 影响：
  - 首屏冷启动额外发起多路由请求，增加带宽与连接开销；在弱网/高 RTT 下会拉长“可交互前”的真实等待感。
  - 在当前 490KB budget 下，Fetch 预取本身就接近“超预算量级”，导致门禁持续告警。
- 建议修复（按“收益/成本”排序）：
  - 备注（避免误判）：App Router 下 `Link` 默认 `prefetch="auto"`（仅在进入 viewport 后触发）。当前 Lighthouse 观测到 17 次 Fetch，意味着“首屏 viewport 内确实有大量可见链接”，或 Lighthouse 的滚动/交互导致更多链接进入 viewport；两者需要用 trace/复现实验确认。
  - 在 header/nav 的非关键 `Link` 上显式 `prefetch={false}`；仅对 1~2 个“最常走”的路径保留 prefetch。
  - 核对“本不该可见但仍被 prefetch”的链接来源（用于减少无效 disable）：
    - Footer 链接理论上应在首屏 viewport 外：若仍被 prefetch，优先确认 Lighthouse 是否发生了滚动。
    - Dropdown 内链接应在展开后才可见：若未展开也被 prefetch，可能是 DOM/样式导致“隐藏元素仍占位/仍在 viewport”。
  - 对列表/栅格页等高开销路由，默认关闭 prefetch，改为在用户意图更明确时再加载（例如 hover/点击后再请求）。
  - 若确实需要保留 prefetch（产品策略要求），应基于证据调整 Lighthouse budget（并在 `lighthouserc.js` 写清原因），避免“靠运气过门禁”。
- 验收命令：
  - `pnpm perf:lighthouse`
  - 对比 `.lighthouseci/lhr-*.json` 中 `network-requests` 的 `Fetch` 请求数量与总 transferSize（期望显著下降）
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 改动点：对 header/nav/dropdown/footer/cookie banner 等“首屏可见但非关键”的 `Link` 显式 `prefetch={false}`，仅保留少量高意图路径
  - 回归结果（Lighthouse /en 与 /zh）：
    - Fetch：17 → 10（`?_rsc=` 预取显著下降）
    - Fetch transferSize：≈42KB → ≈25KB（从 `.lighthouseci/lhr-*.json` 的 `network-requests` 汇总）
    - PR-06f 追加：首页 Hero / Products / Sample / Final CTA 等首屏 CTA 链接进一步显式 `prefetch={false}`，最终配合字体优化使 CR-005 达标关闭
  - 代码变更：`src/components/layout/vercel-navigation.tsx`、`src/components/layout/vercel-dropdown-content.tsx`、`src/components/layout/mobile-navigation.tsx`、`src/components/footer/Footer.tsx`、`src/components/layout/logo.tsx`、`src/components/cookie/cookie-banner.tsx`
  - 验收：`pnpm build` + `pnpm perf:lighthouse`

#### CR-016 使用 `radix-ui` 统一包导致共享 chunk 引入大量 Radix 子包，推高首屏 JS 体积与启动成本
- 优先级：P1
- 标签：PROD
- 证据：
  - 迁移前（Round 1 / Phase 3.2）：多个 UI 组件直接从 `radix-ui` 统一包导入（例如 `src/components/ui/dropdown-menu.tsx`、`src/components/ui/sheet.tsx`、`src/components/ui/tabs.tsx`、`src/components/ui/navigation-menu.tsx`、`src/components/ui/accordion.tsx`、`src/components/ui/label.tsx`），引入大量 Radix 子包进入共享 chunk。
  - 迁移后（Round 2 / PR-04）：`pnpm why radix-ui --json` 仅返回项目根（表示依赖树中不再存在 `radix-ui` 统一包）。
  - bundle analyzer：执行 `pnpm build:analyze:webpack` 后，`.next/analyze/client.html` 可见首屏会加载的 Radix 相关代码来自按需包（`@radix-ui/react-*`），且通过 overrides 避免同一 primitive 的多版本重复进入 bundle（见下方“状态/修复点”）。
- 影响：
  - 首屏 JS 传输体积与解析/执行成本上升（与 `unused-javascript`、`bootup-time` 告警倾向一致）。
  - 引入不必要的依赖面（维护成本 + 攻击面 + 供应链风险），且很难在不破坏功能的情况下渐进剔除。
- 建议修复：
  - 从依赖层面移除 `radix-ui`（统一包），改为按需引入 `@radix-ui/react-*`（与 shadcn 默认模式一致）。
  - 将 `import { X } from "radix-ui"` 改为 `import * as X from "@radix-ui/react-xxx"`（只引入实际使用的 primitive）。
  - 先从 layout/导航链路开始（最影响首屏），逐步迁移并用 bundle analyzer 量化收益。
  - 迁移前先确认是否存在间接依赖：`pnpm why radix-ui`（避免“删了 direct dep 但仍被别的包引入”而无效）。
- 验收命令：
  - `pnpm build:analyze:webpack`（对比 `.next/analyze/client.html` 中 `app/[locale]/layout` 初始 chunk 的 gzipSize 与子包构成）
  - `pnpm perf:lighthouse`（关注 `script` transfer 与 `unused-javascript`/`bootup-time` 是否下降）
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：
    - 移除 `radix-ui` 统一包，改为按需依赖 `@radix-ui/react-*`
    - 迁移 UI 组件 imports（从 `radix-ui` → `@radix-ui/react-*`）
    - 通过 `pnpm.overrides` 固定 `@radix-ui/react-primitive@2.1.4` 与 `@radix-ui/react-slot@1.2.4`，避免多版本 primitive/slot 同时进入 bundle（减少重复代码与解析成本）
  - 回归结果（PR-04 当时的 Lighthouse /en 与 /zh，见 `.lighthouseci/lhr-*.json` 与 `.lighthouseci/links.json`）：
    - `total-byte-weight`：PR-04 当时单独观察仍高于 490KB budget（warning）（/en ≈628KB、/zh ≈622KB）
    - Fetch：保持 10（沿用 CR-015 的 prefetch 降噪成果）
    - Fetch transferSize：≈28KB（`network-requests` 中 Fetch 汇总；以最新 `.lighthouseci/lhr-17726937*.json` 为准）
    - 备注：CR-016 的收益已保留，但预算闭环最终由 PR-06f 完成（见 CR-005）
  - 代码变更：
    - `package.json`、`pnpm-lock.yaml`
    - `src/components/ui/accordion.tsx`、`src/components/ui/dropdown-menu.tsx`、`src/components/ui/sheet.tsx`、`src/components/ui/navigation-menu.tsx`、`src/components/ui/tabs.tsx`、`src/components/ui/label.tsx`、`src/components/ui/button.tsx`
    - 以及对应测试 mock：`src/components/ui/__tests__/button.test.tsx`、`src/components/ui/__tests__/label.test.tsx`
  - 验收：`pnpm build:analyze:webpack` + `pnpm perf:lighthouse` + `pnpm test`

### Maintainability

#### CR-001 清理/解释 dependency-cruiser 的 `no-orphans` 告警
- 优先级：P1
- 标签：DEV/PROD
- 证据：
  - `src/components/sections/site-footer.tsx`
  - `src/components/products/grid-utils.ts`
  - `src/components/i18n/translations-boundary.tsx`
- 补充证据（更接近“真实孤儿”判定）：
  - `src/components/sections/site-footer.tsx` 目前仅在测试中被引用：`src/components/sections/__tests__/site-footer.test.tsx`
  - `src/components/products/grid-utils.ts` 目前仅在测试中被引用：`src/components/products/__tests__/grid-utils.test.ts`
  - `src/components/i18n/translations-boundary.tsx` 在 `src/` 内未发现引用（`rg translations-boundary src` 无结果）
- 影响：死代码/重复实现增加维护成本；也可能掩盖真实“入口遗漏”或错误的依赖方向。
- 建议修复：对每个文件做二选一：接回真实引用（并补测试）或删除/迁移（如为旧实现残留）。
- 推荐处置（基于当前代码形态的初步判断）：
  - `src/components/sections/site-footer.tsx`：疑似旧页脚实现（当前实际使用的是 `src/components/footer/Footer.tsx`，见 `src/app/[locale]/layout.tsx`），倾向直接删除并移除对应测试。
  - `src/components/products/grid-utils.ts`：当前产品 grid 与 skeleton 内存在同名重复函数实现，倾向“接回引用”（让 `product-grid.tsx` / `product-card-skeleton.tsx` 复用该 util），或反过来删除 util 并保留局部实现（二选一，避免双份维护）。
  - `src/components/i18n/translations-boundary.tsx`：当前 layout 已提供 `NextIntlClientProvider`（见 `src/app/[locale]/layout.tsx`），倾向删除该残留组件以减少未来误用。
- 落地方案（不执行代码修改；可直接照此开 PR）：
  - Step 0（安全检查）：确认它们不在生产链路被引用
    - `pnpm arch:check`（记录当前 warnings）
    - `rg -n "SiteFooter|TranslationsBoundary|grid-utils" src`
  - 方案 A（推荐：最小化维护成本 + 让 dependency-cruiser 信噪比恢复）
    - A1 删除旧页脚：
      - 删除 `src/components/sections/site-footer.tsx`
      - 删除 `src/components/sections/__tests__/site-footer.test.tsx`（该测试仅验证旧实现；新页脚有 `src/components/footer/__tests__/Footer.test.tsx` 覆盖）
    - A2 让 `grid-utils.ts` “接回生产引用”（消除重复实现 + 修复 orphan）：
      - 在 `src/components/products/product-grid.tsx`：移除本地 `getSmColumnClass/getMdColumnClass/getLgColumnClass/getGapClass`，改为 `import { getSmColumnClass, ... } from "@/components/products/grid-utils"`
      - 在 `src/components/products/product-card-skeleton.tsx`：同样移除本地 `get*Class` 并改为从 `grid-utils` 导入
      - 预期效果：重复逻辑集中在一个文件，且 `grid-utils.ts` 不再 orphan
    - A3 删除未使用的 i18n provider 边界组件：
      - 删除 `src/components/i18n/translations-boundary.tsx`（当前 layout 已负责 `NextIntlClientProvider`，避免未来“嵌套 provider / messages 不一致”）
  - 验收口径（必须同时满足）：
    - `pnpm arch:check`：不再出现上述 3 条 `no-orphans`
    - `pnpm test`：全绿
    - `pnpm type-check`：全绿（确保 refactor 未引入类型回归）
- 验收命令：
  - `pnpm arch:check`
  - 若删除：`pnpm test`
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：删除旧页脚与未用的 i18n boundary；`grid-utils` 接回生产引用并消除重复实现；补齐 App Router `head.tsx` 入口豁免以减少误报
  - 代码变更：`.dependency-cruiser.js`、`src/components/products/product-grid.tsx`、`src/components/products/product-card-skeleton.tsx`、`src/components/products/grid-utils.ts`、`src/components/i18n/translations-boundary.tsx`（删除）、`src/components/sections/site-footer.tsx`（删除）及对应测试（删除）
  - 验收：`pnpm arch:check`（当前为 0 violations）、`pnpm test`

#### CR-002 降低 barrel exports 带来的隐式耦合（`no-barrel-export-dependencies`）
- 优先级：P1
- 标签：PROD
- 证据：
  - `src/lib/resend-core.tsx` 依赖 `src/emails/index.ts`
  - `src/lib/contact-form-processing.ts` 依赖 `src/lib/lead-pipeline/index.ts`
- 影响：依赖图变“宽”，重构时更容易出现无意的跨模块耦合与循环依赖；也会降低静态分析信噪比。
- 建议修复：改为按需直引具体模块（避免从 `index.ts` 聚合导入）。
- 具体改法（示例）：
  - `src/lib/resend-core.tsx`：将 `import { ConfirmationEmail, ... } from "@/emails"` 改为从 `@/emails/ConfirmationEmail` 等文件直引。
  - `src/lib/contact-form-processing.ts`：将 `import { processLead } from "@/lib/lead-pipeline"` 改为 `@/lib/lead-pipeline/process-lead`（或其它非 barrel 路径）。
- 落地方案（不执行代码修改；可直接照此开 PR）：
  - B1 `src/lib/resend-core.tsx`（去除 `@/emails` barrel 依赖）：
    - 将
      - `import { ConfirmationEmail, ContactFormEmail, ProductInquiryEmail } from "@/emails"`
    - 替换为（按需直引）：
      - `import { ConfirmationEmail } from "@/emails/ConfirmationEmail"`
      - `import { ContactFormEmail } from "@/emails/ContactFormEmail"`
      - `import { ProductInquiryEmail } from "@/emails/ProductInquiryEmail"`
    - 备注：仅调整 import 路径，不改组件逻辑；避免把 `src/emails/index.ts` 作为“聚合依赖点”
  - B2 `src/lib/contact-form-processing.ts`（去除 `@/lib/lead-pipeline` barrel 依赖）：
    - 将
      - `import { processLead } from "@/lib/lead-pipeline"`
    - 替换为：
      - `import { processLead } from "@/lib/lead-pipeline/process-lead"`
  - 验收口径（必须同时满足）：
    - `pnpm arch:check`：不再出现 2 条 `no-barrel-export-dependencies`
    - `pnpm type-check`：全绿
    - `pnpm test`：全绿（至少覆盖 lead pipeline / email 渲染的现有测试）
- 验收命令：
  - `pnpm arch:check`
  - `pnpm type-check`
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：将 `src/lib/*` 中的 barrel import 改为按需直引，恢复 `arch:check` 信噪比
  - 代码变更：`src/lib/resend-core.tsx`、`src/lib/contact-form-processing.ts`（以及联动调整测试 mock：`src/app/api/contact/__tests__/contact-api-validation.test.ts`）
  - 验收：`pnpm arch:check`（当前为 0 violations）、`pnpm test`、`pnpm ci:local:quick`

#### CR-003 修复 knip “生产未用扫描”失败（Unlisted dependency）
- 优先级：P2
- 标签：DEV/CI
- 证据：`pnpm unused:production` 报 `@react-grab/claude-code/server  next.config.ts:9:47`
- 影响：未用依赖/文件扫描无法稳定运行，导致可维护性治理缺少可靠报告来源。
- 建议修复（选择最符合意图的一种）：
  - 若确实需要该 dev-only 功能：
    - 将 `@react-grab/claude-code` 补充到 `devDependencies`
    - 并给动态 import 加 `.catch()`，避免“未安装时”触发 unhandled rejection
  - 若只是可选能力（更推荐）：
    - 将其从 `next.config.ts` 的默认执行路径移出（例如改为单独脚本/手动开关），或至少用环境变量 gate（如 `REACT_GRAB=1` 才启用）
    - 并在 `knip.jsonc` 的 `ignoreDependencies` 里写明原因（避免后续再被误报/误删）
- 落地方案（推荐路径：把“工具副作用”移出 Next config）：
  - C0 背景（为什么要动）：`next.config.ts` 属于构建/启动关键路径；在其中做“启动 dev agent server”属于副作用，且当前模块未安装时会导致 knip 失败与潜在 unhandled rejection 噪声。
  - 方案 A（最推荐：解耦副作用 + 让 knip 成为可靠门禁）：
    - 删除/移动 `next.config.ts` 中的 dev-only 动态 import 逻辑
    - 新增一个显式脚本（例如 `scripts/react-grab-dev.mjs` 或 `pnpm dev:react-grab`）专门启动该 agent server（需要时手动跑）
    - 让 `pnpm dev` 保持纯净（只启动 Next dev server）
  - 方案 B（次推荐：保留但显式 gate + 补齐依赖声明）：
    - 增加环境变量开关：仅 `NODE_ENV=development && REACT_GRAB=1` 时才执行动态 import
    - 将 `@react-grab/claude-code` 加入 `devDependencies`（避免 knip unlisted）
    - 给动态 import promise 加 `.catch()`，避免未安装/网络问题导致的未处理 rejection
  - 方案 C（权宜：knip 忽略）：
    - 在 `knip.jsonc` 添加 `ignoreDependencies: ["@react-grab/claude-code"]` 并写明理由
    - 代价：降低 knip 作为“真实依赖治理门禁”的可信度（更容易掩盖其它 unlisted）
  - 验收口径（至少满足）：
    - `pnpm unused:production`：退出码为 0
    - `pnpm dev`：无 unhandled rejection / 模块找不到的噪声（尤其当该包未安装时）
- 验收命令：
  - `pnpm unused:production`
  - （可选）`pnpm dev`：确认控制台无 unhandled rejection / 模块找不到的噪声
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：将 dev-only 副作用从 `next.config.ts` 移出关键路径，避免 knip 扫描将其视为 unlisted dependency
  - 代码变更：`next.config.ts`、`.devtools/react-grab-dev.mjs`、`package.json`
  - 验收：`pnpm unused:production`、`pnpm ci:local:quick`

### Security（Phase 3.4：安全深审已完成第一轮）

#### CR-017 CSP strict + nonce 链路未完全闭环：存在未带 nonce 的 inline script（可能被阻断/产生噪声）
- 优先级：P1
- 标签：PROD
- 证据（代码层）：
  - CSP 生成：`src/config/security.ts`（生产环境默认不允许 `script-src 'unsafe-inline'`，而是依赖 `nonce`）
  - CSP 注入：`src/middleware.ts`（每次请求生成 nonce 并写入 `Content-Security-Policy`；并通过 request header override 让 Next 能给内部 inline script 加 nonce）
  - 头部兜底：`next.config.ts` 的 `headers()` **刻意移除了 CSP**（避免与 middleware 产生冲突；其它安全头仍会下发）
  - JSON-LD inline：`src/app/[locale]/layout.tsx`（两段 `<script type="application/ld+json">`，当前未设置 `nonce`）
  - 主题初始化：`src/components/theme-provider.tsx`（封装 `next-themes`，未透传 `nonce`；而 `next-themes` 自身支持 `nonce`）
- 证据（运行时，一次响应内可同时观察到“nonce script”与“无 nonce inline script”）：
  - 使用 `NEXT_PUBLIC_SECURITY_MODE=strict` + `SECURITY_HEADERS_ENABLED=true` 启动后，`/en` 响应头包含 `content-security-policy: ... 'nonce-<...>' ...`
  - 同一次响应的 HTML 中：
    - ✅ 部分 Next 内部脚本会自动带 `nonce="<...>"`（与 CSP 一致）
    - ⚠️ 仍存在未带 nonce 的 inline script（例如 Next 输出的 `requestAnimationFrame(...$RT...)` 以及 `next-themes` 的主题初始化脚本）
- 影响：
  - 若线上启用 enforced strict CSP：未带 nonce 的脚本会被浏览器阻断（主题初始化/首屏体验可能受影响），并导致 `/api/csp-report` 报告噪声上升。
  - JSON-LD 是否触发 CSP violation 依赖浏览器实现；但为了“确定性 + 监控信噪比”，建议也纳入 nonce 管理。
- 建议修复（推荐组合，按“兼容 Cache Components + 安全收益”从大到小）：
  - 优先保证“业务必需”的 inline script 不被 strict CSP 阻断（例如 next-themes 主题初始化），同时不破坏 Cache Components：
    - **推荐方案：CSP hash allowlist**（不依赖 request-scoped API，不影响静态化）
      - 识别并固定需要放行的 inline script（例如 next-themes 初始化脚本）。
      - 为这些脚本计算 `sha256-...`，加入 `src/config/security.ts` 的 `script-src`（与 nonce 可并存）。
      - 这样在 strict CSP 下，即使脚本没有 nonce 也能执行，且安全性显著优于全局 `unsafe-inline`。
      - 实操补充：hash 方案需要“保鲜机制”，因为 next-themes（及 Next 自身注入的少量 inline script）可能随版本变动；建议在 CI 里加一个 build 后校验脚本，提取 inline script 的内容并与 allowlist 对比，升级依赖时能自动提醒更新 hash。
    - 备选方案：传递 nonce（需谨慎评估对静态化的影响）
      - `next-themes` 支持 `nonce` prop，但获取 per-request nonce 通常需要 `headers()`/request-scoped API，可能与当前“为 Cache Components 静态化而移除 headers()”的决策冲突（见 `src/app/[locale]/layout.tsx` 注释）。
  - 对 Next 自身输出的“无 nonce inline script”（例如 `$RT`）：
    - 如果功能上不关键：接受其被阻断，但要避免 CSP report 噪声（可通过 report-only 验证真实影响后再定策略）。
    - 若必须保持“零噪声”：同样用 hash allowlist 精确放行（避免 `unsafe-inline`）。
  - 过渡策略（若 strict 影响线上可用性）：
    - 临时切到 `NEXT_PUBLIC_SECURITY_MODE=relaxed`（report-only）收集真实 violation，再逐步收紧。
- 验收口径（推荐）：
  - strict 模式下，确保主题初始化脚本不再触发 CSP 拒绝（以浏览器控制台/报告为准，而非要求“HTML 不含无 nonce 脚本”，因为 Next 可能注入少量内部 inline script）：
    - 运行 `NEXT_PUBLIC_SECURITY_MODE=strict SECURITY_HEADERS_ENABLED=true pnpm start`
    - 打开页面或用 Playwright 访问，确认无与主题初始化相关的 “Refused to execute inline script” 报错
  - 响应头存在 CSP 且包含 nonce：
    - `curl -sD- -o /dev/null http://localhost:3200/en | rg -i 'content-security-policy'`
- 验收命令：
  - `pnpm build`
  - `PORT=3200 SECURITY_HEADERS_ENABLED=true NEXT_PUBLIC_SECURITY_MODE=strict pnpm start`
  - `curl -sD- -o /dev/null http://localhost:3200/en | rg -i 'content-security-policy'`
  - （可选，自动化验证无 CSP 拒绝报错）：
    - `node -e \"const { chromium } = require('playwright');(async()=>{const url='http://localhost:3200/en';const browser=await chromium.launch();const page=await browser.newPage();const cspErrors=[];page.on('console',(msg)=>{const t=msg.text();if(msg.type()==='error'&&/Refused to execute inline script/i.test(t))cspErrors.push(t);});await page.goto(url,{waitUntil:'networkidle'});await page.waitForTimeout(300);await browser.close();if(cspErrors.length){console.error('CSP inline-script blocked:\\n'+cspErrors.join('\\n'));process.exit(1);}console.log('OK');process.exit(0);})().catch((e)=>{console.error(e);process.exit(2);});\"`
  - （新增，CI/本地保鲜机制）：
    - `pnpm security:csp:check`（启动 `next start` 后抓取 `/en`、`/zh` HTML：所有无 `nonce` 的 inline script 必须在 CSP hash allowlist 内）
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：
    - 将 `middleware.ts` 移至 `src/middleware.ts`，确保 Next.js 构建产物包含 middleware（修复“CSP 缺失”这一根因）
    - middleware 通过 `x-middleware-request-x-nonce` override 透传 nonce，Next 内部 inline script 可自动带 `nonce="<...>"`
    - 对仍不带 nonce 的少量 inline script（JSON-LD、next-themes init、`$RT`）使用 `sha256-...` hash allowlist，避免回退到 `unsafe-inline`
    - 新增 `pnpm security:csp:check`，并在 `pnpm ci:local`（非 quick）中纳入安全检查闭环
  - 代码变更：`src/middleware.ts`、`src/config/security.ts`、`scripts/csp/check-inline-scripts.ts`、`scripts/ci-local.sh`、`next.config.ts`
  - 验收：`pnpm build` + `pnpm security:csp:check`

#### CR-018 development-only 外部脚本（unpkg）与 CSP allowlist 不一致（dev 工具可能被 CSP 拦截）
- 优先级：P2
- 标签：DEV
- 证据：
  - `src/app/layout.tsx` 在 `NODE_ENV=development` 下通过 `next/script` 加载 `https://unpkg.com/...`（react-scan / react-grab）。
  - `src/config/security.ts` 的 `script-src` allowlist 未包含 `https://unpkg.com`。
- 影响：
  - 当开发环境启用安全头部（默认 `SECURITY_HEADERS_ENABLED` 未显式关闭）时，dev-only 脚本可能被 CSP 拦截，导致“本地调试工具偶发不可用/难定位”。
- 建议修复（择一）：
  - 若要在 dev 也启用 CSP：仅在 `NODE_ENV=development` 时把 `https://unpkg.com` 加入 `script-src` allowlist（并明确这是 dev-only 风险接受）。
  - 若 CSP 只打算在预览/生产启用：在 dev 默认关闭安全头部（例如 `.env.local` 中 `SECURITY_HEADERS_ENABLED=false`），并在文档中说明。
  - 或者：将 dev 脚本改为本地依赖/自托管（避免第三方供应链 + CSP allowlist 维护成本）。
- 验收命令（任选其一作为团队习惯）：
  - `pnpm dev` 后打开页面，确认控制台无 CSP 报错且 dev 工具能正常工作
  - `curl -sD- -o /dev/null http://localhost:3100/en | rg -i 'content-security-policy'`（确认 dev 下 CSP 行为符合预期）
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：
    - development 模式下将 `https://unpkg.com` 纳入 CSP `script-src` allowlist（dev-only 风险接受）
    - 将 `src/app/layout.tsx` 中 scheme-relative 的 unpkg 脚本 URL 改为显式 `https://`（避免在 http dev 下落到 `http://unpkg.com`）
    - 补齐配置单测（`generateCSP()` 在 development 下应包含 `https://unpkg.com`）
  - 代码变更：`src/config/security.ts`、`src/config/__tests__/security.test.ts`、`src/app/layout.tsx`
  - 验收：`pnpm test -- src/config/__tests__/security.test.ts`

#### CR-019 安全头部工具链存在自相矛盾：`validateSecurityHeaders` 要求 `X-XSS-Protection`，但实际未下发
- 优先级：P2
- 标签：DEV
- 证据：
  - `src/lib/security-headers.ts` 的 `validateSecurityHeaders()` 将 `X-XSS-Protection` 视为 required。
  - `src/config/security.ts` 的 `getSecurityHeaders()` 实际未设置 `X-XSS-Protection`（当前下发的 9 个头部不包含该项）。
- 影响：
  - 安全头部“自检/测试”与真实线上行为口径不一致，容易造成误判（认为缺失/认为已覆盖）。
  - `SECURITY_MODES` 中的部分字段（例如 `xssProtection`）当前没有真实生效点，增加维护复杂度。
- 建议修复：
  - 对齐策略：要么移除对 `X-XSS-Protection` 的 required 检查（更符合现代浏览器现状），要么在 `getSecurityHeaders()` 中显式下发（并说明兼容性/风险）。
  - 同步更新对应测试用例与文档说明，确保“工具链输出 = 真实线上行为”。
- 验收命令：`pnpm test -- src/lib/__tests__/security-headers.test.ts`
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：`validateSecurityHeaders()` 不再将 `X-XSS-Protection` 视为 required（对齐现代浏览器现状与实际下发头部）
  - 代码变更：`src/lib/security-headers.ts`、`src/lib/__tests__/security-headers.test.ts`
  - 验收：`pnpm exec vitest run src/lib/__tests__/security-headers.test.ts`

#### CR-020 `target="_blank"` 链接未统一包含 `rel="noopener"`（tabnabbing 风险面）
- 优先级：P3
- 标签：PROD
- 证据：`src/components/products/product-actions.tsx` 中 `<a href={pdfHref} target="_blank" rel="noreferrer">`（缺少 `noopener`）
- 影响：
  - 打开新标签页后，第三方页面可通过 `window.opener` 影响来源页（tabnabbing），属于常见浏览器侧安全风险。
  - 虽然此处多为 PDF/受控链接，但作为通用组件模式，建议统一收敛，避免未来引入外链时踩坑。
- 建议修复：
  - 将 `rel="noreferrer"` 统一改为 `rel="noopener noreferrer"`（或与项目其它位置一致的顺序）。
  - 可配合加一条轻量 lint/单测（已有多个 `social-icons` 测试覆盖该模式），确保不会再回归。
- 验收命令：
  - `pnpm test -- src/app/[locale]/products/[slug]/__tests__/page-download-pdf.test.tsx`
  - （可选）`rg -n \"target=\\\"_blank\\\"\" src/components | rg -v \"rel=\\\".*noopener\"`（确保无漏网点）
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：将 `rel="noreferrer"` 统一改为 `rel="noopener noreferrer"`，并同步更新对应单测断言
  - 代码变更：`src/components/products/product-actions.tsx`、`src/components/products/__tests__/product-actions.test.tsx`
  - 验收：`pnpm exec vitest run src/components/products/__tests__/product-actions.test.tsx`

#### CR-021 WhatsApp 媒体下载对第三方返回 URL 直接 `fetch()`：建议加 allowlist，避免未来 SSRF 风险
- 优先级：P3
- 标签：PROD（若未来启用媒体下载/转存，则上升为 P2）
- 证据：`src/lib/whatsapp-media.ts`
  - `getMediaUrl()` 从 Graph API 返回 `data.url`
  - `downloadMedia()` 直接 `fetch(mediaUrl, { headers: { Authorization: Bearer ... }})`
- 影响：
  - 当前实现信任第三方返回的 URL；若未来媒体链路被启用，一旦出现“URL 可被影响/被劫持/返回异常跳转”，可能演变为 SSRF 或向非预期域名泄露 `Authorization` bearer token 的风险面。
- 建议修复：
  - 对 `mediaUrl` 做严格校验：必须是 `https:`，hostname 在 allowlist（Meta/WhatsApp 官方域名集合）内；拒绝 `localhost`、私网 IP、`169.254.0.0/16`、`file:` 等。
  - 禁用或手动处理 redirect：`redirect: "manual"`，仅当 `Location` 仍在 allowlist 时才跟随。
  -（可选）将下载逻辑封装为 “safeFetchThirdPartyUrl(url, allowHosts)” 工具，后续其它第三方 URL fetch 可复用。
- 验收命令：
  - `pnpm test -- src/lib/__tests__/whatsapp-media.test.ts`
- 状态：✅ 已修复（2026-03-05，本地未提交/未开 PR）
  - 修复点：
    - `downloadMedia()` 对第三方 URL 增加 allowlist（仅允许 `https:` 且 hostname 在 Meta/WhatsApp 域名集合内）
    - 禁用自动 redirect，并在 allowlist 范围内手动跟随有限次数 redirect（避免 token 泄露到非预期域名）
    - 补单测覆盖：拒绝不可信 host、允许的 redirect 链路
  - 代码变更：`src/lib/security/safe-third-party-fetch.ts`、`src/lib/whatsapp-media.ts`、`src/lib/__tests__/whatsapp-media.test.ts`
  - 验收：`pnpm test -- src/lib/__tests__/whatsapp-media.test.ts`
