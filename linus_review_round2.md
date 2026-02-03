# Linus 审查报告 Round 2：tianze-website

> 目标：上一轮“能维护”的整改做完了，这一轮看的是：哪里还在偷偷变复杂、哪里还在“补丁驱动”、哪里还在用测试掩盖设计失败。
>
> 口径：P0/P1/P2/P3 分级；每条必须带证据（文件路径/符号/命令输出摘要）。

## P0（必须立刻修：安全/数据泄露/资金或业务中断风险）

- **Rate limit key 直接包含原始 IP（PII 写进存储 key）**
  - 证据：`src/app/api/csp-report/route.ts:155`、`src/app/api/whatsapp/webhook/route.ts` 直接 `checkDistributedRateLimit(clientIP, ...)`；`src/lib/security/distributed-rate-limit.ts` 将 identifier 拼进 `ratelimit:${preset}:${identifier}`。
  - 影响：一旦启用 Upstash/KV 等外部存储，真实 IP 会进入持久化 key；同时不同路由 key 语义分叉（hash vs raw）。
  - 正确方向：强制所有路由走 `src/lib/api/with-rate-limit.ts`（或至少用 `getIPKey()`/`getApiKeyPriorityKey()` 生成 identifier），禁止在路由里直接传 raw IP。

- **Client IP 信任边界分叉（同一项目出现多套“手写 header 解析”）**
  - 证据：可信模型 `src/lib/security/client-ip.ts`；分叉实现见 `src/app/actions.ts`、`src/app/api/contact/contact-api-utils.ts`、`src/app/api/csp-report/route.ts`、`src/app/api/whatsapp/webhook/route.ts`；`src/app/api/cache/invalidate/route.ts` 甚至从 contact utils 里 import `getClientIP()`。
  - 影响：安全边界不一致会让 rate limit / 日志 / 风控在不同路径下表现不同；一旦出现“可控 header/直连 origin”场景，就会被绕过。
  - 正确方向：IP 提取必须只有一个入口（`src/lib/security/client-ip.ts`），其他地方全删/改用该入口（必要时新增 `getClientIPFromHeaders(headers: Headers)` 同源实现）。

## P1（应尽快修：稳定性/成本/性能的主要来源）

- **`scripts/check-eslint-disable-usage.js` 失真：门禁脚本当前不可信**
  - 证据：`pnpm eslint:disable:check` 发现 39 个文件，36 个违规；脚本 `FORBIDDEN_PATTERNS` 基本禁止 `src/app`/`src/lib`/`src/components` 全部；且只扫描 `src/` 却配置允许 `scripts/`、`tests/`。
  - 影响：门禁变噪音，逼人写补丁；长期会被忽略（忽略的门禁 = 没门禁）。
  - 正确方向：要么删掉这个脚本，要么重写为“只校验禁用是否最小化且有理由”（不再按目录一刀切）。

- **`require-await` 把问题扩散进业务/内容层（假 async/假 await）**
  - 证据：`next.config.ts:121`、`src/lib/content/blog.ts`、`src/lib/content/products.ts` 出现 `await Promise.resolve(...)`。
  - 影响：你在用“假动作”喂饱工具，污染实际代码。
  - 正确方向：
    - config 文件：删掉假 await（不为 lint 写假动作）；必要时只对 config override `require-await: off`。
    - content wrappers：承认 Next.js `"use cache"` 的框架约束（必须是 `async`），所以不要为了“去 async”硬改类型；正确做法是删除假 await，并用最小范围的 `require-await` 豁免（带理由）把冲突显式化。

- **`src/lib/idempotency.ts` import 即启动 `setInterval`（全局副作用）**
  - 证据：`src/lib/idempotency.ts:58` 顶层 `setInterval(...)`；被 `src/app/api/subscribe/route.ts` 引用。
  - 影响：serverless/并发环境里生命周期不可控，成本和行为不可预测；测试/本地/生产行为分叉。
  - 正确方向：删掉 interval，改为读写时顺便清理；或者用外部 TTL store。顺带：`withIdempotency()` 的 `options.ttl` 目前未被使用，属于“接口撒谎”，要么实现要么删掉。

