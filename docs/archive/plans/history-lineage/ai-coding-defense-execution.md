# AI 编码防护体系实施计划

## Context

项目全部代码由 AI 编写，经过专家审计 + Codex 3 轮交叉验证，识别出 12 种 AI 编码缺陷。现有工具链（Stryker、Semgrep、dep-cruiser、Knip）已安装但未针对 AI 盲区调优。本计划不加新工具链（仅加 fast-check 一个依赖），通过调优现有工具 + 补属性测试 + 更新审查规则来覆盖 AI 缺陷。

总增量：~300 行新代码，0 个新 npm script，CI +~15s。

---

## Phase 1: 清 Knip 基线 → 接入 CI

**目标**：让 `pnpm unused:check` 干净通过，然后加入 CI 门禁。

**文件**：`knip.jsonc`、`.github/workflows/ci.yml`

**修改 knip.jsonc**：
- 删除 `ignore` 数组中的 `src/app/[locale]/layout-test.tsx`（文件已不存在）
- 添加 `src/types/react19.ts` 到 `ignore`（被 ignored 目录下的 testing template 引用）
- 添加 `react-scan` 到 `ignoreDependencies`（通过 CDN Script 加载，非 import）
- 添加 `@react-grab/claude-code/server` 到 `ignoreDependencies`（optional dev peer dep）
- 添加 `openssl` 到 `ignoreBinaries`（系统命令）

**修改 ci.yml**：在 basic-checks job 的「静态真相检查」之后添加：
```yaml
- name: 未使用代码检查
  run: pnpm unused:check
```

**验证**：`pnpm unused:check` 零输出 + `pnpm ci:local:quick` 通过

---

## Phase 2: 更新 Review Checklist

**目标**：把 12 种 AI 缺陷中工具无法自动拦截的 6 种，写成审查时的强制问题。

**文件**：`.claude/rules/review-checklist.md`

在 `## Severity Rules` 之前插入新 section：

```markdown
## AI Blind Spot Detection

以下 6 个问题在审查 AI 生成代码时必须逐条回答：

1. **门禁游戏化**：这次 PR 是否新增了 ignore/bypass/skip/eslint-disable？
   如果是，是否有理由注释说明为什么不修底层问题？

2. **测试共用实现真相**：测试是否引用了生产常量作为期望值？
   （如果常量本身就错了，测试和生产会一起错一起过）

3. **测试/生产路径分叉**：是否新增了 TEST_MODE、PLAYWRIGHT_TEST、
   ALLOW_MEMORY_ 等开关？每个开关都意味着一条生产路径未被测试覆盖。

4. **低流量页面忽略**：这次变更是否只验证了主路径（首页、联系表单），
   而忽略了次要页面（privacy、terms、blog、capabilities）？

5. **比例原则**：新增的文件/函数/抽象层数量，和它解决的问题是否成比例？

6. **静默故障**：每个新的 catch/fallback 是否有可观察后果（告警/指标/
   可区分的错误码）？只 log 然后继续正常流程 = 藏 bug。
```

---

## Phase 3: fast-check 属性测试

**目标**：用随机输入 fuzz AI 写的纯逻辑函数，抓边界条件盲区。

**新依赖**：`pnpm add -D fast-check`

### 文件 1：`src/lib/i18n/__tests__/route-parsing.property.test.ts`

测试 `normalizePathnameForLink`（来自 `src/lib/i18n/route-parsing.ts`）：
- 任意字符串输入 → 输出总是以 `/` 开头
- 去 locale 是幂等的（执行两次结果不变）
- 空字符串 → `/`

测试 `parsePathnameForLink`：
- 已知静态路由返回 string，动态路由返回 object
- 永远不抛异常

### 文件 2：`src/lib/lead-pipeline/__tests__/lead-schema.property.test.ts`

测试类型守卫互斥性：
- 对任意 LeadInput，isContactLead/isProductLead/isNewsletterLead 有且只有一个为 true

测试 Zod schema 鲁棒性：
- contactLeadSchema.safeParse(fuzzed) 要么成功要么失败，永远不抛异常
- email 字段拒绝非邮箱字符串

### 文件 3：`src/lib/__tests__/idempotency.property.test.ts`

测试 `createRequestFingerprint`（来自 `src/lib/idempotency.ts`）：
- 输出格式始终匹配 `METHOD:pathname` 或 `METHOD:pathname:hash`
- 不同输入 → 不同指纹（碰撞抵抗）
- Mock NextRequest 复用现有 `src/lib/__tests__/idempotency.test.ts` 的 mock 模式

**验证**：`pnpm test --run` 全绿

---

## Phase 4: dep-cruiser 规则收紧

**目标**：阻止 config→UI 耦合和跨路由导入。

**文件**：`.dependency-cruiser.js`

