# Cloudflare Bundle Phase 3 Deliverable

## 目标
在不改变核心业务行为的前提下，完成低风险配置优化，并验证对 `.open-next` 工件体积的实测收益。

## 已落地方案（MVP）
- `open-next.config.ts`
  - 启用 `default.minify = true`
- `next.config.ts`
  - Cloudflare 构建关闭 `productionBrowserSourceMaps`

## 验证命令
```bash
pnpm build:cf
du -sh .open-next .open-next/server-functions/default \
  .open-next/server-functions/default/node_modules \
  .open-next/server-functions/default/.next .open-next/assets
stat -f '%z %N' .open-next/server-functions/default/handler.mjs
find .open-next/assets -type f -name '*.map' | wc -l
```

## 实测结果（2026-02-15）
- `.open-next`: `46M -> 34M`
- `.open-next/server-functions/default`: `36M -> 30M`
- `.open-next/server-functions/default/node_modules`: `19M -> 13M`
- `.open-next/assets`: `8.1M -> 2.1M`
- `handler.mjs`: `~9305.6KB -> ~9053.6KB`

## 结论
低风险方案收益明确，说明当前仍有可挖掘的配置优化空间；但距离 Free Plan `3 MiB` 目标仍有数量级差距，下一阶段需转向架构级拆分（OpenNext `functions` / 多 Worker 路由拆分）。

## 下一步建议
1. 设计并验证 OpenNext `functions` 拆分原型，测量单 function 工件体积。
2. 评估 Cloudflare service binding/origin routing 方案，把热路径和重路径拆到不同 Worker。
3. 保留当前 MVP 配置作为默认基线，避免回退到高噪音大工件状态。
