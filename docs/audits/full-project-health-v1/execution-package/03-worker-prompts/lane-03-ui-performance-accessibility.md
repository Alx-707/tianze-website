# Lane 03 Prompt - UI / Performance / Accessibility

你负责 Lane 03: UI / performance / accessibility。

目标是审页面技术质量，不只看好不好看，而是看真实买家访问时是否顺、快、清楚、可用。

这是 read-only audit。你只做诊断、证据收集和报告，不修业务代码，不改配置，不改依赖，不改测试。

## Required package reading

Before auditing, read these common package files:

```text
docs/audits/full-project-health-v1/execution-package/README.md
docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md
docs/audits/full-project-health-v1/execution-package/01-report-contract.md
docs/audits/full-project-health-v1/execution-package/04-stop-lines.md
docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md
```

If any common package file is missing, stop and report exactly:

```text
Blocked: audit execution package unavailable or incomplete.
```

Do not continue with partial instructions.

## Allowed writes

Only write your assigned lane report and assigned evidence paths:

```text
docs/audits/full-project-health-v1/lanes/03-ui-performance-accessibility.md
docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/**
docs/audits/full-project-health-v1/evidence/screenshots/03-ui-performance-accessibility/**
```

Forbidden writes include business code, package files, other lane reports, orchestrator reports, config, dependency files, workflow files, and unrelated scratch files.

## Skills and tools

Prefer these skills if available:

- `audit`
- `optimize`

If a skill is unavailable, record `Blocked: skill unavailable` for that skill and continue with code reading, browser/runtime checks, and available commands.

Important: `audit` and `optimize` are diagnosis tools in this lane. Use them only to find issues and produce recommendations. Do not let `optimize` apply code changes. Do not run auto-fix modes. Do not patch files.

## Evidence and severity rules

Every finding must include:

- severity: `P0`, `P1`, `P2`, or `P3`
- evidence level from `01-report-contract.md`
- confidence from `01-report-contract.md`
- exact evidence reference
- business impact in plain language

P0/P1 findings require fresh evidence from this run. Use only:

- `Confirmed by execution`
- `Confirmed by static evidence`

Do not mark P0/P1 as `Strong hypothesis`, `Weak signal`, `Blocked`, or `low` confidence. If proof is weaker, downgrade the severity or mark the finding as `Needs proof` for the orchestrator.

Old reports are clues only. They cannot be decisive evidence for P0/P1.

## Scope

Focus on buyer-visible experience:

```text
home page
product listing pages
product detail pages
contact page
about page
key conversion entry points
mobile navigation
forms
images
animations
loading behavior
accessibility basics
```

## Suggested checks

Use only commands and runtime checks that fit the read-only audit posture. Do not run heavy validation unless the package or orchestrator explicitly asks for it.

Useful checks may include:

```text
current component/page code reading
local page visit if an approved local server is already available
targeted screenshots for evidence
accessibility scan from available tooling
bundle/image/rendering inspection from available reports or lightweight commands
```

If Lighthouse, PageSpeed, or CrUX data is needed but unavailable, mark it as `Blocked` and state what access, command, URL, or artifact is needed.

## Must answer

- Can a first-time buyer quickly understand who Tianze is, what it sells, and how to contact the company?
- Are there obvious mobile blockers?
- Are there accessibility problems that affect real users?
- Are images, bundle size, rendering, or animation creating visible waste?
- Which performance problems are P1 launch risks, and which are only P3 improvements?
- Does the lane need Lighthouse, PageSpeed, or CrUX evidence before making a stronger claim?
- What is the severity and evidence level for every finding?

## Output format

Use `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md`.

Your source lane is:

```text
03-ui-performance-accessibility
```

Do not give the final repo verdict. Hand findings to the orchestrator for dedupe, downgrade, merge, and final priority.
