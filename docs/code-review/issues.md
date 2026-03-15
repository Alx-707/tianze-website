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

#### CR-047 `pnpm lint:check` 当前会扫描 `.agents/skills/**` 等 repo-local agent 目录，导致门禁信号失真
- 优先级：P2
- 标签：DEV/CI
- 审查链路：tooling / gate signal chain
- 证据：
  - `eslint.config.mjs:1034-1056` 的全局 ignore 仅排除了 `.claude/skills/**`，未排除仓库根目录实际存在的 `.agents/skills/**`。
  - 本轮执行 `pnpm lint:check` 时，失败条目主要来自 `.agents/skills/debugging/**`、`.agents/skills/react-components/**`、`.agents/skills/style-extractor/**` 等非项目生产代码。
- 影响：
  - 本地 `lint:check` / `ci:local:quick` 不再稳定代表项目代码质量，而会被 repo-local agent 资产或用户工作目录噪音打穿。
  - lint 信号失真会削弱 Round 4 已经收紧的 gate 可信度，导致“红灯不一定是项目问题”重新出现。
- 建议修复：
  - 将 ESLint ignore 与项目真实作用域对齐，至少补齐 `.agents/**`、`.agent/**`、`.continue/**`、`.factory/**`、`.kiro/**` 这类 repo-local 工作目录。
  - 或者反向收口：让 `lint:check`/`quality-gate` 只对明确的项目代码路径生效（如 `src/`、`tests/`、`scripts/`、配置入口文件），避免工作台文件进入 gate。
  - `scripts/ci-local.sh` 与 `scripts/quality-gate.js` 的 lint 口径应保持一致，防止“本地/聚合门禁”再次双轨。
- 验收命令：
  - `pnpm lint:check`
  - `pnpm ci:local:quick`
- 状态：🆕 新发现（2026-03-11，delta review）

#### CR-048 共享 `safeParseJson()` 路径未限制 body size，多个公开 JSON 端点重新暴露资源消耗面
- 优先级：P1
- 标签：PROD/SECURITY/API
- 审查链路：inquiry/contact/API/security chain
- 证据：
  - 共享 helper `src/lib/api/safe-parse-json.ts:23-49` 直接 `await req.json()`，没有 `Content-Length` 早拒绝或字节级兜底。
  - 多个公开 JSON 入口直接走这条链：
    - `src/app/api/contact/route.ts:48-50`
    - `src/app/api/inquiry/route.ts:124-127`
    - `src/app/api/verify-turnstile/route.ts:129-132`
    - `src/app/api/whatsapp/send/route.ts:293-295`
    - `src/app/api/subscribe/route.ts:22-26`（通过 wrapper 复用同一 helper）
  - 对比之下，`/api/csp-report` 与 `/api/whatsapp/webhook` 已在历史审查中补齐了请求体大小防护，说明仓库已经接受“公开写接口需要 body size gate”这一安全前提。
- 影响：
  - 攻击者或异常客户端可以在这些公开写接口上提交超大 JSON，请求会在进入业务校验前就触发整包解析，增加内存/CPU 消耗面。
  - 问题位于共享 helper，新路由继续复用 `safeParseJson()` 时会继承同样的风险。
- 建议修复：
  - 在 `safeParseJson()` 中增加可配置 `maxBytes`，统一做 `content-length` 早拒绝 + 读取后字节级兜底。
  - 给公开写接口设默认阈值；对 webhook / report 这类特殊端点保留单独阈值。
  - 为 `contact` / `inquiry` / `verify-turnstile` / `subscribe` / `whatsapp/send` 增加超大 body 回归测试。
- 验收命令：
  - `pnpm test -- src/app/api/contact/__tests__/route-post.test.ts src/app/api/inquiry/__tests__/route.test.ts src/app/api/verify-turnstile/__tests__/route.test.ts src/app/api/whatsapp/send/__tests__/route.test.ts tests/integration/api/subscribe.test.ts`
- 状态：🆕 新发现（2026-03-11，delta review）

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

## 2026-03-11 Delta Review 新增问题

### Stability（工程可复现性 / gate 信号可信度）

#### CR-047 `pnpm lint:check` 会被仓库根目录的本地 agent/skill 资产污染，当前已不是纯项目代码 gate
- 优先级：P2
- 标签：DEV/CI
- review chain：tooling/gate integrity chain
- 证据：
  - 当前执行 `pnpm lint:check` 失败，报错文件集中在 `.agents/skills/**`（例如 `.agents/skills/debugging/**`、`.agents/skills/react-components/**`、`.agents/skills/style-extractor/**`）。
  - `.gitignore:36` 已忽略 `.agents/`，说明这类目录属于本地 agent 资产，而不是项目生产代码真相源。
  - `eslint.config.mjs` 的 global ignores 仅排除了 `.claude/skills/**`，未排除 `.agents/**`、`skills/**`、`.continue/**`、`.kiro/**`、`.factory/**` 等同类本地目录。
- 影响：
  - `pnpm lint:check` 当前会被本地工具/agent 目录的内容污染，不再是“项目代码是否健康”的可靠信号。
  - 新环境或不同协作工具组合下，开发者可能在未改动 `src/**` 的情况下被 gate 阻断，降低 `ci:local` / 本地排障的可信度。
  - 这类噪音会掩盖真正的应用层 lint regressions。
- 建议修复：
  - 在 `eslint.config.mjs` 的 global ignores 中补齐本地 agent/tooling 目录：至少 `.agents/**`、`skills/**`、`.continue/**`、`.kiro/**`、`.factory/**`、`.agent/**`。
  - 或者将 `lint:check` 收窄到项目代码边界（例如 `src/ tests/ scripts/`），避免扫描工作区级辅助资产。
  - 修复后重新确认 `pnpm lint:check` 恢复为项目代码 gate，而不是工作区噪音 gate。
- 验收命令：
  - `pnpm lint:check`
- 状态：❌ 未修复（2026-03-11）
  - 修复点：
    - `eslint.config.mjs` 已补齐 `.agent/**`、`.agents/**`、`.continue/**`、`.factory/**`、`.kiro/**`、`skills/**`、`skills-lock.json` 等 repo-local 工作目录忽略规则
  - 验收：
    - `pnpm lint:check`
    - `pnpm ci:local:quick`
    - `pnpm quality:gate:full`
- 状态：✅ 已修复（2026-03-11，repair phase）

#### CR-052 `/api/inquiry` 仍无幂等保护，但它既是主询盘写路径，又显式暴露了 `Idempotency-Key` 契约
- 优先级：P1
- 标签：PROD
- review chain：inquiry conversion chain
- 证据：
  - `src/app/api/inquiry/route.ts` 当前只有 `withRateLimit("inquiry", ...)`，没有 `withIdempotency(...)` 包裹。
  - `src/components/products/product-inquiry-form.tsx:308-316` 调用 `/api/inquiry` 时只发 `Content-Type`，没有生成或发送 `Idempotency-Key`。
  - `src/config/cors.ts:141` 将 `Idempotency-Key` 列入 allowed headers。
  - `src/app/api/inquiry/__tests__/route.test.ts:72` 的预检测试同样把 `Access-Control-Allow-Headers` 断言为包含 `Idempotency-Key`。
  - 对比：`src/app/api/subscribe/route.ts` 已使用 `withIdempotency(..., { required: true })`，newsletter 主路径已形成幂等闭环。
- 影响：
  - 询盘是当前项目的主业务写路径，用户重复点击、前端重试、网络层重放都可能造成重复线索、重复邮件或重复 Airtable 记录。
  - 当前接口对外宣告了 `Idempotency-Key` header 能力，但服务端和客户端都没有真正落实，属于契约漂移。
  - 这会让“主询盘链”反而比 newsletter 这条次级写路径更脆弱。
- 建议修复：
  - 服务端：对 `/api/inquiry` 引入 `withIdempotency`，至少做到“同 key 同端点只处理一次”。
  - 客户端：在 `product-inquiry-form` 中生成并复用 `Idempotency-Key`，与 newsletter 的做法对齐。
  - 补回归测试：验证重复请求命中缓存、跨端点复用 key 被拒绝、同一次提交的重试不会重复落库。
- 验收命令：
  - `pnpm test -- src/app/api/inquiry/__tests__/route.test.ts`
  - `pnpm test -- src/app/api/inquiry/__tests__/inquiry-integration.test.ts`
  - `pnpm test -- src/components/products/__tests__/product-inquiry-form.test.tsx`
- 状态：❌ 未修复（2026-03-11）
  - 修复点：
    - `/api/inquiry` 已接入 `withIdempotency(request, ..., { required: true })`
    - `product-inquiry-form` 已生成并发送 `Idempotency-Key`，成功后清空，失败/重试时复用
    - route / integration / component 定向测试已补齐
  - 验收：
    - `pnpm exec vitest run src/app/api/inquiry/__tests__/route.test.ts`
    - `pnpm exec vitest run src/app/api/inquiry/__tests__/inquiry-integration.test.ts`
    - `pnpm exec vitest run src/components/products/__tests__/product-inquiry-form.test.tsx`
