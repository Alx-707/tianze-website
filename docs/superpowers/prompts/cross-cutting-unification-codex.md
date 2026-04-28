# Codex Prompts: Cross-Cutting Technical Unification

## Prompt 1: Adversarial Review (先跑这个)

```
你是一位独立的技术审查员。请审查 docs/superpowers/specs/2026-04-24-cross-cutting-tech-unification.md 这份治理清单。

任务：
1. 读取设计文档，理解 6 个待统一的技术模块
2. 逐项验证当前代码是否真的存在文档描述的问题（不要信文档，自己 grep/read 确认）
3. 检查是否有遗漏的跨切面技术问题（文档没列到但实际存在不统一的）
4. 评估优先级排序是否合理
5. 检查每项的"目标状态"是否可行，有没有技术限制或副作用

输出格式：
- 每项：[确认/质疑/补充] + 一句话理由
- 遗漏项：列出问题 + 当前状态 + 建议优先级
- 优先级调整建议（如有）

约束：
- 不要修改任何代码
- 只做审查和评估
- 参考 .claude/rules/ 下的项目规则
- 参考 CLAUDE.md 了解项目约束
```

## Prompt 2: Plan + Execute (审查通过后跑这个)

```
你是一位高级工程师，负责执行项目跨切面技术统一任务。

设计文档：docs/superpowers/specs/2026-04-24-cross-cutting-tech-unification.md

执行规则：
1. 严格按照设计文档的优先级顺序执行（P0 → P1 → P2）
2. 每完成一项，独立 commit（conventional commits 格式，subject 全小写）
3. 每项完成后运行 `pnpm type-check` 确认无类型错误
4. 所有项完成后运行 `pnpm ci:local:quick` 确认全部通过
5. CI 有 70% 增量覆盖率门禁——如果你修改了 src/ 下的源码文件，确保有测试覆盖
6. 不要推送，不要创建 PR——完成后报告即可

具体任务（按顺序）：

### P0: 缓存 getPageBySlug
- 在 src/lib/content-query/queries.ts 中用 React.cache() 包装 getPageBySlug
- 同样包装 getPostBySlug（如果还没包装的话）
- 验证 getAllPostsCached / getPostBySlugCached 确实使用了缓存
- 运行相关测试确认无回归

### P1-a: 结构化数据统一
- 在 src/lib/structured-data-generators.ts 中只保留当前 live 页面需要的 builder；旧设备能力页已退役，不要重新新增 buildEquipmentListSchema()
- 修改 OEM 页面使用新的 builder；旧设备能力页已退役，不再作为当前目标
- 修改 faq-section.tsx 使用 generateFaqSchemaFromItems 替代 generateFAQSchema
- 迁移完成后删除 structured-data-helpers.ts 中的 generateFAQSchema（确认无其他调用者）
- 检查 generateBreadcrumbSchema 是否有调用者，无则删除
- 创建 .claude/rules/structured-data.md 文档，说明：
  - Layout 层：Organization + WebSite（站点级）
  - Page 层：页面特定 schema（FAQ, Article, Product 等）
  - 页面不允许内联 @context 对象

### P1-b: 首页 static params
- 修改 src/app/[locale]/page.tsx 使用 generateLocaleStaticParams()

### P1-c: 错误边界策略
- 为 blog/[slug]/ 创建 error.tsx（参考 contact/error.tsx 模式）
- 在 .claude/rules/conventions.md 中添加"错误边界策略"章节：
  - 交互页面（表单、动态数据）必须有 error.tsx
  - 纯内容页面可以依赖布局级兜底
  - 列出哪些页面属于哪一类

### P2-a: 路由配置集中
- 确保 src/config/paths/paths-config.ts 包含所有路由路径
- 修改页面文件的 generateMetadataForPath 调用，从 config 读取 path 而不是硬编码字符串
- 修改 single-site-seo.ts 的 SINGLE_SITE_PUBLIC_STATIC_PAGES 从 paths config 派生

### P2-b: 缓存策略文档
- 在 .claude/rules/conventions.md 中添加"缓存策略"章节：
  - React.cache() = 请求级去重
  - unstable_cache() / 'use cache' = 跨请求缓存
  - 命名约定：*Cached 后缀

约束：
- TypeScript strict 模式，不允许 any
- 不引入新依赖
- 遵循 .claude/rules/ 下的所有项目规则
- commit message 格式：type(scope): description（subject 全小写，不超过 50 字符）
```

## 使用方式

1. 新开 Codex CLI 终端
2. 先跑 Prompt 1（审查），看结果
3. 如有质疑项，和 Claude 讨论后调整设计文档
4. 审查通过后跑 Prompt 2（执行）
5. 完成后通知 Claude 接手 PR 流程