- **env 真相源仍未收敛（`env.mjs` 与 `src/lib/env.ts` 并存）**
  - 证据：根目录 `env.mjs` 与 `src/lib/env.ts` 都是 `createEnv()`；并且测试中仍大量 mock `env.mjs`（`grep -R \"env.mjs\"` 可见）。
  - 影响：两套 schema = 没 schema；测试可能在 mock “死模块”，掩盖真实生产路径。
  - 正确方向：删掉其中一个（推荐保留 `src/lib/env.ts`），并统一所有 mock/引用到同一模块。

## P2（可以修：一致性/可维护性/长期演进）

- **常量政策继续制造“语义污染”（用无关常量拼数）**
  - 证据：`src/lib/lead-pipeline/lead-schema.ts` 使用 `MAGIC_255 - 1`、`PERCENTAGE_FULL + PERCENTAGE_FULL`、`MAGIC_2500 + MAGIC_2500` 等构造 validation 上限。
  - 影响：常量名表达的语义与实际用途不一致，维护者会被误导；任何常量调整都可能误伤校验逻辑。
  - 正确方向：建立独立的 validation 常量域（`src/constants/validation-limits.ts`），并允许该域使用字面量；不要再用“数学拼图”绕规则。

- **`pnpm lint:check` 与“零 warnings”口径存在潜在分叉**
  - 证据：`package.json` 的 `lint:check` 没有 `--max-warnings 0`；而项目口径（`CLAUDE.md`/`.claude/rules/quality-gates.md`）强调零 warnings。
  - 影响：开发者本地跑 `pnpm lint:check` 得到“通过”，但 CI/quality gate 可能按另一套口径判断；浪费时间。
  - 正确方向：把“零 warnings”收敛到单一入口（建议让 `lint:check` 也阻断 warnings，或明确只用 `quality:gate` 作为唯一阻断入口）。

## P3（品味问题：不修也能活，但会越来越难看）

- **测试基础设施过度集中（`src/test/setup.ts` 1821 行 + 全局 eslint-disable）**
  - 证据：`src/test/setup.ts` 顶部 `/* eslint-disable max-lines-per-function, max-lines */`，文件体量 1821 行。
  - 影响：这是“万能大桶”。任何测试故障都可能被这个文件的隐式副作用影响；维护成本会随时间指数上升。
  - 正确方向：按职责拆（env mocks、fetch mocks、next-intl mocks、timers、testing-library 配置等），让每个模块可单独理解与复用。

## 建议的整改顺序（拒绝补丁版）

1. 统一 client IP 与 rate limit key：禁止 raw IP identifier；所有路由统一走 `withRateLimit` + `getClientIP`（可信代理模型）。
2. 删掉 `src/lib/idempotency.ts` 的顶层 `setInterval`，并让 `options.ttl` 要么生效要么消失。
3. 修 `require-await` 的作用域：config 关掉，content wrappers 去 async，删掉所有 `await Promise.resolve(...)`。
4. 处理 `eslint:disable:check`：删掉或重写成“格式/理由校验”，不要按目录一刀切。
5. env 真相源收敛：保留一个 `env` 模块，清理另一套及相关 mock。
6. 建立 validation 常量域，停止“数学拼数”绕规则。
7. 拆 `src/test/setup.ts`，降低全局副作用。

## 可执行 TODO（按顺序）

1. 收敛 IP 提取与 rate limit key：
   - 把 `src/app/api/csp-report/route.ts`、`src/app/api/whatsapp/webhook/route.ts`、`src/app/api/cache/invalidate/route.ts` 改为使用 `src/lib/api/with-rate-limit.ts`（或至少使用 `getIPKey()` 生成 identifier）。
   - 删除/废弃 `src/app/api/contact/contact-api-utils.ts#getClientIP/getFullClientIPChain`，统一改用 `src/lib/security/client-ip.ts`（必要时新增 headers 适配函数）。
2. 重构 `src/lib/idempotency.ts`：
   - 删除顶层 `setInterval`；实现“访问时清理”。
   - 要么实现 `options.ttl`，要么删除该选项（别让接口撒谎）。
