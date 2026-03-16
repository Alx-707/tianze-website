# Wave 1 Review Findings

Scope:
- `src/app/api/contact/route.ts`
- `src/app/api/inquiry/route.ts`
- `src/app/api/subscribe/route.ts`
- `src/lib/actions/contact.ts`
- `src/lib/contact-form-processing.ts`
- `src/lib/idempotency.ts`
- `src/lib/security/distributed-rate-limit.ts`
- related tests under `src/app/api/contact/**`, `src/app/api/inquiry/**`, `tests/integration/api/**`, and `src/components/forms/**`

Review dimensions:
- data invariants / state transitions
- concurrency / retry / timing
- abnormal-path semantics

## Findings

### 1. Contact flow rewrites synthetic `referenceId` into provider-specific IDs
- Priority: P1
- Dimensions:
  - data invariants / state transitions
  - abnormal-path semantics
- Evidence:
  - `src/lib/contact-form-processing.ts:54-60` maps `result.referenceId` into both `emailMessageId` and `airtableRecordId`
  - `src/app/api/contact/route.ts:81-84` returns those fields as `messageId` and `recordId`
  - contact tests mostly mock `processFormSubmission()` to return real-looking provider IDs, so they do not exercise the actual mapping
- Impact:
  - The contact path exposes a synthetic lead reference as if it were a real Resend message ID and Airtable record ID.
  - Any consumer, debugging workflow, or future integration that trusts these fields will read false data.
  - The bug is hard to notice because tests currently bypass the real implementation seam.
- Recommended fix:
  - Either return `referenceId` explicitly and stop exposing fake provider IDs, or extend the lead pipeline result so real downstream service IDs are carried through honestly.
  - Add at least one non-mocked integration test that exercises the real `processFormSubmission()` mapping behavior.

### 2. Contact submission path has no idempotency protection despite side effects
- Priority: P1
- Dimensions:
  - concurrency / retry / timing
  - data invariants / state transitions
- Evidence:
  - `src/lib/actions/contact.ts:176-245` performs rate limit + honeypot checks and then calls `processFormSubmission()` directly
  - `src/app/api/contact/route.ts:39-84` wraps the route in `withRateLimit()` only; it does not use `withIdempotency()`
  - `src/lib/contact-form-processing.ts:52-69` calls the lead pipeline, which can create CRM records and send emails
  - repository search across contact UI, action, and route returned no contact-path `Idempotency-Key` or `withIdempotency()` usage
- Impact:
  - Browser retries, double-clicks, or repeated submissions inside the rate-limit window can still create duplicate side effects on the primary contact flow.
  - This differs from `/api/inquiry` and `/api/subscribe`, which already require idempotency for similar public write semantics.
- Recommended fix:
  - Add idempotency to the contact path as a first-class write-path contract, either through an API route wrapper or by introducing an equivalent tokenized dedupe contract for the Server Action path.
  - Add a duplicate-submission regression test that proves contact writes are deduped across retries.

### 3. Client cooldown is recorded before submission outcome is known
- Priority: P2
- Dimensions:
  - abnormal-path semantics
  - concurrency / retry / timing
- Evidence:
  - `src/components/forms/contact-form-container.tsx:169-181` calls `recordSubmission()` before `formAction(formData)`
  - `src/components/forms/use-rate-limit.ts:27-77` derives `isRateLimited` purely from the local timestamp
  - `src/components/forms/contact-form-container.tsx:408-445` disables the submit button whenever `isRateLimited` is true
  - current tests only cover the success cooldown path and do not cover failed-submit cooldown behavior
- Impact:
  - Validation failures, failed Turnstile verification, or transient server errors can still lock the user out locally for the cooldown window even though no successful submission happened.
  - This turns abnormal-path retries into a client-side denial of service against legitimate users.
- Recommended fix:
  - Record cooldown only after a confirmed successful submission, or explicitly separate “submission attempted” from “submission accepted” states.
  - Add a test proving failed submissions do not trigger the cooldown banner or disable the button.

## Suggested Next Step
1. If these findings are accepted, record them into `docs/code-review/issues.md` using the existing ledger format.
2. Move to Wave 2 only after deciding whether the contact-path findings should be fixed immediately or tracked as follow-up review debt.