- 状态：✅ 已修复（2026-03-11，repair phase）

### Maintainability（真相源 / 耦合 / 演进性）

#### CR-049 i18n 运行时仍处于 split + flat 双真相源模式，且生产态消息加载先走自我 HTTP 再回退文件系统
- 优先级：P2
- 标签：PROD/TECHDEBT/I18N
- review chain：locale/runtime entry chain
- 证据：
  - 修复前：`src/lib/load-messages.ts` 的生产态主路径优先自我 HTTP fetch，再回退到 `public/messages` 和 `messages` 文件系统读取。
  - 修复前：`src/i18n/request.ts` 的 fallback response 仍直接导入 flat `messages/${locale}.json`。
  - `docs/plans/2026-03-03-security-architecture-remediation/task-017-i18n-canonical-format.md` 已把这组 split/flat 并存明确标记为 drift 源，但当前主仓库尚未收敛。
- 影响：
  - 主运行时链和 fallback 链仍然依赖两套不同格式的消息源，继续放大“哪份文件才是真相源”的维护成本。
  - 生产态消息加载先依赖对外可访问的 base URL；若 ingress、域名或平台网络路径异常，会先经历失败 fetch + error log，再落到文件系统回退，增加噪音和隐式性能开销。
  - 这类问题在 happy path 下不一定暴露，但一旦进入 fallback/异常链，行为就容易与主链不一致。
- 建议修复：
  - 收敛单一 canonical：以 split (`messages/{locale}/{critical,deferred}.json`) 为唯一手工维护源，flat 仅保留为生成物或彻底退出运行时。
  - 让 `src/i18n/request.ts` 的 fallback 也从 split 聚合结果构造，而不是回退到 flat `messages/{locale}.json`。
  - 重新评估 `load-messages.ts` 的生产态“先自我 HTTP、后文件系统”策略；如果自我 HTTP 不是强需求，应优先使用本地可用源，避免把 i18n 主链耦合到外网可达性。
- 验收命令：
  - `pnpm validate:translations`
  - `pnpm i18n:validate:code`
  - `pnpm build`
  - `pnpm build:cf`
- 状态：✅ 已修复（2026-03-11，runtime refactor）
  - 修复点：
    - `src/lib/load-messages.ts` 已改为 split-only runtime source，运行时不再依赖 self-HTTP fetch、文件系统 fallback 或 flat root 文件。
    - `src/i18n/request.ts` 的 fallback 已改为复用 split source 聚合结果，不再 `import('../../messages/${locale}.json')`。
    - active locale/runtime request path 已收回到单一 split runtime source；flat 文件暂时仅保留给现有脚本/测试兼容。
  - 验收：
    - `pnpm exec vitest run src/lib/__tests__/load-messages.fallback.test.ts src/i18n/__tests__/request.test.ts`
    - `pnpm validate:translations`
    - `pnpm i18n:validate:code`
    - `pnpm build`
    - `pnpm build:cf`

### Security / Abuse Resistance

#### CR-050 共享 JSON 解析入口 `safeParseJson()` 未做 body size gate，多个公开 JSON 端点仍可无上限读取请求体
- 优先级：P1
- 标签：PROD/SECURITY
- review chain：API contract chain
- 证据：
  - `src/lib/api/safe-parse-json.ts:23-49` 直接 `await req.json()`，没有 `Content-Length` 早拒绝或字节级兜底上限。
  - 该 helper 当前被多个路由复用：
    - `src/app/api/contact/route.ts:47-55`
    - `src/app/api/inquiry/route.ts:123-133`
    - `src/app/api/subscribe/route.ts:77-91`
    - `src/app/api/verify-turnstile/route.ts:129-138`
    - `src/app/api/whatsapp/send/route.ts:293-300`
  - 对比：`/api/csp-report` 与 `/api/whatsapp/webhook` 已各自补过 body size 上限，但共享 JSON 主路径尚未收口。
- 影响：
  - 当前多个公开 JSON 写接口仍会在没有 body size gate 的情况下直接解析完整请求体，增加资源消耗面。
  - 这会让“端点级修补”继续存在，系统对 body size 的防护取决于路由作者是否记得单独补丁，无法形成统一边界。
  - 一旦未来新增 JSON 端点继续复用 `safeParseJson()`，相同问题会被批量复制。
- 建议修复：
  - 在 `safeParseJson()` 增加统一 body size gate：优先检查 `Content-Length`，读取后再做字节级兜底校验。
  - 允许路由按需传入上限配置（例如公共表单接口较小、受保护后台接口可稍大），但默认值必须安全。
  - 为共享 helper 补回归测试：超限 body、伪造过小 `Content-Length`、多字节字符场景。
- 验收命令：
  - `pnpm test -- src/app/api/contact/__tests__/route.test.ts`
  - `pnpm test -- src/app/api/inquiry/__tests__/route.test.ts`
  - `pnpm test -- src/app/api/verify-turnstile/__tests__/route.test.ts`
  - `pnpm test -- tests/integration/api/subscribe.test.ts`
- 状态：❌ 未修复（2026-03-11）
  - 修复点：
    - `safeParseJson()` 已增加共享 body size gate（`Content-Length` 早拒绝 + 读后字节级兜底）
    - `contact` / `inquiry` / `subscribe` / `verify-turnstile` / `whatsapp/send` 已统一消费 `statusCode`
    - 413 回归测试已补齐到对应路由/集成测试
  - 验收：
    - `pnpm exec vitest run src/app/api/contact/__tests__/route-post.test.ts`
    - `pnpm exec vitest run src/app/api/inquiry/__tests__/route.test.ts`
    - `pnpm exec vitest run src/app/api/verify-turnstile/__tests__/route.test.ts`
    - `pnpm exec vitest run src/app/api/whatsapp/send/__tests__/route.test.ts`
    - `pnpm exec vitest run tests/integration/api/subscribe.test.ts`
- 状态：✅ 已修复（2026-03-11，repair phase）

### Product / i18n Correctness

#### CR-051 contact Server Action 在非校验失败路径仍返回英文 detail 文案，前端会原样渲染到多语言 UI
- 优先级：P2
- 标签：PROD/I18N
- review chain：inquiry conversion chain
- 证据：
  - `src/lib/actions/contact.ts:93-99`、`106-112` 在 submission expired 场景返回 `details: ["Please refresh the page and try again"]`。
  - `src/lib/actions/contact.ts:118-124` 在 Turnstile 验证失败场景返回 `details: ["Please complete the security check"]`。
  - `src/components/forms/contact-form-container.tsx:212-214` 仅对以 `errors.` 开头的 detail 做翻译，其余 detail 直接原样显示。
- 影响：
  - 中文或其它 locale 用户在部分失败路径下会看到英文 detail bullet，形成混合语言 UI。
  - 当前 API/message 主路径已经收敛到 `errorCode`，但 Server Action 这条主联系表单路径仍残留自由文本 detail，属于协议一致性回退。
  - 这会让 i18n gate 看起来是绿的，但真实用户在异常链上仍可能拿到错误语言。
- 建议修复：
  - 将这些 detail 改成稳定的翻译 key，而不是英文句子。
  - 或者彻底避免在这类非字段级错误里返回自由文本 detail，只返回稳定 `errorCode` 并由前端统一翻译。
  - 补定向回归：中文 locale 下的过期提交 / Turnstile 失败应只显示中文错误。
- 验收命令：
  - `pnpm test -- src/components/forms/__tests__/contact-form-submission.test.tsx`
  - `pnpm test -- tests/integration/api/contact.test.ts`
- 状态：❌ 未修复（2026-03-11）
  - 修复点：
    - `contactFormAction` 对 submission expired / Turnstile 失败不再下发英文 `details`
  - `contact-form-container` 定向测试已验证错误码路径不会再渲染原始英文 bullet
  - 验收：
    - `pnpm exec vitest run src/components/forms/__tests__/contact-form-container.test.tsx`
- 状态：✅ 已修复（2026-03-11，repair phase）

## 2026-03-13 Wave 1 新增问题

### Business Write Paths（数据不变量 / 并发时序 / 异常路径语义）

#### CR-053 contact 提交链将合成 `referenceId` 伪装成 `emailMessageId` / `airtableRecordId`
- 优先级：P1
- 标签：PROD/DATA/CONTRACT
- review chain：contact submission chain
- 证据：
  - `src/lib/contact-form-processing.ts:54-60` 在 `result.success` 时，将同一个 `result.referenceId` 同时赋值给 `emailMessageId` 和 `airtableRecordId`。
  - `src/app/api/contact/route.ts:81-84` 把这两个字段作为 `messageId` / `recordId` 返回给调用方。
  - 当前 contact 相关测试大多 mock `processFormSubmission()` 直接返回真实风格的 `msg-*` / `rec-*` 值，因此没有覆盖到真实实现的映射语义。
