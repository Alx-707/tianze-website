# Create Pull Request

Automate the full PR lifecycle: preflight → self-heal → Codex review → commit → push → PR → CI + cloud review monitoring → merge → cleanup.

## Execution Steps

### Phase 1: Pre-checks

1. **Verify Branch**: Ensure NOT on `main`. Feature/hotfix branches only.

2. **Check Changes**: Run `git status` to identify staged/unstaged changes.
   - If changes exist: proceed to step 3.
   - If no changes and no unpushed commits: abort with "Nothing to submit".
   - If no changes but unpushed commits exist: skip to Phase 5 (Push).

3. **AI Slop Check**: Review the diff (`git diff` + `git diff --cached`) and remove AI-generated slop:
   - Extra comments that a human wouldn't add or are inconsistent with the rest of the file
   - Unnecessary defensive checks or try/catch blocks (especially if called by trusted codepaths)
   - Casts to `any` to get around type issues
   - Any style inconsistent with the file's existing patterns
   - If slop found: fix it before proceeding. If clean: proceed.

### Phase 2: Preflight

4. **Run `pnpm ci:local:quick`**: Full local validation (type-check, lint, format, tests, build, translations, quality-gate:fast, architecture, security audit).
   - If passes: proceed to Phase 4 (Codex Review).
   - If fails: proceed to Phase 3 (Self-Heal).

### Phase 3: Self-Heal (max 3 attempts)

5. **Classify failure**: Read the error output and classify each failure:

   | Check | Auto-fixable? | Fix Strategy |
   |-------|---------------|--------------|
   | Prettier | Yes | `pnpm format:write` |
   | ESLint | Partially | `pnpm lint:fix` + manual fix remaining |
   | TypeScript | Yes (usually) | Analyze and fix type errors |
   | Tests | Yes (usually) | Read output, fix failing tests |
   | Build (imports) | Yes | Fix import paths |
   | Build (runtime) | Depends | Case-by-case analysis |
   | i18n/translation/shape/slug | Partially | Missing keys: yes. Content issues: no |
   | PII log leak | Yes | Apply sanitize functions |
   | Architecture (barrel/circular) | **No** | **Abort** — report to user |
   | Security audit | **No** | **Abort** — NEVER auto-upgrade deps |
   | Node/pnpm version | **No** | **Abort** — environment issue |
   | Quality gate | Depends | Fix the underlying check |

6. **Fix and retry**: Apply fixes for auto-fixable failures, then re-run `pnpm ci:local:quick`.
   - If passes: proceed to Phase 4.
   - If same failure after 3 attempts: **abort** with diagnosis report.
   - If non-auto-fixable failure: **abort immediately** with diagnosis report.

### Phase 4: Codex Semantic Review

7. **Generate review prompt and call Codex**: Run the following via Bash:

   ```bash
   python3 ~/.claude/skills/collaborating-with-codex/scripts/codex_bridge.py \
     --cd "$(pwd)" \
     --sandbox read-only \
     --PROMPT "<review_prompt>"
   ```

   The `<review_prompt>` must include:

   ```
   You are performing an independent code review of recent changes in this repository.

   Step 1: Understand context
   - Read CLAUDE.md and .claude/rules/*.md for project conventions
   - Understand this is a production Next.js 16 project (solo dev)

   Step 2: Understand changes
   - Run: git diff main...HEAD
   - Read all modified/added files

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
   ```

8. **Triage Codex findings**: Parse the response and categorize each finding:

   | Category | Default Action |
   |----------|---------------|
   | Bug / correctness error | **Must fix** |
   | Security vulnerability (critical/high) | **Must fix** |
   | Security vulnerability (medium/low) | **Evaluate** |
   | Missing test coverage | **Evaluate** — real gap or over-testing? |
   | Code quality / refactor | **Evaluate** — proportional benefit? |
   | Style / preference | **Accept only if** aligned with `.claude/rules/` |
   | Irrelevant to project | **Reject** |

   Present triage table to user. Wait for acknowledgment. Fix accepted items.

   After fixing, if changes were made, re-run `pnpm ci:local:quick` (with self-heal if needed) to ensure fixes don't break anything.

### Phase 5: Commit & Push

