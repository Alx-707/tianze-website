# 全量吸收与落地详细任务规划

## 文档目的

这份文档把主路线图继续往下压一层。

如果说：

- [full-adoption-master-roadmap.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/full-adoption-master-roadmap.md)

回答的是“总顺序应该怎么排”，

那么这份文档回答的是：

**每个阶段到底要做哪些真实任务、更新哪些文档、AI 规则文档要怎么跟上、做到什么才算完成。**

这份文档默认接受一个现实前提：

- 后续主要仍由 Claude / Codex 这类 AI 持续编码
- 第二个、第三个业务网站已经确认存在
- 但当前阶段不能为了未来，过早把仓库拖进错误的重结构

## 一句话结论

完整落地应该拆成 8 个阶段。

正确顺序不是：

- 先做多站结构
- 再补文档和规则

正确顺序是：

1. 先固定真相源和入口
2. 先吸收 5 个参考仓库里不需要拆结构就能落地的做法
3. 先把当前项目单站形态整理清楚
4. 先把 AI 规则文档升级到和当前真相一致
5. 再补“以后多站也能少挨打”的验证边界
6. 再用第二个真实站点做最小试装
7. 再正式进入多站结构
8. 最后做文档收口和长期维护规则

简单说：

**先让当前项目和 AI 协作方式变稳，再让项目变大。**

## 最终完成的定义

只有同时满足下面 6 件事，才算“全量吸收、全量落地”。

1. 5 个参考仓库值得学的点，已经分别在当前项目落到具体入口，而不是只停留在分析文档里。
2. 当前项目的站点身份、内容资产、SEO 资产、Cloudflare 证明边界、质量护栏边界，已经比现在更清楚。
3. AI 规则文档、仓库真相文档、执行清单不再互相打架。
4. 第二个真实站点已经做过最小试装，抽象不是只停留在纸面。
5. 多站结构正式落地后，当前站没有明显被带坏。
6. 后续 Claude / Codex 接手时，有一套更稳定的默认轨道，而不是继续靠你人工兜底。

## 非目标

这份规划默认不追求下面这些事：

- 不追求把项目尽快改得像 `next-forge`
- 不追求把所有内容都变成复杂 CMS
- 不追求新增一整套重量级工具链，只为了“看起来完整”
- 不追求一步到位解决未来所有站点差异

## 8 个阶段总览

| 阶段 | 名称 | 核心问题 | 主要结果 |
|---|---|---|---|
| 0 | 真相源对齐 | 后面到底看谁说了算 | 总入口、真相源、路线图固定 |
| 1 | 非结构性吸收 | 5 个参考仓库先借什么 | 一批不改大结构的高价值改进 |
| 2 | 当前项目清理 | 单站项目现在最乱的地方在哪 | 站点身份、内容、SEO、页面边界更清楚 |
| 3 | AI 规则升级 | AI 以后怎么少误判 | AGENTS 和 `.claude/rules` 与现状对齐 |
| 4 | 证明边界补强 | 后面改动怎么知道没带坏 | 当前站 + 未来多站证明边界固定 |
| 5 | 第二站最小试装 | 抽象到底站不站得住 | 第二站最小真实接入 |
| 6 | 多站结构正式落地 | 什么时候才该上结构 | 单仓库多站结构正式实施 |
| 7 | 收口与维护 | 做完后怎么不再漂移 | 文档、规则、维护规则闭环 |

---

## 阶段 0：真相源对齐

### 目标

先把“什么是当前真相源、什么只是辅助文档、以后从哪里进入这套方案”固定下来。

### 现在为什么先做

因为后续主要靠 AI 编码。

如果入口不固定，AI 会持续发生三种误判：

- 看错文档
- 把旧判断当新判断
- 重复在已经有结论的问题上绕圈

### 主要任务

#### 0.1 固定总入口

交付物：

- [reference-repo-comparison-recommendation-package.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/reference-repo-comparison-recommendation-package.md)
- [full-adoption-master-roadmap.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/full-adoption-master-roadmap.md)
- [full-adoption-detailed-task-plan.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/full-adoption-detailed-task-plan.md)

完成标准：

- 后续再问“现在该先看什么”，答案固定为这三份文档

#### 0.2 固定政策真相源

交付物：

- [POLICY-SOURCE-OF-TRUTH.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/POLICY-SOURCE-OF-TRUTH.md)
- [CANONICAL-TRUTH-REGISTRY.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/CANONICAL-TRUTH-REGISTRY.md)
- [QUALITY-PROOF-LEVELS.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)

