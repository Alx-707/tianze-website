# 参考仓库对标后的近期执行清单

## 文档目的

这份文档是长文档的执行版。

如果当前重点是“先吸收参考仓库借鉴点，不先做结构拆分”，默认应优先执行：

- [reference-repo-non-structural-adoption-checklist.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/archive/guides/reference-program/reference-repo-non-structural-adoption-checklist.md)

如果以后进入结构性整改阶段，再切到：

- [multi-site-real-remediation-checklist.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/archive/guides/reference-program/multi-site-real-remediation-checklist.md)

总览判断请先看：

- [reference-repo-comparison-recommendation-package.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/archive/guides/reference-program/reference-repo-comparison-recommendation-package.md)

它不再重复解释为什么，而是只回答三件事：

1. 现在先做什么最值
2. 每件事做到什么算完成
3. 现在明确先别做什么

适用前提：

- 当前不启动第一阶段多站点代码拆分
- 当前优先用参考仓库指导日常改造
- 当前目标是先提升清晰度、稳定性和后续准备度

## 一句话结论

未来多站点这件事，现在最值的动作不是拆结构，而是：

- 先把真相源写清楚
- 先把业务写死点圈出来
- 先把内容和质量门槛整理得更清楚
- 先把未来升级条件写死

简单说：

**先把“怎么判断”和“先补哪几刀”定下来。**

## 参考仓库分工表

后续讨论和改造，默认按这个分工看：

| 问题类型 | 主参考仓库 | 现在主要学什么 |
| --- | --- | --- |
| 单站组织、多语言、内容站整理 | `weijunext/nextjs-starter` | 轻量、清楚、集中配置 |
| Cloudflare 构建与部署判断 | `opennextjs/opennextjs-cloudflare` | 平台边界、验证分层、脚本收口 |
| 共享边界和未来多应用方向 | `vercel/next-forge` | 边界意识、共享能力分层 |
| 内容模型与 SEO 资产管理 | `timlrx/tailwind-nextjs-starter-blog` | 内容结构化、长期整洁 |
| 质量门槛与默认护栏 | `ixartz/Next-js-Boilerplate` | 检查体系、默认门禁 |

## 近期最值得做的 6 件事

## 1. 共享真相 vs 业务真相清单

### 目标

把当前仓库里哪些属于“共享底座”，哪些属于“Tianze 业务事实”列清楚。

### 现在为什么先做它

这是后面所有判断的前提。

如果这一步不清楚，后面无论是继续补文档，还是未来真的开始拆第一阶段，都会反复返工。

### 完成标准

- 至少列出一份清单，覆盖下面几类内容：
  - 共享能力
  - 业务身份
  - 高概率会成为未来站点差异的内容
- 清单里每项都能对应到当前仓库里的真实文件
- 不要求现在改代码，但要求以后讨论时不再凭印象

### 参考仓库来源

- `weijunext/nextjs-starter`
- `vercel/next-forge`

### 当前产出

- [shared-truth-vs-tianze-business-truth-inventory.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/archive/guides/reference-program/shared-truth-vs-tianze-business-truth-inventory.md)

## 2. 站点差异候选清单

### 目标

把未来最可能需要按站点拆开的内容单独列出来。

### 重点范围

- 品牌信息
- 联系方式与社媒
- 公司事实
- 产品目录
- 导航和页脚
- 默认 SEO 文案
- 消息文件
- 内容文件
- 主题和视觉 token

### 完成标准

- 每类候选资产都能找到当前所在位置
- 每类都写清楚“以后为什么可能变成站点差异”
- 不要求现在搬文件

### 参考仓库来源

- `weijunext/nextjs-starter`
- `timlrx/tailwind-nextjs-starter-blog`

### 当前产出

- [site-difference-candidate-list.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/archive/guides/reference-program/site-difference-candidate-list.md)

## 3. 内容资产盘点

### 目标

不要再把内容只当成“页面上的文案”，而是先盘清楚它现在有哪些类型。

### 重点关注

- 页面文案
- 消息文件
- MDX 内容
- SEO 元信息
- 以后可能扩成案例、行业页、产品页的数据

### 完成标准

- 能回答“当前有哪些内容资产类型”
- 能回答“哪些已经结构化，哪些还散在页面里”
- 能回答“哪些内容以后最容易在多个站点之间分开”

### 参考仓库来源

- `timlrx/tailwind-nextjs-starter-blog`

### 当前产出

- [content-asset-inventory.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/content-asset-inventory.md)

## 4. 多站点验证需求草案

### 目标

虽然现在不拆第一阶段代码，但先把未来验证要求写清楚。

### 至少要回答的问题

- 将来共享层改动，最低要验证什么
- 将来站点层改动，最低要验证什么
- 哪些验证是页面级
- 哪些验证是部署级
- 哪些验证需要按站点分别证明

### 完成标准

- 先形成一页草案，不要求现在接到脚本里
- 这页草案要能和当前已有发布证明体系对上
- Cloudflare 相关验证仍然保持“本地信号”和“最终部署证明”分开

### 参考仓库来源

- `opennextjs/opennextjs-cloudflare`
- `ixartz/Next-js-Boilerplate`

### 当前产出

- [multi-site-proof-requirements-draft.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/archive/guides/reference-program/multi-site-proof-requirements-draft.md)

## 5. 未来升级窗口规则

### 目标

先把“什么时候才值得升级到 next-forge 类完整结构”写死。

### 建议触发条件

- 页面结构差异持续扩大
- 发布节奏开始按站点分开
- 专属依赖越来越多
- 团队开始按站点而不是按共享层分工
- 当前仓库里出现越来越多不好收口的站点特例

### 完成标准

- 形成明确规则
- 以后讨论“要不要拆应用”时，先看规则，不靠感觉

### 参考仓库来源

- `vercel/next-forge`

### 当前产出

- [future-upgrade-window-rules.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/future-upgrade-window-rules.md)

## 6. 质量护栏查漏补缺表

### 目标

把当前已有的质量门槛重新按用途分一下类，看看还缺什么。

### 建议分组

- 代码正确性
- 内容与翻译一致性
- Cloudflare 部署证明
- 发布前最小必跑项
- 未来多站点会受影响的共享改动

### 完成标准

- 至少形成一张表
- 每个检查项都能回答“它在防什么”
- 每个检查项都能回答“以后多站点时还适不适用”

### 参考仓库来源

- `ixartz/Next-js-Boilerplate`
- `opennextjs/opennextjs-cloudflare`

### 当前产出

- [quality-guardrail-gap-table.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/archive/guides/reference-program/quality-guardrail-gap-table.md)

## 建议执行顺序

如果只看未来两到四周，建议按这个顺序推进：

1. 先做“共享真相 vs 业务真相清单”
2. 再做“站点差异候选清单”
3. 再做“内容资产盘点”
4. 再做“多站点验证需求草案”
5. 再写“未来升级窗口规则”
6. 最后整理“质量护栏查漏补缺表”

## 当前明确先别做的事

- 先别启动第一阶段代码拆分
- 先别迁移到完整多应用 `monorepo`
- 先别为了像成熟模板而引入更多重型工具
- 先别把未来多站点抽象硬塞进当前业务代码

## 使用方式

以后如果要继续推进，建议每次只拿这份清单里的一个条目往下做。

也就是说：

- 一次只解决一个判断问题
- 一次只沉淀一类清单
- 一次只补一层规则

这样推进会慢一点，但更稳，也更不容易过早把项目拖进结构重写。
