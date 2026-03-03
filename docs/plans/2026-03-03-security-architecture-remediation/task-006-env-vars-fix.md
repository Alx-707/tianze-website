# Task 006: 环境变量修正 — DEPLOYMENT_PLATFORM + cookie secure

**depends-on:** —

## Description

修复两个 Cloudflare Workers 环境下的配置问题：
1. `DEPLOYMENT_PLATFORM` 变量名不匹配导致 IP 退化为 `0.0.0.0`（所有用户共享 rate limit bucket）
2. `middleware.ts` 用 `NODE_ENV` 判断 cookie secure，在 Workers 中行为不确定

## Execution Context

**Task Number**: 006 of 027
**Phase**: B（Cloudflare 环境稳定性）
**Prerequisites**: 无

## 审查证据（三轮验证确认）

**IP 退化（已实锤）：**
- `wrangler.jsonc:100,140`：只设 `NEXT_PUBLIC_DEPLOYMENT_PLATFORM`
- `src/lib/security/client-ip.ts:86`：读 `process.env.DEPLOYMENT_PLATFORM`（无 NEXT_PUBLIC 前缀）
- `CF_PAGES` 是 Pages 专属变量，Workers 不注入（Cloudflare 官方文档确认）
- `.open-next/server-functions/default/index.mjs`：`processEnv.NODE_ENV = process.env.NODE_ENV ?? "production"`，第四分支 `NODE_ENV === "development"` 不满足
- **结论**：`getDeploymentPlatform()` 在 Workers 中返回 `null` → 不信任代理头 → IP = `0.0.0.0` → rate limit 对所有用户共享 bucket

**Cookie secure（不确定）：**
- `middleware.ts:28`：`process.env.NODE_ENV === "production"`
- `.open-next/middleware/handler.mjs`：无 `NODE_ENV` 引用或兜底
- Workers 运行时 `NODE_ENV` 值取决于 `nodejs_compat` 层，不保证为 `"production"`

## BDD Scenarios

### Scenario 1: Workers 环境正确识别平台
```gherkin
Scenario: Workers 生产环境正确返回 deployment platform
  Given 应用部署在 Cloudflare Workers
  And wrangler vars 中设置了 DEPLOYMENT_PLATFORM="cloudflare"
  When getDeploymentPlatform() 被调用
  Then 返回 "cloudflare"
  And getClientIP() 信任 CF-Connecting-IP 头
```

### Scenario 2: Cookie secure 不依赖 NODE_ENV
```gherkin
Scenario: Cookie secure 基于 APP_ENV 或协议判断
  Given 应用部署在 Cloudflare Workers 生产环境
  And APP_ENV="production"
  When middleware 设置 session cookie
  Then cookie 带 Secure 属性
  And 判断逻辑不依赖 process.env.NODE_ENV
```

### Scenario 3: Preview 环境 cookie 行为
```gherkin
Scenario: Preview 环境 cookie 正确标记
  Given 应用部署在 Cloudflare Workers preview 环境
  And APP_ENV="preview"
  When middleware 设置 session cookie
  Then cookie 带 Secure 属性（preview 也是 HTTPS）
```

## Files to Modify

- `wrangler.jsonc` — preview 和 production vars 各加 `"DEPLOYMENT_PLATFORM": "cloudflare"`
- `middleware.ts` — cookie secure 判断从 `NODE_ENV` 改为 `APP_ENV` 或 `request.nextUrl.protocol`
- `src/lib/env.ts` — 添加 `DEPLOYMENT_PLATFORM` server schema（如需 t3-env 验证）

## Steps

### Step 1: 添加 DEPLOYMENT_PLATFORM 到 wrangler vars

在 `wrangler.jsonc` 的 preview 和 production vars 中各加一行 `"DEPLOYMENT_PLATFORM": "cloudflare"`。这是一行配置变更，零代码风险，立即修复 IP 退化。

### Step 2: 修改 cookie secure 判断

在 `middleware.ts` 中将 `process.env.NODE_ENV === "production"` 改为基于 `APP_ENV`（`wrangler.jsonc:98,138` 已设置）或 `request.nextUrl.protocol === "https:"`。

### Step 3: 可选——env.ts 添加 DEPLOYMENT_PLATFORM 验证

如果项目使用 t3-env 验证 server 变量，在 `src/lib/env.ts` 的 server schema 中添加 `DEPLOYMENT_PLATFORM` 可选验证。

### Step 4: 验证

在 Cloudflare Workers 生产环境实测：
- 抓响应头确认 cookie 带 Secure
- 确认 rate limit 在不同 IP 下正确隔离（不再共享 bucket）

## Verification Commands

```bash
pnpm type-check
pnpm vitest run src/lib/security/__tests__/client-ip.test.ts --reporter=verbose
pnpm build
```

## Success Criteria

- `wrangler.jsonc` preview/production 均含 `DEPLOYMENT_PLATFORM`
- `middleware.ts` cookie secure 不再依赖 `NODE_ENV`
- `client-ip.test.ts` 相关测试通过
- 构建成功

## Commit

```
fix(security): add DEPLOYMENT_PLATFORM to wrangler vars, fix cookie secure判断
```
