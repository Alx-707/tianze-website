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
pnpm preview:cf > /tmp/release-proof-preview.log 2>&1 &
PREVIEW_PID=$!
trap 'kill "$PREVIEW_PID" >/dev/null 2>&1 || true' EXIT

READY=0
for i in $(seq 1 80); do
  if curl -fsS http://127.0.0.1:8787/ >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 2
done

if [ "$READY" -ne 1 ]; then
  echo "release-proof preview never became ready" >&2
  cat /tmp/release-proof-preview.log >&2 || true
  exit 1
fi

pnpm smoke:cf:preview
kill "$PREVIEW_PID" >/dev/null 2>&1 || true
wait "$PREVIEW_PID" || true
trap - EXIT
pnpm test:release-smoke

echo "Cloudflare proof split:"
echo "  - Local stock preview: pnpm smoke:cf:preview"
echo "  - Strict local stock preview (includes /api/health): pnpm smoke:cf:preview:strict"
echo "  - Real preview publish path: pnpm deploy:cf:preview"
echo "  - Final deployed proof: pnpm smoke:cf:deploy -- --base-url <deployment-url>"
echo "Release verification completed successfully."
