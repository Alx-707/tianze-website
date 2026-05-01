import { describe, expect, it } from "vitest";
import { generateMetadataForPath } from "@/lib/seo-metadata";

describe("SEO metadata characterization", () => {
  it("keeps contact canonical and locale alternates on production-like URLs", () => {
    const metadata = generateMetadataForPath({
      locale: "en",
      pageType: "contact",
      path: "/contact",
    });

    expect(metadata.alternates?.canonical).toMatch(
      /^https:\/\/[^/]+\/en\/contact$/,
    );
    expect(metadata.alternates?.canonical).toContain("/en/contact");
    expect(metadata.alternates?.canonical).not.toContain("localhost");
    expect(metadata.alternates?.languages).toMatchObject({
      en: expect.stringContaining("/en/contact"),
      zh: expect.stringContaining("/zh/contact"),
      "x-default": expect.stringContaining("/en/contact"),
    });
  });
});
