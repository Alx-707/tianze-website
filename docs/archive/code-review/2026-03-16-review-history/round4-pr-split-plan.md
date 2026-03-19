# Round 4 PR 拆分方案（基于当前工作树，2026-03-09）

## 目标

把当前未提交工作树拆成一组可审、可测、可回滚的 PR，避免把 Round 4 全部执行结果压成一个超大提交。

## 先讲结论

基于**当前最终状态**，推荐使用下面这套拆法：

1. PR-A：Wave A 协议统一与错误消费闭环
2. PR-B：Wave B 测试与门禁信号修复
3. PR-C：Wave C 遗留假真相源清理
4. PR-D：Wave D 最终形态收口
5. PR-E：审查与迁移文档总账

不推荐把 “`proxy` 迁移” 和 “`middleware` 回退” 单独拆成两个真实 PR，原因是当前工作树里只保留了**最终形态**，没有一个干净、可直接切出的 `src/proxy.ts` 中间提交。  
如果要做历史上更漂亮的 stacked PR，需要先人工重建那个中间态。

## 拆分原则

### 1. 以当前最终形态为准

- 现在的仓库真相是：`src/middleware.ts` 仍为运行时入口。
- `src/app/[locale]/layout.tsx`、服务端 `<html lang>`、`useLocale()` 等 Wave D 收益已经成立，不应再次打散回旧状态。

### 2. 能按文件切就按文件切

- 优先用 path-based staging。
- 只有少数“一个文件里同时含两个 wave 的改动”才要求手工拆 hunk。

### 3. 总账文档最后单独提交

以下文件同时跨多个 wave，不适合跟任何单个代码 PR 绑定：

- `docs/code-review/issues.md`
- `docs/code-review/notes.md`
- `docs/plans/archive/2026-03-16-root-planning-files/task_plan.md`
- `docs/code-review/round4-execution-summary.md`
- `docs/code-review/round4-remediation-plan.md`
- `docs/code-review/round3-review.md`
- `docs/code-review/round2-plan.md`
- `docs/code-review/archive/2026-03-16-root-review-artifacts/linus_review_round3.md`
- `docs/plans/archive/2026-03-16-root-planning-files/notes.md`

这些文件统一放到 PR-E。

## PR-A：Wave A 协议统一与错误消费闭环

### 目标

- API 主路径统一返回稳定 `errorCode`
- 客户端主路径开始真正消费 `translateApiError()`
- server action 不再靠英文字符串做协议分支

### 直接纳入的文件

- `messages/en.json`
- `messages/en/critical.json`
- `messages/zh.json`
- `messages/zh/critical.json`
- `src/constants/api-error-codes.ts`
- `src/lib/idempotency.ts`
- `src/lib/server-action-utils.ts`
- `src/lib/actions/contact.ts`
- `src/app/api/csp-report/route.ts`
- `src/app/api/csp-report/__tests__/route-get-options.test.ts`
- `src/app/api/csp-report/__tests__/route-post-core.test.ts`
- `src/app/api/csp-report/__tests__/route.test.ts`
- `src/app/api/whatsapp/send/route.ts`
- `src/app/api/whatsapp/send/__tests__/route.test.ts`
- `src/app/api/whatsapp/webhook/route.ts`
- `src/app/api/whatsapp/webhook/__tests__/route.test.ts`
- `src/components/blog/blog-newsletter.tsx`
- `src/components/blog/__tests__/blog-newsletter.test.tsx`
- `src/components/products/product-inquiry-form.tsx`
- `src/components/products/__tests__/product-inquiry-form.test.tsx`
- `src/app/__tests__/actions.test.ts`
- `src/app/__tests__/contact-integration.test.ts`
- `tests/integration/api/subscribe.test.ts`
- `tests/integration/api/whatsapp-send.test.ts`
- `tests/integration/api/whatsapp-webhook.test.ts`

### 需要手工拆 hunk 的文件

- `src/components/forms/contact-form-container.tsx`
  - PR-A 保留：
    - `API_ERROR_CODES`
    - `translateApiError()`
    - `API_ERROR_NAMESPACE`
    - `ErrorDisplay` 内按 `errorCode` 翻译错误的逻辑
  - PR-C 再保留：
    - `FormSubmissionStatus` 的 import 路径从 `@/lib/validations` 切到 `@/lib/forms/form-submission-status`

### 建议验证

