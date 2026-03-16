# CR-083 Cleanup Summary

## Problem
`src/components/seo/index.ts` was a dead barrel file with no consumers. It only re-exported `JsonLdScript` and added another unused entrypoint.

## Cleanup
- Removed `src/components/seo/index.ts`

## Rationale
- Avoid dead barrel entrypoints in the component tree
- Reduce import-path ambiguity and API surface
