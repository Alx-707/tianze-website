import type { Metadata } from "next";
import { afterEach, describe, expect, it, vi } from "vitest";

const PRODUCTION_LIKE_BASE_URL = "https://metadata-proof.tianze.test";

interface LanguageUrlMap {
  en: URL;
  zh: URL;
  "x-default": URL;
}

async function loadGenerateMetadataForPath(): Promise<
  (typeof import("@/lib/seo-metadata"))["generateMetadataForPath"]
> {
  vi.resetModules();
  vi.doUnmock("@/services/url-generator");
  vi.doMock("@/config/paths", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/config/paths")>();

    return {
      ...actual,
      SITE_CONFIG: {
        ...actual.SITE_CONFIG,
        baseUrl: PRODUCTION_LIKE_BASE_URL,
      },
    };
  });

  const { generateMetadataForPath } = await import("@/lib/seo-metadata");
  return generateMetadataForPath;
}

function parseMetadataUrl(value: unknown): URL {
  if (typeof value !== "string") {
    throw new TypeError("Expected metadata URL to be a string.");
  }

  return new URL(value);
}

function getLanguageUrls(metadata: Metadata): LanguageUrlMap {
  const languages = metadata.alternates?.languages as
    | Record<string, unknown>
    | undefined;

  if (languages === undefined) {
    throw new TypeError("Expected metadata language alternates to exist.");
  }

  return {
    en: parseMetadataUrl(languages.en),
    zh: parseMetadataUrl(languages.zh),
    "x-default": parseMetadataUrl(languages["x-default"]),
  };
}

function expectProductionLikeUrl(url: URL, expectedHost: string): void {
  expect(url.protocol).toBe("https:");
  expect(url.host).toBe(expectedHost);
  expect(url.toString()).not.toContain("localhost");
}

describe("SEO metadata characterization", () => {
  afterEach(() => {
    vi.doUnmock("@/config/paths");
    vi.doUnmock("@/services/url-generator");
    vi.resetModules();
  });

  it("characterizes generateMetadataForPath contact URLs without runtime head duplicate proof", async () => {
    // This covers helper output only; runtime <head> duplicate proof belongs
    // to the page/production-start E2E lane, not this Task 8 gap fix.
    const generateMetadataForPath = await loadGenerateMetadataForPath();
    const metadata = generateMetadataForPath({
      locale: "en",
      pageType: "contact",
      path: "/contact",
    });

    const expectedHost = new URL(PRODUCTION_LIKE_BASE_URL).host;
    const canonical = parseMetadataUrl(metadata.alternates?.canonical);
    const languageUrls = getLanguageUrls(metadata);

    [
      canonical,
      languageUrls.en,
      languageUrls.zh,
      languageUrls["x-default"],
    ].forEach((url) => expectProductionLikeUrl(url, expectedHost));

    expect(canonical.pathname).toBe("/en/contact");
    expect(languageUrls.en.pathname).toBe("/en/contact");
    expect(languageUrls.zh.pathname).toBe("/zh/contact");
    expect(languageUrls["x-default"].pathname).toBe("/en/contact");
  });
});
