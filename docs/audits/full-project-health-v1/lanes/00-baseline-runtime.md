# Lane 00 - Baseline / Runtime Truth

## 1. Scope

Lane 00 only checked the audit baseline and local runtime/build truth for:

- Git target and clean business-code baseline.
- Local Node/pnpm compatibility.
- Local Next build truth from type-check, lint, unit tests, static truth checks, quality gate, and `pnpm build`.
- Local Cloudflare build truth from `pnpm build:cf` and generated OpenNext artifacts.
- What is not proven: Cloudflare account/deploy/auth truth and post-deploy smoke truth.

This lane did not deploy, did not run production-writing commands, and did not change business code intentionally.

## 2. Fresh Evidence Collected

| Evidence ID | Type | Exact reference | Result | Notes |
| --- | --- | --- | --- | --- |
| E-L00-001 | command | `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/baseline-env.txt` | `node v20.19.0`, `pnpm 10.13.1`, `HEAD 3ea482b53ca8db35f534f495211450d94bee963a`, `origin/main 3ea482b53ca8db35f534f495211450d94bee963a` | `git status` also showed audit artifacts from this and other lanes; no business-code conclusion comes from raw status alone. |
| E-L00-002 | command | `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/clean-baseline-proof.txt` | Business-code diff relative to `origin/main` was empty before validation commands | Uses the preflight exclusion pattern for audit artifacts. |
| E-L00-003 | command | `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/post-build-clean-baseline-proof.txt` | Business-code diff relative to `origin/main` was still empty after builds | Confirms prebuild-generated files did not create tracked source diffs. |
| E-L00-004 | file | `package.json:5-12` | Project requires Node `>=20.19 <23` and pnpm `>=10.13.1 <11`; package manager is `pnpm@10.13.1` | Current local versions match. |
| E-L00-005 | file | `.github/workflows/ci.yml:30-41` | CI pins pnpm `10.13.1` and Node `20.19.0` | Local versions match the main CI baseline. |
| E-L00-006 | command | `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-type-check.txt` | Passed | TypeScript baseline is green. |
| E-L00-007 | command | `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-lint-check.txt` | Passed | ESLint baseline is green with `--max-warnings 0`. |
| E-L00-008 | command | `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-test.txt` | Passed: 376 test files, 5208 tests | This is the full `pnpm test` command log. |
| E-L00-009 | command | `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-truth-check.txt` | Passed: 9 page routes, 5 API routes, 5 workflow files, 148 package scripts; no broken links or orphaned files | Static truth check only; not a page runtime smoke. |
| E-L00-010 | command | `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-dep-check.txt` | Exit 0 with 1 dependency-cruiser warning | Warning: `src/lib/utm.ts -> src/lib/cookie-consent/index.ts`. |
| E-L00-011 | command | `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-unused-check.txt` | Passed | `knip` did not report unused files/dependencies in this mode. |
| E-L00-012 | command / report | `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-security-semgrep.txt`; `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/semgrep-error-latest.json`; `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/semgrep-warning-latest.json` | Semgrep ERROR findings: 0; WARNING findings: 2 | Warning details copied into this lane evidence root. |
| E-L00-013 | command / report | `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-quality-gate-fast.txt`; `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/quality-gate-fast.json` | Passed: code quality and security gates passed; coverage/performance skipped by fast mode | Fast mode is not full CI coverage/performance proof. |
| E-L00-014 | command | `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-build.txt` | Passed: Next.js 16.2.3 Turbopack build compiled and generated 53 static pages | Build emitted a Next.js middleware deprecation warning. |
| E-L00-015 | command | `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-build-cf.txt` | Passed: webpack Next build plus OpenNext Cloudflare bundle completed; `.open-next/worker.js` generated | `build:cf` was run after `pnpm build`, not in parallel. It moved prior `.next` into local artifact trash before rebuilding. |
| E-L00-016 | command | `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/post-build-artifacts.txt` | `.next` exists at 385M and `.open-next` exists at 33M; `.open-next/worker.js` and assets are present | Local artifact existence only; not deployment proof. |
| E-L00-017 | command | `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/credential-presence.txt` | Cloudflare, Vercel, Resend, Airtable, Turnstile, and Server Actions secret env vars were absent in this shell | Values were not printed, only presence/absence. |
| E-L00-018 | file | `.claude/rules/cloudflare.md:17-57` | Project rule requires serial `pnpm build` / `pnpm build:cf`, separates build proof from page proof, and currently keeps `src/middleware.ts` as the Cloudflare-compatible entry | Explains why local build truth must not be treated as deploy/smoke truth. |
| E-L00-019 | file | `open-next.config.ts:13-29`; `wrangler.jsonc:23-27` | Cloudflare build uses split `apiLead` function, OpenNext minify disabled, and assets bound from `.open-next/assets` | Static config evidence only. |

