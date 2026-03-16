# Round 2 Plan: 问题清单落地与复审（tianze-website）

日期：2026-03-05  
范围：Next.js / React / TypeScript 项目  
目标优先级：**稳定性 > 性能 > 可维护性 > 安全**
当前状态：✅ 已完成（2026-03-06，PR-01 ~ PR-06f 已完成；`total-byte-weight` 已回到 490KB budget 内）

> Round 1 产物：
> - 问题清单：`docs/code-review/issues.md`
> - 证据/过程：`docs/code-review/notes.md`
> - 总体计划：`docs/plans/archive/2026-03-16-root-planning-files/task_plan.md`

---

## 1. Round 2 目标（Definition of Done）

Round 2 的“完成”以可验证门禁为准（建议全部满足）：

- 稳定性门禁：`pnpm ci:local:quick` 通过
- 全量回归：`pnpm ci:local` 通过（含 E2E + Lighthouse CI）
- 架构门禁：`pnpm arch:check` 不再出现当前告警（见 CR-001/CR-002）
- 依赖治理门禁：`pnpm unused:production` 退出码为 0（见 CR-003）
- Lighthouse：`total-byte-weight` 回到 ≤490KB（或已基于证据调整 budget，并在 PR 中写清理由与新阈值来源）
- 安全：strict CSP 策略可控（至少解决“业务必需脚本被阻断/产生噪声”的关键路径，见 CR-017）

---

## 2. Round 2 工作方式（分批次 PR）

为了降低回归风险，Round 2 按“可独立验证”的 PR 批次推进：

- 每个 PR：
  - **优先**只解决 1 个主问题或一组强耦合问题；但对“低风险、小改动、同一层面的硬化/门禁修复”允许合并，以减少切换成本
  - 有明确验收命令（优先复用 `docs/code-review/issues.md` 中的验收命令）
  - 合并前至少跑：`pnpm ci:local:quick`
- 每完成一个“波次（Wave）”，再跑一次：`pnpm ci:local`

建议约束：
- Node 版本对齐 CI（CI 是 Node 20；本地若为 Node 22，建议用 `nvm`/`volta` 对齐验证一次，避免“本地绿 CI 红”）

---

## 3. Round 2 问题清单（Backlog）

本轮以 `docs/code-review/issues.md` 为唯一权威来源；这里给出“落地视角”的分组（CR 编号与标题以 issues.md 为准）。

### P1（优先落地）
- Stability：CR-007、CR-009
- Performance：CR-015、CR-016（以及必要时关联 CR-005 的 budget/门禁调整说明）
- Maintainability（门禁恢复，建议并行推进）：CR-001、CR-002、CR-003
- Security：CR-017

### P2/P3（穿插处理）
- Stability：CR-008、CR-010、CR-011、CR-012、CR-013、CR-014、CR-022
- Security：CR-018、CR-021（CR-019/CR-020 已在 PR-05 完成）

---

## 4. 具体落地方案（PR 批次 / 顺序 / 验收）

下面给出一个“默认推荐顺序”。如果你们更偏“先性能再治理”，可以把 PR-03/PR-04 提前。

### PR-01：API 写接口 P1 修复（CR-007、CR-009）+ 依赖治理门禁恢复（CR-003）
目的：先把“可被外部利用/可用性风险”的小改动落地，同时让 knip 门禁恢复可信，避免后续改动“引入未声明依赖/死代码”但无法及时发现。

状态：✅ 已完成（2026-03-05，本地未提交/未开 PR）
- CR-007：`/api/inquiry` route 层白名单 pick + `type` 后置覆盖兜底；补回归测试（覆盖 body 试图覆盖 `type` 的场景）
- CR-009：`/api/csp-report` 增加 16KB body size 上限（`content-length` 早拒绝 + stream 读取字节级兜底），并兼容 `application/json`；更新对应测试用例
- CR-003：移除 `next.config.ts` 中 dev-only 动态 import 副作用，新增显式启动脚本 `pnpm dev:react-grab`（避免 knip 将其视为 unlisted dependency）
- 本地验证（全部通过）：
  - `pnpm unused:production`
  - `pnpm test`
  - `pnpm ci:local:quick`

