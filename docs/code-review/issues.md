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
- ✅ Round 2：PR-01 ~ PR-06f 已完成（2026-03-06）。
- ✅ Round 4：Wave A ~ Wave D 已完成（2026-03-09）；`CR-022`、`CR-023` ~ `CR-046` 已全部转为已修复记录，当前无未关闭的 Round 4 执行项。

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
- 验收命令：
  - `pnpm build`
  - `pnpm build:cf`
- 状态：⏸️ 临时接受（2026-03-09 更新）
  - 现状：
    - `src/proxy.ts` 方案已在 `pnpm build` 下验证过。
    - 但当前 `@opennextjs/cloudflare@1.16.5` 仍要求保留 `src/middleware.ts`，否则 `pnpm build:cf` 无法通过。
  - 当前处理：
    - 运行时入口已回退为 `src/middleware.ts`
    - `pnpm build` 与 `pnpm build:cf` 现均可通过
  - 残余技术债：
    - `pnpm build` 会重新出现 `middleware` 弃用告警
    - 待 Cloudflare/OpenNext 支持稳定后，再重新迁回 `proxy.ts`

#### CR-027 `html[lang]` 当前依赖客户端 hydration 后修正，SSR/无 JS 语义不正确
- 优先级：P1
- 标签：PROD/SEO/A11Y/NEXT
- 关闭记录：
  - `src/app/[locale]/layout.tsx` 已升为真正的 root layout
  - 服务端直接输出 `<html lang={locale}>`
  - `src/components/i18n/lang-updater.tsx` 已删除
- 验收命令：
  - `pnpm build`
- 状态：✅ 已修复（2026-03-09，Wave D）
  - 结果：`html[lang]` 已由服务端首包正确输出，客户端不再负责补写。

#### CR-028 根路径 locale 重定向依赖页面层补丁，而不是统一路由边界
- 优先级：P2
- 标签：PROD/NEXT/ROUTING
- 关闭记录：
  - root path locale redirect 已收敛到单一运行时入口，当前入口为 `src/middleware.ts`
  - 页面层补丁 `src/app/page.tsx` 已删除
- 验收命令：
  - `pnpm build`
- 状态：✅ 已修复（2026-03-09，Wave D）
  - 结果：locale redirect 已回到单一框架边界入口，当前由 `src/middleware.ts` 承接。

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

#### CR-029 `quality-gate` 将整个 `src/components/ui/**` 排除在 diff coverage 外，门禁信号失真
- 优先级：P2
- 标签：DEV/CI/QA
- 关闭记录：
  - `scripts/quality-gate.js` 不再对整个 `src/components/ui/**` 做目录级豁免
  - 已改为文件级白名单
- 验收命令：
  - `pnpm quality:gate:json`
  - 抽查修改 `src/components/ui/animated-counter.tsx` 或 `src/components/ui/navigation-menu.tsx` 后，确认 diff coverage 不再被整体跳过
- 状态：✅ 已修复（2026-03-09，Wave B）
  - 结果：diff coverage 恢复为真实信号，不再存在目录级黑洞。

#### CR-030 `ci:local` 声称“完全模拟 CI”，但 Node 版本检查实际允许 20 以上任意主版本
- 优先级：P2
- 标签：DEV/CI
- 关闭记录：
  - `scripts/ci-local.sh` 已明确“本地支持版本”与“远程 CI 固定 Node 20”的差异
  - 不再宣称“完全模拟 CI”
- 验收命令：
  - `pnpm ci:local`
  - 在 Node 22 与 Node 20 环境分别执行，确认脚本输出口径与项目声明一致
- 状态：✅ 已修复（2026-03-09，Wave B）
  - 结果：本地门禁与 CI 差异已显式化，不再靠误导性口号承诺。

#### CR-031 Vitest 默认输出过于嘈杂，正在稀释真实失败信号
- 优先级：P3
- 标签：DEV/CI/TEST
- 关闭记录：
  - 默认 `pnpm test` 已切回简洁输出
  - `verbose + logHeapUsage` 已迁到显式 debug 模式
- 验收命令：
  - `pnpm test`
  - 期望默认输出保留失败摘要与统计信息，不再逐用例附带 heap 行
- 状态：✅ 已修复（2026-03-09，Wave B）
  - 结果：默认输出回到可读状态，同时保留 `pnpm test:debug` 诊断入口。

