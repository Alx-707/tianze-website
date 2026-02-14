# Task 005: 创建 Cloudflare 部署 GitHub Actions Workflow

**depends-on:** task-003

## Description

创建 `.github/workflows/cloudflare-deploy.yml`，支持手动触发部署到 Cloudflare Workers。复用 Vercel workflow 的 MISSING_MESSAGE 检测和部署后验证模式。现有 Vercel 和 CI workflow 完全不动。

## Execution Context

**Task Number**: 005 of 006
**Phase**: Integration
**Prerequisites**: Task 003 完成（`build:cf`/`deploy:cf` 脚本已定义）

## Infra Verification Scenario

- Given: 项目仅有 `vercel-deploy.yml` 和 `ci.yml` workflow
- When: Cloudflare workflow 创建完成
- Then: `.github/workflows/cloudflare-deploy.yml` 存在且 YAML 语法有效；使用 `workflow_dispatch` 触发；接受 `environment` 输入（preview/production）；构建步骤使用 `DEPLOY_TARGET=cloudflare`；包含 MISSING_MESSAGE 检测；包含部署后健康检查；现有 workflow 未被修改

## Files to Modify/Create

- Create: `.github/workflows/cloudflare-deploy.yml`

## Steps

### Step 1: 创建 workflow 文件

**触发方式：** `workflow_dispatch`，包含 `environment` 输入参数（choice: preview / production，默认 preview）

**并发控制：** 与 vercel-deploy.yml 类似模式

**Job 1: `build-and-deploy`**

Steps 设计要点：
1. Checkout 代码（`actions/checkout@v4`，`persist-credentials: false`）
2. 检查 Cloudflare 凭据（`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`）
3. 设置 pnpm + Node.js（版本与 vercel-deploy.yml 保持一致：pnpm 10.13.1、Node 20）
4. `pnpm install --frozen-lockfile`
5. 构建：`pnpm build:cf 2>&1 | tee cf_build.log`（环境变量已内置在脚本中）
6. MISSING_MESSAGE 检测：`grep -E -i "MISSING_MESSAGE" cf_build.log`
7. 上传构建日志 artifact（`actions/upload-artifact@v4`）
8. 部署：`pnpm exec opennextjs-cloudflare deploy --env ${{ inputs.environment }}`（使用 `pnpm exec` 确保 CLI 可从 `node_modules/.bin/` 找到）
9. 输出部署 URL

**Job 2: `post-deploy-verification`**（needs: build-and-deploy）

Steps 设计要点：
1. 等待部署就绪（curl 探测循环，复用 Vercel workflow 模式）
2. 健康检查：根路径、`/en`、`/zh` 返回 2xx
3. API 检查：`/api/health` 返回 200

**Secrets：**
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

**环境变量（构建时）：**
- `DEPLOY_TARGET` 和 `NEXT_PUBLIC_DEPLOYMENT_PLATFORM` 已内置在 `pnpm build:cf` 脚本中，workflow 无需额外传入

**不在 workflow 中传入的变量：** 业务变量（`RESEND_API_KEY` 等）通过 `wrangler secret put` 在 Cloudflare Dashboard 管理

**Verification**: YAML 语法有效

### Step 2: 验证 YAML 语法

使用 Python yaml 模块或在线验证器检查语法

### Step 3: 确认现有 workflow 未被修改

检查 `vercel-deploy.yml` 和 `ci.yml` 无 diff

## Verification Commands

```bash
# YAML 语法验证
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/cloudflare-deploy.yml'))"

# 关键内容检查
grep "workflow_dispatch" .github/workflows/cloudflare-deploy.yml
grep "DEPLOY_TARGET" .github/workflows/cloudflare-deploy.yml
grep "CLOUDFLARE_API_TOKEN" .github/workflows/cloudflare-deploy.yml
grep "MISSING_MESSAGE" .github/workflows/cloudflare-deploy.yml
grep "opennextjs-cloudflare" .github/workflows/cloudflare-deploy.yml

# 现有 workflow 未修改
git diff .github/workflows/vercel-deploy.yml
git diff .github/workflows/ci.yml
```

## Success Criteria

- Workflow 文件存在且 YAML 语法有效
- 使用 `workflow_dispatch` 手动触发
- 构建使用 `DEPLOY_TARGET=cloudflare` + `opennextjs-cloudflare` CLI
- 包含 MISSING_MESSAGE 检测步骤
- 包含部署后健康检查
- 现有 workflow 零改动

## Commit

```
ci: add cloudflare workers deploy workflow
```