- 影响：
  - 该链路对外暴露的是“看起来像下游服务真实 ID”的字段，但实际承载的是内部合成的 lead reference。
  - 任何调试流程、日志分析或未来调用方若信任 `messageId` / `recordId` 语义，都会读到错误数据。
  - 这是数据不变量和接口语义同时失真，不是纯命名问题。
- 建议修复：
  - 若当前只有 `referenceId` 可用，就显式返回 `referenceId`，不要伪装成下游 provider ID。
  - 若需要 provider-specific ID，则扩展 lead pipeline / service result，把真实 `emailMessageId` 与 `airtableRecordId` 贯通到 contact 返回值。
  - 补一条不 mock `processFormSubmission()` 映射层语义的定向测试，防止再次回归。
- 验收命令：
  - `pnpm test -- src/app/api/contact/__tests__/contact-api-validation.test.ts`
  - `pnpm test -- src/app/api/contact/__tests__/route-post.test.ts`
- 状态：❌ 未修复（2026-03-13，Wave 1）
  - 修复点：
    - `contact-form-processing.ts` 不再伪造 `emailMessageId` / `airtableRecordId`，统一返回 `referenceId`
    - `contact` Server Action 与 `/api/contact` 成功响应已对齐到 `referenceId`
    - contact 链定向测试已改为断言 `referenceId`，不再保活错误的 provider-ID 语义
  - 验收：
    - `pnpm exec vitest run src/app/api/contact/__tests__/contact-api-validation.test.ts`
    - `pnpm exec vitest run src/app/api/contact/__tests__/route-post.test.ts`
    - `pnpm exec vitest run src/app/api/contact/__tests__/route.test.ts`
    - `pnpm exec vitest run src/app/__tests__/actions.test.ts src/app/__tests__/contact-integration.test.ts tests/integration/api/contact.test.ts`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-054 contact 主提交链缺少幂等保护，重复提交会产生重复副作用
- 优先级：P1
- 标签：PROD/CONCURRENCY
- review chain：contact submission chain
- 证据：
  - `src/lib/actions/contact.ts:176-245` 只做 rate limit + honeypot，再直接进入 `processFormSubmission()`。
  - `src/app/api/contact/route.ts:39-84` 只使用 `withRateLimit("contact", ...)`，没有 `withIdempotency(...)`。
  - `src/lib/contact-form-processing.ts:52-69` 会进入统一 lead pipeline，产生 CRM 记录与邮件发送等副作用。
  - 对比：`/api/inquiry` 与 `/api/subscribe` 已显式引入 `withIdempotency(..., { required: true })`，contact 路径没有对应保护。
- 影响：
  - 浏览器重试、网络层重放或用户双击提交，都可能在 contact 主路径上产生重复记录和重复通知。
  - rate limit 只能限制频率，不能保证“同一次业务提交只处理一次”。
  - 这让 contact 这条核心写路径在并发/重试语义上比 inquiry / subscribe 更脆弱。
- 建议修复：
  - 为 contact 路径补齐幂等契约：API route 侧可直接引入 `withIdempotency`；Server Action 路径需要配套的 tokenized dedupe 方案。
  - 前端提交链需要能生成并复用同一次提交的幂等 key。
  - 补定向回归：重复提交应命中缓存/去重，而不是二次落库。
- 验收命令：
  - `pnpm test -- src/app/__tests__/contact-integration.test.ts`
  - `pnpm test -- tests/integration/api/contact.test.ts`
- 状态：❌ 未修复（2026-03-13，Wave 1）
  - 修复点：
    - `/api/contact` 已强制 `Idempotency-Key`，并通过 `withIdempotency(..., { required: true })` 缓存成功结果
    - `contactFormAction` 已接入 `withIdempotentResult()`，主 Server Action 链不再缺少幂等保护
    - `contact-form-container.tsx` 已生成并复用 `idempotencyKey` 表单字段，成功后清空
    - 测试隔离已补 `resetIdempotencyState()`，避免跨用例残留已完成 key
  - 验收：
    - `pnpm exec vitest run src/app/api/contact/__tests__/route-post.test.ts`
    - `pnpm exec vitest run src/app/api/contact/__tests__/route.test.ts`
    - `pnpm exec vitest run src/app/__tests__/actions.test.ts src/app/__tests__/contact-integration.test.ts`
    - `pnpm exec vitest run tests/integration/api/contact.test.ts`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-055 contact 前端 cooldown 在服务端接受前就启动，失败提交也会锁住用户
- 优先级：P2
- 标签：PROD/UX
- review chain：contact submission chain
- 证据：
  - `src/components/forms/contact-form-container.tsx:169-181` 在调用 `formAction(formData)` 之前就执行 `recordSubmission()`。
  - `src/components/forms/use-rate-limit.ts:27-77` 仅根据本地时间戳推导 `isRateLimited`，与服务端实际成功/失败无关。
  - `src/components/forms/contact-form-container.tsx:408-445` 在 `isRateLimited` 为真时直接禁用提交按钮并显示 cooldown 文案。
  - 当前测试只覆盖“成功提交后进入 cooldown”，没有覆盖“失败提交不应进入 cooldown”。
- 影响：
  - 表单校验失败、Turnstile 失败或临时服务错误都可能让真实用户在本地被锁住整个 cooldown 窗口。
  - 这把异常路径重试变成了对合法用户的本地拒绝服务。
- 建议修复：
  - 只在服务端确认成功后再记录 cooldown，或者显式区分“attempted” 与 “accepted” 两种状态。
  - 补失败路径回归测试：失败提交不应触发 cooldown 提示，也不应禁用提交按钮。
- 验收命令：
  - `pnpm test -- src/components/forms/__tests__/contact-form-submission.test.tsx`
  - `pnpm test -- src/components/forms/__tests__/contact-form-container.test.tsx`
- 状态：❌ 未修复（2026-03-13，Wave 1）
  - 修复点：
    - `contact-form-container.tsx` 已移除提交前的 `recordSubmission()`，cooldown 只在成功状态 effect 中通过 `setLastSubmissionTime()` 启动
    - `contact-form-submission.test.tsx` 已补“成功才启动 cooldown / 失败不启动 cooldown”回归覆盖
  - 验收：
    - `pnpm exec vitest run src/components/forms/__tests__/contact-form-submission.test.tsx`
    - `pnpm exec vitest run src/components/forms/__tests__/contact-form-container.test.tsx`
- 状态：✅ 已修复（2026-03-13，repair phase）

## 2026-03-13 Wave 2 新增问题

### Runtime / i18n / Single Source of Truth

#### CR-056 `src/i18n/request.ts` 仍从过期的 `TranslationCache` 推导 `cacheUsed`，运行时指标语义已与真实消息链脱钩
- 优先级：P2
- 标签：PROD/I18N/TECHDEBT
- review chain：locale/runtime entry chain
- 证据：
  - `src/i18n/request.ts:52-63` 通过 `TranslationCache.getInstance().get("messages-${locale}-critical")` 推导 `cacheUsed`，并据此记录 cache hit/miss。
  - `src/i18n/request.ts:148-156` 当前真实运行时消息链已经走 `loadCompleteMessages(locale)`。
  - `src/lib/i18n-performance.ts:111-140` 才会写入 `messages-${locale}-critical` 这条 cache key，但这是一条 fetch-based performance helper 路径，不是当前 runtime canonical message loader。
  - 全仓搜索显示 `getCachedMessages` / `getCachedTranslations` / `preloadTranslations` 已无明确生产消费方，主要剩测试和注释在保活这套路径；注释里提到的 `translation-preloader.tsx` 也不在当前生产代码中。
- 影响：
  - `metadata.cacheUsed` 与 request-time cache hit/miss 统计已不再反映真实运行时消息加载行为。
  - 当前 request 配置层仍依赖一条与 canonical runtime source 分离的旧 cache seam，形成单一真相源漂移。
  - 这类问题不会立刻打挂页面，但会让调试与性能判断信号失真，未来继续误导维护者。
- 建议修复：
  - 让 `src/i18n/request.ts` 停止从 `TranslationCache` 推导 runtime `cacheUsed`，除非能证明它就是 canonical loader 的真实缓存来源。
  - 若无法可靠判断 runtime cache hit，优先去掉或降级该 metadata，而不是继续输出伪精确布尔值。
  - 重新审视 `src/lib/i18n-performance.ts` 中 fetch-based cache helper 的生产引用面；若主要靠测试保活，应明确降级为 test/dev helper 或进一步收口。
- 验收命令：
  - `pnpm exec vitest run src/i18n/__tests__/request.test.ts`
  - `pnpm exec vitest run src/lib/__tests__/load-messages.fallback.test.ts`
