# Linus 审查报告：tianze-website

> 目标：把“能跑”提升到“值得维护、值得扩展、不会在生产里自爆”。  
> 口径：问题分级（P0/P1/P2/P3），每条都要有证据（文件/位置/命令输出）。

## P0（必须立刻修，不修就等着出事故）

（目前未发现“立刻会炸”的单点；但下面的 P1 有几条已经在往事故方向走。）

## P1（应该尽快修，影响稳定性/成本/性能）

- 常量语义崩坏（这是在给未来埋雷）
  - `src/app/api/contact/contact-api-validation.ts`：用 `ANIMATION_DURATION_VERY_SLOW` 参与“10 分钟”计算。
  - `src/lib/airtable/service.ts`：用 `ANIMATION_DURATION_VERY_SLOW` 作为 Airtable `maxRecords`。
  - 结论：这不是“无魔法数字”，这是“把魔法数字改名伪装”。该拆：时间常量回 `src/constants/time.ts`，动画常量只准存在于 UI。
- 自己写的约束自己不遵守（文件行数上限已被突破）
  - `src/lib/i18n-validation.ts`（556 行）
  - `src/lib/lead-pipeline/process-lead.ts`（521 行）
  - `src/lib/airtable/service.ts`（521 行）
- `middleware.ts` 的 cookie 写入重复且口径不一致
  - `middleware.ts#setLocaleCookie()` 同时写 cookie API + 手工 `set-cookie` header；sameSite 也与安全规则口径不一致。
  - `src/i18n/routing-config.ts` 里定义了 `localeCookie.maxAge`，但 `middleware.ts` 写 cookie 时没带 `maxAge`，等于把“持久化偏好”变成了 session cookie（而且还可能写两份）。
- CSP report 日志包含可识别信息（已修）
  - 原问题：`src/app/api/csp-report/route.ts` 日志里包含客户端 IP 链/可疑样本。
  - 修复：统一用 `sanitizeIP`/`sanitizeLogContext` 记录，避免 PII 进入日志。
- “为过 require-await 而写假异步”已经蔓延
  - `src/lib/content/products.ts` / `src/lib/content/blog.ts`：大量 `await Promise.resolve(...)`
  - 结论：lint 在驱动你写更差的代码。要么关规则，要么改实现（别做这种自欺欺人的 await）。

## P2（可以修，主要是维护性/一致性）

- 规避式实现：为了过 ESLint 写了一个小型“订阅系统”
  - `src/components/forms/lazy-turnstile.tsx`：`useSyncExternalStore` + 手写订阅者集合 + IntersectionObserver + idle fallback。
  - 建议：对该文件允许 `useEffect`（最小豁免），别为了“形式正确”牺牲可维护性。
- `next.config.ts` 里出现“假 await”
  - `next.config.ts#headers()`：`await Promise.resolve()` 纯属自欺欺人。
- i18n-validation 仅测试引用（已迁出生产路径）
  - 原：`src/lib/i18n-validation.ts`（巨大 Unicode regex “安全校验”收益接近 0）
  - 现：`src/test/i18n-validation.ts`（仅测试使用）
- 一堆“看起来像生产代码”的东西实际只被测试引用
  - ✅ `src/lib/security-rate-limit.ts`：已删除（仅测试引用 + import 即启动 `setInterval` 副作用）
  - ✅ `src/app/api/contact/contact-api-utils.ts#checkRateLimit()`：已删除（生产实际走 `withRateLimit`/`distributed-rate-limit`，重复实现只会制造歧义）
  - 结论：测试覆盖率再高也没意义——别给死代码写测试。

## P3（品味问题：不修也能活，但会越来越难看）

- 配置与 env 定义疑似重复（两个“权威源”）
  - `env.mjs` 与 `src/lib/env.ts` 结构高度相似但不完全一致；这类东西应该只有一个真相源。
- Unused 检测工具输出明显失真
  - `pnpm unused:production` 报告 `react-dom`/`next` 等“未使用”，这说明配置基本不可用。

## 重构建议（拒绝补丁版）

- 建立“语义常量”层：时间/容量/HTTP 状态码/重试策略等（把 UI 动画常量从服务端逻辑里驱逐出去）。
- 拆文件而不是堆更多 lint-disable：
  - `src/lib/lead-pipeline/process-lead.ts` 拆成：`timeouts.ts`、`services/resend.ts`、`services/airtable.ts`、`orchestrator.ts`（薄层）。
  - `src/lib/airtable/service.ts` 拆成：`client.ts`（连接/初始化）、`records.ts`（CRUD）、`stats.ts`（统计）。
- `middleware.ts`：删除手写 `set-cookie` header，只保留一种写法；把 locale 来源统一到 `routing-config`（不要再有第三份 locale 列表）。

## 可执行 TODO（按顺序）

1. ✅ 把所有“拿错名字当数字”的常量替换为语义正确的常量（先从 `contact-api-validation.ts` 和 `airtable/service.ts` 开刀）。
2. ✅ `middleware.ts`：去重 cookie 写入逻辑 + 统一策略（maxAge/单一写法）。
3. ✅ 把 `process-lead.ts` / `airtable/service.ts` / `i18n-validation.ts` 拆到 ≤500 行（`i18n-validation.ts` 已迁出生产路径 → `src/test/i18n-validation.ts`）。
4. ✅ `lazy-turnstile.tsx`：把“规避式 store”改回正常 hook（`useEffect` + `requestIdleCallback` + IntersectionObserver）。
