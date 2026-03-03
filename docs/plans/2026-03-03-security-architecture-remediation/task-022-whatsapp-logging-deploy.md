# Task 022: WhatsApp 日志脱敏 + 部署 preflight

**depends-on:** —

## Description

两个独立但低耦合的修复：WhatsApp 服务日志脱敏手机号/不落消息原文；部署脚本接入 server-actions-key 同步检查。

## Execution Context

**Task Number**: 022 of 027
**Phase**: F（契约 + 性能 + 清理）
**Prerequisites**: 无

## 审查证据

- `src/lib/whatsapp-service.ts:241`：日志可能包含手机号和消息原文
- `scripts/cloudflare/sync-server-actions-key.mjs:90`：同步失败 `process.exit(1)`
- `scripts/cloudflare/deploy-phase6.mjs:136`：deploy 不检查 key 同步状态

## BDD Scenarios

### Scenario 1: 日志不含 PII
```gherkin
Scenario: WhatsApp 日志不泄露手机号和消息内容
  Given WhatsApp 服务处理消息
  When 记录日志
  Then 手机号被脱敏（如 +86****1234）
  And 消息原文不出现在日志中（只记录消息类型/长度等元数据）
```

### Scenario 2: 部署前检查 key 同步
```gherkin
Scenario: 部署脚本验证 server-actions-key 已同步
  Given 执行 deploy-phase6 脚本
  When 部署开始前
  Then 自动运行 sync-server-actions-key 检查
  And 如果同步失败，部署中止并报告原因
```

## Files to Modify

- `src/lib/whatsapp-service.ts` — 对日志中的手机号用 `sanitizePhone()` 脱敏，消息内容只记录 `messageType` + `messageLength`
- `scripts/cloudflare/deploy-phase6.mjs` — 在部署前调用 `sync-server-actions-key.mjs`，失败则中止

## Steps

### Step 1: 添加手机号脱敏函数

在 `src/lib/logger.ts`（已有 `sanitizeIP`、`sanitizeEmail`）添加 `sanitizePhone`：保留国家代码 + 末四位，中间用 `****` 替代。

### Step 2: 修改 WhatsApp 日志

在 `whatsapp-service.ts` 中用 `sanitizePhone` 替换所有日志中的手机号；移除消息原文，改为记录元数据。

### Step 3: 部署 preflight

在 `deploy-phase6.mjs` 的部署流程中添加 `sync-server-actions-key` 调用，失败则 `process.exit(1)`。

## Verification Commands

```bash
pnpm vitest run src/lib/__tests__/whatsapp-service.test.ts --reporter=verbose
pnpm type-check
```

## Success Criteria

- WhatsApp 日志不含明文手机号
- 部署脚本包含 key 同步 preflight
- 测试通过

## Commit

```
fix: sanitize whatsapp logs, add deploy preflight check
```
