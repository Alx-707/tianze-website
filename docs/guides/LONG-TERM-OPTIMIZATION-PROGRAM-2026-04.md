# 长期优化系列任务总规划

> Support doc:
> this file records long-horizon optimization strategy.
> It is a planning surface, not an immediate runtime truth document.

## 一句话结论

当前仓库的长期最优策略不是立刻做重结构，而是：

1. 继续收口真相源
2. 把仓库打磨成高标准单站基线
3. 让未来类似项目主要通过站点身份层、页面表达层、公共静态 SEO 层来替换

## 当前锁定

当前仍然锁定为：

- 不做共享层
- 不做多站点运行时
- 不做 `src/sites/**` 现行落地
- 优先完成单站高标准基线

## 长期最值得继续投入的方向

### 1. 真相源继续压平

- 让 authoring seams 更稳定
- 减少包装层误导

### 2. 内容与 SEO 资产化

- 把内容、SEO、站点身份继续从零散文本中抽出来

### 3. 证明链继续清楚

- 保住 release / Cloudflare / runtime proof 的边界

### 4. 未来再评估更重结构

- 没有真实分化证据前，不急着上完整多站结构

## 当前不做的事

- 不为了“未来可能”提前上大重构
- 不把单站仓库强行改成平台骨架
- 不为了结构好看而牺牲当前 proof 链

## 使用规则

- 这份文档是长期规划 support doc
- 如果和当前 runtime / release / proof 现实冲突，以 canonical docs 为准
- 如果需要追溯更旧的长链路推演，改看 git 历史，不再依赖 docs 里的 archive 长版。