3. 清理假 async：
   - `next.config.ts` 通过 ESLint override 关闭 `require-await`（删 `await Promise.resolve()`）。
   - `src/lib/content/blog.ts`、`src/lib/content/products.ts` 删除所有 `await Promise.resolve(...)`；保留 `async`（Next.js `"use cache"` 约束），并用最小范围的 `require-await` 豁免（带理由）替代“假 await”。
4. 修/删 `eslint:disable:check`：
   - 若保留：重写 `scripts/check-eslint-disable-usage.js`，只检查“禁用粒度 + rule 名 + 理由”，不要用目录黑名单。
5. env 真相源收敛：
   - 决定 `env.mjs` vs `src/lib/env.ts` 的唯一入口并清理另一套；同步清理测试 mock 路径与 `env.d.ts`。
6. 建立 validation 常量域，停止“数学拼数”绕规则：
   - 在 `src/constants/validation-limits.ts` 定义 lead 相关的语义上限（email/company/name/message 等）。
   - `src/lib/lead-pipeline/lead-schema.ts` 只消费语义常量，删除所有拼数逻辑。
7. 拆 `src/test/setup.ts`，降低全局副作用：
   - 按职责拆分 mocks（fetch/next/next-intl/env/web APIs 等），让每个模块可单独理解与复用。

## 实施进度

- [2026-02-03] ✅ TODO 1（收敛 IP 提取与 rate limit key）已落地；验证：`pnpm type-check`、`pnpm lint:check`、`pnpm test` 通过。
- [2026-02-03] ✅ TODO 2（重构 `src/lib/idempotency.ts`：移除顶层副作用 + `ttl` 生效）已落地；验证：`pnpm type-check`、`pnpm lint:check`、`pnpm test` 通过。
- [2026-02-03] ✅ TODO 3（清理假 async：next.config + content wrappers）已落地：
  - config：删除 `await Promise.resolve(...)`；
  - content wrappers：保留 `async`（`"use cache"` 约束）+ 删除假 await + 局部豁免 `require-await`（带理由）。
  - 验证：`pnpm type-check`、`pnpm lint:check`、`pnpm test` 通过。
- [2026-02-03] ✅ TODO 4（修/删 `eslint:disable:check`）已落地：门禁脚本重写为“rule 名 + 理由”校验；验证：`pnpm eslint:disable:check` 通过。
- [2026-02-03] ✅ TODO 5（env 真相源收敛：删除 `env.mjs` + 统一 mock/声明）已落地；验证：`pnpm type-check`、`pnpm lint:check`、`pnpm test` 通过。
- [2026-02-03] ✅ Phase 6（最终回归验证）通过：`pnpm type-check`、`pnpm lint:check`、`pnpm eslint:disable:check`、`pnpm format:check`、`pnpm test`、`pnpm build`、`pnpm quality:gate:fast`。
- [2026-02-03] ✅ P2（validation 常量语义收敛）已落地：
  - `src/constants/validation-limits.ts` 新增 lead 相关语义上限；
  - `src/constants/index.ts` 聚合导出；
  - `src/lib/lead-pipeline/lead-schema.ts` 删除拼数逻辑，直接使用语义常量。
  - 验证：`pnpm type-check`、`pnpm lint:check`、`pnpm test` 通过。
- [2026-02-03] ✅ P3（拆分 `src/test/setup.ts`）已落地：
  - 入口文件 `src/test/setup.ts` 保留（Vitest `setupFiles` 路径不变），按职责拆分到 `src/test/setup.*.ts`；
  - 同时把 lucide-react mock 收敛为“仅导出仓库实际使用的图标名”。
  - 验证：`pnpm type-check`、`pnpm lint:check`、`pnpm format:check`、`pnpm test` 通过。
- [2026-02-03] ✅ P2（`pnpm lint:check` 零 warnings 口径收敛）已落地：
  - `package.json#scripts.lint:check` 增加 `--max-warnings 0`（本地与 CI 口径对齐）。
  - 验证：`pnpm lint:check` 通过。