9. **Stage & Commit**: Run `git add -A`, then generate a conventional commit message:
   - Format: `<type>(<scope>): <description>`
   - Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`
   - Subject: ≤50 chars, lowercase, imperative mood
   - Body: required, bullet points with `- ` prefix
   - Execute `git commit` with HEREDOC message.

10. **Push**: Since preflight already passed, use dedup:
    ```bash
    RUN_FAST_PUSH=1 git push -u origin <current-branch>
    ```
    This skips redundant lefthook pre-push checks (build, quality-gate, arch, security) that preflight already validated. `translation-check` still runs (~2s).

### Phase 6: Create PR

11. **Create PR**: Execute `gh pr create --base main --fill`.

12. **Report**: Output the PR URL.

### Phase 7: CI & Cloud Review Monitoring (skip if `--no-auto`)

13. **Wait for CI**: Poll with `gh pr checks <pr-number> --watch`.
    - If all checks pass → continue to step 14.
    - If any check fails → report which check failed, **stop here**.

14. **Wait for cloud reviews**: Check ALL review sources:
    ```bash
    # Check for CodeRabbit and Gemini review comments
    gh api graphql -f query='
      query($owner:String!, $repo:String!, $pr:Int!) {
        repository(owner:$owner, name:$repo) {
          pullRequest(number:$pr) {
            reviews(first:10) { nodes { author { login } state } }
            reviewThreads(first:100) {
              nodes { isResolved comments(first:1) { nodes { author { login } body } } }
              pageInfo { hasNextPage endCursor }
            }
          }
        }
      }
    ' -f owner=Alx-707 -f repo=tianze-website -F pr=<number>
    ```
    - If reviews present with no unresolved blocking threads → report summary, proceed to step 15.
    - If no reviews after 10 minutes → report to user with 3 options:
      1. Continue waiting
      2. Merge without cloud review
      3. Abort
    - If unresolved threads exist → report and suggest `/review-fix`.

15. **Merge decision**: Present review summary to user. Wait for explicit "merge" confirmation.

### Phase 8: Merge & Cleanup (only after user confirms merge)

16. **Merge**: Execute `gh pr merge <pr-number> --squash`.

17. **Switch to main**: `git checkout main`

18. **Pull latest**: `git pull origin main`

19. **Delete local branch**: `git branch -d <branch-name>`

20. **Prune remote refs**: `git remote prune origin`

21. **Final Report**:
    - PR URL and merge status
    - Branch cleanup confirmation
    - Current state: on `main`, up to date

## Options

- `--no-auto`: Stop after PR creation (Phase 6). Skip CI/review monitoring and merge.

## Example Usage

```
/pr                    # Full lifecycle: preflight → review → PR → CI → merge → cleanup
/pr --no-auto          # Stop after PR creation (manual merge later)
```

## Failure Behavior

- **Preflight fails 3x**: Abort with diagnosis. User decides next step.
- **Non-auto-fixable failure**: Abort immediately (architecture, security audit, env issues).
- **Codex review finds critical/high**: Must fix before proceeding.
- **CI fails**: Report failure, stop. User fixes and re-runs `/pr`.
- **Cloud review timeout**: User chooses (wait / merge without review / abort).
- **Unresolved review threads**: Suggest `/review-fix`.

## Observability

After the PR lifecycle completes (or aborts), append a JSON line to `reports/automation-loop.jsonl`:

```bash
mkdir -p reports
echo '{"ts":"<ISO-8601>","command":"pr","branch":"<branch>","preflight_pass":<true|false>,"self_heal_rounds":<0-3>,"codex_findings":<count>,"codex_accepted":<count>,"pr_number":<number|null>,"ci_pass":<true|false|null>,"cloud_reviews":{"coderabbit":<true|false|null>,"gemini":<true|false|null>},"unresolved_threads":<count|null>,"outcome":"<merged|created|aborted|failed>"}' >> reports/automation-loop.jsonl
```

This file is gitignored (`reports/` in `.gitignore`). Used for tracking automation effectiveness over time.

## Notes

- GitHub Flow: all branches merge to `main` via PR
- No auto-merge: all PRs require explicit merge after review
- Codex review uses `collaborating-with-codex` bridge in read-only sandbox
- If re-running `/pr` on existing PR branch, it pushes new commits to update the PR
