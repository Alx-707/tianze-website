import { describe, expect, it } from "vitest";
import { getSiteMessageOverride } from "@/sites/message-overrides";

describe("site message overrides", () => {
  it("returns empty overrides for the default tianze site", () => {
    expect(getSiteMessageOverride("tianze", "en", "critical")).toEqual({});
  });

  it("returns equipment overrides for the second site pilot", () => {
    const critical = getSiteMessageOverride(
      "tianze-equipment",
      "en",
      "critical",
    ) as {
      seo?: { siteName?: string };
      home?: { hero?: { title?: string } };
    };

    expect(critical.seo?.siteName).toBe("Tianze Equipment");
    expect(critical.home?.hero?.title).toBe("Build Your Pipe Bending Line.");
  });
});
