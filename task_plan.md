# Task Plan: 代码质量重构 — 5 项优先级任务

## Goal

执行代码审查后确定的 5 项重构任务，采用 TDD 原则和 Swarm Mode 并行处理，消除代码重复和提高抽象采用率。

## Current Phase

**COMPLETED** ✅

## Phases

### Phase 1: 验证器工厂函数 (firstName/lastName)

- [x] 阅读现有测试文件，理解测试覆盖
- [x] 实现 `createNameValidator()` 工厂函数
- [x] 重构 `firstName` 和 `lastName` 使用工厂函数
- [x] 运行测试确认通过 — 44 tests passed
- **Status:** ✅ complete
- **Files:** `src/lib/form-schema/contact-field-validators.ts`
- **Result:** 消除 ~20 行重复代码

### Phase 2: API Routes 统一 withRateLimit + HTTP 常量

- [x] 添加 HTTP 常量: `HTTP_TOO_MANY_REQUESTS`, `HTTP_INTERNAL_ERROR`
- [x] 重构 routes 使用 `withRateLimit` HOF
- [x] 替换魔法数字为常量引用
- [x] 运行测试确认通过 — 296 tests passed
- **Status:** ✅ complete (Swarm Agent A)
- **Files:**
  - `src/app/api/contact/route.ts`
  - `src/app/api/inquiry/route.ts`
  - `src/app/api/subscribe/route.ts`
  - `src/constants/magic-numbers.ts`
  - `src/lib/api/with-rate-limit.ts`
- **Result:** 消除每个 route 10-15 行样板代码

### Phase 3: language-toggle 路由解析逻辑提取

- [x] 创建 `src/lib/i18n/route-parsing.ts`
- [x] 提取 `LinkHref`, `DYNAMIC_ROUTE_PATTERNS`, `LOCALE_PREFIX_RE`
- [x] 提取 `normalizePathnameForLink`, `parsePathnameForLink`
- [x] 组件改为导入 lib 函数
- [x] 运行测试确认通过 — 5707 tests passed
- **Status:** ✅ complete (Swarm Agent B)
- **Files:**
  - `src/components/language-toggle.tsx`
  - `src/lib/i18n/route-parsing.ts` (新建)
- **Result:** 路由解析逻辑可复用

### Phase 4: processLead 编排拆分

- [x] 分析 `processLead` 函数结构
- [x] 确认辅助函数已提取: `processContactLead`, `processProductLead`, `processNewsletterLead`
- [x] 验证 ESLint: complexity=18, max-statements=33
- [x] 结论: eslint-disable 是合理的编排函数例外
- **Status:** ✅ complete (已预先重构)
- **Files:** `src/lib/lead-pipeline/process-lead.ts`
- **Result:** 无需修改 — 重构已完成

### Phase 5: cookie-banner 状态整合 (最低优先级)

- [x] 评估是否值得重构 → ROI 不高
- **Status:** ⏭️ skipped
- **Rationale:** Phase 1-4 已完成主要价值任务

## Key Questions

1. ✅ `contact-field-validators.ts` 是否有测试？→ 是，44 tests
2. ✅ API routes 哪些未使用 `withRateLimit`？→ contact, inquiry, subscribe (已修复)
3. ✅ `processLead` 测试覆盖率？→ 13 tests，辅助函数已提取

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| TDD 原则 | 先测试后重构，确保行为不变 |
| Swarm Mode 并行 | Phase 2-3 成功并行执行 |
| 跳过 cookie-banner | 优先级最低，ROI 不高 |
| 保留 processLead eslint-disable | 编排函数的合理例外 |

## Errors Encountered

| Error | Attempt | Resolution |
|-------|---------|------------|
| ESLint require-await (subscribe) | 1 | 添加 return await |
| ESLint no-return-await 冲突 | 2 | 提取 handlePost 函数 |
| Prettier 格式问题 | 1 | pnpm format:write |

## Final Verification

- ✅ Full CI: 19/19 checks passed
- ✅ TypeScript: no errors
- ✅ ESLint: no errors
- ✅ Tests: all passed
- ✅ Build: successful

---

# Task Plan: Linus 多维度项目审查（tianze-website）

## Goal

