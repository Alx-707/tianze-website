import { describe, expect, it, vi } from "vitest";

const mutationCheck =
  await import("../../../scripts/check-mutation-required.js");

describe("check-mutation-required", () => {
  describe("getLatestRelevantChangeTimestampMs", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("uses the latest committed timestamp for touched protected files", () => {
      const latest = mutationCheck.getLatestRelevantChangeTimestampMs(
        [
          "src/lib/security/rate-limit.ts",
          "src/lib/lead-pipeline/submit.ts",
          "src/components/hero.tsx",
        ],
        {
          getLatestCommittedChangeTimestampMsFn: (filePath: string) =>
            filePath.includes("submit") ? 4_500 : 2_500,
        },
      );

      expect(latest).toBe(4_500);
    });

    it("returns the latest committed timestamp for deleted protected files too", () => {
      const latest = mutationCheck.getLatestRelevantChangeTimestampMs(
        ["src/lib/security/deleted-guard.ts"],
        {
          getLatestCommittedChangeTimestampMsFn: () => 1_710_000_000_000,
        },
      );

      expect(latest).toBe(1_710_000_000_000);
    });
  });

  describe("main freshness enforcement", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("rejects reports older than the latest protected change even if they are newer than branch start", () => {
      const isReportFreshEnoughFn = vi.fn(() => false);

      expect(() =>
        mutationCheck.main({
          getChangedFilesFn: () => ["src/lib/security/rate-limit.ts"],
          getTouchedTargetDirectoriesFn:
            mutationCheck.getTouchedTargetDirectories,
          getMergeBaseTimestampMsFn: () => 1_700_000_000_000,
          getLatestRelevantChangeTimestampMsFn: () => 1_700_000_000_900,
          loadMutationReportFn: () => ({
            config: {
              mutate: ["src/lib/security/**/*.ts"],
            },
          }),
          isReportFreshEnoughFn,
        }),
      ).toThrow(
        "变异测试报告早于本次受保护改动的最新变更，请重新运行 pnpm test:mutation",
      );
      expect(isReportFreshEnoughFn).toHaveBeenCalledWith(
        mutationCheck.REPORT_PATH,
        1_700_000_000_900,
      );
    });

    it("accepts reports generated after the latest protected change", () => {
      const isReportFreshEnoughFn = vi.fn(() => true);

      expect(() =>
        mutationCheck.main({
          getChangedFilesFn: () => ["src/lib/security/rate-limit.ts"],
          getTouchedTargetDirectoriesFn:
            mutationCheck.getTouchedTargetDirectories,
          getMergeBaseTimestampMsFn: () => 1_700_000_000_000,
          getLatestRelevantChangeTimestampMsFn: () => 1_700_000_000_900,
          loadMutationReportFn: () => ({
            config: {
              mutate: ["src/lib/security/**/*.ts"],
            },
          }),
          isReportFreshEnoughFn,
        }),
      ).not.toThrow();
      expect(isReportFreshEnoughFn).toHaveBeenCalledWith(
        mutationCheck.REPORT_PATH,
        1_700_000_000_900,
      );
    });

    it("rejects a fresh report when mutate scope misses the touched protected directory", () => {
      const isReportFreshEnoughFn = vi.fn(() => true);

      expect(() =>
        mutationCheck.main({
          getChangedFilesFn: () => ["src/lib/security/rate-limit.ts"],
          getTouchedTargetDirectoriesFn:
            mutationCheck.getTouchedTargetDirectories,
          getMergeBaseTimestampMsFn: () => 1_700_000_000_000,
          getLatestRelevantChangeTimestampMsFn: () => 1_700_000_000_900,
          loadMutationReportFn: () => ({
            config: {
              mutate: ["src/lib/lead-pipeline/**/*.ts"],
            },
          }),
          isReportFreshEnoughFn,
        }),
      ).toThrow(
        [
          "变异测试报告 scope 不覆盖本次改动。",
          "命中目录: src/lib/security/",
          "报告 mutate scope: src/lib/lead-pipeline/**/*.ts",
          "未覆盖目录: src/lib/security/",
          "请运行 pnpm test:mutation 并更新 reports/mutation/mutation-report.json",
        ].join("\n"),
      );
      expect(isReportFreshEnoughFn).toHaveBeenCalledWith(
        mutationCheck.REPORT_PATH,
        1_700_000_000_900,
      );
    });
  });
});
