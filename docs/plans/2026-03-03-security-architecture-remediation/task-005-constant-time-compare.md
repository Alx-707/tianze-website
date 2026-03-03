# Task 005: API key 常量时间比较

**depends-on:** —

## Description

将 `cache/invalidate` 路由的 `validateApiKey` 从 `===` 改为项目已有的 `constantTimeCompare`。这是项目中唯一一个管理面认证路由还在用 `===` 的地方。

## Execution Context

**Task Number**: 005 of 027
**Phase**: A（安全快赢）
**Prerequisites**: 无（可与 001-004 并行）

## 审查证据

- `src/app/api/cache/invalidate/route.ts:92`：`return token === secret`
- 项目已有 `constantTimeCompare`：`src/lib/security-crypto.ts:380`
- 其他管理面路由已使用：`contact-api-validation.ts:245`、`whatsapp/send/route.ts:63`

## BDD Scenarios

### Scenario 1: 有效 token 通过认证
```gherkin
Scenario: 有效 API key 通过常量时间比较
  Given cache invalidation 端点收到请求
  When Authorization header 包含正确的 Bearer token
  Then 认证通过
```

### Scenario 2: 无效 token 被拒绝（常量时间）
```gherkin
Scenario: 无效 API key 被拒绝且不泄露时间信息
  Given cache invalidation 端点收到请求
  When Authorization header 包含错误的 Bearer token
  Then 返回 401
  And 比较操作使用 constantTimeCompare（不因前缀匹配长度影响响应时间）
```

## Files to Modify

- `src/app/api/cache/invalidate/route.ts` — `validateApiKey` 函数：`=== secret` → `constantTimeCompare(token, secret)`

## Steps

### Step 1: 替换比较方式

在 `validateApiKey` 函数中：
- 导入 `constantTimeCompare` from `@/lib/security-crypto`
- 将 `return token === secret` 改为 `return constantTimeCompare(token, secret)`

### Step 2: 更新/添加测试

确认现有 cache/invalidate 测试覆盖了认证路径。如有需要补充测试验证 `constantTimeCompare` 被调用。

## Verification Commands

```bash
pnpm vitest run src/app/api/cache/ --reporter=verbose
pnpm type-check
```

## Success Criteria

- `validateApiKey` 使用 `constantTimeCompare`
- 现有 cache/invalidate 测试通过
- 无 TypeScript 类型错误

## Commit

```
fix(security): use constant-time compare for cache invalidation API key
```
