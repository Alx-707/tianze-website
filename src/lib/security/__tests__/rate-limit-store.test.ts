import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockLoggerInfo = vi.hoisted(() => vi.fn());
const mockLoggerWarn = vi.hoisted(() => vi.fn());
const mockLoggerError = vi.hoisted(() => vi.fn());

vi.mock("@/lib/logger", () => ({
  logger: {
    info: mockLoggerInfo,
    warn: mockLoggerWarn,
    error: mockLoggerError,
    debug: vi.fn(),
  },
}));

import {
  getUpstashPipelineResults,
  hasUpstashResultProperty,
  MemoryRateLimitStore,
  parseLenientTTL,
  parseStrictNumber,
  RedisRateLimitStore,
  createRateLimitStore,
  resetRateLimitStoreWarnings,
  unwrapUpstashResult,
} from "@/lib/security/stores/rate-limit-store";

function setEnv(key: string, value: string | undefined): void {
  const env = process.env as Record<string, string | undefined>;
  if (value === undefined) {
    delete env[key];
  } else {
    env[key] = value;
  }
}

describe("rate-limit-store", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    process.env = { ...originalEnv };
    resetRateLimitStoreWarnings();
    setEnv("UPSTASH_REDIS_REST_URL", undefined);
    setEnv("UPSTASH_REDIS_REST_TOKEN", undefined);
    setEnv("KV_REST_API_URL", undefined);
    setEnv("KV_REST_API_TOKEN", undefined);
    setEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    process.env = originalEnv;
    resetRateLimitStoreWarnings();
  });

  describe("RedisRateLimitStore", () => {
    it("uses an atomic transaction for increment and ttl assignment", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-04-19T00:00:00.000Z"));

      const fetchMock = vi.fn(
        async () =>
          new Response(
            JSON.stringify([{ result: 1 }, { result: 1 }, { result: 60_000 }]),
            { status: 200 },
          ),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");
      const result = await store.increment("unsafe/key?value=yes", 60_000);

      expect(result).toEqual({
        count: 1,
        expiresAt: Date.now() + 60_000,
      });
      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.upstash.io/multi-exec",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer t",
            "Content-Type": "application/json",
          },
          body: JSON.stringify([
            ["INCR", "unsafe/key?value=yes"],
            ["PEXPIRE", "unsafe/key?value=yes", "60000", "NX"],
            ["PTTL", "unsafe/key?value=yes"],
          ]),
        },
      );
    });

    it("accepts Upstash object-wrapped multi-exec results", async () => {
      const fetchMock = vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              result: [{ result: 2 }, { result: 1 }, { result: 30_000 }],
            }),
            { status: 200 },
          ),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");
      const result = await store.increment("wrapped-result-key", 30_000);

      expect(result.count).toBe(2);
      expect(result.expiresAt).toBeGreaterThan(Date.now());
    });

    it("rejects increment payloads that do not contain pipeline results", async () => {
      const fetchMock = vi.fn(
        async () =>
          new Response(JSON.stringify({ result: "oops" }), { status: 200 }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");

      await expect(store.increment("idem:key", 60_000)).rejects.toThrow(
        "numeric count",
      );
    });

    it("throws when increment returns a null payload", async () => {
      const fetchMock = vi.fn(
        async () => new Response(JSON.stringify(null), { status: 200 }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");

      await expect(store.increment("idem:key", 60_000)).rejects.toThrow(
        "numeric count",
      );
    });

    it("logs and throws when increment receives a non-ok response", async () => {
      const fetchMock = vi.fn(
        async () =>
          new Response("bad gateway", {
            status: 503,
            statusText: "Service Unavailable",
          }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");

      await expect(store.increment("idem:key", 60_000)).rejects.toThrow(
        "Upstash rate limit operation failed: 503",
      );
      expect(mockLoggerError).toHaveBeenCalledWith(
        "[Rate Limit] Upstash pipeline failed: Service Unavailable",
      );
    });

    it("throws when the atomic increment transaction returns an invalid ttl", async () => {
      const fetchMock = vi.fn(
        async () =>
          new Response(
            JSON.stringify([{ result: 1 }, { result: 1 }, { result: -1 }]),
            { status: 200 },
          ),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");

      await expect(store.increment("idem:key", 60_000)).rejects.toThrow(
        "invalid TTL",
      );
      expect(mockLoggerError).toHaveBeenCalledWith(
        "[Rate Limit] Upstash transaction returned invalid TTL",
      );
    });

    it("accepts zero ttl from the increment transaction", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-04-19T00:00:00.000Z"));

      const fetchMock = vi.fn(
        async () =>
          new Response(
            JSON.stringify([{ result: 1 }, { result: 1 }, { result: 0 }]),
            { status: 200 },
          ),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");
      const result = await store.increment("idem:key", 60_000);

      expect(result).toEqual({ count: 1, expiresAt: Date.now() });
    });

    it("throws when the atomic increment transaction returns a non-numeric count", async () => {
      const fetchMock = vi.fn(
        async () =>
          new Response(
            JSON.stringify([
              { result: "oops" },
              { result: 1 },
              { result: 60_000 },
            ]),
            { status: 200 },
          ),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");

      await expect(store.increment("idem:key", 60_000)).rejects.toThrow(
        "numeric count",
      );
    });

    it("throws when the atomic increment transaction returns a non-numeric ttl", async () => {
      const fetchMock = vi.fn(
        async () =>
          new Response(
            JSON.stringify([
              { result: 1 },
              { result: 1 },
              { result: "not-a-number" },
            ]),
            { status: 200 },
          ),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");

      await expect(store.increment("idem:key", 60_000)).rejects.toThrow(
        "numeric TTL",
      );
    });

    it("gets count and ttl via POST pipeline instead of path-style REST", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-04-19T00:00:00.000Z"));

      const fetchMock = vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              result: [{ result: "3" }, { result: 45_000 }],
            }),
            { status: 200 },
          ),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");
      const result = await store.get("unsafe/key?value=yes");

      expect(result).toEqual({
        count: 3,
        expiresAt: Date.now() + 45_000,
      });
      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.upstash.io/pipeline",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer t",
            "Content-Type": "application/json",
          },
          body: JSON.stringify([
            ["GET", "unsafe/key?value=yes"],
            ["PTTL", "unsafe/key?value=yes"],
          ]),
        },
      );
    });

    it("throws when GET receives a non-ok response", async () => {
      const fetchMock = vi.fn(
        async () =>
          new Response("bad gateway", {
            status: 502,
            statusText: "Bad Gateway",
          }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");

      await expect(store.get("idem:key")).rejects.toThrow(
        "[Rate Limit] Upstash get failed: Bad Gateway",
      );
    });

    it("returns null when GET returns no count", async () => {
      const fetchMock = vi.fn(
        async () =>
          new Response(
            JSON.stringify({ result: [{ result: null }, { result: 45_000 }] }),
            { status: 200 },
          ),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");

      await expect(store.get("idem:key")).resolves.toBeNull();
    });

    it("returns null when GET returns an undefined count", async () => {
      const fetchMock = vi.fn(async () => ({
        ok: true,
        json: async () => ({
          result: [undefined, { result: 45_000 }],
        }),
      }));
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");

      await expect(store.get("idem:key")).resolves.toBeNull();
    });

    it("returns null when GET returns a null payload", async () => {
      const fetchMock = vi.fn(
        async () => new Response(JSON.stringify(null), { status: 200 }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");

      await expect(store.get("idem:key")).resolves.toBeNull();
    });

    it("throws when GET returns a non-numeric count", async () => {
      const fetchMock = vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              result: [{ result: "not-a-number" }, { result: 45_000 }],
            }),
            { status: 200 },
          ),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");

      await expect(store.get("idem:key")).rejects.toThrow("numeric count");
    });

    it("clamps non-finite GET ttl values to zero", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-04-19T00:00:00.000Z"));

      const fetchMock = vi.fn(
        async () =>
          new Response(
            JSON.stringify({ result: [{ result: "3" }, { result: "NaN" }] }),
            { status: 200 },
          ),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");
      const result = await store.get("idem:key");

      expect(result).toEqual({ count: 3, expiresAt: Date.now() });
    });

    it("clamps negative GET ttl values to zero", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-04-19T00:00:00.000Z"));

      const fetchMock = vi.fn(
        async () =>
          new Response(
            JSON.stringify({ result: [{ result: "3" }, { result: -45_000 }] }),
            { status: 200 },
          ),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");
      const result = await store.get("idem:key");

      expect(result).toEqual({ count: 3, expiresAt: Date.now() });
    });

    it("deletes via DEL command body instead of HTTP DELETE path", async () => {
      const fetchMock = vi.fn(
        async () =>
          new Response(JSON.stringify({ result: 1 }), { status: 200 }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");
      await store.delete("unsafe/key?value=yes");

      expect(fetchMock).toHaveBeenCalledWith("https://example.upstash.io", {
        method: "POST",
        headers: {
          Authorization: "Bearer t",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(["DEL", "unsafe/key?value=yes"]),
      });
      expect(mockLoggerError).not.toHaveBeenCalled();
    });

    it("logs delete failures without throwing", async () => {
      const fetchMock = vi.fn(
        async () =>
          new Response("forbidden", {
            status: 403,
            statusText: "Forbidden",
          }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");

      await expect(
        store.delete("unsafe/key?value=yes"),
      ).resolves.toBeUndefined();
      expect(mockLoggerError).toHaveBeenCalledWith(
        "[Rate Limit] Failed to delete rate limit key: Forbidden",
      );
    });
  });

  describe("MemoryRateLimitStore", () => {
    it("increments an existing live entry without extending its expiry", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-04-19T00:00:00.000Z"));

      const store = new MemoryRateLimitStore();
      const first = await store.increment("memory:key", 60_000);
      vi.advanceTimersByTime(10_000);
      const second = await store.increment("memory:key", 60_000);

      expect(first.expiresAt).toBe(Date.now() + 50_000);
      expect(second).toEqual({
        count: 2,
        expiresAt: first.expiresAt,
      });
    });

    it("resets an expired entry instead of incrementing it", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-04-19T00:00:00.000Z"));

      const store = new MemoryRateLimitStore();
      await store.increment("memory:key", 60_000);
      vi.advanceTimersByTime(60_001);

      const result = await store.increment("memory:key", 60_000);

      expect(result).toEqual({
        count: 1,
        expiresAt: Date.now() + 60_000,
      });
    });

    it("returns null for missing entries", async () => {
      const store = new MemoryRateLimitStore();
      await expect(store.get("missing:key")).resolves.toBeNull();
    });

    it("returns the stored entry while it is still active", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-04-19T00:00:00.000Z"));

      const store = new MemoryRateLimitStore();
      const created = await store.increment("memory:key", 60_000);

      await expect(store.get("memory:key")).resolves.toEqual(created);
    });

    it("resets the counter when an entry expires exactly at now", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-04-19T00:00:00.000Z"));

      const store = new MemoryRateLimitStore();
      await store.increment("memory:key", 60_000);
      vi.advanceTimersByTime(60_000);

      const result = await store.increment("memory:key", 60_000);

      expect(result).toEqual({
        count: 1,
        expiresAt: Date.now() + 60_000,
      });
    });

    it("returns null for expired stale entries", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-04-19T00:00:00.000Z"));

      const store = new MemoryRateLimitStore();
      await store.increment("memory:key", 60_000);
      vi.advanceTimersByTime(60_001);

      await expect(store.get("memory:key")).resolves.toBeNull();
    });

    it("deletes keys and resolves without a value", async () => {
      const store = new MemoryRateLimitStore();
      await store.increment("memory:key", 60_000);

      await expect(store.delete("memory:key")).resolves.toBeUndefined();
      await expect(store.get("memory:key")).resolves.toBeNull();
    });
  });

  describe("createRateLimitStore", () => {
    it("returns a Redis store and logs when full Upstash credentials are configured", () => {
      setEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
      setEnv("UPSTASH_REDIS_REST_TOKEN", "secret");

      const store = createRateLimitStore();

      expect(store).toBeInstanceOf(RedisRateLimitStore);
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        "[Rate Limit] Using Upstash Redis store",
      );
      expect(mockLoggerWarn).not.toHaveBeenCalled();
    });

    it("falls back to memory when an Upstash credential is missing", () => {
      setEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");

      const store = createRateLimitStore();

      expect(store).toBeInstanceOf(MemoryRateLimitStore);
      expect(mockLoggerInfo).not.toHaveBeenCalled();
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        "[Rate Limit] Using in-memory store (development only)",
      );
    });

    it("warns about KV fallback in development when both KV credentials exist", () => {
      setEnv("KV_REST_API_URL", "https://example.kv.io");
      setEnv("KV_REST_API_TOKEN", "kv-secret");

      const store = createRateLimitStore();

      expect(store).toBeInstanceOf(MemoryRateLimitStore);
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        "[Rate Limit] KV store detected but Upstash Redis is preferred. Using in-memory fallback for development.",
      );
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        "[Rate Limit] Using in-memory store (development only)",
      );
    });

    it("does not emit the KV fallback warning when only one KV credential exists", () => {
      setEnv("KV_REST_API_URL", "https://example.kv.io");

      const store = createRateLimitStore();

      expect(store).toBeInstanceOf(MemoryRateLimitStore);
      expect(mockLoggerWarn).toHaveBeenCalledTimes(1);
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        "[Rate Limit] Using in-memory store (development only)",
      );
    });

    it("logs the in-memory warning only once until reset", () => {
      createRateLimitStore();
      createRateLimitStore();

      expect(mockLoggerWarn).toHaveBeenCalledTimes(1);

      resetRateLimitStoreWarnings();
      createRateLimitStore();

      expect(mockLoggerWarn).toHaveBeenCalledTimes(2);
    });

    it("logs the initial in-memory warning before any reset helper runs", async () => {
      vi.resetModules();

      const { createRateLimitStore: createFreshStore } =
        await import("@/lib/security/stores/rate-limit-store");

      const store = createFreshStore();

      expect(store.constructor.name).toBe("MemoryRateLimitStore");
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        "[Rate Limit] Using in-memory store (development only)",
      );
    });

    it("throws the production Upstash requirement error when Redis is missing", () => {
      setEnv("NODE_ENV", "production");

      expect(() => createRateLimitStore()).toThrow(
        "[Rate Limit] Production requires Upstash Redis. Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
      );
    });

    it("throws the KV-only production error when only KV credentials are configured", () => {
      setEnv("NODE_ENV", "production");
      setEnv("KV_REST_API_URL", "https://example.kv.io");
      setEnv("KV_REST_API_TOKEN", "kv-secret");

      expect(() => createRateLimitStore()).toThrow(
        "[Rate Limit] KV-only rate limiting is not allowed in production. Configure Upstash Redis for distributed rate limiting.",
      );
    });

    it("treats partial KV credentials in production as a missing Upstash setup", () => {
      setEnv("NODE_ENV", "production");
      setEnv("KV_REST_API_URL", "https://example.kv.io");

      expect(() => createRateLimitStore()).toThrow(
        "[Rate Limit] Production requires Upstash Redis. Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
      );
    });
  });

  describe("Upstash helper parsing", () => {
    it("recognizes only non-null objects with a result property", () => {
      expect(hasUpstashResultProperty({ result: 1 })).toBe(true);
      expect(hasUpstashResultProperty({ value: 1 })).toBe(false);
      expect(hasUpstashResultProperty(null)).toBe(false);
    });

    it("unwraps envelopes and preserves non-envelope values", () => {
      expect(unwrapUpstashResult({ result: 3 })).toBe(3);
      expect(unwrapUpstashResult("plain")).toBe("plain");
      expect(unwrapUpstashResult(null)).toBeNull();
    });

    it("extracts pipeline results only from arrays or object-wrapped arrays", () => {
      expect(getUpstashPipelineResults([{ result: 1 }])).toEqual([
        { result: 1 },
      ]);
      expect(getUpstashPipelineResults({ result: [{ result: 2 }] })).toEqual([
        { result: 2 },
      ]);
      expect(getUpstashPipelineResults({ result: "oops" })).toEqual([]);
      expect(getUpstashPipelineResults({})).toEqual([]);
    });

    it("rejects non-finite strict numbers instead of silently accepting them", () => {
      expect(parseStrictNumber({ result: 3 }, "count")).toBe(3);
      expect(() => parseStrictNumber(NaN, "count")).toThrow("numeric count");
      expect(() => parseStrictNumber(null, "count")).toThrow("numeric count");
    });

    it("clamps lenient ttl parsing to zero for invalid or negative values", () => {
      expect(parseLenientTTL({ result: 5_000 })).toBe(5_000);
      expect(parseLenientTTL(-1)).toBe(0);
      expect(parseLenientTTL({ result: "NaN" })).toBe(0);
    });
  });
});
