# CR-055 Fix Summary

## Problem
The contact form started its local cooldown before the Server Action outcome was known. Failed validation, failed Turnstile checks, or transient server errors could therefore disable re-submission even though no successful submission happened.

## Fix
- Removed the eager `recordSubmission()` call from `src/components/forms/contact-form-container.tsx`
- Kept cooldown activation tied to the existing success-state effect that calls `setLastSubmissionTime(new Date())`

## Regression Coverage
- Added a success-path assertion that cooldown is started through `setLastSubmissionTime()` only after success state is present
- Added a failure-path assertion that neither `setLastSubmissionTime()` nor `recordSubmission()` is called for an error state

## Verification
- `pnpm exec vitest run src/components/forms/__tests__/contact-form-submission.test.tsx`
- `pnpm exec vitest run src/components/forms/__tests__/contact-form-container.test.tsx`
