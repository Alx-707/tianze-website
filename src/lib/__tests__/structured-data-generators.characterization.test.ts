import type { getTranslations } from "next-intl/server";
import { describe, expect, it } from "vitest";
import {
  buildLocalBusinessSchema,
  generateOrganizationData,
  generateProductGroupData,
  generateWebSiteData,
} from "@/lib/structured-data-generators";

type TranslationFunction = Awaited<ReturnType<typeof getTranslations>>;

const FAKE_PHONE = "+86-518-0000-0000";

const t = ((key: string, options?: { defaultValue?: string }) =>
  options?.defaultValue ?? key) as TranslationFunction;

describe("structured data generators characterization", () => {
  it("generates organization data without exposing placeholder contact facts", () => {
    const schema = generateOrganizationData(t, {});

    expect(schema["@type"]).toBe("Organization");
    expect(schema.name).toContain("Tianze");
    expect(JSON.stringify(schema)).not.toContain(FAKE_PHONE);
  });

  it("generates website data with a stable https site URL", () => {
    const schema = generateWebSiteData(t, {});

    expect(schema["@type"]).toBe("WebSite");
    expect(schema.url).toMatch(/^https:\/\//);
  });

  it("keeps product group name and schema type", () => {
    const schema = generateProductGroupData({
      name: "PVC Conduit Fittings",
      description: "Product family for overseas distributors",
      url: "https://tianze-pipe.com/products/pvc-conduit-fittings",
      brand: "Tianze Pipe",
      products: [
        {
          name: "PVC Conduit Bend",
          description: "Bend variant",
          image: "/images/products/pvc-conduit-bend.jpg",
          url: "https://tianze-pipe.com/products/pvc-conduit-fittings/bend",
        },
      ],
    });

    expect(schema["@type"]).toBe("ProductGroup");
    expect(schema.name).toBe("PVC Conduit Fittings");
  });

  it("does not expose a fake phone when local business phone is undefined", () => {
    const schema = buildLocalBusinessSchema({
      name: "Tianze Pipe Office",
      address: "No.6 Yulong Road, Dongwangji Industrial Zone, Guanyun County",
      phone: undefined,
    });

    expect(schema).not.toHaveProperty("telephone");
    expect(JSON.stringify(schema)).not.toContain(FAKE_PHONE);
  });

  it("does not emit telephone when local business receives the placeholder phone", () => {
    const schema = buildLocalBusinessSchema({
      name: "Tianze Pipe Office",
      address: "No.6 Yulong Road, Dongwangji Industrial Zone, Guanyun County",
      phone: FAKE_PHONE,
    });

    expect(schema).not.toHaveProperty("telephone");
    expect(JSON.stringify(schema)).not.toContain(FAKE_PHONE);
  });
});
