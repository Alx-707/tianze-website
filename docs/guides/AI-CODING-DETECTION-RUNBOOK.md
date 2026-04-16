# AI 编码检测运行手册

> 适用项目：`tianze-website`
>
> 目标：把“AI 写的代码看起来都过了，但真实行为仍可能出问题”这件事，拆成一套可以由 Codex 直接执行的检测流程。

## 1. 这份手册解决什么问题

这个项目已经有不少质量门禁，但之前的审查结论很明确：

- 许多检查擅长验证“代码形式”是否正确，比如类型、格式、覆盖率数字
- 但它们不一定能证明“用户行为”真的可用，比如按钮是否真的能跳转、表单是否真的能提交、测试是否真的能抓到 bug
- AI 写代码时，最危险的地方不是语法错误，而是“代码和测试一起自证正确”

所以，这份手册不是再堆一套新工具链，而是把项目里已经存在的检测能力组织成一条清晰的执行路径，并明确每一层为什么存在。

## 2. 为什么是这套检测措施

### 2.1 为什么不是只看覆盖率

因为覆盖率只能说明“代码被跑到过”，不能说明“测试真的能发现错误”。

AI 很容易写出这种测试：

- 断言按钮存在，但不点它
- 断言请求被调用，但把真正的验证链路都 mock 掉
- 断言常量等于常量，测试和实现共用同一份错误真相

所以，这个项目不能把“覆盖率高”当成“质量高”。

### 2.2 为什么不用纯 BDD / Cucumber 作为主方案

项目里已经有行为规格和 BDD 文档体系，再叠一层 Cucumber / Gherkin 只会增加抽象和维护成本。

这里的核心问题不是“缺一层描述语言”，而是“缺一层不容易被 AI 自证绕过的检测”。

因此本项目优先选择：

- 行为合同作为真相源
- Playwright 做真实用户路径验证
- 变异测试验证测试本身是否有效
- 静态检查补充结构和安全边界

### 2.3 为什么选 Stryker，而不是把所有测试都写成更复杂的 E2E

因为 E2E 负责验证“用户行为通不通”，但它不擅长回答“单元/集成测试是不是空心的”。

Stryker 的价值正好在这里：

- 它会故意小幅改坏代码
- 如果测试没红，说明这批测试对真实错误没有敏感度
- 它不是替代 E2E，而是专门审计测试质量

### 2.4 为什么只做关键目录的变异测试

全仓库跑变异测试太慢，CI 里也不现实。

所以这里选的是业务风险最高、最容易被“假绿”掩盖的三块：

- `src/lib/lead-pipeline/`
- `src/lib/security/`
- `src/lib/form-schema/`

这样选的原因是：

- 这三块直接影响询盘、验证、安全
- 出错后业务损失比 UI 小瑕疵大得多
- 它们更适合通过变异测试验证测试强度

### 2.5 为什么暂时不把 CodeQL 放进当前主流程

CodeQL 擅长跨文件数据流分析，这一点很有价值。

但当前这套流程的首要目标不是再补一层“更深的安全扫描”，而是先把已经确认存在的 AI 盲区堵住：

- 行为没被验证
- 测试容易自证
- 配置和结构边界可能慢慢漂移

所以当前顺序是：

1. 先把这套检测流程跑稳
2. 让真实开发中持续暴露问题
3. 再评估 CodeQL 是否值得作为后续增强层

## 3. 检测体系总览

这套体系分成 7 层，但不是 7 套互不相干的工具。

它们分别回答 7 个不同问题：

| 层 | 工具/真相源 | 回答的问题 |
|---|---|---|
| 1 | 行为合同 | 网站到底承诺了用户什么 |
| 2 | 静态真相检查 | 页面、链接、CTA、路由、表单入口是否断开 |
| 3 | E2E 行为测试 | 用户能不能真的完成关键路径 |
| 4 | 单元/集成测试 | 具体逻辑是否按预期工作 |
| 5 | 变异测试 | 现有测试是不是真的有保护力 |
| 6 | 结构/安全/未使用代码检查 | AI 有没有把项目慢慢写歪 |
| 7 | 人工审查清单 | 自动化工具拦不住的 AI 盲区是否被看见 |

## 4. 本项目的真相源

执行检测前，先确认这些文件是当前判断依据：

