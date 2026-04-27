# Deployment Notes

这份文档记录当前部署链路和运行时边界的关键技术事实。

## 当前部署现实

当前主部署链路以 Cloudflare 为重点，但仓库里同时保留多条验证与构建视角。  
不要把“某个命令过了”误读成“整个部署闭环已经证明”。

## 当前关键事实

### 0. 2026-04-26 runtime cache removal proof

本轮已选择“静态生成 + 重新部署”作为上线内容更新路径：

- 已移除 R2 / D1 / Durable Object runtime cache stack 的当前上线依赖
- 已移除旧缓存失效 API 和旧 ops worker split
- Cloudflare phase6 dry-run 已通过
- `pnpm release:verify` 已通过

有一个现实修正：产品市场 FAQ helper 保留了一个无 `cacheTag()` 的 Cache Components 边界。原因是 Next.js 16 Cache Components 开启时，完全移除该边界会让 `/[locale]/products/[market]` 构建失败。它只用于构建正确性，不作为线上内容更新机制。

### 1. 标准构建与 Cloudflare 构建要串行验证

当前默认顺序是：

1. `pnpm clean:next-artifacts && pnpm build`
2. `pnpm build:cf`

不要并行跑这两条链路。

### 2. `build:cf` 是当前正式 Cloudflare 构建入口

当前正式入口：

- `pnpm build:cf`

当前它走的是仓库内的 Webpack 包装链路，不是历史上更早那套简单 CLI 口径。

### 3. `build:cf:turbo` 只是对照/排查链路

它不是默认正式构建路径。  
保留它的意义是：

- 做兼容性对照
- 排查 OpenNext / Turbopack 相关差异

### 4. 当前运行时入口仍是 `src/middleware.ts`

虽然 Next.js 有新的 proxy 方向，但当前仓库现实是：

- `src/middleware.ts` 仍是当前运行时入口
- locale redirect / header / nonce / 一些 Cloudflare 兼容逻辑仍以它为准

### 5. 本地 preview 有证明边界

本地 Cloudflare preview 有价值，但有边界：

- 可用于页面、cookie、header、redirect 等本地信号检查
- 不能自动等同于最终部署真相

## 当前最重要的验证口径

### 标准链路

- `pnpm build`

### Cloudflare 构建链路

- `pnpm build:cf`

### 本地页面级信号

- `pnpm smoke:cf:preview`

### 更严格的本地诊断

- `pnpm smoke:cf:preview:strict`

### 最终部署级证明

- `pnpm smoke:cf:deploy -- --base-url <url>`

## 2026-04-26 Preview deploy 权限处理

本机 `pnpm deploy:cf:phase6:preview` 最终已完成真实 Cloudflare preview 发布。

早期失败点：

- 部署前置检查要求同步 `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
- 本轮临时生成了 preview 用 key，并尝试同步到 phase6 workers
- Wrangler 当前登录账号可以通过 `whoami`
- 但 Cloudflare API 在创建 Worker secret 时返回 `Authentication error [code: 10000]`
- 失败目标 worker: `tianze-website-gateway-preview`

这说明当时的问题不是构建链路，而是 Cloudflare 账号 / token / account 归属不一致。

后续处理：

- 已在本机 `.env.local` 配置目标 Cloudflare account/token；该文件被 `.gitignore` 忽略，不进入仓库。
- 已新增 local env loader，让 phase6 deploy / server-actions-key sync 自动读取 `.env.local`。
- 已成功同步 preview 三个 phase6 workers 的 `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` secret。
- `pnpm deploy:cf:phase6:preview` 已成功发布到 workers.dev preview。
- 当前 deployed smoke 通过：
  - `pnpm smoke:cf:deploy -- --base-url https://tianze-website-gateway-preview.kei-tang.workers.dev`

## 2026-04-26 Contact preview 500 修复

Cloudflare preview 初次可发布后，`/en/contact` 和 `/zh/contact` 曾返回 500。Cloudflare tail 反复显示：

