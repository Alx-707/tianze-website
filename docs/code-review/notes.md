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

## Round 4 Kickoff（2026-03-06）

### 本轮目标
- 不沿用上一轮结论做增量修补，而是重新做一遍全仓库扫荡式审查。
- 最终只保留“当前仍成立”的问题到 `docs/code-review/issues.md`，把历史已修复项和当前新问题彻底拆开。

### 本轮交付口径
- 证据与命令输出摘要：`docs/code-review/notes.md`
- 当前权威问题清单：`docs/code-review/issues.md`
- 总体进度与轮次状态：`task_plan.md`
- 收尾执行入口：`docs/code-review/round4-remediation-plan.md`

### 审查原则
- 先自动化，再人工深审：避免只靠印象找问题。
- 优先抓“系统性问题”，不是堆零碎样式建议。
- 测试通过不算安全；要专门检查“测试是否掩盖设计失败”。
- 文档若与当前代码现实不符，以代码与复现实验为准，再回写文档。

### 采用的 skill 组合
- `planning-with-files`
  - 作用：把计划、证据、问题清单稳定落盘，避免全仓库扫荡中途漂移。
- `Linus`
  - 作用：优先识别补丁驱动复杂度、特殊分支、共享 helper 污染和“补修不重构”的坏味道。
- `testing-qa`
  - 作用：把测试设计、门禁可信度、回归覆盖缺口纳入正式审查面。
- `debugging-strategies`
  - 作用：对失败测试和异常门禁先做最小复现，再下结论，避免把噪音当产品缺陷。
- `performance-optimization`
  - 作用：性能问题按 baseline → bundle → runtime 路径拆解，不凭感觉判。
- `next-best-practices`
  - 作用：针对 Next.js 16、App Router、proxy/cache/route handler 边界做框架级复核。

### Round 4 基线扫描（第一波，2026-03-06）

#### 工作树与环境
- `git status --short`
  - 当前工作树为脏状态。
  - 已见变更：`docs/code-review/issues.md`、`docs/code-review/notes.md`、`linus_review_round3.md`、`notes.md`、`task_plan.md`
  - 未跟踪：`docs/code-review/round3-review.md`
- `node -v`
  - 当前本机 Node 为 `v22.22.0`
  - 需持续注意与历史文档中 CI Node 20 口径的偏差，避免误判

#### 已确认结果
- `pnpm type-check`
  - 通过（exit code 0，无输出错误）
- `pnpm lint:check`
  - 通过（exit code 0，无 warnings）
- `pnpm unused:production`
  - 通过（exit code 0，无 production dependency 问题）
- `pnpm arch:check`
  - 通过：`✔ no dependency violations found (461 modules, 1138 dependencies cruised)`
- `pnpm security:check`
  - `pnpm audit --prod --audit-level moderate`：`No known vulnerabilities found`
  - `pnpm security:semgrep`：`Semgrep ERROR findings: 0`、`Semgrep WARNING findings: 0`
- `pnpm build`
  - 构建通过
  - 命中 Next.js 告警：`The "middleware" file convention is deprecated. Please use "proxy" instead.`
  - 该项属于框架迁移技术债，需要在问题清单中保留，不应因 build 通过而忽略

#### 测试基线
- `pnpm test`
  - 最终汇总（`reports/test-results.json`）：
    - `numTotalTests: 5724`
    - `numPassedTests: 5724`
    - `numFailedTests: 0`
    - `numPendingTests: 0`
- 额外观察
  - 全量测试全绿，但此前单独运行 `mobile-navigation-responsive-basic.test.tsx` 与 `mobile-navigation-responsive.test.tsx` 的 wall-clock 用例时，曾分别复现出 `2238ms` 与 `2397ms` 的失败。
  - 该现象表明当前至少存在“在全量运行下可能被掩盖、在局部运行下会抖动”的脆弱测试门禁，属于 Round 4 需要单独定级的 QA 风险。

### Round 4 框架级初步发现（Next.js / App Router）

