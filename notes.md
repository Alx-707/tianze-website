# Notes: Linus 多维度项目审查（tianze-website）

## Round 2（2026-02-03）证据链

（本轮发现将追加在这里；每条包含：问题 → 证据 → 影响 → 建议。）

## Round 2 实施记录（2026-02-03）

### Phase 1：收敛 IP 提取与 rate limit key（P0）✅

- 目标：禁止把 raw IP 作为 `checkDistributedRateLimit(identifier, ...)` 的 identifier（避免 PII 写进持久化 key），同时消灭“手写 header 解析”的分叉实现。
- 变更点：
  - 新增 `src/lib/security/client-ip.ts#getClientIPFromHeaders(headers)`：给 Server Actions 提供与 `getClientIP(request)` 同源的可信模型入口。
  - `src/app/actions.ts`：
    - 删除本地 `getClientIPFromHeaders()`（手写解析）。
    - rate limit 改为 `ip:${hmacKey(clientIP)}`（不再传 raw IP）。
  - `src/app/api/csp-report/route.ts`：
    - POST 改为走 `withRateLimit("csp", ...)`（identifier 统一为 `getIPKey()` 产物）。
    - 日志/violationData 的 IP 改为使用 `withRateLimit` 提供的 `clientIP`（不再手写 header 解析）。
  - `src/app/api/whatsapp/webhook/route.ts`：signature 校验通过后，identifier 改用 `getIPKey(request)`。
  - `src/app/api/cache/invalidate/route.ts`：
    - pre-auth rate limit 改用 `getIPKey(request)`；
    - post-auth rate limit 改用 `getApiKeyPriorityKey(request)`；
    - 日志不再输出 raw IP（改为 `keyPrefix`）。
  - 删除 `src/app/api/contact/contact-api-utils.ts` 的 `getClientIP/getFullClientIPChain`（强制统一入口）；`src/app/api/verify-turnstile/route.ts` 改用 `src/lib/security/client-ip.ts#getClientIP`。
- 测试/门禁：
  - ✅ `pnpm type-check`
  - ✅ `pnpm lint:check`
  - ✅ `pnpm test`

### Phase 2：重构 `src/lib/idempotency.ts`（P1）✅

- 删除 import 即启动的顶层 `setInterval`，改为“访问时清理（节流）”避免 serverless/并发环境全局副作用。
- 让 `withIdempotency(..., { ttl })` 变成真接口：
  - 缓存条目新增 `expiresAt`，支持每次调用传入自定义 ttl；
  - `saveIdempotencyKey()` 改为 `options` 对象参数（满足 `max-params`，同时避免接口继续膨胀）。
- 验证：
  - ✅ `pnpm type-check`
  - ✅ `pnpm lint:check`
  - ✅ `pnpm test`

### Phase 3：清理假 async（P1）✅

- `next.config.ts`：移除 `await Promise.resolve()`，`headers()` 改为同步实现（不再为 `require-await` 写假动作）。
- 内容 wrappers 的真实约束来自 Next.js `"use cache"`：
  - `"use cache"` 只能用于 `async` function（`pnpm build` 会直接报 `"use cache" functions must be async functions`），所以不能为“去 async”硬改类型。
  - 最终策略：保留 `async`（框架约束），但删除所有假 `await Promise.resolve(...)`；同时用最小范围的 `require-await` 豁免把“工具冲突”显式化（而不是写假动作）。
  - 落地文件：`src/lib/content/blog.ts`、`src/lib/content/products.ts`（`/* eslint-disable require-await -- Next.js "use cache" functions must be async even if implementation is sync */`）。
- 验证：
  - ✅ `pnpm type-check`
  - ✅ `pnpm lint:check`
  - ✅ `pnpm test`

### Phase 4：修复 `eslint:disable:check`（P1）✅

