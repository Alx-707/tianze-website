import { describe, expect, it } from "vitest";
import {
  classifyFileState,
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
        fileState: { proxyExists: true, middlewareExists: false },
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
        fileState: { proxyExists: true, middlewareExists: false },
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

  it("blocks proxy-compatible recommendation when proxy proof file is missing", () => {
    expect(
      classifyProxyProof({
        subject: "src/proxy.ts",
        fileState: { proxyExists: false, middlewareExists: true },
        steps: [
          { name: "next-build", exitCode: 0, logPath: "reports/a.log" },
          { name: "cloudflare-build", exitCode: 0, logPath: "reports/b.log" },
        ],
        warnings: [],
      }),
    ).toEqual({
      ok: false,
      recommendation: "keep-middleware",
      blockers: [
        "src/proxy.ts is missing in the proof worktree",
        "src/middleware.ts is still present in the proof worktree",
      ],
      warnings: [],
    });
  });

  it("blocks proxy-compatible recommendation when middleware and proxy coexist", () => {
    expect(
      classifyProxyProof({
        subject: "src/proxy.ts",
        fileState: { proxyExists: true, middlewareExists: true },
        steps: [
          { name: "next-build", exitCode: 0, logPath: "reports/a.log" },
          { name: "cloudflare-build", exitCode: 0, logPath: "reports/b.log" },
        ],
        warnings: [],
      }),
    ).toEqual({
      ok: false,
      recommendation: "keep-middleware",
      blockers: ["src/middleware.ts is still present in the proof worktree"],
      warnings: [],
    });
  });

  it("blocks proxy-compatible recommendation when artifact subject is not proxy", () => {
    expect(
      classifyFileState({
        subject: "src/middleware.ts",
        proxyExists: true,
        middlewareExists: false,
      }),
    ).toEqual({
      blockers: [
        'proof subject must be "src/proxy.ts", got "src/middleware.ts"',
      ],
    });
  });
});