添加 2 条规则到 `forbidden` 数组：

```javascript
{
  name: "no-config-to-components",
  severity: "error",
  comment: "src/config 不能依赖 src/components — config 层必须与 UI 层解耦",
  from: { path: "^src/config/" },
  to: { path: "^src/components/" },
}
{
  name: "no-cross-route-import",
  severity: "error",
  comment: "不同路由目录不能直接导入彼此 — 共享逻辑应抽到 src/lib",
  from: { path: "^src/app/\\[locale\\]/([^/]+)/" },
  to: { path: "^src/app/\\[locale\\]/(?!\\1)[^/]+/" },
}
```

**已确认**：当前代码无违规（grep 验证过），规则纯粹防未来。

**验证**：`pnpm exec dependency-cruiser src --config .dependency-cruiser.js -T err` 零违规

---

## Phase 5: Semgrep 规则（WARNING 级别）

**目标**：防止未来新增的 API route 绕过安全解析，防止 config 绕过 env.ts。

**文件**：`semgrep.yml`（现有文件末尾追加）

### 规则 1：no-raw-request-json-in-api
- 检测 `await request.json()` 在 `src/app/api/` 下
- **当前零违规**（全部路由已用 safeParseJson 或 readAndHashJsonBody），纯防未来
- 排除 `__tests__/`、webhook 路由
- severity: WARNING

### 规则 2：env-access-bypass-in-config
- 检测 `process.env.SOME_VAR`（排除 NODE_ENV）在 `src/config/` 下
- 范围仅限 `src/config/`（不扫全 src，避免误伤 middleware、security 等合理用法）
- CI 用 baseline 模式，只标记**新增**违规，不动存量
- severity: WARNING

**验证**：`pnpm lint:check` 通过（Semgrep 非 lint 管辖但确认不冲突）

---

## Phase 6: 修复计划文档

**目标**：消除 BC 编号副本，只保留一份真相。

**文件**：`docs/archive/plans/history-lineage/quality-defense-plan.md`

将 lines 17-33 的 BC 编号表替换为：
```markdown
See [Behavioral Contracts](../specs/behavioral-contracts.md) for the full contract registry.
```

---

## Phase 7: 变异测试条件触发（半自动）

**目标**：当 lead-pipeline/security/form-schema 变更时提醒跑变异测试。

### 新文件：`scripts/check-mutation-required.js`（~30 行）

逻辑：
1. `git diff origin/main...HEAD --name-only` 检测变更文件
2. 匹配 `src/lib/lead-pipeline/**`、`src/lib/security/**`、`src/lib/form-schema/**`（排除 `__tests__/`）
3. 有匹配 → 检查 `reports/mutation/mutation-report.json`：
   a. 报告时间是否晚于本次受保护目录的最新相关提交
   b. 读取报告中的 `mutate` scope，确认覆盖了变更的目录
   （因为 `test:mutation` 和 `test:mutation:lead` 共享同一报告路径，仅检查时间戳不够——必须验证 scope 匹配）
4. 未更新或 scope 不匹配 → exit 1 + 提示信息
5. 无匹配 → exit 0

### 修改：`lefthook.yml` pre-push section

```yaml
mutation-freshness:
  run: |
    if [ -n "$RUN_FAST_PUSH" ]; then
      echo "⏭️  RUN_FAST_PUSH=1: 跳过变异测试新鲜度检查";
    else
      node scripts/check-mutation-required.js
    fi
  fail_text: '变异测试报告过期 — 请运行 pnpm test:mutation:lead'
```

**明确标注为半自动**：`RUN_FAST_PUSH=1` 可绕过，CI 无法运行变异测试（已证实 runner 太慢）。

---

## 验证清单

全部完成后依次执行：

1. `pnpm unused:check` — 零输出
2. `pnpm exec dependency-cruiser src --config .dependency-cruiser.js -T err` — 零违规
3. `pnpm test --run` — 全绿（含新属性测试）
4. `pnpm type-check` — 零错误
5. `pnpm lint:check` — 零警告
6. `pnpm truth:check` — 全部链接解析
7. `pnpm build` — 通过
8. `pnpm ci:local:quick` — 全绿

---

## 提交策略

每个 Phase 一个 commit：

1. `chore(knip): clean baseline and add to ci gate`
2. `docs(review): add ai blind spot detection checklist`
3. `test: add fast-check property tests for route-parsing, lead-schema, idempotency`
4. `chore(arch): add dep-cruiser rules for config-ui and cross-route boundaries`
5. `chore(security): add semgrep warning rules for raw json and env bypass`
6. `docs: replace bc table with link to canonical contracts`
7. `chore(ci): add mutation freshness check to pre-push`

全部在 `feature/quality-defense-system` 分支上，通过 PR 合并到 main。