- `scripts/check-eslint-disable-usage.js` 重写为可审计门禁：
  - 以 `git ls-files` 为扫描源，避免 `find/xargs` 的不确定性；
  - 只识别真实注释形态（`//`、`/* */`、JSX `{/* */}`）的 eslint-disable 指令；
  - 规则：必须指定 rule；生产代码必须带 `-- reason`；测试代码理由可选；
  - dirty worktree 下缺失文件不崩溃（跳过 ENOENT）。
- 补齐若干生产代码中的缺失理由（避免门禁“永远红灯”）：
  - `src/lib/env.ts`、`src/lib/content-utils.ts`、`src/lib/content/products-source.ts`、`src/lib/sitemap-utils.ts`、`src/i18n/request.ts`、`src/components/products/product-actions.tsx`
  - 文件级 disable：`src/config/contact-form-config.ts`、`src/services/url-generator.ts`、`src/lib/logger.ts`、`src/types/whatsapp-*.ts`
- 验证：
  - ✅ `pnpm eslint:disable:check`
  - ✅ `pnpm type-check`
  - ✅ `pnpm lint:check`
  - ✅ `pnpm test`

### Phase 5：env 真相源收敛（P1）✅

- 删除根目录 `env.mjs`，统一以 `src/lib/env.ts` 作为唯一入口（测试/生产都从 `@/lib/env` 导入/Mock）。
- 清理所有测试中对 `env.mjs` 的 mock 路径（`@/../env.mjs` / `../../../../env.mjs`）→ 统一改为 `@/lib/env`。
- 清理 `env.d.ts` 中对 `env.mjs` 的声明，保留 JSON/MDX 声明（避免“类型上存在、运行时不存在”的假模块）。
- 验证：
  - ✅ `pnpm type-check`
  - ✅ `pnpm lint:check`
  - ✅ `pnpm test`

### Phase 6：最终回归验证（P1）✅

- 关键门禁：
  - ✅ `pnpm type-check`
  - ✅ `pnpm lint:check`
  - ✅ `pnpm eslint:disable:check`
  - ✅ `pnpm format:check`
  - ✅ `pnpm test`
  - ✅ `pnpm build`
  - ✅ `pnpm quality:gate:fast`
- 备注：
  - `baseline-browser-mapping` 的提示是依赖数据“过旧”警告，不影响 lint/build 结果（当前未作为门禁阻断项）。

## Round 2 后续治理（2026-02-03）

### P2：validation 常量语义收敛（lead-schema.ts 不再“数学拼数”）✅

- 问题：`src/lib/lead-pipeline/lead-schema.ts` 用无关常量（`MAGIC_255`/`PERCENTAGE_FULL` 等）做加减法拼出校验上限，语义污染且维护风险高。
- 变更：
  - 在 `src/constants/validation-limits.ts` 新增 lead 相关语义常量：
    - `MAX_LEAD_EMAIL_LENGTH`（254）
    - `MAX_LEAD_COMPANY_LENGTH`（200）
    - `MAX_LEAD_NAME_LENGTH`（100）
    - `MIN_LEAD_MESSAGE_LENGTH`（10）
    - `MAX_LEAD_MESSAGE_LENGTH`（5000）
    - `MAX_LEAD_PRODUCT_NAME_LENGTH`（复用 company length）
    - `MAX_LEAD_REQUIREMENTS_LENGTH`（2000）
  - `src/constants/index.ts` 聚合导出以上常量。
  - `src/lib/lead-pipeline/lead-schema.ts` 改为直接消费语义常量（删除所有拼数逻辑）。
- 验证：
  - ✅ `pnpm type-check`
  - ✅ `pnpm lint:check`
  - ✅ `pnpm test`

### P2（补充）：收敛 “零 warnings” 口径到 `pnpm lint:check` ✅

- 变更：`package.json` 的 `lint:check` 增加 `--max-warnings 0`，让本地与 CI 的“零 warnings”口径一致。
- 验证：
  - ✅ `pnpm lint:check`（带 `--max-warnings 0`）通过

### P3：拆分 `src/test/setup.ts`（1821 行大桶）✅

