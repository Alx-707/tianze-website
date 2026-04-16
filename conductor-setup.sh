#!/usr/bin/env bash
set -euo pipefail

cd "${CONDUCTOR_WORKSPACE_PATH:-.}"

export PATH="$HOME/.local/bin:$PATH:/opt/homebrew/bin:/usr/local/bin"

DEFAULT_NODE_VERSION="20.19.0"
if [ -f .nvmrc ]; then
  DEFAULT_NODE_VERSION="$(tr -d '[:space:]' < .nvmrc)"
fi

REQUIRED_NODE_VERSION="${REQUIRED_NODE_VERSION:-$DEFAULT_NODE_VERSION}"
PNPM_VERSION="${PNPM_VERSION:-10.13.1}"

ensure_compatible_node() {
  command -v node >/dev/null 2>&1 || {
    echo "[setup] node not found"
    exit 1
  }

  node -e '
    const [major, minor] = process.versions.node.split(".").map(Number);
    const supported = major === 20 && minor >= 19;

    if (!supported) {
      process.exit(1);
    }
  ' || {
    echo "[setup] node $(node -v) does not satisfy project policy >=20.19 <21"
    echo "[setup] switch your shell to Node $REQUIRED_NODE_VERSION before running setup"
    exit 1
  }
}

ensure_compatible_node
echo "[setup] node: $(node -v)"

command -v corepack >/dev/null 2>&1 || {
  echo "[setup] corepack not found"
  exit 1
}

corepack enable
corepack prepare "pnpm@$PNPM_VERSION" --activate
echo "[setup] pnpm: $(pnpm -v)"

pnpm install --frozen-lockfile
