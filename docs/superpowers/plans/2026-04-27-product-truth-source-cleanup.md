# Product Truth Source Cleanup Implementation Plan

> **Execution status (2026-04-28): completed.** This file is now the index for the historical execution record on branch `Alx-707/truth-cleanup-finish`, not the current backlog.
>
> The original monolithic plan was split after review because repository rules cap files at 500 lines. The unchecked boxes in the split files preserve the original plan shape; do not rerun them as open tasks without checking branch commits and current truth sweeps first.
>
> Implemented commits: `5360f90`, `db71a4b`, `b6e1aed`, `220b2e9`, `f0516b9`, `87187ca`, `1fddc13`, `e566306`.

## Split execution record

- [00 - Context and file map](./2026-04-27-product-truth-source-cleanup/00-context-and-file-map.md)
- [01 - Tasks 1-2: behavior lock and product-market FAQ removal](./2026-04-27-product-truth-source-cleanup/01-tasks-1-2.md)
- [02 - Tasks 3-5: route, equipment card, SEO/copy cleanup](./2026-04-27-product-truth-source-cleanup/02-tasks-3-5.md)
- [03 - Tasks 6-8: content, schema, docs/review scripts](./2026-04-27-product-truth-source-cleanup/03-tasks-6-8.md)
- [04 - Tasks 9-10: final sweeps and verification](./2026-04-27-product-truth-source-cleanup/04-tasks-9-10.md)

## Closed product-truth contract

- Public bending machines/equipment route is retired directly; no redirect was added.
- Product-market shared FAQ is removed from live product pages.
- FAQ remains only on About, Contact, and OEM custom manufacturing.
- Product pages no longer link to `/capabilities/bending-machines`.
- Live SEO/Home/About/Contact no longer positions Tianze as a bending machine or pipe processing equipment supplier.
- Dead equipment structured-data builder and equipment-only constants/assets are removed.
- Retired URL references stay literal in negative tests; split-string hiding is not allowed.
- AS/NZS 2053 remains the AU/NZ public standard wording; AS/NZS 61386 is not used as the AU/NZ market standard label in production source.

## Review note

This split only changes the shape of the plan documentation. It does not reopen product-page FAQ, equipment-page routing, or standards-copy decisions.