- 目标：移除文件级 `eslint-disable max-lines-per-function, max-lines`，让测试基础设施按职责拆分，保留行为不变。
- 变更：
  - `src/test/setup.ts` 收敛为入口文件（保留 Vitest `setupFiles` 路径不变），改为 side-effect import 其它模块。
  - 新增拆分模块：
    - `src/test/setup.base-mocks.ts`
    - `src/test/setup.fetch.ts`
    - `src/test/setup.next.ts`
    - `src/test/setup.icons.ts`（lucide-react mock 收敛为“仅导出仓库实际使用的图标名”）
    - `src/test/setup.zod.ts`
    - `src/test/setup.constants-and-i18n.ts`
    - `src/test/setup.env.ts`
    - `src/test/setup.intersection-observer.ts`（并从入口 re-export helpers）
    - `src/test/setup.browser-apis.ts`
    - `src/test/setup.hooks.ts`
- 验证：
  - ✅ `pnpm type-check`
  - ✅ `pnpm lint:check`
  - ✅ `pnpm format:check`
  - ✅ `pnpm test`

### 1) `eslint:disable:check` 不是门禁，是噪音（规则与现实完全冲突）

- 问题：`scripts/check-eslint-disable-usage.js` 把几乎所有生产代码目录（`src/app`/`src/lib`/`src/components`）都列为 “严格禁止”，导致当前仓库的合理 `eslint-disable-next-line` 全部被判违规。门禁脚本在这种状态下没有任何可信度。
- 证据：
  - `pnpm eslint:disable:check`（2026-02-03）输出：发现 39 个文件包含 eslint-disable，其中 36 个被判违规（包括 `src/app/**`、`src/lib/**`、`src/components/**`、`src/config/**`、`src/test/setup.ts` 等）。
  - `scripts/check-eslint-disable-usage.js`：
    - `FORBIDDEN_PATTERNS` 覆盖 `src/app/**/*`, `src/lib/**/*.ts`, `src/components/**/*` 等（除 dev-tools 外基本全禁）。
    - `findFilesWithEslintDisable()` 只扫描 `src/`，但 `ALLOWED_PATTERNS` 却包含 `scripts/`、`tests/`（脚本自相矛盾/存在死配置）。
    - “文档说明”判断逻辑是看下一行是否包含 `/**`，与项目真实写法（同一行 `-- reason`）不匹配。
- 影响：
  - 维护者时间浪费：每次跑门禁都在提醒你“删掉合理的 disable”，逼迫你去写更蠢的补丁代码。
  - 长期结果：团队会默认忽略它；忽略的门禁 = 没门禁。
- 建议（Linus）：二选一，别摇摆：
  1) 直接删掉 `eslint:disable:check`（推荐），把规则收敛回 ESLint 本身；或
  2) 重写脚本：不再按目录一刀切禁止，而是只检查“禁用是否最小化且有理由”（仅允许 `eslint-disable-next-line <rule> -- reason`，禁止无 rule 名、禁止块级 disable 等）。

### 2) `require-await` 正在逼你写垃圾（“假 await / 假 Promise” 扩散）

- 问题：为了满足 `require-await`，出现了 `await Promise.resolve(...)` 这类“假动作”。这不是异步，这是自欺欺人。
- 证据：
  - 旧实现（已删除）：`next.config.ts`、`src/lib/content/blog.ts`、`src/lib/content/products.ts` 曾存在 `await Promise.resolve(...)`，仅用于“糊过 lint”。
  - Next.js 约束（必须承认）：`.next-docs/01-app/03-api-reference/01-directives/use-cache.mdx` 明确 `use cache` 用于 asynchronous function；实际 `pnpm build` 也会对非 `async` 的 `"use cache"` wrapper 报错：`"use cache" functions must be async functions`。
  - 新实现（当前）：content wrappers 保留 `async` + `"use cache"`，删除假 await，并用最小范围 `/* eslint-disable require-await -- reason */` 显式标注该冲突。