用“能跑不是标准”的视角，把当前项目从架构、数据流、安全、性能、测试、可维护性几个维度逐步审查，产出一份可以直接开工的整改清单（按优先级/ROI 排序），并明确哪些是“补丁”、哪些必须重构。

## Phases

- [x] Phase 1: 基线扫描（依赖、脚本、CI、约束是否自洽）
- [x] Phase 2: 架构与数据流（路由/i18n/cacheComponents/内容系统）
- [x] Phase 3: 安全（API routes、validation、rate limit、CSP/headers、敏感数据边界）
- [x] Phase 4: 性能与体验（Lighthouse budget、图片/字体、RSC/CSR 边界、hydration 风险）
- [x] Phase 5: 质量与测试（覆盖率、测试结构、易碎测试、异常处理一致性）
- [x] Phase 6: 输出审查报告（问题分级、重构建议、可执行 TODO）

## Key Questions

1. 项目里有没有“为了兼容/为了灵活”而存在的复杂度？能不能删掉？
2. 关键数据结构（content、leads、inquiry）是否在类型层面就能消灭特殊情况？
3. 目前最大的真实风险是性能、SEO、还是安全？证据是什么（脚本/报告/代码位置）？

## Decisions Made

- 先只做审查与清单，不做“打补丁式修修补补”；除非发现明确的安全漏洞或明显的错误。

## Errors Encountered

- [2026-02-03] `codebase-retrieval` MCP tool 不可用（Tool not found）—— 无法按 CLAUDE.md 要求做 ACE 语义扫描；改用 repo 内搜索（rg/sed）完成审查证据收集。

## Status

**COMPLETED** ✅

审查输出：
- `notes.md`：证据与滚动记录
- `linus_review.md`：分级问题清单 + 重构建议 + TODO

验证：
- `pnpm format:check`
- `pnpm vitest run src/app/api/csp-report/__tests__ --run`

---

# Task Plan: 按 Linus 审查报告实施整改（tianze-website）

## Goal

按 `linus_review.md` 的 TODO 顺序落地整改：先修“语义常量污染”和 `middleware` 的不稳定 cookie 行为，再拆大文件/删死代码/修门禁，让代码回到可理解、可维护的状态。

## Phases

- [x] Phase 1: 语义常量修复（把 ANIMATION_* 从服务端/安全/业务逻辑里驱逐出去）
- [x] Phase 2: middleware locale cookie 去重 + 策略对齐（maxAge/sameSite/单一写法）
- [x] Phase 3: 拆大文件（`process-lead.ts` / `airtable/service.ts` / `i18n-validation.ts`）
- [x] Phase 4: 清理“测试里活着、生产里死掉”的代码/模块（或补齐真实调用）
- [x] Phase 5: 回归验证（type-check/lint/test/必要 E2E）+ 更新 `linus_review.md`

## Key Questions

1. 语义常量重构会不会引发“隐性行为变化”？（用测试锁住）
2. locale cookie 改动会不会影响 next-intl 的 localeDetection？（用 NextRequest/NextResponse 单测锁住）
3. 拆文件优先拆“边界明确”的块还是“最复杂”的块？（优先边界明确，避免重构变成补丁）

## Decisions Made

- 优先做“消除错误语义”的硬修复；不做“换个名字继续糊”的补丁。
- 任何行为变化必须用测试证明；没有测试就先补测试再改。

## Errors Encountered

- [2026-02-03] Vitest 直接导入 `next-intl/middleware` 失败（ERR_MODULE_NOT_FOUND: `next/server` vs `next/server.js`）—— 在单测中 mock `next-intl/middleware`，只验证我们自己的 cookie 逻辑（见 `src/__tests__/middleware-locale-cookie.test.ts`）。
- [2026-02-03] `pnpm vitest run src/lib/__tests__/airtable-*.test.ts --run` 提示 “No test files found” —— Vitest 的 filter 参数不展开 glob；改为显式列出测试文件路径运行。

## Status

**COMPLETED** ✅

Phase 3 明细：
- [x] `src/lib/lead-pipeline/process-lead.ts` 拆分（编排层瘦身 + processors/timeout/observability 等模块化）
- [x] `src/lib/airtable/service.ts` 拆分（抽到 `src/lib/airtable/service-internal/*`，公共 API 不变）
- [x] `src/lib/i18n-validation.ts` 迁出生产路径 → `src/test/i18n-validation.ts`（仅测试引用）

