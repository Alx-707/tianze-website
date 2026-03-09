# Round 4 问题分类处理方案（2026-03-09）

## 目标
把 Round 4 扫荡式审查得到的“当前仍成立问题”重组为可执行修复波次，避免后续按编号逐条打补丁。

当前有效问题范围：
- `CR-022`
- `CR-023` ~ `CR-046`

说明：
- `docs/code-review/issues.md` 仍是唯一权威问题清单。
- 本文档只负责“如何分组处理”，不替代原问题条目的证据与验收细节。

## 分组原则

### 1. 按共享真相源分组
- 同一组问题如果最终需要收敛到同一个 helper、同一个协议、同一个命名空间，就应该放进同一波次。

### 2. 按验证边界分组
- 能用同一批测试/门禁一起验收的问题，尽量放在同一波次。
- 会互相干扰的问题不要硬塞进一批。

### 3. 按风险递减顺序执行
- 先修用户可见的协议裂缝和门禁失真。
- 再清理“假真相源”和遗留兼容层。
- 最后处理高回归风险的框架边界迁移。

### 4. 拒绝“边修边继续长”
- 每个波次结束后，要让后续开发默认只走新入口，而不是继续双轨并存。

## 波次方案

## Wave A：协议统一与错误消费闭环

### 包含问题
- `CR-023` `withIdempotency()` 仍输出自由文本错误
- `CR-024` `/api/whatsapp/send`、`/api/whatsapp/webhook`、`/api/csp-report` 仍绕开统一 API response helper
- `CR-032` 联系表单 server action 与 UI 靠英文字符串做协议分支
- `CR-033` `blog-newsletter` 仍消费旧 `message`
- `CR-035` `product-inquiry-form` 仍消费旧 `error`
- `CR-036` `translateApiError()` 工具存在但未在主路径落地
- `CR-041` `get-request-locale.ts` 旧 API i18n 层已失活却仍占正式命名空间

### 本波目标
- 对外 API 失败统一到 `errorCode`
- 客户端表单消费统一到 `errorCode` + 翻译函数
- server action 内部协议从“英文文案驱动”收敛到稳定类型/错误码
- 旧 server-side API i18n 方案退出主链路

### 建议拆分
- PR A1：统一 API route response helper 与 `withIdempotency()`
- PR A2：修表单客户端消费（newsletter / inquiry / contact form）
- PR A3：移除/归档 `get-request-locale.ts` 旧层，清理误导注释

### 验收重点
- API 层不再新增 `message/error` 作为客户端契约
- 客户端主路径真实调用 `translateApiError()`
- 相关测试改为断言 `errorCode` 或稳定错误类型，而不是英文文案

## Wave B：测试与门禁信号修复

### 包含问题
- `CR-025` wall-clock 性能断言仍在普通 Vitest 门禁里
- `CR-026` `contact-form-submission` 冷却期测试前提错位
- `CR-029` `quality-gate` 对 `src/components/ui/**` 目录级 diff coverage 豁免
- `CR-030` `ci:local` 版本口径与“完全模拟 CI”表述不一致
- `CR-031` Vitest 默认输出噪音过高

### 本波目标
- 让测试失败重新代表“真实风险”，而不是机器负载和旧前提
- 让本地门禁与 CI 口径一致或显式承认差异
- 让测试输出重新可读

### 建议拆分
- PR B1：清 wall-clock 用例和前提错位测试
- PR B2：修 `quality-gate`、`ci-local.sh`
- PR B3：把 Vitest 诊断输出迁到显式 debug 脚本

### 验收重点
- 单测默认不再依赖 wall-clock 阈值
- `ci:local` 与真实 CI 口径要么一致，要么脚本文案明确说明差异
- 默认 `pnpm test` 输出能快速看出失败摘要

## Wave C：遗留假真相源清理

### 包含问题
- `CR-034` `contact-api-utils.ts`
- `CR-037` `security-headers.ts`
- `CR-038` `validations.ts`
- `CR-039` 多层 `sanitizeInput` wrapper
- `CR-040` `types/global.ts` 的通用 API 类型
- `CR-042` `metadata.ts`
- `CR-043` `api-cache-utils.ts`
- `CR-044` `site-config.ts`
- `CR-045` `types/index.ts` 导出测试专用类型
- `CR-046` i18n 质量/locale 辅助层驻留在 `src/lib/`

### 本波目标
- 把“生产真相源”和“测试/兼容/离线分析层”彻底拆开
- 删除零引用文件
- 停止让 barrel / 正式命名空间继续放大假入口

### 建议拆分
- PR C1：删零引用与仅测试保活的薄封装/兼容层
- PR C2：把测试专用类型和离线分析工具迁出正式命名空间
- PR C3：拆分 `validations.ts`，保留生产真类型，迁走旧 schema/helper

### 验收重点
- 搜索生产引用时，不再看到一堆“名义官方入口、实际无引用”的模块
- `src/lib/` / `src/types/` 的顶层文件更多代表真实运行时真相源，而不是历史兼容层

## Wave D：Next.js 框架边界收口

### 包含问题
- `CR-022` `middleware -> proxy` 迁移告警
- `CR-027` `html[lang]` 依赖客户端修正
- `CR-028` 根路径 locale redirect 依赖页面层补丁

### 本波目标
- 收敛 document shell、locale 路由和 framework convention
- 把当前“框架边界补丁”改回单一入口设计

### 风险说明
- 这是回归风险最高的一波，不应该在测试/门禁仍失真的状态下先做。
- 最好在 Wave A/B 完成后再做，避免“页面语义修一半、测试信号又不可信”。

### 建议拆分
- PR D1：`middleware -> proxy` 迁移与 matcher 收口
- PR D2：`html[lang]` 服务端正确输出
- PR D3：移除 root path 页面层 locale 补丁

### 验收重点
- `pnpm build` 不再有 `middleware` 弃用告警
- `/en`、`/zh`、`/` 的 locale / lang / redirect 行为在 SSR 首包上正确

## 推荐执行顺序

1. Wave A：协议统一与错误消费闭环
2. Wave B：测试与门禁信号修复
3. Wave C：遗留假真相源清理
4. Wave D：Next.js 框架边界收口

## 顺序理由
- 先修协议：否则后面所有客户端和测试都会继续围绕旧契约打补丁。
- 再修门禁：否则重构和删除遗留层时，无法信任测试/CI 信号。
- 然后清遗留层：这一步依赖前两步已经让“新入口”稳定存在。
- 最后动框架边界：风险最高，应放在信号最干净的时候做。

## Definition of Done

### 阶段完成标准
- `docs/code-review/issues.md` 中当前有效问题都能被归属到明确波次
- 每个波次都有清晰的：
  - 目标
  - 影响范围
  - 建议拆分
  - 验收方式

### 最终完成标准
- 问题清单不再只是“发现列表”，而是可直接进入执行阶段的工程计划
- 后续修复工作以波次为入口，不再按单条问题零散开工
