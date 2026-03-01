# Fix Review Feedback

Fetch unresolved PR review comments, categorize, fix, validate, and push.

## Execution Steps

### Phase 0: Branch Sync

1. **Identify PR**: Run `gh pr view --json number,url,headRefName` to get the current PR.
   - If no PR found: abort with "No open PR for current branch".

2. **Sync branch**: Ensure local branch is up to date:
   ```bash
   git fetch origin
   git merge --ff-only origin/<branch>
   ```
   - If ff-only fails (diverged): abort with "Branch diverged from remote. Resolve manually."

3. **Clean check**: Run `git status` to ensure no uncommitted changes.
   - If dirty: abort with "Uncommitted changes. Commit or stash first."

### Phase 1: Fetch Review Comments

4. **Fetch unresolved review threads via GraphQL** (with pagination):
   ```bash
   gh api graphql -f query='
     query($owner:String!, $repo:String!, $pr:Int!, $cursor:String) {
       repository(owner:$owner, name:$repo) {
         pullRequest(number:$pr) {
           reviewThreads(first:50, after:$cursor) {
             nodes {
               isResolved
               isOutdated
               path
               line
               comments(first:10) {
                 nodes {
                   author { login }
                   body
                   createdAt
                 }
               }
             }
             pageInfo { hasNextPage endCursor }
           }
         }
       }
     }
   ' -f owner=Alx-707 -f repo=tianze-website -F pr=<number>
   ```
   - Paginate if `hasNextPage` is true (use `endCursor` as cursor).
   - Filter: keep only `isResolved: false` and `isOutdated: false` threads.

5. **Fetch bot summary comments** (CodeRabbit / Gemini summaries in issue comments):
   ```bash
   gh api repos/Alx-707/tianze-website/issues/<number>/comments --jq '.[] | select(.user.login == "coderabbitai" or .user.login == "gemini-code-assist[bot]") | {author: .user.login, body: .body}'
   ```

6. **Report**: If no unresolved threads and no actionable bot comments → "No review feedback to address. PR is clean."

### Phase 2: Categorize & Fix

7. **Categorize each unresolved thread**:

   | Category | Action |
   |----------|--------|
   | Must-fix | Bug, security, correctness issue → fix |
   | Should-fix | Code quality, test gap, convention violation → fix |
   | Suggestion | Optional improvement → evaluate cost/benefit |
   | FYI | Informational, no action needed → skip |
   | Business decision | Requires user input → flag for user |

   Present categorization table to user. Wait for acknowledgment.

8. **Fix accepted items**: Address must-fix and should-fix items. For suggestions, fix only if low-cost and beneficial.

   For business-decision items: ask user for direction before proceeding.

### Phase 3: Validate & Push

9. **Oscillation check**: Check if this is a repeated review-fix cycle:
   ```bash
   git log --oneline -10 | grep "Review-Fix-Run:"
   ```
   - If `Review-Fix-Run: 3` or higher found in recent commits → warn user: "This is review-fix round 4+. Consider whether fixes are converging or oscillating."

10. **Run preflight**: `pnpm ci:local:quick`
    - If fails: self-heal (same logic as `/pr` Phase 3, max 3 attempts).
    - If still fails: abort with diagnosis.

11. **Commit**: Stage all changes and commit:
    - Format: `fix(review): address <reviewer> feedback`
    - Body: bullet points of what was fixed
    - Footer: `Review-Fix-Run: <N>` (increment from last review-fix commit, or `1` if first)
    - Execute `git commit` with HEREDOC message.

12. **Push**:
    ```bash
    RUN_FAST_PUSH=1 git push
    ```

13. **Report**:
    - Number of threads addressed
    - Items fixed vs skipped (with reasons)
    - Items flagged as business decisions
    - Next step: "CI will re-run. Cloud reviewers will re-review. Check back after CI passes."

## Example Usage

```
/review-fix            # Fetch and fix all unresolved review comments
```

## Observability

After completion (or abort), append a JSON line to `reports/automation-loop.jsonl`:

```bash
mkdir -p reports
echo '{"ts":"<ISO-8601>","command":"review-fix","branch":"<branch>","pr_number":<number>,"run_number":<N>,"threads_total":<count>,"threads_fixed":<count>,"threads_skipped":<count>,"threads_business":<count>,"preflight_pass":<true|false>,"self_heal_rounds":<0-3>,"outcome":"<pushed|aborted|no-action>"}' >> reports/automation-loop.jsonl
```

## Notes

- This command is for addressing review feedback on an existing PR
- Does NOT create a new PR — it pushes fix commits to the existing PR branch
- Reviewers (CodeRabbit, Gemini) will automatically re-review after new push
- If review feedback requires architectural changes, abort and discuss with user
- The `Review-Fix-Run: N` footer prevents infinite oscillation — if N ≥ 4, something is wrong