#### CR-032 联系表单 server action 与容器组件之间仍靠英文字符串做协议分支
- 优先级：P2
- 标签：PROD/DEV/FORM
- 关闭记录：
  - server action 已补齐稳定 `errorCode`
  - 容器组件不再依赖英文字符串分支
- 验收命令：
  - `pnpm test -- src/components/forms/__tests__/contact-form-container-core.test.tsx`
  - `pnpm test -- src/components/forms/__tests__/contact-form-validation.test.tsx`
  - `pnpm test -- src/app/__tests__/actions.test.ts`
- 状态：✅ 已修复（2026-03-09，Wave A）
  - 结果：联系表单内部协议已回到稳定类型驱动。

#### CR-033 `blog-newsletter` 客户端仍在消费 `message`，没有接上统一 `errorCode` 翻译链路
- 优先级：P2
- 标签：PROD/UX/API
- 证据：
  - `src/components/blog/blog-newsletter.tsx:272-275`
    - 请求 `/api/subscribe` 后，失败分支读取 `result.message ?? t("error")`
  - 但 `/api/subscribe` 当前失败响应返回的是 `errorCode`，例如：
    - `src/app/api/subscribe/route.ts:83-131`
  - 测试也仍在固化旧协议：
    - `src/components/blog/__tests__/blog-newsletter.test.tsx:388-410`
    - mock 返回 `{ success: false, message: "Invalid email" }`
- 影响：
  - 服务端即使给出精确 `errorCode`，客户端也只会降级成泛化错误文案，统一错误翻译链路在这一条用户路径上失效。
  - 测试继续 mock `message`，会让这条断链长期不被发现。
- 建议修复：
  - 在客户端对 `/api/subscribe` 的失败响应改用 `errorCode` + `translateApiError()`。
  - 测试同步改为 mock `errorCode`，不要再把 `message` 当协议字段。
- 验收命令：
  - `pnpm test -- src/components/blog/__tests__/blog-newsletter.test.tsx`
  - `pnpm test -- tests/integration/api/subscribe.test.ts`
- 状态：✅ 已修复（2026-03-09，Wave A）
  - 修复点：`src/components/blog/blog-newsletter.tsx` 已切到 `errorCode` + `translateApiError()`。

#### CR-034 `contact-api-utils.ts` 仍保留一整套旧工具实现，当前主要只被测试引用
- 优先级：P2
- 标签：DEV/MAINTAINABILITY
- 证据：
  - `src/app/api/contact/contact-api-utils.ts`
    - 仍保留完整的 `verifyTurnstile()` / `verifyTurnstileDetailed()` / `validateEnvironmentConfig()` / `generateRequestId()` / `formatErrorResponse()`
  - 但代码搜索显示该模块当前基本只被它自己的测试消费：
    - `src/app/api/contact/__tests__/contact-api-utils.test.ts`
  - 与此同时，共享实现已经在别处存在并被实际生产代码使用：
    - Turnstile：`src/lib/turnstile.ts`
  - 两者行为已经分叉：
    - `src/lib/turnstile.ts` 对网络失败返回结构化 `errorCodes`（如 `timeout` / `network-error`）
    - `src/app/api/contact/contact-api-utils.ts` 仍在 catch 中直接 re-throw
- 影响：
  - 仓库里同时维护两套看起来都“像真相源”的工具实现，后续修 bug 或改策略时极易只修一边。
  - 测试继续覆盖这块旧模块，会制造“它很重要”的错觉，增加维护成本和认知噪音。
- 建议修复：
  - 如果这些能力仍需要，改为直接复用共享实现（尤其是 `src/lib/turnstile.ts`），不要在 route 目录下继续维护平行版本。
  - 如果已经不再需要，删除该模块及其测试，减少假入口和假契约。
- 验收命令：
  - `rg -n 'contact-api-utils' src tests`
  - `pnpm test -- src/app/api/contact/__tests__/route-post.test.ts`
  - `pnpm test -- src/app/api/contact/__tests__/contact-api-utils.test.ts`
- 状态：✅ 已修复（2026-03-09，Wave C）
  - 修复点：`src/app/api/contact/contact-api-utils.ts` 与对应测试已删除。