- 影响：
  - 代码可读性下降；更糟的是：你把“工具问题”扩散进了业务/内容层。
- 修复（已落地）：
  - `next.config.ts`：移除假 await，让 `headers()` 回到同步实现。
  - content wrappers：保留 `async`（框架约束）但删除假 await；用局部 `require-await` 豁免（带理由）把“工具冲突”变成显式事实，而不是继续写补丁代码。

### 3) Client IP 信任模型分叉（安全边界不允许分叉）

- 问题：仓库里同时存在“可信代理模型”（`src/lib/security/client-ip.ts`）和多套“手写解析 header”的实现，导致不同路径的 rate limit / 日志 / 风控使用不同的信任边界。
- 证据：
  - 可信模型：`src/lib/security/client-ip.ts#getClientIP()`（平台感知、校验、fallback）。
  - Server Actions 另起炉灶：`src/app/actions.ts#getClientIPFromHeaders()`（直接读 `x-forwarded-for` / `x-real-ip`）。
  - Contact API utils 另起炉灶：`src/app/api/contact/contact-api-utils.ts#getClientIP()` / `getFullClientIPChain()`
  - 更糟：`src/app/api/cache/invalidate/route.ts` 直接 `import { getClientIP } from "@/app/api/contact/contact-api-utils";`
  - 其他路由也手写：`src/app/api/csp-report/route.ts#getClientIp`，`src/app/api/whatsapp/webhook/route.ts`。
- 影响：
  - 真实风险：一旦出现“绕过代理直连”或“header 可控”的路径，你的 rate limit 会变成摆设；日志还会记录错误的 IP 链。
  - 维护风险：修一个地方不等于修全局，安全边界永远对不齐。
- 建议（Linus）：把 IP 提取收敛到一个模块：
  - 只保留 `src/lib/security/client-ip.ts` 作为唯一真相源；
  - 需要 `Headers`（Server Actions）场景就给这个模块加一个 `getClientIPFromHeaders(headers: Headers)` 的同源实现，别在 `src/app/actions.ts` 手写。

### 4) 分布式 rate limit 的隐私/一致性被绕过（直接用原始 IP 当 key）

- 问题：`checkDistributedRateLimit(identifier, preset)` 的 `identifier` 被部分路由直接传入原始 IP（甚至是未经可信模型验证的 header 值），绕过了 `withRateLimit` + `hmacKey()` 的设计初衷（避免把 PII 写进存储 key）。
- 证据：
  - `src/lib/api/with-rate-limit.ts`：默认使用 `getIPKey()`（HMAC 后的 `ip:${hash}`）作为 `identifier`。
  - 违规路径：
    - `src/app/api/csp-report/route.ts:155`：`checkDistributedRateLimit(clientIP, "csp")`
    - `src/app/api/whatsapp/webhook/route.ts`：`checkDistributedRateLimit(clientIP, "whatsapp")`
    - `src/app/api/cache/invalidate/route.ts`：同类直接用 raw IP。
- 影响：
  - PII 泄露面：`ratelimit:${preset}:${identifier}` 的 key 会包含真实 IP（尤其当接入 Upstash/KV 这类外部存储时）。
  - 行为不一致：同一套 preset，在不同路由里 key 语义不同（hash vs raw），排障困难。
- 建议：强制所有路由走 `withRateLimit`（或至少统一用 `getIPKey/getApiKeyPriorityKey` 生成 identifier）；不要在路由里直接调用 `checkDistributedRateLimit` 传 raw IP。

### 5) `src/lib/idempotency.ts` import 即启动 `setInterval`（全局副作用 + serverless 坑）

- 问题：模块顶层 `setInterval(cleanExpiredCache, ...)` 是典型“把生命周期藏在 import 里”的坏味道。
- 证据：`src/lib/idempotency.ts:58` 存在 `setInterval(cleanExpiredCache, 60 * 60 * 1000);`，且该模块被 `src/app/api/subscribe/route.ts` 引用。
- 影响：
  - serverless/edge/并发环境里，实例生命周期不可控：定时器会在每个实例里跑，行为和成本都不可预测。
  - 测试/本地/生产行为分叉：你很难证明它真的“只清一次”。
