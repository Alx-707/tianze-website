# Linus Code Review Round 3 - tianze-website

目标：找出仍存在或新增的“边界分叉 / 补丁驱动复杂度 / 错误处理不一致 / 测试掩盖设计失败”，给出可直接开工的整改清单（拒绝补丁版）。

时间：2026-02-03  
仓库：`/Users/Data/Warehouse/Focus/tianze-website`

---

## 0) 基线（证据）

结论：类型与 lint 都过了；测试“过了但不干净”；build 首次失败是锁，重跑成功。

- `pnpm type-check`：通过（无输出错误）  
  - 证据：`reports/linus-round3/type-check.log`

- `pnpm lint:check`：通过，但输出外部工具噪音（会污染 CI/本地信号）  
  - 证据：`reports/linus-round3/lint-check.log:5`
    ```
    [baseline-browser-mapping] The data in this module is over two months old...
    ```

- `pnpm test`：334 files / 5671 tests 通过，但存在 **deprecated / React runtime warning / console 输出噪音**  
  - 证据：`reports/linus-round3/test.log:5`（deprecated）
    ```
    "cache.dir" is deprecated, use Vite's "cacheDir" instead...
    ```
  - 证据：`reports/linus-round3/test.log:11`（React warning）
    ```
    React does not recognize the `asChild` prop on a DOM element...
    ```
  - 证据：`reports/linus-round3/test.log:21`（生产 logger 被测试触发，stdout 污染）
    ```
    Resend email service initialized successfully { from: 'test@example.com', replyTo: 'reply@example.com' }
    ```

- `pnpm build`：首次失败（.next lock），重跑成功  
  - 证据：`reports/linus-round3/build.log`
    ```
    Unable to acquire lock at .../.next/lock, is another instance of next build running?
    ```
  - 证据：`reports/linus-round3/build.rerun.log`（成功 + 同样出现 baseline-browser-mapping 噪音）

---

## P0 - 测试质量门禁被“补丁”腐蚀（这会让你以为自己很安全）

### P0.1 全局 `retry: 2` + `ui: true` + “伪造 net.Server.listen”是典型的补丁堆

这不是“提升稳定性”，这是把不稳定隐藏起来。测试能重试通过，说明你根本不知道自己修没修好。

- 证据：`vitest.config.mts:6-105`（为了绕过沙箱限制，直接 monkey patch `Server.prototype.listen/close`）
  ```
  6  const shouldBypassLocalListen = await detectListenRestriction();
  49 function patchServerListen() {
  71   proto.listen = function patchedListen(...) { ... this.emit("listening"); }
  89   proto.close = function patchedClose(...) { ... this.emit("close"); }
  103  console.warn("[vitest] ...已模拟 net.Server.listen ...");
  ```
- 证据：`vitest.config.mts:267-306`（重试 + UI server）
  ```
  267 retry: 2
  304 ui: true
  ```
- 旁证：测试输出里明确出现 UI server 启动（你根本不需要它）  
  - 证据：`reports/linus-round3/test.log`（开头段落）

拒绝补丁版修法（方向，不是“再加一层 if”）：
- 默认 `vitest run` 不应该启动 UI server，更不应该需要监听端口；把 `ui` 关掉，删掉整段 listen patch。
- 把全局 `retry` 砍掉（或只对已知 flaky 用 `test.retry()` 局部声明），逼着你修根因。

---

## P1 - API 错误模型分裂：同一个系统里同时存在 3 种“错误语言”

你现在的 API 返回约定是随机的：有的返回 `errorCode`，有的返回本地化 `message`，有的直接把内部标记 `INVALID_JSON` 丢给用户。  
这不是“渐进迁移”，这是协议腐烂。

### P1.1 `safeParseJson()` 产出 `"INVALID_JSON"`，部分路由直接透传给客户端

- 证据：`src/lib/api/safe-parse-json.ts:4-40`
  ```
  export type SafeJsonParseFailure = { ok: false; error: "INVALID_JSON" };
  return { ok: false, error: "INVALID_JSON" };
  ```
- 证据：`src/app/api/contact/route.ts:41-50`
  ```
  if (!parsedBody.ok) {
    return NextResponse.json({ success: false, error: parsedBody.error }, { status: 400 });
  }
  ```
- 证据：`src/app/api/inquiry/route.ts:128-139`
  ```
  if (!parsedBody.ok) {
    return NextResponse.json({ success: false, error: parsedBody.error }, { status: 400 });
  }
  ```

### P1.2 同类 API：/api/subscribe 用 `errorCode`，/api/contact & /api/inquiry 还在用“legacy server-side i18n message”