- `pnpm test -- src/app/__tests__/actions.test.ts`
- `pnpm test -- src/app/__tests__/contact-integration.test.ts`
- `pnpm test -- src/components/blog/__tests__/blog-newsletter.test.tsx`
- `pnpm test -- src/components/products/__tests__/product-inquiry-form.test.tsx`
- `pnpm test -- tests/integration/api/subscribe.test.ts`
- `pnpm test -- tests/integration/api/whatsapp-send.test.ts`
- `pnpm test -- tests/integration/api/whatsapp-webhook.test.ts`

## PR-B：Wave B 测试与门禁信号修复

### 目标

- 测试失败重新代表真实风险
- `ci:local` 不再伪装成“完全模拟 CI”
- 默认测试输出回到可读状态

### 直接纳入的文件

- `package.json`
- `scripts/ci-local.sh`
- `scripts/quality-gate.js`
- `vitest.config.mts`
- `src/components/forms/__tests__/contact-form-submission.test.tsx`

### 需要手工拆 hunk 的文件

- `src/components/layout/__tests__/mobile-navigation-responsive-basic.test.tsx`
  - PR-B 保留：
    - 删除 `Date.now()` / `<1000ms` 的 wall-clock 断言
    - 改为结构性状态断言
  - PR-D 再保留：
    - `useLocale` mock

- `src/components/layout/__tests__/mobile-navigation-responsive.test.tsx`
  - PR-B 保留：
    - 删除 wall-clock 断言
    - 改为 `aria-expanded` 结构性断言
  - PR-D 再保留：
    - `useLocale` mock

### 建议验证

- `pnpm test -- src/components/forms/__tests__/contact-form-submission.test.tsx`
- `pnpm test -- src/components/layout/__tests__/mobile-navigation-responsive-basic.test.tsx`
- `pnpm test -- src/components/layout/__tests__/mobile-navigation-responsive.test.tsx`
- `pnpm test`

## PR-C：Wave C 遗留假真相源清理

### 目标

- 删除零生产引用和测试保活假入口
- 拆掉 `validations.ts` 混合真相源
- 让类型/schema/helper 回到真实生产命名空间

### 直接纳入的文件

- `src/app/api/contact/contact-api-utils.ts`
- `src/app/api/contact/__tests__/contact-api-utils.test.ts`
- `src/app/api/contact/__tests__/route.test.ts`
- `src/lib/api-cache-utils.ts`
- `src/lib/metadata.ts`
- `src/lib/site-config.ts`
- `src/lib/security-headers.ts`
- `src/lib/translation-benchmarks.ts`
- `src/lib/translation-quality-types.ts`
- `src/lib/translation-validators.ts`
- `src/lib/validations.ts`
- `src/lib/api/get-request-locale.ts`
- `src/lib/security-validation.ts`
- `src/lib/lead-pipeline/index.ts`
- `src/types/global.ts`
- `src/types/index.ts`
- `src/types/__tests__/global.test.ts`
- `src/types/__tests__/index.test.ts`
- `src/lib/__tests__/metadata.test.ts`
- `src/lib/__tests__/security-headers.test.ts`
- `src/lib/__tests__/site-config.test.ts`
- `src/lib/__tests__/translation-benchmarks.test.ts`
- `src/lib/__tests__/translation-validators.test.ts`
- `tests/unit/security/security-headers.test.ts`
- `src/lib/__tests__/validations.test.ts`
- `src/lib/airtable/record-schema.ts`
- `src/lib/api/api-response-schema.ts`
- `src/lib/email/email-data-schema.ts`
- `src/lib/forms/form-submission-status.ts`
- `src/lib/forms/validation-helpers.ts`
- `src/lib/airtable/service-internal/contact-records.ts`
- `src/lib/airtable/types.ts`
- `src/lib/resend-core.tsx`
- `src/lib/resend-utils.ts`
- `src/lib/resend.ts`
- `src/emails/ConfirmationEmail.tsx`
- `src/emails/ContactFormEmail.tsx`
- `src/emails/ProductInquiryEmail.tsx`
- `src/components/emails/__tests__/ProductInquiryEmail.test.tsx`
- `src/components/forms/use-optimistic-form-state.ts`
- `src/templates/react19-form-template.tsx`

### 需要手工拆 hunk 的文件

- `src/components/forms/contact-form-container.tsx`
  - PR-C 保留：
    - `FormSubmissionStatus` import 路径迁移
  - 其余错误协议改动放 PR-A

### 建议验证

- `pnpm test -- src/lib/__tests__/validations.test.ts`
- `pnpm test -- src/app/api/contact/__tests__/route.test.ts`
- `pnpm test -- src/components/emails/__tests__/ProductInquiryEmail.test.tsx`
- `pnpm type-check`
- `pnpm lint:check`

