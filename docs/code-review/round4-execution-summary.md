# Round 4 执行总结（2026-03-09）

## 目标

将 Round 4 扫荡式审查发现的系统性问题，从“问题清单”推进到“已执行并验证”的工程结果，避免仓库继续在协议、门禁、假真相源和框架边界上双轨并存。

本轮执行入口来源于：

- `docs/code-review/round4-remediation-plan.md`
- `docs/code-review/issues.md`
- `task_plan.md`

## 执行结果总览

Round 4 规划的 4 个波次已全部完成：

1. Wave A：协议统一与错误消费闭环
2. Wave B：测试与门禁信号修复
3. Wave C：遗留假真相源清理
4. Wave D：Next.js 框架边界收口

最终状态：

- API 主路径已统一到 `errorCode`
- 客户端主路径已统一通过 `translateApiError()` 消费错误
- 测试门禁不再把 wall-clock 和错误前提当功能正确性
- 零生产引用的假入口已从正式命名空间移除
- 当前运行时入口为 `src/middleware.ts`（为兼容 Cloudflare/OpenNext 临时保留）
- `html[lang]` 由服务端 root layout 正确输出
- root path locale redirect 已从页面补丁收敛到框架边界

## Wave A：协议统一与错误消费闭环

### 目标

- 让 API 层失败统一返回 `errorCode`
- 让客户端主路径不再消费旧 `message/error`
- 让 server action 内部协议不再依赖英文字符串

### 核心变更

- 统一了以下路径的错误协议：
  - `src/lib/idempotency.ts`
  - `src/app/api/whatsapp/send/route.ts`
  - `src/app/api/whatsapp/webhook/route.ts`
  - `src/app/api/csp-report/route.ts`
- 客户端错误消费切到 `translateApiError()`：
  - `src/components/blog/blog-newsletter.tsx`
  - `src/components/products/product-inquiry-form.tsx`
  - `src/components/forms/contact-form-container.tsx`
- server action 补齐稳定 `errorCode`：
  - `src/lib/actions/contact.ts`
  - `src/lib/server-action-utils.ts`
- 删除失活的 legacy API i18n 层：
  - `src/lib/api/get-request-locale.ts`
- 同步补齐 `apiErrors` 翻译：
  - `messages/en.json`
  - `messages/zh.json`
  - `messages/en/critical.json`
  - `messages/zh/critical.json`

### 结果

- API 层不再新增 `message/error` 作为客户端契约
- newsletter / inquiry / contact form 主路径已真正落地 `translateApiError()`
- `withIdempotency()` 不再向外暴露自由文本错误

## Wave B：测试与门禁信号修复

### 目标

- 让测试失败重新代表真实风险
- 让本地门禁口径和真实 CI 的差异显式化
- 让默认测试输出回到可读状态

### 核心变更

- 删除普通 Vitest 门禁中的 wall-clock 断言：
  - `src/components/layout/__tests__/mobile-navigation-responsive-basic.test.tsx`
  - `src/components/layout/__tests__/mobile-navigation-responsive.test.tsx`
- 修正冷却期测试的错误前提：
  - `src/components/forms/__tests__/contact-form-submission.test.tsx`
- 收紧 diff coverage 豁免：
  - `scripts/quality-gate.js`
- 修正 `ci:local` 口径描述与 Node 版本检查：
  - `scripts/ci-local.sh`
- 降低 Vitest 默认噪音，新增显式 debug 模式：
  - `vitest.config.mts`
  - `package.json`（新增 `pnpm test:debug`）

### 结果

- 默认单测门禁不再依赖机器速度
- `contact-form-submission` 的冷却期测试改为显式状态驱动
- `quality-gate` 不再把整个 `src/components/ui/**` 当黑洞目录跳过
- `ci:local` 不再宣称“完全模拟 CI”，而是明确说明与远程 CI Node 20 的差异

## Wave C：遗留假真相源清理

### 目标

- 把“生产真相源”和“测试/兼容/离线分析层”彻底拆开
- 删除零生产引用文件
- 停止让正式命名空间继续放大假入口

### 删除的零生产引用或测试保活入口

- `src/app/api/contact/contact-api-utils.ts`
- `src/lib/api-cache-utils.ts`
- `src/lib/site-config.ts`
- `src/lib/metadata.ts`
- `src/types/index.ts`
- `src/types/global.ts`
- `src/lib/security-headers.ts`
- `src/lib/translation-benchmarks.ts`
- `src/lib/translation-quality-types.ts`
- `src/lib/translation-validators.ts`

对应保活测试也同步移除或改写到真实源头。

### 混合真相源拆分

`src/lib/validations.ts` 已拆分并删除。生产链路分别迁移到：

- `src/lib/email/email-data-schema.ts`
- `src/lib/airtable/record-schema.ts`
- `src/lib/forms/form-submission-status.ts`
- `src/lib/forms/validation-helpers.ts`
- `src/lib/api/api-response-schema.ts`

生产导入也已迁移，例如：