- `src/middleware.ts` 仍是当前生效入口，`pnpm build` 已明确给出官方弃用告警：
  - `The "middleware" file convention is deprecated. Please use "proxy" instead.`
  - 证据：`src/middleware.ts` 当前仍导出默认 `middleware()`；构建链路已把迁移债暴露出来。
- 根路径 `/` 目前依赖 `src/app/page.tsx` 做额外 redirect 兜底：
  - 注释直接写明“因 Turbopack matcher 不稳定，由 `src/app/page.tsx` 处理 root path”
  - 这说明根路径语言路由从框架约定退化成了页面层补丁。
- `html[lang]` 当前不是服务端正确输出，而是客户端 hydration 后修正：
  - `src/app/layout.tsx` 将 `<html lang>` 固定为 `routing.defaultLocale`
  - `src/app/layout.tsx` 在 `<html>` / `<body>` 上启用了 `suppressHydrationWarning`
  - `src/app/[locale]/layout.tsx` 通过 `LangUpdater` 在客户端 `useEffect` 中改写 `document.documentElement.lang`
  - 这意味着无 JS / 爬虫 / 首屏 SSR 读取到的文档语言可能是错的，属于真实语义偏差。
  - 下游组件已开始依赖 `document.documentElement.lang` 判断当前语言：
    - `src/components/layout/mobile-navigation.tsx`
    - `src/components/language-toggle.tsx`
- 根路径 `/` 的 locale 路由也不是由单一入口负责：
  - `src/app/page.tsx` 明确作为 root path redirect 补丁存在
  - `src/middleware.ts` 的 matcher 注释直接承认 root path 由页面层处理
  - 这说明当前 locale 路由边界已经拆成 middleware + page 两套逻辑

### Round 4 测试门禁模式观察（扩展）
- wall-clock 断言不是单点，而是一类反复出现的测试模式：
  - `src/components/layout/__tests__/mobile-navigation-responsive-basic.test.tsx`
  - `src/components/layout/__tests__/mobile-navigation-responsive.test.tsx`
  - `src/app/api/csp-report/__tests__/route-post-advanced.test.ts`
  - `src/lib/__tests__/structured-data.test.ts`
  - `src/lib/__tests__/i18n-validation-advanced.test.ts`
  - `src/lib/__tests__/navigation.test.ts`
  - `src/lib/__tests__/i18n-validation.test.ts`
- 这些用例把 `Date.now()` / `performance.now()` 包裹的执行时长上限当作普通 Vitest 门禁。
- 结合“全量绿、单独跑会红”的现象，当前更接近“对机器负载敏感的脆弱门禁”，不是可信的功能质量信号。

### Round 4 门禁配置观察（第一批）
- `scripts/quality-gate.js`
  - `diffCoverageExcludeGlobs` 直接排除了 `src/components/ui/**`
  - 注释把该目录描述成“shadcn/ui CLI 生成的 UI 原语”
- 目录现实并不支持这个假设：
  - `src/components/ui/animated-counter.tsx` 含状态、observer、动画调度和 a11y 分支
  - `src/components/ui/navigation-menu.tsx` 含自定义行为开关 `viewport`
  - `src/components/ui/theme-switcher.tsx`、`src/components/ui/scroll-reveal.tsx` 也不是零逻辑模板
- 结论：
  - 当前 diff coverage 对整类真实交互组件存在目录级豁免，属于门禁设计失真，而不是个别配置噪音。
- `scripts/ci-local.sh`
  - 注释宣称“完全模拟远程 GitHub Actions CI/CD Pipeline”
  - 但 Node 检查只要求 `>=20`，当前 `v22.22.0` 也能直接通过
  - 结论：脚本口径比“完全模拟 CI”更宽，本地和 CI 的版本差异仍可能被掩盖
- `vitest.config.mts`
  - 默认同时开启 `reporters: ["verbose", "json"]` 和 `logHeapUsage: true`
  - 结论：这会把默认 `pnpm test` 输出放大成逐用例刷屏，更适合诊断模式，而不是日常门禁模式