Phase 4 明细：
- [x] 删除 `src/lib/security-rate-limit.ts`（仅测试引用 + import 即启动 `setInterval` 的副作用，在 serverless/edge 下没有任何好处）
- [x] 删除 `src/app/api/contact/contact-api-utils.ts` 内的 in-memory rate limit（`checkRateLimit`/`getRateLimitStatus`/`cleanupRateLimitStore`/`RATE_LIMIT_CONFIG`），避免与 `withRateLimit`/`distributed-rate-limit` 重复且引入副作用
- [x] `src/components/forms/lazy-turnstile.tsx`：删掉“订阅系统”，回到可读的 `useEffect`/`useState`（无需新增 ESLint 豁免）

Phase 5 明细：
- [x] `pnpm type-check`
- [x] `pnpm lint:check`
- [x] `pnpm format:check`
- [x] `pnpm test`

---

# Task Plan: Linus 多维度项目审查 Round 2（tianze-website）

## Goal

在上一轮整改完成后，再做一轮“Linus 标准”的全量巡检：从数据结构、边界条件、模块边界、错误处理一致性、安全边界、性能与构建产物、测试可维护性等维度找出新的问题，并产出可直接开工的整改清单（按 P0/P1/P2/P3 分级）。

## Phases

- [x] Phase 1: 基线与门禁（type-check/lint/test/build/quality gate）+ 风险面盘点
- [x] Phase 2: 架构与数据流（RSC/CSR 边界、i18n、内容系统、lead pipeline、API 组合模式）
- [x] Phase 3: 安全（headers/CSP、input validation、rate limit、日志与 PII、server-only 边界）
- [x] Phase 4: 性能（Lighthouse budget、bundle/SSR、缓存策略、图片/字体、动态 import）
- [x] Phase 5: 质量与测试（测试结构、重复/易碎点、mock 体系、覆盖“关键路径”的真实性）
- [x] Phase 6: 输出审查报告（`linus_review_round2.md`）+ 更新 `notes.md` 证据链

## Key Questions

1. 现在项目里最像“补丁味”的代码在哪里？能不能删除而不是修补？
2. 还有哪些“特殊情况”其实是数据结构设计失败？（应该在类型/建模层消掉）
3. 真实生产风险排序：安全 / 性能 / 可维护性，哪一个证据最硬？

## Decisions Made

- 不在本轮审查里顺手“改一点点”来让报告看起来更好；除非发现明确 P0（安全/数据泄露/逻辑错误）。

## Errors Encountered

- [2026-02-03] `codebase-retrieval` MCP tool 不可用（Tool not found）—— 无法做 ACE 语义扫描；继续用 `grep`/文件阅读/脚本门禁生成证据。
- [2026-02-03] `rg` 不存在（command not found）—— 搜索改用 `grep -R`。

## Status

**COMPLETED** ✅

验证：
- ✅ `pnpm quality:gate:fast`（Code Quality + Security 通过，Coverage/Performance 在 fast 下跳过）
- ❌ `pnpm eslint:disable:check` 仍失败（门禁脚本与仓库现实冲突，见 `notes.md` / `linus_review_round2.md`）

输出：
- `notes.md`：Round 2 证据链已补齐
- `linus_review_round2.md`：P0-P3 分级 + TODO 已补齐

---

# Task Plan: 开始实施 linus_review_round2.md（tianze-website）

## Goal

按 `linus_review_round2.md` 的可执行 TODO 顺序落地整改：先收敛 client IP / rate limit key（P0），再修全局副作用与假 async（P1），最后处理门禁与 env 真相源收敛。

## Phases

- [x] Phase 1: 收敛 IP 提取与 rate limit key（P0）
- [x] Phase 2: 重构 `src/lib/idempotency.ts`（移除顶层副作用 + ttl 真相）（P1）
- [x] Phase 3: 清理假 async（require-await 扩散点）（P1）
- [x] Phase 4: 修/删 `eslint:disable:check`（门禁可信化）（P1）
- [x] Phase 5: env 真相源收敛（`env.mjs` vs `src/lib/env.ts`）（P1）
- [x] Phase 6: 回归验证 + 更新文档（type-check/lint/test/build + 更新 `linus_review_round2.md`/`notes.md`）

## Key Questions