- 行为合同：
  [`docs/specs/behavioral-contracts.md`](../specs/behavioral-contracts.md)
- AI 防护实施计划：
  [`docs/plans/ai-coding-defense-execution.md`](../plans/ai-coding-defense-execution.md)
- 审查清单：
  [`/.claude/rules/review-checklist.md`](../../.claude/rules/review-checklist.md)
- 测试规则：
  [`/.claude/rules/testing.md`](../../.claude/rules/testing.md)

如果代码现状和这些文件矛盾，优先以“实际代码 + 当前脚本行为”作为事实，再把文档差异记成发现。

补充说明：

- 当前站点身份真相源已经进入 `src/sites/**`
- `src/config/paths/site-config.ts`、`src/config/site-facts.ts`、`src/constants/product-catalog.ts`、`src/config/footer-links.ts`、`src/lib/navigation.ts` 现在应被视为兼容包装层
- 如果 AI 把品牌、联系信息、默认 SEO、导航或页脚改进分散写回这些包装层，而不是先改 `src/sites/**`，这应该被记为真相源漂移
- 当前 `/about` 路由的运行时真相仍是 `src/app/[locale]/about/page.tsx` + `messages/*/deferred.json`，不是 MDX 直接渲染；如果 AI 只改 MDX 却宣称 about 页面已经变了，这也应被记为真相判断错误

## 5. Codex 检测顺序

下面这套顺序是给 Codex 直接执行的。顺序不要打乱。

### Phase A. 先读，不要先跑

先读四份文件，建立检测标准：

1. [`docs/specs/behavioral-contracts.md`](../specs/behavioral-contracts.md)
2. [`docs/plans/ai-coding-defense-execution.md`](../plans/ai-coding-defense-execution.md)
3. [`/.claude/rules/review-checklist.md`](../../.claude/rules/review-checklist.md)
4. [`/.claude/rules/testing.md`](../../.claude/rules/testing.md)

为什么先读：

- 先知道项目承诺什么，才知道后面测试遗漏了什么
- 先知道防线是怎么设计的，才知道某条 CI 通过到底说明了什么，没说明什么

### Phase B. 跑快速结构检测

在仓库根目录执行：

```bash
pnpm truth:check
pnpm unused:check
pnpm exec dependency-cruiser src --config .dependency-cruiser.js -T err
pnpm security:semgrep
```

各自的意义：

- `pnpm truth:check`
  - 检查页面链接、CTA、表单入口和真实路由的连接关系
  - 用来抓“看起来有按钮，实际上是死入口”的问题
- `pnpm unused:check`
  - 检查仓库里是否有看起来像业务功能、实际上没接到生产链路的文件
  - 用来抓“AI 写了半个功能，仓库里留下假入口”的问题
- `dependency-cruiser`
  - 检查结构边界
  - 用来防止 AI 为了复用方便，慢慢把项目写成一团耦合
- `pnpm security:semgrep`
  - 检查高信号安全和配置绕过问题
  - 用来抓“代码能跑，但绕开了统一安全入口”的问题

### Phase C. 跑基础质量门禁

继续执行：

```bash
pnpm test --run
pnpm type-check
pnpm lint:check
pnpm build
pnpm build:cf
pnpm ci:local:quick
```

各自的意义：

- `pnpm test --run`
  - 跑单元、集成和已有测试集合
  - 验证当前改动没有直接打碎现有逻辑
- `pnpm type-check`
  - 拦类型层面的错误
- `pnpm lint:check`
  - 拦明显的不规范和危险写法
- `pnpm build`
  - 验证项目至少能完整构建
- `pnpm build:cf`
  - 验证当前正式 Cloudflare 构建链路也仍然成立
- `pnpm ci:local:quick`
  - 用和本地 CI 接近的方式再做一次串联检查

为什么这一步仍然重要：

- 虽然它们不能单独证明“用户行为正确”
- 但它们依然是最廉价、最高频的第一层门禁

### Phase D. 跑关键行为面

先跑本地 test-mode 行为 smoke，而不是盲跑所有可视化测试：

```bash
pnpm exec playwright test \
  tests/e2e/navigation.spec.ts \
  tests/e2e/i18n.spec.ts \
  tests/e2e/user-journeys.spec.ts \
  tests/e2e/contact-form-smoke.spec.ts \
  tests/e2e/safe-navigation.spec.ts
```