- `Route "/[locale]/contact": Uncached data was accessed outside of <Suspense>`

最终处理：

- Contact 页面不再在运行时读取 MDX / messages；改为读取构建期生成的 `CONTENT_MANIFEST` 和静态 JSON messages。
- Contact FAQ 改为页面内同步渲染，不走通用 async FAQ 组件。
- Contact 表单改为浏览器端懒加载，避免页面 SSR 阶段触发 Server Action / `headers()` 相关路径。
- `post-deploy-smoke` 改为顺序探测页面，并对冷启动 5xx / timeout 做短重试。

验证结果：

- `/en` 200
- `/zh` 200
- `/en/contact` 200
- `/zh/contact` 200
- `/api/health` 200
- `pnpm smoke:cf:deploy -- --base-url https://tianze-website-gateway-preview.kei-tang.workers.dev` 通过

## 2026-04-26 JSON-LD @graph 收敛

本轮已把页面结构化数据从多个独立 JSON-LD script 收敛为单个 `@graph` script。

workers.dev preview 抓取结果：

| Page | JSON-LD scripts | @graph nodes |
|---|---:|---:|
| `/en` | 1 | 2 |
| `/zh` | 1 | 2 |
| `/en/contact` | 1 | 3 |
| `/zh/contact` | 1 | 3 |
| `/en/products` | 1 | 3 |
| `/en/products/north-america` | 1 | 5 |
| `/en/capabilities/bending-machines` | 1 | 4 |
| `/en/oem-custom-manufacturing` | 1 | 4 |

本地证明：

- `pnpm exec playwright test tests/e2e/seo-validation.spec.ts --project=chromium` 通过，覆盖 6 个关键页面的 title / canonical / JSON-LD / Open Graph / hreflang。
- workers.dev deployed HTML 抓取也确认每个核心页面只有 1 个 `application/ld+json`。

## 2026-04-26 Smart Placement

已在 `wrangler.jsonc` 加入：

```jsonc
"placement": { "mode": "smart" }
```

并同步让 phase6 生成的 web / apiLead / gateway worker config 继承该配置。

简单 `/api/health` 对比：

| Round | P95 | Median | Notes |
|---|---:|---:|---|
| Before Smart Placement | 320ms | 98ms | 20 samples, workers.dev preview |
| After Smart Placement | 321ms | 98ms | 20 samples, workers.dev preview |

结论：这轮小样本没有看到立刻改善，也没有看到明显负面影响。先保留配置；真正价值要等 Cloudflare 有更多流量和真实访问地理分布后再判断。

## 2026-04-26 Domain / zone boundary

当前 workers.dev preview 可用，但正式域名层还没闭环：

- `https://preview.tianze-pipe.com/en`
- `https://tianze-pipe.com/en`
- `https://www.tianze-pipe.com/en`

本机 `curl -I -L` 均返回 TLS 连接失败：

- `LibreSSL SSL_connect: SSL_ERROR_SYSCALL`

Cloudflare API 现有本地 token 可以发布 Workers 和写 Worker secret，但查询 `tianze-pipe.com` zone 返回空列表。也就是说，当前 token 不能完成 zone 级 SSL / DNS / Resend DKIM 检查。

后续要完成正式域名上线，需要有能读取/管理 `tianze-pipe.com` zone 的 Cloudflare token 或 dashboard 手动确认。

## 2026-04-26 Legacy Durable Object cleanup boundary

本轮 PR 的上线目标是切到 phase6 split-worker 拓扑，并从当前上线链路移除 R2 / D1 / Durable Object runtime cache stack。它不声称已经删除 Cloudflare 远端旧 `tianze-website` / `tianze-website-preview` / `tianze-website-production` 服务名下历史创建过的 Durable Object class。

原因：

- Cloudflare Durable Object delete migration 要求先移除 binding、移除 Worker code 对该 class 的引用，然后在同一个 Worker script 部署 `deleted_classes` migration。
- phase6 worker 名称是 `tianze-website-web` / `tianze-website-api-lead` / `tianze-website-gateway`，不是旧单 worker 服务名。
- 因此，把 `deleted_classes` 写进 phase6 生成配置，不能证明旧 `tianze-website*` 服务名下的 DO class 已被删除。