- 建议：删掉 interval。改为“访问时顺便清”（读/写 idempotency cache 时做过期清理），或者把 store 换成具备 TTL 的外部存储。

### 6) 常量政策继续驱动“语义污染”（validation 逻辑用 UI/统计常量拼凑数字）

- 问题：为了躲 `no-magic-numbers`，出现了用无关常量拼凑校验长度的写法，本质上是把“语义”打碎了。
- 证据：`src/lib/lead-pipeline/lead-schema.ts`
  - `EMAIL_MAX_LENGTH = MAGIC_255 - 1`、`COMPANY_MAX_LENGTH = PERCENTAGE_FULL + PERCENTAGE_FULL`、`MESSAGE_MAX_LENGTH = MAGIC_2500 + MAGIC_2500` 等。
- 影响：
  - 常量名表达的是别的语义（percentage/animation/magic），但被拿来当 validation 上限；维护者会被误导。
  - 任何“常量重构”都可能误伤校验逻辑。
- 建议：给 validation 建立自己的常量域（例如 `src/constants/validation.ts`），并在 `src/constants/**` 或该文件上关闭 `no-magic-numbers`，让数字只出现一次且语义正确。

## 范围与原则

- 原则：拒绝补丁；优先消除特殊情况；数据结构先行；简洁胜过“灵活”。
- 范围：Next.js App Router、next-intl、内容系统（MDX）、API routes、安全与性能预算、测试与质量门禁。

## 证据收集（待填）

### 基线
- `package.json` scripts / deps:
  - 质量门禁/CI 脚本非常重（`scripts/quality-gate.js`, `scripts/ci-local.sh`），说明项目把“流程正确”当成第一等公民。
  - 代价：为了过规则而写的“常量滥用/规避式代码”已经出现（见下方发现）。
- `next.config.ts` / `middleware.ts`:
  - `next.config.ts` 的 `headers()` 里用 `await Promise.resolve()` 规避 `require-await`，这是典型补丁味（见下方发现）。
  - `middleware.ts` 在写 `NEXT_LOCALE` 时同时用 `resp.cookies.set()` + 手工 `set-cookie` header，属于“同一件事做两遍”的危险写法。
- CI/质量门禁：`scripts/quality-gate.js`、`lighthouserc.js`、`eslint.config.mjs`:
  - Lighthouse 阈值与“关键 URL 优先”策略清晰（`lighthouserc.js`）。
  - ESLint 规则非常激进（`react-you-might-not-need-an-effect` 等），已导致部分组件出现“为了躲规则而自造系统”的反模式。
- 现有报告：`reports/`、`findings.md`、`progress.md`:
  - `task_plan.md`/`progress.md` 记录了最近一轮重构（PR #14）和测试通过情况。

### 架构 / i18n / cacheComponents
- 关键入口：`src/app/[locale]/layout.tsx`、`src/i18n/*`、`src/lib/load-messages.ts`
- 缓存：`src/lib/content/**` 是否用 `"use cache"` 且传入显式 locale

### 安全
- API routes：`src/app/api/**/route.ts`
- Zod schemas：`src/lib/validations/**`
- Rate limit：`src/lib/security/**`
- CSP：`src/config/security.ts`、`src/app/api/csp-report/route.ts`

### 性能
- 图片：`next/image` 使用情况、`sizes`、`priority`
- 字体：`next/font/local` + `display: 'swap'`
- Hydration 风险：Radix + dynamic import

### 测试
- Unit/Integration：Vitest
- E2E：Playwright
- 覆盖率与易碎点：集中 mocks、选择器策略

## 发现（滚动记录）

（审查过程中按模块记录：问题 -> 证据 -> 影响 -> 建议）

### 常量滥用（命名语义崩坏）

