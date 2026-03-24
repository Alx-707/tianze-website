# Translation Quartet And Locale Runtime Decoupling

## Objective
Reduce two remaining structural coupling points:
- split/flat translation synchronization
- repeated locale coercion/fallback logic in the runtime locale path

## Completed Work

### Translation Quartet
- Added shared quartet helper:
  - [translation-flat-utils.js](/Users/Data/Warehouse/Pipe/tianze-website/scripts/translation-flat-utils.js)
- Shared nested-path traversal and nested read/write helpers now live in the same quartet utility:
  - `collectLeafPaths`
  - `getNestedValue`
  - `setNestedValue`
- Updated flat regeneration script:
  - [regenerate-flat-translations.js](/Users/Data/Warehouse/Pipe/tianze-website/scripts/regenerate-flat-translations.js)
- Added command:
  - `pnpm i18n:regenerate-flat`
- Updated quartet review flow:
  - `pnpm review:translation-quartet`
  - now regenerates flat compatibility files before running validation/copy/shape checks
- Updated i18n rule summary:
  - [i18n.md](/Users/Data/Warehouse/Pipe/tianze-website/.claude/rules/i18n.md)

### Locale Runtime
- Added shared locale helper:
  - [locale-utils.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/i18n/locale-utils.ts)
- Updated runtime surfaces to use shared locale coercion:
  - [load-messages.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/load-messages.ts)
  - [request.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/i18n/request.ts)
  - [layout.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/layout.tsx)
  - [global-error.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/global-error.tsx)

## Validation
- `pnpm review:translation-quartet`
  - passed
- `pnpm review:locale-runtime`
  - 4 files passed
  - 23 tests passed

## Result
- Translation quartet now has explicit split/source, flat/generated, and public/runtime roles with shared helpers for both the derived path and nested traversal logic.
- Locale runtime now has less duplicated locale validation/coercion logic across key runtime files.
