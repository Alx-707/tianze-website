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