## PR-D：Wave D 最终形态收口

### 目标

- 保留 Wave D 的正确框架边界
- 直接以**当前最终状态**提交，不再试图把 `proxy` 中间态单独做一个 PR
- 当前事实是：root layout 正确、客户端不再偷读 `document.documentElement.lang`、运行时入口为 `src/middleware.ts`

### 直接纳入的文件

- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/layout-metadata.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/components/i18n/lang-updater.tsx`
- `src/components/language-toggle.tsx`
- `src/components/layout/mobile-navigation.tsx`
- `src/components/layout/__tests__/mobile-navigation-basic.test.tsx`
- `src/components/layout/__tests__/mobile-navigation-edge-cases-advanced.test.tsx`
- `src/components/layout/__tests__/mobile-navigation-edge-cases-core.test.tsx`
- `src/components/layout/__tests__/mobile-navigation-responsive-edge-cases.test.tsx`
- `src/components/layout/__tests__/mobile-navigation.test.tsx`
- `src/i18n/routing-config.ts`
- `src/i18n/routing.ts`
- `src/middleware.ts`
- `src/__tests__/middleware-locale-cookie.test.ts`
- `tests/unit/middleware.test.ts`
- `tests/e2e/helpers/navigation.ts`
- `tests/e2e/i18n-redirect-validation.spec.ts`
- `AGENTS.md`
- `.claude/rules/architecture.md`
- `.claude/rules/review-checklist.md`
- `docs/known-issues/middleware-to-proxy-migration.md`
- `docs/known-issues/middleware-to-proxy-migration.md`

### 需要手工拆 hunk 的文件

- `src/components/layout/__tests__/mobile-navigation-responsive-basic.test.tsx`
  - PR-D 保留 `useLocale` mock

- `src/components/layout/__tests__/mobile-navigation-responsive.test.tsx`
  - PR-D 保留 `useLocale` mock

### 建议验证

- `pnpm exec vitest run src/__tests__/middleware-locale-cookie.test.ts tests/unit/middleware.test.ts`
- `pnpm test -- src/components/layout/__tests__/mobile-navigation.test.tsx`
- `pnpm test -- src/components/layout/__tests__/mobile-navigation-responsive-basic.test.tsx`
- `pnpm test -- src/components/layout/__tests__/mobile-navigation-responsive.test.tsx`
- `pnpm build`
- `pnpm build:cf`

## PR-E：审查与迁移文档总账

### 目标

- 让仓库内计划、执行总结、问题清单和复盘文档与真实现状一致
- 不把这些“总账文件”污染前面几个代码 PR 的审阅

### 纳入的文件

- `docs/code-review/issues.md`
- `docs/code-review/notes.md`
- `docs/code-review/round2-plan.md`
- `docs/code-review/round3-review.md`
- `docs/code-review/round4-execution-summary.md`
- `docs/code-review/round4-remediation-plan.md`
- `docs/plans/archive/2026-03-16-root-planning-files/task_plan.md`
- `docs/code-review/archive/2026-03-16-root-review-artifacts/linus_review_round3.md`
- `docs/plans/archive/2026-03-16-root-planning-files/notes.md`

### 说明

- 这些文件不适合按 wave 精拆，因为里面本来就在汇总多个 wave。
- 该 PR 应放最后，基于所有代码 PR 的最终状态更新。

## 当前最难拆的混合文件

### 一级：必须拆 hunk

- `src/components/forms/contact-form-container.tsx`
- `src/components/layout/__tests__/mobile-navigation-responsive-basic.test.tsx`
- `src/components/layout/__tests__/mobile-navigation-responsive.test.tsx`

### 二级：建议延后到 docs-only PR

- `docs/code-review/issues.md`
- `docs/code-review/notes.md`
- `docs/plans/archive/2026-03-16-root-planning-files/task_plan.md`

## 实操建议

### 如果你要最省事地往前推

按下面顺序做 stacked commits：

1. PR-A
2. PR-B
3. PR-C
4. PR-D
5. PR-E

### 如果你想进一步压缩 PR 数量

可以退一步改成 4 个 PR：

1. PR-A：Wave A
2. PR-B：Wave B
3. PR-C：Wave C
4. PR-D+E：Wave D 最终形态 + 总账文档

这种方式 review 粒度差一点，但 staging 成本更低。

## 下一步建议

下一步不要直接 `git commit -am`。  
应该先从 **PR-B 或 PR-A** 开始，原因是这两组文件最容易独立成提交；PR-D 和 PR-E 的耦合度最高，留到后面处理。
