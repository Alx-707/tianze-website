# Staging Lead Canary

## Purpose

This proof has two levels:

1. `dry-run`: generates and records the intended product inquiry payload shape without submitting data.
2. `submit` / `strict`: only allowed when staging has an explicit Turnstile test strategy and a non-production data target.

Without the staging-only security/data contract, this script must not be described as an end-to-end lead proof.

## Modes

- `dry-run`: default. Writes a report and does not submit data.
- `submit`: submits a product inquiry payload to the provided preview/staging URL. Requires a valid staging Turnstile strategy.
- `strict`: same as submit, but missing `--base-url` or missing staging security configuration is a hard failure.

## Safe payload marker

Every payload uses:

- email: `staging-canary@example.invalid`
- company: `Tianze Preview Proof`
- productSlug: `pvc-conduit-fittings`
- productName: `PVC Conduit Fittings`
- requirements prefix: `[staging-canary <reference>]`
- idempotency header: `Idempotency-Key: staging-canary-<timestamp-or-reference>`

## Security contract for submit/strict

Current `/api/inquiry` validates product inquiry data, requires Turnstile, and requires an idempotency key. Therefore:

- Do not send contact-form fields such as `firstName`, `lastName`, or `acceptPrivacy` to `/api/inquiry`.
- Do not use invalid Turnstile tokens and call that a lead-chain proof.
- Do not submit to production Airtable from this canary.
- Do not submit to production URLs. The script only allows localhost, `127.0.0.1`, `*.vercel.app`, or hosts containing `preview` / `staging`.
- If staging Turnstile bypass/test keys are unavailable, keep this lane in `dry-run`.

## Commands

```bash
pnpm proof:lead-canary:staging -- --mode dry-run
pnpm proof:lead-canary:staging -- \
  --base-url https://example-preview.vercel.app \
  --mode submit \
  --reference pr-123 \
  --turnstile-token "$STAGING_TURNSTILE_TEST_TOKEN" \
  --idempotency-key "staging-canary-pr-123"
pnpm proof:lead-canary:staging -- \
  --base-url https://example-preview.vercel.app \
  --mode strict \
  --reference release-candidate \
  --turnstile-token "$STAGING_TURNSTILE_TEST_TOKEN" \
  --idempotency-key "staging-canary-release-candidate"
```

## Report

The script writes:

```text
reports/deploy/staging-lead-canary.json
```

The report must include:

- `tool`
- `checkedAt`
- `baseUrl`
- `mode`
- `reference`
- `status`
- `ok`
- `reason`
- `responseStatus`
- `responseBodySnippet`
