# Preview Degraded Retirement Runbook

## Purpose

This runbook documents the migration path that was required to move the Cloudflare operator surface from **Route B stock + preview-degraded exception** to a fully stock preview/deploy model.

At the time of writing, the repository has already retired:

- phase6 deploy/generator/config skeleton
- server-actions secret legacy helper layer
- alias/shim checker + phase6 alias contract layer
- generated-artifact patch/checker/wrapper layer

At the time it was written, the only remaining active non-stock operator boundary was:

- `scripts/cloudflare/preview-degraded-contract.mjs`
- `scripts/cloudflare/check-preview-degraded-contract.mjs`

## Historical preview exception

Preview deploys previously relied on two degraded flags:

- `ALLOW_MEMORY_RATE_LIMIT=true`
- `ALLOW_MEMORY_IDEMPOTENCY=true`

And these preview placeholder secrets:

- `RATE_LIMIT_PEPPER`
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
- `TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `RESEND_API_KEY`
- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`

These were previously injected in `.github/workflows/cloudflare-deploy.yml` during preview verification and preview build.

## Retirement prerequisites

Do **not** retire the preview-degraded layer until preview environment has real equivalents for all of the following:

### 1. Non-degraded stores

- real rate-limit backing store
- real idempotency backing store

### 2. Real preview secrets

- `RATE_LIMIT_PEPPER`
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
- `TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `RESEND_API_KEY`
- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`

### 3. Workflow readiness

Preview workflow must be able to build and deploy **without**:

- `ALLOW_MEMORY_RATE_LIMIT`
- `ALLOW_MEMORY_IDEMPOTENCY`
- any placeholder-secret fallback

## Required edit seam

Retirement must be one coordinated change-set.

### A. Workflow

Edit `.github/workflows/cloudflare-deploy.yml`:

- remove preview-only `ALLOW_MEMORY_*` injection
- remove preview-only placeholder-secret fallback expressions

### B. Preview preflight

Edit `scripts/cloudflare/preview-preflight.sh`:

- remove `node scripts/cloudflare/check-preview-degraded-contract.mjs`
- update messaging so preview preflight no longer claims degraded placeholders are allowed

### C. Release gate

Edit `scripts/release-proof.sh`:

- remove `node scripts/cloudflare/check-preview-degraded-contract.mjs`
- remove the explicit `ALLOW_MEMORY_*` rejection guards only after the workflow no longer injects them anywhere

### D. Contract retirement

Retire:

- `scripts/cloudflare/preview-degraded-contract.mjs`
- `scripts/cloudflare/check-preview-degraded-contract.mjs`

### E. Docs / rules

Update at minimum:

- `docs/guides/CANONICAL-TRUTH-REGISTRY.md`
- `docs/guides/RELEASE-PROOF-RUNBOOK.md`
- `docs/guides/CLOUDFLARE-RETAINED-EXCEPTION-REGISTER.md`
- `AGENTS.md`

## Required proof after retirement

All of the following must pass **without** degraded preview flags/placeholders:

```bash
pnpm preview:preflight:cf
pnpm build:cf
pnpm preview:cf
pnpm smoke:cf:preview
pnpm proof:cf:preview-deployed
pnpm release:verify
```

## Decision rule

If preview still needs degraded flags or placeholder secrets to pass, do **not** delete the contract/checker.

That would only hide the exception rather than remove it.

## Final outcome

This runbook is now historical because the repository reached the point where:

- code-surface cleanup is largely done
- full stock convergence depended on preview environment readiness rather than further code-surface cleanup

As of the current main tree state, the preview-degraded contract/checker has been retired and this document is retained only as migration history.
