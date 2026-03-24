# Tier A Owner Map

## Purpose
This file defines the highest-risk paths in the repository and the minimum ownership/review expectations for them.

It is intentionally role-based first. Once stable GitHub handles are confirmed, mirror this map into `.github/CODEOWNERS`.

## Tier A Definition
Tier A paths are repository areas where a change can materially affect:
- request entry behavior
- locale / SEO / SSR semantics
- production security posture
- multi-platform build or runtime correctness
- lead capture / contact pipeline correctness

## Review Policy
- Tier A changes require one primary owner review and one cross-domain review when the change crosses runtime/security/platform boundaries.
- Tier A changes are not considered proven by fast local gates alone.
- Tier A changes must use the proof levels defined in [QUALITY-PROOF-LEVELS.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md).

## Owner Map

| Tier A Area | Paths | Primary Owner Role | Backup Owner Role | Required Cross-Review | Minimum Proof Before Merge |
|---|---|---|---|---|---|
| Runtime entry + locale routing | `src/middleware.ts`, `src/i18n/**`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/head.tsx` | Runtime / i18n maintainer | Platform maintainer | Security review when headers/nonce/cookies change | `local-full` for normal merges, `release-proof` for release-critical changes |
| Contact + inquiry + subscribe pipeline | `src/app/api/contact/**`, `src/app/api/inquiry/**`, `src/app/api/subscribe/**`, `src/lib/lead-pipeline/**`, `src/components/forms/**` | Lead pipeline maintainer | Runtime maintainer | Security review when validation/rate-limit/abuse checks change | `local-full` minimum; `ci-proof` required before release branch merge |
| Abuse protection + request security | `src/config/security.ts`, `src/lib/security/**`, `src/app/api/verify-turnstile/**`, `src/app/api/csp-report/**` | Security maintainer | Runtime maintainer | Platform review when Cloudflare/Vercel behavior may differ | `ci-proof` minimum; `release-proof` for policy/header/nonce changes |
| Platform build + deployment chain | `open-next.config.ts`, `next.config.ts`, `.github/workflows/**`, `scripts/cloudflare/**`, `wrangler.jsonc`, `vercel.json` | Platform maintainer | Runtime maintainer | Runtime review when request path behavior is affected | `release-proof` |
| Translation critical path | `messages/en.json`, `messages/zh.json`, `messages/en/critical.json`, `messages/zh/critical.json`, `scripts/validate-translations.js` | i18n maintainer | Runtime maintainer | Runtime review when SSR/critical-path keys change | `local-full` minimum; `ci-proof` when user-facing entry paths are affected |
| Cache invalidation + health signals | `src/app/api/cache/invalidate/**`, `src/lib/cache/**`, `src/app/api/health/**` | Platform maintainer | Runtime maintainer | Security review for auth/invalidation policy changes | `ci-proof` minimum |

## Current Repository State
- Repository-level ownership is now enforced via [`.github/CODEOWNERS`](/Users/Data/Warehouse/Pipe/tianze-website/.github/CODEOWNERS).
- This map remains the semantic owner-definition layer above raw CODEOWNERS patterns.
- The current enforceable owner pair is:
  - primary: `@Alx-707`
  - backup: `developer@flood-control.com`
- Role separation remains documented above the identity mapping so future expansion does not collapse into raw file ownership alone.

## Promotion / Demotion Rules
- Promote to Tier A when a path affects runtime entry behavior, dual-platform compatibility, security posture, or lead capture correctness.
- Demote from Tier A only after two conditions hold:
  - the path is no longer on a critical path, and
  - ownership and proof requirements have been reduced intentionally, not by drift.

## Next Step
Reduce owner concentration over time by mapping backup owner roles to additional maintainers as they become available.