### Round 4 内部协议观察（第一批）
- `src/lib/actions/contact.ts`
  - server action 返回自由文本错误：`Validation failed`、`Security verification required`、`Too many requests`
- `src/components/forms/contact-form-container.tsx`
  - UI 通过 `state.error === "Validation failed"` 判断是否走“翻译 details”分支
- 对应测试也在固化这个英文字符串契约：
  - `src/components/forms/__tests__/contact-form-container-core.test.tsx`
  - `src/components/forms/__tests__/contact-form-container.test.tsx`
  - `src/components/forms/__tests__/contact-form-validation.test.tsx`
- 结论：
  - 这是内部协议靠英文文案驱动流程，不是稳定类型驱动流程；一旦文案或本地化策略变化，UI 分支会一起飘。

### Round 4 客户端错误消费观察（第一批）
- `src/components/blog/blog-newsletter.tsx`
  - 失败分支仍读取 `result.message ?? t("error")`
- 但 `/api/subscribe` 当前失败响应已经统一为 `errorCode`
  - `src/app/api/subscribe/route.ts`
- 对应测试仍在 mock 旧协议：
  - `src/components/blog/__tests__/blog-newsletter.test.tsx` 使用 `{ success: false, message: "Invalid email" }`
- 结论：
  - 统一 `errorCode` 已经在服务端建立，但客户端消费链并没有完全接上，导致精确错误在 UI 层丢失。

### Round 4 重复实现观察（第一批）
- `src/app/api/contact/contact-api-utils.ts`
  - 当前仍保留一整套旧工具：`verifyTurnstile()` / `verifyTurnstileDetailed()` / `validateEnvironmentConfig()` / `generateRequestId()` / `formatErrorResponse()`
- 代码搜索显示它现在主要只被自己的测试引用：
  - `src/app/api/contact/__tests__/contact-api-utils.test.ts`
- 与共享实现的分叉已经出现：
  - `src/lib/turnstile.ts` 网络失败返回结构化 `errorCodes`
  - `contact-api-utils.ts` 在 catch 中仍直接 re-throw
- 结论：
  - 这是“测试把旧实现保活”的典型例子。它不一定马上炸，但会持续制造假入口和重复维护成本。

### Round 4 错误协议落地观察（第二批）
- `src/components/products/product-inquiry-form.tsx`
  - 客户端失败分支仍读取 `result.error`
  - 但 `/api/inquiry` 失败响应已统一为 `errorCode`
- `src/lib/api/translate-error-code.ts`
  - 统一错误翻译工具已经存在
- 全仓搜索 `translateApiError(`
  - 当前只出现在注释/示例中，没有实际生产代码调用
- `src/lib/api/get-request-locale.ts`
  - `getApiMessages()` 的注释仍声称 `/api/contact`、`/api/inquiry`、`/api/verify-turnstile` 在使用它
  - 但代码搜索显示该函数已无生产引用
- 结论：
  - “服务端统一到 errorCode” 这件事在客户端落地上还停留在半成品状态：工具存在、文档存在、但主路径消费链没真正接上。

### Round 4 遗留基础设施观察（第二批）
- `src/lib/security-headers.ts`
  - 文件本身已经标注 `legacy helper`
  - 但导出函数名仍然像生产基础设施：`getApiSecurityHeaders()`、`getWebSecurityHeaders()`、`getCORSHeaders()`、`verifyTurnstileToken()`、`checkSecurityConfig()`、`getSecurityMiddlewareHeaders()`、`validateSecurityHeaders()`
- 引用面几乎全部落在测试：
  - `src/lib/__tests__/security-headers.test.ts`
  - `src/lib/__tests__/security.test.ts`
  - `tests/unit/security/security-headers.test.ts`
- 其中 `verifyTurnstileToken()` 还保留了对相对路径 `/api/verify-turnstile` 的 fetch 封装
- 结论：
  - 这又是一块“看起来像生产真相源，但实际上主要靠测试保活”的遗留基础设施层，和 `contact-api-utils.ts` 属于同一类问题。