- 状态：❌ 未修复（2026-03-13，Wave 2）
  - 修复点：
    - `src/i18n/request.ts` 已移除对 `TranslationCache` 的 runtime `cacheUsed` 推导
    - request 层现在只记录 load time，不再从过期 cache seam 伪报命中语义
    - 成功路径 metadata 统一回到保守值 `cacheUsed: false`
  - 验收：
    - `pnpm exec vitest run src/i18n/__tests__/request.test.ts`
    - `pnpm exec vitest run src/lib/__tests__/load-messages.fallback.test.ts`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-057 `src/lib/i18n-performance.ts` 仍保留 fetch-based translation helper 这条近乎失活的旧链路，继续放大 runtime 真相源误导
- 优先级：P2
- 标签：PROD/I18N/TECHDEBT
- review chain：locale/runtime entry chain
- 证据：
  - 全仓引用搜索显示 `getCachedMessages` / `getCachedTranslations` / `preloadTranslations` 目前几乎只出现在测试中，以及之前已收敛掉的 `request.ts` 旧 seam 上。
  - `src/lib/i18n-performance.ts:110` 的注释仍声称该模块被客户端组件 `translation-preloader.tsx` 使用，但当前生产代码中不存在这个组件。
  - 当前剩余的生产引用主要是 `I18nPerformanceMonitor` 这一监控类（如 `src/i18n/request.ts`、`src/lib/structured-data.ts`、`src/lib/structured-data-helpers.ts`），而不是 fetch-based 取消息 helper 本身。
- 影响：
  - 仓库里仍存在一套看起来像“生产消息加载方案”的 fetch-based helper 链，但它已不再是 canonical runtime source。
  - 这会误导后续维护者继续在一条近乎失活的旧链路上加逻辑，重新制造 split brain i18n truth source。
  - 结合 `CR-056`，这说明 Wave 2 不是单点指标问题，而是 runtime i18n 旧 helper 仍在名义上占据正式命名空间。
- 建议修复：
  - 明确给 `src/lib/i18n-performance.ts` 降级：保留监控职责时，应拆掉或隔离 fetch-based message helper；若 helper 仅供测试/实验使用，应迁出正式 runtime 命名空间。
  - 更新过期注释，删除对不存在组件（如 `translation-preloader.tsx`）的引用。
  - 重新定义该模块的生产边界，避免未来再被当成 active runtime loader 扩展。
- 验收命令：
  - `pnpm exec vitest run src/lib/__tests__/i18n-performance.test.ts`
  - `pnpm exec vitest run src/i18n/__tests__/request.test.ts`
- 状态：❌ 未修复（2026-03-13，Wave 2）
  - 修复点：
    - `src/lib/i18n-performance.ts` 已收敛为监控/评分职责
    - fetch-based translation helper 已拆到 `src/lib/i18n-message-cache.ts`
    - 相关测试已改为显式依赖新 helper 模块，而不是继续保活旧 runtime namespace
  - 验收：
    - `pnpm exec vitest run src/lib/__tests__/i18n-performance.test.ts`
    - `pnpm exec vitest run src/lib/__tests__/i18n-performance.network-failure.test.ts src/lib/__tests__/i18n-performance-cache.test.ts`
    - `pnpm exec vitest run src/i18n/__tests__/request.test.ts`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-058 `src/middleware.ts` 对显式 locale 请求保留了只为补 cookie 的 early return，旁路 canonical `next-intl` 路径
- 优先级：P2
- 标签：PROD/I18N/TECHDEBT
- review chain：locale/runtime entry chain
- 证据：
  - 修复前：`src/middleware.ts` 的 `tryHandleExplicitLocalizedRequest()` 在 locale path 与现有 cookie 不一致时直接 `NextResponse.next()` 并提前返回。
  - 同文件后半段对 `intlMiddleware(request)` 的正常分支里，已经有相同的 `locale && existingLocale !== locale -> setLocaleCookie(response, locale)` 逻辑。
  - 这意味着显式 locale 请求会为“同步 cookie”这一个目的绕开 canonical `next-intl` 运行路径。
- 影响：
  - locale/runtime 入口在显式 locale 请求上被拆成两条分支，增加未来修 locale 行为时只改一边的风险。
  - 这类重复分支会重新制造 Wave 2 正在清理的 split truth source / split runtime path 问题。
- 建议修复：
  - 删除显式 locale 的 early return，让请求始终经过 `intlMiddleware(request)`。
  - 继续在共享后置逻辑中统一补 locale cookie 和安全头，保持单一路径。
  - 补单测确认：显式 locale 请求仍能设置 cookie，但不会旁路 `next-intl` middleware。
- 验收命令：
  - `pnpm exec vitest run tests/unit/middleware.test.ts`
  - `pnpm exec vitest run src/__tests__/middleware-locale-cookie.test.ts`
- 状态：❌ 未修复（2026-03-13，Wave 2）
  - 修复点：
    - `src/middleware.ts` 已移除显式 locale 的 early return 分支
    - 显式 locale 请求现在统一经过 `intlMiddleware(request)`，再由共享后置逻辑补 cookie / 安全头
    - middleware 单测已更新为符合 `createMiddleware()` 工厂形态的 mock，并验证不再旁路 canonical path
  - 验收：
    - `pnpm exec vitest run tests/unit/middleware.test.ts`
    - `pnpm exec vitest run src/__tests__/middleware-locale-cookie.test.ts`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-060 `src/lib/i18n/route-parsing.ts` 仍硬编码 `en|zh`，与 `routing-config` 的 locale 列表形成第二真相源
- 优先级：P2
- 标签：PROD/I18N/TECHDEBT
- review chain：locale/runtime entry chain
- 证据：
  - 修复前：`src/lib/i18n/route-parsing.ts` 中 `LOCALE_PREFIX_RE` 直接写死为 `^\/(en|zh)(?=\/|$)`。
  - 同时，实际 locale 真相源已在 `src/i18n/routing-config.ts` 的 `routing.locales` 中维护。
  - `src/components/language-toggle.tsx` 通过 `parsePathnameForLink()` 消费这条路径解析逻辑，因此这不是纯测试代码。
- 影响：
  - 一旦后续调整 locale 列表，路径解析层可能和 routing config 脱节，导致语言切换或链接构造出现局部失效。
  - 这类问题属于典型的单一真相源漂移，符合 Wave 2 正在收敛的 runtime/i18n 风险面。
- 建议修复：
  - 让 `LOCALE_PREFIX_RE` 由 `routing.locales` 派生，而不是手写字符串。
  - 保持现有 API 不变，只消除 locale 列表的重复声明。
- 验收命令：
  - `pnpm exec vitest run src/lib/i18n/__tests__/route-parsing.test.ts`
  - `pnpm exec vitest run src/components/__tests__/language-toggle.test.tsx`
- 状态：❌ 未修复（2026-03-13，Wave 2）
  - 修复点：
    - `LOCALE_PREFIX_RE` 已改为从 `routing.locales` 动态生成
    - `route-parsing.ts` 不再保留独立的 locale 硬编码列表
  - 验收：
    - `pnpm exec vitest run src/lib/i18n/__tests__/route-parsing.test.ts`
    - `pnpm exec vitest run src/components/__tests__/language-toggle.test.tsx`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-061 `src/i18n/request.ts` 在 `cacheUsed` 已失真后仍继续输出该 metadata 字段，形成空信号接口
- 优先级：P3
- 标签：PROD/I18N/TECHDEBT
- review chain：locale/runtime entry chain
- 证据：
  - `CR-056` 修复后，`src/i18n/request.ts` 已不再有可信依据判断 canonical runtime cache hit。
  - 全仓搜索显示 `cacheUsed` 已无真实生产消费者，主要剩 `src/i18n/__tests__/request.test.ts` 在断言其存在。
- 影响：
  - 保留一个没有真实语义支撑的字段，会继续误导后续维护者把它当成有效 runtime 信号。
  - 这会让 request metadata 接口比真实可观测信息更“宽”，形成空信号技术债。
- 建议修复：
  - 直接删除 `cacheUsed`，不要把它留作永远为 `false` 的占位字段。
  - 同步简化 request 测试对 metadata 结构的断言。
- 验收命令：
  - `pnpm exec vitest run src/i18n/__tests__/request.test.ts`
- 状态：❌ 未修复（2026-03-13，Wave 2）
  - 修复点：
    - `src/i18n/request.ts` 已删除 `cacheUsed` 字段
    - request 测试已改为断言精简后的 metadata 结构
  - 验收：
    - `pnpm exec vitest run src/i18n/__tests__/request.test.ts`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-062 `structured-data` 层仍单独声明 `Locale = "en" | "zh"`，与 `routing-config` 再次形成 locale 真相源分叉
