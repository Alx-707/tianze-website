import { beforeEach, describe, expect, it, vi } from "vitest";

import { RedisRateLimitStore } from "@/lib/security/stores/rate-limit-store";

describe("rate-limit-store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("RedisRateLimitStore", () => {
    it("uses an atomic transaction for increment and ttl assignment", async () => {
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

      expect(result.count).toBe(1);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.upstash.io/multi-exec",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify([
            ["INCR", "unsafe/key?value=yes"],
            ["PEXPIRE", "unsafe/key?value=yes", "60000", "NX"],
            ["PTTL", "unsafe/key?value=yes"],
          ]),
        }),
      );
    });

    it("gets count and ttl via POST pipeline instead of path-style REST", async () => {
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

      expect(result?.count).toBe(3);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.upstash.io/pipeline",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify([
            ["GET", "unsafe/key?value=yes"],
            ["PTTL", "unsafe/key?value=yes"],
          ]),
        }),
      );
    });

    it("deletes via DEL command body instead of HTTP DELETE path", async () => {
      const fetchMock = vi.fn(
        async () =>
          new Response(JSON.stringify({ result: 1 }), { status: 200 }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const store = new RedisRateLimitStore("https://example.upstash.io", "t");
      await store.delete("unsafe/key?value=yes");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.upstash.io",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(["DEL", "unsafe/key?value=yes"]),
        }),
      );
    });
  });
});
