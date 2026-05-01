import { createHash } from "node:crypto";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  chooseDefaultInput,
  createDerivedCandidateEvidence,
  createSourceReportEvidence,
  normalizeHotspotInput,
  rankAllHotspotCandidates,
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
      inputMode: "structural-hotspots",
      sourceHash: createHash("sha256").update(rawInput).digest("hex"),
      uniqueFilesTouched: 1_149,
      windowDays: 180,
    });
  });

  it("extracts honest source evidence for explicit flat input mode", () => {
    const rawInput = `${JSON.stringify(
      [
        {
          complexity: 12,
          file: "src/lib/security/guard.ts",
          lines: 180,
        },
      ],
      null,
      2,
    )}\n`;

    expect(
      createSourceReportEvidence(JSON.parse(rawInput), {
        inputPath: "reports/quality/hotspots.json",
        rawInput,
      }),
    ).toEqual({
      commandChain: [
        "pnpm review:hotspot-slimming reports/quality/hotspots.json",
      ],
      commitsAnalyzed: null,
      generatedAt: null,
      inputMode: "flat input",
      sourceHash: createHash("sha256").update(rawInput).digest("hex"),
      uniqueFilesTouched: null,
      windowDays: null,
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

  it("can keep all filtered candidates for derived evidence before top-five truncation", () => {
    const rankedCandidates = rankAllHotspotCandidates([
      {
        file: "src/lib/first.ts",
        complexity: 10,
        lines: 100,
      },
      {
        file: "src/lib/second.ts",
        complexity: 9,
        lines: 100,
      },
      {
        file: "src/lib/third.ts",
        complexity: 8,
        lines: 100,
      },
      {
        file: "src/lib/fourth.ts",
        complexity: 7,
        lines: 100,
      },
      {
        file: "src/lib/fifth.ts",
        complexity: 6,
        lines: 100,
      },
      {
        file: "src/lib/sixth.ts",
        complexity: 5,
        lines: 100,
      },
    ]);

    expect(rankedCandidates).toHaveLength(6);
    expect(rankHotspotCandidates(rankedCandidates)).toHaveLength(5);
    expect(createDerivedCandidateEvidence(rankedCandidates).rowCount).toBe(6);
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

  it("hashes the derived candidate fields used by ranking", () => {
    const rankedCandidates = rankHotspotCandidates([
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
    ]);
    const stableRows = [
      {
        file: "src/lib/security/guard.ts",
        metricLabel: "Complexity metric",
        metricValue: 12,
        lines: 180,
        score: 2_160,
      },
      {
        file: "src/components/header.tsx",
        metricLabel: "Complexity metric",
        metricValue: 9,
        lines: 200,
        score: 1_800,
      },
    ];

    expect(createDerivedCandidateEvidence(rankedCandidates)).toEqual({
      hash: createHash("sha256")
        .update(`${JSON.stringify(stableRows)}\n`)
        .digest("hex"),
      rowCount: 2,
    });
  });

  it("renders checkout identity, derived evidence, and filtered candidate ranking", () => {
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
          inputMode: "structural-hotspots",
          sourceHash: "a".repeat(64),
          uniqueFilesTouched: 1_149,
          windowDays: 180,
        },
        checkout: {
          commit: "b".repeat(40),
          status: "dirty",
        },
        derivedCandidate: {
          hash: "c".repeat(64),
          rowCount: 1,
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
    expect(markdown).toContain(`- Checkout commit: \`${"b".repeat(40)}\``);
    expect(markdown).toContain("- Checkout status: dirty");
    expect(markdown).toContain(
      `- Derived candidate sha256: \`${"c".repeat(64)}\``,
    );
    expect(markdown).toContain("- Derived candidate rows: 1");
    expect(markdown).toContain(
      "- Ranking formula: change touches x current checkout line count",
    );
    expect(markdown).toContain(
      "- Candidate rank caveat: table rank is after filtering to current critical source/script paths and excluding package, messages, workflow, tests, and deleted paths; original structural hotspot rank is not this table rank.",
    );
    expect(markdown).toContain("| Candidate Rank | File | Complexity metric |");
    expect(markdown).toContain(
      "- Command chain: `pnpm arch:metrics` -> `pnpm arch:hotspots` -> `pnpm review:hotspot-slimming reports/architecture/structural-hotspots-latest.json`",
    );
  });

  it("renders flat input provenance without pretending it used structural metrics", () => {
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
        inputPath: "reports/quality/hotspots.json",
        sourceReport: {
          commandChain: [
            "pnpm review:hotspot-slimming reports/quality/hotspots.json",
          ],
          commitsAnalyzed: null,
          generatedAt: null,
          inputMode: "flat input",
          sourceHash: "d".repeat(64),
          uniqueFilesTouched: null,
          windowDays: null,
        },
      },
    );

    expect(markdown).toContain("- Input mode: flat input");
    expect(markdown).toContain(
      "- Command chain: `pnpm review:hotspot-slimming reports/quality/hotspots.json`",
    );
    expect(markdown).toContain(
      "- Ranking formula: metric value x input-provided lines",
    );
    expect(markdown).toContain(
      "- Candidate filter: flat input rows are filtered to critical source/script prefixes and test/non-source path patterns before ranking; line counts stay input-provided.",
    );
    expect(markdown).toContain(
      "- Candidate rank caveat: table rank is after filtering flat input rows to critical source/script paths and excluding package, messages, workflow, and tests; flat input does not prove current checkout line counts.",
    );
    expect(markdown).toContain(
      "- Flat input lines are trusted as provided by the input file; they are not recalculated from checkout files.",
    );
    expect(markdown).toContain(
      "- Complexity metric: sourced from `flat input complexity`.",
    );
    expect(markdown).not.toContain("pnpm arch:metrics");
    expect(markdown).not.toContain("real file lines");
  });
});
