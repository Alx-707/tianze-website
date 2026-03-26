# Codex Semantic Review

Independent code review via Codex. Run after TDD is complete and before `/pr`.

Catches correctness bugs, security issues, and convention violations that tests alone miss. This is the "second pair of eyes" on the actual code written, separate from plan-level review (`/plan-review`).

## When to Run

- **Automatically**: After all TDD tasks complete in `subagent-driven-development` or `/afk`
- **Manually**: Any time you want a code review before submitting — `/review`
- **Required before `/pr`**: The `/pr` command will remind you if `/review` hasn't been run

## Execution

### Step 1: Capture diff

```bash
git diff main...HEAD > /tmp/pr-review-diff.patch
git diff >> /tmp/pr-review-diff.patch
git diff --cached >> /tmp/pr-review-diff.patch
git diff main...HEAD --stat > /tmp/pr-review-files.txt
```

### Step 2: Call Codex

```bash
~/.claude/skills/codex/scripts/ask_codex.sh \
  "<review_prompt>" \
  --file /tmp/pr-review-diff.patch \
  --file /tmp/pr-review-files.txt \
  --file CLAUDE.md \
  --read-only \
  --reasoning high
```

The `<review_prompt>`:

```
You are performing an independent code review of recent changes in this repository.

Step 1: Understand context
- Read CLAUDE.md and .claude/rules/*.md for project conventions
- Understand this is a production Next.js 16 project (solo dev)

Step 2: Understand changes
- The diff is in /tmp/pr-review-diff.patch
- The changed files list is in /tmp/pr-review-files.txt
- Read all modified/added files in the workspace for full context

Step 3: Review for these dimensions (skip irrelevant ones):

## Correctness
- Logic errors, off-by-one, null/undefined handling
- API contracts and type safety

## Security
- Input validation, auth issues, injection vulnerabilities
- Credential exposure, OWASP Top 10

## Test Coverage
- Untested critical paths or edge cases
- Tests must verify behavior (href, navigation), not just presence

## Code Quality
- Maintainability, readability, modularity
- Consistency with project patterns

## Project Conventions
- Check against .claude/rules/ (Server Components first, i18n required, no any, etc.)
- Do NOT impose conventions the project doesn't use

For each issue: file path, line number, severity (critical/high/medium/low), category, description, suggested fix.
Organize by severity. End with summary.
Only flag issues you are confident about.
If all changes are solid, end with: VERDICT: APPROVED
If issues need fixing, end with: VERDICT: REVISE
```

### Step 3: Triage findings

| Category | Default Action |
|----------|---------------|
| Bug / correctness error | **Must fix** |
| Security vulnerability (critical/high) | **Must fix** |
| Security vulnerability (medium/low) | **Evaluate** |
| Missing test coverage | **Evaluate** — real gap or over-testing? |
| Code quality / refactor | **Evaluate** — proportional benefit? |
| Style / preference | **Accept only if** aligned with `.claude/rules/` |
| Irrelevant to project | **Reject** |

**For each finding, verify before deciding:**

- Read the relevant source code to confirm the issue exists
- Run commands if needed (trace data flow, check if function is called)
- Cross-reference with `.claude/rules/`

Decision criteria:
- **Fix**: Issue objectively verified in code
- **Reject**: Not reproducible or doesn't apply
- **Defer**: Real but fix cost exceeds benefit (add `<!-- TODO -->` comment)
- **Flag to user**: Business decisions only

### Step 4: Fix and re-verify

If fixes were made, re-run `pnpm ci:local:quick` to ensure nothing broke.

## Output

Report a summary:
- Number of findings by severity
- Which were fixed / rejected / deferred
- VERDICT: APPROVED or REVISE

## Relationship to Other Reviews

| Review | What it checks | When |
|--------|---------------|------|
| `/plan-review` | Is the plan sound? (direction) | Before TDD |
| `/review` (this) | Is the code correct? (result) | After TDD, before `/pr` |
| Cloud reviews (CodeRabbit, Gemini) | External perspective | After PR created |