- 主要改动方向（择一）：
  - CR-007：route 层白名单 pick + `type` 后置覆盖 + 回归测试（见 issues.md）
  - CR-009：为 `/api/csp-report` 增加 body size 上限（优先 `content-length` 早拒绝 + 字节级兜底）+ 回归测试（见 issues.md）
  - CR-003（推荐）：把 `next.config.ts` 里的 dev-only 副作用（`@react-grab/claude-code/server`）移出关键路径（脚本化/显式开关）
  - CR-003（备选）：保留但加环境变量 gate + 补齐依赖声明 + `.catch()`
- 验收：
  - `pnpm test -- src/app/api/inquiry/__tests__/route.test.ts`
  - `pnpm test -- src/app/api/csp-report/__tests__/route-post-security.test.ts`
  - `pnpm unused:production`
  - `pnpm ci:local:quick`

### PR-02：架构告警治理（CR-001、CR-002）
目的：让 dependency-cruiser 告警回到“高信噪比”，减少死代码与隐式耦合；也能让后续 PR diff 更干净、更好 review。

状态：✅ 已完成（2026-03-05，本地未提交/未开 PR）
- 结果：`pnpm arch:check` / `pnpm circular:check` 均为 0 violations
- 本地验证（全部通过）：
  - `pnpm arch:check`
  - `pnpm circular:check`
  - `pnpm test`
  - `pnpm ci:local:quick`

- 改动要点：
  - no-orphans：删除或接回引用（按 CR-001 的方案）
  - no-barrel-export-dependencies：改为按需直引（按 CR-002 的方案）
- 验收：
  - `pnpm arch:check`
  - `pnpm type-check`
  - `pnpm test`
  - `pnpm ci:local:quick`

### PR-03：Lighthouse `total-byte-weight` 直接降噪（CR-015）
目的：先把“可控的额外 Fetch”压下去，让预算门禁更稳定。

状态：✅ 已完成（2026-03-05，本地未提交/未开 PR）
- Lighthouse 变化（/en 与 /zh）：
  - `network-requests` Fetch：17 → 10
  - Fetch transferSize：≈42KB → ≈25KB
  - `total-byte-weight`：≈533KB → ≈516KB（当时仍高于 490KB budget；后续需要以最新 `pnpm ci:local` 的 Lighthouse 输出复核）
- 本地验证（通过）：
  - `pnpm build`
  - `pnpm perf:lighthouse`

- 改动要点：
  - 对 header/nav/footer 中非关键 `Link` 显式 `prefetch={false}`
  - 保留少量高频路径的 prefetch（若业务确有价值）
  - 复现实验（避免误把 Lighthouse 行为当成真实首屏）：优先确认“无滚动/无交互”首次加载时 `_rsc` Fetch 数量，再对比 Lighthouse 跑出来的数量（排除滚动导致的预取扩大）。
  - 核对 dropdown/隐藏链接的可见性：确保未展开时链接不在 viewport/不占位，避免“不可见但被预取”。
- 验收：
  - `pnpm perf:lighthouse`（对比 `Fetch` 请求数量与总 transferSize）
  - `pnpm ci:local`（因为 Lighthouse CI 在完整链路里）

### PR-04：bundle 体积治理（CR-016）
目的：消除 `radix-ui` 统一包带来的共享 chunk 过重与 tree-shaking 不理想问题。

状态：✅ 已完成（2026-03-05，本地未提交/未开 PR）
- Lighthouse 复核（以最新 `pnpm ci:local` 输出为准）：
  - `total-byte-weight`：**仍高于 490KB budget（warning）**（/en ≈628KB，/zh ≈622KB；详见 `.lighthouseci/lhr-*.json`）
  - 备注：此前本地观测到的 `≈442KB` 与本次 `ci:local` 结果存在口径差异/不稳定性，需要后续单独复查与校准预算（不阻断本次 Wave 合并）
- 本地验证（通过）：
  - `pnpm build:analyze:webpack`
  - `pnpm test`
  - `pnpm perf:lighthouse`

- 改动要点：
  - 迁移前先确认是否存在间接依赖：`pnpm why radix-ui`（避免“删了 direct dep 但仍被别的包引入”而无效）
  - 移除 `radix-ui`（统一包）依赖
  - 按需引入 `@radix-ui/react-*`（与 shadcn 模式一致）
  - 优先从 layout/导航链路迁移（首屏最敏感）
  - 去重：通过 `pnpm.overrides` 固定 `@radix-ui/react-primitive` / `@radix-ui/react-slot` 版本，避免同一 primitive 多版本重复进入 bundle
