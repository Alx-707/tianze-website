# Strategy Workspace

这个目录保留的是**当前仍在支撑站点方向判断**的策略骨架。

它回答的是：

- 我们为什么这样做
- 当前站点结构、内容、SEO、转化、视觉方向为什么这样定
- 实现层应该优先接哪一层策略，不应该凭感觉乱做

## 当前结构

- `current-strategy-summary.md`：当前有效策略摘要，压缩自原 ring1 / ring2 / ring3
- `ring4-implementation-handoff.md`：策略层到实现层的交接图

原 `ring1/`、`ring2/`、`ring3/` 已退出 live docs tree；需要追溯完整历史时看 git 历史或本机 Trash 批次。

## 当前使用规则

- 这层不是 live runtime truth
- 这层也不是发布 proof 文档
- 当前规则、运行时真相、proof 口径，优先看 `docs/guides/`
- 当你要回答“为什么当前站点应该这样组织、这样写、这样转化、这样设计”时，再看 `docs/strategy/`

## 清理原则

- 保留当前还在支撑决策的总结稿和控制稿
- 已经被当前摘要吸收的 raw research、人物画像、问题链和 post-launch 假设表，优先移出主树
- 如果一份策略文档既不再支撑当前决策，也不再被交接链引用，就不应该继续挂在这里