## 3. Commands Run

| Command | Result | Classification |
| --- | --- | --- |
| `node -v` | passed | diagnostic |
| `pnpm -v` | passed | diagnostic |
| `git status --short --branch` | passed | diagnostic |
| `git rev-parse --short HEAD` | passed | diagnostic |
| `git rev-parse HEAD` | passed | diagnostic |
| `git rev-parse origin/main` | passed | diagnostic |
| `git diff --name-only origin/main...HEAD -- ':!docs/audits/full-project-health-v1/**' ':!docs/superpowers/plans/2026-04-27-full-project-health-audit-v1-conductor.md' ':!.context/audits/full-project-health-v1/**'` | passed | required |
| `git status --short --untracked-files=all -- ':!docs/audits/full-project-health-v1/**' ':!docs/superpowers/plans/2026-04-27-full-project-health-audit-v1-conductor.md' ':!.context/audits/full-project-health-v1/**'` | passed | required |
| `pnpm type-check` | passed | required |
| `pnpm lint:check` | passed | required |
| `pnpm test` | passed | required |
| `pnpm truth:check` | passed | optional |
| `pnpm dep:check` | passed | optional |
| `pnpm unused:check` | passed | optional |
| `pnpm security:semgrep` | passed | optional |
| `pnpm quality:gate:fast` | passed | optional |
| `pnpm build` | passed | required |
| `pnpm build:cf` | passed | required |
| credential presence check via Node script | passed | diagnostic |
| `pnpm deploy:*` / Cloudflare deploy command | not-run | credential-blocked |
| post-deploy smoke against deployed URL | not-run | credential-blocked |

## 4. Findings

### FPH-L00-001: Baseline security scan is non-blocking but still has two Semgrep warning signals

- Severity: P2
- Evidence level: Confirmed by execution
- Confidence: medium
- Domain: security
- Source lane: 00-baseline-runtime
- Evidence:
  - type: command
    reference: `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-security-semgrep.txt`
    summary: `pnpm security:semgrep` exited 0 with `Semgrep ERROR findings: 0` and `Semgrep WARNING findings: 2`.
  - type: report
    reference: `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/semgrep-warning-latest.json`
    summary: Warnings are `object-injection-sink-computed-property` at `src/components/forms/lazy-turnstile.tsx:52` and `object-injection-sink-for-in-loop` at `src/lib/utm.ts:165`.
- Business impact: The site is not blocked from building, but two input/key-handling areas still need a human security read before launch confidence is claimed.
- Root cause: Semgrep WARNING rules are advisory in the current gate; the fast quality gate blocks on Semgrep errors, not these warning-level findings.
- Recommended fix: Lane 02 should inspect the two code paths and either validate key allowlisting/safe data shape or simplify the object iteration/key creation so the warning disappears without suppressing the rule.
- Verification needed: Re-run `pnpm security:semgrep` and confirm warning count is 0, or attach a narrow accepted-risk note with code-level proof.
- Suggested Linus Gate: Needs proof

### FPH-L00-002: Dependency check passes but reports one architecture warning

- Severity: P3
- Evidence level: Confirmed by execution
- Confidence: high
- Domain: architecture
- Source lane: 00-baseline-runtime
- Evidence:
  - type: command
    reference: `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-dep-check.txt`
    summary: `pnpm dep:check` exited 0 but reported `warn no-barrel-export-dependencies: src/lib/utm.ts -> src/lib/cookie-consent/index.ts`.
- Business impact: This is not a launch blocker, but it is a small coupling smell: a low-level tracking utility reaches through a barrel export, which can make future cleanup noisier.
- Root cause: The dependency-cruiser rule allows this as a warning instead of an error, so the issue can persist while the command remains green.
- Recommended fix: Lane 01 should confirm whether `src/lib/utm.ts` can import the needed cookie-consent module directly or whether the boundary rule should be adjusted with a documented exception.
- Verification needed: Re-run `pnpm dep:check` and confirm zero dependency-cruiser warnings, or document a deliberate exception in the architecture lane.
- Suggested Linus Gate: Simplify

### FPH-L00-003: Local builds pass but Next.js still warns that `middleware` is deprecated

