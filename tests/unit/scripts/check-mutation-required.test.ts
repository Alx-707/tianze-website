import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mutationCheck =
  await import("../../../scripts/check-mutation-required.js");

describe("check-mutation-required", () => {
  let tempDir: string;

  beforeEach(() => {
    vi.clearAllMocks();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mutation-check-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  function writeFileWithMtime(
    relativePath: string,
    mtimeMs: number,
    content = "x",
  ) {
    const absolutePath = path.join(tempDir, relativePath);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- temp test workspace path is synthesized inside the test sandbox
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- temp test workspace path is synthesized inside the test sandbox
    fs.writeFileSync(absolutePath, content);
    const timestamp = new Date(mtimeMs);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- temp test workspace path is synthesized inside the test sandbox
    fs.utimesSync(absolutePath, timestamp, timestamp);
    return absolutePath;
  }

  describe("getLatestRelevantChangeTimestampMs", () => {
    it("uses the latest working-tree mtime for touched protected files", () => {
      writeFileWithMtime("src/lib/security/rate-limit.ts", 2_500);
      writeFileWithMtime("src/lib/lead-pipeline/submit.ts", 4_500);

      const latest = mutationCheck.getLatestRelevantChangeTimestampMs(
        [
          "src/lib/security/rate-limit.ts",
          "src/lib/lead-pipeline/submit.ts",
          "src/components/hero.tsx",
        ],
        {
          cwd: tempDir,
        },
      );

      expect(latest).toBe(4_500);
    });

    it("falls back to the latest committed timestamp when the touched file was deleted", () => {
      const latest = mutationCheck.getLatestRelevantChangeTimestampMs(
        ["src/lib/security/deleted-guard.ts"],
        {
          cwd: tempDir,
          getLatestCommittedChangeTimestampMsFn: () => 1_710_000_000_000,
        },
      );

      expect(latest).toBe(1_710_000_000_000);
    });
  });

  describe("main freshness enforcement", () => {
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
