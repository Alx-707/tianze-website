# AI Skills Agents One-by-One Review 2026-04

## 一句话结论

`/Users/Data/Warehouse/Pipe/tianze-website/.agents/skills` 里现在真正需要继续逐个分析的，是 **63 个 agents-only skill**。  
前面与 `.claude/skills` 同名的 31 个 overlap 已经全部收口成 bridge，不再是本轮重点。

## 当前基线

- `.claude` / `.agents` overlap：**31**
- 这 31 个 overlap 现在都已变成：`.agents -> .claude` 的 symlink bridge
- `agents-only`：**63**

下面只看这 63 个。

## 逐个 verdict

| Skill | Verdict | 原因 |
| --- | --- | --- |
| `ab-test-setup` | 归档/移除 | 当前 repo 没有持续实验基础设施，不值得做项目常驻 skill |
| `actionbook` | 归档/移除 | 浏览器任务已可由 Playwright / 明确脚本覆盖，不需要额外 action manual skill |
| `actionbook-scraper` | 归档/移除 | `actionbook` 的更窄变体，进一步冗余 |
| `agent-browser` | 归档/移除 | 与 browser tooling / Playwright 重叠，项目层不需要再保留一套 |
| `analytics-tracking` | 兼容层临时保留 | 站点有 inquiry / subscribe 转化链，埋点审计仍可能用到 |
| `audit-website` | 归档/移除 | 外部站点体检工具型 skill，不该作为项目常驻 |
| `brand-identity` | 归档/移除 | 品牌真相已在设计系统 / Impeccable / 内容文档中，不需要再保留单独 skill |
| `brand-voice` | 归档/移除 | 与内容规范、`product-marketing-context` 重叠 |
| `case-study-writing` | 归档/移除 | 内容运营型，不是 repo runtime skill |
| `ci-cd-pipeline-patterns` | 归档/移除 | 通用 CI/CD 方法库，不如 repo 自己的 scripts / runbook / workflows |
| `competitive-intelligence-analyst` | 归档/移除 | 市场研究型，离当前代码与站点 runtime 太远 |
| `competitor-alternatives` | 归档/移除 | 只有专门做 competitor SEO 战线时才有价值，现在不该常驻 |
| `conducting-user-interviews` | 归档/移除 | 用户研究方法库，不是项目 runtime skill |
| `content-quality-auditor` | 兼容层临时保留 | 如果后续继续做 GEO / EEAT 强化，这项还有价值 |
| `customer-feedback-analyzer` | 归档/移除 | 当前 repo 没有稳定 feedback ingest 流 |
| `customer-journey-map` | 归档/移除 | 策略方法型，不是项目常驻 runtime |
| `debugging` | 归档/移除 | 与 repo rules、`ai-smell-audit`、日常调试方法重叠 |
| `deep-research` | 归档/移除 | 与 `do-digger` / 直接 research workflow 重叠 |
| `design-system-starter` | 归档/移除 | 已有 Impeccable + `globals.css` + design docs，不需要再保留起步包 |
| `email-composer` | 归档/移除 | 非 repo runtime |
| `email-sequence` | 归档/移除 | 非 repo runtime |
| `emilkowal-animations` | 归档/移除 | 与 Impeccable motion / `animate` 家族重叠 |
| `enterprise-sales` | 归档/移除 | 非 repo runtime |
| `find-skills` | 归档/移除 | 当前目标是减 skill，不是继续扩 skill |
| `form-cro` | 兼容层临时保留 | inquiry / contact form 转化仍是站点主线，暂时还有审计价值 |
| `founder-sales` | 归档/移除 | 非 repo runtime |
| `geo-content-optimizer` | 兼容层临时保留 | 项目确实有 AI 搜索 / GEO 目标，这项仍有现实相关性 |
| `git-commit-helper` | 归档/移除 | 项目里不需要单独 skill 才能完成 commit hygiene |
| `git-master` | 归档/移除 | 过宽、过重，和当前 repo 协作规则重叠 |
| `inbound-lead-qualifier` | 归档/移除 | lead pipeline 的实现应该在代码与运营流程里，不必再保留一个项目 skill |
| `infographic` | 归档/移除 | 偏内容设计，离当前主线远 |
| `knowledge-base-builder` | 归档/移除 | 当前项目不是知识库主导型站点 |
| `landing-page-design` | 归档/移除 | 与 Impeccable 设计主链重叠 |
| `launch-strategy` | 归档/移除 | 运营方法库，不是 repo runtime |
| `linkedin-authority-builder` | 归档/移除 | 平台过窄，非项目 runtime |
| `localization-strategy` | 兼容层临时保留 | 项目是双语站，国际化策略仍有价值 |
| `market-researcher` | 归档/移除 | 市场研究方法库，不是项目 runtime |
| `marketing-ideas` | 归档/移除 | 泛 marketing idea skill，噪音大于价值 |
| `marketing-psychology` | 归档/移除 | 方法论过宽，不该项目常驻 |
| `next-best-practices` | 归档/移除 | 项目已内置 `.next-docs` 与 repo rules，不需要再保留一个项目 skill |
| `next-cache-components` | 归档/移除 | 同上；这类知识更适合文档和规则，而不是项目常驻 skill |
| `next-upgrade` | 归档/移除 | 只有升级窗口才需要，不应平时常驻 |
| `page-cro` | 归档/移除 | 与设计 / 内容 / 表单优化 skill 重叠，项目常驻价值不高 |
| `paid-ads` | 归档/移除 | 非 repo runtime |
| `positioning-messaging` | 归档/移除 | 与 `product-marketing-context`、brand docs 重叠 |
| `pricing-strategy` | 归档/移除 | 商业策略型，不是 repo runtime |
| `programmatic-seo` | 归档/移除 | 当前项目不是 pSEO 规模页生产线 |
| `qa-test-planner` | 归档/移除 | 项目已有很重的测试 / review / proof 体系，不需要再挂一个通用 QA planner |
| `schema-markup` | 兼容层临时保留 | 结构化数据仍是站点 SEO 主线，暂时保留价值成立 |
| `seo-audit` | 兼容层临时保留 | 站点 SEO 诊断仍可能长期发生 |
| `shadcn` | 归档/移除 | 组件栈知识更适合文档与源码，不需要 skill 常驻 |
| `social-content` | 归档/移除 | 非 repo runtime |
| `style-extractor` | 归档/移除 | 与 `design-md` / Impeccable / 设计审计链重叠 |
| `tailwind-v4-shadcn` | 归档/移除 | 与 stack docs / repo conventions 重叠 |
| `tailwindcss-animations` | 归档/移除 | 与 Impeccable animate / motion rules 重叠 |
| `technical-writer` | 归档/移除 | 通用写作 skill，不应挂在项目兼容层 |
| `ui-design-system` | 归档/移除 | 与 Impeccable + design tokens + `design-md` 重叠 |
| `ui-ux-pro-max` | 归档/移除 | 过大、过泛、重复面太多 |
| `vercel-composition-patterns` | 归档/移除 | 项目已有 `.next-docs` 与 repo-specific conventions，更适合直接查 docs |
| `vercel-react-best-practices` | 归档/移除 | 与 Next / React 文档、repo rules 重叠 |
| `web-design-guidelines` | 归档/移除 | 与 Impeccable / audit 设计链重叠 |
| `web-performance-optimization` | 归档/移除 | 通用性能方法库，不应项目常驻 |
| `writing-product-descriptions` | 归档/移除 | 内容运营型，不是 repo runtime |

## 当前最值得保留观察的少数 agents-only

只剩这 7 个我认为还有现实相关性：

- `analytics-tracking`
- `content-quality-auditor`
- `form-cro`
- `geo-content-optimizer`
- `localization-strategy`
- `schema-markup`
- `seo-audit`

它们的共同点是：

- 跟这个项目的营销站 / 双语 / SEO / 转化链条有真实关系
- 但也还没强到必须马上迁入 `.claude/skills`

## 下一步建议

如果继续精简，我建议顺序是：

1. 先把上面 63 个里的 **`归档/移除` 候选** 分一批移到 Trash
2. 只保留这几项继续观察：
   - `analytics-tracking`
   - `content-quality-auditor`
   - `form-cro`
   - `geo-content-optimizer`
   - `localization-strategy`
   - `schema-markup`
   - `seo-audit`
3. 等第二轮再决定这 7 个里哪些还值得迁入 `.claude/skills`
