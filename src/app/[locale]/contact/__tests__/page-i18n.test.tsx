import { describe, expect, it } from "vitest";
import { getPageBySlug } from "@/lib/content";
import { extractFaqFromMetadata } from "@/lib/content/mdx-faq";

describe("Contact page MDX i18n", () => {
  it("stores contact FAQ copy in localized MDX frontmatter", async () => {
    const en = extractFaqFromMetadata(
      (await getPageBySlug("contact", "en")).metadata,
    );
    const zh = extractFaqFromMetadata(
      (await getPageBySlug("contact", "zh")).metadata,
    );

    expect(en[0]?.question).toContain("minimum order quantity");
    expect(zh[0]?.question).toContain("最小起订量");
  });
});
