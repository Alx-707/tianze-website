#!/bin/bash
set -euo pipefail

if [[ "${VALIDATE_CONFIG_SKIP_RUNTIME:-}" == "true" || "${VALIDATE_CONFIG_SKIP_RUNTIME:-}" == "1" ]]; then
  echo "release-proof must not run with VALIDATE_CONFIG_SKIP_RUNTIME enabled" >&2
  exit 1
fi

if [[ "${ALLOW_MEMORY_RATE_LIMIT:-}" == "true" || "${ALLOW_MEMORY_RATE_LIMIT:-}" == "1" ]]; then
  echo "release-proof must not run with ALLOW_MEMORY_RATE_LIMIT enabled" >&2
  exit 1
fi

if [[ "${ALLOW_MEMORY_IDEMPOTENCY:-}" == "true" || "${ALLOW_MEMORY_IDEMPOTENCY:-}" == "1" ]]; then
  echo "release-proof must not run with ALLOW_MEMORY_IDEMPOTENCY enabled" >&2
  exit 1
fi

echo "== Release verification flow =="
pnpm type-check
pnpm lint:check
pnpm review:tier-a
pnpm review:clusters
pnpm test:locale-runtime
pnpm test:lead-family
pnpm test:cache-health
pnpm validate:translations
pnpm clean:next-artifacts
pnpm build
pnpm build:cf
pnpm deploy:cf:phase6:dry-run
pnpm test:release-smoke

echo "Cloudflare proof split:"
echo "  - Local stock preview: pnpm smoke:cf:preview"
echo "  - Strict local stock preview (includes /api/health): pnpm smoke:cf:preview:strict"
echo "  - Stronger local split-worker proof: pnpm deploy:cf:phase6:dry-run"
echo "  - Real preview publish path: pnpm deploy:cf:phase6:preview"
echo "  - Final deployed proof: pnpm smoke:cf:deploy -- --base-url <deployment-url>"
echo "Release verification completed successfully."
