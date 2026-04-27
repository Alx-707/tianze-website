# HANDOFF.md — Session Continuity

> 每次重要会话结束时更新，帮助新会话快速恢复上下文。

## Current Focus

Launch readiness：Cloudflare / OpenNext 上线前收口，当前主线是移除运行时缓存失效体系，改为静态生成 + 部署重建。

## Recent Decisions

- 研发全流程：`/cwf -> /dwf -> brainstorming -> BDD spec -> writing-plans -> TDD -> /pr`
- 设计系统采用 Impeccable Edition（dwf 重构完成）
- BDD + TDD 双驱动开发（behavioral-specification skill + superpowers TDD）
- 2026-04-26：运行时缓存架构选择 B。当前站点不靠 Next 运行时重验证做内容更新；R2/D1/DO runtime cache stack、旧缓存失效 API、旧 ops worker split 已从当前上线链路移除，并同步修复 release-proof / phase5 / phase6 / governance docs。
- 2026-04-26：不要按一个任务一个 subagent 并行执行 launch readiness 计划。由主控串行处理 Phase A；subagent 只可做只读审查或部署后独立 evidence 文件。

## Active Branches

Check `git branch` for current feature branches.

## Blockers

- Phase A 已完成。2026-04-26 20:55 PDT 在收尾审查修复后重新跑 `pnpm release:verify`，结果通过，最终输出：`Release verification completed successfully.`
- Phase B 的 Cloudflare 权限阻塞已解决。local env loader 已收紧：preview / dry-run 可默认读取本地 `.env.local`；production deploy 和 production/all server-actions-key sync 不再自动读取 repo-local `.env*`，必须使用 shell env 或显式 `--env-file`。`.env.local` 已配置目标 Cloudflare account/token 和稳定 `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`，并已成功同步 preview 三个 phase6 workers 的 Server Actions secret。
- 2026-04-26：`pnpm deploy:cf:phase6:preview` 已成功发布到 workers.dev preview；2026-04-26 20:13 PDT 重新跑 `pnpm smoke:cf:deploy -- --base-url https://tianze-website-gateway-preview.kei-tang.workers.dev` 已通过，输出：`[post-deploy-smoke] All checks passed`。
- Contact 页曾在 Cloudflare Cache Components 运行时触发 `Uncached data was accessed outside of <Suspense>`。当前修复是：contact 页面改为读取构建期 `CONTENT_MANIFEST` + 静态 messages JSON；交互表单保留在 `<Suspense>` 内，但 fallback 已改成 SSR 可见、不可编辑的静态 `<form>` 字段结构，避免 no-JS/首屏 HTML 只剩 skeleton，也避免用户在 hydration 前输入后被真实表单替换清空。post-deploy smoke 仍可重试冷启动 5xx/timeout，但现在会输出重试摘要，不再静默吞掉首击异常。
- JSON-LD 多 script 风险已修复。关键页面现在输出单个 `application/ld+json` script，内部使用 `@graph` 合并 Organization / WebSite / 页面级 schema。`tests/e2e/seo-validation.spec.ts` 已断言关键页面的 graph node types，workers.dev HTML 也已抓证。
- Smart Placement 已加入 `wrangler.jsonc`，phase6 生成的 web / apiLead / gateway worker config 会继承。小样本 `/api/health` P95：开启前 320ms，开启后 321ms，暂未见明显改善也未见负面影响。
- 2026-04-26 收尾审查后修正：`deploy:cf` / `deploy:cf:preview` / `deploy:cf:dry-run` 已改为 phase6 入口，`preview:cf:wrangler` 已禁用；phase6 生成配置不再注入误导性的 `deleted_classes` migration。旧 `tianze-website*` 服务名下历史 DO class 删除不是本 PR 已完成事项，后续需要单独 cleanup。已验证 `pnpm review:cf:official-compare`、targeted vitest、`pnpm deploy:cf:dry-run`、`pnpm release:verify` 全部通过。
- 2026-04-26/27 PR #87 review 第一批 + 第二批已处理：Contact/Home 补 `setRequestLocale`；Contact 恢复 no-JS 表单结构；production env auto-load fail-closed；phase6 生成产物禁止 R2/D1/DO/migrations 旧字段并纳入 compare gate；JSON-LD graph 失败降级、graph node type 测试加硬；空 FAQ 不再输出 FAQPage；local artifact trash 避免跨卷 rename，并加入 ESLint ignore；Contact copy fallback 不再显示 dotted key。2026-04-26 23:28 PDT 重新跑 `pnpm release:verify` 通过，最终输出：`Release verification completed successfully.` 第三批清理项和旧 Cloudflare Worker 服务名下 DO class cleanup 保持 deferred。
- 2026-04-27 第三批 review-swarm 保护缺口处理：`review:cf:official-compare` 默认改为 phase6 生成产物强检查，新增 `review:cf:official-compare:source` 给未构建前的源码检查；deploy alias 改为精确匹配并禁止夹带 cleanup/destructive 片段；phase6 API route 合同收敛到 topology contract 并明确禁止 `/api/cache/invalidate`；production worker deploy 输出不等于正式域名 cutover、不启动旧 DO cleanup 7 天计时。
- 自定义域名仍未闭环：`preview.tianze-pipe.com` / root / www 当前本机 TLS 连接失败；当前 Cloudflare token 可部署 Workers，但查询 `tianze-pipe.com` zone 返回空列表，不能完成 SSL/DNS/Resend DKIM 的 zone 级确认。
- 真实询盘链路仍未闭环：preview 三个 phase6 workers 当前 secret list 只有 `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`，缺 Resend / Airtable / Turnstile 相关 secrets。
- 当前 worktree 有未跟踪调研/审计材料，不要使用 `git add -A`。