- Severity: P3
- Evidence level: Confirmed by execution
- Confidence: high
- Domain: baseline
- Source lane: 00-baseline-runtime
- Evidence:
  - type: command
    reference: `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-build.txt`
    summary: `pnpm build` passed but emitted `The "middleware" file convention is deprecated. Please use "proxy" instead.`
  - type: command
    reference: `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-build-cf.txt`
    summary: `pnpm build:cf` passed and emitted the same deprecation warning.
  - type: file
    reference: `.claude/rules/cloudflare.md:53-57`
    summary: Current repo rule says `src/middleware.ts` is the Cloudflare-compatible entry and `src/proxy.ts` blocks `pnpm build:cf`.
- Business impact: Buyers are not affected today because both local builds pass, but the warning is a future upgrade pressure point. Treating it as "just rename the file" could break Cloudflare.
- Root cause: Next.js 16 prefers the newer `proxy` convention, while this repo has a recorded Cloudflare/OpenNext constraint that keeps `middleware.ts`.
- Recommended fix: Do not rename during this audit. If the project wants to remove the warning later, create a narrow proof plan that tests `proxy` against `pnpm build`, `pnpm build:cf`, local Cloudflare preview, and deployed smoke.
- Verification needed: Fresh proof from `pnpm build`, `pnpm build:cf`, `pnpm preview:cf`, and post-deploy smoke after any middleware/proxy migration.
- Suggested Linus Gate: Needs proof

## 5. Blocked / Not Proven

| Claim | Blocker | Needed proof | Suggested classification |
| --- | --- | --- | --- |
| Cloudflare deploy/auth truth | `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` were absent in this shell, and deploy commands are forbidden in this lane | A permitted deploy/auth proof from orchestrator or CI, with account/project/route evidence | Blocked |
| Post-deploy smoke truth | No fresh deployed URL smoke was run in this lane; `build:cf` is not deployed runtime proof | A safe deployed URL plus read-only page/API smoke evidence, or CI artifact from the target commit | Blocked |
| Full coverage/performance gate truth | `pnpm quality:gate:fast` intentionally skipped coverage and performance | `pnpm quality:gate:full`, CI coverage artifacts, or lane-specific performance evidence | Needs proof |
| Local Cloudflare preview page truth | `pnpm preview:cf` / `pnpm smoke:cf:preview:strict` were not in the user-approved Lane 00 command list for this run | Orchestrator-approved local preview command plus page/API smoke logs | Needs proof |
| Production third-party delivery truth for Resend/Airtable/Turnstile | Relevant service secrets were absent, and production-writing tests are out of scope | Safe test credentials and non-production mutation boundary, or dashboard/CI evidence | Blocked |

## 6. Handoff to Orchestrator

| Finding ID | Handoff action | Reason |
| --- | --- | --- |
| FPH-L00-001 | challenge | Semgrep warnings are real fresh evidence, but Lane 02 should decide whether they are real security risks or safe false positives. |
| FPH-L00-002 | dedupe | Architecture lane may already report the same dependency-cruiser warning; keep only one final finding if duplicated. |
| FPH-L00-003 | keep | This is useful baseline truth: build passes, warning exists, and current project rule says not to blindly migrate to `proxy`. |

## 7. Process Notes

- Current branch: `Alx-707/health-audit-v1`.
- Audit target and local HEAD both resolved to `3ea482b53ca8db35f534f495211450d94bee963a`.
- Node/pnpm are compatible with `package.json` and CI pins: local `node v20.19.0`, local `pnpm 10.13.1`.
- Local Next build truth: type-check, lint, full Vitest run, truth check, unused check, quality gate fast, and `pnpm build` all passed.
- Local Cloudflare build truth: `pnpm build:cf` passed and generated `.open-next/worker.js`.
- Cloudflare deploy/auth truth: blocked; no local Cloudflare credentials were present, and deploy was forbidden.
- Post-deploy smoke truth: blocked; no deployed URL smoke was run in this lane.
- Stale build artifact false red: not observed. `pnpm build:cf` moved the prior `.next` into `.trash-next-artifacts/...` and then completed a fresh webpack/OpenNext build.
- Raw `git status` showed evidence files from other lane workers. I did not modify or overwrite those files. Clean-baseline checks excluding audit artifacts printed no output before and after builds.
- This lane can serve as a trustworthy local baseline for other lanes, but only for local build/test/runtime artifact truth. It must not be stretched into "Cloudflare deploy passed" or "production site smoke passed."
