# Cloudflare Bundle Phase 5 Deliverable

## 目标
完成架构级原型：将 API 路由拆分为多个 OpenNext server function，并通过网关 worker 实现按路径分发，验证后续多 Worker 部署路线。

## 本轮落地

- `open-next.config.ts`
  - 新增 `functions`：
    - `apiLead`: `/api/contact|inquiry|subscribe|verify-turnstile|health`
    - `apiOps`: `/api/cache/invalidate|csp-report`
    - `apiWhatsapp`: `/api/whatsapp/*`
- `scripts/cloudflare/build-phase5-worker.mjs`
  - 构建后生成 `.open-next/worker.phase5.mjs`
  - 在 middleware 之后按路径分流到 `apiLead/apiOps/apiWhatsapp/default`
- `package.json`
  - 新增 `build:cf:phase5`

## 验证命令

```bash
pnpm build:cf:phase5
du -sh .open-next .open-next/server-functions .open-next/server-functions/* .open-next/assets
node --check .open-next/worker.phase5.mjs
pnpm type-check
```

## 实测结果（2026-02-15）

- 构建日志出现 4 个函数：
  - `apiLead`, `apiOps`, `apiWhatsapp`, `default`
- 体积：
  - `.open-next`: `82M`
  - `.open-next/server-functions/default`: `27M`
  - `.open-next/server-functions/apiLead`: `18M`
  - `.open-next/server-functions/apiOps`: `17M`
  - `.open-next/server-functions/apiWhatsapp`: `17M`
- 关键入口文件：
  - `default/handler.mjs`: `7,706,719` B
  - `apiLead/index.mjs`: `1,825,564` B
  - `apiOps/index.mjs`: `1,825,563` B
  - `apiWhatsapp/index.mjs`: `1,825,568` B

## 结论

- 原型目标达成：OpenNext 函数拆分与网关分发可运行，具备进入“多 Worker 真实隔离部署”的技术基础。
- 当前仍是单 Worker 内部分流，不等于 Free Plan 合规；要拿到 3 MiB 级约束收益，下一步必须拆为多个 Worker 服务并通过 service binding/origin routing 连接。

## 下一步（Phase 6 建议）

1. 设计 `gateway + apiLead + apiOps + apiWhatsapp + web(default)` 多 Worker 拓扑与 bindings。
2. 为每个 Worker 生成独立 wrangler 配置，只引入对应 `server-functions/<name>`。
3. 加入部署前体积门禁（按 Worker 维度统计并阻断）。
