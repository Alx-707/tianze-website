import { describe, expect, it } from "vitest";
import {
  buildProductFamilyContactHref,
  parseProductFamilyContactContext,
} from "@/lib/contact/product-family-context";

const messages = {
  catalog: {
    markets: {
      "north-america": {
        label: "UL / ASTM Series",
      },
    },
    families: {
      "north-america": {
        couplings: {
          label: "Couplings",
        },
      },
    },
  },
};

describe("product-family contact context", () => {
  it("builds a Contact href object with internal slugs only", () => {
    expect(
      buildProductFamilyContactHref({
        marketSlug: "north-america",
        familySlug: "couplings",
      }),
    ).toEqual({
      pathname: "/contact",
      query: {
        intent: "product-family",
        market: "north-america",
        family: "couplings",
      },
    });
  });

  it("parses valid product family context and resolves trusted labels", () => {
    const context = parseProductFamilyContactContext({
      searchParams: {
        intent: "product-family",
        market: "north-america",
        family: "couplings",
      },
      messages,
    });

    expect(context).toEqual({
      intent: "product-family",
      marketSlug: "north-america",
      familySlug: "couplings",
      marketLabel: "UL / ASTM Series",
      familyLabel: "Couplings",
    });
  });

  it("ignores invalid family slugs", () => {
    const context = parseProductFamilyContactContext({
      searchParams: {
        intent: "product-family",
        market: "north-america",
        family: "<script>alert(1)</script>",
      },
      messages,
    });

    expect(context).toBeNull();
  });

  it("ignores wrong intents", () => {
    const context = parseProductFamilyContactContext({
      searchParams: {
        intent: "raw-message",
        market: "north-america",
        family: "couplings",
      },
      messages,
    });

    expect(context).toBeNull();
  });
});
