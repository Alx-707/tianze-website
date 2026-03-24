#!/bin/bash
set -euo pipefail

echo "== Tier A release-proof flow =="
pnpm review:tier-a:staged
pnpm review:clusters:staged
pnpm validate:translations
pnpm build
pnpm build:cf
CI=1 pnpm test:e2e

echo "Release-proof flow completed successfully."
