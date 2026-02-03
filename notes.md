# Notes: Linus Round 3（tianze-website）

## Baseline Outputs
- type-check: ✅ 通过（`pnpm type-check` 退出码 0；无输出错误）`reports/linus-round3/type-check.log`
- lint:check: ✅ 通过（`pnpm lint:check` 退出码 0）；但出现外部工具噪音：`[baseline-browser-mapping] ... over two months old ...` `reports/linus-round3/lint-check.log`
- test: ✅ 通过（334 files / 5671 tests；退出码 0）`reports/linus-round3/test.log`
  - stderr: Vitest 提示 `cache.dir` deprecated（应迁移为 Vite 的 `cacheDir`）
  - stderr: React 警告 `asChild` prop 泄漏到 DOM（来自 `src/components/layout/__tests__/mobile-navigation.test.tsx` 运行时）
  - stdout: `Resend email service initialized successfully ...`（测试中存在 console 输出噪音，掩盖真实失败信号）
- build: ⚠️ 首次失败（`.next/lock` 获取锁失败）`reports/linus-round3/build.log`；二次重试 ✅ 成功 `reports/linus-round3/build.rerun.log`
  - build 输出同样出现 `[baseline-browser-mapping] ... over two months old ...` 噪音

## Evidence Index
- （按问题编号记录：文件路径、关键片段、命令输出摘要）

## Patterns To Hunt
- 边界分叉：同一逻辑因 null/undefined/空数组/权限/locale 等导致多处 if/else 分叉
- 补丁驱动复杂度：为绕 lint/类型/框架限制而加的 wrapper、Promise.resolve、noop catch、flag
- 错误处理不一致：有的 throw，有的 return null，有的 swallow，有的 toast；同一层混用
- 测试掩盖设计失败：mock 过重、只测实现细节、忽略不变式、靠 snapshot 压过去
