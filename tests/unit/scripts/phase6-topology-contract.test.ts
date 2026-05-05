import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  getPhase6ApiPathnames,
  getPhase6ApiRouteRules,
  getPhase6ApiSourceRoutes,
  getPhase6DeploymentOrder,
  getPhase6PatchPrefetchWorkerKeys,
  getPhase6ServerActionsKeyWorkerNames,
  getPhase6WorkerNames,
} from "../../../scripts/cloudflare/phase6-topology-contract.mjs";

const REPO_ROOT = path.resolve(__dirname, "../../..");

function readRepoFile(relativePath: string) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- test reads fixed repo fixture files by relative path
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

describe("phase6 topology contract", () => {
  it("derives worker names from one shared catalog", () => {
    expect(getPhase6WorkerNames("tianze-website")).toEqual({
      gateway: "tianze-website-gateway",
      web: "tianze-website-web",
      apiLead: "tianze-website-api-lead",
    });
  });

  it("keeps deploy order aligned with the shared catalog", () => {
    expect(getPhase6DeploymentOrder()).toEqual([
      "web.jsonc",
      "api-lead.jsonc",
      "gateway.jsonc",
    ]);
  });

  it("keeps server-actions key sync list aligned with the same catalog", () => {
    expect(getPhase6ServerActionsKeyWorkerNames("tianze-website")).toEqual([
      "tianze-website-gateway",
      "tianze-website-web",
      "tianze-website-api-lead",
    ]);
  });

  it("keeps prefetch patch targets aligned with the same catalog", () => {
    expect(getPhase6PatchPrefetchWorkerKeys()).toEqual(["apiLead"]);
  });

  it("keeps phase6 API route split explicit and excludes old cache invalidation", () => {
    expect(getPhase6ApiSourceRoutes("apiLead")).toEqual([
      "app/api/inquiry/route",
      "app/api/subscribe/route",
      "app/api/verify-turnstile/route",
      "app/api/health/route",
    ]);

    expect(getPhase6ApiPathnames("apiLead")).toEqual([
      "/api/inquiry",
      "/api/subscribe",
      "/api/verify-turnstile",
      "/api/health",
    ]);

    const allPathnames = getPhase6ApiPathnames();
    expect(allPathnames).not.toContain("/api/cache/invalidate");
    expect(getPhase6ApiRouteRules()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pathname: "/api/inquiry",
          sourceRoute: "app/api/inquiry/route",
          workerKey: "apiLead",
        }),
      ]),
    );
  });

  it("aliases Next.js dead imports that break Wrangler phase6 dry-run bundling", () => {
    const phase6Builder = readRepoFile(
      "scripts/cloudflare/build-phase6-workers.mjs",
    );

    expect(phase6Builder).toMatch(/(?:["']critters["']|critters)\s*:/);
    expect(phase6Builder).toMatch(
      /["']next\/dist\/compiled\/@vercel\/og\/index\.edge\.js["']\s*:/,
    );
    expect(phase6Builder).toMatch(
      /["']\.\.\/\.\.\/\.\.\/scripts\/cloudflare\/shims\/empty-module\.mjs["']/,
    );
  });
});