### Round 4 混合职责模块观察（第一批）
- `src/lib/validations.ts`
  - 仍在生产使用的是真类型：
    - `FormSubmissionStatus`
    - `EmailTemplateData`
    - `ProductInquiryEmailData`
    - `AirtableRecord`
  - 但同文件还混着主要只被测试消费的旧层：
    - `apiResponseSchema`
    - `validationHelpers`
    - `validationConfig`
- 其中 `apiResponseSchema` 仍编码旧式 `message/error/data` 响应形状，与当前 API 主推的 `errorCode` 协议脱节。
- 结论：
  - 这不是“可以顺手删一点”的小问题，而是模块职责已经分裂：一半是生产真类型，一半是测试/遗留 helper。

### Round 4 遗留薄封装观察（第一批）
- `sanitizePlainText()` 明显已经是当前真实主入口：
  - 生产代码广泛直接引用 `src/lib/security-validation.ts`
- 但仓库里还并存着多个遗留薄封装：
  - `src/lib/security-validation.ts` 的 `sanitizeInput()`（deprecated）
  - `src/lib/validations.ts` 的 `validationHelpers.sanitizeInput()`
  - `src/lib/lead-pipeline/utils.ts` 的 `sanitizeInput()`
- 这些 wrapper 当前主要只剩测试消费，生产代码基本不再依赖。
- 结论：
  - 这又是一种“旧入口被测试保活”的模式，只不过发生在安全清洗 helper，而不是 API/基础设施层。

### Round 4 类型真相源观察（第一批）
- `src/types/global.ts`
  - 定义了通用 `ApiResponse<T>` / `PaginatedResponse<T>`
  - 结构仍是旧式 `message` / `errors`
- `src/types/index.ts`
  - 继续把这套类型作为统一类型入口导出
- `src/types/__tests__/global.test.ts`
  - 对其做了完整测试覆盖
- 但生产代码搜索显示：
  - 基本没有实际生产模块从 `@/types/global` 或 `@/types` 消费这套 API 类型
  - 真实 API 路径已经在用 `src/lib/api/api-response.ts`
- 结论：
  - 这又是一套“被导出 + 被测试 + 看起来官方，但并不是生产真相源”的类型层遗留结构。

### Round 4 失活模块观察（第一批）
- `src/lib/api/get-request-locale.ts`
  - 整个文件都围绕旧的服务端 API i18n 机制组织
  - 内部大量 `@deprecated` / `legacy` 注释
  - 仍保留误导性说明：`Currently used by: /api/contact, /api/inquiry, /api/verify-turnstile`
- 但代码搜索显示：
  - 除文件自身外，`getRequestLocale()` / `getApiMessages()` / `ApiMessages` / `API_MESSAGES` 基本没有实际生产引用
- 结论：
  - 这不是“一个工具函数注释过时”，而是一整层 legacy API i18n 模块已经失活，却还留在生产路径命名空间下。

### Round 4 兼容包装层观察（第一批）
- `src/lib/metadata.ts`
  - 只是在 `seo-metadata.ts` 外再包一层 `generatePageMetadata()`，并重新导出底层函数
- 代码搜索显示：
  - 生产代码里看不到明显消费方
  - 但 `src/lib/__tests__/metadata.test.ts` 对它做了完整测试
- 结论：
  - 这类“兼容包装层 + 自己的测试”会让一个实际上已退出生产链路的入口长期保活，和 `contact-api-utils.ts` / `security-headers.ts` / `get-request-locale.ts` 属于同一家族问题。

### Round 4 零引用/测试保活工具层观察（第三批）
- `src/lib/api-cache-utils.ts`
  - 搜索 `api-cache-utils|createCacheHeaders|createCachedResponse`
  - 当前只命中文件自身，未见生产引用，也未见测试引用
  - 结论：这是一块已经失活但仍留在正式工具层命名空间里的缓存辅助层
