# Task 012: WhatsApp webhook 入口防护 — 测试 (Red)

**depends-on:** —

## Description

为 WhatsApp webhook 的入口防护编写测试，覆盖：无效签名绕过限流、body 先读后验的资源消耗、大 body 无上限。

## Execution Context

**Task Number**: 012 of 027
**Phase**: C（原子化防滥用）
**Prerequisites**: 无（可与 008/010 并行）

## 审查证据

- `src/app/api/whatsapp/webhook/route.ts:66`：`await request.text()` 在签名验证之前
- `src/app/api/whatsapp/webhook/route.ts:71`：签名验证失败返回 401
- `src/app/api/whatsapp/webhook/route.ts:77`：rate limit 在签名验证之后
- 攻击路径：无效签名请求不消耗 rate limit 配额但消耗 body 解析 + HMAC 计算资源

## BDD Scenarios

### Scenario 1: 无效签名请求消耗限流配额
```gherkin
Scenario: 无效签名请求也受限流保护
  Given WhatsApp webhook 端点
  When 攻击者发送无效签名的请求
  Then 请求消耗 rate limit 配额
  And 超频后返回 429（而非无限 401）
```

### Scenario 2: 超大 body 被提前拒绝
```gherkin
Scenario: 超大 Content-Length 在读取 body 前被拒绝
  Given WhatsApp webhook 端点
  When 请求 Content-Length 超过合理阈值（如 1MB）
  Then 返回 413 Request Entity Too Large
  And 不执行 await request.text()
```

### Scenario 3: 正确执行顺序
```gherkin
Scenario: 防护链执行顺序为 限流→Content-Length→读body→签名
  Given WhatsApp webhook 端点收到 POST 请求
  When 请求处理开始
  Then 先检查 rate limit（不读 body）
  Then 检查 Content-Length 头
  Then 读取 body
  Then 验证签名
```

## Files to Modify/Create

- Modify: `src/app/api/whatsapp/webhook/__tests__/route.test.ts`（或创建）

## Steps

### Step 1: 定位现有测试

查找 WhatsApp webhook 测试文件和 mock 模式。

### Step 2: 添加限流顺序测试

验证 rate limit 在 body 读取之前执行。当前实现限流在签名之后，测试应**失败**。

### Step 3: 添加 Content-Length 检查测试

验证超大 body 被提前拒绝。当前无检查，测试应**失败**。

### Step 4: 添加无效签名+限流交互测试

验证无效签名请求消耗限流配额。当前不消耗，测试应**失败**。

## Verification Commands

```bash
pnpm vitest run src/app/api/whatsapp/ --reporter=verbose
```

## Success Criteria

- Scenario 1-3 测试失败（Red）
- 无 TypeScript 类型错误

## Commit

```
test(security): add whatsapp webhook hardening scenarios
```
