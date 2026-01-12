# Create Pull Request

Automate the Git PR workflow: commit, push, create PR, and enable auto-merge.

## Execution Steps

1. **Verify Branch**: Ensure NOT on `main` branch. If on `main`, abort with error message.

2. **Check Changes**: Run `git status` to identify staged/unstaged changes.
   - If no changes, abort with "No changes to commit".

3. **Stage Changes**: Run `git add -A` to stage all changes.

4. **Generate Commit Message**: Analyze changes and generate a conventional commit message:
   - Format: `<type>(<scope>): <description>`
   - Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`
   - Keep description concise (≤72 chars)

5. **Commit**: Execute `git commit -m "<message>"`.

6. **Push**: Execute `git push -u origin <current-branch>`.

7. **Create PR**: Execute `gh pr create --base main --fill`.

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

- Auto-merge uses GitHub's native feature (requires "Allow auto-merge" in repo settings)
- PR will automatically merge after CI passes
- Branch will be automatically deleted after merge (if enabled in repo settings)
