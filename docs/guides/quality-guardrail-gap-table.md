# 质量护栏查漏补缺表

## 文档目的

这份文档不是重新发明一套检查，而是把当前已经存在的质量门槛重新按用途排清楚，再看哪些地方还缺。

它回答的是：

- 当前已经有哪些护栏
- 每个护栏到底在防什么
- 以后多站点时，哪些还能直接沿用，哪些要补一层

## 一句话结论

当前仓库的质量护栏并不少，甚至已经比很多模板更重。

真正的缺口不是“检查太少”，而是：

- 检查项很多，但还没按未来多站点重新分层
- 还缺“站点身份层”的明确验证
- 还缺“内容资产层”的明确整理

简单说：

**现在更像护栏很多但分组不够清楚，不是底线太低。**

## 质量护栏总表

| 护栏类别 | 当前已有内容 | 它在防什么 | 未来多站点还能不能直接沿用 | 当前缺口 | 主参考仓库 |
| --- | --- | --- | --- | --- | --- |
| 类型与静态正确性 | `pnpm type-check`、`pnpm lint:check`、`pnpm validate:config`、`pnpm truth:check` | 明显类型错误、配置错误、静态真相不一致 | 大部分可以直接沿用 | 还没区分共享层错误和站点身份错误 | `Next-js-Boilerplate` |
| 翻译与内容一致性 | `pnpm validate:translations`、`pnpm i18n:shape:check`、`pnpm content:slug-check`、`pnpm content:manifest` | 消息缺 key、翻译结构不一致、内容 slug 错误 | 可以沿用，但以后要按站点补一层 | 还没把消息文件当业务资产一起验证 | `nextjs-starter`、`tailwind-nextjs-starter-blog` |
| 运行时合同与关键路径 | `pnpm test:locale-runtime`、`pnpm test:lead-family`、`pnpm test:cache-health`、`pnpm test:release-smoke` | locale、lead、cache、关键页面行为被改坏 | 可以沿用，但以后要加站点层 smoke | 还没定义每个站自己的最小页面集 | `Next-js-Boilerplate` |
| 发布前综合证明 | `scripts/release-proof.sh`、`pnpm review:tier-a`、`pnpm review:clusters` | 关键变更没有拿到足够证明就合并或发版 | 可以沿用 | 还没按“共享底座 vs 站点身份”拆证明面 | `Next-js-Boilerplate` |
| Cloudflare 页面级本地信号 | `pnpm build:cf`、`pnpm preview:cf`、`pnpm smoke:cf:preview`、`pnpm smoke:cf:preview:strict` | 页面级 500、redirect/cookie/header 回归、manifest 问题 | 可以沿用 | 还没写成“未来每个站都要过什么页面集” | `opennextjs-cloudflare` |
| Cloudflare 最终部署证明 | `pnpm deploy:cf:preview`、`pnpm smoke:cf:deploy -- --base-url <url>` | 本地没问题但真实部署出问题 | 可以沿用 | 未来多站点时还缺“按站点逐个证明”的规则 | `opennextjs-cloudflare` |
| 安全与滥用防护 | `pnpm security:check`、`pnpm security:csp:check`、`pnpm lint:pii`、相关 API 测试 | 安全头、日志、滥用保护、敏感信息处理回归 | 大体可以沿用 | 未来不同站点的表单和入口差异还没单独纳管 | `Next-js-Boilerplate` |
| 架构与仓库卫生 | `pnpm arch:metrics`、`pnpm arch:hotspots`、`pnpm arch:conformance`、`pnpm review:legacy-markers`、`pnpm review:archive-hygiene` | 结构慢慢变乱、旧实现误导维护者 | 可以沿用 | 还没把“站点特例膨胀”写成显式预警项 | `next-forge` |

## 当前已经做得不错的地方

先说清楚一点：

当前仓库并不是“质量很松”的状态。

它已经明显强于很多普通模板的地方包括：

- 发布证明意识更重
- Cloudflare 平台边界分得更清楚
- 翻译和内容有专门检查
- 关键运行时合同已经有专门测试
- 对结构和仓库卫生也有额外关注

这意味着：

- 现在不是缺底线
- 而是缺“为了未来多站点，重新把底线分层”

## 当前最明显的 5 个缺口

## 1. 还没有“站点身份层”专属验证

现在很多检查在防共享功能坏掉，但还没有明确去防：

- 品牌名错了
- 联系方式串了
- 产品目录混了
- SEO 默认值还带着别的站痕迹

## 2. 还没有“每个站最低页面集”规则

未来多站点时，不能只说“build 过了”或“共享测试过了”。

还要明确每个站至少证明：

- 首页
- 联系页
- 主产品入口
- invalid locale redirect
- 页脚品牌和联系信息

## 3. 消息文件还没有被正式当成业务资产验证

当前翻译检查很强，但消息文件里已经混着大量品牌和产品事实。

以后多站点时，如果还只把它们当翻译文件看，就会漏风险。

## 4. 内容资产还没有进入质量护栏视角

现在已经有不少内容资产，但还没有形成：

- 哪些是运行时真相
- 哪些是研究资料
- 哪些是模板残留

这类边界规则。

## 5. 还没有把“站点特例膨胀”纳入结构预警

当前有结构和热点检查，但未来多站点真正危险的信号之一是：

- 代码里开始出现越来越多站点特例

这类问题现在还没有被单独写成预警面。

## 现在最值得补的 6 个动作

1. 继续保留现有重型证明体系，不要因为参考仓库更轻就回退。
2. 把“共享真相 vs 业务真相”当成质量前置条件，而不是架构讨论附属品。
3. 给未来多站点补一份“每个站最低页面集”规则。
4. 把消息文件正式纳入业务资产视角。
5. 把内容资产盘点和模板残留清理纳入质量治理，而不是只当内容整理。
6. 把“站点特例越来越多”写成架构告警信号。

## 哪些不要误学

从参考仓库看，下面这些东西现在都不值得为了“更像成熟项目”而硬搬：

- 不要因为 `Next-js-Boilerplate` 工具多，就继续叠新工具
- 不要因为 `next-forge` 分层漂亮，就现在先拆完整多应用
- 不要因为官方 Cloudflare 示例更轻，就削弱当前更重的证明面

## 和 5 个参考仓库的关系

- `Next-js-Boilerplate` 提醒我们：检查要系统化，但不是工具越多越好
- `opennextjs-cloudflare` 提醒我们：平台证明和业务证明要分开
- `next-forge` 提醒我们：未来多站点真正需要的是边界和预警，不是先上重量
- `nextjs-starter` 与 `tailwind-nextjs-starter-blog` 提醒我们：站点身份和内容资产本身就该被纳入治理

## 这份表现在的意义

这份表的价值不在“再增加一堆检查”，而在：

- 以后知道当前已经有什么
- 以后知道真正缺的是哪一层
- 以后知道多站点来了之后，哪些护栏要继续保留，哪些要加一层站点视角
