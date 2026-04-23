# Deployment Notes

这份文档记录当前部署链路和运行时边界的关键技术事实。

## 当前部署现实

当前主部署链路以 Cloudflare 为重点，但仓库里同时保留多条验证与构建视角。  
不要把“某个命令过了”误读成“整个部署闭环已经证明”。

## 当前关键事实

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

## 当前要记住的风险点

- 不要把 stock preview 直接当最终部署证明
- 不要把 `build:cf` 通过误当页面/runtime 已验证
- 涉及 locale / middleware / header / Cloudflare 路径时，要看完整证明链路

## 当前参考来源

当前这份结论主要来自：

- `docs/guides/CLOUDFLARE-ISSUE-TAXONOMY.md`
- `docs/archive/middleware-proxy-compat-record.md`
- `docs/guides/RELEASE-PROOF-RUNBOOK.md`
- `docs/guides/QUALITY-PROOF-LEVELS.md`

后面如果部署链路调整，优先更新这份文档。