#### CR-035 `product-inquiry-form` 客户端仍读取 `result.error`，没有接上 `/api/inquiry` 的 `errorCode`
- 优先级：P2
- 标签：PROD/UX/API
- 证据：
  - `src/components/products/product-inquiry-form.tsx:299-305`
    - `submitInquiry()` 读取 `response.json()` 后只返回 `result.error`
  - `src/components/products/product-inquiry-form.tsx:349-350`
    - 失败分支最终回退到 `result.error ?? t("error")`
  - 但 `/api/inquiry` 的失败响应已经统一为 `createApiErrorResponse(errorCode, status)`：
    - `src/app/api/inquiry/route.ts:60-74`
- 影响：
  - 服务端即使返回精确 `INQUIRY_VALIDATION_FAILED` / `INQUIRY_SECURITY_FAILED` 等 `errorCode`，客户端也只能显示笼统的 `Failed to send inquiry`。
  - 统一错误协议在产品询盘这条用户路径上并未真正闭环。
- 建议修复：
  - `submitInquiry()` 改为读取 `result.errorCode`
  - 客户端用 `translateApiError()` 或等价映射将 `errorCode` 翻译成用户文案
  - 测试同步改为 mock `errorCode`，不要再默认只有泛化错误文案
- 验收命令：
  - `pnpm test -- src/components/products/__tests__/product-inquiry-form.test.tsx`
  - `pnpm test -- src/app/api/inquiry/__tests__/route.test.ts`
- 状态：✅ 已修复（2026-03-09，Wave A）
  - 修复点：`src/components/products/product-inquiry-form.tsx` 已切到 `errorCode` + `translateApiError()`。

#### CR-036 `translateApiError()` 已存在，但当前客户端主路径几乎没有实际接入
- 优先级：P2
- 标签：DEV/MAINTAINABILITY/I18N
- 证据：
  - 仓库存在统一工具：`src/lib/api/translate-error-code.ts`
  - 全仓搜索 `translateApiError(`，当前只出现在注释/示例中，没有实际生产代码调用
  - 同时多个客户端路径仍在消费旧协议：
    - `src/components/blog/blog-newsletter.tsx` 读取 `result.message`
    - `src/components/products/product-inquiry-form.tsx` 读取 `result.error`
  - `src/lib/api/get-request-locale.ts:195` 甚至仍声称 `/api/contact`、`/api/inquiry`、`/api/verify-turnstile` “Currently used by” 旧 `getApiMessages()`，但代码搜索显示 `getApiMessages()` 已无生产调用
- 影响：
  - 仓库里同时存在“推荐的新方案”和“实际运行的旧消费模式”，会让后续开发者误判迁移已经完成。
  - i18n 错误处理策略停留在“工具已存在但未落地”的中间态，最容易继续长出新分叉。
- 建议修复：
  - 选 1~2 条主要用户路径先真正接入 `translateApiError()`，形成可复制的标准模式。
  - 清理 `getApiMessages()` 的过时“Currently used by” 注释，避免文档继续误导。
  - 后续对外 API 客户端消费统一只认 `errorCode`，不再围绕 `message/error` 打补丁。
- 验收命令：
  - `rg -n 'translateApiError\\(' src`
  - `rg -n 'getApiMessages\\(' src`
- 状态：✅ 已修复（2026-03-09，Wave A）
  - 修复点：newsletter / inquiry / contact form 主路径已接入 `translateApiError()`。

#### CR-037 `security-headers.ts` 仍像“基础设施真相源”，但当前大部分导出只剩测试在用
- 优先级：P2
- 标签：DEV/MAINTAINABILITY/SECURITY
- 证据：
  - 文件自身已标注 `legacy helper`：`src/lib/security-headers.ts:27`
  - 代码搜索显示其主要导出当前几乎只被测试引用：
    - `getApiSecurityHeaders()` / `getWebSecurityHeaders()` / `getCORSHeaders()` / `verifyTurnstileToken()` / `checkSecurityConfig()` / `getSecurityMiddlewareHeaders()` / `validateSecurityHeaders()`
    - 引用面几乎集中在：
      - `src/lib/__tests__/security-headers.test.ts`
      - `src/lib/__tests__/security.test.ts`
      - `tests/unit/security/security-headers.test.ts`
  - 其中 `verifyTurnstileToken()` 甚至还保留了对相对路径 `fetch("/api/verify-turnstile")` 的封装：
    - `src/lib/security-headers.ts:71-89`
