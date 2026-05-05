# AI Smell Proof Health Repair Design

## 背景

2026-05-03 的 `ai-smell-audit full` 结论不是“主询盘链路坏了”，而是 **proof health 偏弱**：部分测试、CI 名称和工具输出会让人高估上线可信度。

本轮修复只处理能由工程侧安全收口的 proof / tooling 问题，不伪造业务素材，不把本地 test-mode 当生产提交证明。

## 目标

把本轮 P0/P1 proof 问题收口到“名字、命令输出、文档说明都不再夸大证明范围”。

覆盖发现：

- `F-S30-001`: `pnpm unused:check` 打印 Knip 加载错误但返回成功。
- `F-S28-001`: 本地 contact E2E 标题声称“成功提交”，实际只填表并确认按钮可见。
- `F-S25-001`: CI lead-family step 名称容易被误读为完整运行证明。
- `F-S27-001`: local Playwright test-mode 不能冒充 deployed proof。

## 非目标

- 不替换 logo、产品图、证书、真实电话等业务资产。
- 不删除 `src/app/actions.ts` 兼容入口。
- 不新增真实 deployed lead canary；现有 deployed proof 仍由 `POST_DEPLOY_TEST=1 PLAYWRIGHT_BASE_URL=... pnpm test:e2e:post-deploy` 承担。
- 不运行生产发布、真实外部服务写入或 Cloudflare deploy。

## 设计

### 1. Knip / Playwright config 加载

`pnpm unused:check` 当前通过 Knip 加载 `playwright.config.ts` 时失败：

```text
ERROR: Error loading playwright.config.ts (Cannot find module '@/test/e2e-target')
```

根因是 Knip 的 config loader 不按本仓库 `@/` TypeScript path alias 解析 Playwright 根配置。修复应让根配置能被外部 Node loader 直接加载，避免 unused-code proof 带错误输出。

最小设计：

- 给 `tests/unit/scripts/proof-lane-contract.test.ts` 增加 source-contract 断言，防止 `playwright.config.ts` 和 `tests/e2e/global-setup.ts` 在外部工具加载路径继续使用 `@/` alias。
- 把 `playwright.config.ts` 和 `tests/e2e/global-setup.ts` 对 `src/test/e2e-target.ts` 的导入改成外部 loader 可解析的相对导入。
- fresh 跑 `pnpm unused:check`，要求 exit 0 且不再出现 `ERROR: Error loading playwright.config.ts`。

### 2. Contact local E2E 命名

`tests/e2e/contact-form-smoke.spec.ts` 文件开头已经诚实说明它是 test-mode smoke，不是生产态最终证明。但两个用例标题仍使用过强的“提交成功”口径，与代码行为不一致。

最小设计：

- 给 proof-lane source-contract 增加断言，禁止 local test-mode E2E 标题继续包含“成功提交表单”这种过强表述。
- 将第 9 组分组名改为“提交前就绪验证”，并将两个标题改为“完整填写英文/中文表单后提交按钮可见”。
- 不补本地真实 click submit 断言，避免把 test-mode success 误当 deployed proof。

### 3. Lead-family CI proof 口径

`pnpm review:lead-family` 有价值，但它是本地 contract/protection proof，不是 deployed Turnstile/Airtable/Resend proof。CI step 名称要把这个边界说出来。

最小设计：

- 把 `.github/workflows/ci.yml` 的 step 名称改成 `Lead API Local Contract/Protection Review`。
- 在 `docs/guides/PROOF-BOUNDARY-MAP.md` 中补 `pnpm review:lead-family` 的真实证明范围。
- 给 source-contract 增加断言，防止 CI step 退回过强命名。

### 4. Local E2E vs deployed proof 文档边界

`docs/specs/behavioral-contracts.md` 和 `docs/guides/RELEASE-PROOF-RUNBOOK.md` 已经说明 deployed post-deploy smoke 才是提交证明。本轮补强 `docs/guides/PROOF-BOUNDARY-MAP.md`：

- `pnpm test:e2e` 证明 local Playwright test-mode 的页面结构和基础交互。
- 它不证明 deployed site、真实 Turnstile、真实 Airtable/Resend 写入。
- `tests/unit/scripts/proof-lane-contract.test.ts` 必须锁住这条文档边界，避免未来只改 CI 名称却漏掉 local E2E proof 口径。

### 5. Knip post-fix 分流

`F-S30-001` 的本轮目标只是不再让 `playwright.config.ts` loader error 被 exit 0 掩盖。

如果修复 alias 后：

- `pnpm unused:check` 仍出现任何 `Error loading playwright.config.ts` 或 loader 类错误：停止实施，回到 root-cause investigation。
- loader error 消失，但 Knip 暴露真实 unused files/dependencies：记录为新的 unused-code 发现，不在本轮自动扩大清理范围。
- loader error 消失且没有新 finding：本轮 `F-S30-001` 收口。

## 验收标准

Given 当前仓库执行 `pnpm unused:check`  
When Knip 扫描 Playwright 配置  
Then 命令退出 0 且输出不包含 `ERROR: Error loading playwright.config.ts`

Given owner 或 reviewer 查看 local contact E2E 标题  
When 看到第 9 组表单相关报告  
Then 分组名和用例标题只描述“提交前就绪/按钮可见”，不声称“提交验证”或“成功提交”

Given CI 页面展示 lead-family step  
When 看到 step 名称  
Then 名称体现这是 local contract/protection review，不冒充 deployed lead proof

Given reviewer 查看 proof boundary 文档  
When 对照 `pnpm test:e2e` 和 `pnpm review:lead-family`  
Then 能清楚知道它们证明什么、不证明什么

Given proof-lane source contract 运行  
When `docs/guides/PROOF-BOUNDARY-MAP.md` 缺少 `pnpm test:e2e` local/test-mode 边界  
Then 测试必须失败，避免 `F-S27-001` 回归

## 验证命令

```bash
pnpm exec vitest run tests/unit/scripts/proof-lane-contract.test.ts
pnpm unused:check
pnpm type-check:tests
pnpm exec playwright test tests/e2e/contact-form-smoke.spec.ts --project=chromium --grep "完整填写英文表单后提交按钮可见"
```

按需补：

```bash
pnpm lint:check
pnpm format:check
```