完成标准：

- 提到 truth / proof / policy 时，不再需要靠聊天去解释“哪个文档赢”

#### 0.3 固定当前阶段默认策略

交付物：

- [reference-repo-non-structural-adoption-checklist.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/reference-repo-non-structural-adoption-checklist.md)
- [multi-site-real-remediation-checklist.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/multi-site-real-remediation-checklist.md)

完成标准：

- 默认共识明确为：
  - 当前先做非结构性吸收
  - 多站结构属于后手

### 验收方式

- 文档之间互相引用不打架
- 总入口能说明“现在看哪份、以后看哪份”

---

## 阶段 1：5 个参考仓库非结构性吸收

### 目标

把 5 个参考仓库值得学的点先借进来，但不急着拆结构。

### 现在为什么先做

这是当前最值的部分。

它不会立刻让网站焕然一新，但会明显提升以后 AI 连续改动时的稳定性。

### 分仓库任务

#### 1.1 吸收 `nextjs-starter`

要落的点：

- 站点身份信息更集中
- i18n 入口更直白
- 页面不再偷偷承担业务事实
- 站点默认值和页面覆盖值关系更清楚

主要落点：

- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [site-facts.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/site-facts.ts)
- [routing-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/i18n/routing-config.ts)
- [load-messages.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/load-messages.ts)
- 首页 / 联系页 / 产品页

完成标准：

- 后续新增站点信息，不再继续随手散落

#### 1.2 吸收 `opennextjs-cloudflare`

要落的点：

- 平台问题和业务问题分开表达
- 本地信号和最终部署证明继续分开
- Cloudflare 脚本职责分组更直白
- 升级时补外部对照规则

主要落点：

- [RELEASE-PROOF-RUNBOOK.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/RELEASE-PROOF-RUNBOOK.md)
- [dependency-upgrade-playbook.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/dependency-upgrade-playbook.md)
- `scripts/cloudflare/**`
- `package.json`

完成标准：

- 后续排 Cloudflare 问题时，误把平台问题当业务问题的情况明显减少

#### 1.3 吸收 `tailwind-nextjs-starter-blog`

要落的点：

- 内容资产盘点正式进入日常判断
- SEO 资产和页面文案分开看
- 模板残留清理
- 内容类型更清楚

主要落点：

- [content-asset-inventory.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/content-asset-inventory.md)
- [content.json](/Users/Data/Warehouse/Pipe/tianze-website/content/config/content.json)
- `content/pages/**`
- `docs/cwf/context/company/**`

完成标准：

- 后续谈“内容”，不再只指页面上那几段字

#### 1.4 吸收 `Next-js-Boilerplate`

要落的点：

- 现有质量护栏重新分组
- 每组护栏到底在防什么说清楚
- 哪些底线不能降级写清楚

主要落点：

