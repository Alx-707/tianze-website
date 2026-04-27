# JSON-LD Evidence - 2026-04-26

## 结论

workers.dev preview 已完成 deployed HTML 抓取检查；尚未完成 Google Rich Results Test。

当前已修复多 schema 页面输出多个独立 `application/ld+json` script 的问题。核心页面现在都只输出 1 个 JSON-LD script，并把 Organization / WebSite / 页面级 schema 合并进单个 `@graph`。

## Preview 状态

- Preview URL: `https://tianze-website-gateway-preview.kei-tang.workers.dev`
- Preview deploy: 成功
- Deployed smoke: PASS

## Deployed HTML 检查

来源: workers.dev preview HTML

| Page | JSON-LD script count | @graph nodes | Detected items | Verdict |
|---|---:|---:|---|---|
| `/en` | 1 | 2 | Organization, WebSite | PASS |
| `/zh` | 1 | 2 | Organization, WebSite | PASS |
| `/en/contact` | 1 | 3 | Organization, WebSite, FAQPage | PASS |
| `/zh/contact` | 1 | 3 | Organization, WebSite, FAQPage | PASS |
| `/en/products` | 1 | 3 | Organization, WebSite, BreadcrumbList | PASS |
| `/en/products/north-america` | 1 | 5 | Organization, WebSite, ProductGroup, BreadcrumbList, FAQPage | PASS |
| `/en/capabilities/bending-machines` | 1 | 4 | Organization, WebSite, ItemList, FAQPage | PASS |
| `/en/oem-custom-manufacturing` | 1 | 4 | Organization, WebSite, WebPage, FAQPage | PASS |

## 下一步

仍建议在正式域名可用后，用 Google Rich Results Test / URL Inspection 做外部验证；但本地和 workers.dev HTML 层面的多 script 风险已消除。
