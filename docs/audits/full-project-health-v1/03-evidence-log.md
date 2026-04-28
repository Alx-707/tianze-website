# Full Project Health Audit v1 - Evidence Log

## Preflight

| Evidence | Result |
| --- | --- |
| `docs/audits/full-project-health-v1/evidence/preflight.md` | Package readiness passed, audit target fixed to `origin/main @ 3ea482b53ca8db35f534f495211450d94bee963a`, business-code diff zero |
| `docs/audits/full-project-health-v1/run-metadata.md` | Run metadata recorded |

## Lane 00 - Baseline / runtime truth

Report: `docs/audits/full-project-health-v1/lanes/00-baseline-runtime.md`

Key evidence:

- `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/baseline-env.txt`
- `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/clean-baseline-proof.txt`
- `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/post-build-clean-baseline-proof.txt`
- `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-type-check.txt`
- `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-lint-check.txt`
- `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-test.txt`
- `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-build.txt`
- `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-build-cf.txt`
- `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/pnpm-quality-gate-fast.txt`
- `docs/audits/full-project-health-v1/evidence/00-baseline-runtime/credential-presence.txt`

Decisive facts:

- Local Node/pnpm matched project and CI pins: Node `v20.19.0`, pnpm `10.13.1`.
- `pnpm build` and `pnpm build:cf` passed serially.
- Cloudflare deploy/auth and post-deploy smoke were blocked/not-run.

## Lane 01 - Architecture / coupling

Report: `docs/audits/full-project-health-v1/lanes/01-architecture-coupling.md`

Key evidence:

- `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-arch-metrics.txt`
- `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-arch-hotspots.txt`
- `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-arch-conformance.txt`
- `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-dep-check.txt`
- `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-review-architecture-truth.txt`
- `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/product-market-coupling.txt`
- `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/locale-hardcoding.txt`
- `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/route-config-coupling.txt`
- `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/legacy-marker-audit.md`
- `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/cache-client-boundaries.txt`

Decisive facts:

- `dep:check` passed with 1 warning.
- Product market, locale, route, and legacy fallback risks are static/change-cost risks, not confirmed runtime outages.

## Lane 02 - Security / trust boundary

Report: `docs/audits/full-project-health-v1/lanes/02-security-trust-boundary.md`

Key evidence:

- `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/security-semgrep.txt`
- `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/security-audit.txt`
- `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/security-csp-check.txt`
- `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/lint-pii.txt`
- `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/vitest-security-core.txt`
- `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/vitest-api-security.txt`
- `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/rg-subscribe-tests.txt`
- `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/validate-config-production-env.txt`

Decisive facts:

- No P0/P1 security issue was confirmed.
- Subscribe route has weaker route-level proof than contact/inquiry.
- Runtime CSP proof was blocked by lane build restrictions.

## Lane 03 - UI / performance / accessibility

Report: `docs/audits/full-project-health-v1/lanes/03-ui-performance-accessibility.md`

Key evidence:

- `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/button-touch-targets.txt`
- `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/mobile-navigation-touch-targets.txt`
- `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/mobile-navigation-interactive.txt`
- `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/sticky-family-nav-touch-targets.txt`
- `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/e2e-axe-helper.txt`
- `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/homepage-axe-usage.txt`
- `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/navigation-axe-usage.txt`
- `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/targeted-vitest-a11y-responsive.txt`
- `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/local-port-3000-check.txt`
- `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/next-artifacts-scan.txt`

Decisive facts:

- Targeted component/responsive/a11y Vitest passed.
- Baseline browser-level a11y proof was weak because axe helper did not assert; repair wave tightened the helper to fail on relevant axe violations and pass selector context/options.
- Screenshots/Lighthouse were blocked by lack of server/runtime target in lane.

## Lane 04 - SEO / content / conversion

Report: `docs/audits/full-project-health-v1/lanes/04-seo-content-conversion.md`

Key evidence:

- `docs/audits/full-project-health-v1/evidence/04-seo-content-conversion/static-seo-implementation-scan.txt`
- `docs/audits/full-project-health-v1/evidence/04-seo-content-conversion/conversion-trust-static-scan.txt`
- `docs/audits/full-project-health-v1/evidence/04-seo-content-conversion/targeted-seo-vitest.txt`
- `docs/audits/full-project-health-v1/evidence/04-seo-content-conversion/public-asset-existence.txt`

Decisive facts:

- SEO implementation targeted tests passed.
- Google-side facts remain blocked.
- Highest P1 issues came from buyer-facing trust assets and public copy consistency.

## Lane 05 - Tests / AI smell / dead code

Report: `docs/audits/full-project-health-v1/lanes/05-tests-ai-smell-dead-code.md`

Key evidence:

- `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/pnpm-test.txt`
- `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/pnpm-unused-check.txt`
- `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/pnpm-quality-gate-fast.txt`
- `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/check-mutation-required.txt`
- `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/mock-scan.txt`
- `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/surface-assertion-scan.txt`
- `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/package-mutation-scripts.txt`
- `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/ui-primitive-tests.txt`
- `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/ui-primitive-source-files.txt`

Decisive facts:

- Full Vitest suite passed.
- Inquiry validation proof is overstated because route tests mock the schema.
- Mutation guard command recommendation can drift from package scripts.

## Runtime proof addendum / Contact preview 500 debug

Reports:

- `docs/audits/full-project-health-v1/05-runtime-proof-addendum.md`
- `docs/audits/full-project-health-v1/06-contact-preview-500-debug.md`

Key evidence:

- `docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/deploy-phase6-preview-envfile.txt`
- `docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/smoke-cf-deploy-gateway-workers.txt`
- `docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/serial-preview-smoke-equivalent.txt`
- `docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/local-next-contact-control.txt`
- `docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/secret-list-web-preview-config.txt`
- `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/live-gateway-contact-reprobe.txt`
- `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/tail-web-json.txt`
- `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/tail-gateway-pretty.txt`
- `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/local-next-dev-contact-control.txt`
- `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/next-build-debug-prerender.txt`

Decisive facts:

- Preview phase6 deploy can run with `<redacted-main-repo-env-file>`.
- Baseline preview gateway returned 500 for `/en/contact` and `/zh/contact`, while `/en`, `/zh`, `/api/health`, products, about, legal, and OEM routes returned 200 in targeted probes.
- Repair-wave preview route smoke now returns 200 for `/en/contact` and `/zh/contact`; see `docs/audits/full-project-health-v1/07-repair-closure.md`.
- Gateway tail is `Ok`; web worker tail logs Next Cache Components `blocking-route` for `/[locale]/contact`.
- Local `next dev` and `next start` controls return 200 for contact routes.
- Preview workers currently prove only `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`; real external lead delivery remains blocked by missing Resend/Airtable/Turnstile secrets.

## Blocked evidence classes

| Evidence class | Status | Needed next |
| --- | --- | --- |
| Cloudflare preview deploy/auth | Proved for route smoke | preview deployed with explicit redacted env-file proof |
| Preview post-deploy smoke | Passed after repair | `/en/contact` and `/zh/contact` return 200 |
| Cloudflare production deploy/auth | Blocked | production deploy not run |
| Production post-deploy smoke | Blocked | production URL smoke from target commit |
| Search Console | Blocked | export or dashboard evidence |
| URL Inspection | Blocked | URL Inspection output for key pages |
| CrUX/PageSpeed field data | Blocked | API/export evidence |
| Lighthouse lab data | Blocked | built server or approved preview URL |
| Real external delivery | Blocked | non-production Resend/Airtable/Turnstile smoke |
| Full mutation | Blocked | explicit manual/orchestrator authorization |
