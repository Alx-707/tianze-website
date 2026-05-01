import { describe, expect, it } from "vitest";
import {
  classifyProxyProof,
  parseBuildWarnings,
  readProxyProofArtifact,
} from "../../../scripts/cloudflare/proxy-proof-check.mjs";

describe("cloudflare proxy proof check", () => {
  it("detects middleware deprecation warning", () => {
    expect(
      parseBuildWarnings(
        "The middleware file convention is deprecated. Please use proxy instead.",
      ),
    ).toEqual(["middleware-deprecated"]);
  });

  it("reads proxy proof artifact", () => {
    expect(
      readProxyProofArtifact(
        JSON.stringify({
          subject: "src/proxy.ts",
          steps: [
            { name: "next-build", exitCode: 0, logPath: "reports/a.log" },
            { name: "cloudflare-build", exitCode: 1, logPath: "reports/b.log" },
          ],
        }),
      ),
    ).toEqual({
      subject: "src/proxy.ts",
      steps: [
        { name: "next-build", exitCode: 0, logPath: "reports/a.log" },
        { name: "cloudflare-build", exitCode: 1, logPath: "reports/b.log" },
      ],
    });
  });

  it("classifies full proof pass", () => {
    expect(
      classifyProxyProof({
        subject: "src/proxy.ts",
        steps: [
          { name: "next-build", exitCode: 0, logPath: "reports/a.log" },
          { name: "cloudflare-build", exitCode: 0, logPath: "reports/b.log" },
          { name: "cf-preview-smoke", exitCode: 0, logPath: "reports/c.log" },
          {
            name: "cf-preview-smoke-strict",
            exitCode: 0,
            logPath: "reports/d.log",
          },
        ],
        warnings: [],
      }),
    ).toEqual({
      ok: true,
      recommendation: "proxy-compatible",
      blockers: [],
      warnings: [],
    });
  });

  it("blocks mainline migration when Cloudflare build fails", () => {
    expect(
      classifyProxyProof({
        subject: "src/proxy.ts",
        steps: [
          { name: "next-build", exitCode: 0, logPath: "reports/a.log" },
          { name: "cloudflare-build", exitCode: 1, logPath: "reports/b.log" },
        ],
        warnings: [],
      }),
    ).toEqual({
      ok: false,
      recommendation: "keep-middleware",
      blockers: ["cloudflare-build failed with exit code 1"],
      warnings: [],
    });
  });
});