## Next Steps

1. Third batch cleanup should run on a branch, not directly on `main`. Start with:
   - `pnpm truth:check`
   - `pnpm review:translation-quartet`
   - `pnpm review:translate-compat`
2. If touching runtime, Cloudflare, or phase6 scripts, also run:
   - `pnpm clean:next-artifacts`
   - `pnpm build`
   - `pnpm build:cf:phase6`
   - `pnpm review:cf:official-compare`
3. Cloudflare zone 权限补齐后，确认 SSL Full Strict、DNS root/www/preview、Resend DKIM/CNAME；Worker secrets 补齐后再跑真实询盘邮件/Airtable 链路。
4. OEM / Bending Machines 的 no-JS 内容深度仍需后续单独处理；workers.dev 可访问，但 HTML 仍有 skeleton marker。
5. **Legacy DO cleanup deferred**：旧 `tianze-website*` 服务名下的 `DOQueueHandler` / `DOShardedTagCache` / `BucketCachePurge` 仍未删除。完整执行口径见 `docs/technical/deployment-notes.md` 的 Legacy Durable Object cleanup 段，技术债登记见 `docs/technical/technical-debt.md` 的 TD-003。7 天稳定观察期只在正式域名流量切到 phase6 production 后开始计算；workers.dev preview 不启动这个计时。没有用户明确确认时，只做只读调查，不执行 cleanup deploy 或 worker delete。

## Key Files Changed Recently

- `docs/superpowers/plans/2026-04-26-launch-readiness-series.md`：更新为当前 workers.dev preview / JSON-LD / zone 权限真实状态。
- `HANDOFF.md`：更新当前 launch readiness 主线与剩余阻塞。
- `docs/technical/deployment-notes.md`：记录 runtime cache removal proof、preview deploy、JSON-LD @graph、Smart Placement、domain/zone boundary。
- `docs/audits/2026-04-26-*.md`：记录 JSON-LD / hreflang / Suspense 的 deployed preview 证据。
