# Full Project Health Audit v2 - Quality Map

Run id: `2026-04-29-full-repo-audit`

## Lane map

| Lane | Status | Main proof | Main risk |
| --- | --- | --- | --- |
| 00 Baseline / runtime truth | Mostly green | build, build:cf, type, lint, tests, smoke | SEO E2E Contact failure |
| 01 Architecture / coupling | Green with drift | dependency conformance 0, metrics clean | `middleware`/`proxy` decision drift; stale audit profile |
| 02 Security / trust boundary | Green with hardening gap | Semgrep 0, audit 0, API/security tests pass | server-only rule applied inconsistently |
| 03 UI / performance / accessibility | Green locally with semantic debt | release smoke 45 passed, Lighthouse strong | one-main-landmark ownership issue; deployed field proof blocked |
| 04 SEO / content / conversion | Red for launch | i18n checks pass | Contact duplicate SEO tags; public placeholders |
| 05 Tests / AI smell / dead code | Green with process gap | 4307 unit tests pass, unused check pass | missing critical mutation review script; production config validation blind spot |

## Truth zones

### Confirmed by execution

- `pnpm type-check` passed.
- `pnpm lint:check` passed.
- `pnpm test` passed: 324 files / 4307 tests.
- `pnpm build` passed with middleware deprecation warning.
- `CF_APPLY_GENERATED_PATCH=true pnpm build:cf` passed with middleware deprecation warning.
- `pnpm truth:check` passed.
- `pnpm unused:check` passed.
- `pnpm dep:check` passed.
- `pnpm security:semgrep` passed with 0 findings.
- `pnpm security:audit` passed with no known production vulnerabilities.
- `pnpm quality:gate:fast` passed.
- `pnpm review:translation-quartet` passed.
- `pnpm review:translate-compat` passed.
- `pnpm review:architecture-truth` passed.
- `CI=1 pnpm test:release-smoke` passed.
- `pnpm validate:config` passed while buyer-facing placeholders still remain.
- Targeted Contact SEO E2E failed with duplicate canonical/hreflang.

### Confirmed by static evidence

- Placeholder phone and sample-product assets remain.
- Runtime source contains nested/multiple `<main>` landmarks under a layout that already owns `<main id="main-content">`.
- Existing tests assert that a main landmark exists but do not assert a single composed main landmark.
- `review:mutation:critical` points to a missing script.
- `project-profile.md` has stale versions and stale docs path.
- Repo Cloudflare rule still pins `src/middleware.ts` while Next docs say `proxy` is the renamed convention.
- Several sensitive server files do not include `import "server-only"`.

### Blocked

- Cloudflare preview/deployed proof.
- Google Search Console, URL Inspection, CrUX.
- Resend/Airtable real delivery proof.

## Hotspot map

High-change files from the current hotspot report:

1. `package.json`
2. `messages/en/critical.json`
3. `messages/zh/critical.json`
4. `messages/en.json`
5. `messages/zh.json`
6. `src/app/[locale]/contact/page.tsx`
7. `src/app/[locale]/products/[market]/page.tsx`
8. `.github/workflows/ci.yml`
9. `src/app/[locale]/layout.tsx`
10. `scripts/quality-gate.js`

Use this map to prioritize regression tests during repair waves.
