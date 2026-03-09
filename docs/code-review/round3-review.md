# Round 3 Review: 当前工作树复审（2026-03-06）

目标：不是重复 Round 1/2 的历史结论，而是核对“第三轮原定要消灭的问题”现在还剩什么，尤其是测试补丁残留、API 错误协议分裂、假异步/接口撒谎，以及新的边界分叉。

## 结论

Round 3 的旧高优先级问题里，有一批已经真正关闭：

- `vitest.config.mts` 已移除全局 `retry: 2`，`ui` 已关闭，`listen` monkey patch 也不在当前文件中。
- `safeParseJson()` 已统一返回 `errorCode`，`/api/contact`、`/api/inquiry`、`/api/verify-turnstile` 已接入统一的 `createApiErrorResponse()` / `createApiSuccessResponse()`。
- `processLead()` 已改成表驱动配置，WhatsApp 浮窗默认文案已走 `next-intl`，`src/test/setup.ts` 也已经拆分。

但当前工作树里仍然有 4 个真实未关闭的问题。

## Findings

### P1 `withIdempotency()` 仍然输出自由文本错误，导致 `/api/subscribe` 继续跑在另一套错误协议上

- 证据：
  - `src/lib/idempotency.ts:65-79` 直接返回 `{ error: "Request processing failed, please retry" }` / `{ error: "Request processing timed out, please retry" }`
  - `src/lib/idempotency.ts:128-131`、`src/lib/idempotency.ts:155-158` 直接返回 `{ error: "Idempotency key already used for a different endpoint" }`
  - `src/lib/idempotency.ts:291-300` 在缺失 `Idempotency-Key` 时返回 `{ error, message }`
  - `tests/integration/api/subscribe.test.ts:66-79` 当前测试也把这种自由文本当成既定行为，只断言 `json.error`
- 为什么是问题：
  - 这不是“个别路由忘了统一”，而是共享 helper 本身还在说另一种错误语言。
  - 任何走 `withIdempotency()` 的路由都会被迫偏离统一 `errorCode` 协议，客户端无法做一致的 i18n/错误映射。
- 正确方向：
  - 在 `API_ERROR_CODES` 中补齐幂等相关稳定码，例如“缺 header / key 冲突 / 处理中超时”。
  - `withIdempotency()` 统一只返回 `{ success: false, errorCode }`，不要再透出自由文本。

### P1 `/api/whatsapp/send`、`/api/whatsapp/webhook`、`/api/csp-report` 仍然绕开统一 API Response，协议继续分裂

- 证据：
  - `src/app/api/whatsapp/send/route.ts:41-76` 鉴权失败返回 `{ error: "..." }`
  - `src/app/api/whatsapp/send/route.ts:292-307` 解析/校验失败返回 `{ error: parsedBody.errorCode }` 或 `{ error: "Invalid request body", details: ... }`
  - `src/app/api/whatsapp/send/route.ts:384-393` 成功响应为 `{ success: true, messageId, data, environment, clientType }`，并未走统一 `{ success: true, data }` 结构
  - `src/app/api/whatsapp/webhook/route.ts:132-155` 仍然整段使用 `{ error: "..." }`
  - `src/app/api/csp-report/route.ts:144-162` 解析错误仍然返回 `{ error: "Invalid JSON format" }` / `{ error: "Invalid CSP report format" }`
- 为什么是问题：
  - Round 3 本来要消灭“同一系统内三种错误语言”，现在只是把主路径修了，侧路还在分叉。
  - `whatsapp/send` 甚至把 Zod `issues` 明细直接塞回客户端，这会把内部验证结构暴露给外部调用方，继续扩大协议表面积。
- 正确方向：
  - 这些路由要么全部接入 `createApiErrorResponse()` / `createApiSuccessResponse()`，要么明确声明“这是 webhook/internal contract，不参与统一 API 协议”，不能半吊子混着来。
  - `details` 只留服务端日志，不要回给客户端。

### P1 测试门禁仍被 wall-clock 阈值污染，当前复现已经直接打红

- 复现：
  - `pnpm type-check`：通过
  - `pnpm test -- src/app/api/whatsapp/send/__tests__/route.test.ts src/app/api/csp-report/__tests__/route.test.ts src/app/api/whatsapp/webhook/__tests__/route.test.ts src/lib/__tests__/idempotency.test.ts`
  - 在本次执行中，Vitest 实际跑出了更大的相关测试集，并命中失败：
    - `src/components/layout/__tests__/mobile-navigation-responsive.test.tsx:345-358`
    - 失败信息：`expected 2066 to be less than 1000`
- 同类证据：
  - `src/app/api/csp-report/__tests__/route-post-advanced.test.ts:42-90`
  - `src/lib/__tests__/structured-data.test.ts:622-637`
- 为什么是问题：
  - 这类断言测的是“这台机器此刻快不快”，不是“代码语义对不对”。
  - 全局 retry 已经被移除，现在这些测试会直接把噪音暴露成门禁失败；这是对的，但说明根因还没清。
- 正确方向：
  - 把 wall-clock 上限断言从单测门禁里拿掉，改成结构性断言、调用次数断言、或单独的 opt-in benchmark。
  - 如果真要保留性能检查，也应该放到专门脚本/基准测试里，而不是让普通 Vitest 在共享 CI 机器上猜秒表。

### P2 `contact-form-submission` 冷却期测试当前在断言一个代码里根本不会自动出现的状态

- 复现：
  - 同一轮 `pnpm test -- ...` 运行最终还打出第三条失败：
    - `src/components/forms/__tests__/contact-form-submission.test.tsx:342-380`
    - 失败点：`await screen.findByText(/wait before submitting again/i, {}, { timeout: 3000 })`
- 代码证据：
  - `src/components/forms/use-rate-limit.ts:28-43` 中，`isRateLimited` 只有在 `lastSubmissionTime` 被设置后才会为 `true`
  - `src/components/forms/contact-form-container.tsx:126-177` 中，`recordSubmission()` 只在 `enhancedFormAction()` 里调用，也就是“真正提交表单”时才会触发
  - 但测试 `src/components/forms/__tests__/contact-form-submission.test.tsx:347-364` 只做了 `renderContactForm()` + 点击 `turnstile-success`，没有提交表单，也没有设置 `lastSubmissionTime`
- 为什么是问题：
  - 这个测试不是“偶尔慢”，而是在等待一个当前实现根本不会自动出现的 UI 状态。
  - 如果它有时能过，那恰恰说明测试依赖了外部时序或共享状态泄漏，不是功能正确。
- 正确方向：
  - 要么在测试里显式触发表单提交/直接设置 `lastSubmissionTime`，测试真实冷却逻辑。
  - 要么删掉这条错误前提的断言，避免让随机状态污染伪装成功能验证。

## 建议顺序

1. 先修 `withIdempotency()` 的错误协议，因为它是共享 helper，继续留着会污染后续所有路由。
2. 再收敛 `whatsapp/send`、`whatsapp/webhook`、`csp-report` 的响应模型，至少先做到错误结构统一。
3. 再修 `contact-form-submission` 这类错误前提测试，确保门禁测的是代码行为而不是环境泄漏。
4. 最后清理 wall-clock 单测，把“性能期望”从功能门禁中拆出去。
