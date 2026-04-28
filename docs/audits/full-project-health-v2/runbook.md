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

`pnpm build` and `pnpm build:cf` are serial commands. Never run them in parallel.

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
