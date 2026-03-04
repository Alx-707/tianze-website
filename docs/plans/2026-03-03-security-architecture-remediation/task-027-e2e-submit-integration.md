# Task 027: 关键路径真实提交集成测试

**depends-on:** —（建议在 Phase D/E/F 改动完成后执行，作为回归验证）

## Description

为 contact 和 inquiry 各添加一条 happy path 集成测试，走通从表单提交到响应的完整链路。当前测试 mock 粒度过粗，Phase D/E/F 的大范围重构后回归风险高。

## Execution Context

**Task Number**: 027 of 027
**Phase**: F 末尾（回归验证）
**Prerequisites**: Phase D/E/F 核心改动完成

## 审查背景

- 单点测试覆盖了各防护组件（replay、turnstile、rate limit、idempotency），但没有验证组件串联后的端到端行为
- Phase D 移动了 actions/emails/shared logic，import 路径大面积变化
- 需要一条集成测试确认"改完了还能正常提交"

## BDD Scenarios

### Scenario 1: Contact 表单 happy path
```gherkin
Scenario: 联系表单完整提交成功
  Given 用户填写了有效的联系表单
  And submittedAt 为当前时间
  And Turnstile token 有效（mock Cloudflare API 返回 success）
  When 提交 Server Action contactFormAction
  Then 返回成功响应（含 referenceId）
  And Resend 邮件服务被调用（mock 验证调用参数）
  And 无 console.error 输出
```

### Scenario 2: Inquiry API happy path
```gherkin
Scenario: 产品询盘 API 完整提交成功
  Given 有效的产品询盘请求 body
  And submittedAt 为当前时间
  And Turnstile token 有效
  When POST /api/inquiry
  Then 返回 200 + referenceId
  And lead pipeline 被调用（mock 验证）
```

### Scenario 3: 防护链串联验证
```gherkin
Scenario: 缺少 submittedAt 的请求在第一道关卡被拒
  Given 一个缺少 submittedAt 的联系表单提交
  When 提交 Server Action
  Then 返回错误（submittedAt 必填）
  And Turnstile 验证未被调用（不浪费外部请求）
  And Resend 未被调用
```

## 测试策略

**Mock 边界**：只 mock 外部服务（Turnstile API、Resend API），不 mock 内部模块。这样能验证内部模块串联后的真实行为。

**不是 E2E**：不启动浏览器，不测 UI。是 Server Action / API Route 层的集成测试。

## Files to Create

- `src/app/__tests__/contact-integration.test.ts`
- `src/app/api/inquiry/__tests__/inquiry-integration.test.ts`

## Steps

### Step 1: 搭建集成测试骨架

创建测试文件，配置只 mock Turnstile 和 Resend 的 setup。

### Step 2: 实现 happy path 测试

验证完整提交链路：参数验证 → Turnstile → 业务处理 → 邮件 → 响应。

### Step 3: 实现防护链串联测试

验证防护链短路：缺 submittedAt → 立即拒绝 → 后续步骤未执行。

## Verification Commands

```bash
pnpm vitest run src/app/__tests__/contact-integration.test.ts --reporter=verbose
pnpm vitest run src/app/api/inquiry/__tests__/inquiry-integration.test.ts --reporter=verbose
```

## Success Criteria

- Contact 和 inquiry happy path 测试通过
- 防护链串联测试通过
- 只 mock 外部服务，内部模块走真实调用
- 无 TypeScript 类型错误

## Commit

```
test: add contact and inquiry integration tests for submission pipeline
```
