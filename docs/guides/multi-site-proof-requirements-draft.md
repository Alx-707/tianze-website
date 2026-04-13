# 多站点验证需求草案

## 文档目的

这份文档不是现在就接脚本，而是先把未来多站点最低验证面写清楚。

它回答的是：

- 以后共享层改动，至少要证明什么
- 以后站点层改动，至少要证明什么
- 哪些验证属于本地信号
- 哪些验证必须靠最终部署证明

## 一句话结论

未来如果进入多站点阶段，验证不能再只看“项目能不能构建”。

最低也要分成 4 层：

- 共享底座证明
- 站点身份证明
- Cloudflare 页面级本地信号
- 真实部署最终证明

简单说：

**以后多站点时，要证明的不只是“代码没坏”，还要证明“每个站点自己的身份和关键路径也没坏”。**

## 当前已有的可复用基础

当前仓库已经有一些很好的基础，不需要推倒重来：

- [release-proof.sh](/Users/Data/Warehouse/Pipe/tianze-website/scripts/release-proof.sh)
- [preview-smoke.mjs](/Users/Data/Warehouse/Pipe/tianze-website/scripts/cloudflare/preview-smoke.mjs)
- [QUALITY-PROOF-LEVELS.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
- [CANONICAL-TRUTH-REGISTRY.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/CANONICAL-TRUTH-REGISTRY.md)
- [RELEASE-SIGNOFF.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/RELEASE-SIGNOFF.md)

这说明：

- 现在不是完全没有验证体系
- 真正需要补的是“按未来多站点重新分层”

## 未来多站点的 4 层验证面

## 1. 共享底座证明

适用改动：

- i18n 运行时
- 内容加载底座
- 通用布局骨架
- 环境与配置底座
- 通用安全、缓存、导航、元数据生成能力

最低验证建议：

- `pnpm type-check`
- `pnpm lint:check`
- `pnpm validate:translations`
- `pnpm test:locale-runtime`
- `pnpm build`
- `pnpm build:cf`

它在防什么：

- 共享层一改，所有站点一起出问题
- 语言路由、消息加载、构建链路、Cloudflare 主链路被带坏

## 2. 站点身份证明

适用改动：

- 品牌名
- 公司事实
- 联系方式
- 社媒链接
- 产品目录
- 默认 SEO 文案
- 站点专属消息内容

最低验证建议：

- `pnpm validate:translations`
- 相关页面路由测试或关键页面渲染测试
- `pnpm build`
- `pnpm build:cf`

未来多站点时需要额外补的点：

- 每个站点至少要有一组“站点身份 smoke”
- 最低覆盖首页、联系页、主产品入口、页脚联系信息、默认 metadata

它在防什么：

- 共享功能没坏，但站点身份被改错
- 第二个站点上线后，内容还带着 Tianze 的痕迹

## 3. Cloudflare 本地页面级信号

适用改动：

- locale redirect
- cookie / header 行为
- 页面 SSR 输出
- manifest 兼容补丁
- 本地 preview 行为

最低验证建议：

- `pnpm smoke:cf:preview`
- 必要时 `pnpm smoke:cf:preview:strict`

当前原则要继续保留：

- 本地 stock preview 主要证明页面、跳转、cookie、header
- 它不是完整的最终部署真相

它在防什么：

- 升级后页面先在本地 preview 变 500
- locale redirect、cookie flags、页面级 manifest 问题回归

## 4. 真实部署最终证明

适用改动：

- Cloudflare 构建与部署链路
- Contact / inquiry / subscribe / health 等关键接口
- 站点真正上线前的最终确认

最低验证建议：

- `pnpm deploy:cf:preview`
- `pnpm smoke:cf:deploy -- --base-url <deployment-url>`

未来多站点时需要额外补的点：

- 每个站点都要有自己的部署后 smoke 地址和最小页面集
- `/api/health` 这类最终 API 证明继续放在部署后做，不回退到只靠本地 preview

它在防什么：

- “本地看着没事，但真部署后坏了”
- 把 Cloudflare 本地信号误当成最终真相

## 未来多站点最少页面集

以后如果真的有第二个站，每个站最低都应该证明这些页面或行为：

1. 首页
2. 联系页
3. 一个主产品入口页
4. 一个内容页或资源页
5. invalid locale redirect
6. 页脚联系信息与站点品牌是否正确

如果某个站没有产品页或内容页，就替换成它自己的主转化页。

## 未来多站点的最少验证矩阵

| 改动类型 | 最低本地证明 | 最低 Cloudflare 证明 | 是否需要按站点分别证明 |
| --- | --- | --- | --- |
| 共享底座改动 | type-check / lint / translations / locale-runtime / build | build:cf + smoke:cf:preview | 是 |
| 站点身份改动 | translations + 关键页面渲染检查 + build | build:cf | 是 |
| Cloudflare 链路改动 | build + build:cf | smoke:cf:preview + deploy:cf:preview + deployed smoke | 是 |
| 内容或 SEO 默认值改动 | 相关内容校验 + build | build:cf，必要时页面 smoke | 是 |
| Contact / inquiry / health 改动 | 相关合同测试 + build | deployed smoke | 是 |

## 当前最值得提前写死的 3 条规则

## 1. 共享层通过，不等于每个站点都通过

以后如果进入多站点，必须明确：

- 共享证明是一层
- 站点身份证明是另一层

## 2. 本地 Cloudflare preview 不是最终上线真相

这一点当前仓库已经很清楚，未来不能因为多站点变复杂就退回去。

## 3. 关键转化路径不能被“多站点抽象”稀释掉

Contact、inquiry、subscribe、health 这些关键路径，未来仍然要保持强验证，不要因为多了站点就降级成弱检查。

## 和 5 个参考仓库的关系

- `opennextjs-cloudflare` 提醒我们：平台边界和业务边界要分开证明
- `Next-js-Boilerplate` 提醒我们：质量门槛应该默认存在，而不是靠人提醒
- `next-forge` 提醒我们：以后如果真的进入更复杂结构，验证面也必须随之分层

## 这份草案现在的作用

这份草案现在不是要你马上改脚本，而是先把未来多站点的验证底线定下来。

这样以后真的开始第一阶段时，不会又回到：

- 到底测什么
- 哪些要每个站点都测
- 本地通过算不算结束

这些老问题上。
