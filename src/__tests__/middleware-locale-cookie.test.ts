import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

// Avoid importing next-intl's real middleware implementation in unit tests.
// It relies on Next.js runtime-specific module resolution that isn't available in Vitest.
vi.mock("next-intl/middleware", () => ({
  default: () => () => {
    throw new Error("next-intl middleware should not be invoked in this test");
  },
}));

import middleware from "../../middleware";

function countOccurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

describe("middleware locale cookie", () => {
  it("sets NEXT_LOCALE cookie once (no duplicate Set-Cookie header)", () => {
    const request = new NextRequest("http://localhost/en/about", {
      headers: {
        cookie: "NEXT_LOCALE=zh",
      },
    });

    const response = middleware(request);

    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(countOccurrences(setCookie, "NEXT_LOCALE=")).toBe(1);
  });

  it("sets NEXT_LOCALE cookie with max-age (persisted preference)", () => {
    const request = new NextRequest("http://localhost/en/about", {
      headers: {
        cookie: "NEXT_LOCALE=zh",
      },
    });

    const response = middleware(request);
    const setCookie = (response.headers.get("set-cookie") ?? "").toLowerCase();

    expect(setCookie).toContain("next_locale=");
    expect(setCookie).toContain("max-age=31536000");
    expect(setCookie).toContain("samesite=lax");
  });

  it("redirects invalid locale prefix to default locale and persists cookie", () => {
    const request = new NextRequest("http://localhost/fr/about", {
      headers: {
        cookie: "NEXT_LOCALE=zh",
      },
    });

    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/en/about");

    const setCookie = (response.headers.get("set-cookie") ?? "").toLowerCase();
    expect(setCookie).toContain("next_locale=en");
    expect(setCookie).toContain("max-age=31536000");
  });
});