- 优先级：P3
- 标签：PROD/I18N/TECHDEBT
- review chain：locale/runtime entry chain
- 证据：
  - 修复前：`src/lib/structured-data-types.ts` 仍定义 `export type Locale = "en" | "zh"`;
  - 同时，canonical locale source 已在 `src/i18n/routing-config.ts` 中维护。
  - `structured-data.ts` / `structured-data-helpers.ts` / locale layout structured-data 链都依赖这套类型，因此它不只是孤立 dead code。
- 影响：
  - 这让 structured-data 层再次成为 locale 列表的第二真相源。
  - 一旦未来 locale 扩展，这条链可能在类型层先于 runtime 配置发生漂移。
- 建议修复：
  - 让 `structured-data-types.ts` 复用 `routing-config` 的 `Locale` 类型，不再维护独立字面量联合。
- 验收命令：
  - `pnpm exec vitest run src/app/[locale]/__tests__/layout-structured-data.test.ts`
  - `pnpm exec vitest run src/lib/__tests__/structured-data.test.ts`
- 状态：❌ 未修复（2026-03-13，Wave 2）
  - 修复点：
    - `structured-data-types.ts` 已改为复用 `routing-config` 的 `Locale` 类型
  - 验收：
    - `pnpm exec vitest run src/app/[locale]/__tests__/layout-structured-data.test.ts`
    - `pnpm exec vitest run src/lib/__tests__/structured-data.test.ts`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-063 `src/lib/load-messages.ts` 仍单独声明 `Locale = "en" | "zh"`，继续在 runtime loader 层复制 locale 真相源
- 优先级：P3
- 标签：PROD/I18N/TECHDEBT
- review chain：locale/runtime entry chain
- 证据：
  - 修复前：`src/lib/load-messages.ts` 内仍有 `type Locale = "en" | "zh"`;
  - 同时，canonical locale source 已在 `src/i18n/routing-config.ts` 中维护，并通过 `src/i18n/routing.ts` 暴露。
  - `load-messages.ts` 属于当前 runtime canonical message loader，因此这里的重复类型声明比测试层更接近真实运行边界。
- 影响：
  - runtime loader 层继续复制 locale 列表，会让后续 locale 扩展在类型层先于运行配置发生漂移。
  - 这与 Wave 2 已修复的 `CR-060`、`CR-062` 属于同类单一真相源问题。
- 建议修复：
  - 让 `load-messages.ts` 直接复用 routing 层导出的 `Locale` 类型。
- 验收命令：
  - `pnpm exec vitest run src/lib/__tests__/load-messages.fallback.test.ts src/i18n/__tests__/request.test.ts`
- 状态：❌ 未修复（2026-03-13，Wave 2）
  - 修复点：
    - `load-messages.ts` 已改为导入 routing 层的 `Locale` 类型
  - 验收：
    - `pnpm exec vitest run src/lib/__tests__/load-messages.fallback.test.ts src/i18n/__tests__/request.test.ts`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-064 共享类型层仍在多处重复声明 `Locale = "en" | "zh"`，继续放大 locale 真相源扩散
- 优先级：P3
- 标签：PROD/I18N/TECHDEBT
- review chain：locale/runtime entry chain
- 证据：
  - 修复前仍有多处共享类型文件保留独立 locale union：
    - `src/config/paths/types.ts`
    - `src/types/content.types.ts`
    - `src/types/i18n.ts`
  - 这些文件都处于共享类型层，消费面覆盖 paths/content/i18n，属于更容易持续扩散的真相源复制点。
- 影响：
  - locale 列表继续在共享类型层横向扩散，会让未来 locale 扩展时产生多点同步成本和类型层漂移。
  - 这与 `CR-060`、`CR-062`、`CR-063` 属于同一类系统性问题。
- 建议修复：
  - 让这些共享类型文件全部复用 `routing-config` 的 canonical `Locale`。
- 验收命令：
  - `pnpm exec vitest run src/config/__tests__/paths.test.ts`
  - `pnpm exec vitest run src/lib/content/__tests__/products-source.test.ts src/lib/content/__tests__/products-wrapper.test.ts`
  - `pnpm exec vitest run tests/integration/i18n-components.test.tsx`
- 状态：❌ 未修复（2026-03-13，Wave 2）
  - 修复点：
    - `src/config/paths/types.ts`、`src/types/content.types.ts`、`src/types/i18n.ts` 已统一复用 canonical `Locale`
  - 验收：
    - `pnpm exec vitest run src/config/__tests__/paths.test.ts`
    - `pnpm exec vitest run src/lib/content/__tests__/products-source.test.ts src/lib/content/__tests__/products-wrapper.test.ts`
    - `pnpm exec vitest run tests/integration/i18n-components.test.tsx`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-065 `src/i18n/__tests__/request.test.ts` 仍在断言已删除字段，并受模块缓存影响而脱离真实实现
- 优先级：P2
- 标签：TEST/I18N
- review chain：verification and guardrails chain
- 证据：
  - 修复前的测试仍断言 `metadata.smartDetection`、`metadata.cacheUsed`、`metadata.timestamp` 等当前实现已不存在的字段。
  - 测试使用重复 `await import("../request")` 但未重置模块，后续 case 受模块缓存影响，并未可靠重新执行模块初始化。
  - 在实现已多次演进后，这组测试仍能全绿，说明断言目标与真实实现已经脱钩。
- 影响：
  - 这会给 request/runtime i18n 链提供错误的测试安全感。
  - 后续修改 `request.ts` 时，测试既可能放过真实回归，也可能为了不存在的旧语义阻碍正确重构。
- 建议修复：
  - 基于 `getRequestConfig` callback 重写测试入口，按 case 显式执行真实配置函数。
  - 删除对已删除字段和旧缓存语义的断言。
  - 用定向 mock 覆盖 fallback/error path，而不是保活已经不存在的旧行为。
- 验收命令：
  - `pnpm exec vitest run src/i18n/__tests__/request.test.ts`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - `request.test.ts` 已按真实 callback 执行路径重写
    - 旧字段与模块缓存伪覆盖问题已清除
  - 验收：
    - `pnpm exec vitest run src/i18n/__tests__/request.test.ts`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-066 `ResponsiveLayout` 仍保留只靠测试保活的 deprecated props，继续放大假兼容层
- 优先级：P2
- 标签：PROD/MAINTAINABILITY/TEST
- review chain：code quality and elegance chain
- 证据：
  - 生产代码搜索显示 `mobileLayout` / `tabletLayout` / `desktopLayout` / `mobileNavigation` / `tabletSidebar` / `desktopSidebar` / `onLayoutChange` 没有真实消费者，只有 `ResponsiveLayout` 自身和测试在引用。
  - `src/components/responsive-layout.tsx` 仍保留一整套 deprecated props 及其解析逻辑。
  - `src/components/__tests__/responsive-layout.test.tsx` 明确在保活这些 legacy props。
- 影响：
  - 正式组件 API 继续背着一层无生产消费者的兼容壳，会误导后续使用者并增加实现复杂度。
  - 这是典型的“测试把旧入口保活”问题。
- 建议修复：
  - 删除 deprecated props 和对应解析逻辑，只保留当前 slot API。
  - 同步收敛测试，停止把 legacy prop contract 当成产品真相。
- 验收命令：
  - `pnpm exec vitest run src/components/__tests__/responsive-layout.test.tsx`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - `ResponsiveLayout` 已删除 deprecated prop 层，只保留当前 API
    - 测试已改为断言当前正式 API，不再保活 legacy props
  - 验收：
    - `pnpm exec vitest run src/components/__tests__/responsive-layout.test.tsx`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-067 `TurnstileWidget` 仍保留只靠测试保活的 deprecated `onVerify` 回调兼容层
- 优先级：P2
- 标签：PROD/MAINTAINABILITY/TEST
- review chain：code quality and elegance chain
- 证据：
  - 生产代码搜索显示实际消费者都已使用 `onSuccess` / `onError` / `onExpire`，没有真实生产调用方再传 `onVerify`。
  - `src/components/security/turnstile.tsx` 仍保留 `onVerify` deprecated prop，并在成功与 dev bypass 路径里做 `onSuccess ?? onVerify` 回退。
  - 对应测试还在明确保活 `onVerify` 向后兼容行为。
- 影响：
  - 正式组件 API 持续暴露无真实消费者的旧回调，会误导后续使用者并增加实现复杂度。
  - 这与 `CR-066` 属于同类“测试保活旧入口”问题。
- 建议修复：
  - 删除 `onVerify` 和 `handlers.onVerify`，只保留当前 `onSuccess` 路径。
  - 同步收敛测试，不再把 deprecated callback 当成产品契约。
