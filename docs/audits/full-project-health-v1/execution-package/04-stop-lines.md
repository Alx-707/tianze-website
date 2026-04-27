# Stop Lines

Stop instead of expanding the audit when any of these happen:

1. base branch / commit is unclear
2. whether dirty work is included is unclear
3. current worktree has unexpected business-code changes relative to `origin/main` clean baseline
4. execution package is uncommitted, so workers would not share one package commit
5. a planned command references a package script that is missing or renamed
6. Node / pnpm environment is incompatible
7. build fails and cannot be classified as project, environment, or credential issue
8. Cloudflare, Google, Resend, Airtable, or dashboard credentials are missing for a claim that needs them
9. a worker wants to fix code
10. a worker crosses lane scope
11. P0/P1 lacks fresh evidence
12. P0/P1 uses `Strong hypothesis`, `Weak signal`, `Blocked`, or `low` confidence
13. old reports and fresh evidence conflict
14. required package files are missing or differ across workspaces
15. a worker tries to permanently delete files

## Required handling

When a stop line is hit:

1. record the conflict
2. mark the claim `Blocked` or `Needs proof`
3. do not force a final conclusion
4. ask the orchestrator to decide whether to continue, narrow scope, or wait for credentials/checkpoint

If README, report contract, preflight contract, stop lines, lane template, or lane prompt is missing, stop with:

```text
Blocked: audit execution package unavailable or incomplete.
```

If package readiness proof shows uncommitted package files, stop with:

```text
Blocked: audit execution package is not committed; do not dispatch workers.
```

If clean baseline proof shows business-code diff, stop with:

```text
Blocked: business-code diff exists relative to origin/main clean baseline.
```

Never permanently delete files. Do not use `rm`, `rmdir`, `unlink`, `find -delete`, `git clean`, or similar irreversible deletion commands.
