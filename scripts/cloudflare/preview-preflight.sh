#!/bin/bash
set -euo pipefail

echo "== Cloudflare preview preflight =="
pnpm type-check
pnpm lint:check
pnpm validate:config
pnpm review:tier-a
pnpm review:clusters
pnpm test:locale-runtime
pnpm test:lead-family
pnpm test:cache-health
pnpm validate:translations

echo "Preview preflight completed successfully."
echo "Note: preview preflight is the Route B stock-preview preflight lane."
echo "Note: placeholder secrets and degraded-mode flags are now strictly disallowed in all validation paths."
