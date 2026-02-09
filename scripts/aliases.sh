#!/bin/bash
# Project-specific shell aliases
# Source this file: source scripts/aliases.sh

# Git status overview - shows branch status, working tree, and recent commits
alias gso='git branch -vv && echo "---" && git status && echo "---" && git log --oneline -3'

# Git branch analysis - shows merged/unmerged branches with timestamps
alias gba='echo "=== Merged to main ===" && git branch --merged main && echo "" && echo "=== Not merged ===" && git branch --no-merged main && echo "" && echo "=== Branch ages ===" && git for-each-ref --sort=-committerdate --format="%(refname:short) | %(committerdate:relative)" refs/heads | head -10'

# Git diff from main - shows what current branch adds
alias gdm='git log --oneline main..HEAD && echo "---" && git diff main...HEAD --stat | tail -20'

# Quick CI check
alias qci='pnpm type-check && pnpm lint:check && pnpm build'

echo "✓ Project aliases loaded: gso, gba, gdm, qci"
