# Task 001: 更新迁移报告

**depends-on:** —

## Description

将 Codex 审查反馈和讨论修正纳入 `docs/migration/cloudflare-workers-migration-report.md`，使报告成为最新的决策底稿。涵盖脚本修正、Cron 延后、wrangler 配置补全、env.ts runtimeEnv 映射要求、.dev.vars 和 env 分层等 7 项修正。

## Execution Context

**Task Number**: 001 of 006
**Phase**: Documentation
**Prerequisites**: 无（可与 Task 002-004 并行）

## Infra Verification Scenario

- Given: 迁移报告包含原始（未修正）的脚本方案和配置建议
- When: 报告更新完成
- Then: 报告中 `build:cf` 使用 `opennextjs-cloudflare build`；`preview:cf`/`deploy:cf` 使用 OpenNext CLI；Cron 标注"POC 阶段延后"；`wrangler.jsonc` 示例包含 `global_fetch_strictly_public` 和 `WORKER_SELF_REFERENCE`；提及 `.dev.vars` 和 env 分层；`env.ts` 章节明确 runtimeEnv 映射要求

## Files to Modify/Create

- Modify: `docs/migration/cloudflare-workers-migration-report.md`

## Steps

### Step 1: 在报告末尾新增"十一、实施方案修正记录"章节

在"十、调研过程说明"之后，新增包含以下子节的章节：

**11.1 脚本修正** — `opennextjs-cloudflare build` 内含 `next build`，不需要 `next build && opennextjs-cloudflare build`；所有 CF 脚本统一使用 OpenNext CLI 入口

**11.2 Cron Triggers 延后** — CF Cron 触发 `scheduled()` handler 而非 HTTP 路由，POC 阶段不配置

**11.3 wrangler.jsonc 配置补全** — 添加 `global_fetch_strictly_public` compatibility flag 和 `WORKER_SELF_REFERENCE` service binding；资源名使用占位符 + env 分层

**11.4 env.ts runtimeEnv 映射** — `@t3-oss/env-nextjs` 要求 schema + runtimeEnv 两处同步

**11.5 本地开发环境** — 新增 `.dev.vars` 文件并加入 `.gitignore`

### Step 2: 更新报告"四、需要新增的配置文件"章节

更新 4.2 节 `wrangler.jsonc` 示例，使其包含 `global_fetch_strictly_public`、`WORKER_SELF_REFERENCE`、env 分层结构。新增 4.5 节 `.dev.vars`。

### Step 3: 更新报告"五、需要修改的现有文件"章节

在 `src/lib/env.ts` 行添加"需同步更新 runtimeEnv 映射"说明。

## Verification Commands

```bash
# 确认报告包含修正关键词
grep -c "opennextjs-cloudflare build" docs/migration/cloudflare-workers-migration-report.md
grep -c "global_fetch_strictly_public" docs/migration/cloudflare-workers-migration-report.md
grep -c "WORKER_SELF_REFERENCE" docs/migration/cloudflare-workers-migration-report.md
grep -c "runtimeEnv" docs/migration/cloudflare-workers-migration-report.md
grep -c ".dev.vars" docs/migration/cloudflare-workers-migration-report.md
```

## Success Criteria

- 报告包含全部 7 项修正
- 报告内部引用自洽（无遗留过时方案）
- `git diff` 确认仅修改目标文件

## Commit

```
docs: update cf migration report with codex review corrections
```
