# Task 004: 平台感知代码改动

**depends-on:** task-002

## Description

对 3 个现有文件做最小化改动，使项目能在 Cloudflare 环境下正确运行，同时保持 Vercel 行为不变。涉及：添加平台标识环境变量（env.ts）、条件化 Vercel 专属 SDK（analytics）、条件化图片优化配置（next.config.ts）。

## Execution Context

**Task Number**: 004 of 006
**Phase**: Core Features
**Prerequisites**: Task 002 完成（理解平台分层逻辑）

## Infra Verification Scenario

- Given: 项目代码仅适配 Vercel 平台
- When: 3 个文件的平台感知改动完成
- Then: `NEXT_PUBLIC_DEPLOYMENT_PLATFORM` 同时出现在 env.ts 的 `client` schema 和 `runtimeEnv` 中；Vercel Analytics/SpeedInsights 仅在非 cloudflare 平台渲染；`images.unoptimized` 仅在 `DEPLOY_TARGET=cloudflare` 时为 `true`；未设置 `DEPLOY_TARGET` 时所有行为与改动前完全一致

## Files to Modify/Create

- Modify: `src/lib/env.ts` — `client` schema + `runtimeEnv` 各 +1 项
- Modify: `src/components/monitoring/enterprise-analytics-island.tsx` — 添加平台判断 + 修改渲染条件
- Modify: `next.config.ts` — 添加条件图片配置

## Steps

### Step 1: `src/lib/env.ts` — 添加平台标识变量

**1a)** 在 `client` schema 的 `NEXT_PUBLIC_SECURITY_MODE` 之后添加 `NEXT_PUBLIC_DEPLOYMENT_PLATFORM`：
- 类型：`z.enum(["vercel", "cloudflare", "self-hosted"])`
- 可选，默认 `"vercel"`

**1b)** 在 `runtimeEnv` 的 `NEXT_PUBLIC_SECURITY_MODE` 映射之后添加对应映射：
- `NEXT_PUBLIC_DEPLOYMENT_PLATFORM: process.env.NEXT_PUBLIC_DEPLOYMENT_PLATFORM`

关键：schema + runtimeEnv 必须同步，否则 `@t3-oss/env-nextjs` 运行时取不到值。

**Verification**: `pnpm type-check` 通过

### Step 2: `src/components/monitoring/enterprise-analytics-island.tsx` — 条件化 Vercel SDK

在组件函数体内（`const isProd = ...` 之后）添加平台判断变量，值为 `process.env.NEXT_PUBLIC_DEPLOYMENT_PLATFORM !== 'cloudflare'`

修改 Vercel Analytics 和 SpeedInsights 的渲染条件，从 `isProd &&` 改为 `isProd && isVercel &&`

GA4 部分完全不动（平台无关）。

**Verification**: `pnpm type-check` 通过

### Step 3: `next.config.ts` — 条件化图片优化配置

在文件顶部（plugin 初始化之后、`nextConfig` 定义之前）添加构建时平台检测变量，基于 `process.env.DEPLOY_TARGET === 'cloudflare'`

在 `images` 配置中使用条件展开：当 Cloudflare 构建时添加 `unoptimized: true`

决策说明：POC 阶段使用 Option A（`unoptimized: true`），后续可升级为 Cloudflare Images custom loader

**Verification**: `pnpm type-check` 通过

### Step 4: 综合验证

运行 type-check、标准 Vercel 构建、单元测试

## Verification Commands

```bash
# env.ts 检查
grep "NEXT_PUBLIC_DEPLOYMENT_PLATFORM" src/lib/env.ts | wc -l
# 应输出 >= 2（schema + runtimeEnv 两处）

# analytics 检查
grep "isVercel" src/components/monitoring/enterprise-analytics-island.tsx

# next.config.ts 检查
grep "DEPLOY_TARGET" next.config.ts
grep "unoptimized" next.config.ts

# 构建验证（无 DEPLOY_TARGET = Vercel 默认）
pnpm type-check
pnpm build
pnpm test
```

## Success Criteria

- `env.ts` 中 `NEXT_PUBLIC_DEPLOYMENT_PLATFORM` 在 schema 和 runtimeEnv 中各出现一次
- analytics 组件中 Vercel SDK 渲染条件包含平台判断
- `next.config.ts` 中图片配置根据 `DEPLOY_TARGET` 条件化
- 无 `DEPLOY_TARGET` 时标准 Vercel 构建成功
- 所有现有测试通过

## Commit

```
feat(deploy): add cloudflare platform detection and conditional config
```
