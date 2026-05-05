# Current Status

This file is the short current-truth entry point. Historical audit reports remain
useful evidence, but they can contain stale findings after later repair work.

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
