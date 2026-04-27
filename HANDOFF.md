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
- Phase B 的 Cloudflare 权限阻塞已解决。已新增 local env loader，phase6 deploy / server-actions-key sync 会自动读取本地 `.env.local`。`.env.local` 已配置目标 Cloudflare account/token 和稳定 `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`，并已成功同步 preview 三个 phase6 workers 的 Server Actions secret。
- 2026-04-26：`pnpm deploy:cf:phase6:preview` 已成功发布到 workers.dev preview；2026-04-26 20:13 PDT 重新跑 `pnpm smoke:cf:deploy -- --base-url https://tianze-website-gateway-preview.kei-tang.workers.dev` 已通过，输出：`[post-deploy-smoke] All checks passed`。
- Contact 页曾在 Cloudflare Cache Components 运行时触发 `Uncached data was accessed outside of <Suspense>`。当前修复是：contact 页面改为读取构建期 `CONTENT_MANIFEST` + 静态 messages JSON；表单客户端组件改为浏览器端懒加载，避免 SSR 阶段触发 Server Action/header 相关路径；post-deploy smoke 改为顺序探测并重试冷启动 5xx/timeout。
- JSON-LD 多 script 风险已修复。关键页面现在输出单个 `application/ld+json` script，内部使用 `@graph` 合并 Organization / WebSite / 页面级 schema。`tests/e2e/seo-validation.spec.ts` 已覆盖这一点，workers.dev HTML 也已抓证。
- Smart Placement 已加入 `wrangler.jsonc`，phase6 生成的 web / apiLead / gateway worker config 会继承。小样本 `/api/health` P95：开启前 320ms，开启后 321ms，暂未见明显改善也未见负面影响。
- 2026-04-26 收尾审查后修正：`deploy:cf` / `deploy:cf:preview` / `deploy:cf:dry-run` 已改为 phase6 入口，`preview:cf:wrangler` 已禁用；phase6 生成配置不再注入误导性的 `deleted_classes` migration。旧 `tianze-website*` 服务名下历史 DO class 删除不是本 PR 已完成事项，后续需要单独 cleanup。已验证 `pnpm review:cf:official-compare`、targeted vitest、`pnpm deploy:cf:dry-run`、`pnpm release:verify` 全部通过。
- 自定义域名仍未闭环：`preview.tianze-pipe.com` / root / www 当前本机 TLS 连接失败；当前 Cloudflare token 可部署 Workers，但查询 `tianze-pipe.com` zone 返回空列表，不能完成 SSL/DNS/Resend DKIM 的 zone 级确认。
- 真实询盘链路仍未闭环：preview 三个 phase6 workers 当前 secret list 只有 `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`，缺 Resend / Airtable / Turnstile 相关 secrets。
- 当前 worktree 有未跟踪调研/审计材料，不要使用 `git add -A`。

## Next Steps

1. 如用户决定提交，按 phase 拆 commit，不要 `git add -A`：runtime cache removal、Cloudflare topology、governance/docs、Phase B fixes/evidence。
2. Cloudflare zone 权限补齐后，确认 SSL Full Strict、DNS root/www/preview、Resend DKIM/CNAME；Worker secrets 补齐后再跑真实询盘邮件/Airtable 链路。
3. OEM / Bending Machines 的 no-JS 内容深度仍需后续单独处理；workers.dev 可访问，但 HTML 仍有 skeleton marker。
4. **Legacy DO cleanup deferred**：旧 `tianze-website*` 服务名下的 `DOQueueHandler` / `DOShardedTagCache` / `BucketCachePurge` 仍未删除。完整 5 步执行步骤见 `docs/technical/deployment-notes.md` 的 "真正执行 cleanup 的步骤（独立 PR）" 段。前置条件：当前 PR merged + 生产稳定 ≥7 天 + Cloudflare zone 权限就位。**不要混进当前 PR 或任何普通 preview 收尾。**

## Key Files Changed Recently

- `docs/superpowers/plans/2026-04-26-launch-readiness-series.md`：更新为当前 workers.dev preview / JSON-LD / zone 权限真实状态。
- `HANDOFF.md`：更新当前 launch readiness 主线与剩余阻塞。
- `docs/technical/deployment-notes.md`：记录 runtime cache removal proof、preview deploy、JSON-LD @graph、Smart Placement、domain/zone boundary。
- `docs/audits/2026-04-26-*.md`：记录 JSON-LD / hreflang / Suspense 的 deployed preview 证据。
