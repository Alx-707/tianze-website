import { beforeEach, describe, expect, it, vi } from "vitest";
// Test subject
import {
  loadCriticalMessages,
  loadDeferredMessages,
} from "@/lib/load-messages";

// Hoisted mocks
vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: (..._args: unknown[]) => {},
    warn: (..._args: unknown[]) => {},
    info: (..._args: unknown[]) => {},
    debug: (..._args: unknown[]) => {},
  },
}));

describe("Load Messages - Fallback Behavior", () => {
  beforeEach(() => {
    // Force network failure and ensure fs fallback cannot find file
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network fail")),
    );
    vi.spyOn(process, "cwd").mockReturnValue("/__vitest_nonexistent__");
  });

  it("should throw error when both fetch and file read fail", async () => {
    await expect(loadCriticalMessages("en" as "en" | "zh")).rejects.toThrow(
      "Cannot load critical messages for en",
    );
  });

  it("should sanitize invalid locale and throw on failures", async () => {
    // Invalid locale gets sanitized to default ('en'), then throws
    await expect(
      loadCriticalMessages("invalid-locale" as "en" | "zh"),
    ).rejects.toThrow("Cannot load critical messages for en");
  });
});

// Deferred messages fallback symmetry tests
describe("Load Deferred Messages - Fallback Behavior", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network fail")),
    );
    vi.spyOn(process, "cwd").mockReturnValue("/__vitest_nonexistent__");
  });

  it("should throw error when deferred fetch and file read both fail", async () => {
    await expect(loadDeferredMessages("en" as "en" | "zh")).rejects.toThrow(
      "Cannot load deferred messages for en",
    );
  });

  it("should sanitize invalid locale for deferred and throw on failures", async () => {
    await expect(
      loadDeferredMessages("invalid-locale" as "en" | "zh"),
    ).rejects.toThrow("Cannot load deferred messages for en");
  });
});

// Cache layer verification: unstable_cache passthrough should return fresh data on each call.
// In test environment (isCiEnv=true), loadCore uses the filesystem path — this verifies that
// the fallback chain works correctly without any additional caching layers.
describe("Load Messages - Cache passthrough consistency", () => {
  it("with unstable_cache bypassed, each call can return independently loaded data", async () => {
    // unstable_cache is mocked as passthrough (fn) => fn, so each call invokes the real function.
    // This confirms no hidden state accumulates between calls when cache is bypassed.
    const cwdSpy = vi
      .spyOn(process, "cwd")
      .mockReturnValue("/__vitest_nonexistent__");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("no network")));

    // Both calls should independently throw (no stale data returned from a second cache layer)
    await expect(loadCriticalMessages("en" as "en" | "zh")).rejects.toThrow();
    await expect(loadDeferredMessages("zh" as "en" | "zh")).rejects.toThrow();

    cwdSpy.mockRestore();
  });
});