- `src/lib/site-config.ts`
  - 导出一套看似官方的项目常量（`PROJECT_STATS` / `PROJECT_LINKS` 等）
  - 但生产代码真正直接依赖的是 `@/config/paths/site-config` 下的 `SITE_CONFIG`
  - 当前 `src/lib/site-config.ts` 的消费面主要集中在 `src/lib/__tests__/site-config.test.ts`
  - 结论：这更像“测试保活的配置镜像层”，不是当前生产真相源

### Round 4 类型入口污染观察（第二批）
- `src/types/index.ts`
  - 作为“统一类型入口”，却直接导出 `@/types/test-types` 中的测试函数与测试类型
  - 包括 `isMockDOMElement`、`isMockKeyboardEvent`、`MockDOMElement`、`MockKeyboardEvent` 等
- 代码搜索显示：
  - `@/types` 当前几乎只被测试消费
- 结论：
  - 这是正式类型入口被测试专用类型污染，不一定立刻出 bug，但会持续误导命名空间边界。

### Round 4 i18n 辅助层观察（第三批）
- `src/lib/translation-benchmarks.ts`
- `src/lib/translation-validators.ts`
- `src/lib/translation-quality-types.ts`
- `src/lib/locale-constants.ts`
- 当前观察：
  - `translation-benchmarks` / `translation-validators` 的消费面基本集中在 `src/lib/__tests__/**`
  - `locale-constants.ts` 当前几乎没有实际引用
- 结论：
  - 这组模块更像测试、离线分析或预备功能，而不是当前生产运行时真相源；继续留在 `src/lib/` 主命名空间只会放大“哪些东西真在运行”的认知噪音。

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

## Round 3：2026-03-06 当前工作树复审（Linus 口径回归）

### 目标
- 不是重复历史报告，而是确认：第三轮原定要干掉的问题，现在还有哪些真的活着。

### 已复核为“关闭”的旧问题
- `vitest.config.mts`
  - 全局 `retry` 已移除
  - `ui` 已关闭
  - 当前文件中已无 `detectListenRestriction()` / `patchServerListen()` 之类 monkey patch
- `src/lib/api/safe-parse-json.ts`
  - 统一返回 `errorCode: API_ERROR_CODES.INVALID_JSON_BODY`
- 主写接口
  - `src/app/api/contact/route.ts`
  - `src/app/api/inquiry/route.ts`
  - `src/app/api/verify-turnstile/route.ts`
  - 已接入 `createApiErrorResponse()` / `createApiSuccessResponse()`
- 其它 Round 3 旧项
  - `src/components/whatsapp/whatsapp-floating-button.tsx` 已无硬编码英文默认文案
  - `src/lib/lead-pipeline/process-lead.ts` 已从 if/else + flag 改为表驱动配置
  - `src/test/setup.ts` 已拆分为多文件入口

### 新证据：错误协议仍未完全收敛

#### 1) 共享 helper `withIdempotency()` 还在返回自由文本
- `src/lib/idempotency.ts:65-79`
  - `Request processing failed, please retry`
  - `Request processing timed out, please retry`
- `src/lib/idempotency.ts:128-131`
  - `Idempotency key already used for a different endpoint`
- `src/lib/idempotency.ts:291-300`
  - 缺失 `Idempotency-Key` 时返回 `{ error, message }`
- 旁证：`tests/integration/api/subscribe.test.ts:66-79` 仍只断言 `json.error`

结论：
- 这说明“协议分裂”仍在共享层，而不只是个别 route 的疏漏。

#### 2) 若干 API route 仍绕开统一 response helper
- `src/app/api/whatsapp/send/route.ts`
  - `41-76`：鉴权错误走 `{ error: "..." }`
  - `292-307`：解析/校验错误混用 `errorCode` 字符串和自由文本，还把 `details` 返回给客户端
  - `384-393`：成功体不是统一 `{ success: true, data }`
