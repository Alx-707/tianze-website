# Tianze current status

Last refreshed: 2026-05-05

This is the first document agents should read before producing a new quality,
launch, or repair report.

Older audits and plans are useful as evidence, but they are not current truth by
default. If this file conflicts with an older `final`, `current`, or
`authoritative` report, re-run the relevant check before copying the old claim.

## Current snapshot

| Area | Current status |
| --- | --- |
| Branch | `main` aligned with `origin/main`; working tree may contain docs-slimming edits |
| Latest checked commit | `bad8dc58 Fix deep review lead reliability findings` |
| TypeScript / TSX tracked lines | 131,007 total |
| Production TS / TSX lines | 39,087 |
| Test / helper TS / TSX lines | 91,920 |
| TS files | 456 |
| TSX files | 273 |
| Test / helper files | 407 |
| Production typed `any` usage | 0 matches for typed `any` patterns outside test/helper files |
| Test / helper typed `any` usage | 100 matches |
| TODO / FIXME in `src`, `tests`, `scripts` | 4 matches |

These numbers are a fresh local snapshot, not a permanent score. Recount before
using them in a new public report.

## Fresh checks from this refresh

| Check | Result | Meaning |
| --- | --- | --- |
| `pnpm content:readiness` | Passed | Live content readiness check has no findings. |
| `pnpm validate:config` | Passed | Production configuration contract is valid for the checked environment. |
| `pnpm validate:launch-content` | Failed as expected | Public launch still waits on owner-confirmed phone, logo, and product photos. |
| Lead partial-success tests | Passed, 7 tests | Mail/CRM partial-success recovery is no longer the old unhandled gap. |
| SEO config + sitemap tests | Passed, 32 tests | Current sitemap and single-site SEO unit coverage is green. |
| `pnpm test:mutation:idempotency` | Failed | The mutate glob points at `src/lib/idempotency/**/*.ts`, but current files are `src/lib/idempotency*.ts`; no tests were executed. |

Do not convert the expected `validate:launch-content` failure into a generic
quality failure. It is the launch asset gate doing its job.

## Deep review closure status

Current truth for the 2026-05-05 deep review closure:

- `waitForCompletion` is not unbounded. Current code has a 10 second polling
  timeout and returns `IDEMPOTENCY_REQUEST_TIMEOUT` on timeout.
- Logo assets remain pending, but the header does not render a broken logo
  image while `brandAssets.logo.status` is `pending`; it renders text fallback.
- Rate limiting is fixed-window by design. Redis uses `PEXPIRE NX`; memory store
  mirrors that behavior.
- `withTimeout` bounds waiting time but does not cancel downstream Resend or
  Airtable side effects unless those integrations later accept abort signals.
- Newsletter subscription records marketing consent as opt-in at submission.
- `getEmailStats()` is explicitly unsupported; it must not be read as real
  telemetry.

## Stale claims to avoid copying

| Old claim | Current reading |
| --- | --- |
| "The logo path causes a broken header image." | Logo assets are still pending, but the header now falls back to text. Pending logo should be treated as a launch asset gap, not as a confirmed broken image claim. |
| "The fake phone is publicly visible." | The placeholder phone is guarded by `getPublicContactPhone()` and should not be emitted to buyer-facing runtime surfaces. Launch is still blocked until the owner supplies a real public phone or decides to keep phone hidden. |
| "`Sample Product` is live buyer-facing content." | Current live scans no longer show `Sample Product` outside archived content. Grep hits under `content/_archive/` are historical content, not runtime product content. |
| "Mail succeeds but CRM failure has no recovery path." | Current characterization tests cover partial-success recovery and owner logging. Re-test before reopening this as active. |
| "`review:mutation:critical` is missing." | The script exists. The active problem is that the idempotency mutation target path no longer matches current files. |
| "The 2026-04-29 audit numbers are current." | They are historical. Use the fresh counts above or recount. |

## Current true issues

| Priority | Issue | Current accurate wording |
| --- | --- | --- |
| P1 | Launch owner assets | Owner-confirmed public phone, final logo files, and real product photos are still missing. `validate:launch-content` intentionally fails until these are supplied or explicitly waived. |
| P1 | Deployed lead proof | Local and dry-run proof is stronger than before, but real deployed Airtable / Resend / Turnstile canary proof still depends on deployment context and credentials. Do not claim the deployed inquiry chain is proven unless that run is attached. |
| P2 | Critical mutation lane | `review:mutation:critical` exists, but it fails immediately through `test:mutation:idempotency` because the mutate glob targets a non-existent directory. |
| P2 | Local Cloudflare preview page routes | `TD-004` remains open: local Cloudflare preview page-route smoke can return 500 / worker-hung while `/api/health` stays OK. Deployed smoke is still the stronger runtime proof. |
| P2 | `middleware` to `proxy` migration | Next.js points toward `proxy`, but this repo keeps `src/middleware.ts` until the separate Cloudflare/OpenNext proof lane passes. Do not rename casually. |
| P2 | Historical docs pollution | Old audits, plans, prompts, and some `current/` handoff files can still mislead agents if read without this status file. Treat them as historical evidence unless a canonical guide points to them. |

## Where to look next

Current truth entry points:

- `docs/README.md`
- `docs/guides/POLICY-SOURCE-OF-TRUTH.md`
- `docs/guides/CANONICAL-TRUTH-REGISTRY.md`
- `docs/guides/QUALITY-PROOF-LEVELS.md`
- `docs/guides/RELEASE-PROOF-RUNBOOK.md`
- `docs/technical/technical-debt.md`
- `docs/audits/quality-uplift-closeout-2026-05-02.md`

Historical material that should not be used as current truth without
re-verification:

- `docs/audits/full-project-health-v2/runs/2026-04-29-full-repo-audit/`
- `docs/superpowers/plans/`
- `docs/superpowers/prompts/`
- old handoff files under `docs/superpowers/current/`

## Minimal refresh commands

Use these before updating this file or writing a fresh repo-health report:

```bash
pnpm content:readiness
pnpm validate:config
pnpm validate:launch-content
pnpm exec vitest run src/lib/lead-pipeline/__tests__/process-lead.characterization.test.ts src/lib/lead-pipeline/__tests__/partial-success-recovery.test.ts
pnpm exec vitest run src/config/__tests__/single-site-seo.test.ts src/app/__tests__/sitemap.test.ts
```

Use this when checking the mutation-lane issue:

```bash
pnpm test:mutation:idempotency
```

Expected current result: failure caused by the stale mutate glob until that
script is repaired.