如果当前任务涉及联系主转化路径、Turnstile、Airtable 写入、或“是否真的能提交”这类问题，必须再执行 production-like / deployed proof：

```bash
PLAYWRIGHT_BASE_URL=<real-url> pnpm exec playwright test tests/e2e/smoke/post-deploy-form.spec.ts
pnpm smoke:cf:deploy -- --base-url <real-url>
```

为什么这样选：

- 这些测试覆盖了导航、语言切换、关键旅程、联系表单和安全导航
- 它们最接近行为合同中的高优先级条目
- 它们比视觉回归更直接，也比全量 E2E 更适合日常检测
- 其中 `tests/e2e/contact-form-smoke.spec.ts` 只代表 **test-mode smoke**
  - 它证明的是本地/CI 下的结构、字段、i18n、基础交互
  - 它不是联系主转化路径的最终证明

判定规则：

- `tests/e2e/contact-form-smoke.spec.ts`
  - 只能证明 **test-mode smoke**
- `tests/e2e/smoke/post-deploy-form.spec.ts`
  - 才是联系表单真实提交链路的 **production-like browser proof**
- `pnpm smoke:cf:deploy -- --base-url <real-url>`
  - 才是 Cloudflare / deployed API surface 的最终 smoke proof

### Phase E. 检查变异测试状态

先判断这次变更有没有碰到高风险目录：

- `src/lib/lead-pipeline/`
- `src/lib/security/`
- `src/lib/form-schema/`

如果碰到了，执行：

```bash
node scripts/check-mutation-required.js
```

如果脚本提示报告已过期或 scope 不匹配，再按提示执行：

```bash
pnpm test:mutation
```

或

```bash
pnpm test:mutation:lead
```

为什么这样做：

- 不是每次都全量跑 Stryker，而是只在高风险目录变更时触发
- 这样能保留变异测试价值，又不会把日常开发拖垮

## 6. 每一层怎么判定结果

### 6.1 `truth:check` 失败

说明 UI 和真实路由/动作之间已经断了。

优先级很高，因为这类问题最容易让用户直接撞到死路，而且普通类型检查不一定能发现。

### 6.2 `unused:check` 失败

说明仓库里可能有：

- 未清理的功能残骸
- 只剩测试引用的旧实现
- 会误导维护者的“假功能”

这类问题不一定立刻造成线上事故，但会持续污染判断。

### 6.3 `dependency-cruiser` 失败

说明结构边界开始松动。

这类问题如果不及时处理，短期可能没感觉，长期会让 AI 更容易写出跨层耦合和复制逻辑。

### 6.4 `Semgrep` 报 WARNING

这里不是“可以忽略”的意思，而是“需要审查是否合理”。

处理原则：

- 如果是合理特例，要补清楚原因
- 如果只是为了省事绕过统一入口，应当回到规范做法

### 6.5 单元/集成测试全绿，但 E2E 失败

优先相信 E2E。

这通常说明：

- 实现和真实用户行为之间有差距
- mock 掩盖了真实问题
- 某个流程在集成层是假的、在浏览器里才是真的

### 6.6 E2E 全绿，但变异测试失败

优先相信变异测试对“测试质量”的判断。

这通常说明：

- 用户主路径也许没坏
- 但现有测试对细微错误不够敏感
- 单元/集成测试里有空心断言或保护不足

## 7. 本项目特别要注意的陷阱

### 7.1 不要把测试通过当成生产真相

这个仓库已经多次出现：

- 旧实现仍被测试引用
- 但生产代码早就切到新路径

所以发现“某模块有测试”时，还要确认：

- 它是否仍被 `src/**` 生产代码引用
- 还是只剩 `tests/**` 在保活它

### 7.2 Zod 在测试环境里被全局 mock

这是本项目非常重要的坑。

在这个项目里，如果测试要验证 schema 的真实行为，比如：

- `.safeParse`
- `.parse`
- 非法输入应当失败

就必须先 `vi.unmock("zod")`。

否则测试可能会假通过。

详细规则已写在：
[`/.claude/rules/testing.md`](../../.claude/rules/testing.md)

### 7.3 不要把本地构建绿当成部署链路绿

如果任务涉及 Cloudflare 或部署后行为，`pnpm build` 和本地测试不够，需要额外看对应 smoke。

