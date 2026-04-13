#!/bin/bash
set -euo pipefail

echo "[deprecated] scripts/cloudflare/preview-proof.sh now forwards to preview preflight."
echo "[deprecated] Formal Cloudflare preview proof is: pnpm proof:cf:preview-deployed"
bash scripts/cloudflare/preview-preflight.sh
