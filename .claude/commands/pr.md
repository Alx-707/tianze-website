# Create Pull Request

Automate the Git PR workflow: commit, push, create PR, and enable auto-merge.

## Execution Steps

1. **Verify Branch**: Ensure NOT on `main` or `develop`. Feature/hotfix/release branches only.

2. **Check Changes**: Run `git status` to identify staged/unstaged changes.
   - If no changes, abort with "No changes to commit".

3. **Stage Changes**: Run `git add -A` to stage all changes.

4. **Generate Commit Message**: Analyze changes and generate a conventional commit message:
   - Format: `<type>(<scope>): <description>`
   - Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`
   - Subject: ≤50 chars, lowercase, imperative mood
   - Body: required, bullet points with `- ` prefix
   - Footer: `Co-Authored-By: <Model Name> <noreply@anthropic.com>`

5. **Commit**: Execute `git commit` with HEREDOC message.

6. **Push**: Execute `git push -u origin <current-branch>`.

7. **Create PR**: Execute `gh pr create --base develop --fill`.
   - Feature branches PR to `develop`
   - Hotfix branches: use `gitflow:finish-hotfix` instead

8. **Enable Auto-merge**: Execute `gh pr merge --auto --squash` (default behavior).
   - Use `--no-auto` flag to skip auto-merge.

9. **Return**: Output the PR URL for user reference.

## Options

- `--no-auto`: Skip auto-merge (manual merge required)
- `--draft`: Create as draft PR (no auto-merge)

## Example Usage

```
/pr                    # Standard PR flow with auto-merge enabled
/pr --no-auto          # PR without auto-merge
/pr --draft            # Create draft PR
```

## Notes

- GitFlow model: feature branches merge to `develop`, not `main`
- Use `gitflow:finish-feature` for local merge workflow (alternative to PR)
- Auto-merge uses GitHub's native feature (requires "Allow auto-merge" in repo settings)