- 验收：
  - `pnpm build:analyze:webpack`（对比 `.next/analyze/client.html`）
  - `pnpm perf:lighthouse`（观察 script transfer / unused-javascript / bootup-time）

### PR-05：strict CSP 闭环策略（CR-017）+ 其它低成本安全修复（CR-019/CR-020）
目的：在不破坏 Cache Components 静态化策略的前提下，保证“业务必需脚本”不被 strict CSP 阻断。

状态：✅ 已完成（2026-03-05，本地未提交/未开 PR）
- CSP/nonce/hash 闭环：
  - CSP 由 middleware 下发（带 per-request nonce），Next 内部 inline script 自动带 `nonce="<...>"`
  - 对仍无 nonce 的少量 inline script（JSON-LD、next-themes init、`$RT`）使用 `sha256-...` allowlist 精确放行
  - 增加保鲜机制：`pnpm security:csp:check`（启动 `next start`，抓取 `/en`、`/zh` HTML 并校验）
- 其它安全修复：
  - CR-019：`validateSecurityHeaders()` 不再要求 `X-XSS-Protection`
  - CR-020：`target="_blank"` 统一补齐 `rel="noopener noreferrer"`（并更新测试）

- 改动要点（推荐路线）：
  - 使用 CSP hash allowlist 精确放行 next-themes 初始化脚本（必要时也覆盖 Next 的 `$RT` inline script），避免全局 `unsafe-inline`
  - 增加“hash 保鲜”自动化：在 CI 中加入一个 build 后校验脚本，提取 HTML 中 inline script 内容并与 allowlist 的 hash 对比（依赖升级导致脚本变化时自动提醒更新 hash）
  - 对齐安全头部工具链（CR-019：是否保留/移除 `X-XSS-Protection` 的 required 校验）
  - `target="_blank"` 链接补齐 `rel="noopener noreferrer"`（CR-020）
- 验收：
  - `pnpm build`
  - `pnpm security:csp:check`
  - `pnpm exec vitest run src/lib/__tests__/security-headers.test.ts`
  - `pnpm exec vitest run src/components/products/__tests__/product-actions.test.tsx`

### PR-06：补齐其余 P2/P3（按需排期）
状态：✅ 已完成（2026-03-06，本地未提交/未开 PR）

落地方式建议（把“本地已做的改动”拆成可 review 的真实 PR）：
- 建议顺序：PR-06a → PR-06b → PR-06c → PR-06d → PR-06e → PR-06f
- 每个 PR 的最小门禁：`pnpm ci:local:quick`；每完成一个波次后跑一次 `pnpm ci:local`
- 若需要严格隔离 diff：建议用 `git add -p` 或按文件清单分次 commit；不要把 analyzer/Lighthouse 的产物文件（如 `.next`、`.lighthouseci`）纳入提交

为了降低回归风险，PR-06 作为“最后一个波次（Wave）”，建议仍按风险拆成多个小 PR（PR-06a~PR-06f），每个 PR 可独立验收、可随时停在中间：

**PR-06a（最小行为变化，先做）**：基础正确性/可观测修复（✅ 已完成：2026-03-05，本地未提交/未开 PR）
- CR-010：`/api/whatsapp/webhook` body size 改为字节级判断 + 补多字节测试
- CR-012：`/api/cache/invalidate` 区分“未配置 secret（503/500）”与“未授权（401）”的错误语义
- 验收：`pnpm test -- src/app/api/whatsapp/webhook/__tests__/route.test.ts`、`pnpm test -- src/app/api/cache/invalidate/__tests__/route.test.ts`、`pnpm ci:local:quick`

**PR-06b（受控行为变化）**：管理/外部调用端点的限流策略对齐（✅ 已完成：2026-03-05，本地未提交/未开 PR）
- CR-013：`/api/contact` GET 增加 rate limit（建议先 fail-open + degraded header，避免误杀）
- CR-014：`/api/whatsapp/send` 增加 post-auth 的 per-API-key 限流（与 `/api/cache/invalidate` 双层策略对齐）
- 验收：`pnpm test -- src/app/api/contact/__tests__/route.test.ts`、`pnpm test -- src/app/api/whatsapp/send/__tests__/route.test.ts`、`pnpm ci:local:quick`

