#!/usr/bin/env bash
set -euo pipefail

mapfile -t files < <(
  git diff --cached --name-only --diff-filter=ACM \
    | grep -E '^src/.+\.(ts|tsx)$' \
    | grep -v '\.test\.' \
    | grep -v '\.spec\.' \
    | grep -v '__tests__' \
    || true
)

if [ "${#files[@]}" -eq 0 ]; then
  echo "✅ 相关测试检查通过 (无源码变更)"
  exit 0
fi

echo "🧪 运行相关测试..."
set -f
pnpm vitest related "${files[@]}" --run --passWithNoTests --reporter=verbose