1. API route 是否还有绕过 `withRateLimit` 的直接调用（尤其是 `checkDistributedRateLimit(clientIP, ...)`）？
2. `withIdempotency()` 的 `options.ttl` 是否应该保留（对外 API 是否已有调用）？
3. env 模块是否存在运行时差异（Edge vs Node）导致不能简单合并？

## Decisions Made

- 只做“收敛入口/删除分叉”级别的修复；拒绝为了过 lint 写 `await Promise.resolve(...)` 这种补丁。
- 若 `codebase-retrieval` 仍不可用，所有证据与变更用 `grep -R` + 直接读文件完成，并将关键证据写回 `notes.md`。

## Errors Encountered

- [2026-02-03] `pnpm lint:check` 报 `require-await`（`src/lib/content/blog.ts` / `src/lib/content/products.ts`）—— 根因：`"use cache"` wrapper 必须 `async`（Next.js 约束），但逻辑是同步计算；修复：删除假 `await`，并用最小范围的 `/* eslint-disable require-await -- reason */` 显式标注框架约束。
- [2026-02-03] `pnpm format:check` 失败（3 files）—— 修复：对 `scripts/check-eslint-disable-usage.js`、`src/app/api/verify-turnstile/route.ts`、`src/lib/security/__tests__/client-ip.test.ts` 运行 `prettier --write`。

## Status

**COMPLETED** ✅

最终回归验证（2026-02-03）：
- ✅ `pnpm type-check`
- ✅ `pnpm lint:check`
- ✅ `pnpm eslint:disable:check`
- ✅ `pnpm format:check`
- ✅ `pnpm test`
- ✅ `pnpm build`
- ✅ `pnpm quality:gate:fast`

---

# Task Plan: Round 2 后续治理（P2/P3）（tianze-website）

## Goal

继续推进 `linus_review_round2.md` 的剩余项：修复 validation 常量“语义污染”（P2），并拆分 `src/test/setup.ts`（P3）以删除大桶文件与全局 eslint-disable。

## Phases

- [x] Phase 1: P2 — validation 常量域收敛（lead schema 不再“数学拼数”）
- [x] Phase 2: P3 — 拆分 `src/test/setup.ts`（按职责拆分为多文件）
- [x] Phase 3: 回归验证（type-check/lint/format/test）

## Key Questions

1. lead pipeline 的校验上限是否能用语义常量表达，而不是复用无关常量（percentage/magic）拼数？
2. `src/test/setup.ts` 是否能保留行为不变的前提下拆分，并移除文件级 eslint-disable？

## Decisions Made

- validation 上限作为“真语义常量”落在 `src/constants/validation-limits.ts`（常量域允许字面量），生产代码只消费语义名，不再消费“拼数”。
- `src/test/setup.ts` 保留为 Vitest 入口文件（`vitest.config.mts#setupFiles` 不变），改为按职责 side-effect import 多个 setup 模块。
- lucide-react mock 从“导出一大坨不相关图标”收敛为“仅导出仓库实际使用的图标名”（缺失时让测试显式失败）。

## Errors Encountered

- [2026-02-03] `pnpm type-check` 报 TS1355（`as const` 不能用于引用表达式）—— 位置：`src/constants/validation-limits.ts`；修复：`MAX_LEAD_PRODUCT_NAME_LENGTH` 直接引用 `MAX_LEAD_COMPANY_LENGTH`，移除多余 `as const`。
- [2026-02-03] `pnpm format:check` 失败（新增 setup 拆分文件未格式化）—— 修复：对 `src/test/setup*.ts` 运行 `prettier --write`。

## Status

**COMPLETED** ✅

验证（2026-02-03）：
- ✅ `pnpm type-check`
- ✅ `pnpm lint:check`
- ✅ `pnpm format:check`
- ✅ `pnpm test`

---

# Task Plan: 收敛 ESLint “零 warnings” 口径（tianze-website）

## Goal

让 `pnpm lint:check` 与项目“零 warnings”口径一致，避免本地通过但 CI/quality gate 失败的分叉。

## Phases

- [x] Phase 1: 更新 `package.json#scripts.lint:check` 增加 `--max-warnings 0`
- [x] Phase 2: 回归验证（lint/format）

## Status

**COMPLETED** ✅

验证（2026-02-03）：
- ✅ `pnpm lint:check`
- ✅ `pnpm format:check`
