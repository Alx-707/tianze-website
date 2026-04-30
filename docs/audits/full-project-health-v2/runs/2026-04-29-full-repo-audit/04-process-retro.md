# Full Project Health Audit v2 - Process Retro

Run id: `2026-04-29-full-repo-audit`

## What produced useful signal

- Running the v2 audit kit before lane work prevented stale claims from becoming high-severity findings.
- Rebuilding the exact runtime model for Contact SEO was useful: `curl` alone did not show the duplicate tags, but Playwright DOM did.
- The installed Next.js docs under `node_modules/next/dist/docs/` were necessary for the `middleware` vs `proxy` finding.
- Existing architecture scripts produced high-signal reports: dependency conformance, metrics, hotspots, and architecture truth.
- Release smoke was useful for proving that the Contact SEO issue is not the same as "contact page totally broken".

## What produced noise or needs care

- `reports/` contains many historical generated files. Only current timestamped artifacts should be cited as current evidence.
- `reports/playwright-results.json` is overwritten by later Playwright runs. Keep command output summaries in the audit log when a failing run is followed by a passing smoke run.
- `project-profile.md` being stale can mislead the auditor before any code is read.
- `pnpm build` and `pnpm build:cf` both touch build artifacts. Keep them serial.

## Stop lines respected

- No business code was edited.
- No dependency/config/workflow/content repair was made.
- No production deploy or external mutating command was run.
- No P0/P1 was promoted from old reports.
- Blocked external proof stayed blocked instead of being guessed.

## Recommended next audit improvement

1. Update `project-profile.md` before the next full run.
2. Add a stable command-output capture helper under the audit run folder, so failing E2E logs are not overwritten by later Playwright runs.
3. Decide whether `review:mutation:critical` should exist. If yes, restore it; if not, remove the package script.
4. Add an explicit SEO metadata env-contract test for build/start base URL consistency.
5. Add a one-main-landmark regression check for composed App Router pages.
6. Expand production/public-launch validation so fake-looking phone numbers and sample product assets cannot pass release readiness.
