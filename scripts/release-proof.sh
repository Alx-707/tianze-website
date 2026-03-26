#!/bin/bash
set -euo pipefail

echo "== Release verification flow =="
pnpm type-check
pnpm lint:check
pnpm review:tier-a
pnpm review:clusters
pnpm test:locale-runtime
pnpm test:lead-family
pnpm test:cache-health
pnpm validate:translations
pnpm build
pnpm build:cf
pnpm test:release-smoke

echo "Cloudflare proof split:"
echo "  - Local stock preview: pnpm smoke:cf:preview"
echo "  - Strict local stock preview (includes /api/health): pnpm smoke:cf:preview:strict"
echo "  - Final deployed proof: pnpm smoke:cf:deploy -- --base-url <deployment-url>"
echo "Release verification completed successfully."
