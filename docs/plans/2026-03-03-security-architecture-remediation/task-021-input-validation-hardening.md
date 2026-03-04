# Task 021: 输入校验加固

**depends-on:** —

## Description

修复 `/api/inquiry` 缺少 Zod strict schema 白名单、`validationErrorResponse` 向客户端透传 Zod issue 细节。

## Execution Context

**Task Number**: 021 of 027
**Phase**: F（契约 + 性能 + 清理）
**Prerequisites**: 无（可与 020 并行）

## 审查证据

- `src/app/api/inquiry/route.ts:121,139`：`safeParseJson` 未使用 strict schema，多余字段直接 spread 到 `processLead`
- `src/lib/api/validation-error-response.ts:23-25`：Zod issue 的 path 和 message 直接返回客户端

## BDD Scenarios

### Scenario 1: 多余字段被过滤
```gherkin
Scenario: 请求 body 中的未知字段被 Zod strict 过滤
  Given /api/inquiry 端点
  When 请求 body 包含 schema 未定义的字段（如 { name: "test", __proto__: {} }）
  Then 多余字段不传入 processLead
  And 返回 400（strict 模式拒绝未知字段）
```

### Scenario 2: 错误响应不泄露内部细节
```gherkin
Scenario: validation 错误只返回稳定 errorCode
  Given 请求 body 校验失败
  When createValidationErrorResponse 生成错误响应
  Then 响应只包含 errorCode 和通用 message
  And 不包含 Zod issue 的 path/message 细节（内部实现泄露）
```

## Files to Modify

- `src/app/api/inquiry/route.ts` — 使用 `z.object({...}).strict()` 替代宽松解析
- `src/lib/api/validation-error-response.ts` — 外部响应只返回 `errorCode`，Zod 细节只进 logger

## Steps

### Step 1: inquiry schema 改 strict

在 inquiry route 中定义或引用 strict Zod schema，拒绝未声明字段。

### Step 2: validationErrorResponse 脱敏

修改 `createValidationErrorResponse`：
- 外部响应：`{ success: false, errorCode: "VALIDATION_ERROR" }`
- 内部日志：`logger.warn("Validation failed", { issues: zodError.issues })`

### Step 3: 检查其他调用点

确认 `createValidationErrorResponse` 的所有调用点（cache/invalidate、contact 等）行为一致。

## Verification Commands

```bash
pnpm vitest run src/app/api/inquiry/ --reporter=verbose
pnpm vitest run src/lib/api/__tests__/ --reporter=verbose
pnpm type-check
```

## Success Criteria

- inquiry 端点使用 strict schema
- validation 错误不泄露 Zod issue 细节
- 现有测试通过
- 无 TypeScript 类型错误

## Commit

```
fix(security): strict schema validation, sanitize error responses
```
