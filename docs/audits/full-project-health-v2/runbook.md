# Full Project Health Audit v2 Runbook

Use the global `$repo-health-audit` skill as the method source, then apply this Tianze adapter.

Set `REPO_HEALTH_AUDIT_SKILL` to the installed skill copy for the agent running the audit:

```bash
# Codex
export REPO_HEALTH_AUDIT_SKILL="$HOME/.codex/skills/repo-health-audit"

# Claude Code
export REPO_HEALTH_AUDIT_SKILL="$HOME/.claude/skills/repo-health-audit"
```

## Required reading order

1. `<REPO_HEALTH_AUDIT_SKILL>/SKILL.md`
2. `<REPO_HEALTH_AUDIT_SKILL>/references/lifecycle.md`
3. `<REPO_HEALTH_AUDIT_SKILL>/references/evidence-contract.md`
4. `<REPO_HEALTH_AUDIT_SKILL>/references/lane-contracts.md`
5. `docs/audits/full-project-health-v2/audit.config.json`
6. `docs/audits/full-project-health-v2/project-profile.md`
7. `docs/audits/full-project-health-v2/framework.md`
8. `AGENTS.md`
9. `CLAUDE.md`
10. relevant `.claude/rules/*`

## Preflight only, before audit

Do not start lane work until preflight answers:

```text
Audit target: origin/main @ <SHA>
Local HEAD: <SHA>
Worktree state: clean | audit-package diff only | dirty business-code diff
Launch-readiness dirty work: excluded | included by checkpoint <SHA>
Audit can start: yes | no
Reason if no: <one sentence>
```

Run:

```bash
git fetch origin
git rev-parse origin/main
git rev-parse HEAD
git status --short --branch
node -v
pnpm -v
pnpm run # script inventory only; not a validation command
test -f "$REPO_HEALTH_AUDIT_SKILL/SKILL.md"
PYTHONDONTWRITEBYTECODE=1 python3 "$REPO_HEALTH_AUDIT_SKILL/scripts/validate_audit_config.py" docs/audits/full-project-health-v2/audit.config.json
```

For a read-only audit run, business-code diff against `origin/main` must be zero unless the user names a checkpoint commit.

## Runtime handoff

Lane 00 or the orchestrator must provide one runtime target before UI, SEO, CSP, or contact-flow runtime claims:

- local server URL
- Cloudflare preview URL
- production URL
- or an explicit blocker

Cloudflare build proof is serial:

1. `pnpm clean:next-artifacts && pnpm build`
2. `CF_APPLY_GENERATED_PATCH=true pnpm build:cf`

Never run these commands in parallel, because both write Next.js build artifacts.

Deploy and post-deploy smoke commands are credential-dependent. Do not run production-mutating commands during a read-only audit.

## Lane outputs

For run id `<run-id>`, write only under:

```text
docs/audits/full-project-health-v2/runs/<run-id>/
.context/audits/full-project-health-v2/<run-id>/
```

Default lane files:

```text
lanes/00-baseline-runtime.md
lanes/01-architecture-coupling.md
lanes/02-security-trust-boundary.md
lanes/03-ui-performance-accessibility.md
lanes/04-seo-content-conversion.md
lanes/05-tests-ai-smell-dead-code.md
```

Each lane must copy decisive command output, generated reports, screenshots, or runtime proof into its tracked evidence folder before citing it.

## Tier-A/B/C line review (mandatory rules)

整库审查不是“全仓逐行通读”。更高性价比且更容易给出硬结论的方式是：

- **先用 lane 跑出风险排序与证据**（哪些是 P1/P2、哪些只是噪音）。
- **再对关键链路做逐行深读**（把根因压实，避免误修 / 误降级）。

本审查把逐行阅读固定成 Tier-A/B/C 三层，不是可选项；触发条件如下。

### Tier-A（必须做：关键链路逐行深审）

出现任一情况，就必须做 Tier-A，并把产物写到：

```text
docs/audits/full-project-health-v2/runs/<run-id>/08-tiered-line-review.md
```

**触发条件：**

1. 本轮出现 **P1**（已确认或疑似）；
2. 本轮出现“跨层合同问题”迹象：例如 URL/baseUrl/canonical、env 注入、metadata streaming、缓存/渲染边界、Cloudflare/OpenNext runtime 入口漂移；
3. 关键买家链路涉及的 finding：Contact / Inquiry / Subscribe / Turnstile / CSP / Products / Trust assets / i18n loading。

**Tier-A 的目标：**

- 把根因定位到“具体文件 + 具体合同/优先级/边界”，而不是停在现象描述；
- 明确“应该修代码/修配置/修测试环境合同”，禁止只放宽测试。

### Tier-B（建议做：热点抽样逐行）

只要本轮审查结论涉及“门禁绿但质量不干净”的判断（例如 launch readiness、SEO、可访问性语义、占位内容外露），就建议做 Tier-B：

- 按热点/高 churn 文件抽样逐行（例如：关键页面、messages、workflows、quality scripts）。
- 目标是回答：**现有门禁到底覆盖了什么、没覆盖什么**。

### Tier-C（必须做：扫描验证，防漏项）

每次整库审查都必须做 Tier-C（快速扫描/一致性验证），用于防止“只靠肉眼读代码漏掉面”。

最低要求：对 `src/ content/ messages/ public/` 做与本轮 finding 相关的 `rg` 扫描，并把关键命令与结论（不是全量输出）记录进 `08-tiered-line-review.md` 或对应 lane evidence。

## Final outputs

The final report set is:

```text
00-final-report.md
01-quality-map.md
02-findings.json
03-evidence-log.md
04-process-retro.md
```

Validate findings:

```bash
jq . docs/audits/full-project-health-v2/runs/<run-id>/02-findings.json
PYTHONDONTWRITEBYTECODE=1 python3 "$REPO_HEALTH_AUDIT_SKILL/scripts/validate_findings.py" docs/audits/full-project-health-v2/runs/<run-id>/02-findings.json
```

JSON syntax is not enough. The orchestrator must manually check that P0/P1 findings have fresh confirmed evidence and are not blocked or low confidence.

## Repair separation

Audit output and business-code repair should be separate PRs by default.

Repair planning should use:

```text
<REPO_HEALTH_AUDIT_SKILL>/assets/templates/repair-wave.md
```

Every repair item needs a regression guard and a verification command or runtime proof.