- 证据：`src/app/api/contact/contact-api-validation.ts`
  - `maxAge = COUNT_TEN * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW; // COUNT_TEN分钟`
- 证据：`src/lib/airtable/service.ts`
  - `getStatistics()` 用 `ANIMATION_DURATION_VERY_SLOW` 作为 `maxRecords`
- 影响：把“数字常量”变成“语义地雷”。任何人改动动画时长都可能间接改掉业务逻辑；未来排障会极其痛苦。
- 建议：为时间/容量/限额建立真实语义的常量（例如 `ONE_SECOND_MS`, `TEN_MINUTES_MS`, `AIRTABLE_MAX_RECORDS`），把动画常量彻底限定在 UI 层。
- 实施（已完成）：
  - 新增：`src/constants/time.ts` → `TEN_MINUTES_MS`
  - 新增：`src/constants/airtable.ts` → `AIRTABLE_STATS_MAX_RECORDS`
  - 修复：`src/app/api/contact/contact-api-validation.ts` 改用 `TEN_MINUTES_MS`
  - 修复：`src/lib/airtable/service.ts` 改用 `AIRTABLE_STATS_MAX_RECORDS`
  - 顺带清理：`src/lib/security-validation.ts` / `src/lib/security-tokens.ts` / `src/lib/security-rate-limit.ts` 移除 `ANIMATION_DURATION_VERY_SLOW` / `COUNT_PAIR` 等错误语义依赖
  - 验证：已跑 `pnpm vitest run ...`（contact/security/airtable 相关用例通过）

### 自我约束不自洽（文件行数上限已被突破）

- 证据：`src/lib/i18n-validation.ts`（556 行，且看起来仅测试引用）
- 证据：`src/lib/lead-pipeline/process-lead.ts`（521 行）
- 证据：`src/lib/airtable/service.ts`（521 行）
- 影响：你写了规则，但代码不服从。后续只会继续膨胀。
- 建议：把这些文件拆成更小的“纯函数模块 + 薄编排层”。尤其是 `process-lead.ts`，现在已经是“业务 + 监控 + 超时 + 服务调用”揉在一起。
- 实施（进行中）：
  - ✅ `src/lib/lead-pipeline/process-lead.ts` 已拆分：编排层保留在 `process-lead.ts`（165 行），其余拆到：
    - `src/lib/lead-pipeline/processors/*`
    - `src/lib/lead-pipeline/settle-service.ts`
    - `src/lib/lead-pipeline/with-timeout.ts`
    - `src/lib/lead-pipeline/pipeline-observability.ts`
  - 验证：`pnpm vitest run src/lib/lead-pipeline/__tests__/process-lead.test.ts --run`（以及同目录其他测试）通过
  - ✅ `src/lib/airtable/service.ts` 已拆分：核心 class 保留在 `service.ts`（214 行），实现拆到 `src/lib/airtable/service-internal/*`
  - 验证：`pnpm vitest run src/lib/__tests__/airtable-configuration.test.ts ... --run` + `pnpm type-check` + `pnpm lint:check` 通过

### 规避式代码（为了过 ESLint 而写复杂实现）

- 证据：`src/components/forms/lazy-turnstile.tsx`
  - 为了避免在 effect 中初始化状态，用 `useSyncExternalStore` + 自己维护订阅者集合/IntersectionObserver/idle fallback。
- 影响：复杂度上升、维护成本上升、边界行为更难验证；这不是“性能优化”，这是“为了躲规则”。
- 建议：允许这里用 `useEffect`（对该文件/规则做最小豁免），或者抽一个复用的 `useLazyVisible()` hook（但别再造一个半吊子 store）。
- 实施（已完成）：移除 `useSyncExternalStore` + 手写订阅系统，改为 `useEffect` + `useState`（IntersectionObserver 优先、`requestIdleCallback` 退化）。

### 中间件 cookie 写入的重复与不一致

