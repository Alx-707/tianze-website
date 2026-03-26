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
    // OpenNext 1.17.x hits an ENOENT during Cloudflare minification with pnpm-style node_modules.
    // TODO: Re-enable after upstream OpenNext minifier support for this packaging shape is fixed and `pnpm build:cf` passes cleanly again.
    minify: false,
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
    // TODO: Keep aligned with the default worker minify workaround until upstream fix lands.
    minify: false,
    routes: ["app/api/cache/invalidate/route", "app/api/csp-report/route"],
    patterns: ["/api/cache/invalidate", "/api/csp-report"],
  },
  apiWhatsapp: {
    runtime: "node",
    placement: "regional",
    // TODO: Keep aligned with the default worker minify workaround until upstream fix lands.
    minify: false,
    routes: ["app/api/whatsapp/send/route", "app/api/whatsapp/webhook/route"],
    patterns: ["/api/whatsapp/*"],
  },
};

cloudflareConfig.functions = splitFunctions;
// OpenNext minifier crashes with pnpm symlink structure (ENOENT on .pnpm/node_modules/).
// Keep disabled until upstream fix lands. Bundle size relies on paid Workers plan (10MB compressed).
cloudflareConfig.default.minify = false;

export default cloudflareConfig;
