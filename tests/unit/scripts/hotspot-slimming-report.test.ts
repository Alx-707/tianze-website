import { createHash } from "node:crypto";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  chooseDefaultInput,
  createSourceReportEvidence,
  normalizeHotspotInput,
  rankHotspotCandidates,
  renderHotspotRegister,
} from "../../../scripts/hotspot-slimming-report.mjs";

describe("hotspot slimming report", () => {
  it("defaults to structural-hotspots when structural and flat inputs both exist", () => {
    const rootDir = "/repo";
    const selected = chooseDefaultInput(rootDir, {
      fileExists: (candidate: string) =>
        candidate.endsWith(
          "reports/architecture/structural-hotspots-latest.json",
        ) || candidate.endsWith("reports/quality/hotspots.json"),
    });

    expect(selected).toBe(
      path.resolve(
        rootDir,
        "reports/architecture/structural-hotspots-latest.json",
      ),
    );
  });

  it("does not silently default to the old flat hotspot input", () => {
    expect(() =>
      chooseDefaultInput("/repo", {
        fileExists: (candidate: string) =>
          candidate.endsWith("reports/quality/hotspots.json"),
      }),
    ).toThrow("No structural hotspot input found");
  });

  it("extracts source report evidence from structural-hotspots raw JSON", () => {
    const rawInput = `${JSON.stringify(
      {
        metadata: {
          generatedAt: "2026-05-01T00:00:00.000Z",
          windowDays: 180,
        },
        summary: {
          commitsAnalyzed: 232,
          uniqueFilesTouched: 1_149,
          hotspots: [],
        },
      },
      null,
      2,
    )}\n`;

    expect(
      createSourceReportEvidence(JSON.parse(rawInput), {
        inputPath: "reports/architecture/structural-hotspots-latest.json",
        rawInput,
      }),
    ).toEqual({
      commandChain: [
        "pnpm arch:metrics",
        "pnpm arch:hotspots",
        "pnpm review:hotspot-slimming reports/architecture/structural-hotspots-latest.json",
      ],
      commitsAnalyzed: 232,
      generatedAt: "2026-05-01T00:00:00.000Z",
      hash: createHash("sha256").update(rawInput).digest("hex"),
      uniqueFilesTouched: 1_149,
      windowDays: 180,
    });
  });

  it("prioritizes critical source hotspots", () => {
    const candidates = rankHotspotCandidates([
      {
        file: "docs/quality/readme.md",
        complexity: 100,
        lines: 1_000,
      },
      {
        file: "src/lib/security/guard.ts",
        complexity: 12,
        lines: 180,
      },
      {
        file: "src/components/header.tsx",
        complexity: 9,
        lines: 200,
      },
      {
        file: "scripts/review-env-boundaries.js",
        complexity: 7,
        lines: 180,
      },
      {
        file: "src/app/[locale]/page.tsx",
        complexity: 4,
        lines: 250,
      },
      {
        file: "src/lib/small.ts",
        complexity: 30,
        lines: 20,
      },
      {
        file: "messages/en/common.json",
        complexity: 80,
        lines: 500,
      },
    ]);

    expect(candidates.map((candidate) => candidate.file)).toEqual([
      "src/lib/security/guard.ts",
      "src/components/header.tsx",
      "scripts/review-env-boundaries.js",
      "src/app/[locale]/page.tsx",
      "src/lib/small.ts",
    ]);
  });

  it("filters docs and non-source rows out of candidates", () => {
    const candidates = rankHotspotCandidates([
      {
        file: "docs/quality/notes.md",
        complexity: 100,
        lines: 500,
      },
      {
        file: "content/pages/en/example.mdx",
        complexity: 100,
        lines: 500,
      },
      {
        file: "src/app/__tests__/actions.test.ts",
        complexity: 100,
        lines: 500,
      },
      {
        file: "src/lib/current-site.ts",
        complexity: 2,
        lines: 50,
      },
    ]);

    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.file).toBe("src/lib/current-site.ts");
  });

  it("normalizes structural-hotspots shape with real line counts", () => {
    const candidates = rankHotspotCandidates(
      normalizeHotspotInput(
        {
          summary: {
            hotspots: [
              {
                file: "src/lib/lead-pipeline/index.ts",
                commits: 6,
              },
              {
                file: "docs/quality/notes.md",
                commits: 100,
              },
            ],
          },
        },
        {
          lineCounter: (file: string) =>
            file === "src/lib/lead-pipeline/index.ts" ? 42 : 10,
        },
      ),
    );

    expect(candidates).toEqual([
      {
        file: "src/lib/lead-pipeline/index.ts",
        lines: 42,
        metricLabel: "Change touches",
        metricSource: "summary.hotspots[].commits",
        metricValue: 6,
        score: 252,
      },
    ]);
  });

  it("skips structural-hotspots paths that are not present in the current tree", () => {
    const rows = normalizeHotspotInput(
      {
        summary: {
          hotspots: [
            {
              file: "src/app/api/contact/route.ts",
              commits: 15,
            },
            {
              file: "src/app/api/inquiry/route.ts",
              commits: 14,
            },
          ],
        },
      },
      {
        lineCounter: (file: string) =>
          file === "src/app/api/contact/route.ts" ? null : 20,
      },
    );

    expect(rows).toEqual([
      {
        file: "src/app/api/inquiry/route.ts",
        lines: 20,
        metricLabel: "Change touches",
        metricSource: "summary.hotspots[].commits",
        metricValue: 14,
      },
    ]);
  });

  it("renders the no-behavior-change rule", () => {
    const markdown = renderHotspotRegister(
      [
        {
          file: "src/lib/security/guard.ts",
          lines: 180,
          metricLabel: "Complexity metric",
          metricSource: "flat input complexity",
          metricValue: 12,
          score: 2_160,
        },
      ],
      {
        generatedAt: "2026-05-01T00:00:00.000Z",
        inputPath: "reports/architecture/structural-hotspots-latest.json",
        sourceReport: {
          commandChain: [
            "pnpm arch:metrics",
            "pnpm arch:hotspots",
            "pnpm review:hotspot-slimming reports/architecture/structural-hotspots-latest.json",
          ],
          commitsAnalyzed: 232,
          generatedAt: "2026-05-01T00:00:00.000Z",
          hash: "a".repeat(64),
          uniqueFilesTouched: 1_149,
          windowDays: 180,
        },
      },
    );

    expect(markdown).toContain(
      "No behavior change is allowed without a failing characterization test.",
    );
    expect(markdown).toContain("| 1 | `src/lib/security/guard.ts` |");
    expect(markdown).toContain("Complexity metric");
    expect(markdown).toContain(
      "- Source report generatedAt: 2026-05-01T00:00:00.000Z",
    );
    expect(markdown).toContain("- Source report windowDays: 180");
    expect(markdown).toContain("- Source report commitsAnalyzed: 232");
    expect(markdown).toContain("- Source report uniqueFilesTouched: 1149");
    expect(markdown).toContain(`- Source report sha256: \`${"a".repeat(64)}\``);
    expect(markdown).toContain(
      "- Command chain: `pnpm arch:metrics` -> `pnpm arch:hotspots` -> `pnpm review:hotspot-slimming reports/architecture/structural-hotspots-latest.json`",
    );
  });
});
