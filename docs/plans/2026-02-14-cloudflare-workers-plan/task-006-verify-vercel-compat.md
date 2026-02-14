# Task 006: 验证 Vercel 构建兼容性

**depends-on:** task-002, task-003, task-004, task-005

## Description

确认所有 Cloudflare 相关改动对 Vercel 部署链路零影响。运行完整 CI 验证（type-check → lint → test → build），检查构建产物结构，审查文件改动范围。这是整个 POC 的"安全网"验证。

## Execution Context

**Task Number**: 006 of 006
**Phase**: Testing
**Prerequisites**: Task 002-005 全部完成

## Infra Verification Scenario

- Given: 所有 Cloudflare 相关改动已就位（4 个新文件 + 6 个修改文件）
- When: 运行完整 CI 验证
- Then: `pnpm ci:local` 全部通过；构建日志无 MISSING_MESSAGE；`.next/` 目录正常；`.open-next/` 不存在（标准构建不产生）；`git diff --stat` 改动范围符合预期

## Files to Modify/Create

无新文件。此 task 为纯验证。

## Steps

### Step 1: 完整 CI 本地验证

运行 `pnpm ci:local`（type-check → lint → format → test → security → build → lighthouse）

**Verification**: 全部 gate 通过，零错误零警告

### Step 2: 验证标准构建产物

确认 `.next/` 目录存在且包含正常产物（`static/` 子目录非空）。
确认 `.open-next/` 目录不存在（标准 Vercel 构建不应产生此目录）。

**Verification**: 两项检查均通过

### Step 3: 构建日志 MISSING_MESSAGE 检查

运行 `pnpm build`，将输出导入日志文件，检查无 `MISSING_MESSAGE` 关键词。

**Verification**: grep 无匹配

### Step 4: 差异审查

运行 `git diff --stat HEAD` 确认改动范围。

预期改动文件（不含 pnpm-lock.yaml）：
- `open-next.config.ts`（新建）
- `wrangler.jsonc`（新建）
- `.dev.vars.example`（新建，跟踪到 git；`.dev.vars` 本身在 gitignore 中，不会出现在 diff）
- `.github/workflows/cloudflare-deploy.yml`（新建）
- `package.json`（+scripts, +devDeps）
- `.gitignore`（+3 行）
- `src/lib/env.ts`（+5 行）
- `src/components/monitoring/enterprise-analytics-island.tsx`（+3 行）
- `next.config.ts`（+3 行）
- `docs/migration/cloudflare-workers-migration-report.md`（更新）
- `docs/plans/2026-02-14-cloudflare-workers-plan/`（计划文件）

不在此列表中的文件改动需要审查和解释。

### Step 5: （可选）Cloudflare 构建验证

运行 `pnpm build:cf`（环境变量已内置在脚本中）

`opennextjs-cloudflare build` 仅产出 worker 文件和静态资源（`.open-next/`），不执行 cache population。如果 `wrangler.jsonc` 中资源占位符未替换（R2/D1），build 阶段仍可成功。cache population 在 `preview`/`deploy` 阶段发生，此处只需确认 build 产物正常生成。

## Verification Commands

```bash
# 完整 CI
pnpm ci:local

# 构建产物检查
test -d .next/static && echo "OK: .next/static exists"
test ! -d .open-next && echo "OK: .open-next not created"

# MISSING_MESSAGE 检查
pnpm build 2>&1 | tee /tmp/vercel-build.log
! grep -E -i "MISSING_MESSAGE" /tmp/vercel-build.log && echo "OK: No MISSING_MESSAGE"

# 改动范围
git diff --stat HEAD
```

## Success Criteria

- `pnpm ci:local` 全部通过（type-check、lint、test、build、lighthouse）
- 构建日志无 MISSING_MESSAGE
- `.next/` 正常，`.open-next/` 不存在
- 改动文件范围符合预期

## Commit

此 task 为验证性质，不产生新代码。验证全部通过后可合并到 develop 分支。
