# Route mode manual proof

Route mode is a manual proof lane in this quality uplift wave.

本轮不加 `review:route-mode` 自动化脚本。原因很直接：如果脚本只是读取
`reports/quality/route-mode-current.json` 这类本地报告，它在 clean checkout
里没有稳定来源，换一台机器或新检出分支就不可复现。这种报告只能证明“某次本地跑过”，不能证明当前代码真实产物仍一致。

## Manual proof command

先跑：

```bash
pnpm build
```

然后在 `next build` 的 route summary 里记录下面页面的 route mode：

## Evidence snapshot

- captured date: 2026-05-01
- commit: `07e52e1edce4a47d1038efbf7ea85b8e800863a2`
- command: `pnpm build`
- environment: local worktree path `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501`

下面表格只是这次 build 的 snapshot，不是永久 route-mode baseline。未来任何
route、layout、cache、rendering 或 Next.js 版本相关变更，都必须重新跑
`pnpm build`，并用新的 build 输出更新 evidence。

| Page | Route mode from build summary |
| --- | --- |
| `/en` | `◐` Partial Prerender |
| `/zh` | `◐` Partial Prerender |
| `/en/contact` | `◐` Partial Prerender |
| `/zh/contact` | `◐` Partial Prerender |
| `/en/products` | `◐` Partial Prerender |
| `/en/products/north-america` | `◐` Partial Prerender |
| `/en/about` | `◐` Partial Prerender |

Next.js 16.2.4 的本地文档说明：`next build` 会在输出里展示每个 route
的信息。当前 build summary 里 `○` 表示 static，`◐` 表示 Partial
Prerender，`ƒ` 表示 dynamic。当前人工证明只认同一次 `pnpm build` 的同次输出，不认同手写或历史缓存出来的 snapshot。

## When to automate

只有当脚本能从稳定 build artifact 里，在同一次运行中派生出 current snapshot
时，才可以新增 `review:route-mode`。

也就是说，自动化必须满足：

- clean checkout 可运行；
- current snapshot 来自同一次 build 的稳定产物；
- 不依赖已经存在的 `reports/quality/route-mode-current.json`；
- 不靠人工维护的 current JSON 冒充事实来源。

在满足这些条件之前，route mode 保持 manual proof lane。