- [quality-guardrail-gap-table.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/quality-guardrail-gap-table.md)
- [QUALITY-PROOF-LEVELS.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
- [.claude/rules/quality-gates.md](/Users/Data/Warehouse/Pipe/tianze-website/.claude/rules/quality-gates.md)

完成标准：

- 以后提“跑哪些证明”，更像规则，不像临时经验

#### 1.5 吸收 `next-forge`

要落的点：

- 共享层和业务层边界意识
- 横切能力清单
- 未来升级窗口规则
- 多站结构触发条件

主要落点：

- [shared-truth-vs-tianze-business-truth-inventory.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/shared-truth-vs-tianze-business-truth-inventory.md)
- [site-difference-candidate-list.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/site-difference-candidate-list.md)
- [future-upgrade-window-rules.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/future-upgrade-window-rules.md)

完成标准：

- 后续再讨论“要不要像 next-forge”，不再是空泛讨论

### 验收方式

- [reference-repo-full-landing-point-map.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/reference-repo-full-landing-point-map.md) 里的全量落点都有明确状态
- 先完成非结构性吸收，再进入结构阶段

---

## 阶段 2：当前项目单站清理与收口

### 目标

先把当前这个站整理清楚。

### 现在为什么先做

因为如果当前单站都还是混的，多站结构只会把混乱放大。

### 主要任务

#### 2.1 站点身份层收口

内容：

- 品牌和公司事实
- 联系方式和社媒
- 产品目录和市场结构
- 默认 SEO 值

完成标准：

- 这些内容可以被明确看作“站点身份输入”

#### 2.2 消息和内容资产升级

内容：

- 运行时消息资产
- MDX 页面内容
- 结构化业务内容
- 模板残留清理

完成标准：

- 消息和内容正式被视为业务资产，不只是附属文案

#### 2.3 页面层去默认业务语境

内容：

- 首页
- 联系页
- 产品入口页
- 导航与页脚表现层

完成标准：

- 页面开始更多消费身份层和内容层，而不是自己继续藏业务真相

#### 2.4 Cloudflare 话语体系清理

内容：

- 问题归类语言统一
- 脚本职责解释统一
- 升级和回归的判断边界统一

完成标准：

- 以后有人排 Cloudflare 问题时，仓库自身更不容易自我误导

### 对应清单

- [multi-site-real-remediation-checklist.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/multi-site-real-remediation-checklist.md)
- [shared-truth-vs-tianze-business-truth-inventory.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/shared-truth-vs-tianze-business-truth-inventory.md)
- [content-asset-inventory.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/content-asset-inventory.md)

### 验收方式

- 当前站即使还只有一个，也已经更像未来可承接更多业务的底座

---

## 阶段 3：AI 规则文档升级

### 目标

让 Claude / Codex 后续按同一套规则工作，而不是继续靠聊天解释。

### 现在为什么必须做

因为后续主要是 AI 编码。

如果规则文档不跟上，前面做的整理很快就会被新任务冲散。

### 主要更新对象

#### 3.1 `AGENTS.md`

要补的方向：

- 当前阶段先吸收非结构性借鉴点，再做多站结构
- 站点身份层、内容资产层、页面层的表达方式
- 参考仓库路线图入口
- 多站结构何时才算进入实施窗口

#### 3.2 [.claude/rules/architecture.md](/Users/Data/Warehouse/Pipe/tianze-website/.claude/rules/architecture.md)

要补的方向：

- 当前单站治理优先
- 多站结构属于后手
- 当前共享层 / 业务层 / 内容层边界说明

#### 3.3 [.claude/rules/i18n.md](/Users/Data/Warehouse/Pipe/tianze-website/.claude/rules/i18n.md)

要补的方向：

- 消息资产已被正式视为站点资产的一部分
- 多站前提下，哪些仍是共享运行时真相，哪些未来可能按站点分

#### 3.4 [.claude/rules/quality-gates.md](/Users/Data/Warehouse/Pipe/tianze-website/.claude/rules/quality-gates.md)

要补的方向：

- 当前站证明边界
- 未来多站证明边界的扩展规则
- 哪些检查属于底线，不能因多站而被降级

#### 3.5 [.claude/rules/testing.md](/Users/Data/Warehouse/Pipe/tianze-website/.claude/rules/testing.md)

要补的方向：

- 当前站关键路径证明
- 第二站试装时最小验证面
- 多站后页面和身份串站风险的测试思路

#### 3.6 [.claude/rules/ai-smells.md](/Users/Data/Warehouse/Pipe/tianze-website/.claude/rules/ai-smells.md)

要补的方向：

- 不要为了多站点准备而提前引入错误抽象
- 不要在看似共享层继续偷藏业务真相
- 不要把未来多站规则写成当前已成立事实

#### 3.7 [frontend-llm-workflow.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/frontend-llm-workflow.md)

要补的方向：

- 当前项目前端改动如何遵守新的真相层次
- 页面设计和实现时，站点身份、内容、SEO、消息入口如何协同

#### 3.8 [AI-CODING-DETECTION-RUNBOOK.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/AI-CODING-DETECTION-RUNBOOK.md)

要补的方向：

- 新增“真相源漂移”和“结构提前固化”的检测思路
- 增加未来多站试装阶段的专项检查

### 完成标准

- AI 后续再接任务时，不需要反复靠聊天解释“当前阶段优先级”
- 规则文档和仓库现状尽量一致

### 验收方式

- `AGENTS.md` 和关键 `.claude/rules/*.md` 能共同表达同一套阶段策略

---

## 阶段 4：证明边界补强

### 目标

把“当前站没坏”和“未来多站也没坏”的证明边界都提前写清楚。

### 主要任务

#### 4.1 当前站证明边界重述

内容：

- 页面级证明
- 内容级证明
- 关键路径证明
- Cloudflare 本地信号 vs 最终部署证明

#### 4.2 多站前置证明草案

内容：

- 品牌串站检查
- 联系方式串站检查
- 默认 SEO 串站检查
- 语言、cookie、redirect、header 基线检查

#### 4.3 未来阶段验证分层

内容：

- 当前站验证
- 第二站最小试装验证
- 多站结构正式落地后的共享层验证

### 对应文档

- [multi-site-proof-requirements-draft.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/multi-site-proof-requirements-draft.md)
- [QUALITY-PROOF-LEVELS.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
- [RELEASE-PROOF-RUNBOOK.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/RELEASE-PROOF-RUNBOOK.md)

### 完成标准

- 以后不是“项目绿了”，而是能说清楚“哪一层绿了、哪一层还没证明”

---

## 阶段 5：第二站最小试装

### 目标

用第二个真实站点证明前面的判断不是纸上谈兵。

### 现在为什么必须做

因为到这一步，不再适合继续只做文档推演。

### 最小试装范围

建议最小只覆盖：

- 首页
- 联系页
- 一个产品入口
- 导航
- 页脚
- 默认 SEO

### 这一步要验证什么

- 当前抽出的站点身份入口够不够用
- 内容资产是不是已经足够分层
- 页面层是不是还偷偷依赖 Tianze 默认语境
- 现有质量护栏是否能看见串站问题

### 完成标准

- 第二站不需要复制一整个项目才能站起来
- 当前站不会因为第二站试装被明显带坏

### 当前先别做什么

- 不要一上来把第二站全部页面都做完
- 不要先改成完整 `apps/* + packages/*`

---

## 阶段 6：多站结构正式落地

### 目标

在前面都站住以后，才进入真正的多站结构。

### 现在为什么放到后面

因为结构是把当前理解写死。

只有当前理解已经通过前面几轮验证，结构才值得正式落下去。

### 主要任务

#### 6.1 确定正式结构模型

建议方向：

- 单仓库
- 一套共享底座
- 站点身份与内容有明确边界
- 各站点独立部署

#### 6.2 正式迁移入口

内容：

- 站点身份层
- 站点内容层
- 页面消费层
- 验证与发布入口

#### 6.3 正式分层验证

内容：

- 当前站回归证明
- 第二站基线证明
- 共享底座证明

### 对应文档

- [multi-site-architecture-strategy.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/multi-site-architecture-strategy.md)
- [multi-site-real-remediation-checklist.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/multi-site-real-remediation-checklist.md)

### 完成标准

- 结构落地后，不是“看起来像多站”，而是真的更容易接第二、第三站

---

## 阶段 7：收口与长期维护规则

### 目标

避免做完一次之后，半年后又慢慢漂回原样。

### 主要任务

#### 7.1 文档收口

内容：

- 把已经过时的分析文档标清楚角色
- 保留总入口和真相源入口
- 减少平行说法

#### 7.2 AI 协作规则收口

内容：

- 当前阶段已完成什么
- 后续任务默认从哪里进入
- 哪些旧习惯禁止恢复

#### 7.3 维护节奏

内容：

- 每次大升级后复查真相源
- 每次结构变化后同步更新 AI 规则
- 每次第二、第三站新增能力时，同步更新证明边界

### 完成标准

- 后续不是每隔一段时间就重新问“现在到底按什么规则做”

---

## 推荐执行节奏

为了避免一上来摊太大，建议按 4 个里程碑推进。

### 里程碑 1：先把当前项目和规则入口讲清楚

包含阶段：

- 阶段 0
- 阶段 1
- 阶段 3 的规则入口对齐部分

### 里程碑 2：先把当前单站整理清楚

包含阶段：

- 阶段 2
- 阶段 4 的当前站证明部分

### 里程碑 3：第二站最小试装

包含阶段：

- 阶段 5

### 里程碑 4：正式多站结构

包含阶段：

- 阶段 6
- 阶段 7

## 当前最重要的提醒

如果后续某次推进里出现下面这些情况，默认说明顺序又开始偏了：

- 还没把当前站整理清楚，就想先搭多站壳子
- 还没更新 AI 规则，就开始大量结构施工
- 第二站还没试装，就已经在谈完整多应用形态
- 文档还互相打架，就开始把结构判断写死进代码

简单说：

**多站结构是最终阶段，不是现在就该先上的开局动作。**

当前真正该做的是：

- 先把当前站整理得更清楚
- 先把 AI 规则跟上
- 先把第二站试装前提准备好

这样后面正式上结构，成功率高得多。
