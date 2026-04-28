# hreflang Evidence - 2026-04-26

## 结论

workers.dev preview 已完成 deployed HTML 验证。

部署后 HTML 检查显示：核心页面都有 3 条 alternate link，且 `x-default` 指向带 `/en` 前缀的 URL。这个结果没有复现 next-intl `localePrefix: "always"` 场景下 `x-default` 缺 locale 前缀的问题。

## Preview 状态

- Preview URL: `https://tianze-website-gateway-preview.kei-tang.workers.dev`
- Preview deploy: 成功
- Deployed smoke: PASS

## Deployed HTML 检查

来源: workers.dev preview HTML

| Page | HTML alternates | x-default includes `/en` | Local verdict |
|---|---:|---|---|
| `/en` | 3 | yes | PASS |
| `/zh` | 3 | yes | PASS |
| `/en/contact` | 3 | yes | PASS |
| `/zh/contact` | 3 | yes | PASS |
| `/en/products` | 3 | yes | PASS |
| `/en/products/north-america` | 3 | yes | PASS |
| `/en/oem-custom-manufacturing` | 3 | yes | PASS |

## 仍需线上确认

- 自定义域名 `https://preview.tianze-pipe.com` 修复后，再确认同样结果。
- 当前本机访问 `preview.tianze-pipe.com` / `tianze-pipe.com` / `www.tianze-pipe.com` 仍返回 TLS 连接失败；当前 Cloudflare token 也无法读取 `tianze-pipe.com` zone，说明域名级配置还不是本轮 workers.dev proof 的一部分。
- `sitemap.xml` 中的 alternate 是否和 HTML 一致。
- 每个 alternate URL 是否返回 200。
- Cloudflare redirect / canonical host 是否不会改写 alternate 目标。
