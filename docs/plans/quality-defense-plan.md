# 4-Layer Quality Defense System - Implementation Plan

> Created: 2026-03-28
> Status: Executing
> Origin: Expert code audit + Codex cross-validation

## Problem Statement

The project has 16+ quality gates that verify code **form** (types, lint, coverage%) but none verify code **function** (can users complete tasks). Evidence: 4 functional bugs (dead CTAs, broken links) passed all gates undetected.

## Solution: 4-Layer Defense

### Layer 1: Behavioral Contract (BC-xxx)

User-facing promises that define "what must work". Each contract maps to test files.

See [Behavioral Contracts](../specs/behavioral-contracts.md) for the full contract registry.

### Layer 2: Static Truth Check

Script runs in <5 seconds, catches disconnected UI before any browser test.

Checks:
- Every `<Link href="...">` resolves to a real route (page.tsx exists)
- Every `<Button>` inside a `<Link>` has a valid href
- Every form action points to an existing API route
- No orphaned components in route directories
- All CTA destinations in section components map to real pages

### Layer 3: Playwright E2E Journey Tests

Behavioral contract-aligned E2E tests covering real user journeys:
- Browse products journey (BC-001, BC-014)
- Submit inquiry journey (BC-002, BC-003, BC-008)
- Navigation journey (BC-004, BC-005, BC-010, BC-013)
- Error handling journey (BC-012)

### Layer 4: Stryker Mutation Testing

Key modules only (not full codebase):
- `src/lib/lead-pipeline/` - Business-critical lead processing
- `src/lib/security/` - Rate limiting, validation
- `src/lib/form-schema/` - Form validation logic

## Historical Debt Cleanup

| Item | Action | Files |
|------|--------|-------|
| Disconnected filters | Delete 3 files | product-filter-utils.ts, product-category-filter.tsx, product-standards-filter.tsx |
| Airtable legacy | Remove createContact, migrate tests | service.ts + 8 test files |
| Config fragmentation | Route through env.ts | site-config.ts lines 30-32, 69 |
| API route duplication | Extract factory | contact/route.ts, inquiry/route.ts, subscribe/route.ts |

## CI Redesign

### Fast Tier (~2 min, every push)
- type-check
- lint:check
- static-truth-check (new)
- test (unit only, no coverage)
- build-check (next build --dry-run equivalent)

### Slow Tier (CI/nightly)
- test:coverage (full coverage with thresholds)
- test:e2e (Playwright)
- build:cf (Cloudflare build)
- stryker (mutation testing, key modules)
- security (Semgrep)
- perf:lighthouse

## Execution Order

1. Historical debt cleanup (unblocks clean baseline)
2. Static truth check script (fast win, catches disconnected UI)
3. Behavioral contract document (defines success criteria)
4. Stryker config (new capability)
5. E2E journey tests (depends on contracts)
6. CI redesign (integrates all new checks)
