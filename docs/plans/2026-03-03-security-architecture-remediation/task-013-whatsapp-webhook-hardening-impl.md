# Task 013: WhatsApp webhook 入口防护 — 实现 (Green)

**depends-on:** Task 012

## Description

重排 WhatsApp webhook POST 处理顺序为：限流 → Content-Length 检查 → 读取 body → 签名验证。使 Task 012 的失败测试通过。

## Execution Context

**Task Number**: 013 of 027
**Phase**: C（原子化防滥用）
**Prerequisites**: Task 012 测试处于 Red 状态

## BDD Scenarios

（与 Task 012 相同，此处为 Green 实现）

## Files to Modify

- `src/app/api/whatsapp/webhook/route.ts` — 重排 POST handler 内部逻辑

## Steps

### Step 1: 重排处理顺序

将 POST handler 内部逻辑改为：

```
1. Rate limit 检查（基于 IP，不读 body）
   → 429 if exceeded
2. Content-Length 头检查（设合理上限，如 1MB）
   → 413 if too large
3. await request.text()（此时已限流且 body 大小受控）
4. 签名验证
   → 401 if invalid
5. JSON 解析 + 业务处理
```

### Step 2: 确定 Content-Length 上限

Meta WhatsApp webhook 的正常 payload 通常 < 10KB。设置 1MB 上限（留足余量）：
- **有 Content-Length 头**：超过 1MB 直接 413 不读 body
- **无 Content-Length 头**：允许读取，但使用**流式读取 + 字节计数器**，实际读取量超过 1MB 时立即中断并返回 413。不依赖 Cloudflare Workers 的 100MB 平台限制作为安全边界
- **实现方式**：用 `ReadableStream` 或逐 chunk 读取 `request.body`，累计字节数超阈值时 `reader.cancel()` + 返回 413

### Step 3: 确保行为兼容

- 合法 Meta webhook 请求不受影响
- 签名验证逻辑不变
- 错误响应格式与现有保持一致

## Verification Commands

```bash
pnpm vitest run src/app/api/whatsapp/ --reporter=verbose
pnpm type-check
```

## Success Criteria

- Task 012 所有测试通过（Green）
- 无效签名请求消耗限流配额
- 超大 body 被提前拒绝
- 合法 webhook 请求不受影响
- 无 TypeScript 类型错误

## Commit

```
fix(security): reorder whatsapp webhook: rate-limit before body read
```
