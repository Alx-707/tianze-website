# 代码质量变更迁移清单

> 来源：tianze-website PR #1-#18
> 目标：b2b-web-template, tucsenberg-web
> 基准版本：b2b@967924f0, tuc@476e7eb
> 更新时间：2026-02-04

---

## 约定

- ~~删除线~~ = **b2b ✅ / tuc ✅**（两个 main 都完成）
- 未删除线 = **至少一个未完成**（括号内标注 `b2b / tuc`）

---

## P0 必须

- ~~Vercel deploy secrets step-guard（`tianze` PR #17/#18）~~（b2b ✅ / tuc ✅）
- ~~`vitest.config.mts` 清理（移除 `net.Server.listen` patch 等；`tianze` PR #16/#18）~~（b2b ✅ / tuc ✅）
- ~~test setup 模块化（`src/test/setup*.ts`；`tianze` PR #15）~~（b2b ✅ / tuc ✅）
- ~~`src/test/setup.console.ts`（console/stderr 降噪；`tianze` PR #18）~~（b2b ✅ / tuc ✅）
- ~~TimeoutOverflowWarning 修复（`MAX_SET_TIMEOUT_DELAY_MS` + AnimatedCounter delay clamp；`tianze` PR #18）~~（b2b ✅ / tuc ✅）

---

## P1 推荐（工具链/门禁）

- ~~Knip：`tsconfig.knip.json` + `unused:production --use-tsconfig-files -t tsconfig.knip.json`（`tianze` PR #18）~~（b2b ✅ / tuc ✅）
- ~~Madge：`circular:check --ts-config tsconfig.json`（`tianze` PR #18）~~（b2b ✅ / tuc ✅）
- ~~ESLint：`lint:check --max-warnings 0`（`tianze` PR #18）~~（b2b ✅ / tuc ✅）
- ~~Audit：`security:audit --prod --audit-level moderate`（`tianze` PR #18，早期相关 `tianze` PR #4）~~（b2b ✅ / tuc ✅）
- ~~Semgrep：`scripts/semgrep-scan.js` + `security:semgrep`（`tianze` PR #18）~~（b2b ✅ / tuc ✅）
- ~~`semgrep.yml` 降噪/豁免（`tianze` PR #18）~~（b2b ✅ / tuc ✅）
- ~~依赖钉死：`baseline-browser-mapping` pin（`tianze` PR #18）~~（b2b ✅ / tuc ✅）

- `playwright.config.ts`：dotenv 静默 `config({ path: ".env.test", quiet: true })`（`tianze` PR #18）（b2b ❌ / tuc ❌）
- `scripts/quality-gate.js`：Semgrep(ERROR) 纳入 gate（`semgrepErrors` + `runSemgrepScan`，CI gate 可默认跳过；`tianze` PR #18）（b2b ❌ / tuc ❌）
- `eslint.config.mjs`：将 `security/detect-object-injection` 策略性下放给 Semgrep（统一 `off` 或等价降噪；`tianze` PR #18）（b2b ❌ / tuc ❌）
- `src/lib/merge-objects.ts`：增加 `__proto__/constructor/prototype` 污染防护 + 测试（`tianze` PR #18；在合并 PR #59 后更建议尽快补）（b2b ❌ / tuc ❌）

- `lefthook.yml`：barrel files（`**/index.ts`）相对导入例外（`tianze` PR #13）（b2b ✅ / tuc ❌）
- `scripts/quality-gate.js`：增量覆盖率临时排除（`src/lib/load-messages.ts`、`src/types/whatsapp-api-config/errors.ts`、`src/types/whatsapp-service-*.ts`；`b2b` PR #59 的补丁提交，不是 `tianze` 主干门禁方案）（b2b ✅ / tuc ❌，且建议后续用"补测试"撤回）

---

## PR #13（重构型 code quality，随 b2b PR #59 一起纳入迁移范围）

- `src/lib/load-messages.ts` 重构（`tianze` PR #13）（b2b ✅ / tuc ❌）
- 删除 `src/lib/security-object-access.ts` + 删除对应测试（`tianze` PR #13）（b2b ✅ / tuc ❌）
- `src/lib/merge-objects.ts` 去掉对 `security-object-access` 的依赖（`tianze` PR #13）（b2b ✅ / tuc ❌）
- 常量重组：`src/constants/whatsapp-errors.ts`、`src/constants/validation-limits.ts`、`src/constants/count.ts`、`src/constants/index.ts`（`tianze` PR #13）（b2b ✅ / tuc ❌）
- WhatsApp 相关：`src/lib/whatsapp-utils.ts`、`src/types/whatsapp-*`（`tianze` PR #13）（b2b ✅ / tuc ❌）

---

## P2 可选（按目标项目需求）

- `src/lib/api/api-response.ts`（API 响应工厂函数；`tianze` PR #16）（b2b ❌ / tuc ❌）
- `src/constants/api-error-codes.ts`：扩展到与 `tianze` 一致的更完整 error codes（`tianze` PR #16；目标仓库已有基础版，是否扩展按需）（b2b ❌ / tuc ❌）
- ~~`src/lib/api/with-rate-limit.ts`（HOF；`tianze` PR #14；目标仓库已存在）~~（b2b ✅ / tuc ✅）
- `src/constants/magic-numbers.ts`：补齐 `HTTP_TOO_MANY_REQUESTS=429`、`HTTP_INTERNAL_ERROR=500` 并在 `with-rate-limit` 中使用（`tianze` PR #14）（b2b ❌ / tuc ❌）

---

## P3 可选（文档/开发工具/视觉风格）

- ~~`.gitignore`：忽略 `public/messages/`（`tianze` PR #7；目标仓库已存在）~~（b2b ✅ / tuc ✅）
- ~~`.claude/rules/ui-system.md`：`next/font` 最佳实践（`tianze` PR #7；目标仓库已存在）~~（b2b ✅ / tuc ✅）
- ~~`.claude/rules/testing.md`：Playwright selectors 最佳实践（`tianze` PR #7；目标仓库已存在）~~（b2b ✅ / tuc ✅）
- `.claude/commands/brainstorm.md`（`tianze` PR #4）（b2b ❌ / tuc ❌）
- `react-grab` + `src/components/dev-tools/ReactGrabLoader.tsx`（`tianze` PR #4）（b2b ❌ / tuc ❌）
- `globals.css` 动画/背景视觉工具类（`tianze` PR #1/#8；纯风格，按需）（b2b ❌ / tuc ❌）

---

## 统计

| 优先级 | 总数 | 完成 | 待迁移 |
|--------|------|------|--------|
| P0 | 5 | 5 | 0 |
| P1 | 13 | 7 | 6 |
| PR #13 | 5 | 0 | 5 (tuc) |
| P2 | 4 | 1 | 3 |
| P3 | 6 | 3 | 3 |
| **合计** | **33** | **16** | **17** |

---

## 不迁移清单

| PR | 内容 | 原因 |
|----|------|------|
| #2 | 天泽品牌/产品目录 | 业务特定 |
| #3 | 归档 openspec | 项目清理 |
| #5 | 依赖批量更新 | 各项目独立处理 |
| #6 | Next.js 安全补丁 | 各项目独立处理 |
| #8 | Twitter 主题迁移 | 视觉风格（部分动画可选迁移） |
| #9 | 首页业务重设计 | 业务特定 |
| #10 | CLAUDE.md 重设计 | 项目特定 |
| #11 | Skills cheatsheet | 项目特定 |
| #12 | 删除 openspec 归档 | 项目清理 |
