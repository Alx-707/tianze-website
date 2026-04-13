# Codex Semantic Review

**Mandatory** independent code review via Codex. Run after TDD is complete and before `/pr`.

Uses the official codex-cc plugin (`codex@openai-codex`) via `~/.claude/skills/codex/scripts/ask_codex.sh`.

Catches correctness bugs, security issues, and convention violations that tests alone miss. This is the "second pair of eyes" on the actual code written, separate from plan-level review (`/plan-review`).

## When to Run

- **Automatically**: After all TDD tasks complete in `subagent-driven-development` or `/afk`
- **Manually**: Any time you want a code review before submitting — `/review`
- **Mandatory before `/pr`**: `/pr` will **abort** if `/review` hasn't been run. This is a hard gate.

## Execution

### Step 1: Capture diff

```bash
git diff main...HEAD > /tmp/pr-review-diff.patch
git diff >> /tmp/pr-review-diff.patch
git diff --cached >> /tmp/pr-review-diff.patch
git diff main...HEAD --stat > /tmp/pr-review-files.txt
```

### Step 2: Call Codex

Only pass the diff and file list via `--file` (generated content Codex can't read from workspace). Project convention/source files — let Codex read from workspace itself via branch-aware prompt instructions.

```bash
~/.claude/skills/codex/scripts/ask_codex.sh \
  "<review_prompt>" \
  --file /tmp/pr-review-diff.patch \
  --file /tmp/pr-review-files.txt \
  --read-only \
  --reasoning high
```

The `<review_prompt>`:

```
You are a senior engineer performing an independent code review. Your job is NOT just to find bugs — it is to evaluate whether these changes make the project better or worse.

You are reviewing changes on branch '<current-branch>'.

Step 1: Understand context
- Read CLAUDE.md and .claude/rules/*.md for project conventions
- Understand this is a production Next.js 16 project (solo dev)

Step 2: Understand changes
- The diff is in /tmp/pr-review-diff.patch
- The changed files list is in /tmp/pr-review-files.txt
- Read all modified/added files directly from the workspace for full context

Step 3: Approach review (most important first)

## Is the approach right?
Before looking for bugs, ask: is this the right way to solve the problem?
- Does the change address root cause or just patch symptoms?
- Will this make the codebase more or less maintainable in 6 months?
- Are there simpler alternatives that achieve the same goal?
- Does the change create inconsistencies with how similar things work elsewhere in the codebase?
Only flag this if you have a concrete better alternative — not vague "could be improved."

## Cross-file consistency
Look beyond the diff. Read the FULL files that were changed, plus related files.
- Do values, labels, or data that appear in multiple places stay consistent?
- If a constant was changed in one place, was it updated everywhere?
- Do new components follow the same patterns as existing siblings?

## Correctness
- Logic errors, off-by-one, null/undefined handling
- API contracts and type safety
- ICU/i18n: do all translation strings with placeholders receive values?

## Security
- Input validation, auth issues, injection vulnerabilities
- Credential exposure, OWASP Top 10

## Test Coverage
- Untested critical paths or edge cases
- Tests must verify behavior (href, navigation), not just presence

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
| Wrong approach / architectural concern | **Flag to user** — this is a direction decision |
| Cross-file inconsistency | **Must fix** — these ship visible contradictions |
| Bug / correctness error | **Must fix** |
| Security vulnerability (critical/high) | **Must fix** |
| Security vulnerability (medium/low) | **Evaluate** |
| Missing test coverage | **Evaluate** — real gap or over-testing? |
| Code quality / refactor | **Evaluate** — proportional benefit? |
| Style / preference | **Accept only if** aligned with `.claude/rules/` |
| Irrelevant to project | **Reject** |

**Decision Authority: Claude holds final decision authority, not Codex.**

Codex is an adversarial reviewer — its job is to surface risks and blind spots. Claude's job is to independently evaluate each finding against the actual codebase, project constraints, and business intent. "Codex said so" is never sufficient reason to accept or reject a finding.

**For each finding, verify before deciding:**

- Read the relevant source code to confirm the issue actually exists
- Run commands if needed (trace data flow, check if function is called)
- Cross-reference with `.claude/rules/` and project conventions
- If Codex's suggestion conflicts with project reality, reject with reasoning

Decision criteria:
- **Fix**: Issue objectively verified in code
- **Reject**: Not reproducible, doesn't apply, or conflicts with project constraints — document why
- **Defer**: Real but fix cost exceeds benefit (add `<!-- TODO -->` comment)
- **Flag to user**: Business decisions only
- **Discuss**: Disagreement with Codex on approach — use `--session` for multi-round follow-up

### Step 4: Fix and re-verify

If fixes were made, re-run `pnpm ci:local:quick` to ensure nothing broke.

## Output

Report a summary:
- Number of findings by severity
- Which were fixed / rejected / deferred
- VERDICT: APPROVED or REVISE

### Review Completion Marker

After review is complete (regardless of verdict), write a marker file so `/pr` can verify:

```bash
mkdir -p reports
cat > .codex-review-done <<EOF
branch=$(git branch --show-current)
timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
verdict=<APPROVED|REVISE>
findings_fixed=<n>
findings_rejected=<n>
findings_deferred=<n>
EOF
```

This file is **gitignored** (not committed) — it's a local signal between `/review` and `/pr` within the same working tree. `/pr` checks for this file and verifies the branch matches.

## Relationship to Other Reviews

| Review | What it checks | Strength | Blind spot |
|--------|---------------|----------|------------|
| `/plan-review` | Is the plan sound? (direction) | Catches architectural errors before code is written | Can't verify runtime behavior |
| `/review` (this) | Is the approach right + is the code correct? | Deep data-flow tracing, approach evaluation | Focused on diff; may miss consistency in untouched files |
| Cloud reviews (CodeRabbit) | Full-file semantic consistency | Catches cross-file contradictions (e.g. badge vs description) | Shallow — flags patterns, doesn't trace logic |
| Cloud reviews (Gemini) | Type safety patterns | Good at spotting repeated type issues | Repetitive; low signal-to-noise on project conventions |

Four review layers across two phases (plan + code). None is sufficient alone.
