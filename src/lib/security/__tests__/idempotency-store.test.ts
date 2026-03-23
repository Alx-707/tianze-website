import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createIdempotencyStore,
  RedisIdempotencyStore,
  type IdempotencyEntry,
} from "@/lib/security/stores/idempotency-store";

const mockLoggerInfo = vi.hoisted(() => vi.fn());
const mockLoggerWarn = vi.hoisted(() => vi.fn());
const mockLoggerError = vi.hoisted(() => vi.fn());

vi.mock("@/lib/logger", () => ({
  logger: {
    info: mockLoggerInfo,
    warn: mockLoggerWarn,
    error: mockLoggerError,
  },
}));

function setEnv(key: string, value: string | undefined): void {
  const env = process.env as Record<string, string | undefined>;
  if (value === undefined) {
    delete env[key];
  } else {
    env[key] = value;
  }
}

describe("idempotency-store", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    setEnv("UPSTASH_REDIS_REST_URL", undefined);
    setEnv("UPSTASH_REDIS_REST_TOKEN", undefined);
    setEnv("ALLOW_MEMORY_IDEMPOTENCY", undefined);
    setEnv("NODE_ENV", undefined);
  });

  describe("createIdempotencyStore", () => {
    it("should create Redis store when Upstash credentials are configured", () => {
      setEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
      setEnv("UPSTASH_REDIS_REST_TOKEN", "token");

      const store = createIdempotencyStore();

      expect(store).toBeInstanceOf(RedisIdempotencyStore);
    });

    it("should throw in production without Redis unless override is set", () => {
      setEnv("NODE_ENV", "production");

      expect(() => createIdempotencyStore()).toThrow(
        "Production requires Upstash Redis",
      );
    });
  });

  describe("RedisIdempotencyStore", () => {
    const entry: IdempotencyEntry = {
      status: "PENDING",
      fingerprint: "POST:/api/contact",
      createdAt: 1_700_000_000_000,
      expiresAt: 1_700_000_100_000,
    };

    it("should use SET NX for atomic key claims", async () => {
      const fetchMock = vi.fn(
        async () =>
          new Response(JSON.stringify({ result: "OK" }), { status: 200 }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisIdempotencyStore(
        "https://example.upstash.io",
        "t",
      );
      const claimed = await store.setIfNotExists("idem:key", entry, 60_000);

      expect(claimed).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.upstash.io",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify([
            "SET",
            "idem:key",
            JSON.stringify(entry),
            "PX",
            60_000,
            "NX",
          ]),
        }),
      );
    });
  });
});
