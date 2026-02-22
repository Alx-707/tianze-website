# Task 002: 安装依赖 + 创建基础配置文件

**depends-on:** —

## Description

安装 `@opennextjs/cloudflare` 和 `wrangler` 作为 devDependencies，创建 OpenNext 配置文件（`open-next.config.ts`）、Wrangler 配置文件（`wrangler.jsonc`，含 env 分层）、本地开发变量文件（`.dev.vars`），并更新 `.gitignore`。所有新文件为 Cloudflare 专用，不影响现有 Vercel 构建链路。

## Execution Context

**Task Number**: 002 of 006
**Phase**: Setup
**Prerequisites**: 无

## Infra Verification Scenario

- Given: 项目仅有 Vercel 部署配置，无任何 Cloudflare 相关文件
- When: 依赖安装、配置文件创建完成
- Then: `pnpm install` 成功且 `devDependencies` 包含两个新包；`open-next.config.ts` 导出有效配置；`wrangler.jsonc` 包含 `nodejs_compat`、`global_fetch_strictly_public`、`WORKER_SELF_REFERENCE`、env 分层；`.dev.vars` 包含基础变量；`.gitignore` 包含 `.open-next/` 和 `.dev.vars`；`pnpm type-check` 和 `pnpm build` 均通过

## Files to Modify/Create

- Create: `open-next.config.ts`
- Create: `wrangler.jsonc`
- Create: `.dev.vars.example`（跟踪到 git，作为本地 `.dev.vars` 的模板）
- Create: `.dev.vars`（本地使用，已在 `.gitignore` 中忽略）
- Modify: `.gitignore`
- Modify: `package.json`（自动，通过 pnpm add）
- Modify: `pnpm-lock.yaml`（自动）

## Steps

### Step 1: 安装 devDependencies

运行 `pnpm add -D @opennextjs/cloudflare wrangler`

**Verification**: `package.json` 的 `devDependencies` 中出现两个新包

### Step 2: 创建 `open-next.config.ts`（项目根目录）

从 `@opennextjs/cloudflare` 导入 `defineCloudflareConfig`，配置：
- `incrementalCache` → `r2IncrementalCache`（从 `@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache` 导入）
- `queue` → `doQueue`（从 `@opennextjs/cloudflare/overrides/queue/do-queue` 导入）
- `tagCache` → `d1NextTagCache`（从 `@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache` 导入）

**Verification**: 文件存在，TypeScript 无语法错误

### Step 3: 创建 `wrangler.jsonc`（项目根目录）

基础配置：
- `$schema`: `node_modules/wrangler/config-schema.json`
- `name`: `"tianze-website"`
- `main`: `".open-next/worker.js"`
- `compatibility_date`: `"2025-09-01"`
- `compatibility_flags`: `["nodejs_compat", "global_fetch_strictly_public"]`
- `assets`: `{ "directory": ".open-next/assets", "binding": "ASSETS" }`
- `services`: `[{ "binding": "WORKER_SELF_REFERENCE", "service": "tianze-website" }]`
- `r2_buckets`: `NEXT_INC_CACHE_R2_BUCKET`，bucket_name 使用占位符
- `d1_databases`: `NEXT_TAG_CACHE_D1`，database_id 和 database_name 使用占位符
- `durable_objects.bindings`: `NEXT_CACHE_DO_QUEUE` → `DOQueueHandler`
- `migrations`: `[{ "tag": "v1", "new_sqlite_classes": ["DOQueueHandler"] }]`
- **不配 `triggers.crons`**

环境分层（`env.preview` / `env.production`）：
- 各自覆盖 `r2_buckets[0].bucket_name`
- 各自覆盖 `d1_databases[0].database_id` 和 `database_name`
- `vars` 中覆盖 `NEXT_PUBLIC_BASE_URL` 和 `NEXT_PUBLIC_DEPLOYMENT_PLATFORM`

**Verification**: JSONC 语法有效，IDE schema 验证通过

### Step 4: 创建 `.dev.vars.example` 和 `.dev.vars`（项目根目录）

创建 `.dev.vars.example`（跟踪到 git，作为模板）和 `.dev.vars`（本地使用，gitignore 忽略）。

两者内容相同，包含：
- `NODE_ENV=development`
- `NEXTJS_ENV=development`（预防性：部分 OpenNext 版本可能读取此变量）
- `NEXT_PUBLIC_BASE_URL=http://localhost:8787`
- `NEXT_PUBLIC_DEPLOYMENT_PLATFORM=cloudflare`
- 注释说明敏感变量（API keys 等）需手动添加，参考 `.env.local`

**Verification**: `.dev.vars.example` 和 `.dev.vars` 均存在

### Step 5: 更新 `.gitignore`

在 `# Vercel` 节之后新增：
```
# Cloudflare
.open-next/
.dev.vars
```

**Verification**: `grep ".open-next" .gitignore` 和 `grep ".dev.vars" .gitignore` 均有输出

### Step 6: 验证 Vercel 构建不受影响

运行 `pnpm type-check` 和 `pnpm build`

## Verification Commands

```bash
# 依赖检查
grep "@opennextjs/cloudflare" package.json
grep "wrangler" package.json

# 文件存在性
test -f open-next.config.ts && echo "OK"
test -f wrangler.jsonc && echo "OK"
test -f .dev.vars.example && echo "OK"

# 配置内容检查
grep "global_fetch_strictly_public" wrangler.jsonc
grep "WORKER_SELF_REFERENCE" wrangler.jsonc
grep "env" wrangler.jsonc

# gitignore 检查
grep ".open-next" .gitignore
grep ".dev.vars" .gitignore

# 构建验证
pnpm type-check
pnpm build
```

## Success Criteria

- 两个新 devDependencies 安装成功
- 4 个新文件创建（open-next.config.ts、wrangler.jsonc、.dev.vars.example、.dev.vars），内容符合规范
- `.gitignore` 包含 Cloudflare 忽略项
- `pnpm type-check` 零错误
- `pnpm build`（标准 Vercel 构建）成功

## Commit

```
chore: add opennextjs-cloudflare config and wrangler setup
```