- 验收命令：
  - `pnpm exec vitest run src/components/security/__tests__/turnstile.test.tsx`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - `TurnstileWidget` 已删除 deprecated `onVerify` 路径
    - `useTurnstile` 已删除 `handlers.onVerify`
    - 测试已改为断言当前 `onSuccess` API
  - 验收：
    - `pnpm exec vitest run src/components/security/__tests__/turnstile.test.tsx`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-068 `footer-links.ts` 仍保留无任何消费者的 `WhatsAppStyleTokensLegacy`，继续放大假兼容配置面
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：code quality and elegance chain
- 证据：
  - `src/config/footer-links.ts` 仍声明 `WhatsAppStyleTokensLegacy` 并标注为 deprecated。
  - 仓库搜索显示 `WhatsAppStyleTokensLegacy` 没有任何实际消费者。
- 影响：
  - 正式配置模块继续暴露一个并不存在实际兼容需求的旧类型，会误导后续维护者。
  - 这是另一种“无消费者兼容层”技术债。
- 建议修复：
  - 删除该 legacy 类型，保留当前真实使用的 `WhatsAppStyleTokens`。
- 验收命令：
  - `pnpm exec vitest run src/components/footer/__tests__/Footer.test.tsx`
  - `pnpm exec vitest run src/components/whatsapp/__tests__/whatsapp-floating-button.test.tsx`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - `WhatsAppStyleTokensLegacy` 已从 `footer-links.ts` 删除
  - 验收：
    - `pnpm exec vitest run src/components/footer/__tests__/Footer.test.tsx`
    - `pnpm exec vitest run src/components/whatsapp/__tests__/whatsapp-floating-button.test.tsx`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-069 `lead-pipeline/utils.ts` 仍保留只靠测试保活的 deprecated `sanitizeInput()` wrapper
- 优先级：P2
- 标签：PROD/MAINTAINABILITY/TEST
- review chain：code quality and elegance chain
- 证据：
  - `src/lib/lead-pipeline/utils.ts` 仍保留 `@deprecated` 的 `sanitizeInput()` 包装层。
  - 生产代码搜索显示该 wrapper 没有真实消费者，只剩 `src/lib/lead-pipeline/__tests__/utils.test.ts` 在保活它。
- 影响：
  - 正式 utility 模块继续暴露无消费者的旧 helper，会误导维护者并增加 API 面。
  - 这同样属于“测试把旧入口保活”的问题。
- 建议修复：
  - 删除该 deprecated wrapper，改由真实仍在使用的 sanitization helper 承担职责。
  - 同步收敛测试，停止把它当成公开契约。
- 验收命令：
  - `pnpm exec vitest run src/lib/lead-pipeline/__tests__/utils.test.ts`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - `sanitizeInput()` 已从 `lead-pipeline/utils.ts` 删除
    - 对应测试已改为只验证当前正式 API
  - 验收：
    - `pnpm exec vitest run src/lib/lead-pipeline/__tests__/utils.test.ts`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-070 `src/lib/locale-constants.ts` 已无任何消费者，却仍保留一整份 locale 常量与映射真相源
- 优先级：P2
- 标签：PROD/I18N/MAINTAINABILITY
- review chain：locale/runtime entry chain
- 证据：
  - 仓库搜索显示 `src/lib/locale-constants.ts` 中的 `SUPPORTED_LOCALES`、`DEFAULT_LOCALE`、`GEO_LOCALE_MAP`、`BROWSER_LOCALE_MAP` 没有任何真实生产或测试消费者。
  - 当前生产链已经以 `routing-config`、`LOCALES_CONFIG`、`env` 等为主，这个模块处于完全脱链状态。
- 影响：
  - 继续保留这类无消费者 locale 常量模块，会制造新的 locale 真相源错觉。
  - 后续维护者可能误把它当成可用入口继续扩展，重新制造 Wave 2 正在清理的分叉。
- 建议修复：
  - 删除该 dead module，不再把它保留在正式 runtime namespace 下。
- 验收命令：
  - `rg -n "from '@/lib/locale-constants'|from \\\"@/lib/locale-constants\\\"" src tests -S`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - `src/lib/locale-constants.ts` 已删除
  - 验收：
    - `rg -n "from '@/lib/locale-constants'|from \\\"@/lib/locale-constants\\\"" src tests -S`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-073 `src/constants/magic-numbers.ts` 已无任何消费者，却仍保留死掉的 constants facade 入口
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：code quality and elegance chain
- 证据：
  - 仓库搜索显示 `src/constants/magic-numbers.ts` 没有任何真实 import 消费方，只剩测试注释中提及它。
  - 文件本身仍以正式 constants facade 入口的姿态存在。
- 影响：
  - 继续保留这类 dead facade 会误导维护者以为这是受支持的常量入口。
  - 这会增加 constants 体系的表面积和理解成本。
- 建议修复：
  - 删除该 dead facade 文件。
- 验收命令：
  - `rg -n "from '@/constants/magic-numbers'|from \\\"@/constants/magic-numbers\\\"" src tests -S`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - `src/constants/magic-numbers.ts` 已删除
  - 验收：
    - `rg -n "from '@/constants/magic-numbers'|from \\\"@/constants/magic-numbers\\\"" src tests -S`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-074 `src/types/whatsapp.ts` 仍暴露无消费者的 backward-compatibility alias exports，继续放大顶层类型入口噪音
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：code quality and elegance chain
- 证据：
  - `src/types/whatsapp.ts` 顶层聚合入口仍保留一批旧 alias re-exports。
  - 仓库搜索未发现这些 alias 名字有真实 top-level import 消费方。
- 影响：
  - 顶层 WhatsApp 类型入口继续暴露无消费者旧别名，会误导使用者并扩大正式 API 面。
  - 这属于和前面 dead compatibility surface 同类的“旧名词汇还挂在主入口”问题。
- 建议修复：
  - 删除这些无消费者 alias re-exports，只保留当前真实使用的类型导出。
- 验收命令：
  - `pnpm type-check`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - `src/types/whatsapp.ts` 已删除无消费者 alias re-exports
    - 清理过程中暴露的 constants entry 悬挂问题已通过 `src/constants/core.ts` 收平
  - 验收：
    - `pnpm type-check`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-075 `whatsapp-webhook-types.ts` 仍保留无消费者的 backward-compatibility type aliases
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：code quality and elegance chain
- 证据：
  - `src/types/whatsapp-webhook-types.ts` 仍保留一整块 backward-compatibility alias exports。
  - 仓库搜索未发现这些 alias 名字的真实消费者。
- 影响：
  - webhook 类型入口继续暴露无消费者 alias，会扩大正式 API 面并误导维护者。
- 建议修复：
  - 删除这些 dead alias exports，并收掉留下的 unused imports。
- 验收命令：
  - `pnpm exec vitest run src/app/api/whatsapp/webhook/__tests__/route.test.ts`
  - `pnpm type-check`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - `whatsapp-webhook-types.ts` 已删除 dead alias layer
    - 相关 unused imports 已清理
  - 验收：
    - `pnpm exec vitest run src/app/api/whatsapp/webhook/__tests__/route.test.ts`
    - `pnpm type-check`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-076 `whatsapp-api-types.ts` 仍保留无消费者的 backward-compatibility type aliases
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：code quality and elegance chain
- 证据：
  - `src/types/whatsapp-api-types.ts` 仍保留一整块 backward-compatibility alias exports。
  - 仓库搜索未发现这些 alias 名字的真实消费者。
- 影响：
  - API types 入口继续暴露 dead alias，会扩大正式类型表面积并误导维护者。
- 建议修复：
  - 删除这些 dead alias exports，并清理留下的 unused imports。
- 验收命令：
  - `pnpm exec vitest run src/app/api/whatsapp/send/__tests__/route.test.ts`
  - `pnpm type-check`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - `whatsapp-api-types.ts` 已删除 dead alias block
    - 相关 unused imports 已清理
  - 验收：
    - `pnpm exec vitest run src/app/api/whatsapp/send/__tests__/route.test.ts`
    - `pnpm type-check`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-077 `whatsapp-service-types.ts` 仍保留无消费者的 convenience factory helpers，继续扩大死入口表面积
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：code quality and elegance chain
- 证据：
  - `src/types/whatsapp-service-types.ts` 中的 `createDefaultConfig`、`createDefaultServiceOptions`、`createDefaultServiceStatus` 没有任何真实消费者。
  - 其中 `createDefaultServiceStatus` 在 `whatsapp-service-interface.ts` 已有真正定义，继续在顶层入口再挂一份只会增加噪音。
- 影响：
  - 这类 dead helper 会扩大共享类型入口的表面积并误导维护者。
- 建议修复：
  - 删除这些无消费者 convenience helpers，保持顶层入口只暴露真实有用的契约。
- 验收命令：
  - `pnpm exec vitest run src/lib/__tests__/whatsapp-service.test.ts`
  - `pnpm type-check`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - `whatsapp-service-types.ts` 已删除 dead convenience helpers
    - 删除 helper 后留下的 unused imports 已清理
  - 验收：
    - `pnpm exec vitest run src/lib/__tests__/whatsapp-service.test.ts`
    - `pnpm type-check`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-078 `whatsapp-service-types.ts` 仍保留无消费者的 default type export alias
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：code quality and elegance chain
- 证据：
  - `src/types/whatsapp-service-types.ts` 仍存在 `export type { WhatsAppConfig as default }`。
  - 仓库搜索未发现任何 default import 消费方。
