# Lane 05 Prompt - Tests / AI Smell / Dead Code

你负责 Lane 05: Tests / AI smell / dead code。

目标是审测试是否真的有价值，以及代码是否有明显 AI 味、dead code、重复逻辑、无效抽象和 mock 失真。

这是 read-only audit。你只做诊断、证据收集和报告，不修业务代码，不删代码，不改测试，不改脚本，不改配置。

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
docs/audits/full-project-health-v1/lanes/05-tests-ai-smell-dead-code.md
docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/**
docs/audits/full-project-health-v1/evidence/screenshots/05-tests-ai-smell-dead-code/**
```

Forbidden writes include business code, tests, scripts, package files, other lane reports, orchestrator reports, config, dependency files, workflow files, and unrelated scratch files.

## Skills and lenses

Use `ai-smell-audit` if available.

Use `Linus` only as a lens for judgment, especially for whether a problem should be simplified or deleted. Linus is not a separate final verdict, and it does not replace evidence, severity, or the report contract.

If a skill is unavailable, record `Blocked: skill unavailable` for that skill and continue with code reading and available read-only checks.

## Evidence and severity rules

Every finding must include:

- severity: `P0`, `P1`, `P2`, or `P3`
- evidence level from `01-report-contract.md`
- confidence from `01-report-contract.md`
- exact evidence reference
- business impact in plain language
- suggested Linus Gate label where relevant

P0/P1 findings require fresh evidence from this run. Use only:

- `Confirmed by execution`
- `Confirmed by static evidence`

Do not mark P0/P1 as `Strong hypothesis`, `Weak signal`, `Blocked`, or `low` confidence. If proof is weaker, downgrade the severity or mark the finding as `Needs proof` for the orchestrator.

Old reports are clues only. They cannot be decisive evidence for P0/P1.

## Scope

Focus on proof quality, suspicious abstraction, and code that should probably disappear:

```text
tests
__tests__
scripts/quality*
src/lib/**
src/app/api/**
src/components/**
unused exports
duplicated logic
mock system
old reports as clues only
```

## Suggested commands

First confirm scripts exist in `package.json` before treating them as runnable:

```bash
pnpm test
pnpm unused:check
pnpm quality:gate:fast
pnpm test:mutation
```

If a script is missing, record `Blocked: script unavailable`.

Do not automatically run full mutation testing. Mutation can be expensive and noisy. First read existing mutation reports if they exist. If fresh mutation evidence is needed, provide the exact manual command for the orchestrator or user to run instead of running the full suite yourself.

## Must answer

- Which tests genuinely prevent regressions?
- Which tests are surface coverage only?
- Which key paths lack useful tests?
- Which mocks make tests misleading?
- Which code has clear AI smell?
- Which code should be deleted rather than repaired?
- Which problems should be handed to Linus Gate as `Simplify`, `Delete`, or `Needs proof`?
- What is the severity and evidence level for every finding?

## Output format

Use `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md`.

Your source lane is:

```text
05-tests-ai-smell-dead-code
```

Do not give the final repo verdict. Hand findings to the orchestrator for dedupe, downgrade, merge, and final priority.