- 证据：`middleware.ts#setLocaleCookie()`
  - 既 `resp.cookies.set("NEXT_LOCALE", ...)`，又 `resp.headers.append("set-cookie", ...)`
  - `sameSite: "lax"` 与安全规则里建议的 `sameSite: 'strict'` 口径不一致（尽管这只是 locale cookie）
  - 未设置 `maxAge`，与 `src/i18n/routing-config.ts#localeCookie.maxAge`（1 年）不一致
- 影响：重复 Set-Cookie/覆盖顺序不确定；行为依赖运行时细节，属于不稳定实现。
- 建议：保留一种写法（优先 `resp.cookies.set`），不要手写 header；同时统一 sameSite 策略并写清 rationale。
- 实施（已完成）：
  - `middleware.ts`：删除手写 `set-cookie` header，仅保留 `resp.cookies.set`
  - `middleware.ts`：补齐 `maxAge`（读取 `routing.localeCookie.maxAge`）
  - 单测：新增 `src/__tests__/middleware-locale-cookie.test.ts`（mock `next-intl/middleware`，只测我们的逻辑）

### CSP report PII 日志（已修复）

- 原问题证据：`src/app/api/csp-report/route.ts#logCSPViolation()`
  - violationData 包含 `ip`/`userAgent`/`scriptSample` 等，日志会进入 `console.warn/error`。
- 修复：改为 `sanitizeIP` + `sanitizeLogContext` 输出，确保 `ip` 不泄露（`[REDACTED_IP]`）。
- 验证：运行 `pnpm vitest run src/app/api/csp-report/__tests__ --run`，69 tests passed。

### next.config.ts 的“假 await”

- 证据：`next.config.ts#headers()`
  - `await Promise.resolve(); // Satisfy require-await ESLint rule`
- 影响：这就是补丁。你的工具在指挥你写垃圾。
- 建议：对 config 文件关闭 `require-await`，或者把 `headers()` 改成真正需要 async 的实现（但别做这种自欺欺人的 await）。

### i18n-validation 工具的过度工程倾向

- 证据：`src/lib/i18n-validation.ts#getNestedValue()`
  - 巨大的 Unicode 正则“安全校验”，但 key 来源是内部提取的字符串，并非用户输入。
- 影响：性能与可读性都被牺牲，收益接近 0。
- 建议：如果该模块只用于测试/脚本，把它移到 scripts/test utils；否则把“安全校验”降到合理强度或直接移除。
- 实施（已完成）：确认仅测试引用后迁出生产路径 → `src/test/i18n-validation.ts`（并更新相关单测 import）。

### 死代码（测试引用但生产无用）

- 证据：`src/lib/security-rate-limit.ts`（仅测试引用，且 import 即启动 `setInterval` 的副作用）
- 影响：死代码 + 副作用；最坏情况下会在 serverless 里制造隐蔽的资源占用/不可控行为。
- 实施（已完成）：
  - 删除 `src/lib/security-rate-limit.ts`
  - 同步删除/调整相关单测引用（`tests/unit/security/security-rate-limit.test.ts`、`src/lib/__tests__/security.test.ts`）
  - 删除 `src/app/api/contact/contact-api-utils.ts` 内的 in-memory rate limit（`checkRateLimit`/`getRateLimitStatus`/`cleanupRateLimitStore`/`RATE_LIMIT_CONFIG`）
  - 同步更新单测 `src/app/api/contact/__tests__/contact-api-utils.test.ts`

### Unused 检测工具的可信度问题（knip 结果明显不靠谱）

- 证据：运行 `pnpm unused:production`（knip）输出“Unused dependencies (28)”，甚至包含 `react-dom` / `next` 等基础依赖。
- 影响：这类报告如果没人信，就等于没装；更糟的是会浪费维护者时间。
- 建议：修 `knip.jsonc`（Next.js App Router + TS `moduleResolution: bundler` 场景），否则就别把它当门禁/决策依据。

## 工具异常

- [2026-02-03] `codebase-retrieval` MCP tool 返回 “Tool not found”，无法做 ACE 语义扫描；后续用 `rg`/文件阅读替代。