- 影响：
  - 继续保留无消费者 default alias 会扩大入口噪音并误导维护者。
- 建议修复：
  - 删除该 dead default alias。
- 验收命令：
  - `pnpm type-check`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - `whatsapp-service-types.ts` 已删除 dead default type export alias
  - 验收：
    - `pnpm type-check`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-079 `whatsapp-service-types.ts` 在兼容层删除后仍保留死掉的 import 结构，文件边界与职责不一致
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：code quality and elegance chain
- 证据：
  - 在前序兼容层删除后，`whatsapp-service-types.ts` 中仍残留大块只为旧 alias/helper 服务的 import。
  - 这些 import 不再对应任何真实导出职责，导致模块边界与实际角色不一致。
- 影响：
  - 继续保留这类 dead import 结构会增加误导和维护成本。
  - 它会让文件看起来像“逻辑模块”，而不是实际的 re-export 入口。
- 建议修复：
  - 删除旧兼容层遗留的 import，收敛成纯 re-export surface。
- 验收命令：
  - `pnpm type-check`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - `whatsapp-service-types.ts` 已删除 compatibility cleanup 后遗留的 dead imports
  - 验收：
    - `pnpm type-check`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-080 `src/types/whatsapp.ts` 仍继续二次转手一批无消费者的顶层 alias 名称，扩大正式入口噪音
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：code quality and elegance chain
- 证据：
  - `src/types/whatsapp.ts` 顶层入口仍转手一些旧 alias 名字。
  - 对其中 `ServiceMessageType`、`ServiceMessageStatus`、`WhatsAppApiErrorClass`、`Config`、`ServiceOptions`、`Status`、`Health`、`Metrics`、`ServiceInterface` 的搜索未发现任何直接消费者。
- 影响：
  - 顶层类型入口继续暴露无消费者旧名，会增加 API 面并误导维护者。
- 建议修复：
  - 删除这组无消费者 alias，维持顶层入口只暴露当前真实使用的名称。
- 验收命令：
  - `pnpm exec vitest run src/lib/__tests__/whatsapp-service.test.ts src/app/api/whatsapp/send/__tests__/route.test.ts src/app/api/whatsapp/webhook/__tests__/route.test.ts`
  - `pnpm type-check`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - 上述无消费者 alias 已从 `src/types/whatsapp.ts` 删除
  - 验收：
    - `pnpm exec vitest run src/lib/__tests__/whatsapp-service.test.ts src/app/api/whatsapp/send/__tests__/route.test.ts src/app/api/whatsapp/webhook/__tests__/route.test.ts`
    - `pnpm type-check`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-081 `_TEST_CONSTANTS` / `_Locale` 仍保留旧下划线 alias，继续放大无价值兼容命名
- 优先级：P3
- 标签：TEST/MAINTAINABILITY
- review chain：verification and guardrails chain
- 证据：
  - `src/constants/test-constants.ts` 仍导出 `_TEST_CONSTANTS`
  - `src/types/i18n.ts` 仍导出 `_Locale`
  - 仓库搜索显示 `_TEST_CONSTANTS` 仅有一个测试消费者，`_Locale` 无真实消费者
- 影响：
  - 这类 alias 继续保留只会扩大旧命名噪音，不提供真实兼容价值。
- 建议修复：
  - 删除这两个 underscore alias，并把剩余消费者切到 canonical 名称。
- 验收命令：
  - `pnpm exec vitest run src/lib/__tests__/colors-contrast-compliance.test.ts`
  - `pnpm type-check`
  - `rg -n "_TEST_CONSTANTS\\b|_Locale\\b" src tests -S`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - `_TEST_CONSTANTS` 与 `_Locale` 已删除
    - 唯一剩余消费者已切到 canonical 名称
  - 验收：
    - `pnpm exec vitest run src/lib/__tests__/colors-contrast-compliance.test.ts`
    - `pnpm type-check`
    - `rg -n "_TEST_CONSTANTS\\b|_Locale\\b" src tests -S`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-082 `src/components/blog/index.ts` 已无任何消费者，却仍保留 dead barrel 入口
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：code quality and elegance chain
- 证据：
  - 仓库搜索未发现 `@/components/blog` 的真实 import 消费方。
  - `src/components/blog/index.ts` 只是在重复导出该目录下组件。
- 影响：
  - dead barrel 会增加组件入口表面积和导入路径歧义。
- 建议修复：
  - 删除该 dead barrel。
- 验收命令：
  - `rg -n "from '@/components/blog'|from \\\"@/components/blog\\\"" src tests -S`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - `src/components/blog/index.ts` 已删除
  - 验收：
    - `rg -n "from '@/components/blog'|from \\\"@/components/blog\\\"" src tests -S`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-083 `src/components/seo/index.ts` 已无任何消费者，却仍保留 dead barrel 入口
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：code quality and elegance chain
- 证据：
  - 仓库搜索未发现 `@/components/seo` 的真实 import 消费方。
  - `src/components/seo/index.ts` 仅重复导出 `JsonLdScript`。
- 影响：
  - dead barrel 会增加组件入口表面积和导入路径歧义。
- 建议修复：
  - 删除该 dead barrel。
- 验收命令：
  - `rg -n "from '@/components/seo'|from \\\"@/components/seo\\\"" src tests -S`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - `src/components/seo/index.ts` 已删除
  - 验收：
    - `rg -n "from '@/components/seo'|from \\\"@/components/seo\\\"" src tests -S`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-084 多个零消费者 barrel 仍保留在正式源码树中，继续放大 dead entrypoint surface
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：code quality and elegance chain
- 证据：
  - 仓库搜索未发现以下 barrel 的真实 import 消费方：
    - `src/components/blocks/index.ts`
    - `src/components/trust/index.ts`
    - `src/emails/index.ts`
    - `src/lib/security/stores/index.ts`
- 影响：
  - dead barrel 会持续增加入口表面积、导入路径歧义和维护噪音。
- 建议修复：
  - 删除这批 zero-consumer barrel。
- 验收命令：
  - `pnpm type-check`
- 状态：❌ 未修复（2026-03-15，Wave 3）
  - 修复点：
    - 上述 zero-consumer barrel 已删除
    - 误删但存在真实消费者的 `components/mdx` / `components/seo` / `lib/cache` / `lib/cookie-consent` / `lib/image` barrel 已恢复
  - 验收：
    - `pnpm type-check`
- 状态：✅ 已修复（2026-03-15，cleanup phase）

#### CR-085 `src/types/whatsapp-service-types.ts` 没有任何真实消费者，却继续保留单独 facade 入口
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：code quality and elegance chain
- 证据：
  - 仓库搜索没有发现 `@/types/whatsapp-service-types` 的真实消费者，`rg -n 'whatsapp-service-types' src tests` 返回空结果。
  - `src/types/whatsapp-service-types.ts` 本身只是在重新导出 `whatsapp-service-config`、`whatsapp-service-errors`、`whatsapp-service-monitoring`、`whatsapp-service-interface` 的现有内容。
  - 同一领域的真实入口仍然存在：
    - `@/types/whatsapp` 仍被生产代码使用。
    - 更细粒度的 `@/types/whatsapp-service-*` 子模块也仍然保留。
- 影响：
  - 继续保留零消费者 facade，会扩大类型入口表面积并误导维护者，以为这里仍是正式真相源。
  - 这属于与 `CR-082` ~ `CR-084` 相同的 dead compatibility surface 问题，只是这次落点在类型 facade 而不是 barrel。
- 建议修复：
  - 删除 `src/types/whatsapp-service-types.ts`，让消费者只依赖真实仍在使用的入口。
- 验收命令：
  - `pnpm type-check`
- 状态：❌ 未修复（2026-03-15，Wave 3 continuation）
  - 修复点：
    - `src/types/whatsapp-service-types.ts` 已删除
  - 验收：
    - `pnpm type-check`
- 状态：✅ 已修复（2026-03-15，cleanup phase）

#### CR-086 `src/lib/api/api-response-schema.ts` 只剩测试在引用，却仍保留在正式 API 命名空间中
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：test validity and truth-source chain
- 证据：
  - `src/lib/api/api-response-schema.ts` 注释已明确写成 `legacy/test-side validation` helper。
  - 仓库搜索显示它没有任何生产消费者；修复前唯一引用来自 `src/lib/__tests__/validations.test.ts`。
  - 文件本身只提供一个宽松的 `zod` 响应 schema，并不是当前 API 返回契约的正式真相源。
- 影响：
  - 继续把 test-only helper 放在 `src/lib/api/` 正式命名空间下，会误导维护者以为它仍代表当前 API contract。
  - 这会让测试继续保活一个已经脱离真实生产协议的旧入口。
