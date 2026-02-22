# Task 003: 添加 CF 构建/预览/部署脚本

**depends-on:** task-002

## Description

在 `package.json` 中添加 3 个 Cloudflare Workers 专用脚本（`build:cf`、`preview:cf`、`deploy:cf`）。所有脚本使用 OpenNext CLI 作为统一入口。现有脚本完全不动。

## Execution Context

**Task Number**: 003 of 006
**Phase**: Setup
**Prerequisites**: Task 002 完成（`@opennextjs/cloudflare` 已安装）

## Infra Verification Scenario

- Given: `package.json` 仅有 Vercel 相关的 build/start 脚本
- When: 3 个 CF 脚本添加完成
- Then: `pnpm build:cf`、`pnpm preview:cf`、`pnpm deploy:cf` 命令可识别；现有 `pnpm build`/`pnpm dev`/`pnpm start` 行为不变

## Files to Modify/Create

- Modify: `package.json` — `scripts` 节新增 3 行

## Steps

### Step 1: 在 `package.json` 的 `scripts` 末尾区域添加 3 个脚本

在 `ci:local:fix` 之后添加：
- `build:cf`: `DEPLOY_TARGET=cloudflare NEXT_PUBLIC_DEPLOYMENT_PLATFORM=cloudflare opennextjs-cloudflare build`
- `preview:cf`: `DEPLOY_TARGET=cloudflare NEXT_PUBLIC_DEPLOYMENT_PLATFORM=cloudflare opennextjs-cloudflare build && opennextjs-cloudflare preview`
- `deploy:cf`: `DEPLOY_TARGET=cloudflare NEXT_PUBLIC_DEPLOYMENT_PLATFORM=cloudflare opennextjs-cloudflare build && opennextjs-cloudflare deploy`

关键决策：
- `build:cf` 不加 `next build` 前缀 — `opennextjs-cloudflare build` 内部已调用 `package.json` 的 `build` script
- 不提供 `deploy:cf:dry-run` — 用 `preview:cf` 本地验证替代
- `DEPLOY_TARGET` 和 `NEXT_PUBLIC_DEPLOYMENT_PLATFORM` 内置在脚本中，避免调用方漏传导致"半 Cloudflare"配置

**Verification**: `pnpm run` 输出列表中可见 3 个新脚本

### Step 2: 验证现有脚本未受影响

确认 `pnpm build` 仍指向 `next build`，`pnpm dev` 仍指向 `next dev --turbopack`

## Verification Commands

```bash
# 脚本注册检查
grep "build:cf" package.json
grep "preview:cf" package.json
grep "deploy:cf" package.json

# 现有脚本未被覆盖
grep '"build":' package.json | grep "next build"
grep '"dev":' package.json | grep "next dev"
```

## Success Criteria

- 3 个新脚本出现在 `package.json` 的 `scripts` 中
- 新脚本使用 `opennextjs-cloudflare` CLI（非 `wrangler`）
- 现有脚本行为不变
- JSON 语法有效

## Commit

可与 Task 002 合并提交，或独立：

```
chore: add cloudflare build/preview/deploy scripts
```
