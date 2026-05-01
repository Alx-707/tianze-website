# Preview Observability

## Purpose

Preview observability is not the page business contract proof.

`preview-proof` checks whether launch-facing pages still expose the expected
page contracts. This check only captures request identity signals from the
preview deployment so a failed preview run is easier to trace.

## Required signals

The default probe is `/api/health`. It must return:

- `x-request-id`
- `x-observability-surface: cache-health`

## When to run it

Run this only after the preview deployment is ready. If Vercel Protection is
enabled, pass the same bypass header used by preview proof:

```bash
pnpm proof:preview-observability -- \
  --base-url https://example-preview.vercel.app \
  --header-name "x-vercel-protection-bypass" \
  --header-value "$VERCEL_AUTOMATION_BYPASS_SECRET"
```

## Report

The default report path is:

```text
reports/deploy/preview-observability-summary.json
```

The report records each probe's pathname, status, request id, observability
surface, pass/fail state, and any missing required headers.