- 影响：
  - 这会让维护者误以为这里仍是安全头部和 Turnstile 验证的生产入口，但真实生产逻辑其实已经分散在 `src/config/security.ts`、`src/middleware.ts`、`src/lib/turnstile.ts`、`src/lib/api/cors-utils.ts`。
  - 测试继续围绕这层遗留 helper 建模，会不断放大“假真相源”，增加未来安全改动时漏改和错改的概率。
- 建议修复：
  - 明确它是测试辅助层还是生产辅助层，二选一。
  - 如果只是测试辅助，迁移到 `src/test/**` 或测试专用 helper，避免继续驻留在 `src/lib/` 冒充生产基础设施。
  - 如果仍需保留部分能力，按真实生产职责拆回对应模块，不要把安全头/CORS/Turnstile/配置检查混在一个遗留工具包里。
- 验收命令：
  - `rg -n 'security-headers' src tests`
  - `pnpm test -- src/lib/__tests__/security-headers.test.ts`
  - `pnpm test -- tests/unit/security/security-headers.test.ts`
- 状态：✅ 已修复（2026-03-09，Wave C）
  - 修复点：`src/lib/security-headers.ts` 与对应遗留测试已删除。

#### CR-038 `validations.ts` 混合了生产真类型与仅测试消费的旧 schema/helper，模块职责已经失焦
- 优先级：P3
- 标签：DEV/MAINTAINABILITY
- 证据：
  - 仍在生产使用的部分：
    - `FormSubmissionStatus`
    - `EmailTemplateData`
    - `ProductInquiryEmailData`
    - `AirtableRecord`
  - 但同文件里还混着主要只被测试消费的旧层：
    - `apiResponseSchema`
    - `validationHelpers`
    - `validationConfig`
  - 代码搜索显示：
    - `apiResponseSchema` / `validationHelpers` / `validationConfig` 的引用面基本集中在 `src/lib/__tests__/validations.test.ts`
    - 与此同时，生产代码只在消费类型定义，而不是这些旧 helper/schema
  - `apiResponseSchema` 仍编码的是旧式 `message/error/data` 响应结构：
    - `src/lib/validations.ts:17-25`
    - 与当前 API 主推的 `errorCode` 协议已经脱节
- 影响：
  - 维护者很容易把这个文件误判成“表单/响应校验的统一真相源”，但实际上它已经是一半活代码、一半历史残留。
  - 这种混合模块会拖慢迁移：你不敢删，又不该继续扩展，最后只会越来越像杂物间。
- 建议修复：
  - 把仍在生产链路中的类型定义保留下来。
  - 将仅测试消费、且已经偏离当前协议的 `apiResponseSchema` / `validationHelpers` / `validationConfig` 迁走或删除。
  - 至少把“生产类型定义”和“测试/遗留 helper”拆成不同模块，避免继续共用一个入口。
- 验收命令：
  - `rg -n 'apiResponseSchema|validationHelpers|validationConfig' src tests`
  - `rg -n 'FormSubmissionStatus|EmailTemplateData|ProductInquiryEmailData|AirtableRecord' src`
- 状态：✅ 已修复（2026-03-09，Wave C）
  - 修复点：`src/lib/validations.ts` 已拆分并删除，生产链路分别迁移到 email/Airtable/form status/helper 专用模块。

#### CR-039 `sanitizeInput` 存在多层遗留薄封装，当前主要只被测试保活
- 优先级：P3
- 标签：DEV/MAINTAINABILITY/SECURITY
- 证据：
  - 仓库里当前至少存在 3 个同名/同义入口：
    - `src/lib/security-validation.ts:89` 的 `sanitizeInput()`（已标 `@deprecated`，内部直接委托 `sanitizePlainText()`）
    - `src/lib/validations.ts:149` 的 `validationHelpers.sanitizeInput()`（同样直接委托 `sanitizePlainText()`）
    - `src/lib/lead-pipeline/utils.ts:106` 的 `sanitizeInput()`（委托 `sanitizePlainText()` 后再 `slice`）
  - 代码搜索显示这些 wrapper 当前几乎都只剩测试引用；生产代码实际直接调用的是 `sanitizePlainText()`。
