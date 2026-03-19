# Cloudflare Bundle Phase 6 Deliverable

## 目标
进入“多 Worker + bindings/origin routing”阶段，形成可构建、可 dry-run、可部署排序的架构骨架。

## 本轮落地

- 新增 `scripts/cloudflare/build-phase6-workers.mjs`
  - 构建后生成 5 个 Worker 入口：
    - `.open-next/workers/gateway.mjs`
    - `.open-next/workers/web.mjs`
    - `.open-next/workers/apiLead.mjs`
    - `.open-next/workers/apiOps.mjs`
    - `.open-next/workers/apiWhatsapp.mjs`
  - 生成 5 个 wrangler phase6 配置：
    - `.open-next/wrangler/phase6/gateway.jsonc`
    - `.open-next/wrangler/phase6/web.jsonc`
    - `.open-next/wrangler/phase6/api-lead.jsonc`
    - `.open-next/wrangler/phase6/api-ops.jsonc`
    - `.open-next/wrangler/phase6/api-whatsapp.jsonc`
- 新增 `scripts/cloudflare/deploy-phase6.mjs`
  - 部署顺序固定为：
    - `web -> api-lead -> api-ops -> api-whatsapp -> gateway`
  - 支持：
    - `preview|production`
    - `--dry-run`
- 更新 `package.json`
  - `build:cf:phase6`
  - `deploy:cf:phase6:preview`
  - `deploy:cf:phase6:production`
  - `deploy:cf:phase6:dry-run`

## 路由策略

- Gateway 在 middleware 后按路径分发：
  - `/api/whatsapp/* -> WORKER_API_WHATSAPP`
  - `/api/cache/invalidate|/api/csp-report -> WORKER_API_OPS`
  - `/api/contact|inquiry|subscribe|verify-turnstile|health -> WORKER_API_LEAD`
  - 其他 -> `WORKER_WEB`
- 通过 service bindings 转发，实现 origin routing。

## 验证命令

```bash
pnpm build:cf:phase6
for f in .open-next/workers/*.mjs; do node --check "$f"; done
pnpm run deploy:cf:phase6:dry-run
```

## 实测结果（2026-02-15）

- `build:cf:phase6` 成功，输出：
  - `[phase6] generated workers and wrangler configs`
- `deploy:cf:phase6:dry-run` 成功，输出 5 条 wrangler deploy 命令（preview）：
  - `web`
  - `api-lead`
  - `api-ops`
  - `api-whatsapp`
  - `gateway`

## 结论

- Phase 6 已从“单 Worker 内部分流”升级到“多 Worker 拓扑骨架”。
- 当前可进入下一步：在 preview 实网发布并做回归，再推广到 production。

## 实网验证收口（2026-02-17）

### 执行情况

- 已执行：`pnpm build:cf:phase6`（成功）
- 已执行：`pnpm run deploy:cf:phase6:preview`（失败）
- 已执行：`curl/openssl/dig` 对 preview 与主域做链路探测

### 阻塞项

- 阻塞 1（发布凭据）：
  - wrangler 在非交互环境报错：缺少 `CLOUDFLARE_API_TOKEN`，导致 preview 实发在首个 worker（`web`）即中止。
- 阻塞 2（域名可达性）：
  - `preview.tianze-pipe.com`、`tianze-pipe.com`（以及本机探测的 `workers.dev`）解析到 `198.18.45.x`；
  - TLS 握手失败（`SSL_ERROR_SYSCALL` / `unexpected eof while reading`），无法完成在线 API/header 验证。

### 收口结论

- Phase 6 的“构建与部署编排能力”已验证；
- 但“真实发布 + 在线路由回归”仍未闭环，当前状态应定义为 **Blocked（环境与凭据前置未满足）**。