- 证据：`src/lib/api/get-request-locale.ts:91-195` 明确标注 deprecated，建议迁移到 `errorCode`，但仍在被使用
  ```
  @deprecated ... New APIs should use the errorCode pattern ...
  Currently used by: /api/contact, /api/inquiry, /api/verify-turnstile
  ```
- 证据：`src/app/api/subscribe/route.ts:78-85`（subscribe 已经走 `errorCode`）
  ```
  return NextResponse.json({ success: false, errorCode: API_ERROR_CODES.INVALID_JSON_BODY }, { status: 400 });
  ```
- 证据：`src/app/api/verify-turnstile/route.ts` 还在混用 `"error": "Verification failed"` + `message` + `errorCodes`（另一套协议）

拒绝补丁版修法：
- 选一个协议：**统一 `errorCode`**（服务端只负责状态码 + errorCode；文案翻译在客户端或共享 translate 层）。
- 用一个 `createApiErrorResponse()`/`ApiResult` 类型把所有路由收敛；删掉 `getApiMessages()` 这套 deprecated 机制的实际使用面。

---

## P2 - “看起来异步”的同步代码：Promise.resolve() / 日志噪音 / 测试 mock 泄漏

### P2.1 生产 logger 默认把 `NODE_ENV=test` 当成 dev，导致测试输出被污染

这不是小事：测试输出被污染会掩盖真正的 warning/error，并且让你对回归信号麻木。

- 证据：`src/lib/logger.ts:20-39`
  ```
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
  return isDev() ? "debug" : "warn";
  ```
- 证据：测试 stdout（Resend 初始化日志）  
  - `reports/linus-round3/test.log:21`

拒绝补丁版修法：
- 测试环境默认 `LOG_LEVEL=warn`（或更严：只允许 error/warn），不要把 test 当 dev。
- 同时把“库初始化日志”从 constructor 里拿掉：初始化不应该产生 side effect 输出。

### P2.2 React `asChild` warning 不是生产 bug，是测试 mock 写得像屎

你在测试里 mock 了 `Button`，然后把 `asChild` 这种非 DOM prop 原样 spread 到 `<button>`，React 当然警告。

- 证据：`src/components/layout/__tests__/mobile-navigation.test.tsx:177-183`
  ```
  Button: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}> ... </button>
  )
  ```
- 证据：`reports/linus-round3/test.log:11`
  ```
  React does not recognize the `asChild` prop on a DOM element...
  ```

拒绝补丁版修法：
- 停止在每个测试里手写半吊子 shadcn mock；建一个集中 mock（或直接用真实组件），至少要把 `asChild` 等非 DOM props 吃掉。

### P2.3 `withIdempotency()` 为了“非 async 但要返回 Promise”而写 `Promise.resolve(...)`

你已经在 Next.js/TS 里了，别写这种“看起来像异步”的同步返回。

- 证据：`src/lib/idempotency.ts:241-253`
  ```
  return Promise.resolve(NextResponse.json(...))
  ```

拒绝补丁版修法：
- 让 `withIdempotency` 自己 `async`，直接 `return NextResponse.json(...)`，不要用 `Promise.resolve` 伪装。

### P2.4 `MemoryRateLimitStore` 用 Promise.resolve 包同步逻辑，且方法签名与接口不一致

- 证据：`src/lib/security/distributed-rate-limit.ts:51-118`
  ```
  interface RateLimitStore { set(key, entry, ttlMs): Promise<void> }
  set(key: string, entry: RateLimitEntry): Promise<void> { ... return Promise.resolve(); }
  ```

拒绝补丁版修法：
- Memory store 要么真正 `async`（`async get/set/increment`），要么把接口拆成 sync/async 两套，不要“假异步”。
- `set()` 要么接收并使用 `ttlMs`，要么接口不要要求它。

---

## P3 - 噪音与边界分叉（不致命，但会继续长出补丁）

### P3.1 `vitest` 的 `cache.dir` deprecated 还在用（纯噪音）

- 证据：`vitest.config.mts:286-289`
  ```
  cache: { dir: "node_modules/.vitest" }
  ```
- 证据：`reports/linus-round3/test.log:5`（deprecated 提示）

### P3.2 build/lint 被 `baseline-browser-mapping` 的“过期提示”污染

- 证据：`reports/linus-round3/lint-check.log:5`
- 证据：`reports/linus-round3/build.rerun.log:64`

### P3.3 `WhatsAppFloatingButton` 有硬编码英文文案 + 用 eslint-disable 给巨函数找借口

这违反项目“i18n required”的底线，也是在给未来堆复杂度留口子。

- 证据：`src/components/whatsapp/whatsapp-floating-button.tsx:89-105`
  ```
  greeting: "Need help?",
  ...
  // eslint-disable-next-line max-lines-per-function ...
  label = "Chat with us on WhatsApp"
  ```

