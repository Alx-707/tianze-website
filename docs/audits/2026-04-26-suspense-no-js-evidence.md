# Suspense No-JS Evidence - 2026-04-26

## 结论

workers.dev preview 已完成 deployed HTML 抓取检查。

部署后 HTML 显示：多个使用 Suspense / PPR 的页面，在 HTML 中仍能看到 skeleton marker。Contact 已改为构建期静态内容读取，当前 deployed HTML 能返回正文和 FAQ；OEM 的静态 HTML 可见文本仍偏少，后续需要单独处理。旧设备能力页已在后续产品真相清理中退役。

这不是本轮 runtime cache 拆除引入的新问题；仓库现有 no-JS 测试也明确只要求 Contact shell 存在，没有要求完整正文。

## Preview 状态

- Preview URL: `https://tianze-website-gateway-preview.kei-tang.workers.dev`
- Preview deploy: 成功
- Deployed smoke: PASS

## Deployed HTML 检查

来源: workers.dev preview HTML

| Page | Visible chars | Skeleton markers present | Local verdict |
|---|---:|---|---|
| `/en` | 4737 | yes | PASS for smoke scope |
| `/zh` | 1742 | yes | PASS for smoke scope |
| `/en/contact` | 1359 | yes | PASS for deployed availability; no-JS depth still modest |
| `/zh/contact` | 596 | yes | PASS for deployed availability; no-JS depth still modest |
| `/en/products` | 1375 | yes | PASS for deployed availability; no-JS depth modest |
| `/en/products/north-america` | 5089 | yes | Needs later no-JS review |
| `/en/oem-custom-manufacturing` | 1676 | yes | Risk: shell-first no-JS content |

## 下一步

后续用真实 Googlebot / Rich Results / URL Inspection 再确认无 JS 抓取质量。如果 OEM 仍只拿到 fallback 或正文过少，再缩小 Suspense 边界或改为构建期静态读取。