- 影响：
  - 看似有多个“可用入口”，实际只有一个底层真相源，这会持续误导后续开发者在新代码里继续挑错入口。
  - 测试围绕不同 wrapper 建模，会把遗留薄封装长期保活，增加迁移成本和认知噪音。
- 建议修复：
  - 明确 `sanitizePlainText()` 是唯一主入口。
  - 对仅测试消费的 wrapper 做清理或下沉到兼容层；至少停止在生产模块中继续导出多个同义入口。
  - 如果某个 wrapper 需要保留特殊行为（例如长度裁剪），就给它起一个语义明确的新名字，而不是继续叫 `sanitizeInput()`。
- 验收命令：
  - `rg -n 'sanitizeInput\\(' src tests`
  - `rg -n 'sanitizePlainText\\(' src`
- 状态：✅ 已修复（2026-03-09，Wave C）
  - 修复点：`security-validation.ts` 的 deprecated alias 与 `validationHelpers.sanitizeInput()` 已删除。
  - 修复点：`lead-pipeline/index.ts` 不再导出 `sanitizeInput`。

#### CR-040 `types/global.ts` 中的通用 `ApiResponse` / `PaginatedResponse` 被导出和测试覆盖，但几乎不在生产代码中使用
- 优先级：P3
- 标签：DEV/MAINTAINABILITY/TYPES
- 证据：
  - `src/types/global.ts:10-37`
    - 定义了通用 `ApiResponse<T>` / `PaginatedResponse<T>`
    - 结构仍是旧式 `message` / `errors`
  - `src/types/index.ts:7-24`
    - 继续把这套类型作为统一入口导出
  - `src/types/__tests__/global.test.ts`
    - 对这套类型做了完整测试覆盖
  - 但对生产代码做搜索时：
    - `rg -n 'from \"@/types/global\"|from \"@/types\"' src --glob '!**/__tests__/**' --glob '!src/types/**'`
    - 基本没有实际生产消费方
  - 与此同时，真实 API 路径已经在使用别的真相源：
    - `src/lib/api/api-response.ts`
- 影响：
  - 这会让维护者误以为项目存在一套全局通用 API 响应类型，实际生产代码却并不依赖它。
  - 类型被统一导出又被测试覆盖，会进一步放大“它仍是官方接口”的错觉，增加未来迁移和统一成本。
- 建议修复：
  - 如果这套类型不再服务生产代码，就不要继续从 `src/types/index.ts` 作为统一入口导出。
  - 如果需要保留，应明确它只服务某个子域或模板，而不是冒充全局 API 真相源。
  - 最好让真实 API 类型来源收敛到 `src/lib/api/api-response.ts`，避免再保留平行定义。
- 验收命令：
  - `rg -n 'from \"@/types/global\"|from \"@/types\"' src --glob '!**/__tests__/**' --glob '!src/types/**'`
  - `rg -n 'ApiResponse<T>|PaginatedResponse<T>' src/types`
- 状态：✅ 已修复（2026-03-09，Wave C）
  - 修复点：`src/types/index.ts`、`src/types/global.ts` 及对应测试已删除；测试改为直接引用真实类型源。

#### CR-041 `get-request-locale.ts` 整个 legacy i18n API 层当前已无生产引用，却仍在 `src/lib/api/` 冒充可用方案
- 优先级：P2
- 标签：DEV/MAINTAINABILITY/I18N
- 证据：
  - `src/lib/api/get-request-locale.ts`
    - 定义了 `getRequestLocale()`、`ApiMessages`、`API_MESSAGES`、`getApiMessages()`
    - 文件内反复标记 `@deprecated` / `legacy server-side i18n mechanism`
    - 仍保留误导性注释：`Currently used by: /api/contact, /api/inquiry, /api/verify-turnstile`
  - 代码搜索结果：
    - `rg -n 'getRequestLocale\\(|getApiMessages\\(|API_MESSAGES|ApiMessages' src tests`
    - 除本文件自引用外，没有实际生产消费方
- 影响：
  - 仓库里继续保留一整层已经退出生产链路的 API i18n 方案，会让维护者误以为当前 API 仍支持服务端消息本地化。
  - 它与当前主推的 `errorCode` + `translateApiError()` 方案并存，会持续制造迁移完成度的错觉。
