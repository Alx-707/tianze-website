import { describe, expect, it, vi } from "vitest";
import {
  isAllowedThirdPartyUrl,
  safeFetchThirdPartyUrl,
  type ThirdPartyUrlPolicy,
} from "../safe-third-party-fetch";

const POLICY: ThirdPartyUrlPolicy = {
  allowHosts: ["graph.facebook.com"],
  allowHostSuffixes: ["fbcdn.net", "fbsbx.com"],
};

describe("safe-third-party-fetch", () => {
  describe("isAllowedThirdPartyUrl", () => {
    it("accepts exact allowlisted hosts case-insensitively", () => {
      expect(
        isAllowedThirdPartyUrl("https://GRAPH.FACEBOOK.COM/path", POLICY),
      ).toEqual({
        allowed: true,
        url: new URL("https://graph.facebook.com/path"),
      });
    });

    it("accepts suffix allowlisted subdomains with dot boundary", () => {
      const allowed = isAllowedThirdPartyUrl(
        "https://lookaside.fbsbx.com/file",
        POLICY,
      );

      expect(allowed).toEqual({
        allowed: true,
        url: new URL("https://lookaside.fbsbx.com/file"),
      });
      expect(
        isAllowedThirdPartyUrl("https://evilfbsbx.com/file", POLICY),
      ).toEqual({
        allowed: false,
        reason: "Hostname not in allowlist: evilfbsbx.com",
      });
    });

    it("rejects malformed or unsafe base URLs", () => {
      expect(isAllowedThirdPartyUrl("not a url", POLICY)).toEqual({
        allowed: false,
        reason: "Invalid URL",
      });
      expect(
        isAllowedThirdPartyUrl("http://graph.facebook.com", POLICY),
      ).toEqual({
        allowed: false,
        reason: "Only https: URLs are allowed",
      });
      expect(
        isAllowedThirdPartyUrl("https://user:pass@graph.facebook.com", POLICY),
      ).toEqual({
        allowed: false,
        reason: "URL must not include credentials",
      });
    });

    it("rejects localhost and ip literals", () => {
      expect(isAllowedThirdPartyUrl("https://localhost/test", POLICY)).toEqual({
        allowed: false,
        reason: "localhost is not allowed",
      });
      expect(isAllowedThirdPartyUrl("https://127.0.0.1/test", POLICY)).toEqual({
        allowed: false,
        reason: "IP literals are not allowed",
      });
      expect(
        isAllowedThirdPartyUrl("https://[2001:db8::1]/test", POLICY),
      ).toEqual({
        allowed: false,
        reason: "IP literals are not allowed",
      });
    });

    it("rejects malformed ipv4-looking hostnames and credential variants", () => {
      expect(isAllowedThirdPartyUrl("https://1.2.3./test", POLICY)).toEqual({
        allowed: false,
        reason: "IP literals are not allowed",
      });
      expect(isAllowedThirdPartyUrl("https://1.2.3.9a/test", POLICY)).toEqual({
        allowed: false,
        reason: "Hostname not in allowlist: 1.2.3.9a",
      });
      expect(isAllowedThirdPartyUrl("https://256.1.1.1/test", POLICY)).toEqual({
        allowed: false,
        reason: "Invalid URL",
      });
      expect(
        isAllowedThirdPartyUrl("https://user@graph.facebook.com", POLICY),
      ).toEqual({
        allowed: false,
        reason: "URL must not include credentials",
      });
    });

    it("rejects hosts outside the allowlist", () => {
      expect(
        isAllowedThirdPartyUrl("https://example.com/asset", POLICY),
      ).toEqual({
        allowed: false,
        reason: "Hostname not in allowlist: example.com",
      });
      expect(isAllowedThirdPartyUrl("https://fbcdn.net/asset", POLICY)).toEqual(
        {
          allowed: true,
          url: new URL("https://fbcdn.net/asset"),
        },
      );
    });

    it("supports host-only and suffix-only policies independently", () => {
      expect(
        isAllowedThirdPartyUrl("https://graph.facebook.com/asset", {
          allowHosts: ["graph.facebook.com"],
        }),
      ).toEqual({
        allowed: true,
        url: new URL("https://graph.facebook.com/asset"),
      });
      expect(
        isAllowedThirdPartyUrl("https://lookaside.fbsbx.com/asset", {
          allowHostSuffixes: ["fbsbx.com"],
        }),
      ).toEqual({
        allowed: true,
        url: new URL("https://lookaside.fbsbx.com/asset"),
      });
      expect(
        isAllowedThirdPartyUrl("https://graph.facebook.com/asset", {}),
      ).toEqual({
        allowed: false,
        reason: "Hostname not in allowlist: graph.facebook.com",
      });
    });
  });

  describe("safeFetchThirdPartyUrl", () => {
    it("throws before fetch when initial URL is unsafe", async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      await expect(
        safeFetchThirdPartyUrl("http://example.com", {}, { policy: POLICY }),
      ).rejects.toThrow("Unsafe third-party URL: Only https: URLs are allowed");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("forces manual redirects and returns direct non-redirect responses", async () => {
      const response = new Response("ok", { status: 200 });
      const fetchMock = vi.fn(async () => response);
      vi.stubGlobal("fetch", fetchMock);

      const result = await safeFetchThirdPartyUrl(
        "https://graph.facebook.com/avatar",
        { method: "GET", headers: { Accept: "application/json" } },
        { policy: POLICY },
      );

      expect(result).toBe(response);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://graph.facebook.com/avatar",
        expect.objectContaining({
          method: "GET",
          redirect: "manual",
        }),
      );
    });

    it("follows allowed redirects until the final response", async () => {
      const redirect = new Response(null, {
        status: 302,
        headers: { location: "https://static.fbcdn.net/image.jpg" },
      });
      const finalResponse = new Response("image", { status: 200 });
      const fetchMock = vi
        .fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>()
        .mockResolvedValueOnce(redirect)
        .mockResolvedValueOnce(finalResponse);
      vi.stubGlobal("fetch", fetchMock);

      const result = await safeFetchThirdPartyUrl(
        "https://graph.facebook.com/avatar",
        {},
        { policy: POLICY, maxRedirects: 1 },
      );

      expect(result).toBe(finalResponse);
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "https://static.fbcdn.net/image.jpg",
        expect.objectContaining({ redirect: "manual" }),
      );
    });

    it("stops after the configured number of redirects", async () => {
      const firstRedirect = new Response(null, {
        status: 302,
        headers: { location: "https://lookaside.fbsbx.com/step-1" },
      });
      const secondRedirect = new Response(null, {
        status: 302,
        headers: { location: "https://static.fbcdn.net/step-2" },
      });
      const fetchMock = vi
        .fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>()
        .mockResolvedValueOnce(firstRedirect)
        .mockResolvedValueOnce(secondRedirect);
      vi.stubGlobal("fetch", fetchMock);

      const result = await safeFetchThirdPartyUrl(
        "https://graph.facebook.com/avatar",
        {},
        { policy: POLICY, maxRedirects: 1 },
      );

      expect(result).toBe(secondRedirect);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("returns the redirect response when redirects are exhausted or location is missing", async () => {
      const redirectWithoutLocation = new Response(null, { status: 302 });
      const redirectWithLocation = new Response(null, {
        status: 301,
        headers: { location: "https://lookaside.fbsbx.com/file" },
      });
      const fetchMock = vi
        .fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>()
        .mockResolvedValueOnce(redirectWithoutLocation)
        .mockResolvedValueOnce(redirectWithLocation);
      vi.stubGlobal("fetch", fetchMock);

      await expect(
        safeFetchThirdPartyUrl(
          "https://graph.facebook.com/no-location",
          {},
          { policy: POLICY },
        ),
      ).resolves.toBe(redirectWithoutLocation);

      await expect(
        safeFetchThirdPartyUrl(
          "https://graph.facebook.com/limit",
          {},
          {
            policy: POLICY,
            maxRedirects: 0,
          },
        ),
      ).resolves.toBe(redirectWithLocation);
    });

    it("does not follow real redirect statuses when maxRedirects is zero", async () => {
      const redirect = new Response(null, {
        status: 302,
        headers: { location: "https://lookaside.fbsbx.com/step-1" },
      });
      const fetchMock = vi
        .fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>()
        .mockResolvedValueOnce(redirect);
      vi.stubGlobal("fetch", fetchMock);

      const result = await safeFetchThirdPartyUrl(
        "https://graph.facebook.com/avatar",
        {},
        { policy: POLICY, maxRedirects: 0 },
      );

      expect(result).toBe(redirect);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("does not treat 304 as a followable redirect", async () => {
      const notModified = new Response(null, {
        status: 304,
        headers: { location: "https://lookaside.fbsbx.com/file" },
      });
      const fetchMock = vi.fn(async () => notModified);
      vi.stubGlobal("fetch", fetchMock);

      const result = await safeFetchThirdPartyUrl(
        "https://graph.facebook.com/cacheable",
        {},
        { policy: POLICY },
      );

      expect(result).toBe(notModified);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("does not treat HTTP 300 as a followable redirect", async () => {
      const multipleChoices = new Response(null, {
        status: 300,
        headers: { location: "https://lookaside.fbsbx.com/file" },
      });
      const fetchMock = vi.fn(async () => multipleChoices);
      vi.stubGlobal("fetch", fetchMock);

      const result = await safeFetchThirdPartyUrl(
        "https://graph.facebook.com/multiple-choice",
        {},
        { policy: POLICY },
      );

      expect(result).toBe(multipleChoices);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("throws when a redirect target is outside the allowlist", async () => {
      const redirect = new Response(null, {
        status: 302,
        headers: { location: "https://example.com/steal" },
      });
      const fetchMock = vi.fn(async () => redirect);
      vi.stubGlobal("fetch", fetchMock);

      await expect(
        safeFetchThirdPartyUrl(
          "https://graph.facebook.com/avatar",
          {},
          { policy: POLICY },
        ),
      ).rejects.toThrow(
        "Unsafe redirect URL: Hostname not in allowlist: example.com",
      );
    });

    it("falls back to the default redirect budget when maxRedirects is negative", async () => {
      const redirect1 = new Response(null, {
        status: 302,
        headers: { location: "https://lookaside.fbsbx.com/step-1" },
      });
      const redirect2 = new Response(null, {
        status: 302,
        headers: { location: "https://cdn.fbcdn.net/step-2" },
      });
      const finalResponse = new Response("done", { status: 200 });
      const fetchMock = vi
        .fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>()
        .mockResolvedValueOnce(redirect1)
        .mockResolvedValueOnce(redirect2)
        .mockResolvedValueOnce(finalResponse);
      vi.stubGlobal("fetch", fetchMock);

      const result = await safeFetchThirdPartyUrl(
        "https://graph.facebook.com/avatar",
        {},
        {
          policy: {
            ...POLICY,
            allowHosts: [...(POLICY.allowHosts ?? []), "cdn.fbcdn.net"],
          },
          maxRedirects: -1,
        },
      );

      expect(result).toBe(finalResponse);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("stops after the default redirect budget instead of looping forever", async () => {
      const redirect1 = new Response(null, {
        status: 302,
        headers: { location: "https://lookaside.fbsbx.com/step-1" },
      });
      const redirect2 = new Response(null, {
        status: 302,
        headers: { location: "https://cdn.fbcdn.net/step-2" },
      });
      const redirect3 = new Response(null, {
        status: 302,
        headers: { location: "https://cdn.fbcdn.net/step-3" },
      });
      const fetchMock = vi
        .fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>()
        .mockResolvedValueOnce(redirect1)
        .mockResolvedValueOnce(redirect2)
        .mockResolvedValueOnce(redirect3);
      vi.stubGlobal("fetch", fetchMock);

      const result = await safeFetchThirdPartyUrl(
        "https://graph.facebook.com/avatar",
        {},
        {
          policy: {
            ...POLICY,
            allowHosts: [...(POLICY.allowHosts ?? []), "cdn.fbcdn.net"],
          },
        },
      );

      expect(result).toBe(redirect3);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });
});
