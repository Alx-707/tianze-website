#!/bin/bash
set -euo pipefail

echo "== Cloudflare deployed preview proof =="
pnpm preview:preflight:cf
pnpm deploy:cf:preview
node scripts/deploy/post-deploy-smoke.mjs --base-url "${CF_PREVIEW_BASE_URL:-https://preview.tianze-pipe.com}"

echo "Deployed preview proof completed successfully."
echo "Formal Cloudflare proof path: real preview publish + deployed smoke."
