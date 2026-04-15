import { describe, expect, it } from "vitest";
import {
  getPhase6DeploymentOrder,
  getPhase6ServerActionsKeyWorkerNames,
  getPhase6WorkerNames,
} from "../../../scripts/cloudflare/phase6-topology-contract.mjs";

describe("phase6 topology contract", () => {
  it("derives worker names from one shared catalog", () => {
    expect(getPhase6WorkerNames("tianze-website")).toEqual({
      gateway: "tianze-website-gateway",
      web: "tianze-website-web",
      apiLead: "tianze-website-api-lead",
      apiOps: "tianze-website-api-ops",
    });
  });

  it("keeps deploy order aligned with the shared catalog", () => {
    expect(getPhase6DeploymentOrder()).toEqual([
      "web.jsonc",
      "api-lead.jsonc",
      "api-ops.jsonc",
      "gateway.jsonc",
    ]);
  });

  it("keeps server-actions key sync list aligned with the same catalog", () => {
    expect(getPhase6ServerActionsKeyWorkerNames("tianze-website")).toEqual([
      "tianze-website-gateway",
      "tianze-website-web",
      "tianze-website-api-lead",
      "tianze-website-api-ops",
    ]);
  });
});
