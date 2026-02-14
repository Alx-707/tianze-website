# Cloudflare Workers 双环境并行部署 — 实施计划

> **For Claude:** Optional: Use Skill tool load `superpowers:executing-plans` skill for orchestrated execution, or execute tasks manually in order.

**Goal:** 在不破坏 Vercel 部署的前提下，新增 Cloudflare Workers 部署能力（POC 阶段）。

**Architecture:** 加法式改动 — 现有 Vercel 配置和代码保持不动，新增 Cloudflare 支持层。使用 `@opennextjs/cloudflare` 作为 Next.js → Workers 适配器。OpenNext 负责将 Next.js 构建产物转换为 Workers 兼容格式，配合 R2（增量缓存）、D1（标签缓存）、Durable Objects（队列）实现完整缓存链路。

**Tech Stack:** @opennextjs/cloudflare + wrangler + Cloudflare Workers (R2 / D1 / Durable Objects)

**Design Support:**
- [迁移可行性报告](../../migration/cloudflare-workers-migration-report.md)

**核心原则:**
1. Vercel 零影响 — 所有改动通过 `DEPLOY_TARGET` 环境变量条件隔离
2. POC 优先 — 选择最简方案（如 `images.unoptimized: true`），后续可升级
3. Cron 延后 — POC 阶段不配置 Cron Triggers，避免引入 custom worker entry 复杂度

---

## Execution Plan

- [Task 001: 更新迁移报告](./task-001-update-migration-report.md)
- [Task 002: 安装依赖 + 创建基础配置文件](./task-002-install-deps-base-config.md)
- [Task 003: 添加 CF 构建/预览/部署脚本](./task-003-add-cf-scripts.md)
- [Task 004: 平台感知代码改动](./task-004-platform-aware-changes.md)
- [Task 005: 创建 Cloudflare 部署 workflow](./task-005-cloudflare-deploy-workflow.md)
- [Task 006: 验证 Vercel 构建兼容性](./task-006-verify-vercel-compat.md)

### Dependencies

| Task | Depends On |
|------|------------|
| Task 001 | — |
| Task 002 | — |
| Task 003 | Task 002 |
| Task 004 | Task 002 |
| Task 005 | Task 003 |
| Task 006 | Task 002, 003, 004, 005 |

```
Task 001 (docs) ────────────────────────────────────────────┐
Task 002 (config) ──┬── Task 003 (scripts) ── Task 005 (CI) │
                    │                                        ├── Task 006 (verify)
                    └── Task 004 (platform)  ────────────────┘
```

Task 001 与 Task 002-004 可并行（docs vs code）。
Task 003 与 Task 004 可并行（互不依赖文件）。

---

## 改动总览

| 操作 | 文件 | 改动量 |
|------|------|--------|
| **新建** | `open-next.config.ts` | ~15 行 |
| **新建** | `wrangler.jsonc` | ~80 行 (含 env 分层) |
| **新建** | `.dev.vars.example` | ~10 行 |
| **新建** | `.github/workflows/cloudflare-deploy.yml` | ~80 行 |
| **修改** | `package.json` | +3 scripts, +2 devDeps |
| **修改** | `.gitignore` | +3 行 |
| **修改** | `src/lib/env.ts` | +5 行 (schema + runtimeEnv) |
| **修改** | `src/components/monitoring/enterprise-analytics-island.tsx` | +3 行 |
| **修改** | `next.config.ts` | +3 行 |
| **修改** | `docs/migration/cloudflare-workers-migration-report.md` | 更新修正章节 |

**总计：4 个新文件 + 6 个修改文件，约 190 行新增代码**

---

## 关键修正（相对原始计划）

以下 7 项修正来自 Codex 审查，已纳入各 task 文件：

1. `build:cf` 使用 `opennextjs-cloudflare build`（内含 `next build`，避免双重构建）
2. `preview:cf` / `deploy:cf` 使用 OpenNext CLI（不直接调 wrangler）
3. POC 阶段不配置 Cron Triggers（`scheduled()` handler 需 custom worker entry）
4. `wrangler.jsonc` 添加 `global_fetch_strictly_public` flag + `WORKER_SELF_REFERENCE` service binding
5. `env.ts` 新增变量必须同步 schema + runtimeEnv
6. 新增 `.dev.vars` 保证本地 preview 环境一致
7. `wrangler.jsonc` 资源名使用占位符 + env 分层（preview / production）

---

## Execution Handoff

Plan complete and saved to `docs/plans/2026-02-14-cloudflare-workers-plan/`. Execution options:

**1. Manual / Serial (Recommended)** - Execute tasks one by one, verify each step before proceeding.

**2. Orchestrated Execution (Optional)** - If `superpowers:executing-plans` skill is available, use it for automated task tracking.

**3. Agent Team (Optional)** - If `superpowers:agent-team-driven-development` skill is available, use it for parallel execution.
