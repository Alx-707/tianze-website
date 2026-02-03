# Task Plan: Linus 代码质量整改 (TDD + Swarm Mode)

## Goal
基于合并后的 Linus 审查报告 (`linus_review_round.md`)，使用 TDD 驱动 + Swarm 并行模式，逐一修复 P0-P3 问题。

## Source Documents
- `linus_review_round.md` - Codex 审查发现（P0-P3，基础设施 + API 协议）
- 之前审查发现（已合并到上述文件）：MDX 静默错误、Webhook 验证、内容验证复杂度

## Phases

### Phase 0: 规划与任务分解
- [x] 读取两份审查报告
- [x] 创建合并后的任务清单
- [x] 按依赖关系排序任务
- [x] 定义每个任务的验收标准（TDD）

### Phase 1: P0 - 测试基础设施修复 (Critical)
- [x] 1.1 移除 `vitest.config.mts` 中的 `net.Server.listen` monkey patch
- [x] 1.2 关闭 `ui: true`，改为 `ui: false`
- [x] 1.3 移除全局 `retry: 2`
- [x] 1.4 迁移 `cache.dir` → `cacheDir`

### Phase 2: P1 - API 错误协议统一 (High)
- [x] 2.1 创建 `createApiErrorResponse()` 统一响应函数
- [x] 2.2 修复 `/api/contact` 路由
- [x] 2.3 修复 `/api/inquiry` 路由
- [x] 2.4 修复 `/api/verify-turnstile` 路由
- [x] 2.5 修复 `safeParseJson()` 返回 errorCode

### Phase 3: P2 - 假异步与测试污染 (Medium)
- [x] 3.1 `withIdempotency` 改为 async
- [x] 3.2 `MemoryRateLimitStore` 接口/实现一致性
- [x] 3.3 Logger 测试环境默认 `LOG_LEVEL=warn`
- [x] 3.4 修复 shadcn mock 的 asChild 警告

### Phase 4: P3 - 噪音与边界分叉 (Low)
- [x] 4.1 WhatsApp 文案 i18n 化
- [x] 4.2 WhatsApp 组件拆分（移除 eslint-disable）
- [x] 4.3 processLead 表驱动重构
- [x] 4.4 WhatsApp types 移除 @ts-nocheck

### Phase 5: 验证与收尾
- [x] 5.1 运行完整 CI (`type-check`, `lint:check`, `test`)
- [x] 5.2 验证测试输出无噪音
- [x] 5.3 验证 build 成功
- [ ] 5.4 提交 PR

## Key Principles
- **TDD**: 先写/运行测试，验证失败，再修复，验证通过
- **Swarm Mode**: 独立任务并行执行（同一 Phase 内可并行）
- **拒绝补丁**: 不加 flag/if 解决设计问题，重构根因

## Constraints (from CLAUDE.md)
- `"use cache"` 函数必须 async（用 eslint-disable 注释，不用 Promise.resolve）
- TypeScript strict mode，禁止 any
- 函数 ≤120 行，文件 ≤500 行
- 所有 user-facing 文案必须 i18n

## Final Verification Results
- ✅ `pnpm type-check` - 通过
- ✅ `pnpm lint:check` - 通过（只有 baseline-browser-mapping 外部噪音）
- ✅ `pnpm test` - 5670 tests passed (334 files)
- ✅ `pnpm build` - 成功

## Status
**Done** - 所有代码修改已完成，CI 验证通过，待提交 PR
