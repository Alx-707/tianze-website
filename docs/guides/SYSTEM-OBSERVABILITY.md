# System Observability

## Purpose
This guide defines the repository's current machine-readable observability layer for high-value runtime surfaces.

It is intentionally lighter than a full tracing platform, but heavier than ad hoc route logs.

## Current Model
The repository now has three observability layers:

1. Request-level correlation
   - `x-request-id`
   - `x-observability-surface`

2. Structured system signals
   - centralized in [`src/lib/observability/system-observability.ts`](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/observability/system-observability.ts)
   - shared route signal helper in [`src/lib/observability/api-signals.ts`](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/observability/api-signals.ts)

3. Surface-level contracts
   - lead family
   - cache-health
   - lead-pipeline metrics / summaries

## Signal Kinds
- `api_request`
- `pipeline_metric`
- `pipeline_summary`

## Standard Signal Fields
- `timestamp`
- `kind`
- `surface`
- `name`
- `outcome`
- `requestId` when available
- `statusCode` when applicable
- `errorCode` when applicable
- `errorType` when applicable
- `latencyMs` when available
- `route` when applicable
- `meta` for structured extra context

## Current Surfaces
- `lead-family`
- `cache-health`
- `lead-pipeline`
- `locale-runtime` (request-level correlation only so far)

## Snapshot Support
The in-process collector supports:
- recent signal retention
- aggregate counts by `surface + kind + name`
- test-friendly snapshot/reset APIs

APIs:
- [`getSystemObservabilitySnapshot()`](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/observability/system-observability.ts)
- [`resetSystemObservability()`](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/observability/system-observability.ts)

## Current Guarantees
- High-value write and cache/health routes expose stable observability headers.
- Lead pipeline metrics and summaries now participate in the shared signal model.
- Route-level and pipeline-level signals can be correlated by `requestId` when the caller path passes it through.

## Current Limit
This is not yet a full external observability platform.

Missing pieces still include:
- external sink / durable storage
- long-lived aggregation outside process memory
- alert routing
- cross-process trace propagation

## Next Evolution
If `R3` needs to move higher, the next step is not more route-local headers. The next step is:
1. durable signal export
2. stronger correlation across process boundaries
3. higher-level aggregation and alerting