- `src/lib/resend-core.tsx`
- `src/lib/resend-utils.ts`
- `src/lib/resend.ts`
- `src/lib/airtable/service-internal/contact-records.ts`
- `src/lib/airtable/types.ts`
- `src/components/forms/contact-form-container.tsx`
- `src/components/forms/use-optimistic-form-state.ts`
- `src/emails/*.tsx`

### `sanitizeInput` 清理

- `src/lib/security-validation.ts` 的 deprecated `sanitizeInput` alias 已删除
- `src/lib/forms/validation-helpers.ts` 不再保留同名薄封装
- `src/lib/lead-pipeline/index.ts` 不再正式导出 `sanitizeInput`

保留说明：

- `src/lib/lead-pipeline/utils.ts` 中的 `sanitizeInput()` 仍保留，因为它除了清洗还承担 5000 字符裁剪语义，不是单纯的同义 wrapper

## Wave D：Next.js 框架边界收口

### 目标

- 收敛 document shell、locale 路由和框架约定
- 移除页面层和客户端补丁
- 用单一入口承接 locale / redirect / 安全头

### 核心变更

- 删除：
  - `src/app/layout.tsx`
  - `src/app/page.tsx`
  - `src/components/i18n/lang-updater.tsx`
- 让 `src/app/[locale]/layout.tsx` 成为真正的 root layout：
  - 服务端直接输出 `<html lang={locale}>`
  - 负责 `<body>` 和开发态脚本注入
- `src/app/[locale]/layout-metadata.ts` 补齐 `metadataBase`
- 客户端语言来源改回 locale context：
  - `src/components/layout/mobile-navigation.tsx`
  - `src/components/language-toggle.tsx`
- 运行时入口最终定格为：
  - `src/middleware.ts`
  - 原因：`src/proxy.ts` 虽通过 `pnpm build`，但会阻塞当时的 `pnpm build:cf`

### 结果

- `src/middleware.ts` 继续承接 locale redirect 与安全头部
- `pnpm build` 会重新出现 `middleware -> proxy` 弃用告警，但这是当前接受的临时技术债
- `html[lang]` 已在服务端首包上正确输出
- root path locale redirect 不再依赖页面层补丁
- 客户端组件不再偷读 `document.documentElement.lang`

## 验证结果

### 全局静态检查

- `pnpm type-check`：通过
- `pnpm lint:check`：通过

### 构建验证

- `pnpm build`：通过
- `pnpm build:cf`：通过
- 结果：
  - App Router / locale / middleware 结构可正常构建
  - OpenNext Cloudflare 打包链路恢复可用

### 门禁验证

- `pnpm ci:local:quick`：通过

关键点：

- `test:coverage` 5724 条测试通过
- `quality:gate:fast` 通过
- `ci-local` 新口径正常工作

### 定向回归验证

Wave A、B、C、D 期间都执行了对应的定向 Vitest 回归：

- Wave A：178 条
- Wave B：51 条
- Wave C：128 条、151 条、104 条
- Wave D：128 条（middleware / locale layout / language-toggle / mobile-navigation）

## 结果判断

Round 4 已经从“发现式全仓扫荡”成功推进到“执行波次全部完成”。

这次执行的价值不只是修掉一串问题编号，而是把几条长期分叉的系统性问题收回了单一真相源：

- API 错误协议：收回到 `errorCode`
- 测试与门禁：收回到“失败代表真实风险”
- 真相源命名空间：从测试保活的假入口收回到真实运行时模块
- Next.js 框架边界：收回到 `middleware + root layout`，并保留后续重新迁回 `proxy` 的路径

## 当前残余风险

以下项不再属于本轮未完成问题，但值得作为后续常规维护关注：

- `.next` 生成物对 `type-check` 的干扰
  - 删除 `app/layout.tsx` / `app/page.tsx` 后，若保留旧 `.next` 生成物，可能出现陈旧 validator 引用
  - 这不是运行时问题，但本地调试时需要注意
- `lead-pipeline/utils.ts` 的 `sanitizeInput()`
  - 目前仍保留，因其包含裁剪语义
  - 若后续继续收紧命名，建议将其改名为更明确的 `sanitizeLeadInput()` 或等价名称
- E2E 注释与辅助文档
  - 已清理主要的 `LangUpdater` 旧口径
  - 后续若继续调整 locale 行为，仍应优先更新测试注释和 helper 描述
- `middleware -> proxy` 迁移债
  - 当前因 Cloudflare/OpenNext 兼容性暂缓关闭
  - 后续重新迁移时，必须同时验证 `pnpm build` 与 `pnpm build:cf`

## 建议的后续动作

1. 若需要对外汇报，本文件可作为最终交接入口。
2. 若要进一步压缩文档噪音，可将 `docs/code-review/issues.md` 中已修复条目的“修复前证据”压缩成 closed-record 格式。
3. 若准备提交代码，建议按波次或主题拆提交，而不是把所有 Round 4 改动压成一坨。
