# Docs Overview

这个目录现在主要分成五类东西：

1. **主真相层**：当前规则、运行时真相、发布证明
2. **技术现状层**：技术栈、缓存/部署等技术事实
3. **工作盘**：CWF / Impeccable / Superpowers 当前仍有价值的产物
4. **策略与规格**：为什么做、应该表现成什么样
5. **调研与历史材料**：补充输入、仍有参考价值的研究、以及已退出主树的历史批次

## 主入口文档

- `project-context.md`：项目背景、公司信息、业务信息
- `integrations.md`：后续可能引入的插件、组件、集成清单
- `design-truth.md`：当前设计真相文档

## 主真相层

- `guides/`：当前仍在使用的真相文档、proof 口径、治理合同
- 优先入口：
  - `guides/POLICY-SOURCE-OF-TRUTH.md`
  - `guides/CANONICAL-TRUTH-REGISTRY.md`
  - `guides/QUALITY-PROOF-LEVELS.md`
  - `guides/RELEASE-PROOF-RUNBOOK.md`

## 技术现状层

位于 `technical/`：
- `technical/tech-stack.md`：纯技术栈信息
- `technical/next16-cache-notes.md`：Next.js 16 / Cache Components / i18n 缓存注意点
- `technical/deployment-notes.md`：Cloudflare / build:cf / preview / deploy 当前技术事实

## 工作盘

- `cwf/`：内容工作盘。现在只保留内容基础资料 + FAQ 定稿 + homepage 定稿
- `impeccable/`：设计工作盘。现在只保留设计系统、少量最新原型和必要外部参考
- `superpowers/`：Superpowers 的 spec / plan / current program 产物

## 策略与规格

- `strategy/`：当前仍支撑站点结构、内容、SEO、转化和视觉判断的策略骨架
- `specs/`：当前保留的行为合同层

## 调研与历史材料

- `research/`：当前仍保留的竞品、市场和产品结构研究
- 历史执行计划、审计包、旧原型、旧文案等，默认优先通过 git 历史或 Trash 批次回看
- 这些内容不是 live truth；只有被 `guides/` 明确点名时，才算当前规则依据

## 历史材料

- 已退出当前主线的文档，默认不再长期挂在 `docs/` 主树
- 本轮更激进清理后，旧版文案、多轮 prototype、偏题技术研究、托管迁移调研，以及旧执行计划都优先移入 Trash 或改看 git 历史
