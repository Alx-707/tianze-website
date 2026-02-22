import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";
import type { SplittedFunctionOptions } from "@opennextjs/aws/types/open-next";

const cloudflareConfig = defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
  tagCache: d1NextTagCache,
});

// Split high-traffic API routes into separate workers
const splitFunctions: Record<string, SplittedFunctionOptions> = {
  apiLead: {
    runtime: "node",
    placement: "regional",
    minify: true,
    routes: [
      "app/api/contact/route",
      "app/api/inquiry/route",
      "app/api/subscribe/route",
      "app/api/verify-turnstile/route",
      "app/api/health/route",
    ],
    patterns: [
      "/api/contact",
      "/api/inquiry",
      "/api/subscribe",
      "/api/verify-turnstile",
      "/api/health",
    ],
  },
  apiOps: {
    runtime: "node",
    placement: "regional",
    minify: true,
    routes: ["app/api/cache/invalidate/route", "app/api/csp-report/route"],
    patterns: ["/api/cache/invalidate", "/api/csp-report"],
  },
  apiWhatsapp: {
    runtime: "node",
    placement: "regional",
    minify: true,
    routes: ["app/api/whatsapp/send/route", "app/api/whatsapp/webhook/route"],
    patterns: ["/api/whatsapp/*"],
  },
};

cloudflareConfig.functions = splitFunctions;
cloudflareConfig.default.minify = true;

export default cloudflareConfig;
