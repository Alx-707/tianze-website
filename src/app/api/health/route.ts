import { NextRequest } from "next/server";
import { createCacheHealthResponse } from "@/lib/api/cache-health-response";
import {
  applyRequestObservability,
  createSyntheticObservability,
  getRequestObservability,
} from "@/lib/api/request-observability";
import { recordApiResponseSignal } from "@/lib/observability/api-signals";

/**
 * Health check endpoint used by monitoring and cron jobs.
 *
 * Returns a minimal, stable JSON payload so that both automated checks
 * and e2e tests can reliably assert service availability.
 */
export function GET(request?: NextRequest) {
  const observability = request
    ? getRequestObservability(request, "cache-health")
    : createSyntheticObservability("cache-health");

  const response = applyRequestObservability(
    createCacheHealthResponse(),
    observability,
  );
  recordApiResponseSignal({
    context: observability,
    response,
    name: "health.get",
    route: "/api/health",
  }).catch(() => undefined);
  return response;
}