- 建议修复：
  - 如果确实已退出生产链路，就不要让这整层继续待在 `src/lib/api/` 冒充当前可用方案。
  - 至少移除误导性的 “Currently used by” 注释；更理想的是将其删除、归档或下沉到迁移记录/测试辅助层。
- 验收命令：
  - `rg -n 'getRequestLocale\\(|getApiMessages\\(' src tests`
  - `rg -n 'from \"@/lib/api/get-request-locale\"' src tests`
- 状态：✅ 已修复（2026-03-09，Wave A）
  - 修复点：`src/lib/api/get-request-locale.ts` 已删除。

#### CR-042 `metadata.ts` 只是 `seo-metadata` 的兼容包装层，当前主要靠测试保活
- 优先级：P3
- 标签：DEV/MAINTAINABILITY/SEO
- 证据：
  - `src/lib/metadata.ts`
    - 仅提供 `generatePageMetadata()` 薄封装，并重新导出 `createPageSEOConfig` / `generateLocalizedMetadata`
  - 代码搜索：
    - `rg -n 'from \"@/lib/metadata\"|generatePageMetadata\\(' src --glob '!**/__tests__/**'`
    - 当前看不到实际生产消费方
  - 但它仍有完整测试：
    - `src/lib/__tests__/metadata.test.ts`
  - 真正被生产代码直接使用的是：
    - `src/lib/seo-metadata.ts`
- 影响：
  - 这会继续制造“还有一层兼容入口需要维护”的错觉，尤其在 metadata / SEO 改动时容易让人多想一层不存在的公共契约。
  - 测试覆盖会进一步放大它仍是官方入口的假象。
- 建议修复：
  - 如果生产代码已经全面切到 `seo-metadata.ts`，就不要再保留这一层兼容包装。
  - 至少停止把它当公共入口扩散；更理想的是删除或归档。
- 验收命令：
  - `rg -n 'from \"@/lib/metadata\"|generatePageMetadata\\(' src tests`
  - `pnpm test -- src/lib/__tests__/metadata.test.ts`
- 状态：✅ 已修复（2026-03-09，Wave C）
  - 修复点：`src/lib/metadata.ts` 与对应测试已删除。

#### CR-043 `api-cache-utils.ts` 当前看起来已经完全失活，却仍保留在 `src/lib/` 正式命名空间中
- 优先级：P3
- 标签：DEV/MAINTAINABILITY
- 证据：
  - 文件导出：
    - `createCacheHeaders()`
    - `createCachedResponse()`
  - 代码搜索：
    - `rg -n 'api-cache-utils|createCacheHeaders\\(|createCachedResponse\\(' src tests`
    - 结果仅命中文件自身，没有生产代码，也没有测试引用
- 影响：
  - 这类“零引用但留在正式工具层”的文件，会让维护者误以为仓库里已经有缓存响应统一方案可复用。
  - 长期会增加命名冲突和错误复用风险，尤其当后续有人再次造轮子时看不出哪层才是真入口。
- 建议修复：
  - 如果当前无实际使用场景，直接删除。
  - 如果计划未来使用，就不要留在 `src/lib/` 主命名空间里静默发霉，至少要补实际消费方或迁到草稿/模板区。
- 验收命令：
  - `rg -n 'api-cache-utils|createCacheHeaders\\(|createCachedResponse\\(' src tests`
- 状态：✅ 已修复（2026-03-09，Wave C）
  - 修复点：`src/lib/api-cache-utils.ts` 已删除。

#### CR-044 `site-config.ts` 提供了一套看似官方的项目常量，但当前主要只被测试消费
- 优先级：P3
- 标签：DEV/MAINTAINABILITY
- 证据：
  - `src/lib/site-config.ts` 导出：
    - `PROJECT_STATS`
    - `PROJECT_LINKS`
    - `TECH_ARCHITECTURE`
    - `RESPONSIVE_BREAKPOINTS`
    - `THEME_CONFIG`
    - `ANIMATION_CONFIG`
  - 代码搜索：
    - 生产代码实际直接使用的是 `@/config/paths/site-config` 下的 `SITE_CONFIG`
    - `src/lib/site-config.ts` 的消费面当前基本集中在 `src/lib/__tests__/site-config.test.ts`
- 影响：
  - 这会让人误以为 `src/lib/site-config.ts` 是项目常量统一入口，但真实生产链路并不依赖它。
  - 这类“测试保活的配置镜像层”特别容易在改配置时形成双份认知和双份维护。
