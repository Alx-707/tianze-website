import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCachedMessages,
  I18nPerformanceMonitor,
  TranslationCache,
} from "../i18n-performance";

// Ensure React cache doesn't memoize across test runs
vi.mock("react", () => ({
  cache: (fn: any) => fn,
}));

describe("i18n-performance: network failure fallbacks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // reset singletons
    (TranslationCache as any).instance = undefined;
    I18nPerformanceMonitor.reset();
  });

  it("returns {} and records error when fetch rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network fail")),
    );

    const messages = await getCachedMessages("en");
    expect(messages).toStrictEqual({});

    const metrics = I18nPerformanceMonitor.getMetrics();
    expect(metrics.totalErrors).toBeGreaterThanOrEqual(1);
  });

  it("returns {} and records error when fetch responds non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }),
    );

    const messages = await getCachedMessages("zh");
    expect(messages).toStrictEqual({});

    const metrics = I18nPerformanceMonitor.getMetrics();
    expect(metrics.totalErrors).toBeGreaterThanOrEqual(1);
  });
});
