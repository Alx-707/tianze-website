# Full Project Health Audit v2 Framework

This file records how this repo uses the global `$repo-health-audit` skill.

The generic method lives outside the repo as an installed local skill. Use the installed copy for the agent running the audit:

```text
Codex: $HOME/.codex/skills/repo-health-audit/
Claude Code: $HOME/.claude/skills/repo-health-audit/
```

This repo should not duplicate the whole skill. It keeps only project-specific adapters and run outputs under this directory:

```text
docs/audits/full-project-health-v2/
```

## Intended layering

```text
global skill: lifecycle, evidence contract, lanes, templates, validation scripts
project adapter: Tianze stack, commands, write scopes, credential blockers
single run: fresh evidence, lane reports, final report, findings JSON, retro
```

## Rules retained from v1

- Preflight happens before audit work.
- Runtime truth is collected early, not after all lanes finish.
- P0/P1 requires fresh evidence from the current run.
- Blocked is not confirmed.
- Audit output and business-code repair should be separate PRs by default.
- Workers write only assigned reports and evidence.
- `pnpm build` and `pnpm build:cf` must not run in parallel.
