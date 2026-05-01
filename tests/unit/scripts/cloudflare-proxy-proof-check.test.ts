import { describe, expect, it } from "vitest";
import {
  classifyFileState,
  classifyProxyProof,
  parseBuildWarnings,
  readProxyProofArtifact,
} from "../../../scripts/cloudflare/proxy-proof-check.mjs";

const completePassingSteps = [
  { name: "next-build", exitCode: 0, logPath: "reports/a.log" },
  { name: "cloudflare-build", exitCode: 0, logPath: "reports/b.log" },
  { name: "cf-preview-smoke", exitCode: 0, logPath: "reports/c.log" },
  {
    name: "cf-preview-smoke-strict",
    exitCode: 0,
    logPath: "reports/d.log",
  },
];

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
      artifactBlockers: [],
    });
  });

  it("returns artifact blockers when steps is not an array", () => {
    const artifact = readProxyProofArtifact(
      JSON.stringify({
        subject: "src/proxy.ts",
        steps: null,
      }),
    );

    expect(artifact).toEqual({
      subject: "src/proxy.ts",
      steps: [],
      artifactBlockers: ["artifact.steps must be an array"],
    });
    expect(
      classifyProxyProof({
        ...artifact,
        fileState: { proxyExists: true, middlewareExists: false },
        warnings: [],
      }),
    ).toEqual({
      ok: false,
      recommendation: "keep-middleware",
      blockers: [
        "artifact.steps must be an array",
        "missing required proof step: next-build",
        "missing required proof step: cloudflare-build",
        "missing required proof step: cf-preview-smoke",
        "missing required proof step: cf-preview-smoke-strict",
      ],
      warnings: [],
    });
  });

  it("returns artifact blockers when a step is missing exitCode", () => {
    const artifact = readProxyProofArtifact(
      JSON.stringify({
        subject: "src/proxy.ts",
        steps: [{ name: "next-build", logPath: "reports/a.log" }],
      }),
    );

    expect(artifact).toEqual({
      subject: "src/proxy.ts",
      steps: [],
      artifactBlockers: ["artifact.steps[0].exitCode must be a number"],
    });
  });

  it("classifies full proof pass", () => {
    expect(
      classifyProxyProof({
        subject: "src/proxy.ts",
        fileState: { proxyExists: true, middlewareExists: false },
        steps: completePassingSteps,
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
      blockers: [
        "missing required proof step: cf-preview-smoke",
        "missing required proof step: cf-preview-smoke-strict",
        "cloudflare-build failed with exit code 1",
      ],
      warnings: [],
    });
  });

  it("blocks proxy-compatible recommendation when a required step is missing", () => {
    expect(
      classifyProxyProof({
        subject: "src/proxy.ts",
        fileState: { proxyExists: true, middlewareExists: false },
        steps: completePassingSteps.filter(
          (step) => step.name !== "cf-preview-smoke-strict",
        ),
        warnings: [],
      }),
    ).toEqual({
      ok: false,
      recommendation: "keep-middleware",
      blockers: ["missing required proof step: cf-preview-smoke-strict"],
      warnings: [],
    });
  });

  it("blocks proxy-compatible recommendation when a step is unknown", () => {
    expect(
      classifyProxyProof({
        subject: "src/proxy.ts",
        fileState: { proxyExists: true, middlewareExists: false },
        steps: [
          ...completePassingSteps,
          { name: "extra-smoke", exitCode: 0, logPath: "reports/e.log" },
        ],
        warnings: [],
      }),
    ).toEqual({
      ok: false,
      recommendation: "keep-middleware",
      blockers: ["unknown proof step: extra-smoke"],
      warnings: [],
    });
  });

  it("blocks proxy-compatible recommendation when a step is duplicated", () => {
    expect(
      classifyProxyProof({
        subject: "src/proxy.ts",
        fileState: { proxyExists: true, middlewareExists: false },
        steps: [
          ...completePassingSteps,
          { name: "next-build", exitCode: 0, logPath: "reports/e.log" },
        ],
        warnings: [],
      }),
    ).toEqual({
      ok: false,
      recommendation: "keep-middleware",
      blockers: ["duplicate proof step: next-build"],
      warnings: [],
    });
  });

  it("blocks proxy-compatible recommendation when proxy proof file is missing", () => {
    expect(
      classifyProxyProof({
        subject: "src/proxy.ts",
        fileState: { proxyExists: false, middlewareExists: true },
        steps: completePassingSteps,
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
        steps: completePassingSteps,
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
