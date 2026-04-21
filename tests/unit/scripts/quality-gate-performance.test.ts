import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("fs", () => ({
  existsSync: vi.fn(() => false),
  readFileSync: vi.fn(() => "{}"),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

vi.mock("glob", () => ({
  sync: vi.fn(() => []),
}));

const { QualityGate } = await import("../../../scripts/quality-gate.js");

describe("QualityGate performance gate", () => {
  let gate: InstanceType<typeof QualityGate>;

  beforeEach(() => {
    vi.clearAllMocks();
    gate = new QualityGate();
  });

  it("marks build failures as failed and does not overwrite them to passed", async () => {
    const buildSpy = vi.spyOn(gate, "runBuildCommand").mockReturnValue({
      status: 1,
      stdout: "",
      stderr: "build boom",
    });
    const perfSpy = vi
      .spyOn(gate, "runPerformanceTests")
      .mockImplementation(() => "");

    const result = await gate.checkPerformance();

    expect(result.status).toBe("failed");
    expect(result.issues).toContain("构建失败（退出码 1）");
    expect(buildSpy).toHaveBeenCalled();
    expect(perfSpy).not.toHaveBeenCalled();
  });

  it("fails when build logs contain MISSING_MESSAGE", async () => {
    vi.spyOn(gate, "runBuildCommand").mockReturnValue({
      status: 0,
      stdout: "MISSING_MESSAGE: contact.form.submit",
      stderr: "",
    });
    const perfSpy = vi
      .spyOn(gate, "runPerformanceTests")
      .mockImplementation(() => "");

    const result = await gate.checkPerformance();

    expect(result.status).toBe("failed");
    expect(result.issues).toContain(
      "next-intl MISSING_MESSAGE detected in build logs",
    );
    expect(perfSpy).not.toHaveBeenCalled();
  });

  it("passes when build and test timings stay under thresholds", async () => {
    vi.spyOn(gate, "runBuildCommand").mockReturnValue({
      status: 0,
      stdout: "",
      stderr: "",
    });
    const perfSpy = vi
      .spyOn(gate, "runPerformanceTests")
      .mockImplementation(() => "");
    const dateNowSpy = vi
      .spyOn(Date, "now")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(1_000)
      .mockReturnValueOnce(1_000)
      .mockReturnValueOnce(2_000);

    const result = await gate.checkPerformance();

    expect(result.status).toBe("passed");
    expect(result.issues).toEqual([]);
    expect(result.checks.buildTime).toBe(1_000);
    expect(result.checks.testTime).toBe(1_000);
    expect(perfSpy).toHaveBeenCalled();
    dateNowSpy.mockRestore();
  });

  it("keeps threshold overages as warning when execution succeeds", async () => {
    vi.spyOn(gate, "runBuildCommand").mockReturnValue({
      status: 0,
      stdout: "",
      stderr: "",
    });
    vi.spyOn(gate, "runPerformanceTests").mockImplementation(() => "");
    const dateNowSpy = vi
      .spyOn(Date, "now")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(130_000)
      .mockReturnValueOnce(130_000)
      .mockReturnValueOnce(320_000);

    const result = await gate.checkPerformance();

    expect(result.status).toBe("warning");
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining("构建时间"),
        expect.stringContaining("测试时间"),
      ]),
    );
    dateNowSpy.mockRestore();
  });
});