**PR-06c（按需求决定是否做）**：CORS 语义补齐（✅ 已完成：2026-03-05，本地未提交/未开 PR）
- CR-008：对“确实需要跨域”的 API，在实际 `POST/GET` 响应统一 `applyCorsHeaders()`
- 验收：基于 allowlist 配置做 curl 头部核对（见 CR-008），并补 1~2 个 route 的单测覆盖

**PR-06d（跨层联动）**：幂等策略收紧（✅ 已完成：2026-03-05，本地未提交/未开 PR）
- CR-011：`/api/subscribe` 要求 `Idempotency-Key` + store 通过 `createIdempotencyStore()` 工厂初始化（后续可替换为分布式 store）
- 验收：`pnpm test -- src/lib/__tests__/idempotency.test.ts` + 订阅表单端到端回归（同一次提交重试/重复点击必须复用同一 key）

**PR-06e（前置防护，不影响当前业务）**：SSRF/第三方 URL fetch 安全护栏（✅ 已完成：2026-03-05，本地未提交/未开 PR）
- CR-021：为 WhatsApp media download 增加 URL allowlist + redirect policy
- 验收：`pnpm test -- src/lib/__tests__/whatsapp-media.test.ts`

**PR-06f（Round 2 收尾）**：Lighthouse `total-byte-weight` 预算闭环（CR-005）（✅ 已完成：2026-03-06，本地未提交/未开 PR）
- 采取的修复：
  - 继续关闭首页首屏 CTA/卡片中非关键 `Link` 的预取（Hero / Products / Sample / Final CTA / CTA Banner）
  - `JetBrains_Mono` 改为 `preload: false`
  - 首页首屏/主链路移除 `font-mono`，只保留主字体；使 homepage 不再为 monospace 预加载第二个 font
- 结果（最新 Lighthouse）：
  - `/en`：`484,523 ~ 486,344` bytes（≤ `490,000`）
  - `/zh`：`478,053 ~ 479,610` bytes（≤ `490,000`）
  - `assertion-results.json` 为空，说明 critical URLs 已通过 Lighthouse 断言
- 验收：`pnpm perf:lighthouse`、`pnpm ci:local`

补充：CR-011（幂等）很可能需要**前后端联动**（如果后端将 `Idempotency-Key` 设为 required）：
- 后端：将 `withIdempotency({ required: true, ... })` 的策略收紧，并选择一个跨实例可用的 store（KV/Redis/D1 等）。
- 前端：订阅表单提交逻辑需要生成并复用同一个 `Idempotency-Key`（同一次提交的重试/重复点击要复用；“用户下一次新提交”才生成新 key），否则服务端 required 只会导致误拒绝或幂等形同虚设。

补充（DEV 夹带项，低成本高收益）：
- CR-004：`scripts/ci-local.sh` 在 E2E 前检测 Playwright browsers 缺失并给出可操作提示；`README.md` 补安装说明
- CR-018：development CSP `script-src` allowlist 纳入 `https://unpkg.com`，并将 dev-only script URL 改为显式 `https://`

---

## 5. 风险与回滚策略（简版）

- 对外行为变化（API）：
  - 优先加单测覆盖“旧行为/边界条件”
  - 保留错误码/响应结构稳定（避免前端/第三方集成受影响）
- 性能/依赖迁移（Radix）：
  - 每迁移一批组件就跑一次 analyzer + Lighthouse，避免大改后难定位收益/回归
- CSP：
  - 优先 report-only（`relaxed`）收集真实 violation，再收紧到 enforced strict（如需）
  - 严禁直接上 `unsafe-inline` 作为长期方案（仅在紧急情况下短期兜底）

---

## 6. Round 2 输出与关闭方式

- 每个 CR 的关闭标准：
  - PR 合并 + 验收命令通过 + 在 `docs/code-review/issues.md` 中标记为已解决（建议加日期/PR 链接）
- Round 2 完成后：
  - ✅ 已完成：再次跑通 `pnpm ci:local` 作为最终回归（2026-03-06）
  - ✅ 已完成：`pnpm perf:lighthouse` 通过，`total-byte-weight` 回到 budget 内，无需调高 Lighthouse budget
  - 历史上曾保留独立技术债：CR-022（Next.js `middleware → proxy` 迁移告警）
  - 当前状态（2026-03-09）：该技术债已在 Round 4 / Wave D 关闭