- `src/app/api/whatsapp/webhook/route.ts:132-155`
  - `Invalid signature` / `Invalid JSON body` / `Failed to process message`
- `src/app/api/csp-report/route.ts:144-162`
  - `Invalid CSP report format` / `Invalid JSON format`

结论：
- 当前 API surface 仍是混合协议，不适合再声称“统一错误模型已完成”。

### 新证据：wall-clock 单测仍在污染门禁

#### 当前复现
- 基线命令：
  - `pnpm type-check`：通过
  - `pnpm lint:check`：通过（无新的 warning / 噪音信号）
- 命令：
  - `pnpm test -- src/app/api/whatsapp/send/__tests__/route.test.ts src/app/api/csp-report/__tests__/route.test.ts src/app/api/whatsapp/webhook/__tests__/route.test.ts src/lib/__tests__/idempotency.test.ts`
- 现象：
  - 本次运行命中失败：`src/components/layout/__tests__/mobile-navigation-responsive.test.tsx:345-358`
  - 失败摘要：`expected 2066 to be less than 1000`

#### 同类模式（不是单点）
- `src/components/layout/__tests__/mobile-navigation-responsive.test.tsx:345-358`
- `src/app/api/csp-report/__tests__/route-post-advanced.test.ts:42-90`
- `src/lib/__tests__/structured-data.test.ts:622-637`

结论：
- 这类断言测的是“当前机器快不快”，不是“代码行为是否正确”。
- 全局 retry 清掉以后，机器相关噪音会直接暴露成红灯，这不是偶发，是设计问题。

### 新证据：`contact-form-submission` 冷却期测试前提错误

- 当前命令最终还有第三条失败：
  - `src/components/forms/__tests__/contact-form-submission.test.tsx:342-380`
  - 失败点：等待 `wait before submitting again` 文案出现
- 对照实现：
  - `src/components/forms/use-rate-limit.ts:28-43`
    - `isRateLimited` 只有在 `lastSubmissionTime` 存在时才可能为真
  - `src/components/forms/contact-form-container.tsx:171-177`
    - `recordSubmission()` 只在真正执行 `enhancedFormAction(formData)` 时触发
  - 但测试 `src/components/forms/__tests__/contact-form-submission.test.tsx:347-364`
    - 只执行 `renderContactForm()` 和点击 `turnstile-success`
    - 没有提交表单，也没有显式设置 `lastSubmissionTime`

结论：
- 这条测试不是在验证“冷却结束后恢复提交”，而是在等一个当前代码路径根本不会自动出现的 UI 状态。
- 如果它偶尔通过，那反而说明有共享状态或时序污染，不是测试写对了。

## Round 4 执行收口（2026-03-09）

### Wave A：协议统一与错误消费闭环
- `withIdempotency()`、`/api/whatsapp/send`、`/api/whatsapp/webhook`、`/api/csp-report` 已统一到 `errorCode` 契约。
- newsletter / inquiry / contact form 已接入 `translateApiError()`。
- `src/lib/api/get-request-locale.ts` 已删除。
- 验证：
  - `pnpm type-check`
  - `pnpm lint:check`
  - 178 条 Wave A 相关 Vitest 回归测试通过

### Wave B：测试与门禁信号修复
- `mobile-navigation` 的 wall-clock 断言已改成结构性状态断言。
- `contact-form-submission` 冷却期测试已改为显式 `useRateLimit` 状态驱动。
- `quality-gate` 不再对整个 `src/components/ui/**` 做目录级 diff coverage 豁免。
- Vitest 默认输出已降噪，并新增 `pnpm test:debug`。
- 验证：
  - `pnpm type-check`
  - `pnpm lint:check`
  - `pnpm ci:local:quick`

### Wave C：遗留假真相源清理
- 已删除零生产引用的假入口：
  - `src/app/api/contact/contact-api-utils.ts`
  - `src/lib/api-cache-utils.ts`
  - `src/lib/site-config.ts`
  - `src/lib/metadata.ts`
  - `src/types/index.ts`
  - `src/types/global.ts`
  - `src/lib/security-headers.ts`
  - `src/lib/translation-benchmarks.ts`
  - `src/lib/translation-quality-types.ts`
  - `src/lib/translation-validators.ts`
