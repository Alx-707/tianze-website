# LLM 驱动的前端高质工作流与工具链（适配本项目）

> Support doc:
> this file records the repo-specific frontend LLM workflow.
> For current runtime truth and release proof, use the canonical docs in `docs/guides/`.

## 一句话结论

当前项目的前端 LLM workflow 已经收口成三层：

1. **业务/内容输入**：`docs/cwf/context/**`
2. **设计工作盘**：`docs/impeccable/**`
3. **实现与治理真相**：代码主树 + `docs/guides/**`

## 当前推荐流程

### Phase 0：先确认业务输入

先看：

- `docs/project-context.md`
- `docs/cwf/context/project-brief.md`
- `docs/cwf/context/company/**`

目的：

- 先确认公司、产品、客户、价值主张、内容边界

### Phase 1：文案工作盘

主入口：

- `docs/cwf/**`

作用：

- 组织页面级 copy 版本
- 保留当前批准稿和必要快照

### Phase 2：设计工作盘

主入口：

- `docs/impeccable/**`

作用：

- 存放设计系统
- 页面原型
- handoff
- 必要的设计审计摘要

### Phase 3：实现与治理

主入口：

- `docs/guides/POLICY-SOURCE-OF-TRUTH.md`
- `docs/guides/CANONICAL-TRUTH-REGISTRY.md`
- `docs/guides/QUALITY-PROOF-LEVELS.md`
- `docs/guides/RELEASE-PROOF-RUNBOOK.md`

作用：

- 确认当前真相
- 确认证明边界
- 确认发布验证口径

## 当前工作流边界

### CWF

- 负责内容工作盘
- 不负责 runtime truth

### Impeccable / DWF

- 负责设计工作盘
- 不负责生产运行时真相

### Guides

- 负责当前真相、证明和治理合同
- 不再承担所有工作流产物

## 当前最重要的约束

- 页面改动涉及站点身份时，先看 `src/config/single-site*.ts`
- 页面改动涉及文案、内容、SEO 默认值时，先区分它属于 authoring seam 还是工作盘
- 不要把历史 working notes 继续堆回 `guides/`

## 什么时候看长版

如果你要重新评估整套 LLM workflow、skills 选型和阶段拆分，优先基于当前 `docs/guides/`、`docs/impeccable/`、`docs/cwf/` 和代码主树重建判断；更旧的长版推演不再作为当前 docs surface 的依赖。