原因是这个项目已经验证过：

- 本地构建成功
- 不代表最终部署路径就完全正确

### 7.4 不要把 warning 当噪音批量忽略

这个项目之前已经明确把审查重点转向“高信号规则”。

如果又开始靠：

- ignore
- bypass
- skip
- disable

来换取表面通过，等于又回到“门禁游戏化”。

### 7.5 先分清楚是“代码红了”还是“proof 工具自己先摔了”

这类问题最近已经实际踩到两次，都是很容易误导后续修复方向的假红。

第一类是 **Semgrep baseline 计算失败**。

在 PR 的 baseline 模式里，CI 需要先拿到 `HEAD` 和 `origin/$GITHUB_BASE_REF` 的共同祖先提交，再只比较新增问题。

如果 base branch fetch 太浅，或者主线发生过 force update / 历史改写，`git merge-base` 就可能先失败。此时红灯看起来出在 Semgrep lane，但真实含义不是“扫出安全漏洞”，而是“扫描前置条件都没成立”。

第二类是 **guardrail 脚本把 CLI 差异误当成仓库问题**。

例如 `rg` 很快、应该优先用，但它不能是唯一真相入口。某些环境里没有 `rg`，或者 `rg` / `grep` 只是返回 `exit 1` 表示“没找到匹配”，都不该直接被抛成 guardrail failure。

默认动作：

- 如果 CI 红在 Semgrep lane，先看它是红在 baseline 计算，还是红在真正的 scan 结果
- 如果脚本红在 `rg error`、`command not found`、工具不可用，先按“脚本可移植性问题”归类
- 汇报时必须把“proof 工具层失败”和“仓库代码层失败”分开写，不要混成一句“CI 挂了”

## 8. 这套方案为什么是当前最优解

它不是理论上最完美，而是当前项目条件下最合适。

原因有四个：

1. 它优先复用了现有工具和现有脚本，而不是再引入一套庞大新系统。
2. 它把“行为正确”和“测试有效”分开验证，能直接打到 AI 编码最常见的盲区。
3. 它保留了日常开发速度，不要求每次都跑最重的检测。
4. 它已经和项目现有文档、脚本、CI 结构对齐，不需要另起炉灶。

## 9. Codex 交付标准

把这份手册交给 Codex 时，要求它按下面标准交付：

- 先读真相源，再执行命令
- 给出每一层检测的结果，不只报最后一个总状态
- 区分“失败的是行为层、测试层、结构层还是安全层”
- 如果某条检测失败，说明这意味着什么，而不是只贴报错
- 如果发现文档和脚本不一致，要记成发现
- 如果发现测试假通过风险，要优先指出

## 10. 可直接给 Codex 的执行指令

下面这段可以直接复制给 Codex：

```text
请在 /Users/Data/Warehouse/Pipe/tianze-website 按 docs/guides/AI-CODING-DETECTION-RUNBOOK.md 执行完整检测。

要求：
1. 先阅读以下文件，再开始跑命令：
   - docs/specs/behavioral-contracts.md
   - docs/plans/ai-coding-defense-execution.md
   - .claude/rules/review-checklist.md
   - .claude/rules/testing.md
2. 按手册中的顺序执行，不要跳步。
3. 先跑结构/真相层，再跑基础质量门禁，再跑关键 E2E，再检查变异测试状态。
4. 报告中必须分开写：
   - 行为合同覆盖和缺口
   - 静态真相/结构/安全检查结果
   - 单元/集成/构建结果
   - E2E 关键路径结果
   - 变异测试是否需要重新跑，以及原因
   - 人工审查角度看到的 AI 盲区
5. 如果发现“测试通过但行为仍可能不对”或“测试可能是假通过”，把它作为高优先级发现。
6. 不要只复述命令输出，要解释每个失败意味着什么。
```

## 11. 完成定义

这份流程跑完后，才可以说“当前这轮 AI 编码检测完成”：

- 行为合同已读
- 快速结构检查已跑
- 基础质量门禁已跑
- 关键 E2E 已跑
- 如果触及高风险目录，变异测试状态已确认
- 报告明确区分了哪一层有问题
- 已记录文档与现实不一致的地方

如果只跑了 `test + type-check + build`，不能算完成。