- 建议修复：
  - 如果这些常量确实不在生产链路，就不要继续保留为正式库入口。
  - 要么删除并合并测试目标，要么给出真实生产消费方，否则它就是一个误导层。
- 验收命令：
  - `rg -n 'PROJECT_STATS|PROJECT_LINKS|TECH_ARCHITECTURE|RESPONSIVE_BREAKPOINTS|THEME_CONFIG|ANIMATION_CONFIG' src tests`
  - `pnpm test -- src/lib/__tests__/site-config.test.ts`
- 状态：✅ 已修复（2026-03-09，Wave C）
  - 修复点：`src/lib/site-config.ts` 与对应测试已删除。

#### CR-045 `types/index.ts` 作为正式类型总入口，却直接导出测试专用类型与工具函数
- 优先级：P3
- 标签：DEV/MAINTAINABILITY/TYPES
- 证据：
  - `src/types/index.ts`
    - 在“统一入口”里直接导出 `@/types/test-types` 的函数与类型
    - 包括 `isMockDOMElement`、`isMockKeyboardEvent`、`MockDOMElement`、`MockKeyboardEvent` 等测试专用符号
  - 代码搜索：
    - `rg -n 'from \"@/types\"' src tests`
    - 当前命中的消费方几乎只有测试：`src/lib/__tests__/colors.test.ts`
- 影响：
  - 生产命名空间 `@/types` 被测试专用类型污染，会误导后续开发者把测试辅助类型当作正式公共 API。
  - 即使现在生产代码没滥用，它也在扩大错误的默认入口。
- 建议修复：
  - 不要从正式类型总入口导出测试类型与测试工具。
  - 将 `@/types/test-types` 仅留给测试代码显式引用，避免继续污染公共 barrel。
- 验收命令：
  - `rg -n 'from \"@/types\"' src tests`
  - `rg -n '@/types/test-types' src tests`
- 状态：✅ 已修复（2026-03-09，Wave C）
  - 修复点：`src/types/index.ts` 已删除，测试专用类型不再通过正式总入口暴露。

#### CR-046 多个 i18n 质量/locale 辅助模块当前更像测试或离线分析工具，却仍驻留在 `src/lib/` 生产命名空间
- 优先级：P3
- 标签：DEV/MAINTAINABILITY/I18N
- 证据：
  - `src/lib/translation-benchmarks.ts`
  - `src/lib/translation-validators.ts`
  - `src/lib/translation-quality-types.ts`
  - `src/lib/locale-constants.ts`
  - 代码搜索显示：
    - `translation-benchmarks` / `translation-validators` 的消费面基本集中在 `src/lib/__tests__/**`
    - `locale-constants.ts` 当前基本没有实际引用
- 影响：
  - 这些模块继续待在 `src/lib/` 会让维护者误以为它们属于生产运行时依赖，而不是测试/分析/预备功能。
  - 与前面几类“被测试保活的遗留层”叠加后，会进一步稀释 `src/lib/` 作为生产真相源的可信度。
- 建议修复：
  - 若它们主要服务测试、离线分析或未来计划，迁到更准确的命名空间（例如 `src/test/`、`scripts/`、`tools/` 或专门的 i18n-audit 模块）。
  - 对 `locale-constants.ts` 这类零引用文件，优先删除或明确接入真实使用方。
- 验收命令：
  - `rg -n 'translation-benchmarks|translation-validators|translation-quality-types|locale-constants' src tests`
- 状态：✅ 已修复（2026-03-09，Wave C）
  - 修复点：`translation-benchmarks.ts`、`translation-quality-types.ts`、`translation-validators.ts` 已删除；`locale-constants.ts` 保留为真实生产类型常量模块。

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

## Round 3 复审新增问题（历史注记）

Round 3 复审阶段新增的 `CR-023` ~ `CR-026` 已在 Round 4 的 Wave A / Wave B 中全部关闭。

- `CR-023`、`CR-024`：已在 Wave A 完成协议统一
- `CR-025`、`CR-026`：已在 Wave B 完成测试与门禁信号修复

修复后的最终状态、修复点与验收方式，以上方正式问题条目为准；这里不再重复保留修复前长篇证据，避免同一问题在文件中出现两份历史快照。
