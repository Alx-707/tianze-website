/**
 * Shared result types for lead pipeline service operations.
 */

export interface ServiceResult {
  success: boolean;
  id?: string | undefined;
  error?: Error | undefined;
  latencyMs: number;
}

export const DEFAULT_LATENCY = 0;