- `src/lib/validations.ts` 已拆分并删除，生产链路迁移到：
  - `src/lib/email/email-data-schema.ts`
  - `src/lib/airtable/record-schema.ts`
  - `src/lib/forms/form-submission-status.ts`
  - `src/lib/forms/validation-helpers.ts`
- `security-validation.ts` 的 deprecated `sanitizeInput` alias 已删除；`lead-pipeline/index.ts` 不再正式导出 `sanitizeInput`。
- 验证：
  - `pnpm type-check`
  - `pnpm lint:check`
  - 151 条与 104 条定向 Vitest 回归测试通过

### Wave D：Next.js 框架边界收口
- `src/app/[locale]/layout.tsx` 已成为真正的 root layout，服务端直接输出 `<html lang={locale}>`。
- `src/proxy.ts` 曾接管 locale redirect 与安全头部，但在 Cloudflare 兼容复核后已按最小回退方案恢复到 `src/middleware.ts`。
- 已删除：
  - `src/app/layout.tsx`
  - `src/app/page.tsx`
  - `src/components/i18n/lang-updater.tsx`
- `mobile-navigation` 与 `language-toggle` 已改为从 `next-intl` locale context 取值，不再读取 `document.documentElement.lang`。
- 验证：
  - `pnpm type-check`
  - `pnpm lint:check`
  - middleware / locale / language-toggle 定向 Vitest 回归测试通过
  - `pnpm build` 通过（会出现 `middleware -> proxy` 弃用告警）
- `pnpm build:cf` 通过

## Delta Review 观察（2026-03-11）

### Gate 信号观察

#### `lint:check` 当前被工作区本地 agent 资产污染
- 当前执行 `pnpm lint:check`，失败文件集中在 `.agents/skills/**`。
- `.gitignore` 已忽略 `.agents/`，但 `eslint.config.mjs` 的 global ignores 只排除了 `.claude/skills/**`，没有排除 `.agents/**`、`skills/**` 等相邻本地资产目录。
- 结论：
  - 当前 lint gate 已经不是纯项目代码 gate。
  - 这是新的 DEV/CI 信号问题，不是应用代码错误本身。

#### `build` / `build:cf` 仍然通过
- `pnpm build`：通过。
- `pnpm build:cf`：顺序执行后通过；之前的失败来自 `.next/lock` 并发锁争用，不是产品缺陷。
- `build:cf` 过程中可见 OpenNext bundling warning：`Applying code patches` 的 `console.time` label 重复，但未阻断构建。

### 新发现：询盘链幂等契约缺口
- `/api/inquiry` 当前没有使用 `withIdempotency`。
- `product-inquiry-form` 也没有发送 `Idempotency-Key`。
- 但系统又已经：
  - 在 `CORS_CONFIG` 中允许 `Idempotency-Key`
  - 在 `/api/inquiry` 的 preflight 测试里断言了这个 header
  - 在 newsletter 链路中完整落地了幂等闭环
- 结论：
  - 这是一个主业务写路径上的契约漂移问题。
  - 询盘链比 newsletter 链更接近主业务目标，却缺少同等级别的重复提交防护。

### 新发现：i18n 运行时仍有 split/flat 双真相源
- `load-messages.ts` 的主路径使用 split：`critical + deferred`。
- `src/i18n/request.ts` 的 fallback 仍回退到 flat：`messages/${locale}.json`。
- 生产态优先走自我 HTTP fetch，再回退到文件系统。
- 结论：
  - i18n 运行时主链与 fallback 链仍未完全共享单一真相源。
  - 这不是立即爆炸的 bug，但属于真实的耦合和演进风险。