当前处理：

- package 里的 `deploy:cf`、`deploy:cf:preview`、`deploy:cf:dry-run` 已改为 phase6 入口。
- `preview:cf:wrangler` 已禁用，避免误走旧单 worker Wrangler entrypoint。
- phase6 生成配置不再注入误导性的 `deleted_classes` migration。

后续如果要真正删除旧 DO class，需要单独做一次 Cloudflare cleanup：确认旧服务不再承载流量和数据，再针对旧 `tianze-website*` script 执行专门的 delete migration。不要把这件事混进普通 preview 收尾。

### Legacy DO cleanup 的安全执行口径（独立维护窗口）

前置条件：

- PR #87 已 merged，且 production phase6 拓扑稳定运行至少 7 天
- 这个 7 天观察期只在正式域名流量切到 phase6 production Worker 后开始计算；workers.dev preview 不启动 cleanup 倒计时
- 拥有能读取 Worker deployments / versions / Durable Object namespace 的 Cloudflare token 或 dashboard 权限
- 旧 `tianze-website*` Worker 服务确认不再承载流量
- 用户明确确认进入 cleanup 维护窗口

这项工作已登记为技术债：`docs/technical/technical-debt.md` 的 TD-003。

只读调查：

```bash
pnpm exec wrangler deployments list --name tianze-website --json
pnpm exec wrangler deployments list --name tianze-website-preview --json
pnpm exec wrangler deployments list --name tianze-website-production --json
pnpm exec wrangler versions list --name tianze-website --json
pnpm exec wrangler versions list --name tianze-website-preview --json
pnpm exec wrangler versions list --name tianze-website-production --json
```

尾日志确认：

```bash
pnpm exec wrangler tail tianze-website --format json
pnpm exec wrangler tail tianze-website-preview --format json
pnpm exec wrangler tail tianze-website-production --format json
```

Cleanup 设计原则：

1. DO migration 必须部署到旧 Worker 服务名本身，不能部署到 phase6 的 `tianze-website-web` / `tianze-website-api-lead` / `tianze-website-gateway`。
2. 先读取旧 Worker 的实际 deployment / version / migration 历史，再选择新的 migration tag。不要复用历史 tag。
3. `deleted_classes` 只能包含旧 Worker 当前实际存在且代码已不再引用的 DO class。
4. 不要把 `new_sqlite_classes` 写进 cleanup 配置，除非当前旧 Worker 历史证明该 class 从未注册过；否则会和历史 migration 冲突。
5. 不要直接 `wrangler delete` 旧 Worker。先完成同名 Worker 的 `deleted_classes` migration 并确认 Durable Object namespace 清空。

执行动作保持单独 PR / 单独维护窗口；本第三批只允许更新 runbook 和只读调查，不执行 cleanup deploy。

执行完后：

- 在本文档记录 cleanup 完成日期、受影响服务名、migration tag 和验证证据
- 在 `HANDOFF.md` 移除 `Legacy DO cleanup deferred` 待办

## 2026-04-26 Resend / inquiry chain boundary

当前 preview 三个 phase6 workers 的 secret list 只有：

- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`

当前本机 `.env.local` 也只包含 Cloudflare 部署凭据，不包含：

- `RESEND_API_KEY`
- `EMAIL_FROM`
- `EMAIL_REPLY_TO`
- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_TABLE_NAME`
- `TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

因此本轮能证明页面可访问、Contact 表单 shell 可渲染、Cloudflare Worker 可部署；但不能证明真实询盘邮件和 Airtable 写入链路。要完成真实询盘闭环，需要先把上述 production/preview secrets 配到对应 Worker，再跑 `tests/e2e/smoke/post-deploy-form.spec.ts` 这类生产近似验证。

## 2026-04-26 Artifact size baseline

来源：`pnpm release:verify` 期间生成的 `.open-next` / `.next` 产物。

| Artifact | Size |
|---|---:|
| `.open-next/server-functions/default/handler.mjs` | 7.6M |
| `.open-next/server-functions/apiLead/index.mjs` | 1.8M |
| `.open-next/middleware/handler.mjs` | 612K |
| `.open-next/workers/gateway.mjs` | 3.6K |
| `.open-next/workers/web.mjs` | 1.0K |
| `.open-next/workers/apiLead.mjs` | 1.0K |
| `.next/static/css/f7584d3c19a68ed0.css` | 121K |
| `.next/static/css/d3eb1b04de2a6d3a.css` | 390B |

## 2026-04-26 Closeout verification evidence

收尾前重新跑了两条最新验证，作为本轮 workers.dev preview 收口证据。

本机时间：`2026-04-26 20:13:56 PDT`

| Check | Command | Result | Decisive output |
|---|---|---|---|
| Full release verification | `pnpm release:verify` | PASS | `Release verification completed successfully.` |
| Deployed workers.dev smoke | `pnpm smoke:cf:deploy -- --base-url https://tianze-website-gateway-preview.kei-tang.workers.dev` | PASS | `[post-deploy-smoke] All checks passed` |

`pnpm release:verify` 本轮覆盖了 docs truth、Cloudflare official compare、derivative readiness、type-check、lint、Tier A / cluster scans、locale runtime tests、lead family tests、health tests、translation validation、standard build、equipment build、Cloudflare build、phase6 dry-run、Playwright release smoke。Playwright release smoke 结果为 `43 passed`。

这份证据只证明当前 workers.dev preview 和代码侧 release gate；不包含 `preview.tianze-pipe.com` 自定义域名、正式 root/www 域名、Resend/Airtable/Turnstile 真实询盘链路。

## 2026-04-26 Review follow-up verification evidence

收尾审查指出旧 Cloudflare 部署入口和 DO delete migration 口径有误。修正后重新验证：

本机时间：`2026-04-26 20:55:38 PDT`

| Check | Command | Result | Decisive output |
|---|---|---|---|
| Cloudflare config guard | `pnpm review:cf:official-compare` | PASS | `cf-official-compare: passed` |
| Targeted unit tests | `pnpm exec vitest run 'src/app/[locale]/contact/__tests__/page.test.tsx' src/components/seo/__tests__/json-ld-script.test.ts tests/unit/scripts/phase6-topology-contract.test.ts` | PASS | `Test Files 3 passed (3); Tests 9 passed (9)` |
| Phase6 alias dry-run | `pnpm deploy:cf:dry-run` | PASS | `[phase6] dry-run complete` |
| Legacy wrangler guard | `pnpm preview:cf:wrangler` | Expected FAIL | `preview:cf:wrangler is disabled because it uses the old single-worker Wrangler entrypoint.` |
| Full release verification | `pnpm release:verify` | PASS | `Release verification completed successfully.` |

本次修正后的部署口径：

- `deploy:cf` -> phase6 production
- `deploy:cf:preview` -> phase6 preview
- `deploy:cf:dry-run` -> phase6 dry-run
- `preview:cf:wrangler` -> 禁用并提示使用 phase6
- phase6 生成配置不再注入 `deleted_classes`，避免误导为“旧 tianze-website 服务名下 DO 已删除”

## 当前要记住的风险点

- 不要把 stock preview 直接当最终部署证明
- 不要把 `build:cf` 通过误当页面/runtime 已验证
- 涉及 locale / middleware / header / Cloudflare 路径时，要看完整证明链路

## 当前参考来源

当前这份结论主要来自：

- `docs/guides/CLOUDFLARE-ISSUE-TAXONOMY.md`
- `docs/guides/RELEASE-PROOF-RUNBOOK.md`
- `docs/guides/QUALITY-PROOF-LEVELS.md`
- 当前代码与脚本主树（尤其 `src/middleware.ts`、`scripts/cloudflare/**`）

后面如果部署链路调整，优先更新这份文档。