- 建议修复：
  - 删除 `src/lib/api/api-response-schema.ts`，并移除对应的 test-only 断言。
- 验收命令：
  - `pnpm exec vitest run src/lib/__tests__/validations.test.ts`
  - `pnpm type-check`
- 状态：❌ 未修复（2026-03-15，Wave 3 continuation）
  - 修复点：
    - `src/lib/api/api-response-schema.ts` 已删除
    - `src/lib/__tests__/validations.test.ts` 已移除仅用于保活该 helper 的断言
  - 验收：
    - `pnpm exec vitest run src/lib/__tests__/validations.test.ts`
    - `pnpm type-check`
- 状态：✅ 已修复（2026-03-15，cleanup phase）

#### CR-087 `src/lib/i18n-message-cache.ts` 没有任何生产消费者，却继续保留旧 fetch-based cache helper 与自保活测试
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：migration and test-validity chain
- 证据：
  - `src/lib/i18n-message-cache.ts` 文件注释已经明确标记为 `Legacy/test-side translation cache helper`。
  - 仓库搜索显示它没有任何生产消费者；修复前所有 `TranslationCache` / `getCachedMessages` / `getCachedTranslations` / `preloadTranslations` 的引用都来自 `src/lib/__tests__/i18n-performance*.test.ts`。
  - 当前生产代码仍在使用的是 `I18nPerformanceMonitor`，而不是这个旧 fetch-based cache 路径。
- 影响：
  - 继续把这类 test-only helper 放在 `src/lib/` 正式命名空间下，会误导维护者，以为仓库仍存在一条活跃的 i18n 缓存加载链。
  - 测试继续围绕它构建，只会保活已经退出真实 runtime 的旧语义。
- 建议修复：
  - 删除 `src/lib/i18n-message-cache.ts`。
  - 删除只为它存在的测试，并保留针对仍在使用的 `I18nPerformanceMonitor` 的小型定向测试。
- 验收命令：
  - `pnpm exec vitest run src/lib/__tests__/i18n-performance.test.ts`
  - `pnpm type-check`
- 状态：❌ 未修复（2026-03-15，Wave 3 continuation）
  - 修复点：
    - `src/lib/i18n-message-cache.ts` 已删除
    - `src/lib/__tests__/i18n-performance-cache.test.ts` 与 `src/lib/__tests__/i18n-performance.network-failure.test.ts` 已删除
    - `src/lib/__tests__/i18n-performance.test.ts` 已收敛为 monitor/scoring 定向测试
  - 验收：
    - `pnpm exec vitest run src/lib/__tests__/i18n-performance.test.ts`
    - `pnpm type-check`
- 状态：✅ 已修复（2026-03-15，cleanup phase）

#### CR-088 `src/lib/security-file-upload.ts` 与 `src/lib/security-tokens.ts` 没有任何生产消费者，却继续驻留在正式安全命名空间
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：test validity and dead helper surface
- 证据：
  - 仓库搜索显示这两个模块都没有生产消费者；修复前所有导入都来自 `src/lib/__tests__/**` 与 `tests/unit/security/**`。
  - `src/lib/__tests__/security.test.ts` 也混入了针对这两个 dead helper 的断言，继续保活它们。
  - 仍在使用的安全逻辑是 `src/lib/security-validation.ts`，而不是这两个 helper。
- 影响：
  - 把 test-only helper 留在 `src/lib/` 正式安全命名空间，会误导维护者，以为这些文件仍是活跃的安全能力入口。
  - 测试继续围绕它们构建，只会放大死代码表面积和维护噪音。
- 建议修复：
  - 删除这两个模块及其自保活测试。
  - 保留只覆盖仍在使用的 `security-validation` 行为的测试。
- 验收命令：
  - `pnpm exec vitest run src/lib/__tests__/security.test.ts`
  - `pnpm type-check`
- 状态：❌ 未修复（2026-03-15，candidate discovery）
  - 修复点：
    - `src/lib/security-file-upload.ts` 与 `src/lib/security-tokens.ts` 已删除
    - dedicated tests 已删除
    - `src/lib/__tests__/security.test.ts` 已移除 dead helper 断言，仅保留 active validation coverage
  - 验收：
    - `pnpm exec vitest run src/lib/__tests__/security.test.ts`
    - `pnpm type-check`
- 状态：✅ 已修复（2026-03-15，cleanup phase）

#### CR-089 `src/types/test-types.ts` 是纯测试类型入口，却继续驻留在正式 `src/types` 命名空间
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：ownership and namespace boundary
- 证据：
  - 仓库搜索显示 `src/types/test-types.ts` 的所有消费者都来自测试和测试辅助文件。
  - 没有任何生产代码依赖该文件；问题在于它挂在正式类型命名空间下，而不是测试命名空间。
- 影响：
  - 把 test-only 类型入口放在 `src/types` 下，会误导维护者，以为它属于生产类型 surface。
  - 这会继续放大“正式入口里混有测试专用资产”的边界噪音。
- 建议修复：
  - 将该文件迁到 `src/test/` 之类的测试命名空间，并同步改掉所有测试导入。
- 验收命令：
  - `pnpm exec vitest run src/lib/__tests__/airtable.test.ts src/lib/__tests__/resend.test.ts`
  - `pnpm type-check`
- 状态：❌ 未修复（2026-03-15，candidate discovery）
  - 修复点：
    - `src/types/test-types.ts` 已迁移到 `src/test/test-types.ts`
    - 所有测试导入已切换到 `@/test/test-types`
  - 验收：
    - `pnpm exec vitest run src/lib/__tests__/airtable.test.ts src/lib/__tests__/resend.test.ts`
    - `pnpm type-check`
- 状态：✅ 已修复（2026-03-15，cleanup phase）

#### CR-071 `layout-fonts.ts` 仍保留无消费者的 `ibmPlexSans` 字体 alias，继续放大假兼容入口
- 优先级：P3
- 标签：PROD/MAINTAINABILITY
- review chain：code quality and elegance chain
- 证据：
  - `src/app/[locale]/layout-fonts.ts` 仍导出 `ibmPlexSans = figtree` 的 backwards-compatibility alias。
  - 仓库搜索显示 `ibmPlexSans` 没有任何真实消费者，只剩 `layout-fonts.test.ts` 在保活它。
- 影响：
  - 字体模块继续暴露无消费者 alias，会误导后续维护者并增加 API 面。
  - 这与 `CR-066`、`CR-067`、`CR-068`、`CR-069` 属于同类 dead compatibility surface 问题。
- 建议修复：
  - 删除该 dead alias，并同步收敛测试。
- 验收命令：
  - `pnpm exec vitest run src/app/[locale]/__tests__/layout-fonts.test.ts`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - `ibmPlexSans` alias 已从 `layout-fonts.ts` 删除
    - layout fonts 测试已停止保活该 alias
  - 验收：
    - `pnpm exec vitest run src/app/[locale]/__tests__/layout-fonts.test.ts`
- 状态：✅ 已修复（2026-03-13，repair phase）

#### CR-072 生产代码仍在广泛使用 deprecated count aliases，继续放大旧常量词汇面
- 优先级：P2
- 标签：PROD/MAINTAINABILITY
- review chain：code quality and elegance chain
- 证据：
  - 修复前的生产代码仍广泛使用 `COUNT_PAIR`、`COUNT_TRIPLE`、`COUNT_QUAD`、`COUNT_FOUR`。
  - 这些别名在 `src/constants/count.ts` 中已被明确标记为 deprecated，但依然通过 `src/constants/index.ts` 继续对外导出。
- 影响：
  - 旧别名继续存在，会让常量命名体系保持双轨，增加阅读和维护成本。
  - 这属于另一类“兼容层长期不收口”的问题，会持续污染新代码。
- 建议修复：
  - 将生产代码统一替换为 canonical count constants。
  - 删除 deprecated alias exports，避免新代码继续引用它们。
- 验收命令：
  - `pnpm type-check`
  - `pnpm exec vitest run src/config/__tests__/paths.test.ts src/lib/__tests__/structured-data.test.ts src/components/security/__tests__/turnstile.test.tsx src/lib/lead-pipeline/__tests__/utils.test.ts`
- 状态：❌ 未修复（2026-03-13，Wave 3）
  - 修复点：
    - 生产代码中的 deprecated count alias 已全部替换为 canonical constants
    - `count.ts` 和常量 barrel 中的 deprecated alias exports 已删除
  - 验收：
    - `pnpm type-check`
    - `pnpm exec vitest run src/config/__tests__/paths.test.ts src/lib/__tests__/structured-data.test.ts src/components/security/__tests__/turnstile.test.tsx src/lib/lead-pipeline/__tests__/utils.test.ts`
- 状态：✅ 已修复（2026-03-13，repair phase）