### P3.4 `processLead` 的路由分发仍是 if/else + 特殊 flag（边界分叉还在）

- 证据：`src/lib/lead-pipeline/process-lead.ts:73-86`
  ```
  let hasEmailOperation = true;
  if (isContactLead...) ... else if (isNewsletterLead...) { ... hasEmailOperation = false; }
  else throw new Error("Unknown lead type");
  ```

拒绝补丁版修法：
- 用 `lead.type` 的表驱动（map: type -> { handler, hasEmailOperation }），再用 exhaustive check，删掉“这不可能发生”的 else。

---

## 1) “拒绝补丁版”的整改顺序（按风险/ROI）

1. 修测试基础设施（P0）：`vitest.config.mts` 删 UI/删 listen patch/删全局 retry；把测试从“能混过去”变成“必须干净”
2. 统一 API 错误协议（P1）：全面切 `errorCode`；删 legacy `getApiMessages()` 的使用面；给所有 API 一个统一返回模型
3. 清理“假异步”与边界分叉（P2）：`withIdempotency` async 化；MemoryRateLimitStore/RateLimitStore 接口收敛；logger/test 环境默认静音 info
4. 收尾噪音（P3）：`cache.dir` -> `cacheDir`；更新 baseline-browser-mapping；WhatsApp 文案 i18n 化；processLead 表驱动重构

---

## 2) 可执行 TODO（可直接开工）

- `vitest.config.mts`
  - 删除 `detectListenRestriction()`/`patchServerListen()` 整段（同时把 `ui: true` 改为 `false`，确保不需要监听端口）
  - 删除 `retry: 2`（如确有 flaky，改为在具体测试上用 `test.retry(n)` 并写明原因/TTL）
  - 把 `cache: { dir: ... }` 迁移为 Vite 的 `cacheDir`（或接受默认）

- `src/test/setup.env.ts`
  - 增加 `vi.stubEnv("LOG_LEVEL", "warn")`（或更严）以避免测试输出被污染

- `src/components/layout/__tests__/mobile-navigation.test.tsx`（以及其它类似文件）
  - 停止 spread 非 DOM props：mock `Button` 时显式剥离 `asChild`（或改为复用真实 `Button`）
  - 最好把 shadcn/Radix mock 集中到 `src/test/` 的统一 mock 层，别到处复制

- `src/lib/api/safe-parse-json.ts`
  - 改为返回 `errorCode`（或返回一个可映射的结构），不要把 `"INVALID_JSON"` 当成用户错误文案

- `src/app/api/contact/route.ts`、`src/app/api/inquiry/route.ts`、`src/app/api/verify-turnstile/route.ts`
  - 统一走 `errorCode` 返回（与 `src/app/api/subscribe/route.ts` 对齐）
  - 移除对 `getApiMessages()` 的依赖（它已经被标注 deprecated）

- `src/lib/idempotency.ts`
  - `withIdempotency` 改为 `async`，去掉 `Promise.resolve(NextResponse.json(...))`

- `src/lib/security/distributed-rate-limit.ts`
  - 修 `RateLimitStore.set()` 的签名一致性（ttlMs 要么用起来，要么不要在接口里要求）
  - 去掉 Memory store 的 Promise.resolve 伪装（统一 async 或统一 sync）

- `src/components/whatsapp/whatsapp-floating-button.tsx`
  - 默认文案改为 next-intl（translation keys），不要硬编码英文
  - 拆分：把 localStorage/position 逻辑抽到独立 hook（同文件或 `src/hooks/`），删掉 `max-lines-per-function` 这类借口式 disable

- `src/lib/lead-pipeline/process-lead.ts`
  - 表驱动替换 if/else；消灭 `hasEmailOperation` 这种“特殊情况 flag”
  - `LeadResult.error` 收敛为受控 union（不要 `| string` 这种逃避类型系统的后门）

---

## 3) 框架约束 vs 工具规则：取舍原则与落地

### 冲突 1：Next.js `"use cache"` 必须 `async` vs ESLint `require-await`

原则：**服从框架约束，拒绝“假 await”补丁**。  
落地：像 `src/lib/content/blog.ts` / `src/lib/content/products.ts` 那样，保留 `async`，并用最小范围 `eslint-disable require-await -- Next.js "use cache" ...` 解释约束，而不是 `await Promise.resolve()` 自欺欺人。

### 冲突 2：测试环境禁止监听端口 vs Vitest UI / 自定义 listen patch

原则：**优先删需求，而不是 patch 环境**。  
落地：关掉 `ui`，删除 `net.Server.listen` monkey patch；让测试回到“纯 runner”，不要引入网络副作用。