### 新发现：共享 JSON 解析入口缺少 body size gate
- `src/lib/api/safe-parse-json.ts` 直接 `await req.json()`，没有统一 body size 限制。
- 该 helper 被 `contact`、`inquiry`、`subscribe`、`verify-turnstile`、`whatsapp/send` 等 JSON 路由复用。
- 结论：
  - 当前公开 JSON 端点仍然共享一个“无 body size gate”的解析入口。
  - 这是共享边界未收口的问题，不应继续依赖每个路由自己补丁。

### 新发现：contact Server Action 仍会把英文 detail 直接渲染到多语言 UI
- `src/lib/actions/contact.ts` 在 submission expired / Turnstile 失败场景返回英文 `details`。
- `src/components/forms/contact-form-container.tsx` 对非 `errors.*` detail 直接原样显示。
- 结论：
  - contact 主链在异常路径上仍会出现混合语言错误 UI。
  - 这是 i18n 正确性和错误契约一致性问题，不是单纯文案问题。

### 扩展 gate 结果
- `pnpm security:check`: passed
- `pnpm arch:check`: passed
- `pnpm circular:check`: passed
- `pnpm unused:production`: passed
- `pnpm ci:local:quick`: failed
  - 失败仍然收敛到 `.agents/skills/**` 导致的 lint gate 污染
- `pnpm quality:gate:full`: failed
  - 顺序单跑后确认 `Coverage`、`Performance`、`Security` 全部通过
  - 当前唯一阻断项仍是 `Code Quality`，而其根因仍然是 `.agents/skills/**` lint 污染

## Repair Phase（2026-03-11）

### 已关闭问题
- `CR-047` 已关闭
  - `eslint.config.mjs` 已补齐 repo-local agent/skill 工作目录 ignore
  - `pnpm lint:check`、`pnpm ci:local:quick`、`pnpm quality:gate:full` 现已通过
- `CR-052` 已关闭
  - `/api/inquiry` 已接入 `withIdempotency(..., { required: true })`
  - `product-inquiry-form` 已生成并发送 `Idempotency-Key`
  - route / integration / component 定向回归均通过
- `CR-050` 已关闭
  - `safeParseJson()` 已统一收口 body size gate
  - 相关 JSON 路由已统一消费 `PAYLOAD_TOO_LARGE` / `INVALID_JSON_BODY` 的分流结果
  - contact / inquiry / subscribe / verify-turnstile / whatsapp send 定向回归通过
- `CR-051` 已关闭
  - `contactFormAction` 不再为 submission expired / Turnstile failed 返回英文 detail
  - `contact-form-container` 错误展示路径定向回归通过

### 修复后 gate 结果
- `pnpm lint:check`: passed
- `pnpm ci:local:quick`: passed
- `pnpm quality:gate:full`: passed

### 当前剩余项
- `CR-049` 已在独立 runtime refactor 中关闭
  - `src/lib/load-messages.ts` 运行时已只读 split source
  - `src/i18n/request.ts` fallback 已不再触达 flat root 文件
  - 当前剩余 i18n 债务主要在 tooling/test 兼容层，而不在 active locale/runtime request path

## CR-049 Runtime Refactor（2026-03-11）

### Runtime changes made
- `src/lib/load-messages.ts`
  - replaced self-HTTP / fs fallback logic with split JSON module loaders
  - runtime now reads only `@messages/{locale}/{critical,deferred}.json`
- `src/i18n/request.ts`
  - fallback path now uses split-source aggregation via `loadCompleteMessagesFromSource()`
  - runtime no longer imports flat `messages/{locale}.json`

### Verification
- `pnpm exec vitest run src/lib/__tests__/load-messages.fallback.test.ts src/i18n/__tests__/request.test.ts`
- `pnpm validate:translations`
- `pnpm i18n:validate:code`
- `pnpm build`
- `pnpm build:cf`

### Residual debt
- flat message files still exist for tooling/tests
- `src/lib/i18n-performance.ts` still fetches public message assets for client-side performance utilities
- if needed, a later i18n-tooling migration can make split format the only source across scripts/tests too
